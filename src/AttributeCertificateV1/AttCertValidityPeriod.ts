import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "../Schema";

const NOT_BEFORE_TIME = "notBeforeTime";
const NOT_AFTER_TIME = "notAfterTime";
const CLEAR_PROPS = [
  NOT_BEFORE_TIME,
  NOT_AFTER_TIME,
];

export interface AttCertValidityPeriodParameters extends Schema.SchemaConstructor {
  notBeforeTime?: Date;
  notAfterTime?: Date;
}

export type AttCertValidityPeriodSchema = Schema.SchemaParameters<{
  notBeforeTime?: string;
  notAfterTime?: string;
}>;

/**
 * Class from RFC5755
 */
export class AttCertValidityPeriod implements Schema.SchemaCompatible {

  public notBeforeTime: Date;
  public notAfterTime: Date;

  /**
   * Constructor for AttCertValidityPeriod class
   * @param parameters
   */
  constructor(parameters: AttCertValidityPeriodParameters = {}) {
    //#region Internal properties of the object
    this.notBeforeTime = pvutils.getParametersValue(parameters, NOT_BEFORE_TIME, AttCertValidityPeriod.defaultValues(NOT_BEFORE_TIME));
    this.notAfterTime = pvutils.getParametersValue(parameters, NOT_AFTER_TIME, AttCertValidityPeriod.defaultValues(NOT_AFTER_TIME));
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
  public static defaultValues(memberName: typeof NOT_BEFORE_TIME): Date;
  public static defaultValues(memberName: typeof NOT_AFTER_TIME): Date;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case NOT_BEFORE_TIME:
      case NOT_AFTER_TIME:
        return new Date(0, 0, 0);
      default:
        throw new Error(`Invalid member name for AttCertValidityPeriod class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * AttCertValidityPeriod  ::= SEQUENCE {
   *   notBeforeTime  GeneralizedTime,
   *   notAfterTime   GeneralizedTime
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: AttCertValidityPeriodSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.GeneralizedTime({ name: (names.notBeforeTime || "") }),
        new asn1js.GeneralizedTime({ name: (names.notAfterTime || "") })
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
      AttCertValidityPeriod.schema({
        names: {
          notBeforeTime: NOT_BEFORE_TIME,
          notAfterTime: NOT_AFTER_TIME
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for AttCertValidityPeriod");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.notBeforeTime = asn1.result.notBeforeTime.toDate();
    this.notAfterTime = asn1.result.notAfterTime.toDate();
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
        new asn1js.GeneralizedTime({ valueDate: this.notBeforeTime }),
        new asn1js.GeneralizedTime({ valueDate: this.notAfterTime }),
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
      notBeforeTime: this.notBeforeTime,
      notAfterTime: this.notAfterTime
    };
  }

}
