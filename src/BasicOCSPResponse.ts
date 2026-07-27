import * as asn1js from "asn1js";
import * as pvtsutils from "pvtsutils";
import * as pvutils from "pvutils";
import * as common from "./common";
import { ResponseData, ResponseDataJson, ResponseDataSchema } from "./ResponseData";
import {
  AlgorithmIdentifier,
  AlgorithmIdentifierJson,
  AlgorithmIdentifierSchema
} from "./AlgorithmIdentifier";
import { Certificate, CertificateJson, CertificateSchema, checkCA } from "./Certificate";
import { CertID } from "./CertID";
import { ExtKeyUsage } from "./ExtKeyUsage";
import { RelativeDistinguishedNames } from "./RelativeDistinguishedNames";
import { CertificateChainValidationEngine } from "./CertificateChainValidationEngine";
import * as Schema from "./Schema";
import { PkiObject, PkiObjectParameters } from "./PkiObject";
import { AsnError } from "./errors";
import { EMPTY_STRING } from "./constants";

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

/**
 * Extended Key Usage OID `id-kp-OCSPSigning` (RFC 6960 §4.2.2.2.1).
 * An OCSP responder delegated by the issuer MUST carry this EKU.
 */
const ID_KP_OCSP_SIGNING = "1.3.6.1.5.5.7.3.9";
/**
 * Extension OID `id-ce-keyUsage` (RFC 5280 §4.2.1.3).
 */
const ID_CE_KEY_USAGE = "2.5.29.15";
/**
 * Extension OID `id-ce-extKeyUsage` (RFC 5280 §4.2.1.12).
 */
const ID_CE_EXT_KEY_USAGE = "2.5.29.37";

export interface IBasicOCSPResponse {
  tbsResponseData: ResponseData;
  signatureAlgorithm: AlgorithmIdentifier;
  signature: asn1js.BitString;
  certs?: Certificate[];
}

export interface CertificateStatus {
  isForCertificate: boolean;
  /**
   * 0 = good, 1 = revoked, 2 = unknown
   */
  status: number;
}

export type BasicOCSPResponseParameters = PkiObjectParameters & Partial<IBasicOCSPResponse>;

export interface BasicOCSPResponseVerifyParams {
  /**
   * Trust anchors used for building the signer's certificate chain.
   *
   * **Important:** being merely chained to a certificate in `trustedCerts` does
   * NOT authorize a certificate to sign OCSP responses. Inclusion in
   * `trustedCerts` only makes a chain verifiable; authorization to respond for a
   * given CA still requires being that CA, being a delegated responder issued by
   * that CA with `id-kp-OCSPSigning`, or being listed in `trustedResponders`.
   */
  trustedCerts?: Certificate[];
  /**
   * Candidate issuer certificates used to resolve the `CertID` of each
   * `SingleResponse` and to validate delegated OCSP responders.
   *
   * This context is optional. For each `SingleResponse`, PKI.js looks for an
   * issuer whose `issuerNameHash` / `issuerKeyHash` (computed using the
   * response's hash algorithm) match the `CertID`. Issuers are also searched
   * in embedded response certificates, `trustedCerts`, and the validated
   * signer path. `verify()` fails closed only when the issuer cannot be found
   * in any of those sources.
   */
  issuerCerts?: Certificate[];
  /**
   * Certificates explicitly authorized to sign OCSP responses, independent
   * of CA delegation. Matching is by exact DER of the full certificate;
   * chaining to one of these certificates does NOT inherit this permission.
   *
   * For a matched certificate, chain validation, expiry, and
   * `id-kp-OCSPSigning` are skipped. The OCSP signature MUST still verify
   * against the pinned certificate's public key. Use this for locally
   * trusted responders that are not the issuing CA and are not formally
   * delegated. For normal delegated responders, leave this list empty.
   */
  trustedResponders?: Certificate[];
}

export interface BasicOCSPResponseJson {
  tbsResponseData: ResponseDataJson;
  signatureAlgorithm: AlgorithmIdentifierJson;
  signature: asn1js.BitStringJson;
  certs?: CertificateJson[];
}

/**
 * Represents the BasicOCSPResponse structure described in [RFC6960](https://datatracker.ietf.org/doc/html/rfc6960)
 */
