import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { AccessDescription } from "./AccessDescription";
import * as Schema from "./Schema";

const ACCESS_DESCRIPTIONS = "accessDescriptions";

export interface InfoAccessParameters extends Schema.SchemaConstructor {
  accessDescriptions?: AccessDescription[];
}

/**
 * Class from RFC5280
 */
export class InfoAccess implements Schema.SchemaCompatible {

  public accessDescriptions: AccessDescription[];

  /**
   * Constructor for InfoAccess class
   * @param parameters
   */
  constructor(parameters: InfoAccessParameters = {}) {
    //#region Internal properties of the object
    this.accessDescriptions = pvutils.getParametersValue(parameters, ACCESS_DESCRIPTIONS, InfoAccess.defaultValues(ACCESS_DESCRIPTIONS));
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
  public static defaultValues(memberName: typeof ACCESS_DESCRIPTIONS): AccessDescription[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case ACCESS_DESCRIPTIONS:
        return [];
      default:
        throw new Error(`Invalid member name for InfoAccess class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * AuthorityInfoAccessSyntax  ::=
   * SEQUENCE SIZE (1..MAX) OF AccessDescription
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    accessDescriptions?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Repeated({
          name: (names.accessDescriptions || ""),
          value: AccessDescription.schema()
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
      ACCESS_DESCRIPTIONS
    ]);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      InfoAccess.schema({
        names: {
          accessDescriptions: ACCESS_DESCRIPTIONS
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for InfoAccess");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.accessDescriptions = Array.from(asn1.result.accessDescriptions, element => new AccessDescription({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: Array.from(this.accessDescriptions, element => element.toSchema())
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    return {
      accessDescriptions: Array.from(this.accessDescriptions, element => element.toJSON())
    };
  }

}

