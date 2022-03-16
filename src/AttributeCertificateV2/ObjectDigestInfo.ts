import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import AlgorithmIdentifier, { AlgorithmIdentifierSchema } from "../AlgorithmIdentifier";
import * as Schema from "../Schema";

const DIGESTED_OBJECT_TYPE = "digestedObjectType";
const OTHER_OBJECT_TYPE_ID = "otherObjectTypeID";
const DIGEST_ALGORITHM = "digestAlgorithm";
const OBJECT_DIGEST = "objectDigest";
const CLEAR_PROPS = [
  DIGESTED_OBJECT_TYPE,
  OTHER_OBJECT_TYPE_ID,
  DIGEST_ALGORITHM,
  OBJECT_DIGEST,
];

export interface ObjectDigestInfoParameters extends Schema.SchemaConstructor {
  digestedObjectType?: asn1js.Enumerated;
  otherObjectTypeID?: asn1js.ObjectIdentifier;
  digestAlgorithm?: AlgorithmIdentifier;
  objectDigest?: asn1js.BitString;
}

/**
 * Class from RFC5755
 */
export class ObjectDigestInfo implements Schema.SchemaCompatible {

  public digestedObjectType: asn1js.Enumerated;
  public otherObjectTypeID?: asn1js.ObjectIdentifier;
  public digestAlgorithm: AlgorithmIdentifier;
  public objectDigest: asn1js.BitString;

  /**
   * Constructor for ObjectDigestInfo class
   * @param parameters
   */
  constructor(parameters: ObjectDigestInfoParameters = {}) {
    //#region Internal properties of the object
    this.digestedObjectType = getParametersValue(parameters, DIGESTED_OBJECT_TYPE, ObjectDigestInfo.defaultValues(DIGESTED_OBJECT_TYPE));
    if (parameters.otherObjectTypeID) {
      this.otherObjectTypeID = getParametersValue(parameters, OTHER_OBJECT_TYPE_ID, ObjectDigestInfo.defaultValues(OTHER_OBJECT_TYPE_ID));
    }
    this.digestAlgorithm = getParametersValue(parameters, DIGEST_ALGORITHM, ObjectDigestInfo.defaultValues(DIGEST_ALGORITHM));
    this.objectDigest = getParametersValue(parameters, OBJECT_DIGEST, ObjectDigestInfo.defaultValues(OBJECT_DIGEST));
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
  public static defaultValues(memberName: typeof DIGESTED_OBJECT_TYPE): asn1js.Enumerated;
  public static defaultValues(memberName: typeof OTHER_OBJECT_TYPE_ID): asn1js.ObjectIdentifier;
  public static defaultValues(memberName: typeof DIGEST_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof OBJECT_DIGEST): asn1js.BitString;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case DIGESTED_OBJECT_TYPE:
        return new asn1js.Enumerated();
      case OTHER_OBJECT_TYPE_ID:
        return new asn1js.ObjectIdentifier();
      case DIGEST_ALGORITHM:
        return new AlgorithmIdentifier();
      case OBJECT_DIGEST:
        return new asn1js.BitString();
      default:
        throw new Error(`Invalid member name for ObjectDigestInfo class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * ObjectDigestInfo ::= SEQUENCE {
   *   digestedObjectType  ENUMERATED {
   *     publicKey            (0),
   *     publicKeyCert        (1),
   *     otherObjectTypes     (2) },
   *   -- otherObjectTypes MUST NOT
   *   -- be used in this profile
   *   otherObjectTypeID   OBJECT IDENTIFIER OPTIONAL,
   *   digestAlgorithm     AlgorithmIdentifier,
   *   objectDigest        BIT STRING
   * }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    digestedObjectType?: string;
    otherObjectTypeID?: string;
    digestAlgorithm?: AlgorithmIdentifierSchema;
    objectDigest?: string;
  }> = {}): Schema.SchemaType {
    const names = getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Enumerated({ name: (names.digestedObjectType || "") }),
        new asn1js.ObjectIdentifier({
          optional: true,
          name: (names.otherObjectTypeID || "")
        }),
        AlgorithmIdentifier.schema(names.digestAlgorithm || {}),
        new asn1js.BitString({ name: (names.objectDigest || "") }),
      ]
    }));
  }

  /**
   * Convert parsed asn1js object into current class
   * @param schema
   */
  public fromSchema(schema: Schema.SchemaType): void {
    //#region Clear input data first
    clearProps(schema, CLEAR_PROPS);
    //#endregion
    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      ObjectDigestInfo.schema({
        names: {
          digestedObjectType: DIGESTED_OBJECT_TYPE,
          otherObjectTypeID: OTHER_OBJECT_TYPE_ID,
          digestAlgorithm: {
            names: {
              blockName: DIGEST_ALGORITHM
            }
          },
          objectDigest: OBJECT_DIGEST
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for ObjectDigestInfo");
    }
    //#endregion
    //#region Get internal properties from parsed schema
    this.digestedObjectType = asn1.result.digestedObjectType;

    if (OTHER_OBJECT_TYPE_ID in asn1.result)
      this.otherObjectTypeID = asn1.result.otherObjectTypeID;

    this.digestAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.digestAlgorithm });
    this.objectDigest = asn1.result.objectDigest;
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): Schema.SchemaType {
    const result = new asn1js.Sequence({
      value: [this.digestedObjectType]
    });

    if (this.otherObjectTypeID) {
      result.valueBlock.value.push(this.otherObjectTypeID);
    }

    result.valueBlock.value.push(this.digestAlgorithm.toSchema());
    result.valueBlock.value.push(this.objectDigest);

    return result;
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    const result: any = {
      digestedObjectType: this.digestedObjectType.toJSON()
    };

    if (this.otherObjectTypeID) {
      result.otherObjectTypeID = this.otherObjectTypeID.toJSON();
    }

    result.digestAlgorithm = this.digestAlgorithm.toJSON();
    result.objectDigest = this.objectDigest.toJSON();

    return result;
  }

}
