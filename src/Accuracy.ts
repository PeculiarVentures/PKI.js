import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

export const SECONDS = "seconds";
export const MILLIS = "millis";
export const MICROS = "micros";

export interface AccuracyParameters extends Schema.SchemaConstructor {
  seconds?: number;
  millis?: number;
  micros?: number;
}

export type AccuracySchema = Schema.SchemaParameters<{
  seconds?: string;
  millis?: string;
  micros?: string;
}>;

/**
 * Class from RFC3161. Accuracy represents the time deviation around the UTC time contained in GeneralizedTime.
 */
export class Accuracy {


  public seconds?: number;
  public millis?: number;
  public micros?: number;

  /**
   * Constructor for Accuracy class
   * @param parameters
   */
  constructor(parameters: AccuracyParameters = {}) {
    //#region Internal properties of the object
    if (parameters.seconds !== undefined) {
      this.seconds = pvutils.getParametersValue(parameters, SECONDS, Accuracy.defaultValues(SECONDS));
    }

    if (parameters.millis !== undefined) {
      this.millis = pvutils.getParametersValue(parameters, MILLIS, Accuracy.defaultValues(MILLIS));
    }

    if (parameters.micros !== undefined) {
      this.micros = pvutils.getParametersValue(parameters, MICROS, Accuracy.defaultValues(MICROS));
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
  public static defaultValues(memberName: typeof SECONDS): number;
  public static defaultValues(memberName: typeof MILLIS): number;
  public static defaultValues(memberName: typeof MICROS): number;
  public static defaultValues(memberName: string): any;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case SECONDS:
      case MILLIS:
      case MICROS:
        return 0;
      default:
        throw new Error(`Invalid member name for Accuracy class: ${memberName}`);
    }
  }

  public static compareWithDefault(memberName: typeof SECONDS | typeof MILLIS | typeof MICROS, memberValue: number): boolean;
  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean;
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case SECONDS:
      case MILLIS:
      case MICROS:
        return (memberValue === Accuracy.defaultValues(memberName));
      default:
        throw new Error(`Invalid member name for Accuracy class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * Accuracy ::= SEQUENCE {
   *    seconds        INTEGER              OPTIONAL,
   *    millis     [0] INTEGER  (1..999)    OPTIONAL,
   *    micros     [1] INTEGER  (1..999)    OPTIONAL  }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  static schema(parameters: AccuracySchema = {}): any {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      optional: true,
      value: [
        new asn1js.Integer({
          optional: true,
          name: (names.seconds || "")
        }),
        new asn1js.Primitive({
          name: (names.millis || ""),
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          }
        }),
        new asn1js.Primitive({
          name: (names.micros || ""),
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          }
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
      SECONDS,
      MILLIS,
      MICROS,
    ]);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      Accuracy.schema({
        names: {
          seconds: SECONDS,
          millis: MILLIS,
          micros: MICROS,
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for Accuracy");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    if ("seconds" in asn1.result)
      this.seconds = asn1.result.seconds.valueBlock.valueDec;

    if ("millis" in asn1.result) {
      const intMillis = new asn1js.Integer({ valueHex: asn1.result.millis.valueBlock.valueHex });
      this.millis = intMillis.valueBlock.valueDec;
    }

    if ("micros" in asn1.result) {
      const intMicros = new asn1js.Integer({ valueHex: asn1.result.micros.valueBlock.valueHex });
      this.micros = intMicros.valueBlock.valueDec;
    }
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Create array of output sequence
    const outputArray = [];

    if (this.seconds !== undefined)
      outputArray.push(new asn1js.Integer({ value: this.seconds }));

    if (this.millis !== undefined) {
      const intMillis = new asn1js.Integer({ value: this.millis });

      outputArray.push(new asn1js.Primitive({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        valueHex: intMillis.valueBlock.valueHex
      }));
    }

    if (this.micros !== undefined) {
      const intMicros = new asn1js.Integer({ value: this.micros });

      outputArray.push(new asn1js.Primitive({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 1 // [1]
        },
        valueHex: intMicros.valueBlock.valueHex
      }));
    }
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
  toJSON(): any {
    const _object: any = {};

    if (this.seconds !== undefined)
      _object.seconds = this.seconds;

    if (this.millis !== undefined)
      _object.millis = this.millis;

    if (this.micros !== undefined)
      _object.micros = this.micros;

    return _object;
  }

}

