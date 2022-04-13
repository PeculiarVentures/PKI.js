import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as pkijs from "../../src";
import * as nodeSpecificCrypto from "./NodeEngineNodeSpecific";

export interface NodeEngineEncryptParams extends pkijs.CryptoEngineEncryptParams {
  pbeSchema?: string;
}

export default class NodeEngine extends pkijs.CryptoEngine {

  constructor() {
    super({
      crypto: nodeSpecificCrypto as any,
      subtle: {} as any,
      name: "nodeCryptoEngine"
    });

  }

  public override getRandomValues<T extends ArrayBufferView | null>(array: T): T {
    if (array) {
      const randomView = nodeSpecificCrypto.getRandomValues(array.byteLength);
      new Uint8Array(array.buffer).set(randomView);
    }

    return array;
  }

  public override getAlgorithmByOID<T extends Algorithm = Algorithm>(oid: string, safety?: boolean, target?: string): object | T;
  public override getAlgorithmByOID<T extends Algorithm = Algorithm>(oid: string, safety: true, target?: string): T;
  public override getAlgorithmByOID(oid: string, safety?: boolean, target?: string) {
    switch (oid) {
      case "1.2.840.113549.3.2":
        return {
          name: "RC2-40-CBC",
          length: 5
        };
      case "1.2.840.113549.3.7":
        return {
          name: "DES-EDE3-CBC",
          length: 24
        };
      case "2.16.840.1.101.3.4.1.2":
        return {
          name: "AES-128-CBC",
          length: 16
        };
      case "2.16.840.1.101.3.4.1.22":
        return {
          name: "AES-192-CBC",
          length: 24
        };
      case "2.16.840.1.101.3.4.1.42":
        return {
          name: "AES-256-CBC",
          length: 32
        };
      case "1.2.840.113549.1.5.12":
        return {
          name: "PBKDF2"
        };
      default:
        return super.getAlgorithmByOID(oid, safety, target);
    }
  }

  public override getOIDByAlgorithm(algorithm: Algorithm, safety?: boolean, target?: string): string {
    switch (algorithm.name.toUpperCase()) {
      case "RC2-40-CBC":
        return "1.2.840.113549.3.2";
      case "DES-EDE3-CBC":
        return "1.2.840.113549.3.7";
      case "AES-128-CBC":
        return "2.16.840.1.101.3.4.1.2";
      case "AES-192-CBC":
        return "2.16.840.1.101.3.4.1.22";
      case "AES-256-CBC":
        return "2.16.840.1.101.3.4.1.42";
      default:
        return super.getOIDByAlgorithm(algorithm, safety, target);
    }

  }

