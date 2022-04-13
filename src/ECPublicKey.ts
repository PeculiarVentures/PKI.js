import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { ECNamedCurves } from "./ECNamedCurves";
import { ArgumentError, ParameterError } from "./errors";
import * as Schema from "./Schema";

const X = "x";
const Y = "y";
const NAMED_CURVE = "namedCurve";

export interface JsonECPublicKey {
  crv: string;
  x: string;
  y: string;
}

export interface ECPublicKeyParameters extends Schema.SchemaConstructor {
  namedCurve?: string;
  x?: ArrayBuffer;
  y?: ArrayBuffer;
  json?: JsonECPublicKey;
}

/**
 * Class from RFC5480
 */
export class ECPublicKey implements Schema.SchemaCompatible {

  public namedCurve: string;
  public x: ArrayBuffer;
  public y: ArrayBuffer;

  /**
   * Constructor for ECCPublicKey class
   * @param parameters
   */
  constructor(parameters: ECPublicKeyParameters = {}) {
    //#region Internal properties of the object
    this.x = pvutils.getParametersValue(parameters, X, ECPublicKey.defaultValues(X));
    this.y = pvutils.getParametersValue(parameters, Y, ECPublicKey.defaultValues(Y));
    this.namedCurve = pvutils.getParametersValue(parameters, NAMED_CURVE, ECPublicKey.defaultValues(NAMED_CURVE));
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
  public static defaultValues(memberName: typeof NAMED_CURVE): string;
  public static defaultValues(memberName: typeof X | typeof Y): ArrayBuffer;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case X:
      case Y:
        return new ArrayBuffer(0);
      case NAMED_CURVE:
        return "";
      default:
        throw new Error(`Invalid member name for ECCPublicKey class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  static compareWithDefault<T>(memberName: string, memberValue: T): memberValue is T {
    switch (memberName) {
      case X:
      case Y:
        return memberValue instanceof ArrayBuffer &&
          (pvutils.isEqualBuffer(memberValue, ECPublicKey.defaultValues(memberName)));
      case NAMED_CURVE:
        return typeof memberValue === "string" &&
          memberValue === ECPublicKey.defaultValues(memberName);
      default:
        throw new Error(`Invalid member name for ECCPublicKey class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(): Schema.SchemaType {
    return new asn1js.RawData();
  }

  /**
   * Convert ArrayBuffer into current class
   * @param schema Special case: schema is an ArrayBuffer
   */
  fromSchema(schema: ArrayBuffer): any {
    //region Check the schema is valid
    ArgumentError.assert(schema, "schema", "ArrayBuffer");

    const view = new Uint8Array(schema);
    if (view[0] !== 0x04) {
      throw new Error("Object's schema was not verified against input data for ECPublicKey");
    }
    //endregion

    //region Get internal properties from parsed schema
    const namedCurve = ECNamedCurves.find(this.namedCurve);
    if (!namedCurve) {
      throw new Error(`Incorrect curve OID: ${this.namedCurve}`);
    }
    const coordinateLength = namedCurve.size;

    if (schema.byteLength !== (coordinateLength * 2 + 1)) {
      throw new Error("Object's schema was not verified against input data for ECPublicKey");
    }

    this.x = schema.slice(1, coordinateLength + 1);
    this.y = schema.slice(1 + coordinateLength, coordinateLength * 2 + 1);
    //endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.RawData {
    return new asn1js.RawData({
      data: pvutils.utilConcatBuf(
        (new Uint8Array([0x04])).buffer,
        this.x,
        this.y
      )
    });
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): JsonECPublicKey {
    const namedCurve = ECNamedCurves.find(this.namedCurve);

    return {
      crv: namedCurve ? namedCurve.name : this.namedCurve,
      x: pvutils.toBase64(pvutils.arrayBufferToString(this.x), true, true, false),
      y: pvutils.toBase64(pvutils.arrayBufferToString(this.y), true, true, false)
    };
  }

  /**
   * Convert JSON value into current object
   * @param json
   */
  public fromJSON(json: any): void {
    ParameterError.assert("json", json, "crv", "x", "y");

    let coordinateLength = 0;
    const namedCurve = ECNamedCurves.find(json.crv);
    if (namedCurve) {
      this.namedCurve = namedCurve.id;
      coordinateLength = namedCurve.size;
    }

    // TODO Simplify Base64url encoding
    const xConvertBuffer = pvutils.stringToArrayBuffer(pvutils.fromBase64(json.x, true));

    if (xConvertBuffer.byteLength < coordinateLength) {
      this.x = new ArrayBuffer(coordinateLength);
      const view = new Uint8Array(this.x);
      const convertBufferView = new Uint8Array(xConvertBuffer);
      view.set(convertBufferView, 1);
    } else {
      this.x = xConvertBuffer.slice(0, coordinateLength);
    }

    // // TODO Simplify Base64url encoding
    const yConvertBuffer = pvutils.stringToArrayBuffer(pvutils.fromBase64(json.y, true));

    if (yConvertBuffer.byteLength < coordinateLength) {
      this.y = new ArrayBuffer(coordinateLength);
      const view = new Uint8Array(this.y);
      const convertBufferView = new Uint8Array(yConvertBuffer);
      view.set(convertBufferView, 1);
    } else {
      this.y = yConvertBuffer.slice(0, coordinateLength);
    }
  }

}
