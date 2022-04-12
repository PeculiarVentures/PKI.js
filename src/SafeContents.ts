import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import SafeBag from "./SafeBag";
import * as Schema from "./Schema";

const SAFE_BUGS = "safeBags";

export interface SafeContentsParameters extends Schema.SchemaConstructor {
  safeBags?: SafeBag[];
}

/**
 * Class from RFC7292
 */
export default class SafeContents {

  public safeBags: SafeBag[];

  /**
   * Constructor for SafeContents class
   * @param parameters
   */
  constructor(parameters: SafeContentsParameters = {}) {
    //#region Internal properties of the object
    this.safeBags = pvutils.getParametersValue(parameters, SAFE_BUGS, SafeContents.defaultValues(SAFE_BUGS));
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
  public static defaultValues(memberName: typeof SAFE_BUGS): SafeBag[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case SAFE_BUGS:
        return [];
      default:
        throw new Error(`Invalid member name for SafeContents class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case SAFE_BUGS:
        return (memberValue.length === 0);
      default:
        throw new Error(`Invalid member name for SafeContents class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * SafeContents ::= SEQUENCE OF SafeBag
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    safeBags?: string;
  }> = {}): Schema.SchemaType {
    /**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [safeBags]
     */
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Repeated({
          name: (names.safeBags || ""),
          value: SafeBag.schema()
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
      SAFE_BUGS
    ]);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      SafeContents.schema({
        names: {
          safeBags: SAFE_BUGS
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for SafeContents");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.safeBags = Array.from(asn1.result.safeBags, element => new SafeBag({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: Array.from(this.safeBags, element => element.toSchema())
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    return {
      safeBags: Array.from(this.safeBags, element => element.toJSON())
    };
  }

}