  public override getAlgorithmParameters(algorithmName: string, operation: pkijs.CryptoEngineAlgorithmOperation): pkijs.CryptoEngineAlgorithmParams {
    switch (algorithmName.toUpperCase()) {
      case "RC2-40-CBC":
        switch (operation.toLowerCase()) {
          case "importkey":
          case "exportkey":
          case "generatekey":
            return {
              algorithm: {
                name: "RC2-40-CBC",
                length: 5
              },
              usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
            };
          case "decrypt":
          case "encrypt":
            return {
              algorithm: {
                name: "RC2-40-CBC",
                iv: this.getRandomValues(new Uint8Array(8)), // For "decrypt" the value should be replaced with value got on "encrypt" step
                length: 5
              },
              usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
            };
          default:
            return {
              algorithm: {
                name: "RC2-40-CBC"
              },
              usages: []
            };
        }
      case "DES-EDE3-CBC":
        switch (operation.toLowerCase()) {
          case "importkey":
          case "exportkey":
          case "generatekey":
            return {
              algorithm: {
                name: "DES-EDE3-CBC",
                length: 24
              },
              usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
            };
          case "decrypt":
          case "encrypt":
            return {
              algorithm: {
                name: "DES-EDE3-CBC",
                iv: this.getRandomValues(new Uint8Array(8)), // For "decrypt" the value should be replaced with value got on "encrypt" step
                length: 24
              },
              usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
            };
            break;
          default:
            return {
              algorithm: {
                name: "DES-EDE3-CBC"
              },
              usages: []
            };
        }
      case "AES-128-CBC":
        switch (operation.toLowerCase()) {
          case "importkey":
          case "exportkey":
          case "generatekey":
            return {
              algorithm: {
                name: "AES-128-CBC",
                length: 16
              },
              usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
            };
            break;
          case "decrypt":
          case "encrypt":
            return {
              algorithm: {
                name: "AES-128-CBC",
                iv: this.getRandomValues(new Uint8Array(16)), // For "decrypt" the value should be replaced with value got on "encrypt" step
                length: 16
              },
              usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
            };
          default:
            return {
              algorithm: {
                name: "AES-128-CBC",
                length: 16
              },
              usages: []
            };
        }
      case "AES-192-CBC":
        switch (operation.toLowerCase()) {
          case "importkey":
          case "exportkey":
          case "generatekey":
            return {
              algorithm: {
                name: "AES-192-CBC",
                length: 24
              },
              usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
            };
          case "decrypt":
          case "encrypt":
            return {
              algorithm: {
                name: "AES-192-CBC",
                iv: this.getRandomValues(new Uint8Array(16)), // For "decrypt" the value should be replaced with value got on "encrypt" step
                length: 24
              },
              usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
            };
          default:
            return {
              algorithm: {
                name: "AES-192-CBC",
                length: 24
              },
              usages: []
            };
        }
      case "AES-256-CBC":
        switch (operation.toLowerCase()) {
          case "importkey":
          case "exportkey":
          case "generatekey":
            return {
              algorithm: {
                name: "AES-256-CBC",
                length: 32
              },
              usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
            };
          case "decrypt":
          case "encrypt":
            return {
              algorithm: {
                name: "AES-256-CBC",
                iv: this.getRandomValues(new Uint8Array(16)), // For "decrypt" the value should be replaced with value got on "encrypt" step
                length: 32
              },
              usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
            };
          default:
            return {
              algorithm: {
                name: "AES-256-CBC",
                length: 32
              },
              usages: []
            };
        }
      case "PBKDF2":
        switch (operation.toLowerCase()) {
          case "derivekey":
            return {
              algorithm: {
                name: "PBKDF2",
                hash: { name: "SHA-256" },
                salt: new Uint8Array([]),
                iterations: 10000
              },
              usages: ["encrypt", "decrypt"]
            };
          default:
            return {
              algorithm: {
                name: "PBKDF2"
              },
              usages: []
            };
        }
      default:
        return super.getAlgorithmParameters(algorithmName, operation);
    }
  }

