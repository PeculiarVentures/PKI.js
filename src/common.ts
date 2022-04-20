import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { AlgorithmIdentifier } from "./AlgorithmIdentifier";
import type { CryptoEngineAlgorithmOperation, CryptoEngineAlgorithmParams, ICryptoEngine } from "./CryptoEngine/CryptoEngineInterface";
import { ArgumentError } from "./errors";

//#region Crypto engine related function
export interface GlobalCryptoEngine {
  name: string;
  crypto: Crypto | null;
  subtle: ICryptoEngine | null;
}
export let engine: GlobalCryptoEngine = {
  name: "none",
  crypto: null,
  subtle: null
};

export function setEngine(name: string, crypto: Crypto | null = null, subtle: null | ICryptoEngine = null): void {
  //#region We are in Node
  if ((typeof process !== "undefined") && ("pid" in process) && (typeof global !== "undefined") && (typeof window === "undefined")) {
    if (typeof (global as any)[process.pid] === "undefined") {
      (global as any)[process.pid] = {};
    }
    else {
      if (typeof (global as any)[process.pid] !== "object") {
        throw new Error(`Name global.${process.pid} already exists and it is not an object`);
      }
    }

    if (typeof (global as any)[process.pid].pkijs === "undefined") {
      (global as any)[process.pid].pkijs = {};
    }
    else {
      if (typeof (global as any)[process.pid].pkijs !== "object") {
        throw new Error(`Name global.${process.pid}.pkijs already exists and it is not an object`);
      }
    }

    (global as any)[process.pid].pkijs.engine = {
      name: name,
      crypto: crypto,
      subtle: subtle
    };
  }
  //#endregion
  //#region We are in browser
  else {
    if (engine.name !== name) {
      engine = {
        name: name,
        crypto: crypto,
        subtle: subtle
      };
    }
  }
  //#endregion
}

export function getEngine(): GlobalCryptoEngine {
  //#region We are in Node
  if ((typeof process !== "undefined") && ("pid" in process) && (typeof global !== "undefined") && (typeof window === "undefined")) {
    let _engine;

    try {
      _engine = (global as any)[process.pid].pkijs.engine;
    }
    catch (ex) {
      throw new Error("Please call 'setEngine' before call to 'getEngine'");
    }

    return _engine;
  }
  //#endregion

  return engine;
}
//#endregion

//#region Declaration of common functions

/**
 * Gets crypto subtle from the current "crypto engine"
 * @param safety
 * @returns Reruns {@link ICryptoEngine} or `null`
 */
export function getCrypto(safety?: boolean): ICryptoEngine | null;
/**
 * Gets crypto subtle from the current "crypto engine"
 * @param safety
 * @returns Reruns {@link ICryptoEngine} or throws en exception
 * @throws Throws {@link Error} if `subtle` is empty
 */
export function getCrypto(safety: true): ICryptoEngine;
export function getCrypto(safety = false): ICryptoEngine | null {
  const _engine = getEngine();

  if (!_engine.subtle && safety) {
    throw new Error("Unable to create WebCrypto object");
  }

  return _engine.subtle;
}

/**
 * Initialize input Uint8Array by random values (with help from current "crypto engine")
 * @param view
 */
export function getRandomValues(view: Uint8Array) {
  return getCrypto(true).getRandomValues(view);
}

/**
 * Get OID for each specific algorithm
 * @param algorithm WebCrypto Algorithm
 * @param safety if `true` throws exception on unknown algorithm
 * @param target name of the target
 * @throws Throws {@link Error} exception if unknown WebCrypto algorithm
 */
export function getOIDByAlgorithm(algorithm: Algorithm, safety?: boolean, target?: string) {
  return getCrypto(true).getOIDByAlgorithm(algorithm, safety, target);
}

/**
 * Get default algorithm parameters for each kind of operation
 * @param algorithmName Algorithm name to get common parameters for
 * @param operation Kind of operation: "sign", "encrypt", "generateKey", "importKey", "exportKey", "verify"
 */
