import * as asn1js from "asn1js";
import { bytes } from "@peculiar/utils";
import * as common from "./common";
import { OriginatorInfo, type OriginatorInfoJson } from "./OriginatorInfo";
import { RecipientInfo, type RecipientInfoJson } from "./RecipientInfo";
import { EncryptedContentInfo, type EncryptedContentInfoJson, type EncryptedContentInfoSchema, type EncryptedContentInfoSplit } from "./EncryptedContentInfo";
import { Attribute, type AttributeJson } from "./Attribute";
import { AlgorithmIdentifier } from "./AlgorithmIdentifier";
import { EnvelopedData, type EnvelopedDataDecryptParams } from "./EnvelopedData";
import { sortDerSetOf } from "./Helpers";
import { id_ContentType_Data } from "./ObjectIdentifiers";
import type * as Schema from "./Schema";
import type { Certificate } from "./Certificate";
import { AsnError } from "./errors";
import { PkiObject, type PkiObjectParameters } from "./PkiObject";
import { EMPTY_BUFFER, EMPTY_STRING } from "./constants";

const VERSION = "version";
const ORIGINATOR_INFO = "originatorInfo";
const RECIPIENT_INFOS = "recipientInfos";
const AUTH_ENCRYPTED_CONTENT_INFO = "authEncryptedContentInfo";
const AUTH_ATTRS = "authAttrs";
const MAC = "mac";
const UNAUTH_ATTRS = "unauthAttrs";
const CLEAR_PROPS = [VERSION, ORIGINATOR_INFO, RECIPIENT_INFOS, AUTH_ENCRYPTED_CONTENT_INFO, AUTH_ATTRS, MAC, UNAUTH_ATTRS];

/**
 * Default `aes-ICVlen` of GCMParameters, in octets (RFC 5084, 3.2)
 */
const DEFAULT_ICV_LENGTH = 12;
const ICV_LENGTHS = new Set([12, 13, 14, 15, 16]);

export interface IAuthEnvelopedData {
  /**
   * Version number. MUST be 0 (RFC 5083, 2.1).
   */
  version: number;
  /**
   * Optionally provides information about the originator. It is present only if required by the key management algorithm.
   * It may contain certificates and CRLs.
   */
  originatorInfo?: OriginatorInfo;
  /**
   * Collection of per-recipient information. There MUST be at least one element in the collection.
   */
  recipientInfos: RecipientInfo[];
  /**
   * Encrypted content information
   */
  authEncryptedContentInfo: EncryptedContentInfo;
  /**
   * Collection of attributes that are authenticated but not encrypted
   */
  authAttrs?: Attribute[];
  /**
   * Message authentication code (the AES-GCM authentication tag)
   */
  mac: asn1js.OctetString;
  /**
   * Collection of attributes that are neither authenticated nor encrypted
   */
  unauthAttrs?: Attribute[];
}

/**
 * JSON representation of {@link AuthEnvelopedData}
 */
export interface AuthEnvelopedDataJson {
  version: number;
  originatorInfo?: OriginatorInfoJson;
  recipientInfos: RecipientInfoJson[];
  authEncryptedContentInfo: EncryptedContentInfoJson;
  authAttrs?: AttributeJson[];
  mac: asn1js.OctetStringJson;
  unauthAttrs?: AttributeJson[];
}

export type AuthEnvelopedDataParameters = PkiObjectParameters & Partial<IAuthEnvelopedData> & EncryptedContentInfoSplit;

/**
 * Content-encryption algorithm for {@link AuthEnvelopedData.encrypt}
 */
export interface AuthEnvelopedDataEncryptAlgorithm extends AesKeyGenParams {
  /**
   * Length of the authentication tag in bits. Defaults to 128.
   */
  tagLength?: number;
}

