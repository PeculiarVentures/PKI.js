import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { ECNamedCurves } from "./ECNamedCurves";
import { ECPublicKey, ECPublicKeyParameters } from "./ECPublicKey";
import { ParameterError } from "./errors";
import * as Schema from "./Schema";

const VERSION = "version";
const PRIVATE_KEY = "privateKey";
const NAMED_CURVE = "namedCurve";
const PUBLIC_KEY = "publicKey";
const CLEAR_PROPS = [
  VERSION,
  PRIVATE_KEY,
  NAMED_CURVE,
  PUBLIC_KEY
];

export interface ECPrivateKeyParameters extends Schema.SchemaConstructor {
  version?: number;
  privateKey?: asn1js.OctetString;
  namedCurve?: string;
  publicKey?: ECPublicKey;
  json?: any;
}

export interface JsonECPrivateKey {
  crv: string;
  y?: string;
  x?: string;
  d: string;
}

/**
 * Class from RFC5915
 */
export class ECPrivateKey implements Schema.SchemaCompatible {

  public version: number;
  public privateKey: asn1js.OctetString;
  public namedCurve?: string;
  public publicKey?: ECPublicKey;

  /**
   * Constructor for ECPrivateKey class
   * @param parameters
   */
  constructor(parameters: ECPrivateKeyParameters = {}) {
    //#region Internal properties of the object
    this.version = pvutils.getParametersValue(parameters, VERSION, ECPrivateKey.defaultValues(VERSION));
    this.privateKey = pvutils.getParametersValue(parameters, PRIVATE_KEY, ECPrivateKey.defaultValues(PRIVATE_KEY));

    if (parameters.namedCurve) {
      this.namedCurve = pvutils.getParametersValue(parameters, NAMED_CURVE, ECPrivateKey.defaultValues(NAMED_CURVE));
    }

    if (parameters.publicKey) {
      this.publicKey = pvutils.getParametersValue(parameters, PUBLIC_KEY, ECPrivateKey.defaultValues(PUBLIC_KEY));
    }
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
  public static defaultValues(memberName: typeof VERSION): 1;
  public static defaultValues(memberName: typeof PRIVATE_KEY): asn1js.OctetString;
  public static defaultValues(memberName: typeof NAMED_CURVE): string;
  public static defaultValues(memberName: typeof PUBLIC_KEY): ECPublicKey;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case VERSION:
        return 1;
      case PRIVATE_KEY:
        return new asn1js.OctetString();
      case NAMED_CURVE:
        return "";
      case PUBLIC_KEY:
        return new ECPublicKey();
      default:
        throw new Error(`Invalid member name for ECCPrivateKey class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case VERSION:
        return (memberValue === ECPrivateKey.defaultValues(memberName));
      case PRIVATE_KEY:
        return (memberValue.isEqual(ECPrivateKey.defaultValues(memberName)));
      case NAMED_CURVE:
        return (memberValue === "");
      case PUBLIC_KEY:
        return ((ECPublicKey.compareWithDefault(NAMED_CURVE, memberValue.namedCurve)) &&
          (ECPublicKey.compareWithDefault("x", memberValue.x)) &&
          (ECPublicKey.compareWithDefault("y", memberValue.y)));
      default:
        throw new Error(`Invalid member name for ECCPrivateKey class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * ECPrivateKey ::= SEQUENCE {
   * version        INTEGER { ecPrivkeyVer1(1) } (ecPrivkeyVer1),
   * privateKey     OCTET STRING,
   * parameters [0] ECParameters {{ NamedCurve }} OPTIONAL,
   * publicKey  [1] BIT STRING OPTIONAL
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    version?: string;
    privateKey?: string;
    namedCurve?: string;
    publicKey?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Integer({ name: (names.version || "") }),
        new asn1js.OctetString({ name: (names.privateKey || "") }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [
            new asn1js.ObjectIdentifier({ name: (names.namedCurve || "") })
          ]
        }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          value: [
            new asn1js.BitString({ name: (names.publicKey || "") })
          ]
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
    pvutils.clearProps(schema, CLEAR_PROPS);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      ECPrivateKey.schema({
        names: {
          version: VERSION,
          privateKey: PRIVATE_KEY,
          namedCurve: NAMED_CURVE,
          publicKey: PUBLIC_KEY
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for ECPrivateKey");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.version = asn1.result.version.valueBlock.valueDec;
    this.privateKey = asn1.result.privateKey;

    if (NAMED_CURVE in asn1.result)
      this.namedCurve = asn1.result.namedCurve.valueBlock.toString();

    if (PUBLIC_KEY in asn1.result) {
      const publicKeyData: ECPublicKeyParameters = { schema: asn1.result.publicKey.valueBlock.valueHex };
      if (NAMED_CURVE in this) {
        publicKeyData.namedCurve = this.namedCurve;
      }

      this.publicKey = new ECPublicKey(publicKeyData);
    }
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    const outputArray: any = [
      new asn1js.Integer({ value: this.version }),
      this.privateKey
    ];

    if (this.namedCurve) {
      outputArray.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: [
          new asn1js.ObjectIdentifier({ value: this.namedCurve })
        ]
      }));
    }

    if (this.publicKey) {
      outputArray.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 1 // [1]
        },
        value: [
          new asn1js.BitString({ valueHex: this.publicKey.toSchema().toBER(false) })
        ]
      }));
    }

    return new asn1js.Sequence({
      value: outputArray
    });
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    if (!this.namedCurve || ECPrivateKey.compareWithDefault(NAMED_CURVE, this.namedCurve)) {
      throw new Error("Not enough information for making JSON: absent \"namedCurve\" value");
    }

    const curve = ECNamedCurves.find(this.namedCurve);

    const privateKeyJSON: JsonECPrivateKey = {
      crv: curve ? curve.name : this.namedCurve,
      d: pvutils.toBase64(pvutils.arrayBufferToString(this.privateKey.valueBlock.valueHex), true, true, false)
    };

    if (this.publicKey) {
      const publicKeyJSON = this.publicKey.toJSON();

      privateKeyJSON.x = publicKeyJSON.x;
      privateKeyJSON.y = publicKeyJSON.y;
    }

    return privateKeyJSON;
  }

  /**
   * Convert JSON value into current object
   * @param json
   */
  public fromJSON(json: any): void {
    ParameterError.assert("json", json, "crv", "d");

    let coordinateLength = 0;

    const curve = ECNamedCurves.find(json.crv);
    if (curve) {
      this.namedCurve = curve.id;
      coordinateLength = curve.size;
    }

    const convertBuffer = pvutils.stringToArrayBuffer(pvutils.fromBase64(json.d, true));

    if (convertBuffer.byteLength < coordinateLength) {
      const buffer = new ArrayBuffer(coordinateLength);
      const view = new Uint8Array(buffer);
      const convertBufferView = new Uint8Array(convertBuffer);
      view.set(convertBufferView, 1);

      this.privateKey = new asn1js.OctetString({ valueHex: buffer });
    } else {
      this.privateKey = new asn1js.OctetString({ valueHex: convertBuffer.slice(0, coordinateLength) });
    }

    if (json.x && json.y) {
      this.publicKey = new ECPublicKey({ json });
    }
  }

}