  /**
   * Specialized function encrypting "EncryptedContentInfo" object using parameters
   * @param parameters
   */
  public override async encryptEncryptedContentInfo(parameters: NodeEngineEncryptParams): Promise<pkijs.EncryptedContentInfo> {
    pkijs.ParameterError.assert(parameters,
      "password", "contentEncryptionAlgorithm", "hmacHashAlgorithm",
      "iterationCount", "contentToEncrypt", "contentToEncrypt", "contentType");

    parameters.pbeSchema ??= "PBES2";

    const contentEncryptionOID = this.getOIDByAlgorithm(parameters.contentEncryptionAlgorithm, true, "contentEncryptionAlgorithm");
    const pbkdf2OID = this.getOIDByAlgorithm({
      name: "PBKDF2"
    }, true, "PBKDF2");
    const hmacOID = this.getOIDByAlgorithm({
      name: "HMAC",
      hash: {
        name: parameters.hmacHashAlgorithm
      }
    } as Algorithm, true, "hmacHashAlgorithm");

    //#region Special case for PBES1
    if (parameters.pbeSchema.toUpperCase() !== "PBES2")  // Assume we have PBES1 here
    {
      //#region Initial variables
      const saltBuffer = new ArrayBuffer(20);
      const saltView = new Uint8Array(saltBuffer);
      this.getRandomValues(saltView);

      const ivLength = 8; // (in bytes) For current algorithms (3DES and RC2) IV length has the same value
      //#endregion

      //#region Check we have correct encryption algorithm
      let pbeAlgorithm: string;

      switch (parameters.contentEncryptionAlgorithm.name.toUpperCase()) {
        case "DES-EDE3-CBC":
          pbeAlgorithm = "1.2.840.113549.1.12.1.3"; // pbeWithSHAAnd3-KeyTripleDES-CBC
          break;
        case "RC2-40-CBC":
          pbeAlgorithm = "1.2.840.113549.1.12.1.6"; // pbeWithSHAAnd40BitRC2-CBC
          break;
        default:
          throw new Error("For PBES1 encryption algorithm could be only DES-EDE3-CBC or RC2-40-CBC");
      }
      //#endregion

      // Encrypt data using PBKDF1 as a source for key
      const encryptedContent = await nodeSpecificCrypto.encryptUsingPBKDF1Password(parameters.contentEncryptionAlgorithm.name, (parameters.contentEncryptionAlgorithm as AesKeyAlgorithm).length, ivLength, parameters.password, saltBuffer, parameters.iterationCount, parameters.contentToEncrypt);

      //#region Store all parameters in EncryptedData object
      const encryptedContentInfo = new pkijs.EncryptedContentInfo({
        contentType: parameters.contentType,
        contentEncryptionAlgorithm: new pkijs.AlgorithmIdentifier({
          algorithmId: pbeAlgorithm,
          algorithmParams: new asn1js.Sequence({
            value: [
              new asn1js.OctetString({ valueHex: saltBuffer }),
              new asn1js.Integer({ value: parameters.iterationCount })
            ]
          })
        })
      });
      encryptedContentInfo.encryptedContent = new asn1js.OctetString({ valueHex: encryptedContent });

      return encryptedContentInfo;
      //#endregion
    }
    //#endregion

    //#region Initial variables
    const ivBuffer = new ArrayBuffer((parameters.contentEncryptionAlgorithm as AesCbcParams).iv.byteLength);
    const ivView = new Uint8Array(ivBuffer);
    this.getRandomValues(ivView);

    const saltBuffer = new ArrayBuffer(8);
    const saltView = new Uint8Array(saltBuffer);
    this.getRandomValues(saltView);

    const pbkdf2Params = new pkijs.PBKDF2Params({
      salt: new asn1js.OctetString({ valueHex: saltBuffer }),
      iterationCount: parameters.iterationCount,
      prf: new pkijs.AlgorithmIdentifier({
        algorithmId: hmacOID,
        algorithmParams: new asn1js.Null()
      })
    });
    //#endregion

    // Encrypt data using PBKDF2 as a source for key
    const encryptedContent = await nodeSpecificCrypto.encryptUsingPBKDF2Password(parameters.contentEncryptionAlgorithm.name, (parameters.contentEncryptionAlgorithm as AesKeyAlgorithm).length, parameters.password, saltBuffer, parameters.iterationCount, parameters.hmacHashAlgorithm, ivBuffer, parameters.contentToEncrypt);

    //#region Store all parameters in EncryptedData object
    const pbes2Parameters = new pkijs.PBES2Params({
      keyDerivationFunc: new pkijs.AlgorithmIdentifier({
        algorithmId: pbkdf2OID,
        algorithmParams: pbkdf2Params.toSchema()
      }),
      encryptionScheme: new pkijs.AlgorithmIdentifier({
        algorithmId: contentEncryptionOID,
        algorithmParams: new asn1js.OctetString({ valueHex: ivBuffer })
      })
    });

    const encryptedContentInfo = new pkijs.EncryptedContentInfo({
      contentType: parameters.contentType,
      contentEncryptionAlgorithm: new pkijs.AlgorithmIdentifier({
        algorithmId: "1.2.840.113549.1.5.13", // pkcs5PBES2
        algorithmParams: pbes2Parameters.toSchema()
      })
    });
    encryptedContentInfo.encryptedContent = new asn1js.OctetString({ valueHex: encryptedContent });

    return encryptedContentInfo;
    //#endregion
  }

