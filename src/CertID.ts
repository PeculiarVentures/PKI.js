import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as common from "./common";
import AlgorithmIdentifier, { AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import Certificate from "./Certificate";
import * as Schema from "./Schema";
import { ParameterError } from "./errors";

const HASH_ALGORITHM = "hashAlgorithm";
const ISSUER_NAME_HASH = "issuerNameHash";
const ISSUER_KEY_HASH = "issuerKeyHash";
const SERIAL_NUMBER = "serialNumber";
const CLEAR_PROPS = [
  HASH_ALGORITHM,
  ISSUER_NAME_HASH,
  ISSUER_KEY_HASH,
  SERIAL_NUMBER,
];

export interface CertIDParameters extends Schema.SchemaConstructor {
  hashAlgorithm?: AlgorithmIdentifier;
  issuerNameHash?: asn1js.OctetString;
  issuerKeyHash?: asn1js.OctetString;
  serialNumber?: asn1js.Integer;
}

export type CertIDSchema = Schema.SchemaParameters<{
  hashAlgorithm?: string;
  hashAlgorithmObject?: AlgorithmIdentifierSchema;
  issuerNameHash?: string;
  issuerKeyHash?: string;
  serialNumber?: string;
}>;

export interface CertIDCreateParams {
  issuerCertificate: Certificate;
  hashAlgorithm: string;
}

/**
 * Class from RFC6960
 */
export default class CertID implements Schema.SchemaCompatible {

  public hashAlgorithm: AlgorithmIdentifier;
  public issuerNameHash: asn1js.OctetString;
  public issuerKeyHash: asn1js.OctetString;
  public serialNumber: asn1js.Integer;

  /**
   * Constructor for CertID class
   * @param parameters
   */
  constructor(parameters: CertIDParameters = {}) {
    //#region Internal properties of the object
    this.hashAlgorithm = pvutils.getParametersValue(parameters, HASH_ALGORITHM, CertID.defaultValues(HASH_ALGORITHM));
    this.issuerNameHash = pvutils.getParametersValue(parameters, ISSUER_NAME_HASH, CertID.defaultValues(ISSUER_NAME_HASH));
    this.issuerKeyHash = pvutils.getParametersValue(parameters, ISSUER_KEY_HASH, CertID.defaultValues(ISSUER_KEY_HASH));
    this.serialNumber = pvutils.getParametersValue(parameters, SERIAL_NUMBER, CertID.defaultValues(SERIAL_NUMBER));
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
  public static defaultValues(memberName: typeof HASH_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof ISSUER_NAME_HASH): asn1js.OctetString;
  public static defaultValues(memberName: typeof ISSUER_KEY_HASH): asn1js.OctetString;
  public static defaultValues(memberName: typeof SERIAL_NUMBER): asn1js.Integer;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case HASH_ALGORITHM:
        return new AlgorithmIdentifier();
      case ISSUER_NAME_HASH:
      case ISSUER_KEY_HASH:
        return new asn1js.OctetString();
      case SERIAL_NUMBER:
        return new asn1js.Integer();
      default:
        throw new Error(`Invalid member name for CertID class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case HASH_ALGORITHM:
        return ((memberValue.algorithmId === "") && (("algorithmParams" in memberValue) === false));
      case ISSUER_NAME_HASH:
      case ISSUER_KEY_HASH:
      case SERIAL_NUMBER:
        return (memberValue.isEqual(CertID.defaultValues(SERIAL_NUMBER)));
      default:
        throw new Error(`Invalid member name for CertID class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * CertID          ::=     SEQUENCE {
   *    hashAlgorithm       AlgorithmIdentifier,
   *    issuerNameHash      OCTET STRING, -- Hash of issuer's DN
   *    issuerKeyHash       OCTET STRING, -- Hash of issuer's public key
   *    serialNumber        CertificateSerialNumber }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: CertIDSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        AlgorithmIdentifier.schema(names.hashAlgorithmObject || {
          names: {
            blockName: (names.hashAlgorithm || "")
          }
        }),
        new asn1js.OctetString({ name: (names.issuerNameHash || "") }),
        new asn1js.OctetString({ name: (names.issuerKeyHash || "") }),
        new asn1js.Integer({ name: (names.serialNumber || "") })
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
      CertID.schema({
        names: {
          hashAlgorithm: HASH_ALGORITHM,
          issuerNameHash: ISSUER_NAME_HASH,
          issuerKeyHash: ISSUER_KEY_HASH,
          serialNumber: SERIAL_NUMBER
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for CertID");
    //#endregion

    //#region Get internal properties from parsed schema
    this.hashAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.hashAlgorithm });
    this.issuerNameHash = asn1.result.issuerNameHash;
    this.issuerKeyHash = asn1.result.issuerKeyHash;
    this.serialNumber = asn1.result.serialNumber;
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): Schema.SchemaType {
    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: [
        this.hashAlgorithm.toSchema(),
        this.issuerNameHash,
        this.issuerKeyHash,
        this.serialNumber
      ]
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    return {
      hashAlgorithm: this.hashAlgorithm.toJSON(),
      issuerNameHash: this.issuerNameHash.toJSON(),
      issuerKeyHash: this.issuerKeyHash.toJSON(),
      serialNumber: this.serialNumber.toJSON()
    };
  }

  /**
   * Check that two "CertIDs" are equal
   * @param certificateID Identifier of the certificate to be checked
   */
  public isEqual(certificateID: CertID): boolean {
    // Check HASH_ALGORITHM
    if (this.hashAlgorithm.algorithmId !== certificateID.hashAlgorithm.algorithmId) {
      return false;
    }

    // Check ISSUER_NAME_HASH
    if (!pvutils.isEqualBuffer(this.issuerNameHash.valueBlock.valueHex, certificateID.issuerNameHash.valueBlock.valueHex)) {
      return false;
    }

    // Check ISSUER_KEY_HASH
    if (!pvutils.isEqualBuffer(this.issuerKeyHash.valueBlock.valueHex, certificateID.issuerKeyHash.valueBlock.valueHex)) {
      return false;
    }

    // Check SERIAL_NUMBER
    if (!this.serialNumber.isEqual(certificateID.serialNumber)) {
      return false;
    }

    return true;
  }

  /**
   * Making OCSP certificate identifier for specific certificate
   * @param {Certificate} certificate Certificate making OCSP Request for
   * @param {Object} parameters Additional parameters
   * @returns {Promise}
   */
  public async createForCertificate(certificate: Certificate, parameters: CertIDCreateParams): Promise<void> {
    //#region Check input parameters
    ParameterError.assert(parameters, HASH_ALGORITHM, "issuerCertificate");

    const crypto = common.getCrypto(true);
    const hashOID = common.getOIDByAlgorithm({ name: parameters.hashAlgorithm });
    if (hashOID === "") {
      throw new Error(`Incorrect 'hashAlgorithm': ${this.hashAlgorithm}`);
    }

    this.hashAlgorithm = new AlgorithmIdentifier({
      algorithmId: hashOID,
      algorithmParams: new asn1js.Null()
    });
    const issuerCertificate = parameters.issuerCertificate;
    //#endregion

    // Initialize SERIAL_NUMBER field
    this.serialNumber = certificate.serialNumber;

    // Create ISSUER_NAME_HASH
    const hashIssuerName = await crypto.digest({ name: parameters.hashAlgorithm }, issuerCertificate.subject.toSchema().toBER(false));
    this.issuerNameHash = new asn1js.OctetString({ valueHex: hashIssuerName });

    // Create ISSUER_KEY_HASH
    const issuerKeyBuffer = issuerCertificate.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex;
    const hashIssuerKey = await crypto.digest({ name: parameters.hashAlgorithm }, issuerKeyBuffer);
    this.issuerKeyHash = new asn1js.OctetString({ valueHex: hashIssuerKey });
  }

}
