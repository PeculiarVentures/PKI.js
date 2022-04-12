import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import ContentInfo from "./ContentInfo";
import SafeContents from "./SafeContents";
import EnvelopedData from "./EnvelopedData";
import EncryptedData from "./EncryptedData";
import * as Schema from "./Schema";
import { id_ContentType_Data, id_ContentType_EncryptedData, id_ContentType_EnvelopedData } from "./ObjectIdentifiers";
import { ArgumentError, ParameterError } from "./errors";

const SAFE_CONTENTS = "safeContents";
const PARSED_VALUE = "parsedValue";
const CONTENT_INFOS = "contentInfos";


export interface AuthenticatedSafeParameters extends Schema.SchemaConstructor {
  safeContents?: ContentInfo[];
  parsedValue?: Schema.SchemaType;
}

export type SafeContent = ContentInfo | EncryptedData | EnvelopedData | object;

/**
 * Class from RFC7292
 */
export default class AuthenticatedSafe implements Schema.SchemaCompatible {

  public safeContents: ContentInfo[];
  public parsedValue: any;

  /**
   * Constructor for AuthenticatedSafe class
   * @param parameters
   */
  constructor(parameters: AuthenticatedSafeParameters = {}) {
    //#region Internal properties of the object
    this.safeContents = pvutils.getParametersValue(parameters, SAFE_CONTENTS, AuthenticatedSafe.defaultValues(SAFE_CONTENTS));

    if (PARSED_VALUE in parameters) {
      this.parsedValue = pvutils.getParametersValue(parameters, PARSED_VALUE, AuthenticatedSafe.defaultValues(PARSED_VALUE));
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
  public static defaultValues(memberName: typeof SAFE_CONTENTS): ContentInfo[];
  public static defaultValues(memberName: typeof PARSED_VALUE): any;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case SAFE_CONTENTS:
        return [];
      case PARSED_VALUE:
        return {};
      default:
        throw new Error(`Invalid member name for AuthenticatedSafe class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case SAFE_CONTENTS:
        return (memberValue.length === 0);
      case PARSED_VALUE:
        return ((memberValue instanceof Object) && (Object.keys(memberValue).length === 0));
      default:
        throw new Error(`Invalid member name for AuthenticatedSafe class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * AuthenticatedSafe ::= SEQUENCE OF ContentInfo
   * -- Data if unencrypted
   * -- EncryptedData if password-encrypted
   * -- EnvelopedData if public key-encrypted
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    contentInfos?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Repeated({
          name: (names.contentInfos || ""),
          value: ContentInfo.schema()
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
    pvutils.clearProps(schema, [
      CONTENT_INFOS
    ]);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      AuthenticatedSafe.schema({
        names: {
          contentInfos: CONTENT_INFOS
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for AuthenticatedSafe");
    //#endregion

    //#region Get internal properties from parsed schema
    this.safeContents = Array.from(asn1.result.contentInfos, element => new ContentInfo({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: Array.from(this.safeContents, element => element.toSchema())
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    return {
      safeContents: Array.from(this.safeContents, element => element.toJSON())
    };
  }

  public async parseInternalValues(parameters: { safeContents: SafeContent[]; }): Promise<void> {
    //#region Check input data from "parameters"
    ParameterError.assert(parameters, SAFE_CONTENTS);
    ArgumentError.assert(parameters.safeContents, SAFE_CONTENTS, "Array");
    if (parameters.safeContents.length !== this.safeContents.length) {
      throw new ArgumentError("Length of \"parameters.safeContents\" must be equal to \"this.safeContents.length\"");
    }
    //#endregion

    //#region Create value for "this.parsedValue.authenticatedSafe"
    this.parsedValue = {
      safeContents: [] as any[],
    };

    for (const [index, content] of this.safeContents.entries()) {
      const safeContent = parameters.safeContents[index];
      const errorTarget = `parameters.safeContents[${index}]`;
      switch (content.contentType) {
        //#region data
        case id_ContentType_Data:
          {
            // Check that we do have OCTET STRING as "content"
            ArgumentError.assert(content.content, "this.safeContents[j].content", asn1js.OctetString);

            //#region Check we have "constructive encoding" for AuthSafe content
            let authSafeContent = new ArrayBuffer(0);

            if (content.content.valueBlock.isConstructed) {
              for (const contentValue of content.content.valueBlock.value) {
                authSafeContent = pvutils.utilConcatBuf(authSafeContent, (contentValue as any).valueBlock.valueHex);
              }
            } else {
              authSafeContent = content.content.valueBlock.valueHex;
            }
            //#endregion

            //#region Parse internal ASN.1 data
            const asn1 = asn1js.fromBER(authSafeContent);
            if (asn1.offset === (-1)) {
              throw new Error("Error during parsing of ASN.1 data inside \"content.content\"");
            }
            //#endregion

            //#region Finally initialize initial values of SAFE_CONTENTS type
            this.parsedValue.safeContents.push({
              privacyMode: 0, // No privacy, clear data
              value: new SafeContents({ schema: asn1.result })
            });
            //#endregion
          }
          break;
        //#endregion
        //#region envelopedData
        case id_ContentType_EnvelopedData:
          {
            //#region Initial variables
            const cmsEnveloped = new EnvelopedData({ schema: content.content });
            //#endregion

            //#region Check mandatory parameters
            ParameterError.assert(errorTarget, safeContent, "recipientCertificate", "recipientKey");
            const envelopedData = safeContent as any;
            const recipientCertificate = envelopedData.recipientCertificate;
            const recipientKey = envelopedData.recipientKey;
            //#endregion

            //#region Decrypt CMS EnvelopedData using first recipient information
            const decrypted = await cmsEnveloped.decrypt(0, {
              recipientCertificate,
              recipientPrivateKey: recipientKey
            });


            const asn1 = asn1js.fromBER(decrypted);
            if (asn1.offset === (-1)) {
              throw new Error("Error during parsing of decrypted data");
            }

            this.parsedValue.safeContents.push({
              privacyMode: 2, // Public-key privacy mode
              value: new SafeContents({ schema: asn1.result })
            });
            //#endregion
          }
          break;
        //#endregion
        //#region encryptedData
        case id_ContentType_EncryptedData:
          {
            //#region Initial variables
            const cmsEncrypted = new EncryptedData({ schema: content.content });
            //#endregion

            //#region Check mandatory parameters
            ParameterError.assert(errorTarget, safeContent, "password");

            const password = (safeContent as any).password;
            //#endregion

            //#region Decrypt CMS EncryptedData using password
            const decrypted = await cmsEncrypted.decrypt({
              password
            });
            //#endregion

            //#region Initialize internal data
            const asn1 = asn1js.fromBER(decrypted);
            if (asn1.offset === (-1)) {
              throw new Error("Error during parsing of decrypted data");
            }

            this.parsedValue.safeContents.push({
              privacyMode: 1, // Password-based privacy mode
              value: new SafeContents({ schema: asn1.result })
            });
            //#endregion
          }
          break;
        //#endregion
        //#region default
        default:
          throw new Error(`Unknown "contentType" for AuthenticatedSafe: " ${content.contentType}`);
        //#endregion
      }
    }
    //#endregion
  }
  public async makeInternalValues(parameters: {
    safeContents: any[];
  }): Promise<this> {
    //#region Check data in PARSED_VALUE
    if (!(this.parsedValue)) {
      throw new Error("Please run \"parseValues\" first or add \"parsedValue\" manually");
    }
    ArgumentError.assert(this.parsedValue, "this.parsedValue", "object");
    ArgumentError.assert(this.parsedValue.safeContents, "this.parsedValue.safeContents", "Array");


    //#region Check input data from "parameters"
    ArgumentError.assert(parameters, "parameters", "object");
    ParameterError.assert(parameters, "safeContents");
    ArgumentError.assert(parameters.safeContents, "parameters.safeContents", "Array");
    if (parameters.safeContents.length !== this.parsedValue.safeContents.length) {
      throw new ArgumentError("Length of \"parameters.safeContents\" must be equal to \"this.parsedValue.safeContents\"");
    }
    //#endregion

    //#region Create internal values from already parsed values
    this.safeContents = [];

    for (const [index, content] of this.parsedValue.safeContents.entries()) {
      //#region Check current "content" value
      ParameterError.assert("content", content, "privacyMode", "value");
      ArgumentError.assert(content.value, "content.value", SafeContents);
      //#endregion

      switch (content.privacyMode) {
        //#region No privacy
        case 0:
          {
            const contentBuffer = content.value.toSchema().toBER(false);

            this.safeContents.push(new ContentInfo({
              contentType: "1.2.840.113549.1.7.1",
              content: new asn1js.OctetString({ valueHex: contentBuffer })
            }));
          }
          break;
        //#endregion
        //#region Privacy with password
        case 1:
          {
            //#region Initial variables
            const cmsEncrypted = new EncryptedData();

            const currentParameters = parameters.safeContents[index];
            currentParameters.contentToEncrypt = content.value.toSchema().toBER(false);
            //#endregion

            //#region Encrypt CMS EncryptedData using password
            await cmsEncrypted.encrypt(currentParameters);
            //#endregion

            //#region Store result content in CMS_CONTENT_INFO type
            this.safeContents.push(new ContentInfo({
              contentType: "1.2.840.113549.1.7.6",
              content: cmsEncrypted.toSchema()
            }));
            //#endregion
          }
          break;
        //#endregion
        //#region Privacy with public key
        case 2:
          {
            //#region Initial variables
            const cmsEnveloped = new EnvelopedData();
            const contentToEncrypt = content.value.toSchema().toBER(false);
            const safeContent = parameters.safeContents[index];
            //#endregion

            //#region Check mandatory parameters
            ParameterError.assert(`parameters.safeContents[${index}]`, safeContent, "encryptingCertificate", "encryptionAlgorithm");

            switch (true) {
              case (safeContent.encryptionAlgorithm.name.toLowerCase() === "aes-cbc"):
              case (safeContent.encryptionAlgorithm.name.toLowerCase() === "aes-gcm"):
                break;
              default:
                throw new Error(`Incorrect parameter "encryptionAlgorithm" in "parameters.safeContents[i]": ${safeContent.encryptionAlgorithm}`);
            }

            switch (true) {
              case (safeContent.encryptionAlgorithm.length === 128):
              case (safeContent.encryptionAlgorithm.length === 192):
              case (safeContent.encryptionAlgorithm.length === 256):
                break;
              default:
                throw new Error(`Incorrect parameter "encryptionAlgorithm.length" in "parameters.safeContents[i]": ${safeContent.encryptionAlgorithm.length}`);
            }
            //#endregion

            //#region Making correct "encryptionAlgorithm" variable
            const encryptionAlgorithm = safeContent.encryptionAlgorithm;
            //#endregion

            //#region Append recipient for enveloped data
            cmsEnveloped.addRecipientByCertificate(safeContent.encryptingCertificate);
            //#endregion

            //#region Making encryption
            await cmsEnveloped.encrypt(encryptionAlgorithm, contentToEncrypt);


            this.safeContents.push(new ContentInfo({
              contentType: "1.2.840.113549.1.7.3",
              content: cmsEnveloped.toSchema()
            }));
            //#endregion
          }
          break;
        //#endregion
        //#region default
        default:
          throw new Error(`Incorrect value for "content.privacyMode": ${content.privacyMode}`);
        //#endregion
      }
    }
    //#endregion

    //#region Return result of the function
    return this;
    //#endregion
  }

}

