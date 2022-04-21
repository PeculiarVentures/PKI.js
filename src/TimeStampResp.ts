import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { PKIStatusInfo, PKIStatusInfoJson, PKIStatusInfoSchema } from "./PKIStatusInfo";
import { ContentInfo, ContentInfoJson, ContentInfoSchema } from "./ContentInfo";
import { SignedData } from "./SignedData";
import * as Schema from "./Schema";
import { id_ContentType_SignedData } from "./ObjectIdentifiers";
import { Certificate } from "./Certificate";
import { PkiObject, PkiObjectParameters } from "./PkiObject";
import { AsnError } from "./errors";

const STATUS = "status";
const TIME_STAMP_TOKEN = "timeStampToken";
const TIME_STAMP_RESP = "TimeStampResp";
const TIME_STAMP_RESP_STATUS = `${TIME_STAMP_RESP}.${STATUS}`;
const TIME_STAMP_RESP_TOKEN = `${TIME_STAMP_RESP}.${TIME_STAMP_TOKEN}`;
const CLEAR_PROPS = [
  TIME_STAMP_RESP_STATUS,
  TIME_STAMP_RESP_TOKEN
];

export interface ITimeStampResp {
  status: PKIStatusInfo;
  timeStampToken?: ContentInfo;
}

export interface TimeStampRespJson {
  status: PKIStatusInfoJson;
  timeStampToken?: ContentInfoJson;
}

export interface TimeStampRespVerifyParams {
  signer?: number;
  trustedCerts?: Certificate[];
  data?: ArrayBuffer;
}

export type TimeStampRespParameters = PkiObjectParameters & Partial<ITimeStampResp>;

/**
 * Represents the TimeStampResp structure described in [RFC3161](https://www.ietf.org/rfc/rfc3161.txt)
 */
export class TimeStampResp extends PkiObject implements ITimeStampResp {

  public static override CLASS_NAME = "TimeStampResp";

  public status!: PKIStatusInfo;
  public timeStampToken?: ContentInfo;

  /**
   * Initializes a new instance of the {@link TimeStampResp} class
   * @param parameters Initialization parameters
   */
  constructor(parameters: TimeStampRespParameters = {}) {
    super();

    this.status = pvutils.getParametersValue(parameters, STATUS, TimeStampResp.defaultValues(STATUS));
    if (TIME_STAMP_TOKEN in parameters) {
      this.timeStampToken = pvutils.getParametersValue(parameters, TIME_STAMP_TOKEN, TimeStampResp.defaultValues(TIME_STAMP_TOKEN));
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
  public static override defaultValues(memberName: typeof STATUS): PKIStatusInfo;
  public static override defaultValues(memberName: typeof TIME_STAMP_TOKEN): ContentInfo;
  public static override defaultValues(memberName: string): any {
    switch (memberName) {
      case STATUS:
        return new PKIStatusInfo();
      case TIME_STAMP_TOKEN:
        return new ContentInfo();
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
      case STATUS:
        return ((PKIStatusInfo.compareWithDefault(STATUS, memberValue.status)) &&
          (("statusStrings" in memberValue) === false) &&
          (("failInfo" in memberValue) === false));
      case TIME_STAMP_TOKEN:
        return ((memberValue.contentType === "") &&
          (memberValue.content instanceof asn1js.Any));
      default:
        return super.defaultValues(memberName);
    }
  }

  /**
   * @inheritdoc
   * @asn ASN.1 schema
   * ```asn
   * TimeStampResp ::= SEQUENCE  {
   *    status                  PKIStatusInfo,
   *    timeStampToken          TimeStampToken     OPTIONAL  }
   *```
   */
  public static override schema(parameters: Schema.SchemaParameters<{
    status?: PKIStatusInfoSchema,
    timeStampToken?: ContentInfoSchema,
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || TIME_STAMP_RESP),
      value: [
        PKIStatusInfo.schema(names.status || {
          names: {
            blockName: TIME_STAMP_RESP_STATUS
          }
        }),
        ContentInfo.schema(names.timeStampToken || {
          names: {
            blockName: TIME_STAMP_RESP_TOKEN,
            optional: true
          }
        })
      ]
    }));
  }

  public fromSchema(schema: Schema.SchemaType): void {
    // Clear input data first
    pvutils.clearProps(schema, CLEAR_PROPS);

    // Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      TimeStampResp.schema()
    );
    AsnError.assertSchema(asn1, this.className);

    // Get internal properties from parsed schema
    this.status = new PKIStatusInfo({ schema: asn1.result[TIME_STAMP_RESP_STATUS] });
    if (TIME_STAMP_RESP_TOKEN in asn1.result)
      this.timeStampToken = new ContentInfo({ schema: asn1.result[TIME_STAMP_RESP_TOKEN] });
  }

  public toSchema(): asn1js.Sequence {
    //#region Create array for output sequence
    const outputArray = [];

    outputArray.push(this.status.toSchema());
    if (this.timeStampToken) {
      outputArray.push(this.timeStampToken.toSchema());
    }
    //#endregion

    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: outputArray
    }));
    //#endregion
  }

  public toJSON(): TimeStampRespJson {
    const res: TimeStampRespJson = {
      status: this.status.toJSON()
    };

    if (this.timeStampToken) {
      res.timeStampToken = this.timeStampToken.toJSON();
    }

    return res;
  }

  /**
   * Sign current TSP Response
   * @param privateKey Private key for "subjectPublicKeyInfo" structure
   * @param hashAlgorithm Hashing algorithm. Default SHA-1
   */
  public async sign(privateKey: CryptoKey, hashAlgorithm?: string) {
    this.assertContentType();

    // Sign internal signed data value
    const signed = new SignedData({ schema: this.timeStampToken.content });

    return signed.sign(privateKey, 0, hashAlgorithm);
  }

  /**
   * Verify current TSP Response
   * @param verificationParameters Input parameters for verification
   */
  public async verify(verificationParameters: TimeStampRespVerifyParams = { signer: 0, trustedCerts: [], data: new ArrayBuffer(0) }): Promise<boolean> {
    this.assertContentType();

    // Verify internal signed data value
    const signed = new SignedData({ schema: this.timeStampToken.content });

    return signed.verify(verificationParameters);
  }

  private assertContentType(): asserts this is { timeStampToken: ContentInfo; } {
    if (!this.timeStampToken) {
      throw new Error("timeStampToken is absent in TSP response");
    }
    if (this.timeStampToken.contentType !== id_ContentType_SignedData) { // Must be a CMS signed data
      throw new Error(`Wrong format of timeStampToken: ${this.timeStampToken.contentType}`);
    }
  }
}

