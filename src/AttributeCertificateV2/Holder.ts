import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import GeneralNames from "../GeneralNames";
import { IssuerSerial } from "../AttributeCertificateV1";
import { ObjectDigestInfo } from "./ObjectDigestInfo";
import * as Schema from "../Schema";

const BASE_CERTIFICATE_ID = "baseCertificateID";
const ENTITY_NAME = "entityName";
const OBJECT_DIGEST_INFO = "objectDigestInfo";

export interface HolderParameters extends Schema.SchemaConstructor {
  baseCertificateID?: IssuerSerial;
  entityName?: GeneralNames;
  objectDigestInfo?: ObjectDigestInfo;
}

const CLEAR_PROPS = [
  BASE_CERTIFICATE_ID,
  ENTITY_NAME,
  OBJECT_DIGEST_INFO
];
export type HolderSchema = Schema.SchemaParameters<{
  baseCertificateID?: string;
  entityName?: string;
  objectDigestInfo?: string;
}>;

/**
 * Class from RFC5755
 */
export class Holder implements Schema.SchemaCompatible {

  public baseCertificateID?: IssuerSerial;
  public entityName?: GeneralNames;
  public objectDigestInfo?: ObjectDigestInfo;

  /**
   * Constructor for Holder class
   * @param parameters
   */
  constructor(parameters: HolderParameters = {}) {
    //#region Internal properties of the object
    if (parameters.baseCertificateID) {
      this.baseCertificateID = pvutils.getParametersValue(parameters, BASE_CERTIFICATE_ID, Holder.defaultValues(BASE_CERTIFICATE_ID));
    }
    if (parameters.entityName) {
      this.entityName = pvutils.getParametersValue(parameters, ENTITY_NAME, Holder.defaultValues(ENTITY_NAME));
    }
    if (parameters.objectDigestInfo) {
      this.objectDigestInfo = pvutils.getParametersValue(parameters, OBJECT_DIGEST_INFO, Holder.defaultValues(OBJECT_DIGEST_INFO));
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
  public static defaultValues(memberName: typeof BASE_CERTIFICATE_ID): IssuerSerial;
  public static defaultValues(memberName: typeof ENTITY_NAME): GeneralNames;
  public static defaultValues(memberName: typeof OBJECT_DIGEST_INFO): ObjectDigestInfo;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case BASE_CERTIFICATE_ID:
        return new IssuerSerial();
      case ENTITY_NAME:
        return new GeneralNames();
      case OBJECT_DIGEST_INFO:
        return new ObjectDigestInfo();
      default:
        throw new Error(`Invalid member name for Holder class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * Holder ::= SEQUENCE {
   *   baseCertificateID   [0] IssuerSerial OPTIONAL,
   *       -- the issuer and serial number of
   *       -- the holder's Public Key Certificate
   *   entityName          [1] GeneralNames OPTIONAL,
   *       -- the name of the claimant or role
   *   objectDigestInfo    [2] ObjectDigestInfo OPTIONAL
   *       -- used to directly authenticate the holder,
   *       -- for example, an executable
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: HolderSchema = {}): Schema.SchemaType {
    /**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [baseCertificateID]
     * @property {string} [entityName]
     * @property {string} [objectDigestInfo]
     */
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
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
          name: (names.entityName || ""),
          idBlock: {
            tagClass: 3,
            tagNumber: 1 // [2]
          },
          value: GeneralNames.schema().valueBlock.value
        }),
        new asn1js.Constructed({
          optional: true,
          name: (names.objectDigestInfo || ""),
          idBlock: {
            tagClass: 3,
            tagNumber: 2 // [2]
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
      Holder.schema({
        names: {
          baseCertificateID: BASE_CERTIFICATE_ID,
          entityName: ENTITY_NAME,
          objectDigestInfo: OBJECT_DIGEST_INFO
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for Holder");
    }
    //#endregion
    //#region Get internal properties from parsed schema
    if (BASE_CERTIFICATE_ID in asn1.result) {
      this.baseCertificateID = new IssuerSerial({
        schema: new asn1js.Sequence({
          value: asn1.result.baseCertificateID.valueBlock.value
        })
      });
    }

    if (ENTITY_NAME in asn1.result) {
      this.entityName = new GeneralNames({
        schema: new asn1js.Sequence({
          value: asn1.result.entityName.valueBlock.value
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
  public toSchema(): Schema.SchemaType {
    const result = new asn1js.Sequence();

    if (this.baseCertificateID) {
      result.valueBlock.value.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3,
          tagNumber: 0 // [0]
        },
        value: this.baseCertificateID.toSchema().valueBlock.value
      }));
    }

    if (this.entityName) {
      result.valueBlock.value.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3,
          tagNumber: 1 // [1]
        },
        value: this.entityName.toSchema().valueBlock.value
      }));
    }

    if (this.objectDigestInfo) {
      result.valueBlock.value.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3,
          tagNumber: 2 // [2]
        },
        value: this.objectDigestInfo.toSchema().valueBlock.value
      }));
    }

    return result;
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    const result: any = {};

    if (this.baseCertificateID) {
      result.baseCertificateID = this.baseCertificateID.toJSON();
    }

    if (this.entityName) {
      result.entityName = this.entityName.toJSON();
    }

    if (this.objectDigestInfo) {
      result.objectDigestInfo = this.objectDigestInfo.toJSON();
    }

    return result;
  }

}