/**
 * Represents the AuthEnvelopedData structure described in [RFC5083](https://datatracker.ietf.org/doc/html/rfc5083),
 * with AES-GCM as described in [RFC5084](https://datatracker.ietf.org/doc/html/rfc5084)
 *
 * Recipients are added and handled the same way as in {@link EnvelopedData}.
 *
 * @example The following example demonstrates how to create and encrypt CMS Authenticated-Enveloped Data
 * ```js
 * const cmsAuthEnveloped = new pkijs.AuthEnvelopedData();
 *
 * // Add recipient
 * cmsAuthEnveloped.addRecipientByCertificate(cert, { oaepHashAlgorithm: "SHA-256" });
 *
 * await cmsAuthEnveloped.encrypt({ name: "AES-GCM", length: 256 }, dataToEncrypt);
 *
 * // Add Authenticated-Enveloped Data into CMS Content Info
 * const cmsContent = new pkijs.ContentInfo();
 * cmsContent.contentType = pkijs.ContentInfo.AUTH_ENVELOPED_DATA;
 * cmsContent.content = cmsAuthEnveloped.toSchema();
 *
 * const cmsContentRaw = cmsContent.toSchema().toBER();
 * ```
 *
 * @example The following example demonstrates how to decrypt CMS Authenticated-Enveloped Data
 * ```js
 * const cmsContent = pkijs.ContentInfo.fromBER(cmsContentRaw);
 * if (cmsContent.contentType !== pkijs.ContentInfo.AUTH_ENVELOPED_DATA) {
 *   throw new Error("CMS is not Authenticated-Enveloped Data");
 * }
 * const cmsAuthEnveloped = new pkijs.AuthEnvelopedData({ schema: cmsContent.content });
 *
 * const decryptedData = await cmsAuthEnveloped.decrypt(0, {
 *   recipientCertificate: cert,
 *   recipientPrivateKey: pkcs8,
 * });
 * ```
 */
export class AuthEnvelopedData extends PkiObject implements IAuthEnvelopedData {
  public static override CLASS_NAME = "AuthEnvelopedData";

  public version!: number;
  public originatorInfo?: OriginatorInfo;
  public recipientInfos!: RecipientInfo[];
  public authEncryptedContentInfo!: EncryptedContentInfo;
  public authAttrs?: Attribute[];
  public mac!: asn1js.OctetString;
  public unauthAttrs?: Attribute[];

  public policy: Required<EncryptedContentInfoSplit>;

  /**
   * Received encoding of `authAttrs` with the SET OF tag, which is the AAD of a parsed structure
   */
  private authAttrsEncoding?: ArrayBuffer;

  /**
   * Encoding of the parsed `authAttrs` as they are re-encoded, used to detect changes made after parsing
   */
  private parsedAuthAttrsEncoding?: ArrayBuffer;

