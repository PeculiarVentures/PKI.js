import * as asn1js from "asn1js";
import * as pkijs from "pkijs";
import { createIdentity } from "../helpers";

// The certificate to check and its issuer (see the overview for createIdentity)
const ca = await createIdentity({ name: "Example CA", ca: true });
const user = await createIdentity({ name: "example.com", issuer: ca });

// 1. Create a request for the certificate's status. The certificate is identified
//    by hashes of its issuer's name and key, and its serial number.
const request = new pkijs.OCSPRequest();
await request.createForCertificate(user.certificate, {
  hashAlgorithm: "SHA-256",
  issuerCertificate: ca.certificate,
});

// A nonce binds the response to this request and prevents replay
const nonce = crypto.getRandomValues(new Uint8Array(16));
request.tbsRequest.requestExtensions = [
  new pkijs.Extension({
    extnID: "1.3.6.1.5.5.7.48.1.2", // id-pkix-ocsp-nonce
    critical: false,
    extnValue: new asn1js.OctetString({ valueHex: nonce }).toBER(),
  }),
];

// 2. Encode it. Send it to the OCSP responder in the certificate's Authority
//    Information Access extension, with Content-Type "application/ocsp-request".
const der = request.toSchema(true).toBER();

// 3. A responder parses the request and looks up each certificate it asks about
const parsed = pkijs.OCSPRequest.fromBER(der);
console.log("OCSP request (base64):", parsed.toString("base64"));
const userID = await pkijs.CertID.create(user.certificate, {
  hashAlgorithm: "SHA-256",
  issuerCertificate: ca.certificate,
});
for (const { reqCert } of parsed.tbsRequest.requestList) {
  console.log("Serial number:", reqCert.serialNumber.valueBlock.toString());
  console.log("Is for 'example.com':", reqCert.isEqual(userID));
}

const nonceExtension = parsed.tbsRequest.requestExtensions?.find((extension) => extension.extnID === "1.3.6.1.5.5.7.48.1.2");
console.log("Has nonce:", nonceExtension !== undefined);
