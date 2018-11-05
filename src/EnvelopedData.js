import * as asn1js from "asn1js";
import { getParametersValue, utilConcatBuf, clearProps } from "pvutils";
import { getOIDByAlgorithm, getRandomValues, getCrypto, getAlgorithmByOID, kdf } from "./common.js";
import OriginatorInfo from "./OriginatorInfo.js";
import RecipientInfo from "./RecipientInfo.js";
import EncryptedContentInfo from "./EncryptedContentInfo.js";
import Attribute from "./Attribute.js";
import AlgorithmIdentifier from "./AlgorithmIdentifier.js";
import RSAESOAEPParams from "./RSAESOAEPParams.js";
import KeyTransRecipientInfo from "./KeyTransRecipientInfo.js";
import IssuerAndSerialNumber from "./IssuerAndSerialNumber.js";
import RecipientEncryptedKey from "./RecipientEncryptedKey.js";
import KeyAgreeRecipientIdentifier from "./KeyAgreeRecipientIdentifier.js";
import KeyAgreeRecipientInfo from "./KeyAgreeRecipientInfo.js";
import RecipientEncryptedKeys from "./RecipientEncryptedKeys.js";
import KEKRecipientInfo from "./KEKRecipientInfo.js";
import KEKIdentifier from "./KEKIdentifier.js";
import PBKDF2Params from "./PBKDF2Params.js";
import PasswordRecipientinfo from "./PasswordRecipientinfo.js";
import ECCCMSSharedInfo from "./ECCCMSSharedInfo.js";
import OriginatorIdentifierOrKey from "./OriginatorIdentifierOrKey.js";
import OriginatorPublicKey from "./OriginatorPublicKey.js";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class EnvelopedData 
{
	//**********************************************************************************
	/**
	 * Constructor for EnvelopedData class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {number}
		 * @desc version
		 */
		this.version = getParametersValue(parameters, "version", EnvelopedData.defaultValues("version"));
		
		if("originatorInfo" in parameters)
			/**
			 * @type {OriginatorInfo}
			 * @desc originatorInfo
			 */
			this.originatorInfo = getParametersValue(parameters, "originatorInfo", EnvelopedData.defaultValues("originatorInfo"));
		
		/**
		 * @type {Array.<RecipientInfo>}
		 * @desc recipientInfos
		 */
		this.recipientInfos = getParametersValue(parameters, "recipientInfos", EnvelopedData.defaultValues("recipientInfos"));
		/**
		 * @type {EncryptedContentInfo}
		 * @desc encryptedContentInfo
		 */
		this.encryptedContentInfo = getParametersValue(parameters, "encryptedContentInfo", EnvelopedData.defaultValues("encryptedContentInfo"));
		
		if("unprotectedAttrs" in parameters)
			/**
			 * @type {Array.<Attribute>}
			 * @desc unprotectedAttrs
			 */
			this.unprotectedAttrs = getParametersValue(parameters, "unprotectedAttrs", EnvelopedData.defaultValues("unprotectedAttrs"));
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
			case "originatorInfo":
				return new OriginatorInfo();
			case "recipientInfos":
				return [];
			case "encryptedContentInfo":
				return new EncryptedContentInfo();
			case "unprotectedAttrs":
				return [];
			default:
				throw new Error(`Invalid member name for EnvelopedData class: ${memberName}`);
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
				return (memberValue === EnvelopedData.defaultValues(memberName));
			case "originatorInfo":
				return ((memberValue.certs.certificates.length === 0) && (memberValue.crls.crls.length === 0));
			case "recipientInfos":
			case "unprotectedAttrs":
				return (memberValue.length === 0);
			case "encryptedContentInfo":
				return ((EncryptedContentInfo.compareWithDefault("contentType", memberValue.contentType)) &&
				(EncryptedContentInfo.compareWithDefault("contentEncryptionAlgorithm", memberValue.contentEncryptionAlgorithm) &&
				(EncryptedContentInfo.compareWithDefault("encryptedContent", memberValue.encryptedContent))));
			default:
				throw new Error(`Invalid member name for EnvelopedData class: ${memberName}`);
		}
	}
	//**********************************************************************************
	/**
	 * Return value of pre-defined ASN.1 schema for current class
	 *
	 * ASN.1 schema:
	 * ```asn1
	 * EnvelopedData ::= SEQUENCE {
	 *    version CMSVersion,
	 *    originatorInfo [0] IMPLICIT OriginatorInfo OPTIONAL,
	 *    recipientInfos RecipientInfos,
	 *    encryptedContentInfo EncryptedContentInfo,
	 *    unprotectedAttrs [1] IMPLICIT UnprotectedAttributes OPTIONAL }
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
		 * @property {string} [version]
		 * @property {string} [originatorInfo]
		 * @property {string} [recipientInfos]
		 * @property {string} [encryptedContentInfo]
		 * @property {string} [unprotectedAttrs]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || ""),
			value: [
				new asn1js.Integer({ name: (names.version || "") }),
				new asn1js.Constructed({
					name: (names.originatorInfo || ""),
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: OriginatorInfo.schema().valueBlock.value
				}),
				new asn1js.Set({
					value: [
						new asn1js.Repeated({
							name: (names.recipientInfos || ""),
							value: RecipientInfo.schema()
						})
					]
				}),
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
		//region Clear input data first
		clearProps(schema, [
			"version",
			"originatorInfo",
			"recipientInfos",
			"encryptedContentInfo",
			"unprotectedAttrs"
		]);
		//endregion
		
		//region Check the schema is valid
		const asn1 = asn1js.compareSchema(schema,
			schema,
			EnvelopedData.schema({
				names: {
					version: "version",
					originatorInfo: "originatorInfo",
					recipientInfos: "recipientInfos",
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
			throw new Error("Object's schema was not verified against input data for EnvelopedData");
		//endregion
		
		//region Get internal properties from parsed schema
		this.version = asn1.result.version.valueBlock.valueDec;
		
		if("originatorInfo" in asn1.result)
		{
			this.originatorInfo = new OriginatorInfo({
				schema: new asn1js.Sequence({
					value: asn1.result.originatorInfo.valueBlock.value
				})
			});
		}
		
		this.recipientInfos = Array.from(asn1.result.recipientInfos, element => new RecipientInfo({ schema: element }));
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
		
		if("originatorInfo" in this)
		{
			outputArray.push(new asn1js.Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: this.originatorInfo.toSchema().valueBlock.value
			}));
		}
		
		outputArray.push(new asn1js.Set({
			value: Array.from(this.recipientInfos, element => element.toSchema())
		}));
		
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
			version: this.version
		};
		
		if("originatorInfo" in this)
			_object.originatorInfo = this.originatorInfo.toJSON();
		
		_object.recipientInfos = Array.from(this.recipientInfos, element => element.toJSON());
		_object.encryptedContentInfo = this.encryptedContentInfo.toJSON();
		
		if("unprotectedAttrs" in this)
			_object.unprotectedAttrs = Array.from(this.unprotectedAttrs, element => element.toJSON());
		
		return _object;
	}
	//**********************************************************************************
	/**
	 * Helpers function for filling "RecipientInfo" based on recipient's certificate.
	 * Problem with WebCrypto is that for RSA certificates we have only one option - "key transport" and
	 * for ECC certificates we also have one option - "key agreement". As soon as Google will implement
	 * DH algorithm it would be possible to use "key agreement" also for RSA certificates.
	 * @param {Certificate} [certificate] Recipient's certificate
	 * @param {Object} [parameters] Additional parameters neccessary for "fine tunning" of encryption process
	 * @param {number} [variant] Variant = 1 is for "key transport", variant = 2 is for "key agreement". In fact the "variant" is unneccessary now because Google has no DH algorithm implementation. Thus key encryption scheme would be choosen by certificate type only: "key transport" for RSA and "key agreement" for ECC certificates.
	 */
	addRecipientByCertificate(certificate, parameters, variant)
	{
		//region Initial variables 
		const encryptionParameters = parameters || {};
		//endregion 
		
		//region Check type of certificate
		if(certificate.subjectPublicKeyInfo.algorithm.algorithmId.indexOf("1.2.840.113549") !== (-1))
			variant = 1; // For the moment it is the only variant for RSA-based certificates
		else
		{
			if(certificate.subjectPublicKeyInfo.algorithm.algorithmId.indexOf("1.2.840.10045") !== (-1))
				variant = 2; // For the moment it is the only variant for ECC-based certificates
			else
				throw new Error(`Unknown type of certificate's public key: ${certificate.subjectPublicKeyInfo.algorithm.algorithmId}`);
		}
		//endregion 
		
		//region Initialize encryption parameters 
		if(("oaepHashAlgorithm" in encryptionParameters) === false)
			encryptionParameters.oaepHashAlgorithm = "SHA-512";
		
		if(("kdfAlgorithm" in encryptionParameters) === false)
			encryptionParameters.kdfAlgorithm = "SHA-512";
		
		if(("kekEncryptionLength" in encryptionParameters) === false)
			encryptionParameters.kekEncryptionLength = 256;
		//endregion 
		
		//region Add new "recipient" depends on "variant" and certificate type 
		switch(variant)
		{
			case 1: // Key transport scheme
				{
					//region keyEncryptionAlgorithm
					const oaepOID = getOIDByAlgorithm({
						name: "RSA-OAEP"
					});
					if(oaepOID === "")
						throw new Error("Can not find OID for OAEP");
					//endregion

					//region RSAES-OAEP-params
					const hashOID = getOIDByAlgorithm({
						name: encryptionParameters.oaepHashAlgorithm
					});
					if(hashOID === "")
						throw new Error(`Unknown OAEP hash algorithm: ${encryptionParameters.oaepHashAlgorithm}`);
				
					const hashAlgorithm = new AlgorithmIdentifier({
						algorithmId: hashOID,
						algorithmParams: new asn1js.Null()
					});
				
					const rsaOAEPParams = new RSAESOAEPParams({
						hashAlgorithm,
						maskGenAlgorithm: new AlgorithmIdentifier({
							algorithmId: "1.2.840.113549.1.1.8", // id-mgf1
							algorithmParams: hashAlgorithm.toSchema()
						})
					});
					//endregion

					//region KeyTransRecipientInfo
					const keyInfo = new KeyTransRecipientInfo({
						version: 0,
						rid: new IssuerAndSerialNumber({
							issuer: certificate.issuer,
							serialNumber: certificate.serialNumber
						}),
						keyEncryptionAlgorithm: new AlgorithmIdentifier({
							algorithmId: oaepOID,
							algorithmParams: rsaOAEPParams.toSchema()
						}),
						recipientCertificate: certificate
						// "encryptedKey" will be calculated in "encrypt" function
					});
					//endregion
				
					//region Final values for "CMS_ENVELOPED_DATA"
					this.recipientInfos.push(new RecipientInfo({
						variant: 1,
						value: keyInfo
					}));
					//endregion
				}
				break;
			case 2: // Key agreement scheme
				{
					//region RecipientEncryptedKey
					const encryptedKey = new RecipientEncryptedKey({
						rid: new KeyAgreeRecipientIdentifier({
							variant: 1,
							value: new IssuerAndSerialNumber({
								issuer: certificate.issuer,
								serialNumber: certificate.serialNumber
							})
						})
					// "encryptedKey" will be calculated in "encrypt" function
					});
					//endregion
				
					//region keyEncryptionAlgorithm
					const aesKWoid = getOIDByAlgorithm({
						name: "AES-KW",
						length: encryptionParameters.kekEncryptionLength
					});
					if(aesKWoid === "")
						throw new Error(`Unknown length for key encryption algorithm: ${encryptionParameters.kekEncryptionLength}`);
				
					const aesKW = new AlgorithmIdentifier({
						algorithmId: aesKWoid,
						algorithmParams: new asn1js.Null()
					});
					//endregion

					//region KeyAgreeRecipientInfo
					const ecdhOID = getOIDByAlgorithm({
						name: "ECDH",
						kdf: encryptionParameters.kdfAlgorithm
					});
					if(ecdhOID === "")
						throw new Error(`Unknown KDF algorithm: ${encryptionParameters.kdfAlgorithm}`);
				
					// In fact there is no need in so long UKM, but RFC2631
					// has requirement that "UserKeyMaterial" must be 512 bits long
					const ukmBuffer = new ArrayBuffer(64);
					const ukmView = new Uint8Array(ukmBuffer);
					getRandomValues(ukmView); // Generate random values in 64 bytes long buffer
				
					const keyInfo = new KeyAgreeRecipientInfo({
						version: 3,
						// "originator" will be calculated in "encrypt" function because ephemeral key would be generated there
						ukm: new asn1js.OctetString({ valueHex: ukmBuffer }),
						keyEncryptionAlgorithm: new AlgorithmIdentifier({
							algorithmId: ecdhOID,
							algorithmParams: aesKW.toSchema()
						}),
						recipientEncryptedKeys: new RecipientEncryptedKeys({
							encryptedKeys: [encryptedKey]
						}),
						recipientCertificate: certificate
					});
					//endregion

					//region Final values for "CMS_ENVELOPED_DATA"
					this.recipientInfos.push(new RecipientInfo({
						variant: 2,
						value: keyInfo
					}));
					//endregion
				}
				break;
			default:
				throw new Error(`Unknown "variant" value: ${variant}`);
		}
		//endregion 
		
		return true;
	}
	//**********************************************************************************
	/**
	 * Add recipient based on pre-defined data like password or KEK
	 * @param {ArrayBuffer} preDefinedData ArrayBuffer with pre-defined data
	 * @param {Object} parameters Additional parameters neccessary for "fine tunning" of encryption process
	 * @param {number} variant Variant = 1 for pre-defined "key encryption key" (KEK). Variant = 2 for password-based encryption.
	 */
	addRecipientByPreDefinedData(preDefinedData, parameters, variant)
	{
		//region Initial variables
		const encryptionParameters = parameters || {};
		//endregion
		
		//region Check initial parameters
		if((preDefinedData instanceof ArrayBuffer) === false)
			throw new Error("Please pass \"preDefinedData\" in ArrayBuffer type");
		
		if(preDefinedData.byteLength === 0)
			throw new Error("Pre-defined data could have zero length");
		//endregion
		
		//region Initialize encryption parameters
		if(("keyIdentifier" in encryptionParameters) === false)
		{
			const keyIdentifierBuffer = new ArrayBuffer(16);
			const keyIdentifierView = new Uint8Array(keyIdentifierBuffer);
			getRandomValues(keyIdentifierView);
			
			encryptionParameters.keyIdentifier = keyIdentifierBuffer;
		}
		
		if(("hmacHashAlgorithm" in encryptionParameters) === false)
			encryptionParameters.hmacHashAlgorithm = "SHA-512";
		
		if(("iterationCount" in encryptionParameters) === false)
			encryptionParameters.iterationCount = 2048;
		
		if(("keyEncryptionAlgorithm" in encryptionParameters) === false)
		{
			encryptionParameters.keyEncryptionAlgorithm = {
				name: "AES-KW",
				length: 256
			};
		}
		
		if(("keyEncryptionAlgorithmParams" in encryptionParameters) === false)
			encryptionParameters.keyEncryptionAlgorithmParams = new asn1js.Null();
		//endregion
		
		//region Add new recipient based on passed variant
		switch(variant)
		{
			case 1: // KEKRecipientInfo
				{
					//region keyEncryptionAlgorithm
					const kekOID = getOIDByAlgorithm(encryptionParameters.keyEncryptionAlgorithm);
					if(kekOID === "")
						throw new Error("Incorrect value for \"keyEncryptionAlgorithm\"");
					//endregion

					//region KEKRecipientInfo
					const keyInfo = new KEKRecipientInfo({
						version: 4,
						kekid: new KEKIdentifier({
							keyIdentifier: new asn1js.OctetString({ valueHex: encryptionParameters.keyIdentifier })
						}),
						keyEncryptionAlgorithm: new AlgorithmIdentifier({
							algorithmId: kekOID,
							/*
							 For AES-KW params are NULL, but for other algorithm could another situation.
							 */
							algorithmParams: encryptionParameters.keyEncryptionAlgorithmParams
						}),
						preDefinedKEK: preDefinedData
					// "encryptedKey" would be set in "ecrypt" function
					});
					//endregion

					//region Final values for "CMS_ENVELOPED_DATA"
					this.recipientInfos.push(new RecipientInfo({
						variant: 3,
						value: keyInfo
					}));
					//endregion
				}
				break;
			case 2: // PasswordRecipientinfo
				{
					//region keyDerivationAlgorithm
					const pbkdf2OID = getOIDByAlgorithm({
						name: "PBKDF2"
					});
					if(pbkdf2OID === "")
						throw new Error("Can not find OID for PBKDF2");
					//endregion

					//region Salt
					const saltBuffer = new ArrayBuffer(64);
					const saltView = new Uint8Array(saltBuffer);
					getRandomValues(saltView);
					//endregion

					//region HMAC-based algorithm
					const hmacOID = getOIDByAlgorithm({
						name: "HMAC",
						hash: {
							name: encryptionParameters.hmacHashAlgorithm
						}
					});
					if(hmacOID === "")
						throw new Error(`Incorrect value for "hmacHashAlgorithm": ${encryptionParameters.hmacHashAlgorithm}`);
					//endregion

					//region PBKDF2-params
					const pbkdf2Params = new PBKDF2Params({
						salt: new asn1js.OctetString({ valueHex: saltBuffer }),
						iterationCount: encryptionParameters.iterationCount,
						prf: new AlgorithmIdentifier({
							algorithmId: hmacOID,
							algorithmParams: new asn1js.Null()
						})
					});
					//endregion

					//region keyEncryptionAlgorithm
					const kekOID = getOIDByAlgorithm(encryptionParameters.keyEncryptionAlgorithm);
					if(kekOID === "")
						throw new Error("Incorrect value for \"keyEncryptionAlgorithm\"");
					//endregion

					//region PasswordRecipientinfo
					const keyInfo = new PasswordRecipientinfo({
						version: 0,
						keyDerivationAlgorithm: new AlgorithmIdentifier({
							algorithmId: pbkdf2OID,
							algorithmParams: pbkdf2Params.toSchema()
						}),
						keyEncryptionAlgorithm: new AlgorithmIdentifier({
							algorithmId: kekOID,
							/*
							 For AES-KW params are NULL, but for other algorithm could be another situation.
							 */
							algorithmParams: encryptionParameters.keyEncryptionAlgorithmParams
						}),
						password: preDefinedData
					// "encryptedKey" would be set in "ecrypt" function
					});
					//endregion

					//region Final values for "CMS_ENVELOPED_DATA"
					this.recipientInfos.push(new RecipientInfo({
						variant: 4,
						value: keyInfo
					}));
					//endregion
				}
				break;
			default:
				throw new Error(`Unknown value for "variant": ${variant}`);
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Create a new CMS Enveloped Data content with encrypted data
	 * @param {Object} contentEncryptionAlgorithm WebCrypto algorithm. For the moment here could be only "AES-CBC" or "AES-GCM" algorithms.
	 * @param {ArrayBuffer} contentToEncrypt Content to encrypt
	 * @returns {Promise}
	 */
	encrypt(contentEncryptionAlgorithm, contentToEncrypt)
	{
		//region Initial variables
		let sequence = Promise.resolve();
		
		const ivBuffer = new ArrayBuffer(16); // For AES we need IV 16 bytes long
		const ivView = new Uint8Array(ivBuffer);
		getRandomValues(ivView);
		
		const contentView = new Uint8Array(contentToEncrypt);
		
		let sessionKey;
		let encryptedContent;
		let exportedSessionKey;
		
		const recipientsPromises = [];
		
		const _this = this;
		//endregion
		
		//region Check for input parameters
		const contentEncryptionOID = getOIDByAlgorithm(contentEncryptionAlgorithm);
		if(contentEncryptionOID === "")
			return Promise.reject("Wrong \"contentEncryptionAlgorithm\" value");
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Generate new content encryption key
		sequence = sequence.then(() =>
			crypto.generateKey(contentEncryptionAlgorithm, true, ["encrypt"]));
		//endregion
		//region Encrypt content
		sequence = sequence.then(result =>
		{
			sessionKey = result;
			
			return crypto.encrypt({
				name: contentEncryptionAlgorithm.name,
				iv: ivView
			},
			sessionKey,
			contentView);
		}, error =>
			Promise.reject(error));
		//endregion
		//region Export raw content of content encryption key
		sequence = sequence.then(result =>
		{
			//region Create output OCTETSTRING with encrypted content
			encryptedContent = result;
			//endregion
				
			return crypto.exportKey("raw", sessionKey);
		}, error =>
			Promise.reject(error)
		).then(result =>
		{
			exportedSessionKey = result;
			
			return true;
		}, error =>
			Promise.reject(error));
		//endregion
		//region Append common information to CMS_ENVELOPED_DATA
		sequence = sequence.then(() =>
		{
			this.version = 2;
			this.encryptedContentInfo = new EncryptedContentInfo({
				contentType: "1.2.840.113549.1.7.1", // "data"
				contentEncryptionAlgorithm: new AlgorithmIdentifier({
					algorithmId: contentEncryptionOID,
					algorithmParams: new asn1js.OctetString({ valueHex: ivBuffer })
				}),
				encryptedContent: new asn1js.OctetString({ valueHex: encryptedContent })
			});
		}, error =>
			Promise.reject(error));
		//endregion
		
		//region Special sub-functions to work with each recipient's type
		function SubKeyAgreeRecipientInfo(index)
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			
			let ecdhPublicKey;
			let ecdhPrivateKey;
			
			let recipientCurve;
			let recipientCurveLength;
			
			let exportedECDHPublicKey;
			//endregion
			
			//region Get "namedCurve" parameter from recipient's certificate
			currentSequence = currentSequence.then(() =>
			{
				const curveObject = _this.recipientInfos[index].value.recipientCertificate.subjectPublicKeyInfo.algorithm.algorithmParams;
				
				if((curveObject instanceof asn1js.ObjectIdentifier) === false)
					return Promise.reject(`Incorrect "recipientCertificate" for index ${index}`);
				
				const curveOID = curveObject.valueBlock.toString();
				
				switch(curveOID)
				{
					case "1.2.840.10045.3.1.7":
						recipientCurve = "P-256";
						recipientCurveLength = 256;
						break;
					case "1.3.132.0.34":
						recipientCurve = "P-384";
						recipientCurveLength = 384;
						break;
					case "1.3.132.0.35":
						recipientCurve = "P-521";
						recipientCurveLength = 528;
						break;
					default:
						return Promise.reject(`Incorrect curve OID for index ${index}`);
				}
				
				return recipientCurve;
			}, error =>
				Promise.reject(error));
			//endregion
			
			//region Generate ephemeral ECDH key
			currentSequence = currentSequence.then(result =>
				crypto.generateKey({
					name: "ECDH",
					namedCurve: result
				},
				true,
				["deriveBits"]),
			error =>
				Promise.reject(error)
			);
			//endregion
			//region Export public key of ephemeral ECDH key pair
			currentSequence = currentSequence.then(result =>
			{
				ecdhPublicKey = result.publicKey;
				ecdhPrivateKey = result.privateKey;
					
				return crypto.exportKey("spki", ecdhPublicKey);
			},
			error =>
				Promise.reject(error));
			//endregion
			
			//region Import recipient's public key
			currentSequence = currentSequence.then(result =>
			{
				exportedECDHPublicKey = result;
				
				return _this.recipientInfos[index].value.recipientCertificate.getPublicKey({
					algorithm: {
						algorithm: {
							name: "ECDH",
							namedCurve: recipientCurve
						},
						usages: []
					}
				});
			}, error =>
				Promise.reject(error));
			//endregion
			//region Create shared secret
			currentSequence = currentSequence.then(result => crypto.deriveBits({
				name: "ECDH",
				public: result
			},
			ecdhPrivateKey,
			recipientCurveLength),
			error =>
				Promise.reject(error));
			//endregion
			
			//region Apply KDF function to shared secret
			currentSequence = currentSequence.then(
				/**
				 * @param {ArrayBuffer} result
				 */
				result =>
				{
					//region Get length of used AES-KW algorithm
					const aesKWAlgorithm = new AlgorithmIdentifier({ schema: _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmParams });
					
					const KWalgorithm = getAlgorithmByOID(aesKWAlgorithm.algorithmId);
					if(("name" in KWalgorithm) === false)
						return Promise.reject(`Incorrect OID for key encryption algorithm: ${aesKWAlgorithm.algorithmId}`);
					//endregion
					
					//region Translate AES-KW length to ArrayBuffer
					let kwLength = KWalgorithm.length;
					
					const kwLengthBuffer = new ArrayBuffer(4);
					const kwLengthView = new Uint8Array(kwLengthBuffer);
					
					for(let j = 3; j >= 0; j--)
					{
						kwLengthView[j] = kwLength;
						kwLength >>= 8;
					}
					//endregion
					
					//region Create and encode "ECC-CMS-SharedInfo" structure
					const eccInfo = new ECCCMSSharedInfo({
						keyInfo: new AlgorithmIdentifier({
							algorithmId: aesKWAlgorithm.algorithmId,
							/*
							 Initially RFC5753 says that AES algorithms have absent parameters.
							 But since early implementations all put NULL here. Thus, in order to be
							 "backward compatible", index also put NULL here.
							 */
							algorithmParams: new asn1js.Null()
						}),
						entityUInfo: _this.recipientInfos[index].value.ukm,
						suppPubInfo: new asn1js.OctetString({ valueHex: kwLengthBuffer })
					});
					
					const encodedInfo = eccInfo.toSchema().toBER(false);
					//endregion
					
					//region Get SHA algorithm used together with ECDH
					const ecdhAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
					if(("name" in ecdhAlgorithm) === false)
						return Promise.reject(`Incorrect OID for key encryption algorithm: ${_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId}`);
					//endregion
					
					return kdf(ecdhAlgorithm.kdf, result, KWalgorithm.length, encodedInfo);
				},
				error =>
					Promise.reject(error));
			//endregion
			//region Import AES-KW key from result of KDF function
			currentSequence = currentSequence.then(result =>
				crypto.importKey("raw", result, { name: "AES-KW" }, true, ["wrapKey"]),
			error =>
				Promise.reject(error)
			);
			//endregion
			//region Finally wrap session key by using AES-KW algorithm
			currentSequence = currentSequence.then(result => crypto.wrapKey("raw", sessionKey, result, { name: "AES-KW" }),
				error =>
					Promise.reject(error)
			);
			//endregion
			//region Append all neccessary data to current CMS_RECIPIENT_INFO object
			currentSequence = currentSequence.then(result =>
			{
				//region OriginatorIdentifierOrKey
				const asn1 = asn1js.fromBER(exportedECDHPublicKey);
					
				const originator = new OriginatorIdentifierOrKey();
				originator.variant = 3;
				originator.value = new OriginatorPublicKey({ schema: asn1.result });
				// There is option when we can stay with ECParameters, but here index prefer to avoid the params
				if("algorithmParams" in originator.value.algorithm)
					delete originator.value.algorithm.algorithmParams;
					
				_this.recipientInfos[index].value.originator = originator;
				//endregion
					
				//region RecipientEncryptedKey
				/*
				 We will not support using of same ephemeral key for many recipients
				 */
				_this.recipientInfos[index].value.recipientEncryptedKeys.encryptedKeys[0].encryptedKey = new asn1js.OctetString({ valueHex: result });
				//endregion
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			return currentSequence;
		}
		
		function SubKeyTransRecipientInfo(index)
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			//endregion
			
			//region Get recipient's public key
			currentSequence = currentSequence.then(() =>
			{
				//region Get current used SHA algorithm
				const schema = _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmParams;
				const rsaOAEPParams = new RSAESOAEPParams({ schema });
				
				const hashAlgorithm = getAlgorithmByOID(rsaOAEPParams.hashAlgorithm.algorithmId);
				if(("name" in hashAlgorithm) === false)
					return Promise.reject(`Incorrect OID for hash algorithm: ${rsaOAEPParams.hashAlgorithm.algorithmId}`);
				//endregion
				
				return _this.recipientInfos[index].value.recipientCertificate.getPublicKey({
					algorithm: {
						algorithm: {
							name: "RSA-OAEP",
							hash: {
								name: hashAlgorithm.name
							}
						},
						usages: ["encrypt", "wrapKey"]
					}
				});
			}, error =>
				Promise.reject(error));
			//endregion
			//region Encrypt early exported session key on recipient's public key
			currentSequence = currentSequence.then(result =>
				crypto.encrypt(result.algorithm, result, exportedSessionKey),
			error =>
				Promise.reject(error)
			);
			//endregion
			
			//region Append all neccessary data to current CMS_RECIPIENT_INFO object
			currentSequence = currentSequence.then(result =>
			{
				//region RecipientEncryptedKey
				_this.recipientInfos[index].value.encryptedKey = new asn1js.OctetString({ valueHex: result });
				//endregion
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			return currentSequence;
		}
		
		function SubKEKRecipientInfo(index)
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			let kekAlgorithm;
			//endregion
			
			//region Import KEK from pre-defined data
			currentSequence = currentSequence.then(() =>
			{
				//region Get WebCrypto form of "keyEncryptionAlgorithm"
				kekAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
				if(("name" in kekAlgorithm) === false)
					return Promise.reject(`Incorrect OID for "keyEncryptionAlgorithm": ${_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId}`);
					//endregion
					
				return crypto.importKey("raw",
					new Uint8Array(_this.recipientInfos[index].value.preDefinedKEK),
					kekAlgorithm,
					true,
					["wrapKey"]); // Too specific for AES-KW
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			//region Wrap previously exported session key
			currentSequence = currentSequence.then(result =>
				crypto.wrapKey("raw", sessionKey, result, kekAlgorithm),
			error =>
				Promise.reject(error)
			);
			//endregion
			//region Append all neccessary data to current CMS_RECIPIENT_INFO object
			currentSequence = currentSequence.then(result =>
			{
				//region RecipientEncryptedKey
				_this.recipientInfos[index].value.encryptedKey = new asn1js.OctetString({ valueHex: result });
				//endregion
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			return currentSequence;
		}
		
		function SubPasswordRecipientinfo(index)
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			let pbkdf2Params;
			let kekAlgorithm;
			//endregion
			
			//region Check that we have encoded "keyDerivationAlgorithm" plus "PBKDF2_params" in there
			currentSequence = currentSequence.then(() =>
			{
				if(("keyDerivationAlgorithm" in _this.recipientInfos[index].value) === false)
					return Promise.reject("Please append encoded \"keyDerivationAlgorithm\"");
					
				if(("algorithmParams" in _this.recipientInfos[index].value.keyDerivationAlgorithm) === false)
					return Promise.reject("Incorrectly encoded \"keyDerivationAlgorithm\"");
					
				try
				{
					pbkdf2Params = new PBKDF2Params({ schema: _this.recipientInfos[index].value.keyDerivationAlgorithm.algorithmParams });
				}
				catch(ex)
				{
					return Promise.reject("Incorrectly encoded \"keyDerivationAlgorithm\"");
				}
					
				return Promise.resolve();
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Derive PBKDF2 key from "password" buffer
			currentSequence = currentSequence.then(() =>
			{
				const passwordView = new Uint8Array(_this.recipientInfos[index].value.password);
					
				return crypto.importKey("raw",
					passwordView,
					"PBKDF2",
					false,
					["deriveKey"]);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Derive key for "keyEncryptionAlgorithm"
			currentSequence = currentSequence.then(result =>
			{
				//region Get WebCrypto form of "keyEncryptionAlgorithm"
				kekAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
				if(("name" in kekAlgorithm) === false)
					return Promise.reject(`Incorrect OID for "keyEncryptionAlgorithm": ${_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId}`);
				//endregion
				
				//region Get HMAC hash algorithm
				let hmacHashAlgorithm = "SHA-1";
					
				if("prf" in pbkdf2Params)
				{
					const algorithm = getAlgorithmByOID(pbkdf2Params.prf.algorithmId);
					if(("name" in algorithm) === false)
						return Promise.reject("Incorrect OID for HMAC hash algorithm");
						
					hmacHashAlgorithm = algorithm.hash.name;
				}
				//endregion
				
				//region Get PBKDF2 "salt" value
				const saltView = new Uint8Array(pbkdf2Params.salt.valueBlock.valueHex);
				//endregion
					
				//region Get PBKDF2 iterations count
				const iterations = pbkdf2Params.iterationCount;
				//endregion
					
				return crypto.deriveKey({
					name: "PBKDF2",
					hash: {
						name: hmacHashAlgorithm
					},
					salt: saltView,
					iterations
				},
				result,
				kekAlgorithm,
				true,
				["wrapKey"]); // Usages are too specific for KEK algorithm
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Wrap previously exported session key (Also too specific for KEK algorithm)
			currentSequence = currentSequence.then(result =>
				crypto.wrapKey("raw", sessionKey, result, kekAlgorithm),
			error =>
				Promise.reject(error)
			);
			//endregion
			//region Append all neccessary data to current CMS_RECIPIENT_INFO object
			currentSequence = currentSequence.then(result =>
			{
				//region RecipientEncryptedKey
				_this.recipientInfos[index].value.encryptedKey = new asn1js.OctetString({ valueHex: result });
				//endregion
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			return currentSequence;
		}
		
		//endregion
		
		//region Create special routines for each "recipient"
		sequence = sequence.then(() =>
		{
			for(let i = 0; i < this.recipientInfos.length; i++)
			{
				//region Initial variables
				let currentSequence = Promise.resolve();
				//endregion
					
				switch(this.recipientInfos[i].variant)
				{
					case 1: // KeyTransRecipientInfo
						currentSequence = SubKeyTransRecipientInfo(i);
						break;
					case 2: // KeyAgreeRecipientInfo
						currentSequence = SubKeyAgreeRecipientInfo(i);
						break;
					case 3: // KEKRecipientInfo
						currentSequence = SubKEKRecipientInfo(i);
						break;
					case 4: // PasswordRecipientinfo
						currentSequence = SubPasswordRecipientinfo(i);
						break;
					default:
						return Promise.reject(`Uknown recipient type in array with index ${i}`);
				}
					
				recipientsPromises.push(currentSequence);
			}
				
			return Promise.all(recipientsPromises);
		}, error =>
			Promise.reject(error)
		);
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
	/**
	 * Decrypt existing CMS Enveloped Data content
	 * @param {number} recipientIndex Index of recipient
	 * @param {Object} parameters Additional parameters
	 * @returns {Promise}
	 */
	decrypt(recipientIndex, parameters)
	{
		//region Initial variables
		let sequence = Promise.resolve();
		
		const decryptionParameters = parameters || {};
		
		const _this = this;
		//endregion
		
		//region Check for input parameters
		if((recipientIndex + 1) > this.recipientInfos.length)
			return Promise.reject(`Maximum value for "index" is: ${this.recipientInfos.length - 1}`);
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Special sub-functions to work with each recipient's type
		function SubKeyAgreeRecipientInfo(index)
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			
			let recipientCurve;
			let recipientCurveLength;
			
			let curveOID;
			
			let ecdhPrivateKey;
			//endregion
			
			//region Get "namedCurve" parameter from recipient's certificate
			currentSequence = currentSequence.then(() =>
			{
				if(("recipientCertificate" in decryptionParameters) === false)
					return Promise.reject("Parameter \"recipientCertificate\" is mandatory for \"KeyAgreeRecipientInfo\"");
					
				if(("recipientPrivateKey" in decryptionParameters) === false)
					return Promise.reject("Parameter \"recipientPrivateKey\" is mandatory for \"KeyAgreeRecipientInfo\"");
					
				const curveObject = decryptionParameters.recipientCertificate.subjectPublicKeyInfo.algorithm.algorithmParams;
					
				if((curveObject instanceof asn1js.ObjectIdentifier) === false)
					return Promise.reject(`Incorrect "recipientCertificate" for index ${index}`);
					
				curveOID = curveObject.valueBlock.toString();
					
				switch(curveOID)
				{
					case "1.2.840.10045.3.1.7":
						recipientCurve = "P-256";
						recipientCurveLength = 256;
						break;
					case "1.3.132.0.34":
						recipientCurve = "P-384";
						recipientCurveLength = 384;
						break;
					case "1.3.132.0.35":
						recipientCurve = "P-521";
						recipientCurveLength = 528;
						break;
					default:
						return Promise.reject(`Incorrect curve OID for index ${index}`);
				}
					
				return crypto.importKey("pkcs8",
					decryptionParameters.recipientPrivateKey,
					{
						name: "ECDH",
						namedCurve: recipientCurve
					},
					true,
					["deriveBits"]
				);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Import sender's ephemeral public key
			currentSequence = currentSequence.then(result =>
			{
				ecdhPrivateKey = result;
					
				//region Change "OriginatorPublicKey" if "curve" parameter absent
				if(("algorithmParams" in _this.recipientInfos[index].value.originator.value.algorithm) === false)
					_this.recipientInfos[index].value.originator.value.algorithm.algorithmParams = new asn1js.ObjectIdentifier({ value: curveOID });
				//endregion
				
				//region Create ArrayBuffer with sender's public key
				const buffer = _this.recipientInfos[index].value.originator.value.toSchema().toBER(false);
				//endregion
					
				return crypto.importKey("spki",
					buffer,
					{
						name: "ECDH",
						namedCurve: recipientCurve
					},
					true,
					[]);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Create shared secret
			currentSequence = currentSequence.then(result =>
				crypto.deriveBits({
					name: "ECDH",
					public: result
				},
				ecdhPrivateKey,
				recipientCurveLength),
			error =>
				Promise.reject(error)
			);
			//endregion
			//region Apply KDF function to shared secret
			currentSequence = currentSequence.then(
				/**
				 * @param {ArrayBuffer} result
				 */
				result =>
				{
					//region Get length of used AES-KW algorithm
					const aesKWAlgorithm = new AlgorithmIdentifier({ schema: _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmParams });
					
					const KWalgorithm = getAlgorithmByOID(aesKWAlgorithm.algorithmId);
					if(("name" in KWalgorithm) === false)
						return Promise.reject(`Incorrect OID for key encryption algorithm: ${aesKWAlgorithm.algorithmId}`);
						//endregion
						
						//region Translate AES-KW length to ArrayBuffer
					let kwLength = KWalgorithm.length;
					
					const kwLengthBuffer = new ArrayBuffer(4);
					const kwLengthView = new Uint8Array(kwLengthBuffer);
					
					for(let j = 3; j >= 0; j--)
					{
						kwLengthView[j] = kwLength;
						kwLength >>= 8;
					}
					//endregion
					
					//region Create and encode "ECC-CMS-SharedInfo" structure
					const eccInfo = new ECCCMSSharedInfo({
						keyInfo: new AlgorithmIdentifier({
							algorithmId: aesKWAlgorithm.algorithmId,
							/*
							 Initially RFC5753 says that AES algorithms have absent parameters.
							 But since early implementations all put NULL here. Thus, in order to be
							 "backward compatible", index also put NULL here.
							 */
							algorithmParams: new asn1js.Null()
						}),
						entityUInfo: _this.recipientInfos[index].value.ukm,
						suppPubInfo: new asn1js.OctetString({ valueHex: kwLengthBuffer })
					});
					
					const encodedInfo = eccInfo.toSchema().toBER(false);
					//endregion
					
					//region Get SHA algorithm used together with ECDH
					const ecdhAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
					if(("name" in ecdhAlgorithm) === false)
						return Promise.reject(`Incorrect OID for key encryption algorithm: ${_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId}`);
						//endregion
						
					return kdf(ecdhAlgorithm.kdf, result, KWalgorithm.length, encodedInfo);
				},
				error =>
					Promise.reject(error)
			);
			//endregion
			//region Import AES-KW key from result of KDF function
			currentSequence = currentSequence.then(result =>
				crypto.importKey("raw",
					result,
					{ name: "AES-KW" },
					true,
					["unwrapKey"]),
			error => Promise.reject(error)
			);
			//endregion
			//region Finally unwrap session key
			currentSequence = currentSequence.then(result =>
			{
				//region Get WebCrypto form of content encryption algorithm
				const contentEncryptionAlgorithm = getAlgorithmByOID(_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
				if(("name" in contentEncryptionAlgorithm) === false)
					return Promise.reject(`Incorrect "contentEncryptionAlgorithm": ${_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId}`);
					//endregion
					
				return crypto.unwrapKey("raw",
					_this.recipientInfos[index].value.recipientEncryptedKeys.encryptedKeys[0].encryptedKey.valueBlock.valueHex,
					result,
					{ name: "AES-KW" },
					contentEncryptionAlgorithm,
					true,
					["decrypt"]);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			return currentSequence;
		}
		
		function SubKeyTransRecipientInfo(index)
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			//endregion
			
			//region Import recipient's private key
			currentSequence = currentSequence.then(() =>
			{
				if(("recipientPrivateKey" in decryptionParameters) === false)
					return Promise.reject("Parameter \"recipientPrivateKey\" is mandatory for \"KeyTransRecipientInfo\"");
					
				//region Get current used SHA algorithm
				const schema = _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmParams;
				const rsaOAEPParams = new RSAESOAEPParams({ schema });
					
				const hashAlgorithm = getAlgorithmByOID(rsaOAEPParams.hashAlgorithm.algorithmId);
				if(("name" in hashAlgorithm) === false)
					return Promise.reject(`Incorrect OID for hash algorithm: ${rsaOAEPParams.hashAlgorithm.algorithmId}`);
				//endregion
					
				return crypto.importKey("pkcs8",
					decryptionParameters.recipientPrivateKey,
					{
						name: "RSA-OAEP",
						hash: {
							name: hashAlgorithm.name
						}
					},
					true,
					["decrypt"]);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Decrypt encrypted session key
			currentSequence = currentSequence.then(result =>
				crypto.decrypt(result.algorithm,
					result,
					_this.recipientInfos[index].value.encryptedKey.valueBlock.valueHex
				), error =>
				Promise.reject(error)
			);
			//endregion
			//region Import decrypted session key
			currentSequence = currentSequence.then(result =>
			{
				//region Get WebCrypto form of content encryption algorithm
				const contentEncryptionAlgorithm = getAlgorithmByOID(_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
				if(("name" in contentEncryptionAlgorithm) === false)
					return Promise.reject(`Incorrect "contentEncryptionAlgorithm": ${_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId}`);
				//endregion
					
				return crypto.importKey("raw",
					result,
					contentEncryptionAlgorithm,
					true,
					["decrypt"]
				);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			return currentSequence;
		}
		
		function SubKEKRecipientInfo(index)
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			let kekAlgorithm;
			//endregion
			
			//region Import KEK from pre-defined data
			currentSequence = currentSequence.then(() =>
			{
				if(("preDefinedData" in decryptionParameters) === false)
					return Promise.reject("Parameter \"preDefinedData\" is mandatory for \"KEKRecipientInfo\"");
					
				//region Get WebCrypto form of "keyEncryptionAlgorithm"
				kekAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
				if(("name" in kekAlgorithm) === false)
					return Promise.reject(`Incorrect OID for "keyEncryptionAlgorithm": ${_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId}`);
				//endregion
					
				return crypto.importKey("raw",
					decryptionParameters.preDefinedData,
					kekAlgorithm,
					true,
					["unwrapKey"]); // Too specific for AES-KW
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Unwrap previously exported session key
			currentSequence = currentSequence.then(result =>
			{
				//region Get WebCrypto form of content encryption algorithm
				const contentEncryptionAlgorithm = getAlgorithmByOID(_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
				if(("name" in contentEncryptionAlgorithm) === false)
					return Promise.reject(`Incorrect "contentEncryptionAlgorithm": ${_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId}`);
				//endregion
					
				return crypto.unwrapKey("raw",
					_this.recipientInfos[index].value.encryptedKey.valueBlock.valueHex,
					result,
					kekAlgorithm,
					contentEncryptionAlgorithm,
					true,
					["decrypt"]);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			return currentSequence;
		}
		
		function SubPasswordRecipientinfo(index)
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			let pbkdf2Params;
			let kekAlgorithm;
			//endregion
			
			//region Derive PBKDF2 key from "password" buffer
			currentSequence = currentSequence.then(() =>
			{
				if(("preDefinedData" in decryptionParameters) === false)
					return Promise.reject("Parameter \"preDefinedData\" is mandatory for \"KEKRecipientInfo\"");
					
				if(("keyDerivationAlgorithm" in _this.recipientInfos[index].value) === false)
					return Promise.reject("Please append encoded \"keyDerivationAlgorithm\"");
					
				if(("algorithmParams" in _this.recipientInfos[index].value.keyDerivationAlgorithm) === false)
					return Promise.reject("Incorrectly encoded \"keyDerivationAlgorithm\"");
					
				try
				{
					pbkdf2Params = new PBKDF2Params({ schema: _this.recipientInfos[index].value.keyDerivationAlgorithm.algorithmParams });
				}
				catch(ex)
				{
					return Promise.reject("Incorrectly encoded \"keyDerivationAlgorithm\"");
				}
					
				return crypto.importKey("raw",
					decryptionParameters.preDefinedData,
					"PBKDF2",
					false,
					["deriveKey"]);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Derive key for "keyEncryptionAlgorithm"
			currentSequence = currentSequence.then(result =>
			{
				//region Get WebCrypto form of "keyEncryptionAlgorithm"
				kekAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
				if(("name" in kekAlgorithm) === false)
					return Promise.reject(`Incorrect OID for "keyEncryptionAlgorithm": ${_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId}`);
				//endregion
				
				//region Get HMAC hash algorithm
				let hmacHashAlgorithm = "SHA-1";
					
				if("prf" in pbkdf2Params)
				{
					const algorithm = getAlgorithmByOID(pbkdf2Params.prf.algorithmId);
					if(("name" in algorithm) === false)
						return Promise.reject("Incorrect OID for HMAC hash algorithm");
						
					hmacHashAlgorithm = algorithm.hash.name;
				}
				//endregion
				
				//region Get PBKDF2 "salt" value
				const saltView = new Uint8Array(pbkdf2Params.salt.valueBlock.valueHex);
				//endregion
					
				//region Get PBKDF2 iterations count
				const iterations = pbkdf2Params.iterationCount;
				//endregion
					
				return crypto.deriveKey({
					name: "PBKDF2",
					hash: {
						name: hmacHashAlgorithm
					},
					salt: saltView,
					iterations
				},
				result,
				kekAlgorithm,
				true,
				["unwrapKey"]); // Usages are too specific for KEK algorithm
			}, error =>
				Promise.reject(error)
			);
			//endregion
			//region Unwrap previously exported session key
			currentSequence = currentSequence.then(result =>
			{
				//region Get WebCrypto form of content encryption algorithm
				const contentEncryptionAlgorithm = getAlgorithmByOID(_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
				if(("name" in contentEncryptionAlgorithm) === false)
					return Promise.reject(`Incorrect "contentEncryptionAlgorithm": ${_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId}`);
					//endregion
					
				return crypto.unwrapKey("raw",
					_this.recipientInfos[index].value.encryptedKey.valueBlock.valueHex,
					result,
					kekAlgorithm,
					contentEncryptionAlgorithm,
					true,
					["decrypt"]);
			}, error =>
				Promise.reject(error)
			);
			//endregion
			
			return currentSequence;
		}
		
		//endregion
		
		//region Perform steps, specific to each type of session key encryption
		sequence = sequence.then(() =>
		{
			//region Initial variables
			let currentSequence = Promise.resolve();
			//endregion
				
			switch(this.recipientInfos[recipientIndex].variant)
			{
				case 1: // KeyTransRecipientInfo
					currentSequence = SubKeyTransRecipientInfo(recipientIndex);
					break;
				case 2: // KeyAgreeRecipientInfo
					currentSequence = SubKeyAgreeRecipientInfo(recipientIndex);
					break;
				case 3: // KEKRecipientInfo
					currentSequence = SubKEKRecipientInfo(recipientIndex);
					break;
				case 4: // PasswordRecipientinfo
					currentSequence = SubPasswordRecipientinfo(recipientIndex);
					break;
				default:
					return Promise.reject(`Uknown recipient type in array with index ${recipientIndex}`);
			}
				
			return currentSequence;
		}, error =>
			Promise.reject(error)
		);
		//endregion
		
		//region Finally decrypt data by session key
		sequence = sequence.then(result =>
		{
			//region Get WebCrypto form of content encryption algorithm
			const contentEncryptionAlgorithm = getAlgorithmByOID(this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
			if(("name" in contentEncryptionAlgorithm) === false)
				return Promise.reject(`Incorrect "contentEncryptionAlgorithm": ${this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId}`);
			//endregion
			
			//region Get "intialization vector" for content encryption algorithm
			const ivBuffer = this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams.valueBlock.valueHex;
			const ivView = new Uint8Array(ivBuffer);
			//endregion
			
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
