import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { stringPrep } from "./Helpers";
import * as Schema from "./Schema";

export interface AttributeTypeAndValueParameters extends Schema.SchemaConstructor {
  type?: string;
  value?: object;
}

export type AttributeValueType = asn1js.Utf8String
  | asn1js.BmpString
  | asn1js.UniversalString
  | asn1js.NumericString
  | asn1js.PrintableString
  | asn1js.TeletexString
  | asn1js.VideotexString
  | asn1js.IA5String
  | asn1js.GraphicString
  | asn1js.VisibleString
  | asn1js.GeneralString
  | asn1js.CharacterString;

/**
 * Class from RFC5280
 */
export class AttributeTypeAndValue {

  public type: string;
  public value: AttributeValueType;

  /**
   * Constructor for AttributeTypeAndValue class
   * @param parameters
   */
  constructor(parameters: AttributeTypeAndValueParameters = {}) {
    //#region Internal properties of the object
    this.type = pvutils.getParametersValue(parameters, "type", AttributeTypeAndValue.defaultValues("type"));
    this.value = pvutils.getParametersValue(parameters, "value", AttributeTypeAndValue.defaultValues("value"));
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
  public static defaultValues(memberName: "type"): string;
  public static defaultValues(memberName: "value"): AttributeValueType;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case "type":
        return "";
      case "value":
        return {};
      default:
        throw new Error(`Invalid member name for AttributeTypeAndValue class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * AttributeTypeAndValue ::= Sequence {
   *    type     AttributeType,
   *    value    AttributeValue }
   *
   * AttributeType ::= OBJECT IDENTIFIER
   *
   * AttributeValue ::= ANY -- DEFINED BY AttributeType
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  static schema(parameters: Schema.SchemaParameters<{ type?: "type", value?: "typeValue"; }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.ObjectIdentifier({ name: (names.type || "") }),
        new asn1js.Any({ name: (names.value || "") })
      ]
    }));
  }

  public static blockName(): string {
    return "AttributeTypeAndValue";
  }

  /**
   * Convert parsed asn1js object into current class
   * @param schema
   */
  public fromSchema(schema: Schema.SchemaType) {
    //#region Clear input data first
    pvutils.clearProps(schema, [
      "type",
      "typeValue"
    ]);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      AttributeTypeAndValue.schema({
        names: {
          type: "type",
          value: "typeValue"
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for AttributeTypeAndValue");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.type = asn1.result.type.valueBlock.toString();
    // noinspection JSUnresolvedVariable
    this.value = asn1.result.typeValue;
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
        new asn1js.ObjectIdentifier({ value: this.type }),
        this.value
      ]
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    const _object: any = {
      type: this.type
    };

    if (Object.keys(this.value).length !== 0) {
      _object.value = (this.value).toJSON();
    } else {
      _object.value = this.value;
    }

    return _object;
  }

  /**
   * Compare two AttributeTypeAndValue values, or AttributeTypeAndValue with ArrayBuffer value
   * @param compareTo The value compare to current
   */
  public isEqual(compareTo: AttributeTypeAndValue | ArrayBuffer): boolean {
    const stringBlockNames = [
      asn1js.Utf8String.blockName(),
      asn1js.BmpString.blockName(),
      asn1js.UniversalString.blockName(),
      asn1js.NumericString.blockName(),
      asn1js.PrintableString.blockName(),
      asn1js.TeletexString.blockName(),
      asn1js.VideotexString.blockName(),
      asn1js.IA5String.blockName(),
      asn1js.GraphicString.blockName(),
      asn1js.VisibleString.blockName(),
      asn1js.GeneralString.blockName(),
      asn1js.CharacterString.blockName()
    ];

    if (compareTo instanceof ArrayBuffer) {
      return pvutils.isEqualBuffer(this.value.valueBeforeDecode, compareTo);
    }

    if ((compareTo.constructor as asn1js.LocalBaseBlockType).blockName() === AttributeTypeAndValue.blockName()) {
      if (this.type !== compareTo.type)
        return false;

      //#region Check we do have both strings
      const isStringPair = [false, false];
      const thisName = (this.value.constructor as asn1js.LocalBaseBlockType).blockName();
      for (const name of stringBlockNames) {
        if (thisName === name) {
          isStringPair[0] = true;
        }
        if ((compareTo.value.constructor as asn1js.LocalBaseBlockType).blockName() === name) {
          isStringPair[1] = true;
        }
      }

      if (isStringPair[0] !== isStringPair[1]) {
        return false;
      }

      const isString = (isStringPair[0] && isStringPair[1]);
      //#endregion

      if (isString) {
        const value1 = stringPrep(this.value.valueBlock.value);
        const value2 = stringPrep(compareTo.value.valueBlock.value);

        if (value1.localeCompare(value2) !== 0)
          return false;
      }
      else // Comparing as two ArrayBuffers
      {
        if (pvutils.isEqualBuffer(this.value.valueBeforeDecode, compareTo.value.valueBeforeDecode) === false)
          return false;
      }

      return true;
    }

    return false;
  }

}

