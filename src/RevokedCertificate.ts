import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import Time from "./Time";
import Extensions from "./Extensions";
import * as Schema from "./Schema";

const USER_CERTIFICATE = "userCertificate";
const REVOCATION_DATE = "revocationDate";
const CRL_ENTRY_EXTENSIONS = "crlEntryExtensions";
const CLEAR_PROPS = [
  USER_CERTIFICATE,
  REVOCATION_DATE,
  CRL_ENTRY_EXTENSIONS
];

export interface RevokedCertificateParameters extends Schema.SchemaConstructor {
  userCertificate?: asn1js.Integer;
  revocationDate?: Time;
  crlEntryExtensions?: Extensions;
}

/**
 * Class from RFC5280
 */
export default class RevokedCertificate implements Schema.SchemaCompatible {

  public userCertificate: asn1js.Integer;
  public revocationDate: Time;
  public crlEntryExtensions?: Extensions;

  /**
   * Constructor for RevokedCertificate class
   * @param parameters
   */
  constructor(parameters: RevokedCertificateParameters = {}) {
    //#region Internal properties of the object
    this.userCertificate = pvutils.getParametersValue(parameters, USER_CERTIFICATE, RevokedCertificate.defaultValues(USER_CERTIFICATE));
    this.revocationDate = pvutils.getParametersValue(parameters, REVOCATION_DATE, RevokedCertificate.defaultValues(REVOCATION_DATE));
    if (parameters.crlEntryExtensions) {
      this.crlEntryExtensions = pvutils.getParametersValue(parameters, CRL_ENTRY_EXTENSIONS, RevokedCertificate.defaultValues(CRL_ENTRY_EXTENSIONS));
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
  public static defaultValues(memberName: typeof USER_CERTIFICATE): asn1js.Integer;
  public static defaultValues(memberName: typeof REVOCATION_DATE): Time;
  public static defaultValues(memberName: typeof CRL_ENTRY_EXTENSIONS): Extensions;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case USER_CERTIFICATE:
        return new asn1js.Integer();
      case REVOCATION_DATE:
        return new Time();
      case CRL_ENTRY_EXTENSIONS:
        return new Extensions();
      default:
        throw new Error(`Invalid member name for RevokedCertificate class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * revokedCertificates     SEQUENCE OF SEQUENCE  {
     *        userCertificate         CertificateSerialNumber,
     *        revocationDate          Time,
     *        crlEntryExtensions      Extensions OPTIONAL
     *                                 -- if present, version MUST be v2
     *                             }  OPTIONAL,
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    userCertificate?: string;
    revocationDate?: string;
    crlEntryExtensions?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Integer({ name: (names.userCertificate || USER_CERTIFICATE) }),
        Time.schema({
          names: {
            utcTimeName: (names.revocationDate || REVOCATION_DATE),
            generalTimeName: (names.revocationDate || REVOCATION_DATE)
          }
        }),
        Extensions.schema({
          names: {
            blockName: (names.crlEntryExtensions || CRL_ENTRY_EXTENSIONS)
          }
        }, true)
      ]
    });
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
      RevokedCertificate.schema()
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for RevokedCertificate");
    //#endregion

    //#region Get internal properties from parsed schema
    this.userCertificate = asn1.result.userCertificate;
    this.revocationDate = new Time({ schema: asn1.result.revocationDate });

    if (CRL_ENTRY_EXTENSIONS in asn1.result)
      this.crlEntryExtensions = new Extensions({ schema: asn1.result.crlEntryExtensions });
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Create array for output sequence
    const outputArray: any[] = [
      this.userCertificate,
      this.revocationDate.toSchema()
    ];

    if (this.crlEntryExtensions) {
      outputArray.push(this.crlEntryExtensions.toSchema());
    }
    //#endregion

    // Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: outputArray
    }));
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    const object: any = {
      userCertificate: this.userCertificate.toJSON(),
      revocationDate: this.revocationDate.toJSON
    };

    if (this.crlEntryExtensions) {
      object.crlEntryExtensions = this.crlEntryExtensions.toJSON();
    }

    return object;
  }

}
