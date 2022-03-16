import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import { extensionValue } from "./ExtensionValueFactory";
import { id_BasicConstraints } from "./ObjectIdentifiers";
import * as Schema from "./Schema";

const PATH_LENGTH_CONSTRAINT = "pathLenConstraint";
const CA = "cA";


export interface BasicConstraintsParameters extends Schema.SchemaConstructor {
  cA?: boolean;
  pathLenConstraint?: number;
}

/**
 * Class from RFC5280
 */
@extensionValue(id_BasicConstraints, "BasicConstraints")
export default class BasicConstraints implements Schema.SchemaCompatible {

  public cA: boolean;
  public pathLenConstraint?: number | asn1js.Integer;

  /**
   * Constructor for BasicConstraints class
   * @param parameters
   */
  constructor(parameters: BasicConstraintsParameters = {}) {
    //#region Internal properties of the object
    this.cA = pvutils.getParametersValue(parameters, CA, false);

    if (PATH_LENGTH_CONSTRAINT in parameters) {
      this.pathLenConstraint = pvutils.getParametersValue(parameters, PATH_LENGTH_CONSTRAINT, 0);
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
  public static defaultValues(memberName: typeof CA): boolean;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case CA:
        return false;
      default:
        throw new Error(`Invalid member name for BasicConstraints class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * BasicConstraints ::= SEQUENCE {
   *    cA                      BOOLEAN DEFAULT FALSE,
   *    pathLenConstraint       INTEGER (0..MAX) OPTIONAL }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  static schema(parameters: Schema.SchemaParameters<{ cA?: string; pathLenConstraint?: string; }> = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Boolean({
          optional: true,
          name: (names.cA || "")
        }),
        new asn1js.Integer({
          optional: true,
          name: (names.pathLenConstraint || "")
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
      CA,
      PATH_LENGTH_CONSTRAINT
    ]);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      BasicConstraints.schema({
        names: {
          cA: CA,
          pathLenConstraint: PATH_LENGTH_CONSTRAINT
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for BasicConstraints");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    if (CA in asn1.result) {
      this.cA = asn1.result.cA.valueBlock.value;
    }

    if (PATH_LENGTH_CONSTRAINT in asn1.result) {
      if (asn1.result.pathLenConstraint.valueBlock.isHexOnly) {
        this.pathLenConstraint = asn1.result.pathLenConstraint;
      } else {
        this.pathLenConstraint = asn1.result.pathLenConstraint.valueBlock.valueDec;
      }
    }
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): Schema.SchemaType {
    //#region Create array for output sequence
    const outputArray = [];

    if (this.cA !== BasicConstraints.defaultValues(CA))
      outputArray.push(new asn1js.Boolean({ value: this.cA }));

    if (PATH_LENGTH_CONSTRAINT in this) {
      if (this.pathLenConstraint instanceof asn1js.Integer) {
        outputArray.push(this.pathLenConstraint);
      } else {
        outputArray.push(new asn1js.Integer({ value: this.pathLenConstraint }));
      }
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
    const object: any = {};

    if (this.cA !== BasicConstraints.defaultValues(CA)) {
      object.cA = this.cA;
    }

    if (PATH_LENGTH_CONSTRAINT in this) {
      if (this.pathLenConstraint instanceof asn1js.Integer) {
        object.pathLenConstraint = this.pathLenConstraint.toJSON();
      } else {
        object.pathLenConstraint = this.pathLenConstraint;
      }
    }

    return object;
  }

}

