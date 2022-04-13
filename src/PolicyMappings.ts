import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { PolicyMapping } from "./PolicyMapping";
import * as Schema from "./Schema";

const MAPPINGS = "mappings";
const CLEAR_PROPS = [
  MAPPINGS,
];

export interface PolicyMappingsParameters extends Schema.SchemaConstructor {
  mappings?: PolicyMapping[];
}

/**
 * Class from RFC5280
 */
export class PolicyMappings {

  public mappings: PolicyMapping[];

  /**
   * Constructor for PolicyMappings class
   * @param parameters
   */
  constructor(parameters: PolicyMappingsParameters = {}) {
    //#region Internal properties of the object
    this.mappings = pvutils.getParametersValue(parameters, MAPPINGS, PolicyMappings.defaultValues(MAPPINGS));
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
  public static defaultValues(memberName: string): PolicyMapping[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case MAPPINGS:
        return [];
      default:
        throw new Error(`Invalid member name for PolicyMappings class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * PolicyMappings ::= SEQUENCE SIZE (1..MAX) OF PolicyMapping
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    mappings?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Repeated({
          name: (names.mappings || ""),
          value: PolicyMapping.schema()
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
      PolicyMappings.schema({
        names: {
          mappings: MAPPINGS
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for PolicyMappings");
    //#endregion

    //#region Get internal properties from parsed schema
    this.mappings = Array.from(asn1.result.mappings, element => new PolicyMapping({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: Array.from(this.mappings, element => element.toSchema())
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    return {
      mappings: Array.from(this.mappings, element => element.toJSON())
    };
  }

}
