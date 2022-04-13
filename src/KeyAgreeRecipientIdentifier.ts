import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { IssuerAndSerialNumber, IssuerAndSerialNumberSchema } from "./IssuerAndSerialNumber";
import { RecipientKeyIdentifier, RecipientKeyIdentifierSchema } from "./RecipientKeyIdentifier";
import * as Schema from "./Schema";

const VARIANT = "variant";
const VALUE = "value";
const CLEAR_PROPS = [
  "blockName",
];

export interface KeyAgreeRecipientIdentifierParameters extends Schema.SchemaConstructor {
  variant?: number;
  value?: any;
}

export type KeyAgreeRecipientIdentifierSchema = Schema.SchemaParameters<{
  issuerAndSerialNumber?: IssuerAndSerialNumberSchema;
  rKeyId?: RecipientKeyIdentifierSchema;
}>;

/**
 * Class from RFC5652
 */
export class KeyAgreeRecipientIdentifier implements Schema.SchemaCompatible {

  public variant: number;
  public value: any;

  /**
   * Constructor for KeyAgreeRecipientIdentifier class
   * @param parameters
   */
  constructor(parameters: KeyAgreeRecipientIdentifierParameters = {}) {
    //#region Internal properties of the object
    this.variant = pvutils.getParametersValue(parameters, VARIANT, KeyAgreeRecipientIdentifier.defaultValues(VARIANT));
    this.value = pvutils.getParametersValue(parameters, VALUE, KeyAgreeRecipientIdentifier.defaultValues(VALUE));
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
        throw new Error(`Invalid member name for KeyAgreeRecipientIdentifier class: ${memberName}`);
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
        throw new Error(`Invalid member name for KeyAgreeRecipientIdentifier class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * KeyAgreeRecipientIdentifier ::= CHOICE {
   *    issuerAndSerialNumber IssuerAndSerialNumber,
   *    rKeyId [0] IMPLICIT RecipientKeyIdentifier }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: KeyAgreeRecipientIdentifierSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Choice({
      value: [
        IssuerAndSerialNumber.schema(names.issuerAndSerialNumber || {
          names: {
            blockName: (names.blockName || "")
          }
        }),
        new asn1js.Constructed({
          name: (names.blockName || ""),
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: RecipientKeyIdentifier.schema(names.rKeyId || {
            names: {
              blockName: (names.blockName || "")
            }
          }).valueBlock.value
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
      KeyAgreeRecipientIdentifier.schema({
        names: {
          blockName: "blockName"
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for KeyAgreeRecipientIdentifier");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    if (asn1.result.blockName.idBlock.tagClass === 1) {
      this.variant = 1;
      this.value = new IssuerAndSerialNumber({ schema: asn1.result.blockName });
    } else {
      this.variant = 2;

      this.value = new RecipientKeyIdentifier({
        schema: new asn1js.Sequence({
          value: asn1.result.blockName.valueBlock.value
        })
      });
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
        return new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: this.value.toSchema().valueBlock.value
        });
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

    if ((this.variant === 1) || (this.variant === 2)) {
      _object.value = this.value.toJSON();
    }

    return _object;
  }

}
