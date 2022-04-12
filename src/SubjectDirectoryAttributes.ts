import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import Attribute from "./Attribute";
import { extensionValue } from "./ExtensionValueFactory";
import { id_SubjectDirectoryAttributes } from "./ObjectIdentifiers";
import * as Schema from "./Schema";

const ATTRIBUTES = "attributes";
const CLEAR_PROPS = [
  ATTRIBUTES
];

export interface SubjectDirectoryAttributesParameters extends Schema.SchemaConstructor {
  attributes?: Attribute[];
}

/**
 * Class from RFC5280
 */
@extensionValue(id_SubjectDirectoryAttributes, "SubjectDirectoryAttributes")
export default class SubjectDirectoryAttributes implements Schema.SchemaCompatible {

  public attributes: Attribute[];

  /**
   * Constructor for SubjectDirectoryAttributes class
   * @param parameters
   */
  constructor(parameters: SubjectDirectoryAttributesParameters = {}) {
    //#region Internal properties of the object
    this.attributes = pvutils.getParametersValue(parameters, ATTRIBUTES, SubjectDirectoryAttributes.defaultValues(ATTRIBUTES));
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
  public static defaultValues(memberName: typeof ATTRIBUTES): Attribute[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case ATTRIBUTES:
        return [];
      default:
        throw new Error(`Invalid member name for SubjectDirectoryAttributes class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * SubjectDirectoryAttributes ::= SEQUENCE SIZE (1..MAX) OF Attribute
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    attributes?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Repeated({
          name: (names.attributes || ""),
          value: Attribute.schema()
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
      SubjectDirectoryAttributes.schema({
        names: {
          attributes: ATTRIBUTES
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for SubjectDirectoryAttributes");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.attributes = Array.from(asn1.result.attributes, element => new Attribute({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: Array.from(this.attributes, element => element.toSchema())
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    return {
      attributes: Array.from(this.attributes, element => element.toJSON())
    };
  }

}
