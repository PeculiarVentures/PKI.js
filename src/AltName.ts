import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { GeneralName } from "./GeneralName";
import * as Schema from "./Schema";

const ALT_NAMES = "altNames";
const CLEAR_PROPS = [
  ALT_NAMES
];

export interface AltNameParameters extends Schema.SchemaConstructor {
  /**
   * Array of alternative names in GeneralName type
   */
  altNames?: GeneralName[];
}

/**
 * Class from RFC5280
 */
export class AltName implements Schema.SchemaCompatible {

  /**
   * Array of alternative names in GeneralName type
   */
  public altNames: GeneralName[];

  /**
   * Constructor for AltName class
   * @param parameters
   */
  constructor(parameters: AltNameParameters = {}) {
    //#region Internal properties of the object
    this.altNames = pvutils.getParametersValue(parameters, ALT_NAMES, AltName.defaultValues(ALT_NAMES));
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
  public static defaultValues(memberName: typeof ALT_NAMES): GeneralName[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case ALT_NAMES:
        return [];
      default:
        throw new Error(`Invalid member name for AltName class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * AltName ::= GeneralNames
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{ altNames?: string; }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Repeated({
          name: (names.altNames || ""),
          value: GeneralName.schema()
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
      AltName.schema({
        names: {
          altNames: ALT_NAMES
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for AltName");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    if (ALT_NAMES in asn1.result) {
      this.altNames = Array.from(asn1.result.altNames, element => new GeneralName({ schema: element }));
    }
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: Array.from(this.altNames, element => element.toSchema())
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    return {
      altNames: Array.from(this.altNames, element => element.toJSON())
    };
  }

}

