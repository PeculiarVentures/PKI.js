import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as common from "./common";
import { TBSRequest, TBSRequestSchema } from "./TBSRequest";
import { Signature, SignatureSchema } from "./Signature";
import { Request } from "./Request";
import { CertID, CertIDCreateParams } from "./CertID";
import * as Schema from "./Schema";
import { Certificate } from "./Certificate";

const TBS_REQUEST = "tbsRequest";
const OPTIONAL_SIGNATURE = "optionalSignature";
const CLEAR_PROPS = [
  TBS_REQUEST,
  OPTIONAL_SIGNATURE
];

export interface OCSPRequestParameters extends Schema.SchemaConstructor {
  tbsRequest?: TBSRequest;
  optionalSignature?: Signature;
}

/**
 * Class from RFC6960
 */
export class OCSPRequest {

  public tbsRequest: TBSRequest;
  public optionalSignature?: Signature;

  /**
   * Constructor for OCSPRequest class
   * @param parameters
   */
  constructor(parameters: OCSPRequestParameters = {}) {
    //#region Internal properties of the object
    this.tbsRequest = pvutils.getParametersValue(parameters, TBS_REQUEST, OCSPRequest.defaultValues(TBS_REQUEST));
    if (parameters.optionalSignature) {
      this.optionalSignature = pvutils.getParametersValue(parameters, OPTIONAL_SIGNATURE, OCSPRequest.defaultValues(OPTIONAL_SIGNATURE));
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
  public static defaultValues(memberName: typeof TBS_REQUEST): TBSRequest;
  public static defaultValues(memberName: typeof OPTIONAL_SIGNATURE): Signature;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case TBS_REQUEST:
        return new TBSRequest();
      case OPTIONAL_SIGNATURE:
        return new Signature();
      default:
        throw new Error(`Invalid member name for OCSPRequest class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case TBS_REQUEST:
        // noinspection OverlyComplexBooleanExpressionJS
        return ((TBSRequest.compareWithDefault("tbs", memberValue.tbs)) &&
          (TBSRequest.compareWithDefault("version", memberValue.version)) &&
          (TBSRequest.compareWithDefault("requestorName", memberValue.requestorName)) &&
          (TBSRequest.compareWithDefault("requestList", memberValue.requestList)) &&
          (TBSRequest.compareWithDefault("requestExtensions", memberValue.requestExtensions)));
      case OPTIONAL_SIGNATURE:
        return ((Signature.compareWithDefault("signatureAlgorithm", memberValue.signatureAlgorithm)) &&
          (Signature.compareWithDefault("signature", memberValue.signature)) &&
          (Signature.compareWithDefault("certs", memberValue.certs)));
      default:
        throw new Error(`Invalid member name for OCSPRequest class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * OCSPRequest     ::=     SEQUENCE {
   *    tbsRequest                  TBSRequest,
   *    optionalSignature   [0]     EXPLICIT Signature OPTIONAL }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    tbsRequest?: TBSRequestSchema;
    optionalSignature?: SignatureSchema;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: names.blockName || "OCSPRequest",
      value: [
        TBSRequest.schema(names.tbsRequest || {
          names: {
            blockName: TBS_REQUEST
          }
        }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [
            Signature.schema(names.optionalSignature || {
              names: {
                blockName: OPTIONAL_SIGNATURE
              }
            })
          ]
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
      OCSPRequest.schema()
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for OCSPRequest");
    //#endregion

    //#region Get internal properties from parsed schema
    this.tbsRequest = new TBSRequest({ schema: asn1.result.tbsRequest });
    if (OPTIONAL_SIGNATURE in asn1.result)
      this.optionalSignature = new Signature({ schema: asn1.result.optionalSignature });
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @param {boolean} encodeFlag If param equal to false then create TBS schema via decoding stored value. In othe case create TBS schema via assembling from TBS parts.
   * @returns asn1js object
   */
  toSchema(encodeFlag = false) {
    //#region Create array for output sequence
    const outputArray = [];

    outputArray.push(this.tbsRequest.toSchema(encodeFlag));
    if (this.optionalSignature)
      outputArray.push(
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [
            this.optionalSignature.toSchema()
          ]
        }));
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
      tbsRequest: this.tbsRequest.toJSON()
    };

    if (this.optionalSignature) {
      _object.optionalSignature = this.optionalSignature.toJSON();
    }

    return _object;
  }

  /**
   * Making OCSP Request for specific certificate
   * @param certificate Certificate making OCSP Request for
   * @param parameters Additional parameters
   */
  public async createForCertificate(certificate: Certificate, parameters: CertIDCreateParams): Promise<void> {
    //#region Initial variables
    const certID = new CertID();
    //#endregion

    //#region Create OCSP certificate identifier for the certificate
    await certID.createForCertificate(certificate, parameters);
    //#endregion

    //#region Make final request data
    this.tbsRequest = new TBSRequest({
      requestList: [
        new Request({
          reqCert: certID
        })
      ]
    });
    //#endregion
  }

  /**
   * Make signature for current OCSP Request
   * @param privateKey Private key for "subjectPublicKeyInfo" structure
   * @param hashAlgorithm Hashing algorithm. Default SHA-1
   */
  public async sign(privateKey: CryptoKey, hashAlgorithm = "SHA-1") {
    //#region Initial checking
    //#region Check private key
    if (!privateKey) {
      throw new Error("Need to provide a private key for signing");
    }
    //#endregion

    //#region Check that OPTIONAL_SIGNATURE exists in the current request
    if (!this.optionalSignature) {
      throw new Error("Need to create \"optionalSignature\" field before signing");
    }
    //#endregion
    //#endregion

    //#region Initial variables
    const crypto = common.getCrypto(true);
    //#endregion

    //#region Get a "default parameters" for current algorithm and set correct signature algorithm
    const signatureParams = await crypto.getSignatureParameters(privateKey, hashAlgorithm);
    const parameters = signatureParams.parameters;
    this.optionalSignature.signatureAlgorithm = signatureParams.signatureAlgorithm;
    //#endregion

    //#region Create TBS data for signing
    const tbs = this.tbsRequest.toSchema(true).toBER(false);
    //#endregion

    // Signing TBS data on provided private key
    const signature = await crypto.signWithPrivateKey(tbs, privateKey, parameters as any);
    this.optionalSignature.signature = new asn1js.BitString({ valueHex: signature });
  }

  verify() {
    // TODO: Create the function
  }

}
