import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import CertID, { CertIDSchema } from "./CertID";
import Extension from "./Extension";
import Extensions, { ExtensionsSchema } from "./Extensions";
import * as Schema from "./Schema";

const CERT_ID = "certID";
const CERT_STATUS = "certStatus";
const THIS_UPDATE = "thisUpdate";
const NEXT_UPDATE = "nextUpdate";
const SINGLE_EXTENSIONS = "singleExtensions";
const CLEAR_PROPS = [
  CERT_ID,
  CERT_STATUS,
  THIS_UPDATE,
  NEXT_UPDATE,
  SINGLE_EXTENSIONS,
];

export interface SingleResponseParameters extends Schema.SchemaConstructor {
  certID?: CertID;
  certStatus?: any;
  thisUpdate?: Date;
  nextUpdate?: Date;
  singleExtensions?: Extension[];
}

export type SingleResponseSchema = Schema.SchemaParameters<{
  certID?: CertIDSchema;
  certStatus?: string;
  thisUpdate?: string;
  nextUpdate?: string;
  singleExtensions?: ExtensionsSchema;
}>;

/**
 * Class from RFC6960
 */
export default class SingleResponse implements Schema.SchemaCompatible {
  certID: CertID;
  certStatus: any;
  thisUpdate: Date;
  nextUpdate?: Date;
  singleExtensions?: Extension[];

