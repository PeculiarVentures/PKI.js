import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as common from "./common";
import { AlgorithmIdentifier, AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import { RelativeDistinguishedNames, RelativeDistinguishedNamesSchema } from "./RelativeDistinguishedNames";
import { Time, TimeSchema } from "./Time";
import { PublicKeyInfo, PublicKeyInfoSchema } from "./PublicKeyInfo";
import { Extension } from "./Extension";
import { Extensions, ExtensionsSchema } from "./Extensions";
import * as Schema from "./Schema";
import { id_BasicConstraints } from "./ObjectIdentifiers";
import { BasicConstraints } from "./BasicConstraints";
import { CryptoEnginePublicKeyParams } from "./CryptoEngine/CryptoEngineInterface";

const TBS = "tbs";
const VERSION = "version";
const SERIAL_NUMBER = "serialNumber";
const SIGNATURE = "signature";
const ISSUER = "issuer";
const NOT_BEFORE = "notBefore";
const NOT_AFTER = "notAfter";
const SUBJECT = "subject";
const SUBJECT_PUBLIC_KEY_INFO = "subjectPublicKeyInfo";
const ISSUER_UNIQUE_ID = "issuerUniqueID";
const SUBJECT_UNIQUE_ID = "subjectUniqueID";
const EXTENSIONS = "extensions";
const SIGNATURE_ALGORITHM = "signatureAlgorithm";
const SIGNATURE_VALUE = "signatureValue";
const TBS_CERTIFICATE = "tbsCertificate";
const TBS_CERTIFICATE_VERSION = `${TBS_CERTIFICATE}.${VERSION}`;
const TBS_CERTIFICATE_SERIAL_NUMBER = `${TBS_CERTIFICATE}.${SERIAL_NUMBER}`;
const TBS_CERTIFICATE_SIGNATURE = `${TBS_CERTIFICATE}.${SIGNATURE}`;
const TBS_CERTIFICATE_ISSUER = `${TBS_CERTIFICATE}.${ISSUER}`;
const TBS_CERTIFICATE_NOT_BEFORE = `${TBS_CERTIFICATE}.${NOT_BEFORE}`;
const TBS_CERTIFICATE_NOT_AFTER = `${TBS_CERTIFICATE}.${NOT_AFTER}`;
const TBS_CERTIFICATE_SUBJECT = `${TBS_CERTIFICATE}.${SUBJECT}`;
const TBS_CERTIFICATE_SUBJECT_PUBLIC_KEY = `${TBS_CERTIFICATE}.${SUBJECT_PUBLIC_KEY_INFO}`;
const TBS_CERTIFICATE_ISSUER_UNIQUE_ID = `${TBS_CERTIFICATE}.${ISSUER_UNIQUE_ID}`;
const TBS_CERTIFICATE_SUBJECT_UNIQUE_ID = `${TBS_CERTIFICATE}.${SUBJECT_UNIQUE_ID}`;
const TBS_CERTIFICATE_EXTENSIONS = `${TBS_CERTIFICATE}.${EXTENSIONS}`;
const CLEAR_PROPS = [
  TBS_CERTIFICATE,
  TBS_CERTIFICATE_VERSION,
  TBS_CERTIFICATE_SERIAL_NUMBER,
  TBS_CERTIFICATE_SIGNATURE,
  TBS_CERTIFICATE_ISSUER,
  TBS_CERTIFICATE_NOT_BEFORE,
  TBS_CERTIFICATE_NOT_AFTER,
  TBS_CERTIFICATE_SUBJECT,
  TBS_CERTIFICATE_SUBJECT_PUBLIC_KEY,
  TBS_CERTIFICATE_ISSUER_UNIQUE_ID,
  TBS_CERTIFICATE_SUBJECT_UNIQUE_ID,
  TBS_CERTIFICATE_EXTENSIONS,
  SIGNATURE_ALGORITHM,
  SIGNATURE_VALUE
];

export type TBSCertificateSchema = Schema.SchemaParameters<{
  tbsCertificateVersion?: string;
  tbsCertificateSerialNumber?: string;
  signature?: AlgorithmIdentifierSchema;
  issuer?: RelativeDistinguishedNamesSchema;
  tbsCertificateValidity?: string;
  notBefore?: TimeSchema;
  notAfter?: TimeSchema;
  subject?: RelativeDistinguishedNamesSchema;
  subjectPublicKeyInfo?: PublicKeyInfoSchema;
  tbsCertificateIssuerUniqueID?: string;
  tbsCertificateSubjectUniqueID?: string;
  extensions?: ExtensionsSchema;
}>;

function tbsCertificate(parameters: TBSCertificateSchema = {}): Schema.SchemaType {
  //TBSCertificate  ::=  SEQUENCE  {
  //    version         [0]  EXPLICIT Version DEFAULT v1,
  //    serialNumber         CertificateSerialNumber,
  //    signature            AlgorithmIdentifier,
  //    issuer               Name,
  //    validity             Validity,
  //    subject              Name,
  //    subjectPublicKeyInfo SubjectPublicKeyInfo,
  //    issuerUniqueID  [1]  IMPLICIT UniqueIdentifier OPTIONAL,
  //                         -- If present, version MUST be v2 or v3
  //    subjectUniqueID [2]  IMPLICIT UniqueIdentifier OPTIONAL,
  //                         -- If present, version MUST be v2 or v3
  //    extensions      [3]  EXPLICIT Extensions OPTIONAL
  //    -- If present, version MUST be v3
  //}

  const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

  return (new asn1js.Sequence({
    name: (names.blockName || TBS_CERTIFICATE),
    value: [
      new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: [
          new asn1js.Integer({ name: (names.tbsCertificateVersion || TBS_CERTIFICATE_VERSION) }) // EXPLICIT integer value
        ]
      }),
      new asn1js.Integer({ name: (names.tbsCertificateSerialNumber || TBS_CERTIFICATE_SERIAL_NUMBER) }),
      AlgorithmIdentifier.schema(names.signature || {
        names: {
          blockName: TBS_CERTIFICATE_SIGNATURE
        }
      }),
      RelativeDistinguishedNames.schema(names.issuer || {
        names: {
          blockName: TBS_CERTIFICATE_ISSUER
        }
      }),
      new asn1js.Sequence({
        name: (names.tbsCertificateValidity || "tbsCertificate.validity"),
        value: [
          Time.schema(names.notBefore || {
            names: {
              utcTimeName: TBS_CERTIFICATE_NOT_BEFORE,
              generalTimeName: TBS_CERTIFICATE_NOT_BEFORE
            }
          }),
          Time.schema(names.notAfter || {
            names: {
              utcTimeName: TBS_CERTIFICATE_NOT_AFTER,
              generalTimeName: TBS_CERTIFICATE_NOT_AFTER
            }
          })
        ]
      }),
      RelativeDistinguishedNames.schema(names.subject || {
        names: {
          blockName: TBS_CERTIFICATE_SUBJECT
        }
      }),
      PublicKeyInfo.schema(names.subjectPublicKeyInfo || {
        names: {
          blockName: TBS_CERTIFICATE_SUBJECT_PUBLIC_KEY
        }
      }),
      new asn1js.Primitive({
        name: (names.tbsCertificateIssuerUniqueID || TBS_CERTIFICATE_ISSUER_UNIQUE_ID),
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 1 // [1]
        }
      }), // IMPLICIT bistring value
      new asn1js.Primitive({
        name: (names.tbsCertificateSubjectUniqueID || TBS_CERTIFICATE_SUBJECT_UNIQUE_ID),
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 2 // [2]
        }
      }), // IMPLICIT bistring value
      new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 3 // [3]
        },
        value: [Extensions.schema(names.extensions || {
          names: {
            blockName: TBS_CERTIFICATE_EXTENSIONS
          }
        })]
      }) // EXPLICIT SEQUENCE value
    ]
  }));
}

