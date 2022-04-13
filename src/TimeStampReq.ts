import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { MessageImprint, MessageImprintSchema } from "./MessageImprint";
import { Extension } from "./Extension";
import * as Schema from "./Schema";

const VERSION = "version";
const MESSAGE_IMPRINT = "messageImprint";
const REQ_POLICY = "reqPolicy";
const NONCE = "nonce";
const CERT_REQ = "certReq";
const EXTENSIONS = "extensions";
const TIME_STAMP_REQ = "TimeStampReq";
const TIME_STAMP_REQ_VERSION = `${TIME_STAMP_REQ}.${VERSION}`;
const TIME_STAMP_REQ_MESSAGE_IMPRINT = `${TIME_STAMP_REQ}.${MESSAGE_IMPRINT}`;
const TIME_STAMP_REQ_POLICY = `${TIME_STAMP_REQ}.${REQ_POLICY}`;
const TIME_STAMP_REQ_NONCE = `${TIME_STAMP_REQ}.${NONCE}`;
const TIME_STAMP_REQ_CERT_REQ = `${TIME_STAMP_REQ}.${CERT_REQ}`;
const TIME_STAMP_REQ_EXTENSIONS = `${TIME_STAMP_REQ}.${EXTENSIONS}`;
const CLEAR_PROPS = [
  TIME_STAMP_REQ_VERSION,
  TIME_STAMP_REQ_MESSAGE_IMPRINT,
  TIME_STAMP_REQ_POLICY,
  TIME_STAMP_REQ_NONCE,
  TIME_STAMP_REQ_CERT_REQ,
  TIME_STAMP_REQ_EXTENSIONS,
];

export interface TimeStampReqParameters extends Schema.SchemaConstructor {
  version?: number;
  messageImprint?: MessageImprint;
  reqPolicy?: string;
  nonce?: asn1js.Integer;
  certReq?: boolean;
  extensions?: Extension[];
}

/**
 * Class from RFC3161
 */
export class TimeStampReq implements Schema.SchemaCompatible {

  public version: number;
  public messageImprint: MessageImprint;
  public reqPolicy?: string;
  public nonce?: asn1js.Integer;
  public certReq?: boolean;
  public extensions?: Extension[];

  /**
   * Constructor for TimeStampReq class
   * @param parameters
   */
  constructor(parameters: TimeStampReqParameters = {}) {
    //#region Internal properties of the object
    this.version = pvutils.getParametersValue(parameters, VERSION, TimeStampReq.defaultValues(VERSION));
    this.messageImprint = pvutils.getParametersValue(parameters, MESSAGE_IMPRINT, TimeStampReq.defaultValues(MESSAGE_IMPRINT));
    if (parameters.reqPolicy !== undefined) {
      this.reqPolicy = pvutils.getParametersValue(parameters, REQ_POLICY, TimeStampReq.defaultValues(REQ_POLICY));
    }
    if (parameters.nonce) {
      this.nonce = pvutils.getParametersValue(parameters, NONCE, TimeStampReq.defaultValues(NONCE));
    }
    if (parameters.certReq !== undefined) {
      this.certReq = pvutils.getParametersValue(parameters, CERT_REQ, TimeStampReq.defaultValues(CERT_REQ));
    }
    if (parameters.extensions) {
      this.extensions = pvutils.getParametersValue(parameters, EXTENSIONS, TimeStampReq.defaultValues(EXTENSIONS));
    }
    //#endregion

    //#region If input argument array contains "schema" for this object
    if (parameters.schema)
      this.fromSchema(parameters.schema);
    //#endregion
  }

