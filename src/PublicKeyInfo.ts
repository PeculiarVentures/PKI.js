import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as common from "./common";
import { AlgorithmIdentifier, AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import { ECPublicKey } from "./ECPublicKey";
import { RSAPublicKey } from "./RSAPublicKey";
import * as Schema from "./Schema";

const ALGORITHM = "algorithm";
const SUBJECT_PUBLIC_KEY = "subjectPublicKey";
const CLEAR_PROPS = [ALGORITHM, SUBJECT_PUBLIC_KEY];

export interface PublicKeyInfoParameters extends Schema.SchemaConstructor {
  /**
   * Algorithm identifier
   */
  algorithm?: AlgorithmIdentifier;
  /**
   * Subject public key value
   */
  subjectPublicKey?: asn1js.BitString;
  /**
   * Parsed public key value
   */
  parsedKey?: ECPublicKey | RSAPublicKey;
  json?: any;
}

export type PublicKeyInfoSchema = Schema.SchemaParameters<{
  algorithm?: AlgorithmIdentifierSchema;
  subjectPublicKey?: string;
}>;

/**
 * Class from RFC5280
 */
export class PublicKeyInfo implements Schema.SchemaCompatible {

  /**
   * Algorithm identifier
   */
  public algorithm: AlgorithmIdentifier;
  /**
   * Subject public key value
   */
  public subjectPublicKey: asn1js.BitString;
  /**
   * Parsed public key value
   */
  public parsedKey?: ECPublicKey | RSAPublicKey;

  /**
   * Constructor for PublicKeyInfo class
   * @param parameters
   */
  constructor(parameters: PublicKeyInfoParameters = {}) {
    //#region Internal properties of the object
    this.algorithm = pvutils.getParametersValue(parameters, ALGORITHM, PublicKeyInfo.defaultValues(ALGORITHM));
    this.subjectPublicKey = pvutils.getParametersValue(parameters, SUBJECT_PUBLIC_KEY, PublicKeyInfo.defaultValues(SUBJECT_PUBLIC_KEY));
    const parsedKey = pvutils.getParametersValue(parameters, "parsedKey", null);
    if (parsedKey) {
      this.parsedKey = parsedKey;
    }
    //#endregion

    //#region If input argument array contains "schema" for this object
    if (parameters.schema)
      this.fromSchema(parameters.schema);
    //#endregion
    //#region If input argument array contains "json" for this object
    if (parameters.json)
      this.fromJSON(parameters.json);
    //#endregion
  }

  /**
   * Return default values for all class members
   * @param memberName String name for a class member
   */
  public static defaultValues(memberName: typeof ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof SUBJECT_PUBLIC_KEY): asn1js.BitString;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case ALGORITHM:
        return new AlgorithmIdentifier();
      case SUBJECT_PUBLIC_KEY:
        return new asn1js.BitString();
      default:
        throw new Error(`Invalid member name for PublicKeyInfo class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * SubjectPublicKeyInfo  ::=  Sequence  {
   *    algorithm            AlgorithmIdentifier,
   *    subjectPublicKey     BIT STRING  }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: PublicKeyInfoSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        AlgorithmIdentifier.schema(names.algorithm || {}),
        new asn1js.BitString({ name: (names.subjectPublicKey || "") })
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
      PublicKeyInfo.schema({
        names: {
          algorithm: {
            names: {
              blockName: ALGORITHM
            }
          },
          subjectPublicKey: SUBJECT_PUBLIC_KEY
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for PublicKeyInfo");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.algorithm = new AlgorithmIdentifier({ schema: asn1.result.algorithm });
    this.subjectPublicKey = asn1.result.subjectPublicKey;

    switch (this.algorithm.algorithmId) {
      // TODO Use fabric
      case "1.2.840.10045.2.1": // ECDSA
        if ("algorithmParams" in this.algorithm) {
          if (this.algorithm.algorithmParams.constructor.blockName() === asn1js.ObjectIdentifier.blockName()) {
            try {
              this.parsedKey = new ECPublicKey({
                namedCurve: this.algorithm.algorithmParams.valueBlock.toString(),
                schema: this.subjectPublicKey.valueBlock.valueHex
              });
            }
            catch (ex) {
              // nothing
            } // Could be a problems during recognition of internal public key data here. Let's ignore them.
          }
        }
        break;
      case "1.2.840.113549.1.1.1": // RSA
        {
          const publicKeyASN1 = asn1js.fromBER(this.subjectPublicKey.valueBlock.valueHex);
          if (publicKeyASN1.offset !== (-1)) {
            try {
              this.parsedKey = new RSAPublicKey({ schema: publicKeyASN1.result });
            }
            catch (ex) {
              // nothing
            } // Could be a problems during recognition of internal public key data here. Let's ignore them.
          }
        }
        break;
      default:
    }
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
        this.algorithm.toSchema(),
        this.subjectPublicKey
      ]
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    //#region Return common value in case we do not have enough info fo making JWK
    if (!this.parsedKey) {
      return {
        algorithm: this.algorithm.toJSON(),
        subjectPublicKey: this.subjectPublicKey.toJSON()
      };
    }
    //#endregion

    //#region Making JWK
    const jwk: any = {};

    switch (this.algorithm.algorithmId) {
      case "1.2.840.10045.2.1": // ECDSA
        jwk.kty = "EC";
        break;
      case "1.2.840.113549.1.1.1": // RSA
        jwk.kty = "RSA";
        break;
      default:
    }

    const publicKeyJWK = this.parsedKey.toJSON();
    Object.assign(jwk, publicKeyJWK);

    return jwk;
    //#endregion
  }

  /**
   * Convert JSON value into current object
   * @param json
   */
  public fromJSON(json: any): void {
    if ("kty" in json) {
      switch (json.kty.toUpperCase()) {
        case "EC":
          this.parsedKey = new ECPublicKey({ json });

          this.algorithm = new AlgorithmIdentifier({
            algorithmId: "1.2.840.10045.2.1",
            algorithmParams: new asn1js.ObjectIdentifier({ value: this.parsedKey.namedCurve })
          });
          break;
        case "RSA":
          this.parsedKey = new RSAPublicKey({ json });

          this.algorithm = new AlgorithmIdentifier({
            algorithmId: "1.2.840.113549.1.1.1",
            algorithmParams: new asn1js.Null()
          });
          break;
        default:
          throw new Error(`Invalid value for "kty" parameter: ${json.kty}`);
      }

      this.subjectPublicKey = new asn1js.BitString({ valueHex: this.parsedKey.toSchema().toBER(false) });
    }
  }

  public async importKey(publicKey: CryptoKey): Promise<void> {
    try {
      if (!publicKey) {
        throw new Error("Need to provide publicKey input parameter");
      }

      const crypto = common.getCrypto(true);
      const exportedKey = await crypto.exportKey("spki", publicKey);
      const asn1 = asn1js.fromBER(exportedKey);
      try {
        this.fromSchema(asn1.result);
      }
      catch (exception) {
        throw new Error("Error during initializing object from schema");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : `${e}`;
      throw new Error(`Error during exporting public key: ${message}`);
    }
  }

}
