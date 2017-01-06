import * as asn1js from "asn1js";
import { getParametersValue, utilConcatBuf } from "pvutils";
import { getCrypto, getRandomValues, getOIDByAlgorithm, getAlgorithmByOID } from "./common";
import EncryptedContentInfo from "./EncryptedContentInfo";
import Attribute from "./Attribute";
import PBKDF2Params from "./PBKDF2Params";
import AlgorithmIdentifier from "./AlgorithmIdentifier";
import PBES2Params from "./PBES2Params";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class EncryptedData {
	//**********************************************************************************
	/**
	 * Constructor for EncryptedData class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @description version
		 */
		this.version = getParametersValue(parameters, "version", EncryptedData.defaultValues("version"));
		/**
		 * @type {EncryptedContentInfo}
		 * @description encryptedContentInfo
		 */
		this.encryptedContentInfo = getParametersValue(parameters, "encryptedContentInfo", EncryptedData.defaultValues("encryptedContentInfo"));
		
		if("unprotectedAttrs" in parameters)
			/**
			 * @type {Array.<Attribute>}
			 * @description unprotectedAttrs
			 */
			this.unprotectedAttrs = getParametersValue(parameters, "unprotectedAttrs", EncryptedData.defaultValues("unprotectedAttrs"));
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
			case "version":
				return 0;
			case "encryptedContentInfo":
				return new EncryptedContentInfo();
			case "unprotectedAttrs":
				return [];
			default:
				throw new Error(`Invalid member name for EncryptedData class: ${memberName}`);
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
			case "version":
				return (memberValue === 0);
			case "encryptedContentInfo":
				return ((EncryptedContentInfo.compareWithDefault("contentType", memberValue.contentType)) &&
				(EncryptedContentInfo.compareWithDefault("contentEncryptionAlgorithm", memberValue.contentEncryptionAlgorithm)) &&
				(EncryptedContentInfo.compareWithDefault("encryptedContent", memberValue.encryptedContent)));
			case "unprotectedAttrs":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for EncryptedData class: ${memberName}`);
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
		//id-encryptedData OBJECT IDENTIFIER ::= { iso(1) member-body(2)
		//    us(840) rsadsi(113549) pkcs(1) pkcs7(7) 6 }
		
		//EncryptedData ::= SEQUENCE {
		//    version CMSVersion,
		//    encryptedContentInfo EncryptedContentInfo,
		//    unprotectedAttrs [1] IMPLICIT UnprotectedAttributes OPTIONAL }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [version]
		 * @property {string} [encryptedContentInfo]
		 * @property {string} [unprotectedAttrs]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Integer({ name: (names.version || "") }),
				EncryptedContentInfo.schema(names.encryptedContentInfo || {}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: [
						new asn1js.Repeated({
							name: (names.unprotectedAttrs || ""),
							value: Attribute.schema()
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
			EncryptedData.schema({
				names: {
					version: "version",
					encryptedContentInfo: {
						names: {
							blockName: "encryptedContentInfo"
						}
					},
					unprotectedAttrs: "unprotectedAttrs"
				}
			})
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CMS_ENCRYPTED_DATA");
		//endregion
		
		//region Get internal properties from parsed schema
		this.version = asn1.result.version.valueBlock.valueDec;
		this.encryptedContentInfo = new EncryptedContentInfo({ schema: asn1.result.encryptedContentInfo });
		
		if("unprotectedAttrs" in asn1.result)
			this.unprotectedAttrs = Array.from(asn1.result.unprotectedAttrs, element => new Attribute({ schema: element }));
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
		
		outputArray.push(new asn1js.Integer({ value: this.version }));
		outputArray.push(this.encryptedContentInfo.toSchema());
		
		if("unprotectedAttrs" in this)
		{
			outputArray.push(new asn1js.Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: Array.from(this.unprotectedAttrs, element => element.toSchema())
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
			version: this.version,
			encryptedContentInfo: this.encryptedContentInfo.toJSON()
		};
		
		if("unprotectedAttrs" in this)
			_object.unprotectedAttrs = Array.from(this.unprotectedAttrs, element => element.toJSON());
		
		return _object;
	}
	
	//**********************************************************************************
	/**
	 * Create a new CMS Encrypted Data content
	 * @param {Object} parameters Parameters neccessary for encryption
	 * @returns {Promise}
	 */
	encrypt(parameters)
	{
		//region Check for input parameters
		if((parameters instanceof Object) === false)
			return Promise.reject("Parameters must have type \"Object\"");
		
		if(("password" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"password\"");
		
		if(("contentEncryptionAlgorithm" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"contentEncryptionAlgorithm\"");
		
		if(("hmacHashAlgorithm" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"hmacHashAlgorithm\"");
		
		if(("iterationCount" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"iterationCount\"");
		
		if(("contentToEncrypt" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"contentToEncrypt\"");
		
		const contentEncryptionOID = getOIDByAlgorithm(parameters.contentEncryptionAlgorithm);
		if(contentEncryptionOID === "")
			return Promise.reject("Wrong \"contentEncryptionAlgorithm\" value");
		
		const pbkdf2OID = getOIDByAlgorithm({
			name: "PBKDF2"
		});
		if(pbkdf2OID === "")
			return Promise.reject("Can not find OID for PBKDF2");
		
		const hmacOID = getOIDByAlgorithm({
			name: "HMAC",
			hash: {
				name: parameters.hmacHashAlgorithm
			}
		});
		if(hmacOID === "")
			return Promise.reject(`Incorrect value for \"hmacHashAlgorithm\": ${parameters.hmacHashAlgorithm}`);
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Initial variables
		let sequence = Promise.resolve();
		
		const ivBuffer = new ArrayBuffer(16); // For AES we need IV 16 bytes long
		const ivView = new Uint8Array(ivBuffer);
		getRandomValues(ivView);
		
		const saltBuffer = new ArrayBuffer(64);
		const saltView = new Uint8Array(saltBuffer);
		getRandomValues(saltView);
		
		const contentView = new Uint8Array(parameters.contentToEncrypt);
		
		const pbkdf2Params = new PBKDF2Params({
			salt: new asn1js.OctetString({ valueHex: saltBuffer }),
			iterationCount: parameters.iterationCount,
			prf: new AlgorithmIdentifier({
				algorithmId: hmacOID,
				algorithmParams: new asn1js.Null()
			})
		});
		//endregion
		
		//region Derive PBKDF2 key from "password" buffer
		sequence = sequence.then(() =>
		{
			const passwordView = new Uint8Array(parameters.password);
				
			return crypto.importKey("raw",
					passwordView,
					"PBKDF2",
					false,
					["deriveKey"]);
		}, error =>
				Promise.reject(error)
		);
		//endregion
		
		//region Derive key for "contentEncryptionAlgorithm"
		sequence = sequence.then(result =>
			crypto.deriveKey({
				name: "PBKDF2",
				hash: {
					name: parameters.hmacHashAlgorithm
				},
				salt: saltView,
				iterations: parameters.iterationCount
			},
				result,
				parameters.contentEncryptionAlgorithm,
				false,
				["encrypt"]),
			error =>
				Promise.reject(error)
		);
		//endregion
		
		//region Encrypt content
		sequence = sequence.then(result =>
				crypto.encrypt({
					name: parameters.contentEncryptionAlgorithm.name,
					iv: ivView
				},
					result,
					contentView),
			error =>
				Promise.reject(error)
		);
		//endregion
		
		//region Store all parameters in CMS_ENCRYPTED_DATA
		sequence = sequence.then(result =>
			{
			const pbes2Parameters = new PBES2Params({
				keyDerivationFunc: new AlgorithmIdentifier({
					algorithmId: pbkdf2OID,
					algorithmParams: pbkdf2Params.toSchema()
				}),
				encryptionScheme: new AlgorithmIdentifier({
					algorithmId: contentEncryptionOID,
					algorithmParams: new asn1js.OctetString({ valueHex: ivBuffer })
				})
			});
				
			this.encryptedContentInfo = new EncryptedContentInfo({
				contentType: "1.2.840.113549.1.7.1", // "data"
				contentEncryptionAlgorithm: new AlgorithmIdentifier({
					algorithmId: "1.2.840.113549.1.5.13", // pkcs5PBES2
					algorithmParams: pbes2Parameters.toSchema()
				}),
				encryptedContent: new asn1js.OctetString({ valueHex: result })
			});
		}, error =>
				Promise.reject(error)
		);
		//endregion
		
		return sequence;
	}
	
	//**********************************************************************************
	/**
	 * Create a new CMS Encrypted Data content
	 * @param {Object} parameters Parameters neccessary for encryption
	 */
	decrypt(parameters)
	{
		//region Check for input parameters 
		if((parameters instanceof Object) === false)
			return Promise.reject("Parameters must have type \"Object\"");
		
		if(("password" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"password\"");
		
		if(this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId !== "1.2.840.113549.1.5.13") // pkcs5PBES2
			return Promise.reject(`Unknown \"contentEncryptionAlgorithm\": ${this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId}`);
		//endregion 
		
		//region Get a "crypto" extension 
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion 
		
		//region Initial variables 
		let sequence = Promise.resolve();
		
		let pbes2Parameters;
		
		try
		{
			pbes2Parameters = new PBES2Params({ schema: this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams });
		}
		catch(ex)
		{
			return Promise.reject("Incorrectly encoded \"pbes2Parameters\"");
		}
		
		let pbkdf2Params;
		
		try
		{
			pbkdf2Params = new PBKDF2Params({ schema: pbes2Parameters.keyDerivationFunc.algorithmParams });
		}
		catch(ex)
		{
			return Promise.reject("Incorrectly encoded \"pbkdf2Params\"");
		}
		
		const contentEncryptionAlgorithm = getAlgorithmByOID(pbes2Parameters.encryptionScheme.algorithmId);
		if(("name" in contentEncryptionAlgorithm) === false)
			return Promise.reject(`Incorrect OID for \"contentEncryptionAlgorithm\": ${pbes2Parameters.encryptionScheme.algorithmId}`);
		
		const ivBuffer = pbes2Parameters.encryptionScheme.algorithmParams.valueBlock.valueHex;
		const ivView = new Uint8Array(ivBuffer);
		
		const saltBuffer = pbkdf2Params.salt.valueBlock.valueHex;
		const saltView = new Uint8Array(saltBuffer);
		
		const iterationCount = pbkdf2Params.iterationCount;
		
		let hmacHashAlgorithm = "SHA-1";
		
		if("prf" in pbkdf2Params)
		{
			const algorithm = getAlgorithmByOID(pbkdf2Params.prf.algorithmId);
			if(("name" in algorithm) === false)
				return Promise.reject("Incorrect OID for HMAC hash algorithm");
			
			hmacHashAlgorithm = algorithm.hash.name;
		}
		//endregion 
		
		//region Derive PBKDF2 key from "password" buffer 
		sequence = sequence.then(() =>
				crypto.importKey("raw",
					parameters.password,
					"PBKDF2",
					false,
					["deriveKey"]),
			error =>
				Promise.reject(error)
		);
		//endregion 
		
		//region Derive key for "contentEncryptionAlgorithm" 
		sequence = sequence.then(result =>
			crypto.deriveKey({
				name: "PBKDF2",
				hash: {
					name: hmacHashAlgorithm
				},
				salt: saltView,
				iterations: iterationCount
			},
				result,
				contentEncryptionAlgorithm,
				false,
				["decrypt"]),
			error =>
				Promise.reject(error)
		);
		//endregion 
		
		//region Decrypt internal content using derived key 
		sequence = sequence.then(result =>
		{
			//region Create correct data block for decryption
			let dataBuffer = new ArrayBuffer(0);
				
			if(this.encryptedContentInfo.encryptedContent.idBlock.isConstructed === false)
				dataBuffer = this.encryptedContentInfo.encryptedContent.valueBlock.valueHex;
			else
				{
				for(const content of this.encryptedContentInfo.encryptedContent.valueBlock.value)
					dataBuffer = utilConcatBuf(dataBuffer, content.valueBlock.valueHex);
			}
				//endregion
				
			return crypto.decrypt({
				name: contentEncryptionAlgorithm.name,
				iv: ivView
			},
					result,
					dataBuffer);
		}, error =>
				Promise.reject(error)
		);
		//endregion 
		
		return sequence;
	}
	
	//**********************************************************************************
}
//**************************************************************************************
