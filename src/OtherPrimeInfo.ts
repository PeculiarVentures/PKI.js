import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { ParameterError } from "./errors";
import * as Schema from "./Schema";

const PRIME = "prime";
const EXPONENT = "exponent";
const COEFFICIENT = "coefficient";
const CLEAR_PROPS = [
  PRIME,
  EXPONENT,
  COEFFICIENT,
];

export interface OtherPrimeInfoParameters extends Schema.SchemaConstructor {
  prime?: asn1js.Integer;
  exponent?: asn1js.Integer;
  coefficient?: asn1js.Integer;
  json?: JsonOtherPrimeInfo;
}

export interface JsonOtherPrimeInfo {
  r: string;
  d: string;
  t: string;
}

export type OtherPrimeInfoSchema = Schema.SchemaParameters<{
  prime?: string;
  exponent?: string;
  coefficient?: string;
}>;

/**
 * Class from RFC3447
 */
export class OtherPrimeInfo implements Schema.SchemaCompatible {

  public prime: asn1js.Integer;
  public exponent: asn1js.Integer;
  public coefficient: asn1js.Integer;

  /**
   * Constructor for OtherPrimeInfo class
   * @param parameters
   */
  constructor(parameters: OtherPrimeInfoParameters = {}) {
    //#region Internal properties of the object
    this.prime = pvutils.getParametersValue(parameters, PRIME, OtherPrimeInfo.defaultValues(PRIME));
    this.exponent = pvutils.getParametersValue(parameters, EXPONENT, OtherPrimeInfo.defaultValues(EXPONENT));
    this.coefficient = pvutils.getParametersValue(parameters, COEFFICIENT, OtherPrimeInfo.defaultValues(COEFFICIENT));
    //#endregion

    //#region If input argument array contains "schema" for this object
    if (parameters.schema) {
      this.fromSchema(parameters.schema);
    }
    //#endregion
    //#region If input argument array contains "json" for this object
    if (parameters.json) {
      this.fromJSON(parameters.json);
    }
    //#endregion
  }

  /**
   * Return default values for all class members
   * @param memberName String name for a class member
   */
  public static defaultValues(memberName: typeof PRIME | typeof EXPONENT | typeof COEFFICIENT): asn1js.Integer;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case PRIME:
        return new asn1js.Integer();
      case EXPONENT:
        return new asn1js.Integer();
      case COEFFICIENT:
        return new asn1js.Integer();
      default:
        throw new Error(`Invalid member name for OtherPrimeInfo class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * OtherPrimeInfo ::= Sequence {
   *    prime             Integer,  -- ri
   *    exponent          Integer,  -- di
   *    coefficient       Integer   -- ti
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: OtherPrimeInfoSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Integer({ name: (names.prime || "") }),
        new asn1js.Integer({ name: (names.exponent || "") }),
        new asn1js.Integer({ name: (names.coefficient || "") })
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
      OtherPrimeInfo.schema({
        names: {
          prime: PRIME,
          exponent: EXPONENT,
          coefficient: COEFFICIENT
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for OtherPrimeInfo");
    //#endregion

    //#region Get internal properties from parsed schema
    this.prime = asn1.result.prime.convertFromDER();
    this.exponent = asn1.result.exponent.convertFromDER();
    this.coefficient = asn1.result.coefficient.convertFromDER();
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
        this.prime.convertToDER(),
        this.exponent.convertToDER(),
        this.coefficient.convertToDER()
      ]
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): JsonOtherPrimeInfo {
    return {
      r: pvutils.toBase64(pvutils.arrayBufferToString(this.prime.valueBlock.valueHex), true, true),
      d: pvutils.toBase64(pvutils.arrayBufferToString(this.exponent.valueBlock.valueHex), true, true),
      t: pvutils.toBase64(pvutils.arrayBufferToString(this.coefficient.valueBlock.valueHex), true, true)
    };
  }

  /**
   * Convert JSON value into current object
   * @param json
   */
  public fromJSON(json: JsonOtherPrimeInfo): void {
    ParameterError.assert("json", json, "r", "d", "r");
    this.prime = new asn1js.Integer({ valueHex: pvutils.stringToArrayBuffer(pvutils.fromBase64(json.r, true)) });
    this.exponent = new asn1js.Integer({ valueHex: pvutils.stringToArrayBuffer(pvutils.fromBase64(json.d, true)) });
    this.coefficient = new asn1js.Integer({ valueHex: pvutils.stringToArrayBuffer(pvutils.fromBase64(json.t, true)) });
  }

}

