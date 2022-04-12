import * as asn1js from "asn1js";
import * as pkijs from "../src";

export interface EnvelopedWithCertificateParams extends Algorithm {
  length: number;
  oaepHashAlg: string;
}

export async function envelopedEncrypt(certificateBuffer: ArrayBuffer, encAlg: EnvelopedWithCertificateParams, valueBuffer: ArrayBuffer) {
  //#region Decode input certificate
  const asn1 = asn1js.fromBER(certificateBuffer);
  const certSimpl = new pkijs.Certificate({ schema: asn1.result });
  //#endregion

  const cmsEnveloped = new pkijs.EnvelopedData({
    originatorInfo: new pkijs.OriginatorInfo({
      certs: new pkijs.CertificateSet({
        certificates: [certSimpl]
      })
    })
  });

  cmsEnveloped.addRecipientByCertificate(certSimpl, { oaepHashAlgorithm: encAlg.oaepHashAlg });

  await cmsEnveloped.encrypt(encAlg, valueBuffer);

  const cmsContentSimpl = new pkijs.ContentInfo();
  cmsContentSimpl.contentType = "1.2.840.113549.1.7.3";
  cmsContentSimpl.content = cmsEnveloped.toSchema();

  return cmsContentSimpl.toSchema().toBER(false);
}

export async function envelopedDecrypt(certificateBuffer: ArrayBuffer, privateKeyBuffer: ArrayBuffer, cmsEnvelopedBuffer: ArrayBuffer) {
  //#region Decode input certificate
  let asn1 = asn1js.fromBER(certificateBuffer);
  const certSimpl = new pkijs.Certificate({ schema: asn1.result });
  //#endregion

  //#region Decode CMS Enveloped content
  asn1 = asn1js.fromBER(cmsEnvelopedBuffer);
  const cmsContentSimpl = new pkijs.ContentInfo({ schema: asn1.result });
  const cmsEnvelopedSimp = new pkijs.EnvelopedData({ schema: cmsContentSimpl.content });
  //#endregion

  return cmsEnvelopedSimp.decrypt(0,
    {
      recipientCertificate: certSimpl,
      recipientPrivateKey: privateKeyBuffer
    });
}
