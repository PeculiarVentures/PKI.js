import * as asn1js from "asn1js";
import * as pkijs from "pkijs";
import { createIdentity } from "../helpers";

// The CA signs the responses itself here (see the overview for createIdentity)
const ca = await createIdentity({ name: "Example CA", ca: true });
const user = await createIdentity({ name: "example.com", issuer: ca });

// 1. The responder builds a status entry for the certificate: "good"
const certID = await pkijs.CertID.create(user.certificate, {
  hashAlgorithm: "SHA-256",
  issuerCertificate: ca.certificate,
});
const status = new pkijs.SingleResponse({
  certID,
  // certStatus is a CHOICE: [0] good (NULL), [1] revoked, [2] unknown
  certStatus: new asn1js.Primitive({ idBlock: { tagClass: 3, tagNumber: 0 } }), // [0] good
  thisUpdate: new Date(),
  nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000),
});

// 2. Sign the response data and wrap it in an OCSPResponse
const basicResponse = new pkijs.BasicOCSPResponse();
basicResponse.tbsResponseData.responderID = ca.certificate.subject;
basicResponse.tbsResponseData.producedAt = new Date();
basicResponse.tbsResponseData.responses.push(status);
basicResponse.certs = [ca.certificate]; // Lets clients find the signer
await basicResponse.sign(ca.keys.privateKey, "SHA-256");

const response = new pkijs.OCSPResponse({
  responseStatus: new asn1js.Enumerated({ value: 0 }), // successful
  responseBytes: new pkijs.ResponseBytes({
    responseType: pkijs.id_PKIX_OCSP_Basic,
    response: new asn1js.OctetString({ valueHex: basicResponse.toSchema().toBER() }),
  }),
});
const der = response.toSchema().toBER();
console.log("OCSP response (base64):", response.toString("base64"));

// 3. The client parses the response, checks its signature, and reads the status
const parsed = pkijs.OCSPResponse.fromBER(der);
console.log("Response status:", parsed.responseStatus.valueBlock.valueDec); // 0 = successful

const parsedBasic = pkijs.BasicOCSPResponse.fromBER(parsed.responseBytes!.response.getValue());
const signatureValid = await parsedBasic.verify({ trustedCerts: [ca.certificate] });
console.log("Signature valid:", signatureValid);

const { isForCertificate, status: certStatus } = await parsed.getCertificateStatus(user.certificate, ca.certificate);
console.log("Is for 'example.com':", isForCertificate);
console.log("Certificate status:", ["good", "revoked", "unknown"][certStatus]);
if (!signatureValid || !isForCertificate || certStatus !== 0) {
  throw new Error("Unexpected OCSP response");
}
