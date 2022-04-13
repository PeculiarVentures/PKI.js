import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { GeneralSubtree } from "./GeneralSubtree";
import * as Schema from "./Schema";

const PERMITTED_SUBTREES = "permittedSubtrees";
const EXCLUDED_SUBTREES = "excludedSubtrees";
const CLEAR_PROPS = [
  PERMITTED_SUBTREES,
  EXCLUDED_SUBTREES
];

export interface NameConstraintsParameters extends Schema.SchemaConstructor {
  permittedSubtrees?: GeneralSubtree[];
  excludedSubtrees?: GeneralSubtree[];
}

/**
 * Class from RFC5280
 */
export class NameConstraints implements Schema.SchemaCompatible {

  public permittedSubtrees?: GeneralSubtree[];
  public excludedSubtrees?: GeneralSubtree[];

  /**
   * Constructor for NameConstraints class
   * @param parameters
   */
  constructor(parameters: NameConstraintsParameters = {}) {
    //#region Internal properties of the object
    if (parameters.permittedSubtrees) {
      this.permittedSubtrees = pvutils.getParametersValue(parameters, PERMITTED_SUBTREES, NameConstraints.defaultValues(PERMITTED_SUBTREES));
    }

    if (parameters.excludedSubtrees) {
      this.excludedSubtrees = pvutils.getParametersValue(parameters, EXCLUDED_SUBTREES, NameConstraints.defaultValues(EXCLUDED_SUBTREES));
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
  public static defaultValues(memberName: typeof PERMITTED_SUBTREES): GeneralSubtree[];
  public static defaultValues(memberName: typeof EXCLUDED_SUBTREES): GeneralSubtree[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case PERMITTED_SUBTREES:
      case EXCLUDED_SUBTREES:
        return [];
      default:
        throw new Error(`Invalid member name for NameConstraints class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * NameConstraints ::= SEQUENCE {
   *    permittedSubtrees       [0]     GeneralSubtrees OPTIONAL,
   *    excludedSubtrees        [1]     GeneralSubtrees OPTIONAL }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    permittedSubtrees?: string;
    excludedSubtrees?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [
            new asn1js.Repeated({
              name: (names.permittedSubtrees || ""),
              value: GeneralSubtree.schema()
            })
          ]
        }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          value: [
            new asn1js.Repeated({
              name: (names.excludedSubtrees || ""),
              value: GeneralSubtree.schema()
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
      NameConstraints.schema({
        names: {
          permittedSubtrees: PERMITTED_SUBTREES,
          excludedSubtrees: EXCLUDED_SUBTREES
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for NameConstraints");
    //#endregion

    //#region Get internal properties from parsed schema
    if (PERMITTED_SUBTREES in asn1.result)
      this.permittedSubtrees = Array.from(asn1.result.permittedSubtrees, element => new GeneralSubtree({ schema: element }));

    if (EXCLUDED_SUBTREES in asn1.result)
      this.excludedSubtrees = Array.from(asn1.result.excludedSubtrees, element => new GeneralSubtree({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Create array for output sequence
    const outputArray = [];

    if (this.permittedSubtrees) {
      outputArray.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: Array.from(this.permittedSubtrees, element => element.toSchema())
      }));
    }

    if (this.excludedSubtrees) {
      outputArray.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 1 // [1]
        },
        value: Array.from(this.excludedSubtrees, element => element.toSchema())
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

    if (this.permittedSubtrees) {
      object.permittedSubtrees = Array.from(this.permittedSubtrees, element => element.toJSON());
    }

    if (this.excludedSubtrees) {
      object.excludedSubtrees = Array.from(this.excludedSubtrees, element => element.toJSON());
    }

    return object;
  }

}
