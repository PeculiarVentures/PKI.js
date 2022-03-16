import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import AlgorithmIdentifier, { AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import * as Schema from "./Schema";

const ALGORITHM = "algorithm";
const PUBLIC_KEY = "publicKey";
const CLEAR_PROPS = [
  ALGORITHM,
  PUBLIC_KEY
];

export interface OriginatorPublicKeyParameters extends Schema.SchemaConstructor {
  algorithm?: AlgorithmIdentifier;
  publicKey?: asn1js.BitString;
}

/**
 * Class from RFC5652
 */
export default class OriginatorPublicKey implements Schema.SchemaCompatible {

  public algorithm: AlgorithmIdentifier;
  public publicKey: asn1js.BitString;

  /**
   * Constructor for OriginatorPublicKey class
   * @param parameters
   */
  constructor(parameters: OriginatorPublicKeyParameters = {}) {
    //#region Internal properties of the object
    this.algorithm = pvutils.getParametersValue(parameters, ALGORITHM, OriginatorPublicKey.defaultValues(ALGORITHM));
    this.publicKey = pvutils.getParametersValue(parameters, PUBLIC_KEY, OriginatorPublicKey.defaultValues(PUBLIC_KEY));
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
  public static defaultValues(memberName: typeof ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof PUBLIC_KEY): asn1js.BitString;
  public static defaultValues(memberName: string): any;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case ALGORITHM:
        return new AlgorithmIdentifier();
      case PUBLIC_KEY:
        return new asn1js.BitString();
      default:
        throw new Error(`Invalid member name for OriginatorPublicKey class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault<T extends { isEqual(data: any): boolean; }>(memberName: string, memberValue: T): memberValue is T {
    switch (memberName) {
      case ALGORITHM:
      case PUBLIC_KEY:
        return (memberValue.isEqual(OriginatorPublicKey.defaultValues(memberName)));
      default:
        throw new Error(`Invalid member name for OriginatorPublicKey class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * OriginatorPublicKey ::= SEQUENCE {
   *    algorithm AlgorithmIdentifier,
   *    publicKey BIT STRING }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  static schema(parameters: Schema.SchemaParameters<{
    algorithm?: AlgorithmIdentifierSchema;
    publicKey?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        AlgorithmIdentifier.schema(names.algorithm || {}),
        new asn1js.BitString({ name: (names.publicKey || "") })
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
      OriginatorPublicKey.schema({
        names: {
          algorithm: {
            names: {
              blockName: ALGORITHM
            }
          },
          publicKey: PUBLIC_KEY
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for OriginatorPublicKey");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.algorithm = new AlgorithmIdentifier({ schema: asn1.result.algorithm });
    this.publicKey = asn1.result.publicKey;
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
        this.algorithm.toSchema(),
        this.publicKey
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
      algorithm: this.algorithm.toJSON(),
      publicKey: this.publicKey.toJSON()
    };
  }

}
