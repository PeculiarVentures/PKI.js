import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { RelativeDistinguishedNames, RelativeDistinguishedNamesSchema } from "./RelativeDistinguishedNames";
import * as Schema from "./Schema";

const ISSUER = "issuer";
const SERIAL_NUMBER = "serialNumber";
const CLEAR_PROPS = [
  ISSUER,
  SERIAL_NUMBER,
];


export interface IssuerAndSerialNumberParameters extends Schema.SchemaConstructor {
  issuer?: RelativeDistinguishedNames;
  serialNumber?: asn1js.Integer;
}

export type IssuerAndSerialNumberSchema = Schema.SchemaParameters<{
  issuer?: RelativeDistinguishedNamesSchema;
  serialNumber?: string;
}>;

/**
 * Class from RFC5652
 */
export class IssuerAndSerialNumber implements Schema.SchemaCompatible {

  public issuer: RelativeDistinguishedNames;
  public serialNumber: asn1js.Integer;

  /**
   * Constructor for IssuerAndSerialNumber class
   * @param parameters
   */
  constructor(parameters: IssuerAndSerialNumberParameters = {}) {
    //#region Internal properties of the object
    this.issuer = pvutils.getParametersValue(parameters, ISSUER, IssuerAndSerialNumber.defaultValues(ISSUER));
    this.serialNumber = pvutils.getParametersValue(parameters, SERIAL_NUMBER, IssuerAndSerialNumber.defaultValues(SERIAL_NUMBER));
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
  public static defaultValues(memberName: typeof ISSUER): RelativeDistinguishedNames;
  public static defaultValues(memberName: typeof SERIAL_NUMBER): asn1js.Integer;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case ISSUER:
        return new RelativeDistinguishedNames();
      case SERIAL_NUMBER:
        return new asn1js.Integer();
      default:
        throw new Error(`Invalid member name for IssuerAndSerialNumber class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * IssuerAndSerialNumber ::= SEQUENCE {
   *    issuer Name,
   *    serialNumber CertificateSerialNumber }
   *
   * CertificateSerialNumber ::= INTEGER
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: IssuerAndSerialNumberSchema = {}): Schema.SchemaType {
    /**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [issuer]
     * @property {string} [serialNumber]
     */
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        RelativeDistinguishedNames.schema(names.issuer || {}),
        new asn1js.Integer({ name: (names.serialNumber || "") })
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
      IssuerAndSerialNumber.schema({
        names: {
          issuer: {
            names: {
              blockName: ISSUER
            }
          },
          serialNumber: SERIAL_NUMBER
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for IssuerAndSerialNumber");
    //#endregion

    //#region Get internal properties from parsed schema
    this.issuer = new RelativeDistinguishedNames({ schema: asn1.result.issuer });
    this.serialNumber = asn1.result.serialNumber;
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
        this.issuer.toSchema(),
        this.serialNumber
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
      issuer: this.issuer.toJSON(),
      serialNumber: this.serialNumber.toJSON()
    };
  }

}
