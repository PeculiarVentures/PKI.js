import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { Certificate } from "./Certificate";
import { AttributeCertificateV1 } from "./AttributeCertificateV1";
import { AttributeCertificateV2 } from "./AttributeCertificateV2";
import { OtherCertificateFormat } from "./OtherCertificateFormat";
import * as Schema from "./Schema";

const CERTIFICATES = "certificates";
const CLEAR_PROPS = [
  CERTIFICATES,
];

export type CertificateSetItem = Certificate | AttributeCertificateV1 | AttributeCertificateV2 | OtherCertificateFormat | Schema.SchemaType;

export interface CertificateSetParameters extends Schema.SchemaConstructor {
  certificates?: Certificate[];
}

/**
 * Class from RFC5652
 */
export class CertificateSet implements Schema.SchemaCompatible {

  public certificates: CertificateSetItem[];

  /**
   * Constructor for CertificateSet class
   * @param parameters
   */
  constructor(parameters: CertificateSetParameters = {}) {
    //#region Internal properties of the object
    this.certificates = pvutils.getParametersValue(parameters, CERTIFICATES, CertificateSet.defaultValues(CERTIFICATES));
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
  public static defaultValues(memberName: typeof CERTIFICATES): CertificateSetItem[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case CERTIFICATES:
        return [];
      default:
        throw new Error(`Invalid member name for Attribute class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * CertificateSet ::= SET OF CertificateChoices
   *
   * CertificateChoices ::= CHOICE {
   *    certificate Certificate,
   *    extendedCertificate [0] IMPLICIT ExtendedCertificate,  -- Obsolete
   *    v1AttrCert [1] IMPLICIT AttributeCertificateV1,        -- Obsolete
   *    v2AttrCert [2] IMPLICIT AttributeCertificateV2,
   *    other [3] IMPLICIT OtherCertificateFormat }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    certificates?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (
      new asn1js.Set({
        name: (names.blockName || ""),
        value: [
          new asn1js.Repeated({
            name: (names.certificates || CERTIFICATES),
            value: new asn1js.Choice({
              value: [
                Certificate.schema(),
                new asn1js.Constructed({
                  idBlock: {
                    tagClass: 3, // CONTEXT-SPECIFIC
                    tagNumber: 0 // [0]
                  },
                  value: [
                    new asn1js.Any()
                  ]
                }), // JUST A STUB
                new asn1js.Constructed({
                  idBlock: {
                    tagClass: 3, // CONTEXT-SPECIFIC
                    tagNumber: 1 // [1]
                  },
                  value: [
                    new asn1js.Sequence
                  ]
                }),
                new asn1js.Constructed({
                  idBlock: {
                    tagClass: 3, // CONTEXT-SPECIFIC
                    tagNumber: 2 // [2]
                  },
                  value: AttributeCertificateV2.schema().valueBlock.value
                }),
                new asn1js.Constructed({
                  idBlock: {
                    tagClass: 3, // CONTEXT-SPECIFIC
                    tagNumber: 3 // [3]
                  },
                  value: OtherCertificateFormat.schema().valueBlock.value
                })
              ]
            })
          })
        ]
      })
    );
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
      CertificateSet.schema()
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for CertificateSet");
    //#endregion

    //#region Get internal properties from parsed schema
    this.certificates = Array.from(asn1.result.certificates || [], (element: any) => {
      const initialTagNumber = element.idBlock.tagNumber;

      if (element.idBlock.tagClass === 1)
        return new Certificate({ schema: element });

      //#region Making "Sequence" from "Constructed" value
      const elementSequence = new asn1js.Sequence({
        value: element.valueBlock.value
      });
      //#endregion

      switch (initialTagNumber) {
        case 1:
          // WARN: It's possible that CMS contains AttributeCertificateV2 instead of AttributeCertificateV1
          // Check the certificate version
          if ((elementSequence.valueBlock.value[0] as any).valueBlock.value[0].valueBlock.valueDec === 1) {
            return new AttributeCertificateV2({ schema: elementSequence });
          } else {
            return new AttributeCertificateV1({ schema: elementSequence });
          }
        case 2:
          return new AttributeCertificateV2({ schema: elementSequence });
        case 3:
          return new OtherCertificateFormat({ schema: elementSequence });
        case 0:
        default:
      }

      return element;
    });
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Set {
    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Set({
      value: Array.from(this.certificates, element => {
        switch (true) {
          case (element instanceof Certificate):
            return element.toSchema();
          case (element instanceof AttributeCertificateV1):
            return new asn1js.Constructed({
              idBlock: {
                tagClass: 3,
                tagNumber: 1 // [1]
              },
              value: element.toSchema().valueBlock.value
            });
          case (element instanceof AttributeCertificateV2):
            return new asn1js.Constructed({
              idBlock: {
                tagClass: 3,
                tagNumber: 2 // [2]
              },
              value: element.toSchema().valueBlock.value
            });
          case (element instanceof OtherCertificateFormat):
            return new asn1js.Constructed({
              idBlock: {
                tagClass: 3,
                tagNumber: 3 // [3]
              },
              value: element.toSchema().valueBlock.value
            });
          default:
        }

        return element;
      })
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    return {
      certificates: Array.from(this.certificates, element => element.toJSON())
    };
  }

}

