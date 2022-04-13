import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { GeneralNames } from "../GeneralNames";
import { AlgorithmIdentifier, AlgorithmIdentifierSchema } from "../AlgorithmIdentifier";
import { Attribute } from "../Attribute";
import { Extensions, ExtensionsSchema } from "../Extensions";
import { AttCertValidityPeriod, AttCertValidityPeriodSchema } from "./AttCertValidityPeriod";
import { IssuerSerial } from "./IssuerSerial";
import * as Schema from "../Schema";

const VERSION = "version";
const BASE_CERTIFICATE_ID = "baseCertificateID";
const SUBJECT_NAME = "subjectName";
const ISSUER = "issuer";
const SIGNATURE = "signature";
const SERIAL_NUMBER = "serialNumber";
const ATTR_CERT_VALIDITY_PERIOD = "attrCertValidityPeriod";
const ATTRIBUTES = "attributes";
const ISSUER_UNIQUE_ID = "issuerUniqueID";
const EXTENSIONS = "extensions";
const CLEAR_PROPS = [
  VERSION,
  BASE_CERTIFICATE_ID,
  SUBJECT_NAME,
  ISSUER,
  SIGNATURE,
  SERIAL_NUMBER,
  ATTR_CERT_VALIDITY_PERIOD,
  ATTRIBUTES,
  ISSUER_UNIQUE_ID,
  EXTENSIONS,
];

export interface AttributeCertificateInfoV1Parameters extends Schema.SchemaConstructor {
  version?: number;
  baseCertificateID?: IssuerSerial;
  subjectName?: GeneralNames;
  issuer?: GeneralNames;
  signature?: AlgorithmIdentifier;
  serialNumber?: asn1js.Integer;
  attrCertValidityPeriod?: AttCertValidityPeriod;
  attributes?: Attribute[];
  issuerUniqueID?: asn1js.BitString;
  extensions?: Extensions;
}

export type AttributeCertificateInfoV1Schema = Schema.SchemaParameters<{
  version?: string;
  baseCertificateID?: string;
  subjectName?: string;
  signature?: AlgorithmIdentifierSchema;
  issuer?: string;
  attrCertValidityPeriod?: AttCertValidityPeriodSchema;
  serialNumber?: string;
  attributes?: string;
  issuerUniqueID?: string;
  extensions?: ExtensionsSchema;
}>;

/**
 * Class from RFC5755
 */
export class AttributeCertificateInfoV1 {
  version: number;
  baseCertificateID?: IssuerSerial;
  subjectName?: GeneralNames;
  issuer: GeneralNames;
  signature: AlgorithmIdentifier;
  serialNumber: asn1js.Integer;
  attrCertValidityPeriod: AttCertValidityPeriod;
  attributes: Attribute[];
  issuerUniqueID?: asn1js.BitString;
  extensions?: Extensions;