  /**
   * Initializes a new instance of the {@link AuthEnvelopedData} class
   * @param parameters Initialization parameters
   */
  constructor(parameters: AuthEnvelopedDataParameters = {}) {
    super();

    this.version = parameters[VERSION] ?? AuthEnvelopedData.defaultValues(VERSION);
    if (ORIGINATOR_INFO in parameters) {
      this.originatorInfo = parameters[ORIGINATOR_INFO] ?? AuthEnvelopedData.defaultValues(ORIGINATOR_INFO);
    }
    this.recipientInfos = parameters[RECIPIENT_INFOS] ?? AuthEnvelopedData.defaultValues(RECIPIENT_INFOS);
    this.authEncryptedContentInfo = parameters[AUTH_ENCRYPTED_CONTENT_INFO] ?? AuthEnvelopedData.defaultValues(AUTH_ENCRYPTED_CONTENT_INFO);
    if (AUTH_ATTRS in parameters) {
      this.authAttrs = parameters[AUTH_ATTRS] ?? AuthEnvelopedData.defaultValues(AUTH_ATTRS);
    }
    this.mac = parameters[MAC] ?? AuthEnvelopedData.defaultValues(MAC);
    if (UNAUTH_ATTRS in parameters) {
      this.unauthAttrs = parameters[UNAUTH_ATTRS] ?? AuthEnvelopedData.defaultValues(UNAUTH_ATTRS);
    }
    this.policy = {
      disableSplit: !!parameters.disableSplit,
    };

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
  public static override defaultValues(memberName: typeof ORIGINATOR_INFO): OriginatorInfo;
  public static override defaultValues(memberName: typeof RECIPIENT_INFOS): RecipientInfo[];
  public static override defaultValues(memberName: typeof AUTH_ENCRYPTED_CONTENT_INFO): EncryptedContentInfo;
  public static override defaultValues(memberName: typeof AUTH_ATTRS): Attribute[];
  public static override defaultValues(memberName: typeof MAC): asn1js.OctetString;
  public static override defaultValues(memberName: typeof UNAUTH_ATTRS): Attribute[];
  public static override defaultValues(memberName: string): any {
    switch (memberName) {
      case VERSION:
        return 0;
      case ORIGINATOR_INFO:
        return new OriginatorInfo();
      case RECIPIENT_INFOS:
        return [];
      case AUTH_ENCRYPTED_CONTENT_INFO:
        return new EncryptedContentInfo();
      case AUTH_ATTRS:
      case UNAUTH_ATTRS:
        return [];
      case MAC:
        return new asn1js.OctetString();
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
        return memberValue === AuthEnvelopedData.defaultValues(memberName);
      case ORIGINATOR_INFO:
        return memberValue.certs.certificates.length === 0 && memberValue.crls.crls.length === 0;
      case RECIPIENT_INFOS:
      case AUTH_ATTRS:
      case UNAUTH_ATTRS:
        return memberValue.length === 0;
      case AUTH_ENCRYPTED_CONTENT_INFO:
        return (
          EncryptedContentInfo.compareWithDefault("contentType", memberValue.contentType) &&
          EncryptedContentInfo.compareWithDefault("contentEncryptionAlgorithm", memberValue.contentEncryptionAlgorithm) &&
          EncryptedContentInfo.compareWithDefault("encryptedContent", memberValue.encryptedContent)
        );
      case MAC:
        return memberValue.isEqual(AuthEnvelopedData.defaultValues(memberName));
      default:
        return super.defaultValues(memberName);
    }
  }

  /**
   * @inheritdoc
   * @asn ASN.1 schema
   * ```asn
   * AuthEnvelopedData ::= SEQUENCE {
   *    version CMSVersion,
   *    originatorInfo [0] IMPLICIT OriginatorInfo OPTIONAL,
   *    recipientInfos RecipientInfos,
   *    authEncryptedContentInfo EncryptedContentInfo,
   *    authAttrs [1] IMPLICIT AuthAttributes OPTIONAL,
   *    mac MessageAuthenticationCode,
   *    unauthAttrs [2] IMPLICIT UnauthAttributes OPTIONAL }
   *```
   */
  public static override schema(
    parameters: Schema.SchemaParameters<{
      version?: string;
      originatorInfo?: string;
      recipientInfos?: string;
      authEncryptedContentInfo?: EncryptedContentInfoSchema;
      authAttrs?: string;
      mac?: string;
      unauthAttrs?: string;
    }> = {},
  ): Schema.SchemaType {
    const names = parameters.names ?? {};

    return new asn1js.Sequence({
      name: names.blockName || EMPTY_STRING,
      value: [
        new asn1js.Integer({ name: names.version || EMPTY_STRING }),
        new asn1js.Constructed({
          name: names.originatorInfo || EMPTY_STRING,
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0, // [0]
          },
          value: OriginatorInfo.schema().valueBlock.value,
        }),
        new asn1js.Set({
          value: [
            new asn1js.Repeated({
              name: names.recipientInfos || EMPTY_STRING,
              value: RecipientInfo.schema(),
            }),
          ],
        }),
        EncryptedContentInfo.schema(names.authEncryptedContentInfo || {}),
        new asn1js.Constructed({
          name: names.authAttrs || EMPTY_STRING,
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1, // [1]
          },
          value: [
            new asn1js.Repeated({
              value: Attribute.schema(),
            }),
          ],
        }),
        new asn1js.OctetString({ name: names.mac || EMPTY_STRING }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 2, // [2]
          },
          value: [
            new asn1js.Repeated({
              name: names.unauthAttrs || EMPTY_STRING,
              value: Attribute.schema(),
            }),
          ],
        }),
      ],
    });
  }

  public fromSchema(schema: Schema.SchemaType): void {
    // Clear input data first
    for (const prop of CLEAR_PROPS) delete schema[prop];

    // Check the schema is valid
    const asn1 = asn1js.compareSchema(
      schema,
      schema,
      AuthEnvelopedData.schema({
        names: {
          version: VERSION,
          originatorInfo: ORIGINATOR_INFO,
          recipientInfos: RECIPIENT_INFOS,
          authEncryptedContentInfo: {
            names: {
              blockName: AUTH_ENCRYPTED_CONTENT_INFO,
            },
          },
          authAttrs: AUTH_ATTRS,
          mac: MAC,
          unauthAttrs: UNAUTH_ATTRS,
        },
      }),
    );
    AsnError.assertSchema(asn1, this.className);

    // Get internal properties from parsed schema
    this.version = asn1.result.version.valueBlock.valueDec;

    if (ORIGINATOR_INFO in asn1.result) {
      this.originatorInfo = new OriginatorInfo({
        schema: new asn1js.Sequence({
          value: asn1.result.originatorInfo.valueBlock.value,
        }),
      });
    }

    this.recipientInfos = Array.from(asn1.result.recipientInfos, (o) => new RecipientInfo({ schema: o }));
    this.authEncryptedContentInfo = new EncryptedContentInfo({
      schema: asn1.result.authEncryptedContentInfo,
    });

    if (AUTH_ATTRS in asn1.result) {
      const authAttrs: asn1js.Constructed = asn1.result.authAttrs;
      this.authAttrs = Array.from(authAttrs.valueBlock.value, (o) => new Attribute({ schema: o }));

      // RFC 5083, 2.1: the AAD is the received encoding with the IMPLICIT [1] tag replaced by the SET OF tag
      const encoding = authAttrs.valueBeforeDecodeView.byteLength ? new Uint8Array(authAttrs.valueBeforeDecodeView) : new Uint8Array(authAttrs.toBER(false));
      encoding[0] = 0x31;
      this.authAttrsEncoding = encoding.buffer;
      this.parsedAuthAttrsEncoding = this.encodeAuthAttrs();
    }

    this.mac = asn1.result.mac;

    if (UNAUTH_ATTRS in asn1.result) this.unauthAttrs = Array.from(asn1.result.unauthAttrs, (o) => new Attribute({ schema: o }));
  }

  public toSchema(): asn1js.Sequence {
    //#region Create array for output sequence
    const outputArray = [];

    outputArray.push(new asn1js.Integer({ value: this.version }));

    if (this.originatorInfo) {
      outputArray.push(
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0, // [0]
          },
          value: this.originatorInfo.toSchema().valueBlock.value,
        }),
      );
    }

    outputArray.push(
      new asn1js.Set({
        value: Array.from(this.recipientInfos, (o) => o.toSchema()),
      }),
    );

    outputArray.push(this.authEncryptedContentInfo.toSchema());

    if (this.authAttrs) {
      outputArray.push(
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 1, // [1]
          },
          value: this.getAuthAttrsValues(),
        }),
      );
    }

    outputArray.push(this.mac);

    if (this.unauthAttrs) {
      outputArray.push(
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 2, // [2]
          },
          value: Array.from(this.unauthAttrs, (o) => o.toSchema()),
        }),
      );
    }
    //#endregion

    //#region Construct and return new ASN.1 schema for this object
    return new asn1js.Sequence({
      value: outputArray,
    });
    //#endregion
  }

  public toJSON(): AuthEnvelopedDataJson {
    const res: AuthEnvelopedDataJson = {
      version: this.version,
      recipientInfos: Array.from(this.recipientInfos, (o) => o.toJSON()),
      authEncryptedContentInfo: this.authEncryptedContentInfo.toJSON(),
      mac: this.mac.toJSON(),
    };

    if (this.originatorInfo) res.originatorInfo = this.originatorInfo.toJSON();

    if (this.authAttrs) res.authAttrs = Array.from(this.authAttrs, (o) => o.toJSON());

    if (this.unauthAttrs) res.unauthAttrs = Array.from(this.unauthAttrs, (o) => o.toJSON());

    return res;
  }

  /**
   * Adds a recipient based on the recipient's certificate. See {@link EnvelopedData.addRecipientByCertificate}.
   * @param certificate Recipient's certificate
   * @param parameters Additional parameters necessary for "fine tunning" of encryption process
   * @param variant Variant = 1 is for "key transport", variant = 2 is for "key agreement"
   * @param crypto Crypto engine
   */
  public addRecipientByCertificate(certificate: Certificate, parameters?: object, variant?: number, crypto = common.getCrypto(true)): boolean {
    return this.getRecipients().addRecipientByCertificate(certificate, parameters, variant, crypto);
  }

  /**
   * Adds a recipient based on pre-defined data like password or KEK. See {@link EnvelopedData.addRecipientByPreDefinedData}.
   * @param preDefinedData ArrayBuffer with pre-defined data
   * @param parameters Additional parameters necessary for "fine tunning" of encryption process
   * @param variant Variant = 1 for pre-defined "key encryption key" (KEK). Variant = 2 for password-based encryption.
   * @param crypto Crypto engine
   */
  public addRecipientByPreDefinedData(preDefinedData: ArrayBuffer, parameters: Parameters<EnvelopedData["addRecipientByPreDefinedData"]>[1], variant: number, crypto = common.getCrypto(true)): void {
    this.getRecipients().addRecipientByPreDefinedData(preDefinedData, parameters, variant, crypto);
  }

  /**
   * Adds a recipient using a KeyAgreeRecipientInfo of type RecipientKeyIdentifier. See {@link EnvelopedData.addRecipientByKeyIdentifier}.
   * @param key Recipient's public key
   * @param keyId The id for the recipient's public key
   * @param parameters Additional parameters for "fine tuning" the encryption process
   * @param crypto Crypto engine
   */
  public addRecipientByKeyIdentifier(key?: CryptoKey, keyId?: ArrayBuffer, parameters?: any, crypto = common.getCrypto(true)): void {
    this.getRecipients().addRecipientByKeyIdentifier(key, keyId, parameters, crypto);
  }

  /**
   * Encrypts the content with AES-GCM and the content-encryption key for every recipient
   *
   * If `authAttrs` is set, it is authenticated as the additional authenticated data.
   * @param contentEncryptionAlgorithm WebCrypto algorithm. Only "AES-GCM" is supported.
   * @param contentToEncrypt Content to encrypt
   * @param crypto Crypto engine
   */
  public async encrypt(
    contentEncryptionAlgorithm: AuthEnvelopedDataEncryptAlgorithm,
    contentToEncrypt: ArrayBuffer,
    crypto = common.getCrypto(true),
  ): Promise<(void | { ecdhPrivateKey: CryptoKey })[]> {
    if (contentEncryptionAlgorithm.name !== "AES-GCM") {
      throw new Error(`Unsupported content encryption algorithm for AuthEnvelopedData: ${contentEncryptionAlgorithm.name}`);
    }
    const tagLength = contentEncryptionAlgorithm.tagLength ?? 128;
    const icvLength = tagLength / 8;
    if (!ICV_LENGTHS.has(icvLength)) {
      throw new Error(`Unsupported AES-GCM tag length: ${tagLength}`);
    }

    const contentEncryptionOID = crypto.getOIDByAlgorithm(contentEncryptionAlgorithm, true, "contentEncryptionAlgorithm");

    // RFC 5084, 3.2: the recommended nonce size is 12 octets
    const nonce = crypto.getRandomValues(new Uint8Array(12));

    const sessionKey = await crypto.generateKey({ name: contentEncryptionAlgorithm.name, length: contentEncryptionAlgorithm.length }, true, ["encrypt"]);

    // Encode authAttrs afresh, in DER order, rather than reusing a received encoding
    this.authAttrsEncoding = undefined;
    this.parsedAuthAttrsEncoding = undefined;

    // WebCrypto appends the tag to the ciphertext; CMS carries it in "mac"
    const encrypted = new Uint8Array(
      await crypto.encrypt(
        {
          name: "AES-GCM",
          iv: nonce,
          tagLength,
          additionalData: this.getAuthAttrsAad(),
        },
        sessionKey,
        new Uint8Array(contentToEncrypt),
      ),
    );
    const ciphertextLength = encrypted.length - icvLength;

    // GCMParameters ::= SEQUENCE { aes-nonce OCTET STRING, aes-ICVlen AES-GCM-ICVlen DEFAULT 12 }
    const gcmParameters = new asn1js.Sequence({
      value: [new asn1js.OctetString({ valueHex: nonce })],
    });
    if (icvLength !== DEFAULT_ICV_LENGTH) {
      gcmParameters.valueBlock.value.push(new asn1js.Integer({ value: icvLength }));
    }

    this.version = 0;
    this.authEncryptedContentInfo = new EncryptedContentInfo({
      disableSplit: this.policy.disableSplit,
      contentType: id_ContentType_Data,
      contentEncryptionAlgorithm: new AlgorithmIdentifier({
        algorithmId: contentEncryptionOID,
        algorithmParams: gcmParameters,
      }),
      encryptedContent: new asn1js.OctetString({ valueHex: encrypted.slice(0, ciphertextLength) }),
    });
    this.mac = new asn1js.OctetString({ valueHex: encrypted.slice(ciphertextLength) });

    return this.getRecipients().wrapContentEncryptionKey(sessionKey, crypto);
  }

  /**
   * Decrypts the content and checks its authentication tag
   * @param recipientIndex Index of recipient
   * @param parameters Additional parameters
   * @param crypto Crypto engine
   */
  public async decrypt(recipientIndex: number, parameters: EnvelopedDataDecryptParams, crypto = common.getCrypto(true)): Promise<ArrayBuffer> {
    const algorithm = this.authEncryptedContentInfo.contentEncryptionAlgorithm;
    const contentEncryptionAlgorithm = crypto.getAlgorithmByOID<Algorithm>(algorithm.algorithmId, true, "contentEncryptionAlgorithm");
    if (contentEncryptionAlgorithm.name !== "AES-GCM") {
      throw new Error(`Unsupported content encryption algorithm for AuthEnvelopedData: ${algorithm.algorithmId}`);
    }

    //#region Parse GCMParameters
    const gcmParameters = algorithm.algorithmParams;
    if (!(gcmParameters instanceof asn1js.Sequence)) {
      throw new Error("Incorrectly encoded GCMParameters");
    }
    const [nonce, icvLen] = gcmParameters.valueBlock.value;
    if (!(nonce instanceof asn1js.OctetString) || (icvLen !== undefined && !(icvLen instanceof asn1js.Integer))) {
      throw new Error("Incorrectly encoded GCMParameters");
    }
    const icvLength = icvLen ? icvLen.valueBlock.valueDec : DEFAULT_ICV_LENGTH;
    if (!ICV_LENGTHS.has(icvLength)) {
      throw new Error(`Unsupported AES-GCM ICV length: ${icvLength}`);
    }
    //#endregion

    const mac = this.mac.valueBlock.valueHexView;
    if (mac.length !== icvLength) {
      throw new Error(`The MAC length ${mac.length} does not match the AES-GCM ICV length ${icvLength}`);
    }

    const sessionKey = await this.getRecipients().unwrapContentEncryptionKey(recipientIndex, parameters, crypto);

    const ciphertext = new Uint8Array(this.authEncryptedContentInfo.getEncryptedContent());
    const data = new Uint8Array(ciphertext.length + mac.length);
    data.set(ciphertext);
    data.set(mac, ciphertext.length);

    return crypto.decrypt(
      {
        name: "AES-GCM",
        iv: nonce.valueBlock.valueHexView as BufferSource,
        tagLength: icvLength * 8,
        additionalData: this.getAuthAttrsAad(),
      },
      sessionKey,
      data,
    );
  }

  /**
   * Returns an {@link EnvelopedData} that shares this object's recipients, for the recipient handling it implements
   */
  private getRecipients(): EnvelopedData {
    return new EnvelopedData({
      recipientInfos: this.recipientInfos,
      encryptedContentInfo: this.authEncryptedContentInfo,
    });
  }

  /**
   * Returns the elements of `authAttrs`. Their encoding is authenticated, so new attributes are DER-encoded:
   * the attributes and the values of each attribute are put in DER order. Parsed attributes keep their received order.
   */
  private getAuthAttrsValues(): asn1js.AsnType[] {
    const authAttrs = this.authAttrs ?? [];
    if (this.authAttrsEncoding) return authAttrs.map((o) => o.toSchema());

    return sortDerSetOf(authAttrs.map((o) => new Attribute({ type: o.type, values: sortDerSetOf(o.values) }).toSchema()));
  }

  /**
   * Returns the encoding of `authAttrs` with the SET OF tag
   */
  private encodeAuthAttrs(): ArrayBuffer {
    return new asn1js.Set({ value: this.getAuthAttrsValues() }).toBER(false);
  }

  /**
   * Returns the additional authenticated data: the DER encoding of `authAttrs` as a SET OF, or nothing (RFC 5083, 2.1)
   */
  private getAuthAttrsAad(): ArrayBuffer {
    if (this.authAttrsEncoding) {
      // The received encoding is what the sender authenticated, so it only vouches for the attributes as they were parsed
      if (!this.authAttrs || !bytes.equal(this.encodeAuthAttrs(), this.parsedAuthAttrsEncoding!)) {
        throw new Error("authAttrs have changed since they were parsed. Call encrypt() to authenticate the new attributes.");
      }
      return this.authAttrsEncoding;
    }
    if (!this.authAttrs) return EMPTY_BUFFER;

    return this.encodeAuthAttrs();
  }
}
