import * as asn1js from "asn1js";
import { utilConcatBuf } from "pvutils";
import AlgorithmIdentifier from "./AlgorithmIdentifier";
import RSASSAPSSParams from "./RSASSAPSSParams";
import CryptoEngine from "./CryptoEngine";
//**************************************************************************************
//region Crypto engine related function
//**************************************************************************************
let engine = {
	name: "none",
	crypto: null,
	subtle: null
};
//**************************************************************************************
export function setEngine(name, crypto, subtle)
{
	engine = {
		name,
		crypto,
		subtle
	};
}
//**************************************************************************************
export function getEngine()
{
	return engine;
}
//**************************************************************************************
(function initCryptoEngine()
	{
	if(typeof self !== "undefined")
		{
		if("crypto" in self)
			{
			let engineName = "webcrypto";
				
				/**
				 * Standard crypto object
				 * @type {Object}
				 * @property {Object} [webkitSubtle] Subtle object from Apple
				 */
			const cryptoObject = self.crypto;
			let subtleObject = null;
				
				// Apple Safari support
			if("webkitSubtle" in self.crypto)
			{
				try
				{
					subtleObject = self.crypto.webkitSubtle;
				}
				catch(ex)
				{
					subtleObject = self.crypto.subtle;
				}

				engineName = "safari";
			}
				
			if("subtle" in self.crypto)
				subtleObject = self.crypto.subtle;
				
			engine = {
				name: engineName,
				crypto: cryptoObject,
				subtle: new CryptoEngine({ name: engineName, crypto: subtleObject })
			};
		}
	}
})();
//**************************************************************************************
//endregion
//**************************************************************************************
//region Declaration of common functions
//**************************************************************************************
/**
 * Get crypto subtle from current "crypto engine" or "undefined"
 * @returns {({decrypt, deriveKey, digest, encrypt, exportKey, generateKey, importKey, sign, unwrapKey, verify, wrapKey}|null)}
 */
export function getCrypto()
{
	if(engine.subtle !== null)
		return engine.subtle;
	
	return undefined;
}
//**************************************************************************************
/**
 * Initialize input Uint8Array by random values (with help from current "crypto engine")
 * @param {!Uint8Array} view
 * @returns {*}
 */
export function getRandomValues(view)
{
	if(engine.crypto !== null)
		return engine.crypto.getRandomValues(view);
	
	throw new Error("No support for Web Cryptography API");
}
//**************************************************************************************
/**
 * Get OID for each specific WebCrypto algorithm
 * @param {Object} algorithm WebCrypto algorithm
 * @returns {string}
 */
