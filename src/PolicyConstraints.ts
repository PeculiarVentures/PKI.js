import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { extensionValue } from "./ExtensionValueFactory";
import { id_PolicyConstraints } from "./ObjectIdentifiers";
import * as Schema from "./Schema";

const REQUIRE_EXPLICIT_POLICY = "requireExplicitPolicy";
const INHIBIT_POLICY_MAPPING = "inhibitPolicyMapping";
const CLEAR_PROPS = [
  REQUIRE_EXPLICIT_POLICY,
  INHIBIT_POLICY_MAPPING,
];

export interface PolicyConstraintsParameters extends Schema.SchemaConstructor {
  requireExplicitPolicy?: number;
  inhibitPolicyMapping?: number;
}

/**
 * Class from RFC5280
 */
@extensionValue(id_PolicyConstraints, "PolicyConstraints")
export default class PolicyConstraints implements Schema.SchemaCompatible {

  public requireExplicitPolicy?: number;
  public inhibitPolicyMapping?: number;

  /**
   * Constructor for PolicyConstraints class
   * @param parameters
   */
  constructor(parameters: PolicyConstraintsParameters = {}) {
    //#region Internal properties of the object
    if (REQUIRE_EXPLICIT_POLICY in parameters) {
      this.requireExplicitPolicy = pvutils.getParametersValue(parameters, REQUIRE_EXPLICIT_POLICY, PolicyConstraints.defaultValues(REQUIRE_EXPLICIT_POLICY));
    }
    if (INHIBIT_POLICY_MAPPING in parameters) {
      this.inhibitPolicyMapping = pvutils.getParametersValue(parameters, INHIBIT_POLICY_MAPPING, PolicyConstraints.defaultValues(INHIBIT_POLICY_MAPPING));
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
  public static defaultValues(memberName: typeof REQUIRE_EXPLICIT_POLICY): number;
  public static defaultValues(memberName: typeof INHIBIT_POLICY_MAPPING): number;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case REQUIRE_EXPLICIT_POLICY:
        return 0;
      case INHIBIT_POLICY_MAPPING:
        return 0;
      default:
        throw new Error(`Invalid member name for PolicyConstraints class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * PolicyConstraints ::= SEQUENCE {
   *    requireExplicitPolicy           [0] SkipCerts OPTIONAL,
   *    inhibitPolicyMapping            [1] SkipCerts OPTIONAL }
   *
   * SkipCerts ::= INTEGER (0..MAX)
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    requireExplicitPolicy?: string;
    inhibitPolicyMapping?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Primitive({
          name: (names.requireExplicitPolicy || ""),
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          }
        }), // IMPLICIT integer value
        new asn1js.Primitive({
          name: (names.inhibitPolicyMapping || ""),
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          }
        }) // IMPLICIT integer value
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
      PolicyConstraints.schema({
        names: {
          requireExplicitPolicy: REQUIRE_EXPLICIT_POLICY,
          inhibitPolicyMapping: INHIBIT_POLICY_MAPPING
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for PolicyConstraints");
    //#endregion

    //#region Get internal properties from parsed schema
    if (REQUIRE_EXPLICIT_POLICY in asn1.result) {
      const field1 = asn1.result.requireExplicitPolicy;

      field1.idBlock.tagClass = 1; // UNIVERSAL
      field1.idBlock.tagNumber = 2; // INTEGER

      const ber1 = field1.toBER(false);
      const int1 = asn1js.fromBER(ber1);

      this.requireExplicitPolicy = int1.result.valueBlock.valueDec;
    }

    if (INHIBIT_POLICY_MAPPING in asn1.result) {
      const field2 = asn1.result.inhibitPolicyMapping;

      field2.idBlock.tagClass = 1; // UNIVERSAL
      field2.idBlock.tagNumber = 2; // INTEGER

      const ber2 = field2.toBER(false);
      const int2 = asn1js.fromBER(ber2);

      this.inhibitPolicyMapping = int2.result.valueBlock.valueDec;
    }
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Create correct values for output sequence
    const outputArray = [];

    if (REQUIRE_EXPLICIT_POLICY in this) {
      const int1 = new asn1js.Integer({ value: this.requireExplicitPolicy });

      int1.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
      int1.idBlock.tagNumber = 0; // [0]

      outputArray.push(int1);
    }

    if (INHIBIT_POLICY_MAPPING in this) {
      const int2 = new asn1js.Integer({ value: this.inhibitPolicyMapping });

      int2.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
      int2.idBlock.tagNumber = 1; // [1]

      outputArray.push(int2);
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

    if (REQUIRE_EXPLICIT_POLICY in this) {
      object.requireExplicitPolicy = this.requireExplicitPolicy;
    }

    if (INHIBIT_POLICY_MAPPING in this) {
      object.inhibitPolicyMapping = this.inhibitPolicyMapping;
    }

    return object;
  }

}