export class BasicOCSPResponse extends PkiObject implements IBasicOCSPResponse {
  public static override CLASS_NAME = "BasicOCSPResponse";

  public tbsResponseData!: ResponseData;
  public signatureAlgorithm!: AlgorithmIdentifier;
  public signature!: asn1js.BitString;
  public certs?: Certificate[];

  /**
   * Initializes a new instance of the {@link BasicOCSPResponse} class
   * @param parameters Initialization parameters
   */
  constructor(parameters: BasicOCSPResponseParameters = {}) {
    super();

    this.tbsResponseData = pvutils.getParametersValue(
      parameters,
      TBS_RESPONSE_DATA,
      BasicOCSPResponse.defaultValues(TBS_RESPONSE_DATA)
    );
    this.signatureAlgorithm = pvutils.getParametersValue(
      parameters,
      SIGNATURE_ALGORITHM,
      BasicOCSPResponse.defaultValues(SIGNATURE_ALGORITHM)
    );
    this.signature = pvutils.getParametersValue(
      parameters,
      SIGNATURE,
      BasicOCSPResponse.defaultValues(SIGNATURE)
    );
    if (CERTS in parameters) {
      this.certs = pvutils.getParametersValue(
        parameters,
        CERTS,
        BasicOCSPResponse.defaultValues(CERTS)
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
  public static override defaultValues(memberName: typeof TBS_RESPONSE_DATA): ResponseData;
  public static override defaultValues(memberName: typeof SIGNATURE_ALGORITHM): AlgorithmIdentifier;
  public static override defaultValues(memberName: typeof SIGNATURE): asn1js.BitString;
  public static override defaultValues(memberName: typeof CERTS): Certificate[];
  public static override defaultValues(memberName: string): any {
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
      case "type": {
        let comparisonResult =
          ResponseData.compareWithDefault("tbs", memberValue.tbs) &&
          ResponseData.compareWithDefault("responderID", memberValue.responderID) &&
          ResponseData.compareWithDefault("producedAt", memberValue.producedAt) &&
          ResponseData.compareWithDefault("responses", memberValue.responses);

        if ("responseExtensions" in memberValue)
          comparisonResult =
            comparisonResult &&
            ResponseData.compareWithDefault("responseExtensions", memberValue.responseExtensions);

        return comparisonResult;
      }
      case SIGNATURE_ALGORITHM:
        return (
          memberValue.algorithmId === EMPTY_STRING && "algorithmParams" in memberValue === false
        );
      case SIGNATURE:
        return memberValue.isEqual(BasicOCSPResponse.defaultValues(memberName));
      case CERTS:
        return memberValue.length === 0;
      default:
        return super.defaultValues(memberName);
    }
  }

  /**
   * @inheritdoc
   * @asn ASN.1 schema
   * ```asn
   * BasicOCSPResponse ::= SEQUENCE {
   *    tbsResponseData      ResponseData,
   *    signatureAlgorithm   AlgorithmIdentifier,
   *    signature            BIT STRING,
   *    certs            [0] EXPLICIT SEQUENCE OF Certificate OPTIONAL }
   *```
   */
  public static override schema(
    parameters: Schema.SchemaParameters<{
      tbsResponseData?: ResponseDataSchema;
      signatureAlgorithm?: AlgorithmIdentifierSchema;
      signature?: string;
      certs?: CertificateSchema;
    }> = {}
  ): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(
      parameters,
      "names",
      {}
    );

    return new asn1js.Sequence({
      name: names.blockName || BASIC_OCSP_RESPONSE,
      value: [
        ResponseData.schema(
          names.tbsResponseData || {
            names: {
              blockName: BASIC_OCSP_RESPONSE_TBS_RESPONSE_DATA
            }
          }
        ),
        AlgorithmIdentifier.schema(
          names.signatureAlgorithm || {
            names: {
              blockName: BASIC_OCSP_RESPONSE_SIGNATURE_ALGORITHM
            }
          }
        ),
        new asn1js.BitString({ name: names.signature || BASIC_OCSP_RESPONSE_SIGNATURE }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [
            new asn1js.Sequence({
              value: [
                new asn1js.Repeated({
                  name: BASIC_OCSP_RESPONSE_CERTS,
                  value: Certificate.schema(names.certs || {})
                })
              ]
            })
          ]
        })
      ]
    });
  }

