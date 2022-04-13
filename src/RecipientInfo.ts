import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { KeyTransRecipientInfo } from "./KeyTransRecipientInfo";
import { KeyAgreeRecipientInfo } from "./KeyAgreeRecipientInfo";
import { KEKRecipientInfo } from "./KEKRecipientInfo";
import { PasswordRecipientinfo } from "./PasswordRecipientinfo";
import { OtherRecipientInfo } from "./OtherRecipientInfo";
import * as Schema from "./Schema";
import { ParameterError } from "./errors";

const VARIANT = "variant";
const VALUE = "value";
const CLEAR_PROPS = [
  "blockName"
];

export type RecipientInfoValue = KeyTransRecipientInfo | KeyAgreeRecipientInfo | KEKRecipientInfo | PasswordRecipientinfo | OtherRecipientInfo;

export interface RecipientInfoParameters extends Schema.SchemaConstructor {
  variant?: number;
  value?: RecipientInfoValue;
}

/**
 * Class from RFC5652
 */
export class RecipientInfo implements Schema.SchemaCompatible {

  public variant: number;
  public value?: RecipientInfoValue;

  /**
   * Constructor for RecipientInfo class
   * @param parameters
   */
  constructor(parameters: RecipientInfoParameters = {}) {
    //#region Internal properties of the object
    this.variant = pvutils.getParametersValue(parameters, VARIANT, RecipientInfo.defaultValues(VARIANT));
    if (parameters.value) {
      this.value = pvutils.getParametersValue(parameters, VALUE, RecipientInfo.defaultValues(VALUE));
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
  public static defaultValues(memberName: typeof VALUE): RecipientInfoValue;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case VARIANT:
        return (-1);
      case VALUE:
        return {};
      default:
        throw new Error(`Invalid member name for RecipientInfo class: ${memberName}`);
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
        return (memberValue === RecipientInfo.defaultValues(memberName));
      case VALUE:
        return (Object.keys(memberValue).length === 0);
      default:
        throw new Error(`Invalid member name for RecipientInfo class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * RecipientInfo ::= CHOICE {
   *    ktri KeyTransRecipientInfo,
   *    kari [1] KeyAgreeRecipientInfo,
   *    kekri [2] KEKRecipientInfo,
   *    pwri [3] PasswordRecipientinfo,
   *    ori [4] OtherRecipientInfo }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Choice({
      value: [
        KeyTransRecipientInfo.schema({
          names: {
            blockName: (names.blockName || "")
          }
        }),
        new asn1js.Constructed({
          name: (names.blockName || ""),
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          value: KeyAgreeRecipientInfo.schema().valueBlock.value
        }),
        new asn1js.Constructed({
          name: (names.blockName || ""),
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 2 // [2]
          },
          value: KEKRecipientInfo.schema().valueBlock.value
        }),
        new asn1js.Constructed({
          name: (names.blockName || ""),
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 3 // [3]
          },
          value: PasswordRecipientinfo.schema().valueBlock.value
        }),
        new asn1js.Constructed({
          name: (names.blockName || ""),
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 4 // [4]
          },
          value: OtherRecipientInfo.schema().valueBlock.value
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
      RecipientInfo.schema({
        names: {
          blockName: "blockName"
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for RecipientInfo");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    if (asn1.result.blockName.idBlock.tagClass === 1) {
      this.variant = 1;
      this.value = new KeyTransRecipientInfo({ schema: asn1.result.blockName });
    }
    else {
      //#region Create "SEQUENCE" from "ASN1_CONSTRUCTED"
      const blockSequence = new asn1js.Sequence({
        value: asn1.result.blockName.valueBlock.value
      });
      //#endregion

      switch (asn1.result.blockName.idBlock.tagNumber) {
        case 1:
          this.variant = 2;
          this.value = new KeyAgreeRecipientInfo({ schema: blockSequence });
          break;
        case 2:
          this.variant = 3;
          this.value = new KEKRecipientInfo({ schema: blockSequence });
          break;
        case 3:
          this.variant = 4;
          this.value = new PasswordRecipientinfo({ schema: blockSequence });
          break;
        case 4:
          this.variant = 5;
          this.value = new OtherRecipientInfo({ schema: blockSequence });
          break;
        default:
          throw new Error("Incorrect structure of RecipientInfo block");
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
    ParameterError.assertEmpty(this.value, "value", "RecipientInfo");
    const _schema = this.value.toSchema();

    switch (this.variant) {
      case 1:
        return _schema;
      case 2:
      case 3:
      case 4:
        //#region Create "ASN1_CONSTRUCTED" from "SEQUENCE"
        _schema.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
        _schema.idBlock.tagNumber = (this.variant - 1);
        //#endregion

        return _schema;
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

    if (this.value && (this.variant >= 1) && (this.variant <= 4)) {
      _object.value = this.value.toJSON();
    }

    return _object;
  }

}
