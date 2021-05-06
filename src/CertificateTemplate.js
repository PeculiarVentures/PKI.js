import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
//**************************************************************************************
/**
 * Class from "[MS-WCCE]: Windows Client Certificate Enrollment Protocol"
 */
export default class CertificateTemplate
{
	//**********************************************************************************
	/**
	 * Constructor for CertificateTemplate class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @desc templateID
		 */
		this.templateID = getParametersValue(parameters, "templateID", CertificateTemplate.defaultValues("templateID"));

		if("templateMajorVersion" in parameters)
			/**
			 * @type {number}
			 * @desc templateMajorVersion
			 */
			this.templateMajorVersion = getParametersValue(parameters, "templateMajorVersion", CertificateTemplate.defaultValues("templateMajorVersion"));

		if("templateMinorVersion" in parameters)
			/**
			 * @type {number}
			 * @desc templateMinorVersion
			 */
			this.templateMinorVersion = getParametersValue(parameters, "templateMinorVersion", CertificateTemplate.defaultValues("templateMinorVersion"));
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
			case "templateID":
				return "";
			case "templateMajorVersion":
			case "templateMinorVersion":
				return 0;
			default:
				throw new Error(`Invalid member name for CertificateTemplate class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * CertificateTemplateOID ::= SEQUENCE {
     *    templateID              OBJECT IDENTIFIER,
     *    templateMajorVersion    INTEGER (0..4294967295) OPTIONAL,
     *    templateMinorVersion    INTEGER (0..4294967295) OPTIONAL
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
		 * @property {string} [templateID]
		 * @property {string} [templateMajorVersion]
		 * @property {string} [templateMinorVersion]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.ObjectIdentifier({ name: (names.templateID || "") }),
				new asn1js.Integer({
					name: (names.templateMajorVersion || ""),
					optional: true
				}),
				new asn1js.Integer({
					name: (names.templateMinorVersion || ""),
					optional: true
				}),
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
			"templateID",
			"templateMajorVersion",
			"templateMinorVersion"
		]);
		//endregion

		//region Check the schema is valid
		let asn1 = asn1js.compareSchema(schema,
			schema,
			CertificateTemplate.schema({
				names: {
					templateID: "templateID",
					templateMajorVersion: "templateMajorVersion",
					templateMinorVersion: "templateMinorVersion"
				}
			})
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CertificateTemplate");
		//endregion

		//region Get internal properties from parsed schema
		this.templateID = asn1.result.templateID.valueBlock.toString();

		if("templateMajorVersion" in asn1.result)
			this.templateMajorVersion = asn1.result.templateMajorVersion.valueBlock.valueDec;

		if("templateMinorVersion" in asn1.result)
			this.templateMinorVersion = asn1.result.templateMinorVersion.valueBlock.valueDec;
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

		outputArray.push(new asn1js.ObjectIdentifier({ value: this.templateID }));

		if("templateMajorVersion" in this)
			outputArray.push(new asn1js.Integer({ value: this.templateMajorVersion }));

		if("templateMinorVersion" in this)
			outputArray.push(new asn1js.Integer({ value: this.templateMinorVersion }));
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
			extnID: this.templateID
		};

		if("templateMajorVersion" in this)
			object.templateMajorVersion = this.templateMajorVersion;

		if("templateMinorVersion" in this)
			object.templateMinorVersion = this.templateMinorVersion;

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