export interface CertificateParameters extends Schema.SchemaConstructor {
  tbs?: ArrayBuffer;
  version?: number;
  serialNumber?: asn1js.Integer;
  signature?: AlgorithmIdentifier;
  issuer?: RelativeDistinguishedNames;
  notBefore?: Time;
  notAfter?: Time;
  subject?: RelativeDistinguishedNames;
  subjectPublicKeyInfo?: PublicKeyInfo;
  issuerUniqueID?: ArrayBuffer;
  subjectUniqueID?: ArrayBuffer;
  extensions?: Extension[];
  signatureAlgorithm?: AlgorithmIdentifier;
  signatureValue?: asn1js.BitString;
}

export type CertificateSchema = Schema.SchemaParameters<{
  tbsCertificate?: TBSCertificateSchema;
  signatureAlgorithm?: AlgorithmIdentifierSchema;
  signatureValue?: string;
}>;

/**
 * Class from RFC5280
 */
export class Certificate implements Schema.SchemaCompatible {

  /**
   * ToBeSigned (TBS) part of the certificate
   */
  public tbs: ArrayBuffer;
  /**
   * Version number
   */
  public version: number;
  /**
   * Serial number of the certificate
   */
  public serialNumber: asn1js.Integer;
  /**
   * This field contains the algorithm identifier for the algorithm used by the CA to sign the certificate
   */
  public signature: AlgorithmIdentifier;
  /**
   * The issuer field identifies the entity that has signed and issued the certificate
   */
  public issuer: RelativeDistinguishedNames;
  /**
   * The date on which the certificate validity period begins
   */
  public notBefore: Time;
  /**
   * The date on which the certificate validity period ends
   */
  public notAfter: Time;
  /**
   * The subject field identifies the entity associated with the public key stored in the subject public key field
   */
  public subject: RelativeDistinguishedNames;
  /**
   * This field is used to carry the public key and identify the algorithm with which the key is used
   */
  public subjectPublicKeyInfo: PublicKeyInfo;
  /**
   * The subject and issuer unique identifiers are present in the certificate to handle the possibility of reuse of subject and/or issuer names over time
   */
  public issuerUniqueID?: ArrayBuffer;
  /**
   * The subject and issuer unique identifiers are present in the certificate to handle the possibility of reuse of subject and/or issuer names over time
   */
  public subjectUniqueID?: ArrayBuffer;
  /**
   * If present, this field is a SEQUENCE of one or more certificate extensions
   */
  public extensions?: Extension[];
  /**
   * The signatureAlgorithm field contains the identifier for the cryptographic algorithm used by the CA to sign this certificate
   */
  public signatureAlgorithm: AlgorithmIdentifier;
  /**
   * The signatureValue field contains a digital signature computed upon the ASN.1 DER encoded tbsCertificate
   */
  public signatureValue: asn1js.BitString;

