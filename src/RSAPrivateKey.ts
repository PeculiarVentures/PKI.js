import * as asn1js from "asn1js";
import * as pvtsutils from "pvtsutils";
import * as pvutils from "pvutils";
import { ParameterError } from "./errors";
import { OtherPrimeInfo, JsonOtherPrimeInfo, OtherPrimeInfoSchema } from "./OtherPrimeInfo";
import * as Schema from "./Schema";

const VERSION = "version";
const MODULUS = "modulus";
const PUBLIC_EXPONENT = "publicExponent";
const PRIVATE_EXPONENT = "privateExponent";
const PRIME1 = "prime1";
const PRIME2 = "prime2";
const EXPONENT1 = "exponent1";
const EXPONENT2 = "exponent2";
const COEFFICIENT = "coefficient";
const OTHER_PRIME_INFOS = "otherPrimeInfos";
const CLEAR_PROPS = [
  VERSION,
  MODULUS,
  PUBLIC_EXPONENT,
  PRIVATE_EXPONENT,
  PRIME1,
  PRIME2,
  EXPONENT1,
  EXPONENT2,
  COEFFICIENT,
  OTHER_PRIME_INFOS
];

export interface RSAPrivateKeyParameters extends Schema.SchemaConstructor {
  version?: number;
  modulus?: asn1js.Integer;
  publicExponent?: asn1js.Integer;
  privateExponent?: asn1js.Integer;
  prime1?: asn1js.Integer;
  prime2?: asn1js.Integer;
  exponent1?: asn1js.Integer;
  exponent2?: asn1js.Integer;
  coefficient?: asn1js.Integer;
  otherPrimeInfosName?: asn1js.Integer;
  otherPrimeInfo?: asn1js.Integer;
  json?: JsonRSAPrivateKey;
}

export interface JsonRSAPrivateKey {
  n: string;
  e: string;
  d: string;
  p: string;
  q: string;
  dp: string;
  dq: string;
  qi: string;
  oth?: JsonOtherPrimeInfo[];
}

/**
 * Class from RFC3447
 */
export class RSAPrivateKey implements Schema.SchemaCompatible {

  public version: number;
  public modulus: asn1js.Integer;
  public publicExponent: asn1js.Integer;
  public privateExponent: asn1js.Integer;
  public prime1: asn1js.Integer;
  public prime2: asn1js.Integer;
  public exponent1: asn1js.Integer;
  public exponent2: asn1js.Integer;
  public coefficient: asn1js.Integer;
  public otherPrimeInfos?: OtherPrimeInfo[];

