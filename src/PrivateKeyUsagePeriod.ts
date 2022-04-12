import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { extensionValue } from "./ExtensionValueFactory";
import { id_PrivateKeyUsagePeriod } from "./ObjectIdentifiers";
import * as Schema from "./Schema";

const NOT_BEFORE = "notBefore";
const NOT_AFTER = "notAfter";
const CLEAR_PROPS = [
  NOT_BEFORE,
  NOT_AFTER
];

export interface PrivateKeyUsagePeriodParameters extends Schema.SchemaConstructor {
  notBefore?: Date;
  notAfter?: Date;
}

/**
 * Class from RFC5280
 */
@extensionValue(id_PrivateKeyUsagePeriod, "PrivateKeyUsagePeriod")
export default class PrivateKeyUsagePeriod implements Schema.SchemaCompatible {

  public notBefore?: Date;
  public notAfter?: Date;

  /**
   * Constructor for PrivateKeyUsagePeriod class
   * @param parameters
   */
  constructor(parameters: PrivateKeyUsagePeriodParameters = {}) {
    //#region Internal properties of the object
    if (parameters.notBefore) {
      this.notBefore = pvutils.getParametersValue(parameters, NOT_BEFORE, PrivateKeyUsagePeriod.defaultValues(NOT_BEFORE));
    }

    if (parameters.notAfter) {
      this.notAfter = pvutils.getParametersValue(parameters, NOT_AFTER, PrivateKeyUsagePeriod.defaultValues(NOT_AFTER));
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
  public static defaultValues(memberName: typeof NOT_BEFORE): Date;
  public static defaultValues(memberName: typeof NOT_AFTER): Date;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case NOT_BEFORE:
        return new Date();
      case NOT_AFTER:
        return new Date();
      default:
        throw new Error(`Invalid member name for PrivateKeyUsagePeriod class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * PrivateKeyUsagePeriod OID ::= 2.5.29.16
   *
   * PrivateKeyUsagePeriod ::= SEQUENCE {
   *    notBefore       [0]     GeneralizedTime OPTIONAL,
   *    notAfter        [1]     GeneralizedTime OPTIONAL }
   * -- either notBefore or notAfter MUST be present
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    notBefore?: string;
    notAfter?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Primitive({
          name: (names.notBefore || ""),
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          }
        }),
        new asn1js.Primitive({
          name: (names.notAfter || ""),
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          }
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
      PrivateKeyUsagePeriod.schema({
        names: {
          notBefore: NOT_BEFORE,
          notAfter: NOT_AFTER
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for PrivateKeyUsagePeriod");
    //#endregion

    //#region Get internal properties from parsed schema
    if (NOT_BEFORE in asn1.result) {
      const localNotBefore = new asn1js.GeneralizedTime();
      localNotBefore.fromBuffer(asn1.result.notBefore.valueBlock.valueHex);
      this.notBefore = localNotBefore.toDate();
    }

    if (NOT_AFTER in asn1.result) {
      const localNotAfter = new asn1js.GeneralizedTime({ valueHex: asn1.result.notAfter.valueBlock.valueHex });
      localNotAfter.fromBuffer(asn1.result.notAfter.valueBlock.valueHex);
      this.notAfter = localNotAfter.toDate();
    }
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Create array for output sequence
    const outputArray = [];

    if (NOT_BEFORE in this) {
      outputArray.push(new asn1js.Primitive({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        valueHex: (new asn1js.GeneralizedTime({ valueDate: this.notBefore })).valueBlock.valueHex
      }));
    }

    if (NOT_AFTER in this) {
      outputArray.push(new asn1js.Primitive({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 1 // [1]
        },
        valueHex: (new asn1js.GeneralizedTime({ valueDate: this.notAfter })).valueBlock.valueHex
      }));
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
    const object: any = {};

    if (this.notBefore) {
      object.notBefore = this.notBefore;
    }

    if (this.notAfter) {
      object.notAfter = this.notAfter;
    }

    return object;
  }

}
