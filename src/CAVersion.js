import * as asn1js from "asn1js";
import { getParametersValue, utilConcatBuf } from "pvutils";
//**************************************************************************************
/**
 * Class from https://docs.microsoft.com/en-us/windows/desktop/seccrypto/certification-authority-renewal
 */
export default class CAVersion
{
	//**********************************************************************************
	/**
	 * Constructor for CAVersion class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc certificateIndex
		 */
		this.certificateIndex = getParametersValue(parameters, "certificateIndex", CAVersion.defaultValues("certificateIndex"));

		/**
		 * @type {number}
		 * @desc keyIndex
		 */
		this.keyIndex = getParametersValue(parameters, "keyIndex", CAVersion.defaultValues("keyIndex"));
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
			case "certificateIndex":
			case "keyIndex":
				return 0;
			default:
				throw new Error(`Invalid member name for CAVersion class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * CAVersion ::= INTEGER
	 * ```
	 *
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		return (new asn1js.Integer());
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
		//region Check the schema is valid
		if(schema.constructor.blockName() !== asn1js.Integer.blockName())
			throw new Error("Object's schema was not verified against input data for CAVersion");
		//endregion

		//region Check length of the input value and correct it if needed
		let value = schema.valueBlock.valueHex.slice(0);
		const valueView = new Uint8Array(value);

		switch(true)
		{
			case (value.byteLength < 4):
				{
					const tempValue = new ArrayBuffer(4);
					const tempValueView = new Uint8Array(tempValue);

					tempValueView.set(valueView, 4 - value.byteLength);

					value = tempValue.slice(0);
				}
				break;
			case (value.byteLength > 4):
				{
					const tempValue = new ArrayBuffer(4);
					const tempValueView = new Uint8Array(tempValue);

					tempValueView.set(valueView.slice(0, 4));

					value = tempValue.slice(0);
				}
				break;
			default:
		}
		//endregion

		//region Get internal properties from parsed schema
		const keyIndexBuffer = value.slice(0, 2);
		const keyIndexView8 = new Uint8Array(keyIndexBuffer);
		let temp = keyIndexView8[0];
		keyIndexView8[0] = keyIndexView8[1];
		keyIndexView8[1] = temp;

		const keyIndexView16 = new Uint16Array(keyIndexBuffer);

		this.keyIndex = keyIndexView16[0];

		const certificateIndexBuffer = value.slice(2);
		const certificateIndexView8 = new Uint8Array(certificateIndexBuffer);
		temp = certificateIndexView8[0];
		certificateIndexView8[0] = certificateIndexView8[1];
		certificateIndexView8[1] = temp;

		const certificateIndexView16 = new Uint16Array(certificateIndexBuffer);

		this.certificateIndex = certificateIndexView16[0];
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		//region Create raw values
		const certificateIndexBuffer = new ArrayBuffer(2);
		const certificateIndexView = new Uint16Array(certificateIndexBuffer);

		certificateIndexView[0] = this.certificateIndex;

		const certificateIndexView8 = new Uint8Array(certificateIndexBuffer);
		let temp = certificateIndexView8[0];
		certificateIndexView8[0] = certificateIndexView8[1];
		certificateIndexView8[1] = temp;

		const keyIndexBuffer = new ArrayBuffer(2);
		const keyIndexView = new Uint16Array(keyIndexBuffer);

		keyIndexView[0] = this.keyIndex;

		const keyIndexView8 = new Uint8Array(keyIndexBuffer);
		temp = keyIndexView8[0];
		keyIndexView8[0] = keyIndexView8[1];
		keyIndexView8[1] = temp;
		//endregion

		//region Construct and return new ASN.1 schema for this object
		return (new asn1js.Integer({
			valueHex: utilConcatBuf(keyIndexBuffer, certificateIndexBuffer)
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
			certificateIndex: this.certificateIndex,
			keyIndex: this.keyIndex
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