  /**
   * Constructor for RSAPrivateKey class
   * @param parameters
   */
  constructor(parameters: RSAPrivateKeyParameters = {}) {
    //#region Internal properties of the object
    this.version = pvutils.getParametersValue(parameters, VERSION, RSAPrivateKey.defaultValues(VERSION));
    this.modulus = pvutils.getParametersValue(parameters, MODULUS, RSAPrivateKey.defaultValues(MODULUS));
    this.publicExponent = pvutils.getParametersValue(parameters, PUBLIC_EXPONENT, RSAPrivateKey.defaultValues(PUBLIC_EXPONENT));
    this.privateExponent = pvutils.getParametersValue(parameters, PRIVATE_EXPONENT, RSAPrivateKey.defaultValues(PRIVATE_EXPONENT));
    this.prime1 = pvutils.getParametersValue(parameters, PRIME1, RSAPrivateKey.defaultValues(PRIME1));
    this.prime2 = pvutils.getParametersValue(parameters, PRIME2, RSAPrivateKey.defaultValues(PRIME2));
    this.exponent1 = pvutils.getParametersValue(parameters, EXPONENT1, RSAPrivateKey.defaultValues(EXPONENT1));
    this.exponent2 = pvutils.getParametersValue(parameters, EXPONENT2, RSAPrivateKey.defaultValues(EXPONENT2));
    this.coefficient = pvutils.getParametersValue(parameters, COEFFICIENT, RSAPrivateKey.defaultValues(COEFFICIENT));

    if (parameters.otherPrimeInfo) {
      this.otherPrimeInfos = pvutils.getParametersValue(parameters, OTHER_PRIME_INFOS, RSAPrivateKey.defaultValues(OTHER_PRIME_INFOS));
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
  public static defaultValues(memberName: typeof VERSION): number;
  public static defaultValues(memberName: typeof MODULUS): asn1js.Integer;
  public static defaultValues(memberName: typeof PUBLIC_EXPONENT): asn1js.Integer;
  public static defaultValues(memberName: typeof PRIVATE_EXPONENT): asn1js.Integer;
  public static defaultValues(memberName: typeof PRIME1): asn1js.Integer;
  public static defaultValues(memberName: typeof PRIME2): asn1js.Integer;
  public static defaultValues(memberName: typeof EXPONENT1): asn1js.Integer;
  public static defaultValues(memberName: typeof EXPONENT2): asn1js.Integer;
  public static defaultValues(memberName: typeof COEFFICIENT): asn1js.Integer;
  public static defaultValues(memberName: typeof OTHER_PRIME_INFOS): OtherPrimeInfo[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case VERSION:
        return 0;
      case MODULUS:
        return new asn1js.Integer();
      case PUBLIC_EXPONENT:
        return new asn1js.Integer();
      case PRIVATE_EXPONENT:
        return new asn1js.Integer();
      case PRIME1:
        return new asn1js.Integer();
      case PRIME2:
        return new asn1js.Integer();
      case EXPONENT1:
        return new asn1js.Integer();
      case EXPONENT2:
        return new asn1js.Integer();
      case COEFFICIENT:
        return new asn1js.Integer();
      case OTHER_PRIME_INFOS:
        return [];
      default:
        throw new Error(`Invalid member name for RSAPrivateKey class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * RSAPrivateKey ::= Sequence {
   *    version           Version,
   *    modulus           Integer,  -- n
   *    publicExponent    Integer,  -- e
   *    privateExponent   Integer,  -- d
   *    prime1            Integer,  -- p
   *    prime2            Integer,  -- q
   *    exponent1         Integer,  -- d mod (p-1)
   *    exponent2         Integer,  -- d mod (q-1)
   *    coefficient       Integer,  -- (inverse of q) mod p
   *    otherPrimeInfos   OtherPrimeInfos OPTIONAL
   * }
   *
   * OtherPrimeInfos ::= Sequence SIZE(1..MAX) OF OtherPrimeInfo
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    version?: string;
    modulus?: string;
    publicExponent?: string;
    privateExponent?: string;
    prime1?: string;
    prime2?: string;
    exponent1?: string;
    exponent2?: string;
    coefficient?: string;
    otherPrimeInfosName?: string;
    otherPrimeInfo?: OtherPrimeInfoSchema;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Integer({ name: (names.version || "") }),
        new asn1js.Integer({ name: (names.modulus || "") }),
        new asn1js.Integer({ name: (names.publicExponent || "") }),
        new asn1js.Integer({ name: (names.privateExponent || "") }),
        new asn1js.Integer({ name: (names.prime1 || "") }),
        new asn1js.Integer({ name: (names.prime2 || "") }),
        new asn1js.Integer({ name: (names.exponent1 || "") }),
        new asn1js.Integer({ name: (names.exponent2 || "") }),
        new asn1js.Integer({ name: (names.coefficient || "") }),
        new asn1js.Sequence({
          optional: true,
          value: [
            new asn1js.Repeated({
              name: (names.otherPrimeInfosName || ""),
              value: OtherPrimeInfo.schema(names.otherPrimeInfo || {})
            })
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
      RSAPrivateKey.schema({
        names: {
          version: VERSION,
          modulus: MODULUS,
          publicExponent: PUBLIC_EXPONENT,
          privateExponent: PRIVATE_EXPONENT,
          prime1: PRIME1,
          prime2: PRIME2,
          exponent1: EXPONENT1,
          exponent2: EXPONENT2,
          coefficient: COEFFICIENT,
          otherPrimeInfo: {
            names: {
              blockName: OTHER_PRIME_INFOS
            }
          }
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for RSAPrivateKey");
    //#endregion

    //#region Get internal properties from parsed schema
    this.version = asn1.result.version.valueBlock.valueDec;
    this.modulus = asn1.result.modulus.convertFromDER(256);
    this.publicExponent = asn1.result.publicExponent;
    this.privateExponent = asn1.result.privateExponent.convertFromDER(256);
    this.prime1 = asn1.result.prime1.convertFromDER(128);
    this.prime2 = asn1.result.prime2.convertFromDER(128);
    this.exponent1 = asn1.result.exponent1.convertFromDER(128);
    this.exponent2 = asn1.result.exponent2.convertFromDER(128);
    this.coefficient = asn1.result.coefficient.convertFromDER(128);

    if (OTHER_PRIME_INFOS in asn1.result)
      this.otherPrimeInfos = Array.from(asn1.result.otherPrimeInfos, element => new OtherPrimeInfo({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Create array for output sequence
    const outputArray = [];

    outputArray.push(new asn1js.Integer({ value: this.version }));
    outputArray.push(this.modulus.convertToDER());
    outputArray.push(this.publicExponent);
    outputArray.push(this.privateExponent.convertToDER());
    outputArray.push(this.prime1.convertToDER());
    outputArray.push(this.prime2.convertToDER());
    outputArray.push(this.exponent1.convertToDER());
    outputArray.push(this.exponent2.convertToDER());
    outputArray.push(this.coefficient.convertToDER());

    if (this.otherPrimeInfos) {
      outputArray.push(new asn1js.Sequence({
        value: Array.from(this.otherPrimeInfos, element => element.toSchema())
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
   * @returns
   */
  public toJSON(): JsonRSAPrivateKey {
    const jwk: JsonRSAPrivateKey = {
      n: pvutils.toBase64(pvutils.arrayBufferToString(this.modulus.valueBlock.valueHex), true, true, true),
      e: pvutils.toBase64(pvutils.arrayBufferToString(this.publicExponent.valueBlock.valueHex), true, true, true),
      d: pvutils.toBase64(pvutils.arrayBufferToString(this.privateExponent.valueBlock.valueHex), true, true, true),
      p: pvutils.toBase64(pvutils.arrayBufferToString(this.prime1.valueBlock.valueHex), true, true, true),
      q: pvutils.toBase64(pvutils.arrayBufferToString(this.prime2.valueBlock.valueHex), true, true, true),
      dp: pvutils.toBase64(pvutils.arrayBufferToString(this.exponent1.valueBlock.valueHex), true, true, true),
      dq: pvutils.toBase64(pvutils.arrayBufferToString(this.exponent2.valueBlock.valueHex), true, true, true),
      qi: pvutils.toBase64(pvutils.arrayBufferToString(this.coefficient.valueBlock.valueHex), true, true, true)
    };

    if (this.otherPrimeInfos) {
      jwk.oth = Array.from(this.otherPrimeInfos, element => element.toJSON());
    }

    return jwk;
  }

  /**
   * Convert JSON value into current object
   * @param json
   */
  public fromJSON(json: any): void {
    ParameterError.assert("json", json, "n", "e", "d", "p", "q", "dp", "dq", "qi");
    this.modulus = new asn1js.Integer({ valueHex: pvtsutils.Convert.FromBase64Url(json.n) });
    this.publicExponent = new asn1js.Integer({ valueHex: pvtsutils.Convert.FromBase64Url(json.e) });
    this.privateExponent = new asn1js.Integer({ valueHex: pvtsutils.Convert.FromBase64Url(json.d) });
    this.prime1 = new asn1js.Integer({ valueHex: pvtsutils.Convert.FromBase64Url(json.p) });
    this.prime2 = new asn1js.Integer({ valueHex: pvtsutils.Convert.FromBase64Url(json.q) });
    this.exponent1 = new asn1js.Integer({ valueHex: pvtsutils.Convert.FromBase64Url(json.dp) });
    this.exponent2 = new asn1js.Integer({ valueHex: pvtsutils.Convert.FromBase64Url(json.dq) });
    this.coefficient = new asn1js.Integer({ valueHex: pvtsutils.Convert.FromBase64Url(json.qi) });
    if (json.oth) {
      this.otherPrimeInfos = Array.from(json.oth, (element: any) => new OtherPrimeInfo({ json: element }));
    }
  }

}
