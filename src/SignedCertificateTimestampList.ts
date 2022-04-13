import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as bs from "bytestreamjs";
import { SignedCertificateTimestamp } from "./SignedCertificateTimestamp";
import * as Schema from "./Schema";

const TIMESTAMPS = "timestamps";

export interface SignedCertificateTimestampListParameters extends Schema.SchemaConstructor {
  timestamps?: SignedCertificateTimestamp[];
}

/**
 * Class from RFC6962
 */
export class SignedCertificateTimestampList implements Schema.SchemaCompatible {

  public timestamps: SignedCertificateTimestamp[];

  /**
   * Constructor for SignedCertificateTimestampList class
   * @param parameters
   */
  constructor(parameters: SignedCertificateTimestampListParameters = {}) {
    //#region Internal properties of the object
    this.timestamps = pvutils.getParametersValue(parameters, TIMESTAMPS, SignedCertificateTimestampList.defaultValues(TIMESTAMPS));
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
  public static defaultValues(memberName: typeof TIMESTAMPS): SignedCertificateTimestamp[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case TIMESTAMPS:
        return [];
      default:
        throw new Error(`Invalid member name for SignedCertificateTimestampList class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case TIMESTAMPS:
        return (memberValue.length === 0);
      default:
        throw new Error(`Invalid member name for SignedCertificateTimestampList class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * SignedCertificateTimestampList ::= OCTET STRING
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    names.optional ??= false;

    return (new asn1js.OctetString({
      name: (names.blockName || "SignedCertificateTimestampList"),
      optional: names.optional
    }));
  }

  /**
   * Convert parsed asn1js object into current class
   * @param schema
   */
  public fromSchema(schema: Schema.SchemaType): void {
    //#region Check the schema is valid
    if ((schema instanceof asn1js.OctetString) === false) {
      throw new Error("Object's schema was not verified against input data for SignedCertificateTimestampList");
    }
    //#endregion
    //#region Get internal properties from parsed schema
    const seqStream = new bs.SeqStream({
      stream: new bs.ByteStream({
        buffer: schema.valueBlock.valueHex
      })
    });

    const dataLength = seqStream.getUint16();
    if (dataLength !== seqStream.length) {
      throw new Error("Object's schema was not verified against input data for SignedCertificateTimestampList");
    }

    while (seqStream.length) {
      this.timestamps.push(new SignedCertificateTimestamp({ stream: seqStream }));
    }
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Initial variables
    const stream = new bs.SeqStream();

    let overallLength = 0;

    const timestampsData = [];
    //#endregion
    //#region Get overall length
    for (const timestamp of this.timestamps) {
      const timestampStream = timestamp.toStream();
      timestampsData.push(timestampStream);
      overallLength += timestampStream.stream.buffer.byteLength;
    }
    //#endregion
    stream.appendUint16(overallLength);

    //#region Set data from all timestamps
    for (const timestamp of timestampsData) {
      stream.appendView(timestamp.stream.view);
    }
    //#endregion
    return new asn1js.OctetString({ valueHex: stream.stream.buffer.slice(0) });
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    return {
      timestamps: Array.from(this.timestamps, element => element.toJSON())
    };
  }

}
