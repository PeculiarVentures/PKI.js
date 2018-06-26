import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import CertificateRevocationList from "./CertificateRevocationList.js";
//**************************************************************************************
/**
 * Class from RFC7292
 */
export default class CRLBag
{
	//**********************************************************************************
	/**
	 * Constructor for CRLBag class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc crlId
		 */
		this.crlId = getParametersValue(parameters, "crlId", CRLBag.defaultValues("crlId"));
		/**
		 * @type {*}
		 * @desc crlValue
		 */
		this.crlValue = getParametersValue(parameters, "crlValue", CRLBag.defaultValues("crlValue"));
		
		if("parsedValue" in parameters)
			/**
			 * @type {*}
			 * @desc parsedValue
			 */
			this.parsedValue = getParametersValue(parameters, "parsedValue", CRLBag.defaultValues("parsedValue"));
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
			case "crlId":
				return "";
			case "crlValue":
				return (new asn1js.Any());
			case "parsedValue":
				return {};
			default:
				throw new Error(`Invalid member name for CRLBag class: ${memberName}`);
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
			case "crlId":
				return (memberValue === "");
			case "crlValue":
				return (memberValue instanceof asn1js.Any);
			case "parsedValue":
				return ((memberValue instanceof Object) && (Object.keys(memberValue).length === 0));
			default:
				throw new Error(`Invalid member name for CRLBag class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * CRLBag ::= SEQUENCE {
	 *    crlId     	BAG-TYPE.&id ({CRLTypes}),
	 *    crlValue 	[0] EXPLICIT BAG-TYPE.&Type ({CRLTypes}{@crlId})
	 *}
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
		 * @property {string} [id]
		 * @property {string} [value]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.id || "id") }),
				new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [new asn1js.Any({ name: (names.value || "value") })] // EXPLICIT ANY value
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
			"crlId",
			"crlValue"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			CRLBag.schema({
				names: {
					id: "crlId",
					value: "crlValue"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CRLBag");
		//endregion
		
		//region Get internal properties from parsed schema
		this.crlId = asn1.result.crlId.valueBlock.toString();
		this.crlValue = asn1.result.crlValue;
		
		switch(this.crlId)
		{
			case "1.2.840.113549.1.9.23.1": // x509CRL
				{
					const asn1Inner = asn1js.fromBER(this.certValue.valueBlock.valueHex);
					this.parsedValue = new CertificateRevocationList({ schema: asn1Inner.result });
				}
				break;
			default:
				throw new Error(`Incorrect "crlId" value in CRLBag: ${this.crlId}`);
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
		if("parsedValue" in this)
		{
			this.certId = "1.2.840.113549.1.9.23.1";
			this.certValue = new asn1js.OctetString({ valueHex: this.parsedValue.toSchema().toBER(false) });
		}
		
		return (new asn1js.Sequence({
			value: [
				new asn1js.ObjectIdentifier({ value: this.crlId }),
				new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [this.crlValue.toSchema()]
				})
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
			crlId: this.crlId,
			crlValue: this.crlValue.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
