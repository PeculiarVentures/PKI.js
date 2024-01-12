import * as pkijs from 'pkijs';
import * as asn1js from 'asn1js';

// Create OCSP request
const ocspReq = new pkijs.OCSPRequest();

ocspReq.tbsRequest.requestorName = new pkijs.GeneralName({
  type: 4,
  value: cert.subject,
});

await ocspReq.createForCertificate(cert, {
  hashAlgorithm: "SHA-256",
  issuerCertificate: issuerCert,
});

const nonce = pkijs.getRandomValues(new Uint8Array(10));
ocspReq.tbsRequest.requestExtensions = [
  new pkijs.Extension({
    extnID: "1.3.6.1.5.5.7.48.1.2", // nonce
    extnValue: new asn1js.OctetString({ valueHex: nonce.buffer }).toBER(),
  })
];

// Encode OCSP request
const ocspReqRaw = ocspReq.toSchema(true).toBER();
