import * as asn1js from "asn1js";
import * as pkijs from "../src";

function getKeyAgreeAlgorithmParams(operation: pkijs.CryptoEngineAlgorithmOperation, curveName: string) {
  const algorithm = pkijs.getAlgorithmParameters("ECDH", operation) as any;
  algorithm.algorithm.namedCurve = curveName;
  return algorithm;
}

export interface CreateKeyPairResult {
  pkcs8: ArrayBuffer;
  spki: ArrayBuffer;
  keyPairIdBuffer: Uint8Array;
}

/**
 * Create recipient's key pair
 */
export async function createKeyPair(curveName: string): Promise<CreateKeyPairResult> {
  const crypto = pkijs.getCrypto(true);

  // Create a new key pair
  const algorithm = getKeyAgreeAlgorithmParams("generateKey", curveName);
  const { privateKey, publicKey } = await crypto.generateKey(algorithm.algorithm, true, algorithm.usages) as Required<CryptoKeyPair>;

  // Exporting private key
  const pkcs8 = await crypto.exportKey("pkcs8", privateKey);

  // Exporting public key
  const spki = await crypto.exportKey("spki", publicKey);

  // Export key id
  const value = new ArrayBuffer(4);
  const keyPairIdBuffer = crypto.getRandomValues(new Uint8Array(value));

  return {
    pkcs8,
    spki,
    keyPairIdBuffer,
  };
}

/**
 * Encrypt input data
 */
export async function envelopedEncrypt(keys: CreateKeyPairResult, alg: EcKeyAlgorithm & { kdfHash: string; }, valueBuffer: ArrayBuffer): Promise<ArrayBuffer> {
  const crypto = pkijs.getCrypto(true);

  const cmsEnveloped = new pkijs.EnvelopedData();

  //#region Import public key
  const algorithm = getKeyAgreeAlgorithmParams("importKey", alg.namedCurve);
  const publicKey = await crypto.importKey("spki", keys.spki, algorithm.algorithm, true, []);
  //#endregion

  cmsEnveloped.addRecipientByKeyIdentifier(publicKey, keys.keyPairIdBuffer, { kdfAlgorithm: alg.kdfHash });
  await cmsEnveloped.encrypt(alg, valueBuffer);

  const cmsContentSimpl = new pkijs.ContentInfo();
  cmsContentSimpl.contentType = "1.2.840.113549.1.7.3";
  cmsContentSimpl.content = cmsEnveloped.toSchema();

  return cmsContentSimpl.toSchema().toBER(false);
}

/**
 * Decrypt input data
 */
export async function envelopedDecrypt(pkcs8: ArrayBuffer, cmsEnvelopedBuffer: ArrayBuffer) {
  //#region Decode CMS Enveloped content
  const asn1 = asn1js.fromBER(cmsEnvelopedBuffer);
  const cmsContentSimpl = new pkijs.ContentInfo({ schema: asn1.result });
  const cmsEnvelopedSimp = new pkijs.EnvelopedData({ schema: cmsContentSimpl.content });
  //#endregion

  return cmsEnvelopedSimp.decrypt(0,
    {
      recipientPrivateKey: pkcs8
    });
}
