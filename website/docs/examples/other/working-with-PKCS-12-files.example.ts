import * as asn1js from "asn1js";
import * as pkijs from "pkijs";
import { createIdentity } from "../helpers";
import { download } from "../io";

// The certificate and private key to store (see the overview for createIdentity)
const identity = await createIdentity({ name: "Alice" });
const privateKeyInfo = pkijs.PrivateKeyInfo.fromBER(await crypto.subtle.exportKey("pkcs8", identity.keys.privateKey));

const password = new TextEncoder().encode("12345").buffer;
// The algorithms OpenSSL 3 uses by default for `openssl pkcs12 -export`
const protection: Omit<pkijs.EncryptedDataEncryptParams, "contentToEncrypt"> = {
  password,
  // pkijs generates the IV
  contentEncryptionAlgorithm: { name: "AES-CBC", length: 256 } as pkijs.ContentEncryptionAlgorithm,
  hmacHashAlgorithm: "SHA-256",
  iterationCount: 100_000,
};

// Attributes that tie the key to its certificate and name them
const bagAttributes = [
  new pkijs.Attribute({
    type: "1.2.840.113549.1.9.20", // friendlyName
    values: [new asn1js.BmpString({ value: "Alice" })],
  }),
  new pkijs.Attribute({
    type: "1.2.840.113549.1.9.21", // localKeyID
    values: [new asn1js.OctetString({ valueHex: new Uint8Array([1]) })],
  }),
];

// 1. Build the PKCS#12 structure, as OpenSSL does: the key in a password-encrypted
//    PKCS#8 bag, the certificate in a password-encrypted SafeContents
const pfx = new pkijs.PFX({
  parsedValue: {
    integrityMode: 0, // Password-based integrity (HMAC)
    authenticatedSafe: new pkijs.AuthenticatedSafe({
      parsedValue: {
        safeContents: [
          {
            privacyMode: 0, // Not encrypted: the key bag is encrypted itself
            value: new pkijs.SafeContents({
              safeBags: [
                new pkijs.SafeBag({
                  bagId: "1.2.840.113549.1.12.10.1.2", // pkcs8ShroudedKeyBag
                  bagValue: new pkijs.PKCS8ShroudedKeyBag({ parsedValue: privateKeyInfo }),
                  bagAttributes,
                }),
              ],
            }),
          },
          {
            privacyMode: 1, // Password-based encryption
            value: new pkijs.SafeContents({
              safeBags: [
                new pkijs.SafeBag({
                  bagId: "1.2.840.113549.1.12.10.1.3", // certBag
                  bagValue: new pkijs.CertBag({ parsedValue: identity.certificate }),
                  bagAttributes,
                }),
              ],
            }),
          },
        ],
      },
    }),
  },
});

// 2. Encrypt and protect it, from the inside out
const authenticatedSafe = pfx.parsedValue!.authenticatedSafe!;
const keyBag = authenticatedSafe.parsedValue.safeContents[0].value.safeBags[0].bagValue as pkijs.PKCS8ShroudedKeyBag;
await keyBag.makeInternalValues(protection);
await authenticatedSafe.makeInternalValues({ safeContents: [{}, protection] });
await pfx.makeInternalValues({
  password,
  iterations: 100_000,
  pbkdf2HashAlgorithm: "SHA-256",
  hmacHashAlgorithm: "SHA-256",
});

const der = pfx.toSchema().toBER();
console.log("PKCS#12 (base64):", pfx.toString("base64"));
download("alice.p12", der); // Password: 12345

// 3. Parse the file: check its integrity, then decrypt its contents
const parsed = pkijs.PFX.fromBER(der);
await parsed.parseInternalValues({ password, checkIntegrity: true });

const parsedSafe = parsed.parsedValue!.authenticatedSafe!;
await parsedSafe.parseInternalValues({ safeContents: [{}, { password }] });

// parsedValue is untyped: each item holds a parsed SafeContents
for (const safeContents of parsedSafe.parsedValue.safeContents as { value: pkijs.SafeContents }[]) {
  for (const bag of safeContents.value.safeBags) {
    const friendlyName = bag.bagAttributes?.find((attribute) => attribute.type === "1.2.840.113549.1.9.20");
    console.log("Bag:", bag.bagId, "named", friendlyName?.values[0].valueBlock.value);

    if (bag.bagValue instanceof pkijs.PKCS8ShroudedKeyBag) {
      // The key bag holds an encrypted PKCS#8 key: decrypt it with the password
      const encrypted = new pkijs.EncryptedData({
        encryptedContentInfo: new pkijs.EncryptedContentInfo({
          contentEncryptionAlgorithm: bag.bagValue.encryptionAlgorithm,
          encryptedContent: bag.bagValue.encryptedData,
        }),
      });
      const pkcs8 = await encrypted.decrypt({ password });
      const key = await crypto.subtle.importKey("pkcs8", pkcs8, { name: "ECDSA", namedCurve: "P-256" }, true, ["sign"]);
      console.log("  Private key:", key.algorithm);
    } else if (bag.bagValue instanceof pkijs.CertBag && bag.bagValue.parsedValue instanceof pkijs.Certificate) {
      console.log("  Certificate for:", bag.bagValue.parsedValue.subject.typesAndValues[0].value.valueBlock.value);
    }
  }
}
