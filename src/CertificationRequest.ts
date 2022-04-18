import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as common from "./common";
import { PublicKeyInfo } from "./PublicKeyInfo";
import { RelativeDistinguishedNames, RelativeDistinguishedNamesSchema } from "./RelativeDistinguishedNames";
import { AlgorithmIdentifier } from "./AlgorithmIdentifier";
import { Attribute, AttributeSchema } from "./Attribute";
import * as Schema from "./Schema";
import { CryptoEnginePublicKeyParams } from "./CryptoEngine/CryptoEngineInterface";
import { AsnError } from "./errors";

const TBS = "tbs";
const VERSION = "version";
const SUBJECT = "subject";
const SPKI = "subjectPublicKeyInfo";
const ATTRIBUTES = "attributes";
const SIGNATURE_ALGORITHM = "signatureAlgorithm";
const SIGNATURE_VALUE = "signatureValue";

export interface CertificationRequestInfoParameters {
  names?: {
    blockName?: string;
    CertificationRequestInfo?: string;
    CertificationRequestInfoVersion?: string;
    subject?: RelativeDistinguishedNamesSchema;
    CertificationRequestInfoAttributes?: string;
    attributes?: AttributeSchema;
  };
}

function CertificationRequestInfo(parameters: CertificationRequestInfoParameters = {}) {
  //CertificationRequestInfo ::= SEQUENCE {
  //    version       INTEGER { v1(0) } (v1,...),
  //    subject       Name,
  //    subjectPKInfo SubjectPublicKeyInfo{{ PKInfoAlgorithms }},
  //    attributes    [0] Attributes{{ CRIAttributes }}
  //}

  const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

  return (new asn1js.Sequence({
    name: (names.CertificationRequestInfo || "CertificationRequestInfo"),
    value: [
      new asn1js.Integer({ name: (names.CertificationRequestInfoVersion || "CertificationRequestInfo.version") }),
      RelativeDistinguishedNames.schema(names.subject || {
        names: {
          blockName: "CertificationRequestInfo.subject"
        }
      }),
      PublicKeyInfo.schema({
        names: {
          blockName: "CertificationRequestInfo.subjectPublicKeyInfo"
        }
      }),
      new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: [
          new asn1js.Repeated({
            optional: true, // Because OpenSSL makes wrong ATTRIBUTES field
            name: (names.CertificationRequestInfoAttributes || "CertificationRequestInfo.attributes"),
            value: Attribute.schema(names.attributes || {})
          })
        ]
      })
    ]
  }));
}

export interface CertificationRequestParameters extends Schema.SchemaConstructor {
  tbs?: ArrayBuffer;
  version?: number;
  subject?: RelativeDistinguishedNames;
  subjectPublicKeyInfo?: PublicKeyInfo;
  attributes?: Attribute[];
  signatureAlgorithm?: AlgorithmIdentifier;
  signatureValue?: asn1js.BitString;
}

/**
 * Class from RFC2986
 */
export class CertificationRequest implements Schema.SchemaCompatible {

  public tbs: ArrayBuffer;
  public version: number;
  public subject: RelativeDistinguishedNames;
  public subjectPublicKeyInfo: PublicKeyInfo;
  public attributes?: Attribute[];
  public signatureAlgorithm: AlgorithmIdentifier;
  public signatureValue: asn1js.BitString;

