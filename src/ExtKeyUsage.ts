import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

const KEY_PURPOSES = "keyPurposes";
const CLEAR_PROPS = [
  KEY_PURPOSES,
];

export interface ExtKeyUsageParameters extends Schema.SchemaConstructor {
  keyPurposes?: string[];
}

/**
 * Class from RFC5280
 */
export class ExtKeyUsage implements Schema.SchemaCompatible {

  public keyPurposes: string[];

  /**
   * Constructor for ExtKeyUsage class
   * @param parameters
   */
  constructor(parameters: ExtKeyUsageParameters = {}) {
    //#region Internal properties of the object
    this.keyPurposes = pvutils.getParametersValue(parameters, KEY_PURPOSES, ExtKeyUsage.defaultValues(KEY_PURPOSES));
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
  public static defaultValues(memberName: typeof KEY_PURPOSES): string[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case KEY_PURPOSES:
        return [];
      default:
        throw new Error(`Invalid member name for ExtKeyUsage class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * ExtKeyUsage ::= SEQUENCE SIZE (1..MAX) OF KeyPurposeId
   *
   * KeyPurposeId ::= OBJECT IDENTIFIER
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    keyPurposes?: string;
  }> = {}): Schema.SchemaType {
    /**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [keyPurposes]
     */
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Repeated({
          name: (names.keyPurposes || ""),
          value: new asn1js.ObjectIdentifier()
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
      ExtKeyUsage.schema({
        names: {
          keyPurposes: KEY_PURPOSES
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for ExtKeyUsage");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.keyPurposes = Array.from(asn1.result.keyPurposes, (element: asn1js.ObjectIdentifier) => element.valueBlock.toString());
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: Array.from(this.keyPurposes, element => new asn1js.ObjectIdentifier({ value: element }))
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    return {
      keyPurposes: Array.from(this.keyPurposes)
    };
  }

}

