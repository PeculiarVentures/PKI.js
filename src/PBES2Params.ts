import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { AlgorithmIdentifier, AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import * as Schema from "./Schema";

const KEY_DERIVATION_FUNC = "keyDerivationFunc";
const ENCRYPTION_SCHEME = "encryptionScheme";
const CLEAR_PROPS = [
  KEY_DERIVATION_FUNC,
  ENCRYPTION_SCHEME
];

export interface PBES2ParamsParameters extends Schema.SchemaConstructor {
  keyDerivationFunc?: AlgorithmIdentifier;
  encryptionScheme?: AlgorithmIdentifier;
}

/**
 * Class from RFC2898
 */
export class PBES2Params implements Schema.SchemaCompatible {

  public keyDerivationFunc: AlgorithmIdentifier;
  public encryptionScheme: AlgorithmIdentifier;

  /**
   * Constructor for PBES2Params class
   * @param parameters
   */
  constructor(parameters: PBES2ParamsParameters = {}) {
    //#region Internal properties of the object
    this.keyDerivationFunc = pvutils.getParametersValue(parameters, KEY_DERIVATION_FUNC, PBES2Params.defaultValues(KEY_DERIVATION_FUNC));
    this.encryptionScheme = pvutils.getParametersValue(parameters, ENCRYPTION_SCHEME, PBES2Params.defaultValues(ENCRYPTION_SCHEME));
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
  public static defaultValues(memberName: typeof KEY_DERIVATION_FUNC): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof ENCRYPTION_SCHEME): AlgorithmIdentifier;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case KEY_DERIVATION_FUNC:
        return new AlgorithmIdentifier();
      case ENCRYPTION_SCHEME:
        return new AlgorithmIdentifier();
      default:
        throw new Error(`Invalid member name for PBES2Params class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * PBES2-params ::= SEQUENCE {
   *    keyDerivationFunc AlgorithmIdentifier {{PBES2-KDFs}},
   *    encryptionScheme AlgorithmIdentifier {{PBES2-Encs}} }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    keyDerivationFunc?: AlgorithmIdentifierSchema;
    encryptionScheme?: AlgorithmIdentifierSchema;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        AlgorithmIdentifier.schema(names.keyDerivationFunc || {}),
        AlgorithmIdentifier.schema(names.encryptionScheme || {})
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
      PBES2Params.schema({
        names: {
          keyDerivationFunc: {
            names: {
              blockName: KEY_DERIVATION_FUNC
            }
          },
          encryptionScheme: {
            names: {
              blockName: ENCRYPTION_SCHEME
            }
          }
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for PBES2Params");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.keyDerivationFunc = new AlgorithmIdentifier({ schema: asn1.result.keyDerivationFunc });
    this.encryptionScheme = new AlgorithmIdentifier({ schema: asn1.result.encryptionScheme });
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
        this.keyDerivationFunc.toSchema(),
        this.encryptionScheme.toSchema()
      ]
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    return {
      keyDerivationFunc: this.keyDerivationFunc.toJSON(),
      encryptionScheme: this.encryptionScheme.toJSON()
    };
  }

}
