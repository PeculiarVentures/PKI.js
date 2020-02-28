import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import PKIStatusInfo from "./PKIStatusInfo.js";
import ContentInfo from "./ContentInfo.js";
import SignedData from "./SignedData.js";
//**************************************************************************************
/**
 * Class from RFC3161
 */
export default class TimeStampResp
{
	//**********************************************************************************
	/**
	 * Constructor for TimeStampResp class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {PKIStatusInfo}
		 * @desc status
		 */
		this.status = getParametersValue(parameters, "status", TimeStampResp.defaultValues("status"));

		if("timeStampToken" in parameters)
			/**
			 * @type {ContentInfo}
			 * @desc timeStampToken
			 */
			this.timeStampToken = getParametersValue(parameters, "timeStampToken", TimeStampResp.defaultValues("timeStampToken"));
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
			case "status":
				return new PKIStatusInfo();
			case "timeStampToken":
				return new ContentInfo();
			default:
				throw new Error(`Invalid member name for TimeStampResp class: ${memberName}`);
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
			case "status":
				return ((PKIStatusInfo.compareWithDefault("status", memberValue.status)) &&
						(("statusStrings" in memberValue) === false) &&
						(("failInfo" in memberValue) === false));
			case "timeStampToken":
				return ((memberValue.contentType === "") &&
						(memberValue.content instanceof asn1js.Any));
			default:
				throw new Error(`Invalid member name for TimeStampResp class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * TimeStampResp ::= SEQUENCE  {
	 *    status                  PKIStatusInfo,
	 *    timeStampToken          TimeStampToken     OPTIONAL  }
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
		 * @property {string} [status]
		 * @property {string} [timeStampToken]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || "TimeStampResp"),
			value: [
				PKIStatusInfo.schema(names.status || {
					names: {
						blockName: "TimeStampResp.status"
					}
				}),
				ContentInfo.schema(names.timeStampToken || {
					names: {
						blockName: "TimeStampResp.timeStampToken",
						optional: true
					}
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
			"TimeStampResp.status",
			"TimeStampResp.timeStampToken"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			TimeStampResp.schema()
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for TimeStampResp");
		//endregion

		//region Get internal properties from parsed schema
		this.status = new PKIStatusInfo({ schema: asn1.result["TimeStampResp.status"] });
		if("TimeStampResp.timeStampToken" in asn1.result)
			this.timeStampToken = new ContentInfo({ schema: asn1.result["TimeStampResp.timeStampToken"] });
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

		outputArray.push(this.status.toSchema());
		if("timeStampToken" in this)
			outputArray.push(this.timeStampToken.toSchema());
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
		const _object = {
			status: this.status
		};

		if("timeStampToken" in this)
			_object.timeStampToken = this.timeStampToken.toJSON();

		return _object;
	}
	//**********************************************************************************
	/**
	 * Sign current TSP Response
	 * @param {Object} privateKey Private key for "subjectPublicKeyInfo" structure
	 * @param {string} [hashAlgorithm] Hashing algorithm. Default SHA-1
	 * @returns {Promise}
	 */
	sign(privateKey, hashAlgorithm)
	{
		//region Check that "timeStampToken" exists
		if(("timeStampToken" in this) === false)
			return Promise.reject("timeStampToken is absent in TSP response");
		//endregion

		//region Check that "timeStampToken" has a right internal format
		if(this.timeStampToken.contentType !== "1.2.840.113549.1.7.2") // Must be a CMS signed data
			return Promise.reject(`Wrong format of timeStampToken: ${this.timeStampToken.contentType}`);
		//endregion

		//region Sign internal signed data value
		const signed = new ContentInfo({ schema: this.timeStampToken.content });

		return signed.sign(privateKey, 0, hashAlgorithm);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Verify current TSP Response
	 * @param {Object} verificationParameters Input parameters for verification
	 * @returns {Promise}
	 */
	verify(verificationParameters = { signer: 0, trustedCerts: [], data: new ArrayBuffer(0) })
	{
		//region Check that "timeStampToken" exists
		if(("timeStampToken" in this) === false)
			return Promise.reject("timeStampToken is absent in TSP response");
		//endregion

		//region Check that "timeStampToken" has a right internal format
		if(this.timeStampToken.contentType !== "1.2.840.113549.1.7.2") // Must be a CMS signed data
			return Promise.reject(`Wrong format of timeStampToken: ${this.timeStampToken.contentType}`);
		//endregion

		//region Verify internal signed data value
		const signed = new SignedData({ schema: this.timeStampToken.content });

		return signed.verify(verificationParameters);
		//endregion
	}
	//**********************************************************************************
}
//**************************************************************************************
