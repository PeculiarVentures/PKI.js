import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import SafeBag from "./SafeBag.js";
//**************************************************************************************
/**
 * Class from RFC7292
 */
export default class SafeContents
{
	//**********************************************************************************
	/**
	 * Constructor for SafeContents class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<SafeBag>}
		 * @desc safeBags
		 */
		this.safeBags = getParametersValue(parameters, "safeBags", SafeContents.defaultValues("safeBags"));
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
			case "safeBags":
				return [];
			default:
				throw new Error(`Invalid member name for SafeContents class: ${memberName}`);
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
			case "safeBags":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for SafeContents class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * SafeContents ::= SEQUENCE OF SafeBag
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
		 * @property {string} [safeBags]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Repeated({
					name: (names.safeBags || ""),
					value: SafeBag.schema()
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
			"safeBags"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			SafeContents.schema({
				names: {
					safeBags: "safeBags"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for SafeContents");
		//endregion
		
		//region Get internal properties from parsed schema
		this.safeBags = Array.from(asn1.result.safeBags, element => new SafeBag({ schema: element }));
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
			value: Array.from(this.safeBags, element => element.toSchema())
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
			safeBags: Array.from(this.safeBags, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
