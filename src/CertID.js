import * as asn1js from "asn1js";
import { getParametersValue, isEqualBuffer, clearProps } from "pvutils";
import { getCrypto, getOIDByAlgorithm } from "./common.js";
import AlgorithmIdentifier from "./AlgorithmIdentifier.js";
//**************************************************************************************
/**
 * Class from RFC6960
 */
export default class CertID 
{
	//**********************************************************************************
	/**
	 * Constructor for CertID class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {AlgorithmIdentifier}
		 * @desc hashAlgorithm
		 */
		this.hashAlgorithm = getParametersValue(parameters, "hashAlgorithm", CertID.defaultValues("hashAlgorithm"));
		/**
		 * @type {OctetString}
		 * @desc issuerNameHash
		 */
		this.issuerNameHash = getParametersValue(parameters, "issuerNameHash", CertID.defaultValues("issuerNameHash"));
		/**
		 * @type {OctetString}
		 * @desc issuerKeyHash
		 */
		this.issuerKeyHash = getParametersValue(parameters, "issuerKeyHash", CertID.defaultValues("issuerKeyHash"));
		/**
		 * @type {Integer}
		 * @desc serialNumber
		 */
		this.serialNumber = getParametersValue(parameters, "serialNumber", CertID.defaultValues("serialNumber"));
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
			case "hashAlgorithm":
				return new AlgorithmIdentifier();
			case "issuerNameHash":
			case "issuerKeyHash":
				return new asn1js.OctetString();
			case "serialNumber":
				return new asn1js.Integer();
			default:
				throw new Error(`Invalid member name for CertID class: ${memberName}`);
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
			case "hashAlgorithm":
				return ((memberValue.algorithmId === "") && (("algorithmParams" in memberValue) === false));
			case "issuerNameHash":
			case "issuerKeyHash":
			case "serialNumber":
				return (memberValue.isEqual(CertID.defaultValues(memberName)));
			default:
				throw new Error(`Invalid member name for CertID class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * CertID          ::=     SEQUENCE {
	 *    hashAlgorithm       AlgorithmIdentifier,
	 *    issuerNameHash      OCTET STRING, -- Hash of issuer's DN
	 *    issuerKeyHash       OCTET STRING, -- Hash of issuer's public key
	 *    serialNumber        CertificateSerialNumber }
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
		 * @property {string} [hashAlgorithm]
		 * @property {string} [hashAlgorithmObject]
		 * @property {string} [issuerNameHash]
		 * @property {string} [issuerKeyHash]
		 * @property {string} [serialNumber]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				AlgorithmIdentifier.schema(names.hashAlgorithmObject || {
					names: {
						blockName: (names.hashAlgorithm || "")
					}
				}),
				new asn1js.OctetString({ name: (names.issuerNameHash || "") }),
				new asn1js.OctetString({ name: (names.issuerKeyHash || "") }),
				new asn1js.Integer({ name: (names.serialNumber || "") })
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
			"hashAlgorithm",
			"issuerNameHash",
			"issuerKeyHash",
			"serialNumber"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			CertID.schema({
				names: {
					hashAlgorithm: "hashAlgorithm",
					issuerNameHash: "issuerNameHash",
					issuerKeyHash: "issuerKeyHash",
					serialNumber: "serialNumber"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CertID");
		//endregion
		
		//region Get internal properties from parsed schema
		this.hashAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.hashAlgorithm });
		this.issuerNameHash = asn1.result.issuerNameHash;
		this.issuerKeyHash = asn1.result.issuerKeyHash;
		this.serialNumber = asn1.result.serialNumber;
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
				this.hashAlgorithm.toSchema(),
				this.issuerNameHash,
				this.issuerKeyHash,
				this.serialNumber
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
			hashAlgorithm: this.hashAlgorithm.toJSON(),
			issuerNameHash: this.issuerNameHash.toJSON(),
			issuerKeyHash: this.issuerKeyHash.toJSON(),
			serialNumber: this.serialNumber.toJSON()
		};
	}
	//**********************************************************************************
	/**
	 * Check that two "CertIDs" are equal
	 * @param {CertID} certificateID Identifier of the certificate to be checked
	 * @returns {boolean}
	 */
	isEqual(certificateID)
	{
		//region Check "hashAlgorithm"
		if(!this.hashAlgorithm.algorithmId === certificateID.hashAlgorithm.algorithmId)
			return false;
		//endregion
		
		//region Check "issuerNameHash"
		if(isEqualBuffer(this.issuerNameHash.valueBlock.valueHex, certificateID.issuerNameHash.valueBlock.valueHex) === false)
			return false;
		//endregion
		
		//region Check "issuerKeyHash"
		if(isEqualBuffer(this.issuerKeyHash.valueBlock.valueHex, certificateID.issuerKeyHash.valueBlock.valueHex) === false)
			return false;
		//endregion
		
		//region Check "serialNumber"
		if(!this.serialNumber.isEqual(certificateID.serialNumber))
			return false;
		//endregion
		
		return true;
	}
	//**********************************************************************************
	/**
	 * Making OCSP certificate identifier for specific certificate
	 * @param {Certificate} certificate Certificate making OCSP Request for
	 * @param {Object} parameters Additional parameters
	 * @returns {Promise}
	 */
	createForCertificate(certificate, parameters)
	{
		//region Initial variables
		let sequence = Promise.resolve();
		
		let issuerCertificate;
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Check input parameters
		if(("hashAlgorithm" in parameters) === false)
			return Promise.reject("Parameter \"hashAlgorithm\" is mandatory for \"OCSP_REQUEST.createForCertificate\"");
		
		const hashOID = getOIDByAlgorithm({ name: parameters.hashAlgorithm });
		if(hashOID === "")
			return Promise.reject(`Incorrect "hashAlgorithm": ${this.hashAlgorithm}`);
		
		this.hashAlgorithm = new AlgorithmIdentifier({
			algorithmId: hashOID,
			algorithmParams: new asn1js.Null()
		});
		
		if("issuerCertificate" in parameters)
			issuerCertificate = parameters.issuerCertificate;
		else
			return Promise.reject("Parameter \"issuerCertificate\" is mandatory for \"OCSP_REQUEST.createForCertificate\"");
		//endregion
		
		//region Initialize "serialNumber" field
		this.serialNumber = certificate.serialNumber;
		//endregion
		
		//region Create "issuerNameHash"
		sequence = sequence.then(() =>
			crypto.digest({ name: parameters.hashAlgorithm }, issuerCertificate.subject.toSchema().toBER(false)),
		error =>
			Promise.reject(error)
		);
		//endregion
		
		//region Create "issuerKeyHash"
		sequence = sequence.then(result =>
		{
			this.issuerNameHash = new asn1js.OctetString({ valueHex: result });
			
			const issuerKeyBuffer = issuerCertificate.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex;
			
			return crypto.digest({ name: parameters.hashAlgorithm }, issuerKeyBuffer);
		}, error =>
			Promise.reject(error)
		).then(result =>
		{
			this.issuerKeyHash = new asn1js.OctetString({ valueHex: result });
		}, error =>
			Promise.reject(error)
		);
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
}
//**************************************************************************************
