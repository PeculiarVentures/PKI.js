import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as common from "./common";
import { MessageImprint, HASHED_MESSAGE, HASH_ALGORITHM, MessageImprintSchema, MessageImprintJson } from "./MessageImprint";
import { Accuracy, AccuracyJson, AccuracySchema, MICROS, MILLIS, SECONDS } from "./Accuracy";
import { GeneralName, GeneralNameJson, GeneralNameSchema, TYPE, VALUE } from "./GeneralName";
import { Extension, ExtensionJson, ExtensionSchema } from "./Extension";
import * as Schema from "./Schema";
import { PkiObject, PkiObjectParameters } from "./PkiObject";
import { AsnError } from "./errors";

const VERSION = "version";
const POLICY = "policy";
const MESSAGE_IMPRINT = "messageImprint";
const SERIAL_NUMBER = "serialNumber";
const GEN_TIME = "genTime";
const ORDERING = "ordering";
const NONCE = "nonce";
const ACCURACY = "accuracy";
const TSA = "tsa";
const EXTENSIONS = "extensions";
const TST_INFO = "TSTInfo";
const TST_INFO_VERSION = `${TST_INFO}.${VERSION}`;
const TST_INFO_POLICY = `${TST_INFO}.${POLICY}`;
const TST_INFO_MESSAGE_IMPRINT = `${TST_INFO}.${MESSAGE_IMPRINT}`;
const TST_INFO_SERIAL_NUMBER = `${TST_INFO}.${SERIAL_NUMBER}`;
const TST_INFO_GEN_TIME = `${TST_INFO}.${GEN_TIME}`;
const TST_INFO_ACCURACY = `${TST_INFO}.${ACCURACY}`;
const TST_INFO_ORDERING = `${TST_INFO}.${ORDERING}`;
const TST_INFO_NONCE = `${TST_INFO}.${NONCE}`;
const TST_INFO_TSA = `${TST_INFO}.${TSA}`;
const TST_INFO_EXTENSIONS = `${TST_INFO}.${EXTENSIONS}`;
const CLEAR_PROPS = [
  TST_INFO_VERSION,
  TST_INFO_POLICY,
  TST_INFO_MESSAGE_IMPRINT,
  TST_INFO_SERIAL_NUMBER,
  TST_INFO_GEN_TIME,
  TST_INFO_ACCURACY,
  TST_INFO_ORDERING,
  TST_INFO_NONCE,
  TST_INFO_TSA,
  TST_INFO_EXTENSIONS
];

export interface ITSTInfo {
  version: number;
  policy: string;
  messageImprint: MessageImprint;
  serialNumber: asn1js.Integer;
  genTime: Date;
  accuracy?: Accuracy;
  ordering?: boolean;
  nonce?: asn1js.Integer;
  tsa?: GeneralName;
  extensions?: Extension[];
}

export interface TSTInfoJson {
  version: number;
  policy: string;
  messageImprint: MessageImprintJson;
  serialNumber: Schema.AsnIntegerJson;
  genTime: Date;
  accuracy?: AccuracyJson;
  ordering?: boolean;
  nonce?: Schema.AsnIntegerJson;
  tsa?: GeneralNameJson;
  extensions?: ExtensionJson[];
}

export type TSTInfoParameters = PkiObjectParameters & Partial<ITSTInfo>;

export interface TSTInfoVerifyParams {
  data: ArrayBuffer;
  notBefore?: Date;
  notAfter?: Date;
}

/**
 * Represents the TSTInfo structure described in [RFC3161](https://www.ietf.org/rfc/rfc3161.txt)
 */
export class TSTInfo extends PkiObject implements ITSTInfo {

  public static override CLASS_NAME = "TSTInfo";

  public version!: number;
  public policy!: string;
  public messageImprint!: MessageImprint;
  public serialNumber!: asn1js.Integer;
  public genTime!: Date;
  public accuracy?: Accuracy;
  public ordering?: boolean;
  public nonce?: asn1js.Integer;
  public tsa?: GeneralName;
  public extensions?: Extension[];

  /**
   * Initializes a new instance of the {@link TSTInfo} class
   * @param parameters Initialization parameters
   */
  constructor(parameters: TSTInfoParameters = {}) {
    super();

    this.version = pvutils.getParametersValue(parameters, VERSION, TSTInfo.defaultValues(VERSION));
    this.policy = pvutils.getParametersValue(parameters, POLICY, TSTInfo.defaultValues(POLICY));
    this.messageImprint = pvutils.getParametersValue(parameters, MESSAGE_IMPRINT, TSTInfo.defaultValues(MESSAGE_IMPRINT));
    this.serialNumber = pvutils.getParametersValue(parameters, SERIAL_NUMBER, TSTInfo.defaultValues(SERIAL_NUMBER));
    this.genTime = pvutils.getParametersValue(parameters, GEN_TIME, TSTInfo.defaultValues(GEN_TIME));

    if (ACCURACY in parameters) {
      this.accuracy = pvutils.getParametersValue(parameters, ACCURACY, TSTInfo.defaultValues(ACCURACY));
    }

    if (ORDERING in parameters) {
      this.ordering = pvutils.getParametersValue(parameters, ORDERING, TSTInfo.defaultValues(ORDERING));
    }

    if (NONCE in parameters) {
      this.nonce = pvutils.getParametersValue(parameters, NONCE, TSTInfo.defaultValues(NONCE));
    }

    if (TSA in parameters) {
      this.tsa = pvutils.getParametersValue(parameters, TSA, TSTInfo.defaultValues(TSA));
    }

    if (EXTENSIONS in parameters) {
      this.extensions = pvutils.getParametersValue(parameters, EXTENSIONS, TSTInfo.defaultValues(EXTENSIONS));
    }

    if (parameters.schema) {
      this.fromSchema(parameters.schema);
    }
  }

