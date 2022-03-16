import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

const E_CONTENT_TYPE = "eContentType";
const E_CONTENT = "eContent";
const CLEAR_PROPS = [
  E_CONTENT_TYPE,
  E_CONTENT,
];

export interface EncapsulatedContentInfoParameters extends Schema.SchemaConstructor {
  eContentType?: string;
  eContent?: asn1js.OctetString;
}

export type EncapsulatedContentInfoSchema = Schema.SchemaParameters<{
  eContentType?: string;
  eContent?: string;
}>;

/**
 * Class from RFC5652
 */
export default class EncapsulatedContentInfo implements Schema.SchemaCompatible {

  public eContentType: string;
  public eContent?: asn1js.OctetString;

  /**
   * Constructor for EncapsulatedContentInfo class
   * @param parameters
   */
  constructor(parameters: EncapsulatedContentInfoParameters = {}) {
    //#region Internal properties of the object
    this.eContentType = pvutils.getParametersValue(parameters, E_CONTENT_TYPE, EncapsulatedContentInfo.defaultValues(E_CONTENT_TYPE));
    if (parameters.eContent) {
      this.eContent = pvutils.getParametersValue(parameters, E_CONTENT, EncapsulatedContentInfo.defaultValues(E_CONTENT));
      if ((this.eContent.idBlock.tagClass === 1) &&
        (this.eContent.idBlock.tagNumber === 4)) {
        //#region Divide OCTET STRING value down to small pieces
        if (this.eContent.idBlock.isConstructed === false) {
          const constrString = new asn1js.OctetString({
            idBlock: { isConstructed: true },
            isConstructed: true
          });

          let offset = 0;
          let length = this.eContent.valueBlock.valueHex.byteLength;

          while (length > 0) {
            const pieceView = new Uint8Array(this.eContent.valueBlock.valueHex, offset, ((offset + 65536) > this.eContent.valueBlock.valueHex.byteLength) ? (this.eContent.valueBlock.valueHex.byteLength - offset) : 65536);
            const _array = new ArrayBuffer(pieceView.length);
            const _view = new Uint8Array(_array);

            for (let i = 0; i < _view.length; i++) {
              _view[i] = pieceView[i];
            }

            constrString.valueBlock.value.push(new asn1js.OctetString({ valueHex: _array }));

            length -= pieceView.length;
            offset += pieceView.length;
          }

          this.eContent = constrString;
        }
        //#endregion
      }
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
  public static defaultValues(memberName: typeof E_CONTENT_TYPE): string;
  public static defaultValues(memberName: typeof E_CONTENT): asn1js.OctetString;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case E_CONTENT_TYPE:
        return "";
      case E_CONTENT:
        return new asn1js.OctetString();
      default:
        throw new Error(`Invalid member name for EncapsulatedContentInfo class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case E_CONTENT_TYPE:
        return (memberValue === "");
      case E_CONTENT:
        {
          if ((memberValue.idBlock.tagClass === 1) && (memberValue.idBlock.tagNumber === 4))
            return (memberValue.isEqual(EncapsulatedContentInfo.defaultValues(E_CONTENT)));

          return false;
        }
      default:
        throw new Error(`Invalid member name for EncapsulatedContentInfo class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * EncapsulatedContentInfo ::= SEQUENCE {
   *    eContentType ContentType,
   *    eContent [0] EXPLICIT OCTET STRING OPTIONAL } * Changed it to ANY, as in PKCS#7
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: EncapsulatedContentInfoSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.ObjectIdentifier({ name: (names.eContentType || "") }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [
            new asn1js.Any({ name: (names.eContent || "") }) // In order to aling this with PKCS#7 and CMS as well
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
      EncapsulatedContentInfo.schema({
        names: {
          eContentType: E_CONTENT_TYPE,
          eContent: E_CONTENT
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for EncapsulatedContentInfo");
    //#endregion

    //#region Get internal properties from parsed schema
    this.eContentType = asn1.result.eContentType.valueBlock.toString();
    if (E_CONTENT in asn1.result)
      this.eContent = asn1.result.eContent;
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): Schema.SchemaType {
    //#region Create array for output sequence
    const outputArray = [];

    outputArray.push(new asn1js.ObjectIdentifier({ value: this.eContentType }));
    if (this.eContent) {
      if (EncapsulatedContentInfo.compareWithDefault(E_CONTENT, this.eContent) === false) {
        outputArray.push(new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [this.eContent]
        }));
      }
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
   */
  public toJSON(): any {
    const _object: any = {
      eContentType: this.eContentType
    };

    if (this.eContent && EncapsulatedContentInfo.compareWithDefault(E_CONTENT, this.eContent) === false) {
      _object.eContent = this.eContent.toJSON();
    }

    return _object;
  }

}

