import * as pkijs from 'pkijs';
import * as asn1js from 'asn1js';

const nonce = pkijs.getRandomValues(new Uint8Array(10)).buffer;

const tspReq = new pkijs.TimeStampReq({
  version: 1,
  messageImprint: await pkijs.MessageImprint.create("SHA-256", message),
  reqPolicy: "1.2.3.4.5.6",
  certReq: true,
  nonce: new asn1js.Integer({ valueHex: nonce }),
});

const tspReqRaw = tspReq.toSchema().toBER();
