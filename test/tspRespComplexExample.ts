import * as asn1js from "asn1js";
import * as pkijs from "../src";
import * as utils from "./utils";

const testData = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09]);
export interface CreateTSPResponseResult extends utils.CertificateWithPrivateKey {
  trustedCertificates: pkijs.Certificate[];
  tspResponse: pkijs.TimeStampResp;
}
/**
 * Creates TSP response
 * @param hashAlgorithm Hash algorithm
 * @param signAlg Signing algorithm
 * @returns
 */
export async function createTSPResp(hashAlgorithm: string, signAlg: string): Promise<CreateTSPResponseResult> {
  const crypto = pkijs.getCrypto(true);

  const certWithKey = await utils.createSelfSignedCertificate(hashAlgorithm, signAlg);

  //#region Hash "testData" value
  const hashedMessage = await crypto.digest(hashAlgorithm, testData);
  //#endregion
  //#region Create specific TST info structure to sign
  const hashedBuffer = new ArrayBuffer(4);
  const hashedView = new Uint8Array(hashedBuffer);
  hashedView[0] = 0x7F;
  hashedView[1] = 0x02;
  hashedView[2] = 0x03;
  hashedView[3] = 0x04;

  const tstInfoSimpl = new pkijs.TSTInfo({
    version: 1,
    policy: "1.1.1",
    messageImprint: new pkijs.MessageImprint({
      hashAlgorithm: new pkijs.AlgorithmIdentifier({ algorithmId: pkijs.getOIDByAlgorithm({ name: hashAlgorithm }, true, "hashAlgorithm") }),
      hashedMessage: new asn1js.OctetString({ valueHex: hashedMessage })
    }),
    serialNumber: new asn1js.Integer({ valueHex: hashedBuffer }),
    genTime: new Date(),
    ordering: true,
    accuracy: new pkijs.Accuracy({
      seconds: 1,
      millis: 1,
      micros: 10
    }),
    nonce: new asn1js.Integer({ valueHex: hashedBuffer })
  });

  const tstInfoRaw = tstInfoSimpl.toSchema().toBER(false);
  //#endregion
  //#region Initialize CMS Signed Data structures and sign it
  const encapContent = new pkijs.EncapsulatedContentInfo();
  encapContent.eContentType = "1.2.840.113549.1.9.16.1.4"; // "tSTInfo" content type
  encapContent.eContent = new asn1js.OctetString({ valueHex: tstInfoRaw });

  const cmsSignedSimpl = new pkijs.SignedData({
    version: 3,
    encapContentInfo: encapContent,
    signerInfos: [
      new pkijs.SignerInfo({
        version: 1,
        sid: new pkijs.IssuerAndSerialNumber({
          issuer: certWithKey.certificate.issuer,
          serialNumber: certWithKey.certificate.serialNumber
        })
      })
    ],
    certificates: [certWithKey.certificate]
  });

  await cmsSignedSimpl.sign(certWithKey.privateKey, 0, hashAlgorithm);

  //#endregion
  //#region Create internal CMS Signed Data
  const cmsSignedSchema = cmsSignedSimpl.toSchema(true);

  const cmsContentSimp = new pkijs.ContentInfo({
    contentType: "1.2.840.113549.1.7.2",
    content: cmsSignedSchema
  });

  const cmsRaw = cmsContentSimp.toSchema();
  //#endregion
  //#region Finally create completed TSP response structure
  const tspResponse = new pkijs.TimeStampResp({
    status: new pkijs.PKIStatusInfo({ status: 0 }),
    timeStampToken: new pkijs.ContentInfo({ schema: cmsRaw })
  });
  //#endregion
  return {
    ...certWithKey,
    trustedCertificates: [certWithKey.certificate],
    tspResponse,
  };
}
/**
 * Verify existing TSP response
 * @param params TSP parameters
 * @returns
 */
export async function verifyTSPResp(params: CreateTSPResponseResult): Promise<boolean> {
  // Verify TSP response
  return params.tspResponse.verify({ signer: 0, trustedCerts: params.trustedCertificates, data: testData.buffer });
}
