import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { GeneralNames } from "../GeneralNames";
import { IssuerSerial } from "../AttributeCertificateV1";
import { ObjectDigestInfo } from "./ObjectDigestInfo";
import * as Schema from "../Schema";

const ISSUER_NAME = "issuerName";
const BASE_CERTIFICATE_ID = "baseCertificateID";
const OBJECT_DIGEST_INFO = "objectDigestInfo";
const CLEAR_PROPS = [
  ISSUER_NAME,
  BASE_CERTIFICATE_ID,
  OBJECT_DIGEST_INFO
];

export interface V2FormParameters extends Schema.SchemaConstructor {
  issuerName?: GeneralNames;
  baseCertificateID?: IssuerSerial;
  objectDigestInfo?: ObjectDigestInfo;
}

/**
 * Class from RFC5755
 */
export class V2Form implements Schema.SchemaCompatible {

  public issuerName?: GeneralNames;
  public baseCertificateID?: IssuerSerial;
  public objectDigestInfo?: ObjectDigestInfo;

  /**
   * Constructor for V2Form class
   * @param parameters
   */
  constructor(parameters: V2FormParameters = {}) {
    //#region Internal properties of the object
    if (parameters.issuerName) {
      this.issuerName = pvutils.getParametersValue(parameters, ISSUER_NAME, V2Form.defaultValues(ISSUER_NAME));
    }
    if (parameters.baseCertificateID) {
      this.baseCertificateID = pvutils.getParametersValue(parameters, BASE_CERTIFICATE_ID, V2Form.defaultValues(BASE_CERTIFICATE_ID));
    }
    if (parameters.objectDigestInfo) {
      this.objectDigestInfo = pvutils.getParametersValue(parameters, OBJECT_DIGEST_INFO, V2Form.defaultValues(OBJECT_DIGEST_INFO));
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
  public static defaultValues(memberName: typeof ISSUER_NAME): GeneralNames;
  public static defaultValues(memberName: typeof BASE_CERTIFICATE_ID): IssuerSerial;
  public static defaultValues(memberName: typeof OBJECT_DIGEST_INFO): ObjectDigestInfo;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case ISSUER_NAME:
        return new GeneralNames();
      case BASE_CERTIFICATE_ID:
        return new IssuerSerial();
      case OBJECT_DIGEST_INFO:
        return new ObjectDigestInfo();
      default:
        throw new Error(`Invalid member name for V2Form class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * V2Form ::= SEQUENCE {
   *   issuerName            GeneralNames  OPTIONAL,
   *   baseCertificateID     [0] IssuerSerial  OPTIONAL,
   *   objectDigestInfo      [1] ObjectDigestInfo  OPTIONAL
   *     -- issuerName MUST be present in this profile
   *     -- baseCertificateID and objectDigestInfo MUST NOT
   *     -- be present in this profile
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    issuerName?: string;
    baseCertificateID?: string;
    objectDigestInfo?: string;
  }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        GeneralNames.schema({
          names: {
            blockName: names.issuerName
          }
        }, true),
        new asn1js.Constructed({
          optional: true,
          name: (names.baseCertificateID || ""),
          idBlock: {
            tagClass: 3,
            tagNumber: 0 // [0]
          },
          value: IssuerSerial.schema().valueBlock.value
        }),
        new asn1js.Constructed({
          optional: true,
          name: (names.objectDigestInfo || ""),
          idBlock: {
            tagClass: 3,
            tagNumber: 1 // [1]
          },
          value: ObjectDigestInfo.schema().valueBlock.value
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
      V2Form.schema({
        names: {
          issuerName: ISSUER_NAME,
          baseCertificateID: BASE_CERTIFICATE_ID,
          objectDigestInfo: OBJECT_DIGEST_INFO
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for V2Form");
    }
    //#endregion
    //#region Get internal properties from parsed schema
    if (ISSUER_NAME in asn1.result)
      this.issuerName = new GeneralNames({ schema: asn1.result.issuerName });

    if (BASE_CERTIFICATE_ID in asn1.result) {
      this.baseCertificateID = new IssuerSerial({
        schema: new asn1js.Sequence({
          value: asn1.result.baseCertificateID.valueBlock.value
        })
      });
    }

    if (OBJECT_DIGEST_INFO in asn1.result) {
      this.objectDigestInfo = new ObjectDigestInfo({
        schema: new asn1js.Sequence({
          value: asn1.result.objectDigestInfo.valueBlock.value
        })
      });
    }
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    const result = new asn1js.Sequence();

    if (this.issuerName)
      result.valueBlock.value.push(this.issuerName.toSchema());

    if (this.baseCertificateID) {
      result.valueBlock.value.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3,
          tagNumber: 0 // [0]
        },
        value: this.baseCertificateID.toSchema().valueBlock.value
      }));
    }

    if (this.objectDigestInfo) {
      result.valueBlock.value.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3,
          tagNumber: 1 // [1]
        },
        value: this.objectDigestInfo.toSchema().valueBlock.value
      }));
    }

    //#region Construct and return new ASN.1 schema for this object
    return result;
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    const result: any = {};

    if (this.issuerName) {
      result.issuerName = this.issuerName.toJSON();
    }
    if (this.baseCertificateID) {
      result.baseCertificateID = this.baseCertificateID.toJSON();
    }
    if (this.objectDigestInfo) {
      result.objectDigestInfo = this.objectDigestInfo.toJSON();
    }

    return result;
  }

}
