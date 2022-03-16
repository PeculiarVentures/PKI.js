import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import Extension, { ExtensionSchema } from "./Extension";
import * as Schema from "./Schema";

const EXTENSIONS = "extensions";
const CLEAR_PROPS = [
  EXTENSIONS,
];

export interface ExtensionsParameters extends Schema.SchemaConstructor {
  extensions?: Extension[];
}

export type ExtensionsSchema = Schema.SchemaParameters<{
  extensions?: string;
  extension?: ExtensionSchema;
}>;

/**
 * Class from RFC5280
 */
export default class Extensions implements Schema.SchemaCompatible {

  public extensions: Extension[];

  /**
   * Constructor for Extensions class
   * @param parameters
   */
  constructor(parameters: ExtensionsParameters = {}) {
    //#region Internal properties of the object
    this.extensions = pvutils.getParametersValue(parameters, EXTENSIONS, Extensions.defaultValues(EXTENSIONS));
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
  public static defaultValues(memberName: typeof EXTENSIONS): Extension[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case EXTENSIONS:
        return [];
      default:
        throw new Error(`Invalid member name for Extensions class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * Extensions  ::=  SEQUENCE SIZE (1..MAX) OF Extension
   * ```
   *
   * @param parameters Input parameters for the schema
   * @param optional Flag that current schema should be optional
   * @returns asn1js schema object
   */
  public static schema(parameters: ExtensionsSchema = {}, optional = false) {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      optional,
      name: (names.blockName || ""),
      value: [
        new asn1js.Repeated({
          name: (names.extensions || ""),
          value: Extension.schema(names.extension || {})
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
      Extensions.schema({
        names: {
          extensions: EXTENSIONS
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for Extensions");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.extensions = Array.from(asn1.result.extensions, element => new Extension({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): Schema.SchemaType {
    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: Array.from(this.extensions, element => element.toSchema())
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    return {
      extensions: Array.from(this.extensions, element => element.toJSON())
    };
  }

}
