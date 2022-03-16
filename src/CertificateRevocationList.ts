import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { getEngine } from "./common";
import AlgorithmIdentifier, { AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import RelativeDistinguishedNames, { RelativeDistinguishedNamesSchema } from "./RelativeDistinguishedNames";
import Time, { TimeSchema } from "./Time";
import RevokedCertificate from "./RevokedCertificate";
import Extensions, { ExtensionsSchema } from "./Extensions";
import * as Schema from "./Schema";
import Certificate from "./Certificate";
import PublicKeyInfo from "./PublicKeyInfo";

const TBS = "tbs";
const VERSION = "version";
const SIGNATURE = "signature";
const ISSUER = "issuer";
const THIS_UPDATE = "thisUpdate";
const NEXT_UPDATE = "nextUpdate";
const REVOKED_CERTIFICATES = "revokedCertificates";
const CRL_EXTENSIONS = "crlExtensions";
const SIGNATURE_ALGORITHM = "signatureAlgorithm";
const SIGNATURE_VALUE = "signatureValue";
const CLEAR_PROPS = [
  "tbsCertList",
  "tbsCertList.version",
  "tbsCertList.signature",
  "tbsCertList.issuer",
  "tbsCertList.thisUpdate",
  "tbsCertList.nextUpdate",
  "tbsCertList.revokedCertificates",
  "tbsCertList.extensions",
  SIGNATURE_ALGORITHM,
  SIGNATURE_VALUE
];

export type TBSCertListSchema = Schema.SchemaParameters<{
  tbsCertListVersion?: string;
  signature?: AlgorithmIdentifierSchema;
  issuer?: RelativeDistinguishedNamesSchema;
  tbsCertListThisUpdate?: TimeSchema;
  tbsCertListNextUpdate?: TimeSchema;
  tbsCertListRevokedCertificates?: string;
  crlExtensions?: ExtensionsSchema;
}>;

function tbsCertList(parameters: TBSCertListSchema = {}): Schema.SchemaType {
  //TBSCertList  ::=  SEQUENCE  {
  //    version                 Version OPTIONAL,
  //                                 -- if present, MUST be v2
  //    signature               AlgorithmIdentifier,
  //    issuer                  Name,
  //    thisUpdate              Time,
  //    nextUpdate              Time OPTIONAL,
  //    revokedCertificates     SEQUENCE OF SEQUENCE  {
  //        userCertificate         CertificateSerialNumber,
  //        revocationDate          Time,
  //        crlEntryExtensions      Extensions OPTIONAL
  //        -- if present, version MUST be v2
  //    }  OPTIONAL,
  //    crlExtensions           [0]  EXPLICIT Extensions OPTIONAL
  //    -- if present, version MUST be v2
  //}
  const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

  return (new asn1js.Sequence({
    name: (names.blockName || "tbsCertList"),
    value: [
      new asn1js.Integer({
        optional: true,
        name: (names.tbsCertListVersion || "tbsCertList.version"),
        value: 2
      }), // EXPLICIT integer value (v2)
      AlgorithmIdentifier.schema(names.signature || {
        names: {
          blockName: "tbsCertList.signature"
        }
      }),
      RelativeDistinguishedNames.schema(names.issuer || {
        names: {
          blockName: "tbsCertList.issuer"
        }
      }),
      Time.schema(names.tbsCertListThisUpdate || {
        names: {
          utcTimeName: "tbsCertList.thisUpdate",
          generalTimeName: "tbsCertList.thisUpdate"
        }
      }),
      Time.schema(names.tbsCertListNextUpdate || {
        names: {
          utcTimeName: "tbsCertList.nextUpdate",
          generalTimeName: "tbsCertList.nextUpdate"
        }
      }, true),
      new asn1js.Sequence({
        optional: true,
        value: [
          new asn1js.Repeated({
            name: (names.tbsCertListRevokedCertificates || "tbsCertList.revokedCertificates"),
            value: new asn1js.Sequence({
              value: [
                new asn1js.Integer(),
                Time.schema(),
                Extensions.schema({}, true)
              ]
            })
          })
        ]
      }),
      new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: [Extensions.schema(names.crlExtensions || {
          names: {
            blockName: "tbsCertList.extensions"
          }
        })]
      }) // EXPLICIT SEQUENCE value
    ]
  }));
}

