import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
//**************************************************************************************
/**
 * Class from RFC5280
 */
export default class Time
{
	//**********************************************************************************
	/**
	 * Constructor for Time class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 * @property {number} [type] 0 - UTCTime; 1 - GeneralizedTime; 2 - empty value
	 * @property {Date} [value] Value of the TIME class
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc 0 - UTCTime; 1 - GeneralizedTime; 2 - empty value
		 */
		this.type = getParametersValue(parameters, "type", Time.defaultValues("type"));
		/**
		 * @type {Date}
		 * @desc Value of the TIME class
		 */
		this.value = getParametersValue(parameters, "value", Time.defaultValues("value"));
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
			case "type":
				return 0;
			case "value":
				return new Date(0, 0, 0);
			default:
				throw new Error(`Invalid member name for Time class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * Time ::= CHOICE {
     *   utcTime        UTCTime,
     *   generalTime    GeneralizedTime }
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @param {boolean} optional Flag that current schema should be optional
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {}, optional = false)
	{
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [utcTimeName] Name for "utcTimeName" choice
		 * @property {string} [generalTimeName] Name for "generalTimeName" choice
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Choice({
			optional,
			value: [
				new asn1js.UTCTime({ name: (names.utcTimeName || "") }),
				new asn1js.GeneralizedTime({ name: (names.generalTimeName || "") })
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
			"utcTimeName",
			"generalTimeName"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema, schema, Time.schema({
			names: {
				utcTimeName: "utcTimeName",
				generalTimeName: "generalTimeName"
			}
		}));

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for Time");
		//endregion

		//region Get internal properties from parsed schema
		if("utcTimeName" in asn1.result)
		{
			this.type = 0;
			this.value = asn1.result.utcTimeName.toDate();
		}
		if("generalTimeName" in asn1.result)
		{
			this.type = 1;
			this.value = asn1.result.generalTimeName.toDate();
		}
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
		let result = {};

		if(this.type === 0)
			result = new asn1js.UTCTime({ valueDate: this.value });
		if(this.type === 1)
			result = new asn1js.GeneralizedTime({ valueDate: this.value });

		return result;
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
			type: this.type,
			value: this.value
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
