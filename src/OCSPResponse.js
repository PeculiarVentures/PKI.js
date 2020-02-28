import * as asn1js from "asn1js";
import { getParametersValue, clearProps } from "pvutils";
import ResponseBytes from "./ResponseBytes.js";
import BasicOCSPResponse from "./BasicOCSPResponse.js";
//**************************************************************************************
/**
 * Class from RFC6960
 */
export default class OCSPResponse
{
	//**********************************************************************************
	/**
	 * Constructor for OCSPResponse class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Enumerated}
		 * @desc responseStatus
		 */
		this.responseStatus = getParametersValue(parameters, "responseStatus", OCSPResponse.defaultValues("responseStatus"));

		if("responseBytes" in parameters)
			/**
			 * @type {ResponseBytes}
			 * @desc responseBytes
			 */
			this.responseBytes = getParametersValue(parameters, "responseBytes", OCSPResponse.defaultValues("responseBytes"));
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
			case "responseStatus":
				return new asn1js.Enumerated();
			case "responseBytes":
				return new ResponseBytes();
			default:
				throw new Error(`Invalid member name for OCSPResponse class: ${memberName}`);
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
			case "responseStatus":
				return (memberValue.isEqual(OCSPResponse.defaultValues(memberName)));
			case "responseBytes":
				return ((ResponseBytes.compareWithDefault("responseType", memberValue.responseType)) &&
						(ResponseBytes.compareWithDefault("response", memberValue.response)));
			default:
				throw new Error(`Invalid member name for OCSPResponse class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * OCSPResponse ::= SEQUENCE {
	 *    responseStatus         OCSPResponseStatus,
	 *    responseBytes          [0] EXPLICIT ResponseBytes OPTIONAL }
	 *
	 * OCSPResponseStatus ::= ENUMERATED {
	 *    successful            (0),  -- Response has valid confirmations
	 *    malformedRequest      (1),  -- Illegal confirmation request
	 *    internalError         (2),  -- Internal error in issuer
	 *    tryLater              (3),  -- Try again later
	 *    -- (4) is not used
	 *    sigRequired           (5),  -- Must sign the request
	 *    unauthorized          (6)   -- Request unauthorized
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
		 * @property {string} [responseStatus]
		 * @property {string} [responseBytes]
		 */
		const names = getParametersValue(parameters, "names", {});

		return (new asn1js.Sequence({
			name: (names.blockName || "OCSPResponse"),
			value: [
				new asn1js.Enumerated({ name: (names.responseStatus || "responseStatus") }),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [
						ResponseBytes.schema(names.responseBytes || {
							names: {
								blockName: "responseBytes"
							}
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
			"responseStatus",
			"responseBytes"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			OCSPResponse.schema()
		);

		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OCSPResponse");
		//endregion

		//region Get internal properties from parsed schema
		this.responseStatus = asn1.result.responseStatus;
		if("responseBytes" in asn1.result)
			this.responseBytes = new ResponseBytes({ schema: asn1.result.responseBytes });
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

		outputArray.push(this.responseStatus);
		if("responseBytes" in this)
		{
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [this.responseBytes.toSchema()]
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
		const _object = {
			responseStatus: this.responseStatus.toJSON()
		};

		if("responseBytes" in this)
			_object.responseBytes = this.responseBytes.toJSON();

		return _object;
	}
	//**********************************************************************************
	/**
	 * Get OCSP response status for specific certificate
	 * @param {Certificate} certificate
	 * @param {Certificate} issuerCertificate
	 * @returns {*}
	 */
	getCertificateStatus(certificate, issuerCertificate)
	{
		//region Initial variables
		let basicResponse;

		const result = {
			isForCertificate: false,
			status: 2 // 0 = good, 1 = revoked, 2 = unknown
		};
		//endregion

		//region Check that "ResponseBytes" contain "OCSP_BASIC_RESPONSE"
		if(("responseBytes" in this) === false)
			return result;

		if(this.responseBytes.responseType !== "1.3.6.1.5.5.7.48.1.1") // id-pkix-ocsp-basic
			return result;

		try
		{
			const asn1Basic = asn1js.fromBER(this.responseBytes.response.valueBlock.valueHex);
			basicResponse = new BasicOCSPResponse({ schema: asn1Basic.result });
		}
		catch(ex)
		{
			return result;
		}
		//endregion

		return basicResponse.getCertificateStatus(certificate, issuerCertificate);
	}
	//**********************************************************************************
	/**
	 * Make a signature for current OCSP Response
	 * @param {Object} privateKey Private key for "subjectPublicKeyInfo" structure
	 * @param {string} [hashAlgorithm] Hashing algorithm. Default SHA-1
	 * @returns {Promise}
	 */
	sign(privateKey, hashAlgorithm)
	{
		//region Check that ResponseData has type BasicOCSPResponse and sign it
		if(this.responseBytes.responseType === "1.3.6.1.5.5.7.48.1.1")
		{
			const asn1 = asn1js.fromBER(this.responseBytes.response.valueBlock.valueHex);
			const basicResponse = new BasicOCSPResponse({ schema: asn1.result });

			return basicResponse.sign(privateKey, hashAlgorithm);
		}

		return Promise.reject(`Unknown ResponseBytes type: ${this.responseBytes.responseType}`);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Verify current OCSP Response
	 * @param {Certificate|null} issuerCertificate In order to decrease size of resp issuer cert could be ommited. In such case you need manually provide it.
	 * @returns {Promise}
	 */
	verify(issuerCertificate = null)
	{
		//region Check that ResponseBytes exists in the object
		if(("responseBytes" in this) === false)
			return Promise.reject("Empty ResponseBytes field");
		//endregion

		//region Check that ResponceData has type BasicOCSPResponse and verify it
		if(this.responseBytes.responseType === "1.3.6.1.5.5.7.48.1.1")
		{
			const asn1 = asn1js.fromBER(this.responseBytes.response.valueBlock.valueHex);
			const basicResponse = new BasicOCSPResponse({ schema: asn1.result });

			if(issuerCertificate !== null)
			{
				if(("certs" in basicResponse) === false)
					basicResponse.certs = [];
				
				basicResponse.certs.push(issuerCertificate);
			}
			
			return basicResponse.verify();
		}

		return Promise.reject(`Unknown ResponseBytes type: ${this.responseBytes.responseType}`);
		//endregion
	}
	//**********************************************************************************
}
//**************************************************************************************
