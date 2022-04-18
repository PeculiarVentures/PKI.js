import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { RelativeDistinguishedNames, RelativeDistinguishedNamesSchema } from "./RelativeDistinguishedNames";
import { SingleResponse, SingleResponseSchema } from "./SingleResponse";
import { Extension } from "./Extension";
import { Extensions, ExtensionsSchema } from "./Extensions";
import * as Schema from "./Schema";
import { AsnError } from "./errors";

const TBS = "tbs";
const VERSION = "version";
const RESPONDER_ID = "responderID";
const PRODUCED_AT = "producedAt";
const RESPONSES = "responses";
const RESPONSE_EXTENSIONS = "responseExtensions";
const RESPONSE_DATA = "ResponseData";
const RESPONSE_DATA_VERSION = `${RESPONSE_DATA}.${VERSION}`;
const RESPONSE_DATA_RESPONDER_ID = `${RESPONSE_DATA}.${RESPONDER_ID}`;
const RESPONSE_DATA_PRODUCED_AT = `${RESPONSE_DATA}.${PRODUCED_AT}`;
const RESPONSE_DATA_RESPONSES = `${RESPONSE_DATA}.${RESPONSES}`;
const RESPONSE_DATA_RESPONSE_EXTENSIONS = `${RESPONSE_DATA}.${RESPONSE_EXTENSIONS}`;
const CLEAR_PROPS = [
  RESPONSE_DATA,
  RESPONSE_DATA_VERSION,
  RESPONSE_DATA_RESPONDER_ID,
  RESPONSE_DATA_PRODUCED_AT,
  RESPONSE_DATA_RESPONSES,
  RESPONSE_DATA_RESPONSE_EXTENSIONS
];

export interface ResponseDataParameters extends Schema.SchemaConstructor {
  tbs?: ArrayBuffer;
  responderID?: any;
  producedAt?: Date;
  responses?: SingleResponse[];
  responseExtensions?: Extension[];
}

export type ResponseDataSchema = Schema.SchemaParameters<{
  version?: string;
  responderID?: string;
  ResponseDataByName?: RelativeDistinguishedNamesSchema;
  ResponseDataByKey?: string;
  producedAt?: string;
  response?: SingleResponseSchema;
  extensions?: ExtensionsSchema;
}>;

/**
 * Class from RFC6960
 */
export class ResponseData implements Schema.SchemaCompatible {

  public version?: number;
  public tbs: ArrayBuffer;
  public responderID: any;
  public producedAt: Date;
  public responses: SingleResponse[];
  public responseExtensions?: Extension[];