  /**
   * Constructor for SingleResponse class
   * @param parameters
   */
  constructor(parameters: SingleResponseParameters = {}) {
    //#region Internal properties of the object
    this.certID = pvutils.getParametersValue(parameters, CERT_ID, SingleResponse.defaultValues(CERT_ID));
    this.certStatus = pvutils.getParametersValue(parameters, CERT_STATUS, SingleResponse.defaultValues(CERT_STATUS));
    this.thisUpdate = pvutils.getParametersValue(parameters, THIS_UPDATE, SingleResponse.defaultValues(THIS_UPDATE));
    if (parameters.nextUpdate) {
      this.nextUpdate = pvutils.getParametersValue(parameters, NEXT_UPDATE, SingleResponse.defaultValues(NEXT_UPDATE));
    }
    if (parameters.singleExtensions) {
      this.singleExtensions = pvutils.getParametersValue(parameters, SINGLE_EXTENSIONS, SingleResponse.defaultValues(SINGLE_EXTENSIONS));
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
  public static defaultValues(memberName: typeof CERT_ID): CertID;
  public static defaultValues(memberName: typeof CERT_STATUS): any;
  public static defaultValues(memberName: typeof THIS_UPDATE): Date;
  public static defaultValues(memberName: typeof NEXT_UPDATE): Date;
  public static defaultValues(memberName: typeof SINGLE_EXTENSIONS): Extension[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case CERT_ID:
        return new CertID();
      case CERT_STATUS:
        return {};
      case THIS_UPDATE:
      case NEXT_UPDATE:
        return new Date(0, 0, 0);
      case SINGLE_EXTENSIONS:
        return [];
      default:
        throw new Error(`Invalid member name for SingleResponse class: ${memberName}`);
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
        // noinspection OverlyComplexBooleanExpressionJS
        return ((CertID.compareWithDefault("hashAlgorithm", memberValue.hashAlgorithm)) &&
          (CertID.compareWithDefault("issuerNameHash", memberValue.issuerNameHash)) &&
          (CertID.compareWithDefault("issuerKeyHash", memberValue.issuerKeyHash)) &&
          (CertID.compareWithDefault("serialNumber", memberValue.serialNumber)));
      case CERT_STATUS:
        return (Object.keys(memberValue).length === 0);
      case THIS_UPDATE:
      case NEXT_UPDATE:
        return (memberValue === SingleResponse.defaultValues(memberName as typeof NEXT_UPDATE));
      default:
        throw new Error(`Invalid member name for SingleResponse class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * SingleResponse ::= SEQUENCE {
   *    certID                       CertID,
   *    certStatus                   CertStatus,
   *    thisUpdate                   GeneralizedTime,
   *    nextUpdate         [0]       EXPLICIT GeneralizedTime OPTIONAL,
   *    singleExtensions   [1]       EXPLICIT Extensions OPTIONAL }
   *
   * CertStatus ::= CHOICE {
   *    good        [0]     IMPLICIT NULL,
   *    revoked     [1]     IMPLICIT RevokedInfo,
   *    unknown     [2]     IMPLICIT UnknownInfo }
   *
   * RevokedInfo ::= SEQUENCE {
   *    revocationTime              GeneralizedTime,
   *    revocationReason    [0]     EXPLICIT CRLReason OPTIONAL }
   *
   * UnknownInfo ::= NULL
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: SingleResponseSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        CertID.schema(names.certID || {}),
        new asn1js.Choice({
          value: [
            new asn1js.Primitive({
              name: (names.certStatus || ""),
              idBlock: {
                tagClass: 3, // CONTEXT-SPECIFIC
                tagNumber: 0 // [0]
              },
              lenBlockLength: 1 // The length contains one byte 0x00
            }), // IMPLICIT NULL (no "valueBlock")
            new asn1js.Constructed({
              name: (names.certStatus || ""),
              idBlock: {
                tagClass: 3, // CONTEXT-SPECIFIC
                tagNumber: 1 // [1]
              },
              value: [
                new asn1js.GeneralizedTime(),
                new asn1js.Constructed({
                  optional: true,
                  idBlock: {
                    tagClass: 3, // CONTEXT-SPECIFIC
                    tagNumber: 0 // [0]
                  },
                  value: [new asn1js.Enumerated()]
                })
              ]
            }),
            new asn1js.Primitive({
              name: (names.certStatus || ""),
              idBlock: {
                tagClass: 3, // CONTEXT-SPECIFIC
                tagNumber: 2 // [2]
              },
              lenBlock: { length: 1 }
            }) // IMPLICIT NULL (no "valueBlock")
          ]
        }),
        new asn1js.GeneralizedTime({ name: (names.thisUpdate || "") }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [new asn1js.GeneralizedTime({ name: (names.nextUpdate || "") })]
        }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          value: [Extensions.schema(names.singleExtensions || {})]
        }) // EXPLICIT SEQUENCE value
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
      SingleResponse.schema({
        names: {
          certID: {
            names: {
              blockName: CERT_ID
            }
          },
          certStatus: CERT_STATUS,
          thisUpdate: THIS_UPDATE,
          nextUpdate: NEXT_UPDATE,
          singleExtensions: {
            names: {
              blockName:
                SINGLE_EXTENSIONS
            }
          }
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for SingleResponse");
    //#endregion

    //#region Get internal properties from parsed schema
    this.certID = new CertID({ schema: asn1.result.certID });
    this.certStatus = asn1.result.certStatus;
    this.thisUpdate = asn1.result.thisUpdate.toDate();
    if (NEXT_UPDATE in asn1.result)
      this.nextUpdate = asn1.result.nextUpdate.toDate();

    if (SINGLE_EXTENSIONS in asn1.result)
      this.singleExtensions = Array.from(asn1.result.singleExtensions.valueBlock.value, element => new Extension({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Create value array for output sequence
    const outputArray = [];

    outputArray.push(this.certID.toSchema());
    outputArray.push(this.certStatus);
    outputArray.push(new asn1js.GeneralizedTime({ valueDate: this.thisUpdate }));
    if (this.nextUpdate) {
      outputArray.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: [new asn1js.GeneralizedTime({ valueDate: this.nextUpdate })]
      }));
    }

    if (this.singleExtensions) {
      outputArray.push(new asn1js.Sequence({
        value: Array.from(this.singleExtensions, element => element.toSchema())
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
   * @returns
   */
  public toJSON(): any {
    const _object: any = {
      certID: this.certID.toJSON(),
      certStatus: this.certStatus.toJSON(),
      thisUpdate: this.thisUpdate
    };

    if (this.nextUpdate) {
      _object.nextUpdate = this.nextUpdate;
    }

    if (this.singleExtensions) {
      _object.singleExtensions = Array.from(this.singleExtensions, element => element.toJSON());
    }

    return _object;
  }

}
