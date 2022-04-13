import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { extensionValue } from "./ExtensionValueFactory";
import { GeneralName } from "./GeneralName";
import { id_AuthorityKeyIdentifier } from "./ObjectIdentifiers";
import * as Schema from "./Schema";

const KEY_IDENTIFIER = "keyIdentifier";
const AUTHORITY_CERT_ISSUER = "authorityCertIssuer";
const AUTHORITY_CERT_SERIAL_NUMBER = "authorityCertSerialNumber";
const CLEAR_PROPS = [
  KEY_IDENTIFIER,
  AUTHORITY_CERT_ISSUER,
  AUTHORITY_CERT_SERIAL_NUMBER,
];

export interface AuthorityKeyIdentifierParameters extends Schema.SchemaConstructor {
  keyIdentifier?: asn1js.OctetString;
  authorityCertIssuer?: GeneralName[];
  authorityCertSerialNumber?: asn1js.Integer;
}

/**
 * Class from RFC5280
 */
@extensionValue(id_AuthorityKeyIdentifier, "AuthorityKeyIdentifier")
export class AuthorityKeyIdentifier implements Schema.SchemaCompatible {

  public keyIdentifier?: asn1js.OctetString;
  public authorityCertIssuer?: GeneralName[];
  public authorityCertSerialNumber?: asn1js.Integer;

  /**
   * Constructor for AuthorityKeyIdentifier class
   * @param parameters
   */
  constructor(parameters: AuthorityKeyIdentifierParameters = {}) {
    //#region Internal properties of the object
    if (parameters.keyIdentifier) {
      this.keyIdentifier = pvutils.getParametersValue(parameters, KEY_IDENTIFIER, AuthorityKeyIdentifier.defaultValues(KEY_IDENTIFIER));
    }
    if (parameters.authorityCertIssuer) {
      this.authorityCertIssuer = pvutils.getParametersValue(parameters, AUTHORITY_CERT_ISSUER, AuthorityKeyIdentifier.defaultValues(AUTHORITY_CERT_ISSUER));
    }
    if (parameters.authorityCertSerialNumber) {
      this.authorityCertSerialNumber = pvutils.getParametersValue(parameters, AUTHORITY_CERT_SERIAL_NUMBER, AuthorityKeyIdentifier.defaultValues(AUTHORITY_CERT_SERIAL_NUMBER));
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
  public static defaultValues(memberName: typeof KEY_IDENTIFIER): asn1js.OctetString;
  public static defaultValues(memberName: typeof AUTHORITY_CERT_ISSUER): GeneralName[];
  public static defaultValues(memberName: typeof AUTHORITY_CERT_SERIAL_NUMBER): asn1js.Integer;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case KEY_IDENTIFIER:
        return new asn1js.OctetString();
      case AUTHORITY_CERT_ISSUER:
        return [];
      case AUTHORITY_CERT_SERIAL_NUMBER:
        return new asn1js.Integer();
      default:
        throw new Error(`Invalid member name for AuthorityKeyIdentifier class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * AuthorityKeyIdentifier OID ::= 2.5.29.35
   *
   * AuthorityKeyIdentifier ::= SEQUENCE {
   *    keyIdentifier             [0] KeyIdentifier           OPTIONAL,
   *    authorityCertIssuer       [1] GeneralNames            OPTIONAL,
   *    authorityCertSerialNumber [2] CertificateSerialNumber OPTIONAL  }
   *
   * KeyIdentifier ::= OCTET STRING
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    keyIdentifier?: string;
    authorityCertIssuer?: string;
    authorityCertSerialNumber?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Primitive({
          name: (names.keyIdentifier || ""),
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          }
        }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          value: [
            new asn1js.Repeated({
              name: (names.authorityCertIssuer || ""),
              value: GeneralName.schema()
            })
          ]
        }),
        new asn1js.Primitive({
          name: (names.authorityCertSerialNumber || ""),
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 2 // [2]
          }
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
      AuthorityKeyIdentifier.schema({
        names: {
          keyIdentifier: KEY_IDENTIFIER,
          authorityCertIssuer: AUTHORITY_CERT_ISSUER,
          authorityCertSerialNumber: AUTHORITY_CERT_SERIAL_NUMBER
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for AuthorityKeyIdentifier");
    //#endregion

    //#region Get internal properties from parsed schema
    if (KEY_IDENTIFIER in asn1.result)
      this.keyIdentifier = new asn1js.OctetString({ valueHex: asn1.result.keyIdentifier.valueBlock.valueHex });

    if (AUTHORITY_CERT_ISSUER in asn1.result)
      this.authorityCertIssuer = Array.from(asn1.result.authorityCertIssuer, element => new GeneralName({ schema: element }));

    if (AUTHORITY_CERT_SERIAL_NUMBER in asn1.result)
      this.authorityCertSerialNumber = new asn1js.Integer({ valueHex: asn1.result.authorityCertSerialNumber.valueBlock.valueHex });
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Create array for output sequence
    const outputArray = [];

    if (this.keyIdentifier) {
      outputArray.push(new asn1js.Primitive({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        valueHex: this.keyIdentifier.valueBlock.valueHex
      }));
    }

    if (this.authorityCertIssuer) {
      outputArray.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 1 // [1]
        },
        value: Array.from(this.authorityCertIssuer, element => element.toSchema())
      }));
    }

    if (this.authorityCertSerialNumber) {
      outputArray.push(new asn1js.Primitive({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 2 // [2]
        },
        valueHex: this.authorityCertSerialNumber.valueBlock.valueHex
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
   */
  public toJSON(): any {
    const object: any = {};

    if (this.keyIdentifier) {
      object.keyIdentifier = this.keyIdentifier.toJSON();
    }
    if (this.authorityCertIssuer) {
      object.authorityCertIssuer = Array.from(this.authorityCertIssuer, element => element.toJSON());
    }
    if (this.authorityCertSerialNumber) {
      object.authorityCertSerialNumber = this.authorityCertSerialNumber.toJSON();
    }

    return object;
  }

}

