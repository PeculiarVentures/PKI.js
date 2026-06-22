import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { EMPTY_STRING } from "./constants";
import { AsnError } from "./errors";
import { PkiObject, PkiObjectParameters } from "./PkiObject";
import * as Schema from "./Schema";

const NONCE = "nonce";
const ICV_LEN = "icvLen";
const CLEAR_PROPS = [NONCE, ICV_LEN];

/**
 * Default ICV (authentication tag) length in bytes, per RFC 5084 §3.2.
 */
const DEFAULT_ICV_LEN = 12;

export interface IGCMParams {
  /**
   * GCM nonce (also called IV). NIST SP 800-38D §8.2.1 recommends 12 bytes.
   */
  nonce: ArrayBuffer;
  /**
   * Length of the GCM authentication tag (ICV) in bytes. RFC 5084 allows
   * 12 | 13 | 14 | 15 | 16; default is 12.
   */
  icvLen?: number;
}

export interface GCMParamsJson {
  nonce: string;
  icvLen?: number;
}

export type GCMParamsParameters = PkiObjectParameters & Partial<IGCMParams>;

/**
 * Represents the GCMParameters structure described in
 * [RFC5084 §3.2](https://www.rfc-editor.org/rfc/rfc5084#section-3.2). This is
 * the AlgorithmIdentifier parameter value required for AES-GCM OIDs
 * (`aes{128,192,256}-GCM` = `2.16.840.1.101.3.4.1.{6,26,46}`).
 */
export class GCMParams extends PkiObject implements IGCMParams {

  public static override CLASS_NAME = "GCMParams";

  public nonce!: ArrayBuffer;
  public icvLen?: number;

  /**
   * Initializes a new instance of the {@link GCMParams} class
   * @param parameters Initialization parameters
   */
  constructor(parameters: GCMParamsParameters = {}) {
    super();

    this.nonce = pvutils.getParametersValue(parameters, NONCE, GCMParams.defaultValues(NONCE));
    if (ICV_LEN in parameters) {
      this.icvLen = pvutils.getParametersValue(parameters, ICV_LEN, GCMParams.defaultValues(ICV_LEN));
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
  public static override defaultValues(memberName: typeof NONCE): ArrayBuffer;
  public static override defaultValues(memberName: typeof ICV_LEN): number;
  public static override defaultValues(memberName: string): any {
    switch (memberName) {
      case NONCE:
        return new ArrayBuffer(0);
      case ICV_LEN:
        return DEFAULT_ICV_LEN;
      default:
        return super.defaultValues(memberName);
    }
  }

  /**
   * @inheritdoc
   * @asn ASN.1 schema
   * ```asn
   * GCMParameters ::= SEQUENCE {
   *   aes-nonce        OCTET STRING,
   *   aes-ICVlen       AES-GCM-ICVlen DEFAULT 12 }
   *
   * AES-GCM-ICVlen ::= INTEGER (12 | 13 | 14 | 15 | 16)
   * ```
   */
  public static override schema(parameters: Schema.SchemaParameters<{
    nonce?: string;
    icvLen?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || EMPTY_STRING),
      value: [
        new asn1js.OctetString({ name: (names.nonce || EMPTY_STRING) }),
        new asn1js.Integer({
          name: (names.icvLen || EMPTY_STRING),
          optional: true
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
      GCMParams.schema({
        names: {
          nonce: NONCE,
          icvLen: ICV_LEN
        }
      })
    );
    AsnError.assertSchema(asn1, this.className);

    // Get internal properties from parsed schema
    this.nonce = asn1.result.nonce.valueBlock.valueHex;
    if (ICV_LEN in asn1.result) {
      this.icvLen = asn1.result.icvLen.valueBlock.valueDec;
    }
  }

  public toSchema(): asn1js.Sequence {
    //#region Create array for output sequence
    const outputArray: any[] = [];

    outputArray.push(new asn1js.OctetString({ valueHex: this.nonce }));

    // Per RFC 5084, emit aes-ICVlen only when it differs from the default (12).
    if (this.icvLen !== undefined && this.icvLen !== DEFAULT_ICV_LEN) {
      outputArray.push(new asn1js.Integer({ value: this.icvLen }));
    }
    //#endregion

    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: outputArray
    }));
    //#endregion
  }

  public toJSON(): GCMParamsJson {
    const res: GCMParamsJson = {
      nonce: pvutils.bufferToHexCodes(this.nonce)
    };

    if (this.icvLen !== undefined && this.icvLen !== DEFAULT_ICV_LEN) {
      res.icvLen = this.icvLen;
    }

    return res;
  }

}
