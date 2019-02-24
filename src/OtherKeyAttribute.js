import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class OtherKeyAttribute
{
	//**********************************************************************************
	/**
	 * Constructor for OtherKeyAttribute class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc keyAttrId
		 */
		this.keyAttrId = getParametersValue(parameters, "keyAttrId", OtherKeyAttribute.defaultValues("keyAttrId"));

		if("keyAttr" in parameters)
			/**
			 * @type {*}
			 * @desc keyAttr
			 */
			this.keyAttr = getParametersValue(parameters, "keyAttr", OtherKeyAttribute.defaultValues("keyAttr"));
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
			case "keyAttrId":
				return "";
			case "keyAttr":
				return {};
			default:
				throw new Error(`Invalid member name for OtherKeyAttribute class: ${memberName}`);
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
			case "keyAttrId":
				return (memberValue === "");
			case "keyAttr":
				return (Object.keys(memberValue).length === 0);
			default:
				throw new Error(`Invalid member name for OtherKeyAttribute class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * OtherKeyAttribute ::= SEQUENCE {
	 *    keyAttrId OBJECT IDENTIFIER,
	 *    keyAttr ANY DEFINED BY keyAttrId OPTIONAL }
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
		 * @property {string} [optional]
		 * @property {string} [keyAttrId]
		 * @property {string} [keyAttr]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			optional: (names.optional || true),
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.keyAttrId || "") }),
				new asn1js.Any({
					optional: true,
					name: (names.keyAttr || "")
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
			"keyAttrId",
			"keyAttr"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			OtherKeyAttribute.schema({
				names: {
					keyAttrId: "keyAttrId",
					keyAttr: "keyAttr"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OtherKeyAttribute");
		//endregion

		//region Get internal properties from parsed schema
		this.keyAttrId = asn1.result.keyAttrId.valueBlock.toString();

		if("keyAttr" in asn1.result)
			this.keyAttr = asn1.result.keyAttr;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create array for output sequence
		const outputArray = [];

		outputArray.push(new asn1js.ObjectIdentifier({ value: this.keyAttrId }));

		if("keyAttr" in this)
			outputArray.push(this.keyAttr);
		//endregion

		//region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: outputArray
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
			keyAttrId: this.keyAttrId
		};

		if("keyAttr" in this)
			_object.keyAttr = this.keyAttr.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************
