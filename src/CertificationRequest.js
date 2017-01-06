import * as asn1js from "asn1js";
import { getParametersValue, bufferToHexCodes } from "pvutils";
import {
	getOIDByAlgorithm,
	getAlgorithmParameters,
	getCrypto,
	createCMSECDSASignature,
	getHashAlgorithm,
	getAlgorithmByOID,
	createECDSASignatureFromCMS
} from "./common";
import PublicKeyInfo from "./PublicKeyInfo";
import RelativeDistinguishedNames from "./RelativeDistinguishedNames";
import AlgorithmIdentifier from "./AlgorithmIdentifier";
import Attribute from "./Attribute";
import RSASSAPSSParams from "./RSASSAPSSParams";
//**************************************************************************************
function CertificationRequestInfo(parameters = {})
{
	//CertificationRequestInfo ::= SEQUENCE {
	//    version       INTEGER { v1(0) } (v1,...),
	//    subject       Name,
	//    subjectPKInfo SubjectPublicKeyInfo{{ PKInfoAlgorithms }},
	//    attributes    [0] Attributes{{ CRIAttributes }}
	//}
	
	/**
	 * @type {Object}
	 * @property {string} [blockName]
	 * @property {string} [CertificationRequestInfo]
	 * @property {string} [CertificationRequestInfoVersion]
	 * @property {string} [subject]
	 * @property {string} [CertificationRequestInfoAttributes]
	 * @property {string} [attributes]
	 */
	const names = getParametersValue(parameters, "names", {});
	
	return (new asn1js.Sequence({
		name: (names.CertificationRequestInfo || "CertificationRequestInfo"),
		value: [
			new asn1js.Integer({ name: (names.CertificationRequestInfoVersion || "CertificationRequestInfo.version") }),
			RelativeDistinguishedNames.schema(names.subject || {
				names: {
					blockName: "CertificationRequestInfo.subject"
				}
			}),
			PublicKeyInfo.schema({
				names: {
					blockName: "CertificationRequestInfo.subjectPublicKeyInfo"
				}
			}),
			new asn1js.Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [
					new asn1js.Repeated({
						optional: true, // Because OpenSSL makes wrong "attributes" field
						name: (names.CertificationRequestInfoAttributes || "CertificationRequestInfo.attributes"),
						value: Attribute.schema(names.attributes || {})
					})
				]
			})
		]
	}));
}
//**************************************************************************************
/**
 * Class from RFC2986
 */
export default class CertificationRequest {
	//**********************************************************************************
	/**
	 * Constructor for Attribute class
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
		this.tbs = getParametersValue(parameters, "tbs", CertificationRequest.defaultValues("tbs"));
		/**
		 * @type {number}
		 * @description version
		 */
		this.version = getParametersValue(parameters, "version", CertificationRequest.defaultValues("version"));
		/**
		 * @type {RelativeDistinguishedNames}
		 * @description subject
		 */
		this.subject = getParametersValue(parameters, "subject", CertificationRequest.defaultValues("subject"));
		/**
		 * @type {PublicKeyInfo}
		 * @description subjectPublicKeyInfo
		 */
		this.subjectPublicKeyInfo = getParametersValue(parameters, "subjectPublicKeyInfo", CertificationRequest.defaultValues("subjectPublicKeyInfo"));
		
		if("attributes" in parameters)
			/**
			 * @type {Array.<Attribute>}
			 * @description attributes
			 */
			this.attributes = getParametersValue(parameters, "attributes", CertificationRequest.defaultValues("attributes"));
		
