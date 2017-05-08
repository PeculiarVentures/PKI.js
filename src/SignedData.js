import * as asn1js from "asn1js";
import { getParametersValue, utilConcatBuf, isEqualBuffer } from "pvutils";
import {
	getCrypto,
	getOIDByAlgorithm,
	createCMSECDSASignature,
	getAlgorithmByOID,
	createECDSASignatureFromCMS,
	getAlgorithmParameters
} from "./common";
import AlgorithmIdentifier from "./AlgorithmIdentifier";
import EncapsulatedContentInfo from "./EncapsulatedContentInfo";
import Certificate from "./Certificate";
import OtherCertificateFormat from "./OtherCertificateFormat";
import CertificateRevocationList from "./CertificateRevocationList";
import OtherRevocationInfoFormat from "./OtherRevocationInfoFormat";
import SignerInfo from "./SignerInfo";
import CertificateSet from "./CertificateSet";
import RevocationInfoChoices from "./RevocationInfoChoices";
import IssuerAndSerialNumber from "./IssuerAndSerialNumber";
import TSTInfo from "./TSTInfo";
import CertificateChainValidationEngine from "./CertificateChainValidationEngine";
import BasicOCSPResponse from "./BasicOCSPResponse";
import RSASSAPSSParams from "./RSASSAPSSParams";
//**************************************************************************************
/**
 * Class from RFC5652
 */
export default class SignedData 
{
	//**********************************************************************************
	/**
	 * Constructor for SignedData class
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
		this.version = getParametersValue(parameters, "version", SignedData.defaultValues("version"));
		/**
		 * @type {Array.<AlgorithmIdentifier>}
		 * @description digestAlgorithms
		 */
		this.digestAlgorithms = getParametersValue(parameters, "digestAlgorithms", SignedData.defaultValues("digestAlgorithms"));
		/**
		 * @type {EncapsulatedContentInfo}
		 * @description encapContentInfo
		 */
		this.encapContentInfo = getParametersValue(parameters, "encapContentInfo", SignedData.defaultValues("encapContentInfo"));
		
		if("certificates" in parameters)
			/**
			 * @type {Array.<Certificate|OtherCertificateFormat>}
			 * @description certificates
			 */
			this.certificates = getParametersValue(parameters, "certificates", SignedData.defaultValues("certificates"));
		
		if("crls" in parameters)
			/**
			 * @type {Array.<CertificateRevocationList|OtherRevocationInfoFormat>}
			 * @description crls
			 */
			this.crls = getParametersValue(parameters, "crls", SignedData.defaultValues("crls"));
		
