import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";
import { ExtensionParsedValue, ExtensionValueFactory } from "./ExtensionValueFactory";

const EXTN_ID = "extnID";
const CRITICAL = "critical";
const EXTN_VALUE = "extnValue";
const PARSED_VALUE = "parsedValue";
const CLEAR_PROPS = [
  EXTN_ID,
  CRITICAL,
  EXTN_VALUE
];

export interface ExtensionParameters extends Schema.SchemaConstructor {
  extnID?: string;
  critical?: boolean;
  extnValue?: ArrayBuffer;
  parsedValue?: ExtensionParsedValue;
}

export type ExtensionSchema = Schema.SchemaParameters<{
  extnID?: string;
  critical?: string;
  extnValue?: string;
}>;

/**
 * Class from RFC5280
 */
export default class Extension implements Schema.SchemaCompatible {

  public extnID: string;
  public critical: boolean;
  public extnValue: asn1js.OctetString;
  public parsedValue?: ExtensionParsedValue;

  /**
   * Constructor for Extension class
   * @param parameters
   */
  constructor(parameters: ExtensionParameters = {}) {
    //#region Internal properties of the object
    this.extnID = pvutils.getParametersValue(parameters, EXTN_ID, Extension.defaultValues(EXTN_ID));
    this.critical = pvutils.getParametersValue(parameters, CRITICAL, Extension.defaultValues(CRITICAL));
    if (parameters.extnValue) {
      this.extnValue = new asn1js.OctetString({ valueHex: parameters.extnValue });
    } else {
      this.extnValue = Extension.defaultValues(EXTN_VALUE);
    }

    if (parameters.parsedValue) {
      this.parsedValue = pvutils.getParametersValue(parameters, PARSED_VALUE, Extension.defaultValues(PARSED_VALUE));
    }
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
  public static defaultValues(memberName: typeof EXTN_ID): string;
  public static defaultValues(memberName: typeof CRITICAL): boolean;
  public static defaultValues(memberName: typeof EXTN_VALUE): asn1js.OctetString;
  public static defaultValues(memberName: typeof PARSED_VALUE): ExtensionParsedValue;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case EXTN_ID:
        return "";
      case CRITICAL:
        return false;
      case EXTN_VALUE:
        return new asn1js.OctetString();
      case PARSED_VALUE:
        return {};
      default:
        throw new Error(`Invalid member name for Extension class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * Extension  ::=  SEQUENCE  {
   *    extnID      OBJECT IDENTIFIER,
   *    critical    BOOLEAN DEFAULT FALSE,
   *    extnValue   OCTET STRING
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: ExtensionSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.ObjectIdentifier({ name: (names.extnID || "") }),
        new asn1js.Boolean({
          name: (names.critical || ""),
          optional: true
        }),
        new asn1js.OctetString({ name: (names.extnValue || "") })
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
      Extension.schema({
        names: {
          extnID: EXTN_ID,
          critical: CRITICAL,
          extnValue: EXTN_VALUE
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for Extension");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.extnID = asn1.result.extnID.valueBlock.toString();
    if (CRITICAL in asn1.result) {
      this.critical = asn1.result.critical.valueBlock.value;
    }
    this.extnValue = asn1.result.extnValue;

    //#region Get PARSED_VALUE for well-known extensions
    const parsedValue = ExtensionValueFactory.fromBER(this.extnID, this.extnValue.valueBlock.valueHex);
    if (parsedValue) {
      this.parsedValue = parsedValue;
    }
    //#endregion
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): Schema.SchemaType {
    //#region Create array for output sequence
    const outputArray = [];

    outputArray.push(new asn1js.ObjectIdentifier({ value: this.extnID }));

    if (this.critical !== Extension.defaultValues(CRITICAL)) {
      outputArray.push(new asn1js.Boolean({ value: this.critical }));
    }

    outputArray.push(this.extnValue);
    //#endregion

    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: outputArray
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    const object: any = {
      extnID: this.extnID,
      extnValue: this.extnValue.toJSON()
    };

    if (this.critical !== Extension.defaultValues(CRITICAL))
      object.critical = this.critical;

    if (this.parsedValue && this.parsedValue.toJSON) {
      object.parsedValue = this.parsedValue.toJSON();
    }

    return object;
  }

}

