import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import PKIStatusInfo, { PKIStatusInfoSchema } from "./PKIStatusInfo";
import ContentInfo, { ContentInfoSchema } from "./ContentInfo";
import SignedData from "./SignedData";
import * as Schema from "./Schema";
import { id_ContentType_SignedData } from "./ObjectIdentifiers";

const STATUS = "status";
const TIME_STAMP_TOKEN = "timeStampToken";
const TIME_STAMP_RESP = "TimeStampResp";
const TIME_STAMP_RESP_STATUS = `${TIME_STAMP_RESP}.${STATUS}`;
const TIME_STAMP_RESP_TOKEN = `${TIME_STAMP_RESP}.${TIME_STAMP_TOKEN}`;
const CLEAR_PROPS = [
  TIME_STAMP_RESP_STATUS,
  TIME_STAMP_RESP_TOKEN
];

export interface TimeStampRespParameters extends Schema.SchemaConstructor {
  status?: PKIStatusInfo;
  timeStampToken?: ContentInfo;
}

/**
 * Class from RFC3161
 */
export default class TimeStampResp implements Schema.SchemaCompatible {

  public status: PKIStatusInfo;
  public timeStampToken?: ContentInfo;

  /**
   * Constructor for TimeStampResp class
   * @param parameters
   */
  constructor(parameters: TimeStampRespParameters = {}) {
    //#region Internal properties of the object
    this.status = pvutils.getParametersValue(parameters, STATUS, TimeStampResp.defaultValues(STATUS));
    if (parameters.timeStampToken) {
      this.timeStampToken = pvutils.getParametersValue(parameters, TIME_STAMP_TOKEN, TimeStampResp.defaultValues(TIME_STAMP_TOKEN));
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
  public static defaultValues(memberName: typeof STATUS): PKIStatusInfo;
  public static defaultValues(memberName: typeof TIME_STAMP_TOKEN): ContentInfo;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case STATUS:
        return new PKIStatusInfo();
      case TIME_STAMP_TOKEN:
        return new ContentInfo();
      default:
        throw new Error(`Invalid member name for TimeStampResp class: ${memberName}`);
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
        throw new Error(`Invalid member name for TimeStampResp class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * TimeStampResp ::= SEQUENCE  {
   *    status                  PKIStatusInfo,
   *    timeStampToken          TimeStampToken     OPTIONAL  }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
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
      TimeStampResp.schema()
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for TimeStampResp");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.status = new PKIStatusInfo({ schema: asn1.result[TIME_STAMP_RESP_STATUS] });
    if (TIME_STAMP_RESP_TOKEN in asn1.result)
      this.timeStampToken = new ContentInfo({ schema: asn1.result[TIME_STAMP_RESP_TOKEN] });
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): Schema.SchemaType {
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

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    const _object: any = {
      status: this.status
    };

    if (this.timeStampToken) {
      _object.timeStampToken = this.timeStampToken.toJSON();
    }

    return _object;
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
  verify(verificationParameters = { signer: 0, trustedCerts: [], data: new ArrayBuffer(0) }): Promise<boolean> {
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

