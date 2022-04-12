import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as common from "./common";
import ResponseData, { ResponseDataSchema } from "./ResponseData";
import AlgorithmIdentifier, { AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import Certificate, { CertificateSchema, checkCA } from "./Certificate";
import CertID from "./CertID";
import RelativeDistinguishedNames from "./RelativeDistinguishedNames";
import CertificateChainValidationEngine from "./CertificateChainValidationEngine";
import * as Schema from "./Schema";
import { ParameterError } from "./errors";

const TBS_RESPONSE_DATA = "tbsResponseData";
const SIGNATURE_ALGORITHM = "signatureAlgorithm";
const SIGNATURE = "signature";
const CERTS = "certs";
const BASIC_OCSP_RESPONSE = "BasicOCSPResponse";
const BASIC_OCSP_RESPONSE_TBS_RESPONSE_DATA = `${BASIC_OCSP_RESPONSE}.${TBS_RESPONSE_DATA}`;
const BASIC_OCSP_RESPONSE_SIGNATURE_ALGORITHM = `${BASIC_OCSP_RESPONSE}.${SIGNATURE_ALGORITHM}`;
const BASIC_OCSP_RESPONSE_SIGNATURE = `${BASIC_OCSP_RESPONSE}.${SIGNATURE}`;
const BASIC_OCSP_RESPONSE_CERTS = `${BASIC_OCSP_RESPONSE}.${CERTS}`;
const CLEAR_PROPS = [
  BASIC_OCSP_RESPONSE_TBS_RESPONSE_DATA,
  BASIC_OCSP_RESPONSE_SIGNATURE_ALGORITHM,
  BASIC_OCSP_RESPONSE_SIGNATURE,
  BASIC_OCSP_RESPONSE_CERTS
];

export interface CertificateStatus {
  isForCertificate: boolean;
  /**
   * 0 = good, 1 = revoked, 2 = unknown
   */
  status: number;
}

export interface BasicOCSPResponseParameters extends Schema.SchemaConstructor {
  tbsResponseData?: ResponseData;
  signatureAlgorithm?: AlgorithmIdentifier;
  signature?: asn1js.BitString;
  certs?: Certificate[];
}

interface BasicOCSPResponseVerifyParams {
  trustedCerts?: Certificate[];
}

/**
 * Class from RFC6960
 */
export default class BasicOCSPResponse implements Schema.SchemaCompatible {

  public tbsResponseData: ResponseData;
  public signatureAlgorithm: AlgorithmIdentifier;
  public signature: asn1js.BitString;
  public certs?: Certificate[];

  /**
   * Constructor for BasicOCSPResponse class
   * @param parameters
   */
  constructor(parameters: BasicOCSPResponseParameters = {}) {
    //#region Internal properties of the object
    this.tbsResponseData = pvutils.getParametersValue(parameters, TBS_RESPONSE_DATA, BasicOCSPResponse.defaultValues(TBS_RESPONSE_DATA));
    this.signatureAlgorithm = pvutils.getParametersValue(parameters, SIGNATURE_ALGORITHM, BasicOCSPResponse.defaultValues(SIGNATURE_ALGORITHM));
    this.signature = pvutils.getParametersValue(parameters, SIGNATURE, BasicOCSPResponse.defaultValues(SIGNATURE));
    if (parameters.certs) {
      this.certs = pvutils.getParametersValue(parameters, CERTS, BasicOCSPResponse.defaultValues(CERTS));
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
  public static defaultValues(memberName: typeof TBS_RESPONSE_DATA): ResponseData;
  public static defaultValues(memberName: typeof SIGNATURE_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof SIGNATURE): asn1js.BitString;
  public static defaultValues(memberName: typeof CERTS): Certificate[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case TBS_RESPONSE_DATA:
        return new ResponseData();
      case SIGNATURE_ALGORITHM:
        return new AlgorithmIdentifier();
      case SIGNATURE:
        return new asn1js.BitString();
      case CERTS:
        return [];
      default:
        throw new Error(`Invalid member name for BasicOCSPResponse class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case "type":
        {
          let comparisonResult = ((ResponseData.compareWithDefault("tbs", memberValue.tbs)) &&
            (ResponseData.compareWithDefault("responderID", memberValue.responderID)) &&
            (ResponseData.compareWithDefault("producedAt", memberValue.producedAt)) &&
            (ResponseData.compareWithDefault("responses", memberValue.responses)));

          if ("responseExtensions" in memberValue)
            comparisonResult = comparisonResult && (ResponseData.compareWithDefault("responseExtensions", memberValue.responseExtensions));

          return comparisonResult;
        }
      case SIGNATURE_ALGORITHM:
        return ((memberValue.algorithmId === "") && (("algorithmParams" in memberValue) === false));
      case SIGNATURE:
        return (memberValue.isEqual(BasicOCSPResponse.defaultValues(memberName)));
      case CERTS:
        return (memberValue.length === 0);
      default:
        throw new Error(`Invalid member name for BasicOCSPResponse class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * BasicOCSPResponse       ::= SEQUENCE {
   *    tbsResponseData      ResponseData,
   *    signatureAlgorithm   AlgorithmIdentifier,
   *    signature            BIT STRING,
   *    certs            [0] EXPLICIT SEQUENCE OF Certificate OPTIONAL }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    tbsResponseData?: ResponseDataSchema;
    signatureAlgorithm?: AlgorithmIdentifierSchema;
    signature?: string;
    certs?: CertificateSchema;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || BASIC_OCSP_RESPONSE),
      value: [
        ResponseData.schema(names.tbsResponseData || {
          names: {
            blockName: BASIC_OCSP_RESPONSE_TBS_RESPONSE_DATA
          }
        }),
        AlgorithmIdentifier.schema(names.signatureAlgorithm || {
          names: {
            blockName: BASIC_OCSP_RESPONSE_SIGNATURE_ALGORITHM
          }
        }),
        new asn1js.BitString({ name: (names.signature || BASIC_OCSP_RESPONSE_SIGNATURE) }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [
            new asn1js.Sequence({
              value: [new asn1js.Repeated({
                name: BASIC_OCSP_RESPONSE_CERTS,
                value: Certificate.schema(names.certs || {})
              })]
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
      BasicOCSPResponse.schema()
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for BasicOCSPResponse");
    //#endregion

    //#region Get internal properties from parsed schema
    this.tbsResponseData = new ResponseData({ schema: asn1.result[BASIC_OCSP_RESPONSE_TBS_RESPONSE_DATA] });
    this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result[BASIC_OCSP_RESPONSE_SIGNATURE_ALGORITHM] });
    this.signature = asn1.result[BASIC_OCSP_RESPONSE_SIGNATURE];

    if (BASIC_OCSP_RESPONSE_CERTS in asn1.result)
      this.certs = Array.from(asn1.result[BASIC_OCSP_RESPONSE_CERTS], element => new Certificate({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Create array for output sequence
    const outputArray = [];

    outputArray.push(this.tbsResponseData.toSchema());
    outputArray.push(this.signatureAlgorithm.toSchema());
    outputArray.push(this.signature);

    //#region Create array of certificates
    if (this.certs) {
      outputArray.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: [
          new asn1js.Sequence({
            value: Array.from(this.certs, element => element.toSchema())
          })
        ]
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
      tbsResponseData: this.tbsResponseData.toJSON(),
      signatureAlgorithm: this.signatureAlgorithm.toJSON(),
      signature: this.signature.toJSON()
    };

    if (this.certs)
      _object.certs = Array.from(this.certs, element => element.toJSON());

    return _object;
  }

  /**
   * Get OCSP response status for specific certificate
   * @param certificate Certificate to be checked
   * @param issuerCertificate Certificate of issuer for certificate to be checked
   */
  public async getCertificateStatus(certificate: Certificate, issuerCertificate: Certificate): Promise<CertificateStatus> {
    //#region Initial variables
    const result = {
      isForCertificate: false,
      status: 2 // 0 = good, 1 = revoked, 2 = unknown
    };

    const hashesObject: Record<string, number> = {};

    const certIDs: CertID[] = [];
    //#endregion

    //#region Create all "certIDs" for input certificates
    for (const response of this.tbsResponseData.responses) {
      const hashAlgorithm = common.getAlgorithmByOID(response.certID.hashAlgorithm.algorithmId, true, "CertID.hashAlgorithm");

      if (!hashesObject[hashAlgorithm.name]) {
        hashesObject[hashAlgorithm.name] = 1;

        const certID = new CertID();

        certIDs.push(certID);
        await certID.createForCertificate(certificate, {
          hashAlgorithm: hashAlgorithm.name,
          issuerCertificate
        });
      }
    }
    //#endregion

    //#region Compare all response's "certIDs" with identifiers for input certificate
    for (const response of this.tbsResponseData.responses) {
      for (const id of certIDs) {
        if (response.certID.isEqual(id)) {
          result.isForCertificate = true;

          try {
            switch (response.certStatus.idBlock.isConstructed) {
              case true:
                if (response.certStatus.idBlock.tagNumber === 1)
                  result.status = 1; // revoked

                break;
              case false:
                switch (response.certStatus.idBlock.tagNumber) {
                  case 0: // good
                    result.status = 0;
                    break;
                  case 2: // unknown
                    result.status = 2;
                    break;
                  default:
                }

                break;
              default:
            }
          }
          catch (ex) {
            // nothing
          }

          return result;
        }
      }
    }

    return result;
    //#endregion
  }

  /**
   * Make signature for current OCSP Basic Response
   * @param privateKey Private key for "subjectPublicKeyInfo" structure
   * @param hashAlgorithm Hashing algorithm. Default SHA-1
   */
  async sign(privateKey: CryptoKey, hashAlgorithm = "SHA-1"): Promise<void> {
    //#region Initial checking
    //#region Get a private key from function parameter
    if (!privateKey) {
      throw new Error("Need to provide a private key for signing");
    }
    //#endregion
    //#endregion

    //#region Initial variables
    const engine = common.getEngine();
    //#endregion

    //#region Get a "default parameters" for current algorithm and set correct signature algorithm
    const signatureParams = await engine.subtle.getSignatureParameters(privateKey, hashAlgorithm);

    const algorithm = signatureParams.parameters.algorithm;
    if (!("name" in algorithm)) {
      throw new Error("Empty algorithm");
    }
    this.signatureAlgorithm = signatureParams.signatureAlgorithm;
    //#endregion

    //#region Create TBS data for signing
    this.tbsResponseData.tbs = this.tbsResponseData.toSchema(true).toBER(false);
    //#endregion

    //#region Signing TBS data on provided private key
    const signature = await engine.subtle.signWithPrivateKey(this.tbsResponseData.tbs, privateKey, { algorithm });
    this.signature = new asn1js.BitString({ valueHex: signature });
    //#endregion
  }

  /**
   * Verify existing OCSP Basic Response
   * @param params Additional parameters
   */
  public async verify(params: BasicOCSPResponseVerifyParams = {}): Promise<boolean> {
    //#region Initial variables
    let signerCert: Certificate | null = null;
    let certIndex = -1;
    const trustedCerts: Certificate[] = params.trustedCerts || [];

    const engine = common.getEngine();
    //#endregion

    //#region Check amount of certificates
    if (!this.certs) {
      throw new Error("No certificates attached to the BasicOCSPResponse");
    }
    //#endregion

    //#region Get a "crypto" extension
    const crypto = common.getCrypto(true);
    //#endregion

    //#region Find correct value for "responderID"
    switch (true) {
      case (this.tbsResponseData.responderID instanceof RelativeDistinguishedNames): // [1] Name
        for (const [index, certificate] of this.certs.entries()) {
          if (certificate.subject.isEqual(this.tbsResponseData.responderID)) {
            certIndex = index;
            break;
          }
        }
        break;
      case (this.tbsResponseData.responderID instanceof asn1js.OctetString): // [2] KeyHash
        for (const [index, cert] of this.certs.entries()) {
          const hash = await crypto.digest({ name: "sha-1" }, new Uint8Array(cert.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex));
          if (pvutils.isEqualBuffer(hash, this.tbsResponseData.responderID.valueBlock.valueHex)) {
            certIndex = index;
            break;
          }
        }
        break;
      default:
        throw new Error("Wrong value for responderID");
    }
    //#endregion

    //#region Make additional verification for signer's certificate
    if (certIndex === (-1))
      throw new Error("Correct certificate was not found in OCSP response");

    signerCert = this.certs[certIndex];

    const additionalCerts: Certificate[] = [signerCert];
    for (const cert of this.certs) {
      const caCert = await checkCA(cert, signerCert);
      if (caCert) {
        additionalCerts.push(caCert);
      }
    }
    const certChain = new CertificateChainValidationEngine({
      certs: additionalCerts,
      trustedCerts,
    });

    const verificationResult = await certChain.verify();
    if (!verificationResult.result) {
      throw new Error("Validation of signer's certificate failed");
    }


    return engine.subtle.verifyWithPublicKey(this.tbsResponseData.tbs, this.signature, this.certs[certIndex].subjectPublicKeyInfo, this.signatureAlgorithm);
  }

}
