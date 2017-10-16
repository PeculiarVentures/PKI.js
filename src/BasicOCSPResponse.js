import * as asn1js from "asn1js";
import { getParametersValue, isEqualBuffer } from "pvutils";
import {
	getAlgorithmByOID,
	getAlgorithmParameters,
	getCrypto,
	getEngine,
	createECDSASignatureFromCMS,
	getHashAlgorithm
} from "./common";
import ResponseData from "./ResponseData";
import AlgorithmIdentifier from "./AlgorithmIdentifier";
import Certificate from "./Certificate";
import CertID from "./CertID";
import RSASSAPSSParams from "./RSASSAPSSParams";
import RelativeDistinguishedNames from "./RelativeDistinguishedNames";
import CertificateChainValidationEngine from "./CertificateChainValidationEngine";
//**************************************************************************************
/**
 * Class from RFC6960
 */
export default class BasicOCSPResponse
{
	//**********************************************************************************
	/**
	 * Constructor for BasicOCSPResponse class
	 * @param {Object} [parameters={}]
	 * @property {Object} [schema] asn1js parsed value
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {ResponseData}
		 * @description tbsResponseData
		 */
		this.tbsResponseData = getParametersValue(parameters, "tbsResponseData", BasicOCSPResponse.defaultValues("tbsResponseData"));
		/**
		 * @type {AlgorithmIdentifier}
		 * @description signatureAlgorithm
		 */
		this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", BasicOCSPResponse.defaultValues("signatureAlgorithm"));
		/**
		 * @type {BitString}
		 * @description signature
		 */
		this.signature = getParametersValue(parameters, "signature", BasicOCSPResponse.defaultValues("signature"));
		
		if("certs" in parameters)
			/**
			 * @type {Array.<Certificate>}
			 * @description certs
			 */
			this.certs = getParametersValue(parameters, "certs", BasicOCSPResponse.defaultValues("certs"));
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
			case "tbsResponseData":
				return new ResponseData();
			case "signatureAlgorithm":
				return new AlgorithmIdentifier();
			case "signature":
				return new asn1js.BitString();
			case "certs":
				return [];
			default:
				throw new Error(`Invalid member name for BasicOCSPResponse class: ${memberName}`);
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
			case "type":
				{
					let comparisonResult = ((ResponseData.compareWithDefault("tbs", memberValue.tbs)) &&
					(ResponseData.compareWithDefault("responderID", memberValue.responderID)) &&
					(ResponseData.compareWithDefault("producedAt", memberValue.producedAt)) &&
					(ResponseData.compareWithDefault("responses", memberValue.responses)));
					
					if("responseExtensions" in memberValue)
						comparisonResult = comparisonResult && (ResponseData.compareWithDefault("responseExtensions", memberValue.responseExtensions));
					
					return comparisonResult;
				}
			case "signatureAlgorithm":
				return ((memberValue.algorithmId === "") && (("algorithmParams" in memberValue) === false));
			case "signature":
				return (memberValue.isEqual(BasicOCSPResponse.defaultValues(memberName)));
			case "certs":
				return (memberValue.length === 0);
			default:
				throw new Error(`Invalid member name for BasicOCSPResponse class: ${memberName}`);
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
		//BasicOCSPResponse       ::= SEQUENCE {
		//    tbsResponseData      ResponseData,
		//    signatureAlgorithm   AlgorithmIdentifier,
		//    signature            BIT STRING,
		//    certs            [0] EXPLICIT SEQUENCE OF Certificate OPTIONAL }
		
		/**
		 * @type {Object}
		 * @property {string} [blockName]
		 * @property {string} [tbsResponseData]
		 * @property {string} [signatureAlgorithm]
		 * @property {string} [signature]
		 * @property {string} [certs]
		 */
		const names = getParametersValue(parameters, "names", {});
		
