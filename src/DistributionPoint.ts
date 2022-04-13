import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { GeneralName } from "./GeneralName";
import { DistributionPointName } from "./IssuingDistributionPoint";
import { RelativeDistinguishedNames } from "./RelativeDistinguishedNames";
import * as Schema from "./Schema";

const DISTRIBUTION_POINT = "distributionPoint";
const DISTRIBUTION_POINT_NAMES = "distributionPointNames";
const REASONS = "reasons";
const CRL_ISSUER = "cRLIssuer";
const CRL_ISSUER_NAMES = "cRLIssuerNames";
const CLEAR_PROPS = [
  DISTRIBUTION_POINT,
  DISTRIBUTION_POINT_NAMES,
  REASONS,
  CRL_ISSUER,
  CRL_ISSUER_NAMES,
];

export interface DistributionPointParameters extends Schema.SchemaConstructor {
  distributionPoint?: DistributionPointName;
  reasons?: asn1js.BitString;
  cRLIssuer?: GeneralName[];
}

/**
 * Class from RFC5280
 */
export class DistributionPoint implements Schema.SchemaCompatible {

  public distributionPoint?: DistributionPointName;
  public reasons?: asn1js.BitString;
  public cRLIssuer?: GeneralName[];

  /**
   * Constructor for DistributionPoint class
   * @param parameters
   */
  constructor(parameters: DistributionPointParameters = {}) {
    //#region Internal properties of the object
    if (parameters.distributionPoint) {
      this.distributionPoint = pvutils.getParametersValue(parameters, DISTRIBUTION_POINT, DistributionPoint.defaultValues(DISTRIBUTION_POINT));
    }
    if (parameters.reasons) {
      this.reasons = pvutils.getParametersValue(parameters, REASONS, DistributionPoint.defaultValues(REASONS));
    }
    if (parameters.cRLIssuer) {
      this.cRLIssuer = pvutils.getParametersValue(parameters, CRL_ISSUER, DistributionPoint.defaultValues(CRL_ISSUER));
    }
    //#endregion

    //#region If input argument array contains "schema" for this object
    if (parameters.schema)
      this.fromSchema(parameters.schema);
    //#endregion
  }

