import * as asn1js from "asn1js";
import { bytes } from "@peculiar/utils";
import { AltName } from "./AltName";
import { AuthorityKeyIdentifier } from "./AuthorityKeyIdentifier";
import { BasicConstraints } from "./BasicConstraints";
import type { BasicOCSPResponse } from "./BasicOCSPResponse";
import type { Certificate } from "./Certificate";
import type { CertificateRevocationList } from "./CertificateRevocationList";
import * as common from "./common";
import type { Extension } from "./Extension";
import * as Helpers from "./Helpers";
import type { GeneralName } from "./GeneralName";
import {
  id_AnyPolicy,
  id_AuthorityInfoAccess,
  id_AuthorityKeyIdentifier,
  id_BasicConstraints,
  id_CertificatePolicies,
  id_CRLDistributionPoints,
  id_ExtKeyUsage,
  id_FreshestCRL,
  id_InhibitAnyPolicy,
  id_KeyUsage,
  id_NameConstraints,
  id_PolicyConstraints,
  id_PolicyMappings,
  id_SubjectAltName,
  id_SubjectKeyIdentifier,
} from "./ObjectIdentifiers";
import type { RelativeDistinguishedNames } from "./RelativeDistinguishedNames";
import type { GeneralSubtree } from "./GeneralSubtree";
import { NameConstraints } from "./NameConstraints";
import { PolicyConstraints } from "./PolicyConstraints";
import { EMPTY_STRING } from "./constants";

const TRUSTED_CERTS = "trustedCerts";
const CERTS = "certs";
const CRLS = "crls";
const OCSPS = "ocsps";
const CHECK_DATE = "checkDate";
const FIND_ORIGIN = "findOrigin";
const FIND_ISSUER = "findIssuer";

export enum ChainValidationCode {
  unknown = -1,
  success = 0,
  noRevocation = 11,
  noPath = 60,
  noValidPath = 97,
}

export class ChainValidationError extends Error {
  public static readonly NAME = "ChainValidationError";

  public code: ChainValidationCode;

  constructor(code: ChainValidationCode, message: string) {
    super(message);

    this.name = ChainValidationError.NAME;
    this.code = code;
    this.message = message;
  }
}

export interface CertificateChainValidationEngineVerifyResult {
  result: boolean;
  resultCode: number;
  resultMessage: string;
  error?: Error | ChainValidationError;
  authConstrPolicies?: string[];
  userConstrPolicies?: string[];
  explicitPolicyIndicator?: boolean;
  policyMappings?: string[];
  certificatePath?: Certificate[];
}

export type FindOriginCallback = (certificate: Certificate, validationEngine: CertificateChainValidationEngine) => string;
export type FindIssuerCallback = (certificate: Certificate, validationEngine: CertificateChainValidationEngine, crypto?: common.ICryptoEngine) => Promise<Certificate[]>;
/**
 * Called for a critical extension that the engine does not process itself. Return `true` only if
 * the application has checked the extension and the certificate meets its constraints;
 * otherwise the path is rejected (RFC 5280, 4.2).
 */
export type CriticalExtensionHandler = (extension: Extension, certificate: Certificate, validationEngine: CertificateChainValidationEngine) => boolean | Promise<boolean>;

/**
 * Choices that RFC 5280 leaves to the application. The mandatory checks of path validation
 * (pathLenConstraint of intermediate certificates, critical extensions, and so on) cannot be turned off.
 */
export interface CertificateChainValidationPolicy {
  /**
   * Apply the `pathLenConstraint` of the trust anchor's certificate to the path (RFC 5280, 6.2).
   * Default `false`.
   */
  enforceTrustAnchorPathLenConstraint?: boolean;
  /**
   * Checks critical extensions that the engine does not process itself. Without it, a certificate
   * with such an extension is rejected.
   */
  criticalExtensionHandler?: CriticalExtensionHandler;
}

export interface CertificateChainValidationEngineParameters {
  trustedCerts?: Certificate[];
  certs?: Certificate[];
  crls?: CertificateRevocationList[];
  ocsps?: BasicOCSPResponse[];
  checkDate?: Date;
  findOrigin?: FindOriginCallback;
  findIssuer?: FindIssuerCallback;
  validationPolicy?: CertificateChainValidationPolicy;
}
interface CrlAndCertificate {
  crl: CertificateRevocationList;
  certificate: Certificate;
}

interface FindCrlResult {
  status: number;
  statusMessage: string;
  result?: CrlAndCertificate[];
}

export interface CertificateChainValidationEngineVerifyParams {
  initialPolicySet?: string[];
  initialExplicitPolicy?: boolean;
  initialPolicyMappingInhibit?: boolean;
  initialInhibitPolicy?: boolean;
  initialPermittedSubtreesSet?: GeneralSubtree[];
  initialExcludedSubtreesSet?: GeneralSubtree[];
  initialRequiredNameForms?: GeneralSubtree[];
  passedWhenNotRevValues?: boolean;
}

/**
 * Returns `true` if the certificate is in the trusted list, otherwise `false`
 * @param cert A certificate that is expected to be in the trusted list
 * @param trustedList List of trusted certificates
 * @returns
 */
function isTrusted(cert: Certificate, trustedList: Certificate[]): boolean {
  for (let i = 0; i < trustedList.length; i++) {
    if (bytes.equal(cert.tbsView, trustedList[i].tbsView)) {
      return true;
    }
  }

  return false;
}

/**
 * Extensions whose meaning the engine processes during path validation (RFC 5280, 6.1).
 * A critical extension with any other OID is rejected, unless
 * {@link CertificateChainValidationPolicy.criticalExtensionHandler} accepts it.
 */
const PROCESSED_EXTENSIONS = new Set([
  id_AuthorityInfoAccess,
  id_AuthorityKeyIdentifier,
  id_BasicConstraints,
  id_CertificatePolicies,
  id_CRLDistributionPoints,
  // Recognized so that a generic path can be validated. Key purposes are checked by the
  // application (RFC 5280, 4.2.1.12)
  id_ExtKeyUsage,
  id_FreshestCRL,
  id_InhibitAnyPolicy,
  id_KeyUsage,
  id_NameConstraints,
  id_PolicyConstraints,
  id_PolicyMappings,
  id_SubjectAltName,
  id_SubjectKeyIdentifier,
]);

/**
 * Extensions that the engine reads as plain ASN.1 values, with the ASN.1 type each one must have
 */
const RAW_EXTENSION_TYPES: Record<string, new (...args: any[]) => unknown> = {
  [id_KeyUsage]: asn1js.BitString,
  [id_SubjectKeyIdentifier]: asn1js.OctetString,
  [id_InhibitAnyPolicy]: asn1js.Integer,
};

/**
 * GeneralName types that name constraints are checked for: rfc822Name, dNSName, directoryName,
 * uniformResourceIdentifier and iPAddress
 */
const PROCESSED_NAME_FORMS = new Set([1, 2, 4, 6, 7]);

/**
 * Returns the value of an INTEGER (0..MAX). Values above `Number.MAX_SAFE_INTEGER` are returned as
 * `Number.MAX_SAFE_INTEGER`, which no real path reaches.
 * @param value ASN.1 integer
 * @returns `undefined` if the integer is negative or empty
 */
function getUnsigned(value: asn1js.Integer): number | undefined {
  if (value.valueBlock.valueHexView.byteLength === 0) {
    return undefined;
  }

  const number = value.toBigInt();
  if (number < BigInt(0)) {
    return undefined;
  }

  return number > BigInt(Number.MAX_SAFE_INTEGER) ? Number.MAX_SAFE_INTEGER : Number(number);
}

/**
 * Returns the SkipCerts values of a decoded PolicyConstraints extension
 * @param extension Certificate extension
 * @returns Values by context tag, 0 for `requireExplicitPolicy` and 1 for `inhibitPolicyMapping`
 */
function getPolicyConstraints(extension: Extension): Map<number, number | undefined> {
  const values = new Map<number, number | undefined>();
  const asn1 = asn1js.fromBER(extension.extnValue.valueBlock.valueHexView);
  if (asn1.result instanceof asn1js.Sequence) {
    for (const item of asn1.result.valueBlock.value) {
      // SkipCerts is IMPLICIT, so the content is that of an INTEGER
      const content = item instanceof asn1js.Primitive ? item.valueBlock.valueHexView : new Uint8Array();
      values.set(item.idBlock.tagNumber, getUnsigned(new asn1js.Integer({ valueHex: content })));
    }
  }

  return values;
}

/**
 * Returns `true` if the extension value was decoded without errors and is in the range of its type
 * @param extension Certificate extension with one of {@link PROCESSED_EXTENSIONS}
 * @returns
 */