export function getOIDByAlgorithm(algorithm)
{
	let result = "";
	
	switch(algorithm.name.toUpperCase())
	{
		case "RSASSA-PKCS1-V1_5":
			switch(algorithm.hash.name.toUpperCase())
			{
				case "SHA-1":
					result = "1.2.840.113549.1.1.5";
					break;
				case "SHA-256":
					result = "1.2.840.113549.1.1.11";
					break;
				case "SHA-384":
					result = "1.2.840.113549.1.1.12";
					break;
				case "SHA-512":
					result = "1.2.840.113549.1.1.13";
					break;
				default:
			}
			break;
		case "RSA-PSS":
			result = "1.2.840.113549.1.1.10";
			break;
		case "RSA-OAEP":
			result = "1.2.840.113549.1.1.7";
			break;
		case "ECDSA":
			switch(algorithm.hash.name.toUpperCase())
			{
				case "SHA-1":
					result = "1.2.840.10045.4.1";
					break;
				case "SHA-256":
					result = "1.2.840.10045.4.3.2";
					break;
				case "SHA-384":
					result = "1.2.840.10045.4.3.3";
					break;
				case "SHA-512":
					result = "1.2.840.10045.4.3.4";
					break;
				default:
			}
			break;
		case "ECDH":
			switch(algorithm.kdf.toUpperCase()) // Non-standard addition - hash algorithm of KDF function
			{
				case "SHA-1":
					result = "1.3.133.16.840.63.0.2"; // dhSinglePass-stdDH-sha1kdf-scheme
					break;
				case "SHA-256":
					result = "1.3.132.1.11.1"; // dhSinglePass-stdDH-sha256kdf-scheme
					break;
				case "SHA-384":
					result = "1.3.132.1.11.2"; // dhSinglePass-stdDH-sha384kdf-scheme
					break;
				case "SHA-512":
					result = "1.3.132.1.11.3"; // dhSinglePass-stdDH-sha512kdf-scheme
					break;
				default:
			}
			break;
		case "AES-CTR":
			break;
		case "AES-CBC":
			switch(algorithm.length)
			{
				case 128:
					result = "2.16.840.1.101.3.4.1.2";
					break;
				case 192:
					result = "2.16.840.1.101.3.4.1.22";
					break;
				case 256:
					result = "2.16.840.1.101.3.4.1.42";
					break;
				default:
			}
			break;
		case "AES-CMAC":
			break;
		case "AES-GCM":
			switch(algorithm.length)
			{
				case 128:
					result = "2.16.840.1.101.3.4.1.6";
					break;
				case 192:
					result = "2.16.840.1.101.3.4.1.26";
					break;
				case 256:
					result = "2.16.840.1.101.3.4.1.46";
					break;
				default:
			}
			break;
		case "AES-CFB":
			switch(algorithm.length)
			{
				case 128:
					result = "2.16.840.1.101.3.4.1.4";
					break;
				case 192:
					result = "2.16.840.1.101.3.4.1.24";
					break;
				case 256:
					result = "2.16.840.1.101.3.4.1.44";
					break;
				default:
			}
			break;
		case "AES-KW":
			switch(algorithm.length)
			{
				case 128:
					result = "2.16.840.1.101.3.4.1.5";
					break;
				case 192:
					result = "2.16.840.1.101.3.4.1.25";
					break;
				case 256:
					result = "2.16.840.1.101.3.4.1.45";
					break;
				default:
			}
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
		case "DH":
			result = "1.2.840.113549.1.9.16.3.5";
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
		case "CONCAT":
			break;
		case "HKDF":
			break;
		case "PBKDF2":
			result = "1.2.840.113549.1.5.12";
			break;
		//region Special case - OIDs for ECC curves
		case "P-256":
			result = "1.2.840.10045.3.1.7";
			break;
		case "P-384":
			result = "1.3.132.0.34";
			break;
		case "P-521":
			result = "1.3.132.0.35";
			break;
		//endregion
		default:
	}
	
	return result;
}
//**************************************************************************************
/**
 * Get default algorithm parameters for each kind of operation
 * @param {string} algorithmName Algorithm name to get common parameters for
 * @param {string} operation Kind of operation: "sign", "encrypt", "generatekey", "importkey", "exportkey", "verify"
 * @returns {*}
 */