// TODO Add safety
export function getAlgorithmParameters(algorithmName: string, operation: CryptoEngineAlgorithmOperation): CryptoEngineAlgorithmParams {
  return getCrypto(true).getAlgorithmParameters(algorithmName, operation);
}

/**
 * Create CMS ECDSA signature from WebCrypto ECDSA signature
 * @param signatureBuffer WebCrypto result of "sign" function
 */
export function createCMSECDSASignature(signatureBuffer: ArrayBuffer): ArrayBuffer {
  //#region Initial check for correct length
  if ((signatureBuffer.byteLength % 2) !== 0)
    return new ArrayBuffer(0);
  //#endregion

  //#region Initial variables
  const length = signatureBuffer.byteLength / 2; // There are two equal parts inside incoming ArrayBuffer

  const rBuffer = new ArrayBuffer(length);
  const rView = new Uint8Array(rBuffer);
  rView.set(new Uint8Array(signatureBuffer, 0, length));

  const rInteger = new asn1js.Integer({ valueHex: rBuffer });

  const sBuffer = new ArrayBuffer(length);
  const sView = new Uint8Array(sBuffer);
  sView.set(new Uint8Array(signatureBuffer, length, length));

  const sInteger = new asn1js.Integer({ valueHex: sBuffer });
  //#endregion

  return (new asn1js.Sequence({
    value: [
      rInteger.convertToDER(),
      sInteger.convertToDER()
    ]
  })).toBER(false);
}

/**
 * Create a single ArrayBuffer from CMS ECDSA signature
 * @param cmsSignature ASN.1 SEQUENCE contains CMS ECDSA signature
 * @returns {ArrayBuffer}
 */
export function createECDSASignatureFromCMS(cmsSignature: asn1js.Sequence) {
  //#region Check input variables
  if ((cmsSignature instanceof asn1js.Sequence) === false)
    return new ArrayBuffer(0);

  if (cmsSignature.valueBlock.value.length !== 2)
    return new ArrayBuffer(0);

  if ((cmsSignature.valueBlock.value[0] instanceof asn1js.Integer) === false)
    return new ArrayBuffer(0);

  if ((cmsSignature.valueBlock.value[1] instanceof asn1js.Integer) === false)
    return new ArrayBuffer(0);
  //#endregion

  const rValue = cmsSignature.valueBlock.value[0].convertFromDER();
  const sValue = cmsSignature.valueBlock.value[1].convertFromDER();

  //#region Check the lengths of two parts are equal
  switch (true) {
    case (rValue.valueBlock.valueHex.byteLength < sValue.valueBlock.valueHex.byteLength):
      {
        if ((sValue.valueBlock.valueHex.byteLength - rValue.valueBlock.valueHex.byteLength) !== 1)
          throw new Error("Incorrect DER integer decoding");

        const correctedLength = sValue.valueBlock.valueHex.byteLength;

        const rValueView = new Uint8Array(rValue.valueBlock.valueHex);

        const rValueBufferCorrected = new ArrayBuffer(correctedLength);
        const rValueViewCorrected = new Uint8Array(rValueBufferCorrected);

        rValueViewCorrected.set(rValueView, 1);
        rValueViewCorrected[0] = 0x00; // In order to be sure we do not have any garbage here

        return pvutils.utilConcatBuf(rValueBufferCorrected, sValue.valueBlock.valueHex);
      }
    case (rValue.valueBlock.valueHex.byteLength > sValue.valueBlock.valueHex.byteLength):
      {
        if ((rValue.valueBlock.valueHex.byteLength - sValue.valueBlock.valueHex.byteLength) !== 1)
          throw new Error("Incorrect DER integer decoding");

        const correctedLength = rValue.valueBlock.valueHex.byteLength;

        const sValueView = new Uint8Array(sValue.valueBlock.valueHex);

        const sValueBufferCorrected = new ArrayBuffer(correctedLength);
        const sValueViewCorrected = new Uint8Array(sValueBufferCorrected);

        sValueViewCorrected.set(sValueView, 1);
        sValueViewCorrected[0] = 0x00; // In order to be sure we do not have any garbage here

        return pvutils.utilConcatBuf(rValue.valueBlock.valueHex, sValueBufferCorrected);
      }
    default:
      {
        //#region In case we have equal length and the length is not even with 2
        if (rValue.valueBlock.valueHex.byteLength % 2) {
          const correctedLength = (rValue.valueBlock.valueHex.byteLength + 1);

          const rValueView = new Uint8Array(rValue.valueBlock.valueHex);

          const rValueBufferCorrected = new ArrayBuffer(correctedLength);
          const rValueViewCorrected = new Uint8Array(rValueBufferCorrected);

          rValueViewCorrected.set(rValueView, 1);
          rValueViewCorrected[0] = 0x00; // In order to be sure we do not have any garbage here

          const sValueView = new Uint8Array(sValue.valueBlock.valueHex);

          const sValueBufferCorrected = new ArrayBuffer(correctedLength);
          const sValueViewCorrected = new Uint8Array(sValueBufferCorrected);

          sValueViewCorrected.set(sValueView, 1);
          sValueViewCorrected[0] = 0x00; // In order to be sure we do not have any garbage here

          return pvutils.utilConcatBuf(rValueBufferCorrected, sValueBufferCorrected);
        }
        //#endregion
      }
  }
  //#endregion

  return pvutils.utilConcatBuf(rValue.valueBlock.valueHex, sValue.valueBlock.valueHex);
}