  public fromSchema(schema: Schema.SchemaType): void {
    // Clear input data first
    pvutils.clearProps(schema, CLEAR_PROPS);
    //#endregion

    // Check the schema is valid
    const asn1 = asn1js.compareSchema(schema, schema, BasicOCSPResponse.schema());
    AsnError.assertSchema(asn1, this.className);

    //#region Get internal properties from parsed schema
    this.tbsResponseData = new ResponseData({
      schema: asn1.result[BASIC_OCSP_RESPONSE_TBS_RESPONSE_DATA]
    });
    this.signatureAlgorithm = new AlgorithmIdentifier({
      schema: asn1.result[BASIC_OCSP_RESPONSE_SIGNATURE_ALGORITHM]
    });
    this.signature = asn1.result[BASIC_OCSP_RESPONSE_SIGNATURE];

    if (BASIC_OCSP_RESPONSE_CERTS in asn1.result) {
      this.certs = Array.from(
        asn1.result[BASIC_OCSP_RESPONSE_CERTS],
        element => new Certificate({ schema: element })
      );
    }
    //#endregion
  }

  public toSchema(): asn1js.Sequence {
    //#region Create array for output sequence
    const outputArray = [];

    outputArray.push(this.tbsResponseData.toSchema());
    outputArray.push(this.signatureAlgorithm.toSchema());
    outputArray.push(this.signature);

    //#region Create array of certificates
    if (this.certs) {
      outputArray.push(
        new asn1js.Constructed({
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [
            new asn1js.Sequence({
              value: Array.from(this.certs, o => o.toSchema())
            })
          ]
        })
      );
    }
    //#endregion
    //#endregion

    //#region Construct and return new ASN.1 schema for this object
    return new asn1js.Sequence({
      value: outputArray
    });
    //#endregion
  }

  public toJSON(): BasicOCSPResponseJson {
    const res: BasicOCSPResponseJson = {
      tbsResponseData: this.tbsResponseData.toJSON(),
      signatureAlgorithm: this.signatureAlgorithm.toJSON(),
      signature: this.signature.toJSON()
    };

    if (this.certs) {
      res.certs = Array.from(this.certs, o => o.toJSON());
    }

    return res;
  }

