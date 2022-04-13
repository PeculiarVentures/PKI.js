import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { AlgorithmIdentifier, AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import { Certificate } from "./Certificate";
import { RecipientIdentifier, RecipientIdentifierSchema } from "./RecipientIdentifier";
import { IssuerAndSerialNumber } from "./IssuerAndSerialNumber";
import * as Schema from "./Schema";

const VERSION = "version";
const RID = "rid";
const KEY_ENCRYPTION_ALGORITHM = "keyEncryptionAlgorithm";
const ENCRYPTED_KEY = "encryptedKey";
const RECIPIENT_CERTIFICATE = "recipientCertificate";
const CLEAR_PROPS = [
  VERSION,
  RID,
  KEY_ENCRYPTION_ALGORITHM,
  ENCRYPTED_KEY,
];

export type RecipientIdentifierType = IssuerAndSerialNumber | asn1js.OctetString;

export interface KeyTransRecipientInfoParameters extends Schema.SchemaConstructor {
  version?: number;
  rid?: RecipientIdentifierType;
  keyEncryptionAlgorithm?: AlgorithmIdentifier;
  encryptedKey?: asn1js.OctetString;
  recipientCertificate?: Certificate;
}

/**
 * Class from RFC5652
 */
export class KeyTransRecipientInfo {
  version: number;
  rid: RecipientIdentifierType;
  keyEncryptionAlgorithm: AlgorithmIdentifier;
  encryptedKey: asn1js.OctetString;
  recipientCertificate: Certificate;

  /**
   * Constructor for KeyTransRecipientInfo class
   * @param parameters
   */
  constructor(parameters: KeyTransRecipientInfoParameters = {}) {
    //#region Internal properties of the object
    this.version = pvutils.getParametersValue(parameters, VERSION, KeyTransRecipientInfo.defaultValues(VERSION));
    this.rid = pvutils.getParametersValue(parameters, RID, KeyTransRecipientInfo.defaultValues(RID));
    this.keyEncryptionAlgorithm = pvutils.getParametersValue(parameters, KEY_ENCRYPTION_ALGORITHM, KeyTransRecipientInfo.defaultValues(KEY_ENCRYPTION_ALGORITHM));
    this.encryptedKey = pvutils.getParametersValue(parameters, ENCRYPTED_KEY, KeyTransRecipientInfo.defaultValues(ENCRYPTED_KEY));
    this.recipientCertificate = pvutils.getParametersValue(parameters, RECIPIENT_CERTIFICATE, KeyTransRecipientInfo.defaultValues(RECIPIENT_CERTIFICATE));
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
  public static defaultValues(memberName: typeof RID): RecipientIdentifierType;
  public static defaultValues(memberName: typeof KEY_ENCRYPTION_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof ENCRYPTED_KEY): asn1js.OctetString;
  public static defaultValues(memberName: typeof RECIPIENT_CERTIFICATE): Certificate;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case VERSION:
        return (-1);
      case RID:
        return {};
      case KEY_ENCRYPTION_ALGORITHM:
        return new AlgorithmIdentifier();
      case ENCRYPTED_KEY:
        return new asn1js.OctetString();
      case RECIPIENT_CERTIFICATE:
        return new Certificate();
      default:
        throw new Error(`Invalid member name for KeyTransRecipientInfo class: ${memberName}`);
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
        return (memberValue === KeyTransRecipientInfo.defaultValues(VERSION));
      case RID:
        return (Object.keys(memberValue).length === 0);
      case KEY_ENCRYPTION_ALGORITHM:
      case ENCRYPTED_KEY:
        return memberValue.isEqual(KeyTransRecipientInfo.defaultValues(memberName as typeof ENCRYPTED_KEY));
      case RECIPIENT_CERTIFICATE:
        return false; // For now we do not need to compare any values with the RECIPIENT_CERTIFICATE
      default:
        throw new Error(`Invalid member name for KeyTransRecipientInfo class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * KeyTransRecipientInfo ::= SEQUENCE {
   *    version CMSVersion,  -- always set to 0 or 2
   *    rid RecipientIdentifier,
   *    keyEncryptionAlgorithm KeyEncryptionAlgorithmIdentifier,
   *    encryptedKey EncryptedKey }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    version?: string;
    rid?: RecipientIdentifierSchema;
    keyEncryptionAlgorithm?: AlgorithmIdentifierSchema;
    encryptedKey?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Integer({ name: (names.version || "") }),
        RecipientIdentifier.schema(names.rid || {}),
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
    pvutils.clearProps(schema, CLEAR_PROPS);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      KeyTransRecipientInfo.schema({
        names: {
          version: VERSION,
          rid: {
            names: {
              blockName: RID
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
      throw new Error("Object's schema was not verified against input data for KeyTransRecipientInfo");
    //#endregion

    //#region Get internal properties from parsed schema
    this.version = asn1.result.version.valueBlock.valueDec;

    if (asn1.result.rid.idBlock.tagClass === 3) {
      this.rid = new asn1js.OctetString({ valueHex: asn1.result.rid.valueBlock.valueHex }); // SubjectKeyIdentifier
    } else {
      this.rid = new IssuerAndSerialNumber({ schema: asn1.result.rid });
    }

    this.keyEncryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.keyEncryptionAlgorithm });
    this.encryptedKey = asn1.result.encryptedKey;
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Create array for output sequence
    const outputArray = [];

    if (this.rid instanceof IssuerAndSerialNumber) {
      this.version = 0;

      outputArray.push(new asn1js.Integer({ value: this.version }));
      outputArray.push(this.rid.toSchema());
    }
    else {
      this.version = 2;

      outputArray.push(new asn1js.Integer({ value: this.version }));
      outputArray.push(new asn1js.Primitive({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        valueHex: this.rid.valueBlock.valueHex
      }));
    }

    outputArray.push(this.keyEncryptionAlgorithm.toSchema());
    outputArray.push(this.encryptedKey);
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
    return {
      version: this.version,
      rid: this.rid.toJSON(),
      keyEncryptionAlgorithm: this.keyEncryptionAlgorithm.toJSON(),
      encryptedKey: this.encryptedKey.toJSON()
    };
  }

}
