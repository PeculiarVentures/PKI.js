import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { AlgorithmIdentifier, AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import * as Schema from "./Schema";

const KEY_INFO = "keyInfo";
const ENTITY_U_INFO = "entityUInfo";
const SUPP_PUB_INFO = "suppPubInfo";
const CLEAR_PROPS = [
  KEY_INFO,
  ENTITY_U_INFO,
  SUPP_PUB_INFO
];

export interface ECCCMSSharedInfoParameters extends Schema.SchemaConstructor {
  keyInfo?: AlgorithmIdentifier;
  entityUInfo?: asn1js.OctetString;
  suppPubInfo?: asn1js.OctetString;
}

/**
 * Class from RFC6318
 */
export class ECCCMSSharedInfo implements Schema.SchemaCompatible {

  public keyInfo: AlgorithmIdentifier;
  public entityUInfo?: asn1js.OctetString;
  public suppPubInfo: asn1js.OctetString;

  /**
   * Constructor for ECCCMSSharedInfo class
   * @param parameters
   */
  constructor(parameters: ECCCMSSharedInfoParameters = {}) {
    //#region Internal properties of the object
    this.keyInfo = pvutils.getParametersValue(parameters, KEY_INFO, ECCCMSSharedInfo.defaultValues(KEY_INFO));
    if (parameters.entityUInfo) {
      this.entityUInfo = pvutils.getParametersValue(parameters, ENTITY_U_INFO, ECCCMSSharedInfo.defaultValues(ENTITY_U_INFO));
    }
    this.suppPubInfo = pvutils.getParametersValue(parameters, SUPP_PUB_INFO, ECCCMSSharedInfo.defaultValues(SUPP_PUB_INFO));
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
  public static defaultValues(memberName: typeof KEY_INFO): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof ENTITY_U_INFO): asn1js.OctetString;
  public static defaultValues(memberName: typeof SUPP_PUB_INFO): asn1js.OctetString;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case KEY_INFO:
        return new AlgorithmIdentifier();
      case ENTITY_U_INFO:
        return new asn1js.OctetString();
      case SUPP_PUB_INFO:
        return new asn1js.OctetString();
      default:
        throw new Error(`Invalid member name for ECCCMSSharedInfo class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case KEY_INFO:
      case ENTITY_U_INFO:
      case SUPP_PUB_INFO:
        return (memberValue.isEqual(ECCCMSSharedInfo.defaultValues(memberName as typeof SUPP_PUB_INFO)));
      default:
        throw new Error(`Invalid member name for ECCCMSSharedInfo class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```
   * ECC-CMS-SharedInfo  ::=  SEQUENCE {
   *    keyInfo      AlgorithmIdentifier,
   *    entityUInfo  [0] EXPLICIT OCTET STRING OPTIONAL,
   *    suppPubInfo  [2] EXPLICIT OCTET STRING }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    keyInfo?: AlgorithmIdentifierSchema;
    entityUInfo?: string;
    suppPubInfo?: string;
  }> = {}): Schema.SchemaType {
    /**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [keyInfo]
     * @property {string} [entityUInfo]
     * @property {string} [suppPubInfo]
     */
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        AlgorithmIdentifier.schema(names.keyInfo || {}),
        new asn1js.Constructed({
          name: (names.entityUInfo || ""),
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          optional: true,
          value: [new asn1js.OctetString()]
        }),
        new asn1js.Constructed({
          name: (names.suppPubInfo || ""),
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 2 // [2]
          },
          value: [new asn1js.OctetString()]
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
      ECCCMSSharedInfo.schema({
        names: {
          keyInfo: {
            names: {
              blockName: KEY_INFO
            }
          },
          entityUInfo: ENTITY_U_INFO,
          suppPubInfo: SUPP_PUB_INFO
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for ECCCMSSharedInfo");
    //#endregion

    //#region Get internal properties from parsed schema
    this.keyInfo = new AlgorithmIdentifier({ schema: asn1.result.keyInfo });

    if (ENTITY_U_INFO in asn1.result)
      this.entityUInfo = asn1.result.entityUInfo.valueBlock.value[0];

    this.suppPubInfo = asn1.result.suppPubInfo.valueBlock.value[0];
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Create output array for sequence
    const outputArray = [];

    outputArray.push(this.keyInfo.toSchema());

    if (ENTITY_U_INFO in this) {
      outputArray.push(new asn1js.Constructed({
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: [this.entityUInfo]
      }));
    }

    outputArray.push(new asn1js.Constructed({
      idBlock: {
        tagClass: 3, // CONTEXT-SPECIFIC
        tagNumber: 2 // [2]
      },
      value: [this.suppPubInfo]
    }));
    //#endregion

    //#region Construct and return new ASN.1 schema for this object
    return new asn1js.Sequence({
      value: outputArray
    });
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    const _object: any = {
      keyInfo: this.keyInfo.toJSON()
    };

    if (this.entityUInfo) {
      _object.entityUInfo = this.entityUInfo.toJSON();
    }

    _object.suppPubInfo = this.suppPubInfo.toJSON();

    return _object;
  }

}