function isValidExtension(extension: Extension): boolean {
  const raw = extension.extnValue.valueBlock.valueHexView;
  const asn1 = asn1js.fromBER(raw);
  if (asn1.offset === -1 || asn1.offset !== raw.byteLength) {
    return false;
  }

  const rawType = RAW_EXTENSION_TYPES[extension.extnID];
  if (rawType) {
    // SkipCerts ::= INTEGER (0..MAX) (RFC 5280, 4.2.1.14)
    return asn1.result instanceof rawType && !(asn1.result instanceof asn1js.Integer && getUnsigned(asn1.result) === undefined);
  }

  const parsedValue = extension.parsedValue;
  if (!parsedValue || ("parsingError" in parsedValue && parsedValue.parsingError)) {
    return false;
  }

  if (parsedValue instanceof PolicyConstraints) {
    // SkipCerts ::= INTEGER (0..MAX) (RFC 5280, 4.2.1.11)
    return [...getPolicyConstraints(extension).values()].every((value) => value !== undefined);
  }

  if (parsedValue instanceof NameConstraints) {
    // "minimum" must be zero, and "maximum" must be absent (RFC 5280, 4.2.1.10)
    return getSubtrees(parsedValue).every(({ minimum, maximum }) => minimum === 0 && maximum === undefined);
  }

  return true;
}

function getSubtrees(nameConstraints: NameConstraints): GeneralSubtree[] {
  return [...(nameConstraints.permittedSubtrees || []), ...(nameConstraints.excludedSubtrees || [])];
}

/**
 * Returns the OID of an extension that the certificate has more than once, if any
 * @param cert Certificate
 * @returns
 */
function findDuplicateExtension(cert: Certificate): string | undefined {
  const seen = new Set<string>();
  for (const { extnID } of cert.extensions || []) {
    if (seen.has(extnID)) {
      return extnID;
    }
    seen.add(extnID);
  }

  return undefined;
}

function duplicateExtension(extnID: string) {
  return {
    result: false,
    resultCode: 17,
    resultMessage: `Certificate extension is present more than once: ${extnID}`,
  };
}

/**
 * Returns the type of a name of the certificate that a critical name constraint above it restricts,
 * although the engine cannot check names of that type (RFC 5280, 4.2.1.10)
 * @param path Certificate path, from the end entity to the trust anchor
 * @returns
 */
function findUnprocessedNameForm(path: Certificate[]): number | undefined {
  const constrained = new Set<number>();
  for (let i = path.length - 2; i >= 0; i--) {
    const extensions = path[i].extensions || [];
    // Name constraints do not apply to self-issued intermediate certificates (RFC 5280, 6.1.3)
    if (constrained.size > 0 && (i === 0 || !path[i].issuer.isEqual(path[i].subject))) {
      for (const { extnID, parsedValue } of extensions) {
        if (extnID === id_SubjectAltName && parsedValue instanceof AltName) {
          const name = parsedValue.altNames.find(({ type }) => constrained.has(type));
          if (name) {
            return name.type;
          }
        }
      }
    }

    for (const { critical, parsedValue } of extensions) {
      if (critical && parsedValue instanceof NameConstraints) {
        for (const { base } of getSubtrees(parsedValue)) {
          if (!PROCESSED_NAME_FORMS.has(base.type)) {
            constrained.add(base.type);
          }
        }
      }
    }
  }

  return undefined;
}

/**
 * Returns the `pathLenConstraint` value of the certificate's BasicConstraints extension, if any.
 * Values above `Number.MAX_SAFE_INTEGER` are returned as `Number.MAX_SAFE_INTEGER`, which no real
 * path reaches. A negative value is returned as is, so the caller can reject it.
 * @param cert Certificate
 * @returns
 */
function getPathLenConstraint(cert: Certificate): number | undefined {
  for (const extension of cert.extensions || []) {
    if (extension.extnID === id_BasicConstraints && extension.parsedValue instanceof BasicConstraints) {
      const { pathLenConstraint } = extension.parsedValue;
      if (pathLenConstraint instanceof asn1js.Integer) {
        return getUnsigned(pathLenConstraint) ?? -1;
      }

      return pathLenConstraint;
    }
  }

  return undefined;
}

/**
 * Represents a chain-building engine for {@link Certificate} certificates.
 *
 * Path validation notes:
 * - The `pathLenConstraint` of a trusted certificate is not applied, unless
 *   {@link CertificateChainValidationPolicy.enforceTrustAnchorPathLenConstraint} is set. RFC 5280, 6.2 leaves
 *   trust anchor constraints to the application. Those of intermediate certificates are always applied.
 * - A critical extension that the engine does not process makes the path invalid, even if its type is
 *   registered in `ExtensionValueFactory`. Use {@link CertificateChainValidationPolicy.criticalExtensionHandler}
 *   to check such extensions in the application.
 * - A critical extension that does not decode, or has a value out of range, makes the path invalid. So does
 *   an extension that a certificate has more than once, and a name that a critical name constraint
 *   restricts in a form the engine does not check (otherName, x400Address, ediPartyName, registeredID).
 * - When several trusted paths exist, they are checked from the shortest, and the first one that passes the
 *   basic checks (dates, name chaining, revocation, CA certificates, critical extensions, pathLenConstraint)
 *   is used. Certificate policies and name constraints are checked for that path only, so a path can be
 *   selected and then still fail.
 * - Whether the key usage and the extended key usage of the end entity fit the purpose at hand is for the
 *   caller to check.
 *
 * `resultCode` values of the checks above:
 * - 6: a critical extension does not decode or has a value out of range
 * - 15: a critical extension is not recognized
 * - 16: a `pathLenConstraint` is exceeded or invalid
 * - 17: a certificate has an extension more than once
 * - 18: a critical name constraint applies to a name form that the engine does not check
 *
 * @example
 * ```js The following example demonstrates how to verify certificate chain
 * const rootCa = pkijs.Certificate.fromBER(certRaw1);
 * const intermediateCa = pkijs.Certificate.fromBER(certRaw2);
 * const leafCert = pkijs.Certificate.fromBER(certRaw3);
 * const crl1 = pkijs.CertificateRevocationList.fromBER(crlRaw1);
 * const ocsp1 = pkijs.BasicOCSPResponse.fromBER(ocspRaw1);
 *
 * const chainEngine = new pkijs.CertificateChainValidationEngine({
 *   certs: [rootCa, intermediateCa, leafCert],
 *   crls: [crl1],
 *   ocsps: [ocsp1],
 *   checkDate: new Date("2015-07-13"), // optional
 *   trustedCerts: [rootCa],
 * });
 *
 * const chain = await chainEngine.verify();
 * ```
 */
export class CertificateChainValidationEngine {
  /**
   * Array of pre-defined trusted (by user) certificates
   */
  public trustedCerts: Certificate[];
  /**
   * Array with certificate chain. Could be only one end-user certificate in there!
   */
  public certs: Certificate[];
  /**
   * Array of all CRLs for all certificates from certificate chain
   */
  public crls: CertificateRevocationList[];
  /**
   * Array of all OCSP responses
   */
  public ocsps: BasicOCSPResponse[];
  /**
   * The date at which the check would be
   */
  public checkDate: Date;
  /**
   * Returns where a certificate came from, such as "Intermediate Certificates" or "Trusted Certificates"
   */
  public findOrigin: FindOriginCallback;
  /**
   * Returns the possible issuers of a certificate, used to build the certificate path
   */
  public findIssuer: FindIssuerCallback;
  /**
   * Choices that RFC 5280 leaves to the application
   */
  public validationPolicy: CertificateChainValidationPolicy;

  /**
   * Constructor for CertificateChainValidationEngine class
   * @param parameters
   */
  constructor(parameters: CertificateChainValidationEngineParameters = {}) {
    //#region Internal properties of the object
    this.trustedCerts = parameters[TRUSTED_CERTS] ?? this.defaultValues(TRUSTED_CERTS);
    this.certs = parameters[CERTS] ?? this.defaultValues(CERTS);
    this.crls = parameters[CRLS] ?? this.defaultValues(CRLS);
    this.ocsps = parameters[OCSPS] ?? this.defaultValues(OCSPS);
    this.checkDate = parameters[CHECK_DATE] ?? this.defaultValues(CHECK_DATE);
    this.findOrigin = parameters[FIND_ORIGIN] ?? this.defaultValues(FIND_ORIGIN);
    this.findIssuer = parameters[FIND_ISSUER] ?? this.defaultValues(FIND_ISSUER);
    this.validationPolicy = parameters.validationPolicy ?? {};
    //#endregion
  }

  public static defaultFindOrigin(certificate: Certificate, validationEngine: CertificateChainValidationEngine): string {
    //#region Firstly encode TBS for certificate
    if (certificate.tbsView.byteLength === 0) {
      certificate.tbsView = new Uint8Array(certificate.encodeTBS().toBER());
    }
    //#endregion

    //#region Search in Intermediate Certificates
    for (const localCert of validationEngine.certs) {
      //#region Firstly encode TBS for certificate
      if (localCert.tbsView.byteLength === 0) {
        localCert.tbsView = new Uint8Array(localCert.encodeTBS().toBER());
      }
      //#endregion

      if (bytes.equal(certificate.tbsView, localCert.tbsView)) return "Intermediate Certificates";
    }
    //#endregion

    //#region Search in Trusted Certificates
    for (const trustedCert of validationEngine.trustedCerts) {
      //#region Firstly encode TBS for certificate
      if (trustedCert.tbsView.byteLength === 0) trustedCert.tbsView = new Uint8Array(trustedCert.encodeTBS().toBER());
      //#endregion

      if (bytes.equal(certificate.tbsView, trustedCert.tbsView)) return "Trusted Certificates";
    }
    //#endregion

    return "Unknown";
  }

