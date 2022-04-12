import * as asn1js from "asn1js";
import * as pkijs from "../src";

/**
 * Create TSP request
 * @returns
 */
export async function createTSPReq(): Promise<pkijs.TimeStampReq> {
  const tspReqSimpl = new pkijs.TimeStampReq();

  //#region Put static variables
  const fictionBuffer = new ArrayBuffer(4);
  const fictionView = new Uint8Array(fictionBuffer);
  fictionView[0] = 0x7F;
  fictionView[1] = 0x01;
  fictionView[2] = 0x02;
  fictionView[3] = 0x03;

  tspReqSimpl.messageImprint = new pkijs.MessageImprint({
    hashAlgorithm: new pkijs.AlgorithmIdentifier({
      algorithmId: "1.3.14.3.2.26"
    }),
    hashedMessage: new asn1js.OctetString({ valueHex: fictionBuffer })
  });

  tspReqSimpl.reqPolicy = "1.1.1";
  tspReqSimpl.certReq = true;
  tspReqSimpl.nonce = new asn1js.Integer({ valueHex: fictionBuffer });
  //#endregion
  return tspReqSimpl;
}
