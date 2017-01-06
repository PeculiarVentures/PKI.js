import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import Certificate from "./Certificate";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class CertificateSet {
	//**********************************************************************************
	/**
	 * Constructor for CertificateSet class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array}
		 * @description certificates
		 */
		this.certificates = getParametersValue(parameters, "certificates", CertificateSet.defaultValues("certificates"));
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
			case "certificates":
				return [];
			default:
				throw new Error(`Invalid member name for Attribute class: ${memberName}`);
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
		//CertificateSet ::= SET OF CertificateChoices
		//
		//CertificateChoices ::= CHOICE {
		//    certificate Certificate,
		//    extendedCertificate [0] IMPLICIT ExtendedCertificate,  -- Obsolete
		//    v1AttrCert [1] IMPLICIT AttributeCertificateV1,        -- Obsolete
		//    v2AttrCert [2] IMPLICIT AttributeCertificateV2,
		//    other [3] IMPLICIT OtherCertificateFormat }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (
			new asn1js.Set({
				name: (names.blockName || ""),
				value: [
					new asn1js.Repeated({
						name: (names.certificates || ""),
						value: new asn1js.Choice({
							value: [
								Certificate.schema(),
								new asn1js.Constructed({
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 1 // [1]
									},
									value: [
										new asn1js.Any()
									]
								}), // JUST A STUB
								new asn1js.Constructed({
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 2 // [2]
									},
									value: [
										new asn1js.Any()
									]
								}), // JUST A STUB
								new asn1js.Constructed({
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 3 // [3]
									},
									value: [
										new asn1js.ObjectIdentifier(),
										new asn1js.Any()
									]
								})
							]
						})
					})
				]
			})
		); // TODO: add definition for "AttributeCertificateV2"
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
			CertificateSet.schema()
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CMS_CERTIFICATE_SET");
		//endregion
		
		//region Get internal properties from parsed schema
		this.certificates = Array.from(asn1.result.certificates, element =>
		{
			if(element.idBlock.tagClass === 1)
				return new Certificate({ schema: element });
			
			return element;
		});
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
		return (new asn1js.Set({
			value: Array.from(this.certificates, element =>
			{
				if(element instanceof Certificate)
					return element.toSchema();
				
				return element;
			})
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
			certificates: Array.from(this.certificates, element => element.toJSON())
		};
	}
	
	//**********************************************************************************
}
//**************************************************************************************
