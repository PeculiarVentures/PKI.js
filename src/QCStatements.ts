import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as Schema from "./Schema";

const ID = "id";
const TYPE = "type";
const VALUES = "values";
const QC_STATEMENT_CLEAR_PROPS = [
  ID,
  TYPE
];
const QC_STATEMENTS_CLEAR_PROPS = [
  VALUES
];

export interface QCStatementParameters extends Schema.SchemaConstructor {
  id?: string;
  type?: any;
}

type QCStatementSchema = Schema.SchemaParameters<{
  id?: string;
  type?: string;
}>;

/**
 * Class from RFC3739
 */
export class QCStatement implements Schema.SchemaCompatible {

  public id: string;
  public type?: any;

  /**
   * Constructor for QCStatement class
   * @param parameters
   */
  constructor(parameters: QCStatementParameters = {}) {
    //#region Internal properties of the object
    this.id = pvutils.getParametersValue(parameters, ID, QCStatement.defaultValues(ID));

    if (parameters.type) {
      this.type = pvutils.getParametersValue(parameters, TYPE, QCStatement.defaultValues(TYPE));
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
  public static defaultValues(memberName: typeof ID): string;
  public static defaultValues(memberName: typeof TYPE): any;
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case ID:
        return "";
      case TYPE:
        return new asn1js.Null();
      default:
        throw new Error(`Invalid member name for QCStatement class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case ID:
        return (memberValue === "");
      case TYPE:
        return (memberValue instanceof asn1js.Null);
      default:
        throw new Error(`Invalid member name for QCStatement class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
     *	 QCStatement ::= SEQUENCE {
   *       statementId   QC-STATEMENT.&id({SupportedStatements}),
   *       statementInfo QC-STATEMENT.&Type({SupportedStatements}{@statementId}) OPTIONAL
   *   }
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: QCStatementSchema = {}): Schema.SchemaType {
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.ObjectIdentifier({ name: (names.id || "") }),
        new asn1js.Any({
          name: (names.type || ""),
          optional: true
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
    pvutils.clearProps(schema, QC_STATEMENT_CLEAR_PROPS);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      QCStatement.schema({
        names: {
          id: ID,
          type: TYPE
        }
      })
    );

    if (!asn1.verified)
      throw new Error("Object's schema was not verified against input data for QCStatement");
    //#endregion

    //#region Get internal properties from parsed schema
    this.id = asn1.result.id.valueBlock.toString();

    if (TYPE in asn1.result)
      this.type = asn1.result.type;
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    const value = [
      new asn1js.ObjectIdentifier({ value: this.id })
    ];

    if (TYPE in this)
      value.push(this.type);

    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   */
  public toJSON(): any {
    const object: any = {
      id: this.id
    };

    if (this.type) {
      object.type = this.type.toJSON();
    }

    return object;
  }

}

export interface QCStatementsParameters extends Schema.SchemaConstructor {
  values?: QCStatement[];
}

/**
 * Class from RFC3739
 */
export class QCStatements implements Schema.SchemaCompatible {

  public values: QCStatement[];

  /**
   * Constructor for QCStatements class
   * @param parameters
   */
  constructor(parameters: QCStatementParameters = {}) {
    //#region Internal properties of the object
    this.values = pvutils.getParametersValue(parameters, VALUES, QCStatements.defaultValues(VALUES));
    //#endregion

    //#region If input argument array contains "schema" for this object
    if (parameters.schema)
      this.fromSchema(parameters.schema);
    //#endregion
  }

  /**
   * Return default values for all class members
   * @param memberName String name for a class member
   */
  public static defaultValues(memberName: typeof VALUES): QCStatement[];
  public static defaultValues(memberName: string): any {
    switch (memberName) {
      case VALUES:
        return [];
      default:
        throw new Error(`Invalid member name for QCStatements class: ${memberName}`);
    }
  }

  /**
   * Compare values with default values for all class members
   * @param memberName String name for a class member
   * @param memberValue Value to compare with default value
   */
  public static compareWithDefault(memberName: string, memberValue: any): boolean {
    switch (memberName) {
      case VALUES:
        return (memberValue.length === 0);
      default:
        throw new Error(`Invalid member name for QCStatements class: ${memberName}`);
    }
  }

  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * QCStatements ::= SEQUENCE OF QCStatement
   * ```
   *
   * @param parameters Input parameters for the schema
   * @returns asn1js schema object
   */
  public static schema(parameters: Schema.SchemaParameters<{
    values?: string;
    value?: QCStatementSchema;
  }> = {}): Schema.SchemaType {
    /**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [values]
     */
    const names = pvutils.getParametersValue<NonNullable<typeof parameters.names>>(parameters, "names", {});

    return (new asn1js.Sequence({
      name: (names.blockName || ""),
      value: [
        new asn1js.Repeated({
          name: (names.values || ""),
          value: QCStatement.schema(names.value || {})
        }),
      ]
    }));
  }

  /**
   * Convert parsed asn1js object into current class
   * @param schema
   */
  public fromSchema(schema: Schema.SchemaType): void {
    //#region Clear input data first
    pvutils.clearProps(schema, QC_STATEMENTS_CLEAR_PROPS);
    //#endregion

    //#region Check the schema is valid
    const asn1 = asn1js.compareSchema(schema,
      schema,
      QCStatements.schema({
        names: {
          values: VALUES
        }
      })
    );

    if (!asn1.verified) {
      throw new Error("Object's schema was not verified against input data for QCStatements");
    }
    //#endregion

    //#region Get internal properties from parsed schema
    this.values = Array.from(asn1.result.values, element => new QCStatement({ schema: element }));
    //#endregion
  }

  /**
   * Convert current object to asn1js object and set correct values
   * @returns asn1js object
   */
  public toSchema(): asn1js.Sequence {
    //#region Construct and return new ASN.1 schema for this object
    return (new asn1js.Sequence({
      value: Array.from(this.values, element => element.toSchema())
    }));
    //#endregion
  }

  /**
   * Conversion for the class to JSON object
   * @returns
   */
  public toJSON(): any {
    return {
      extensions: Array.from(this.values, element => element.toJSON())
    };
  }

}