  /**
   * Constructor for ResponseData class
   * @param parameters
   */
  constructor(parameters: ResponseDataParameters = {}) {
    //#region Internal properties of the object
    this.tbs = pvutils.getParametersValue(parameters, TBS, ResponseData.defaultValues(TBS));
    if (VERSION in parameters) {
      this.version = pvutils.getParametersValue(parameters, VERSION, ResponseData.defaultValues(VERSION));
    }
    this.responderID = pvutils.getParametersValue(parameters, RESPONDER_ID, ResponseData.defaultValues(RESPONDER_ID));
    this.producedAt = pvutils.getParametersValue(parameters, PRODUCED_AT, ResponseData.defaultValues(PRODUCED_AT));
    this.responses = pvutils.getParametersValue(parameters, RESPONSES, ResponseData.defaultValues(RESPONSES));
    if (parameters.responseExtensions) {
      this.responseExtensions = pvutils.getParametersValue(parameters, RESPONSE_EXTENSIONS, ResponseData.defaultValues(RESPONSE_EXTENSIONS));
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
  public static defaultValues(memberName: typeof TBS): ArrayBuffer;
  public static defaultValues(memberName: typeof VERSION): number;
  public static defaultValues(memberName: typeof RESPONDER_ID): any;
  public static defaultValues(memberName: typeof PRODUCED_AT): Date;
  public static defaultValues(memberName: typeof RESPONSES): SingleResponse[];
  public static defaultValues(memberName: typeof RESPONSE_EXTENSIONS): Extension[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case VERSION:
        return 0;
      case TBS:
        return new ArrayBuffer(0);
      case RESPONDER_ID:
        return {};
      case PRODUCED_AT:
        return new Date(0, 0, 0);
      case RESPONSES:
      case RESPONSE_EXTENSIONS:
        return [];
      default:
        throw new Error(`Invalid member name for ResponseData class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      // TODO version?
      case TBS:
        return (memberValue.byteLength === 0);
      case RESPONDER_ID:
        return (Object.keys(memberValue).length === 0);
      case PRODUCED_AT:
        return (memberValue === ResponseData.defaultValues(memberName));
      case RESPONSES:
      case RESPONSE_EXTENSIONS:
        return (memberValue.length === 0);
      default:
        throw new Error(`Invalid member name for ResponseData class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * ResponseData ::= SEQUENCE {
   *    version              [0] EXPLICIT Version DEFAULT v1,
   *    responderID              ResponderID,
   *    producedAt               GeneralizedTime,
   *    responses                SEQUENCE OF SingleResponse,
   *    responseExtensions   [1] EXPLICIT Extensions OPTIONAL }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: ResponseDataSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || RESPONSE_DATA),
      value: [
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [new asn1js.Integer({ name: (names.version || RESPONSE_DATA_VERSION) })]
        }),
        new asn1js.Choice({
          value: [
            new asn1js.Constructed({
              name: (names.responderID || RESPONSE_DATA_RESPONDER_ID),
              idBlock: {
                tagClass: 3, // CONTEXT-SPECIFIC
                tagNumber: 1 // [1]
              },
              value: [RelativeDistinguishedNames.schema(names.ResponseDataByName || {
                names: {
                  blockName: "ResponseData.byName"
                }
              })]
            }),
            new asn1js.Constructed({
              name: (names.responderID || RESPONSE_DATA_RESPONDER_ID),
              idBlock: {
                tagClass: 3, // CONTEXT-SPECIFIC
                tagNumber: 2 // [2]
              },
              value: [new asn1js.OctetString({ name: (names.ResponseDataByKey || "ResponseData.byKey") })]
            })
          ]
        }),
        new asn1js.GeneralizedTime({ name: (names.producedAt || RESPONSE_DATA_PRODUCED_AT) }),
        new asn1js.Sequence({
          value: [
            new asn1js.Repeated({
              name: RESPONSE_DATA_RESPONSES,
              value: SingleResponse.schema(names.response || {})
            })
          ]
        }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          value: [Extensions.schema(names.extensions || {
            names: {
              blockName: RESPONSE_DATA_RESPONSE_EXTENSIONS
            }
          })]
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
      ResponseData.schema()
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for ResponseData");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.tbs = asn1.result.ResponseData.valueBeforeDecode;

    if (RESPONSE_DATA_VERSION in asn1.result)
      this.version = asn1.result[RESPONSE_DATA_VERSION].valueBlock.valueDec;

    if (asn1.result[RESPONSE_DATA_RESPONDER_ID].idBlock.tagNumber === 1)
      this.responderID = new RelativeDistinguishedNames({ schema: asn1.result[RESPONSE_DATA_RESPONDER_ID].valueBlock.value[0] });
    else
      this.responderID = asn1.result[RESPONSE_DATA_RESPONDER_ID].valueBlock.value[0]; // OCTETSTRING

    this.producedAt = asn1.result[RESPONSE_DATA_PRODUCED_AT].toDate();
    this.responses = Array.from(asn1.result[RESPONSE_DATA_RESPONSES], element => new SingleResponse({ schema: element }));

    if (RESPONSE_DATA_RESPONSE_EXTENSIONS in asn1.result)
      this.responseExtensions = Array.from(asn1.result[RESPONSE_DATA_RESPONSE_EXTENSIONS].valueBlock.value, element => new Extension({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @param encodeFlag If param equal to false then create TBS schema via decoding stored value. In other case create TBS schema via assembling from TBS parts.
   * @returns asn1js object
   */
  toSchema(encodeFlag = false) {
    //#region Decode stored TBS value
    let tbsSchema;

    if (encodeFlag === false) {
      if (!this.tbs.byteLength) {// No stored certificate TBS part
        return ResponseData.schema();
      }

      const asn1 = asn1js.fromBER(this.tbs);
      AsnError.assert(asn1, "TBS Response Data");
      tbsSchema = asn1.result;
    }
    //#endregion
    //#region Create TBS schema via assembling from TBS parts
    else {
      const outputArray = [];

      if (VERSION in this) {
        outputArray.push(new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [new asn1js.Integer({ value: this.version })]
        }));
      }

      if (this.responderID instanceof RelativeDistinguishedNames) {
        outputArray.push(new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          value: [this.responderID.toSchema()]
        }));
      } else {
        outputArray.push(new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 2 // [2]
          },
          value: [this.responderID]
        }));
      }

      outputArray.push(new asn1js.GeneralizedTime({ valueDate: this.producedAt }));

      outputArray.push(new asn1js.Sequence({
        value: Array.from(this.responses, element => element.toSchema())
      }));

      if (this.responseExtensions) {
        outputArray.push(new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          value: [new asn1js.Sequence({
            value: Array.from(this.responseExtensions, element => element.toSchema())
          })]
        }));
      }

      tbsSchema = new asn1js.Sequence({
        value: outputArray
      });
    }
    //#endregion

    //#region Construct and return new ASN.1 schema for this object
    return tbsSchema;
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    const _object: any = {};

    if (VERSION in this) {
      _object.version = this.version;
    }

    if (this.responderID) {
      _object.responderID = this.responderID;
    }

    if (this.producedAt) {
      _object.producedAt = this.producedAt;
    }

    if (this.responses) {
      _object.responses = Array.from(this.responses, element => element.toJSON());
    }

    if (this.responseExtensions) {
      _object.responseExtensions = Array.from(this.responseExtensions, element => element.toJSON());
    }

    return _object;
  }

}
