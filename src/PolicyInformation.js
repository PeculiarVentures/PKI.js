import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import PolicyQualifierInfo from "./PolicyQualifierInfo.js";
//**************************************************************************************
/**
 * Class from RFC5280
 */
export default class PolicyInformation
{
	//**********************************************************************************
	/**
	 * Constructor for PolicyInformation class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc policyIdentifier
		 */
		this.policyIdentifier = getParametersValue(parameters, "policyIdentifier", PolicyInformation.defaultValues("policyIdentifier"));

		if("policyQualifiers" in parameters)
			/**
			 * @type {Array.<PolicyQualifierInfo>}
			 * @desc Value of the TIME class
			 */
			this.policyQualifiers = getParametersValue(parameters, "policyQualifiers", PolicyInformation.defaultValues("policyQualifiers"));
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
			case "policyIdentifier":
				return "";
			case "policyQualifiers":
				return [];
			default:
				throw new Error(`Invalid member name for PolicyInformation class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * PolicyInformation ::= SEQUENCE {
	 *    policyIdentifier   CertPolicyId,
	 *    policyQualifiers   SEQUENCE SIZE (1..MAX) OF
	 *    PolicyQualifierInfo OPTIONAL }
	 *
	 * CertPolicyId ::= OBJECT IDENTIFIER
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
		 * @property {string} [policyIdentifier]
		 * @property {string} [policyQualifiers]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.policyIdentifier || "") }),
				new asn1js.Sequence({
					optional: true,
					value: [
						new asn1js.Repeated({
							name: (names.policyQualifiers || ""),
							value: PolicyQualifierInfo.schema()
						})
					]
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
			"policyIdentifier",
			"policyQualifiers"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			PolicyInformation.schema({
				names: {
					policyIdentifier: "policyIdentifier",
					policyQualifiers: "policyQualifiers"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for PolicyInformation");
		//endregion

		//region Get internal properties from parsed schema
		this.policyIdentifier = asn1.result.policyIdentifier.valueBlock.toString();

		if("policyQualifiers" in asn1.result)
			this.policyQualifiers = Array.from(asn1.result.policyQualifiers, element => new PolicyQualifierInfo({ schema: element }));
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
		
		outputArray.push(new asn1js.ObjectIdentifier({ value: this.policyIdentifier }));
		
		if("policyQualifiers" in this)
		{
			outputArray.push(new asn1js.Sequence({
				value: Array.from(this.policyQualifiers, element => element.toSchema())
			}));
		}
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
		const object = {
			policyIdentifier: this.policyIdentifier
		};

		if("policyQualifiers" in this)
			object.policyQualifiers = Array.from(this.policyQualifiers, element => element.toJSON());

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