  /**
   * Returns default values for all class members
   * @param memberName String name for a class member
   * @returns Default value
   */
  public static override defaultValues(memberName: typeof VERSION): number;
  public static override defaultValues(memberName: typeof POLICY): string;
  public static override defaultValues(memberName: typeof MESSAGE_IMPRINT): MessageImprint;
  public static override defaultValues(memberName: typeof SERIAL_NUMBER): asn1js.Integer;
  public static override defaultValues(memberName: typeof GEN_TIME): Date;
  public static override defaultValues(memberName: typeof ACCURACY): Accuracy;
  public static override defaultValues(memberName: typeof ORDERING): boolean;
  public static override defaultValues(memberName: typeof NONCE): asn1js.Integer;
  public static override defaultValues(memberName: typeof TSA): GeneralName;
  public static override defaultValues(memberName: typeof EXTENSIONS): Extension[];
  public static override defaultValues(memberName: string): any {
    switch (memberName) {
      case VERSION:
        return 0;
      case POLICY:
        return "";
      case MESSAGE_IMPRINT:
        return new MessageImprint();
      case SERIAL_NUMBER:
        return new asn1js.Integer();
      case GEN_TIME:
        return new Date(0, 0, 0);
      case ACCURACY:
        return new Accuracy();
      case ORDERING:
        return false;
      case NONCE:
        return new asn1js.Integer();
      case TSA:
        return new GeneralName();
      case EXTENSIONS:
        return [];
      default:
        return super.defaultValues(memberName);
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
      case POLICY:
      case GEN_TIME:
      case ORDERING:
        return (memberValue === TSTInfo.defaultValues(ORDERING));
      case MESSAGE_IMPRINT:
        return ((MessageImprint.compareWithDefault(HASH_ALGORITHM, memberValue.hashAlgorithm)) &&
          (MessageImprint.compareWithDefault(HASHED_MESSAGE, memberValue.hashedMessage)));
      case SERIAL_NUMBER:
      case NONCE:
        return (memberValue.isEqual(TSTInfo.defaultValues(NONCE)));
      case ACCURACY:
        return ((Accuracy.compareWithDefault(SECONDS, memberValue.seconds)) &&
          (Accuracy.compareWithDefault(MILLIS, memberValue.millis)) &&
          (Accuracy.compareWithDefault(MICROS, memberValue.micros)));
      case TSA:
        return ((GeneralName.compareWithDefault(TYPE, memberValue.type)) &&
          (GeneralName.compareWithDefault(VALUE, memberValue.value)));
      case EXTENSIONS:
        return (memberValue.length === 0);
      default:
        return super.defaultValues(memberName);
    }
  }

