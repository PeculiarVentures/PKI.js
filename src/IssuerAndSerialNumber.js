import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import RelativeDistinguishedNames from "./RelativeDistinguishedNames.js";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class IssuerAndSerialNumber
{
	//**********************************************************************************
	/**
	 * Constructor for IssuerAndSerialNumber class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {RelativeDistinguishedNames}
		 * @desc issuer
		 */
		this.issuer = getParametersValue(parameters, "issuer", IssuerAndSerialNumber.defaultValues("issuer"));
		/**
		 * @type {Integer}
		 * @desc serialNumber
		 */
		this.serialNumber = getParametersValue(parameters, "serialNumber", IssuerAndSerialNumber.defaultValues("serialNumber"));
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
			case "issuer":
				return new RelativeDistinguishedNames();
			case "serialNumber":
				return new asn1js.Integer();
			default:
				throw new Error(`Invalid member name for IssuerAndSerialNumber class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * IssuerAndSerialNumber ::= SEQUENCE {
	 *    issuer Name,
	 *    serialNumber CertificateSerialNumber }
	 *
	 * CertificateSerialNumber ::= INTEGER
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
		 * @property {string} [issuer]
		 * @property {string} [serialNumber]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				RelativeDistinguishedNames.schema(names.issuer || {}),
				new asn1js.Integer({ name: (names.serialNumber || "") })
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
			"issuer",
			"serialNumber"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			IssuerAndSerialNumber.schema({
				names: {
					issuer: {
						names: {
							blockName: "issuer"
						}
					},
					serialNumber: "serialNumber"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for IssuerAndSerialNumber");
		//endregion

		//region Get internal properties from parsed schema
		this.issuer = new RelativeDistinguishedNames({ schema: asn1.result.issuer });
		this.serialNumber = asn1.result.serialNumber;
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
				this.issuer.toSchema(),
				this.serialNumber
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
			issuer: this.issuer.toJSON(),
			serialNumber: this.serialNumber.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
