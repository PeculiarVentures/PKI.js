import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

const ISSUER_DOMAIN_POLICY = "issuerDomainPolicy";
const SUBJECT_DOMAIN_POLICY = "subjectDomainPolicy";
const CLEAR_PROPS = [
  ISSUER_DOMAIN_POLICY,
  SUBJECT_DOMAIN_POLICY
];

export interface PolicyMappingParameters extends Schema.SchemaConstructor {
  issuerDomainPolicy?: string;
  subjectDomainPolicy?: string;
}

/**
 * Class from RFC5280
 */
export class PolicyMapping {

  public issuerDomainPolicy: string;
  public subjectDomainPolicy: string;

  /**
   * Constructor for PolicyMapping class
   * @param parameters
   */
  constructor(parameters: PolicyMappingParameters = {}) {
    //#region Internal properties of the object
    this.issuerDomainPolicy = pvutils.getParametersValue(parameters, ISSUER_DOMAIN_POLICY, PolicyMapping.defaultValues(ISSUER_DOMAIN_POLICY));
    this.subjectDomainPolicy = pvutils.getParametersValue(parameters, SUBJECT_DOMAIN_POLICY, PolicyMapping.defaultValues(SUBJECT_DOMAIN_POLICY));
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
  public static defaultValues(memberName: typeof ISSUER_DOMAIN_POLICY): string;
  public static defaultValues(memberName: typeof SUBJECT_DOMAIN_POLICY): string;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case ISSUER_DOMAIN_POLICY:
        return "";
      case SUBJECT_DOMAIN_POLICY:
        return "";
      default:
        throw new Error(`Invalid member name for PolicyMapping class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * PolicyMapping ::= SEQUENCE {
   *    issuerDomainPolicy      CertPolicyId,
   *    subjectDomainPolicy     CertPolicyId }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    issuerDomainPolicy?: string;
    subjectDomainPolicy?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.ObjectIdentifier({ name: (names.issuerDomainPolicy || "") }),
        new asn1js.ObjectIdentifier({ name: (names.subjectDomainPolicy || "") })
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
      PolicyMapping.schema({
        names: {
          issuerDomainPolicy: ISSUER_DOMAIN_POLICY,
          subjectDomainPolicy: SUBJECT_DOMAIN_POLICY
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for PolicyMapping");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.issuerDomainPolicy = asn1.result.issuerDomainPolicy.valueBlock.toString();
    this.subjectDomainPolicy = asn1.result.subjectDomainPolicy.valueBlock.toString();
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: [
        new asn1js.ObjectIdentifier({ value: this.issuerDomainPolicy }),
        new asn1js.ObjectIdentifier({ value: this.subjectDomainPolicy })
      ]
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    return {
      issuerDomainPolicy: this.issuerDomainPolicy,
      subjectDomainPolicy: this.subjectDomainPolicy
    };
  }

}
