import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import OtherKeyAttribute, { OtherKeyAttributeSchema } from "./OtherKeyAttribute";
import * as Schema from "./Schema";

const SUBJECT_KEY_IDENTIFIER = "subjectKeyIdentifier";
const DATE = "date";
const OTHER = "other";
const CLEAR_PROPS = [
  SUBJECT_KEY_IDENTIFIER,
  DATE,
  OTHER,
];

export interface RecipientKeyIdentifierParameters extends Schema.SchemaConstructor {
  subjectKeyIdentifier?: asn1js.OctetString;
  date?: asn1js.GeneralizedTime;
  other?: OtherKeyAttribute;
}

export type RecipientKeyIdentifierSchema = Schema.SchemaParameters<{
  subjectKeyIdentifier?: string;
  date?: string;
  other?: OtherKeyAttributeSchema;
}>;

/**
 * Class from RFC5652
 */
export default class RecipientKeyIdentifier {

  public subjectKeyIdentifier: asn1js.OctetString;
  public date?: asn1js.GeneralizedTime;
  public other?: OtherKeyAttribute;

  /**
   * Constructor for RecipientKeyIdentifier class
   * @param parameters
   */
  constructor(parameters: RecipientKeyIdentifierParameters = {}) {
    //#region Internal properties of the object
    this.subjectKeyIdentifier = getParametersValue(parameters, SUBJECT_KEY_IDENTIFIER, RecipientKeyIdentifier.defaultValues(SUBJECT_KEY_IDENTIFIER));
    if (parameters.date) {
      this.date = getParametersValue(parameters, DATE, RecipientKeyIdentifier.defaultValues(DATE));
    }
    if (parameters.other) {
      this.other = getParametersValue(parameters, OTHER, RecipientKeyIdentifier.defaultValues(OTHER));
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
  public static defaultValues(memberName: typeof SUBJECT_KEY_IDENTIFIER): asn1js.OctetString;
  public static defaultValues(memberName: typeof DATE): asn1js.GeneralizedTime;
  public static defaultValues(memberName: typeof OTHER): OtherKeyAttribute;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case SUBJECT_KEY_IDENTIFIER:
        return new asn1js.OctetString();
      case DATE:
        return new asn1js.GeneralizedTime();
      case OTHER:
        return new OtherKeyAttribute();
      default:
        throw new Error(`Invalid member name for RecipientKeyIdentifier class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case SUBJECT_KEY_IDENTIFIER:
        return (memberValue.isEqual(RecipientKeyIdentifier.defaultValues(SUBJECT_KEY_IDENTIFIER)));
      case DATE:
        // noinspection OverlyComplexBooleanExpressionJS
        return ((memberValue.year === 0) &&
          (memberValue.month === 0) &&
          (memberValue.day === 0) &&
          (memberValue.hour === 0) &&
          (memberValue.minute === 0) &&
          (memberValue.second === 0) &&
          (memberValue.millisecond === 0));
      case OTHER:
        return ((memberValue.keyAttrId === "") && (("keyAttr" in memberValue) === false));
      default:
        throw new Error(`Invalid member name for RecipientKeyIdentifier class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * RecipientKeyIdentifier ::= SEQUENCE {
   *    subjectKeyIdentifier SubjectKeyIdentifier,
   *    date GeneralizedTime OPTIONAL,
   *    other OtherKeyAttribute OPTIONAL }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: RecipientKeyIdentifierSchema = {}): Schema.SchemaType {
    const names = getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.OctetString({ name: (names.subjectKeyIdentifier || "") }),
        new asn1js.GeneralizedTime({
          optional: true,
          name: (names.date || "")
        }),
        OtherKeyAttribute.schema(names.other || {})
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
      RecipientKeyIdentifier.schema({
        names: {
          subjectKeyIdentifier: SUBJECT_KEY_IDENTIFIER,
          date: DATE,
          other: {
            names: {
              blockName: OTHER
            }
          }
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for RecipientKeyIdentifier");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.subjectKeyIdentifier = asn1.result.subjectKeyIdentifier;

    if (DATE in asn1.result)
      this.date = asn1.result.date;

    if (OTHER in asn1.result)
      this.other = new OtherKeyAttribute({ schema: asn1.result.other });
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Create array for output sequence
    const outputArray = [];

    outputArray.push(this.subjectKeyIdentifier);

    if (this.date) {
      outputArray.push(this.date);
    }

    if (this.other) {
      outputArray.push(this.other.toSchema());
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
      subjectKeyIdentifier: this.subjectKeyIdentifier.toJSON()
    };

    if (this.date) {
      _object.date = this.date;
    }

    if (this.other) {
      _object.other = this.other.toJSON();
    }

    return _object;
  }

}