/**
 * Gets WebCrypto algorithm by well-known OID
 * @param oid algorithm identifier
 * @param safety if true throws exception on unknown algorithm identifier
 * @param target name of the target
 * @returns WebCrypto algorithm or an empty object
 */
export function getAlgorithmByOID<T extends Algorithm = Algorithm>(oid: string, safety?: boolean, target?: string): T | object;
export function getAlgorithmByOID<T extends Algorithm = Algorithm>(oid: string, safety: true, target?: string): T;
export function getAlgorithmByOID(oid: string, safety = false, target?: string): any {
  return getCrypto(true).getAlgorithmByOID(oid, safety, target);
}

/**
 * Getting hash algorithm by signature algorithm
 * @param signatureAlgorithm Signature algorithm
 */
export function getHashAlgorithm(signatureAlgorithm: AlgorithmIdentifier): string {
  return getCrypto(true).getHashAlgorithm(signatureAlgorithm);
}

/**
 * ANS X9.63 Key Derivation Function having a "Counter" as a parameter
 * @param hashFunction Used hash function
 * @param zBuffer ArrayBuffer containing ECDH shared secret to derive from
 * @param Counter
 * @param SharedInfo Usually DER encoded "ECC_CMS_SharedInfo" structure
 */
export async function kdfWithCounter(hashFunction: string, zBuffer: ArrayBuffer, Counter: number, SharedInfo: ArrayBuffer): Promise<{ counter: number; result: ArrayBuffer; }> {
  //#region Check of input parameters
  switch (hashFunction.toUpperCase()) {
    case "SHA-1":
    case "SHA-256":
    case "SHA-384":
    case "SHA-512":
      break;
    default:
      throw new ArgumentError(`Unknown hash function: ${hashFunction}`);
  }

  ArgumentError.assert(zBuffer, "zBuffer", "ArrayBuffer");
  if (zBuffer.byteLength === 0)
    throw new ArgumentError("'zBuffer' has zero length, error");

  ArgumentError.assert(SharedInfo, "SharedInfo", "ArrayBuffer");
  if (Counter > 255)
    throw new ArgumentError("Please set 'Counter' argument to value less or equal to 255");
  //#endregion

  //#region Initial variables
  const counterBuffer = new ArrayBuffer(4);
  const counterView = new Uint8Array(counterBuffer);
  counterView[0] = 0x00;
  counterView[1] = 0x00;
  counterView[2] = 0x00;
  counterView[3] = Counter;

  let combinedBuffer = new ArrayBuffer(0);
  //#endregion

  //#region Get a "crypto" extension
  const crypto = getCrypto(true);
  //#endregion

  //#region Create a combined ArrayBuffer for digesting
  combinedBuffer = pvutils.utilConcatBuf(combinedBuffer, zBuffer);
  combinedBuffer = pvutils.utilConcatBuf(combinedBuffer, counterBuffer);
  combinedBuffer = pvutils.utilConcatBuf(combinedBuffer, SharedInfo);
  //#endregion

  //#region Return digest of combined ArrayBuffer and information about current counter
  const result = await crypto.digest(
    { name: hashFunction },
    combinedBuffer);

  return {
    counter: Counter,
    result
  };
  //#endregion
}

