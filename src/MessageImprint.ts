import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import AlgorithmIdentifier, { AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import * as Schema from "./Schema";

export const HASH_ALGORITHM = "hashAlgorithm";
export const HASHED_MESSAGE = "hashedMessage";
const CLEAR_PROPS = [
  HASH_ALGORITHM,
  HASHED_MESSAGE,
];

export interface MessageImprintParameters extends Schema.SchemaConstructor {
  hashAlgorithm?: AlgorithmIdentifier;
  hashedMessage?: asn1js.OctetString;
}

export type MessageImprintSchema = Schema.SchemaParameters<{
  hashAlgorithm?: AlgorithmIdentifierSchema;
  hashedMessage?: string;
}>;

/**
 * Class from RFC3161
 */
export default class MessageImprint implements Schema.SchemaCompatible {

  public hashAlgorithm: AlgorithmIdentifier;
  public hashedMessage: asn1js.OctetString;

  /**
   * Constructor for MessageImprint class
   * @param parameters
   */
  constructor(parameters: MessageImprintParameters = {}) {
    //#region Internal properties of the object
    this.hashAlgorithm = pvutils.getParametersValue(parameters, HASH_ALGORITHM, MessageImprint.defaultValues(HASH_ALGORITHM));
    this.hashedMessage = pvutils.getParametersValue(parameters, HASHED_MESSAGE, MessageImprint.defaultValues(HASHED_MESSAGE));
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
  public static defaultValues(memberName: typeof HASHED_MESSAGE): asn1js.OctetString;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case HASH_ALGORITHM:
        return new AlgorithmIdentifier();
      case HASHED_MESSAGE:
        return new asn1js.OctetString();
      default:
        throw new Error(`Invalid member name for MessageImprint class: ${memberName}`);
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
      case HASHED_MESSAGE:
        return (memberValue.isEqual(MessageImprint.defaultValues(memberName)) === 0);
      default:
        throw new Error(`Invalid member name for MessageImprint class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * MessageImprint ::= SEQUENCE  {
   *    hashAlgorithm                AlgorithmIdentifier,
   *    hashedMessage                OCTET STRING  }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: MessageImprintSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        AlgorithmIdentifier.schema(names.hashAlgorithm || {}),
        new asn1js.OctetString({ name: (names.hashedMessage || "") })
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
      MessageImprint.schema({
        names: {
          hashAlgorithm: {
            names: {
              blockName: HASH_ALGORITHM
            }
          },
          hashedMessage: HASHED_MESSAGE
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for MessageImprint");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.hashAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.hashAlgorithm });
    this.hashedMessage = asn1.result.hashedMessage;
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: [
        this.hashAlgorithm.toSchema(),
        this.hashedMessage
      ]
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    return {
      hashAlgorithm: this.hashAlgorithm.toJSON(),
      hashedMessage: this.hashedMessage.toJSON()
    };
  }

}

