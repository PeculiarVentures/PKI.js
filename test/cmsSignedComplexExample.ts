import * as asn1js from "asn1js";
import * as utils from "./utils";
import * as pkijs from "../src";

/**
 * Create CMS_Signed
 */
export async function createCMSSigned(hashAlg: string, signAlg: string, dataBuffer: ArrayBuffer, detachedSignature = false, addExt = false) {
  // Get a "crypto" extension
  const crypto = pkijs.getCrypto(true);

  const certWithKey = await utils.createSelfSignedCertificate(hashAlg, signAlg);

  //#region Initialize CMS Signed Data structures and sign it
  const cmsSignedSimpl = new pkijs.SignedData({
    version: 1,
    encapContentInfo: new pkijs.EncapsulatedContentInfo({
      eContentType: "1.2.840.113549.1.7.1" // "data" content type
    }),
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

  //#region Check if user wants us to include signed extensions
  if (addExt) {
    // Create a message digest
    const digest = await crypto.digest({ name: hashAlg }, dataBuffer);

    //#region Combine all signed extensions
    const signedAttr = [];

    signedAttr.push(new pkijs.Attribute({
      type: "1.2.840.113549.1.9.3",
      values: [
        new asn1js.ObjectIdentifier({ value: "1.2.840.113549.1.7.1" })
      ]
    })); // contentType

    signedAttr.push(new pkijs.Attribute({
      type: "1.2.840.113549.1.9.5",
      values: [
        new asn1js.UTCTime({ valueDate: new Date() })
      ]
    })); // signingTime

    signedAttr.push(new pkijs.Attribute({
      type: "1.2.840.113549.1.9.4",
      values: [
        new asn1js.OctetString({ valueHex: digest })
      ]
    })); // messageDigest
    //#endregion

    cmsSignedSimpl.signerInfos[0].signedAttrs = new pkijs.SignedAndUnsignedAttributes({
      type: 0,
      attributes: signedAttr
    });
  }
  //#endregion

  if (detachedSignature === false) {
    const contentInfo = new pkijs.EncapsulatedContentInfo({
      eContent: new asn1js.OctetString({ valueHex: dataBuffer })
    });

    cmsSignedSimpl.encapContentInfo.eContent = contentInfo.eContent;

    await cmsSignedSimpl.sign(certWithKey.privateKey, 0, hashAlg);
  } else {
    await cmsSignedSimpl.sign(certWithKey.privateKey, 0, hashAlg, dataBuffer);
  }
  //#endregion

  //#region Create final result

  const cmsSignedSchema = cmsSignedSimpl.toSchema(true);

  const cmsContentSimp = new pkijs.ContentInfo({
    contentType: "1.2.840.113549.1.7.2",
    content: cmsSignedSchema
  });

  const _cmsSignedSchema = cmsContentSimp.toSchema();

  //#region Make length of some elements in "indefinite form"
  _cmsSignedSchema.lenBlock.isIndefiniteForm = true;

  const block1 = _cmsSignedSchema.valueBlock.value[1];
  block1.lenBlock.isIndefiniteForm = true;

  const block2 = block1.valueBlock.value[0];
  block2.lenBlock.isIndefiniteForm = true;

  if (detachedSignature === false) {
    const block3 = block2.valueBlock.value[2];
    block3.lenBlock.isIndefiniteForm = true;
    block3.valueBlock.value[1].lenBlock.isIndefiniteForm = true;
    block3.valueBlock.value[1].valueBlock.value[0].lenBlock.isIndefiniteForm = true;
  }
  //#endregion

  return {
    ...certWithKey,
    cmsSignedData: _cmsSignedSchema.toBER(false),
  };
  //#endregion
}

/**
 * Verify existing CMS_Signed
 */
export async function verifyCMSSigned(cmsSignedBuffer: ArrayBuffer, trustedCertificates: pkijs.Certificate[] = [], dataBuffer?: ArrayBuffer) {
  //#region Initial check
  if (cmsSignedBuffer.byteLength === 0)
    throw new Error("Nothing to verify!");
  //#endregion


  //#region Decode existing CMS_Signed
  const asn1 = asn1js.fromBER(cmsSignedBuffer);
  pkijs.AsnError.assert(asn1, "CMS SignedData");
  const cmsContentSimpl = new pkijs.ContentInfo({ schema: asn1.result });
  const cmsSignedSimpl = new pkijs.SignedData({ schema: cmsContentSimpl.content });
  //#endregion

  //#region Verify CMS_Signed
  const verificationParameters: any = {
    signer: 0,
    trustedCerts: trustedCertificates
  };
  if (dataBuffer) {
    verificationParameters.data = dataBuffer;
  }

  return cmsSignedSimpl.verify(verificationParameters);
  //#endregion
}
