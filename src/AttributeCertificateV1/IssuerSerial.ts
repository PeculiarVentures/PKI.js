import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import GeneralNames, { GeneralNamesSchema } from "../GeneralNames";
import * as Schema from "../Schema";

const ISSUER = "issuer";
const SERIAL_NUMBER = "serialNumber";
const ISSUER_UID = "issuerUID";
const CLEAR_PROPS = [
  ISSUER,
  SERIAL_NUMBER,
  ISSUER_UID,
];

export interface IssuerSerialParameters extends Schema.SchemaConstructor {
  issuer?: GeneralNames;
  serialNumber?: asn1js.Integer;
  issuerUID?: asn1js.BitString;
}

/**
 * Class from RFC5755
 */
export class IssuerSerial implements Schema.SchemaCompatible {

  public issuer: GeneralNames;
  public serialNumber: asn1js.Integer;
  public issuerUID?: asn1js.BitString;

  /**
   * Constructor for IssuerSerial class
   * @param parameters
   */
  constructor(parameters: IssuerSerialParameters = {}) {
    //#region Internal properties of the object
    this.issuer = pvutils.getParametersValue(parameters, ISSUER, IssuerSerial.defaultValues(ISSUER));
    this.serialNumber = pvutils.getParametersValue(parameters, SERIAL_NUMBER, IssuerSerial.defaultValues(SERIAL_NUMBER));
    if (parameters.issuerUID) {
      this.issuerUID = pvutils.getParametersValue(parameters, ISSUER_UID, IssuerSerial.defaultValues(ISSUER_UID));
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
  public static defaultValues(memberName: typeof ISSUER): GeneralNames;
  public static defaultValues(memberName: typeof SERIAL_NUMBER): asn1js.Integer;
  public static defaultValues(memberName: typeof ISSUER_UID): asn1js.BitString;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case ISSUER:
        return new GeneralNames();
      case SERIAL_NUMBER:
        return new asn1js.Integer();
      case ISSUER_UID:
        return new asn1js.BitString();
      default:
        throw new Error(`Invalid member name for IssuerSerial class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * IssuerSerial  ::=  SEQUENCE {
   *   	issuer         GeneralNames,
   * 		serial         CertificateSerialNumber,
   * 		issuerUID      UniqueIdentifier OPTIONAL
   * }
   *
   * CertificateSerialNumber ::= INTEGER
   * UniqueIdentifier  ::=  BIT STRING
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    issuer?: GeneralNamesSchema;
    serialNumber?: string;
    issuerUID?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        GeneralNames.schema(names.issuer || {}),
        new asn1js.Integer({ name: (names.serialNumber || "") }),
        new asn1js.BitString({
          optional: true,
          name: (names.issuerUID || "")
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
      IssuerSerial.schema({
        names: {
          issuer: {
            names: {
              blockName: ISSUER
            }
          },
          serialNumber: SERIAL_NUMBER,
          issuerUID: ISSUER_UID
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for IssuerSerial");
    }
    //#endregion
    //#region Get internal properties from parsed schema
    this.issuer = new GeneralNames({ schema: asn1.result.issuer });
    this.serialNumber = asn1.result.serialNumber;

    if (ISSUER_UID in asn1.result)
      this.issuerUID = asn1.result.issuerUID;
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    const result = new asn1js.Sequence({
      value: [
        this.issuer.toSchema(),
        this.serialNumber
      ]
    });

    if (this.issuerUID) {
      result.valueBlock.value.push(this.issuerUID);
    }

    //#region Construct and return new ASN.1 schema for this object
    return result;
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    const result: any = {
      issuer: this.issuer.toJSON(),
      serialNumber: this.serialNumber.toJSON()
    };

    if (this.issuerUID) {
      result.issuerUID = this.issuerUID.toJSON();
    }

    return result;
  }

}
