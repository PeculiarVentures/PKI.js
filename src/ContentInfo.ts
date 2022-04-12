import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { id_ContentType_Data, id_ContentType_EncryptedData, id_ContentType_EnvelopedData, id_ContentType_SignedData } from "./ObjectIdentifiers";
import * as Schema from "./Schema";

const CONTENT_TYPE = "contentType";
const CONTENT = "content";
const CLEAR_PROPS = [CONTENT_TYPE, CONTENT];

export interface ContentInfoParameters extends Schema.SchemaConstructor {
  contentType?: string;
  content?: any;
}

export type ContentInfoSchema = Schema.SchemaParameters<{
  contentType?: string;
  content?: string;
}>;

/**
 * Class from RFC5652
 */
export default class ContentInfo {

  public static readonly DATA = id_ContentType_Data;
  public static readonly SIGNED_DATA = id_ContentType_SignedData;
  public static readonly ENVELOPED_DATA = id_ContentType_EnvelopedData;
  public static readonly ENCRYPTED_DATA = id_ContentType_EncryptedData;

  public contentType: string;
  public content: any;

  /**
   * Constructor for ContentInfo class
   * @param parameters
   */
  constructor(parameters: ContentInfoParameters = {}) {
    //#region Internal properties of the object
    this.contentType = pvutils.getParametersValue(parameters, CONTENT_TYPE, ContentInfo.defaultValues(CONTENT_TYPE));
    this.content = pvutils.getParametersValue(parameters, CONTENT, ContentInfo.defaultValues(CONTENT));
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
  public static defaultValues(memberName: typeof CONTENT_TYPE): string;
  public static defaultValues(memberName: typeof CONTENT): any;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case CONTENT_TYPE:
        return "";
      case CONTENT:
        return new asn1js.Any();
      default:
        throw new Error(`Invalid member name for ContentInfo class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  static compareWithDefault<T>(memberName: string, memberValue: T): memberValue is T {
    switch (memberName) {
      case CONTENT_TYPE:
        return (typeof memberValue === "string" &&
          memberValue === this.defaultValues(CONTENT_TYPE));
      case CONTENT:
        return (memberValue instanceof asn1js.Any);
      default:
        throw new Error(`Invalid member name for ContentInfo class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * ContentInfo ::= SEQUENCE {
   *    contentType ContentType,
   *    content [0] EXPLICIT ANY DEFINED BY contentType }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: ContentInfoSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    if (("optional" in names) === false) {
      names.optional = false;
    }

    return (new asn1js.Sequence({
      name: (names.blockName || "ContentInfo"),
      optional: names.optional,
      value: [
        new asn1js.ObjectIdentifier({ name: (names.contentType || CONTENT_TYPE) }),
        new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [new asn1js.Any({ name: (names.content || CONTENT) })] // EXPLICIT ANY value
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
      ContentInfo.schema()
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for ContentInfo");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.contentType = asn1.result.contentType.valueBlock.toString();
    this.content = asn1.result.content;
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
        new asn1js.ObjectIdentifier({ value: this.contentType }),
        new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [this.content] // EXPLICIT ANY value
        })
      ]
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    const object: any = {
      contentType: this.contentType
    };

    if (!(this.content instanceof asn1js.Any)) {
      object.content = this.content.toJSON();
    }

    return object;
  }

}
