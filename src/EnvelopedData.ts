import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as common from "./common";
import OriginatorInfo from "./OriginatorInfo";
import RecipientInfo from "./RecipientInfo";
import EncryptedContentInfo, { EncryptedContentInfoSchema } from "./EncryptedContentInfo";
import Attribute from "./Attribute";
import AlgorithmIdentifier, { AlgorithmIdentifierParameters } from "./AlgorithmIdentifier";
import RSAESOAEPParams from "./RSAESOAEPParams";
import { KeyTransRecipientInfo } from "./KeyTransRecipientInfo";
import IssuerAndSerialNumber from "./IssuerAndSerialNumber";
import RecipientKeyIdentifier from "./RecipientKeyIdentifier";
import RecipientEncryptedKey from "./RecipientEncryptedKey";
import KeyAgreeRecipientIdentifier from "./KeyAgreeRecipientIdentifier";
import KeyAgreeRecipientInfo, { KeyAgreeRecipientInfoParameters } from "./KeyAgreeRecipientInfo";
import RecipientEncryptedKeys from "./RecipientEncryptedKeys";
import KEKRecipientInfo from "./KEKRecipientInfo";
import KEKIdentifier from "./KEKIdentifier";
import PBKDF2Params from "./PBKDF2Params";
import PasswordRecipientinfo from "./PasswordRecipientinfo";
import ECCCMSSharedInfo from "./ECCCMSSharedInfo";
import OriginatorIdentifierOrKey from "./OriginatorIdentifierOrKey";
import OriginatorPublicKey from "./OriginatorPublicKey";
import * as Schema from "./Schema";
import Certificate from "./Certificate";

const VERSION = "version";
const ORIGINATOR_INFO = "originatorInfo";
const RECIPIENT_INFOS = "recipientInfos";
const ENCRYPTED_CONTENT_INFO = "encryptedContentInfo";
const UNPROTECTED_ATTRS = "unprotectedAttrs";
const CLEAR_PROPS = [
  VERSION,
  ORIGINATOR_INFO,
  RECIPIENT_INFOS,
  ENCRYPTED_CONTENT_INFO,
  UNPROTECTED_ATTRS
];

const defaultEncryptionParams = {
  kdfAlgorithm: "SHA-512",
  kekEncryptionLength: 256
};
const curveLengthByName: Record<string, number> = {
  "P-256": 256,
  "P-384": 384,
  "P-521": 528
};

export interface EnvelopedDataParameters extends Schema.SchemaConstructor {
  version?: number;
  originatorInfo?: OriginatorInfo;
  recipientInfos?: RecipientInfo[];
  encryptedContentInfo?: EncryptedContentInfo;
  unprotectedAttrs?: Attribute[];
}

export interface EnvelopedDataEncryptionParams {
  kekEncryptionLength: number;
  kdfAlgorithm: string;
}

/**
 * Class from RFC5652
 */
export default class EnvelopedData implements Schema.SchemaCompatible {

  public version: number;
  public originatorInfo?: OriginatorInfo;
  public recipientInfos: RecipientInfo[];
  public encryptedContentInfo: EncryptedContentInfo;
  public unprotectedAttrs?: Attribute[];

  /**
   * Constructor for EnvelopedData class
   * @param parameters
   */
  constructor(parameters: EnvelopedDataParameters = {}) {
    //#region Internal properties of the object
    this.version = pvutils.getParametersValue(parameters, VERSION, EnvelopedData.defaultValues(VERSION));
    if (parameters.originatorInfo) {
      this.originatorInfo = pvutils.getParametersValue(parameters, ORIGINATOR_INFO, EnvelopedData.defaultValues(ORIGINATOR_INFO));
    }
    this.recipientInfos = pvutils.getParametersValue(parameters, RECIPIENT_INFOS, EnvelopedData.defaultValues(RECIPIENT_INFOS));
    this.encryptedContentInfo = pvutils.getParametersValue(parameters, ENCRYPTED_CONTENT_INFO, EnvelopedData.defaultValues(ENCRYPTED_CONTENT_INFO));
    if (parameters.unprotectedAttrs) {
      this.unprotectedAttrs = pvutils.getParametersValue(parameters, UNPROTECTED_ATTRS, EnvelopedData.defaultValues(UNPROTECTED_ATTRS));
    }
    //#endregion

    //#region If input argument array contains "schema" for this object
    if (parameters.schema) {
      this.fromSchema(parameters.schema);
    }
    //#endregion
  }

