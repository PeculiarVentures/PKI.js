import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { AsnError, ParameterError } from "./errors";
import { PkiObject, PkiObjectParameters } from "./PkiObject";
import * as Schema from "./Schema";

export interface IRSAPublicKey {
  /**
   * Modulus part of RSA public key
   */
  modulus: asn1js.Integer;
  /**
   * Public exponent of RSA public key
   */
  publicExponent: asn1js.Integer;
}

export interface RSAPublicKeyJson {
  n: string;
  e: string;
}

export type RSAPublicKeyParameters = PkiObjectParameters & Partial<IRSAPublicKey> & { json?: RSAPublicKeyJson; };

const MODULUS = "modulus";
const PUBLIC_EXPONENT = "publicExponent";
const CLEAR_PROPS = [MODULUS, PUBLIC_EXPONENT];

/**
 * Represents the RSAPublicKey structure described in [RFC3447](https://datatracker.ietf.org/doc/html/rfc3447)
 */
export class RSAPublicKey extends PkiObject implements IRSAPublicKey {

  public static override CLASS_NAME = "RSAPublicKey";

  public modulus!: asn1js.Integer;
  public publicExponent!: asn1js.Integer;

  /**
   * Initializes a new instance of the {@link RSAPublicKey} class
   * @param parameters Initialization parameters
   */
  constructor(parameters: RSAPublicKeyParameters = {}) {
    super();


    this.modulus = pvutils.getParametersValue(parameters, MODULUS, RSAPublicKey.defaultValues(MODULUS));
    this.publicExponent = pvutils.getParametersValue(parameters, PUBLIC_EXPONENT, RSAPublicKey.defaultValues(PUBLIC_EXPONENT));

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
  public static override defaultValues(memberName: typeof MODULUS | typeof PUBLIC_EXPONENT): asn1js.Integer;
  public static override defaultValues(memberName: string): any {
    switch (memberName) {
      case MODULUS:
        return new asn1js.Integer();
      case PUBLIC_EXPONENT:
        return new asn1js.Integer();
      default:
        return super.defaultValues(memberName);
    }
  }

  /**
   * Returns value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn
   * RSAPublicKey ::= Sequence {
   *    modulus           Integer,  -- n
   *    publicExponent    Integer   -- e
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns ASN.1 schema object
   */
  public static override schema(parameters: Schema.SchemaParameters<{ modulus?: string; publicExponent?: string; }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Integer({ name: (names.modulus || "") }),
        new asn1js.Integer({ name: (names.publicExponent || "") })
      ]
    }));
  }

  public fromSchema(schema: Schema.SchemaNames): void {
    // Clear input data first
    pvutils.clearProps(schema, CLEAR_PROPS);

    // Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      RSAPublicKey.schema({
        names: {
          modulus: MODULUS,
          publicExponent: PUBLIC_EXPONENT
        }
      })
    );
    AsnError.assertSchema(asn1, this.className);

    // Get internal properties from parsed schema
    this.modulus = asn1.result.modulus.convertFromDER(256);
    this.publicExponent = asn1.result.publicExponent;
  }

  public toSchema(): asn1js.Sequence {
    return (new asn1js.Sequence({
      value: [
        this.modulus.convertToDER(),
        this.publicExponent
      ]
    }));
  }

  public toJSON(): RSAPublicKeyJson {
    return {
      n: pvutils.toBase64(pvutils.arrayBufferToString(this.modulus.valueBlock.valueHex), true, true, true),
      e: pvutils.toBase64(pvutils.arrayBufferToString(this.publicExponent.valueBlock.valueHex), true, true, true)
    };
  }

  /**
   * Converts JSON value into current object
   * @param json JSON object
   */
  fromJSON(json: RSAPublicKeyJson): void {
    ParameterError.assert("json", json, "n", "e");

    const array = pvutils.stringToArrayBuffer(pvutils.fromBase64(json.n, true));
    this.modulus = new asn1js.Integer({ valueHex: array.slice(0, Math.pow(2, pvutils.nearestPowerOf2(array.byteLength))) });
    this.publicExponent = new asn1js.Integer({ valueHex: pvutils.stringToArrayBuffer(pvutils.fromBase64(json.e, true)).slice(0, 3) });
  }

}

