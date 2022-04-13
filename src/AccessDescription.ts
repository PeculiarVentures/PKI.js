import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { GeneralName, GeneralNameSchema } from "./GeneralName";
import * as Schema from "./Schema";

const ACCESS_METHOD = "accessMethod";
const ACCESS_LOCATION = "accessLocation";
const CLEAR_PROPS = [
  ACCESS_METHOD,
  ACCESS_LOCATION,
];

export interface AccessDescriptionParameters extends Schema.SchemaConstructor {
  accessMethod?: string;
  accessLocation?: GeneralName;
}

/**
 * Class from RFC5280
 */
export class AccessDescription {

  /**
   * The type and format of the information are specified by the accessMethod field. This profile defines two accessMethod OIDs: id-ad-caIssuers and id-ad-ocsp
   */
  public accessMethod: string;
  /**
   * The accessLocation field specifies the location of the information
   */
  public accessLocation: GeneralName;

  /**
   * Constructor for AccessDescription class
   * @param parameters
   */
  constructor(parameters: AccessDescriptionParameters = {}) {
    //#region Internal properties of the object
    this.accessMethod = pvutils.getParametersValue(parameters, ACCESS_METHOD, AccessDescription.defaultValues(ACCESS_METHOD));
    this.accessLocation = pvutils.getParametersValue(parameters, ACCESS_LOCATION, AccessDescription.defaultValues(ACCESS_LOCATION));
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
  public static defaultValues(memberName: typeof ACCESS_METHOD): string;
  public static defaultValues(memberName: typeof ACCESS_LOCATION): GeneralName;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case ACCESS_METHOD:
        return "";
      case ACCESS_LOCATION:
        return new GeneralName();
      default:
        throw new Error(`Invalid member name for AccessDescription class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * AccessDescription  ::=  SEQUENCE {
   *    accessMethod          OBJECT IDENTIFIER,
   *    accessLocation        GeneralName  }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  static schema(parameters: Schema.SchemaParameters<{ accessMethod?: string; accessLocation?: GeneralNameSchema; }> = {}) {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.ObjectIdentifier({ name: (names.accessMethod || "") }),
        GeneralName.schema(names.accessLocation || {})
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
      AccessDescription.schema({
        names: {
          accessMethod: ACCESS_METHOD,
          accessLocation: {
            names: {
              blockName: ACCESS_LOCATION
            }
          }
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for AccessDescription");
    //#endregion

    //#region Get internal properties from parsed schema
    this.accessMethod = asn1.result.accessMethod.valueBlock.toString();
    this.accessLocation = new GeneralName({ schema: asn1.result.accessLocation });
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
        new asn1js.ObjectIdentifier({ value: this.accessMethod }),
        this.accessLocation.toSchema()
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
      accessMethod: this.accessMethod,
      accessLocation: this.accessLocation.toJSON()
    };
  }

}
