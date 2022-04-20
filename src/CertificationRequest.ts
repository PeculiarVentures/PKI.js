import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as common from "./common";
import { PublicKeyInfo, PublicKeyInfoJson } from "./PublicKeyInfo";
import { RelativeDistinguishedNames, RelativeDistinguishedNamesJson, RelativeDistinguishedNamesSchema } from "./RelativeDistinguishedNames";
import { AlgorithmIdentifier, AlgorithmIdentifierJson } from "./AlgorithmIdentifier";
import { Attribute, AttributeJson, AttributeSchema } from "./Attribute";
import * as Schema from "./Schema";
import { CryptoEnginePublicKeyParams } from "./CryptoEngine/CryptoEngineInterface";
import { AsnError } from "./errors";
import { PkiObject, PkiObjectParameters } from "./PkiObject";

const TBS = "tbs";
const VERSION = "version";
const SUBJECT = "subject";
const SPKI = "subjectPublicKeyInfo";
const ATTRIBUTES = "attributes";
const SIGNATURE_ALGORITHM = "signatureAlgorithm";
const SIGNATURE_VALUE = "signatureValue";
const CSR_INFO = "CertificationRequestInfo";
const CSR_INFO_VERSION = `${CSR_INFO}.version`;
const CSR_INFO_SUBJECT = `${CSR_INFO}.subject`;
const CSR_INFO_SPKI = `${CSR_INFO}.subjectPublicKeyInfo`;
const CSR_INFO_ATTRS = `${CSR_INFO}.attributes`;
const CLEAR_PROPS = [
  CSR_INFO,
  CSR_INFO_VERSION,
  CSR_INFO_SUBJECT,
  CSR_INFO_SPKI,
  CSR_INFO_ATTRS,
  SIGNATURE_ALGORITHM,
  SIGNATURE_VALUE
];

export interface ICertificationRequest {
  tbs: ArrayBuffer;
  version: number;
  subject: RelativeDistinguishedNames;
  subjectPublicKeyInfo: PublicKeyInfo;
  attributes?: Attribute[];
  signatureAlgorithm: AlgorithmIdentifier;
  signatureValue: asn1js.BitString;
}

export interface CertificationRequestJson {
  tbs: string;
  version: number;
  subject: RelativeDistinguishedNamesJson;
  subjectPublicKeyInfo: PublicKeyInfoJson | JsonWebKey;
  attributes?: AttributeJson[];
  signatureAlgorithm: AlgorithmIdentifierJson;
  signatureValue: Schema.AsnBitStringJson;
}

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
    name: (names.CertificationRequestInfo || CSR_INFO),
    value: [
      new asn1js.Integer({ name: (names.CertificationRequestInfoVersion || CSR_INFO_VERSION) }),
      RelativeDistinguishedNames.schema(names.subject || {
        names: {
          blockName: CSR_INFO_SUBJECT
        }
      }),
      PublicKeyInfo.schema({
        names: {
          blockName: CSR_INFO_SPKI
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
            name: (names.CertificationRequestInfoAttributes || CSR_INFO_ATTRS),
            value: Attribute.schema(names.attributes || {})
          })
        ]
      })
    ]
  }));
}

export type CertificationRequestParameters = PkiObjectParameters & Partial<ICertificationRequest>;

/**
 * Represents the CertificationRequest structure described in [RFC2986](https://datatracker.ietf.org/doc/html/rfc2986)
 */
export class CertificationRequest extends PkiObject implements ICertificationRequest {

  public static override CLASS_NAME = "CertificationRequest";

  public tbs!: ArrayBuffer;
  public version!: number;
  public subject!: RelativeDistinguishedNames;
  public subjectPublicKeyInfo!: PublicKeyInfo;
  public attributes?: Attribute[];
  public signatureAlgorithm!: AlgorithmIdentifier;
  public signatureValue!: asn1js.BitString;

