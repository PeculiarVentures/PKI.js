import * as pkijs from "pkijs";
import { fromBase64, readCertificates } from "../helpers";
import { file } from "../io";
import { caCertificate, signedEmail } from "../samples";

// Replace the samples with your own signed email (.eml) and the root certificate you trust for it
export const inputs = {
  email: file("Signed email", { name: "signed.eml", sample: signedEmail, accept: ".eml,message/rfc822" }),
  trustedRoots: file("Trusted root certificates (PEM or DER)", { name: "sample-ca.pem", sample: caCertificate, accept: ".pem,.crt,.cer,.der" }),
};

// 1. Split the multipart/signed message into the signed part and the signature.
//    The signature covers the signed part byte for byte, with CRLF line breaks.
const email = new TextDecoder().decode(inputs.email.value).replace(/\r?\n/g, "\r\n");
const boundary = email.match(/boundary="?([^";\r\n]+)"?/i)?.[1];
if (!email.match(/Content-Type:\s*multipart\/signed/i) || !boundary) {
  throw new Error("Not a multipart/signed S/MIME message");
}
const [, signedPart, signaturePart] = email.split(`\r\n--${boundary}`);
const signedContent = signedPart.slice("\r\n".length); // Without the line break after the boundary
const signatureBase64 = signaturePart.slice(signaturePart.indexOf("\r\n\r\n")); // The body, after the part's headers

// 2. Parse the signature: a detached CMS SignedData
const signedData = new pkijs.SignedData({ schema: pkijs.ContentInfo.fromBER(fromBase64(signatureBase64)).content });

// 3. Check that the signature matches the signed part
const signer = signedData.signerInfos[0];
const result = await signedData.verify({
  signer: 0,
  data: new TextEncoder().encode(signedContent).buffer,
  extendedMode: true,
});
const signerCertificate = result.signerCertificate!;
console.log("Signature valid:", result.signatureVerified);
console.log("Signed by:", signerCertificate.subject.typesAndValues.map((attribute) => attribute.value.valueBlock.value).join(", "));
const signingTime = signer.signedAttrs?.attributes.find((attribute) => attribute.type === "1.2.840.113549.1.9.5");
if (signingTime) {
  console.log("Signing time:", signingTime.values[0].toDate().toISOString());
}

// 4. Check that the signer's certificate chains up to a trusted root
const engine = new pkijs.CertificateChainValidationEngine({
  trustedCerts: readCertificates(inputs.trustedRoots.value),
  certs: [signerCertificate, ...(signedData.certificates ?? []).filter((item) => item instanceof pkijs.Certificate)],
});
const chain = await engine.verify();
console.log("Certificate trusted:", chain.result ? "yes" : `no (${chain.resultMessage})`);

// 5. The signed part is a MIME entity: headers, a blank line, and the content
console.log("Signed content:");
console.log(signedContent.slice(signedContent.indexOf("\r\n\r\n") + 4));
if (!result.signatureVerified) {
  throw new Error("The signature does not match the message");
}
