import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import KeyAgreeRecipientIdentifier from "./KeyAgreeRecipientIdentifier.js";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class RecipientEncryptedKey
{
	//**********************************************************************************
	/**
	 * Constructor for RecipientEncryptedKey class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {KeyAgreeRecipientIdentifier}
		 * @desc rid
		 */
		this.rid = getParametersValue(parameters, "rid", RecipientEncryptedKey.defaultValues("rid"));
		/**
		 * @type {OctetString}
		 * @desc encryptedKey
		 */
		this.encryptedKey = getParametersValue(parameters, "encryptedKey", RecipientEncryptedKey.defaultValues("encryptedKey"));
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
			case "rid":
				return new KeyAgreeRecipientIdentifier();
			case "encryptedKey":
				return new asn1js.OctetString();
			default:
				throw new Error(`Invalid member name for RecipientEncryptedKey class: ${memberName}`);
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
			case "rid":
				return ((memberValue.variant === (-1)) && (("value" in memberValue) === false));
			case "encryptedKey":
				return (memberValue.isEqual(RecipientEncryptedKey.defaultValues("encryptedKey")));
			default:
				throw new Error(`Invalid member name for RecipientEncryptedKey class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RecipientEncryptedKey ::= SEQUENCE {
	 *    rid KeyAgreeRecipientIdentifier,
	 *    encryptedKey EncryptedKey }
	 *
	 * EncryptedKey ::= OCTET STRING
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
		 * @property {string} [rid]
		 * @property {string} [encryptedKey]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				KeyAgreeRecipientIdentifier.schema(names.rid || {}),
				new asn1js.OctetString({ name: (names.encryptedKey || "") })
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
			"rid",
			"encryptedKey"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			RecipientEncryptedKey.schema({
				names: {
					rid: {
						names: {
							blockName: "rid"
						}
					},
					encryptedKey: "encryptedKey"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RecipientEncryptedKey");
		//endregion

		//region Get internal properties from parsed schema
		this.rid = new KeyAgreeRecipientIdentifier({ schema: asn1.result.rid });
		this.encryptedKey = asn1.result.encryptedKey;
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
				this.rid.toSchema(),
				this.encryptedKey
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
			rid: this.rid.toJSON(),
			encryptedKey: this.encryptedKey.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
