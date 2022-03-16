import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import AlgorithmIdentifier, { AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import * as Schema from "./Schema";

const HASH_ALGORITHM = "hashAlgorithm";
const MASK_GEN_ALGORITHM = "maskGenAlgorithm";
const P_SOURCE_ALGORITHM = "pSourceAlgorithm";
const CLEAR_PROPS = [
  HASH_ALGORITHM,
  MASK_GEN_ALGORITHM,
  P_SOURCE_ALGORITHM
];

export interface RSAESOAEPParamsParameters extends Schema.SchemaConstructor {
  hashAlgorithm?: AlgorithmIdentifier;
  maskGenAlgorithm?: AlgorithmIdentifier;
  pSourceAlgorithm?: AlgorithmIdentifier;
}

/**
 * Class from RFC3447
 */
export default class RSAESOAEPParams implements Schema.SchemaCompatible {

  public hashAlgorithm: AlgorithmIdentifier;
  public maskGenAlgorithm: AlgorithmIdentifier;
  public pSourceAlgorithm: AlgorithmIdentifier;

  /**
   * Constructor for RSAESOAEPParams class
   * @param parameters
   */
  constructor(parameters: RSAESOAEPParamsParameters = {}) {
    //#region Internal properties of the object
    this.hashAlgorithm = pvutils.getParametersValue(parameters, HASH_ALGORITHM, RSAESOAEPParams.defaultValues(HASH_ALGORITHM));
    this.maskGenAlgorithm = pvutils.getParametersValue(parameters, MASK_GEN_ALGORITHM, RSAESOAEPParams.defaultValues(MASK_GEN_ALGORITHM));
    this.pSourceAlgorithm = pvutils.getParametersValue(parameters, P_SOURCE_ALGORITHM, RSAESOAEPParams.defaultValues(P_SOURCE_ALGORITHM));
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
  public static defaultValues(memberName: typeof HASH_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof MASK_GEN_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof P_SOURCE_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case HASH_ALGORITHM:
        return new AlgorithmIdentifier({
          algorithmId: "1.3.14.3.2.26", // SHA-1
          algorithmParams: new asn1js.Null()
        });
      case MASK_GEN_ALGORITHM:
        return new AlgorithmIdentifier({
          algorithmId: "1.2.840.113549.1.1.8", // MGF1
          algorithmParams: (new AlgorithmIdentifier({
            algorithmId: "1.3.14.3.2.26", // SHA-1
            algorithmParams: new asn1js.Null()
          })).toSchema()
        });
      case P_SOURCE_ALGORITHM:
        return new AlgorithmIdentifier({
          algorithmId: "1.2.840.113549.1.1.9", // id-pSpecified
          algorithmParams: new asn1js.OctetString({ valueHex: (new Uint8Array([0xda, 0x39, 0xa3, 0xee, 0x5e, 0x6b, 0x4b, 0x0d, 0x32, 0x55, 0xbf, 0xef, 0x95, 0x60, 0x18, 0x90, 0xaf, 0xd8, 0x07, 0x09])).buffer }) // SHA-1 hash of empty string
        });
      default:
        throw new Error(`Invalid member name for RSAESOAEPParams class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * RSAES-OAEP-params ::= SEQUENCE {
   *    hashAlgorithm     [0] HashAlgorithm    DEFAULT sha1,
   *    maskGenAlgorithm  [1] MaskGenAlgorithm DEFAULT mgf1SHA1,
   *    pSourceAlgorithm  [2] PSourceAlgorithm DEFAULT pSpecifiedEmpty
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    hashAlgorithm?: AlgorithmIdentifierSchema;
    maskGenAlgorithm?: AlgorithmIdentifierSchema;
    pSourceAlgorithm?: AlgorithmIdentifierSchema;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          optional: true,
          value: [AlgorithmIdentifier.schema(names.hashAlgorithm || {})]
        }),
        new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          optional: true,
          value: [AlgorithmIdentifier.schema(names.maskGenAlgorithm || {})]
        }),
        new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 2 // [2]
          },
          optional: true,
          value: [AlgorithmIdentifier.schema(names.pSourceAlgorithm || {})]
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
      RSAESOAEPParams.schema({
        names: {
          hashAlgorithm: {
            names: {
              blockName: HASH_ALGORITHM
            }
          },
          maskGenAlgorithm: {
            names: {
              blockName: MASK_GEN_ALGORITHM
            }
          },
          pSourceAlgorithm: {
            names: {
              blockName: P_SOURCE_ALGORITHM
            }
          }
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for RSAESOAEPParams");
    //#endregion

    //#region Get internal properties from parsed schema
    if (HASH_ALGORITHM in asn1.result)
      this.hashAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.hashAlgorithm });

    if (MASK_GEN_ALGORITHM in asn1.result)
      this.maskGenAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.maskGenAlgorithm });

    if (P_SOURCE_ALGORITHM in asn1.result)
      this.pSourceAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.pSourceAlgorithm });
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): Schema.SchemaType {
    //#region Create array for output sequence
    const outputArray = [];

    if (!this.hashAlgorithm.isEqual(RSAESOAEPParams.defaultValues(HASH_ALGORITHM))) {
      outputArray.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: [this.hashAlgorithm.toSchema()]
      }));
    }

    if (!this.maskGenAlgorithm.isEqual(RSAESOAEPParams.defaultValues(MASK_GEN_ALGORITHM))) {
      outputArray.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 1 // [1]
        },
        value: [this.maskGenAlgorithm.toSchema()]
      }));
    }

    if (!this.pSourceAlgorithm.isEqual(RSAESOAEPParams.defaultValues(P_SOURCE_ALGORITHM))) {
      outputArray.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 2 // [2]
        },
        value: [this.pSourceAlgorithm.toSchema()]
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
  public toJSON(): any {
    const object: any = {};

    if (!this.hashAlgorithm.isEqual(RSAESOAEPParams.defaultValues(HASH_ALGORITHM))) {
      object.hashAlgorithm = this.hashAlgorithm.toJSON();
    }

    if (!this.maskGenAlgorithm.isEqual(RSAESOAEPParams.defaultValues(MASK_GEN_ALGORITHM))) {
      object.maskGenAlgorithm = this.maskGenAlgorithm.toJSON();
    }

    if (!this.pSourceAlgorithm.isEqual(RSAESOAEPParams.defaultValues(P_SOURCE_ALGORITHM))) {
      object.pSourceAlgorithm = this.pSourceAlgorithm.toJSON();
    }

    return object;
  }

}

