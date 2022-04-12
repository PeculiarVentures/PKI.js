import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import GeneralName, { GeneralNameSchema } from "./GeneralName";
import * as Schema from "./Schema";

const BASE = "base";
const MINIMUM = "minimum";
const MAXIMUM = "maximum";
const CLEAR_PROPS = [
  BASE,
  MINIMUM,
  MAXIMUM
];

export interface GeneralSubtreeParameters extends Schema.SchemaConstructor {
  base?: GeneralName;
  minimum?: number | asn1js.Integer;
  maximum?: number | asn1js.Integer;
}

/**
 * Class from RFC5280
 */
export default class GeneralSubtree implements Schema.SchemaCompatible {

  public base: GeneralName;
  public minimum: number | asn1js.Integer;
  public maximum?: number | asn1js.Integer;

  /**
   * Constructor for GeneralSubtree class
   * @param parameters
   */
  constructor(parameters: GeneralSubtreeParameters = {}) {
    //#region Internal properties of the object
    this.base = pvutils.getParametersValue(parameters, BASE, GeneralSubtree.defaultValues(BASE));
    this.minimum = pvutils.getParametersValue(parameters, MINIMUM, GeneralSubtree.defaultValues(MINIMUM));

    if (MAXIMUM in parameters) {
      this.maximum = pvutils.getParametersValue(parameters, MAXIMUM, GeneralSubtree.defaultValues(MAXIMUM));
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
  public static defaultValues(memberName: typeof BASE): GeneralName;
  public static defaultValues(memberName: typeof MINIMUM): number;
  public static defaultValues(memberName: typeof MAXIMUM): number;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case BASE:
        return new GeneralName();
      case MINIMUM:
        return 0;
      case MAXIMUM:
        return 0;
      default:
        throw new Error(`Invalid member name for GeneralSubtree class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * GeneralSubtree ::= SEQUENCE {
   *    base                    GeneralName,
   *    minimum         [0]     BaseDistance DEFAULT 0,
   *    maximum         [1]     BaseDistance OPTIONAL }
   *
   * BaseDistance ::= INTEGER (0..MAX)
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    base?: GeneralNameSchema;
    minimum?: string;
    maximum?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        GeneralName.schema(names.base || {}),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [new asn1js.Integer({ name: (names.minimum || "") })]
        }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          value: [new asn1js.Integer({ name: (names.maximum || "") })]
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
      GeneralSubtree.schema({
        names: {
          base: {
            names: {
              blockName: BASE
            }
          },
          minimum: MINIMUM,
          maximum: MAXIMUM
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for GeneralSubtree");
    //#endregion

    //#region Get internal properties from parsed schema
    this.base = new GeneralName({ schema: asn1.result.base });

    if (MINIMUM in asn1.result) {
      if (asn1.result.minimum.valueBlock.isHexOnly)
        this.minimum = asn1.result.minimum;
      else
        this.minimum = asn1.result.minimum.valueBlock.valueDec;
    }

    if (MAXIMUM in asn1.result) {
      if (asn1.result.maximum.valueBlock.isHexOnly)
        this.maximum = asn1.result.maximum;
      else
        this.maximum = asn1.result.maximum.valueBlock.valueDec;
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

    outputArray.push(this.base.toSchema());

    if (this.minimum !== 0) {
      let valueMinimum: number | asn1js.Integer = 0;

      if (this.minimum instanceof asn1js.Integer) {
        valueMinimum = this.minimum;
      } else {
        valueMinimum = new asn1js.Integer({ value: this.minimum });
      }

      outputArray.push(new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: [valueMinimum]
      }));
    }

    if (MAXIMUM in this) {
      let valueMaximum: number | asn1js.Integer = 0;

      if (this.maximum instanceof asn1js.Integer) {
        valueMaximum = this.maximum;
      } else {
        valueMaximum = new asn1js.Integer({ value: this.maximum });
      }

      outputArray.push(new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 1 // [1]
        },
        value: [valueMaximum]
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
    const object: any = {
      base: this.base.toJSON()
    };

    if (this.minimum !== 0) {
      if (typeof this.minimum === "number") {
        object.minimum = this.minimum;
      } else {
        object.minimum = this.minimum.toJSON();
      }
    }

    if (this.maximum !== undefined) {
      if (typeof this.maximum === "number") {
        object.maximum = this.maximum;
      } else {
        object.maximum = this.maximum.toJSON();
      }
    }

    return object;
  }

}