  /**
   * Return default values for all class members
   * @param memberName String name for a class member
   */
  public static defaultValues(memberName: typeof VERSION): number;
  public static defaultValues(memberName: typeof ORIGINATOR_INFO): OriginatorInfo;
  public static defaultValues(memberName: typeof RECIPIENT_INFOS): RecipientInfo[];
  public static defaultValues(memberName: typeof ENCRYPTED_CONTENT_INFO): EncryptedContentInfo;
  public static defaultValues(memberName: typeof UNPROTECTED_ATTRS): Attribute[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case VERSION:
        return 0;
      case ORIGINATOR_INFO:
        return new OriginatorInfo();
      case RECIPIENT_INFOS:
        return [];
      case ENCRYPTED_CONTENT_INFO:
        return new EncryptedContentInfo();
      case UNPROTECTED_ATTRS:
        return [];
      default:
        throw new Error(`Invalid member name for EnvelopedData class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case VERSION:
        return (memberValue === EnvelopedData.defaultValues(memberName));
      case ORIGINATOR_INFO:
        return ((memberValue.certs.certificates.length === 0) && (memberValue.crls.crls.length === 0));
      case RECIPIENT_INFOS:
      case UNPROTECTED_ATTRS:
        return (memberValue.length === 0);
      case ENCRYPTED_CONTENT_INFO:
        return ((EncryptedContentInfo.compareWithDefault("contentType", memberValue.contentType)) &&
          (EncryptedContentInfo.compareWithDefault("contentEncryptionAlgorithm", memberValue.contentEncryptionAlgorithm) &&
            (EncryptedContentInfo.compareWithDefault("encryptedContent", memberValue.encryptedContent))));
      default:
        throw new Error(`Invalid member name for EnvelopedData class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * EnvelopedData ::= SEQUENCE {
   *    version CMSVersion,
   *    originatorInfo [0] IMPLICIT OriginatorInfo OPTIONAL,
   *    recipientInfos RecipientInfos,
   *    encryptedContentInfo EncryptedContentInfo,
   *    unprotectedAttrs [1] IMPLICIT UnprotectedAttributes OPTIONAL }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    version?: string;
    originatorInfo?: string;
    recipientInfos?: string;
    encryptedContentInfo?: EncryptedContentInfoSchema;
    unprotectedAttrs?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Integer({ name: (names.version || "") }),
        new asn1js.Constructed({
          name: (names.originatorInfo || ""),
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: OriginatorInfo.schema().valueBlock.value
        }),
        new asn1js.Set({
          value: [
            new asn1js.Repeated({
              name: (names.recipientInfos || ""),
              value: RecipientInfo.schema()
            })
          ]
        }),
        EncryptedContentInfo.schema(names.encryptedContentInfo || {}),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          value: [
            new asn1js.Repeated({
              name: (names.unprotectedAttrs || ""),
              value: Attribute.schema()
            })
          ]
        })
      ]
    }));
  }

  /**
   * Convert parsed asn1js object into current class
   * @param schema
   */
  public fromSchema(schema: Schema.SchemaType): void {
    //#region Clear input data first
    pvutils.clearProps(schema, CLEAR_PROPS);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      EnvelopedData.schema({
        names: {
          version: VERSION,
          originatorInfo: ORIGINATOR_INFO,
          recipientInfos: RECIPIENT_INFOS,
          encryptedContentInfo: {
            names: {
              blockName: ENCRYPTED_CONTENT_INFO
            }
          },
          unprotectedAttrs: UNPROTECTED_ATTRS
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for EnvelopedData");
    //#endregion

    //#region Get internal properties from parsed schema
    this.version = asn1.result.version.valueBlock.valueDec;

    if (ORIGINATOR_INFO in asn1.result) {
      this.originatorInfo = new OriginatorInfo({
        schema: new asn1js.Sequence({
          value: asn1.result.originatorInfo.valueBlock.value
        })
      });
    }

    this.recipientInfos = Array.from(asn1.result.recipientInfos, element => new RecipientInfo({ schema: element }));
    this.encryptedContentInfo = new EncryptedContentInfo({ schema: asn1.result.encryptedContentInfo });

    if (UNPROTECTED_ATTRS in asn1.result)
      this.unprotectedAttrs = Array.from(asn1.result.unprotectedAttrs, element => new Attribute({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): Schema.SchemaType {
    //#region Create array for output sequence
    const outputArray = [];

    outputArray.push(new asn1js.Integer({ value: this.version }));

    if (this.originatorInfo) {
      outputArray.push(new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: this.originatorInfo.toSchema().valueBlock.value
      }));
    }

    outputArray.push(new asn1js.Set({
      value: Array.from(this.recipientInfos, element => element.toSchema())
    }));

    outputArray.push(this.encryptedContentInfo.toSchema());

    if (this.unprotectedAttrs) {
      outputArray.push(new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 1 // [1]
        },
        value: Array.from(this.unprotectedAttrs, element => element.toSchema())
      }));
    }
    //#endregion

    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: outputArray
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    const _object: any = {
      version: this.version
    };

    if (this.originatorInfo)
      _object.originatorInfo = this.originatorInfo.toJSON();

    _object.recipientInfos = Array.from(this.recipientInfos, element => element.toJSON());
    _object.encryptedContentInfo = this.encryptedContentInfo.toJSON();

    if (this.unprotectedAttrs)
      _object.unprotectedAttrs = Array.from(this.unprotectedAttrs, element => element.toJSON());

    return _object;
  }

  /**
   * Helpers function for filling "RecipientInfo" based on recipient's certificate.
   * Problem with WebCrypto is that for RSA certificates we have only one option - "key transport" and
   * for ECC certificates we also have one option - "key agreement". As soon as Google will implement
   * DH algorithm it would be possible to use "key agreement" also for RSA certificates.
   * @param certificate Recipient's certificate
   * @param parameters Additional parameters necessary for "fine tunning" of encryption process
   * @param variant Variant = 1 is for "key transport", variant = 2 is for "key agreement". In fact the "variant" is unnecessary now because Google has no DH algorithm implementation. Thus key encryption scheme would be choosen by certificate type only: "key transport" for RSA and "key agreement" for ECC certificates.
   */
  public addRecipientByCertificate(certificate: Certificate, parameters?: {
    // empty
  }, variant?: number): boolean {
    //#region Initialize encryption parameters
    const encryptionParameters = Object.assign(
      { useOAEP: true, oaepHashAlgorithm: "SHA-512" },
      defaultEncryptionParams,
      parameters || {}
    );
    //#endregion

    //#region Check type of certificate
    if (certificate.subjectPublicKeyInfo.algorithm.algorithmId.indexOf("1.2.840.113549") !== (-1))
      variant = 1; // For the moment it is the only variant for RSA-based certificates
    else {
      if (certificate.subjectPublicKeyInfo.algorithm.algorithmId.indexOf("1.2.840.10045") !== (-1))
        variant = 2; // For the moment it is the only variant for ECC-based certificates
      else
        throw new Error(`Unknown type of certificate's public key: ${certificate.subjectPublicKeyInfo.algorithm.algorithmId}`);
    }
    //#endregion

    //#region Add new "recipient" depends on "variant" and certificate type
    switch (variant) {
      case 1: // Key transport scheme
        {
          let algorithmId;
          let algorithmParams;

          if (encryptionParameters.useOAEP === true) {
            //#region keyEncryptionAlgorithm
            algorithmId = common.getOIDByAlgorithm({
              name: "RSA-OAEP"
            });
            if (algorithmId === "")
              throw new Error("Can not find OID for RSA-OAEP");
            //#endregion

            //#region RSAES-OAEP-params
            const hashOID = common.getOIDByAlgorithm({
              name: encryptionParameters.oaepHashAlgorithm
            });
            if (hashOID === "")
              throw new Error(`Unknown OAEP hash algorithm: ${encryptionParameters.oaepHashAlgorithm}`);

            const hashAlgorithm = new AlgorithmIdentifier({
              algorithmId: hashOID,
              algorithmParams: new asn1js.Null()
            });

            const rsaOAEPParams = new RSAESOAEPParams({
              hashAlgorithm,
              maskGenAlgorithm: new AlgorithmIdentifier({
                algorithmId: "1.2.840.113549.1.1.8", // id-mgf1
                algorithmParams: hashAlgorithm.toSchema()
              })
            });

            algorithmParams = rsaOAEPParams.toSchema();
            //#endregion
          }
          else // Use old RSAES-PKCS1-v1_5 schema instead
          {
            //#region keyEncryptionAlgorithm
            algorithmId = common.getOIDByAlgorithm({
              name: "RSAES-PKCS1-v1_5"
            });
            if (algorithmId === "")
              throw new Error("Can not find OID for RSAES-PKCS1-v1_5");
            //#endregion

            algorithmParams = new asn1js.Null();
          }

          //#region KeyTransRecipientInfo
          const keyInfo = new KeyTransRecipientInfo({
            version: 0,
            rid: new IssuerAndSerialNumber({
              issuer: certificate.issuer,
              serialNumber: certificate.serialNumber
            }),
            keyEncryptionAlgorithm: new AlgorithmIdentifier({
              algorithmId,
              algorithmParams
            }),
            recipientCertificate: certificate,
            // "encryptedKey" will be calculated in "encrypt" function
          });
          //#endregion

          //#region Final values for "CMS_ENVELOPED_DATA"
          this.recipientInfos.push(new RecipientInfo({
            variant: 1,
            value: keyInfo
          }));
          //#endregion
        }
        break;
      case 2: // Key agreement scheme
        {
          const recipientIdentifier = new KeyAgreeRecipientIdentifier({
            variant: 1,
            value: new IssuerAndSerialNumber({
              issuer: certificate.issuer,
              serialNumber: certificate.serialNumber
            })
          });
          this._addKeyAgreeRecipientInfo(
            recipientIdentifier,
            encryptionParameters,
            { recipientCertificate: certificate }
          );
        }
        break;
      default:
        throw new Error(`Unknown "variant" value: ${variant}`);
    }
    //#endregion

    return true;
  }

  /**
   * Add recipient based on pre-defined data like password or KEK
   * @param preDefinedData ArrayBuffer with pre-defined data
   * @param parameters Additional parameters necessary for "fine tunning" of encryption process
   * @param variant Variant = 1 for pre-defined "key encryption key" (KEK). Variant = 2 for password-based encryption.
   */
  public addRecipientByPreDefinedData(preDefinedData: ArrayBuffer, parameters: {
    keyIdentifier?: ArrayBuffer;
    hmacHashAlgorithm?: string;
    iterationCount?: number;
    keyEncryptionAlgorithm?: AesKeyGenParams;
    keyEncryptionAlgorithmParams?: any;
  } | null = null, variant: number) {
    //#region Initial variables
    const encryptionParameters = parameters || {};
    //#endregion

    //#region Check initial parameters
    if ((preDefinedData instanceof ArrayBuffer) === false)
      throw new Error("Please pass \"preDefinedData\" in ArrayBuffer type");

    if (preDefinedData.byteLength === 0)
      throw new Error("Pre-defined data could have zero length");
    //#endregion

    //#region Initialize encryption parameters
    if (("keyIdentifier" in encryptionParameters) === false) {
      const keyIdentifierBuffer = new ArrayBuffer(16);
      const keyIdentifierView = new Uint8Array(keyIdentifierBuffer);
      common.getRandomValues(keyIdentifierView);

      encryptionParameters.keyIdentifier = keyIdentifierBuffer;
    }

    if (("hmacHashAlgorithm" in encryptionParameters) === false)
      encryptionParameters.hmacHashAlgorithm = "SHA-512";

    if (("iterationCount" in encryptionParameters) === false)
      encryptionParameters.iterationCount = 2048;

    if (!encryptionParameters.keyEncryptionAlgorithm) {
      encryptionParameters.keyEncryptionAlgorithm = {
        name: "AES-KW",
        length: 256
      };
    }

    if (!("keyEncryptionAlgorithmParams" in encryptionParameters))
      encryptionParameters.keyEncryptionAlgorithmParams = new asn1js.Null();
    //#endregion

    //#region Add new recipient based on passed variant
    switch (variant) {
      case 1: // KEKRecipientInfo
        {
          //#region keyEncryptionAlgorithm
          const kekOID = common.getOIDByAlgorithm(encryptionParameters.keyEncryptionAlgorithm);
          if (kekOID === "")
            throw new Error("Incorrect value for \"keyEncryptionAlgorithm\"");
          //#endregion

          //#region KEKRecipientInfo
          const keyInfo = new KEKRecipientInfo({
            version: 4,
            kekid: new KEKIdentifier({
              keyIdentifier: new asn1js.OctetString({ valueHex: encryptionParameters.keyIdentifier })
            }),
            keyEncryptionAlgorithm: new AlgorithmIdentifier({
              algorithmId: kekOID,
              /*
               For AES-KW params are NULL, but for other algorithm could another situation.
               */
              algorithmParams: encryptionParameters.keyEncryptionAlgorithmParams
            }),
            preDefinedKEK: preDefinedData
            // "encryptedKey" would be set in "ecrypt" function
          });
          //#endregion

          //#region Final values for "CMS_ENVELOPED_DATA"
          this.recipientInfos.push(new RecipientInfo({
            variant: 3,
            value: keyInfo
          }));
          //#endregion
        }
        break;
      case 2: // PasswordRecipientinfo
        {
          //#region keyDerivationAlgorithm
          const pbkdf2OID = common.getOIDByAlgorithm({
            name: "PBKDF2"
          });
          if (pbkdf2OID === "")
            throw new Error("Can not find OID for PBKDF2");
          //#endregion

          //#region Salt
          const saltBuffer = new ArrayBuffer(64);
          const saltView = new Uint8Array(saltBuffer);
          common.getRandomValues(saltView);
          //#endregion

          //#region HMAC-based algorithm
          const hmacOID = common.getOIDByAlgorithm({
            name: "HMAC",
            hash: {
              name: encryptionParameters.hmacHashAlgorithm
            }
          } as Algorithm);
          if (hmacOID === "")
            throw new Error(`Incorrect value for "hmacHashAlgorithm": ${encryptionParameters.hmacHashAlgorithm}`);
          //#endregion

          //#region PBKDF2-params
          const pbkdf2Params = new PBKDF2Params({
            salt: new asn1js.OctetString({ valueHex: saltBuffer }),
            iterationCount: encryptionParameters.iterationCount,
            prf: new AlgorithmIdentifier({
              algorithmId: hmacOID,
              algorithmParams: new asn1js.Null()
            })
          });
          //#endregion

          //#region keyEncryptionAlgorithm
          const kekOID = common.getOIDByAlgorithm(encryptionParameters.keyEncryptionAlgorithm);
          if (kekOID === "")
            throw new Error("Incorrect value for \"keyEncryptionAlgorithm\"");
          //#endregion

          //#region PasswordRecipientinfo
          const keyInfo = new PasswordRecipientinfo({
            version: 0,
            keyDerivationAlgorithm: new AlgorithmIdentifier({
              algorithmId: pbkdf2OID,
              algorithmParams: pbkdf2Params.toSchema()
            }),
            keyEncryptionAlgorithm: new AlgorithmIdentifier({
              algorithmId: kekOID,
              /*
               For AES-KW params are NULL, but for other algorithm could be another situation.
               */
              algorithmParams: encryptionParameters.keyEncryptionAlgorithmParams
            }),
            password: preDefinedData
            // "encryptedKey" would be set in "ecrypt" function
          });
          //#endregion

          //#region Final values for "CMS_ENVELOPED_DATA"
          this.recipientInfos.push(new RecipientInfo({
            variant: 4,
            value: keyInfo
          }));
          //#endregion
        }
        break;
      default:
        throw new Error(`Unknown value for "variant": ${variant}`);
    }
    //#endregion
  }

  /**
   * Add a "RecipientInfo" using a KeyAgreeRecipientInfo of type RecipientKeyIdentifier.
   * @param key Recipient's public key
   * @param keyId The id for the recipient's public key
   * @param parameters Additional parameters for "fine tuning" the encryption process
   */
  addRecipientByKeyIdentifier(key?: CryptoKey, keyId?: ArrayBuffer, parameters?: any) {
    //#region Initialize encryption parameters
    const encryptionParameters = Object.assign({}, defaultEncryptionParams, parameters || {});
    //#endregion

    const recipientIdentifier = new KeyAgreeRecipientIdentifier({
      variant: 2,
      value: new RecipientKeyIdentifier({
        subjectKeyIdentifier: new asn1js.OctetString({ valueHex: keyId }),
      })
    });
    this._addKeyAgreeRecipientInfo(
      recipientIdentifier,
      encryptionParameters,
      { recipientPublicKey: key }
    );
  }

  /**
   * Add a "RecipientInfo" using a KeyAgreeRecipientInfo of type RecipientKeyIdentifier.
   * @param recipientIdentifier Recipient identifier
   * @param encryptionParameters Additional parameters for "fine tuning" the encryption process
   * @param extraRecipientInfoParams Additional params for KeyAgreeRecipientInfo
   */
  private _addKeyAgreeRecipientInfo(recipientIdentifier: KeyAgreeRecipientIdentifier, encryptionParameters: EnvelopedDataEncryptionParams, extraRecipientInfoParams: KeyAgreeRecipientInfoParameters) {
    //#region RecipientEncryptedKey
    const encryptedKey = new RecipientEncryptedKey({
      rid: recipientIdentifier
      // "encryptedKey" will be calculated in "encrypt" function
    });
    //#endregion

    //#region keyEncryptionAlgorithm
    const aesKWoid = common.getOIDByAlgorithm({
      name: "AES-KW",
      length: encryptionParameters.kekEncryptionLength
    } as Algorithm);
    if (aesKWoid === "")
      throw new Error(`Unknown length for key encryption algorithm: ${encryptionParameters.kekEncryptionLength}`);

    const aesKW = new AlgorithmIdentifier({
      algorithmId: aesKWoid,
    });
    //#endregion

    //#region KeyAgreeRecipientInfo
    const ecdhOID = common.getOIDByAlgorithm({
      name: "ECDH",
      kdf: encryptionParameters.kdfAlgorithm
    } as Algorithm);
    if (ecdhOID === "")
      throw new Error(`Unknown KDF algorithm: ${encryptionParameters.kdfAlgorithm}`);

    // In fact there is no need in so long UKM, but RFC2631
    // has requirement that "UserKeyMaterial" must be 512 bits long
    const ukmBuffer = new ArrayBuffer(64);
    const ukmView = new Uint8Array(ukmBuffer);
    common.getRandomValues(ukmView); // Generate random values in 64 bytes long buffer

    const recipientInfoParams = {
      version: 3,
      // "originator" will be calculated in "encrypt" function because ephemeral key would be generated there
      ukm: new asn1js.OctetString({ valueHex: ukmBuffer }),
      keyEncryptionAlgorithm: new AlgorithmIdentifier({
        algorithmId: ecdhOID,
        algorithmParams: aesKW.toSchema()
      }),
      recipientEncryptedKeys: new RecipientEncryptedKeys({
        encryptedKeys: [encryptedKey]
      })
    };
    const keyInfo = new KeyAgreeRecipientInfo(Object.assign(recipientInfoParams, extraRecipientInfoParams));
    //#endregion

    //#region Final values for "CMS_ENVELOPED_DATA"
    this.recipientInfos.push(new RecipientInfo({
      variant: 2,
      value: keyInfo
    }));
    //#endregion
  }

  /**
   * Create a new CMS Enveloped Data content with encrypted data
   * @param contentEncryptionAlgorithm WebCrypto algorithm. For the moment here could be only "AES-CBC" or "AES-GCM" algorithms.
   * @param contentToEncrypt Content to encrypt
   */
  public async encrypt(contentEncryptionAlgorithm: Algorithm, contentToEncrypt: ArrayBuffer) {
    //#region Initial variables
    const ivBuffer = new ArrayBuffer(16); // For AES we need IV 16 bytes long
    const ivView = new Uint8Array(ivBuffer);
    common.getRandomValues(ivView);

    const contentView = new Uint8Array(contentToEncrypt);
    //#endregion

    //#region Check for input parameters
    const contentEncryptionOID = common.getOIDByAlgorithm(contentEncryptionAlgorithm);
    if (contentEncryptionOID === "")
      throw new Error("Wrong \"contentEncryptionAlgorithm\" value");
    //#endregion

    //#region Get a "crypto" extension
    const crypto = common.getCrypto();
    if (!crypto)
      throw new Error("Unable to create WebCrypto object");
    //#endregion

    //#region Generate new content encryption key
    const sessionKey = await crypto.generateKey(contentEncryptionAlgorithm as AesKeyAlgorithm, true, ["encrypt"]);
    //#endregion
    //#region Encrypt content

    const encryptedContent = await crypto.encrypt({
      name: contentEncryptionAlgorithm.name,
      iv: ivView
    },
      sessionKey,
      contentView);
    //#endregion
    //#region Export raw content of content encryption key
    const exportedSessionKey = await crypto.exportKey("raw", sessionKey);


    //#endregion
    //#region Append common information to CMS_ENVELOPED_DATA
    this.version = 2;
    this.encryptedContentInfo = new EncryptedContentInfo({
      contentType: "1.2.840.113549.1.7.1", // "data"
      contentEncryptionAlgorithm: new AlgorithmIdentifier({
        algorithmId: contentEncryptionOID,
        algorithmParams: new asn1js.OctetString({ valueHex: ivBuffer })
      }),
      encryptedContent: new asn1js.OctetString({ valueHex: encryptedContent })
    });
    //#endregion

    //#region Special sub-functions to work with each recipient's type
    const SubKeyAgreeRecipientInfo = async (index: number) => {
      //#region Initial variables
      const recipientInfo = this.recipientInfos[index].value as KeyAgreeRecipientInfo;
      let recipientCurve: string;
      //#endregion

      //#region Get public key and named curve from recipient's certificate or public key
      let recipientPublicKey: CryptoKey;
      if (recipientInfo.recipientPublicKey) {
        recipientCurve = (recipientInfo.recipientPublicKey.algorithm as EcKeyAlgorithm).namedCurve;
        recipientPublicKey = recipientInfo.recipientPublicKey;
      } else if (recipientInfo.recipientCertificate) {
        const curveObject = recipientInfo.recipientCertificate.subjectPublicKeyInfo.algorithm.algorithmParams;

        if (curveObject.constructor.blockName() !== asn1js.ObjectIdentifier.blockName())
          throw new Error(`Incorrect "recipientCertificate" for index ${index}`);

        const curveOID = curveObject.valueBlock.toString();

        switch (curveOID) {
          case "1.2.840.10045.3.1.7":
            recipientCurve = "P-256";
            break;
          case "1.3.132.0.34":
            recipientCurve = "P-384";
            break;
          case "1.3.132.0.35":
            recipientCurve = "P-521";
            break;
          default:
            throw new Error(`Incorrect curve OID for index ${index}`);
        }

        recipientPublicKey = await recipientInfo.recipientCertificate.getPublicKey({
          algorithm: {
            algorithm: {
              name: "ECDH",
              namedCurve: recipientCurve
            } as EcKeyAlgorithm,
            usages: []
          }
        });
      } else {
        throw new Error("Unsupported RecipientInfo");
      }
      //#endregion

      //#region Generate ephemeral ECDH key
      const recipientCurveLength = curveLengthByName[recipientCurve];

      const ecdhKeys = await crypto.generateKey(
        { name: "ECDH", namedCurve: recipientCurve } as EcKeyGenParams,
        true,
        ["deriveBits"]
      );
      //#endregion
      //#region Export public key of ephemeral ECDH key pair

      const ecdhPublicKey = ecdhKeys.publicKey!;
      const ecdhPrivateKey = ecdhKeys.privateKey!;

      const exportedECDHPublicKey = await crypto.exportKey("spki", ecdhPublicKey);
      //#endregion

      //#region Create shared secret
      const derivedBits = await crypto.deriveBits({
        name: "ECDH",
        public: recipientPublicKey
      },
        ecdhPrivateKey,
        recipientCurveLength);
      //#endregion

      //#region Apply KDF function to shared secret

      //#region Get length of used AES-KW algorithm
      const aesKWAlgorithm = new AlgorithmIdentifier({ schema: recipientInfo.keyEncryptionAlgorithm.algorithmParams });

      const KWalgorithm = common.getAlgorithmByOID(aesKWAlgorithm.algorithmId) as any;
      if (!("name" in KWalgorithm))
        throw new Error(`Incorrect OID for key encryption algorithm: ${aesKWAlgorithm.algorithmId}`);
      //#endregion

      //#region Translate AES-KW length to ArrayBuffer
      let kwLength = KWalgorithm.length;

      const kwLengthBuffer = new ArrayBuffer(4);
      const kwLengthView = new Uint8Array(kwLengthBuffer);

      for (let j = 3; j >= 0; j--) {
        kwLengthView[j] = kwLength;
        kwLength >>= 8;
      }
      //#endregion

      //#region Create and encode "ECC-CMS-SharedInfo" structure
      const eccInfo = new ECCCMSSharedInfo({
        keyInfo: new AlgorithmIdentifier({
          algorithmId: aesKWAlgorithm.algorithmId
        }),
        entityUInfo: (recipientInfo as KeyAgreeRecipientInfo).ukm, // TODO remove `as KeyAgreeRecipientInfo`
        suppPubInfo: new asn1js.OctetString({ valueHex: kwLengthBuffer })
      });

      const encodedInfo = eccInfo.toSchema().toBER(false);
      //#endregion

      //#region Get SHA algorithm used together with ECDH
      const ecdhAlgorithm = common.getAlgorithmByOID(recipientInfo.keyEncryptionAlgorithm.algorithmId) as any;
      if (("name" in ecdhAlgorithm) === false)
        throw new Error(`Incorrect OID for key encryption algorithm: ${recipientInfo.keyEncryptionAlgorithm.algorithmId}`);
      //#endregion

      const derivedKeyRaw = await common.kdf(ecdhAlgorithm.kdf, derivedBits, KWalgorithm.length, encodedInfo);
      //#endregion
      //#region Import AES-KW key from result of KDF function
      const awsKW = await crypto.importKey("raw", derivedKeyRaw, { name: "AES-KW" }, true, ["wrapKey"]);
      //#endregion
      //#region Finally wrap session key by using AES-KW algorithm
      const wrappedKey = await crypto.wrapKey("raw", sessionKey, awsKW, { name: "AES-KW" });
      //#endregion
      //#region Append all neccessary data to current CMS_RECIPIENT_INFO object
      //#region OriginatorIdentifierOrKey
      const asn1 = asn1js.fromBER(exportedECDHPublicKey);

      const originator = new OriginatorIdentifierOrKey();
      originator.variant = 3;
      originator.value = new OriginatorPublicKey({ schema: asn1.result });

      recipientInfo.originator = originator;
      //#endregion

      //#region RecipientEncryptedKey
      /*
       We will not support using of same ephemeral key for many recipients
       */
      recipientInfo.recipientEncryptedKeys.encryptedKeys[0].encryptedKey = new asn1js.OctetString({ valueHex: wrappedKey });
      //#endregion

      return { ecdhPrivateKey };
      //#endregion
    };

    const SubKeyTransRecipientInfo = async (index: number) => {
      const recipientInfo = this.recipientInfos[index].value as KeyTransRecipientInfo; // TODO Remove `as KeyTransRecipientInfo`
      const algorithmParameters = common.getAlgorithmByOID(recipientInfo.keyEncryptionAlgorithm.algorithmId) as any;
      if ("name" in algorithmParameters === false)
        throw new Error(`Unknown keyEncryptionAlgorithm: ${recipientInfo.keyEncryptionAlgorithm.algorithmId}`);

      //#region RSA-OAEP case
      if (algorithmParameters.name === "RSA-OAEP") {
        const schema = recipientInfo.keyEncryptionAlgorithm.algorithmParams;
        const rsaOAEPParams = new RSAESOAEPParams({ schema });

        algorithmParameters.hash = common.getAlgorithmByOID(rsaOAEPParams.hashAlgorithm.algorithmId);
        if (("name" in algorithmParameters.hash) === false)
          throw new Error(`Incorrect OID for hash algorithm: ${rsaOAEPParams.hashAlgorithm.algorithmId}`);
      }
      //#endregion

      try {
        const publicKey = await recipientInfo.recipientCertificate.getPublicKey({
          algorithm: {
            algorithm: algorithmParameters,
            usages: ["encrypt", "wrapKey"]
          }
        });

        const encryptedKey = await crypto.encrypt(publicKey.algorithm, publicKey, exportedSessionKey);

        //#region RecipientEncryptedKey
        recipientInfo.encryptedKey = new asn1js.OctetString({ valueHex: encryptedKey });
        //#endregion
      }
      catch {
        // nothing
      }
    };

    const SubKEKRecipientInfo = async (index: number) => {
      //#region Initial variables
      const recipientInfo = this.recipientInfos[index].value as KEKRecipientInfo; // TODO Remove `as KEKRecipientInfo`
      //#endregion

      //#region Import KEK from pre-defined data

      //#region Get WebCrypto form of "keyEncryptionAlgorithm"
      const kekAlgorithm = common.getAlgorithmByOID(recipientInfo.keyEncryptionAlgorithm.algorithmId) as any;
      if (("name" in kekAlgorithm) === false)
        throw new Error(`Incorrect OID for "keyEncryptionAlgorithm": ${recipientInfo.keyEncryptionAlgorithm.algorithmId}`);
      //#endregion

      const kekKey = await crypto.importKey("raw",
        new Uint8Array(recipientInfo.preDefinedKEK),
        kekAlgorithm,
        true,
        ["wrapKey"]); // Too specific for AES-KW
      //#endregion

      //#region Wrap previously exported session key

      const wrappedKey = await crypto.wrapKey("raw", sessionKey, kekKey, kekAlgorithm);
      //#endregion
      //#region Append all necessary data to current CMS_RECIPIENT_INFO object
      //#region RecipientEncryptedKey
      recipientInfo.encryptedKey = new asn1js.OctetString({ valueHex: wrappedKey });
      //#endregion
      //#endregion
    };

    const SubPasswordRecipientinfo = async (index: number) => {
      //#region Initial variables
      const recipientInfo = this.recipientInfos[index].value as PasswordRecipientinfo; // TODO Remove `as PasswordRecipientinfo`
      let pbkdf2Params: PBKDF2Params;
      //#endregion

      //#region Check that we have encoded "keyDerivationAlgorithm" plus "PBKDF2_params" in there

      if (!recipientInfo.keyDerivationAlgorithm)
        throw new Error("Please append encoded \"keyDerivationAlgorithm\"");

      if (!recipientInfo.keyDerivationAlgorithm.algorithmParams)
        throw new Error("Incorrectly encoded \"keyDerivationAlgorithm\"");

      try {
        pbkdf2Params = new PBKDF2Params({ schema: recipientInfo.keyDerivationAlgorithm.algorithmParams });
      }
      catch (ex) {
        throw new Error("Incorrectly encoded \"keyDerivationAlgorithm\"");
      }

      //#endregion
      //#region Derive PBKDF2 key from "password" buffer
      const passwordView = new Uint8Array(recipientInfo.password);

      const derivationKey = await crypto.importKey("raw",
        passwordView,
        "PBKDF2",
        false,
        ["deriveKey"]);
      //#endregion
      //#region Derive key for "keyEncryptionAlgorithm"
      //#region Get WebCrypto form of "keyEncryptionAlgorithm"
      const kekAlgorithm = common.getAlgorithmByOID(recipientInfo.keyEncryptionAlgorithm.algorithmId) as any;
      if (!kekAlgorithm.name) {
        throw new Error(`Incorrect OID for "keyEncryptionAlgorithm": ${recipientInfo.keyEncryptionAlgorithm.algorithmId}`);
      }
      //#endregion

      //#region Get HMAC hash algorithm
      let hmacHashAlgorithm = "SHA-1";

      if (pbkdf2Params.prf) {
        const algorithm = common.getAlgorithmByOID(pbkdf2Params.prf.algorithmId) as any;
        if (!algorithm.name) {
          throw new Error("Incorrect OID for HMAC hash algorithm");
        }

        hmacHashAlgorithm = algorithm.hash.name;
      }
      //#endregion

      //#region Get PBKDF2 "salt" value
      const saltView = new Uint8Array(pbkdf2Params.salt.valueBlock.valueHex);
      //#endregion

      //#region Get PBKDF2 iterations count
      const iterations = pbkdf2Params.iterationCount;
      //#endregion

      const derivedKey = await crypto.deriveKey({
        name: "PBKDF2",
        hash: {
          name: hmacHashAlgorithm
        },
        salt: saltView,
        iterations
      },
        derivationKey,
        kekAlgorithm,
        true,
        ["wrapKey"]); // Usages are too specific for KEK algorithm

      //#endregion
      //#region Wrap previously exported session key (Also too specific for KEK algorithm)
      const wrappedKey = await crypto.wrapKey("raw", sessionKey, derivedKey, kekAlgorithm);
      //#endregion
      //#region Append all neccessary data to current CMS_RECIPIENT_INFO object
      //#region RecipientEncryptedKey
      recipientInfo.encryptedKey = new asn1js.OctetString({ valueHex: wrappedKey });
      //#endregion
      //#endregion
    };

    //#endregion

    //#region Create special routines for each "recipient"
    for (let i = 0; i < this.recipientInfos.length; i++) {
      switch (this.recipientInfos[i].variant) {
        case 1: // KeyTransRecipientInfo
          await SubKeyTransRecipientInfo(i);
          break;
        case 2: // KeyAgreeRecipientInfo
          await SubKeyAgreeRecipientInfo(i);
          break;
        case 3: // KEKRecipientInfo
          await SubKEKRecipientInfo(i);
          break;
        case 4: // PasswordRecipientinfo
          await SubPasswordRecipientinfo(i);
          break;
        default:
          throw new Error(`Unknown recipient type in array with index ${i}`);
      }
    }
    //#endregion
  }

  /**
   * Decrypt existing CMS Enveloped Data content
   * @param recipientIndex Index of recipient
   * @param parameters Additional parameters
   */
  async decrypt(recipientIndex: number, parameters: {
    recipientCertificate?: Certificate;
    recipientPrivateKey?: BufferSource;
    preDefinedData?: BufferSource;
  }) {
    //#region Initial variables
    const decryptionParameters = parameters || {};
    //#endregion

    //#region Check for input parameters
    if ((recipientIndex + 1) > this.recipientInfos.length) {
      throw new Error(`Maximum value for "index" is: ${this.recipientInfos.length - 1}`);
    }
    //#endregion

    //#region Get a "crypto" extension
    const crypto = common.getCrypto();
    if (!crypto) {
      throw new Error("Unable to create WebCrypto object");
    }
    //#endregion

    //#region Special sub-functions to work with each recipient's type
    const SubKeyAgreeRecipientInfo = async (index: number) => {
      //#region Initial variables
      const recipientInfo = this.recipientInfos[index].value as KeyAgreeRecipientInfo; // TODO Remove `as KeyAgreeRecipientInfo`
      //#endregion

      let curveOID: string;
      let recipientCurve: string;
      let recipientCurveLength: number;
      const originator = recipientInfo.originator;

      //#region Get "namedCurve" parameter from recipient's certificate

      if (decryptionParameters.recipientCertificate) {
        const curveObject = decryptionParameters.recipientCertificate.subjectPublicKeyInfo.algorithm.algorithmParams;
        if (curveObject.constructor.blockName() !== asn1js.ObjectIdentifier.blockName()) {
          throw new Error(`Incorrect "recipientCertificate" for index ${index}`);
        }
        curveOID = curveObject.valueBlock.toString();
      } else if (originator.value.algorithm.algorithmParams) {
        const curveObject = originator.value.algorithm.algorithmParams;
        if (curveObject.constructor.blockName() !== asn1js.ObjectIdentifier.blockName()) {
          throw new Error(`Incorrect originator for index ${index}`);
        }
        curveOID = curveObject.valueBlock.toString();
      } else {
        throw new Error("Parameter \"recipientCertificate\" is mandatory for \"KeyAgreeRecipientInfo\" if algorithm params are missing from originator");
      }

      if (!decryptionParameters.recipientPrivateKey)
        throw new Error("Parameter \"recipientPrivateKey\" is mandatory for \"KeyAgreeRecipientInfo\"");

      switch (curveOID) {
        case "1.2.840.10045.3.1.7":
          recipientCurve = "P-256";
          recipientCurveLength = 256;
          break;
        case "1.3.132.0.34":
          recipientCurve = "P-384";
          recipientCurveLength = 384;
          break;
        case "1.3.132.0.35":
          recipientCurve = "P-521";
          recipientCurveLength = 528;
          break;
        default:
          throw new Error(`Incorrect curve OID for index ${index}`);
      }

      const ecdhPrivateKey = await crypto.importKey("pkcs8",
        decryptionParameters.recipientPrivateKey,
        {
          name: "ECDH",
          namedCurve: recipientCurve
        } as EcKeyImportParams,
        true,
        ["deriveBits"]
      );
      //#endregion
      //#region Import sender's ephemeral public key
      //#region Change "OriginatorPublicKey" if "curve" parameter absent
      if (("algorithmParams" in originator.value.algorithm) === false)
        originator.value.algorithm.algorithmParams = new asn1js.ObjectIdentifier({ value: curveOID });
      //#endregion

      //#region Create ArrayBuffer with sender's public key
      const buffer = originator.value.toSchema().toBER(false);
      //#endregion

      const ecdhPublicKey = await crypto.importKey("spki",
        buffer,
        {
          name: "ECDH",
          namedCurve: recipientCurve
        } as EcKeyImportParams,
        true,
        []);

      //#endregion
      //#region Create shared secret
      const sharedSecret = await crypto.deriveBits({
        name: "ECDH",
        public: ecdhPublicKey
      },
        ecdhPrivateKey,
        recipientCurveLength);
      //#endregion
      //#region Apply KDF function to shared secret
      async function applyKDF(includeAlgorithmParams?: boolean) {
        includeAlgorithmParams = includeAlgorithmParams || false;

        //#region Get length of used AES-KW algorithm
        const aesKWAlgorithm = new AlgorithmIdentifier({ schema: recipientInfo.keyEncryptionAlgorithm.algorithmParams });

        const KWalgorithm = common.getAlgorithmByOID(aesKWAlgorithm.algorithmId) as any;
        if (!KWalgorithm.name) {
          throw new Error(`Incorrect OID for key encryption algorithm: ${aesKWAlgorithm.algorithmId}`);
        }
        //#endregion

        //#region Translate AES-KW length to ArrayBuffer
        let kwLength = KWalgorithm.length;

        const kwLengthBuffer = new ArrayBuffer(4);
        const kwLengthView = new Uint8Array(kwLengthBuffer);

        for (let j = 3; j >= 0; j--) {
          kwLengthView[j] = kwLength;
          kwLength >>= 8;
        }
        //#endregion

        //#region Create and encode "ECC-CMS-SharedInfo" structure
        const keyInfoAlgorithm: AlgorithmIdentifierParameters = {
          algorithmId: aesKWAlgorithm.algorithmId
        };
        if (includeAlgorithmParams) {
          keyInfoAlgorithm.algorithmParams = new asn1js.Null();
        }
        const eccInfo = new ECCCMSSharedInfo({
          keyInfo: new AlgorithmIdentifier(keyInfoAlgorithm),
          entityUInfo: recipientInfo.ukm,
          suppPubInfo: new asn1js.OctetString({ valueHex: kwLengthBuffer })
        });

        const encodedInfo = eccInfo.toSchema().toBER(false);
        //#endregion

        //#region Get SHA algorithm used together with ECDH
        const ecdhAlgorithm = common.getAlgorithmByOID(recipientInfo.keyEncryptionAlgorithm.algorithmId) as any;
        if (!ecdhAlgorithm.name) {
          throw new Error(`Incorrect OID for key encryption algorithm: ${recipientInfo.keyEncryptionAlgorithm.algorithmId}`);
        }
        //#endregion

        return common.kdf(ecdhAlgorithm.kdf, sharedSecret, KWalgorithm.length, encodedInfo);
      }

      const kdfResult = await applyKDF();
      //#endregion
      //#region Import AES-KW key from result of KDF function
      const importAesKwKey = async (kdfResult: ArrayBuffer) => {
        return crypto.importKey("raw",
          kdfResult,
          { name: "AES-KW" },
          true,
          ["unwrapKey"]
        );
      };

      const aesKwKey = await importAesKwKey(kdfResult);

      //#endregion
      //#region Finally unwrap session key
      const unwrapSessionKey = async (aesKwKey: CryptoKey) => {
        //#region Get WebCrypto form of content encryption algorithm
        const algorithmId = this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId;
        const contentEncryptionAlgorithm = common.getAlgorithmByOID(algorithmId) as any;
        if (!contentEncryptionAlgorithm.name)
          throw new Error(`Incorrect "contentEncryptionAlgorithm": ${algorithmId}`);
        //#endregion

        return crypto.unwrapKey("raw",
          recipientInfo.recipientEncryptedKeys.encryptedKeys[0].encryptedKey.valueBlock.valueHex,
          aesKwKey,
          { name: "AES-KW" },
          contentEncryptionAlgorithm,
          true,
          ["decrypt"]);
      };

      try {
        return await unwrapSessionKey(aesKwKey);
      } catch {
        const kdfResult = await applyKDF(true);
        const aesKwKey = await importAesKwKey(kdfResult);
        return unwrapSessionKey(aesKwKey);
      }
    };
    //#endregion

    const SubKeyTransRecipientInfo = async (index: number) => {
      const recipientInfo = this.recipientInfos[index].value as KeyTransRecipientInfo; // TODO Remove `as KeyTransRecipientInfo`
      if (!decryptionParameters.recipientPrivateKey) {
        throw new Error("Parameter \"recipientPrivateKey\" is mandatory for \"KeyTransRecipientInfo\"");
      }

      const algorithmParameters = common.getAlgorithmByOID(recipientInfo.keyEncryptionAlgorithm.algorithmId) as any;
      if (!algorithmParameters.name) {
        throw new Error(`Unknown keyEncryptionAlgorithm: ${recipientInfo.keyEncryptionAlgorithm.algorithmId}`);
      }

      //#region RSA-OAEP case
      if (algorithmParameters.name === "RSA-OAEP") {
        const schema = recipientInfo.keyEncryptionAlgorithm.algorithmParams;
        const rsaOAEPParams = new RSAESOAEPParams({ schema });

        algorithmParameters.hash = common.getAlgorithmByOID(rsaOAEPParams.hashAlgorithm.algorithmId);
        if (("name" in algorithmParameters.hash) === false)
          throw new Error(`Incorrect OID for hash algorithm: ${rsaOAEPParams.hashAlgorithm.algorithmId}`);
      }
      //#endregion

      const privateKey = await crypto.importKey(
        "pkcs8",
        decryptionParameters.recipientPrivateKey,
        algorithmParameters,
        true,
        ["decrypt"]
      );

      const sessionKey = await crypto.decrypt(
        privateKey.algorithm,
        privateKey,
        recipientInfo.encryptedKey.valueBlock.valueHex
      );

      //#region Get WebCrypto form of content encryption algorithm
      const algorithmId = this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId;
      const contentEncryptionAlgorithm = common.getAlgorithmByOID(algorithmId) as any;
      if (("name" in contentEncryptionAlgorithm) === false)
        throw new Error(`Incorrect "contentEncryptionAlgorithm": ${algorithmId}`);
      //#endregion

      return crypto.importKey("raw",
        sessionKey,
        contentEncryptionAlgorithm,
        true,
        ["decrypt"]
      );
    };

    const SubKEKRecipientInfo = async (index: number) => {
      //#region Initial variables
      const recipientInfo = this.recipientInfos[index].value as KEKRecipientInfo; // TODO Remove `as KEKRecipientInfo`
      //#endregion

      //#region Import KEK from pre-defined data
      if (!decryptionParameters.preDefinedData)
        throw new Error("Parameter \"preDefinedData\" is mandatory for \"KEKRecipientInfo\"");

      //#region Get WebCrypto form of "keyEncryptionAlgorithm"
      const kekAlgorithm = common.getAlgorithmByOID(recipientInfo.keyEncryptionAlgorithm.algorithmId) as any;
      if (!kekAlgorithm.name) {
        throw new Error(`Incorrect OID for "keyEncryptionAlgorithm": ${recipientInfo.keyEncryptionAlgorithm.algorithmId}`);
      }
      //#endregion

      const importedKey = await crypto.importKey("raw",
        decryptionParameters.preDefinedData,
        kekAlgorithm,
        true,
        ["unwrapKey"]); // Too specific for AES-KW

      //#endregion
      //#region Unwrap previously exported session key
      //#region Get WebCrypto form of content encryption algorithm
      const algorithmId = this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId;
      const contentEncryptionAlgorithm = common.getAlgorithmByOID(algorithmId) as any;
      if (!contentEncryptionAlgorithm.name) {
        throw new Error(`Incorrect "contentEncryptionAlgorithm": ${algorithmId}`);
      }
      //#endregion

      return crypto.unwrapKey("raw",
        recipientInfo.encryptedKey.valueBlock.valueHex,
        importedKey,
        kekAlgorithm,
        contentEncryptionAlgorithm,
        true,
        ["decrypt"]);
      //#endregion
    };

    const SubPasswordRecipientinfo = async (index: number) => {
      //#region Initial variables
      const recipientInfo = this.recipientInfos[index].value as PasswordRecipientinfo; // TODO Remove `as PasswordRecipientinfo`
      let pbkdf2Params: PBKDF2Params;
      //#endregion

      //#region Derive PBKDF2 key from "password" buffer

      if (!decryptionParameters.preDefinedData) {
        throw new Error("Parameter \"preDefinedData\" is mandatory for \"KEKRecipientInfo\"");
      }

      if (!recipientInfo.keyDerivationAlgorithm) {
        throw new Error("Please append encoded \"keyDerivationAlgorithm\"");
      }

      if (!recipientInfo.keyDerivationAlgorithm.algorithmParams) {
        throw new Error("Incorrectly encoded \"keyDerivationAlgorithm\"");
      }

      try {
        pbkdf2Params = new PBKDF2Params({ schema: recipientInfo.keyDerivationAlgorithm.algorithmParams });
      }
      catch (ex) {
        throw new Error("Incorrectly encoded \"keyDerivationAlgorithm\"");
      }

      const pbkdf2Key = await crypto.importKey("raw",
        decryptionParameters.preDefinedData,
        "PBKDF2",
        false,
        ["deriveKey"]);
      //#endregion
      //#region Derive key for "keyEncryptionAlgorithm"
      //#region Get WebCrypto form of "keyEncryptionAlgorithm"
      const kekAlgorithm = common.getAlgorithmByOID(recipientInfo.keyEncryptionAlgorithm.algorithmId) as any;
      if (("name" in kekAlgorithm) === false)
        throw new Error(`Incorrect OID for "keyEncryptionAlgorithm": ${recipientInfo.keyEncryptionAlgorithm.algorithmId}`);
      //#endregion

      //#region Get HMAC hash algorithm
      let hmacHashAlgorithm = "SHA-1";

      if (pbkdf2Params.prf) {
        const algorithm = common.getAlgorithmByOID(pbkdf2Params.prf.algorithmId) as any;
        if (!algorithm.name) {
          throw new Error("Incorrect OID for HMAC hash algorithm");
        }

        hmacHashAlgorithm = algorithm.hash.name;
      }
      //#endregion

      //#region Get PBKDF2 "salt" value
      const saltView = new Uint8Array(pbkdf2Params.salt.valueBlock.valueHex);
      //#endregion

      //#region Get PBKDF2 iterations count
      const iterations = pbkdf2Params.iterationCount;
      //#endregion

      const kekKey = await crypto.deriveKey({
        name: "PBKDF2",
        hash: {
          name: hmacHashAlgorithm
        },
        salt: saltView,
        iterations
      },
        pbkdf2Key,
        kekAlgorithm,
        true,
        ["unwrapKey"]); // Usages are too specific for KEK algorithm
      //#endregion
      //#region Unwrap previously exported session key
      //#region Get WebCrypto form of content encryption algorithm
      const algorithmId = this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId;
      const contentEncryptionAlgorithm = common.getAlgorithmByOID(algorithmId) as any;
      if (!contentEncryptionAlgorithm.name) {
        throw new Error(`Incorrect "contentEncryptionAlgorithm": ${algorithmId}`);
      }
      //#endregion

      return crypto.unwrapKey("raw",
        recipientInfo.encryptedKey.valueBlock.valueHex,
        kekKey,
        kekAlgorithm,
        contentEncryptionAlgorithm,
        true,
        ["decrypt"]);
      //#endregion
    };

    //#endregion

    //#region Perform steps, specific to each type of session key encryption
    let unwrappedKey: CryptoKey;
    switch (this.recipientInfos[recipientIndex].variant) {
      case 1: // KeyTransRecipientInfo
        unwrappedKey = await SubKeyTransRecipientInfo(recipientIndex);
        break;
      case 2: // KeyAgreeRecipientInfo
        unwrappedKey = await SubKeyAgreeRecipientInfo(recipientIndex);
        break;
      case 3: // KEKRecipientInfo
        unwrappedKey = await SubKEKRecipientInfo(recipientIndex);
        break;
      case 4: // PasswordRecipientinfo
        unwrappedKey = await SubPasswordRecipientinfo(recipientIndex);
        break;
      default:
        throw new Error(`Unknown recipient type in array with index ${recipientIndex}`);
    }
    //#endregion

    //#region Finally decrypt data by session key
    //#region Get WebCrypto form of content encryption algorithm
    const algorithmId = this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId;
    const contentEncryptionAlgorithm = common.getAlgorithmByOID(algorithmId);
    if (!(contentEncryptionAlgorithm as any).name) {
      throw new Error(`Incorrect "contentEncryptionAlgorithm": ${algorithmId}`);
    }
    //#endregion

    //#region Get "initialization vector" for content encryption algorithm
    const ivBuffer = this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams.valueBlock.valueHex;
    const ivView = new Uint8Array(ivBuffer);
    //#endregion

    //#region Create correct data block for decryption
    let dataBuffer = new ArrayBuffer(0);

    if (!this.encryptedContentInfo.encryptedContent) {
      throw new Error("Required property `encryptedContent` is empty");
    }
    if (this.encryptedContentInfo.encryptedContent.idBlock.isConstructed === false)
      dataBuffer = this.encryptedContentInfo.encryptedContent.valueBlock.valueHex;
    else {
      for (const content of this.encryptedContentInfo.encryptedContent.valueBlock.value) {
        dataBuffer = pvutils.utilConcatBuf(dataBuffer, content.valueBlock.valueHex);
      }
    }
    //#endregion

    return crypto.decrypt({
      name: (contentEncryptionAlgorithm as any).name,
      iv: ivView
    },
      unwrappedKey,
      dataBuffer);
    //#endregion
  }

}
