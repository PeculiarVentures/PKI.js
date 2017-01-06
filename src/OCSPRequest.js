import * as asn1js from "asn1js";
import { getParametersValue } from "pvutils";
import { getOIDByAlgorithm, getAlgorithmParameters, getCrypto, createCMSECDSASignature } from "./common";
import TBSRequest from "./TBSRequest";
import Signature from "./Signature";
import Request from "./Request";
import CertID from "./CertID";
import Certificate from "./Certificate";
import AlgorithmIdentifier from "./AlgorithmIdentifier";
import RSASSAPSSParams from "./RSASSAPSSParams";
//**************************************************************************************
/**
 * Class from RFC6960
 */
export default class OCSPRequest 
{
	//**********************************************************************************
	/**
	 * Constructor for OCSPRequest class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {TBSRequest}
		 * @description tbsRequest
		 */
		this.tbsRequest = getParametersValue(parameters, "tbsRequest", OCSPRequest.defaultValues("tbsRequest"));
		
		if("optionalSignature" in parameters)
			/**
			 * @type {Signature}
			 * @description optionalSignature
			 */
			this.optionalSignature = getParametersValue(parameters, "optionalSignature", OCSPRequest.defaultValues("optionalSignature"));
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
			case "tbsRequest":
				return new TBSRequest();
			case "optionalSignature":
				return new Signature();
			default:
				throw new Error(`Invalid member name for OCSPRequest class: ${memberName}`);
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
			case "tbsRequest":
				return ((TBSRequest.compareWithDefault("tbs", memberValue.tbs)) &&
				(TBSRequest.compareWithDefault("version", memberValue.version)) &&
				(TBSRequest.compareWithDefault("requestorName", memberValue.requestorName)) &&
				(TBSRequest.compareWithDefault("requestList", memberValue.requestList)) &&
				(TBSRequest.compareWithDefault("requestExtensions", memberValue.requestExtensions)));
			case "optionalSignature":
				return ((Signature.compareWithDefault("signatureAlgorithm", memberValue.signatureAlgorithm)) &&
				(Signature.compareWithDefault("signature", memberValue.signature)) &&
				(Signature.compareWithDefault("certs", memberValue.certs)));
			default:
				throw new Error(`Invalid member name for OCSPRequest class: ${memberName}`);
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
		//OCSPRequest     ::=     SEQUENCE {
		//    tbsRequest                  TBSRequest,
		//    optionalSignature   [0]     EXPLICIT Signature OPTIONAL }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [tbsRequest]
		 * @property {string} [optionalSignature]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: names.blockName || "OCSPRequest",
			value: [
				TBSRequest.schema(names.tbsRequest || {
					names: {
						blockName: "tbsRequest"
					}
				}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [
						Signature.schema(names.optionalSignature || {
							names: {
								blockName: "optionalSignature"
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
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			OCSPRequest.schema()
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OCSP_REQUEST");
		//endregion
		
		//region Get internal properties from parsed schema
		this.tbsRequest = new TBSRequest({ schema: asn1.result.tbsRequest });
		if("optionalSignature" in asn1.result)
			this.optionalSignature = new Signature({ schema: asn1.result.optionalSignature });
		//endregion
	}
	
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @param {boolean} encodeFlag If param equal to false then create TBS schema via decoding stored value. In othe case create TBS schema via assembling from TBS parts.
	 * @returns {Object} asn1js object
	 */
	toSchema(encodeFlag = false)
	{
		//region Create array for output sequence
		const outputArray = [];
		
		outputArray.push(this.tbsRequest.toSchema(encodeFlag));
		if("optionalSignature" in this)
			outputArray.push(this.optionalSignature.toSchema());
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
			tbsRequest: this.tbsRequest.toJSON()
		};
		
		if("optionalSignature" in this)
			_object.optionalSignature = this.optionalSignature.toJSON();
		
		return _object;
	}
	
	//**********************************************************************************
	/**
	 * Making OCSP Request for specific certificate
	 * @param {Certificate} certificate Certificate making OCSP Request for
	 * @param {Object} parameters Additional parameters
	 * @returns {Promise}
	 */
	createForCertificate(certificate, parameters)
	{
		//region Initial variables
		let sequence = Promise.resolve();
		
		const certID = new CertID();
		//endregion
		
		//region Create OCSP certificate identifier for the certificate
		sequence = sequence.then(() =>
			certID.createForCertificate(certificate, parameters)
		);
		//endregion
		
		//region Make final request data
		sequence = sequence.then(() =>
			{
			this.tbsRequest = new TBSRequest({
				requestList: [
					new Request({
						reqCert: certID
					})
				]
			});
		}, error =>
				Promise.reject(error)
		);
		//endregion
		
		return sequence;
	}
	
	//**********************************************************************************
	/**
	 * Make signature for current OCSP Request
	 * @param {Object} privateKey Private key for "subjectPublicKeyInfo" structure
	 * @param {string} [hashAlgorithm] Hashing algorithm. Default SHA-1
	 * @returns {Promise}
	 */
	sign(privateKey, hashAlgorithm)
	{
		//region Get a private key from function parameter
		if(typeof privateKey === "undefined")
			return Promise.reject("Need to provide a private key for signing");
		//endregion
		
		//region Get hashing algorithm
		if(typeof hashAlgorithm === "undefined")
			hashAlgorithm = "SHA-1";
		else
		{
			//region Simple check for supported algorithm
			const oid = getOIDByAlgorithm({ name: hashAlgorithm });
			if(oid === "")
				return Promise.reject(`Unsupported hash algorithm: ${hashAlgorithm}`);
			//endregion
		}
		//endregion
		
		//region Check that "optionalSignature" exists in the current request
		if(("optionalSignature" in this) === false)
			return Promise.reject("Need to create \"optionalSignature\" field before signing");
		//endregion
		
		//region Get a "default parameters" for current algorithm
		const defParams = getAlgorithmParameters(privateKey.algorithm.name, "sign");
		defParams.algorithm.hash.name = hashAlgorithm;
		//endregion
		
		//region Fill internal structures base on "privateKey" and "hashAlgorithm"
		switch(privateKey.algorithm.name.toUpperCase())
		{
			case "RSASSA-PKCS1-V1_5":
			case "ECDSA":
				this.optionalSignature.signatureAlgorithm.algorithmId = getOIDByAlgorithm(defParams.algorithm);
				break;
			case "RSA-PSS":
				{
				//region Set "saltLength" as a length (in octets) of hash function result
					switch(hashAlgorithm.toUpperCase())
				{
						case "SHA-256":
							defParams.algorithm.saltLength = 32;
							break;
						case "SHA-384":
							defParams.algorithm.saltLength = 48;
							break;
						case "SHA-512":
							defParams.algorithm.saltLength = 64;
							break;
						default:
					}
				//endregion
				
				//region Fill "RSASSA_PSS_params" object
					const paramsObject = {};
				
					if(hashAlgorithm.toUpperCase() !== "SHA-1")
				{
						const hashAlgorithmOID = getOIDByAlgorithm({ name: hashAlgorithm });
						if(hashAlgorithmOID === "")
							return Promise.reject(`Unsupported hash algorithm: ${hashAlgorithm}`);
					
						paramsObject.hashAlgorithm = new AlgorithmIdentifier({
							algorithmId: hashAlgorithmOID,
							algorithmParams: new asn1js.Null()
						});
					
						paramsObject.maskGenAlgorithm = new AlgorithmIdentifier({
							algorithmId: "1.2.840.113549.1.1.8", // MGF1
							algorithmParams: paramsObject.hashAlgorithm.toSchema()
						});
					}
				
					if(defParams.algorithm.saltLength !== 20)
						paramsObject.saltLength = defParams.algorithm.saltLength;
				
					const pssParameters = new RSASSAPSSParams(paramsObject);
				//endregion
				
				//region Automatically set signature algorithm
					this.optionalSignature.signatureAlgorithm = new AlgorithmIdentifier({
						algorithmId: "1.2.840.113549.1.1.10",
						algorithmParams: pssParameters.toSchema()
					});
				//endregion
				}
				break;
			default:
				return Promise.reject(`Unsupported signature algorithm: ${privateKey.algorithm.name}`);
		}
		//endregion
		
		//region Create TBS data for signing
		const tbs = this.tbsRequest.toSchema(true).toBER(false);
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Signing TBS data on provided private key
		return crypto.sign(defParams.algorithm,
			privateKey,
			new Uint8Array(tbs)).then(result =>
			{
				//region Special case for ECDSA algorithm
				if(defParams.algorithm.name === "ECDSA")
					result = createCMSECDSASignature(result);
				//endregion
				
				this.optionalSignature.signature = new asn1js.BitString({ valueHex: result });
			}, error =>
				Promise.reject(`Signing error: ${error}`)
		);
		//endregion
	}
	
	//**********************************************************************************
	verify()
	{
		// TODO: Create the function
	}
	
	//**********************************************************************************
}
//**************************************************************************************
