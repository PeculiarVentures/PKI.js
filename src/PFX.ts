import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as common from "./common";
import ContentInfo, { ContentInfoSchema } from "./ContentInfo";
import MacData, { MacDataSchema } from "./MacData";
import DigestInfo from "./DigestInfo";
import AlgorithmIdentifier from "./AlgorithmIdentifier";
import SignedData from "./SignedData";
import EncapsulatedContentInfo from "./EncapsulatedContentInfo";
import Attribute from "./Attribute";
import SignerInfo from "./SignerInfo";
import IssuerAndSerialNumber from "./IssuerAndSerialNumber";
import SignedAndUnsignedAttributes from "./SignedAndUnsignedAttributes";
import AuthenticatedSafe from "./AuthenticatedSafe";
import * as Schema from "./Schema";
import Certificate from "./Certificate";

const VERSION = "version";
const AUTH_SAFE = "authSafe";
const MAC_DATA = "macData";
const PARSED_VALUE = "parsedValue";
const CLERA_PROPS = [
  VERSION,
  AUTH_SAFE,
  MAC_DATA
];

export interface PFXParameters extends Schema.SchemaConstructor {
  version?: number;
  authSafe?: ContentInfo;
  macData?: MacData;
  parsedValue?: PFXParsedValue;
}

export interface PFXParsedValue {
  authenticatedSafe?: AuthenticatedSafe;
  integrityMode?: number;
}

type MakeInternalValuesParams =
  {
    // empty
  }
  |
  {
    iterations: number;
    pbkdf2HashAlgorithm: Algorithm;
    hmacHashAlgorithm: string;
    password: ArrayBuffer;
  }
  |
  {
    signingCertificate: Certificate;
    privateKey: CryptoKey;
    hashAlgorithm: string;
  };

/**
 * Class from RFC7292
 */
export default class PFX implements Schema.SchemaCompatible {

  public version: number;
  public authSafe: ContentInfo;
  public macData?: MacData;
  public parsedValue?: PFXParsedValue;