  public async defaultFindIssuer(certificate: Certificate, validationEngine: CertificateChainValidationEngine, crypto = common.getCrypto(true)): Promise<Certificate[]> {
    //#region Initial variables
    const result: Certificate[] = [];

    let keyIdentifier: asn1js.OctetString | null = null;
    let authorityCertIssuer: GeneralName[] | null = null;
    let authorityCertSerialNumber: asn1js.Integer | null = null;
    //#endregion

    //#region Speed-up searching in case of self-signed certificates
    if (certificate.subject.isEqual(certificate.issuer)) {
      try {
        const verificationResult = await certificate.verify(undefined, crypto);
        if (verificationResult) {
          return [certificate];
        }
      } catch {
        // nothing
      }
    }
    //#endregion

    //#region Find values to speed-up search
    if (certificate.extensions) {
      for (const extension of certificate.extensions) {
        if (extension.extnID === id_AuthorityKeyIdentifier && extension.parsedValue instanceof AuthorityKeyIdentifier) {
          if (extension.parsedValue.keyIdentifier) {
            keyIdentifier = extension.parsedValue.keyIdentifier;
          } else {
            if (extension.parsedValue.authorityCertIssuer) {
              authorityCertIssuer = extension.parsedValue.authorityCertIssuer;
            }
            if (extension.parsedValue.authorityCertSerialNumber) {
              authorityCertSerialNumber = extension.parsedValue.authorityCertSerialNumber;
            }
          }

          break;
        }
      }
    }
    //#endregion

    // Aux function
    function checkCertificate(possibleIssuer: Certificate): void {
      //#region Firstly search for appropriate extensions
      if (keyIdentifier !== null) {
        if (possibleIssuer.extensions) {
          let extensionFound = false;

          for (const extension of possibleIssuer.extensions) {
            if (extension.extnID === id_SubjectKeyIdentifier && extension.parsedValue) {
              extensionFound = true;

              if (bytes.equal(extension.parsedValue.valueBlock.valueHex, keyIdentifier.valueBlock.valueHexView)) {
                result.push(possibleIssuer);
              }

              break;
            }
          }

          if (extensionFound) {
            return;
          }
        }
      }
      //#endregion

      //#region Now search for authorityCertSerialNumber
      let authorityCertSerialNumberEqual = false;

      if (authorityCertSerialNumber !== null) authorityCertSerialNumberEqual = possibleIssuer.serialNumber.isEqual(authorityCertSerialNumber);
      //#endregion

      //#region And at least search for Issuer data
      if (authorityCertIssuer !== null) {
        if (possibleIssuer.subject.isEqual(authorityCertIssuer)) {
          if (authorityCertSerialNumberEqual) result.push(possibleIssuer);
        }
      } else {
        if (certificate.issuer.isEqual(possibleIssuer.subject)) result.push(possibleIssuer);
      }
      //#endregion
    }

    // Search in Trusted Certificates
    for (const trustedCert of validationEngine.trustedCerts) {
      checkCertificate(trustedCert);
    }

    // Search in Intermediate Certificates
    for (const intermediateCert of validationEngine.certs) {
      checkCertificate(intermediateCert);
    }

    // Now perform certificate verification checking
    for (let i = result.length - 1; i >= 0; i--) {
      try {
        const verificationResult = await certificate.verify(result[i], crypto);
        if (verificationResult === false) result.splice(i, 1);
      } catch {
        result.splice(i, 1); // Something wrong, remove the certificate
      }
    }

    return result;
  }

  /**
   * Returns default values for all class members
   * @param memberName String name for a class member
   * @returns Default value
   */
  public defaultValues(memberName: typeof TRUSTED_CERTS): Certificate[];
  public defaultValues(memberName: typeof CERTS): Certificate[];
  public defaultValues(memberName: typeof CRLS): CertificateRevocationList[];
  public defaultValues(memberName: typeof OCSPS): BasicOCSPResponse[];
  public defaultValues(memberName: typeof CHECK_DATE): Date;
  public defaultValues(memberName: typeof FIND_ORIGIN): FindOriginCallback;
  public defaultValues(memberName: typeof FIND_ISSUER): FindIssuerCallback;
  public defaultValues(memberName: string): any {
    switch (memberName) {
      case TRUSTED_CERTS:
        return [];
      case CERTS:
        return [];
      case CRLS:
        return [];
      case OCSPS:
        return [];
      case CHECK_DATE:
        return new Date();
      case FIND_ORIGIN:
        return CertificateChainValidationEngine.defaultFindOrigin;
      case FIND_ISSUER:
        return this.defaultFindIssuer;
      default:
        throw new Error(`Invalid member name for CertificateChainValidationEngine class: ${memberName}`);
    }
  }