export interface CertificateRevocationListParameters extends Schema.SchemaConstructor {
  tbs?: ArrayBuffer;
  version?: number;
  signature?: AlgorithmIdentifier;
  issuer?: RelativeDistinguishedNames;
  thisUpdate?: Time;
  nextUpdate?: Time;
  revokedCertificates?: RevokedCertificate[];
  crlExtensions?: Extensions;
  signatureAlgorithm?: AlgorithmIdentifier;
  signatureValue?: asn1js.BitString;
}

export interface CertificateRevocationListVerifyParams {
  issuerCertificate?: Certificate;
  publicKeyInfo?: PublicKeyInfo;
}

/**
 * Class from RFC5280
 */
export default class CertificateRevocationList implements Schema.SchemaCompatible {

  public tbs: ArrayBuffer;
  public version: number;
  public signature: AlgorithmIdentifier;
  public issuer: RelativeDistinguishedNames;
  public thisUpdate: Time;
  public nextUpdate?: Time;
  public revokedCertificates?: RevokedCertificate[];
  public crlExtensions?: Extensions;
  public signatureAlgorithm: AlgorithmIdentifier;
  public signatureValue: asn1js.BitString;

  /**
   * Constructor for Attribute class
   * @param parameters
   */
  constructor(parameters: CertificateRevocationListParameters = {}) {
    //#region Internal properties of the object
    this.tbs = pvutils.getParametersValue(parameters, TBS, CertificateRevocationList.defaultValues(TBS));
    this.version = pvutils.getParametersValue(parameters, VERSION, CertificateRevocationList.defaultValues(VERSION));
    this.signature = pvutils.getParametersValue(parameters, SIGNATURE, CertificateRevocationList.defaultValues(SIGNATURE));
    this.issuer = pvutils.getParametersValue(parameters, ISSUER, CertificateRevocationList.defaultValues(ISSUER));
    this.thisUpdate = pvutils.getParametersValue(parameters, THIS_UPDATE, CertificateRevocationList.defaultValues(THIS_UPDATE));
    if (parameters.nextUpdate) {
      this.nextUpdate = pvutils.getParametersValue(parameters, NEXT_UPDATE, CertificateRevocationList.defaultValues(NEXT_UPDATE));
    }
    if (parameters.revokedCertificates) {
      this.revokedCertificates = pvutils.getParametersValue(parameters, REVOKED_CERTIFICATES, CertificateRevocationList.defaultValues(REVOKED_CERTIFICATES));
    }
    if (parameters.crlExtensions) {
      this.crlExtensions = pvutils.getParametersValue(parameters, CRL_EXTENSIONS, CertificateRevocationList.defaultValues(CRL_EXTENSIONS));
    }
    this.signatureAlgorithm = pvutils.getParametersValue(parameters, SIGNATURE_ALGORITHM, CertificateRevocationList.defaultValues(SIGNATURE_ALGORITHM));
    this.signatureValue = pvutils.getParametersValue(parameters, SIGNATURE_VALUE, CertificateRevocationList.defaultValues(SIGNATURE_VALUE));
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
  public static defaultValues(memberName: typeof SIGNATURE): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof ISSUER): RelativeDistinguishedNames;
  public static defaultValues(memberName: typeof THIS_UPDATE): Time;
  public static defaultValues(memberName: typeof NEXT_UPDATE): Time;
  public static defaultValues(memberName: typeof REVOKED_CERTIFICATES): RevokedCertificate[];
  public static defaultValues(memberName: typeof CRL_EXTENSIONS): Extensions;
  public static defaultValues(memberName: typeof SIGNATURE_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof SIGNATURE_VALUE): asn1js.BitString;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case TBS:
        return new ArrayBuffer(0);
      case VERSION:
        return 1;
      case SIGNATURE:
        return new AlgorithmIdentifier();
      case ISSUER:
        return new RelativeDistinguishedNames();
      case THIS_UPDATE:
        return new Time();
      case NEXT_UPDATE:
        return new Time();
      case REVOKED_CERTIFICATES:
        return [];
      case CRL_EXTENSIONS:
        return new Extensions();
      case SIGNATURE_ALGORITHM:
        return new AlgorithmIdentifier();
      case SIGNATURE_VALUE:
        return new asn1js.BitString();
      default:
        throw new Error(`Invalid member name for CertificateRevocationList class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * CertificateList  ::=  SEQUENCE  {
   *    tbsCertList          TBSCertList,
   *    signatureAlgorithm   AlgorithmIdentifier,
   *    signatureValue       BIT STRING  }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    tbsCertListVersion?: string;
    signature?: AlgorithmIdentifierSchema;
    issuer?: RelativeDistinguishedNamesSchema;
    tbsCertListThisUpdate?: TimeSchema;
    tbsCertListNextUpdate?: TimeSchema;
    tbsCertListRevokedCertificates?: string;
    crlExtensions?: ExtensionsSchema;
    signatureAlgorithm?: AlgorithmIdentifierSchema;
    signatureValue?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || "CertificateList"),
      value: [
        tbsCertList(parameters),
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
      CertificateRevocationList.schema()
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for CertificateRevocationList");
    //#endregion

    //#region Get internal properties from parsed schema
    this.tbs = asn1.result.tbsCertList.valueBeforeDecode;

    if ("tbsCertList.version" in asn1.result) {
      this.version = asn1.result["tbsCertList.version"].valueBlock.valueDec;
    }
    this.signature = new AlgorithmIdentifier({ schema: asn1.result["tbsCertList.signature"] });
    this.issuer = new RelativeDistinguishedNames({ schema: asn1.result["tbsCertList.issuer"] });
    this.thisUpdate = new Time({ schema: asn1.result["tbsCertList.thisUpdate"] });
    if ("tbsCertList.nextUpdate" in asn1.result) {
      this.nextUpdate = new Time({ schema: asn1.result["tbsCertList.nextUpdate"] });
    }
    if ("tbsCertList.revokedCertificates" in asn1.result) {
      this.revokedCertificates = Array.from(asn1.result["tbsCertList.revokedCertificates"], element => new RevokedCertificate({ schema: element }));
    }
    if ("tbsCertList.extensions" in asn1.result) {
      this.crlExtensions = new Extensions({ schema: asn1.result["tbsCertList.extensions"] });
    }

    this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
    this.signatureValue = asn1.result.signatureValue;
    //#endregion
  }

  protected encodeTBS() {
    //#region Create array for output sequence
    const outputArray: any[] = [];

    if (this.version !== CertificateRevocationList.defaultValues(VERSION)) {
      outputArray.push(new asn1js.Integer({ value: this.version }));
    }

    outputArray.push(this.signature.toSchema());
    outputArray.push(this.issuer.toSchema());
    outputArray.push(this.thisUpdate.toSchema());

    if (this.nextUpdate) {
      outputArray.push(this.nextUpdate.toSchema());
    }

    if (this.revokedCertificates) {
      outputArray.push(new asn1js.Sequence({
        value: Array.from(this.revokedCertificates, element => element.toSchema())
      }));
    }

    if (this.crlExtensions) {
      outputArray.push(new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: [
          this.crlExtensions.toSchema()
        ]
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
  public toSchema(encodeFlag = false) {
    //#region Decode stored TBS value
    let tbsSchema;

    if (!encodeFlag) {
      if (!this.tbs.byteLength) { // No stored TBS part
        return CertificateRevocationList.schema();
      }

      tbsSchema = asn1js.fromBER(this.tbs).result;
    }
    //#endregion
    //#region Create TBS schema via assembling from TBS parts
    else {
      tbsSchema = this.encodeTBS();
    }
    //#endregion

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
      signature: this.signature.toJSON(),
      issuer: this.issuer.toJSON(),
      thisUpdate: this.thisUpdate.toJSON(),
      signatureAlgorithm: this.signatureAlgorithm.toJSON(),
      signatureValue: this.signatureValue.toJSON()
    };

    if (this.version !== CertificateRevocationList.defaultValues(VERSION))
      object.version = this.version;

    if (this.nextUpdate) {
      object.nextUpdate = this.nextUpdate.toJSON();
    }

    if (this.revokedCertificates) {
      object.revokedCertificates = Array.from(this.revokedCertificates, element => element.toJSON());
    }

    if (this.crlExtensions) {
      object.crlExtensions = this.crlExtensions.toJSON();
    }

    return object;
  }

  public isCertificateRevoked(certificate: Certificate) {
    //#region Check that issuer of the input certificate is the same with issuer of this CRL
    if (!this.issuer.isEqual(certificate.issuer)) {
      return false;
    }
    //#endregion

    //#region Check that there are revoked certificates in this CRL
    if (!this.revokedCertificates) {
      return false;
    }
    //#endregion

    //#region Search for input certificate in revoked certificates array
    for (const revokedCertificate of this.revokedCertificates) {
      if (revokedCertificate.userCertificate.isEqual(certificate.serialNumber)) {
        return true;
      }
    }
    //#endregion

    return false;
  }

  /**
   * Make a signature for existing CRL data
   * @param privateKey Private key for "subjectPublicKeyInfo" structure
   * @param hashAlgorithm Hashing algorithm. Default SHA-1
   */
  public async sign(privateKey: CryptoKey, hashAlgorithm = "SHA-1"): Promise<void> {
    //#region Initial checking
    //#region Get a private key from function parameter
    if (!privateKey) {
      throw new Error("Need to provide a private key for signing");
    }
    //#endregion
    //#endregion

    //#region Initial variables
    const engine = getEngine();
    //#endregion

    //#region Get a "default parameters" for current algorithm and set correct signature algorithm
    const signatureParameters = await engine.subtle.getSignatureParameters(privateKey, hashAlgorithm);
    const { parameters } = signatureParameters;
    this.signature = signatureParameters.signatureAlgorithm;
    this.signatureAlgorithm = signatureParameters.signatureAlgorithm;
    //#endregion

    //#region Create TBS data for signing
    this.tbs = this.encodeTBS().toBER(false);
    //#endregion

    //#region Signing TBS data on provided private key
    const signature = await engine.subtle.signWithPrivateKey(this.tbs, privateKey, parameters as any);
    this.signatureValue = new asn1js.BitString({ valueHex: signature });
    //#endregion
  }

  /**
   * Verify existing signature
   * @param parameters
   */
  public async verify(parameters: CertificateRevocationListVerifyParams = {}): Promise<boolean> {
    //#region Global variables
    let subjectPublicKeyInfo: PublicKeyInfo | undefined;

    const engine = getEngine();
    //#endregion

    //#region Get information about CRL issuer certificate
    if (parameters.issuerCertificate) { // "issuerCertificate" must be of type "Certificate"
      subjectPublicKeyInfo = parameters.issuerCertificate.subjectPublicKeyInfo;

      // The CRL issuer name and "issuerCertificate" subject name are not equal
      if (!this.issuer.isEqual(parameters.issuerCertificate.subject)) {
        return false;
      }
    }

    //#region In case if there is only public key during verification
    if (parameters.publicKeyInfo) {
      subjectPublicKeyInfo = parameters.publicKeyInfo; // Must be of type "PublicKeyInfo"
    }
    //#endregion

    if (!subjectPublicKeyInfo) {
      throw new Error("Issuer's certificate must be provided as an input parameter");
    }
    //#endregion

    //#region Check the CRL for unknown critical extensions
    if (this.crlExtensions) {
      for (const extension of this.crlExtensions.extensions) {
        if (extension.critical) {
          // We can not be sure that unknown extension has no value for CRL signature
          if (!extension.parsedValue)
            return false;
        }
      }
    }
    //#endregion

    return engine.subtle.verifyWithPublicKey(this.tbs, this.signatureValue, subjectPublicKeyInfo, this.signatureAlgorithm);
  }

}
