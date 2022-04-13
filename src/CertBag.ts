import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { Certificate } from "./Certificate";
import { AttributeCertificateV2 } from "./AttributeCertificateV2";
import * as Schema from "./Schema";
import { id_CertBag_AttributeCertificate, id_CertBag_SDSICertificate, id_CertBag_X509Certificate } from "./ObjectIdentifiers";

const CERT_ID = "certId";
const CERT_VALUE = "certValue";
const PARSED_VALUE = "parsedValue";
const CLEAR_PROPS = [
  CERT_ID,
  CERT_VALUE
];

export interface CertBagParameters extends Schema.SchemaConstructor {
  certId?: string;
  certValue?: any;
  parsedValue?: any;
}

/**
 * Class from RFC7292
 */
export class CertBag implements Schema.SchemaCompatible {

  public certId: string;
  public certValue: any;
  public parsedValue: any;

  /**
   * Constructor for CertBag class
   * @param parameters
   */
  constructor(parameters: CertBagParameters = {}) {
    //#region Internal properties of the object
    this.certId = pvutils.getParametersValue(parameters, CERT_ID, CertBag.defaultValues(CERT_ID));
    this.certValue = pvutils.getParametersValue(parameters, CERT_VALUE, CertBag.defaultValues(CERT_VALUE));
    if (PARSED_VALUE in parameters) {
      this.parsedValue = pvutils.getParametersValue(parameters, PARSED_VALUE, CertBag.defaultValues(PARSED_VALUE));
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
  public static defaultValues(memberName: typeof CERT_ID): string;
  public static defaultValues(memberName: typeof CERT_VALUE): any;
  public static defaultValues(memberName: typeof PARSED_VALUE): any;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case CERT_ID:
        return "";
      case CERT_VALUE:
        return (new asn1js.Any());
      case PARSED_VALUE:
        return {};
      default:
        throw new Error(`Invalid member name for CertBag class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case CERT_ID:
        return (memberValue === "");
      case CERT_VALUE:
        return (memberValue instanceof asn1js.Any);
      case PARSED_VALUE:
        return ((memberValue instanceof Object) && (Object.keys(memberValue).length === 0));
      default:
        throw new Error(`Invalid member name for CertBag class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * CertBag ::= SEQUENCE {
   *    certId    BAG-TYPE.&id   ({CertTypes}),
   *    certValue [0] EXPLICIT BAG-TYPE.&Type ({CertTypes}{@certId})
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    id?: string;
    value?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.ObjectIdentifier({ name: (names.id || "id") }),
        new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [new asn1js.Any({ name: (names.value || "value") })] // EXPLICIT ANY value
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
      CertBag.schema({
        names: {
          id: CERT_ID,
          value: CERT_VALUE
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for CertBag");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.certId = asn1.result.certId.valueBlock.toString();
    this.certValue = asn1.result.certValue;

    switch (this.certId) {
      case id_CertBag_X509Certificate: // x509Certificate
        {
          const asn1Inner = asn1js.fromBER(this.certValue.valueBlock.valueHex);

          try {
            this.parsedValue = new Certificate({ schema: asn1Inner.result });
          }
          catch (ex) // In some realizations the same OID used for attribute certificates
          {
            this.parsedValue = new AttributeCertificateV2({ schema: asn1Inner.result });
          }
        }
        break;
      case id_CertBag_AttributeCertificate: // attributeCertificate - (!!!) THIS OID IS SUBJECT FOR CHANGE IN FUTURE (!!!)
        {
          const asn1Inner = asn1js.fromBER(this.certValue.valueBlock.valueHex);
          this.parsedValue = new AttributeCertificateV2({ schema: asn1Inner.result });
        }
        break;
      case id_CertBag_SDSICertificate: // sdsiCertificate
      default:
        throw new Error(`Incorrect CERT_ID value in CertBag: ${this.certId}`);
    }
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Construct and return new ASN.1 schema for this object
    if (PARSED_VALUE in this) {
      if ("acinfo" in this.parsedValue) {// attributeCertificate
        this.certId = id_CertBag_AttributeCertificate;
      } else {// x509Certificate
        this.certId = id_CertBag_X509Certificate;
      }

      this.certValue = new asn1js.OctetString({ valueHex: this.parsedValue.toSchema().toBER(false) });
    }

    return (new asn1js.Sequence({
      value: [
        new asn1js.ObjectIdentifier({ value: this.certId }),
        new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [(("toSchema" in this.certValue) ? this.certValue.toSchema() : this.certValue)]
        })
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
      certId: this.certId,
      certValue: this.certValue.toJSON()
    };
  }

}
