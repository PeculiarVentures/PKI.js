import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

export interface AlgorithmIdentifierParameters extends Schema.SchemaConstructor {
  /**
   * ObjectIdentifier for algorithm (string representation)
   */
  algorithmId?: string;
  /**
   * Any algorithm parameters
   */
  algorithmParams?: any;
}

export interface JsonAlgorithmIdentifier {
  algorithmId: string;
  algorithmParams?: any;
}

export type AlgorithmIdentifierSchema = Schema.SchemaParameters<{
  algorithmIdentifier?: string;
  algorithmParams?: string;
}>;

/**
 * Class from RFC5280
 */
export default class AlgorithmIdentifier implements Schema.SchemaCompatible {

  /**
   * ObjectIdentifier for algorithm (string representation)
   */
  public algorithmId: string;
  /**
   * Any algorithm parameters
   */
  public algorithmParams?: any;

  /**
   * Constructor for AlgorithmIdentifier class
   * @param parameters
   */
  constructor(parameters: AlgorithmIdentifierParameters = {}) {
    //#region Internal properties of the object
    this.algorithmId = pvutils.getParametersValue(parameters, "algorithmId", AlgorithmIdentifier.defaultValues("algorithmId"));

    if (parameters.algorithmParams) {
      this.algorithmParams = pvutils.getParametersValue(parameters, "algorithmParams", AlgorithmIdentifier.defaultValues("algorithmParams"));
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
  public static defaultValues(memberName: "algorithmId"): string;
  public static defaultValues(memberName: "algorithmParams"): any;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case "algorithmId":
        return "";
      case "algorithmParams":
        return new asn1js.Any();
      default:
        throw new Error(`Invalid member name for AlgorithmIdentifier class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case "algorithmId":
        return (memberValue === "");
      case "algorithmParams":
        return (memberValue instanceof asn1js.Any);
      default:
        throw new Error(`Invalid member name for AlgorithmIdentifier class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * AlgorithmIdentifier  ::=  Sequence  {
   *    algorithm               OBJECT IDENTIFIER,
   *    parameters              ANY DEFINED BY algorithm OPTIONAL  }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: AlgorithmIdentifierSchema = {}): any {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      optional: (names.optional || false),
      value: [
        new asn1js.ObjectIdentifier({ name: (names.algorithmIdentifier || "") }),
        new asn1js.Any({ name: (names.algorithmParams || ""), optional: true })
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
      "algorithm",
      "params"
    ]);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      AlgorithmIdentifier.schema({
        names: {
          algorithmIdentifier: "algorithm",
          algorithmParams: "params"
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for AlgorithmIdentifier");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.algorithmId = asn1.result.algorithm.valueBlock.toString();
    if ("params" in asn1.result)
      this.algorithmParams = asn1.result.params;
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): Schema.SchemaType {
    //#region Create array for output sequence
    const outputArray = [];

    outputArray.push(new asn1js.ObjectIdentifier({ value: this.algorithmId }));
    if (this.algorithmParams && !(this.algorithmParams instanceof asn1js.Any)) {
      outputArray.push(this.algorithmParams);
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
   */
  public toJSON(): JsonAlgorithmIdentifier {
    const object: JsonAlgorithmIdentifier = {
      algorithmId: this.algorithmId
    };

    if (this.algorithmParams && !(this.algorithmParams instanceof asn1js.Any)) {
      object.algorithmParams = this.algorithmParams.toJSON();
    }

    return object;
  }

  /**
   * Check that two "AlgorithmIdentifiers" are equal
   * @param algorithmIdentifier
   */
  isEqual(algorithmIdentifier: AlgorithmIdentifier): boolean {
    //#region Check input type
    if (!(algorithmIdentifier instanceof AlgorithmIdentifier)) {
      return false;
    }
    //#endregion

    //#region Check "algorithm_id"
    if (this.algorithmId !== algorithmIdentifier.algorithmId) {
      return false;
    }
    //#endregion

    //#region Check "algorithm_params"
    if (this.algorithmParams) {
      if (algorithmIdentifier.algorithmParams) {
        return JSON.stringify(this.algorithmParams) === JSON.stringify(algorithmIdentifier.algorithmParams);
      }

      return false;
    }

    if (algorithmIdentifier.algorithmParams) {
      return false;
    }
    //#endregion

    return true;
  }

}

