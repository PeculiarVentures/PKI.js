import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import IssuerAndSerialNumber from "./IssuerAndSerialNumber.js";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class RecipientIdentifier
{
	//**********************************************************************************
	/**
	 * Constructor for RecipientIdentifier class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc variant
		 */
		this.variant = getParametersValue(parameters, "variant", RecipientIdentifier.defaultValues("variant"));

		if("value" in parameters)
			/**
			 * @type {*}
			 * @desc value
			 */
			this.value = getParametersValue(parameters, "value", RecipientIdentifier.defaultValues("value"));
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
			case "variant":
				return (-1);
			case "value":
				return {};
			default:
				throw new Error(`Invalid member name for RecipientIdentifier class: ${memberName}`);
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
			case "variant":
				return (memberValue === (-1));
			case "values":
				return (Object.keys(memberValue).length === 0);
			default:
				throw new Error(`Invalid member name for RecipientIdentifier class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RecipientIdentifier ::= CHOICE {
	 *    issuerAndSerialNumber IssuerAndSerialNumber,
	 *    subjectKeyIdentifier [0] SubjectKeyIdentifier }
	 *
	 * SubjectKeyIdentifier ::= OCTET STRING
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
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Choice({
			value: [
				IssuerAndSerialNumber.schema({
					names: {
						blockName: (names.blockName || "")
					}
				}),
				new asn1js.Primitive({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					}
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
			"blockName"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			RecipientIdentifier.schema({
				names: {
					blockName: "blockName"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RecipientIdentifier");
		//endregion

		//region Get internal properties from parsed schema
		if(asn1.result.blockName.idBlock.tagClass === 1)
		{
			this.variant = 1;
			this.value = new IssuerAndSerialNumber({ schema: asn1.result.blockName });
		}
		else
		{
			this.variant = 2;
			this.value = new asn1js.OctetString({ valueHex: asn1.result.blockName.valueBlock.valueHex }) ;
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
		switch(this.variant)
		{
			case 1:
				return this.value.toSchema();
			case 2:
				return new asn1js.Primitive({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					valueHex: this.value.valueBlock.valueHex
				});
			default:
				return new asn1js.Any();
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const _object = {
			variant: this.variant
		};

		if((this.variant === 1) || (this.variant === 2))
			_object.value = this.value.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************
