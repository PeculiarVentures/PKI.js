import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import ResponseBytes, { ResponseBytesSchema } from "./ResponseBytes";
import BasicOCSPResponse from "./BasicOCSPResponse";
import * as Schema from "./Schema";
import Certificate from "./Certificate";
import { id_PKIX_OCSP_Basic } from "./ObjectIdentifiers";

const RESPONSE_STATUS = "responseStatus";
const RESPONSE_BYTES = "responseBytes";

export interface OCSPResponseParameters extends Schema.SchemaConstructor {
  responseStatus?: asn1js.Enumerated;
  responseBytes?: ResponseBytes;
}

/**
 * Class from RFC6960
 */
export default class OCSPResponse implements Schema.SchemaCompatible {

  public responseStatus: asn1js.Enumerated;
  public responseBytes?: ResponseBytes;

  /**
   * Constructor for OCSPResponse class
   * @param parameters
   */
  constructor(parameters: OCSPResponseParameters = {}) {
    //#region Internal properties of the object
    this.responseStatus = getParametersValue(parameters, RESPONSE_STATUS, OCSPResponse.defaultValues(RESPONSE_STATUS));

    if (parameters.responseBytes) {
      this.responseBytes = getParametersValue(parameters, RESPONSE_BYTES, OCSPResponse.defaultValues(RESPONSE_BYTES));
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
  public static defaultValues(memberName: typeof RESPONSE_STATUS): asn1js.Enumerated;
  public static defaultValues(memberName: typeof RESPONSE_BYTES): ResponseBytes;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case RESPONSE_STATUS:
        return new asn1js.Enumerated();
      case RESPONSE_BYTES:
        return new ResponseBytes();
      default:
        throw new Error(`Invalid member name for OCSPResponse class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case RESPONSE_STATUS:
        return (memberValue.isEqual(OCSPResponse.defaultValues(memberName)));
      case RESPONSE_BYTES:
        return ((ResponseBytes.compareWithDefault("responseType", memberValue.responseType)) &&
          (ResponseBytes.compareWithDefault("response", memberValue.response)));
      default:
        throw new Error(`Invalid member name for OCSPResponse class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * OCSPResponse ::= SEQUENCE {
   *    responseStatus         OCSPResponseStatus,
   *    responseBytes          [0] EXPLICIT ResponseBytes OPTIONAL }
   *
   * OCSPResponseStatus ::= ENUMERATED {
   *    successful            (0),  -- Response has valid confirmations
   *    malformedRequest      (1),  -- Illegal confirmation request
   *    internalError         (2),  -- Internal error in issuer
   *    tryLater              (3),  -- Try again later
   *    -- (4) is not used
   *    sigRequired           (5),  -- Must sign the request
   *    unauthorized          (6)   -- Request unauthorized
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    responseStatus?: string;
    responseBytes?: ResponseBytesSchema;
  }> = {}): Schema.SchemaType {
    const names = getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || "OCSPResponse"),
      value: [
        new asn1js.Enumerated({ name: (names.responseStatus || RESPONSE_STATUS) }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [
            ResponseBytes.schema(names.responseBytes || {
              names: {
                blockName: RESPONSE_BYTES
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
    clearProps(schema, [
      RESPONSE_STATUS,
      RESPONSE_BYTES
    ]);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      OCSPResponse.schema()
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for OCSPResponse");
    //#endregion

    //#region Get internal properties from parsed schema
    this.responseStatus = asn1.result.responseStatus;
    if (RESPONSE_BYTES in asn1.result)
      this.responseBytes = new ResponseBytes({ schema: asn1.result.responseBytes });
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): Schema.SchemaType {
    //#region Create array for output sequence
    const outputArray = [];

    outputArray.push(this.responseStatus);
    if (this.responseBytes) {
      outputArray.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: [this.responseBytes.toSchema()]
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
      responseStatus: this.responseStatus.toJSON()
    };

    if (this.responseBytes) {
      _object.responseBytes = this.responseBytes.toJSON();
    }

    return _object;
  }

  /**
   * Get OCSP response status for specific certificate
   * @param certificate
   * @param issuerCertificate
   */
  public async getCertificateStatus(certificate: Certificate, issuerCertificate: Certificate) {
    //#region Initial variables
    let basicResponse;

    const result = {
      isForCertificate: false,
      status: 2 // 0 = good, 1 = revoked, 2 = unknown
    };
    //#endregion

    //#region Check that RESPONSE_BYTES contain "OCSP_BASIC_RESPONSE"
    if (!this.responseBytes)
      return result;

    if (this.responseBytes.responseType !== id_PKIX_OCSP_Basic) // id-pkix-ocsp-basic
      return result;

    try {
      const asn1Basic = asn1js.fromBER(this.responseBytes.response.valueBlock.valueHex);
      basicResponse = new BasicOCSPResponse({ schema: asn1Basic.result });
    }
    catch (ex) {
      return result;
    }
    //#endregion

    return basicResponse.getCertificateStatus(certificate, issuerCertificate);
  }

  /**
   * Make a signature for current OCSP Response
   * @param privateKey Private key for "subjectPublicKeyInfo" structure
   * @param hashAlgorithm Hashing algorithm. Default SHA-1
   */
  public async sign(privateKey: CryptoKey, hashAlgorithm?: string) {
    //#region Check that ResponseData has type BasicOCSPResponse and sign it
    if (this.responseBytes && this.responseBytes.responseType === id_PKIX_OCSP_Basic) {
      const asn1 = asn1js.fromBER(this.responseBytes.response.valueBlock.valueHex);
      const basicResponse = new BasicOCSPResponse({ schema: asn1.result });

      return basicResponse.sign(privateKey, hashAlgorithm);
    }

    throw new Error(`Unknown ResponseBytes type: ${this.responseBytes?.responseType || "Unknown"}`);
    //#endregion
  }

  /**
   * Verify current OCSP Response
   * @param issuerCertificate In order to decrease size of resp issuer cert could be omitted. In such case you need manually provide it.
   */
  public async verify(issuerCertificate: Certificate | null = null): Promise<boolean> {
    //#region Check that ResponseBytes exists in the object
    if ((RESPONSE_BYTES in this) === false)
      throw new Error("Empty ResponseBytes field");
    //#endregion

    //#region Check that ResponceData has type BasicOCSPResponse and verify it
    if (this.responseBytes && this.responseBytes.responseType === id_PKIX_OCSP_Basic) {
      const asn1 = asn1js.fromBER(this.responseBytes.response.valueBlock.valueHex);
      const basicResponse = new BasicOCSPResponse({ schema: asn1.result });

      if (issuerCertificate !== null) {
        if (!basicResponse.certs) {
          basicResponse.certs = [];
        }

        basicResponse.certs.push(issuerCertificate);
      }

      return basicResponse.verify();
    }

    throw new Error(`Unknown ResponseBytes type: ${this.responseBytes?.responseType || "Unknown"}`);
    //#endregion
  }

}

