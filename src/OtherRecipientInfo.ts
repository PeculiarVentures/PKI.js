import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

const ORI_TYPE = "oriType";
const ORI_VALUE = "oriValue";
const CLEAR_PROPS = [
  ORI_TYPE,
  ORI_VALUE
];

export interface OtherRecipientInfoParameters extends Schema.SchemaConstructor {
  oriType?: string;
  oriValue?: any;
}

/**
 * Class from RFC5652
 */
export class OtherRecipientInfo implements Schema.SchemaCompatible {

  public oriType: string;
  public oriValue: any;

  /**
   * Constructor for OtherRecipientInfo class
   * @param parameters
   */
  constructor(parameters: OtherRecipientInfoParameters = {}) {
    //#region Internal properties of the object
    this.oriType = pvutils.getParametersValue(parameters, ORI_TYPE, OtherRecipientInfo.defaultValues(ORI_TYPE));
    this.oriValue = pvutils.getParametersValue(parameters, ORI_VALUE, OtherRecipientInfo.defaultValues(ORI_VALUE));
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
  static defaultValues(memberName: typeof ORI_TYPE): string;
  static defaultValues(memberName: typeof ORI_VALUE): any;
  static defaultValues(memberName: string): any {
    switch (memberName) {
      case ORI_TYPE:
        return "";
      case ORI_VALUE:
        return {};
      default:
        throw new Error(`Invalid member name for OtherRecipientInfo class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case ORI_TYPE:
        return (memberValue === "");
      case ORI_VALUE:
        return (Object.keys(memberValue).length === 0);
      default:
        throw new Error(`Invalid member name for OtherRecipientInfo class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * OtherRecipientInfo ::= SEQUENCE {
   *    oriType OBJECT IDENTIFIER,
   *    oriValue ANY DEFINED BY oriType }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    oriType?: string;
    oriValue?: string;
  }> = {}) {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.ObjectIdentifier({ name: (names.oriType || "") }),
        new asn1js.Any({ name: (names.oriValue || "") })
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
      OtherRecipientInfo.schema({
        names: {
          oriType: ORI_TYPE,
          oriValue: ORI_VALUE
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for OtherRecipientInfo");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.oriType = asn1.result.oriType.valueBlock.toString();
    this.oriValue = asn1.result.oriValue;
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
        new asn1js.ObjectIdentifier({ value: this.oriType }),
        this.oriValue
      ]
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    const _object: any = {
      oriType: this.oriType
    };

    if (!OtherRecipientInfo.compareWithDefault(ORI_VALUE, this.oriValue)) {
      _object.oriValue = this.oriValue.toJSON();
    }

    return _object;
  }

}
