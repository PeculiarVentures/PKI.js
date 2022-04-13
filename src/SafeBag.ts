import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { Attribute } from "./Attribute";
import * as Schema from "./Schema";

const BAG_ID = "bagId";
const BAG_VALUE = "bagValue";
const BAG_ATTRIBUTES = "bagAttributes";
const CLEAR_PROPS = [
  BAG_ID,
  BAG_VALUE,
  BAG_ATTRIBUTES
];

export interface SafeBagParameters extends Schema.SchemaConstructor {
  bagId?: string;
  bagValue?: BagType;
  bagAttributes?: Attribute[];
}
/**
 * Class from RFC7292
 */
export class SafeBag implements Schema.SchemaCompatible {

  public bagId: string;
  public bagValue: BagType;
  public bagAttributes?: Attribute[];

  /**
   * Constructor for SafeBag class
   * @param parameters
   */
  constructor(parameters: SafeBagParameters = {}) {
    //#region Internal properties of the object
    this.bagId = pvutils.getParametersValue(parameters, BAG_ID, SafeBag.defaultValues(BAG_ID));
    this.bagValue = pvutils.getParametersValue(parameters, BAG_VALUE, SafeBag.defaultValues(BAG_VALUE));

    if (parameters.bagAttributes) {
      this.bagAttributes = pvutils.getParametersValue(parameters, BAG_ATTRIBUTES, SafeBag.defaultValues(BAG_ATTRIBUTES));
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
  public static defaultValues(memberName: typeof BAG_ID): string;
  public static defaultValues(memberName: typeof BAG_VALUE): BagType;
  public static defaultValues(memberName: typeof BAG_ATTRIBUTES): Attribute[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case BAG_ID:
        return "";
      case BAG_VALUE:
        return (new asn1js.Any());
      case BAG_ATTRIBUTES:
        return [];
      default:
        throw new Error(`Invalid member name for SafeBag class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case BAG_ID:
        return (memberValue === "");
      case BAG_VALUE:
        return (memberValue instanceof asn1js.Any);
      case BAG_ATTRIBUTES:
        return (memberValue.length === 0);
      default:
        throw new Error(`Invalid member name for SafeBag class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * SafeBag ::= SEQUENCE {
   *    bagId	      	BAG-TYPE.&id ({PKCS12BagSet}),
   *    bagValue      [0] EXPLICIT BAG-TYPE.&Type({PKCS12BagSet}{@bagId}),
   *    bagAttributes SET OF PKCS12Attribute OPTIONAL
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    bagId?: string;
    bagValue?: string;
    bagAttributes?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.ObjectIdentifier({ name: (names.bagId || BAG_ID) }),
        new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [new asn1js.Any({ name: (names.bagValue || BAG_VALUE) })] // EXPLICIT ANY value
        }),
        new asn1js.Set({
          optional: true,
          value: [
            new asn1js.Repeated({
              name: (names.bagAttributes || BAG_ATTRIBUTES),
              value: Attribute.schema()
            })
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
      SafeBag.schema({
        names: {
          bagId: BAG_ID,
          bagValue: BAG_VALUE,
          bagAttributes: BAG_ATTRIBUTES
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for SafeBag");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.bagId = asn1.result.bagId.valueBlock.toString();

    const bagType = SafeBagValueFactory.find(this.bagId);
    if (!bagType) {
      throw new Error(`Invalid BAG_ID for SafeBag: ${this.bagId}`);
    }
    this.bagValue = new bagType({ schema: asn1.result.bagValue });

    if (BAG_ATTRIBUTES in asn1.result) {
      this.bagAttributes = Array.from(asn1.result.bagAttributes, element => new Attribute({ schema: element }));
    }
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Construct and return new ASN.1 schema for this object
    const outputArray = [
      new asn1js.ObjectIdentifier({ value: this.bagId }),
      new asn1js.Constructed({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: [this.bagValue.toSchema()]
      })
    ];

    if (this.bagAttributes) {
      outputArray.push(new asn1js.Set({
        value: Array.from(this.bagAttributes, element => element.toSchema())
      }));
    }

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
    const output: any = {
      bagId: this.bagId,
      bagValue: this.bagValue.toJSON()
    };

    if (this.bagAttributes) {
      output.bagAttributes = Array.from(this.bagAttributes, element => element.toJSON());
    }

    return output;
  }

}

import { type BagType, SafeBagValueFactory } from "./SafeBagValueFactory";
