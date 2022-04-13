import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { AlgorithmIdentifier, AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import { Attribute } from "./Attribute";
import { ECPrivateKey } from "./ECPrivateKey";
import { RSAPrivateKey } from "./RSAPrivateKey";
import * as Schema from "./Schema";

const VERSION = "version";
const PRIVATE_KEY_ALGORITHM = "privateKeyAlgorithm";
const PRIVATE_KEY = "privateKey";
const ATTRIBUTES = "attributes";
const PARSED_KEY = "parsedKey";
const CLEAR_PROPS = [
  VERSION,
  PRIVATE_KEY_ALGORITHM,
  PRIVATE_KEY,
  ATTRIBUTES
];

export interface PrivateKeyInfoParameters extends Schema.SchemaConstructor {
  version?: number;
  privateKeyAlgorithm?: AlgorithmIdentifier;
  privateKey?: asn1js.OctetString;
  attributes?: Attribute[];
  parsedKey?: RSAPrivateKey | ECPrivateKey;
  json?: JsonWebKey;
}

/**
 * Class from RFC5208
 */
export class PrivateKeyInfo implements Schema.SchemaCompatible {

  public version: number;
  public privateKeyAlgorithm: AlgorithmIdentifier;
  public privateKey: asn1js.OctetString;
  public attributes?: Attribute[];
  public parsedKey?: RSAPrivateKey | ECPrivateKey;

  /**
   * Constructor for PrivateKeyInfo class
   * @param parameters
   */
  constructor(parameters: PrivateKeyInfoParameters = {}) {
    //#region Internal properties of the object
    this.version = pvutils.getParametersValue(parameters, VERSION, PrivateKeyInfo.defaultValues(VERSION));
    this.privateKeyAlgorithm = pvutils.getParametersValue(parameters, PRIVATE_KEY_ALGORITHM, PrivateKeyInfo.defaultValues(PRIVATE_KEY_ALGORITHM));
    this.privateKey = pvutils.getParametersValue(parameters, PRIVATE_KEY, PrivateKeyInfo.defaultValues(PRIVATE_KEY));

    if (parameters.attributes) {
      this.attributes = pvutils.getParametersValue(parameters, ATTRIBUTES, PrivateKeyInfo.defaultValues(ATTRIBUTES));
    }
    if (parameters.parsedKey) {
      this.parsedKey = pvutils.getParametersValue(parameters, PARSED_KEY, PrivateKeyInfo.defaultValues(PARSED_KEY));
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
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case VERSION:
        return 0;
      case PRIVATE_KEY_ALGORITHM:
        return new AlgorithmIdentifier();
      case PRIVATE_KEY:
        return new asn1js.OctetString();
      case ATTRIBUTES:
        return [];
      case PARSED_KEY:
        return {};
      default:
        throw new Error(`Invalid member name for PrivateKeyInfo class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * PrivateKeyInfo ::= SEQUENCE {
   *    version Version,
   *    privateKeyAlgorithm AlgorithmIdentifier {{PrivateKeyAlgorithms}},
   *    privateKey PrivateKey,
   *    attributes [0] Attributes OPTIONAL }
   *
   * Version ::= INTEGER {v1(0)} (v1,...)
   *
   * PrivateKey ::= OCTET STRING
   *
   * Attributes ::= SET OF Attribute
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    version?: string;
    privateKeyAlgorithm?: AlgorithmIdentifierSchema;
    privateKey?: string;
    attributes?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Integer({ name: (names.version || "") }),
        AlgorithmIdentifier.schema(names.privateKeyAlgorithm || {}),
        new asn1js.OctetString({ name: (names.privateKey || "") }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [
            new asn1js.Repeated({
              name: (names.attributes || ""),
              value: Attribute.schema()
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
      PrivateKeyInfo.schema({
        names: {
          version: VERSION,
          privateKeyAlgorithm: {
            names: {
              blockName: PRIVATE_KEY_ALGORITHM
            }
          },
          privateKey: PRIVATE_KEY,
          attributes: ATTRIBUTES
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for PrivateKeyInfo");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.version = asn1.result.version.valueBlock.valueDec;
    this.privateKeyAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.privateKeyAlgorithm });
    this.privateKey = asn1.result.privateKey;

    if (ATTRIBUTES in asn1.result)
      this.attributes = Array.from(asn1.result.attributes, element => new Attribute({ schema: element }));

    // TODO Use factory
    switch (this.privateKeyAlgorithm.algorithmId) {
      case "1.2.840.113549.1.1.1": // RSA
        {
          const privateKeyASN1 = asn1js.fromBER(this.privateKey.valueBlock.valueHex);
          if (privateKeyASN1.offset !== (-1))
            this.parsedKey = new RSAPrivateKey({ schema: privateKeyASN1.result });
        }
        break;
      case "1.2.840.10045.2.1": // ECDSA
        if ("algorithmParams" in this.privateKeyAlgorithm) {
          if (this.privateKeyAlgorithm.algorithmParams instanceof asn1js.ObjectIdentifier) {
            const privateKeyASN1 = asn1js.fromBER(this.privateKey.valueBlock.valueHex);
            if (privateKeyASN1.offset !== (-1)) {
              this.parsedKey = new ECPrivateKey({
                namedCurve: this.privateKeyAlgorithm.algorithmParams.valueBlock.toString(),
                schema: privateKeyASN1.result
              });
            }
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
    //#region Create array for output sequence
    const outputArray: any = [
      new asn1js.Integer({ value: this.version }),
      this.privateKeyAlgorithm.toSchema(),
      this.privateKey
    ];

    if (this.attributes) {
      outputArray.push(new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: Array.from(this.attributes, element => element.toSchema())
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
  public toJSON(): JsonWebKey {
    //#region Return common value in case we do not have enough info fo making JWK
    if (!this.parsedKey) {
      const object: any = {
        version: this.version,
        privateKeyAlgorithm: this.privateKeyAlgorithm.toJSON(),
        privateKey: this.privateKey.toJSON()
      };

      if (this.attributes) {
        object.attributes = Array.from(this.attributes, element => element.toJSON());
      }

      return object;
    }
    //#endregion

    //#region Making JWK
    const jwk: JsonWebKey = {};

    switch (this.privateKeyAlgorithm.algorithmId) {
      case "1.2.840.10045.2.1": // ECDSA
        jwk.kty = "EC";
        break;
      case "1.2.840.113549.1.1.1": // RSA
        jwk.kty = "RSA";
        break;
      default:
    }

    // TODO Unclear behavior
    const publicKeyJWK = this.parsedKey!.toJSON();
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
          this.parsedKey = new ECPrivateKey({ json });

          this.privateKeyAlgorithm = new AlgorithmIdentifier({
            algorithmId: "1.2.840.10045.2.1",
            algorithmParams: new asn1js.ObjectIdentifier({ value: this.parsedKey.namedCurve })
          });
          break;
        case "RSA":
          this.parsedKey = new RSAPrivateKey({ json });

          this.privateKeyAlgorithm = new AlgorithmIdentifier({
            algorithmId: "1.2.840.113549.1.1.1",
            algorithmParams: new asn1js.Null()
          });
          break;
        default:
          throw new Error(`Invalid value for "kty" parameter: ${json.kty}`);
      }

      this.privateKey = new asn1js.OctetString({ valueHex: this.parsedKey.toSchema().toBER(false) });
    }
  }

}
