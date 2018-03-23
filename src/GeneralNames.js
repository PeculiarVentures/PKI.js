import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import GeneralName from "./GeneralName.js";
//**************************************************************************************
/**
 * Class from RFC5280
 */
export default class GeneralNames
{
	//**********************************************************************************
	/**
	 * Constructor for GeneralNames class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<GeneralName>}
		 * @description Array of "general names"
		 */
		this.names = getParametersValue(parameters, "names", GeneralNames.defaultValues("names"));
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
			case "names":
				return [];
			default:
				throw new Error(`Invalid member name for GeneralNames class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of asn1js schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {}, optional = false)
	{
		/**
		 * @type {Object}
		 * @property {string} utcTimeName Name for "utcTimeName" choice
		 * @property {string} generalTimeName Name for "generalTimeName" choice
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			optional,
			name: (names.blockName || ""),
			value: [
				new asn1js.Repeated({
					name: (names.generalNames || ""),
					value: GeneralName.schema()
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
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			GeneralNames.schema({
				names: {
					blockName: "names",
					generalNames: "generalNames"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for GeneralNames");
		//endregion

		//region Get internal properties from parsed schema
		this.names = Array.from(asn1.result.generalNames, element => new GeneralName({ schema: element }));
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
			value: Array.from(this.names, element => element.toSchema())
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
			names: Array.from(this.names, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
