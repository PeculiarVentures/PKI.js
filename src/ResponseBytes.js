import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
//**************************************************************************************
/**
 * Class from RFC6960
 */
export default class ResponseBytes
{
	//**********************************************************************************
	/**
	 * Constructor for ResponseBytes class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @description responseType
		 */
		this.responseType = getParametersValue(parameters, "responseType", ResponseBytes.defaultValues("responseType"));
		/**
		 * @type {OctetString}
		 * @description response
		 */
		this.response = getParametersValue(parameters, "response", ResponseBytes.defaultValues("response"));
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
			case "responseType":
				return "";
			case "response":
				return new asn1js.OctetString();
			default:
				throw new Error(`Invalid member name for ResponseBytes class: ${memberName}`);
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
			case "responseType":
				return (memberValue === "");
			case "response":
				return (memberValue.isEqual(ResponseBytes.defaultValues(memberName)));
			default:
				throw new Error(`Invalid member name for ResponseBytes class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of asn1js schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		//ResponseBytes ::=       SEQUENCE {
		//    responseType   OBJECT IDENTIFIER,
		//    response       OCTET STRING }

		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [responseType]
		 * @property {string} [response]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.responseType || "") }),
				new asn1js.OctetString({ name: (names.response || "") })
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
			ResponseBytes.schema({
				names: {
					responseType: "responseType",
					response: "response"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for ResponseBytes");
		//endregion

		//region Get internal properties from parsed schema
		this.responseType = asn1.result.responseType.valueBlock.toString();
		this.response = asn1.result.response;
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
			value: [
				new asn1js.ObjectIdentifier({ value: this.responseType }),
				this.response
			]
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
			responseType: this.responseType,
			response: this.response.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
