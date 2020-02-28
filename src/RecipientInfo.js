import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import KeyTransRecipientInfo from "./KeyTransRecipientInfo.js";
import KeyAgreeRecipientInfo from "./KeyAgreeRecipientInfo.js";
import KEKRecipientInfo from "./KEKRecipientInfo.js";
import PasswordRecipientinfo from "./PasswordRecipientinfo.js";
import OtherRecipientInfo from "./OtherRecipientInfo.js";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class RecipientInfo
{
	//**********************************************************************************
	/**
	 * Constructor for RecipientInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc variant
		 */
		this.variant = getParametersValue(parameters, "variant", RecipientInfo.defaultValues("variant"));

		if("value" in parameters)
			/**
			 * @type {*}
			 * @desc value
			 */
			this.value = getParametersValue(parameters, "value", RecipientInfo.defaultValues("value"));
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
				throw new Error(`Invalid member name for RecipientInfo class: ${memberName}`);
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
				return (memberValue === RecipientInfo.defaultValues(memberName));
			case "value":
				return (Object.keys(memberValue).length === 0);
			default:
				throw new Error(`Invalid member name for RecipientInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * RecipientInfo ::= CHOICE {
	 *    ktri KeyTransRecipientInfo,
	 *    kari [1] KeyAgreeRecipientInfo,
	 *    kekri [2] KEKRecipientInfo,
	 *    pwri [3] PasswordRecipientinfo,
	 *    ori [4] OtherRecipientInfo }
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
		 * @property {string} [type]
		 * @property {string} [setName]
		 * @property {string} [values]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Choice({
			value: [
				KeyTransRecipientInfo.schema({
					names: {
						blockName: (names.blockName || "")
					}
				}),
				new asn1js.Constructed({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: KeyAgreeRecipientInfo.schema().valueBlock.value
				}),
				new asn1js.Constructed({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					},
					value: KEKRecipientInfo.schema().valueBlock.value
				}),
				new asn1js.Constructed({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 3 // [3]
					},
					value: PasswordRecipientinfo.schema().valueBlock.value
				}),
				new asn1js.Constructed({
					name: (names.blockName || ""),
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 4 // [4]
					},
					value: OtherRecipientInfo.schema().valueBlock.value
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
			RecipientInfo.schema({
				names: {
					blockName: "blockName"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RecipientInfo");
		//endregion

		//region Get internal properties from parsed schema
		if(asn1.result.blockName.idBlock.tagClass === 1)
		{
			this.variant = 1;
			this.value = new KeyTransRecipientInfo({ schema: asn1.result.blockName });
		}
		else
		{
			//region Create "SEQUENCE" from "ASN1_CONSTRUCTED"
			const blockSequence = new asn1js.Sequence({
				value: asn1.result.blockName.valueBlock.value
			});
			//endregion

			switch(asn1.result.blockName.idBlock.tagNumber)
			{
				case 1:
					this.variant = 2;
					this.value = new KeyAgreeRecipientInfo({ schema: blockSequence });
					break;
				case 2:
					this.variant = 3;
					this.value = new KEKRecipientInfo({ schema: blockSequence });
					break;
				case 3:
					this.variant = 4;
					this.value = new PasswordRecipientinfo({ schema: blockSequence });
					break;
				case 4:
					this.variant = 5;
					this.value = new OtherRecipientInfo({ schema: blockSequence });
					break;
				default:
					throw new Error("Incorrect structure of RecipientInfo block");
			}
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
		const _schema = this.value.toSchema();

		switch(this.variant)
		{
			case 1:
				return _schema;
			case 2:
			case 3:
			case 4:
				//region Create "ASN1_CONSTRUCTED" from "SEQUENCE"
				_schema.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
				_schema.idBlock.tagNumber = (this.variant - 1);
				//endregion

				return _schema;
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

		if((this.variant >= 1) && (this.variant <= 4))
			_object.value = this.value.toJSON();

		return _object;
	}
	//**********************************************************************************
}
//**************************************************************************************
