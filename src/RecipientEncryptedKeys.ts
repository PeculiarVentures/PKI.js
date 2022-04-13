import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { RecipientEncryptedKey } from "./RecipientEncryptedKey";
import * as Schema from "./Schema";

const ENCRYPTED_KEYS = "encryptedKeys";
const RECIPIENT_ENCRYPTED_KEYS = "RecipientEncryptedKeys";
const CLEAR_PROPS = [
  RECIPIENT_ENCRYPTED_KEYS,
];

export interface RecipientEncryptedKeysParameters extends Schema.SchemaConstructor {
  encryptedKeys?: RecipientEncryptedKey[];
}

export type RecipientEncryptedKeysSchema = Schema.SchemaParameters<{
  RecipientEncryptedKeys?: string;
}>;

/**
 * Class from RFC5652
 */
export class RecipientEncryptedKeys implements Schema.SchemaCompatible {

  public encryptedKeys: RecipientEncryptedKey[];

  /**
   * Constructor for RecipientEncryptedKeys class
   * @param parameters
   */
  constructor(parameters: RecipientEncryptedKeysParameters = {}) {
    //#region Internal properties of the object
    this.encryptedKeys = pvutils.getParametersValue(parameters, ENCRYPTED_KEYS, RecipientEncryptedKeys.defaultValues(ENCRYPTED_KEYS));
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
  public static defaultValues(memberName: typeof ENCRYPTED_KEYS): RecipientEncryptedKey[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case ENCRYPTED_KEYS:
        return [];
      default:
        throw new Error(`Invalid member name for RecipientEncryptedKeys class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case ENCRYPTED_KEYS:
        return (memberValue.length === 0);
      default:
        throw new Error(`Invalid member name for RecipientEncryptedKeys class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * RecipientEncryptedKeys ::= SEQUENCE OF RecipientEncryptedKey
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: RecipientEncryptedKeysSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Repeated({
          name: (names.RecipientEncryptedKeys || ""),
          value: RecipientEncryptedKey.schema()
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
      RecipientEncryptedKeys.schema({
        names: {
          RecipientEncryptedKeys: RECIPIENT_ENCRYPTED_KEYS
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for RecipientEncryptedKeys");
    //#endregion

    //#region Get internal properties from parsed schema
    this.encryptedKeys = Array.from(asn1.result.RecipientEncryptedKeys, element => new RecipientEncryptedKey({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: Array.from(this.encryptedKeys, element => element.toSchema())
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    return {
      encryptedKeys: Array.from(this.encryptedKeys, element => element.toJSON())
    };
  }

}
