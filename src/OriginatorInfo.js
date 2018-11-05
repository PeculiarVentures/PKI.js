import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import CertificateSet from "./CertificateSet.js";
import RevocationInfoChoices from "./RevocationInfoChoices.js";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class OriginatorInfo
{
	//**********************************************************************************
	/**
	 * Constructor for OriginatorInfo class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		if("certs" in parameters)
			/**
			 * @type {CertificateSet}
			 * @desc certs
			 */
			this.certs = getParametersValue(parameters, "certs", OriginatorInfo.defaultValues("certs"));

		if("crls" in parameters)
			/**
			 * @type {RevocationInfoChoices}
			 * @desc crls
			 */
			this.crls = getParametersValue(parameters, "crls", OriginatorInfo.defaultValues("crls"));
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
			case "certs":
				return new CertificateSet();
			case "crls":
				return new RevocationInfoChoices();
			default:
				throw new Error(`Invalid member name for OriginatorInfo class: ${memberName}`);
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
			case "certs":
				return (memberValue.certificates.length === 0);
			case "crls":
				return ((memberValue.crls.length === 0) && (memberValue.otherRevocationInfos.length === 0));
			default:
				throw new Error(`Invalid member name for OriginatorInfo class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * OriginatorInfo ::= SEQUENCE {
	 *    certs [0] IMPLICIT CertificateSet OPTIONAL,
	 *    crls [1] IMPLICIT RevocationInfoChoices OPTIONAL }
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
		 * @property {string} [certs]
		 * @property {string} [crls]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Constructed({
					name: (names.certs || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: CertificateSet.schema().valueBlock.value
				}),
				new asn1js.Constructed({
					name: (names.crls || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: RevocationInfoChoices.schema().valueBlock.value
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
			"certs",
			"crls"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			OriginatorInfo.schema({
				names: {
					certs: "certs",
					crls: "crls"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OriginatorInfo");
		//endregion

		//region Get internal properties from parsed schema
		if("certs" in asn1.result)
		{
			this.certs = new CertificateSet({
				schema: new asn1js.Set({
					value: asn1.result.certs.valueBlock.value
				})
			});
		}

		if("crls" in asn1.result)
		{
			this.crls = new RevocationInfoChoices({
				schema: new asn1js.Set({
					value: asn1.result.crls.valueBlock.value
				})
			});
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
		const sequenceValue = [];

		if("certs" in this)
		{
			sequenceValue.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: this.certs.toSchema().valueBlock.value
			}));
		}

		if("crls" in this)
		{
			sequenceValue.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: this.crls.toSchema().valueBlock.value
			}));
		}

		//region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: sequenceValue
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
		const object = {};

		if("certs" in this)
			object.certs = this.certs.toJSON();

		if("crls" in this)
			object.crls = this.crls.toJSON();

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