  /**
   * Constructor for Certificate class
   * @param parameters
   */
  constructor(parameters: CertificateParameters = {}) {
    //#region Internal properties of the object
    this.tbs = pvutils.getParametersValue(parameters, TBS, Certificate.defaultValues(TBS));
    this.version = pvutils.getParametersValue(parameters, VERSION, Certificate.defaultValues(VERSION));
    this.serialNumber = pvutils.getParametersValue(parameters, SERIAL_NUMBER, Certificate.defaultValues(SERIAL_NUMBER));
    this.signature = pvutils.getParametersValue(parameters, SIGNATURE, Certificate.defaultValues(SIGNATURE));
    this.issuer = pvutils.getParametersValue(parameters, ISSUER, Certificate.defaultValues(ISSUER));
    this.notBefore = pvutils.getParametersValue(parameters, NOT_BEFORE, Certificate.defaultValues(NOT_BEFORE));
    this.notAfter = pvutils.getParametersValue(parameters, NOT_AFTER, Certificate.defaultValues(NOT_AFTER));
    this.subject = pvutils.getParametersValue(parameters, SUBJECT, Certificate.defaultValues(SUBJECT));
    this.subjectPublicKeyInfo = pvutils.getParametersValue(parameters, SUBJECT_PUBLIC_KEY_INFO, Certificate.defaultValues(SUBJECT_PUBLIC_KEY_INFO));
    if (parameters.issuerUniqueID) {
      this.issuerUniqueID = pvutils.getParametersValue(parameters, ISSUER_UNIQUE_ID, Certificate.defaultValues(ISSUER_UNIQUE_ID));
    }
    if (parameters.subjectUniqueID) {
      this.subjectUniqueID = pvutils.getParametersValue(parameters, SUBJECT_UNIQUE_ID, Certificate.defaultValues(SUBJECT_UNIQUE_ID));
    }
    if (parameters.extensions) {
      this.extensions = pvutils.getParametersValue(parameters, EXTENSIONS, Certificate.defaultValues(EXTENSIONS));
    }
    this.signatureAlgorithm = pvutils.getParametersValue(parameters, SIGNATURE_ALGORITHM, Certificate.defaultValues(SIGNATURE_ALGORITHM));
    this.signatureValue = pvutils.getParametersValue(parameters, SIGNATURE_VALUE, Certificate.defaultValues(SIGNATURE_VALUE));
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
  public static defaultValues(memberName: typeof TBS): ArrayBuffer;
  public static defaultValues(memberName: typeof VERSION): number;
  public static defaultValues(memberName: typeof SERIAL_NUMBER): asn1js.Integer;
  public static defaultValues(memberName: typeof SIGNATURE): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof ISSUER): RelativeDistinguishedNames;
  public static defaultValues(memberName: typeof NOT_BEFORE): Time;
  public static defaultValues(memberName: typeof NOT_AFTER): Time;
  public static defaultValues(memberName: typeof SUBJECT): RelativeDistinguishedNames;
  public static defaultValues(memberName: typeof SUBJECT_PUBLIC_KEY_INFO): PublicKeyInfo;
  public static defaultValues(memberName: typeof ISSUER_UNIQUE_ID): ArrayBuffer;
  public static defaultValues(memberName: typeof SUBJECT_UNIQUE_ID): ArrayBuffer;
  public static defaultValues(memberName: typeof EXTENSIONS): Extension[];
  public static defaultValues(memberName: typeof SIGNATURE_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof SIGNATURE_VALUE): asn1js.BitString;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case TBS:
        return new ArrayBuffer(0);
      case VERSION:
        return 0;
      case SERIAL_NUMBER:
        return new asn1js.Integer();
      case SIGNATURE:
        return new AlgorithmIdentifier();
      case ISSUER:
        return new RelativeDistinguishedNames();
      case NOT_BEFORE:
        return new Time();
      case NOT_AFTER:
        return new Time();
      case SUBJECT:
        return new RelativeDistinguishedNames();
      case SUBJECT_PUBLIC_KEY_INFO:
        return new PublicKeyInfo();
      case ISSUER_UNIQUE_ID:
        return new ArrayBuffer(0);
      case SUBJECT_UNIQUE_ID:
        return new ArrayBuffer(0);
      case EXTENSIONS:
        return [];
      case SIGNATURE_ALGORITHM:
        return new AlgorithmIdentifier();
      case SIGNATURE_VALUE:
        return new asn1js.BitString();
      default:
        throw new Error(`Invalid member name for Certificate class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * Certificate  ::=  SEQUENCE  {
   *    tbsCertificate       TBSCertificate,
   *    signatureAlgorithm   AlgorithmIdentifier,
   *    signatureValue       BIT STRING  }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: CertificateSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        tbsCertificate(names.tbsCertificate),
        AlgorithmIdentifier.schema(names.signatureAlgorithm || {
          names: {
            blockName: SIGNATURE_ALGORITHM
          }
        }),
        new asn1js.BitString({ name: (names.signatureValue || SIGNATURE_VALUE) })
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
      Certificate.schema({
        names: {
          tbsCertificate: {
            names: {
              extensions: {
                names: {
                  extensions: TBS_CERTIFICATE_EXTENSIONS
                }
              }
            }
          }
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for Certificate");
    //#endregion

    //#region Get internal properties from parsed schema
    this.tbs = asn1.result.tbsCertificate.valueBeforeDecode;

    if (TBS_CERTIFICATE_VERSION in asn1.result)
      this.version = asn1.result[TBS_CERTIFICATE_VERSION].valueBlock.valueDec;
    this.serialNumber = asn1.result[TBS_CERTIFICATE_SERIAL_NUMBER];
    this.signature = new AlgorithmIdentifier({ schema: asn1.result[TBS_CERTIFICATE_SIGNATURE] });
    this.issuer = new RelativeDistinguishedNames({ schema: asn1.result[TBS_CERTIFICATE_ISSUER] });
    this.notBefore = new Time({ schema: asn1.result[TBS_CERTIFICATE_NOT_BEFORE] });
    this.notAfter = new Time({ schema: asn1.result[TBS_CERTIFICATE_NOT_AFTER] });
    this.subject = new RelativeDistinguishedNames({ schema: asn1.result[TBS_CERTIFICATE_SUBJECT] });
    this.subjectPublicKeyInfo = new PublicKeyInfo({ schema: asn1.result[TBS_CERTIFICATE_SUBJECT_PUBLIC_KEY] });
    if (TBS_CERTIFICATE_ISSUER_UNIQUE_ID in asn1.result)
      this.issuerUniqueID = asn1.result[TBS_CERTIFICATE_ISSUER_UNIQUE_ID].valueBlock.valueHex;
    if (TBS_CERTIFICATE_SUBJECT_UNIQUE_ID in asn1.result)
      this.subjectUniqueID = asn1.result[TBS_CERTIFICATE_SUBJECT_UNIQUE_ID].valueBlock.valueHex;
    if (TBS_CERTIFICATE_EXTENSIONS in asn1.result)
      this.extensions = Array.from(asn1.result[TBS_CERTIFICATE_EXTENSIONS], element => new Extension({ schema: element }));

    this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
    this.signatureValue = asn1.result.signatureValue;
    //#endregion
  }

  /**
   * Create ASN.1 schema for existing values of TBS part for the certificate
   */
  public encodeTBS(): asn1js.Sequence {
    //#region Create array for output sequence
    const outputArray = [];

    if ((VERSION in this) && (this.version !== Certificate.defaultValues(VERSION))) {
      outputArray.push(new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: [
          new asn1js.Integer({ value: this.version }) // EXPLICIT integer value
        ]
      }));
    }

    outputArray.push(this.serialNumber);
    outputArray.push(this.signature.toSchema());
    outputArray.push(this.issuer.toSchema());

    outputArray.push(new asn1js.Sequence({
      value: [
        this.notBefore.toSchema(),
        this.notAfter.toSchema()
      ]
    }));

    outputArray.push(this.subject.toSchema());
    outputArray.push(this.subjectPublicKeyInfo.toSchema());

    if (this.issuerUniqueID) {
      outputArray.push(new asn1js.Primitive({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 1 // [1]
        },
        valueHex: this.issuerUniqueID
      }));
    }
    if (this.subjectUniqueID) {
      outputArray.push(new asn1js.Primitive({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 2 // [2]
        },
        valueHex: this.subjectUniqueID
      }));
    }

    if (this.extensions) {
      outputArray.push(new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 3 // [3]
        },
        value: [new asn1js.Sequence({
          value: Array.from(this.extensions, element => element.toSchema())
        })]
      }));
    }
    //#endregion

    //#region Create and return output sequence
    return (new asn1js.Sequence({
      value: outputArray
    }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(encodeFlag = false): asn1js.Sequence {
    let tbsSchema = {};

    // Decode stored TBS value
    if (encodeFlag === false) {
      if (!this.tbs.byteLength) { // No stored certificate TBS part
        return Certificate.schema().value[0];
      }

      tbsSchema = asn1js.fromBER(this.tbs).result;
    } else {
      // Create TBS schema via assembling from TBS parts
      tbsSchema = this.encodeTBS();
    }

    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: [
        tbsSchema,
        this.signatureAlgorithm.toSchema(),
        this.signatureValue
      ]
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    const object: any = {
      tbs: pvutils.bufferToHexCodes(this.tbs, 0, this.tbs.byteLength),
      serialNumber: this.serialNumber.toJSON(),
      signature: this.signature.toJSON(),
      issuer: this.issuer.toJSON(),
      notBefore: this.notBefore.toJSON(),
      notAfter: this.notAfter.toJSON(),
      subject: this.subject.toJSON(),
      subjectPublicKeyInfo: this.subjectPublicKeyInfo.toJSON(),
      signatureAlgorithm: this.signatureAlgorithm.toJSON(),
      signatureValue: this.signatureValue.toJSON()
    };

    if ((VERSION in this) && (this.version !== Certificate.defaultValues(VERSION))) {
      object.version = this.version;
    }

    if (this.issuerUniqueID) {
      object.issuerUniqueID = pvutils.bufferToHexCodes(this.issuerUniqueID, 0, this.issuerUniqueID.byteLength);
    }

    if (this.subjectUniqueID) {
      object.subjectUniqueID = pvutils.bufferToHexCodes(this.subjectUniqueID, 0, this.subjectUniqueID.byteLength);
    }

    if (this.extensions) {
      object.extensions = Array.from(this.extensions, element => element.toJSON());
    }

    return object;
  }

  /**
   * Importing public key for current certificate
   * @param parameters
   */
  public async getPublicKey(parameters?: CryptoEnginePublicKeyParams): Promise<CryptoKey> {
    return common.getCrypto(true).getPublicKey(this.subjectPublicKeyInfo, this.signatureAlgorithm, parameters);
  }

  /**
   * Get hash value for subject public key (default SHA-1)
   * @param hashAlgorithm Hashing algorithm name
   */
  public async getKeyHash(hashAlgorithm = "SHA-1"): Promise<ArrayBuffer> {
    return common.getCrypto(true).digest({ name: hashAlgorithm }, this.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex);
  }

  /**
   * Make a signature for current value from TBS section
   * @param privateKey Private key for SUBJECT_PUBLIC_KEY_INFO structure
   * @param hashAlgorithm Hashing algorithm
   */
  public async sign(privateKey: CryptoKey, hashAlgorithm = "SHA-1") {
    //#region Initial checking
    if (!privateKey) {
      throw new Error("Need to provide a private key for signing");
    }
    //#endregion

    const crypto = common.getCrypto(true);

    // Get a "default parameters" for current algorithm and set correct signature algorithm
    const signatureParameters = await crypto.getSignatureParameters(privateKey, hashAlgorithm);
    const parameters = signatureParameters.parameters;
    this.signature = signatureParameters.signatureAlgorithm;
    this.signatureAlgorithm = signatureParameters.signatureAlgorithm;


    // Create TBS data for signing
    this.tbs = this.encodeTBS().toBER();

    // Signing TBS data on provided private key
    // TODO remove any
    const signature = await crypto.signWithPrivateKey(this.tbs, privateKey, parameters as any);
    this.signatureValue = new asn1js.BitString({ valueHex: signature });
  }

  /**
   * Verifies the certificate signature
   * @param issuerCertificate
   */
  public async verify(issuerCertificate?: Certificate): Promise<boolean> {
    let subjectPublicKeyInfo: PublicKeyInfo | undefined;

    // Set correct SUBJECT_PUBLIC_KEY_INFO value
    if (issuerCertificate) {
      subjectPublicKeyInfo = issuerCertificate.subjectPublicKeyInfo;
    } else if (this.issuer.isEqual(this.subject)) {
      // Self-signed certificate
      subjectPublicKeyInfo = this.subjectPublicKeyInfo;
    }

    if (!(subjectPublicKeyInfo instanceof PublicKeyInfo)) {
      throw new Error("Please provide issuer certificate as a parameter");
    }

    return common.getCrypto(true).verifyWithPublicKey(this.tbs, this.signatureValue, subjectPublicKeyInfo, this.signatureAlgorithm);
  }

}

/**
 * Check CA flag for the certificate
 * @param cert Certificate to find CA flag for
 */
export function checkCA(cert: Certificate, signerCert: Certificate | null = null): Certificate | null {
  //#region Do not include signer's certificate
  if (signerCert && (cert.issuer.isEqual(signerCert.issuer) === true) && (cert.serialNumber.isEqual(signerCert.serialNumber) === true)) {
    return null;
  }
  //#endregion

  let isCA = false;

  if (cert.extensions) {
    for (const extension of cert.extensions) {
      if (extension.extnID === id_BasicConstraints && extension.parsedValue instanceof BasicConstraints) {
        if (extension.parsedValue.cA) {
          isCA = true;
          break;
        }
      }
    }
  }

  if (isCA) {
    return cert;
  }

  return null;
}