  /**
   * Initializes a new instance of the {@link CertificationRequest} class
   * @param parameters Initialization parameters
   */
  constructor(parameters: CertificationRequestParameters = {}) {
    super();

    this.tbs = pvutils.getParametersValue(parameters, TBS, CertificationRequest.defaultValues(TBS));
    this.version = pvutils.getParametersValue(parameters, VERSION, CertificationRequest.defaultValues(VERSION));
    this.subject = pvutils.getParametersValue(parameters, SUBJECT, CertificationRequest.defaultValues(SUBJECT));
    this.subjectPublicKeyInfo = pvutils.getParametersValue(parameters, SPKI, CertificationRequest.defaultValues(SPKI));
    if (ATTRIBUTES in parameters) {
      this.attributes = pvutils.getParametersValue(parameters, ATTRIBUTES, CertificationRequest.defaultValues(ATTRIBUTES));
    }
    this.signatureAlgorithm = pvutils.getParametersValue(parameters, SIGNATURE_ALGORITHM, CertificationRequest.defaultValues(SIGNATURE_ALGORITHM));
    this.signatureValue = pvutils.getParametersValue(parameters, SIGNATURE_VALUE, CertificationRequest.defaultValues(SIGNATURE_VALUE));

    if (parameters.schema) {
      this.fromSchema(parameters.schema);
    }
  }

  /**
   * Returns default values for all class members
   * @param memberName String name for a class member
   * @returns Default value
   */
  public static override defaultValues(memberName: typeof TBS): ArrayBuffer;
  public static override defaultValues(memberName: typeof VERSION): number;
  public static override defaultValues(memberName: typeof SUBJECT): RelativeDistinguishedNames;
  public static override defaultValues(memberName: typeof SPKI): PublicKeyInfo;
  public static override defaultValues(memberName: typeof ATTRIBUTES): Attribute[];
  public static override defaultValues(memberName: typeof SIGNATURE_ALGORITHM): AlgorithmIdentifier;
  public static override defaultValues(memberName: typeof SIGNATURE_VALUE): asn1js.BitString;
  public static override defaultValues(memberName: string): any {
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
        return super.defaultValues(memberName);
    }
  }

  /**
   * Returns value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn
   * CertificationRequest ::= SEQUENCE {
   *    certificationRequestInfo CertificationRequestInfo,
   *    signatureAlgorithm       AlgorithmIdentifier{{ SignatureAlgorithms }},
   *    signature                BIT STRING
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns ASN.1 schema object
   */
  static override schema(parameters: Schema.SchemaParameters<{
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

  public fromSchema(schema: Schema.SchemaType): void {
    // Clear input data first
    pvutils.clearProps(schema, CLEAR_PROPS);

    // Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      CertificationRequest.schema()
    );
    AsnError.assertSchema(asn1, this.className);

    // Get internal properties from parsed schema
    this.tbs = asn1.result.CertificationRequestInfo.valueBeforeDecode;
    this.version = asn1.result[CSR_INFO_VERSION].valueBlock.valueDec;
    this.subject = new RelativeDistinguishedNames({ schema: asn1.result[CSR_INFO_SUBJECT] });
    this.subjectPublicKeyInfo = new PublicKeyInfo({ schema: asn1.result[CSR_INFO_SPKI] });
    if (CSR_INFO_ATTRS in asn1.result) {
      this.attributes = Array.from(asn1.result[CSR_INFO_ATTRS], element => new Attribute({ schema: element }));
    }
    this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
    this.signatureValue = asn1.result.signatureValue;
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
        value: Array.from(this.attributes || [], o => o.toSchema())
      }));
    }
    //#endregion

    return (new asn1js.Sequence({
      value: outputArray
    }));
  }

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

  public toJSON(): CertificationRequestJson {
    const object: CertificationRequestJson = {
      tbs: pvutils.bufferToHexCodes(this.tbs, 0, this.tbs.byteLength),
      version: this.version,
      subject: this.subject.toJSON(),
      subjectPublicKeyInfo: this.subjectPublicKeyInfo.toJSON(),
      signatureAlgorithm: this.signatureAlgorithm.toJSON(),
      signatureValue: this.signatureValue.toJSON() as Schema.AsnBitStringJson,
    };

    if (ATTRIBUTES in this) {
      object.attributes = Array.from(this.attributes || [], o => o.toJSON());
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
   * @returns Returns `true` if signature value is valid, otherwise `false`
   */
  public async verify(): Promise<boolean> {
    return common.getCrypto(true).verifyWithPublicKey(this.tbs, this.signatureValue, this.subjectPublicKeyInfo, this.signatureAlgorithm);
  }

  /**
   * Importing public key for current certificate request
   * @param parameters
   * @returns WebCrypt public key
   */
  public async getPublicKey(parameters?: CryptoEnginePublicKeyParams): Promise<CryptoKey> {
    return common.getCrypto(true).getPublicKey(this.subjectPublicKeyInfo, this.signatureAlgorithm, parameters);
  }

}