export function getAlgorithmParameters(algorithmName, operation)
{
	let result = {
		algorithm: {},
		usages: []
	};
	
	switch(algorithmName.toUpperCase())
	{
		case "RSASSA-PKCS1-V1_5":
			switch(operation.toLowerCase())
			{
				case "generatekey":
					result = {
						algorithm: {
							name: "RSASSA-PKCS1-v1_5",
							modulusLength: 2048,
							publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
							hash: {
								name: "SHA-256"
							}
						},
						usages: ["sign", "verify"]
					};
					break;
				case "verify":
				case "sign":
				case "importkey":
					result = {
						algorithm: {
							name: "RSASSA-PKCS1-v1_5",
							hash: {
								name: "SHA-256"
							}
						},
						usages: ["verify"] // For importKey("pkcs8") usage must be "sign" only
					};
					break;
				case "exportkey":
				default:
					return {
						algorithm: {
							name: "RSASSA-PKCS1-v1_5"
						},
						usages: []
					};
			}
			break;
		case "RSA-PSS":
			switch(operation.toLowerCase())
			{
				case "sign":
				case "verify":
					result = {
						algorithm: {
							name: "RSA-PSS",
							hash: {
								name: "SHA-1"
							},
							saltLength: 20
						},
						usages: ["sign", "verify"]
					};
					break;
				case "generatekey":
					result = {
						algorithm: {
							name: "RSA-PSS",
							modulusLength: 2048,
							publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
							hash: {
								name: "SHA-1"
							}
						},
						usages: ["sign", "verify"]
					};
					break;
				case "importkey":
					result = {
						algorithm: {
							name: "RSA-PSS",
							hash: {
								name: "SHA-1"
							}
						},
						usages: ["verify"] // For importKey("pkcs8") usage must be "sign" only
					};
					break;
				case "exportkey":
				default:
					return {
						algorithm: {
							name: "RSA-PSS"
						},
						usages: []
					};
			}
			break;
		case "RSA-OAEP":
			switch(operation.toLowerCase())
			{
				case "encrypt":
				case "decrypt":
					result = {
						algorithm: {
							name: "RSA-OAEP"
						},
						usages: ["encrypt", "decrypt"]
					};
					break;
				case "generatekey":
					result = {
						algorithm: {
							name: "RSA-OAEP",
							modulusLength: 2048,
							publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
							hash: {
								name: "SHA-256"
							}
						},
						usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
					};
					break;
				case "importkey":
					result = {
						algorithm: {
							name: "RSA-OAEP",
							hash: {
								name: "SHA-256"
							}
						},
						usages: ["encrypt"] // encrypt for "spki" and decrypt for "pkcs8"
					};
					break;
				case "exportkey":
				default:
					return {
						algorithm: {
							name: "RSA-OAEP"
						},
						usages: []
					};
			}
			break;
		case "ECDSA":
			switch(operation.toLowerCase())
			{
				case "generatekey":
					result = {
						algorithm: {
							name: "ECDSA",
							namedCurve: "P-256"
						},
						usages: ["sign", "verify"]
					};
					break;
				case "importkey":
					result = {
						algorithm: {
							name: "ECDSA",
							namedCurve: "P-256"
						},
						usages: ["verify"] // "sign" for "pkcs8"
					};
					break;
				case "verify":
				case "sign":
					result = {
						algorithm: {
							name: "ECDSA",
							hash: {
								name: "SHA-256"
							}
						},
						usages: ["sign"]
					};
					break;
				default:
					return {
						algorithm: {
							name: "ECDSA"
						},
						usages: []
					};
			}
			break;
		case "ECDH":
			switch(operation.toLowerCase())
			{
				case "exportkey":
				case "importkey":
				case "generatekey":
					result = {
						algorithm: {
							name: "ECDH",
							namedCurve: "P-256"
						},
						usages: ["deriveKey", "deriveBits"]
					};
					break;
				case "derivekey":
				case "derivebits":
					result = {
						algorithm: {
							name: "ECDH",
							namedCurve: "P-256",
							public: [] // Must be a "publicKey"
						},
						usages: ["encrypt", "decrypt"]
					};
					break;
				default:
					return {
						algorithm: {
							name: "ECDH"
						},
						usages: []
					};
			}
			break;
		case "AES-CTR":
			switch(operation.toLowerCase())
			{
				case "importkey":
				case "exportkey":
				case "generatekey":
					result = {
						algorithm: {
							name: "AES-CTR",
							length: 256
						},
						usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
					};
					break;
				case "decrypt":
				case "encrypt":
					result = {
						algorithm: {
							name: "AES-CTR",
							counter: new Uint8Array(16),
							length: 10
						},
						usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
					};
					break;
				default:
					return {
						algorithm: {
							name: "AES-CTR"
						},
						usages: []
					};
			}
			break;
		case "AES-CBC":
			switch(operation.toLowerCase())
			{
				case "importkey":
				case "exportkey":
				case "generatekey":
					result = {
						algorithm: {
							name: "AES-CBC",
							length: 256
						},
						usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
					};
					break;
				case "decrypt":
				case "encrypt":
					result = {
						algorithm: {
							name: "AES-CBC",
							iv: getRandomValues(new Uint8Array(16)) // For "decrypt" the value should be replaced with value got on "encrypt" step
						},
						usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
					};
					break;
				default:
					return {
						algorithm: {
							name: "AES-CBC"
						},
						usages: []
					};
			}
			break;
		case "AES-GCM":
			switch(operation.toLowerCase())
			{
				case "importkey":
				case "exportkey":
				case "generatekey":
					result = {
						algorithm: {
							name: "AES-GCM",
							length: 256
						},
						usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
					};
					break;
				case "decrypt":
				case "encrypt":
					result = {
						algorithm: {
							name: "AES-GCM",
							iv: getRandomValues(new Uint8Array(16)) // For "decrypt" the value should be replaced with value got on "encrypt" step
						},
						usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
					};
					break;
				default:
					return {
						algorithm: {
							name: "AES-GCM"
						},
						usages: []
					};
			}
			break;
		case "AES-KW":
			switch(operation.toLowerCase())
			{
				case "importkey":
				case "exportkey":
				case "generatekey":
				case "wrapkey":
				case "unwrapkey":
					result = {
						algorithm: {
							name: "AES-KW",
							length: 256
						},
						usages: ["wrapKey", "unwrapKey"]
					};
					break;
				default:
					return {
						algorithm: {
							name: "AES-KW"
						},
						usages: []
					};
			}
			break;
		case "HMAC":
			switch(operation.toLowerCase())
			{
				case "sign":
				case "verify":
					result = {
						algorithm: {
							name: "HMAC"
						},
						usages: ["sign", "verify"]
					};
					break;
				case "importkey":
				case "exportkey":
				case "generatekey":
					result = {
						algorithm: {
							name: "HMAC",
							length: 32,
							hash: {
								name: "SHA-256"
							}
						},
						usages: ["sign", "verify"]
					};
					break;
				default:
					return {
						algorithm: {
							name: "HMAC"
						},
						usages: []
					};
			}
			break;
		case "HKDF":
			switch(operation.toLowerCase())
			{
				case "derivekey":
					result = {
						algorithm: {
							name: "HKDF",
							hash: "SHA-256",
							salt: new Uint8Array([]),
							info: new Uint8Array([])
						},
						usages: ["encrypt", "decrypt"]
					};
					break;
				default:
					return {
						algorithm: {
							name: "HKDF"
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
							iterations: 1000
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
//**************************************************************************************
/**
 * Create CMS ECDSA signature from WebCrypto ECDSA signature
 * @param {ArrayBuffer} signatureBuffer WebCrypto result of "sign" function
 * @returns {ArrayBuffer}
 */
export function createCMSECDSASignature(signatureBuffer)
{
	// #region Initial check for correct length
	if((signatureBuffer.byteLength % 2) !== 0)
		return new ArrayBuffer(0);
	// #endregion
	
	// #region Initial variables
	const length = signatureBuffer.byteLength / 2; // There are two equal parts inside incoming ArrayBuffer
	
	const rBuffer = new ArrayBuffer(length);
	const rView = new Uint8Array(rBuffer);
	rView.set(new Uint8Array(signatureBuffer, 0, length));
	
	const rInteger = new asn1js.Integer({ valueHex: rBuffer });
	
	const sBuffer = new ArrayBuffer(length);
	const sView = new Uint8Array(sBuffer);
	sView.set(new Uint8Array(signatureBuffer, length, length));
	
	const sInteger = new asn1js.Integer({ valueHex: sBuffer });
	// #endregion
	
	return (new asn1js.Sequence({
		value: [
			rInteger.convertToDER(),
			sInteger.convertToDER()
		]
	})).toBER(false);
}
//**************************************************************************************
/**
 * String preparation function. In a future here will be realization of algorithm from RFC4518
 * @param {string} inputString JavaScript string. As soon as for each ASN.1 string type we have a specific transformation function here we will work with pure JavaScript string
 * @returns {string} Formated string
 */
export function stringPrep(inputString)
{
	let result = inputString.replace(/^\s+|\s+$/g, ""); // Trim input string
	result = result.replace(/\s+/g, " "); // Change all sequence of SPACE down to SPACE char
	result = result.toLowerCase();
	
	return result;
}
//**************************************************************************************
/**
 * Create a single ArrayBuffer from CMS ECDSA signature
 * @param {Sequence} cmsSignature ASN.1 SEQUENCE contains CMS ECDSA signature
 * @returns {ArrayBuffer}
 */
export function createECDSASignatureFromCMS(cmsSignature)
{
	// #region Check input variables
	if((cmsSignature instanceof asn1js.Sequence) === false)
		return new ArrayBuffer(0);
	
	if(cmsSignature.valueBlock.value.length !== 2)
		return new ArrayBuffer(0);
	
	if((cmsSignature.valueBlock.value[0] instanceof asn1js.Integer) === false)
		return new ArrayBuffer(0);
	
	if((cmsSignature.valueBlock.value[1] instanceof asn1js.Integer) === false)
		return new ArrayBuffer(0);
	// #endregion 
	
	const rValue = cmsSignature.valueBlock.value[0].convertFromDER();
	const sValue = cmsSignature.valueBlock.value[1].convertFromDER();
	
	return utilConcatBuf(rValue.valueBlock.valueHex, sValue.valueBlock.valueHex);
}
//**************************************************************************************
/**
 * Get WebCrypto algorithm by wel-known OID
 * @param {string} oid Wel-known OID to search for
 * @returns {Object}
 */
export function getAlgorithmByOID(oid)
{
	switch(oid)
	{
		case "1.2.840.113549.1.1.1":
		case "1.2.840.113549.1.1.5":
			return {
				name: "RSASSA-PKCS1-v1_5",
				hash: {
					name: "SHA-1"
				}
			};
		case "1.2.840.113549.1.1.11":
			return {
				name: "RSASSA-PKCS1-v1_5",
				hash: {
					name: "SHA-256"
				}
			};
		case "1.2.840.113549.1.1.12":
			return {
				name: "RSASSA-PKCS1-v1_5",
				hash: {
					name: "SHA-384"
				}
			};
		case "1.2.840.113549.1.1.13":
			return {
				name: "RSASSA-PKCS1-v1_5",
				hash: {
					name: "SHA-512"
				}
			};
		case "1.2.840.113549.1.1.10":
			return {
				name: "RSA-PSS"
			};
		case "1.2.840.113549.1.1.7":
			return {
				name: "RSA-OAEP"
			};
		case "1.2.840.10045.2.1":
		case "1.2.840.10045.4.1":
			return {
				name: "ECDSA",
				hash: {
					name: "SHA-1"
				}
			};
		case "1.2.840.10045.4.3.2":
			return {
				name: "ECDSA",
				hash: {
					name: "SHA-256"
				}
			};
		case "1.2.840.10045.4.3.3":
			return {
				name: "ECDSA",
				hash: {
					name: "SHA-384"
				}
			};
		case "1.2.840.10045.4.3.4":
			return {
				name: "ECDSA",
				hash: {
					name: "SHA-512"
				}
			};
		case "1.3.133.16.840.63.0.2":
			return {
				name: "ECDH",
				kdf: "SHA-1"
			};
		case "1.3.132.1.11.1":
			return {
				name: "ECDH",
				kdf: "SHA-256"
			};
		case "1.3.132.1.11.2":
			return {
				name: "ECDH",
				kdf: "SHA-384"
			};
		case "1.3.132.1.11.3":
			return {
				name: "ECDH",
				kdf: "SHA-512"
			};
		case "2.16.840.1.101.3.4.1.2":
			return {
				name: "AES-CBC",
				length: 128
			};
		case "2.16.840.1.101.3.4.1.22":
			return {
				name: "AES-CBC",
				length: 192
			};
		case "2.16.840.1.101.3.4.1.42":
			return {
				name: "AES-CBC",
				length: 256
			};
		case "2.16.840.1.101.3.4.1.6":
			return {
				name: "AES-GCM",
				length: 128
			};
		case "2.16.840.1.101.3.4.1.26":
			return {
				name: "AES-GCM",
				length: 192
			};
		case "2.16.840.1.101.3.4.1.46":
			return {
				name: "AES-GCM",
				length: 256
			};
		case "2.16.840.1.101.3.4.1.4":
			return {
				name: "AES-CFB",
				length: 128
			};
		case "2.16.840.1.101.3.4.1.24":
			return {
				name: "AES-CFB",
				length: 192
			};
		case "2.16.840.1.101.3.4.1.44":
			return {
				name: "AES-CFB",
				length: 256
			};
		case "2.16.840.1.101.3.4.1.5":
			return {
				name: "AES-KW",
				length: 128
			};
		case "2.16.840.1.101.3.4.1.25":
			return {
				name: "AES-KW",
				length: 192
			};
		case "2.16.840.1.101.3.4.1.45":
			return {
				name: "AES-KW",
				length: 256
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
		case "1.2.840.113549.1.9.16.3.5":
			return {
				name: "DH"
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
		case "1.2.840.113549.1.5.12":
			return {
				name: "PBKDF2"
			};
		//region Special case - OIDs for ECC curves
		case "1.2.840.10045.3.1.7":
			return {
				name: "P-256"
			};
		case "1.3.132.0.34":
			return {
				name: "P-384"
			};
		case "1.3.132.0.35":
			return {
				name: "P-521"
			};
		//endregion
		default:
	}
	
	return {};
}
//**************************************************************************************
/**
 * Getting hash algorithm by signature algorithm
 * @param {AlgorithmIdentifier} signatureAlgorithm Signature algorithm
 * @returns {string}
 */
export function getHashAlgorithm(signatureAlgorithm)
{
	let result = "";
	
	switch(signatureAlgorithm.algorithmId)
	{
		case "1.2.840.10045.4.1": // ecdsa-with-SHA1
		case "1.2.840.113549.1.1.5":
			result = "SHA-1";
			break;
		case "1.2.840.10045.4.3.2": // ecdsa-with-SHA256
		case "1.2.840.113549.1.1.11":
			result = "SHA-256";
			break;
		case "1.2.840.10045.4.3.3": // ecdsa-with-SHA384
		case "1.2.840.113549.1.1.12":
			result = "SHA-384";
			break;
		case "1.2.840.10045.4.3.4": // ecdsa-with-SHA512
		case "1.2.840.113549.1.1.13":
			result = "SHA-512";
			break;
		case "1.2.840.113549.1.1.10": // RSA-PSS
			{
				try
			{
				const params = new RSASSAPSSParams({ schema: signatureAlgorithm.algorithmParams });
				if("hashAlgorithm" in params)
				{
					const algorithm = getAlgorithmByOID(params.hashAlgorithm.algorithmId);
					if(("name" in algorithm) === false)
						return "";
					
					result = algorithm.name;
				}
				else
					result = "SHA-1";
			}
			catch(ex)
			{
			}
			}
			break;
		default:
	}
	
	return result;
}
//**************************************************************************************
/**
 * ANS X9.63 Key Derivation Function having a "Counter" as a parameter
 * @param {string} hashFunction Used hash function
 * @param {ArrayBuffer} Zbuffer ArrayBuffer containing ECDH shared secret to derive from
 * @param {number} Counter
 * @param {ArrayBuffer} SharedInfo Usually DER encoded "ECC_CMS_SharedInfo" structure
 */
export function kdfWithCounter(hashFunction, Zbuffer, Counter, SharedInfo)
{
	//region Check of input parameters
	switch(hashFunction.toUpperCase())
	{
		case "SHA-1":
		case "SHA-256":
		case "SHA-384":
		case "SHA-512":
			break;
		default:
			return Promise.reject(`Unknown hash function: ${hashFunction}`);
	}
	
	if((Zbuffer instanceof ArrayBuffer) === false)
		return Promise.reject("Please set \"Zbuffer\" as \"ArrayBuffer\"");
	
	if(Zbuffer.byteLength === 0)
		return Promise.reject("\"Zbuffer\" has zero length, error");
	
	if((SharedInfo instanceof ArrayBuffer) === false)
		return Promise.reject("Please set \"SharedInfo\" as \"ArrayBuffer\"");
	
	if(Counter > 255)
		return Promise.reject("Please set \"Counter\" variable to value less or equal to 255");
	//endregion
	
	//region Initial variables
	const counterBuffer = new ArrayBuffer(4);
	const counterView = new Uint8Array(counterBuffer);
	counterView[0] = 0x00;
	counterView[1] = 0x00;
	counterView[2] = 0x00;
	counterView[3] = Counter;
	
	let combinedBuffer = new ArrayBuffer(0);
	//endregion
	
	//region Get a "crypto" extension
	const crypto = getCrypto();
	if(typeof crypto === "undefined")
		return Promise.reject("Unable to create WebCrypto object");
	//endregion
	
	//region Create a combined ArrayBuffer for digesting
	combinedBuffer = utilConcatBuf(combinedBuffer, Zbuffer);
	combinedBuffer = utilConcatBuf(combinedBuffer, counterBuffer);
	combinedBuffer = utilConcatBuf(combinedBuffer, SharedInfo);
	//endregion
	
	//region Return digest of combined ArrayBuffer and information about current counter
	return crypto.digest({
		name: hashFunction
	},
		combinedBuffer).then(result =>
	{
			return {
				counter: Counter,
				result
			};
		});
	//endregion
}
//**************************************************************************************
/**
 * ANS X9.63 Key Derivation Function
 * @param {string} hashFunction Used hash function
 * @param {ArrayBuffer} Zbuffer ArrayBuffer containing ECDH shared secret to derive from
 * @param {number} keydatalen Length (!!! in BITS !!!) of used kew derivation function
 * @param {ArrayBuffer} SharedInfo Usually DER encoded "ECC_CMS_SharedInfo" structure
 */
export function kdf(hashFunction, Zbuffer, keydatalen, SharedInfo)
{
	//region Initial variables
	let hashLength = 0;
	let maxCounter = 1;
	
	const kdfArray = [];
	//endregion
	
	//region Check of input parameters
	switch(hashFunction.toUpperCase())
	{
		case "SHA-1":
			hashLength = 160; // In bits
			break;
		case "SHA-256":
			hashLength = 256; // In bits
			break;
		case "SHA-384":
			hashLength = 384; // In bits
			break;
		case "SHA-512":
			hashLength = 512; // In bits
			break;
		default:
			return Promise.reject(`Unknown hash function: ${hashFunction}`);
	}
	
	if((Zbuffer instanceof ArrayBuffer) === false)
		return Promise.reject("Please set \"Zbuffer\" as \"ArrayBuffer\"");
	
	if(Zbuffer.byteLength === 0)
		return Promise.reject("\"Zbuffer\" has zero length, error");
	
	if((SharedInfo instanceof ArrayBuffer) === false)
		return Promise.reject("Please set \"SharedInfo\" as \"ArrayBuffer\"");
	//endregion
	
	//region Calculated maximum value of "Counter" variable
	const quotient = keydatalen / hashLength;
	
	if(Math.floor(quotient) > 0)
	{
		maxCounter = Math.floor(quotient);
		
		if((quotient - maxCounter) > 0)
			maxCounter++;
	}
	//endregion
	
	//region Create an array of "kdfWithCounter"
	for(let i = 1; i <= maxCounter; i++)
		kdfArray.push(kdfWithCounter(hashFunction, Zbuffer, i, SharedInfo));
	//endregion
	
	//region Return combined digest with specified length
	return Promise.all(kdfArray).then(incomingResult =>
	{
		//region Initial variables
		let combinedBuffer = new ArrayBuffer(0);
		let currentCounter = 1;
		let found = true;
		//endregion
		
		//region Combine all buffer together
		while(found)
		{
			found = false;
			
			for(const result of incomingResult)
			{
				if(result.counter === currentCounter)
				{
					combinedBuffer = utilConcatBuf(combinedBuffer, result.result);
					found = true;
					break;
				}
			}
			
			currentCounter++;
		}
		//endregion
		
		//region Create output buffer with specified length
		keydatalen >>= 3; // Divide by 8 since "keydatalen" is in bits
		
		if(combinedBuffer.byteLength > keydatalen)
		{
			const newBuffer = new ArrayBuffer(keydatalen);
			const newView = new Uint8Array(newBuffer);
			const combinedView = new Uint8Array(combinedBuffer);
			
			for(let i = 0; i < keydatalen; i++)
				newView[i] = combinedView[i];
			
			return newBuffer;
		}
		
		return combinedBuffer; // Since the situation when "combinedBuffer.byteLength < keydatalen" here we have only "combinedBuffer.byteLength === keydatalen"
		//endregion
	});
	//endregion
}
//**************************************************************************************
//endregion
//**************************************************************************************