  public async sort(passedWhenNotRevValues = false, crypto = common.getCrypto(true)): Promise<Certificate[]> {
    // Initial variables
    const localCerts: Certificate[] = [];

    //#region Building certificate path
    // `branch` holds the certificates already on the current path (leaf
    // first), so that issuer cycles such as A -> B -> A are pruned
    // (RFC 4158, section 5.2) without hiding cross-signed alternatives
    // on other branches.
    const buildPath = async (certificate: Certificate, crypto: common.ICryptoEngine, branch: Certificate[] = []): Promise<Certificate[][]> => {
      const result: Certificate[][] = [];
      const currentBranch = [...branch, certificate];

      // Aux function checking array for unique elements
      function checkUnique(array: Certificate[]): boolean {
        let unique = true;

        for (let i = 0; i < array.length; i++) {
          for (let j = 0; j < array.length; j++) {
            if (j === i) continue;

            if (array[i] === array[j]) {
              unique = false;
              break;
            }
          }

          if (!unique) break;
        }

        return unique;
      }

      if (isTrusted(certificate, this.trustedCerts)) {
        return [[certificate]];
      }

      const findIssuerResult = await this.findIssuer(certificate, this, crypto);
      if (findIssuerResult.length === 0) {
        // Dead end: return no paths, so the caller can still try its other
        // candidate issuers (RFC 4158). The top-level check below reports
        // the error when no candidate leads anywhere.
        return [];
      }

      for (let i = 0; i < findIssuerResult.length; i++) {
        if (bytes.equal(findIssuerResult[i].tbsView, certificate.tbsView)) {
          result.push([findIssuerResult[i]]);
          continue;
        }

        const issuer = findIssuerResult[i];
        if (currentBranch.some((o) => bytes.equal(o.tbsView, issuer.tbsView))) {
          // Cycle: this issuer is already on the current path
          continue;
        }

        const buildPathResult = await buildPath(issuer, crypto, currentBranch);

        for (let j = 0; j < buildPathResult.length; j++) {
          const copy = buildPathResult[j].slice();
          copy.splice(0, 0, findIssuerResult[i]);

          if (checkUnique(copy)) result.push(copy);
          else result.push(buildPathResult[j]);
        }
      }

      return result;
    };
    //#endregion

    //#region Find CRL for specific certificate
    const findCRL = async (certificate: Certificate): Promise<FindCrlResult> => {
      //#region Initial variables
      const issuerCertificates: Certificate[] = [];
      const crls: CertificateRevocationList[] = [];
      const crlsAndCertificates: CrlAndCertificate[] = [];
      //#endregion

      //#region Find all possible CRL issuers
      issuerCertificates.push(...localCerts.filter((element) => certificate.issuer.isEqual(element.subject)));
      if (issuerCertificates.length === 0) {
        return {
          status: 1,
          statusMessage: "No certificate's issuers",
        };
      }
      //#endregion

      //#region Find all CRLs for certificate's issuer
      crls.push(...this.crls.filter((o) => o.issuer.isEqual(certificate.issuer)));
      if (crls.length === 0) {
        return {
          status: 2,
          statusMessage: "No CRLs for specific certificate issuer",
        };
      }
      //#endregion

      //#region Find specific certificate of issuer for each CRL
      for (let i = 0; i < crls.length; i++) {
        const crl = crls[i];
        //#region Check "nextUpdate" for the CRL
        // The "nextUpdate" is older than CHECK_DATE.
        // Thus we should do have another, updated CRL.
        // Thus the CRL assumed to be invalid.
        if (crl.nextUpdate && crl.nextUpdate.value < this.checkDate) {
          continue;
        }
        //#endregion

        for (let j = 0; j < issuerCertificates.length; j++) {
          try {
            const result = await crls[i].verify({ issuerCertificate: issuerCertificates[j] }, crypto);
            if (result) {
              crlsAndCertificates.push({
                crl: crls[i],
                certificate: issuerCertificates[j],
              });

              break;
            }
          } catch {
            // nothing
          }
        }
      }
      //#endregion

      if (crlsAndCertificates.length) {
        return {
          status: 0,
          statusMessage: EMPTY_STRING,
          result: crlsAndCertificates,
        };
      }

      return {
        status: 3,
        statusMessage: "No valid CRLs found",
      };
    };
    //#endregion

    //#region Find OCSP for specific certificate
    const findOCSP = async (certificate: Certificate, issuerCertificate: Certificate): Promise<number> => {
      //#region Get hash algorithm from certificate
      const hashAlgorithm = crypto.getAlgorithmByOID<any>(certificate.signatureAlgorithm.algorithmId);
      if (!hashAlgorithm.name) {
        return 1;
      }
      if (!hashAlgorithm.hash) {
        return 1;
      }
      //#endregion

      //#region Search for OCSP response for the certificate
      for (let i = 0; i < this.ocsps.length; i++) {
        const ocsp = this.ocsps[i];
        const result = await ocsp.getCertificateStatus(certificate, issuerCertificate, crypto);
        if (result.isForCertificate) {
          if (result.status === 0) return 0;

          return 1;
        }
      }
      //#endregion

      return 2;
    };
    //#endregion

    //#region Check for certificate to be CA
    async function checkForCA(certificate: Certificate, needToCheckCRL = false) {
      //#region Initial variables
      let isCA = false;
      let mustBeCA = false;
      let keyUsagePresent = false;
      let cRLSign = false;
      //#endregion

      if (certificate.extensions) {
        for (let j = 0; j < certificate.extensions.length; j++) {
          const extension = certificate.extensions[j];
          if (extension.critical && !extension.parsedValue) {
            return {
              result: false,
              resultCode: 6,
              resultMessage: `Unable to parse critical certificate extension: ${extension.extnID}`,
            };
          }

          if (extension.extnID === id_KeyUsage) // KeyUsage
          {
            keyUsagePresent = true;

            const view = new Uint8Array(extension.parsedValue.valueBlock.valueHex);

            if ((view[0] & 0x04) === 0x04)
              // Set flag "keyCertSign"
              mustBeCA = true;

            if ((view[0] & 0x02) === 0x02)
              // Set flag "cRLSign"
              cRLSign = true;
          }

          if (extension.extnID === id_BasicConstraints) // BasicConstraints
          {
            if ("cA" in extension.parsedValue) {
              if (extension.parsedValue.cA === true) isCA = true;
            }
          }
        }

        if (mustBeCA === true && isCA === false) {
          return {
            result: false,
            resultCode: 3,
            resultMessage: 'Unable to build certificate chain - using "keyCertSign" flag set without BasicConstraints',
          };
        }

        if (keyUsagePresent === true && isCA === true && mustBeCA === false) {
          return {
            result: false,
            resultCode: 4,
            resultMessage: 'Unable to build certificate chain - "keyCertSign" flag was not set',
          };
        }

        if (isCA === true && keyUsagePresent === true && needToCheckCRL && cRLSign === false) {
          return {
            result: false,
            resultCode: 5,
            resultMessage: 'Unable to build certificate chain - intermediate certificate must have "cRLSign" key usage flag',
          };
        }
      }

      if (isCA === false) {
        return {
          result: false,
          resultCode: 7,
          resultMessage: "Unable to build certificate chain - more than one possible end-user certificate",
        };
      }

      return {
        result: true,
        resultCode: 0,
        resultMessage: EMPTY_STRING,
      };
    }
    //#endregion

    //#region Check the extensions of a certificate
    // Candidate paths share certificates, so a processed extension is decoded and checked once
    const validExtensions = new Map<Extension, boolean>();
    const checkExtensions = async (cert: Certificate): Promise<{ result: boolean; resultCode?: number; resultMessage?: string }> => {
      const duplicate = findDuplicateExtension(cert);
      if (duplicate !== undefined) {
        return duplicateExtension(duplicate);
      }

      // A critical extension must be processed, not only decoded (RFC 5280, 4.2)
      for (const extension of cert.extensions || []) {
        if (!extension.critical) {
          continue;
        }

        if (PROCESSED_EXTENSIONS.has(extension.extnID)) {
          let valid = validExtensions.get(extension);
          if (valid === undefined) {
            valid = isValidExtension(extension);
            validExtensions.set(extension, valid);
          }
          if (!valid) {
            return {
              result: false,
              resultCode: 6,
              resultMessage: `Unable to parse critical certificate extension: ${extension.extnID}`,
            };
          }

          continue;
        }

        const { criticalExtensionHandler } = this.validationPolicy;
        if (criticalExtensionHandler && (await criticalExtensionHandler(extension, cert, this)) === true) {
          continue;
        }

        return {
          result: false,
          resultCode: 15,
          resultMessage: `Unrecognized critical certificate extension: ${extension.extnID}`,
        };
      }

      return {
        result: true,
      };
    };
    //#endregion

    //#region Basic check for certificate path
    const basicCheck = async (path: Certificate[], checkDate: Date): Promise<{ result: boolean; resultCode?: number; resultMessage?: string }> => {
      //#region Check that all dates are valid
      for (let i = 0; i < path.length; i++) {
        if (path[i].notBefore.value > checkDate || path[i].notAfter.value < checkDate) {
          return {
            result: false,
            resultCode: 8,
            resultMessage: "The certificate is either not yet valid or expired",
          };
        }
      }
      //#endregion

      //#region Check certificate name chain

      // We should have at least two certificates: end entity and trusted root
      if (path.length < 2) {
        return {
          result: false,
          resultCode: 9,
          resultMessage: "Too short certificate path",
        };
      }

      for (let i = path.length - 2; i >= 0; i--) {
        //#region Check that we do not have a "self-signed" certificate
        if (path[i].issuer.isEqual(path[i].subject) === false) {
          if (path[i].issuer.isEqual(path[i + 1].subject) === false) {
            return {
              result: false,
              resultCode: 10,
              resultMessage: "Incorrect name chaining",
            };
          }
        }
        //#endregion
      }
      //#endregion

      //#region Check each certificate (except "trusted root") to be non-revoked
      if (this.crls.length !== 0 || this.ocsps.length !== 0) // If CRLs and OCSPs are empty then we consider all certificates to be valid
      {
        for (let i = 0; i < path.length - 1; i++) {
          //#region Initial variables
          let ocspResult = 2;
          let crlResult: FindCrlResult = {
            status: 0,
            statusMessage: EMPTY_STRING,
          };
          //#endregion

          //#region Check OCSPs first
          if (this.ocsps.length !== 0) {
            ocspResult = await findOCSP(path[i], path[i + 1]);

            switch (ocspResult) {
              case 0:
                continue;
              case 1:
                return {
                  result: false,
                  resultCode: 12,
                  resultMessage: "One of certificates was revoked via OCSP response",
                };
              case 2: // continue to check the certificate with CRL
                break;
              default:
            }
          }
          //#endregion

          //#region Check CRLs
          if (this.crls.length !== 0) {
            crlResult = await findCRL(path[i]);

            if (crlResult.status === 0 && crlResult.result) {
              for (let j = 0; j < crlResult.result.length; j++) {
                //#region Check that the CRL issuer certificate have not been revoked
                const isCertificateRevoked = crlResult.result[j].crl.isCertificateRevoked(path[i]);
                if (isCertificateRevoked) {
                  return {
                    result: false,
                    resultCode: 12,
                    resultMessage: "One of certificates had been revoked",
                  };
                }
                //#endregion

                //#region Check that the CRL issuer certificate is a CA certificate
                const isCertificateCA = await checkForCA(crlResult.result[j].certificate, true);
                if (isCertificateCA.result === false) {
                  return {
                    result: false,
                    resultCode: 13,
                    resultMessage: "CRL issuer certificate is not a CA certificate or does not have crlSign flag",
                  };
                }
                //#endregion
              }
            } else {
              if (passedWhenNotRevValues === false) {
                throw new ChainValidationError(ChainValidationCode.noRevocation, `No revocation values found for one of certificates: ${crlResult.statusMessage}`);
              }
            }
          } else {
            if (ocspResult === 2) {
              return {
                result: false,
                resultCode: 11,
                resultMessage: "No revocation values found for one of certificates",
              };
            }
          }
          //#endregion

          //#region Check we do have links to revocation values inside issuer's certificate
          if (ocspResult === 2 && crlResult.status === 2 && passedWhenNotRevValues) {
            const issuerCertificate = path[i + 1];
            let extensionFound = false;

            if (issuerCertificate.extensions) {
              for (const extension of issuerCertificate.extensions) {
                switch (extension.extnID) {
                  case id_CRLDistributionPoints:
                  case id_FreshestCRL:
                  case id_AuthorityInfoAccess:
                    extensionFound = true;
                    break;
                  default:
                }
              }
            }

            if (extensionFound) {
              throw new ChainValidationError(ChainValidationCode.noRevocation, `No revocation values found for one of certificates: ${crlResult.statusMessage}`);
            }
          }
          //#endregion
        }
      }
      //#endregion

      //#region Check each certificate (except "end entity") in the path to be a CA certificate
      for (const [i, cert] of path.entries()) {
        if (!i) {
          // Skip entity certificate
          continue;
        }

        const result = await checkForCA(cert);
        if (!result.result) {
          return {
            result: false,
            resultCode: 14,
            resultMessage: "One of intermediate certificates is not a CA certificate",
          };
        }
      }
      //#endregion

      //#region Check extensions of each certificate (except "trust anchor")
      const anchor = path.length - 1;
      for (let i = 0; i < anchor; i++) {
        const result = await checkExtensions(path[i]);
        if (!result.result) {
          return result;
        }
      }

      const nameForm = findUnprocessedNameForm(path);
      if (nameForm !== undefined) {
        return {
          result: false,
          resultCode: 18,
          resultMessage: `Unsupported critical name constraint for GeneralName type: ${nameForm}`,
        };
      }
      //#endregion

      //#region Check "pathLenConstraint" values, from "trust anchor" down to the last CA certificate
      // RFC 5280, 6.2 leaves the constraints of the trust anchor itself to the application
      const { enforceTrustAnchorPathLenConstraint } = this.validationPolicy;
      if (enforceTrustAnchorPathLenConstraint) {
        const duplicate = findDuplicateExtension(path[anchor]);
        if (duplicate !== undefined) {
          return duplicateExtension(duplicate);
        }
      }
      const first = enforceTrustAnchorPathLenConstraint ? anchor : anchor - 1;
      let maxPathLength = Number.POSITIVE_INFINITY;
      for (let i = first; i > 0; i--) {
        const cert = path[i];

        // Self-issued intermediate certificates do not count against the limit (RFC 5280, 6.1.4 (l))
        if (i < anchor && !cert.issuer.isEqual(cert.subject)) {
          if (maxPathLength <= 0) {
            return {
              result: false,
              resultCode: 16,
              resultMessage: "Too many intermediate certificates for the pathLenConstraint of an issuer certificate",
            };
          }
          maxPathLength--;
        }

        // RFC 5280, 6.1.4 (m)
        const pathLenConstraint = getPathLenConstraint(cert);
        if (pathLenConstraint !== undefined) {
          // pathLenConstraint is INTEGER (0..MAX) (RFC 5280, 4.2.1.9)
          if (!Number.isSafeInteger(pathLenConstraint) || pathLenConstraint < 0) {
            return {
              result: false,
              resultCode: 16,
              resultMessage: `Invalid pathLenConstraint value: ${pathLenConstraint}`,
            };
          }

          if (pathLenConstraint < maxPathLength) {
            maxPathLength = pathLenConstraint;
          }
        }
      }
      //#endregion

      return {
        result: true,
      };
    };
    //#endregion

    //#region Do main work
    //#region Initialize "localCerts" by value of "this.certs" + "this.trustedCerts" arrays
    localCerts.push(...this.trustedCerts);
    localCerts.push(...this.certs);
    //#endregion

    //#region Check all certificates for been unique
    for (let i = 0; i < localCerts.length; i++) {
      for (let j = 0; j < localCerts.length; j++) {
        if (i === j) continue;

        if (bytes.equal(localCerts[i].tbsView, localCerts[j].tbsView)) {
          localCerts.splice(j, 1);
          i = 0;
          break;
        }
      }
    }
    //#endregion

    const leafCert = localCerts[localCerts.length - 1];

    //#region Build path for "end entity" certificate
    // The "end entity" certificate must be the last one in CERTS array
    const result = await buildPath(leafCert, crypto);
    if (result.length === 0) {
      throw new ChainValidationError(ChainValidationCode.noValidPath, "No valid certificate paths found");
    }
    //#endregion

    //#region Exclude certificate paths not ended with "trusted roots"
    for (let i = result.length - 1; i >= 0; i--) {
      let found = false;

      for (let j = 0; j < result[i].length; j++) {
        const certificate = result[i][j];

        for (let k = 0; k < this.trustedCerts.length; k++) {
          if (bytes.equal(certificate.tbsView, this.trustedCerts[k].tbsView)) {
            found = true;
            break;
          }
        }

        if (found) break;
      }

      if (!found) {
        result.splice(i, 1);
      }
    }

    if (result.length === 0) {
      throw new ChainValidationError(ChainValidationCode.noValidPath, "No valid certificate paths found");
    }
    //#endregion

    //#region Check candidate paths, shortest first, and keep the first one that passes
    // A path can fail a check (for example pathLenConstraint) while another trusted path passes,
    // so try every candidate before giving up. The error of the shortest path is reported.
    const candidates = result.map((o, index) => ({ path: o, index })).sort((a, b) => a.path.length - b.path.length || a.index - b.index);
    let firstError: unknown;
    for (const candidate of candidates) {
      const candidatePath = [leafCert, ...candidate.path];
      try {
        const checkResult = await basicCheck(candidatePath, this.checkDate);
        if (checkResult.result) {
          return candidatePath;
        }

        firstError ??= checkResult;
      } catch (e) {
        firstError ??= e;
      }
    }

    throw firstError;
    //#endregion
  }

