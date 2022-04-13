import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

const SECRET_TYPE_ID = "secretTypeId";
const SECRET_VALUE = "secretValue";
const CLEAR_PROPS = [
  SECRET_TYPE_ID,
  SECRET_VALUE,
];

export interface SecretBagParameters extends Schema.SchemaConstructor {
  secretTypeId?: string;
  secretValue?: Schema.SchemaCompatible;
}

/**
 * Class from RFC7292
 */
export class SecretBag {

  public secretTypeId: string;
  public secretValue: Schema.SchemaCompatible;

  /**
   * Constructor for SecretBag class
   * @param parameters
   */
  constructor(parameters: SecretBagParameters = {}) {
    //#region Internal properties of the object
    this.secretTypeId = pvutils.getParametersValue(parameters, SECRET_TYPE_ID, SecretBag.defaultValues(SECRET_TYPE_ID));
    this.secretValue = pvutils.getParametersValue(parameters, SECRET_VALUE, SecretBag.defaultValues(SECRET_VALUE));
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
  public static defaultValues(memberName: typeof SECRET_TYPE_ID): string;
  public static defaultValues(memberName: typeof SECRET_VALUE): Schema.SchemaCompatible;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case SECRET_TYPE_ID:
        return "";
      case SECRET_VALUE:
        return (new asn1js.Any());
      default:
        throw new Error(`Invalid member name for SecretBag class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case SECRET_TYPE_ID:
        return (memberValue === "");
      case SECRET_VALUE:
        return (memberValue instanceof asn1js.Any);
      default:
        throw new Error(`Invalid member name for SecretBag class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * SecretBag ::= SEQUENCE {
   *    secretTypeId BAG-TYPE.&id ({SecretTypes}),
   *    secretValue  [0] EXPLICIT BAG-TYPE.&Type ({SecretTypes}{@secretTypeId})
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    id?: string;
    value?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.ObjectIdentifier({ name: (names.id || "id") }),
        new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [new asn1js.Any({ name: (names.value || "value") })] // EXPLICIT ANY value
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
      SecretBag.schema({
        names: {
          id: SECRET_TYPE_ID,
          value: SECRET_VALUE
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for SecretBag");
    //#endregion

    //#region Get internal properties from parsed schema
    this.secretTypeId = asn1.result.secretTypeId.valueBlock.toString();
    this.secretValue = asn1.result.secretValue;
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
        new asn1js.ObjectIdentifier({ value: this.secretTypeId }),
        new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [this.secretValue.toSchema()]
        })
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
      secretTypeId: this.secretTypeId,
      secretValue: this.secretValue.toJSON()
    };
  }

}