		/**
		 * @type {AlgorithmIdentifier}
		 * @description signatureAlgorithm
		 */
		this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", CertificationRequest.defaultValues("signatureAlgorithm"));
		/**
		 * @type {BitString}
		 * @description signatureAlgorithm
		 */
		this.signatureValue = getParametersValue(parameters, "signatureValue", CertificationRequest.defaultValues("signatureValue"));
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
			case "subject":
				return new RelativeDistinguishedNames();
			case "subjectPublicKeyInfo":
				return new PublicKeyInfo();
			case "attributes":
				return [];
			case "signatureAlgorithm":
				return new AlgorithmIdentifier();
			case "signatureValue":
				return new asn1js.BitString();
			default:
				throw new Error(`Invalid member name for CertificationRequest class: ${memberName}`);
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
		//CertificationRequest ::= SEQUENCE {
		//    certificationRequestInfo CertificationRequestInfo,
		//    signatureAlgorithm       AlgorithmIdentifier{{ SignatureAlgorithms }},
		//    signature                BIT STRING
		//}
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [certificationRequestInfo]
		 * @property {string} [signatureAlgorithm]
		 * @property {string} [signatureValue]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			value: [
				CertificationRequestInfo(names.certificationRequestInfo || {}),
				new asn1js.Sequence({
					name: (names.signatureAlgorithm || "signatureAlgorithm"),
					value: [
						new asn1js.ObjectIdentifier(),
						new asn1js.Any({ optional: true })
					]
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
			CertificationRequest.schema()
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for PKCS10");
		//endregion
		
		//region Get internal properties from parsed schema
		this.tbs = asn1.result.CertificationRequestInfo.valueBeforeDecode;
		
		this.version = asn1.result["CertificationRequestInfo.version"].valueBlock.valueDec;
		this.subject = new RelativeDistinguishedNames({ schema: asn1.result["CertificationRequestInfo.subject"] });
		this.subjectPublicKeyInfo = new PublicKeyInfo({ schema: asn1.result["CertificationRequestInfo.subjectPublicKeyInfo"] });
		if("CertificationRequestInfo.attributes" in asn1.result)
			this.attributes = Array.from(asn1.result["CertificationRequestInfo.attributes"], element => new Attribute({ schema: element }));
		
		this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
		this.signatureValue = asn1.result.signatureValue;
		//endregion
	}
	
	//**********************************************************************************
	/**
	 * Aux function making ASN1js Sequence from current TBS
	 * @returns {Sequence}
	 */
	encodeTBS()
	{
		//region Create array for output sequence
		const outputArray = [
			new asn1js.Integer({ value: this.version }),
			this.subject.toSchema(),
			this.subjectPublicKeyInfo.toSchema()
		];
		
		if("attributes" in this)
		{
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: Array.from(this.attributes, element => element.toSchema())
			}));
		}
		//endregion
		
		return (new asn1js.Sequence({
			value: outputArray
		}));
	}
	
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema(encodeFlag = false)
	{
		//region Decode stored TBS value
		let tbsSchema;
		
		if(encodeFlag === false)
		{
			if(this.tbs.length === 0) // No stored TBS part
				return CertificationRequest.schema();
			
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
			version: this.version,
			subject: this.subject.toJSON(),
			subjectPublicKeyInfo: this.subjectPublicKeyInfo.toJSON(),
			signatureAlgorithm: this.signatureAlgorithm.toJSON(),
			signatureValue: this.signatureValue.toJSON()
		};
		
		if("attributes" in this)
			object.attributes = Array.from(this.attributes, element => element.toJSON());
		
		return object;
	}
	
	//**********************************************************************************
	/**
	 * Makes signature for currect certification request
	 * @param {Object} privateKey WebCrypto private key
	 * @param {string} [hashAlgorithm=SHA-1] String representing current hashing algorithm
	 */
	sign(privateKey, hashAlgorithm = "SHA-1")
	{
		//region Get a private key from function parameter
		if(typeof privateKey === "undefined")
			return Promise.reject("Need to provide a private key for signing");
		//endregion
		
		//region Get hashing algorithm
		const oid = getOIDByAlgorithm({ name: hashAlgorithm });
		if(oid === "")
			return Promise.reject("Unsupported hash algorithm: {$hashAlgorithm}");
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
				this.signatureAlgorithm.algorithmId = getOIDByAlgorithm(defParams.algorithm);
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
					this.signatureAlgorithm = new AlgorithmIdentifier({
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
			new Uint8Array(this.tbs)
		).then(result =>
			{
				//region Special case for ECDSA algorithm
			if(defParams.algorithm.name === "ECDSA")
				result = createCMSECDSASignature(result);
				//endregion
				
			this.signatureValue = new asn1js.BitString({ valueHex: result });
		}, error => Promise.reject(`Signing error: ${error}`)
		);
		//endregion
	}
	
	//**********************************************************************************
	/**
	 * Verify existing certification request signature
	 * @returns {*}
	 */
	verify()
	{
		//region Global variables
		let sequence = Promise.resolve();
		
		const subjectPublicKeyInfo = this.subjectPublicKeyInfo;
		const signature = this.signatureValue;
		const tbs = this.tbs;
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Find a correct hashing algorithm
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
				algorithmId = this.subjectPublicKeyInfo.algorithm.algorithmId;
			
			const algorithmObject = getAlgorithmByOID(algorithmId);
			if(("name" in algorithmObject) === false)
				return Promise.reject(`Unsupported public key algorithm: ${algorithmId}`);
			
			const algorithmName = algorithmObject.name;
			
			const algorithm = getAlgorithmParameters(algorithmName, "importkey");
			if("hash" in algorithm.algorithm)
				algorithm.algorithm.hash.name = shaAlgorithm;
			//endregion
			
			const publicKeyInfoSchema = subjectPublicKeyInfo.toSchema();
			const publicKeyInfoBuffer = publicKeyInfoSchema.toBER(false);
			const publicKeyInfoView = new Uint8Array(publicKeyInfoBuffer);
			
			return crypto.importKey("spki", publicKeyInfoView, algorithm.algorithm, true, algorithm.usages);
		});
		//endregion
		
		//region Verify signature
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
				new Uint8Array(tbs));
		});
		//endregion
		
		return sequence;
	}
	
	//**********************************************************************************
}
//**************************************************************************************
