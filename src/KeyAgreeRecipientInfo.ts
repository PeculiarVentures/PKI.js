import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { OriginatorIdentifierOrKey, OriginatorIdentifierOrKeySchema } from "./OriginatorIdentifierOrKey";
import { AlgorithmIdentifier, AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import { RecipientEncryptedKeys, RecipientEncryptedKeysSchema } from "./RecipientEncryptedKeys";
import { Certificate } from "./Certificate";
import * as Schema from "./Schema";

const VERSION = "version";
const ORIGINATOR = "originator";
const UKM = "ukm";
const KEY_ENCRYPTION_ALGORITHM = "keyEncryptionAlgorithm";
const RECIPIENT_ENCRYPTED_KEY = "recipientEncryptedKeys";
const RECIPIENT_CERTIFICATE = "recipientCertificate";
const RECIPIENT_PUBLIC_KEY = "recipientPublicKey";
const CLEAR_PROPS = [
  VERSION,
  ORIGINATOR,
  UKM,
  KEY_ENCRYPTION_ALGORITHM,
  RECIPIENT_ENCRYPTED_KEY,
];

export interface KeyAgreeRecipientInfoParameters extends Schema.SchemaConstructor {
  version?: number;
  originator?: OriginatorIdentifierOrKey;
  ukm?: KeyAgreeRecipientInfo;
  keyEncryptionAlgorithm?: AlgorithmIdentifier;
  recipientEncryptedKeys?: RecipientEncryptedKeys;
  recipientCertificate?: Certificate;
  recipientPublicKey?: CryptoKey;
}

/**
 * Class from RFC5652
 */
export class KeyAgreeRecipientInfo implements Schema.SchemaCompatible {
  version: number;
  originator: OriginatorIdentifierOrKey;
  ukm?: asn1js.OctetString;
  keyEncryptionAlgorithm: AlgorithmIdentifier;
  recipientEncryptedKeys: RecipientEncryptedKeys;
  recipientCertificate: Certificate;
  recipientPublicKey: CryptoKey | null;

  /**
   * Constructor for KeyAgreeRecipientInfo class
   * @param parameters
   */
  constructor(parameters: KeyAgreeRecipientInfoParameters = {}) {
    //#region Internal properties of the object
    this.version = pvutils.getParametersValue(parameters, VERSION, KeyAgreeRecipientInfo.defaultValues(VERSION));
    this.originator = pvutils.getParametersValue(parameters, ORIGINATOR, KeyAgreeRecipientInfo.defaultValues(ORIGINATOR));
    if (parameters.ukm) {
      this.ukm = pvutils.getParametersValue(parameters, UKM, KeyAgreeRecipientInfo.defaultValues(UKM));
    }
    this.keyEncryptionAlgorithm = pvutils.getParametersValue(parameters, KEY_ENCRYPTION_ALGORITHM, KeyAgreeRecipientInfo.defaultValues(KEY_ENCRYPTION_ALGORITHM));
    this.recipientEncryptedKeys = pvutils.getParametersValue(parameters, RECIPIENT_ENCRYPTED_KEY, KeyAgreeRecipientInfo.defaultValues(RECIPIENT_ENCRYPTED_KEY));
    this.recipientCertificate = pvutils.getParametersValue(parameters, RECIPIENT_CERTIFICATE, KeyAgreeRecipientInfo.defaultValues(RECIPIENT_CERTIFICATE));
    this.recipientPublicKey = pvutils.getParametersValue(parameters, RECIPIENT_PUBLIC_KEY, KeyAgreeRecipientInfo.defaultValues(RECIPIENT_PUBLIC_KEY));
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
  public static defaultValues(memberName: typeof ORIGINATOR): OriginatorIdentifierOrKey;
  public static defaultValues(memberName: typeof UKM): asn1js.OctetString;
  public static defaultValues(memberName: typeof KEY_ENCRYPTION_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof RECIPIENT_ENCRYPTED_KEY): RecipientEncryptedKeys;
  public static defaultValues(memberName: typeof RECIPIENT_CERTIFICATE): Certificate;
  public static defaultValues(memberName: typeof RECIPIENT_PUBLIC_KEY): null;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case VERSION:
        return 0;
      case ORIGINATOR:
        return new OriginatorIdentifierOrKey();
      case UKM:
        return new asn1js.OctetString();
      case KEY_ENCRYPTION_ALGORITHM:
        return new AlgorithmIdentifier();
      case RECIPIENT_ENCRYPTED_KEY:
        return new RecipientEncryptedKeys();
      case RECIPIENT_CERTIFICATE:
        return new Certificate();
      case RECIPIENT_PUBLIC_KEY:
        return null;
      default:
        throw new Error(`Invalid member name for KeyAgreeRecipientInfo class: ${memberName}`);
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
        return (memberValue === 0);
      case ORIGINATOR:
        return ((memberValue.variant === (-1)) && (("value" in memberValue) === false));
      case UKM:
        return (memberValue.isEqual(KeyAgreeRecipientInfo.defaultValues(UKM)));
      case KEY_ENCRYPTION_ALGORITHM:
        return ((memberValue.algorithmId === "") && (("algorithmParams" in memberValue) === false));
      case RECIPIENT_ENCRYPTED_KEY:
        return (memberValue.encryptedKeys.length === 0);
      case RECIPIENT_CERTIFICATE:
        return false; // For now leave it as is
      case RECIPIENT_PUBLIC_KEY:
        return false;
      default:
        throw new Error(`Invalid member name for KeyAgreeRecipientInfo class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * KeyAgreeRecipientInfo ::= SEQUENCE {
   *    version CMSVersion,  -- always set to 3
   *    originator [0] EXPLICIT OriginatorIdentifierOrKey,
   *    ukm [1] EXPLICIT UserKeyingMaterial OPTIONAL,
   *    keyEncryptionAlgorithm KeyEncryptionAlgorithmIdentifier,
   *    recipientEncryptedKeys RecipientEncryptedKeys }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    version?: string;
    originator?: OriginatorIdentifierOrKeySchema;
    ukm?: string;
    keyEncryptionAlgorithm?: AlgorithmIdentifierSchema;
    recipientEncryptedKeys?: RecipientEncryptedKeysSchema;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: names.blockName || "",
      value: [
        new asn1js.Integer({ name: names.version || "" }),
        new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [
            OriginatorIdentifierOrKey.schema(names.originator || {})
          ]
        }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          value: [new asn1js.OctetString({ name: names.ukm || "" })]
        }),
        AlgorithmIdentifier.schema(names.keyEncryptionAlgorithm || {}),
        RecipientEncryptedKeys.schema(names.recipientEncryptedKeys || {})
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
      KeyAgreeRecipientInfo.schema({
        names: {
          version: VERSION,
          originator: {
            names: {
              blockName: ORIGINATOR
            }
          },
          ukm: UKM,
          keyEncryptionAlgorithm: {
            names: {
              blockName: KEY_ENCRYPTION_ALGORITHM
            }
          },
          recipientEncryptedKeys: {
            names: {
              blockName: RECIPIENT_ENCRYPTED_KEY
            }
          }
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for KeyAgreeRecipientInfo");
    //#endregion

    //#region Get internal properties from parsed schema
    this.version = asn1.result.version.valueBlock.valueDec;
    this.originator = new OriginatorIdentifierOrKey({ schema: asn1.result.originator });

    if (UKM in asn1.result)
      this.ukm = asn1.result.ukm;

    this.keyEncryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.keyEncryptionAlgorithm });
    this.recipientEncryptedKeys = new RecipientEncryptedKeys({ schema: asn1.result.recipientEncryptedKeys });
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Create array for final sequence
    const outputArray = [];

    outputArray.push(new asn1js.Integer({ value: this.version }));
    outputArray.push(new asn1js.Constructed({
      idBlock: {
        tagClass: 3, // CONTEXT-SPECIFIC
        tagNumber: 0 // [0]
      },
      value: [this.originator.toSchema()]
    }));

    if (UKM in this) {
      outputArray.push(new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 1 // [1]
        },
        value: [this.ukm]
      }));
    }

    outputArray.push(this.keyEncryptionAlgorithm.toSchema());
    outputArray.push(this.recipientEncryptedKeys.toSchema());
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
      version: this.version,
      originator: this.originator.toJSON()
    };

    if (this.ukm) {
      _object.ukm = this.ukm.toJSON();
    }

    _object.keyEncryptionAlgorithm = this.keyEncryptionAlgorithm.toJSON();
    _object.recipientEncryptedKeys = this.recipientEncryptedKeys.toJSON();

    return _object;
  }

}
