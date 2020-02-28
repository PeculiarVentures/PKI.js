import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class OtherRecipientInfo
{
	//**********************************************************************************
	/**
	 * Constructor for OtherRecipientInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc oriType
		 */
		this.oriType = getParametersValue(parameters, "oriType", OtherRecipientInfo.defaultValues("oriType"));
		/**
		 * @type {*}
		 * @desc oriValue
		 */
		this.oriValue = getParametersValue(parameters, "oriValue", OtherRecipientInfo.defaultValues("oriValue"));
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
			case "oriType":
				return "";
			case "oriValue":
				return {};
			default:
				throw new Error(`Invalid member name for OtherRecipientInfo class: ${memberName}`);
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
			case "oriType":
				return (memberValue === "");
			case "oriValue":
				return (Object.keys(memberValue).length === 0);
			default:
				throw new Error(`Invalid member name for OtherRecipientInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * OtherRecipientInfo ::= SEQUENCE {
	 *    oriType OBJECT IDENTIFIER,
	 *    oriValue ANY DEFINED BY oriType }
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
		 * @property {string} [oriType]
		 * @property {string} [oriValue]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.oriType || "") }),
				new asn1js.Any({ name: (names.oriValue || "") })
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
			"oriType",
			"oriValue"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			OtherRecipientInfo.schema({
				names: {
					oriType: "oriType",
					oriValue: "oriValue"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OtherRecipientInfo");
		//endregion

		//region Get internal properties from parsed schema
		this.oriType = asn1.result.oriType.valueBlock.toString();
		this.oriValue = asn1.result.oriValue;
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
				new asn1js.ObjectIdentifier({ value: this.oriType }),
				this.oriValue
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
		const _object = {
			oriType: this.oriType
		};

		if(OtherRecipientInfo.compareWithDefault("oriValue", this.oriValue) === false)
			_object.oriValue = this.oriValue.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************
