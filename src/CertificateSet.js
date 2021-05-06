import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import Certificate from "./Certificate.js";
import AttributeCertificateV1 from "./AttributeCertificateV1.js";
import AttributeCertificateV2 from "./AttributeCertificateV2.js";
import OtherCertificateFormat from "./OtherCertificateFormat.js";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class CertificateSet
{
	//**********************************************************************************
	/**
	 * Constructor for CertificateSet class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array}
		 * @desc certificates
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
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * CertificateSet ::= SET OF CertificateChoices
	 *
	 * CertificateChoices ::= CHOICE {
	 *    certificate Certificate,
	 *    extendedCertificate [0] IMPLICIT ExtendedCertificate,  -- Obsolete
	 *    v1AttrCert [1] IMPLICIT AttributeCertificateV1,        -- Obsolete
	 *    v2AttrCert [2] IMPLICIT AttributeCertificateV2,
	 *    other [3] IMPLICIT OtherCertificateFormat }
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
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (
			new asn1js.Set({
				name: (names.blockName || ""),
				value: [
					new asn1js.Repeated({
						name: (names.certificates || "certificates"),
						value: new asn1js.Choice({
							value: [
								Certificate.schema(),
								new asn1js.Constructed({
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 0 // [0]
									},
									value: [
										new asn1js.Any()
									]
								}), // JUST A STUB
								new asn1js.Constructed({
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 1 // [1]
									},
									value: AttributeCertificateV1.schema().valueBlock.value
								}),
								new asn1js.Constructed({
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 2 // [2]
									},
									value: AttributeCertificateV2.schema().valueBlock.value
								}),
								new asn1js.Constructed({
									idBlock: {
										tagClass: 3, // CONTEXT-SPECIFIC
										tagNumber: 3 // [3]
									},
									value: OtherCertificateFormat.schema().valueBlock.value
								})
							]
						})
					})
				]
			})
		);
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
			"certificates"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			CertificateSet.schema()
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CertificateSet");
		//endregion
		
		//region Get internal properties from parsed schema
		this.certificates = Array.from(asn1.result.certificates || [], element =>
		{
			const initialTagNumber = element.idBlock.tagNumber;

			if(element.idBlock.tagClass === 1)
				return new Certificate({ schema: element });
			
			//region Making "Sequence" from "Constructed" value
			const elementSequence = new asn1js.Sequence({
				value: element.valueBlock.value
			});
			//endregion

			switch(initialTagNumber)
			{
				case 1:
					return new AttributeCertificateV1({ schema: elementSequence });
				case 2:
					return new AttributeCertificateV2({ schema: elementSequence });
				case 3:
					return new OtherCertificateFormat({ schema: elementSequence });
				case 0:
				default:
			}
			
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
				switch(true)
				{
					case (element instanceof Certificate):
						return element.toSchema();
					case (element instanceof AttributeCertificateV1):
						return new asn1js.Constructed({
							idBlock: {
								tagClass: 3,
								tagNumber: 1 // [1]
							},
							value: element.toSchema().valueBlock.value
						});
					case (element instanceof AttributeCertificateV2):
						return new asn1js.Constructed({
							idBlock: {
								tagClass: 3,
								tagNumber: 2 // [2]
							},
							value: element.toSchema().valueBlock.value
						});
					case (element instanceof OtherCertificateFormat):
						return new asn1js.Constructed({
							idBlock: {
								tagClass: 3,
								tagNumber: 3 // [3]
							},
							value: element.toSchema().valueBlock.value
						});
					default:
				}
				
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
