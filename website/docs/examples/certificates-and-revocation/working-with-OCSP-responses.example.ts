import * as pkijs from 'pkijs';
import * as asn1js from 'asn1js';

const ocspBasicResp = new pkijs.BasicOCSPResponse();

// Create specific TST info structure to sign
ocspBasicResp.tbsResponseData.responderID = issuerCert.subject;
ocspBasicResp.tbsResponseData.producedAt = new Date();

const certID = new pkijs.CertID();
await certID.createForCertificate(cert, {
  hashAlgorithm: "SHA-256",
  issuerCertificate: issuerCert,
});
const response = new pkijs.SingleResponse({
  certID,
});
response.certStatus = new asn1js.Primitive({
  idBlock: {
    tagClass: 3, // CONTEXT-SPECIFIC
    tagNumber: 0 // [0]
  },
  lenBlockLength: 1 // The length contains one byte 0x00
}); // status - success
response.thisUpdate = new Date();

ocspBasicResp.tbsResponseData.responses.push(response);

// Add certificates for chain OCSP response validation
ocspBasicResp.certs = [issuerCert];

await ocspBasicResp.sign(keys.privateKey, "SHA-256");

// Finally create completed OCSP response structure
const ocspBasicRespRaw = ocspBasicResp.toSchema().toBER(false);

const ocspResp = new pkijs.OCSPResponse({
  responseStatus: new asn1js.Enumerated({ value: 0 }), // success
  responseBytes: new pkijs.ResponseBytes({
    responseType: pkijs.id_PKIX_OCSP_Basic,
    response: new asn1js.OctetString({ valueHex: ocspBasicRespRaw }),
  }),
});

const ocspRespRaw = ocspResp.toSchema().toBER();
