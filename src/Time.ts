import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

const TYPE = "type";
const VALUE = "value";
const UTC_TIME_NAME = "utcTimeName";
const GENERAL_TIME_NAME = "generalTimeName";
const CLEAR_PROPS = [UTC_TIME_NAME, GENERAL_TIME_NAME];

export enum TimeType {
  UTCTime,
  GeneralizedTime,
  empty,
}

export interface TimeParameters extends Schema.SchemaConstructor {
  /**
   * 0 - UTCTime; 1 - GeneralizedTime; 2 - empty value
   */
  type?: TimeType;
  /**
   * Value of the TIME class
   */
  value?: Date;
}

export type TimeSchema = Schema.SchemaParameters<{
  utcTimeName?: string;
  generalTimeName?: string;
}>;

/**
 * Class from RFC5280
 */
export default class Time implements Schema.SchemaCompatible {

  /**
   * 0 - UTCTime; 1 - GeneralizedTime; 2 - empty value
   */
  public type: TimeType;
  /**
   * Value of the TIME class
   */
  public value: Date;

  /**
   * Constructor for Time class
   * @param parameters
   */
  constructor(parameters: TimeParameters = {}) {
    //#region Internal properties of the object
    this.type = pvutils.getParametersValue(parameters, TYPE, Time.defaultValues(TYPE));
    this.value = pvutils.getParametersValue(parameters, VALUE, Time.defaultValues(VALUE));
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
  public static defaultValues(memberName: typeof TYPE): TimeType;
  public static defaultValues(memberName: typeof VALUE): Date;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case TYPE:
        return 0;
      case VALUE:
        return new Date(0, 0, 0);
      default:
        throw new Error(`Invalid member name for Time class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * Time ::= CHOICE {
     *   utcTime        UTCTime,
     *   generalTime    GeneralizedTime }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @param optional Flag that current schema should be optional
   * @returns asn1js schema object
   */
  static schema(parameters: TimeSchema = {}, optional = false): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Choice({
      optional,
      value: [
        new asn1js.UTCTime({ name: (names.utcTimeName || "") }),
        new asn1js.GeneralizedTime({ name: (names.generalTimeName || "") })
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
    const asn1 = asn1js.compareSchema(schema, schema, Time.schema({
      names: {
        utcTimeName: UTC_TIME_NAME,
        generalTimeName: GENERAL_TIME_NAME
      }
    }));

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for Time");
    //#endregion

    //#region Get internal properties from parsed schema
    if (UTC_TIME_NAME in asn1.result) {
      this.type = 0;
      this.value = asn1.result.utcTimeName.toDate();
    }
    if (GENERAL_TIME_NAME in asn1.result) {
      this.type = 1;
      this.value = asn1.result.generalTimeName.toDate();
    }
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.UTCTime | asn1js.GeneralizedTime {
    //#region Construct and return new ASN.1 schema for this object
    if (this.type === 0) {
      return new asn1js.UTCTime({ valueDate: this.value });
    } else if (this.type === 1) {
      return new asn1js.GeneralizedTime({ valueDate: this.value });
    }

    return {} as any;
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    return {
      type: this.type,
      value: this.value
    };
  }

}