  /**
   * Return default values for all class members
   * @param memberName String name for a class member
   */
  public static defaultValues(memberName: typeof VERSION): number;
  public static defaultValues(memberName: typeof MESSAGE_IMPRINT): MessageImprint;
  public static defaultValues(memberName: typeof REQ_POLICY): string;
  public static defaultValues(memberName: typeof NONCE): asn1js.Integer;
  public static defaultValues(memberName: typeof CERT_REQ): boolean;
  public static defaultValues(memberName: typeof EXTENSIONS): Extension[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case VERSION:
        return 0;
      case MESSAGE_IMPRINT:
        return new MessageImprint();
      case REQ_POLICY:
        return "";
      case NONCE:
        return new asn1js.Integer();
      case CERT_REQ:
        return false;
      case EXTENSIONS:
        return [];
      default:
        throw new Error(`Invalid member name for TimeStampReq class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case VERSION:
      case REQ_POLICY:
      case CERT_REQ:
        return (memberValue === TimeStampReq.defaultValues(memberName as typeof CERT_REQ));
      case MESSAGE_IMPRINT:
        return ((MessageImprint.compareWithDefault("hashAlgorithm", memberValue.hashAlgorithm)) &&
          (MessageImprint.compareWithDefault("hashedMessage", memberValue.hashedMessage)));
      case NONCE:
        return (memberValue.isEqual(TimeStampReq.defaultValues(memberName)));
      case EXTENSIONS:
        return (memberValue.length === 0);
      default:
        throw new Error(`Invalid member name for TimeStampReq class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * TimeStampReq ::= SEQUENCE  {
   *    version               INTEGER  { v1(1) },
   *    messageImprint        MessageImprint,
   *    reqPolicy             TSAPolicyId              OPTIONAL,
   *    nonce                 INTEGER                  OPTIONAL,
   *    certReq               BOOLEAN                  DEFAULT FALSE,
   *    extensions            [0] IMPLICIT Extensions  OPTIONAL  }
   *
   * TSAPolicyId ::= OBJECT IDENTIFIER
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    version?: string;
    messageImprint?: MessageImprintSchema;
    reqPolicy?: string;
    nonce?: string;
    certReq?: string;
    extensions?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || TIME_STAMP_REQ),
      value: [
        new asn1js.Integer({ name: (names.version || TIME_STAMP_REQ_VERSION) }),
        MessageImprint.schema(names.messageImprint || {
          names: {
            blockName: TIME_STAMP_REQ_MESSAGE_IMPRINT
          }
        }),
        new asn1js.ObjectIdentifier({
          name: (names.reqPolicy || TIME_STAMP_REQ_POLICY),
          optional: true
        }),
        new asn1js.Integer({
          name: (names.nonce || TIME_STAMP_REQ_NONCE),
          optional: true
        }),
        new asn1js.Boolean({
          name: (names.certReq || TIME_STAMP_REQ_CERT_REQ),
          optional: true
        }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [new asn1js.Repeated({
            name: (names.extensions || TIME_STAMP_REQ_EXTENSIONS),
            value: Extension.schema()
          })]
        }) // IMPLICIT SEQUENCE value
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
      TimeStampReq.schema()
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for TimeStampReq");
    //#endregion

    //#region Get internal properties from parsed schema
    this.version = asn1.result[TIME_STAMP_REQ_VERSION].valueBlock.valueDec;
    this.messageImprint = new MessageImprint({ schema: asn1.result[TIME_STAMP_REQ_MESSAGE_IMPRINT] });
    if (TIME_STAMP_REQ_POLICY in asn1.result)
      this.reqPolicy = asn1.result[TIME_STAMP_REQ_POLICY].valueBlock.toString();
    if (TIME_STAMP_REQ_NONCE in asn1.result)
      this.nonce = asn1.result[TIME_STAMP_REQ_NONCE];
    if (TIME_STAMP_REQ_CERT_REQ in asn1.result)
      this.certReq = asn1.result[TIME_STAMP_REQ_CERT_REQ].valueBlock.value;
    if (TIME_STAMP_REQ_EXTENSIONS in asn1.result)
      this.extensions = Array.from(asn1.result[TIME_STAMP_REQ_EXTENSIONS], element => new Extension({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Create array for output sequence
    const outputArray = [];

    outputArray.push(new asn1js.Integer({ value: this.version }));
    outputArray.push(this.messageImprint.toSchema());
    if (REQ_POLICY in this)
      outputArray.push(new asn1js.ObjectIdentifier({ value: this.reqPolicy }));
    if (NONCE in this)
      outputArray.push(this.nonce);
    if ((CERT_REQ in this) && (TimeStampReq.compareWithDefault(CERT_REQ, this.certReq) === false))
      outputArray.push(new asn1js.Boolean({ value: this.certReq }));

    //#region Create array of extensions
    if (this.extensions) {
      outputArray.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: Array.from(this.extensions, element => element.toSchema())
      }));
    }
    //#endregion
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
      version: this.version,
      messageImprint: this.messageImprint.toJSON()
    };

    if (this.reqPolicy !== undefined)
      _object.reqPolicy = this.reqPolicy;

    if (this.nonce !== undefined)
      _object.nonce = this.nonce.toJSON();

    if ((this.certReq !== undefined) && (TimeStampReq.compareWithDefault(CERT_REQ, this.certReq) === false))
      _object.certReq = this.certReq;

    if (this.extensions) {
      _object.extensions = Array.from(this.extensions, element => element.toJSON());
    }

    return _object;
  }

}
