import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { EMPTY_BUFFER, EMPTY_STRING } from "./constants";
import { AsnError } from "./errors";
import { PkiObject, PkiObjectParameters } from "./PkiObject";
import * as Schema from "./Schema";

const NONCE = "nonce";
const ICV_LEN = "icvLen";
const CLEAR_PROPS = [NONCE, ICV_LEN];

/**
 * ICV lengths in octets permitted by AES-GCM-ICVlen, per RFC 5084 Section 3.2.
 */
const ICV_LENS = [12, 13, 14, 15, 16];

/**
 * Checks aes-nonce and aes-ICVlen against the value constraints of RFC 5084 Section 3.2.
 * The ICV length reaches WebCrypto as a tag length, so an out-of-range value read off
 * an unauthenticated AlgorithmIdentifier would weaken the tag it is meant to describe.
 * @param nonce AES-GCM nonce
 * @param icvLen ICV length in octets, or `undefined` where the DEFAULT applies
 */
function assertConstraints(nonce: ArrayBuffer, icvLen?: number): void {
  if (nonce.byteLength === 0) {
    throw new AsnError("Invalid GCMParameters: aes-nonce must carry at least one octet");
  }

  if (icvLen !== undefined && !ICV_LENS.includes(icvLen)) {
    throw new AsnError(
      `Invalid GCMParameters: aes-ICVlen ${icvLen} is outside the permitted set ${ICV_LENS.join(", ")}`
    );
  }
}

export interface IGCMParams {
  /**
   * GCM nonce (also called IV). RFC 5084 recommends a size of 12 octets.
   */
  nonce: ArrayBuffer;
  /**
   * Length of the GCM authentication tag (ICV) in octets. RFC 5084 allows
   * 12 | 13 | 14 | 15 | 16; the DEFAULT is 12.
   */
  icvLen?: number;
}

export interface GCMParamsJson {
  nonce: string;
  icvLen?: number;
}

export type GCMParamsParameters = PkiObjectParameters & Partial<IGCMParams>;

/**
 * Represents the GCMParameters structure described in [RFC5084 Section 3.2](https://datatracker.ietf.org/doc/html/rfc5084#section-3.2)
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
      this.icvLen = pvutils.getParametersValue(
        parameters,
        ICV_LEN,
        GCMParams.defaultValues(ICV_LEN)
      );
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
        return EMPTY_BUFFER;
      case ICV_LEN:
        return 12;
      default:
        return super.defaultValues(memberName);
    }
  }

  /**
   * Reads the parameters of an AES-GCM AlgorithmIdentifier, accepting the bare OCTET
   * STRING that releases before RFC 5084 conformance emitted in place of a
   * GCMParameters SEQUENCE
   * @param algorithmParams Value of the AlgorithmIdentifier parameters field
   * @returns The nonce, and the tag length in bits where the parameters carry one
   */
  public static fromAlgorithmParams(algorithmParams: any): {
    nonce: ArrayBuffer;
    tagLength?: number;
  } {
    if (!algorithmParams) {
      throw new AsnError(
        "AES-GCM AlgorithmIdentifier is missing the required GCMParameters (RFC 5084 Section 3.2)"
      );
    }

    // A bare OCTET STRING is the pre-conformance shape and states no ICV length,
    // which leaves WebCrypto on its own 128-bit default.
    if (algorithmParams instanceof asn1js.OctetString) {
      return { nonce: algorithmParams.valueBlock.valueHex };
    }

    const params = new GCMParams({ schema: algorithmParams });

    return {
      nonce: params.nonce,
      tagLength: (params.icvLen ?? GCMParams.defaultValues(ICV_LEN)) * 8
    };
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
  public static override schema(
    parameters: Schema.SchemaParameters<{
      nonce?: string;
      icvLen?: string;
    }> = {}
  ): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(
      parameters,
      "names",
      {}
    );

    return new asn1js.Sequence({
      name: names.blockName || EMPTY_STRING,
      value: [
        new asn1js.OctetString({ name: names.nonce || EMPTY_STRING }),
        new asn1js.Integer({
          name: names.icvLen || EMPTY_STRING,
          optional: true
        })
      ]
    });
  }

  public fromSchema(schema: Schema.SchemaType): void {
    // Clear input data first
    pvutils.clearProps(schema, CLEAR_PROPS);

    // Check the schema is valid
    const asn1 = asn1js.compareSchema(
      schema,
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
    // An absent INTEGER means the DEFAULT applies, so clear any value this
    // instance carried before rather than re-emitting one the input never had.
    this.icvLen = ICV_LEN in asn1.result ? asn1.result.icvLen.valueBlock.valueDec : undefined;

    assertConstraints(this.nonce, this.icvLen);
  }

  public toSchema(): asn1js.Sequence {
    assertConstraints(this.nonce, this.icvLen);

    //#region Create array for output sequence
    const outputArray: any[] = [];

    outputArray.push(new asn1js.OctetString({ valueHex: this.nonce }));

    // Per RFC 5084, emit aes-ICVlen only when it differs from the default.
    if (this.icvLen !== undefined && this.icvLen !== GCMParams.defaultValues(ICV_LEN)) {
      outputArray.push(new asn1js.Integer({ value: this.icvLen }));
    }
    //#endregion

    //#region Construct and return new ASN.1 schema for this object
    return new asn1js.Sequence({
      value: outputArray
    });
    //#endregion
  }

  public toJSON(): GCMParamsJson {
    const res: GCMParamsJson = {
      nonce: pvutils.bufferToHexCodes(this.nonce)
    };

    if (this.icvLen !== undefined && this.icvLen !== GCMParams.defaultValues(ICV_LEN)) {
      res.icvLen = this.icvLen;
    }

    return res;
  }
}
