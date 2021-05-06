import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
//**************************************************************************************
/**
 * Class from RFC3739
 */
export class QCStatement
{
	//**********************************************************************************
	/**
	 * Constructor for QCStatement class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 */
		this.id = getParametersValue(parameters, "id", QCStatement.defaultValues("id"));

		if("type" in parameters)
		{
			/**
			 * @type {*} Any data described by "id"
			 */
			this.type = getParametersValue(parameters, "type", QCStatement.defaultValues("type"));
		}
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "id":
				return "";
			case "type":
				return new asn1js.Null();
			default:
				throw new Error(`Invalid member name for QCStatement class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "id":
				return (memberValue === "");
			case "type":
				return (memberValue instanceof asn1js.Null);
			default:
				throw new Error(`Invalid member name for QCStatement class: ${memberName}`);
		}
	}
	//**********************************************************************************
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
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [id]
		 * @property {string} [type]
		 */
		const names = getParametersValue(parameters, "names", {});

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
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"id",
			"type"
		]);
		//endregion

		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			QCStatement.schema({
				names: {
					id: "id",
					type: "type"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for QCStatement");
		//endregion

		//region Get internal properties from parsed schema
		this.id = asn1.result.id.valueBlock.toString();

		if("type" in asn1.result)
			this.type = asn1.result.type;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		const value = [
			new asn1js.ObjectIdentifier({ value: this.id })
		];

		if("type" in this)
			value.push(this.type);

		//region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const object = {
			id: this.id
		};

		if("type" in this)
			object.type = this.type.toJSON();

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Class from RFC3739
 */
export default class QCStatements
{
	//**********************************************************************************
	/**
	 * Constructor for QCStatements class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array<QCStatement>}
		 */
		this.values = getParametersValue(parameters, "values", QCStatements.defaultValues("values"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	static defaultValues(memberName)
	{
		switch(memberName)
		{
			case "values":
				return [];
			default:
				throw new Error(`Invalid member name for QCStatements class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Compare values with default values for all class members
	 * @param {string} memberName String name for a class member
	 * @param {*} memberValue Value to compare with default value
	 */
	static compareWithDefault(memberName, memberValue)
	{
		switch(memberName)
		{
			case "values":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for QCStatements class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * QCStatements ::= SEQUENCE OF QCStatement
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [values]
		 */
		const names = getParametersValue(parameters, "names", {});

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
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Clear input data first
		clearProps(schema, [
			"values"
		]);
		//endregion

		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			QCStatements.schema({
				names: {
					values: "values"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for QCStatements");
		//endregion

		//region Get internal properties from parsed schema
		this.values = Array.from(asn1.result.values, element => new QCStatement({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: Array.from(this.values, element => element.toSchema())
		}));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {
			extensions: Array.from(this.values, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
