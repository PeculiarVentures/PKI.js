import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
//**************************************************************************************
/**
 * Class from X.509-2000
 */
export default class AttributeCertificateV2
{
	//**********************************************************************************
	/**
	 * Constructor for AttributeCertificateV1 class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		// Fake constructor for now;
		this.version = {};
		this.holder = {};
		this.issuer = {};
		this.signature = {};
		this.serialNumber = {};
		this.attrCertValidityPeriod = {};
		this.attributes = {};
		this.issuerUniqueID = {};
		this.extensions = {};
	}
	//**********************************************************************************
	/**
	 * Convert parsed asn1js object into current class
	 * @param {!Object} schema
	 */
	fromSchema(schema)
	{
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema()
	{
		return (new asn1js.Any());
	}
	//**********************************************************************************
	/**
	 * Convertion for the class to JSON object
	 * @returns {Object}
	 */
	toJSON()
	{
		return {};
	}
	//**********************************************************************************
}
//**************************************************************************************
