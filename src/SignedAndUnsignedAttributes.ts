import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import Attribute from "./Attribute";
import * as Schema from "./Schema";

const TYPE = "type";
const ATTRIBUTES = "attributes";
const ENCODED_VALUE = "encodedValue";
const CLEAR_PROPS = [
  ATTRIBUTES
];

export interface SignedAndUnsignedAttributesParameters extends Schema.SchemaConstructor {
  type?: number;
  attributes?: Attribute[];
  encodedValue?: ArrayBuffer;
}

export type SignedAndUnsignedAttributesSchema = Schema.SchemaParameters<{
  tagNumber?: number;
  attributes?: string;
}>;

/**
 * Class from RFC5652
 */
export default class SignedAndUnsignedAttributes implements Schema.SchemaCompatible {

  public type: number;
  public attributes: Attribute[];
  /**
   * Need to have it in order to successfully process with signature verification
   */
  public encodedValue: ArrayBuffer;

  /**
   * Constructor for SignedAndUnsignedAttributes class
   * @param parameters
   */
  constructor(parameters: SignedAndUnsignedAttributesParameters = {}) {
    //#region Internal properties of the object
    this.type = pvutils.getParametersValue(parameters, TYPE, SignedAndUnsignedAttributes.defaultValues(TYPE));
    this.attributes = pvutils.getParametersValue(parameters, ATTRIBUTES, SignedAndUnsignedAttributes.defaultValues(ATTRIBUTES));
    this.encodedValue = pvutils.getParametersValue(parameters, ENCODED_VALUE, SignedAndUnsignedAttributes.defaultValues(ENCODED_VALUE));
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
  public static defaultValues(memberName: typeof TYPE): number;
  public static defaultValues(memberName: typeof ATTRIBUTES): Attribute[];
  public static defaultValues(memberName: typeof ENCODED_VALUE): ArrayBuffer;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case TYPE:
        return (-1);
      case ATTRIBUTES:
        return [];
      case ENCODED_VALUE:
        return new ArrayBuffer(0);
      default:
        throw new Error(`Invalid member name for SignedAndUnsignedAttributes class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case TYPE:
        return (memberValue === SignedAndUnsignedAttributes.defaultValues(TYPE));
      case ATTRIBUTES:
        return (memberValue.length === 0);
      case ENCODED_VALUE:
        return (memberValue.byteLength === 0);
      default:
        throw new Error(`Invalid member name for SignedAndUnsignedAttributes class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * SignedAttributes ::= SET SIZE (1..MAX) OF Attribute
   *
   * UnsignedAttributes ::= SET SIZE (1..MAX) OF Attribute
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: SignedAndUnsignedAttributesSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Constructed({
      name: (names.blockName || ""),
      optional: true,
      idBlock: {
        tagClass: 3, // CONTEXT-SPECIFIC
        tagNumber: names.tagNumber || 0 // "SignedAttributes" = 0, "UnsignedAttributes" = 1
      },
      value: [
        new asn1js.Repeated({
          name: (names.attributes || ""),
          value: Attribute.schema()
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
      SignedAndUnsignedAttributes.schema({
        names: {
          tagNumber: this.type,
          attributes: ATTRIBUTES
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for SignedAndUnsignedAttributes");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.type = asn1.result.idBlock.tagNumber;
    this.encodedValue = asn1.result.valueBeforeDecode;

    //#region Change type from "[0]" to "SET" accordingly to standard
    const encodedView = new Uint8Array(this.encodedValue);
    encodedView[0] = 0x31;
    //#endregion

    if ((ATTRIBUTES in asn1.result) === false) {
      if (this.type === 0)
        throw new Error("Wrong structure of SignedUnsignedAttributes");
      else
        return; // Not so important in case of "UnsignedAttributes"
    }

    this.attributes = Array.from(asn1.result.attributes, element => new Attribute({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    if (SignedAndUnsignedAttributes.compareWithDefault(TYPE, this.type) || SignedAndUnsignedAttributes.compareWithDefault(ATTRIBUTES, this.attributes))
      throw new Error("Incorrectly initialized \"SignedAndUnsignedAttributes\" class");

    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Constructed({
      optional: true,
      idBlock: {
        tagClass: 3, // CONTEXT-SPECIFIC
        tagNumber: this.type // "SignedAttributes" = 0, "UnsignedAttributes" = 1
      },
      value: Array.from(this.attributes, element => element.toSchema())
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    if (SignedAndUnsignedAttributes.compareWithDefault(TYPE, this.type) || SignedAndUnsignedAttributes.compareWithDefault(ATTRIBUTES, this.attributes))
      throw new Error("Incorrectly initialized \"SignedAndUnsignedAttributes\" class");

    return {
      type: this.type,
      attributes: Array.from(this.attributes, element => element.toJSON())
    };
  }

}
