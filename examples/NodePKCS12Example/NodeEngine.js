import * as asn1js from "asn1js";
import { utilConcatBuf } from "pvutils";
import AlgorithmIdentifier from "../../src/AlgorithmIdentifier";
import EncryptedContentInfo from "../../src/EncryptedContentInfo";
import PBKDF2Params from "../../src/PBKDF2Params";
import PBES2Params from "../../src/PBES2Params";
import CryptoEngine from "../../src/CryptoEngine";
import * as nodeSpecificCrypto from "./NodeEngineNodeSpecific";
//**************************************************************************************
export default class NodeEngine extends CryptoEngine
{
	//**********************************************************************************
	constructor(parameters)
	{
		super(parameters);
		
		//region Internal properties of the object
		/**
		 * @type {Object}
		 * @description Usually here we are expecting "window.crypto" or an equivalent from custom "crypto engine"
		 */
		this.crypto = nodeSpecificCrypto;
		/**
		 * @type {Object}
		 * @description Usually here we are expecting "window.crypto.subtle" or an equivalent from custom "crypto engine"
		 */
		this.subtle = this;
		/**
		 * @type {string}
		 * @description Name of the "crypto engine"
		 */
		this.name = "nodeCryptoEngine";
		//endregion
	}
	//**********************************************************************************
	/**
	 * Initialize input Uint8Array by random values (with help from current "crypto engine")
	 * @param {!Uint8Array} view
	 * @returns {*}
	 */
	getRandomValues(view)
	{
		view.set(nodeSpecificCrypto.getRandomValues(view.length));
		return view;
	}
	//**********************************************************************************
	getAlgorithmByOID(oid)
	{
		switch(oid)
		{
			case "1.2.840.113549.3.2":
				return {
					name: "RC2-40-CBC",
					length: 5
				};
			case "1.2.840.113549.3.7":
				return {
					name: "DES-EDE3-CBC",
					length: 24
				};
			case "2.16.840.1.101.3.4.1.2":
				return {
					name: "AES-128-CBC",
					length: 16
				};
			case "2.16.840.1.101.3.4.1.22":
				return {
					name: "AES-192-CBC",
					length: 24
				};
			case "2.16.840.1.101.3.4.1.42":
				return {
					name: "AES-256-CBC",
					length: 32
				};
			case "1.2.840.113549.1.5.12":
				return {
					name: "PBKDF2"
				};
			case "1.3.14.3.2.26":
				return {
					name: "SHA-1"
				};
			case "2.16.840.1.101.3.4.2.1":
				return {
					name: "SHA-256"
				};
			case "2.16.840.1.101.3.4.2.2":
				return {
					name: "SHA-384"
				};
			case "2.16.840.1.101.3.4.2.3":
				return {
					name: "SHA-512"
				};
			case "1.2.840.113549.2.7":
				return {
					name: "HMAC",
					hash: {
						name: "SHA-1"
					}
				};
			case "1.2.840.113549.2.9":
				return {
					name: "HMAC",
					hash: {
						name: "SHA-256"
					}
				};
			case "1.2.840.113549.2.10":
				return {
					name: "HMAC",
					hash: {
						name: "SHA-384"
					}
				};
			case "1.2.840.113549.2.11":
				return {
					name: "HMAC",
					hash: {
						name: "SHA-512"
					}
				};
			default:
		}
		
		return {};
	}
	//**********************************************************************************
	getOIDByAlgorithm(algorithm)
	{
		let result = "";
		
		switch(algorithm.name.toUpperCase())
		{
			case "RC2-40-CBC":
				result = "1.2.840.113549.3.2";
				break;
			case "DES-EDE3-CBC":
				result = "1.2.840.113549.3.7";
				break;
			case "AES-128-CBC":
				result = "2.16.840.1.101.3.4.1.2";
				break;
			case "AES-192-CBC":
				result = "2.16.840.1.101.3.4.1.22";
				break;
			case "AES-256-CBC":
				result = "2.16.840.1.101.3.4.1.42";
				break;
			case "PBKDF2":
				result = "1.2.840.113549.1.5.12";
				break;
			case "HMAC":
				switch(algorithm.hash.name.toUpperCase())
				{
					case "SHA-1":
						result = "1.2.840.113549.2.7";
						break;
					case "SHA-256":
						result = "1.2.840.113549.2.9";
						break;
					case "SHA-384":
						result = "1.2.840.113549.2.10";
						break;
					case "SHA-512":
						result = "1.2.840.113549.2.11";
						break;
					default:
				}
				break;
			case "SHA-1":
				result = "1.3.14.3.2.26";
				break;
			case "SHA-256":
				result = "2.16.840.1.101.3.4.2.1";
				break;
			case "SHA-384":
				result = "2.16.840.1.101.3.4.2.2";
				break;
			case "SHA-512":
				result = "2.16.840.1.101.3.4.2.3";
				break;
			default:
		}
		
		return result;
	}
	//**********************************************************************************
	getAlgorithmParameters(algorithmName, operation)
	{
		let result = {
			algorithm: {},
			usages: []
		};
		
		switch(algorithmName.toUpperCase())
		{
			case "RC2-40-CBC":
				switch(operation.toLowerCase())
				{
					case "importkey":
					case "exportkey":
					case "generatekey":
						result = {
							algorithm: {
								name: "RC2-40-CBC",
								length: 5
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					case "decrypt":
					case "encrypt":
						result = {
							algorithm: {
								name: "RC2-40-CBC",
								iv: this.getRandomValues(new Uint8Array(8)), // For "decrypt" the value should be replaced with value got on "encrypt" step
								length: 5
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "RC2-40-CBC"
							},
							usages: []
						};
				}
				break;
			case "DES-EDE3-CBC":
				switch(operation.toLowerCase())
				{
					case "importkey":
					case "exportkey":
					case "generatekey":
						result = {
							algorithm: {
								name: "DES-EDE3-CBC",
								length: 24
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					case "decrypt":
					case "encrypt":
						result = {
							algorithm: {
								name: "DES-EDE3-CBC",
								iv: this.getRandomValues(new Uint8Array(8)), // For "decrypt" the value should be replaced with value got on "encrypt" step
								length: 24
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "DES-EDE3-CBC"
							},
							usages: []
						};
				}
				break;
			case "AES-128-CBC":
				switch(operation.toLowerCase())
				{
					case "importkey":
					case "exportkey":
					case "generatekey":
						result = {
							algorithm: {
								name: "AES-128-CBC",
								length: 16
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					case "decrypt":
					case "encrypt":
						result = {
							algorithm: {
								name: "AES-128-CBC",
								iv: this.getRandomValues(new Uint8Array(16)), // For "decrypt" the value should be replaced with value got on "encrypt" step
								length: 16
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "AES-128-CBC",
								length: 16
							},
							usages: []
						};
				}
				break;
			case "AES-192-CBC":
				switch(operation.toLowerCase())
				{
					case "importkey":
					case "exportkey":
					case "generatekey":
						result = {
							algorithm: {
								name: "AES-192-CBC",
								length: 24
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					case "decrypt":
					case "encrypt":
						result = {
							algorithm: {
								name: "AES-192-CBC",
								iv: this.getRandomValues(new Uint8Array(16)), // For "decrypt" the value should be replaced with value got on "encrypt" step
								length: 24
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "AES-192-CBC",
								length: 24
							},
							usages: []
						};
				}
				break;
			case "AES-256-CBC":
				switch(operation.toLowerCase())
				{
					case "importkey":
					case "exportkey":
					case "generatekey":
						result = {
							algorithm: {
								name: "AES-256-CBC",
								length: 32
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					case "decrypt":
					case "encrypt":
						result = {
							algorithm: {
								name: "AES-256-CBC",
								iv: this.getRandomValues(new Uint8Array(16)), // For "decrypt" the value should be replaced with value got on "encrypt" step
								length: 32
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "AES-256-CBC",
								length: 32
							},
							usages: []
						};
				}
				break;
			case "PBKDF2":
				switch(operation.toLowerCase())
				{
					case "derivekey":
						result = {
							algorithm: {
								name: "PBKDF2",
								hash: { name: "SHA-256" },
								salt: new Uint8Array([]),
								iterations: 10000
							},
							usages: ["encrypt", "decrypt"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "PBKDF2"
							},
							usages: []
						};
				}
				break;
			default:
		}
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Specialized function encrypting "EncryptedContentInfo" object using parameters
	 * @param {Object} parameters
	 * @returns {Promise}
	 */
	encryptEncryptedContentInfo(parameters)
	{
		//region Initial variables
		let sequence = Promise.resolve();
		//endregion
		
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
		
		if(("contentType" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"contentType\"");
		
		if(("pbeSchema" in parameters) === false)
			parameters.pbeSchema = "PBES2";

		const contentEncryptionOID = this.getOIDByAlgorithm(parameters.contentEncryptionAlgorithm);
		if(contentEncryptionOID === "")
			return Promise.reject("Wrong \"contentEncryptionAlgorithm\" value");
		
		const pbkdf2OID = this.getOIDByAlgorithm({
			name: "PBKDF2"
		});
		if(pbkdf2OID === "")
			return Promise.reject("Can not find OID for PBKDF2");
		
		const hmacOID = this.getOIDByAlgorithm({
			name: "HMAC",
			hash: {
				name: parameters.hmacHashAlgorithm
			}
		});
		if(hmacOID === "")
			return Promise.reject(`Incorrect value for \"hmacHashAlgorithm\": ${parameters.hmacHashAlgorithm}`);
		//endregion
		
		//region Special case for PBES1
		if(parameters.pbeSchema.toUpperCase() !== "PBES2")  // Assume we have PBES1 here
		{
			//region Initial variables
			const saltBuffer = new ArrayBuffer(20);
			const saltView = new Uint8Array(saltBuffer);
			this.getRandomValues(saltView);
			
			const ivLength = 8; // (in bytes) For current algorithms (3DES and RC2) IV length has the same value
			//endregion

			//region Check we have correct encryption algorithm
			let pbeAlgorithm;
			
			switch(parameters.contentEncryptionAlgorithm.name.toUpperCase())
			{
				case "DES-EDE3-CBC":
					pbeAlgorithm = "1.2.840.113549.1.12.1.3"; // pbeWithSHAAnd3-KeyTripleDES-CBC
					break;
				case "RC2-40-CBC":
					pbeAlgorithm = "1.2.840.113549.1.12.1.6"; // pbeWithSHAAnd40BitRC2-CBC
					break;
				default:
					return Promise.reject("For PBES1 encryption algorithm could be only DES-EDE3-CBC or RC2-40-CBC");
			}
			//endregion
			
			//region Encrypt data using PBKDF1 as a source for key
			sequence = sequence.then(() =>
				nodeSpecificCrypto.encryptUsingPBKDF1Password(parameters.contentEncryptionAlgorithm.name, parameters.contentEncryptionAlgorithm.length, ivLength, parameters.password, saltBuffer, parameters.iterationCount, parameters.contentToEncrypt)
			);
			//endregion
			
			//region Store all parameters in EncryptedData object
			sequence = sequence.then(result =>
			{
				const encryptedContentInfo = new EncryptedContentInfo({
					contentType: parameters.contentType,
					contentEncryptionAlgorithm: new AlgorithmIdentifier({
						algorithmId: pbeAlgorithm,
						algorithmParams: new asn1js.Sequence({
							value: [
								new asn1js.OctetString({ valueHex: saltBuffer }),
								new asn1js.Integer({ value: parameters.iterationCount })
							]
						})
					})
				});
				encryptedContentInfo.encryptedContent = new asn1js.OctetString({ valueHex: result });
				
				return encryptedContentInfo;
			});
			//endregion
			
			return sequence;
		}
		//endregion
		
		//region Initial variables
		const ivBuffer = new ArrayBuffer(parameters.contentEncryptionAlgorithm.iv.length);
		const ivView = new Uint8Array(ivBuffer);
		this.getRandomValues(ivView);
		
		const saltBuffer = new ArrayBuffer(8);
		const saltView = new Uint8Array(saltBuffer);
		this.getRandomValues(saltView);
		
		const pbkdf2Params = new PBKDF2Params({
			salt: new asn1js.OctetString({ valueHex: saltBuffer }),
			iterationCount: parameters.iterationCount,
			prf: new AlgorithmIdentifier({
				algorithmId: hmacOID,
				algorithmParams: new asn1js.Null()
			})
		});
		//endregion
		
		//region Encrypt data using PBKDF2 as a source for key
		sequence = sequence.then(() =>
			nodeSpecificCrypto.encryptUsingPBKDF2Password(parameters.contentEncryptionAlgorithm.name, parameters.contentEncryptionAlgorithm.length, parameters.password, saltBuffer, parameters.iterationCount, parameters.hmacHashAlgorithm, ivBuffer, parameters.contentToEncrypt)
		);
		//endregion
		
		//region Store all parameters in EncryptedData object
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
			
			const encryptedContentInfo = new EncryptedContentInfo({
				contentType: parameters.contentType,
				contentEncryptionAlgorithm: new AlgorithmIdentifier({
					algorithmId: "1.2.840.113549.1.5.13", // pkcs5PBES2
					algorithmParams: pbes2Parameters.toSchema()
				})
			});
			encryptedContentInfo.encryptedContent = new asn1js.OctetString({ valueHex: result });
			
			return encryptedContentInfo;
		}, error =>
			Promise.reject(error)
		);
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
	/**
	 * Decrypt data stored in "EncryptedContentInfo" object using parameters
	 * @param parameters
	 * @return {Promise}
	 */
	decryptEncryptedContentInfo(parameters)
	{
		//region Initial variables
		let pbes1EncryptionAlgorithm = "";
		let pbes1EncryptionAlgorithmLength = 0;
		let pbes1EncryptionIVLength = 8;

		let pbes2Parameters;
		let pbkdf2Params;
		//endregion
		
		//region Check for input parameters
		if((parameters instanceof Object) === false)
			return Promise.reject("Parameters must have type \"Object\"");
		
		if(("password" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"password\"");
		
		if(("encryptedContentInfo" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"encryptedContentInfo\"");
		
		switch(parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId)
		{
			case "1.2.840.113549.1.5.13": // pkcs5PBES2
				break;
			case "1.2.840.113549.1.12.1.3": // pbeWithSHAAnd3-KeyTripleDES-CBC
				pbes1EncryptionAlgorithm = "DES-EDE3-CBC";
				pbes1EncryptionAlgorithmLength = 24;
				break;
			case "1.2.840.113549.1.12.1.6": // pbeWithSHAAnd40BitRC2-CBC
				pbes1EncryptionAlgorithm = "RC2-40-CBC";
				pbes1EncryptionAlgorithmLength = 5;
				break;
			default:
				return Promise.reject(`Unknown \"contentEncryptionAlgorithm\": ${parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId}`);
		}
		//endregion
		
		//region Create correct data block for decryption
		let dataBuffer = new ArrayBuffer(0);
		
		if(parameters.encryptedContentInfo.encryptedContent.idBlock.isConstructed === false)
			dataBuffer = parameters.encryptedContentInfo.encryptedContent.valueBlock.valueHex;
		else
		{
			for(const content of parameters.encryptedContentInfo.encryptedContent.valueBlock.value)
				dataBuffer = utilConcatBuf(dataBuffer, content.valueBlock.valueHex);
		}
		//endregion

		//region Check if we have PBES1
		if(pbes1EncryptionAlgorithm.length)
		{
			//region Description
			const pbesParameters = parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams;
			
			const saltBuffer = pbesParameters.valueBlock.value[0].valueBlock.valueHex;
			const iterationCount = pbesParameters.valueBlock.value[1].valueBlock.valueDec;
			//endregion
			
			return Promise.resolve().then(() =>
				nodeSpecificCrypto.decryptUsingPBKDF1Password(pbes1EncryptionAlgorithm, pbes1EncryptionAlgorithmLength, pbes1EncryptionIVLength, parameters.password, saltBuffer, iterationCount, dataBuffer)
			);
		}
		//endregion
		
		//region Initial variables
		try
		{
			pbes2Parameters = new PBES2Params({ schema: parameters.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams });
		}
		catch(ex)
		{
			return Promise.reject("Incorrectly encoded \"pbes2Parameters\"");
		}
		
		try
		{
			pbkdf2Params = new PBKDF2Params({ schema: pbes2Parameters.keyDerivationFunc.algorithmParams });
		}
		catch(ex)
		{
			return Promise.reject("Incorrectly encoded \"pbkdf2Params\"");
		}
		
		const contentEncryptionAlgorithm = this.getAlgorithmByOID(pbes2Parameters.encryptionScheme.algorithmId);
		if(("name" in contentEncryptionAlgorithm) === false)
			return Promise.reject(`Incorrect OID for \"contentEncryptionAlgorithm\": ${pbes2Parameters.encryptionScheme.algorithmId}`);
		
		const ivBuffer = pbes2Parameters.encryptionScheme.algorithmParams.valueBlock.valueHex;
		const saltBuffer = pbkdf2Params.salt.valueBlock.valueHex;
		
		const iterationCount = pbkdf2Params.iterationCount;
		
		let hmacHashAlgorithm = "SHA-1";
		
		if("prf" in pbkdf2Params)
		{
			const algorithm = this.getAlgorithmByOID(pbkdf2Params.prf.algorithmId);
			if(("name" in algorithm) === false)
				return Promise.reject("Incorrect OID for HMAC hash algorithm");
			
			hmacHashAlgorithm = algorithm.hash.name;
		}
		//endregion
		
		return Promise.resolve().then(() =>
			nodeSpecificCrypto.decryptUsingPBKDF2Password(contentEncryptionAlgorithm.name, contentEncryptionAlgorithm.length, parameters.password, saltBuffer, iterationCount, hmacHashAlgorithm, ivBuffer, dataBuffer)
		);
	}
	//**********************************************************************************
	/**
	 * Stamping (signing) data using algorithm simular to HMAC
	 * @param {Object} parameters
	 * @return {Promise.<T>|Promise}
	 */
	stampDataWithPassword(parameters)
	{
		//region Check for input parameters
		if((parameters instanceof Object) === false)
			return Promise.reject("Parameters must have type \"Object\"");
		
		if(("password" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"password\"");
		
		if(("hashAlgorithm" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"hashAlgorithm\"");
		
		if(("salt" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"iterationCount\"");
		
		if(("iterationCount" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"iterationCount\"");
		
		if(("contentToStamp" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"contentToStamp\"");
		//endregion
		
		//region Initial variables
		let length;
		//endregion
		
		//region Choose correct length for HMAC key
		switch(parameters.hashAlgorithm.toLowerCase())
		{
			case "sha-1":
				length = 160;
				break;
			case "sha-256":
				length = 256;
				break;
			case "sha-384":
				length = 384;
				break;
			case "sha-512":
				length = 512;
				break;
			default:
				return Promise.reject(`Incorrect \"parameters.hashAlgorithm\" parameter: ${parameters.hashAlgorithm}`);
		}
		//endregion

		return Promise.resolve().then(() =>
			nodeSpecificCrypto.stampDataWithPassword(parameters.hashAlgorithm, length, parameters.password, parameters.salt, parameters.iterationCount, parameters.contentToStamp)
		);
	}
	//**********************************************************************************
	verifyDataStampedWithPassword(parameters)
	{
		//region Check for input parameters
		if((parameters instanceof Object) === false)
			return Promise.reject("Parameters must have type \"Object\"");
		
		if(("password" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"password\"");
		
		if(("hashAlgorithm" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"hashAlgorithm\"");
		
		if(("salt" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"iterationCount\"");
		
		if(("iterationCount" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"salt\"");
		
		if(("contentToVerify" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"contentToVerify\"");
		
		if(("signatureToVerify" in parameters) === false)
			return Promise.reject("Absent mandatory parameter \"signatureToVerify\"");
		//endregion
		
		//region Choose correct length for HMAC key
		let length;
		
		switch(parameters.hashAlgorithm.toLowerCase())
		{
			case "sha-1":
				length = 160;
				break;
			case "sha-256":
				length = 256;
				break;
			case "sha-384":
				length = 384;
				break;
			case "sha-512":
				length = 512;
				break;
			default:
				return Promise.reject(`Incorrect \"parameters.hashAlgorithm\" parameter: ${parameters.hashAlgorithm}`);
		}
		//endregion
		
		return Promise.resolve().then(() =>
			nodeSpecificCrypto.verifyDataStampedWithPassword(parameters.hashAlgorithm, length, parameters.password, parameters.salt, parameters.iterationCount, parameters.contentToVerify, parameters.signatureToVerify)
		);
	}
	//**********************************************************************************
}
//**************************************************************************************
