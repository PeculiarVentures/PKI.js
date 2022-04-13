import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { GeneralName, GeneralNameSchema } from "./GeneralName";
import { Request, RequestSchema } from "./Request";
import { Extension } from "./Extension";
import { Extensions, ExtensionsSchema } from "./Extensions";
import * as Schema from "./Schema";

const TBS = "tbs";
const VERSION = "version";
const REQUESTOR_NAME = "requestorName";
const REQUEST_LIST = "requestList";
const REQUEST_EXTENSIONS = "requestExtensions";
const TBS_REQUEST = "TBSRequest";
const TBS_REQUEST_VERSION = `${TBS_REQUEST}.${VERSION}`;
const TBS_REQUEST_REQUESTOR_NAME = `${TBS_REQUEST}.${REQUESTOR_NAME}`;
const TBS_REQUEST_REQUESTS = `${TBS_REQUEST}.requests`;
const TBS_REQUEST_REQUEST_EXTENSIONS = `${TBS_REQUEST}.${REQUEST_EXTENSIONS}`;
const CLEAR_PROPS = [
  TBS_REQUEST,
  TBS_REQUEST_VERSION,
  TBS_REQUEST_REQUESTOR_NAME,
  TBS_REQUEST_REQUESTS,
  TBS_REQUEST_REQUEST_EXTENSIONS
];

export interface TBSRequestParameters extends Schema.SchemaConstructor {
  tbs?: ArrayBuffer;
  version?: number;
  requestorName?: GeneralName;
  requestList?: Request[];
  requestExtensions?: Extension[];
}

export type TBSRequestSchema = Schema.SchemaParameters<{
  TBSRequestVersion?: string;
  requestorName?: GeneralNameSchema;
  requestList?: string;
  requests?: string;
  requestNames?: RequestSchema;
  extensions?: ExtensionsSchema;
  requestExtensions?: string;
}>;

/**
 * Class from RFC6960
 */
export class TBSRequest implements Schema.SchemaCompatible {

  public tbs: ArrayBuffer;
  public version?: number;
  public requestorName?: GeneralName;
  public requestList: Request[];
  public requestExtensions?: Extension[];

