import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
//**************************************************************************************
/**
 * Class from RFC5280
 */
export default class PolicyMapping
{
	//**********************************************************************************
	/**
	 * Constructor for PolicyMapping class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc issuerDomainPolicy
		 */
		this.issuerDomainPolicy = getParametersValue(parameters, "issuerDomainPolicy", PolicyMapping.defaultValues("issuerDomainPolicy"));
		/**
		 * @type {string}
		 * @desc subjectDomainPolicy
		 */
		this.subjectDomainPolicy = getParametersValue(parameters, "subjectDomainPolicy", PolicyMapping.defaultValues("subjectDomainPolicy"));
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
			case "issuerDomainPolicy":
				return "";
			case "subjectDomainPolicy":
				return "";
			default:
				throw new Error(`Invalid member name for PolicyMapping class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PolicyMapping ::= SEQUENCE {
	 *    issuerDomainPolicy      CertPolicyId,
	 *    subjectDomainPolicy     CertPolicyId }
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
		 * @property {string} [issuerDomainPolicy]
		 * @property {string} [subjectDomainPolicy]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.issuerDomainPolicy || "") }),
				new asn1js.ObjectIdentifier({ name: (names.subjectDomainPolicy || "") })
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
			"issuerDomainPolicy",
			"subjectDomainPolicy"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			PolicyMapping.schema({
				names: {
					issuerDomainPolicy: "issuerDomainPolicy",
					subjectDomainPolicy: "subjectDomainPolicy"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for PolicyMapping");
		//endregion

		//region Get internal properties from parsed schema
		this.issuerDomainPolicy = asn1.result.issuerDomainPolicy.valueBlock.toString();
		this.subjectDomainPolicy = asn1.result.subjectDomainPolicy.valueBlock.toString();
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
				new asn1js.ObjectIdentifier({ value: this.issuerDomainPolicy }),
				new asn1js.ObjectIdentifier({ value: this.subjectDomainPolicy })
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
			issuerDomainPolicy: this.issuerDomainPolicy,
			subjectDomainPolicy: this.subjectDomainPolicy
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
