import * as asn1js from "asn1js";
import { getParametersValue, stringToArrayBuffer, arrayBufferToString } from "pvutils";
import PublicKeyInfo from "./PublicKeyInfo";
import PrivateKeyInfo from "./PrivateKeyInfo";
//**************************************************************************************
export default class CryptoEngine
{
	//**********************************************************************************
	/**
	 * Constructor for CryptoEngine class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {string}
		 * @description Usually here we are expecting "window.crypto.subtle" or an equivalent from custom "crypto engine"
		 */
		this.crypto = getParametersValue(parameters, "crypto", {});
		
		/**
		 * @type {string}
		 * @description Name of the "crypto engine"
		 */
		this.name = getParametersValue(parameters, "name", "");
		//endregion
	}
	//**********************************************************************************
	/**
	 * Import WebCrypto keys from different formats
	 * @param {string} format
	 * @param {ArrayBuffer|Object} keyData
	 * @param {Object} algorithm
	 * @param {boolean} extractable
	 * @param {Array} keyUsages
	 * @returns {Promise}
	 */
	importKey(format, keyData, algorithm, extractable, keyUsages)
	{
		//region Initial variables
		let jwk = {};
		//endregion
		
		//region Change "keyData" type if needed
		if(keyData instanceof Uint8Array)
			keyData = keyData.buffer;
		//endregion
		
		switch(format.toLowerCase())
		{
			case "raw":
				return this.crypto.importKey("raw", keyData, algorithm, extractable, keyUsages);
			case "spki":
				{
					const asn1 = asn1js.fromBER(keyData);
					if(asn1.offset === (-1))
						return Promise.reject("Incorrect keyData");

					const publicKeyInfo = new PublicKeyInfo();
					try
					{
						publicKeyInfo.fromSchema(asn1.result);
					}
					catch(ex)
					{
						return Promise.reject("Incorrect keyData");
					}


					switch(algorithm.name.toUpperCase())
					{
						case "RSA-PSS":
							{
								//region Get information about used hash function
								switch(algorithm.hash.name.toUpperCase())
								{
									case "SHA-1":
										jwk.alg = "PS1";
										break;
									case "SHA-256":
										jwk.alg = "PS256";
										break;
									case "SHA-384":
										jwk.alg = "PS384";
										break;
									case "SHA-512":
										jwk.alg = "PS512";
										break;
									default:
										return Promise.reject(`Incorrect hash algorithm: ${algorithm.hash.name.toUpperCase()}`);
								}
								//endregion
							}
						case "RSASSA-PKCS1-V1_5":
							{
								keyUsages = ["verify"]; // Override existing keyUsages value since the key is a public key

								jwk.kty = "RSA";
								jwk.ext = extractable;
								jwk.key_ops = keyUsages;

								if(publicKeyInfo.algorithm.algorithmId !== "1.2.840.113549.1.1.1")
									return Promise.reject(`Incorrect public key algorithm: ${publicKeyInfo.algorithm.algorithmId}`);

								//region Get information about used hash function
								if(("alg" in jwk) === false)
								{
									switch(algorithm.hash.name.toUpperCase())
									{
										case "SHA-1":
											jwk.alg = "RS1";
											break;
										case "SHA-256":
											jwk.alg = "RS256";
											break;
										case "SHA-384":
											jwk.alg = "RS384";
											break;
										case "SHA-512":
											jwk.alg = "RS512";
											break;
										default:
											return Promise.reject(`Incorrect public key algorithm: ${publicKeyInfo.algorithm.algorithmId}`);
									}
								}
								//endregion

								//region Create RSA Public Key elements
								const publicKeyJSON = publicKeyInfo.toJSON();

								for(const key of Object.keys(publicKeyJSON))
									jwk[key] = publicKeyJSON[key];
								//endregion
							}
							break;
						case "ECDSA":
							keyUsages = ["verify"]; // Override existing keyUsages value since the key is a public key
						case "ECDH":
							{
								//region Initial variables
								jwk = {
									kty: "EC",
									ext: extractable,
									key_ops: keyUsages
								};
								//endregion

								//region Get information about algorithm
								if(publicKeyInfo.algorithm.algorithmId !== "1.2.840.10045.2.1")
									return Promise.reject(`Incorrect public key algorithm: ${publicKeyInfo.algorithm.algorithmId}`);
								//endregion

								//region Create ECDSA Public Key elements
								const publicKeyJSON = publicKeyInfo.toJSON();

								for(const key of Object.keys(publicKeyJSON))
									jwk[key] = publicKeyJSON[key];
								//endregion
							}
							break;
						case "RSA-OAEP":
							{
								jwk.kty = "RSA";
								jwk.ext = extractable;
								jwk.key_ops = keyUsages;
								
								if(this.name.toLowerCase() === "safari")
									jwk.alg = "RSA-OAEP";
								else
								{
									switch(algorithm.hash.name.toUpperCase())
									{
										case "SHA-1":
											jwk.alg = "RSA-OAEP-1";
											break;
										case "SHA-256":
											jwk.alg = "RSA-OAEP-256";
											break;
										case "SHA-384":
											jwk.alg = "RSA-OAEP-384";
											break;
										case "SHA-512":
											jwk.alg = "RSA-OAEP-512";
											break;
										default:
											return Promise.reject(`Incorrect public key algorithm: ${publicKeyInfo.algorithm.algorithmId}`);
									}
								}
								
								//region Create ECDSA Public Key elements
								const publicKeyJSON = publicKeyInfo.toJSON();
								
								for(const key of Object.keys(publicKeyJSON))
									jwk[key] = publicKeyJSON[key];
								//endregion
							}
							break;
						default:
							return Promise.reject(`Incorrect algorithm name: ${algorithm.name.toUpperCase()}`);
					}
				}
				break;
			case "pkcs8":
				{
					const privateKeyInfo = new PrivateKeyInfo();

					//region Parse "PrivateKeyInfo" object
					const asn1 = asn1js.fromBER(keyData);
					if(asn1.offset === (-1))
						return Promise.reject("Incorrect keyData");

					try
					{
						privateKeyInfo.fromSchema(asn1.result);
					}
					catch(ex)
					{
						return Promise.reject("Incorrect keyData");
					}
					//endregion

					switch(algorithm.name.toUpperCase())
					{
						case "RSA-PSS":
							{
								//region Get information about used hash function
								switch(algorithm.hash.name.toUpperCase())
								{
									case "SHA-1":
										jwk.alg = "PS1";
										break;
									case "SHA-256":
										jwk.alg = "PS256";
										break;
									case "SHA-384":
										jwk.alg = "PS384";
										break;
									case "SHA-512":
										jwk.alg = "PS512";
										break;
									default:
										return Promise.reject(`Incorrect hash algorithm: ${algorithm.hash.name.toUpperCase()}`);
								}
								//endregion
							}
						case "RSASSA-PKCS1-V1_5":
							{
								keyUsages = ["sign"]; // Override existing keyUsages value since the key is a private key

								jwk.kty = "RSA";
								jwk.ext = extractable;
								jwk.key_ops = keyUsages;

								//region Get information about used hash function
								if(privateKeyInfo.privateKeyAlgorithm.algorithmId !== "1.2.840.113549.1.1.1")
									return Promise.reject(`Incorrect private key algorithm: ${privateKeyInfo.privateKeyAlgorithm.algorithmId}`);
								//endregion

								//region Get information about used hash function
								if(("alg" in jwk) === false)
								{
									switch(algorithm.hash.name.toUpperCase())
									{
										case "SHA-1":
											jwk.alg = "RS1";
											break;
										case "SHA-256":
											jwk.alg = "RS256";
											break;
										case "SHA-384":
											jwk.alg = "RS384";
											break;
										case "SHA-512":
											jwk.alg = "RS512";
											break;
										default:
											return Promise.reject(`Incorrect hash algorithm: ${algorithm.hash.name.toUpperCase()}`);
									}
								}
								//endregion

								//region Create RSA Private Key elements
								const privateKeyJSON = privateKeyInfo.toJSON();

								for(const key of Object.keys(privateKeyJSON))
									jwk[key] = privateKeyJSON[key];
								//endregion
							}
							break;
						case "ECDSA":
							keyUsages = ["sign"]; // Override existing keyUsages value since the key is a private key
						case "ECDH":
							{
								//region Initial variables
								jwk = {
									kty: "EC",
									ext: extractable,
									key_ops: keyUsages
								};
								//endregion

								//region Get information about used hash function
								if(privateKeyInfo.privateKeyAlgorithm.algorithmId !== "1.2.840.10045.2.1")
									return Promise.reject(`Incorrect algorithm: ${privateKeyInfo.privateKeyAlgorithm.algorithmId}`);
								//endregion

								//region Create ECDSA Private Key elements
								const privateKeyJSON = privateKeyInfo.toJSON();

								for(const key of Object.keys(privateKeyJSON))
									jwk[key] = privateKeyJSON[key];
								//endregion
							}
							break;
						case "RSA-OAEP":
							{
								jwk.kty = "RSA";
								jwk.ext = extractable;
								jwk.key_ops = keyUsages;
								
								//region Get information about used hash function
								if(this.name.toLowerCase() === "safari")
									jwk.alg = "RSA-OAEP";
								else
								{
									switch(algorithm.hash.name.toUpperCase())
									{
										case "SHA-1":
											jwk.alg = "RSA-OAEP-1";
											break;
										case "SHA-256":
											jwk.alg = "RSA-OAEP-256";
											break;
										case "SHA-384":
											jwk.alg = "RSA-OAEP-384";
											break;
										case "SHA-512":
											jwk.alg = "RSA-OAEP-512";
											break;
										default:
											return Promise.reject(`Incorrect hash algorithm: ${algorithm.hash.name.toUpperCase()}`);
									}
								}
								//endregion
								
								//region Create RSA Private Key elements
								const privateKeyJSON = privateKeyInfo.toJSON();
								
								for(const key of Object.keys(privateKeyJSON))
									jwk[key] = privateKeyJSON[key];
								//endregion
							}
							break;
						default:
							return Promise.reject(`Incorrect algorithm name: ${algorithm.name.toUpperCase()}`);
					}
				}
				break;
			case "jwk":
				jwk = keyData;
				break;
			default:
				return Promise.reject(`Incorrect format: ${format}`);
		}
		
		//region Special case for Safari browser (since its acting not as WebCrypto standard describes)
		if(this.name.toLowerCase() === "safari")
		{
			if((jwk instanceof ArrayBuffer) === false)
				jwk = stringToArrayBuffer(JSON.stringify(jwk));
		}
		//endregion
		
		return this.crypto.importKey("jwk", jwk, algorithm, extractable, keyUsages);
	}
	//**********************************************************************************
	/**
	 * Export WebCrypto keys to different formats
	 * @param {string} format
	 * @param {Object} key
	 * @returns {Promise}
	 */
	exportKey(format, key)
	{
		let sequence = this.crypto.exportKey("jwk", key);
		
		//region Currently Safari returns ArrayBuffer as JWK thus we need an additional transformation
		if(this.name.toLowerCase() === "safari")
			sequence = sequence.then(result => JSON.parse(arrayBufferToString(result)));
		//endregion
		
		switch(format.toLowerCase())
		{
			case "raw":
				return this.crypto.exportKey("raw", key);
			case "spki":
				sequence = sequence.then(result =>
				{
					const publicKeyInfo = new PublicKeyInfo();

					try
					{
						publicKeyInfo.fromJSON(result);
					}
					catch(ex)
					{
						return Promise.reject("Incorrect key data");
					}

					return publicKeyInfo.toSchema().toBER(false);
				});
				break;
			case "pkcs8":
				sequence = sequence.then(result =>
				{
					const privateKeyInfo = new PrivateKeyInfo();

					try
					{
						privateKeyInfo.fromJSON(result);
					}
					catch(ex)
					{
						return Promise.reject("Incorrect key data");
					}

					return privateKeyInfo.toSchema().toBER(false);
				});
				break;
			case "jwk":
				break;
			default:
				return Promise.reject(`Incorrect format: ${format}`);
		}

		return sequence;
	}
	//**********************************************************************************
	/**
	 * Convert WebCrypto keys between different export formats
	 * @param {string} inputFormat
	 * @param {string} outputFormat
	 * @param {ArrayBuffer|Object} keyData
	 * @param {Object} algorithm
	 * @param {boolean} extractable
	 * @param {Array} keyUsages
	 * @returns {Promise}
	 */
	convert(inputFormat, outputFormat, keyData, algorithm, extractable, keyUsages)
	{
		switch(inputFormat.toLowerCase())
		{
			case "raw":
				switch(outputFormat.toLowerCase())
				{
					case "raw":
						return Promise.resolve(keyData);
					case "spki":
						return Promise.resolve()
							.then(() => this.importKey("raw", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("spki", result));
					case "pkcs8":
						return Promise.resolve()
							.then(() => this.importKey("raw", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("pkcs8", result));
					case "jwk":
						return Promise.resolve()
							.then(() => this.importKey("raw", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("jwk", result));
					default:
						return Promise.reject(`Incorrect outputFormat: ${outputFormat}`);
				}
			case "spki":
				switch(outputFormat.toLowerCase())
				{
					case "raw":
						return Promise.resolve()
							.then(() => this.importKey("spki", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("raw", result));
					case "spki":
						return Promise.resolve(keyData);
					case "pkcs8":
						return Promise.reject("Impossible to convert between SPKI/PKCS8");
					case "jwk":
						return Promise.resolve()
							.then(() => this.importKey("spki", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("jwk", result));
					default:
						return Promise.reject(`Incorrect outputFormat: ${outputFormat}`);
				}
			case "pkcs8":
				switch(outputFormat.toLowerCase())
				{
					case "raw":
						return Promise.resolve()
							.then(() => this.importKey("pkcs8", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("raw", result));
					case "spki":
						return Promise.reject("Impossible to convert between SPKI/PKCS8");
					case "pkcs8":
						return Promise.resolve(keyData);
					case "jwk":
						return Promise.resolve()
							.then(() => this.importKey("pkcs8", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("jwk", result));
					default:
						return Promise.reject(`Incorrect outputFormat: ${outputFormat}`);
				}
			case "jwk":
				switch(outputFormat.toLowerCase())
				{
					case "raw":
						return Promise.resolve()
							.then(() => this.importKey("jwk", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("raw", result));
					case "spki":
						return Promise.resolve()
							.then(() => this.importKey("jwk", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("spki", result));
					case "pkcs8":
						return Promise.resolve()
							.then(() => this.importKey("jwk", keyData, algorithm, extractable, keyUsages))
							.then(result => this.exportKey("pkcs8", result));
					case "jwk":
						return Promise.resolve(keyData);
					default:
						return Promise.reject(`Incorrect outputFormat: ${outputFormat}`);
				}
			default:
				return Promise.reject(`Incorrect inputFormat: ${inputFormat}`);
		}
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "encrypt"
	 * @param args
	 * @returns {Promise}
	 */
	encrypt(...args)
	{
		return this.crypto.encrypt(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "decrypt"
	 * @param args
	 * @returns {Promise}
	 */
	decrypt(...args)
	{
		return this.crypto.decrypt(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "sign"
	 * @param args
	 * @returns {Promise}
	 */
	sign(...args)
	{
		return this.crypto.sign(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "verify"
	 * @param args
	 * @returns {Promise}
	 */
	verify(...args)
	{
		return this.crypto.verify(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "digest"
	 * @param args
	 * @returns {Promise}
	 */
	digest(...args)
	{
		return this.crypto.digest(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "generateKey"
	 * @param args
	 * @returns {Promise}
	 */
	generateKey(...args)
	{
		return this.crypto.generateKey(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "deriveKey"
	 * @param args
	 * @returns {Promise}
	 */
	deriveKey(...args)
	{
		return this.crypto.deriveKey(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "deriveBits"
	 * @param args
	 * @returns {Promise}
	 */
	deriveBits(...args)
	{
		return this.crypto.deriveBits(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "wrapKey"
	 * @param args
	 * @returns {Promise}
	 */
	wrapKey(...args)
	{
		return this.crypto.wrapKey(...args);
	}
	//**********************************************************************************
	/**
	 * Wrapper for standard function "unwrapKey"
	 * @param args
	 * @returns {Promise}
	 */
	unwrapKey(...args)
	{
		return this.crypto.unwrapKey(...args);
	}
	//**********************************************************************************
}
//**************************************************************************************
