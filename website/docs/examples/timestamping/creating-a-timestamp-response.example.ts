import * as asn1js from "asn1js";
import * as pkijs from "pkijs";
import { createIdentity } from "../helpers";
import { download } from "../io";

// The TSA's certificate must allow only timestamping (see the overview for createIdentity)
const ca = await createIdentity({ name: "Example CA", ca: true });
const tsa = await createIdentity({ name: "Example TSA", issuer: ca, extKeyUsage: ["1.3.6.1.5.5.7.3.8"] });

// Random positive integers, for the nonce and the token's serial number
function randomPositiveInteger() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  bytes[0] &= 0x7f; // ASN.1 integers are signed
  return new asn1js.Integer({ valueHex: bytes });
}

// 1. The client asks for a timestamp on the hash of its data
const data = new TextEncoder().encode("Contract text, version 3");
const request = new pkijs.TimeStampReq({
  version: 1,
  messageImprint: await pkijs.MessageImprint.create("SHA-256", data),
  nonce: randomPositiveInteger(),
  certReq: true,
});

// 2. The TSA records the time, the hash, and the nonce in a TSTInfo...
const tstInfo = new pkijs.TSTInfo({
  version: 1,
  policy: "1.2.3.4.1", // The TSA's policy OID
  messageImprint: request.messageImprint,
  serialNumber: randomPositiveInteger(),
  genTime: new Date(),
  accuracy: new pkijs.Accuracy({ seconds: 1 }),
  nonce: request.nonce,
});

// ...and signs it as CMS SignedData: the timestamp token
const signedData = new pkijs.SignedData({
  version: 3,
  encapContentInfo: new pkijs.EncapsulatedContentInfo({
    eContentType: pkijs.id_eContentType_TSTInfo,
    eContent: new asn1js.OctetString({ valueHex: tstInfo.toSchema().toBER() }),
  }),
  signerInfos: [
    new pkijs.SignerInfo({
      version: 1,
      sid: new pkijs.IssuerAndSerialNumber({
        issuer: tsa.certificate.issuer,
        serialNumber: tsa.certificate.serialNumber,
      }),
    }),
  ],
  certificates: request.certReq ? [tsa.certificate] : undefined,
});
await signedData.sign(tsa.keys.privateKey, 0, "SHA-256");

const response = new pkijs.TimeStampResp({
  status: new pkijs.PKIStatusInfo({ status: pkijs.PKIStatus.granted }),
  timeStampToken: new pkijs.ContentInfo({
    contentType: pkijs.ContentInfo.SIGNED_DATA,
    content: signedData.toSchema(true),
  }),
});
const der = response.toSchema().toBER();
console.log("Timestamp response (base64):", response.toString("base64"));
download("response.tsr", der);

// 3. The client parses the response and checks the token against its data and the trusted CA
const parsed = pkijs.TimeStampResp.fromBER(der);
console.log("Status:", parsed.status.status === pkijs.PKIStatus.granted ? "granted" : parsed.status.status);

const verified = await parsed.verify({ signer: 0, data: data.buffer, trustedCerts: [ca.certificate] });
console.log("Token valid for the data:", verified);

// 4. Read the time, and check that the TSA answered this request
const token = new pkijs.SignedData({ schema: parsed.timeStampToken!.content });
const parsedInfo = pkijs.TSTInfo.fromBER(token.encapContentInfo.eContent!.getValue());
console.log("Time:", parsedInfo.genTime.toISOString());
console.log("Nonce matches:", parsedInfo.nonce?.isEqual(request.nonce!));
if (!verified) {
  throw new Error("The timestamp token is invalid");
}
