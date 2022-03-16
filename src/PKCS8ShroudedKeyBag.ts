import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import AlgorithmIdentifier, { AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import EncryptedData from "./EncryptedData";
import EncryptedContentInfo from "./EncryptedContentInfo";
import PrivateKeyInfo from "./PrivateKeyInfo";
import * as Schema from "./Schema";
import { CryptoEngineEncryptParams } from "./CryptoEngine";

const ENCRYPTION_ALGORITHM = "encryptionAlgorithm";
const ENCRYPTED_DATA = "encryptedData";
const PARSED_VALUE = "parsedValue";
const CLEAR_PROPS = [
  ENCRYPTION_ALGORITHM,
  ENCRYPTED_DATA,
];

export interface PKCS8ShroudedKeyBagParameters extends Schema.SchemaConstructor {
  encryptionAlgorithm?: AlgorithmIdentifier;
  encryptedData?: asn1js.OctetString;
  parsedValue?: PrivateKeyInfo;
}

/**
 * Class from RFC7292
 */
export default class PKCS8ShroudedKeyBag implements Schema.SchemaCompatible {

  public encryptionAlgorithm: AlgorithmIdentifier;
  public encryptedData: asn1js.OctetString;
  public parsedValue?: PrivateKeyInfo;

  /**
   * Constructor for PKCS8ShroudedKeyBag class
   * @param parameters
   */
  constructor(parameters: PKCS8ShroudedKeyBagParameters = {}) {
    //#region Internal properties of the object
    this.encryptionAlgorithm = pvutils.getParametersValue(parameters, ENCRYPTION_ALGORITHM, PKCS8ShroudedKeyBag.defaultValues(ENCRYPTION_ALGORITHM));
    this.encryptedData = pvutils.getParametersValue(parameters, ENCRYPTED_DATA, PKCS8ShroudedKeyBag.defaultValues(ENCRYPTED_DATA));
    if (parameters.parsedValue) {
      this.parsedValue = pvutils.getParametersValue(parameters, PARSED_VALUE, PKCS8ShroudedKeyBag.defaultValues(PARSED_VALUE));
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
  public static defaultValues(memberName: typeof ENCRYPTION_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof ENCRYPTED_DATA): asn1js.OctetString;
  public static defaultValues(memberName: typeof PARSED_VALUE): PrivateKeyInfo;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case ENCRYPTION_ALGORITHM:
        return (new AlgorithmIdentifier());
      case ENCRYPTED_DATA:
        return (new asn1js.OctetString());
      case PARSED_VALUE:
        return {};
      default:
        throw new Error(`Invalid member name for PKCS8ShroudedKeyBag class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case ENCRYPTION_ALGORITHM:
        return ((AlgorithmIdentifier.compareWithDefault("algorithmId", memberValue.algorithmId)) &&
          (("algorithmParams" in memberValue) === false));
      case ENCRYPTED_DATA:
        return (memberValue.isEqual(PKCS8ShroudedKeyBag.defaultValues(memberName)));
      case PARSED_VALUE:
        return ((memberValue instanceof Object) && (Object.keys(memberValue).length === 0));
      default:
        throw new Error(`Invalid member name for PKCS8ShroudedKeyBag class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * PKCS8ShroudedKeyBag ::= EncryptedPrivateKeyInfo
   *
   * EncryptedPrivateKeyInfo ::= SEQUENCE {
   *    encryptionAlgorithm AlgorithmIdentifier {{KeyEncryptionAlgorithms}},
   *    encryptedData EncryptedData
   * }
   *
   * EncryptedData ::= OCTET STRING
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    encryptionAlgorithm?: AlgorithmIdentifierSchema;
    encryptedData?: string;
  }> = {}): Schema.SchemaType {
    /**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [encryptionAlgorithm]
     * @property {string} [encryptedData]
     */
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        AlgorithmIdentifier.schema(names.encryptionAlgorithm || {
          names: {
            blockName: ENCRYPTION_ALGORITHM
          }
        }),
        new asn1js.Choice({
          value: [
            new asn1js.OctetString({ name: (names.encryptedData || ENCRYPTED_DATA) }),
            new asn1js.OctetString({
              idBlock: {
                isConstructed: true
              },
              name: (names.encryptedData || ENCRYPTED_DATA)
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
      PKCS8ShroudedKeyBag.schema({
        names: {
          encryptionAlgorithm: {
            names: {
              blockName: ENCRYPTION_ALGORITHM
            }
          },
          encryptedData: ENCRYPTED_DATA
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for PKCS8ShroudedKeyBag");
    //#endregion

    //#region Get internal properties from parsed schema
    this.encryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.encryptionAlgorithm });
    this.encryptedData = asn1.result.encryptedData;
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): Schema.SchemaType {
    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: [
        this.encryptionAlgorithm.toSchema(),
        this.encryptedData
      ]
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    return {
      encryptionAlgorithm: this.encryptionAlgorithm.toJSON(),
      encryptedData: this.encryptedData.toJSON()
    };
  }

  protected async parseInternalValues(parameters: {
    password: ArrayBuffer;
  }) {
    //#region Initial variables
    const cmsEncrypted = new EncryptedData({
      encryptedContentInfo: new EncryptedContentInfo({
        contentEncryptionAlgorithm: this.encryptionAlgorithm,
        encryptedContent: this.encryptedData
      })
    });
    //#endregion

    //#region Decrypt internal data
    const decryptedData = await cmsEncrypted.decrypt(parameters);

    //#endregion

    //#region Initialize PARSED_VALUE with decrypted PKCS#8 private key

    const asn1 = asn1js.fromBER(decryptedData);
    if (asn1.offset === (-1)) {
      throw new Error("Error during parsing ASN.1 data");
    }

    this.parsedValue = new PrivateKeyInfo({ schema: asn1.result });
    //#endregion
  }

  protected async makeInternalValues(parameters: Omit<CryptoEngineEncryptParams, "contentToEncrypt">): Promise<void> {
    //#region Check that we do have PARSED_VALUE
    if (!this.parsedValue) {
      throw new Error("Please initialize \"parsedValue\" first");
    }
    //#endregion

    //#region Initial variables
    const cmsEncrypted = new EncryptedData();
    //#endregion

    //#region Encrypt internal data
    const encryptParams = {
      ...parameters,
      contentToEncrypt: this.parsedValue.toSchema().toBER(false),
    };

    await cmsEncrypted.encrypt(encryptParams);
    if (!cmsEncrypted.encryptedContentInfo.encryptedContent) {
      throw new Error("The filed `encryptedContent` in EncryptedContentInfo is empty");
    }

    //#endregion

    //#region Initialize internal values
    this.encryptionAlgorithm = cmsEncrypted.encryptedContentInfo.contentEncryptionAlgorithm;
    this.encryptedData = cmsEncrypted.encryptedContentInfo.encryptedContent;
    //#endregion
  }

}
