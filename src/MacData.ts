import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { DigestInfo, DigestInfoSchema } from "./DigestInfo";
import * as Schema from "./Schema";

const MAC = "mac";
const MAC_SALT = "macSalt";
const ITERATIONS = "iterations";
const CLEAR_PROPS = [
  MAC,
  MAC_SALT,
  ITERATIONS
];

export interface MacDataParameters extends Schema.SchemaConstructor {
  mac?: DigestInfo;
  macSalt?: asn1js.OctetString;
  iterations?: number;
}

export type MacDataSchema = Schema.SchemaParameters<{
  mac?: DigestInfoSchema;
  macSalt?: string;
  iterations?: string;
}>;

/**
 * Class from RFC7292
 */
export class MacData implements Schema.SchemaCompatible {

  public mac: DigestInfo;
  public macSalt: asn1js.OctetString;
  public iterations?: number;

  /**
   * Constructor for MacData class
   * @param parameters
   */
  constructor(parameters: MacDataParameters = {}) {
    //#region Internal properties of the object
    this.mac = pvutils.getParametersValue(parameters, MAC, MacData.defaultValues(MAC));
    this.macSalt = pvutils.getParametersValue(parameters, MAC_SALT, MacData.defaultValues(MAC_SALT));
    if (parameters.iterations !== undefined) {
      this.iterations = pvutils.getParametersValue(parameters, ITERATIONS, MacData.defaultValues(ITERATIONS));
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
  public static defaultValues(memberName: typeof MAC): DigestInfo;
  public static defaultValues(memberName: typeof MAC_SALT): asn1js.OctetString;
  public static defaultValues(memberName: typeof ITERATIONS): number;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case MAC:
        return new DigestInfo();
      case MAC_SALT:
        return new asn1js.OctetString();
      case ITERATIONS:
        return 1;
      default:
        throw new Error(`Invalid member name for MacData class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case MAC:
        return ((DigestInfo.compareWithDefault("digestAlgorithm", memberValue.digestAlgorithm)) &&
          (DigestInfo.compareWithDefault("digest", memberValue.digest)));
      case MAC_SALT:
        return (memberValue.isEqual(MacData.defaultValues(memberName)));
      case ITERATIONS:
        return (memberValue === MacData.defaultValues(memberName));
      default:
        throw new Error(`Invalid member name for MacData class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * MacData ::= SEQUENCE {
   *    mac 		DigestInfo,
   *    macSalt       OCTET STRING,
   *    iterations	INTEGER DEFAULT 1
   *    -- Note: The default is for historical reasons and its use is
   *    -- deprecated. A higher value, like 1024 is recommended.
   *    }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: MacDataSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      optional: (names.optional || true),
      value: [
        DigestInfo.schema(names.mac || {
          names: {
            blockName: MAC
          }
        }),
        new asn1js.OctetString({ name: (names.macSalt || MAC_SALT) }),
        new asn1js.Integer({
          optional: true,
          name: (names.iterations || ITERATIONS)
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
      MacData.schema({
        names: {
          mac: {
            names: {
              blockName: MAC
            }
          },
          macSalt: MAC_SALT,
          iterations: ITERATIONS
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for MacData");
    //#endregion

    //#region Get internal properties from parsed schema
    this.mac = new DigestInfo({ schema: asn1.result.mac });
    this.macSalt = asn1.result.macSalt;

    if (ITERATIONS in asn1.result)
      this.iterations = asn1.result.iterations.valueBlock.valueDec;
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Construct and return new ASN.1 schema for this object
    const outputArray: any[] = [
      this.mac.toSchema(),
      this.macSalt
    ];

    if (this.iterations !== undefined) {
      outputArray.push(new asn1js.Integer({ value: this.iterations }));
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
      mac: this.mac.toJSON(),
      macSalt: this.macSalt.toJSON()
    };

    if (this.iterations !== undefined)
      output.iterations = this.iterations;

    return output;
  }

}