  /**
   * Constructor for Attribute class
   * @param parameters
   * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
   */
  constructor(parameters: CertificationRequestParameters = {}) {
    //#region Internal properties of the object
    this.tbs = pvutils.getParametersValue(parameters, TBS, CertificationRequest.defaultValues(TBS));
    /**
     * @type {number}
     * @desc version
     */
    this.version = pvutils.getParametersValue(parameters, VERSION, CertificationRequest.defaultValues(VERSION));
    /**
     * @type {RelativeDistinguishedNames}
     * @desc subject
     */
    this.subject = pvutils.getParametersValue(parameters, SUBJECT, CertificationRequest.defaultValues(SUBJECT));
    /**
     * @type {PublicKeyInfo}
     * @desc subjectPublicKeyInfo
     */
    this.subjectPublicKeyInfo = pvutils.getParametersValue(parameters, SPKI, CertificationRequest.defaultValues(SPKI));

    if (parameters.attributes) {
      this.attributes = pvutils.getParametersValue(parameters, ATTRIBUTES, CertificationRequest.defaultValues(ATTRIBUTES));
    }

    /**
     * @type {AlgorithmIdentifier}
     * @desc signatureAlgorithm
     */
    this.signatureAlgorithm = pvutils.getParametersValue(parameters, SIGNATURE_ALGORITHM, CertificationRequest.defaultValues(SIGNATURE_ALGORITHM));
    /**
     * @type {BitString}
     * @desc signatureAlgorithm
     */
    this.signatureValue = pvutils.getParametersValue(parameters, SIGNATURE_VALUE, CertificationRequest.defaultValues(SIGNATURE_VALUE));
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
  public static defaultValues(memberName: typeof SUBJECT): RelativeDistinguishedNames;
  public static defaultValues(memberName: typeof SPKI): PublicKeyInfo;
  public static defaultValues(memberName: typeof ATTRIBUTES): Attribute[];
  public static defaultValues(memberName: typeof SIGNATURE_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof SIGNATURE_VALUE): asn1js.BitString;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case TBS:
        return new ArrayBuffer(0);
      case VERSION:
        return 0;
      case SUBJECT:
        return new RelativeDistinguishedNames();
      case SPKI:
        return new PublicKeyInfo();
      case ATTRIBUTES:
        return [];
      case SIGNATURE_ALGORITHM:
        return new AlgorithmIdentifier();
      case SIGNATURE_VALUE:
        return new asn1js.BitString();
      default:
        throw new Error(`Invalid member name for CertificationRequest class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * CertificationRequest ::= SEQUENCE {
   *    certificationRequestInfo CertificationRequestInfo,
   *    signatureAlgorithm       AlgorithmIdentifier{{ SignatureAlgorithms }},
   *    signature                BIT STRING
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  static schema(parameters: Schema.SchemaParameters<{
    certificationRequestInfo?: CertificationRequestInfoParameters;
    signatureAlgorithm?: string;
    signatureValue?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      value: [
        CertificationRequestInfo(names.certificationRequestInfo || {}),
        new asn1js.Sequence({
          name: (names.signatureAlgorithm || SIGNATURE_ALGORITHM),
          value: [
            new asn1js.ObjectIdentifier(),
            new asn1js.Any({ optional: true })
          ]
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
    pvutils.clearProps(schema, [
      "CertificationRequestInfo",
      "CertificationRequestInfo.version",
      "CertificationRequestInfo.subject",
      "CertificationRequestInfo.subjectPublicKeyInfo",
      "CertificationRequestInfo.attributes",
      SIGNATURE_ALGORITHM,
      SIGNATURE_VALUE
    ]);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      CertificationRequest.schema()
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for CertificationRequest");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.tbs = asn1.result.CertificationRequestInfo.valueBeforeDecode;

    this.version = asn1.result["CertificationRequestInfo.version"].valueBlock.valueDec;
    this.subject = new RelativeDistinguishedNames({ schema: asn1.result["CertificationRequestInfo.subject"] });
    this.subjectPublicKeyInfo = new PublicKeyInfo({ schema: asn1.result["CertificationRequestInfo.subjectPublicKeyInfo"] });
    if ("CertificationRequestInfo.attributes" in asn1.result) {
      this.attributes = Array.from(asn1.result["CertificationRequestInfo.attributes"], element => new Attribute({ schema: element }));
    }

    this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
    this.signatureValue = asn1.result.signatureValue;
    //#endregion
  }

  /**
   * Aux function making ASN1js Sequence from current TBS
   * @returns
   */
  protected encodeTBS(): asn1js.Sequence {
    //#region Create array for output sequence
    const outputArray = [
      new asn1js.Integer({ value: this.version }),
      this.subject.toSchema(),
      this.subjectPublicKeyInfo.toSchema()
    ];

    if (ATTRIBUTES in this) {
      outputArray.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: Array.from(this.attributes || [], element => element.toSchema())
      }));
    }
    //#endregion

    return (new asn1js.Sequence({
      value: outputArray
    }));
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(encodeFlag = false): Schema.SchemaType {
    let tbsSchema;

    if (encodeFlag === false) {
      if (this.tbs.byteLength === 0) { // No stored TBS part
        return CertificationRequest.schema();
      }

      const asn1 = asn1js.fromBER(this.tbs);
      AsnError.assert(asn1, "PKCS#10 Certificate Request");

      tbsSchema = asn1.result;
    } else {
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
   * @returns
   */
  public toJSON(): any {
    const object: any = {
      tbs: pvutils.bufferToHexCodes(this.tbs, 0, this.tbs.byteLength),
      version: this.version,
      subject: this.subject.toJSON(),
      subjectPublicKeyInfo: this.subjectPublicKeyInfo.toJSON(),
      signatureAlgorithm: this.signatureAlgorithm.toJSON(),
      signatureValue: this.signatureValue.toJSON()
    };

    if (ATTRIBUTES in this) {
      object.attributes = Array.from(this.attributes || [], element => element.toJSON());
    }

    return object;
  }

  /**
   * Makes signature for current certification request
   * @param privateKey WebCrypto private key
   * @param hashAlgorithm String representing current hashing algorithm
   */
  async sign(privateKey: CryptoKey, hashAlgorithm = "SHA-1"): Promise<void> {
    //#region Initial checking
    if (!privateKey) {
      throw new Error("Need to provide a private key for signing");
    }
    //#endregion

    const crypto = common.getCrypto(true);

    //#region Get a "default parameters" for current algorithm and set correct signature algorithm
    const signatureParams = await crypto.getSignatureParameters(privateKey, hashAlgorithm);
    const parameters = signatureParams.parameters;
    this.signatureAlgorithm = signatureParams.signatureAlgorithm;
    //#endregion

    //#region Create TBS data for signing
    this.tbs = this.encodeTBS().toBER(false);
    //#endregion

    //#region Signing TBS data on provided private key
    const signature = await crypto.signWithPrivateKey(this.tbs, privateKey, parameters as any);
    this.signatureValue = new asn1js.BitString({ valueHex: signature });
    //#endregion
  }

  /**
   * Verify existing certification request signature
   * @returns
   */
  public async verify(): Promise<boolean> {
    return common.getCrypto(true).verifyWithPublicKey(this.tbs, this.signatureValue, this.subjectPublicKeyInfo, this.signatureAlgorithm);
  }

  /**
   * Importing public key for current certificate request
   */
  public async getPublicKey(parameters?: CryptoEnginePublicKeyParams): Promise<CryptoKey> {
    return common.getCrypto(true).getPublicKey(this.subjectPublicKeyInfo, this.signatureAlgorithm, parameters);
  }

}

