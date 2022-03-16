import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import CertID, { CertIDSchema } from "./CertID";
import Extension, { ExtensionSchema } from "./Extension";
import * as Schema from "./Schema";

const REQ_CERT = "reqCert";
const SINGLE_REQUEST_EXTENSIONS = "singleRequestExtensions";
const CLEAR_PROPS = [
  REQ_CERT,
  SINGLE_REQUEST_EXTENSIONS,
];

export interface RequestParameters extends Schema.SchemaConstructor {
  reqCert?: CertID;
  singleRequestExtensions?: Extension[];
}

export type RequestSchema = Schema.SchemaParameters<{
  reqCert?: CertIDSchema;
  extensions?: ExtensionSchema;
  singleRequestExtensions?: string;
}>;

/**
 * Class from RFC6960
 */
export default class Request implements Schema.SchemaCompatible {

  public reqCert: CertID;
  public singleRequestExtensions?: Extension[];

  /**
   * Constructor for Request class
   * @param parameters
   */
  constructor(parameters: RequestParameters = {}) {
    //#region Internal properties of the object
    this.reqCert = pvutils.getParametersValue(parameters, REQ_CERT, Request.defaultValues(REQ_CERT));
    if (parameters.singleRequestExtensions) {
      this.singleRequestExtensions = pvutils.getParametersValue(parameters, SINGLE_REQUEST_EXTENSIONS, Request.defaultValues(SINGLE_REQUEST_EXTENSIONS));
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
  public static defaultValues(memberName: typeof REQ_CERT): CertID;
  public static defaultValues(memberName: typeof SINGLE_REQUEST_EXTENSIONS): Extension[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case REQ_CERT:
        return new CertID();
      case SINGLE_REQUEST_EXTENSIONS:
        return [];
      default:
        throw new Error(`Invalid member name for Request class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case REQ_CERT:
        return (memberValue.isEqual(Request.defaultValues(memberName)));
      case SINGLE_REQUEST_EXTENSIONS:
        return (memberValue.length === 0);
      default:
        throw new Error(`Invalid member name for Request class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * Request         ::=     SEQUENCE {
   *    reqCert                     CertID,
   *    singleRequestExtensions     [0] EXPLICIT Extensions OPTIONAL }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: RequestSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        CertID.schema(names.reqCert || {}),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [Extension.schema(names.extensions || {
            names: {
              blockName: (names.singleRequestExtensions || "")
            }
          })]
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
      Request.schema({
        names: {
          reqCert: {
            names: {
              blockName: REQ_CERT
            }
          },
          extensions: {
            names: {
              blockName: SINGLE_REQUEST_EXTENSIONS
            }
          }
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for Request");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.reqCert = new CertID({ schema: asn1.result.reqCert });

    if (SINGLE_REQUEST_EXTENSIONS in asn1.result) {
      this.singleRequestExtensions = Array.from(asn1.result.singleRequestExtensions.valueBlock.value, element => new Extension({ schema: element }));
    }
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): Schema.SchemaType {
    //#region Create array for output sequence
    const outputArray = [];

    outputArray.push(this.reqCert.toSchema());

    if (this.singleRequestExtensions) {
      outputArray.push(new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: [
          new asn1js.Sequence({
            value: Array.from(this.singleRequestExtensions, element => element.toSchema())
          })
        ]
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
      reqCert: this.reqCert.toJSON()
    };

    if (this.singleRequestExtensions)
      _object.singleRequestExtensions = Array.from(this.singleRequestExtensions, element => element.toJSON());

    return _object;
  }

}

