import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { AlgorithmIdentifier, AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import * as Schema from "./Schema";

const SALT = "salt";
const ITERATION_COUNT = "iterationCount";
const KEY_LENGTH = "keyLength";
const PRF = "prf";
const CLEAR_PROPS = [
  SALT,
  ITERATION_COUNT,
  KEY_LENGTH,
  PRF
];

export interface PBKDF2ParamsParameters extends Schema.SchemaConstructor {
  salt?: any;
  iterationCount?: number;
  keyLength?: number;
  prf?: AlgorithmIdentifier;
}

/**
 * Class from RFC2898
 */
export class PBKDF2Params implements Schema.SchemaCompatible {

  public salt: any;
  public iterationCount: number;
  public keyLength?: number;
  public prf?: AlgorithmIdentifier;

  /**
   * Constructor for PBKDF2Params class
   * @param parameters
   */
  constructor(parameters: PBKDF2ParamsParameters = {}) {
    //#region Internal properties of the object
    this.salt = pvutils.getParametersValue(parameters, SALT, PBKDF2Params.defaultValues(SALT));
    this.iterationCount = pvutils.getParametersValue(parameters, ITERATION_COUNT, PBKDF2Params.defaultValues(ITERATION_COUNT));

    if (KEY_LENGTH in parameters) {
      this.keyLength = pvutils.getParametersValue(parameters, KEY_LENGTH, PBKDF2Params.defaultValues(KEY_LENGTH));
    }

    if (parameters.prf) {
      this.prf = pvutils.getParametersValue(parameters, PRF, PBKDF2Params.defaultValues(PRF));
    }
    //#endregion

    //#region If input argument array contains "schema" for this object
    if (parameters.schema)
      this.fromSchema(parameters.schema);
    //#endregion
  }

  /**
   * Return default values for all class members
   * @param memberName String name for a class member
   */
  public static defaultValues(memberName: typeof SALT): any;
  public static defaultValues(memberName: typeof ITERATION_COUNT): number;
  public static defaultValues(memberName: typeof KEY_LENGTH): number;
  public static defaultValues(memberName: typeof PRF): AlgorithmIdentifier;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case SALT:
        return {};
      case ITERATION_COUNT:
        return (-1);
      case KEY_LENGTH:
        return 0;
      case PRF:
        return new AlgorithmIdentifier({
          algorithmId: "1.3.14.3.2.26", // SHA-1
          algorithmParams: new asn1js.Null()
        });
      default:
        throw new Error(`Invalid member name for PBKDF2Params class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * PBKDF2-params ::= SEQUENCE {
   *    salt CHOICE {
   *        specified OCTET STRING,
   *        otherSource AlgorithmIdentifier },
   *  iterationCount INTEGER (1..MAX),
   *  keyLength INTEGER (1..MAX) OPTIONAL,
   *  prf AlgorithmIdentifier
   *    DEFAULT { algorithm hMAC-SHA1, parameters NULL } }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    saltPrimitive?: string;
    saltConstructed?: AlgorithmIdentifierSchema;
    iterationCount?: string;
    keyLength?: string;
    prf?: AlgorithmIdentifierSchema;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Choice({
          value: [
            new asn1js.OctetString({ name: (names.saltPrimitive || "") }),
            AlgorithmIdentifier.schema(names.saltConstructed || {})
          ]
        }),
        new asn1js.Integer({ name: (names.iterationCount || "") }),
        new asn1js.Integer({
          name: (names.keyLength || ""),
          optional: true
        }),
        AlgorithmIdentifier.schema(names.prf || {
          names: {
            optional: true
          }
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
      PBKDF2Params.schema({
        names: {
          saltPrimitive: SALT,
          saltConstructed: {
            names: {
              blockName: SALT
            }
          },
          iterationCount: ITERATION_COUNT,
          keyLength: KEY_LENGTH,
          prf: {
            names: {
              blockName: PRF,
              optional: true
            }
          }
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for PBKDF2Params");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.salt = asn1.result.salt;
    this.iterationCount = asn1.result.iterationCount.valueBlock.valueDec;

    if (KEY_LENGTH in asn1.result)
      this.keyLength = asn1.result.keyLength.valueBlock.valueDec;

    if (PRF in asn1.result)
      this.prf = new AlgorithmIdentifier({ schema: asn1.result.prf });
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Create array for output sequence
    const outputArray = [];

    outputArray.push(this.salt);
    outputArray.push(new asn1js.Integer({ value: this.iterationCount }));

    if (KEY_LENGTH in this) {
      if (PBKDF2Params.defaultValues(KEY_LENGTH) !== this.keyLength)
        outputArray.push(new asn1js.Integer({ value: this.keyLength }));
    }

    if (this.prf) {
      if (PBKDF2Params.defaultValues(PRF).isEqual(this.prf) === false)
        outputArray.push(this.prf.toSchema());
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
    const _object: any = {
      salt: this.salt.toJSON(),
      iterationCount: this.iterationCount
    };

    if (KEY_LENGTH in this) {
      if (PBKDF2Params.defaultValues(KEY_LENGTH) !== this.keyLength)
        _object.keyLength = this.keyLength;
    }

    if (this.prf) {
      if (PBKDF2Params.defaultValues(PRF).isEqual(this.prf) === false)
        _object.prf = this.prf.toJSON();
    }

    return _object;
  }

}
