import * as asn1js from "asn1js";
import { getParametersValue, utilConcatBuf, isEqualBuffer, toBase64, fromBase64, arrayBufferToString, stringToArrayBuffer } from "pvutils";
import ECNamedCurves from "./ECNamedCurves.js";
//**************************************************************************************

/**
 * Class from RFC5480
 */
export default class ECPublicKey
{

	//**********************************************************************************
	/**
	 * Constructor for ECCPublicKey class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {ArrayBuffer}
		 * @desc type
		 */
		this.x = getParametersValue(parameters, "x", ECPublicKey.defaultValues("x"));
		/**
		 * @type {ArrayBuffer}
		 * @desc values
		 */
		this.y = getParametersValue(parameters, "y", ECPublicKey.defaultValues("y"));
		/**
		 * @type {string}
		 * @desc namedCurve
		 */
		this.namedCurve = getParametersValue(parameters, "namedCurve", ECPublicKey.defaultValues("namedCurve"));
		//endregion

		//region If input argument array contains "schema" for this object
		if("schema" in parameters)
			this.fromSchema(parameters.schema);
		//endregion
		//region If input argument array contains "json" for this object
		if("json" in parameters)
			this.fromJSON(parameters.json);
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
			case "x":
			case "y":
				return new ArrayBuffer(0);
			case "namedCurve":
				return "";
			default:
				throw new Error(`Invalid member name for ECCPublicKey class: ${memberName}`);
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
			case "x":
			case "y":
				return (isEqualBuffer(memberValue, ECPublicKey.defaultValues(memberName)));
			case "namedCurve":
				return (memberValue === "");
			default:
				throw new Error(`Invalid member name for ECCPublicKey class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		return new asn1js.RawData();
	}
	//**********************************************************************************
	/**
	 * Convert ArrayBuffer into current class
	 * @param {!ArrayBuffer} schema Special case: schema is an ArrayBuffer
	 */
	fromSchema(schema)
	{
		//region Check the schema is valid
		if((schema instanceof ArrayBuffer) === false)
			throw new Error("Object's schema was not verified against input data for ECPublicKey");

		const view = new Uint8Array(schema);
		if(view[0] !== 0x04)
			throw new Error("Object's schema was not verified against input data for ECPublicKey");
		//endregion

		//region Get internal properties from parsed schema
		const namedCurve = ECNamedCurves.find(this.namedCurve);
		if (!namedCurve) {
			throw new Error(`Incorrect curve OID: ${this.namedCurve}`);
		}
		const coordinateLength = namedCurve.size;

		if(schema.byteLength !== (coordinateLength * 2 + 1))
			throw new Error("Object's schema was not verified against input data for ECPublicKey");

		this.x = schema.slice(1, coordinateLength + 1);
		this.y = schema.slice(1 + coordinateLength, coordinateLength * 2 + 1);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		return new asn1js.RawData({ data: utilConcatBuf(
			(new Uint8Array([0x04])).buffer,
			this.x,
			this.y
		)
		});
	}
	//**********************************************************************************
	/**
	 * Conversion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		const namedCurve = ECNamedCurves.find(this.namedCurve);

		return {
			crv: namedCurve ? namedCurve.name : this.namedCurve,
			x: toBase64(arrayBufferToString(this.x), true, true, false),
			y: toBase64(arrayBufferToString(this.y), true, true, false)
		};
	}
	//**********************************************************************************
	/**
	 * Convert JSON value into current object
	 * @param {Object} json
	 */
	fromJSON(json)
	{
		let coordinateLength = 0;

		if("crv" in json)
		{
			const namedCurve = ECNamedCurves.find(json.crv);
			if (namedCurve) {
				this.namedCurve = namedCurve.id;
				coordinateLength = namedCurve.size;
			}
		}
		else
			throw new Error("Absent mandatory parameter \"crv\"");

		if("x" in json)
		{
			const convertBuffer = stringToArrayBuffer(fromBase64(json.x, true));

			if(convertBuffer.byteLength < coordinateLength)
			{
				this.x = new ArrayBuffer(coordinateLength);
				const view = new Uint8Array(this.x);
				const convertBufferView = new Uint8Array(convertBuffer);
				view.set(convertBufferView, 1);
			}
			else
				this.x = convertBuffer.slice(0, coordinateLength);
		}
		else
			throw new Error("Absent mandatory parameter \"x\"");

		if("y" in json)
		{
			const convertBuffer = stringToArrayBuffer(fromBase64(json.y, true));

			if(convertBuffer.byteLength < coordinateLength)
			{
				this.y = new ArrayBuffer(coordinateLength);
				const view = new Uint8Array(this.y);
				const convertBufferView = new Uint8Array(convertBuffer);
				view.set(convertBufferView, 1);
			}
			else
				this.y = convertBuffer.slice(0, coordinateLength);
		}
		else
			throw new Error("Absent mandatory parameter \"y\"");
	}
	//**********************************************************************************
}
//**************************************************************************************