		return (new asn1js.Sequence({
			name: (names.blockName || "BasicOCSPResponse"),
			value: [
				ResponseData.schema(names.tbsResponseData || {
					names: {
						blockName: "BasicOCSPResponse.tbsResponseData"
					}
				}),
				AlgorithmIdentifier.schema(names.signatureAlgorithm || {
					names: {
						blockName: "BasicOCSPResponse.signatureAlgorithm"
					}
				}),
				new asn1js.BitString({ name: (names.signature || "BasicOCSPResponse.signature") }),
				new asn1js.Constructed({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [
						new asn1js.Sequence({
							value: [new asn1js.Repeated({
								name: "BasicOCSPResponse.certs",
								value: Certificate.schema(names.certs || {})
							})]
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
			BasicOCSPResponse.schema()
		);
		
		if(asn1.verified === false)
			throw new Error("Object's schema was not verified against input data for OCSP_BASIC_RESPONSE");
		//endregion
		
		//region Get internal properties from parsed schema
		this.tbsResponseData = new ResponseData({ schema: asn1.result["BasicOCSPResponse.tbsResponseData"] });
		this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result["BasicOCSPResponse.signatureAlgorithm"] });
		this.signature = asn1.result["BasicOCSPResponse.signature"];
		
		if("BasicOCSPResponse.certs" in asn1.result)
			this.certs = Array.from(asn1.result["BasicOCSPResponse.certs"], element => new Certificate({ schema: element }));
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
		
		outputArray.push(this.tbsResponseData.toSchema());
		outputArray.push(this.signatureAlgorithm.toSchema());
		outputArray.push(this.signature);
		
		//region Create array of certificates
		if("certs" in this)
		{
			outputArray.push(new asn1js.Constructed({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [
					new asn1js.Sequence({
						value: Array.from(this.certs, element => element.toSchema())
					})
				]
			}));
		}
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
			tbsResponseData: this.tbsResponseData.toJSON(),
			signatureAlgorithm: this.signatureAlgorithm.toJSON(),
			signature: this.signature.toJSON()
		};
		
		if("certs" in this)
			_object.certs = Array.from(this.certs, element => element.toJSON());
		
		return _object;
	}
	//**********************************************************************************
	/**
	 * Get OCSP response status for specific certificate
	 * @param {Certificate} certificate Certificate to be checked
	 * @param {Certificate} issuerCertificate Certificate of issuer for certificate to be checked
	 * @returns {Promise}
	 */
	getCertificateStatus(certificate, issuerCertificate)
	{
		//region Initial variables
		let sequence = Promise.resolve();
		
		const result = {
			isForCertificate: false,
			status: 2 // 0 = good, 1 = revoked, 2 = unknown
		};
		
		const hashesObject = {};
		
		const certIDs = [];
		const certIDPromises = [];
		//endregion
		
		//region Create all "certIDs" for input certificates
		for(const response of this.tbsResponseData.responses)
		{
			const hashAlgorithm = getAlgorithmByOID(response.certID.hashAlgorithm.algorithmId);
			if(("name" in hashAlgorithm) === false)
				return Promise.reject(`Wrong CertID hashing algorithm: ${response.certID.hashAlgorithm.algorithmId}`);
			
			if((hashAlgorithm.name in hashesObject) === false)
			{
				hashesObject[hashAlgorithm.name] = 1;
				
				const certID = new CertID();
				
				certIDs.push(certID);
				certIDPromises.push(certID.createForCertificate(certificate, {
					hashAlgorithm: hashAlgorithm.name,
					issuerCertificate
				}));
			}
		}
		
		sequence = sequence.then(() =>
			Promise.all(certIDPromises)
		);
		//endregion
		
		//region Compare all response's "certIDs" with identifiers for input certificate
		sequence = sequence.then(() =>
		{
			for(const response of this.tbsResponseData.responses)
			{
				for(const id of certIDs)
				{
					if(response.certID.isEqual(id))
					{
						result.isForCertificate = true;

						try
						{
							switch(response.certStatus.idBlock.isConstructed)
							{
								case true:
									if(response.certStatus.idBlock.tagNumber === 1)
										result.status = 1; // revoked
									
									break;
								case false:
									switch(response.certStatus.idBlock.tagNumber)
									{
										case 0: // good
											result.status = 0;
											break;
										case 2: // unknown
											result.status = 2;
											break;
										default:
									}
									
									break;
								default:
							}
						}
						catch(ex)
						{
						}
						
						return result;
					}
				}
			}
			
			return result;
		});
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
	/**
	 * Make signature for current OCSP Basic Response
	 * @param {Object} privateKey Private key for "subjectPublicKeyInfo" structure
	 * @param {string} [hashAlgorithm="SHA-1"] Hashing algorithm. Default SHA-1
	 * @returns {Promise}
	 */
	sign(privateKey, hashAlgorithm = "SHA-1")
	{
		//region Initial checking
		//region Get a private key from function parameter
		if(typeof privateKey === "undefined")
			return Promise.reject("Need to provide a private key for signing");
		//endregion
		//endregion
		
		//region Initial variables
		let sequence = Promise.resolve();
		let parameters;
		
		const engine = getEngine();
		//endregion
		
		//region Get a "default parameters" for current algorithm and set correct signature algorithm
		sequence = sequence.then(() => engine.subtle.getSignatureParameters(privateKey, hashAlgorithm));
		
		sequence = sequence.then(result =>
		{
			parameters = result.parameters;
			this.signatureAlgorithm = result.signatureAlgorithm;
		});
		//endregion
		
		//region Create TBS data for signing
		sequence = sequence.then(() =>
		{
			this.tbsResponseData.tbs = this.tbsResponseData.toSchema(true).toBER(false);
		});
		//endregion
		
		//region Signing TBS data on provided private key
		sequence = sequence.then(() => engine.subtle.signWithPrivateKey(this.tbsResponseData.tbs, privateKey, parameters));
		
		sequence = sequence.then(result =>
		{
			this.signature = new asn1js.BitString({ valueHex: result });
		});
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
	/**
	 * Verify existing OCSP Basic Response
	 * @param {Object} parameters Additional parameters
	 * @returns {Promise}
	 */
	verify(parameters = {})
	{
		//region Check amount of certificates
		if(("certs" in this) === false)
			return Promise.reject("No certificates attached to the BasicOCSPResponce");
		//endregion
		
		//region Global variables (used in "promises")
		let signerCert = null;
		
		const tbsView = new Uint8Array(this.tbsResponseData.tbs);
		
		let certIndex = -1;
		
		let sequence = Promise.resolve();
		
		let shaAlgorithm = "";
		
		let trustedCerts = [];
		//endregion
		
		//region Get input values
		if("trustedCerts" in parameters)
			trustedCerts = parameters.trustedCerts;
		//endregion
		
		//region Get a "crypto" extension
		const crypto = getCrypto();
		if(typeof crypto === "undefined")
			return Promise.reject("Unable to create WebCrypto object");
		//endregion
		
		//region Find a correct hashing algorithm
		shaAlgorithm = getHashAlgorithm(this.signatureAlgorithm);
		if(shaAlgorithm === "")
			return Promise.reject(`Unsupported signature algorithm: ${this.signatureAlgorithm.algorithmId}`);
		//endregion
		
		//region Find correct value for "responderID"
		let responderType = 0;
		let responderId = {};
		
		if(this.tbsResponseData.responderID instanceof RelativeDistinguishedNames) // [1] Name
		{
			responderType = 0;
			responderId = this.tbsResponseData.responderID;
		}
		else
		{
			if(this.tbsResponseData.responderID instanceof asn1js.OctetString) // [2] KeyHash
			{
				responderType = 1;
				responderId = this.tbsResponseData.responderID;
			}
			else
				return Promise.reject("Wrong value for responderID");
		}
		//endregion
		
		//region Compare responderID with all certificates one-by-one
		if(responderType === 0) // By Name
		{
			sequence = sequence.then(() =>
			{
				for(const [index, certificate] of this.certs.entries())
				{
					if(certificate.subject.isEqual(responderId))
					{
						certIndex = index;
						break;
					}
				}
			});
		}
		else  // By KeyHash
		{
			sequence = sequence.then(() => Promise.all(Array.from(this.certs, element =>
				crypto.digest({ name: "sha-1" }, new Uint8Array(element.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex)))).then(results =>
				{
					for(const [index, certificate] of this.certs.entries())
					{
						if(isEqualBuffer(results[index], responderId.valueBlock.valueHex))
						{
							certIndex = index;
							break;
						}
					}
				}));
		}
		//endregion
		
		//region Make additional verification for signer's certificate
		/**
		 * Check CA flag for the certificate
		 * @param {Certificate} cert Certificate to find CA flag for
		 * @returns {*}
		 */
		function checkCA(cert)
		{
			//region Do not include signer's certificate
			if((cert.issuer.isEqual(signerCert.issuer) === true) && (cert.serialNumber.isEqual(signerCert.serialNumber) === true))
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
		
		sequence = sequence.then(() =>
		{
			if(certIndex === (-1))
				return Promise.reject("Correct certificate was not found in OCSP response");
			
			signerCert = this.certs[certIndex];
			
			return Promise.all(Array.from(this.certs, element => checkCA(element))).then(promiseResults =>
			{
				const additionalCerts = [];
				additionalCerts.push(signerCert);
				
				for(const promiseResult of promiseResults)
				{
					if(promiseResult !== null)
						additionalCerts.push(promiseResult);
				}
				
				const certChain = new CertificateChainValidationEngine({
					certs: additionalCerts,
					trustedCerts
				});
				
				return certChain.verify().then(verificationResult =>
				{
					if(verificationResult.result === true)
						return Promise.resolve();
					
					return Promise.reject("Validation of signer's certificate failed");
				}, error =>
					Promise.reject(`Validation of signer's certificate failed with error: ${((error instanceof Object) ? error.resultMessage : error)}`)
				);
			}, promiseError =>
				Promise.reject(`Error during checking certificates for CA flag: ${promiseError}`)
			);
		});
		//endregion
		
		//region Import public key from responder certificate
		sequence = sequence.then(() =>
		{
			//region Get information about public key algorithm and default parameters for import
			let algorithmId;
			if(this.certs[certIndex].signatureAlgorithm.algorithmId === "1.2.840.113549.1.1.10")
				algorithmId = this.certs[certIndex].signatureAlgorithm.algorithmId;
			else
				algorithmId = this.certs[certIndex].subjectPublicKeyInfo.algorithm.algorithmId;
			
			const algorithmObject = getAlgorithmByOID(algorithmId);
			if(("name" in algorithmObject) === false)
				return Promise.reject(`Unsupported public key algorithm: ${algorithmId}`);
			
			const algorithmName = algorithmObject.name;
			
			const algorithm = getAlgorithmParameters(algorithmName, "importkey");
			if("hash" in algorithm.algorithm)
				algorithm.algorithm.hash.name = shaAlgorithm;
			
			//region Special case for ECDSA
			if(algorithmName === "ECDSA")
			{
				//region Get information about named curve
				if((this.certs[certIndex].subjectPublicKeyInfo.algorithm.algorithmParams instanceof asn1js.ObjectIdentifier) === false)
					return Promise.reject("Incorrect type for ECDSA public key parameters");
				
				const curveObject = getAlgorithmByOID(this.certs[certIndex].subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString());
				if(("name" in curveObject) === false)
					return Promise.reject(`Unsupported named curve algorithm: ${this.certs[certIndex].subjectPublicKeyInfo.algorithm.algorithmParams.valueBlock.toString()}`);
				//endregion
				
				algorithm.algorithm.namedCurve = curveObject.name;
			}
			//endregion
			//endregion
			
			const publicKeyInfoSchema = this.certs[certIndex].subjectPublicKeyInfo.toSchema();
			const publicKeyInfoBuffer = publicKeyInfoSchema.toBER(false);
			const publicKeyInfoView = new Uint8Array(publicKeyInfoBuffer);
			
			return crypto.importKey("spki", publicKeyInfoView, algorithm.algorithm, true, algorithm.usages);
		});
		//endregion
		
		//region Verifying TBS part of BasicOCSPResponce
		sequence = sequence.then(publicKey =>
		{
			//region Get default algorithm parameters for verification
			const algorithm = getAlgorithmParameters(publicKey.algorithm.name, "verify");
			if("hash" in algorithm.algorithm)
				algorithm.algorithm.hash.name = shaAlgorithm;
			//endregion
			
			//region Special case for ECDSA signatures
			let signatureValue = this.signature.valueBlock.valueHex;
			
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
				tbsView);
		});
		//endregion
		
		return sequence;
	}
	//**********************************************************************************
}
//**************************************************************************************
