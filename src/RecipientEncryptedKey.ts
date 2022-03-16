import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import KeyAgreeRecipientIdentifier, { KeyAgreeRecipientIdentifierSchema } from "./KeyAgreeRecipientIdentifier";
import * as Schema from "./Schema";

const RID = "rid";
const ENCRYPTED_KEY = "encryptedKey";
const CLEAR_PROPS = [
  RID,
  ENCRYPTED_KEY,
];

export interface RecipientEncryptedKeyParameters extends Schema.SchemaConstructor {
  rid?: KeyAgreeRecipientIdentifier;
  encryptedKey?: asn1js.OctetString;
}

/**
 * Class from RFC5652
 */
export default class RecipientEncryptedKey implements Schema.SchemaCompatible {

  public rid: KeyAgreeRecipientIdentifier;
  public encryptedKey: asn1js.OctetString;

  /**
   * Constructor for RecipientEncryptedKey class
   * @param parameters
   */
  constructor(parameters: RecipientEncryptedKeyParameters = {}) {
    //#region Internal properties of the object
    this.rid = pvutils.getParametersValue(parameters, RID, RecipientEncryptedKey.defaultValues(RID));
    this.encryptedKey = pvutils.getParametersValue(parameters, ENCRYPTED_KEY, RecipientEncryptedKey.defaultValues(ENCRYPTED_KEY));
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
  public static defaultValues(memberName: typeof RID): KeyAgreeRecipientIdentifier;
  public static defaultValues(memberName: typeof ENCRYPTED_KEY): asn1js.OctetString;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case RID:
        return new KeyAgreeRecipientIdentifier();
      case ENCRYPTED_KEY:
        return new asn1js.OctetString();
      default:
        throw new Error(`Invalid member name for RecipientEncryptedKey class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case RID:
        return ((memberValue.variant === (-1)) && (("value" in memberValue) === false));
      case ENCRYPTED_KEY:
        return (memberValue.isEqual(RecipientEncryptedKey.defaultValues(ENCRYPTED_KEY)));
      default:
        throw new Error(`Invalid member name for RecipientEncryptedKey class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * RecipientEncryptedKey ::= SEQUENCE {
   *    rid KeyAgreeRecipientIdentifier,
   *    encryptedKey EncryptedKey }
   *
   * EncryptedKey ::= OCTET STRING
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    rid?: KeyAgreeRecipientIdentifierSchema;
    encryptedKey?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        KeyAgreeRecipientIdentifier.schema(names.rid || {}),
        new asn1js.OctetString({ name: (names.encryptedKey || "") })
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
      RecipientEncryptedKey.schema({
        names: {
          rid: {
            names: {
              blockName: RID
            }
          },
          encryptedKey: ENCRYPTED_KEY
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for RecipientEncryptedKey");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.rid = new KeyAgreeRecipientIdentifier({ schema: asn1.result.rid });
    this.encryptedKey = asn1.result.encryptedKey;
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
        this.rid.toSchema(),
        this.encryptedKey
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
      rid: this.rid.toJSON(),
      encryptedKey: this.encryptedKey.toJSON()
    };
  }

}