  /**
   * Return default values for all class members
   * @param memberName String name for a class member
   */
  public static defaultValues(memberName: typeof DISTRIBUTION_POINT): DistributionPointName;
  public static defaultValues(memberName: typeof REASONS): asn1js.BitString;
  public static defaultValues(memberName: typeof CRL_ISSUER): GeneralName[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case DISTRIBUTION_POINT:
        return [];
      case REASONS:
        return new asn1js.BitString();
      case CRL_ISSUER:
        return [];
      default:
        throw new Error(`Invalid member name for DistributionPoint class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * DistributionPoint ::= SEQUENCE {
   *    distributionPoint       [0]     DistributionPointName OPTIONAL,
   *    reasons                 [1]     ReasonFlags OPTIONAL,
   *    cRLIssuer               [2]     GeneralNames OPTIONAL }
   *
   * DistributionPointName ::= CHOICE {
   *    fullName                [0]     GeneralNames,
   *    nameRelativeToCRLIssuer [1]     RelativeDistinguishedName }
   *
   * ReasonFlags ::= BIT STRING {
   *    unused                  (0),
   *    keyCompromise           (1),
   *    cACompromise            (2),
   *    affiliationChanged      (3),
   *    superseded              (4),
   *    cessationOfOperation    (5),
   *    certificateHold         (6),
   *    privilegeWithdrawn      (7),
   *    aACompromise            (8) }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    distributionPoint?: string;
    distributionPointNames?: string;
    reasons?: string;
    cRLIssuer?: string;
    cRLIssuerNames?: string;
  }> = {}): Schema.SchemaType {
    /**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [distributionPoint]
     * @property {string} [distributionPointNames]
     * @property {string} [reasons]
     * @property {string} [cRLIssuer]
     * @property {string} [cRLIssuerNames]
     */
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
            new asn1js.Choice({
              value: [
                new asn1js.Constructed({
                  name: (names.distributionPoint || ""),
                  optional: true,
                  idBlock: {
                    tagClass: 3, // CONTEXT-SPECIFIC
                    tagNumber: 0 // [0]
                  },
                  value: [
                    new asn1js.Repeated({
                      name: (names.distributionPointNames || ""),
                      value: GeneralName.schema()
                    })
                  ]
                }),
                new asn1js.Constructed({
                  name: (names.distributionPoint || ""),
                  optional: true,
                  idBlock: {
                    tagClass: 3, // CONTEXT-SPECIFIC
                    tagNumber: 1 // [1]
                  },
                  value: RelativeDistinguishedNames.schema().valueBlock.value
                })
              ]
            })
          ]
        }),
        new asn1js.Primitive({
          name: (names.reasons || ""),
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          }
        }), // IMPLICIT BitString value
        new asn1js.Constructed({
          name: (names.cRLIssuer || ""),
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 2 // [2]
          },
          value: [
            new asn1js.Repeated({
              name: (names.cRLIssuerNames || ""),
              value: GeneralName.schema()
            })
          ]
        }) // IMPLICIT BitString value
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
      DistributionPoint.schema({
        names: {
          distributionPoint: DISTRIBUTION_POINT,
          distributionPointNames: DISTRIBUTION_POINT_NAMES,
          reasons: REASONS,
          cRLIssuer: CRL_ISSUER,
          cRLIssuerNames: CRL_ISSUER_NAMES
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for DistributionPoint");
    //#endregion

    //#region Get internal properties from parsed schema
    if (DISTRIBUTION_POINT in asn1.result) {
      if (asn1.result.distributionPoint.idBlock.tagNumber === 0) { // GENERAL_NAMES variant
        this.distributionPoint = Array.from(asn1.result.distributionPointNames, element => new GeneralName({ schema: element }));
      }

      if (asn1.result.distributionPoint.idBlock.tagNumber === 1) {// RDN variant
        this.distributionPoint = new RelativeDistinguishedNames({
          schema: new asn1js.Sequence({
            value: asn1.result.distributionPoint.valueBlock.value
          })
        });
      }
    }

    if (REASONS in asn1.result) {
      this.reasons = new asn1js.BitString({ valueHex: asn1.result.reasons.valueBlock.valueHex });
    }

    if (CRL_ISSUER in asn1.result) {
      this.cRLIssuer = Array.from(asn1.result.cRLIssuerNames, element => new GeneralName({ schema: element }));
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

    if (this.distributionPoint) {
      let internalValue;

      if (this.distributionPoint instanceof Array) {
        internalValue = new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: Array.from(this.distributionPoint, element => element.toSchema())
        });
      } else if (this.distributionPoint) {
        internalValue = new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          value: [this.distributionPoint.toSchema()]
        });
      }

      outputArray.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: [internalValue]
      }));
    }

    if (this.reasons) {
      outputArray.push(new asn1js.Primitive({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 1 // [1]
        },
        valueHex: this.reasons.valueBlock.valueHex
      }));
    }

    if (this.cRLIssuer) {
      outputArray.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 2 // [2]
        },
        value: Array.from(this.cRLIssuer, element => element.toSchema())
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

    if (this.distributionPoint) {
      if (this.distributionPoint instanceof Array) {
        object.distributionPoint = Array.from(this.distributionPoint, element => element.toJSON());
      } else {
        object.distributionPoint = this.distributionPoint.toJSON();
      }
    }

    if (this.reasons) {
      object.reasons = this.reasons.toJSON();
    }

    if (this.cRLIssuer) {
      object.cRLIssuer = Array.from(this.cRLIssuer, element => element.toJSON());
    }

    return object;
  }

}