  /**
   * Constructor for PFX class
   * @param parameters
   */
  constructor(parameters: PFXParameters = {}) {
    //#region Internal properties of the object
    this.version = pvutils.getParametersValue(parameters, VERSION, PFX.defaultValues(VERSION));
    this.authSafe = pvutils.getParametersValue(parameters, AUTH_SAFE, PFX.defaultValues(AUTH_SAFE));
    if (parameters.macData) {
      this.macData = pvutils.getParametersValue(parameters, MAC_DATA, PFX.defaultValues(MAC_DATA));
    }
    if (parameters.parsedValue) {
      this.parsedValue = pvutils.getParametersValue(parameters, PARSED_VALUE, PFX.defaultValues(PARSED_VALUE));
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
  public static defaultValues(memberName: typeof VERSION): number;
  public static defaultValues(memberName: typeof AUTH_SAFE): ContentInfo;
  public static defaultValues(memberName: typeof MAC_DATA): MacData;
  public static defaultValues(memberName: typeof PARSED_VALUE): PFXParsedValue;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case VERSION:
        return 3;
      case AUTH_SAFE:
        return (new ContentInfo());
      case MAC_DATA:
        return (new MacData());
      case PARSED_VALUE:
        return {};
      default:
        throw new Error(`Invalid member name for PFX class: ${memberName}`);
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
        return (memberValue === PFX.defaultValues(memberName));
      case AUTH_SAFE:
        return ((ContentInfo.compareWithDefault("contentType", memberValue.contentType)) &&
          (ContentInfo.compareWithDefault("content", memberValue.content)));
      case MAC_DATA:
        return ((MacData.compareWithDefault("mac", memberValue.mac)) &&
          (MacData.compareWithDefault("macSalt", memberValue.macSalt)) &&
          (MacData.compareWithDefault("iterations", memberValue.iterations)));
      case PARSED_VALUE:
        return ((memberValue instanceof Object) && (Object.keys(memberValue).length === 0));
      default:
        throw new Error(`Invalid member name for PFX class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * PFX ::= SEQUENCE {
   *    version		INTEGER {v3(3)}(v3,...),
   *    authSafe	ContentInfo,
   *    macData    	MacData OPTIONAL
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    version?: string;
    authSafe?: ContentInfoSchema;
    macData?: MacDataSchema;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Integer({ name: (names.version || VERSION) }),
        ContentInfo.schema(names.authSafe || {
          names: {
            blockName: AUTH_SAFE
          }
        }),
        MacData.schema(names.macData || {
          names: {
            blockName: MAC_DATA,
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
    pvutils.clearProps(schema, CLERA_PROPS);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      PFX.schema({
        names: {
          version: VERSION,
          authSafe: {
            names: {
              blockName: AUTH_SAFE
            }
          },
          macData: {
            names: {
              blockName: MAC_DATA
            }
          }
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for PFX");
    //#endregion

    //#region Get internal properties from parsed schema
    this.version = asn1.result.version.valueBlock.valueDec;
    this.authSafe = new ContentInfo({ schema: asn1.result.authSafe });

    if (MAC_DATA in asn1.result)
      this.macData = new MacData({ schema: asn1.result.macData });
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Construct and return new ASN.1 schema for this object
    const outputArray = [
      new asn1js.Integer({ value: this.version }),
      this.authSafe.toSchema()
    ];

    if (this.macData) {
      outputArray.push(this.macData.toSchema());
    }

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
    const output: any = {
      version: this.version,
      authSafe: this.authSafe.toJSON()
    };

    if (this.macData) {
      output.macData = this.macData.toJSON();
    }

    return output;
  }

  /**
   * Making ContentInfo from PARSED_VALUE object
   * @param parameters Parameters, specific to each "integrity mode"
   */
  public async makeInternalValues(parameters: MakeInternalValuesParams = {}) {
    //#region Check mandatory parameter
    if ((parameters instanceof Object) === false)
      throw new Error("The \"parameters\" must has \"Object\" type");

    if (!this.parsedValue)
      throw new Error("Please call \"parseValues\" function first in order to make \"parsedValue\" data");

    if (("integrityMode" in this.parsedValue) === false)
      throw new Error("Absent mandatory parameter \"integrityMode\" inside \"parsedValue\"");
    //#endregion

    //#region Get a "crypto" extension
    const crypto = common.getCrypto(true);
    //#endregion

    //#region Makes values for each particular integrity mode
    //#region Check that we do have necessary fields in PARSED_VALUE object
    if (!this.parsedValue.authenticatedSafe)
      throw new Error("Absent mandatory parameter \"authenticatedSafe\" in \"parsedValue\"");
    //#endregion

    switch (this.parsedValue.integrityMode) {
      //#region HMAC-based integrity
      case 0:
        {
          //#region Check additional mandatory parameters
          if (!("iterations" in parameters))
            throw new Error("Absent mandatory parameter \"iterations\"");

          if (!parameters.pbkdf2HashAlgorithm)
            throw new Error("Absent mandatory parameter \"pbkdf2HashAlgorithm\"");

          if (!parameters.hmacHashAlgorithm)
            throw new Error("Absent mandatory parameter \"hmacHashAlgorithm\"");

          if (!parameters.password)
            throw new Error("Absent mandatory parameter \"password\"");
          //#endregion

          //#region Initial variables
          const saltBuffer = new ArrayBuffer(64);
          const saltView = new Uint8Array(saltBuffer);

          common.getRandomValues(saltView);

          const data = this.parsedValue.authenticatedSafe.toSchema().toBER(false);

          this.authSafe = new ContentInfo({
            contentType: ContentInfo.DATA,
            content: new asn1js.OctetString({ valueHex: data })
          });
          //#endregion

          //#region Call current crypto engine for making HMAC-based data stamp
          const engine = common.getEngine();

          if (!engine.subtle.stampDataWithPassword) {
            throw new Error(`No support for "stampDataWithPassword" in current engine "${engine.name}"`);
          }


          const result = await engine.subtle.stampDataWithPassword({
            password: parameters.password,
            hashAlgorithm: parameters.hmacHashAlgorithm,
            salt: saltBuffer,
            iterationCount: parameters.iterations,
            contentToStamp: data
          });
          //#endregion

          //#region Make MAC_DATA values
          this.macData = new MacData({
            mac: new DigestInfo({
              digestAlgorithm: new AlgorithmIdentifier({
                algorithmId: common.getOIDByAlgorithm({ name: parameters.hmacHashAlgorithm })
              }),
              digest: new asn1js.OctetString({ valueHex: result })
            }),
            macSalt: new asn1js.OctetString({ valueHex: saltBuffer }),
            iterations: parameters.iterations
          });
          //#endregion
          //#endregion
        }
        break;
      //#endregion
      //#region publicKey-based integrity
      case 1:
        {
          //#region Check additional mandatory parameters
          if (!("signingCertificate" in parameters))
            throw new Error("Absent mandatory parameter \"signingCertificate\"");

          if (!parameters.privateKey)
            throw new Error("Absent mandatory parameter \"privateKey\"");

          if (!parameters.hashAlgorithm)
            throw new Error("Absent mandatory parameter \"hashAlgorithm\"");
          //#endregion

          //#region Making data to be signed
          // NOTE: all internal data for "authenticatedSafe" must be already prepared.
          // Thus user must call "makeValues" for all internal "SafeContent" value with appropriate parameters.
          // Or user can choose to use values from initial parsing of existing PKCS#12 data.

          const toBeSigned = this.parsedValue.authenticatedSafe.toSchema().toBER(false);
          //#endregion

          //#region Initial variables
          const cmsSigned = new SignedData({
            version: 1,
            encapContentInfo: new EncapsulatedContentInfo({
              eContentType: "1.2.840.113549.1.7.1", // "data" content type
              eContent: new asn1js.OctetString({ valueHex: toBeSigned })
            }),
            certificates: [parameters.signingCertificate]
          });
          //#endregion

          //#region Making additional attributes for CMS Signed Data
          //#region Create a message digest
          const result = await crypto.digest({ name: parameters.hashAlgorithm }, new Uint8Array(toBeSigned));
          //#endregion

          //#region Combine all signed extensions
          //#region Initial variables
          const signedAttr: Attribute[] = [];
          //#endregion

          //#region contentType
          signedAttr.push(new Attribute({
            type: "1.2.840.113549.1.9.3",
            values: [
              new asn1js.ObjectIdentifier({ value: "1.2.840.113549.1.7.1" })
            ]
          }));
          //#endregion
          //#region signingTime
          signedAttr.push(new Attribute({
            type: "1.2.840.113549.1.9.5",
            values: [
              new asn1js.UTCTime({ valueDate: new Date() })
            ]
          }));
          //#endregion
          //#region messageDigest
          signedAttr.push(new Attribute({
            type: "1.2.840.113549.1.9.4",
            values: [
              new asn1js.OctetString({ valueHex: result })
            ]
          }));
          //#endregion

          //#region Making final value for "SignerInfo" type
          cmsSigned.signerInfos.push(new SignerInfo({
            version: 1,
            sid: new IssuerAndSerialNumber({
              issuer: parameters.signingCertificate.issuer,
              serialNumber: parameters.signingCertificate.serialNumber
            }),
            signedAttrs: new SignedAndUnsignedAttributes({
              type: 0,
              attributes: signedAttr
            })
          }));
          //#endregion
          //#endregion
          //#endregion

          //#region Signing CMS Signed Data
          await cmsSigned.sign(parameters.privateKey, 0, parameters.hashAlgorithm);
          //#endregion

          //#region Making final CMS_CONTENT_INFO type
          this.authSafe = new ContentInfo({
            contentType: "1.2.840.113549.1.7.2",
            content: cmsSigned.toSchema(true)
          });
          //#endregion
        }
        break;
      //#endregion
      //#region default
      default:
        throw new Error(`Parameter "integrityMode" has unknown value: ${this.parsedValue.integrityMode}`);
      //#endregion
    }
    //#endregion
  }

  public async parseInternalValues(parameters: {
    checkIntegrity?: boolean;
    password?: ArrayBuffer;
  }) {
    //#region Check input data from "parameters"
    if ((parameters instanceof Object) === false)
      throw new Error("The \"parameters\" must has \"Object\" type");

    if (parameters.checkIntegrity === undefined)
      parameters.checkIntegrity = true;
    //#endregion

    //#region Create value for "this.parsedValue.authenticatedSafe" and check integrity
    this.parsedValue = {};

    switch (this.authSafe.contentType) {
      //#region data
      case ContentInfo.DATA:
        {
          //#region Check additional mandatory parameters
          if (!parameters.password) {
            throw new Error("Absent mandatory parameter \"password\"");
          }
          //#endregion

          //#region Integrity based on HMAC
          this.parsedValue.integrityMode = 0;
          //#endregion

          //#region Check that we do have OCTETSTRING as "content"
          if (!(this.authSafe.content instanceof asn1js.OctetString)) {
            throw new Error("Wrong type of \"this.authSafe.content\"");
          }
          //#endregion

          //#region Check we have "constructive encoding" for AuthSafe content
          let authSafeContent = new ArrayBuffer(0);

          if (this.authSafe.content.valueBlock.isConstructed) {
            for (const contentValue of this.authSafe.content.valueBlock.value)
              authSafeContent = pvutils.utilConcatBuf(authSafeContent, contentValue.valueBlock.valueHex);
          }
          else {
            authSafeContent = this.authSafe.content.valueBlock.valueHex;
          }
          //#endregion

          //#region Parse internal ASN.1 data
          const asn1 = asn1js.fromBER(authSafeContent);
          if (asn1.offset === (-1)) {
            throw new Error("Error during parsing of ASN.1 data inside \"this.authSafe.content\"");
          }
          //#endregion

          //#region Set "authenticatedSafe" value
          this.parsedValue.authenticatedSafe = new AuthenticatedSafe({ schema: asn1.result });
          //#endregion

          //#region Check integrity
          if (parameters.checkIntegrity) {
            //#region Check that MAC_DATA exists
            if (!this.macData) {
              throw new Error("Absent \"macData\" value, can not check PKCS#12 data integrity");
            }
            //#endregion

            //#region Initial variables
            const hashAlgorithm = common.getAlgorithmByOID(this.macData.mac.digestAlgorithm.algorithmId);
            if (!("name" in hashAlgorithm)) {
              throw new Error(`Unsupported digest algorithm: ${this.macData.mac.digestAlgorithm.algorithmId}`);
            }
            //#endregion

            //#region Call current crypto engine for verifying HMAC-based data stamp
            const engine = common.getEngine();
            const result = await engine.subtle.verifyDataStampedWithPassword({
              password: parameters.password,
              hashAlgorithm: hashAlgorithm.name,
              salt: this.macData.macSalt.valueBlock.valueHex,
              iterationCount: this.macData.iterations || 0,
              contentToVerify: authSafeContent,
              signatureToVerify: this.macData.mac.digest.valueBlock.valueHex
            });
            //#endregion

            //#region Verify HMAC signature
            if (!result) {
              throw new Error("Integrity for the PKCS#12 data is broken!");
            }
            //#endregion
          }
          //#endregion
        }
        break;
      //#endregion
      //#region signedData
      case ContentInfo.SIGNED_DATA:
        {
          //#region Integrity based on signature using public key
          this.parsedValue.integrityMode = 1;
          //#endregion

          //#region Parse CMS Signed Data
          const cmsSigned = new SignedData({ schema: this.authSafe.content });
          //#endregion

          //#region Check that we do have OCTET STRING as "content"
          const eContent = cmsSigned.encapContentInfo.eContent;
          if (!eContent)
            throw new Error("Absent of attached data in \"cmsSigned.encapContentInfo\"");

          if ((eContent instanceof asn1js.OctetString) === false)
            throw new Error("Wrong type of \"eContent\"");
          //#endregion

          //#region Create correct data block for verification
          let data = new ArrayBuffer(0);

          if (eContent.idBlock.isConstructed === false)
            data = eContent.valueBlock.valueHex;
          else {
            for (let i = 0; i < eContent.valueBlock.value.length; i++)
              data = pvutils.utilConcatBuf(data, eContent.valueBlock.value[i].valueBlock.valueHex);
          }
          //#endregion

          //#region Parse internal ASN.1 data
          const asn1 = asn1js.fromBER(data);
          if (asn1.offset === (-1)) {
            throw new Error("Error during parsing of ASN.1 data inside \"this.authSafe.content\"");
          }
          //#endregion

          //#region Set "authenticatedSafe" value
          this.parsedValue.authenticatedSafe = new AuthenticatedSafe({ schema: asn1.result });
          //#endregion

          //#region Check integrity

          const ok = await cmsSigned.verify({ signer: 0, checkChain: false });
          if (!ok) {
            throw new Error("Integrity for the PKCS#12 data is broken!");
          }
          //#endregion
        }
        break;
      //#endregion
      //#region default
      default:
        throw new Error(`Incorrect value for "this.authSafe.contentType": ${this.authSafe.contentType}`);
      //#endregion
    }
    //#endregion
  }

}
