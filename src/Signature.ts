import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { AlgorithmIdentifier, AlgorithmIdentifierSchema } from "./AlgorithmIdentifier";
import { Certificate } from "./Certificate";
import * as Schema from "./Schema";

const SIGNATURE_ALGORITHM = "signatureAlgorithm";
const SIGNATURE = "signature";
const CERTS = "certs";

export interface SignatureParameters extends Schema.SchemaConstructor {
  signatureAlgorithm?: AlgorithmIdentifier;
  signature?: asn1js.BitString;
  certs?: Certificate[];
}

export type SignatureSchema = Schema.SchemaParameters<{
  signatureAlgorithm?: AlgorithmIdentifierSchema;
  signature?: string;
  certs?: string;
}>;

/**
 * Class from RFC6960
 */
export class Signature implements Schema.SchemaCompatible {

  public signatureAlgorithm: AlgorithmIdentifier;
  public signature: asn1js.BitString;
  public certs?: Certificate[];

  /**
   * Constructor for Signature class
   * @param parameters
   */
  constructor(parameters: SignatureParameters = {}) {
    //#region Internal properties of the object
    this.signatureAlgorithm = pvutils.getParametersValue(parameters, SIGNATURE_ALGORITHM, Signature.defaultValues(SIGNATURE_ALGORITHM));
    this.signature = pvutils.getParametersValue(parameters, SIGNATURE, Signature.defaultValues(SIGNATURE));
    if (parameters.certs)
      this.certs = pvutils.getParametersValue(parameters, CERTS, Signature.defaultValues(CERTS));
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
  public static defaultValues(memberName: typeof SIGNATURE_ALGORITHM): AlgorithmIdentifier;
  public static defaultValues(memberName: typeof SIGNATURE): asn1js.BitString;
  public static defaultValues(memberName: typeof CERTS): Certificate[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case SIGNATURE_ALGORITHM:
        return new AlgorithmIdentifier();
      case SIGNATURE:
        return new asn1js.BitString();
      case CERTS:
        return [];
      default:
        throw new Error(`Invalid member name for Signature class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case SIGNATURE_ALGORITHM:
        return ((memberValue.algorithmId === "") && (("algorithmParams" in memberValue) === false));
      case SIGNATURE:
        return (memberValue.isEqual(Signature.defaultValues(memberName)));
      case CERTS:
        return (memberValue.length === 0);
      default:
        throw new Error(`Invalid member name for Signature class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * Signature       ::=     SEQUENCE {
   *    signatureAlgorithm      AlgorithmIdentifier,
   *    signature               BIT STRING,
   *    certs               [0] EXPLICIT SEQUENCE OF Certificate OPTIONAL }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: SignatureSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        AlgorithmIdentifier.schema(names.signatureAlgorithm || {}),
        new asn1js.BitString({ name: (names.signature || "") }),
        new asn1js.Constructed({
          optional: true,
          idBlock: {
            tagClass: 3, // CONTEXT-SPECIFIC
            tagNumber: 0 // [0]
          },
          value: [
            new asn1js.Sequence({
              value: [new asn1js.Repeated({
                name: (names.certs || ""),
                // TODO Double check
                // value: Certificate.schema(names.certs || {})
                value: Certificate.schema({})
              })]
            })
          ]
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
    pvutils.clearProps(schema, [
      SIGNATURE_ALGORITHM,
      SIGNATURE,
      CERTS
    ]);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      Signature.schema({
        names: {
          signatureAlgorithm: {
            names: {
              blockName: SIGNATURE_ALGORITHM
            }
          },
          signature: SIGNATURE,
          certs: CERTS
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for Signature");
    //#endregion

    //#region Get internal properties from parsed schema
    this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
    this.signature = asn1.result.signature;

    if (CERTS in asn1.result)
      this.certs = Array.from(asn1.result.certs, element => new Certificate({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Create array of output sequence
    const outputArray = [];

    outputArray.push(this.signatureAlgorithm.toSchema());
    outputArray.push(this.signature);

    if (this.certs) {
      outputArray.push(new asn1js.Constructed({
        optional: true,
        idBlock: {
          tagClass: 3, // CONTEXT-SPECIFIC
          tagNumber: 0 // [0]
        },
        value: [
          new asn1js.Sequence({
            value: Array.from(this.certs, element => element.toSchema())
          })
        ]
      }));
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
    const _object: any = {
      signatureAlgorithm: this.signatureAlgorithm.toJSON(),
      signature: this.signature.toJSON()
    };

    if (this.certs) {
      _object.certs = Array.from(this.certs, element => element.toJSON());
    }

    return _object;
  }

}
