import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import DistributionPoint from "./DistributionPoint";
import { extensionValue } from "./ExtensionValueFactory";
import { id_CRLDistributionPoints, id_FreshestCRL } from "./ObjectIdentifiers";
import * as Schema from "./Schema";

const DISTRIBUTION_POINTS = "distributionPoints";
const CLEAR_PROPS = [
  DISTRIBUTION_POINTS
];

export interface CRLDistributionPointsParameters extends Schema.SchemaConstructor {
  distributionPoints?: DistributionPoint[];
}

/**
 * Class from RFC5280
 */
@extensionValue(id_CRLDistributionPoints, "CRLDistributionPoints")
@extensionValue(id_FreshestCRL, "FreshestCRL")
export default class CRLDistributionPoints implements Schema.SchemaCompatible {

  public distributionPoints: DistributionPoint[];

  /**
   * Constructor for CRLDistributionPoints class
   * @param parameters
   */
  constructor(parameters: CRLDistributionPointsParameters = {}) {
    //#region Internal properties of the object
    this.distributionPoints = pvutils.getParametersValue(parameters, DISTRIBUTION_POINTS, CRLDistributionPoints.defaultValues(DISTRIBUTION_POINTS));
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
  public static defaultValues(memberName: string): DistributionPoint[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case DISTRIBUTION_POINTS:
        return [];
      default:
        throw new Error(`Invalid member name for CRLDistributionPoints class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * CRLDistributionPoints ::= SEQUENCE SIZE (1..MAX) OF DistributionPoint
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    distributionPoints?: string;
  }> = {}): Schema.SchemaType {
    /**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [distributionPoints]
     */
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Repeated({
          name: (names.distributionPoints || ""),
          value: DistributionPoint.schema()
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
      CRLDistributionPoints.schema({
        names: {
          distributionPoints: DISTRIBUTION_POINTS
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for CRLDistributionPoints");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.distributionPoints = Array.from(asn1.result.distributionPoints, element => new DistributionPoint({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): Schema.SchemaType {
    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: Array.from(this.distributionPoints, element => element.toSchema())
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    return {
      distributionPoints: Array.from(this.distributionPoints, element => element.toJSON())
    };
  }

}