  /**
   * Get OCSP response status for specific certificate.
   *
   * **Important:** this method only inspects the `SingleResponse` entries in
   * the response — it does **not** authenticate the responder. A successful
   * call MUST NOT be relied upon unless `verify()` has already returned
   * `true` for this response (under suitable trust parameters). Without
   * verification, an attacker-supplied response can claim any status.
   *
   * @param certificate Certificate to be checked
   * @param issuerCertificate Certificate of issuer for certificate to be checked
   * @param crypto Crypto engine
   */
  public async getCertificateStatus(
    certificate: Certificate,
    issuerCertificate: Certificate,
    crypto = common.getCrypto(true)
  ): Promise<CertificateStatus> {
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
      const hashAlgorithm = crypto.getAlgorithmByOID(
        response.certID.hashAlgorithm.algorithmId,
        true,
        "CertID.hashAlgorithm"
      );

      if (!hashesObject[hashAlgorithm.name]) {
        hashesObject[hashAlgorithm.name] = 1;

        const certID = new CertID();

        certIDs.push(certID);
        await certID.createForCertificate(
          certificate,
          {
            hashAlgorithm: hashAlgorithm.name,
            issuerCertificate
          },
          crypto
        );
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
                if (response.certStatus.idBlock.tagNumber === 1) result.status = 1; // revoked

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
          } catch {
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
   * @param crypto Crypto engine
   */
  async sign(
    privateKey: CryptoKey,
    hashAlgorithm = "SHA-1",
    crypto = common.getCrypto(true)
  ): Promise<void> {
    // Get a private key from function parameter
    if (!privateKey) {
      throw new Error("Need to provide a private key for signing");
    }

    //#region Get a "default parameters" for current algorithm and set correct signature algorithm
    const signatureParams = await crypto.getSignatureParameters(privateKey, hashAlgorithm);

    const algorithm = signatureParams.parameters.algorithm;
    if (!("name" in algorithm)) {
      throw new Error("Empty algorithm");
    }
    this.signatureAlgorithm = signatureParams.signatureAlgorithm;
    //#endregion

    //#region Create TBS data for signing
    this.tbsResponseData.tbsView = new Uint8Array(this.tbsResponseData.toSchema(true).toBER());
    //#endregion

    //#region Signing TBS data on provided private key
    const signature = await crypto.signWithPrivateKey(
      this.tbsResponseData.tbsView as BufferSource,
      privateKey,
      { algorithm }
    );
    this.signature = new asn1js.BitString({ valueHex: signature });
    //#endregion
  }

  /**
   * Verify the OCSP Basic Response (RFC 6960).
   *
   * For every candidate matching the `ResponderID`, three checks are
   * performed in order:
   *  1. Cryptographic signature verification against the candidate's public key.
   *  2. Chain validation against `trustedCerts` (skipped for `trustedResponders`).
   *  3. Authorization per RFC 6960 §4.2.2.2: direct issuer, delegated responder
   *     with `id-kp-OCSPSigning`, or explicit `trustedResponders` entry.
   *
   * @returns `true` if a candidate passes all checks. Returns `false` on
   *          cryptographic signature mismatch. Throws on hard errors
   *          (chain failure, unauthorized responder, unsupported algorithm).
   */
  public async verify(
    params: BasicOCSPResponseVerifyParams = {},
    crypto = common.getCrypto(true)
  ): Promise<boolean> {
    //#region 0. Validate inputs
    if (!this.certs || this.certs.length === 0) {
      throw new Error("No certificates attached to the BasicOCSPResponse");
    }

    const embeddedCerts: Certificate[] = this.certs;
    const trustedCerts: Certificate[] = params.trustedCerts || [];
    const issuerCerts: Certificate[] = params.issuerCerts || [];
    const trustedResponders: Certificate[] = params.trustedResponders || [];

    //#region 1. Collect all responder candidates
    const candidateIndices = await BasicOCSPResponse.collectResponderCandidates(
      embeddedCerts,
      this.tbsResponseData.responderID,
      crypto,
    );

    if (candidateIndices.length === 0) {
      throw new Error("No certificate matching the OCSP responderID was found in the response");
    }

    //#region 2. OCSP signature verification per candidate
    // We do NOT deduplicate by (subject + SPKI) before verifying: two
    // re-issued certs may share an identity but differ in validity / EKU /
    // extensions, and the caller should not be penalised for the order in
    // which they appear. We accept the response as soon as ANY candidate
    // passes all steps.
    //
    // A *cryptographic* mismatch is a normal "this key didn't sign it"
    // signal and is folded into the (possibly multiple) "no valid
    // candidate" outcome. Genuine errors (unsupported algorithm, malformed
    // AlgorithmIdentifier, CryptoEngine failure) are surfaced via
    // `firstCryptoError` and re-thrown if no candidate verifies. We keep
    // the FIRST such error — it is usually closest to the root cause.
    const errors: string[] = [];
    let firstCryptoError: Error | null = null;
    let signatureMismatch = false;
    let hadValidSignature = false;

    for (const idx of candidateIndices) {
      const signerCert = embeddedCerts[idx];

      //#region 2. Signature verification
      let signatureOk: boolean;
      try {
        signatureOk = await this.verifyResponseSignature(signerCert, crypto);
      } catch (err) {
        // Hard error — preserve the first one and try the next candidate.
        if (firstCryptoError === null) {
          firstCryptoError = err as Error;
        }
        errors.push(`candidate #${idx} signature error: ${(err as Error).message}`);
        continue;
      }
      if (!signatureOk) {
        signatureMismatch = true;
        continue;
      }

      hadValidSignature = true;

      try {
        //#region 3. Chain validation (skipped for explicitly trusted responders)
        const isTrustedResponder = trustedResponders.length > 0 &&
          BasicOCSPResponse.containsCertificateByDer(trustedResponders, signerCert);

        let validatedPathCerts: Certificate[] = [];
        if (!isTrustedResponder) {
          validatedPathCerts = await BasicOCSPResponse.validateSignerChain(
            signerCert,
            embeddedCerts,
            issuerCerts,
            trustedCerts,
            crypto,
          );
        }

        //#region 4. Authorization
        // Assemble issuer candidates from: issuerCerts, embedded certs,
        // trustedCerts, and the validated signer path (but NOT
        // trustedResponders — explicitly trusted responders are not
        // implicitly issuers). Deduplicate by EXACT DER so cross-signed
        // CA copies that share subject+SPKI are all retained; this matches
        // `findIssuersForCertID()` and lets the authorization loop try
        // each alternative issuing path.
        const authIssuerCandidates: Certificate[] = [];
        for (const cert of [...issuerCerts, ...embeddedCerts, ...trustedCerts, ...validatedPathCerts]) {
          if (!BasicOCSPResponse.containsCertificateByDer(authIssuerCandidates, cert)) {
            authIssuerCandidates.push(cert);
          }
        }

        let allAuthorized = true;
        for (const singleResponse of this.tbsResponseData.responses) {
          const authorized = await BasicOCSPResponse.isAuthorizedResponderForCertID(
            signerCert,
            singleResponse.certID,
            authIssuerCandidates,
            trustedResponders,
            crypto,
          );
          if (!authorized) {
            allAuthorized = false;
            break;
          }
        }

        if (allAuthorized) {
          // One fully verified candidate is sufficient.
          return true;
        } else {
          errors.push(`candidate #${idx}: responder is not authorized for all SingleResponses`);
        }
      } catch (err) {
        errors.push(`candidate #${idx}: ${(err as Error).message}`);
      }
    }

    // No candidate fully verified. Distinguish the failure mode.
    if (signatureMismatch && errors.length === 0 && firstCryptoError === null) {
      // Every candidate failed only at the signature step with a clean
      // mismatch — this is the documented `return false` path.
      return false;
    }
    if (hadValidSignature) {
      // At least one candidate had a cryptographically valid signature
      // but failed chain validation or authorization — surface those
      // higher-level reasons rather than a misleading crypto error.
      throw new Error(
        `OCSP responder verification failed. Reasons: ${errors.join("; ")}`
      );
    }
    if (firstCryptoError) {
      // Re-throw genuine signature errors rather than hiding them as `false`.
      throw firstCryptoError;
    }
    throw new Error(
      `OCSP responder verification failed. Reasons: ${errors.join("; ")}`
    );
  }

  //#region Issuer / certificate helpers

  /**
   * Return `true` if `certs` already contains a certificate that is
   * DER-identical to `cert`.
   *
   * We deliberately compare the full DER encoding — not subject + public key
   * identity — so that cross-signed certificates (which share subject and key
   * but have different issuers/paths) are treated as distinct candidates and
   * retained for both chain building and issuer matching.
   */
  private static containsCertificateByDer(certs: Certificate[], cert: Certificate): boolean {
    const certDer = cert.toSchema(true).toBER(false);
    return certs.some(c =>
      pvtsutils.BufferSourceConverter.isEqual(c.toSchema(true).toBER(false), certDer)
    );
  }

  //#region Responder candidate collection (multi-candidate)

  /**
   * Collect all certificates from `certs` that match the `responderID`.
   * Returns indices into `certs`.
   */
  private static async collectResponderCandidates(
    certs: Certificate[],
    responderID: RelativeDistinguishedNames | asn1js.OctetString,
    crypto = common.getCrypto(true),
  ): Promise<number[]> {
    const indices: number[] = [];

    if (responderID instanceof RelativeDistinguishedNames) {
      // byName: match on subject DN
      for (const [index, certificate] of certs.entries()) {
        if (certificate.subject.isEqual(responderID)) {
          indices.push(index);
        }
      }
    } else if (responderID instanceof asn1js.OctetString) {
      // byKey: match on SHA-1 of subjectPublicKeyInfo.subjectPublicKey
      for (const [index, certificate] of certs.entries()) {
        const spk = certificate.subjectPublicKeyInfo.subjectPublicKey;
        if (!spk.valueBlock?.valueHexView) {
          continue;
        }
        const hash = await crypto.digest(
          { name: "sha-1" },
          spk.valueBlock.valueHexView as BufferSource,
        );
        if (pvutils.isEqualBuffer(hash, responderID.valueBlock.valueHex)) {
          indices.push(index);
        }
      }
    } else {
      throw new Error("Unsupported OCSP responderID type");
    }

    return indices;
  }

  //#region OCSP response signature verification

  /**
   * Verify the OCSP response signature against `candidateCert`'s public key.
   * Returns `true` on valid signature, `false` on mismatch. Hard errors
   * (unsupported algorithm, malformed data) are thrown.
   */
  private async verifyResponseSignature(
    candidateCert: Certificate,
    crypto = common.getCrypto(true),
  ): Promise<boolean> {
    return crypto.verifyWithPublicKey(
      this.tbsResponseData.tbsView as BufferSource,
      this.signature,
      candidateCert.subjectPublicKeyInfo,
      this.signatureAlgorithm,
    );
  }

  //#region Chain building & validation

  /**
   * Build and validate the certificate chain for a candidate signer.
   *
   * The signer is appended as the **last** element of the local certificate
   * list (the engine always treats `certs[certs.length - 1]` as the leaf),
   * and the CA candidates used to build the chain come from `issuerCerts`
   * and embedded `certs`. `trustedCerts` is intentionally NOT added to the
   * local list — it is passed only as trust-anchor material, which is what
   * `CertificateChainValidationEngine` expects.
   *
   * @returns the validated issuer path (issuer certificates actually used
   *          to anchor the signer, excluding the signer itself).
   * @throws on chain validation failure or when the engine cannot produce
   *         a `certificatePath`.
   */
  private static async validateSignerChain(
    signerCert: Certificate,
    embeddedCerts: Certificate[],
    issuerCerts: Certificate[],
    trustedCerts: Certificate[],
    crypto = common.getCrypto(true),
  ): Promise<Certificate[]> {
    // Collect CA candidates, append the signer as leaf (last entry), and
    // deduplicate by exact DER so cross-signed copies with different issuers
    // are all retained for path building.
    const additionalCerts: Certificate[] = [];

    const addIfCa = (cert: Certificate): void => {
      const caCert = checkCA(cert, signerCert);
      if (caCert && !BasicOCSPResponse.containsCertificateByDer(additionalCerts, caCert)) {
        additionalCerts.push(caCert);
      }
    };

    // CA candidates from issuerCerts take priority over embedded certs so
    // callers can pin a specific cross-signed or pre-built issuer chain.
    for (const cert of issuerCerts) {
      addIfCa(cert);
    }
    for (const cert of embeddedCerts) {
      addIfCa(cert);
    }

    // The signer must occupy the leaf slot (last entry).
    additionalCerts.push(signerCert);

    const engine = new CertificateChainValidationEngine({
      certs: additionalCerts,
      trustedCerts
    });

    const result = await engine.verify({}, crypto);
    if (!result.result || !result.certificatePath) {
      throw new Error(`Validation of signer's certificate chain failed${result.resultMessage ? `: ${result.resultMessage}` : ""}`);
    }

    // `certificatePath[0]` is the leaf (signer). Return the issuer portion.
    return result.certificatePath.slice(1);
  }

  /**
   * Resolve **all** distinct issuer certificates for a `CertID` from a list
   * of candidates.
   *
   * The OCSP `CertID` identifies the CA only by:
   *   * hash of the DER encoding of the issuer name, and
   *   * hash of the **contents** of `SubjectPublicKey` (without tag/length).
   *
   * Therefore two CA certificates can legitimately share the same
   * `issuerNameHash` / `issuerKeyHash` while differing in SPKI
   * `AlgorithmIdentifier`, serial number, validity or extensions. This
   * function treats any such match as a separate result and lets the caller
   * try each one independently, rather than collapsing them into a single
   * identity or declaring them ambiguous.
   *
   * Candidates are still deduplicated by exact DER so duplicate copies do
   * not cause redundant work.
   *
   * @returns the list of candidate issuer certificates (possibly empty).
   */
  private static async findIssuersForCertID(
    certID: CertID,
    issuerCandidates: Certificate[],
    crypto = common.getCrypto(true),
  ): Promise<Certificate[]> {
    const responseHashAlg = crypto.getAlgorithmByOID(certID.hashAlgorithm.algorithmId, false);
    if (!responseHashAlg || !("name" in responseHashAlg)) {
      return [];
    }
    const hashAlgName: string = (responseHashAlg as { name: string }).name;

    // Deduplicate by exact DER. OCSP cannot distinguish CAs that collide on
    // name/key hashes, so any distinct DER copy is a valid independent
    // candidate.
    const uniqueByDer: Certificate[] = [];
    for (const candidate of issuerCandidates) {
      if (!BasicOCSPResponse.containsCertificateByDer(uniqueByDer, candidate)) {
        uniqueByDer.push(candidate);
      }
    }

    const matched: Certificate[] = [];
    for (const candidate of uniqueByDer) {
      const candidateID = new CertID();
      try {
        await candidateID.createForCertificate(candidate, {
          hashAlgorithm: hashAlgName,
          issuerCertificate: candidate,
        }, crypto);
      } catch {
        continue;
      }

      if (candidateID.hashAlgorithm.algorithmId !== certID.hashAlgorithm.algorithmId) {
        continue;
      }
      if (!pvtsutils.BufferSourceConverter.isEqual(
        candidateID.issuerNameHash.valueBlock.valueHexView,
        certID.issuerNameHash.valueBlock.valueHexView,
      )) {
        continue;
      }
      if (!pvtsutils.BufferSourceConverter.isEqual(
        candidateID.issuerKeyHash.valueBlock.valueHexView,
        certID.issuerKeyHash.valueBlock.valueHexView,
      )) {
        continue;
      }
      matched.push(candidate);
    }

    return matched;
  }

  /**
   * Return `true` if `certificate` itself corresponds to the issuer
   * identified by `certID` — i.e. hashing the certificate's subject and the
   * contents of its `SubjectPublicKey` with the CertID's hash algorithm
   * reproduces `issuerNameHash` and `issuerKeyHash`.
   *
   * This avoids depending on which copy of the CA cert was reachable from
   * the response when deciding the direct-issuer case.
   */
  private static async certificateMatchesIssuerID(
    certificate: Certificate,
    certID: CertID,
    crypto = common.getCrypto(true),
  ): Promise<boolean> {
    const responseHashAlg = crypto.getAlgorithmByOID(certID.hashAlgorithm.algorithmId, false);
    if (!responseHashAlg || !("name" in responseHashAlg)) {
      return false;
    }
    const hashAlgName: string = (responseHashAlg as { name: string }).name;

    try {
      const nameHash = await crypto.digest(
        { name: hashAlgName },
        certificate.subject.toSchema().toBER(false),
      );
      if (!pvtsutils.BufferSourceConverter.isEqual(
        new Uint8Array(nameHash),
        certID.issuerNameHash.valueBlock.valueHexView,
      )) {
        return false;
      }

      const keyBytes = certificate.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHexView;
      const keyHash = await crypto.digest({ name: hashAlgName }, keyBytes as BufferSource);
      return pvtsutils.BufferSourceConverter.isEqual(
        new Uint8Array(keyHash),
        certID.issuerKeyHash.valueBlock.valueHexView,
      );
    } catch {
      return false;
    }
  }

  /**
   * Check whether `signerCert` is authorized to respond for the certificate
   * identified by `certID` under RFC 6960 §4.2.2.2.
   *
   * Authorization is granted when at least one of the following holds:
   *
   *  1. **Direct issuer** — `signerCert` itself matches the
   *     `issuerNameHash` / `issuerKeyHash` of `certID`.
   *
   *  2. **Delegated OCSP responder** — there exists an issuer matching the
   *     `certID` that issued `signerCert` (issuer name matches subject and
   *     the certificate signature verifies), the `signerCert` contains
   *     `id-kp-OCSPSigning` in its EKU, and (when a KeyUsage extension is
   *     present) the KeyUsage permits `digitalSignature`.
   *
   *  3. **Explicitly trusted responder** — `signerCert` is DER-identical to
   *     one of the certificates in `trustedResponders`.
   *
   * All other cases return `false`.
   */
  private static async isAuthorizedResponderForCertID(
    signerCert: Certificate,
    certID: CertID,
    issuerCandidates: Certificate[],
    trustedResponders: Certificate[],
    crypto = common.getCrypto(true),
  ): Promise<boolean> {
    //#region 3) Explicitly trusted responder (exact DER match)
    if (trustedResponders.length > 0 &&
      BasicOCSPResponse.containsCertificateByDer(trustedResponders, signerCert)) {
      return true;
    }
    //#endregion

    //#region 1) Direct issuer — signerCert itself matches the CertID.
    if (await BasicOCSPResponse.certificateMatchesIssuerID(signerCert, certID, crypto)) {
      return true;
    }
    //#endregion

    //#region 2) Delegated OCSP responder (RFC 6960 §4.2.2.2.1)
    // Signer MUST carry `id-kp-OCSPSigning`, regardless of which issuer
    // we resolve below — short-circuit once to avoid wasted work.
    if (!BasicOCSPResponse.certHasOCSPSigningEKU(signerCert)) {
      return false;
    }
    if (!BasicOCSPResponse.certKeyUsagePermitsDigitalSignature(signerCert)) {
      return false;
    }

    const issuers = await BasicOCSPResponse.findIssuersForCertID(certID, issuerCandidates, crypto);
    for (const issuerCert of issuers) {
      // a) signerCert MUST be issued by this resolved issuer.
      if (!signerCert.issuer.isEqual(issuerCert.subject)) {
        continue;
      }
      // b) signer's certificate signature MUST be verifiable with this
      //    issuer's public key.
      try {
        const issued = await signerCert.verify(issuerCert, crypto);
        if (issued) {
          return true;
        }
      } catch {
        // try next candidate issuer
      }
    }
    //#endregion

    return false;
  }

  /**
   * Return `true` if `cert` carries `id-kp-OCSPSigning` in its Extended Key
   * Usage extension. If the extension is absent the function returns `false`.
   */
  private static certHasOCSPSigningEKU(cert: Certificate): boolean {
    const ext = cert.extensions?.find(e => e.extnID === ID_CE_EXT_KEY_USAGE);
    if (!ext) {
      return false;
    }
    const parsed = ext.parsedValue;
    if (parsed instanceof ExtKeyUsage) {
      return parsed.keyPurposes.includes(ID_KP_OCSP_SIGNING);
    }
    // Fall back to manual parsing in case parsedValue did not deserialize.
    try {
      const asn1 = asn1js.fromBER(ext.extnValue.valueBlock.valueHexView as BufferSource);
      if (asn1.offset === -1) return false;
      // extnValue for ExtKeyUsage MUST be a SEQUENCE of OID.
      if (!(asn1.result instanceof asn1js.Sequence)) return false;
      const eku = new ExtKeyUsage({ schema: asn1.result });
      return eku.keyPurposes.includes(ID_KP_OCSP_SIGNING);
    } catch {
      return false;
    }
  }

  /**
   * Return `true` if `cert` either has no `KeyUsage` extension (per RFC 5280
   * the usage is then unconstrained) or the present `KeyUsage` extension
   * permits `digitalSignature` (bit 0).
   *
   * Per RFC 5280 §4.2.1.3 the KeyUsage bit string is encoded MSB-first inside
   * the extension value: `digitalSignature` is bit 0, which is the high bit
   * (0x80) of the first content byte of the BIT STRING.
   */
  private static certKeyUsagePermitsDigitalSignature(cert: Certificate): boolean {
    const ext = cert.extensions?.find(e => e.extnID === ID_CE_KEY_USAGE);
    if (!ext) {
      return true; // no KeyUsage => unconstrained
    }
    try {
      const asn1 = asn1js.fromBER(ext.extnValue.valueBlock.valueHexView as BufferSource);
      if (asn1.offset === -1) return false;
      // extnValue for KeyUsage MUST be a BIT STRING.
      if (!(asn1.result instanceof asn1js.BitString)) return false;
      const bits = new Uint8Array(asn1.result.valueBlock.valueHexView);
      if (bits.length === 0) return false;
      // Bit 0 (digitalSignature) is the most-significant bit of the first byte.
      return (bits[0] & 0x80) !== 0;
    } catch {
      return false;
    }
  }
}
