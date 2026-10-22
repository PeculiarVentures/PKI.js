import * as asn1js from "asn1js";
import * as pkijs from "pkijs";

// 1. The requester generates a key pair; the private key never leaves them
const keys = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);

// 2. Build the request: a subject, the public key, and the extensions to put in the certificate
const csr = new pkijs.CertificationRequest();
csr.subject.typesAndValues.push(
  new pkijs.AttributeTypeAndValue({
    type: "2.5.4.3", // Common name
    value: new asn1js.Utf8String({ value: "example.com" }),
  }),
);
await csr.subjectPublicKeyInfo.importKey(keys.publicKey);

const altNames = new pkijs.GeneralNames({
  names: [
    new pkijs.GeneralName({ type: 2, value: "example.com" }), // dNSName
    new pkijs.GeneralName({ type: 2, value: "www.example.com" }),
  ],
});
csr.attributes = [
  new pkijs.Attribute({
    type: "1.2.840.113549.1.9.14", // extensionRequest
    values: [
      new pkijs.Extensions({
        extensions: [
          new pkijs.Extension({
            extnID: pkijs.id_SubjectAltName,
            critical: false,
            extnValue: altNames.toSchema().toBER(),
          }),
        ],
      }).toSchema(),
    ],
  }),
];

// 3. Sign the request with the private key, which proves the requester holds it
await csr.sign(keys.privateKey, "SHA-256");
const der = csr.toSchema().toBER();
console.log("CSR (base64):", csr.toString("base64"));

// 4. The certificate authority parses the request and checks its signature
const received = pkijs.CertificationRequest.fromBER(der);
const signatureValid = await received.verify();
console.log("Signature valid:", signatureValid);
if (!signatureValid) {
  throw new Error("The request signature is invalid");
}

console.log("Subject:", received.subject.typesAndValues[0].value.valueBlock.value);
const publicKey = await received.getPublicKey();
console.log("Public key:", publicKey.algorithm);

// Read the requested extensions
const extensionRequest = received.attributes?.find((attribute) => attribute.type === "1.2.840.113549.1.9.14");
if (extensionRequest) {
  const extensions = new pkijs.Extensions({ schema: extensionRequest.values[0] });
  for (const extension of extensions.extensions) {
    if (extension.parsedValue instanceof pkijs.AltName) {
      console.log("Requested names:", extension.parsedValue.altNames.map((name) => name.value));
    }
  }
}
