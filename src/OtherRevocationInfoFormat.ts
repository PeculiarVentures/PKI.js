import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

const OTHER_REV_INFO_FORMAT = "otherRevInfoFormat";
const OTHER_REV_INFO = "otherRevInfo";
const CLEAR_PROPS = [
  OTHER_REV_INFO_FORMAT,
  OTHER_REV_INFO
];

export interface OtherRevocationInfoFormatParameters extends Schema.SchemaConstructor {
  otherRevInfoFormat?: string;
  otherRevInfo?: any;
}

/**
 * Class from RFC5652
 */
export class OtherRevocationInfoFormat implements Schema.SchemaCompatible {

  public otherRevInfoFormat: string;
  public otherRevInfo: any;

  /**
   * Constructor for OtherRevocationInfoFormat class
   * @param parameters
   */
  constructor(parameters: OtherRevocationInfoFormatParameters = {}) {
    //#region Internal properties of the object
    this.otherRevInfoFormat = pvutils.getParametersValue(parameters, OTHER_REV_INFO_FORMAT, OtherRevocationInfoFormat.defaultValues(OTHER_REV_INFO_FORMAT));
    this.otherRevInfo = pvutils.getParametersValue(parameters, OTHER_REV_INFO, OtherRevocationInfoFormat.defaultValues(OTHER_REV_INFO));
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
  static defaultValues(memberName: typeof OTHER_REV_INFO_FORMAT): string;
  static defaultValues(memberName: typeof OTHER_REV_INFO): any;
  static defaultValues(memberName: string): any {
    switch (memberName) {
      case OTHER_REV_INFO_FORMAT:
        return "";
      case OTHER_REV_INFO:
        return new asn1js.Any();
      default:
        throw new Error(`Invalid member name for OtherRevocationInfoFormat class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * OtherCertificateFormat ::= SEQUENCE {
   *    otherRevInfoFormat OBJECT IDENTIFIER,
   *    otherRevInfo ANY DEFINED BY otherCertFormat }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    otherRevInfoFormat?: string;
    otherRevInfo?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.ObjectIdentifier({ name: (names.otherRevInfoFormat || OTHER_REV_INFO_FORMAT) }),
        new asn1js.Any({ name: (names.otherRevInfo || OTHER_REV_INFO) })
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
      OtherRevocationInfoFormat.schema()
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for OtherRevocationInfoFormat");
    //#endregion

    //#region Get internal properties from parsed schema
    this.otherRevInfoFormat = asn1.result.otherRevInfoFormat.valueBlock.toString();
    this.otherRevInfo = asn1.result.otherRevInfo;
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
        new asn1js.ObjectIdentifier({ value: this.otherRevInfoFormat }),
        this.otherRevInfo
      ]
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    const object: any = {
      otherRevInfoFormat: this.otherRevInfoFormat
    };

    if (!(this.otherRevInfo instanceof asn1js.Any)) {
      object.otherRevInfo = this.otherRevInfo.toJSON();
    }

    return object;
  }

}
