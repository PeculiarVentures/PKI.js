import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import AlgorithmIdentifier, { AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import * as Schema from "./Schema";

const CONTENT_TYPE = "contentType";
const CONTENT_ENCRYPTION_ALGORITHM = "contentEncryptionAlgorithm";
const ENCRYPTED_CONTENT = "encryptedContent";
const CLEAR_PROPS = [
  CONTENT_TYPE,
  CONTENT_ENCRYPTION_ALGORITHM,
  ENCRYPTED_CONTENT,
];

export interface EncryptedContentParameters extends Schema.SchemaConstructor {
  contentType?: string;
  contentEncryptionAlgorithm?: AlgorithmIdentifier;
  encryptedContent?: asn1js.OctetString;
}

export type EncryptedContentInfoSchema = Schema.SchemaParameters<{
  contentType?: string;
  contentEncryptionAlgorithm?: AlgorithmIdentifierSchema;
  encryptedContent?: string;
}>;

/**
 * Class from RFC5652
 */
export default class EncryptedContentInfo implements Schema.SchemaCompatible {
  contentType: string;
  contentEncryptionAlgorithm: AlgorithmIdentifier;
  encryptedContent?: asn1js.OctetString;

  /**
   * Constructor for EncryptedContentInfo class
   * @param parameters
   */
  constructor(parameters: EncryptedContentParameters = {}) {
    //#region Internal properties of the object
    this.contentType = getParametersValue(parameters, CONTENT_TYPE, EncryptedContentInfo.defaultValues(CONTENT_TYPE));
    this.contentEncryptionAlgorithm = getParametersValue(parameters, CONTENT_ENCRYPTION_ALGORITHM, EncryptedContentInfo.defaultValues(CONTENT_ENCRYPTION_ALGORITHM));

    if (parameters.encryptedContent) {
      // encryptedContent (!!!) could be contructive or primitive value (!!!)
      this.encryptedContent = parameters.encryptedContent;

      if ((this.encryptedContent.idBlock.tagClass === 1) &&
        (this.encryptedContent.idBlock.tagNumber === 4)) {
        //#region Divide OCTETSTRING value down to small pieces
        if (this.encryptedContent.idBlock.isConstructed === false) {
          const constrString = new asn1js.OctetString({
            idBlock: { isConstructed: true },
            isConstructed: true
          });

          let offset = 0;
          let length = this.encryptedContent.valueBlock.valueHex.byteLength;

          while (length > 0) {
            const pieceView = new Uint8Array(this.encryptedContent.valueBlock.valueHex, offset, ((offset + 1024) > this.encryptedContent.valueBlock.valueHex.byteLength) ? (this.encryptedContent.valueBlock.valueHex.byteLength - offset) : 1024);
            const _array = new ArrayBuffer(pieceView.length);
            const _view = new Uint8Array(_array);

            for (let i = 0; i < _view.length; i++)
              _view[i] = pieceView[i];

            constrString.valueBlock.value.push(new asn1js.OctetString({ valueHex: _array }));

            length -= pieceView.length;
            offset += pieceView.length;
          }

          this.encryptedContent = constrString;
        }
        //#endregion
      }
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
  public static defaultValues(memberName: typeof CONTENT_TYPE): string;
  public static defaultValues(memberName: typeof CONTENT_ENCRYPTION_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof ENCRYPTED_CONTENT): asn1js.OctetString;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case CONTENT_TYPE:
        return "";
      case CONTENT_ENCRYPTION_ALGORITHM:
        return new AlgorithmIdentifier();
      case ENCRYPTED_CONTENT:
        return new asn1js.OctetString();
      default:
        throw new Error(`Invalid member name for EncryptedContentInfo class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case CONTENT_TYPE:
        return (memberValue === "");
      case CONTENT_ENCRYPTION_ALGORITHM:
        return ((memberValue.algorithmId === "") && (("algorithmParams" in memberValue) === false));
      case ENCRYPTED_CONTENT:
        return (memberValue.isEqual(EncryptedContentInfo.defaultValues(ENCRYPTED_CONTENT)));
      default:
        throw new Error(`Invalid member name for EncryptedContentInfo class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * EncryptedContentInfo ::= SEQUENCE {
   *    contentType ContentType,
   *    contentEncryptionAlgorithm ContentEncryptionAlgorithmIdentifier,
   *    encryptedContent [0] IMPLICIT EncryptedContent OPTIONAL }
   *
   * Comment: Strange, but modern crypto engines create ENCRYPTED_CONTENT as "[0] EXPLICIT EncryptedContent"
   *
   * EncryptedContent ::= OCTET STRING
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: EncryptedContentInfoSchema = {}): Schema.SchemaType {
    const names = getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.ObjectIdentifier({ name: (names.contentType || "") }),
        AlgorithmIdentifier.schema(names.contentEncryptionAlgorithm || {}),
        // The CHOICE we need because ENCRYPTED_CONTENT could have either "constructive"
        // or "primitive" form of encoding and we need to handle both variants
        new asn1js.Choice({
          value: [
            new asn1js.Constructed({
              name: (names.encryptedContent || ""),
              idBlock: {
                tagClass: 3, // CONTEXT-SPECIFIC
                tagNumber: 0 // [0]
              },
              value: [
                new asn1js.Repeated({
                  value: new asn1js.OctetString()
                })
              ]
            }),
            new asn1js.Primitive({
              name: (names.encryptedContent || ""),
              idBlock: {
                tagClass: 3, // CONTEXT-SPECIFIC
                tagNumber: 0 // [0]
              }
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
    clearProps(schema, CLEAR_PROPS);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      EncryptedContentInfo.schema({
        names: {
          contentType: CONTENT_TYPE,
          contentEncryptionAlgorithm: {
            names: {
              blockName: CONTENT_ENCRYPTION_ALGORITHM
            }
          },
          encryptedContent: ENCRYPTED_CONTENT
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for EncryptedContentInfo");
    //#endregion

    //#region Get internal properties from parsed schema
    this.contentType = asn1.result.contentType.valueBlock.toString();
    this.contentEncryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.contentEncryptionAlgorithm });

    if (ENCRYPTED_CONTENT in asn1.result) {
      this.encryptedContent = asn1.result.encryptedContent as asn1js.OctetString;

      this.encryptedContent.idBlock.tagClass = 1; // UNIVERSAL
      this.encryptedContent.idBlock.tagNumber = 4; // OCTETSTRING (!!!) The value still has instance of "in_window.org.pkijs.asn1.ASN1_CONSTRUCTED / ASN1_PRIMITIVE"
    }
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Create array for output sequence
    const sequenceLengthBlock = {
      isIndefiniteForm: false
    };

    const outputArray = [];

    outputArray.push(new asn1js.ObjectIdentifier({ value: this.contentType }));
    outputArray.push(this.contentEncryptionAlgorithm.toSchema());

    if (this.encryptedContent) {
      sequenceLengthBlock.isIndefiniteForm = this.encryptedContent.idBlock.isConstructed;

      const encryptedValue = this.encryptedContent;

      encryptedValue.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
      encryptedValue.idBlock.tagNumber = 0; // [0]

      encryptedValue.lenBlock.isIndefiniteForm = this.encryptedContent.idBlock.isConstructed;

      outputArray.push(encryptedValue);
    }
    //#endregion

    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      lenBlock: sequenceLengthBlock,
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
      contentType: this.contentType,
      contentEncryptionAlgorithm: this.contentEncryptionAlgorithm.toJSON()
    };

    if (this.encryptedContent) {
      _object.encryptedContent = this.encryptedContent.toJSON();
    }

    return _object;
  }

}

