import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import IssuerAndSerialNumber from "./IssuerAndSerialNumber";
import OriginatorPublicKey from "./OriginatorPublicKey";
import * as Schema from "./Schema";

const VARIANT = "variant";
const VALUE = "value";
const CLEAR_PROPS = [
  "blockName",
];

export interface OriginatorIdentifierOrKeyParameters extends Schema.SchemaConstructor {
  variant?: number;
  value?: any;
}

export type OriginatorIdentifierOrKeySchema = Schema.SchemaParameters;

/**
 * Class from RFC5652
 */
export default class OriginatorIdentifierOrKey {

  public variant: number;
  public value?: any;

  /**
   * Constructor for OriginatorIdentifierOrKey class
   * @param parameters
   */
  constructor(parameters: OriginatorIdentifierOrKeyParameters = {}) {
    //#region Internal properties of the object
    this.variant = pvutils.getParametersValue(parameters, VARIANT, OriginatorIdentifierOrKey.defaultValues(VARIANT));
    if (parameters.value) {
      this.value = pvutils.getParametersValue(parameters, VALUE, OriginatorIdentifierOrKey.defaultValues(VALUE));
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
  public static defaultValues(memberName: typeof VARIANT): number;
  public static defaultValues(memberName: typeof VALUE): any;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case VARIANT:
        return (-1);
      case VALUE:
        return {};
      default:
        throw new Error(`Invalid member name for OriginatorIdentifierOrKey class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case VARIANT:
        return (memberValue === (-1));
      case VALUE:
        return (Object.keys(memberValue).length === 0);
      default:
        throw new Error(`Invalid member name for OriginatorIdentifierOrKey class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * OriginatorIdentifierOrKey ::= CHOICE {
   *    issuerAndSerialNumber IssuerAndSerialNumber,
   *    subjectKeyIdentifier [0] SubjectKeyIdentifier,
   *    originatorKey [1] OriginatorPublicKey }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: OriginatorIdentifierOrKeySchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Choice({
      value: [
        IssuerAndSerialNumber.schema({
          names: {
            blockName: (names.blockName || "")
          }
        }),
        new asn1js.Primitive({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          name: (names.blockName || "")
        }),
        new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          name: (names.blockName || ""),
          value: OriginatorPublicKey.schema().valueBlock.value
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
      OriginatorIdentifierOrKey.schema({
        names: {
          blockName: "blockName"
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for OriginatorIdentifierOrKey");
    //#endregion

    //#region Get internal properties from parsed schema
    if (asn1.result.blockName.idBlock.tagClass === 1) {
      this.variant = 1;
      this.value = new IssuerAndSerialNumber({ schema: asn1.result.blockName });
    }
    else {
      if (asn1.result.blockName.idBlock.tagNumber === 0) {
        //#region Create "OCTETSTRING" from "ASN1_PRIMITIVE"
        asn1.result.blockName.idBlock.tagClass = 1; // UNIVERSAL
        asn1.result.blockName.idBlock.tagNumber = 4; // OCTETSTRING
        //#endregion

        this.variant = 2;
        this.value = asn1.result.blockName;
      }
      else {
        this.variant = 3;
        this.value = new OriginatorPublicKey({
          schema: new asn1js.Sequence({
            value: asn1.result.blockName.valueBlock.value
          })
        });
      }
    }
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.BaseBlock<any> {
    //#region Construct and return new ASN.1 schema for this object
    switch (this.variant) {
      case 1:
        return this.value.toSchema();
      case 2:
        this.value.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
        this.value.idBlock.tagNumber = 0; // [0]

        return this.value;
      case 3:
        {
          const _schema = this.value.toSchema();

          _schema.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
          _schema.idBlock.tagNumber = 1; // [1]

          return _schema;
        }
      default:
        return new asn1js.Any() as any;
    }
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    const _object: any = {
      variant: this.variant
    };

    if ((this.variant === 1) || (this.variant === 2) || (this.variant === 3)) {
      _object.value = this.value.toJSON();
    }

    return _object;
  }

}