  /**
   * Major verification function for certificate chain.
   * @param parameters
   * @param crypto Crypto engine
   * @returns
   */
  async verify(parameters: CertificateChainValidationEngineVerifyParams = {}, crypto = common.getCrypto(true)): Promise<CertificateChainValidationEngineVerifyResult> {
    //#region Auxiliary functions for name constraints checking
    /**
     * Compare two dNSName values
     * @param name DNS from name
     * @param constraint Constraint for DNS from name
     * @returns Boolean result - valid or invalid the "name" against the "constraint"
     */
    function compareDNSName(name: string, constraint: string): boolean {
      //#region Make a "string preparation" for both name and constrain
      const namePrepared = Helpers.stringPrep(name);
      const constraintPrepared = Helpers.stringPrep(constraint);
      //#endregion

      //#region Make a "splitted" versions of "constraint" and "name"
      const nameSplitted = namePrepared.split(".");
      const constraintSplitted = constraintPrepared.split(".");
      //#endregion

      //#region Length calculation and additional check
      const nameLen = nameSplitted.length;
      const constrLen = constraintSplitted.length;

      if (nameLen === 0 || constrLen === 0 || nameLen < constrLen) {
        return false;
      }
      //#endregion

      //#region Check that no part of "name" has zero length
      for (let i = 0; i < nameLen; i++) {
        if (nameSplitted[i].length === 0) {
          return false;
        }
      }
      //#endregion

      //#region Check that no part of "constraint" has zero length
      for (let i = 0; i < constrLen; i++) {
        if (constraintSplitted[i].length === 0) {
          if (i === 0) {
            if (constrLen === 1) {
              return false;
            }

            continue;
          }

          return false;
        }
      }
      //#endregion

      //#region Check that "name" has a tail as "constraint"

      for (let i = 0; i < constrLen; i++) {
        if (constraintSplitted[constrLen - 1 - i].length === 0) {
          continue;
        }

        if (nameSplitted[nameLen - 1 - i].localeCompare(constraintSplitted[constrLen - 1 - i]) !== 0) {
          return false;
        }
      }
      //#endregion

      return true;
    }

    /**
     * Compare two rfc822Name values
     * @param name E-mail address from name
     * @param constraint Constraint for e-mail address from name
     * @returns Boolean result - valid or invalid the "name" against the "constraint"
     */
    function compareRFC822Name(name: string, constraint: string): boolean {
      //#region Make a "string preparation" for both name and constrain
      const namePrepared = Helpers.stringPrep(name);
      const constraintPrepared = Helpers.stringPrep(constraint);
      //#endregion

      //#region Make a "splitted" versions of "constraint" and "name"
      const nameSplitted = namePrepared.split("@");
      const constraintSplitted = constraintPrepared.split("@");
      //#endregion

      //#region Splitted array length checking
      if (nameSplitted.length === 0 || constraintSplitted.length === 0 || nameSplitted.length < constraintSplitted.length) return false;
      //#endregion

      if (constraintSplitted.length === 1) {
        const result = compareDNSName(nameSplitted[1], constraintSplitted[0]);

        if (result) {
          //#region Make a "splitted" versions of domain name from "constraint" and "name"
          const ns = nameSplitted[1].split(".");
          const cs = constraintSplitted[0].split(".");
          //#endregion

          if (cs[0].length === 0) return true;

          return ns.length === cs.length;
        }

        return false;
      }

      return namePrepared.localeCompare(constraintPrepared) === 0;
    }

    /**
     * Compare two uniformResourceIdentifier values
     * @param name uniformResourceIdentifier from name
     * @param constraint Constraint for uniformResourceIdentifier from name
     * @returns Boolean result - valid or invalid the "name" against the "constraint"
     */
    function compareUniformResourceIdentifier(name: string, constraint: string): boolean {
      //#region Make a "string preparation" for both name and constrain
      let namePrepared = Helpers.stringPrep(name);
      const constraintPrepared = Helpers.stringPrep(constraint);
      //#endregion

      //#region Find out a major URI part to compare with
      const ns = namePrepared.split("/");
      const cs = constraintPrepared.split("/");

      if (cs.length > 1)
        // Malformed constraint
        return false;

      if (ns.length > 1) // Full URI string
      {
        for (let i = 0; i < ns.length; i++) {
          if (ns[i].length > 0 && ns[i].charAt(ns[i].length - 1) !== ":") {
            const nsPort = ns[i].split(":");
            namePrepared = nsPort[0];
            break;
          }
        }
      }
      //#endregion

      const result = compareDNSName(namePrepared, constraintPrepared);

      if (result) {
        //#region Make a "splitted" versions of "constraint" and "name"
        const nameSplitted = namePrepared.split(".");
        const constraintSplitted = constraintPrepared.split(".");
        //#endregion

        if (constraintSplitted[0].length === 0) return true;

        return nameSplitted.length === constraintSplitted.length;
      }

      return false;
    }

    /**
     * Compare two iPAddress values
     * @param name iPAddress from name
     * @param constraint Constraint for iPAddress from name
     * @returns Boolean result - valid or invalid the "name" against the "constraint"
     */
    function compareIPAddress(name: asn1js.OctetString, constraint: asn1js.OctetString): boolean {
      //#region Common variables
      const nameView = name.valueBlock.valueHexView;
      const constraintView = constraint.valueBlock.valueHexView;
      //#endregion

      //#region Work with IPv4 addresses
      if (nameView.length === 4 && constraintView.length === 8) {
        for (let i = 0; i < 4; i++) {
          if ((nameView[i] ^ constraintView[i]) & constraintView[i + 4]) return false;
        }

        return true;
      }
      //#endregion

      //#region Work with IPv6 addresses
      if (nameView.length === 16 && constraintView.length === 32) {
        for (let i = 0; i < 16; i++) {
          if ((nameView[i] ^ constraintView[i]) & constraintView[i + 16]) return false;
        }

        return true;
      }
      //#endregion

      return false;
    }

    /**
     * Compare two directoryName values
     * @param name directoryName from name
     * @param constraint Constraint for directoryName from name
     * @returns Boolean result - valid or invalid the "name" against the "constraint"
     */
    function compareDirectoryName(name: RelativeDistinguishedNames, constraint: RelativeDistinguishedNames): boolean {
      //#region Initial check
      if (name.typesAndValues.length === 0 || constraint.typesAndValues.length === 0) return true;

      if (name.typesAndValues.length < constraint.typesAndValues.length) return false;
      //#endregion

      //#region Initial variables
      let result = true;
      let nameStart = 0;
      //#endregion

      for (let i = 0; i < constraint.typesAndValues.length; i++) {
        let localResult = false;

        for (let j = nameStart; j < name.typesAndValues.length; j++) {
          localResult = name.typesAndValues[j].isEqual(constraint.typesAndValues[i]);

          if (name.typesAndValues[j].type === constraint.typesAndValues[i].type) result = result && localResult;

          if (localResult === true) {
            if (nameStart === 0 || nameStart === j) {
              nameStart = j + 1;
              break;
            } else
              // Structure of "name" must be the same with "constraint"
              return false;
          }
        }

        if (localResult === false) return false;
      }

      return nameStart === 0 ? false : result;
    }
    //#endregion

    try {
      //#region Initial checks
      if (this.certs.length === 0) throw new Error("Empty certificate array");
      //#endregion

      //#region Get input variables
      const passedWhenNotRevValues = parameters.passedWhenNotRevValues || false;

      const initialPolicySet = parameters.initialPolicySet || [id_AnyPolicy];

      const initialExplicitPolicy = parameters.initialExplicitPolicy || false;
      const initialPolicyMappingInhibit = parameters.initialPolicyMappingInhibit || false;
      const initialInhibitPolicy = parameters.initialInhibitPolicy || false;

      const initialPermittedSubtreesSet = parameters.initialPermittedSubtreesSet || [];
      const initialExcludedSubtreesSet = parameters.initialExcludedSubtreesSet || [];
      const initialRequiredNameForms = parameters.initialRequiredNameForms || [];

      let explicitPolicyIndicator = initialExplicitPolicy;
      let policyMappingInhibitIndicator = initialPolicyMappingInhibit;
      let inhibitAnyPolicyIndicator = initialInhibitPolicy;

      const pendingConstraints = [
        false, // For "explicitPolicyPending"
        false, // For "policyMappingInhibitPending"
        false, // For "inhibitAnyPolicyPending"
      ];

      let explicitPolicyPending = 0;
      let policyMappingInhibitPending = 0;
      let inhibitAnyPolicyPending = 0;

      let permittedSubtrees = initialPermittedSubtreesSet;
      let excludedSubtrees = initialExcludedSubtreesSet;
      const requiredNameForms = initialRequiredNameForms;

      let pathDepth = 1;
      //#endregion

      //#region Sorting certificates in the chain array
      this.certs = await this.sort(passedWhenNotRevValues, crypto);
      //#endregion

      //#region Work with policies
      //#region Support variables
      const allPolicies: string[] = []; // Array of all policies (string values)
      allPolicies.push(id_AnyPolicy); // Put "anyPolicy" at first place

      const policiesAndCerts = []; // In fact "array of array" where rows are for each specific policy, column for each certificate and value is "true/false"

      const anyPolicyArray = new Array(this.certs.length - 1); // Minus "trusted anchor"
      for (let ii = 0; ii < this.certs.length - 1; ii++) anyPolicyArray[ii] = true;

      policiesAndCerts.push(anyPolicyArray);

      const policyMappings = new Array(this.certs.length - 1); // Array of "PolicyMappings" for each certificate
      const certPolicies = new Array(this.certs.length - 1); // Array of "CertificatePolicies" for each certificate

      let explicitPolicyStart = explicitPolicyIndicator ? this.certs.length - 1 : -1;
      //#endregion

      //#region Gather all necessary information from certificate chain
      for (let i = this.certs.length - 2; i >= 0; i--, pathDepth++) {
        const cert = this.certs[i];
        if (cert.extensions) {
          //#region Get information about certificate extensions
          for (let j = 0; j < cert.extensions.length; j++) {
            const extension = cert.extensions[j];
            //#region CertificatePolicies
            if (extension.extnID === id_CertificatePolicies) {
              certPolicies[i] = extension.parsedValue;

              //#region Remove entry from "anyPolicies" for the certificate
              for (let s = 0; s < allPolicies.length; s++) {
                if (allPolicies[s] === id_AnyPolicy) {
                  delete policiesAndCerts[s][i];
                  break;
                }
              }
              //#endregion

              for (let k = 0; k < extension.parsedValue.certificatePolicies.length; k++) {
                let policyIndex = -1;
                const policyId = extension.parsedValue.certificatePolicies[k].policyIdentifier;

                //#region Try to find extension in "allPolicies" array
                for (let s = 0; s < allPolicies.length; s++) {
                  if (policyId === allPolicies[s]) {
                    policyIndex = s;
                    break;
                  }
                }
                //#endregion

                if (policyIndex === -1) {
                  allPolicies.push(policyId);

                  const certArray = new Array(this.certs.length - 1);
                  certArray[i] = true;

                  policiesAndCerts.push(certArray);
                } else policiesAndCerts[policyIndex][i] = true;
              }
            }
            //#endregion

            //#region PolicyMappings
            if (extension.extnID === id_PolicyMappings) {
              if (policyMappingInhibitIndicator) {
                return {
                  result: false,
                  resultCode: 98,
                  resultMessage: "Policy mapping prohibited",
                };
              }

              policyMappings[i] = extension.parsedValue;
            }
            //#endregion

            //#region PolicyConstraints
            if (extension.extnID === id_PolicyConstraints) {
              if (explicitPolicyIndicator === false) {
                const policyConstraints = getPolicyConstraints(extension);

                //#region requireExplicitPolicy
                const requireExplicitPolicy = policyConstraints.get(0);
                if (requireExplicitPolicy === 0) {
                  explicitPolicyIndicator = true;
                  explicitPolicyStart = i;
                } else if (requireExplicitPolicy !== undefined) {
                  explicitPolicyPending = pendingConstraints[0] ? Math.min(explicitPolicyPending, requireExplicitPolicy) : requireExplicitPolicy;
                  pendingConstraints[0] = true;
                }
                //#endregion

                //#region inhibitPolicyMapping
                const inhibitPolicyMapping = policyConstraints.get(1);
                if (inhibitPolicyMapping === 0) policyMappingInhibitIndicator = true;
                else if (inhibitPolicyMapping !== undefined) {
                  policyMappingInhibitPending = pendingConstraints[1] ? Math.min(policyMappingInhibitPending, inhibitPolicyMapping + 1) : inhibitPolicyMapping + 1;
                  pendingConstraints[1] = true;
                }
                //#endregion
              }
            }
            //#endregion

            //#region InhibitAnyPolicy
            if (extension.extnID === id_InhibitAnyPolicy) {
              if (inhibitAnyPolicyIndicator === false) {
                const skipCerts = getUnsigned(extension.parsedValue as asn1js.Integer);
                if (skipCerts === 0) inhibitAnyPolicyIndicator = true;
                else if (skipCerts !== undefined) {
                  inhibitAnyPolicyPending = pendingConstraints[2] ? Math.min(inhibitAnyPolicyPending, skipCerts) : skipCerts;
                  pendingConstraints[2] = true;
                }
              }
            }
            //#endregion
          }
          //#endregion

          //#region Check "inhibitAnyPolicyIndicator"
          if (inhibitAnyPolicyIndicator === true) {
            let policyIndex = -1;

            //#region Find "anyPolicy" index
            for (let searchAnyPolicy = 0; searchAnyPolicy < allPolicies.length; searchAnyPolicy++) {
              if (allPolicies[searchAnyPolicy] === id_AnyPolicy) {
                policyIndex = searchAnyPolicy;
                break;
              }
            }
            //#endregion

            if (policyIndex !== -1) delete policiesAndCerts[0][i]; // Unset value to "undefined" for "anyPolicies" value for current certificate
          }
          //#endregion

          //#region Process with "pending constraints"
          if (explicitPolicyIndicator === false) {
            if (pendingConstraints[0] === true) {
              explicitPolicyPending--;
              if (explicitPolicyPending === 0) {
                explicitPolicyIndicator = true;
                explicitPolicyStart = i;

                pendingConstraints[0] = false;
              }
            }
          }

          if (policyMappingInhibitIndicator === false) {
            if (pendingConstraints[1] === true) {
              policyMappingInhibitPending--;
              if (policyMappingInhibitPending === 0) {
                policyMappingInhibitIndicator = true;
                pendingConstraints[1] = false;
              }
            }
          }

          if (inhibitAnyPolicyIndicator === false) {
            if (pendingConstraints[2] === true) {
              inhibitAnyPolicyPending--;
              if (inhibitAnyPolicyPending === 0) {
                inhibitAnyPolicyIndicator = true;
                pendingConstraints[2] = false;
              }
            }
          }
          //#endregion
        }
      }
      //#endregion

      //#region Working with policy mappings
      for (let i = 0; i < this.certs.length - 1; i++) {
        //#region Check that there is "policy mapping" for level "i + 1"
        if (i < this.certs.length - 2 && typeof policyMappings[i + 1] !== "undefined") {
          for (let k = 0; k < policyMappings[i + 1].mappings.length; k++) {
            //#region Check that we do not have "anyPolicy" in current mapping
            if (policyMappings[i + 1].mappings[k].issuerDomainPolicy === id_AnyPolicy || policyMappings[i + 1].mappings[k].subjectDomainPolicy === id_AnyPolicy) {
              return {
                result: false,
                resultCode: 99,
                resultMessage: 'The "anyPolicy" should not be a part of policy mapping scheme',
              };
            }
            //#endregion

            //#region Initial variables
            let issuerDomainPolicyIndex = -1;
            let subjectDomainPolicyIndex = -1;
            //#endregion

            //#region Search for index of policies indexes
            for (let n = 0; n < allPolicies.length; n++) {
              if (allPolicies[n] === policyMappings[i + 1].mappings[k].issuerDomainPolicy) issuerDomainPolicyIndex = n;

              if (allPolicies[n] === policyMappings[i + 1].mappings[k].subjectDomainPolicy) subjectDomainPolicyIndex = n;
            }
            //#endregion

            //#region Delete existing "issuerDomainPolicy" because on the level we mapped the policy to another one
            if (typeof policiesAndCerts[issuerDomainPolicyIndex][i] !== "undefined") delete policiesAndCerts[issuerDomainPolicyIndex][i];
            //#endregion

            //#region Check all policies for the certificate
            for (let j = 0; j < certPolicies[i].certificatePolicies.length; j++) {
              if (policyMappings[i + 1].mappings[k].subjectDomainPolicy === certPolicies[i].certificatePolicies[j].policyIdentifier) {
                //#region Set mapped policy for current certificate
                if (issuerDomainPolicyIndex !== -1 && subjectDomainPolicyIndex !== -1) {
                  for (let m = 0; m <= i; m++) {
                    if (typeof policiesAndCerts[subjectDomainPolicyIndex][m] !== "undefined") {
                      policiesAndCerts[issuerDomainPolicyIndex][m] = true;
                      delete policiesAndCerts[subjectDomainPolicyIndex][m];
                    }
                  }
                }
                //#endregion
              }
            }
            //#endregion
          }
        }
        //#endregion
      }
      //#endregion

      //#region Working with "explicitPolicyIndicator" and "anyPolicy"
      for (let i = 0; i < allPolicies.length; i++) {
        if (allPolicies[i] === id_AnyPolicy) {
          for (let j = 0; j < explicitPolicyStart; j++) delete policiesAndCerts[i][j];
        }
      }
      //#endregion

      //#region Create "set of authorities-constrained policies"
      const authConstrPolicies = [];

      for (let i = 0; i < policiesAndCerts.length; i++) {
        let found = true;

        for (let j = 0; j < this.certs.length - 1; j++) {
          let anyPolicyFound = false;

          if (j < explicitPolicyStart && allPolicies[i] === id_AnyPolicy && allPolicies.length > 1) {
            found = false;
            break;
          }

          if (typeof policiesAndCerts[i][j] === "undefined") {
            if (j >= explicitPolicyStart) {
              //#region Search for "anyPolicy" in the policy set
              for (let k = 0; k < allPolicies.length; k++) {
                if (allPolicies[k] === id_AnyPolicy) {
                  if (policiesAndCerts[k][j] === true) anyPolicyFound = true;

                  break;
                }
              }
              //#endregion
            }

            if (!anyPolicyFound) {
              found = false;
              break;
            }
          }
        }

        if (found === true) authConstrPolicies.push(allPolicies[i]);
      }
      //#endregion

      //#region Create "set of user-constrained policies"
      let userConstrPolicies: string[] = [];

      if (initialPolicySet.length === 1 && initialPolicySet[0] === id_AnyPolicy && explicitPolicyIndicator === false) userConstrPolicies = initialPolicySet;
      else {
        if (authConstrPolicies.length === 1 && authConstrPolicies[0] === id_AnyPolicy) userConstrPolicies = initialPolicySet;
        else {
          for (let i = 0; i < authConstrPolicies.length; i++) {
            for (let j = 0; j < initialPolicySet.length; j++) {
              if (initialPolicySet[j] === authConstrPolicies[i] || initialPolicySet[j] === id_AnyPolicy) {
                userConstrPolicies.push(authConstrPolicies[i]);
                break;
              }
            }
          }
        }
      }

      //#endregion

      //#region Combine output object
      const policyResult: CertificateChainValidationEngineVerifyResult = {
        result: userConstrPolicies.length > 0,
        resultCode: 0,
        resultMessage: userConstrPolicies.length > 0 ? EMPTY_STRING : 'Zero "userConstrPolicies" array, no intersections with "authConstrPolicies"',
        authConstrPolicies,
        userConstrPolicies,
        explicitPolicyIndicator,
        policyMappings,
        certificatePath: this.certs,
      };

      if (userConstrPolicies.length === 0) return policyResult;
      //#endregion
      //#endregion

      //#region Work with name constraints
      //#region Check a result from "policy checking" part
      if (policyResult.result === false) return policyResult;
      //#endregion

      //#region Check all certificates, excluding "trust anchor"
      pathDepth = 1;

      for (let i = this.certs.length - 2; i >= 0; i--, pathDepth++) {
        const cert = this.certs[i];
        //#region Support variables
        let subjectAltNames: GeneralName[] = [];

        let certPermittedSubtrees: GeneralSubtree[] = [];
        let certExcludedSubtrees: GeneralSubtree[] = [];
        //#endregion

        if (cert.extensions) {
          for (let j = 0; j < cert.extensions.length; j++) {
            const extension = cert.extensions[j];
            //#region NameConstraints
            if (extension.extnID === id_NameConstraints) {
              if ("permittedSubtrees" in extension.parsedValue) certPermittedSubtrees = certPermittedSubtrees.concat(extension.parsedValue.permittedSubtrees);

              if ("excludedSubtrees" in extension.parsedValue) certExcludedSubtrees = certExcludedSubtrees.concat(extension.parsedValue.excludedSubtrees);
            }
            //#endregion

            //#region SubjectAltName
            if (extension.extnID === id_SubjectAltName) subjectAltNames = subjectAltNames.concat(extension.parsedValue.altNames);
            //#endregion
          }
        }

        //#region Checking for "required name forms"
        let formFound = requiredNameForms.length <= 0;

        for (let j = 0; j < requiredNameForms.length; j++) {
          switch (requiredNameForms[j].base.type) {
            case 4: // directoryName
              {
                if (requiredNameForms[j].base.value.typesAndValues.length !== cert.subject.typesAndValues.length) continue;

                formFound = true;

                for (let k = 0; k < cert.subject.typesAndValues.length; k++) {
                  if (cert.subject.typesAndValues[k].type !== requiredNameForms[j].base.value.typesAndValues[k].type) {
                    formFound = false;
                    break;
                  }
                }

                if (formFound === true) break;
              }
              break;
            default: // ??? Probably here we should reject the certificate ???
          }
        }

        if (formFound === false) {
          policyResult.result = false;
          policyResult.resultCode = 21;
          policyResult.resultMessage = "No necessary name form found";

          throw policyResult;
        }
        //#endregion

        //#region Checking for "permited sub-trees"
        //#region Make groups for all types of constraints
        const constrGroups: GeneralSubtree[][] = [
          // Array of array for groupped constraints
          [], // rfc822Name
          [], // dNSName
          [], // directoryName
          [], // uniformResourceIdentifier
          [], // iPAddress
        ];

        for (let j = 0; j < permittedSubtrees.length; j++) {
          switch (permittedSubtrees[j].base.type) {
            //#region rfc822Name
            case 1:
              constrGroups[0].push(permittedSubtrees[j]);
              break;
            //#endregion
            //#region dNSName
            case 2:
              constrGroups[1].push(permittedSubtrees[j]);
              break;
            //#endregion
            //#region directoryName
            case 4:
              constrGroups[2].push(permittedSubtrees[j]);
              break;
            //#endregion
            //#region uniformResourceIdentifier
            case 6:
              constrGroups[3].push(permittedSubtrees[j]);
              break;
            //#endregion
            //#region iPAddress
            case 7:
              constrGroups[4].push(permittedSubtrees[j]);
              break;
            //#endregion
            //#region default
            default:
            //#endregion
          }
        }
        //#endregion

        //#region Check name constraints groupped by type, one-by-one
        for (let p = 0; p < 5; p++) {
          let groupPermitted = false;
          let valueExists = false;
          const group = constrGroups[p];

          for (let j = 0; j < group.length; j++) {
            switch (p) {
              //#region rfc822Name
              case 0:
                if (subjectAltNames.length > 0) {
                  for (let k = 0; k < subjectAltNames.length; k++) {
                    if (subjectAltNames[k].type === 1) // rfc822Name
                    {
                      valueExists = true;
                      groupPermitted = groupPermitted || compareRFC822Name(subjectAltNames[k].value, group[j].base.value);
                    }
                  }
                } else // Try to find out "emailAddress" inside "subject"
                {
                  for (let k = 0; k < cert.subject.typesAndValues.length; k++) {
                    if (
                      cert.subject.typesAndValues[k].type === "1.2.840.113549.1.9.1" || // PKCS#9 e-mail address
                      cert.subject.typesAndValues[k].type === "0.9.2342.19200300.100.1.3"
                    ) // RFC1274 "rfc822Mailbox" e-mail address
                    {
                      valueExists = true;
                      groupPermitted = groupPermitted || compareRFC822Name(cert.subject.typesAndValues[k].value.valueBlock.value, group[j].base.value);
                    }
                  }
                }
                break;
              //#endregion
              //#region dNSName
              case 1:
                if (subjectAltNames.length > 0) {
                  for (let k = 0; k < subjectAltNames.length; k++) {
                    if (subjectAltNames[k].type === 2) // dNSName
                    {
                      valueExists = true;
                      groupPermitted = groupPermitted || compareDNSName(subjectAltNames[k].value, group[j].base.value);
                    }
                  }
                }
                break;
              //#endregion
              //#region directoryName
              case 2:
                valueExists = true;
                groupPermitted = compareDirectoryName(cert.subject, group[j].base.value);
                break;
              //#endregion
              //#region uniformResourceIdentifier
              case 3:
                if (subjectAltNames.length > 0) {
                  for (let k = 0; k < subjectAltNames.length; k++) {
                    if (subjectAltNames[k].type === 6) // uniformResourceIdentifier
                    {
                      valueExists = true;
                      groupPermitted = groupPermitted || compareUniformResourceIdentifier(subjectAltNames[k].value, group[j].base.value);
                    }
                  }
                }
                break;
              //#endregion
              //#region iPAddress
              case 4:
                if (subjectAltNames.length > 0) {
                  for (let k = 0; k < subjectAltNames.length; k++) {
                    if (subjectAltNames[k].type === 7) // iPAddress
                    {
                      valueExists = true;
                      groupPermitted = groupPermitted || compareIPAddress(subjectAltNames[k].value, group[j].base.value);
                    }
                  }
                }
                break;
              //#endregion
              //#region default
              default:
              //#endregion
            }

            if (groupPermitted) break;
          }

          if (groupPermitted === false && group.length > 0 && valueExists) {
            policyResult.result = false;
            policyResult.resultCode = 41;
            policyResult.resultMessage = 'Failed to meet "permitted sub-trees" name constraint';

            throw policyResult;
          }
        }
        //#endregion
        //#endregion

        //#region Checking for "excluded sub-trees"
        let excluded = false;

        for (let j = 0; j < excludedSubtrees.length; j++) {
          switch (excludedSubtrees[j].base.type) {
            //#region rfc822Name
            case 1:
              if (subjectAltNames.length >= 0) {
                for (let k = 0; k < subjectAltNames.length; k++) {
                  if (subjectAltNames[k].type === 1)
                    // rfc822Name
                    excluded = excluded || compareRFC822Name(subjectAltNames[k].value, excludedSubtrees[j].base.value);
                }
              } else // Try to find out "emailAddress" inside "subject"
              {
                for (let k = 0; k < cert.subject.typesAndValues.length; k++) {
                  if (
                    cert.subject.typesAndValues[k].type === "1.2.840.113549.1.9.1" || // PKCS#9 e-mail address
                    cert.subject.typesAndValues[k].type === "0.9.2342.19200300.100.1.3"
                  )
                    // RFC1274 "rfc822Mailbox" e-mail address
                    excluded = excluded || compareRFC822Name(cert.subject.typesAndValues[k].value.valueBlock.value, excludedSubtrees[j].base.value);
                }
              }
              break;
            //#endregion
            //#region dNSName
            case 2:
              if (subjectAltNames.length > 0) {
                for (let k = 0; k < subjectAltNames.length; k++) {
                  if (subjectAltNames[k].type === 2)
                    // dNSName
                    excluded = excluded || compareDNSName(subjectAltNames[k].value, excludedSubtrees[j].base.value);
                }
              }
              break;
            //#endregion
            //#region directoryName
            case 4:
              excluded = excluded || compareDirectoryName(cert.subject, excludedSubtrees[j].base.value);
              break;
            //#endregion
            //#region uniformResourceIdentifier
            case 6:
              if (subjectAltNames.length > 0) {
                for (let k = 0; k < subjectAltNames.length; k++) {
                  if (subjectAltNames[k].type === 6)
                    // uniformResourceIdentifier
                    excluded = excluded || compareUniformResourceIdentifier(subjectAltNames[k].value, excludedSubtrees[j].base.value);
                }
              }
              break;
            //#endregion
            //#region iPAddress
            case 7:
              if (subjectAltNames.length > 0) {
                for (let k = 0; k < subjectAltNames.length; k++) {
                  if (subjectAltNames[k].type === 7)
                    // iPAddress
                    excluded = excluded || compareIPAddress(subjectAltNames[k].value, excludedSubtrees[j].base.value);
                }
              }
              break;
            //#endregion
            //#region default
            default: // No action, but probably here we need to create a warning for "malformed constraint"
            //#endregion
          }

          if (excluded) break;
        }

        if (excluded === true) {
          policyResult.result = false;
          policyResult.resultCode = 42;
          policyResult.resultMessage = 'Failed to meet "excluded sub-trees" name constraint';

          throw policyResult;
        }
        //#endregion

        //#region Append "cert_..._subtrees" to "..._subtrees"
        permittedSubtrees = permittedSubtrees.concat(certPermittedSubtrees);
        excludedSubtrees = excludedSubtrees.concat(certExcludedSubtrees);
        //#endregion
      }
      //#endregion

      return policyResult;
      //#endregion
    } catch (error) {
      if (error instanceof Error) {
        if (error instanceof ChainValidationError) {
          return {
            result: false,
            resultCode: error.code,
            resultMessage: error.message,
            error: error,
          };
        }

        return {
          result: false,
          resultCode: ChainValidationCode.unknown,
          resultMessage: error.message,
          error: error,
        };
      }

      if (error && typeof error === "object" && "resultMessage" in error) {
        return error as CertificateChainValidationEngineVerifyResult;
      }

      return {
        result: false,
        resultCode: -1,
        resultMessage: `${error}`,
      };
    }
  }
}
