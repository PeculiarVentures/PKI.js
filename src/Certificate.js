import * as asn1js from "asn1js";
import { getParametersValue, bufferToHexCodes } from "pvutils";
import {
	getCrypto,
	getHashAlgorithm,
	getAlgorithmByOID,
	createCMSECDSASignature,
	createECDSASignatureFromCMS,
	getAlgorithmParameters,
	getOIDByAlgorithm
} from "./common";
import AlgorithmIdentifier from "./AlgorithmIdentifier";
import RelativeDistinguishedNames from "./RelativeDistinguishedNames";
import Time from "./Time";
import PublicKeyInfo from "./PublicKeyInfo";
import Extension from "./Extension";
import Extensions from "./Extensions";
import RSASSAPSSParams from "./RSASSAPSSParams";
//**************************************************************************************
function tbsCertificate(parameters = {})
{
	//TBSCertificate  ::=  SEQUENCE  {
	//    version         [0]  EXPLICIT Version DEFAULT v1,
	//    serialNumber         CertificateSerialNumber,
	//    signature            AlgorithmIdentifier,
	//    issuer               Name,
	//    validity             Validity,
	//    subject              Name,
	//    subjectPublicKeyInfo SubjectPublicKeyInfo,
	//    issuerUniqueID  [1]  IMPLICIT UniqueIdentifier OPTIONAL,
	//                         -- If present, version MUST be v2 or v3
	//    subjectUniqueID [2]  IMPLICIT UniqueIdentifier OPTIONAL,
	//                         -- If present, version MUST be v2 or v3
	//    extensions      [3]  EXPLICIT Extensions OPTIONAL
	//    -- If present, version MUST be v3
	//}
	
	/**
	 * @type {Object}
	 * @property {string} [blockName]
	 * @property {string} [tbsCertificateVersion]
	 * @property {string} [tbsCertificateSerialNumber]
	 * @property {string} [signature]
	 * @property {string} [issuer]
	 * @property {string} [tbsCertificateValidity]
	 * @property {string} [notBefore]
	 * @property {string} [notAfter]
	 * @property {string} [subject]
	 * @property {string} [subjectPublicKeyInfo]
	 * @property {string} [tbsCertificateIssuerUniqueID]
	 * @property {string} [tbsCertificateSubjectUniqueID]
	 * @property {string} [extensions]
	 */
	const names = getParametersValue(parameters, "names", {});
	
	return (new asn1js.Sequence({
		name: (names.blockName || "tbsCertificate"),
		value: [
			new asn1js.Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [
					new asn1js.Integer({ name: (names.tbsCertificateVersion || "tbsCertificate.version") }) // EXPLICIT integer value
				]
			}),
			new asn1js.Integer({ name: (names.tbsCertificateSerialNumber || "tbsCertificate.serialNumber") }),
			AlgorithmIdentifier.schema(names.signature || {
				names: {
					blockName: "tbsCertificate.signature"
				}
			}),
			RelativeDistinguishedNames.schema(names.issuer || {
				names: {
					blockName: "tbsCertificate.issuer"
				}
			}),
			new asn1js.Sequence({
				name: (names.tbsCertificateValidity || "tbsCertificate.validity"),
				value: [
					Time.schema(names.notBefore || {
						names: {
							utcTimeName: "tbsCertificate.notBefore",
							generalTimeName: "tbsCertificate.notBefore"
						}
					}),
					Time.schema(names.notAfter || {
						names: {
							utcTimeName: "tbsCertificate.notAfter",
							generalTimeName: "tbsCertificate.notAfter"
						}
					})
				]
			}),
			RelativeDistinguishedNames.schema(names.subject || {
				names: {
					blockName: "tbsCertificate.subject"
				}
			}),
			PublicKeyInfo.schema(names.subjectPublicKeyInfo || {
				names: {
					blockName: "tbsCertificate.subjectPublicKeyInfo"
				}
			}),
			new asn1js.Primitive({
				name: (names.tbsCertificateIssuerUniqueID || "tbsCertificate.issuerUniqueID"),
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				}
			}), // IMPLICIT bistring value
			new asn1js.Primitive({
				name: (names.tbsCertificateSubjectUniqueID || "tbsCertificate.subjectUniqueID"),
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				}
			}), // IMPLICIT bistring value
			new asn1js.Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 3 // [3]
				},
				value: [Extensions.schema(names.extensions || {
					names: {
						blockName: "tbsCertificate.extensions"
					}
				})]
			}) // EXPLICIT SEQUENCE value
		]
	}));
}
//**************************************************************************************
/**
 * Class from RFC5280
 */
