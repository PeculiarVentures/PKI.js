import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import Time from "./Time.js";
import Extensions from "./Extensions.js";
//**************************************************************************************
/**
 * Class from RFC5280
 */
export default class RevokedCertificate
{
	//**********************************************************************************
	/**
	 * Constructor for RevokedCertificate class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Integer}
		 * @desc userCertificate
		 */
		this.userCertificate = getParametersValue(parameters, "userCertificate", RevokedCertificate.defaultValues("userCertificate"));
		/**
		 * @type {Time}
		 * @desc revocationDate
		 */
		this.revocationDate = getParametersValue(parameters, "revocationDate", RevokedCertificate.defaultValues("revocationDate"));

		if("crlEntryExtensions" in parameters)
			/**
			 * @type {Extensions}
			 * @desc crlEntryExtensions
			 */
			this.crlEntryExtensions = getParametersValue(parameters, "crlEntryExtensions", RevokedCertificate.defaultValues("crlEntryExtensions"));
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
			case "userCertificate":
				return new asn1js.Integer();
			case "revocationDate":
				return new Time();
			case "crlEntryExtensions":
				return new Extensions();
			default:
				throw new Error(`Invalid member name for RevokedCertificate class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * revokedCertificates     SEQUENCE OF SEQUENCE  {
     *        userCertificate         CertificateSerialNumber,
     *        revocationDate          Time,
     *        crlEntryExtensions      Extensions OPTIONAL
     *                                 -- if present, version MUST be v2
     *                             }  OPTIONAL,
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
		 * @property {string} [userCertificate]
		 * @property {string} [revocationDate]
		 * @property {string} [crlEntryExtensions]
		 */
		const names = getParametersValue(parameters, "names", {});

		return new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Integer({ name: (names.userCertificate || "userCertificate") }),
				Time.schema({
					names: {
						utcTimeName: (names.revocationDate || "revocationDate"),
						generalTimeName: (names.revocationDate || "revocationDate")
					}
				}),
				Extensions.schema({
					names: {
						blockName: (names.crlEntryExtensions || "crlEntryExtensions")
					}
				}, true)
			]
		});
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
			"userCertificate",
			"revocationDate",
			"crlEntryExtensions"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			RevokedCertificate.schema()
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for RevokedCertificate");
		//endregion

		//region Get internal properties from parsed schema
		this.userCertificate = asn1.result.userCertificate;
		this.revocationDate = new Time({ schema: asn1.result.revocationDate });

		if("crlEntryExtensions" in asn1.result)
			this.crlEntryExtensions = new Extensions({ schema: asn1.result.crlEntryExtensions });
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
		const outputArray = [
			this.userCertificate,
			this.revocationDate.toSchema()
		];

		if("crlEntryExtensions" in this)
			outputArray.push(this.crlEntryExtensions.toSchema());
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
			userCertificate: this.userCertificate.toJSON(),
			revocationDate: this.revocationDate.toJSON
		};

		if("crlEntryExtensions" in this)
			object.crlEntryExtensions = this.crlEntryExtensions.toJSON();

		return object;
	}
	//**********************************************************************************
}
//**************************************************************************************
