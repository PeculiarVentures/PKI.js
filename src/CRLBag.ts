import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import CertificateRevocationList from "./CertificateRevocationList";
import { id_CRLBag_X509CRL } from "./ObjectIdentifiers";
import * as Schema from "./Schema";

const CRL_ID = "crlId";
const CRL_VALUE = "crlValue";
const PARSED_VALUE = "parsedValue";
const CLEAR_PROPS = [
  CRL_ID,
  CRL_VALUE,
];

export interface CRLBagParameters extends Schema.SchemaConstructor {
  crlId?: string;
  crlValue?: any;
  parsedValue?: any;
}

/**
 * Class from RFC7292
 */
export default class CRLBag implements Schema.SchemaCompatible {

  public crlId: string;
  public crlValue: any;
  public parsedValue?: any;
  public certValue?: any;

  /**
   * Constructor for CRLBag class
   * @param parameters
   */
  constructor(parameters: CRLBagParameters = {}) {
    //#region Internal properties of the object
    this.crlId = pvutils.getParametersValue(parameters, CRL_ID, CRLBag.defaultValues(CRL_ID));
    this.crlValue = pvutils.getParametersValue(parameters, CRL_VALUE, CRLBag.defaultValues(CRL_VALUE));
    if (parameters.parsedValue) {
      this.parsedValue = pvutils.getParametersValue(parameters, PARSED_VALUE, CRLBag.defaultValues(PARSED_VALUE));
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
  public static defaultValues(memberName: typeof CRL_ID): string;
  public static defaultValues(memberName: typeof CRL_VALUE): any;
  public static defaultValues(memberName: typeof PARSED_VALUE): any;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case CRL_ID:
        return "";
      case CRL_VALUE:
        return (new asn1js.Any());
      case PARSED_VALUE:
        return {};
      default:
        throw new Error(`Invalid member name for CRLBag class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case CRL_ID:
        return (memberValue === "");
      case CRL_VALUE:
        return (memberValue instanceof asn1js.Any);
      case PARSED_VALUE:
        return ((memberValue instanceof Object) && (Object.keys(memberValue).length === 0));
      default:
        throw new Error(`Invalid member name for CRLBag class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * CRLBag ::= SEQUENCE {
   *    crlId     	BAG-TYPE.&id ({CRLTypes}),
   *    crlValue 	[0] EXPLICIT BAG-TYPE.&Type ({CRLTypes}{@crlId})
   *}
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
      CRLBag.schema({
        names: {
          id: CRL_ID,
          value: CRL_VALUE
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for CRLBag");
    //#endregion

    //#region Get internal properties from parsed schema
    this.crlId = asn1.result.crlId.valueBlock.toString();
    this.crlValue = asn1.result.crlValue;

    switch (this.crlId) {
      case id_CRLBag_X509CRL: // x509CRL
        {
          const asn1Inner = asn1js.fromBER(this.certValue.valueBlock.valueHex);
          this.parsedValue = new CertificateRevocationList({ schema: asn1Inner.result });
        }
        break;
      default:
        throw new Error(`Incorrect CRL_ID value in CRLBag: ${this.crlId}`);
    }
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): Schema.SchemaType {
    //#region Construct and return new ASN.1 schema for this object
    if (this.parsedValue) {
      this.crlId = id_CRLBag_X509CRL;
      this.crlValue = new asn1js.OctetString({ valueHex: this.parsedValue.toSchema().toBER(false) });
    }

    return (new asn1js.Sequence({
      value: [
        new asn1js.ObjectIdentifier({ value: this.crlId }),
        new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [this.crlValue.toSchema()]
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
      crlId: this.crlId,
      crlValue: this.crlValue.toJSON()
    };
  }

}

