import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { PolicyInformation } from "./PolicyInformation";
import * as Schema from "./Schema";

const CERTIFICATE_POLICIES = "certificatePolicies";
const CLEAR_PROPS = [
  CERTIFICATE_POLICIES,
];

export interface CertificatePoliciesParameters extends Schema.SchemaConstructor {
  certificatePolicies?: PolicyInformation[];
}

/**
 * Class from RFC5280
 */
export class CertificatePolicies implements Schema.SchemaCompatible {

  public certificatePolicies: PolicyInformation[];

  /**
   * Constructor for CertificatePolicies class
   * @param parameters
   */
  constructor(parameters: CertificatePoliciesParameters = {}) {
    //#region Internal properties of the object
    this.certificatePolicies = pvutils.getParametersValue(parameters, CERTIFICATE_POLICIES, CertificatePolicies.defaultValues(CERTIFICATE_POLICIES));
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
  public static defaultValues(memberName: typeof CERTIFICATE_POLICIES): PolicyInformation[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case CERTIFICATE_POLICIES:
        return [];
      default:
        throw new Error(`Invalid member name for CertificatePolicies class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * certificatePolicies ::= SEQUENCE SIZE (1..MAX) OF PolicyInformation
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  static schema(parameters: Schema.SchemaParameters<{ certificatePolicies?: string; }> = {}) {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Repeated({
          name: (names.certificatePolicies || ""),
          value: PolicyInformation.schema()
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
      CertificatePolicies.schema({
        names: {
          certificatePolicies: CERTIFICATE_POLICIES
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for CertificatePolicies");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.certificatePolicies = Array.from(asn1.result.certificatePolicies, element => new PolicyInformation({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: Array.from(this.certificatePolicies, element => element.toSchema())
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    return {
      certificatePolicies: Array.from(this.certificatePolicies, element => element.toJSON())
    };
  }

}