		/**
		 * @type {Array.<SignerInfo>}
		 * @description signerInfos
		 */
		this.signerInfos = getParametersValue(parameters, "signerInfos", SignedData.defaultValues("signerInfos"));
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
			case "digestAlgorithms":
				return [];
			case "encapContentInfo":
				return new EncapsulatedContentInfo();
			case "certificates":
				return [];
			case "crls":
				return [];
			case "signerInfos":
				return [];
			default:
				throw new Error(`Invalid member name for SignedData class: ${memberName}`);
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
				return (memberValue === SignedData.defaultValues("version"));
			case "encapContentInfo":
				return new EncapsulatedContentInfo();
			case "digestAlgorithms":
			case "certificates":
			case "crls":
			case "signerInfos":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for SignedData class: ${memberName}`);
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
		//SignedData ::= SEQUENCE {
		//    version CMSVersion,
		//    digestAlgorithms DigestAlgorithmIdentifiers,
		//    encapContentInfo EncapsulatedContentInfo,
		//    certificates [0] IMPLICIT CertificateSet OPTIONAL,
		//    crls [1] IMPLICIT RevocationInfoChoices OPTIONAL,
		//    signerInfos SignerInfos }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [optional]
		 * @property {string} [digestAlgorithms]
		 * @property {string} [encapContentInfo]
		 * @property {string} [certificates]
		 * @property {string} [crls]
		 * @property {string} [signerInfos]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		if(("optional" in names) === false)
			names.optional = false;
		
		return (new asn1js.Sequence({
			name: (names.blockName || "SignedData"),
			optional: names.optional,
			value: [
				new asn1js.Integer({ name: (names.version || "SignedData.version") }),
				new asn1js.Set({
					value: [
						new asn1js.Repeated({
							name: (names.digestAlgorithms || "SignedData.digestAlgorithms"),
							value: AlgorithmIdentifier.schema()
						})
					]
				}),
				EncapsulatedContentInfo.schema(names.encapContentInfo || {
					names: {
						blockName: "SignedData.encapContentInfo"
					}
				}),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: CertificateSet.schema(names.certificates || {
						names: {
							certificates: "SignedData.certificates"
						}
					}).valueBlock.value
				}), // IMPLICIT CertificateSet
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					value: RevocationInfoChoices.schema(names.crls || {
						names: {
							crls: "SignedData.crls"
						}
					}).valueBlock.value
				}), // IMPLICIT RevocationInfoChoices
				new asn1js.Set({
					value: [
						new asn1js.Repeated({
							name: (names.signerInfos || "SignedData.signerInfos"),
							value: SignerInfo.schema()
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
			SignedData.schema()
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for CMS_SIGNED_DATA");
		//endregion
		
		//region Get internal properties from parsed schema
		this.version = asn1.result["SignedData.version"].valueBlock.valueDec;
		
		if("SignedData.digestAlgorithms" in asn1.result) // Could be empty SET of digest algorithms
			this.digestAlgorithms = Array.from(asn1.result["SignedData.digestAlgorithms"], algorithm => new AlgorithmIdentifier({ schema: algorithm }));
		
		this.encapContentInfo = new EncapsulatedContentInfo({ schema: asn1.result["SignedData.encapContentInfo"] });
		
		if("SignedData.certificates" in asn1.result)
		{
			this.certificates = Array.from(asn1.result["SignedData.certificates"], certificate =>
			{
				if(certificate.idBlock.tagClass === 1)
					return new Certificate({ schema: certificate });
				
				if((certificate.idBlock.tagClass === 3) && (certificate.idBlock.tagNumber === 3))
				{
					//region Create SEQUENCE from [3]
					certificate.idBlock.tagClass = 1; // UNIVERSAL
					certificate.idBlock.tagNumber = 16; // SEQUENCE
					//endregion
					
					return new OtherCertificateFormat({ schema: certificate });
				}
				//else // For now we would ignore "AttributeCertificateV1" and "AttributeCertificateV1"
				
				return new Certificate();
			});
		}
		
		if("SignedData.crls" in asn1.result)
		{
			this.crls = Array.from(asn1.result["SignedData.crls"], crl =>
			{
				if(crl.idBlock.tagClass === 1)
					return new CertificateRevocationList({ schema: crl });
				
				//region Create SEQUENCE from [1]
				crl.idBlock.tagClass = 1; // UNIVERSAL
				crl.idBlock.tagNumber = 16; // SEQUENCE
				//endregion
				
				return new OtherRevocationInfoFormat({ schema: crl });
			});
		}
		
		if("SignedData.signerInfos" in asn1.result) // Could be empty SET SignerInfos
			this.signerInfos = Array.from(asn1.result["SignedData.signerInfos"], signerInfoSchema => new SignerInfo({ schema: signerInfoSchema }));
		//endregion
	}
	//**********************************************************************************
	/**
	 * Convert current object to asn1js object and set correct values
	 * @returns {Object} asn1js object
	 */
	toSchema(encodeFlag = false)
	{
		//region Create array for output sequence
		const outputArray = [];
		
		outputArray.push(new asn1js.Integer({ value: this.version }));
		
		//region Create array of digest algorithms
		outputArray.push(new asn1js.Set({
			value: Array.from(this.digestAlgorithms, algorithm => algorithm.toSchema(encodeFlag))
		}));
		//endregion
		
		outputArray.push(this.encapContentInfo.toSchema());
		
		if("certificates" in this)
		{
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: Array.from(this.certificates, certificate =>
				{
					if(certificate instanceof OtherCertificateFormat)
					{
						const certificateSchema = certificate.toSchema(encodeFlag);
						
						certificateSchema.idBlock.tagClass = 3;
						certificateSchema.idBlock.tagNumber = 3;
						
						return certificateSchema;
					}
					
					return certificate.toSchema(encodeFlag);
				})
			}));
		}
		
		if("crls" in this)
		{
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: Array.from(this.crls, crl =>
				{
					if(crl instanceof OtherRevocationInfoFormat)
					{
						const crlSchema = crl.toSchema(encodeFlag);
						
						crlSchema.idBlock.tagClass = 3;
						crlSchema.idBlock.tagNumber = 1;
						
						return crlSchema;
					}
					
					return crl.toSchema(encodeFlag);
				})
			}));
		}
		
		//region Create array of signer infos
		outputArray.push(new asn1js.Set({
			value: Array.from(this.signerInfos, signerInfo => signerInfo.toSchema(encodeFlag))
		}));
		//endregion
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
			digestAlgorithms: Array.from(this.digestAlgorithms, algorithm => algorithm.toJSON()),
			encapContentInfo: this.encapContentInfo.toJSON()
		};
		
		if("certificates" in this)
			_object.certificates = Array.from(this.certificates, certificate => certificate.toJSON());
		
		if("crls" in this)
			_object.crls = Array.from(this.crls, crl => crl.toJSON());
		
		_object.signerInfos = Array.from(this.signerInfos, signerInfo => signerInfo.toJSON());
		
		return _object;
	}
	//**********************************************************************************
	/**
	 * Verify current SignedData value
	 * @param signer
	 * @param data
	 * @param trustedCerts
	 * @param checkDate
	 * @param checkChain
	 * @param includeSignerCertificate
	 * @param extendedMode
	 * @returns {*}
	 */
	verify({
		signer = (-1),
		data = (new ArrayBuffer(0)),
		trustedCerts = [],
		checkDate = (new Date()),
		checkChain = false,
		includeSignerCertificate = false,
		extendedMode = false
	} = {})
	{
		//region Global variables 
		let sequence = Promise.resolve();
		
		let messageDigestValue = new ArrayBuffer(0);
		
		let publicKey;
		
		let shaAlgorithm = "";
		
		let signerCertificate = {};
		
		let timestampSerial = null;
		//endregion
		
		//region Get a "crypto" extension 
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion 
		
		//region Get a signer number
		if(signer === (-1))
		{
			if(extendedMode)
			{
				return Promise.reject({
					date: checkDate,
					code: 1,
					message: "Unable to get signer index from input parameters",
					signatureVerified: null,
					signerCertificate: null,
					signerCertificateVerified: null
				});
			}
			
			return Promise.reject("Unable to get signer index from input parameters");
		}
		//endregion 
		
		//region Check that certificates field was included in signed data 
		if(("certificates" in this) === false)
		{
			if(extendedMode)
			{
				return Promise.reject({
					date: checkDate,
					code: 2,
					message: "No certificates attached to this signed data",
					signatureVerified: null,
					signerCertificate: null,
					signerCertificateVerified: null
				});
			}
			
			return Promise.reject("No certificates attached to this signed data");
		}
		//endregion 
		
		//region Find a certificate for specified signer 
		if(this.signerInfos[signer].sid instanceof IssuerAndSerialNumber)
		{
			sequence = sequence.then(() =>
			{
				for(const certificate of this.certificates)
				{
					if((certificate instanceof Certificate) === false)
						continue;
					
					if((certificate.issuer.isEqual(this.signerInfos[signer].sid.issuer)) &&
						(certificate.serialNumber.isEqual(this.signerInfos[signer].sid.serialNumber)))
					{
						signerCertificate = certificate;
						return Promise.resolve();
					}
				}
				
				if(extendedMode)
				{
					return Promise.reject({
						date: checkDate,
						code: 3,
						message: "Unable to find signer certificate",
						signatureVerified: null,
						signerCertificate: null,
						signerCertificateVerified: null
					});
				}
				
				return Promise.reject("Unable to find signer certificate");
			});
		}
		else // Find by SubjectKeyIdentifier
		{
			sequence = sequence.then(() =>
				Promise.all(Array.from(this.certificates.filter(certificate => (certificate instanceof Certificate)), certificate =>
					crypto.digest({ name: "sha-1" }, new Uint8Array(certificate.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex)))
				).then(results =>
				{
					for(const [index, certificate] of this.certificates.entries())
					{
						if((certificate instanceof Certificate) === false)
							continue;
						
						if(isEqualBuffer(results[index], this.signerInfos[signer].sid.valueBlock.valueHex))
						{
							signerCertificate = certificate;
							return Promise.resolve();
						}
					}
					
					if(extendedMode)
					{
						return Promise.reject({
							date: checkDate,
							code: 3,
							message: "Unable to find signer certificate",
							signatureVerified: null,
							signerCertificate: null,
							signerCertificateVerified: null
						});
					}
					
					return Promise.reject("Unable to find signer certificate");
				}, () =>
				{
					if(extendedMode)
					{
						return Promise.reject({
							date: checkDate,
							code: 3,
							message: "Unable to find signer certificate",
							signatureVerified: null,
							signerCertificate: null,
							signerCertificateVerified: null
						});
					}
					
					return Promise.reject("Unable to find signer certificate");
				})
			);
		}
		//endregion 
		
		//region Verify internal digest in case of "tSTInfo" content type 
		sequence = sequence.then(() =>
		{
			if(this.encapContentInfo.eContentType === "1.2.840.113549.1.9.16.1.4")
			{
				//region Check "eContent" precense
				if(("eContent" in this.encapContentInfo) === false)
					return false;
				//endregion
				
				//region Initialize TST_INFO value
				const asn1 = asn1js.fromBER(this.encapContentInfo.eContent.valueBlock.valueHex);
				let tstInfo;
				
				try
				{
					tstInfo = new TSTInfo({ schema: asn1.result });
				}
				catch(ex)
				{
					return false;
				}
				//endregion
				
				//region Change "checkDate" and append "timestampSerial"
				checkDate = tstInfo.genTime;
				timestampSerial = tstInfo.serialNumber.valueBlock.valueHex;
				//endregion
				
				//region Check that we do have detached data content
				if(data.byteLength === 0)
				{
					if(extendedMode)
					{
						return Promise.reject({
							date: checkDate,
							code: 4,
							message: "Missed detached data input array",
							signatureVerified: null,
							signerCertificate,
							signerCertificateVerified: null
						});
					}
					
					return Promise.reject("Missed detached data input array");
				}
				//endregion
				
				return tstInfo.verify({ data });
			}
			
			return true;
		});
		//endregion 
		
		//region Make additional verification for signer's certificate 
		function checkCA(cert)
		{
			/// <param name="cert" type="in_window.org.pkijs.simpl.CERT">Certificate to find CA flag for</param>
			
			//region Do not include signer's certificate 
			if((cert.issuer.isEqual(signerCertificate.issuer) === true) && (cert.serialNumber.isEqual(signerCertificate.serialNumber) === true))
				return null;
			//endregion 
			
			let isCA = false;
			
			for(const extension of cert.extensions)
			{
				if(extension.extnID === "2.5.29.19") // BasicConstraints
				{
					if("cA" in extension.parsedValue)
					{
						if(extension.parsedValue.cA === true)
							isCA = true;
					}
				}
			}
			
			if(isCA)
				return cert;
			
			return null;
		}
		
		if(checkChain)
		{
			sequence = sequence.then(result =>
			{
				//region Veify result of previous operation
				if(result === false)
					return false;
				//endregion
				
				return Promise.all(Array.from(this.certificates.filter(certificate => (certificate instanceof Certificate)), certificate => checkCA(certificate)))
					.then(promiseResults =>
					{
						const certificateChainEngine = new CertificateChainValidationEngine({
							checkDate,
							certs: Array.from(promiseResults.filter(_result => (_result !== null))),
							trustedCerts
						});
						
						certificateChainEngine.certs.push(signerCertificate);
						
						if("crls" in this)
						{
							for(const crl of this.crls)
							{
								if(crl instanceof CertificateRevocationList)
									certificateChainEngine.crls.push(crl);
								else // Assumed "revocation value" has "OtherRevocationInfoFormat"
								{
									if(crl.otherRevInfoFormat === "1.3.6.1.5.5.7.48.1.1") // Basic OCSP response
										certificateChainEngine.ocsps.push(new BasicOCSPResponse({ schema: crl.otherRevInfo }));
								}
							}
						}
						
						if("ocsps" in this)
							certificateChainEngine.ocsps.push(...(this.ocsps));
						
						return certificateChainEngine.verify().then(verificationResult =>
						{
							if(verificationResult.result === true)
								return Promise.resolve(true);
							
							if(extendedMode)
							{
								return Promise.reject({
									date: checkDate,
									code: 5,
									message: `Validation of signer's certificate failed: ${verificationResult.resultMessage}`,
									signatureVerified: null,
									signerCertificate,
									signerCertificateVerified: false
								});
							}
							
							return Promise.reject("Validation of signer's certificate failed");
						}, error =>
						{
							if(extendedMode)
							{
								return Promise.reject({
									date: checkDate,
									code: 5,
									message: `Validation of signer's certificate failed with error: ${((error instanceof Object) ? error.resultMessage : error)}`,
									signatureVerified: null,
									signerCertificate,
									signerCertificateVerified: false
								});
							}
							
							return Promise.reject(`Validation of signer's certificate failed with error: ${((error instanceof Object) ? error.resultMessage : error)}`);
						});
					}, promiseError =>
					{
						if(extendedMode)
						{
							return Promise.reject({
								date: checkDate,
								code: 6,
								message: `Error during checking certificates for CA flag: ${promiseError}`,
								signatureVerified: null,
								signerCertificate,
								signerCertificateVerified: null
							});
						}
						
						return Promise.reject(`Error during checking certificates for CA flag: ${promiseError}`);
					});
			});
		}
		//endregion 
		
		//region Find signer's hashing algorithm 
		sequence = sequence.then(result =>
		{
			//region Veify result of previous operation
			if(result === false)
				return false;
			//endregion
			
			const signerInfoHashAlgorithm = getAlgorithmByOID(this.signerInfos[signer].digestAlgorithm.algorithmId);
			if(("name" in signerInfoHashAlgorithm) === false)
			{
				if(extendedMode)
				{
					return Promise.reject({
						date: checkDate,
						code: 7,
						message: `Unsupported signature algorithm: ${this.signerInfos[signer].digestAlgorithm.algorithmId}`,
						signatureVerified: null,
						signerCertificate,
						signerCertificateVerified: true
					});
				}
				
				return Promise.reject(`Unsupported signature algorithm: ${this.signerInfos[signer].digestAlgorithm.algorithmId}`);
			}
			
			shaAlgorithm = signerInfoHashAlgorithm.name;
			
			return true;
		});
		//endregion 
		
		//region Create correct data block for verification 
		sequence = sequence.then(result =>
		{
			//region Veify result of previous operation
			if(result === false)
				return false;
			//endregion
			
			if("eContent" in this.encapContentInfo) // Attached data
			{
				if((this.encapContentInfo.eContent.idBlock.tagClass === 1) &&
					(this.encapContentInfo.eContent.idBlock.tagNumber === 4))
				{
					if(this.encapContentInfo.eContent.idBlock.isConstructed === false)
						data = this.encapContentInfo.eContent.valueBlock.valueHex;
					else
					{
						for(const contentValue of this.encapContentInfo.eContent.valueBlock.value)
							data = utilConcatBuf(data, contentValue.valueBlock.valueHex);
					}
				}
				else
					data = this.encapContentInfo.eContent.valueBlock.valueHex;
			}
			else // Detached data
			{
				if(data.byteLength === 0) // Check that "data" already provided by function parameter
				{
					if(extendedMode)
					{
						return Promise.reject({
							date: checkDate,
							code: 8,
							message: "Missed detached data input array",
							signatureVerified: null,
							signerCertificate,
							signerCertificateVerified: true
						});
					}
					
					return Promise.reject("Missed detached data input array");
				}
			}
			
			if("signedAttrs" in this.signerInfos[signer])
			{
				//region Check mandatory attributes
				let foundContentType = false;
				let foundMessageDigest = false;
				
				for(const attribute of this.signerInfos[signer].signedAttrs.attributes)
				{
					//region Check that "content-type" attribute exists
					if(attribute.type === "1.2.840.113549.1.9.3")
						foundContentType = true;
					//endregion
					
					//region Check that "message-digest" attribute exists
					if(attribute.type === "1.2.840.113549.1.9.4")
					{
						foundMessageDigest = true;
						messageDigestValue = attribute.values[0].valueBlock.valueHex;
					}
					//endregion
					
					//region Speed-up searching
					if(foundContentType && foundMessageDigest)
						break;
					//endregion
				}
				
				if(foundContentType === false)
				{
					if(extendedMode)
					{
						return Promise.reject({
							date: checkDate,
							code: 9,
							message: "Attribute \"content-type\" is a mandatory attribute for \"signed attributes\"",
							signatureVerified: null,
							signerCertificate,
							signerCertificateVerified: true
						});
					}
					
					return Promise.reject("Attribute \"content-type\" is a mandatory attribute for \"signed attributes\"");
				}
				
				if(foundMessageDigest === false)
				{
					if(extendedMode)
					{
						return Promise.reject({
							date: checkDate,
							code: 10,
							message: "Attribute \"message-digest\" is a mandatory attribute for \"signed attributes\"",
							signatureVerified: null,
							signerCertificate,
							signerCertificateVerified: true
						});
					}
					
					return Promise.reject("Attribute \"message-digest\" is a mandatory attribute for \"signed attributes\"");
				}
				//endregion
			}
			
			return true;
		});
		//endregion 
		
		//region Import public key from signer's certificate 
		sequence = sequence.then(result =>
		{
			//region Veify result of previous operation
			if(result === false)
				return false;
			//endregion
			
			//region Get information about public key algorithm and default parameters for import
			let algorithmId;
			if(signerCertificate.signatureAlgorithm.algorithmId === "1.2.840.113549.1.1.10")
				algorithmId = signerCertificate.signatureAlgorithm.algorithmId;
			else
				algorithmId = signerCertificate.subjectPublicKeyInfo.algorithm.algorithmId;
			
			const algorithmObject = getAlgorithmByOID(algorithmId);
			if(("name" in algorithmObject) === false)
			{
				if(extendedMode)
				{
					return Promise.reject({
						date: checkDate,
						code: 11,
						message: `Unsupported public key algorithm: ${algorithmId}`,
						signatureVerified: null,
						signerCertificate,
						signerCertificateVerified: true
					});
				}
				
				return Promise.reject(`Unsupported public key algorithm: ${algorithmId}`);
			}
			
			const algorithm = getAlgorithmParameters(algorithmObject.name, "importkey");
			if("hash" in algorithm.algorithm)
				algorithm.algorithm.hash.name = shaAlgorithm;
			
			//region Special case for ECDSA
			if(algorithmObject.name === "ECDSA")
			{
				//region Get information about named curve
				let algorithmParamsChecked = false;
				
				if(("algorithmParams" in signerCertificate.subjectPublicKeyInfo.algorithm) === true)
				{
					if("idBlock" in signerCertificate.subjectPublicKeyInfo.algorithm.algorithmParams)
					{
						if((signerCertificate.subjectPublicKeyInfo.algorithm.algorithmParams.idBlock.tagClass === 1) && (signerCertificate.subjectPublicKeyInfo.algorithm.algorithmParams.idBlock.tagNumber === 6))
							algorithmParamsChecked = true;
					}
				}
				
				if(algorithmParamsChecked === false)
					return Promise.reject("Incorrect type for ECDSA public key parameters");
				
				const curveObject = getAlgorithmByOID(signerCertificate.subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
				if(("name" in curveObject) === false)
					return Promise.reject(`Unsupported named curve algorithm: ${signerCertificate.subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString()}`);
				//endregion
				
				algorithm.algorithm.namedCurve = curveObject.name;
			}
			//endregion
			//endregion
			
			const publicKeyInfoSchema = signerCertificate.subjectPublicKeyInfo.toSchema();
			const publicKeyInfoBuffer = publicKeyInfoSchema.toBER(false);
			const publicKeyInfoView = new Uint8Array(publicKeyInfoBuffer);
			
			return crypto.importKey("spki", publicKeyInfoView, algorithm.algorithm, true, algorithm.usages);
		});
		//endregion 
		
		//region Verify signer's signature 
		sequence = sequence.then(result =>
		{
			// #region Veify result of previous operation
			if(typeof result === "boolean")
				return false;
			// #endregion
			
			publicKey = result;
			
			// #region Verify "message-digest" attribute in case of "signedAttrs"
			if("signedAttrs" in this.signerInfos[signer])
				return crypto.digest(shaAlgorithm, new Uint8Array(data));
			
			return true;
			// #endregion
		}).then(result =>
		{
			// #region Verify result of previous operation
			if(result === false)
				return false;
			// #endregion
			
			if("signedAttrs" in this.signerInfos[signer])
			{
				if(isEqualBuffer(result, messageDigestValue))
				{
					data = this.signerInfos[signer].signedAttrs.encodedValue;
					return true;
				}
				
				return false;
			}
			
			return true;
		}).then(result =>
		{
			//region Check result of previous operation
			if(result === false)
				return false;
			//endregion
			
			//region Get default algorithm parameters for verification
			const algorithm = getAlgorithmParameters(publicKey.algorithm.name, "verify");
			if("hash" in algorithm.algorithm)
				algorithm.algorithm.hash.name = shaAlgorithm;
			//endregion
			
			//region Special case for RSA-PSS
			if(publicKey.algorithm.name === "RSA-PSS")
			{
				let pssParameters;
				
				try
				{
					pssParameters = new RSASSAPSSParams({ schema: this.signerInfos[signer].signatureAlgorithm.algorithmParams });
				}
				catch(ex)
				{
					if(extendedMode)
					{
						return Promise.reject({
							date: checkDate,
							code: 12,
							message: ex,
							signatureVerified: null,
							signerCertificate,
							signerCertificateVerified: true
						});
					}
					
					return Promise.reject(ex);
				}
				
				if("saltLength" in pssParameters)
					algorithm.algorithm.saltLength = pssParameters.saltLength;
				else
					algorithm.algorithm.saltLength = 20;
				
				let hashName = "SHA-1";
				
				if("hashAlgorithm" in pssParameters)
				{
					const hashAlgorithm = getAlgorithmByOID(pssParameters.hashAlgorithm.algorithmId);
					if(("name" in hashAlgorithm) === false)
					{
						if(extendedMode)
						{
							return Promise.reject({
								date: checkDate,
								code: 13,
								message: `Unrecognized hash algorithm: ${pssParameters.hashAlgorithm.algorithmId}`,
								signatureVerified: null,
								signerCertificate,
								signerCertificateVerified: true
							});
						}
						
						return Promise.reject(`Unrecognized hash algorithm: ${pssParameters.hashAlgorithm.algorithmId}`);
					}
					
					hashName = hashAlgorithm.name;
				}
				
				algorithm.algorithm.hash.name = hashName;
			}
			//endregion
			
			//region Special case for ECDSA signatures
			let signatureValue = this.signerInfos[signer].signature.valueBlock.valueHex;
			
			if(publicKey.algorithm.name === "ECDSA")
			{
				const asn1 = asn1js.fromBER(signatureValue);
				signatureValue = createECDSASignatureFromCMS(asn1.result);
			}
			//endregion
			
			return crypto.verify(algorithm.algorithm,
				publicKey,
				new Uint8Array(signatureValue),
				new Uint8Array(data));
		});
		//endregion 
		
		//region Make a final result 
		sequence = sequence.then(result =>
		{
			if(extendedMode)
			{
				return {
					date: checkDate,
					code: 14,
					message: "",
					signatureVerified: result,
					signerCertificate,
					timestampSerial,
					signerCertificateVerified: true
				};
			}
			
			return result;
		}, error =>
		{
			if(extendedMode)
			{
				if("code" in error)
					return Promise.reject(error);
				
				return Promise.reject({
					date: checkDate,
					code: 15,
					message: `Error during verification: ${error.message}`,
					signatureVerified: null,
					signerCertificate,
					signerCertificateVerified: true
				});
			}
			
			return Promise.reject(error);
		});
		//endregion 
		
		return sequence;
	}
	//**********************************************************************************
	/**
	 * Signing current SignedData
	 * @param {key} privateKey Private key for "subjectPublicKeyInfo" structure
	 * @param {number} signerIndex Index number (starting from 0) of signer index to make signature for
	 * @param {string} [hashAlgorithm] Hashing algorithm. Default SHA-1
	 * @param {ArrayBuffer} [data] Detached data
	 * @returns {*}
	 */
	sign(privateKey, signerIndex, hashAlgorithm, data)
	{
		//region Initial variables
		data = data || new ArrayBuffer(0);
		let hashAlgorithmOID = "";
		//endregion
		
		//region Get a private key from function parameter
		if(typeof privateKey === "undefined")
			return Promise.reject("Need to provide a private key for signing");
		//endregion
		
		//region Get hashing algorithm
		if(typeof hashAlgorithm === "undefined")
			hashAlgorithm = "SHA-1";
		
		//region Simple check for supported algorithm
		hashAlgorithmOID = getOIDByAlgorithm({ name: hashAlgorithm });
		if(hashAlgorithmOID === "")
			return Promise.reject(`Unsupported hash algorithm: ${hashAlgorithm}`);
		//endregion
		//endregion
		
		//region Append information about hash algorithm
		if((this.digestAlgorithms.filter(algorithm => algorithm.algorithmId === hashAlgorithmOID)).length === 0)
		{
			this.digestAlgorithms.push(new AlgorithmIdentifier({
				algorithmId: hashAlgorithmOID,
				algorithmParams: new asn1js.Null()
			}));
		}
		
		this.signerInfos[signerIndex].digestAlgorithm = new AlgorithmIdentifier({
			algorithmId: hashAlgorithmOID,
			algorithmParams: new asn1js.Null()
		});
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
				this.signerInfos[signerIndex].signatureAlgorithm.algorithmId = getOIDByAlgorithm(defParams.algorithm);
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
						hashAlgorithmOID = getOIDByAlgorithm({ name: hashAlgorithm });
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
					this.signerInfos[signerIndex].signatureAlgorithm = new AlgorithmIdentifier({
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
		if("signedAttrs" in this.signerInfos[signerIndex])
		{
			if(this.signerInfos[signerIndex].signedAttrs.encodedValue.byteLength !== 0)
				data = this.signerInfos[signerIndex].signedAttrs.encodedValue;
			else
			{
				data = this.signerInfos[signerIndex].signedAttrs.toSchema(true).toBER(false);
				
				//region Change type from "[0]" to "SET" acordingly to standard
				const view = new Uint8Array(data);
				view[0] = 0x31;
				//endregion
			}
		}
		else
		{
			if("eContent" in this.encapContentInfo) // Attached data
			{
				if((this.encapContentInfo.eContent.idBlock.tagClass === 1) &&
					(this.encapContentInfo.eContent.idBlock.tagNumber === 4))
				{
					if(this.encapContentInfo.eContent.idBlock.isConstructed === false)
						data = this.encapContentInfo.eContent.valueBlock.valueHex;
					else
					{
						for(const content of this.encapContentInfo.eContent.valueBlock.value)
							data = utilConcatBuf(data, content.valueBlock.valueHex);
					}
				}
				else
					data = this.encapContentInfo.eContent.valueBlock.valueHex;
			}
			else // Detached data
			{
				if(data.byteLength === 0) // Check that "data" already provided by function parameter
					return Promise.reject("Missed detached data input array");
			}
		}
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Signing TBS data on provided private key
		return crypto.sign(defParams.algorithm,
			privateKey,
			new Uint8Array(data)).then(result =>
		{
			//region Special case for ECDSA algorithm
				if(defParams.algorithm.name === "ECDSA")
					result = createCMSECDSASignature(result);
			//endregion
			
				this.signerInfos[signerIndex].signature = new asn1js.OctetString({ valueHex: result });
			
				return result;
			}, error => Promise.reject(`Signing error: ${error}`));
		//endregion
	}
	//**********************************************************************************
}
//**************************************************************************************