  /**
   * Decrypt data stored in "EncryptedContentInfo" object using parameters
   * @param parameters
   */
  public override async decryptEncryptedContentInfo(parameters: pkijs.CryptoEngineDecryptParams): Promise<ArrayBuffer> {
    //#region Initial variables
    let pbes1EncryptionAlgorithm = "";
    let pbes1EncryptionAlgorithmLength = 0;
    const pbes1EncryptionIVLength = 8;

    let pbes2Parameters: pkijs.PBES2Params;
    let pbkdf2Params: pkijs.PBKDF2Params;
    //#endregion

    //#region Check for input parameters
    pkijs.ParameterError.assert(parameters, "password", "encryptedContentInfo");
    switch (parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId) {
      case "1.2.840.113549.1.5.13": // pkcs5PBES2
        break;
      case "1.2.840.113549.1.12.1.3": // pbeWithSHAAnd3-KeyTripleDES-CBC
        pbes1EncryptionAlgorithm = "DES-EDE3-CBC";
        pbes1EncryptionAlgorithmLength = 24;
        break;
      case "1.2.840.113549.1.12.1.6": // pbeWithSHAAnd40BitRC2-CBC
        pbes1EncryptionAlgorithm = "RC2-40-CBC";
        pbes1EncryptionAlgorithmLength = 5;
        break;
      default:
        throw new Error(`Unknown "contentEncryptionAlgorithm": ${parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId}`);
    }
    //#endregion

    //#region Create correct data block for decryption
    let dataBuffer = new ArrayBuffer(0);

    if (!parameters.encryptedContentInfo.encryptedContent) {
      pkijs.ParameterError.assertEmpty(parameters.encryptedContentInfo.encryptedContent, "encryptedContent", "parameters.encryptedContentInfo");
    }
    if (parameters.encryptedContentInfo.encryptedContent.idBlock.isConstructed === false) {
      dataBuffer = parameters.encryptedContentInfo.encryptedContent.valueBlock.valueHex;
    } else {
      for (const content of parameters.encryptedContentInfo.encryptedContent.valueBlock.value)
        dataBuffer = pvutils.utilConcatBuf(dataBuffer, content.valueBlock.valueHex);
    }
    //#endregion

    //#region Check if we have PBES1
    if (pbes1EncryptionAlgorithm.length) {
      //#region Description
      const pbesParameters = parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams;

      const saltBuffer = pbesParameters.valueBlock.value[0].valueBlock.valueHex;
      const iterationCount = pbesParameters.valueBlock.value[1].valueBlock.valueDec;
      //#endregion

      return nodeSpecificCrypto.decryptUsingPBKDF1Password(pbes1EncryptionAlgorithm, pbes1EncryptionAlgorithmLength, pbes1EncryptionIVLength, parameters.password, saltBuffer, iterationCount, dataBuffer);
    }
    //#endregion

    //#region Initial variables
    try {
      pbes2Parameters = new pkijs.PBES2Params({ schema: parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams });
    }
    catch (ex) {
      throw new Error("Incorrectly encoded 'pbes2Parameters'");
    }

    try {
      pbkdf2Params = new pkijs.PBKDF2Params({ schema: pbes2Parameters.keyDerivationFunc.algorithmParams });
    }
    catch (ex) {
      throw new Error("Incorrectly encoded 'pbkdf2Params'");
    }

    const contentEncryptionAlgorithm = this.getAlgorithmByOID(pbes2Parameters.encryptionScheme.algorithmId, true, "contentEncryptionAlgorithm");

    const ivBuffer = pbes2Parameters.encryptionScheme.algorithmParams.valueBlock.valueHex;
    const saltBuffer = pbkdf2Params.salt.valueBlock.valueHex;

    const iterationCount = pbkdf2Params.iterationCount;

    let hmacHashAlgorithm = "SHA-1";

    if (pbkdf2Params.prf) {
      const algorithm = this.getAlgorithmByOID(pbkdf2Params.prf.algorithmId, true, "HMAC hash algorithm") as any;
      hmacHashAlgorithm = algorithm.hash.name;
    }
    //#endregion

    return Promise.resolve().then(() =>
      nodeSpecificCrypto.decryptUsingPBKDF2Password(contentEncryptionAlgorithm.name, (contentEncryptionAlgorithm as AesKeyAlgorithm).length, parameters.password, saltBuffer, iterationCount, hmacHashAlgorithm, ivBuffer, dataBuffer)
    );
  }

  protected getHashAlgorithmLength(hashAlgorithm: string): number {
    switch (hashAlgorithm.toLowerCase()) {
      case "sha-1":
        return 160;
        break;
      case "sha-256":
        return 256;
        break;
      case "sha-384":
        return 384;
        break;
      case "sha-512":
        return 512;
      default:
        throw new Error(`Incorrect 'parameters.hashAlgorithm' parameter: ${hashAlgorithm}`);
    }
  }
  public override async stampDataWithPassword(parameters: pkijs.CryptoEngineStampDataWithPasswordParams): Promise<ArrayBuffer> {
    pkijs.ParameterError.assert(parameters, "password", "hashAlgorithm", "salt", "iterationCount", "contentToStamp");

    const length = this.getHashAlgorithmLength(parameters.hashAlgorithm);

    return nodeSpecificCrypto.stampDataWithPassword(parameters.hashAlgorithm, length, parameters.password, parameters.salt, parameters.iterationCount, parameters.contentToStamp);
  }

  public override async verifyDataStampedWithPassword(parameters: pkijs.CryptoEngineVerifyDataStampedWithPasswordParams): Promise<boolean> {
    pkijs.ParameterError.assert(parameters, "password", "hashAlgorithm", "salt", "iterationCount", "contentToVerify", "signatureToVerify");

    const length = this.getHashAlgorithmLength(parameters.hashAlgorithm);

    return nodeSpecificCrypto.verifyDataStampedWithPassword(parameters.hashAlgorithm, length, parameters.password, parameters.salt, parameters.iterationCount, parameters.contentToVerify, parameters.signatureToVerify);
  }

}
