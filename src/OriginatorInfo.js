import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import CertificateSet from "./CertificateSet";
import RevocationInfoChoices from "./RevocationInfoChoices";
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
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {CertificateSet}
		 * @description certs
		 */
		this.certs = getParametersValue(parameters, "certs", OriginatorInfo.defaultValues("certs"));
		/**
		 * @type {RevocationInfoChoices}
		 * @description crls
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
	 * Return value of asn1js schema for current class
	 * @param {Object} parameters Input parameters for the schema
	 * @returns {Object} asn1js schema object
	 */
	static schema(parameters = {})
	{
		//OriginatorInfo ::= SEQUENCE {
		//    certs [0] IMPLICIT CertificateSet OPTIONAL,
		//    crls [1] IMPLICIT RevocationInfoChoices OPTIONAL }

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
		asn1.result.certs.idBlock.tagClass = 1; // UNIVERSAL
		asn1.result.certs.idBlock.tagNumber = 17; // SET

		this.certs = new CertificateSet({ schema: asn1.result.certs });

		asn1.result.crls.idBlock.tagClass = 1; // UNIVERSAL
		asn1.result.crls.idBlock.tagNumber = 17; // SET

		this.crls = new RevocationInfoChoices({ schema: asn1.result.crls });
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
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: this.certs.toSchema().valueBlock.value
				}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: this.crls.toSchema().valueBlock.value
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
			certs: this.certs.toJSON(),
			crls: this.crls.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
