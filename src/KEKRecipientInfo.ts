import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import { KEKIdentifier, KEKIdentifierSchema } from "./KEKIdentifier";
import { AlgorithmIdentifier, AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import * as Schema from "./Schema";

const VERSION = "version";
const KEK_ID = "kekid";
const KEY_ENCRYPTION_ALGORITHM = "keyEncryptionAlgorithm";
const ENCRYPTED_KEY = "encryptedKey";
const PER_DEFINED_KEK = "preDefinedKEK";
const CLEAR_PROPS = [
  VERSION,
  KEK_ID,
  KEY_ENCRYPTION_ALGORITHM,
  ENCRYPTED_KEY,
];

export interface KEKRecipientInfoParameters extends Schema.SchemaConstructor {
  version?: number;
  kekid?: KEKIdentifier;
  keyEncryptionAlgorithm?: AlgorithmIdentifier;
  encryptedKey?: asn1js.OctetString;
  preDefinedKEK?: ArrayBuffer;
}

/**
 * Class from RFC5652
 */
export class KEKRecipientInfo implements Schema.SchemaCompatible {

  public version: number;
  public kekid: KEKIdentifier;
  public keyEncryptionAlgorithm: AlgorithmIdentifier;
  public encryptedKey: asn1js.OctetString;
  public preDefinedKEK: ArrayBuffer;

  /**
   * Constructor for KEKRecipientInfo class
   * @param parameters
   */
  constructor(parameters: KEKRecipientInfoParameters = {}) {
    //#region Internal properties of the object
    this.version = getParametersValue(parameters, VERSION, KEKRecipientInfo.defaultValues(VERSION));
    this.kekid = getParametersValue(parameters, KEK_ID, KEKRecipientInfo.defaultValues(KEK_ID));
    this.keyEncryptionAlgorithm = getParametersValue(parameters, KEY_ENCRYPTION_ALGORITHM, KEKRecipientInfo.defaultValues(KEY_ENCRYPTION_ALGORITHM));
    this.encryptedKey = getParametersValue(parameters, ENCRYPTED_KEY, KEKRecipientInfo.defaultValues(ENCRYPTED_KEY));
    this.preDefinedKEK = getParametersValue(parameters, PER_DEFINED_KEK, KEKRecipientInfo.defaultValues(PER_DEFINED_KEK));
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
  public static defaultValues(memberName: typeof VERSION): number;
  public static defaultValues(memberName: typeof KEK_ID): KEKIdentifier;
  public static defaultValues(memberName: typeof KEY_ENCRYPTION_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof ENCRYPTED_KEY): asn1js.OctetString;
  public static defaultValues(memberName: typeof PER_DEFINED_KEK): ArrayBuffer;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case VERSION:
        return 0;
      case KEK_ID:
        return new KEKIdentifier();
      case KEY_ENCRYPTION_ALGORITHM:
        return new AlgorithmIdentifier();
      case ENCRYPTED_KEY:
        return new asn1js.OctetString();
      case PER_DEFINED_KEK:
        return new ArrayBuffer(0);
      default:
        throw new Error(`Invalid member name for KEKRecipientInfo class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case "KEKRecipientInfo":
        return (memberValue === KEKRecipientInfo.defaultValues(VERSION));
      case KEK_ID:
        return ((memberValue.compareWithDefault("keyIdentifier", memberValue.keyIdentifier)) &&
          (("date" in memberValue) === false) &&
          (("other" in memberValue) === false));
      case KEY_ENCRYPTION_ALGORITHM:
        return ((memberValue.algorithmId === "") && (("algorithmParams" in memberValue) === false));
      case ENCRYPTED_KEY:
        return (memberValue.isEqual(KEKRecipientInfo.defaultValues(ENCRYPTED_KEY)));
      case PER_DEFINED_KEK:
        return (memberValue.byteLength === 0);
      default:
        throw new Error(`Invalid member name for KEKRecipientInfo class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * KEKRecipientInfo ::= SEQUENCE {
   *    version CMSVersion,  -- always set to 4
   *    kekid KEKIdentifier,
   *    keyEncryptionAlgorithm KeyEncryptionAlgorithmIdentifier,
   *    encryptedKey EncryptedKey }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    version?: string;
    kekid?: KEKIdentifierSchema;
    keyEncryptionAlgorithm?: AlgorithmIdentifierSchema;
    encryptedKey?: string;
  }> = {}): Schema.SchemaType {
    /**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [version]
     * @property {string} [kekid]
     * @property {string} [keyEncryptionAlgorithm]
     * @property {string} [encryptedKey]
     */
    const names = getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Integer({ name: (names.version || "") }),
        KEKIdentifier.schema(names.kekid || {}),
        AlgorithmIdentifier.schema(names.keyEncryptionAlgorithm || {}),
        new asn1js.OctetString({ name: (names.encryptedKey || "") })
      ]
    }));
  }

  /**
   * Convert parsed asn1js object into current class
   * @param schema
   */
  public fromSchema(schema: Schema.SchemaType): void {
    //#region Clear input data first
    clearProps(schema, CLEAR_PROPS);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      KEKRecipientInfo.schema({
        names: {
          version: VERSION,
          kekid: {
            names: {
              blockName: KEK_ID
            }
          },
          keyEncryptionAlgorithm: {
            names: {
              blockName: KEY_ENCRYPTION_ALGORITHM
            }
          },
          encryptedKey: ENCRYPTED_KEY
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for KEKRecipientInfo");
    //#endregion

    //#region Get internal properties from parsed schema
    this.version = asn1.result.version.valueBlock.valueDec;
    this.kekid = new KEKIdentifier({ schema: asn1.result.kekid });
    this.keyEncryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.keyEncryptionAlgorithm });
    this.encryptedKey = asn1.result.encryptedKey;
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
        new asn1js.Integer({ value: this.version }),
        this.kekid.toSchema(),
        this.keyEncryptionAlgorithm.toSchema(),
        this.encryptedKey
      ]
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    return {
      version: this.version,
      kekid: this.kekid.toJSON(),
      keyEncryptionAlgorithm: this.keyEncryptionAlgorithm.toJSON(),
      encryptedKey: this.encryptedKey.toJSON()
    };
  }

}
