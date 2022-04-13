import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

const TEMPLATE_ID = "templateID";
const TEMPLATE_MAJOR_VERSION = "templateMajorVersion";
const TEMPLATE_MINOR_VERSION = "templateMinorVersion";

export interface CertificateTemplateParameters extends Schema.SchemaConstructor {
  templateID?: string;
  templateMajorVersion?: number;
  templateMinorVersion?: number;
}

/**
 * Class from "[MS-WCCE]: Windows Client Certificate Enrollment Protocol"
 */
export class CertificateTemplate {

  public templateID: string;
  public templateMajorVersion?: number;
  public templateMinorVersion?: number;

  /**
   * Constructor for CertificateTemplate class
   * @param parameters
   */
  constructor(parameters: CertificateTemplateParameters = {}) {
    //#region Internal properties of the object
    this.templateID = pvutils.getParametersValue(parameters, TEMPLATE_ID, CertificateTemplate.defaultValues(TEMPLATE_ID));

    if (TEMPLATE_MAJOR_VERSION in parameters) {
      this.templateMajorVersion = pvutils.getParametersValue(parameters, TEMPLATE_MAJOR_VERSION, CertificateTemplate.defaultValues(TEMPLATE_MAJOR_VERSION));
    }

    if (TEMPLATE_MINOR_VERSION in parameters) {
      this.templateMinorVersion = pvutils.getParametersValue(parameters, TEMPLATE_MINOR_VERSION, CertificateTemplate.defaultValues(TEMPLATE_MINOR_VERSION));
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
  public static defaultValues(memberName: typeof TEMPLATE_MINOR_VERSION): number;
  public static defaultValues(memberName: typeof TEMPLATE_MAJOR_VERSION): number;
  public static defaultValues(memberName: typeof TEMPLATE_ID): string;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case TEMPLATE_ID:
        return "";
      case TEMPLATE_MAJOR_VERSION:
      case TEMPLATE_MINOR_VERSION:
        return 0;
      default:
        throw new Error(`Invalid member name for CertificateTemplate class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * CertificateTemplateOID ::= SEQUENCE {
     *    templateID              OBJECT IDENTIFIER,
     *    templateMajorVersion    INTEGER (0..4294967295) OPTIONAL,
     *    templateMinorVersion    INTEGER (0..4294967295) OPTIONAL
     * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  static schema(parameters: Schema.SchemaParameters<{
    templateID?: string,
    templateMajorVersion?: string,
    templateMinorVersion?: string,
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.ObjectIdentifier({ name: (names.templateID || "") }),
        new asn1js.Integer({
          name: (names.templateMajorVersion || ""),
          optional: true
        }),
        new asn1js.Integer({
          name: (names.templateMinorVersion || ""),
          optional: true
        }),
      ]
    }));
  }

  /**
   * Convert parsed asn1js object into current class
   * @param schema
   */
  public fromSchema(schema: Schema.SchemaType): void {
    //#region Clear input data first
    pvutils.clearProps(schema, [
      TEMPLATE_ID,
      TEMPLATE_MAJOR_VERSION,
      TEMPLATE_MINOR_VERSION
    ]);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      CertificateTemplate.schema({
        names: {
          templateID: TEMPLATE_ID,
          templateMajorVersion: TEMPLATE_MAJOR_VERSION,
          templateMinorVersion: TEMPLATE_MINOR_VERSION
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for CertificateTemplate");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.templateID = asn1.result.templateID.valueBlock.toString();

    if (TEMPLATE_MAJOR_VERSION in asn1.result) {
      this.templateMajorVersion = asn1.result.templateMajorVersion.valueBlock.valueDec;
    }

    if (TEMPLATE_MINOR_VERSION in asn1.result) {
      this.templateMinorVersion = asn1.result.templateMinorVersion.valueBlock.valueDec;
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

    outputArray.push(new asn1js.ObjectIdentifier({ value: this.templateID }));

    if (TEMPLATE_MAJOR_VERSION in this) {
      outputArray.push(new asn1js.Integer({ value: this.templateMajorVersion }));
    }

    if (TEMPLATE_MINOR_VERSION in this) {
      outputArray.push(new asn1js.Integer({ value: this.templateMinorVersion }));
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
      extnID: this.templateID
    };

    if (TEMPLATE_MAJOR_VERSION in this)
      object.templateMajorVersion = this.templateMajorVersion;

    if (TEMPLATE_MINOR_VERSION in this)
      object.templateMinorVersion = this.templateMinorVersion;

    return object;
  }

}