/**
 * ANS X9.63 Key Derivation Function
 * @param hashFunction Used hash function
 * @param Zbuffer ArrayBuffer containing ECDH shared secret to derive from
 * @param keydatalen Length (!!! in BITS !!!) of used kew derivation function
 * @param SharedInfo Usually DER encoded "ECC_CMS_SharedInfo" structure
 */
export async function kdf(hashFunction: string, Zbuffer: ArrayBuffer, keydatalen: number, SharedInfo: ArrayBuffer) {
  //#region Initial variables
  let hashLength = 0;
  let maxCounter = 1;
  //#endregion

  //#region Check of input parameters
  switch (hashFunction.toUpperCase()) {
    case "SHA-1":
      hashLength = 160; // In bits
      break;
    case "SHA-256":
      hashLength = 256; // In bits
      break;
    case "SHA-384":
      hashLength = 384; // In bits
      break;
    case "SHA-512":
      hashLength = 512; // In bits
      break;
    default:
      throw new ArgumentError(`Unknown hash function: ${hashFunction}`);
  }

  ArgumentError.assert(Zbuffer, "Zbuffer", "ArrayBuffer");
  if (Zbuffer.byteLength === 0)
    throw new ArgumentError("'Zbuffer' has zero length, error");
  ArgumentError.assert(SharedInfo, "SharedInfo", "ArrayBuffer");
  //#endregion

  //#region Calculated maximum value of "Counter" variable
  const quotient = keydatalen / hashLength;

  if (Math.floor(quotient) > 0) {
    maxCounter = Math.floor(quotient);

    if ((quotient - maxCounter) > 0)
      maxCounter++;
  }
  //#endregion

  //#region Create an array of "kdfWithCounter"
  const incomingResult = [];
  for (let i = 1; i <= maxCounter; i++)
    incomingResult.push(await kdfWithCounter(hashFunction, Zbuffer, i, SharedInfo));
  //#endregion

  //#region Return combined digest with specified length
  //#region Initial variables
  let combinedBuffer = new ArrayBuffer(0);
  let currentCounter = 1;
  let found = true;
  //#endregion

  //#region Combine all buffer together
  while (found) {
    found = false;

    for (const result of incomingResult) {
      if (result.counter === currentCounter) {
        combinedBuffer = pvutils.utilConcatBuf(combinedBuffer, result.result);
        found = true;
        break;
      }
    }

    currentCounter++;
  }
  //#endregion

  //#region Create output buffer with specified length
  keydatalen >>= 3; // Divide by 8 since "keydatalen" is in bits

  if (combinedBuffer.byteLength > keydatalen) {
    const newBuffer = new ArrayBuffer(keydatalen);
    const newView = new Uint8Array(newBuffer);
    const combinedView = new Uint8Array(combinedBuffer);

    for (let i = 0; i < keydatalen; i++)
      newView[i] = combinedView[i];

    return newBuffer;
  }

  return combinedBuffer; // Since the situation when "combinedBuffer.byteLength < keydatalen" here we have only "combinedBuffer.byteLength === keydatalen"
  //#endregion
  //#endregion
}
//#endregion