  /**
   * Constructor for AttributeCertificateInfoV1 class
   * @param parameters
   */
  constructor(parameters: AttributeCertificateInfoV1Parameters = {}) {
    //#region Internal properties of the object
    this.version = pvutils.getParametersValue(parameters, VERSION, AttributeCertificateInfoV1.defaultValues(VERSION));
    if (parameters.baseCertificateID) {
      this.baseCertificateID = pvutils.getParametersValue(parameters, BASE_CERTIFICATE_ID, AttributeCertificateInfoV1.defaultValues(BASE_CERTIFICATE_ID));
    }
    if (parameters.subjectName) {
      this.subjectName = pvutils.getParametersValue(parameters, SUBJECT_NAME, AttributeCertificateInfoV1.defaultValues(SUBJECT_NAME));
    }
    this.issuer = pvutils.getParametersValue(parameters, ISSUER, AttributeCertificateInfoV1.defaultValues(ISSUER));
    this.signature = pvutils.getParametersValue(parameters, SIGNATURE, AttributeCertificateInfoV1.defaultValues(SIGNATURE));
    this.serialNumber = pvutils.getParametersValue(parameters, SERIAL_NUMBER, AttributeCertificateInfoV1.defaultValues(SERIAL_NUMBER));
    this.attrCertValidityPeriod = pvutils.getParametersValue(parameters, ATTR_CERT_VALIDITY_PERIOD, AttributeCertificateInfoV1.defaultValues(ATTR_CERT_VALIDITY_PERIOD));
    this.attributes = pvutils.getParametersValue(parameters, ATTRIBUTES, AttributeCertificateInfoV1.defaultValues(ATTRIBUTES));
    if (parameters.issuerUniqueID)
      this.issuerUniqueID = pvutils.getParametersValue(parameters, ISSUER_UNIQUE_ID, AttributeCertificateInfoV1.defaultValues(ISSUER_UNIQUE_ID));

    if (parameters.extensions) {
      this.extensions = pvutils.getParametersValue(parameters, EXTENSIONS, AttributeCertificateInfoV1.defaultValues(EXTENSIONS));
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
  public static defaultValues(memberName: typeof BASE_CERTIFICATE_ID): IssuerSerial;
  public static defaultValues(memberName: typeof SUBJECT_NAME): GeneralNames;
  public static defaultValues(memberName: typeof ISSUER): GeneralNames;
  public static defaultValues(memberName: typeof SIGNATURE): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof SERIAL_NUMBER): asn1js.Integer;
  public static defaultValues(memberName: typeof ATTR_CERT_VALIDITY_PERIOD): AttCertValidityPeriod;
  public static defaultValues(memberName: typeof ATTRIBUTES): Attribute[];
  public static defaultValues(memberName: typeof ISSUER_UNIQUE_ID): asn1js.BitString;
  public static defaultValues(memberName: typeof EXTENSIONS): Extensions;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case VERSION:
        return 0;
      case BASE_CERTIFICATE_ID:
        return new IssuerSerial();
      case SUBJECT_NAME:
        return new GeneralNames();
      case ISSUER:
        return new GeneralNames();
      case SIGNATURE:
        return new AlgorithmIdentifier();
      case SERIAL_NUMBER:
        return new asn1js.Integer();
      case ATTR_CERT_VALIDITY_PERIOD:
        return new AttCertValidityPeriod();
      case ATTRIBUTES:
        return [];
      case ISSUER_UNIQUE_ID:
        return new asn1js.BitString();
      case EXTENSIONS:
        return new Extensions();
      default:
        throw new Error(`Invalid member name for AttributeCertificateInfoV1 class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * AttributeCertificateInfo ::= SEQUENCE {
   * 	version Version DEFAULT v1,
   * 	subject CHOICE {
   * 		baseCertificateID [0] IssuerSerial, -- associated with a Public Key Certificate
   * 		subjectName [1] GeneralNames }, -- associated with a name
   * 	issuer GeneralNames, -- CA issuing the attribute certificate
   * 	signature AlgorithmIdentifier,
   * 	serialNumber CertificateSerialNumber,
   * 	attrCertValidityPeriod AttCertValidityPeriod,
   * 	attributes SEQUENCE OF Attribute,
   * 	issuerUniqueID UniqueIdentifier OPTIONAL,
   * 	extensions Extensions OPTIONAL
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: AttributeCertificateInfoV1Schema = {}): Schema.SchemaType {
    /**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [issuer]
     * @property {string} [serialNumber]
     */
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Integer({ name: (names.version || "") }),
        new asn1js.Choice({
          value: [
            new asn1js.Constructed({
              name: (names.baseCertificateID || ""),
              idBlock: {
                tagClass: 3,
                tagNumber: 0 // [0]
              },
              value: IssuerSerial.schema().valueBlock.value
            }),
            new asn1js.Constructed({
              name: (names.subjectName || ""),
              idBlock: {
                tagClass: 3,
                tagNumber: 1 // [2]
              },
              value: GeneralNames.schema().valueBlock.value
            }),
          ]
        }),
        GeneralNames.schema({
          names: {
            blockName: (names.issuer || "")
          }
        }),
        AlgorithmIdentifier.schema(names.signature || {}),
        new asn1js.Integer({ name: (names.serialNumber || "") }),
        AttCertValidityPeriod.schema(names.attrCertValidityPeriod || {}),
        new asn1js.Sequence({
          name: (names.attributes || ""),
          value: [
            new asn1js.Repeated({
              value: Attribute.schema()
            })
          ]
        }),
        new asn1js.BitString({
          optional: true,
          name: (names.issuerUniqueID || "")
        }),
        Extensions.schema(names.extensions || {}, true)
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
      AttributeCertificateInfoV1.schema({
        names: {
          version: VERSION,
          baseCertificateID: BASE_CERTIFICATE_ID,
          subjectName: SUBJECT_NAME,
          issuer: ISSUER,
          signature: {
            names: {
              blockName: SIGNATURE
            }
          },
          serialNumber: SERIAL_NUMBER,
          attrCertValidityPeriod: {
            names: {
              blockName: ATTR_CERT_VALIDITY_PERIOD
            }
          },
          attributes: ATTRIBUTES,
          issuerUniqueID: ISSUER_UNIQUE_ID,
          extensions: {
            names: {
              blockName: EXTENSIONS
            }
          }
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for AttributeCertificateInfoV1");
    //#endregion
    //#region Get internal properties from parsed schema
    this.version = asn1.result.version.valueBlock.valueDec;

    if (BASE_CERTIFICATE_ID in asn1.result) {
      this.baseCertificateID = new IssuerSerial({
        schema: new asn1js.Sequence({
          value: asn1.result.baseCertificateID.valueBlock.value
        })
      });
    }

    if (SUBJECT_NAME in asn1.result) {
      this.subjectName = new GeneralNames({
        schema: new asn1js.Sequence({
          value: asn1.result.subjectName.valueBlock.value
        })
      });
    }

    this.issuer = asn1.result.issuer;
    this.signature = new AlgorithmIdentifier({ schema: asn1.result.signature });
    this.serialNumber = asn1.result.serialNumber;
    this.attrCertValidityPeriod = new AttCertValidityPeriod({ schema: asn1.result.attrCertValidityPeriod });
    this.attributes = Array.from(asn1.result.attributes.valueBlock.value, element => new Attribute({ schema: element }));

    if (ISSUER_UNIQUE_ID in asn1.result)
      this.issuerUniqueID = asn1.result.issuerUniqueID;

    if (EXTENSIONS in asn1.result)
      this.extensions = new Extensions({ schema: asn1.result.extensions });
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    const result = new asn1js.Sequence({
      value: [new asn1js.Integer({ value: this.version })]
    });

    if (this.baseCertificateID) {
      result.valueBlock.value.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3,
          tagNumber: 0 // [0]
        },
        value: this.baseCertificateID.toSchema().valueBlock.value
      }));
    }

    if (this.subjectName) {
      result.valueBlock.value.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3,
          tagNumber: 1 // [1]
        },
        value: this.subjectName.toSchema().valueBlock.value
      }));
    }

    result.valueBlock.value.push(this.issuer.toSchema());
    result.valueBlock.value.push(this.signature.toSchema());
    result.valueBlock.value.push(this.serialNumber);
    result.valueBlock.value.push(this.attrCertValidityPeriod.toSchema());
    result.valueBlock.value.push(new asn1js.Sequence({
      value: Array.from(this.attributes, element => element.toSchema())
    }));

    if (this.issuerUniqueID) {
      result.valueBlock.value.push(this.issuerUniqueID);
    }

    if (this.extensions) {
      result.valueBlock.value.push(this.extensions.toSchema());
    }

    return result;
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    const result: any = {
      version: this.version
    };

    if (this.baseCertificateID) {
      result.baseCertificateID = this.baseCertificateID.toJSON();
    }

    if (this.subjectName) {
      result.subjectName = this.subjectName.toJSON();
    }

    result.issuer = this.issuer.toJSON();
    result.signature = this.signature.toJSON();
    result.serialNumber = this.serialNumber.toJSON();
    result.attrCertValidityPeriod = this.attrCertValidityPeriod.toJSON();
    result.attributes = Array.from(this.attributes, element => element.toJSON());

    if (this.issuerUniqueID) {
      result.issuerUniqueID = this.issuerUniqueID.toJSON();
    }

    if (this.extensions) {
      result.extensions = this.extensions.toJSON();
    }

    return result;
  }

}
