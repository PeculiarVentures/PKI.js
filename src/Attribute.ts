import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

export interface AttributeParameters extends Schema.SchemaConstructor {
  type?: string;
  values?: any[];
}
export type AttributeSchema = Schema.SchemaParameters<{
  setName?: string;
  type?: string;
  values?: string;
}>;

/**
 * Class from RFC2986
 */
export class Attribute {

  public type: string;
  public values: any[];

  /**
   * Constructor for Attribute class
   * @param parameters
   */
  constructor(parameters: AttributeParameters = {}) {
    //#region Internal properties of the object
    /**
     * @type {string}
     * @desc ObjectIdentifier for attribute (string representation)
     */
    this.type = pvutils.getParametersValue(parameters, "type", Attribute.defaultValues("type"));
    /**
     * @type {Array}
     * @desc Any attribute values
     */
    this.values = pvutils.getParametersValue(parameters, "values", Attribute.defaultValues("values"));
    //#endregion

    //#region If input argument array contains "schema" for this object
    if (parameters.schema)
      this.fromSchema(parameters.schema);
    //#endregion
  }

  /**
   * Return default values for all class members
   * @param memberName String name for a class member
   */
  public static defaultValues(memberName: "type"): string;
  public static defaultValues(memberName: "values"): any[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case "type":
        return "";
      case "values":
        return [];
      default:
        throw new Error(`Invalid member name for Attribute class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case "type":
        return (memberValue === "");
      case "values":
        return (memberValue.length === 0);
      default:
        throw new Error(`Invalid member name for Attribute class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * Attribute { ATTRIBUTE:IOSet } ::= SEQUENCE {
   *    type   ATTRIBUTE.&id({IOSet}),
   *    values SET SIZE(1..MAX) OF ATTRIBUTE.&Type({IOSet}{@type})
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: AttributeSchema = {}) {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.ObjectIdentifier({ name: (names.type || "") }),
        new asn1js.Set({
          name: (names.setName || ""),
          value: [
            new asn1js.Repeated({
              name: (names.values || ""),
              value: new asn1js.Any()
            })
          ]
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
    pvutils.clearProps(schema, [
      "type",
      "values"
    ]);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      Attribute.schema({
        names: {
          type: "type",
          values: "values"
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for Attribute");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.type = asn1.result.type.valueBlock.toString();
    this.values = asn1.result.values;
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
        new asn1js.ObjectIdentifier({ value: this.type }),
        new asn1js.Set({
          value: this.values
        })
      ]
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    return {
      type: this.type,
      values: Array.from(this.values, element => element.toJSON())
    };
  }

}

