import * as asn1js from "asn1js";
import * as pkijs from "pkijs";

// The data to timestamp: only its hash is sent to the time-stamping authority (TSA)
const data = new TextEncoder().encode("Contract text, version 3");

// A random nonce binds the response to this request. ASN.1 integers are signed: keep it positive.
const nonce = crypto.getRandomValues(new Uint8Array(8));
nonce[0] &= 0x7f;

// 1. Create the request
const request = new pkijs.TimeStampReq({
  version: 1,
  messageImprint: await pkijs.MessageImprint.create("SHA-256", data),
  nonce: new asn1js.Integer({ valueHex: nonce }),
  certReq: true, // Asks the TSA to include its certificate in the response
});

// 2. Encode it. Send it to the TSA over HTTP with Content-Type "application/timestamp-query".
const der = request.toSchema().toBER();
console.log("Timestamp request (base64):", request.toString("base64"));

// 3. The TSA parses the request
const parsed = pkijs.TimeStampReq.fromBER(der);
console.log("Hash algorithm:", parsed.messageImprint.hashAlgorithm.algorithmId); // 2.16.840.1.101.3.4.2.1 is SHA-256
console.log("Hash length:", parsed.messageImprint.hashedMessage.valueBlock.valueHexView.byteLength);
console.log("Nonce:", parsed.nonce?.toBigInt());
console.log("Certificate requested:", parsed.certReq);
