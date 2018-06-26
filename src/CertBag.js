import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import Certificate from "./Certificate.js";
import AttributeCertificateV2 from "./AttributeCertificateV2.js";
//**************************************************************************************
/**
 * Class from RFC7292
 */
export default class CertBag
{
	//**********************************************************************************
	/**
	 * Constructor for CertBag class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc certId
		 */
		this.certId = getParametersValue(parameters, "certId", CertBag.defaultValues("certId"));
		/**
		 * @type {*}
		 * @desc certValue
		 */
		this.certValue = getParametersValue(parameters, "certValue", CertBag.defaultValues("certValue"));
		
		if("parsedValue" in parameters)
			/**
			 * @type {*}
			 * @desc parsedValue
			 */
			this.parsedValue = getParametersValue(parameters, "parsedValue", CertBag.defaultValues("parsedValue"));
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
			case "certId":
				return "";
			case "certValue":
				return (new asn1js.Any());
			case "parsedValue":
				return {};
			default:
				throw new Error(`Invalid member name for CertBag class: ${memberName}`);
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
			case "certId":
				return (memberValue === "");
			case "certValue":
				return (memberValue instanceof asn1js.Any);
			case "parsedValue":
				return ((memberValue instanceof Object) && (Object.keys(memberValue).length === 0));
			default:
				throw new Error(`Invalid member name for CertBag class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * CertBag ::= SEQUENCE {
	 *    certId    BAG-TYPE.&id   ({CertTypes}),
	 *    certValue [0] EXPLICIT BAG-TYPE.&Type ({CertTypes}{@certId})
	 * }
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
			"certId",
			"certValue"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			CertBag.schema({
				names: {
					id: "certId",
					value: "certValue"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CertBag");
		//endregion 
		
		//region Get internal properties from parsed schema 
		this.certId = asn1.result.certId.valueBlock.toString();
		this.certValue = asn1.result.certValue;
		
		switch(this.certId)
		{
			case "1.2.840.113549.1.9.22.1": // x509Certificate
				{
					const asn1Inner = asn1js.fromBER(this.certValue.valueBlock.valueHex);
					
					try
					{
						this.parsedValue = new Certificate({ schema: asn1Inner.result });
					}
					catch(ex) // In some realizations the same OID used for attribute certificates
					{
						this.parsedValue = new AttributeCertificateV2({ schema: asn1Inner.result });
					}
				}
				break;
			case "1.2.840.113549.1.9.22.3": // attributeCertificate - (!!!) THIS OID IS SUBJECT FOR CHANGE IN FUTURE (!!!)
				{
					const asn1Inner = asn1js.fromBER(this.certValue.valueBlock.valueHex);
					this.parsedValue = new AttributeCertificateV2({ schema: asn1Inner.result });
				}
				break;
			case "1.2.840.113549.1.9.22.2": // sdsiCertificate
			default:
				throw new Error(`Incorrect "certId" value in CertBag: ${this.certId}`);
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
			if("acinfo" in this.parsedValue) // attributeCertificate
				this.certId = "1.2.840.113549.1.9.22.3";
			else // x509Certificate
				this.certId = "1.2.840.113549.1.9.22.1";

			this.certValue = new asn1js.OctetString({ valueHex: this.parsedValue.toSchema().toBER(false) });
		}
		
		return (new asn1js.Sequence({
			value: [
				new asn1js.ObjectIdentifier({ value: this.certId }),
				new asn1js.Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [(("toSchema" in this.certValue) ? this.certValue.toSchema() : this.certValue)]
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
			certId: this.certId,
			certValue: this.certValue.toJSON()
		};
	}
	//**********************************************************************************
}
//**************************************************************************************
