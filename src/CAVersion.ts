import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { extensionValue } from "./ExtensionValueFactory";
import { id_MicrosoftCaVersion } from "./ObjectIdentifiers";
import * as Schema from "./Schema";

const CERTIFICATE_INDEX = "certificateIndex";
const KEY_INDEX = "keyIndex";

export interface CAVersionParameters extends Schema.SchemaConstructor {
  certificateIndex?: number;
  keyIndex?: number;
}

/**
 * Class from https://docs.microsoft.com/en-us/windows/desktop/seccrypto/certification-authority-renewal
 */
@extensionValue(id_MicrosoftCaVersion, "MicrosoftCaVersion")
export default class CAVersion implements Schema.SchemaCompatible {

  public certificateIndex: number;
  public keyIndex: number;

  /**
   * Constructor for BasicConstraints class
   * @param parameters
   */
  constructor(parameters: CAVersionParameters = {}) {
    //#region Internal properties of the object
    this.certificateIndex = pvutils.getParametersValue(parameters, CERTIFICATE_INDEX, CAVersion.defaultValues(CERTIFICATE_INDEX));
    this.keyIndex = pvutils.getParametersValue(parameters, KEY_INDEX, CAVersion.defaultValues(KEY_INDEX));
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
  public static defaultValues(memberName: typeof CERTIFICATE_INDEX): number;
  public static defaultValues(memberName: typeof KEY_INDEX): number;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case CERTIFICATE_INDEX:
      case KEY_INDEX:
        return 0;
      default:
        throw new Error(`Invalid member name for CAVersion class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * CAVersion ::= INTEGER
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(): Schema.SchemaType {
    return (new asn1js.Integer());
  }

  /**
   * Convert parsed asn1js object into current class
   * @param schema
   */
  public fromSchema(schema: Schema.SchemaType) {
    //#region Check the schema is valid
    if (schema.constructor.blockName() !== asn1js.Integer.blockName()) {
      throw new Error("Object's schema was not verified against input data for CAVersion");
    }
    //#endregion

    //#region Check length of the input value and correct it if needed
    let value = schema.valueBlock.valueHex.slice(0);
    const valueView = new Uint8Array(value);

    switch (true) {
      case (value.byteLength < 4):
        {
          const tempValue = new ArrayBuffer(4);
          const tempValueView = new Uint8Array(tempValue);

          tempValueView.set(valueView, 4 - value.byteLength);

          value = tempValue.slice(0);
        }
        break;
      case (value.byteLength > 4):
        {
          const tempValue = new ArrayBuffer(4);
          const tempValueView = new Uint8Array(tempValue);

          tempValueView.set(valueView.slice(0, 4));

          value = tempValue.slice(0);
        }
        break;
      default:
    }
    //#endregion

    //#region Get internal properties from parsed schema
    const keyIndexBuffer = value.slice(0, 2);
    const keyIndexView8 = new Uint8Array(keyIndexBuffer);
    let temp = keyIndexView8[0];
    keyIndexView8[0] = keyIndexView8[1];
    keyIndexView8[1] = temp;

    const keyIndexView16 = new Uint16Array(keyIndexBuffer);

    this.keyIndex = keyIndexView16[0];

    const certificateIndexBuffer = value.slice(2);
    const certificateIndexView8 = new Uint8Array(certificateIndexBuffer);
    temp = certificateIndexView8[0];
    certificateIndexView8[0] = certificateIndexView8[1];
    certificateIndexView8[1] = temp;

    const certificateIndexView16 = new Uint16Array(certificateIndexBuffer);

    this.certificateIndex = certificateIndexView16[0];
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Integer {
    //#region Create raw values
    const certificateIndexBuffer = new ArrayBuffer(2);
    const certificateIndexView = new Uint16Array(certificateIndexBuffer);

    certificateIndexView[0] = this.certificateIndex;

    const certificateIndexView8 = new Uint8Array(certificateIndexBuffer);
    let temp = certificateIndexView8[0];
    certificateIndexView8[0] = certificateIndexView8[1];
    certificateIndexView8[1] = temp;

    const keyIndexBuffer = new ArrayBuffer(2);
    const keyIndexView = new Uint16Array(keyIndexBuffer);

    keyIndexView[0] = this.keyIndex;

    const keyIndexView8 = new Uint8Array(keyIndexBuffer);
    temp = keyIndexView8[0];
    keyIndexView8[0] = keyIndexView8[1];
    keyIndexView8[1] = temp;
    //#endregion

    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Integer({
      valueHex: pvutils.utilConcatBuf(keyIndexBuffer, certificateIndexBuffer)
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    return {
      certificateIndex: this.certificateIndex,
      keyIndex: this.keyIndex
    };
  }

}
