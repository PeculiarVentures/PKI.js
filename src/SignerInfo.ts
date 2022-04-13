import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { AlgorithmIdentifier, AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import { SignedAndUnsignedAttributes, SignedAndUnsignedAttributesSchema } from "./SignedAndUnsignedAttributes";
import { IssuerAndSerialNumber, IssuerAndSerialNumberSchema } from "./IssuerAndSerialNumber";
import * as Schema from "./Schema";

const VERSION = "version";
const SID = "sid";
const DIGEST_ALGORITHM = "digestAlgorithm";
const SIGNED_ATTRS = "signedAttrs";
const SIGNATURE_ALGORITHM = "signatureAlgorithm";
const SIGNATURE = "signature";
const UNSIGNED_ATTRS = "unsignedAttrs";
const SIGNER_INFO = "SignerInfo";
const SIGNER_INFO_VERSION = `${SIGNER_INFO}.${VERSION}`;
const SIGNER_INFO_SID = `${SIGNER_INFO}.${SID}`;
const SIGNER_INFO_DIGEST_ALGORITHM = `${SIGNER_INFO}.${DIGEST_ALGORITHM}`;
const SIGNER_INFO_SIGNED_ATTRS = `${SIGNER_INFO}.${SIGNED_ATTRS}`;
const SIGNER_INFO_SIGNATURE_ALGORITHM = `${SIGNER_INFO}.${SIGNATURE_ALGORITHM}`;
const SIGNER_INFO_SIGNATURE = `${SIGNER_INFO}.${SIGNATURE}`;
const SIGNER_INFO_UNSIGNED_ATTRS = `${SIGNER_INFO}.${UNSIGNED_ATTRS}`;
const CLEAR_PROPS = [
  SIGNER_INFO_VERSION,
  SIGNER_INFO_SID,
  SIGNER_INFO_DIGEST_ALGORITHM,
  SIGNER_INFO_SIGNED_ATTRS,
  SIGNER_INFO_SIGNATURE_ALGORITHM,
  SIGNER_INFO_SIGNATURE,
  SIGNER_INFO_UNSIGNED_ATTRS
];

export interface SignerInfoParameters extends Schema.SchemaConstructor {
  version?: number;
  sid?: Schema.SchemaType;
  digestAlgorithm?: AlgorithmIdentifier;
  signedAttrs?: SignedAndUnsignedAttributes;
  signatureAlgorithm?: AlgorithmIdentifier;
  signature?: asn1js.OctetString;
  unsignedAttrs?: SignedAndUnsignedAttributes;
}

/**
 * Class from RFC5652
 */
export class SignerInfo implements Schema.SchemaCompatible {

  public version: number;
  public sid: Schema.SchemaType;
  public digestAlgorithm: AlgorithmIdentifier;
  public signedAttrs?: SignedAndUnsignedAttributes;
  public signatureAlgorithm: AlgorithmIdentifier;
  public signature: asn1js.OctetString;
  public unsignedAttrs?: SignedAndUnsignedAttributes;

  /**
   * Constructor for SignerInfo class
   * @param parameters
   */
  constructor(parameters: SignerInfoParameters = {}) {
    //#region Internal properties of the object
    this.version = pvutils.getParametersValue(parameters, VERSION, SignerInfo.defaultValues(VERSION));
    this.sid = pvutils.getParametersValue(parameters, SID, SignerInfo.defaultValues(SID));
    this.digestAlgorithm = pvutils.getParametersValue(parameters, DIGEST_ALGORITHM, SignerInfo.defaultValues(DIGEST_ALGORITHM));
    if (parameters.signedAttrs) {
      this.signedAttrs = pvutils.getParametersValue(parameters, SIGNED_ATTRS, SignerInfo.defaultValues(SIGNED_ATTRS));
    }
    this.signatureAlgorithm = pvutils.getParametersValue(parameters, SIGNATURE_ALGORITHM, SignerInfo.defaultValues(SIGNATURE_ALGORITHM));
    this.signature = pvutils.getParametersValue(parameters, SIGNATURE, SignerInfo.defaultValues(SIGNATURE));
    if (parameters.unsignedAttrs) {
      this.unsignedAttrs = pvutils.getParametersValue(parameters, UNSIGNED_ATTRS, SignerInfo.defaultValues(UNSIGNED_ATTRS));
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
  public static defaultValues(memberName: typeof SID): Schema.SchemaType;
  public static defaultValues(memberName: typeof DIGEST_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof SIGNED_ATTRS): SignedAndUnsignedAttributes;
  public static defaultValues(memberName: typeof SIGNATURE_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof SIGNATURE): asn1js.OctetString;
  public static defaultValues(memberName: typeof UNSIGNED_ATTRS): SignedAndUnsignedAttributes;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case VERSION:
        return 0;
      case SID:
        return new asn1js.Any();
      case DIGEST_ALGORITHM:
        return new AlgorithmIdentifier();
      case SIGNED_ATTRS:
        return new SignedAndUnsignedAttributes({ type: 0 });
      case SIGNATURE_ALGORITHM:
        return new AlgorithmIdentifier();
      case SIGNATURE:
        return new asn1js.OctetString();
      case UNSIGNED_ATTRS:
        return new SignedAndUnsignedAttributes({ type: 1 });
      default:
        throw new Error(`Invalid member name for SignerInfo class: ${memberName}`);
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
        return (SignerInfo.defaultValues(VERSION) === memberValue);
      case SID:
        return (memberValue instanceof asn1js.Any);
      case DIGEST_ALGORITHM:
        if ((memberValue instanceof AlgorithmIdentifier) === false)
          return false;

        return memberValue.isEqual(SignerInfo.defaultValues(DIGEST_ALGORITHM));
      case SIGNED_ATTRS:
        return ((SignedAndUnsignedAttributes.compareWithDefault("type", memberValue.type))
          && (SignedAndUnsignedAttributes.compareWithDefault("attributes", memberValue.attributes))
          && (SignedAndUnsignedAttributes.compareWithDefault("encodedValue", memberValue.encodedValue)));
      case SIGNATURE_ALGORITHM:
        if ((memberValue instanceof AlgorithmIdentifier) === false)
          return false;

        return memberValue.isEqual(SignerInfo.defaultValues(SIGNATURE_ALGORITHM));
      case SIGNATURE:
      case UNSIGNED_ATTRS:
        return ((SignedAndUnsignedAttributes.compareWithDefault("type", memberValue.type))
          && (SignedAndUnsignedAttributes.compareWithDefault("attributes", memberValue.attributes))
          && (SignedAndUnsignedAttributes.compareWithDefault("encodedValue", memberValue.encodedValue)));
      default:
        throw new Error(`Invalid member name for SignerInfo class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * SignerInfo ::= SEQUENCE {
   *    version CMSVersion,
   *    sid SignerIdentifier,
   *    digestAlgorithm DigestAlgorithmIdentifier,
   *    signedAttrs [0] IMPLICIT SignedAttributes OPTIONAL,
   *    signatureAlgorithm SignatureAlgorithmIdentifier,
   *    signature SignatureValue,
   *    unsignedAttrs [1] IMPLICIT UnsignedAttributes OPTIONAL }
   *
   * SignerIdentifier ::= CHOICE {
   *    issuerAndSerialNumber IssuerAndSerialNumber,
   *    subjectKeyIdentifier [0] SubjectKeyIdentifier }
   *
   * SubjectKeyIdentifier ::= OCTET STRING
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    version?: string;
    sidSchema?: IssuerAndSerialNumberSchema;
    sid?: string;
    digestAlgorithm?: AlgorithmIdentifierSchema;
    signedAttrs?: SignedAndUnsignedAttributesSchema;
    signatureAlgorithm?: AlgorithmIdentifierSchema;
    signature?: string;
    unsignedAttrs?: SignedAndUnsignedAttributesSchema;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (
      new asn1js.Sequence({
        name: SIGNER_INFO,
        value: [
          new asn1js.Integer({ name: (names.version || SIGNER_INFO_VERSION) }),
          new asn1js.Choice({
            value: [
              IssuerAndSerialNumber.schema(names.sidSchema || {
                names: {
                  blockName: SIGNER_INFO_SID
                }
              }),
              new asn1js.Choice({
                value: [
                  new asn1js.Constructed({
                    optional: true,
                    name: (names.sid || SIGNER_INFO_SID),
                    idBlock: {
                      tagClass: 3, // CONTEXT-SPECIFIC
                      tagNumber: 0 // [0]
                    },
                    value: [new asn1js.OctetString()]
                  }),
                  new asn1js.Primitive({
                    optional: true,
                    name: (names.sid || SIGNER_INFO_SID),
                    idBlock: {
                      tagClass: 3, // CONTEXT-SPECIFIC
                      tagNumber: 0 // [0]
                    },
                    value: [new asn1js.OctetString()],
                  }),
                ]
              }),
            ]
          }),
          AlgorithmIdentifier.schema(names.digestAlgorithm || {
            names: {
              blockName: SIGNER_INFO_DIGEST_ALGORITHM
            }
          }),
          SignedAndUnsignedAttributes.schema(names.signedAttrs || {
            names: {
              blockName: SIGNER_INFO_SIGNED_ATTRS,
              tagNumber: 0
            }
          }),
          AlgorithmIdentifier.schema(names.signatureAlgorithm || {
            names: {
              blockName: SIGNER_INFO_SIGNATURE_ALGORITHM
            }
          }),
          new asn1js.OctetString({ name: (names.signature || SIGNER_INFO_SIGNATURE) }),
          SignedAndUnsignedAttributes.schema(names.unsignedAttrs || {
            names: {
              blockName: SIGNER_INFO_UNSIGNED_ATTRS,
              tagNumber: 1
            }
          })
        ]
      })
    );
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
      SignerInfo.schema()
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for SignerInfo");
    //#endregion

    //#region Get internal properties from parsed schema
    this.version = asn1.result[SIGNER_INFO_VERSION].valueBlock.valueDec;

    const currentSid = asn1.result[SIGNER_INFO_SID];
    if (currentSid.idBlock.tagClass === 1)
      this.sid = new IssuerAndSerialNumber({ schema: currentSid });
    else
      this.sid = currentSid;

    this.digestAlgorithm = new AlgorithmIdentifier({ schema: asn1.result[SIGNER_INFO_DIGEST_ALGORITHM] });
    if (SIGNER_INFO_SIGNED_ATTRS in asn1.result)
      this.signedAttrs = new SignedAndUnsignedAttributes({ type: 0, schema: asn1.result[SIGNER_INFO_SIGNED_ATTRS] });

    this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result[SIGNER_INFO_SIGNATURE_ALGORITHM] });
    this.signature = asn1.result[SIGNER_INFO_SIGNATURE];
    if (SIGNER_INFO_UNSIGNED_ATTRS in asn1.result)
      this.unsignedAttrs = new SignedAndUnsignedAttributes({ type: 1, schema: asn1.result[SIGNER_INFO_UNSIGNED_ATTRS] });
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    if (SignerInfo.compareWithDefault(SID, this.sid))
      throw new Error("Incorrectly initialized \"SignerInfo\" class");

    //#region Create array for output sequence
    const outputArray = [];

    outputArray.push(new asn1js.Integer({ value: this.version }));

    if (this.sid instanceof IssuerAndSerialNumber)
      outputArray.push(this.sid.toSchema());
    else
      outputArray.push(this.sid);

    outputArray.push(this.digestAlgorithm.toSchema());

    if (this.signedAttrs) {
      if (SignerInfo.compareWithDefault(SIGNED_ATTRS, this.signedAttrs) === false)
        outputArray.push(this.signedAttrs.toSchema());
    }

    outputArray.push(this.signatureAlgorithm.toSchema());
    outputArray.push(this.signature);

    if (this.unsignedAttrs) {
      if (SignerInfo.compareWithDefault(UNSIGNED_ATTRS, this.unsignedAttrs) === false)
        outputArray.push(this.unsignedAttrs.toSchema());
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
    if (SignerInfo.compareWithDefault(SID, this.sid)) {
      throw new Error("Incorrectly initialized \"SignerInfo\" class");
    }

    const _object: any = {
      version: this.version
    };

    if (!(this.sid instanceof asn1js.Any))
      _object.sid = this.sid.toJSON();

    _object.digestAlgorithm = this.digestAlgorithm.toJSON();

    if (this.signedAttrs && SignerInfo.compareWithDefault(SIGNED_ATTRS, this.signedAttrs) === false) {
      _object.signedAttrs = this.signedAttrs.toJSON();
    }

    _object.signatureAlgorithm = this.signatureAlgorithm.toJSON();
    _object.signature = this.signature.toJSON();

    if (this.unsignedAttrs && SignerInfo.compareWithDefault(UNSIGNED_ATTRS, this.unsignedAttrs) === false) {
      _object.unsignedAttrs = this.unsignedAttrs.toJSON();
    }

    return _object;
  }

}
