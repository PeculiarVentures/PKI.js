import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as common from "./common";
import { AlgorithmIdentifier, AlgorithmIdentifierJson, AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import { Certificate } from "./Certificate";
import * as Schema from "./Schema";
import { AsnError, ParameterError } from "./errors";
import { PkiObject, PkiObjectParameters } from "./PkiObject";

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

export interface ICertID {
  hashAlgorithm: AlgorithmIdentifier;
  issuerNameHash: asn1js.OctetString;
  issuerKeyHash: asn1js.OctetString;
  serialNumber: asn1js.Integer;
}

export type CertIDParameters = PkiObjectParameters & Partial<ICertID>;

export type CertIDSchema = Schema.SchemaParameters<{
  hashAlgorithm?: string;
  hashAlgorithmObject?: AlgorithmIdentifierSchema;
  issuerNameHash?: string;
  issuerKeyHash?: string;
  serialNumber?: string;
}>;

export interface CertIDJson {
  hashAlgorithm: AlgorithmIdentifierJson;
  issuerNameHash: Schema.AsnOctetStringJson;
  issuerKeyHash: Schema.AsnOctetStringJson;
  serialNumber: Schema.AsnIntegerJson;
}

export interface CertIDCreateParams {
  issuerCertificate: Certificate;
  hashAlgorithm: string;
}

/**
 * Represents an CertID described in [RFC6960](https://datatracker.ietf.org/doc/html/rfc6960)
 */
export class CertID extends PkiObject implements ICertID {

  public static override CLASS_NAME = "CertID";

  public hashAlgorithm!: AlgorithmIdentifier;
  public issuerNameHash!: asn1js.OctetString;
  public issuerKeyHash!: asn1js.OctetString;
  public serialNumber!: asn1js.Integer;

  /**
   * Initializes a new instance of the {@link CertID} class
   * @param parameters Initialization parameters
   */
  constructor(parameters: CertIDParameters = {}) {
    super();

    this.hashAlgorithm = pvutils.getParametersValue(parameters, HASH_ALGORITHM, CertID.defaultValues(HASH_ALGORITHM));
    this.issuerNameHash = pvutils.getParametersValue(parameters, ISSUER_NAME_HASH, CertID.defaultValues(ISSUER_NAME_HASH));
    this.issuerKeyHash = pvutils.getParametersValue(parameters, ISSUER_KEY_HASH, CertID.defaultValues(ISSUER_KEY_HASH));
    this.serialNumber = pvutils.getParametersValue(parameters, SERIAL_NUMBER, CertID.defaultValues(SERIAL_NUMBER));

    if (parameters.schema) {
      this.fromSchema(parameters.schema);
    }
  }

  /**
   * Returns default values for all class members
   * @param memberName String name for a class member
   * @returns Default value
   */
  public static override defaultValues(memberName: typeof HASH_ALGORITHM): AlgorithmIdentifier;
  public static override defaultValues(memberName: typeof ISSUER_NAME_HASH): asn1js.OctetString;
  public static override defaultValues(memberName: typeof ISSUER_KEY_HASH): asn1js.OctetString;
  public static override defaultValues(memberName: typeof SERIAL_NUMBER): asn1js.Integer;
  public static override defaultValues(memberName: string): any {
    switch (memberName) {
      case HASH_ALGORITHM:
        return new AlgorithmIdentifier();
      case ISSUER_NAME_HASH:
      case ISSUER_KEY_HASH:
        return new asn1js.OctetString();
      case SERIAL_NUMBER:
        return new asn1js.Integer();
      default:
        return super.defaultValues(memberName);
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
        return super.defaultValues(memberName);
    }
  }

  /**
   * @inheritdoc
   * @asn ASN.1 schema
   * ```asn
   * CertID ::= SEQUENCE {
   *    hashAlgorithm       AlgorithmIdentifier,
   *    issuerNameHash      OCTET STRING, -- Hash of issuer's DN
   *    issuerKeyHash       OCTET STRING, -- Hash of issuer's public key
   *    serialNumber        CertificateSerialNumber }
   *```
   */
  public static override schema(parameters: CertIDSchema = {}): Schema.SchemaType {
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

  public fromSchema(schema: Schema.SchemaType): void {
    // Clear input data first
    pvutils.clearProps(schema, CLEAR_PROPS);

    // Check the schema is valid
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
    AsnError.assertSchema(asn1, this.className);

    // Get internal properties from parsed schema
    this.hashAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.hashAlgorithm });
    this.issuerNameHash = asn1.result.issuerNameHash;
    this.issuerKeyHash = asn1.result.issuerKeyHash;
    this.serialNumber = asn1.result.serialNumber;
  }

  public toSchema(): asn1js.Sequence {
    return (new asn1js.Sequence({
      value: [
        this.hashAlgorithm.toSchema(),
        this.issuerNameHash,
        this.issuerKeyHash,
        this.serialNumber
      ]
    }));
  }

  public toJSON(): CertIDJson {
    return {
      hashAlgorithm: this.hashAlgorithm.toJSON(),
      issuerNameHash: this.issuerNameHash.toJSON() as Schema.AsnOctetStringJson,
      issuerKeyHash: this.issuerKeyHash.toJSON() as Schema.AsnOctetStringJson,
      serialNumber: this.serialNumber.toJSON() as Schema.AsnIntegerJson,
    };
  }

  /**
   * Checks that two "CertIDs" are equal
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
   * @param certificate Certificate making OCSP Request for
   * @param parameters Additional parameters
   */
  public async createForCertificate(certificate: Certificate, parameters: CertIDCreateParams): Promise<void> {
    //#region Check input parameters
    ParameterError.assert(parameters, HASH_ALGORITHM, "issuerCertificate");

    const crypto = common.getCrypto(true);
    const hashOID = common.getOIDByAlgorithm({ name: parameters.hashAlgorithm }, true, "hashAlgorithm");

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