  /**
   * Constructor for TBSRequest class
   * @param parameters
   */
  constructor(parameters: TBSRequestParameters = {}) {
    //#region Internal properties of the object
    this.tbs = pvutils.getParametersValue(parameters, TBS, TBSRequest.defaultValues(TBS));
    if (parameters.version !== undefined) {
      this.version = pvutils.getParametersValue(parameters, VERSION, TBSRequest.defaultValues(VERSION));
    }
    if (parameters.requestorName) {
      this.requestorName = pvutils.getParametersValue(parameters, REQUESTOR_NAME, TBSRequest.defaultValues(REQUESTOR_NAME));
    }
    this.requestList = pvutils.getParametersValue(parameters, REQUEST_LIST, TBSRequest.defaultValues(REQUEST_LIST));
    if (parameters.requestExtensions) {
      this.requestExtensions = pvutils.getParametersValue(parameters, REQUEST_EXTENSIONS, TBSRequest.defaultValues(REQUEST_EXTENSIONS));
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
  public static defaultValues(memberName: typeof REQUESTOR_NAME): GeneralName;
  public static defaultValues(memberName: typeof REQUEST_LIST): Request[];
  public static defaultValues(memberName: typeof REQUEST_EXTENSIONS): Extension[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case TBS:
        return new ArrayBuffer(0);
      case VERSION:
        return 0;
      case REQUESTOR_NAME:
        return new GeneralName();
      case REQUEST_LIST:
      case REQUEST_EXTENSIONS:
        return [];
      default:
        throw new Error(`Invalid member name for TBSRequest class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case TBS:
        return (memberValue.byteLength === 0);
      case VERSION:
        return (memberValue === TBSRequest.defaultValues(memberName));
      case REQUESTOR_NAME:
        return ((memberValue.type === GeneralName.defaultValues("type")) && (Object.keys(memberValue.value).length === 0));
      case REQUEST_LIST:
      case REQUEST_EXTENSIONS:
        return (memberValue.length === 0);
      default:
        throw new Error(`Invalid member name for TBSRequest class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * TBSRequest      ::=     SEQUENCE {
   *    version             [0]     EXPLICIT Version DEFAULT v1,
   *    requestorName       [1]     EXPLICIT GeneralName OPTIONAL,
   *    requestList                 SEQUENCE OF Request,
   *    requestExtensions   [2]     EXPLICIT Extensions OPTIONAL }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: TBSRequestSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || TBS_REQUEST),
      value: [
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [new asn1js.Integer({ name: (names.TBSRequestVersion || TBS_REQUEST_VERSION) })]
        }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          value: [GeneralName.schema(names.requestorName || {
            names: {
              blockName: TBS_REQUEST_REQUESTOR_NAME
            }
          })]
        }),
        new asn1js.Sequence({
          name: (names.requestList || "TBSRequest.requestList"),
          value: [
            new asn1js.Repeated({
              name: (names.requests || TBS_REQUEST_REQUESTS),
              value: Request.schema(names.requestNames || {})
            })
          ]
        }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 2 // [2]
          },
          value: [Extensions.schema(names.extensions || {
            names: {
              blockName: (names.requestExtensions || TBS_REQUEST_REQUEST_EXTENSIONS)
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
      TBSRequest.schema()
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for TBSRequest");
    //#endregion

    //#region Get internal properties from parsed schema
    this.tbs = asn1.result.TBSRequest.valueBeforeDecode;

    if (TBS_REQUEST_VERSION in asn1.result)
      this.version = asn1.result[TBS_REQUEST_VERSION].valueBlock.valueDec;
    if (TBS_REQUEST_REQUESTOR_NAME in asn1.result)
      this.requestorName = new GeneralName({ schema: asn1.result[TBS_REQUEST_REQUESTOR_NAME] });

    this.requestList = Array.from(asn1.result[TBS_REQUEST_REQUESTS], element => new Request({ schema: element }));

    if (TBS_REQUEST_REQUEST_EXTENSIONS in asn1.result)
      this.requestExtensions = Array.from(asn1.result[TBS_REQUEST_REQUEST_EXTENSIONS].valueBlock.value, element => new Extension({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @param {boolean} encodeFlag If param equal to false then create TBS schema via decoding stored value. In othe case create TBS schema via assembling from TBS parts.
   * @returns asn1js object
   */
  toSchema(encodeFlag = false) {
    //#region Decode stored TBS value
    let tbsSchema;

    if (encodeFlag === false) {
      if (this.tbs.byteLength === 0) // No stored TBS part
        return TBSRequest.schema();

      tbsSchema = asn1js.fromBER(this.tbs).result;
    }
    //#endregion
    //#region Create TBS schema via assembling from TBS parts
    else {
      const outputArray = [];

      if (this.version !== undefined) {
        outputArray.push(new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [new asn1js.Integer({ value: this.version })]
        }));
      }

      if (this.requestorName) {
        outputArray.push(new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          value: [this.requestorName.toSchema()]
        }));
      }

      outputArray.push(new asn1js.Sequence({
        value: Array.from(this.requestList, element => element.toSchema())
      }));

      if (this.requestExtensions) {
        outputArray.push(new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 2 // [2]
          },
          value: [
            new asn1js.Sequence({
              value: Array.from(this.requestExtensions, element => element.toSchema())
            })
          ]
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

    if (this.version != undefined)
      _object.version = this.version;

    if (this.requestorName) {
      _object.requestorName = this.requestorName.toJSON();
    }

    _object.requestList = Array.from(this.requestList, element => element.toJSON());

    if (this.requestExtensions) {
      _object.requestExtensions = Array.from(this.requestExtensions, element => element.toJSON());
    }

    return _object;
  }

}
