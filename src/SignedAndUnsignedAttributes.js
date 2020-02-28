import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import Attribute from "./Attribute.js";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class SignedAndUnsignedAttributes
{
	//**********************************************************************************
	/**
	 * Constructor for SignedAndUnsignedAttributes class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc type
		 */
		this.type = getParametersValue(parameters, "type", SignedAndUnsignedAttributes.defaultValues("type"));
		/**
		 * @type {Array}
		 * @desc attributes
		 */
		this.attributes = getParametersValue(parameters, "attributes", SignedAndUnsignedAttributes.defaultValues("attributes"));
		/**
		 * @type {ArrayBuffer}
		 * @desc encodedValue Need to have it in order to successfully process with signature verification
		 */
		this.encodedValue = getParametersValue(parameters, "encodedValue", SignedAndUnsignedAttributes.defaultValues("encodedValue"));
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
				return (-1);
			case "attributes":
				return [];
			case "encodedValue":
				return new ArrayBuffer(0);
			default:
				throw new Error(`Invalid member name for SignedAndUnsignedAttributes class: ${memberName}`);
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
			case "type":
				return (memberValue === SignedAndUnsignedAttributes.defaultValues("type"));
			case "attributes":
				return (memberValue.length === 0);
			case "encodedValue":
				return (memberValue.byteLength === 0);
			default:
				throw new Error(`Invalid member name for SignedAndUnsignedAttributes class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * SignedAttributes ::= SET SIZE (1..MAX) OF Attribute
	 *
	 * UnsignedAttributes ::= SET SIZE (1..MAX) OF Attribute
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
		 * @property {number} [tagNumber]
		 * @property {string} [attributes]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Constructed({
			name: (names.blockName || ""),
			optional: true,
			idBlock: {
				tagClass: 3, // CONTEXT-SPECIFIC
				tagNumber: names.tagNumber // "SignedAttributes" = 0, "UnsignedAttributes" = 1
			},
			value: [
				new asn1js.Repeated({
					name: (names.attributes || ""),
					value: Attribute.schema()
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
			"attributes"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			SignedAndUnsignedAttributes.schema({
				names: {
					tagNumber: this.type,
					attributes: "attributes"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for SignedAndUnsignedAttributes");
		//endregion

		//region Get internal properties from parsed schema
		this.type = asn1.result.idBlock.tagNumber;
		this.encodedValue = asn1.result.valueBeforeDecode;

		//region Change type from "[0]" to "SET" accordingly to standard
		const encodedView = new Uint8Array(this.encodedValue);
		encodedView[0] = 0x31;
		//endregion

		if(("attributes" in asn1.result) === false)
		{
			if(this.type === 0)
				throw new Error("Wrong structure of SignedUnsignedAttributes");
			else
				return; // Not so important in case of "UnsignedAttributes"
		}

		this.attributes = Array.from(asn1.result.attributes, element => new Attribute({ schema: element }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		if(SignedAndUnsignedAttributes.compareWithDefault("type", this.type) || SignedAndUnsignedAttributes.compareWithDefault("attributes", this.attributes))
			throw new Error("Incorrectly initialized \"SignedAndUnsignedAttributes\" class");
		
		//region Construct and return new ASN.1 schema for this object
		return (new asn1js.Constructed({
			optional: true,
			idBlock: {
				tagClass: 3, // CONTEXT-SPECIFIC
				tagNumber: this.type // "SignedAttributes" = 0, "UnsignedAttributes" = 1
			},
			value: Array.from(this.attributes, element => element.toSchema())
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
		if(SignedAndUnsignedAttributes.compareWithDefault("type", this.type) || SignedAndUnsignedAttributes.compareWithDefault("attributes", this.attributes))
			throw new Error("Incorrectly initialized \"SignedAndUnsignedAttributes\" class");
		
		return {
			type: this.type,
			attributes: Array.from(this.attributes, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
