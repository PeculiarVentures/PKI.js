import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as common from "./common";
import { EncryptedContentInfo, EncryptedContentInfoSchema } from "./EncryptedContentInfo";
import { Attribute } from "./Attribute";
import * as Schema from "./Schema";
import { ArgumentError } from "./errors";
import { CryptoEngineEncryptParams } from "./CryptoEngine/CryptoEngineInterface";

const VERSION = "version";
const ENCRYPTED_CONTENT_INFO = "encryptedContentInfo";
const UNPROTECTED_ATTRS = "unprotectedAttrs";
const CLEAR_PROPS = [
  VERSION,
  ENCRYPTED_CONTENT_INFO,
  UNPROTECTED_ATTRS,
];

export interface EncryptedDataParameters extends Schema.SchemaConstructor {
  version?: number;
  encryptedContentInfo?: EncryptedContentInfo;
  unprotectedAttrs?: Attribute[];
}

/**
 * Class from RFC5652
 */
export class EncryptedData implements Schema.SchemaCompatible {

  public version: number;
  public encryptedContentInfo: EncryptedContentInfo;
  public unprotectedAttrs?: Attribute[];

  /**
   * Constructor for EncryptedData class
   * @param parameters
   */
  constructor(parameters: EncryptedDataParameters = {}) {
    //#region Internal properties of the object
    this.version = pvutils.getParametersValue(parameters, VERSION, EncryptedData.defaultValues(VERSION));
    this.encryptedContentInfo = pvutils.getParametersValue(parameters, ENCRYPTED_CONTENT_INFO, EncryptedData.defaultValues(ENCRYPTED_CONTENT_INFO));
    if (parameters.unprotectedAttrs) {
      this.unprotectedAttrs = pvutils.getParametersValue(parameters, UNPROTECTED_ATTRS, EncryptedData.defaultValues(UNPROTECTED_ATTRS));
    }
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
  public static defaultValues(memberName: typeof ENCRYPTED_CONTENT_INFO): EncryptedContentInfo;
  public static defaultValues(memberName: typeof UNPROTECTED_ATTRS): Attribute[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case VERSION:
        return 0;
      case ENCRYPTED_CONTENT_INFO:
        return new EncryptedContentInfo();
      case UNPROTECTED_ATTRS:
        return [];
      default:
        throw new Error(`Invalid member name for EncryptedData class: ${memberName}`);
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
      case ENCRYPTED_CONTENT_INFO:
        // TODO move to isEmpty method
        return ((EncryptedContentInfo.compareWithDefault("contentType", memberValue.contentType)) &&
          (EncryptedContentInfo.compareWithDefault("contentEncryptionAlgorithm", memberValue.contentEncryptionAlgorithm)) &&
          (EncryptedContentInfo.compareWithDefault("encryptedContent", memberValue.encryptedContent)));
      case UNPROTECTED_ATTRS:
        return (memberValue.length === 0);
      default:
        throw new Error(`Invalid member name for EncryptedData class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * EncryptedData ::= SEQUENCE {
   *    version CMSVersion,
   *    encryptedContentInfo EncryptedContentInfo,
   *    unprotectedAttrs [1] IMPLICIT UnprotectedAttributes OPTIONAL }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    version?: string;
    encryptedContentInfo?: EncryptedContentInfoSchema;
    unprotectedAttrs?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Integer({ name: (names.version || "") }),
        EncryptedContentInfo.schema(names.encryptedContentInfo || {}),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          value: [
            new asn1js.Repeated({
              name: (names.unprotectedAttrs || ""),
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
      EncryptedData.schema({
        names: {
          version: VERSION,
          encryptedContentInfo: {
            names: {
              blockName: ENCRYPTED_CONTENT_INFO
            }
          },
          unprotectedAttrs: UNPROTECTED_ATTRS
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for EncryptedData");
    //#endregion

    //#region Get internal properties from parsed schema
    this.version = asn1.result.version.valueBlock.valueDec;
    this.encryptedContentInfo = new EncryptedContentInfo({ schema: asn1.result.encryptedContentInfo });

    if (UNPROTECTED_ATTRS in asn1.result)
      this.unprotectedAttrs = Array.from(asn1.result.unprotectedAttrs, element => new Attribute({ schema: element }));
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
    outputArray.push(this.encryptedContentInfo.toSchema());

    if (this.unprotectedAttrs) {
      outputArray.push(new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 1 // [1]
        },
        value: Array.from(this.unprotectedAttrs, element => element.toSchema())
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
    const _object: any = {
      version: this.version,
      encryptedContentInfo: this.encryptedContentInfo.toJSON()
    };

    if (this.unprotectedAttrs)
      _object.unprotectedAttrs = Array.from(this.unprotectedAttrs, element => element.toJSON());

    return _object;
  }

  /**
   * Create a new CMS Encrypted Data content
   * @param parameters Parameters necessary for encryption
   */
  public async encrypt(parameters: CryptoEngineEncryptParams): Promise<void> {
    //#region Check for input parameters
    ArgumentError.assert(parameters, "parameters", "object");
    //#endregion

    //#region Set "contentType" parameter
    const encryptParams: CryptoEngineEncryptParams = {
      ...parameters,
      contentType: "1.2.840.113549.1.7.1",
    };
    //#endregion

    this.encryptedContentInfo = await common.getCrypto(true).encryptEncryptedContentInfo(encryptParams);
  }

  /**
   * Create a new CMS Encrypted Data content
   * @param parameters Parameters necessary for encryption
   */
  async decrypt(parameters: {
    password: ArrayBuffer;
  }): Promise<ArrayBuffer> {
    //#region Check for input parameters
    ArgumentError.assert(parameters, "parameters", "object");
    //#endregion

    //#region Set ENCRYPTED_CONTENT_INFO value
    const decryptParams = {
      ...parameters,
      encryptedContentInfo: this.encryptedContentInfo,
    };
    //#endregion

    return common.getCrypto(true).decryptEncryptedContentInfo(decryptParams);
  }

}
