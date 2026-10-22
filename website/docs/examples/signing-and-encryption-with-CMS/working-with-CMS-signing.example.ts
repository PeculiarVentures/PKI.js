import * as asn1js from "asn1js";
import * as pkijs from "pkijs";
import { createIdentity } from "../helpers";

// The signer's certificate, issued by a CA the verifier trusts (see the overview for createIdentity)
const ca = await createIdentity({ name: "Example CA", ca: true });
const signer = await createIdentity({ name: "Alice", issuer: ca });

const data = new TextEncoder().encode("Hello, PKIjs!");

// 1. Signed attributes: the signature covers them, and they cover the content through its digest
const digest = await crypto.subtle.digest("SHA-256", data);
const signedAttrs = new pkijs.SignedAndUnsignedAttributes({
  type: 0, // Signed
  attributes: [
    new pkijs.Attribute({
      type: "1.2.840.113549.1.9.3", // contentType
      values: [new asn1js.ObjectIdentifier({ value: pkijs.id_ContentType_Data })],
    }),
    new pkijs.Attribute({
      type: "1.2.840.113549.1.9.5", // signingTime
      values: [new asn1js.UTCTime({ valueDate: new Date() })],
    }),
    new pkijs.Attribute({
      type: "1.2.840.113549.1.9.4", // messageDigest
      values: [new asn1js.OctetString({ valueHex: digest })],
    }),
  ],
});

// 2. Describe the signer: which certificate signs, and its signed attributes
const signedData = new pkijs.SignedData({
  version: 1,
  encapContentInfo: new pkijs.EncapsulatedContentInfo({
    eContentType: pkijs.id_ContentType_Data,
    eContent: new asn1js.OctetString({ valueHex: data }), // Omit eContent for a detached signature
  }),
  signerInfos: [
    new pkijs.SignerInfo({
      version: 1,
      sid: new pkijs.IssuerAndSerialNumber({
        issuer: signer.certificate.issuer,
        serialNumber: signer.certificate.serialNumber,
      }),
      signedAttrs,
    }),
  ],
  certificates: [signer.certificate], // Lets the verifier find the signer's certificate
});

// 3. Sign with SHA-256 (the same hash as the messageDigest attribute)
await signedData.sign(signer.keys.privateKey, 0, "SHA-256");

// 4. Wrap it in a ContentInfo and encode it: this is a .p7s / .p7m file
const contentInfo = new pkijs.ContentInfo({
  contentType: pkijs.ContentInfo.SIGNED_DATA,
  content: signedData.toSchema(true),
});
const der = contentInfo.toSchema().toBER();
console.log("CMS SignedData (base64):", contentInfo.toString("base64"));

// 5. The verifier parses the message, checks the signature and the signer's certificate chain
const parsed = new pkijs.SignedData({ schema: pkijs.ContentInfo.fromBER(der).content });
const result = await parsed.verify({
  signer: 0,
  trustedCerts: [ca.certificate],
  checkChain: true,
  extendedMode: true, // Returns details instead of only true or false
});
console.log("Signature valid:", result.signatureVerified);
console.log("Signed by:", result.signerCertificate?.subject.typesAndValues[0].value.valueBlock.value);

// 6. Read the signed content
const content = parsed.encapContentInfo.eContent!.getValue();
console.log("Content:", new TextDecoder().decode(content));
if (!result.signatureVerified) {
  throw new Error("The signature is invalid");
}