  /**
   * Returns value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn
   * TSTInfo ::= SEQUENCE  {
   *   version                      INTEGER  { v1(1) },
   *   policy                       TSAPolicyId,
   *   messageImprint               MessageImprint,
   *   serialNumber                 INTEGER,
   *   genTime                      GeneralizedTime,
   *   accuracy                     Accuracy                 OPTIONAL,
   *   ordering                     BOOLEAN             DEFAULT FALSE,
   *   nonce                        INTEGER                  OPTIONAL,
   *   tsa                          [0] GeneralName          OPTIONAL,
   *   extensions                   [1] IMPLICIT Extensions  OPTIONAL  }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns ASN.1 schema object
   */
  public static override schema(parameters: Schema.SchemaParameters<{
    version?: string;
    policy?: string;
    messageImprint?: MessageImprintSchema;
    serialNumber?: string;
    genTime?: string;
    accuracy?: AccuracySchema;
    ordering?: string;
    nonce?: string;
    tsa?: GeneralNameSchema;
    extensions?: string;
    extension?: ExtensionSchema;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || TST_INFO),
      value: [
        new asn1js.Integer({ name: (names.version || TST_INFO_VERSION) }),
        new asn1js.ObjectIdentifier({ name: (names.policy || TST_INFO_POLICY) }),
        MessageImprint.schema(names.messageImprint || {
          names: {
            blockName: TST_INFO_MESSAGE_IMPRINT
          }
        }),
        new asn1js.Integer({ name: (names.serialNumber || TST_INFO_SERIAL_NUMBER) }),
        new asn1js.GeneralizedTime({ name: (names.genTime || TST_INFO_GEN_TIME) }),
        Accuracy.schema(names.accuracy || {
          names: {
            blockName: TST_INFO_ACCURACY
          }
        }),
        new asn1js.Boolean({
          name: (names.ordering || TST_INFO_ORDERING),
          optional: true
        }),
        new asn1js.Integer({
          name: (names.nonce || TST_INFO_NONCE),
          optional: true
        }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [GeneralName.schema(names.tsa || {
            names: {
              blockName: TST_INFO_TSA
            }
          })]
        }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1 // [1]
          },
          value: [
            new asn1js.Repeated({
              name: (names.extensions || TST_INFO_EXTENSIONS),
              value: Extension.schema(names.extension || {})
            })
          ]
        }) // IMPLICIT Extensions
      ]
    }));
  }

  public fromSchema(schema: Schema.SchemaType): void {
    // Clear input data first
    pvutils.clearProps(schema, CLEAR_PROPS);

    // Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      TSTInfo.schema()
    );
    AsnError.assertSchema(asn1, this.className);

    // Get internal properties from parsed schema
    this.version = asn1.result[TST_INFO_VERSION].valueBlock.valueDec;
    this.policy = asn1.result[TST_INFO_POLICY].valueBlock.toString();
    this.messageImprint = new MessageImprint({ schema: asn1.result[TST_INFO_MESSAGE_IMPRINT] });
    this.serialNumber = asn1.result[TST_INFO_SERIAL_NUMBER];
    this.genTime = asn1.result[TST_INFO_GEN_TIME].toDate();
    if (TST_INFO_ACCURACY in asn1.result)
      this.accuracy = new Accuracy({ schema: asn1.result[TST_INFO_ACCURACY] });
    if (TST_INFO_ORDERING in asn1.result)
      this.ordering = asn1.result[TST_INFO_ORDERING].valueBlock.value;
    if (TST_INFO_NONCE in asn1.result)
      this.nonce = asn1.result[TST_INFO_NONCE];
    if (TST_INFO_TSA in asn1.result)
      this.tsa = new GeneralName({ schema: asn1.result[TST_INFO_TSA] });
    if (TST_INFO_EXTENSIONS in asn1.result)
      this.extensions = Array.from(asn1.result[TST_INFO_EXTENSIONS], element => new Extension({ schema: element }));
  }

  public toSchema(): asn1js.Sequence {
    //#region Create array for output sequence
    const outputArray = [];

    outputArray.push(new asn1js.Integer({ value: this.version }));
    outputArray.push(new asn1js.ObjectIdentifier({ value: this.policy }));
    outputArray.push(this.messageImprint.toSchema());
    outputArray.push(this.serialNumber);
    outputArray.push(new asn1js.GeneralizedTime({ valueDate: this.genTime }));
    if (this.accuracy)
      outputArray.push(this.accuracy.toSchema());
    if (this.ordering !== undefined)
      outputArray.push(new asn1js.Boolean({ value: this.ordering }));
    if (this.nonce)
      outputArray.push(this.nonce);
    if (this.tsa) {
      outputArray.push(new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: [this.tsa.toSchema()]
      }));
    }

    //#region Create array of extensions
    if (this.extensions) {
      outputArray.push(new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 1 // [1]
        },
        value: Array.from(this.extensions, o => o.toSchema())
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

  public toJSON(): TSTInfoJson {
    const res: TSTInfoJson = {
      version: this.version,
      policy: this.policy,
      messageImprint: this.messageImprint.toJSON(),
      serialNumber: this.serialNumber.toJSON() as Schema.AsnIntegerJson,
      genTime: this.genTime
    };

    if (this.accuracy)
      res.accuracy = this.accuracy.toJSON();

    if (this.ordering !== undefined)
      res.ordering = this.ordering;

    if (this.nonce)
      res.nonce = this.nonce.toJSON() as Schema.AsnIntegerJson;

    if (this.tsa)
      res.tsa = this.tsa.toJSON();

    if (this.extensions)
      res.extensions = Array.from(this.extensions, o => o.toJSON());

    return res;
  }

  /**
   * Verify current TST Info value
   * @param params Input parameters
   */
  public async verify(params: TSTInfoVerifyParams): Promise<boolean> {

    //#region Get initial parameters
    if (!params.data) {
      throw new Error("\"data\" is a mandatory attribute for TST_INFO verification");
    }
    const data = params.data;
    //#endregion

    //#region Check date
    if (params.notBefore) {
      if (this.genTime < params.notBefore)
        throw new Error("Generation time for TSTInfo object is less than notBefore value");
    }

    if (params.notAfter) {
      if (this.genTime > params.notAfter)
        throw new Error("Generation time for TSTInfo object is more than notAfter value");
    }
    //#endregion

    // Find hashing algorithm
    const shaAlgorithm = common.getAlgorithmByOID(this.messageImprint.hashAlgorithm.algorithmId, true, "MessageImprint.hashAlgorithm");

    // Calculate message digest for input "data" buffer
    const hash = await common.getCrypto(true).digest(shaAlgorithm.name, new Uint8Array(data));
    return pvutils.isEqualBuffer(hash, this.messageImprint.hashedMessage.valueBlock.valueHex);
  }

}

