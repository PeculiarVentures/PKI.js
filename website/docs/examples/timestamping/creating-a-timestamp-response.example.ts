import * as pkijs from 'pkijs';
import * as asn1js from 'asn1js';

// Generate random serial number
const serialNumber = pkijs.getRandomValues(new Uint8Array(10)).buffer;

// Create specific TST info structure to sign
const tstInfo = new pkijs.TSTInfo({
  version: 1,
  policy: tspReq.reqPolicy,
  messageImprint: tspReq.messageImprint,
  serialNumber: new asn1js.Integer({ valueHex: serialNumber }),
  genTime: new Date(),
  ordering: true,
  accuracy: new pkijs.Accuracy({
    seconds: 1,
    millis: 1,
    micros: 10
  }),
  nonce: tspReq.nonce,
});

// Create and sign CMS Signed Data with TSTInfo
const cmsSigned = new pkijs.SignedData({
  version: 3,
  encapContentInfo: new pkijs.EncapsulatedContentInfo({
    eContentType: "1.2.840.113549.1.9.16.1.4", // "tSTInfo" content type
    eContent: new asn1js.OctetString({ valueHex: tstInfo.toSchema().toBER() }),
  }),
  signerInfos: [
    new pkijs.SignerInfo({
      version: 1,
      sid: new pkijs.IssuerAndSerialNumber({
        issuer: cert.issuer,
        serialNumber: cert.serialNumber
      })
    })
  ],
  certificates: [cert]
});

await cmsSigned.sign(keys.privateKey, 0, "SHA-256");

// Create CMS Content Info
const cmsContent = new pkijs.ContentInfo({
  contentType: pkijs.ContentInfo.SIGNED_DATA,
  content: cmsSigned.toSchema(true)
});

// Finally create completed TSP response structure
const tspResp = new pkijs.TimeStampResp({
  status: new pkijs.PKIStatusInfo({ status: pkijs.PKIStatus.granted }),
  timeStampToken: new pkijs.ContentInfo({ schema: cmsContent.toSchema() })
});

const tspRespRaw = tspResp.toSchema().toBER();
