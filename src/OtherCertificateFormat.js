import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class OtherCertificateFormat
{
	//**********************************************************************************
	/**
	 * Constructor for OtherCertificateFormat class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc otherCertFormat
		 */
		this.otherCertFormat = getParametersValue(parameters, "otherCertFormat", OtherCertificateFormat.defaultValues("otherCertFormat"));
		/**
		 * @type {Any}
		 * @desc otherCert
		 */
		this.otherCert = getParametersValue(parameters, "otherCert", OtherCertificateFormat.defaultValues("otherCert"));
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
			case "otherCertFormat":
				return "";
			case "otherCert":
				return new asn1js.Any();
			default:
				throw new Error(`Invalid member name for OtherCertificateFormat class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * OtherCertificateFormat ::= SEQUENCE {
	 *    otherCertFormat OBJECT IDENTIFIER,
	 *    otherCert ANY DEFINED BY otherCertFormat }
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
		 * @property {string} [otherCertFormat]
		 * @property {string} [otherCert]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.otherCertFormat || "otherCertFormat") }),
				new asn1js.Any({ name: (names.otherCert || "otherCert") })
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
			"otherCertFormat",
			"otherCert"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			OtherCertificateFormat.schema()
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OtherCertificateFormat");
		//endregion

		//region Get internal properties from parsed schema
		this.otherCertFormat = asn1.result.otherCertFormat.valueBlock.toString();
		this.otherCert = asn1.result.otherCert;
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
				new asn1js.ObjectIdentifier({ value: this.otherCertFormat }),
				this.otherCert
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
		const object = {
			otherCertFormat: this.otherCertFormat
		};

		if(!(this.otherCert instanceof asn1js.Any))
			object.otherCert = this.otherCert.toJSON();

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
