import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { AsnError, ParameterError } from "./errors";
import { PkiObject, PkiObjectParameters } from "./PkiObject";
import * as Schema from "./Schema";

const PRIME = "prime";
const EXPONENT = "exponent";
const COEFFICIENT = "coefficient";
const CLEAR_PROPS = [
  PRIME,
  EXPONENT,
  COEFFICIENT,
];

export interface IOtherPrimeInfo {
  prime: asn1js.Integer;
  exponent: asn1js.Integer;
  coefficient: asn1js.Integer;
}

export type OtherPrimeInfoParameters = PkiObjectParameters & Partial<IOtherPrimeInfo> & { json?: OtherPrimeInfoJson; };

export interface OtherPrimeInfoJson {
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
 * Represents the OtherPrimeInfo structure described in [RFC3447](https://datatracker.ietf.org/doc/html/rfc3447)
 */
export class OtherPrimeInfo extends PkiObject implements IOtherPrimeInfo {

  public static override CLASS_NAME = "OtherPrimeInfo";

  public prime!: asn1js.Integer;
  public exponent!: asn1js.Integer;
  public coefficient!: asn1js.Integer;

  /**
   * Initializes a new instance of the {@link OtherPrimeInfo} class
   * @param parameters Initialization parameters
   */
  constructor(parameters: OtherPrimeInfoParameters = {}) {
    super();

    this.prime = pvutils.getParametersValue(parameters, PRIME, OtherPrimeInfo.defaultValues(PRIME));
    this.exponent = pvutils.getParametersValue(parameters, EXPONENT, OtherPrimeInfo.defaultValues(EXPONENT));
    this.coefficient = pvutils.getParametersValue(parameters, COEFFICIENT, OtherPrimeInfo.defaultValues(COEFFICIENT));

    if (parameters.json) {
      this.fromJSON(parameters.json);
    }

    if (parameters.schema) {
      this.fromSchema(parameters.schema);
    }
  }

  /**
   * Returns default values for all class members
   * @param memberName String name for a class member
   * @returns Default value
   */
  public static override defaultValues(memberName: typeof PRIME | typeof EXPONENT | typeof COEFFICIENT): asn1js.Integer;
  public static override defaultValues(memberName: string): any {
    switch (memberName) {
      case PRIME:
        return new asn1js.Integer();
      case EXPONENT:
        return new asn1js.Integer();
      case COEFFICIENT:
        return new asn1js.Integer();
      default:
        return super.defaultValues(memberName);
    }
  }

  /**
   * @inheritdoc
   * @asn ASN.1 schema
   * ```asn
   * OtherPrimeInfo ::= Sequence {
   *    prime             Integer,  -- ri
   *    exponent          Integer,  -- di
   *    coefficient       Integer   -- ti
   * }
   *```
   */
  public static override schema(parameters: OtherPrimeInfoSchema = {}): Schema.SchemaType {
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

  public fromSchema(schema: Schema.SchemaType): void {
    // Clear input data first
    pvutils.clearProps(schema, CLEAR_PROPS);

    // Check the schema is valid
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
    AsnError.assertSchema(asn1, this.className);

    //#region Get internal properties from parsed schema
    this.prime = asn1.result.prime.convertFromDER();
    this.exponent = asn1.result.exponent.convertFromDER();
    this.coefficient = asn1.result.coefficient.convertFromDER();
    //#endregion
  }

  public toSchema(): asn1js.Sequence {
    return (new asn1js.Sequence({
      value: [
        this.prime.convertToDER(),
        this.exponent.convertToDER(),
        this.coefficient.convertToDER()
      ]
    }));
  }

  public toJSON(): OtherPrimeInfoJson {
    return {
      r: pvutils.toBase64(pvutils.arrayBufferToString(this.prime.valueBlock.valueHex), true, true),
      d: pvutils.toBase64(pvutils.arrayBufferToString(this.exponent.valueBlock.valueHex), true, true),
      t: pvutils.toBase64(pvutils.arrayBufferToString(this.coefficient.valueBlock.valueHex), true, true)
    };
  }

  /**
   * Converts JSON value into current object
   * @param json JSON object
   */
  public fromJSON(json: OtherPrimeInfoJson): void {
    ParameterError.assert("json", json, "r", "d", "r");

    this.prime = new asn1js.Integer({ valueHex: pvutils.stringToArrayBuffer(pvutils.fromBase64(json.r, true)) });
    this.exponent = new asn1js.Integer({ valueHex: pvutils.stringToArrayBuffer(pvutils.fromBase64(json.d, true)) });
    this.coefficient = new asn1js.Integer({ valueHex: pvutils.stringToArrayBuffer(pvutils.fromBase64(json.t, true)) });
  }

}
