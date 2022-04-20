import * as pkijs from "../src";

/**
 * Encrypt input data
 * @param encryptionVariant
 * @param preDefinedDataBuffer
 */
export async function envelopedEncrypt(encryptionVariant: number, preDefinedDataBuffer: ArrayBuffer, encryptionAlgorithm: Algorithm, valueBuffer: ArrayBuffer): Promise<ArrayBuffer> {
  //#region Get input pre-defined data
  /*
   This is an example only and we consider that key encryption algorithm
   has key length in 256 bits (default value).
   */
  if (encryptionVariant === 1) {
    if (preDefinedDataBuffer.byteLength > 32) {
      const newPreDefinedDataBuffer = new ArrayBuffer(32);
      const newPreDefinedDataView = new Uint8Array(newPreDefinedDataBuffer);

      const preDefinedDataView = new Uint8Array(preDefinedDataBuffer);

      for (let i = 0; i < 32; i++)
        newPreDefinedDataView[i] = preDefinedDataView[i];

      preDefinedDataBuffer = newPreDefinedDataBuffer;
    }

    if (preDefinedDataBuffer.byteLength < 32) {
      const newPreDefinedDataBuffer = new ArrayBuffer(32);
      const newPreDefinedDataView = new Uint8Array(newPreDefinedDataBuffer);

      const preDefinedDataView = new Uint8Array(preDefinedDataBuffer);

      for (let i = 0; i < preDefinedDataBuffer.byteLength; i++)
        newPreDefinedDataView[i] = preDefinedDataView[i];

      preDefinedDataBuffer = newPreDefinedDataBuffer;
    }
  }
  //#endregion

  const cmsEnveloped = new pkijs.EnvelopedData();

  cmsEnveloped.addRecipientByPreDefinedData(preDefinedDataBuffer, {}, encryptionVariant);

  await cmsEnveloped.encrypt(encryptionAlgorithm, valueBuffer);

  const cmsContentSimpl = new pkijs.ContentInfo();
  cmsContentSimpl.contentType = "1.2.840.113549.1.7.3";
  cmsContentSimpl.content = cmsEnveloped.toSchema();

  return cmsContentSimpl.toSchema().toBER(false);
}

/**
 * Decrypt input data
 * @param encryptionVariant
 * @param preDefinedDataBuffer
 * @param cmsEnvelopedBuffer
 * @returns
 */
export async function envelopedDecrypt(encryptionVariant: number, preDefinedDataBuffer: ArrayBuffer, cmsEnvelopedBuffer: ArrayBuffer): Promise<ArrayBuffer> {
  //#region Get input pre-defined data
  /*
   This is an example only and we consider that key encryption algorithm
   has key length in 256 bits (default value).
   */
  if (encryptionVariant === 1) {
    if (preDefinedDataBuffer.byteLength > 32) {
      const newPreDefinedDataBuffer = new ArrayBuffer(32);
      const newPreDefinedDataView = new Uint8Array(newPreDefinedDataBuffer);

      const preDefinedDataView = new Uint8Array(preDefinedDataBuffer);

      for (let i = 0; i < 32; i++)
        newPreDefinedDataView[i] = preDefinedDataView[i];

      preDefinedDataBuffer = newPreDefinedDataBuffer;
    }

    if (preDefinedDataBuffer.byteLength < 32) {
      const newPreDefinedDataBuffer = new ArrayBuffer(32);
      const newPreDefinedDataView = new Uint8Array(newPreDefinedDataBuffer);

      const preDefinedDataView = new Uint8Array(preDefinedDataBuffer);

      for (let i = 0; i < preDefinedDataBuffer.byteLength; i++)
        newPreDefinedDataView[i] = preDefinedDataView[i];

      preDefinedDataBuffer = newPreDefinedDataBuffer;
    }
  }
  //#endregion

  //#region Decode CMS Enveloped content
  const cmsContentSimpl = pkijs.ContentInfo.fromBER(cmsEnvelopedBuffer);
  const cmsEnvelopedSimp = new pkijs.EnvelopedData({ schema: cmsContentSimpl.content });
  //#endregion

  return cmsEnvelopedSimp.decrypt(0,
    {
      preDefinedData: preDefinedDataBuffer
    });
}
