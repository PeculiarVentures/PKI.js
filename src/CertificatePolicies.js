import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import PolicyInformation from "./PolicyInformation";
//**************************************************************************************
/**
 * Class from RFC5280
 */
export default class CertificatePolicies
{
	//**********************************************************************************
	/**
	 * Constructor for CertificatePolicies class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<PolicyInformation>}
		 * @description certificatePolicies
		 */
		this.certificatePolicies = getParametersValue(parameters, "certificatePolicies", CertificatePolicies.defaultValues("certificatePolicies"));
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
			case "certificatePolicies":
				return [];
			default:
				throw new Error(`Invalid member name for CertificatePolicies class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of asn1js schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		// CertificatePolicies OID ::= 2.5.29.32
		//
		//certificatePolicies ::= SEQUENCE SIZE (1..MAX) OF PolicyInformation

		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [certificatePolicies]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Repeated({
					name: (names.certificatePolicies || ""),
					value: PolicyInformation.schema()
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
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			CertificatePolicies.schema({
				names: {
					certificatePolicies: "certificatePolicies"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CertificatePolicies");
		//endregion

		//region Get internal properties from parsed schema
		this.certificatePolicies = Array.from(asn1.result.certificatePolicies, element => new PolicyInformation({ schema: element }));
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
			value: Array.from(this.certificatePolicies, element => element.toSchema())
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
			certificatePolicies: Array.from(this.certificatePolicies, element => element.toJSON())
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
