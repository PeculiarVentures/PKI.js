import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import { AlgorithmIdentifier, AlgorithmIdentifierSchema } from "../AlgorithmIdentifier";
import { AttributeCertificateInfoV1, AttributeCertificateInfoV1Schema } from "./AttributeCertificateInfoV1";
import * as Schema from "../Schema";

const ACINFO = "acinfo";
const SIGNATURE_ALGORITHM = "signatureAlgorithm";
const SIGNATURE_VALUE = "signatureValue";
const CLEAR_PROPS = [
  ACINFO,
  SIGNATURE_VALUE,
  SIGNATURE_ALGORITHM
];

export interface AttributeCertificateV1Parameters extends Schema.SchemaConstructor {
  acinfo?: AttributeCertificateInfoV1;
  signatureAlgorithm?: AlgorithmIdentifier;
  signatureValue?: asn1js.BitString;
}

/**
 * Class from X.509:1997
 */
export class AttributeCertificateV1 implements Schema.SchemaCompatible {

  public acinfo: AttributeCertificateInfoV1;
  public signatureAlgorithm: AlgorithmIdentifier;
  public signatureValue: asn1js.BitString;

  /**
   * Constructor for AttributeCertificateV1 class
   * @param parameters
   */
  constructor(parameters: AttributeCertificateV1Parameters = {}) {
    //#region Internal properties of the object
    this.acinfo = getParametersValue(parameters, ACINFO, AttributeCertificateV1.defaultValues(ACINFO));
    this.signatureAlgorithm = getParametersValue(parameters, SIGNATURE_ALGORITHM, AttributeCertificateV1.defaultValues(SIGNATURE_ALGORITHM));
    this.signatureValue = getParametersValue(parameters, SIGNATURE_VALUE, AttributeCertificateV1.defaultValues(SIGNATURE_VALUE));
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
  public static defaultValues(memberName: typeof ACINFO): AttributeCertificateInfoV1;
  public static defaultValues(memberName: typeof SIGNATURE_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof SIGNATURE_VALUE): asn1js.BitString;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case ACINFO:
        return new AttributeCertificateInfoV1();
      case SIGNATURE_ALGORITHM:
        return new AlgorithmIdentifier();
      case SIGNATURE_VALUE:
        return new asn1js.BitString();
      default:
        throw new Error(`Invalid member name for AttributeCertificateV1 class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * AttributeCertificate ::= SEQUENCE {
   *   acinfo               AttributeCertificateInfoV1,
   *   signatureAlgorithm   AlgorithmIdentifier,
   *   signatureValue       BIT STRING
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    acinfo?: AttributeCertificateInfoV1Schema;
    signatureAlgorithm?: AlgorithmIdentifierSchema;
    signatureValue?: string;
  }> = {}): Schema.SchemaType {
    const names = getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        AttributeCertificateInfoV1.schema(names.acinfo || {}),
        AlgorithmIdentifier.schema(names.signatureAlgorithm || {}),
        new asn1js.BitString({ name: (names.signatureValue || "") })
      ]
    }));
  }

  /**
   * Convert parsed asn1js object into current class
   * @param schema
   */
  public fromSchema(schema: Schema.SchemaType): void {
    //#region Clear input data first
    clearProps(schema, CLEAR_PROPS);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      AttributeCertificateV1.schema({
        names: {
          acinfo: {
            names: {
              blockName: ACINFO
            }
          },
          signatureAlgorithm: {
            names: {
              blockName: SIGNATURE_ALGORITHM
            }
          },
          signatureValue: SIGNATURE_VALUE
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for AttributeCertificateV1");
    //#endregion

    //#region Get internal properties from parsed schema
    this.acinfo = new AttributeCertificateInfoV1({ schema: asn1.result.acinfo });
    this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
    this.signatureValue = asn1.result.signatureValue;
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    return (new asn1js.Sequence({
      value: [
        this.acinfo.toSchema(),
        this.signatureAlgorithm.toSchema(),
        this.signatureValue
      ]
    }));
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    return {
      acinfo: this.acinfo.toJSON(),
      signatureAlgorithm: this.signatureAlgorithm.toJSON(),
      signatureValue: this.signatureValue.toJSON()
    };
  }

}