export default class Certificate {
	//**********************************************************************************
	/**
	 * Constructor for Certificate class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {ArrayBuffer}
		 * @description tbs
		 */
		this.tbs = getParametersValue(parameters, "tbs", Certificate.defaultValues("tbs"));
		/**
		 * @type {number}
		 * @description version
		 */
		this.version = getParametersValue(parameters, "version", Certificate.defaultValues("version"));
		/**
		 * @type {Integer}
		 * @description serialNumber
		 */
		this.serialNumber = getParametersValue(parameters, "serialNumber", Certificate.defaultValues("serialNumber"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @description signature
		 */
		this.signature = getParametersValue(parameters, "signature", Certificate.defaultValues("signature"));
		/**
		 * @type {RelativeDistinguishedNames}
		 * @description issuer
		 */
		this.issuer = getParametersValue(parameters, "issuer", Certificate.defaultValues("issuer"));
		/**
		 * @type {Time}
		 * @description notBefore
		 */
		this.notBefore = getParametersValue(parameters, "notBefore", Certificate.defaultValues("notBefore"));
		/**
		 * @type {Time}
		 * @description notAfter
		 */
		this.notAfter = getParametersValue(parameters, "notAfter", Certificate.defaultValues("notAfter"));
		/**
		 * @type {RelativeDistinguishedNames}
		 * @description subject
		 */
		this.subject = getParametersValue(parameters, "subject", Certificate.defaultValues("subject"));
		/**
		 * @type {PublicKeyInfo}
		 * @description subjectPublicKeyInfo
		 */
		this.subjectPublicKeyInfo = getParametersValue(parameters, "subjectPublicKeyInfo", Certificate.defaultValues("subjectPublicKeyInfo"));
		
		if("issuerUniqueID" in parameters)
			/**
			 * @type {ArrayBuffer}
			 * @description issuerUniqueID
			 */
			this.issuerUniqueID = getParametersValue(parameters, "issuerUniqueID", Certificate.defaultValues("issuerUniqueID"));
		
		if("subjectUniqueID" in parameters)
			/**
			 * @type {ArrayBuffer}
			 * @description subjectUniqueID
			 */
			this.subjectUniqueID = getParametersValue(parameters, "subjectUniqueID", Certificate.defaultValues("subjectUniqueID"));
		
		if("extensions" in parameters)
			/**
			 * @type {Array}
			 * @description extensions
			 */
			this.extensions = getParametersValue(parameters, "extensions", Certificate.defaultValues("extensions"));
		
		/**
		 * @type {AlgorithmIdentifier}
		 * @description signatureAlgorithm
		 */
		this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", Certificate.defaultValues("signatureAlgorithm"));
		/**
		 * @type {BitString}
		 * @description signatureValue
		 */
		this.signatureValue = getParametersValue(parameters, "signatureValue", Certificate.defaultValues("signatureValue"));
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
			case "tbs":
				return new ArrayBuffer(0);
			case "version":
				return 0;
			case "serialNumber":
				return new asn1js.Integer();
			case "signature":
				return new AlgorithmIdentifier();
			case "issuer":
				return new RelativeDistinguishedNames();
			case "notBefore":
				return new Time();
			case "notAfter":
				return new Time();
			case "subject":
				return new RelativeDistinguishedNames();
			case "subjectPublicKeyInfo":
				return new PublicKeyInfo();
			case "issuerUniqueID":
				return new ArrayBuffer(0);
			case "subjectUniqueID":
				return new ArrayBuffer(0);
			case "extensions":
				return [];
			case "signatureAlgorithm":
				return new AlgorithmIdentifier();
			case "signatureValue":
				return new asn1js.BitString();
			default:
				throw new Error(`Invalid member name for Certificate class: ${memberName}`);
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
		//Certificate  ::=  SEQUENCE  {
		//    tbsCertificate       TBSCertificate,
		//    signatureAlgorithm   AlgorithmIdentifier,
		//    signatureValue       BIT STRING  }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [tbsCertificate]
		 * @property {string} [signatureAlgorithm]
		 * @property {string} [signatureValue]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				tbsCertificate(names.tbsCertificate),
				AlgorithmIdentifier.schema(names.signatureAlgorithm || {
					names: {
						blockName: "signatureAlgorithm"
					}
				}),
				new asn1js.BitString({ name: (names.signatureValue || "signatureValue") })
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
			Certificate.schema({
				names: {
					tbsCertificate: {
						names: {
							extensions: {
								names: {
									extensions: "tbsCertificate.extensions"
								}
							}
						}
					}
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CERT");
		//endregion
		
		//region Get internal properties from parsed schema
		this.tbs = asn1.result.tbsCertificate.valueBeforeDecode;
		
		if("tbsCertificate.version" in asn1.result)
			this.version = asn1.result["tbsCertificate.version"].valueBlock.valueDec;
		this.serialNumber = asn1.result["tbsCertificate.serialNumber"];
		this.signature = new AlgorithmIdentifier({ schema: asn1.result["tbsCertificate.signature"] });
		this.issuer = new RelativeDistinguishedNames({ schema: asn1.result["tbsCertificate.issuer"] });
		this.notBefore = new Time({ schema: asn1.result["tbsCertificate.notBefore"] });
		this.notAfter = new Time({ schema: asn1.result["tbsCertificate.notAfter"] });
		this.subject = new RelativeDistinguishedNames({ schema: asn1.result["tbsCertificate.subject"] });
		this.subjectPublicKeyInfo = new PublicKeyInfo({ schema: asn1.result["tbsCertificate.subjectPublicKeyInfo"] });
		if("tbsCertificate.issuerUniqueID" in asn1.result)
			this.issuerUniqueID = asn1.result["tbsCertificate.issuerUniqueID"].valueBlock.valueHex;
		if("tbsCertificate.subjectUniqueID" in asn1.result)
			this.issuerUniqueID = asn1.result["tbsCertificate.subjectUniqueID"].valueBlock.valueHex;
		if("tbsCertificate.extensions" in asn1.result)
			this.extensions = Array.from(asn1.result["tbsCertificate.extensions"], element => new Extension({ schema: element }));
		
		this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
		this.signatureValue = asn1.result.signatureValue;
		//endregion
	}
	
	//**********************************************************************************
	/**
	 * Create ASN.1 schema for existing values of TBS part for the certificate
	 */
	encodeTBS()
	{
		//region Create array for output sequence
		const outputArray = [];
		
		if(("version" in this) && (this.version !== Certificate.defaultValues("version")))
		{
			outputArray.push(new asn1js.Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [
					new asn1js.Integer({ value: this.version }) // EXPLICIT integer value
				]
			}));
		}
		
		outputArray.push(this.serialNumber);
		outputArray.push(this.signature.toSchema());
		outputArray.push(this.issuer.toSchema());
		
		outputArray.push(new asn1js.Sequence({
			value: [
				this.notBefore.toSchema(),
				this.notAfter.toSchema()
			]
		}));
		
		outputArray.push(this.subject.toSchema());
		outputArray.push(this.subjectPublicKeyInfo.toSchema());
		
		if("issuerUniqueID" in this)
		{
			outputArray.push(new asn1js.Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				valueHex: this.issuerUniqueID
			}));
		}
		if("subjectUniqueID" in this)
		{
			outputArray.push(new asn1js.Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				},
				valueHex: this.subjectUniqueID
			}));
		}
		
		if("subjectUniqueID" in this)
		{
			outputArray.push(new asn1js.Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 3 // [3]
				},
				value: [this.extensions.toSchema()]
			}));
		}
		
		if("extensions" in this)
		{
			outputArray.push(new asn1js.Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 3 // [3]
				},
				value: [new asn1js.Sequence({
					value: Array.from(this.extensions, element => element.toSchema())
				})]
			}));
		}
		//endregion
		
		//region Create and return output sequence
		return (new asn1js.Sequence({
			value: outputArray
		}));
		//endregion
	}
	
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema(encodeFlag = false)
	{
		let tbsSchema = {};
		
		//region Decode stored TBS value
		if(encodeFlag === false)
		{
			if(this.tbs.length === 0) // No stored certificate TBS part
				return Certificate.schema().value[0];
			
			tbsSchema = asn1js.fromBER(this.tbs).result;
		}
		//endregion
		//region Create TBS schema via assembling from TBS parts
		else
			tbsSchema = this.encodeTBS();
		//endregion
		
		//region Construct and return new ASN.1 schema for this object
		return (new asn1js.Sequence({
			value: [
				tbsSchema,
				this.signatureAlgorithm.toSchema(),
				this.signatureValue
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
			tbs: bufferToHexCodes(this.tbs, 0, this.tbs.byteLength),
			serialNumber: this.serialNumber.toJSON(),
			signature: this.signature.toJSON(),
			issuer: this.issuer.toJSON(),
			notBefore: this.notBefore.toJSON(),
			notAfter: this.notAfter.toJSON(),
			subject: this.subject.toJSON(),
			subjectPublicKeyInfo: this.subjectPublicKeyInfo.toJSON(),
			signatureAlgorithm: this.signatureAlgorithm.toJSON(),
			signatureValue: this.signatureValue.toJSON()
		};
		
		if(("version" in this) && (this.version !== Certificate.defaultValues("version")))
			object.version = this.version;
		
		if("issuerUniqueID" in this)
			object.issuerUniqueID = bufferToHexCodes(this.issuerUniqueID, 0, this.issuerUniqueID.byteLength);
		
		if("subjectUniqueID" in this)
			object.subjectUniqueID = bufferToHexCodes(this.subjectUniqueID, 0, this.subjectUniqueID.byteLength);
		
		if("extensions" in this)
			object.extensions = Array.from(this.extensions, element => element.toJSON());
		
		return object;
	}
	
	//**********************************************************************************
	/**
	 * Importing public key for current certificate
	 */
	getPublicKey(parameters = null)
	{
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Find correct algorithm for imported public key
		if(parameters === null)
		{
			//region Initial variables
			parameters = {};
			//endregion
			
			//region Find signer's hashing algorithm
			const shaAlgorithm = getHashAlgorithm(this.signatureAlgorithm);
			if(shaAlgorithm === "")
				return Promise.reject(`Unsupported signature algorithm: ${this.signatureAlgorithm.algorithmId}`);
			//endregion
			
			//region Get information about public key algorithm and default parameters for import
			const algorithmObject = getAlgorithmByOID(this.subjectPublicKeyInfo.algorithm.algorithmId);
			if(("name" in algorithmObject) === false)
				return Promise.reject(`Unsupported public key algorithm: ${this.subjectPublicKeyInfo.algorithm.algorithmId}`);
			
			parameters.algorithm = getAlgorithmParameters(algorithmObject.name, "importkey");
			if("hash" in parameters.algorithm.algorithm)
				parameters.algorithm.algorithm.hash.name = shaAlgorithm;
			
			//region Special case for ECDSA
			if(algorithmObject.name === "ECDSA")
			{
				// #region Get information about named curve
				let algorithmParamsChecked = false;
				
				if(("algorithmParams" in this.subjectPublicKeyInfo.algorithm) === true)
				{
					if("idBlock" in this.subjectPublicKeyInfo.algorithm.algorithmParams)
					{
						if((this.subjectPublicKeyInfo.algorithm.algorithmParams.idBlock.tagClass === 1) && (signerCertificate.subjectPublicKeyInfo.algorithm.algorithmParams.idBlock.tagNumber === 6))
							algorithmParamsChecked = true;
					}
				}
				
				if(algorithmParamsChecked === false)
					return Promise.reject("Incorrect type for ECDSA public key parameters");
				
				const curveObject = getAlgorithmByOID(this.subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
				if(("name" in curveObject) === false)
					return Promise.reject(`Unsupported named curve algorithm: ${this.subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString()}`);
				// #endregion
				
				parameters.algorithm.algorithm.namedCurve = curveObject.name;
			}
			//endregion
			//endregion
		}
		//endregion
		
		//region Get neccessary values from internal fields for current certificate
		const publicKeyInfoSchema = this.subjectPublicKeyInfo.toSchema();
		const publicKeyInfoBuffer = publicKeyInfoSchema.toBER(false);
		const publicKeyInfoView = new Uint8Array(publicKeyInfoBuffer);
		//endregion
		
		return crypto.importKey("spki", publicKeyInfoView, parameters.algorithm.algorithm, true, parameters.algorithm.usages);
	}
	
	//**********************************************************************************
	/**
	 * Get SHA-1 hash value for subject public key
	 */
	getKeyHash()
	{
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		return crypto.digest({ name: "sha-1" }, new Uint8Array(this.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex));
	}
	
	//**********************************************************************************
	/**
	 * Make a signature for current value from TBS section
	 * @param {Object} privateKey Private key for "subjectPublicKeyInfo" structure
	 * @param {string} [hashAlgorithm="SHA-1"] Hashing algorithm
	 */
	sign(privateKey, hashAlgorithm = "SHA-1")
	{
		//region Get hashing algorithm
		const oid = getOIDByAlgorithm({ name: hashAlgorithm });
		if(oid === "")
			return Promise.reject(`Unsupported hash algorithm: ${hashAlgorithm}`);
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
				this.signature.algorithmId = getOIDByAlgorithm(defParams.algorithm);
				this.signatureAlgorithm.algorithmId = this.signature.algorithmId;
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
					this.signature = new AlgorithmIdentifier({
						algorithmId: "1.2.840.113549.1.1.10",
						algorithmParams: pssParameters.toSchema()
					});
					this.signatureAlgorithm = this.signature; // Must be the same
				//endregion
				}
				break;
			default:
				return Promise.reject(`Unsupported signature algorithm: ${privateKey.algorithm.name}`);
		}
		//endregion
		
		//region Create TBS data for signing
		this.tbs = this.encodeTBS().toBER(false);
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Signing TBS data on provided private key
		return crypto.sign(defParams.algorithm,
			privateKey,
			new Uint8Array(this.tbs)).then(result =>
		{
			//region Special case for ECDSA algorithm
				if(defParams.algorithm.name === "ECDSA")
					result = createCMSECDSASignature(result);
			//endregion
			
				this.signatureValue = new asn1js.BitString({ valueHex: result });
			}, error => Promise.reject(`Signing error: ${error}`));
		//endregion
	}
	
	//**********************************************************************************
	verify(issuerCertificate = null)
	{
		//region Global variables
		let sequence = Promise.resolve();
		
		let subjectPublicKeyInfo = {};
		
		const signature = this.signatureValue;
		const tbs = this.tbs;
		//endregion
		
		//region Set correct "subjectPublicKeyInfo" value
		if(issuerCertificate !== null)
			subjectPublicKeyInfo = issuerCertificate.subjectPublicKeyInfo;
		else
		{
			if(this.issuer.isEqual(this.subject)) // Self-signed certificate
				subjectPublicKeyInfo = this.subjectPublicKeyInfo;
		}
		
		if((subjectPublicKeyInfo instanceof PublicKeyInfo) === false)
			return Promise.reject("Please provide issuer certificate as a parameter");
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Find signer's hashing algorithm
		const shaAlgorithm = getHashAlgorithm(this.signatureAlgorithm);
		if(shaAlgorithm === "")
			return Promise.reject(`Unsupported signature algorithm: ${this.signatureAlgorithm.algorithmId}`);
		//endregion
		
		//region Importing public key
		sequence = sequence.then(() =>
		{
			//region Get information about public key algorithm and default parameters for import
			let algorithmId;
			if(this.signatureAlgorithm.algorithmId === "1.2.840.113549.1.1.10")
				algorithmId = this.signatureAlgorithm.algorithmId;
			else
				algorithmId = subjectPublicKeyInfo.algorithm.algorithmId;
			
			const algorithmObject = getAlgorithmByOID(algorithmId);
			if(("name" in algorithmObject) === false)
				return Promise.reject(`Unsupported public key algorithm: ${algorithmId}`);
			
			const algorithm = getAlgorithmParameters(algorithmObject.name, "importkey");
			if("hash" in algorithm.algorithm)
				algorithm.algorithm.hash.name = shaAlgorithm;
			
			//region Special case for ECDSA
			if(algorithmObject.name === "ECDSA")
			{
				// #region Get information about named curve
				let algorithmParamsChecked = false;
				
				if(("algorithmParams" in subjectPublicKeyInfo.algorithm) === true)
				{
					if("idBlock" in subjectPublicKeyInfo.algorithm.algorithmParams)
					{
						if((subjectPublicKeyInfo.algorithm.algorithmParams.idBlock.tagClass === 1) && (subjectPublicKeyInfo.algorithm.algorithmParams.idBlock.tagNumber === 6))
							algorithmParamsChecked = true;
					}
				}
				
				if(algorithmParamsChecked === false)
					return Promise.reject("Incorrect type for ECDSA public key parameters");
				
				const curveObject = getAlgorithmByOID(subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
				if(("name" in curveObject) === false)
					return Promise.reject(`Unsupported named curve algorithm: ${subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString()}`);
				// #endregion
				
				algorithm.algorithm.namedCurve = curveObject.name;
			}
			//endregion
			//endregion
			
			const publicKeyInfoSchema = subjectPublicKeyInfo.toSchema();
			const publicKeyInfoBuffer = publicKeyInfoSchema.toBER(false);
			const publicKeyInfoView = new Uint8Array(publicKeyInfoBuffer);
			
			return crypto.importKey("spki", publicKeyInfoView, algorithm.algorithm, true, algorithm.usages);
		});
		//endregion
		
		//region Verify signature for the certificate
		sequence = sequence.then(publicKey =>
		{
			//region Get default algorithm parameters for verification
			const algorithm = getAlgorithmParameters(publicKey.algorithm.name, "verify");
			if("hash" in algorithm.algorithm)
				algorithm.algorithm.hash.name = shaAlgorithm;
			//endregion
			
			//region Special case for ECDSA signatures
			let signatureValue = signature.valueBlock.valueHex;
			
			if(publicKey.algorithm.name === "ECDSA")
			{
				const asn1 = asn1js.fromBER(signatureValue);
				signatureValue = createECDSASignatureFromCMS(asn1.result);
			}
			//endregion
			
			//region Special case for RSA-PSS
			if(publicKey.algorithm.name === "RSA-PSS")
			{
				let pssParameters;
				
				try
				{
					pssParameters = new RSASSAPSSParams({ schema: this.signatureAlgorithm.algorithmParams });
				}
				catch(ex)
				{
					return Promise.reject(ex);
				}
				
				if("saltLength" in pssParameters)
					algorithm.algorithm.saltLength = pssParameters.saltLength;
				else
					algorithm.algorithm.saltLength = 20;
				
				let hashAlgo = "SHA-1";
				
				if("hashAlgorithm" in pssParameters)
				{
					const hashAlgorithm = getAlgorithmByOID(pssParameters.hashAlgorithm.algorithmId);
					if(("name" in hashAlgorithm) === false)
						return Promise.reject(`Unrecognized hash algorithm: ${pssParameters.hashAlgorithm.algorithmId}`);
					
					hashAlgo = hashAlgorithm.name;
				}
				
				algorithm.algorithm.hash.name = hashAlgo;
			}
			//endregion
			
			return crypto.verify(algorithm.algorithm,
				publicKey,
				new Uint8Array(signatureValue),
				new Uint8Array(tbs)
			);
		});
		//endregion
		
		return sequence;
	}
	
	//**********************************************************************************
}
//**************************************************************************************
