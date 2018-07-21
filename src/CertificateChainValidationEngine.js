import { getParametersValue, isEqualBuffer } from "pvutils";
import { getAlgorithmByOID, stringPrep } from "./common.js";
//**************************************************************************************
export default class CertificateChainValidationEngine
{
	//**********************************************************************************
	/**
	 * Constructor for CertificateChainValidationEngine class
	 * @param {Object} [parameters={}]
	 * @param {Object} [parameters.schema] asn1js parsed value to initialize the class from
	 */
	constructor(parameters = {})
	{
		//region Internal properties of the object
		/**
		 * @type {Array.<Certificate>}
		 * @desc Array of pre-defined trusted (by user) certificates
		 */
		this.trustedCerts = getParametersValue(parameters, "trustedCerts", this.defaultValues("trustedCerts"));
		/**
		 * @type {Array.<Certificate>}
		 * @desc Array with certificate chain. Could be only one end-user certificate in there!
		 */
		this.certs = getParametersValue(parameters, "certs", this.defaultValues("certs"));
		/**
		 * @type {Array.<CertificateRevocationList>}
		 * @desc Array of all CRLs for all certificates from certificate chain
		 */
		this.crls = getParametersValue(parameters, "crls", this.defaultValues("crls"));
		/**
		 * @type {Array}
		 * @desc Array of all OCSP responses
		 */
		this.ocsps = getParametersValue(parameters, "ocsps", this.defaultValues("ocsps"));
		/**
		 * @type {Date}
		 * @desc The date at which the check would be
		 */
		this.checkDate = getParametersValue(parameters, "checkDate", this.defaultValues("checkDate"));
		/**
		 * @type {Function}
		 * @desc The date at which the check would be
		 */
		this.findOrigin = getParametersValue(parameters, "findOrigin", this.defaultValues("findOrigin"));
		/**
		 * @type {Function}
		 * @desc The date at which the check would be
		 */
		this.findIssuer = getParametersValue(parameters, "findIssuer", this.defaultValues("findIssuer"));
		//endregion
	}
	//**********************************************************************************
	static defaultFindOrigin(certificate, validationEngine)
	{
		//region Firstly encode TBS for certificate
		if(certificate.tbs.byteLength === 0)
			certificate.tbs = certificate.encodeTBS();
		//endregion
		
		//region Search in Intermediate Certificates
		for(const localCert of validationEngine.certs)
		{
			//region Firstly encode TBS for certificate
			if(localCert.tbs.byteLength === 0)
				localCert.tbs = localCert.encodeTBS();
			//endregion
			
			if(isEqualBuffer(certificate.tbs, localCert.tbs))
				return "Intermediate Certificates";
		}
		//endregion
		
		//region Search in Trusted Certificates
		for(const trustedCert of validationEngine.trustedCerts)
		{
			//region Firstly encode TBS for certificate
			if(trustedCert.tbs.byteLength === 0)
				trustedCert.tbs = trustedCert.encodeTBS();
			//endregion
			
			if(isEqualBuffer(certificate.tbs, trustedCert.tbs))
				return "Trusted Certificates";
		}
		//endregion
		
		return "Unknown";
	}
	//**********************************************************************************
	async defaultFindIssuer(certificate, validationEngine)
	{
		//region Initial variables
		let result = [];
		
		let keyIdentifier = null;
		
		let authorityCertIssuer = null;
		let authorityCertSerialNumber = null;
		//endregion
		
		//region Speed-up searching in case of self-signed certificates
		if(certificate.subject.isEqual(certificate.issuer))
		{
			try
			{
				const verificationResult = await certificate.verify();
				if(verificationResult === true)
					return [certificate];
			}
			catch(ex)
			{
			}
		}
		//endregion
		
		//region Find values to speed-up search
		if("extensions" in certificate)
		{
			for(const extension of certificate.extensions)
			{
				if(extension.extnID === "2.5.29.35") // AuthorityKeyIdentifier
				{
					if("keyIdentifier" in extension.parsedValue)
						keyIdentifier = extension.parsedValue.keyIdentifier;
					else
					{
						if("authorityCertIssuer" in extension.parsedValue)
							authorityCertIssuer = extension.parsedValue.authorityCertIssuer;
						
						if("authorityCertSerialNumber" in extension.parsedValue)
							authorityCertSerialNumber = extension.parsedValue.authorityCertSerialNumber;
					}
					
					break;
				}
			}
		}
		//endregion
		
		//region Aux function
		function checkCertificate(possibleIssuer)
		{
			//region Firstly search for appropriate extensions
			if(keyIdentifier !== null)
			{
				if("extensions" in possibleIssuer)
				{
					let extensionFound = false;
					
					for(const extension of possibleIssuer.extensions)
					{
						if(extension.extnID === "2.5.29.14") // SubjectKeyIdentifier
						{
							extensionFound = true;
							
							if(isEqualBuffer(extension.parsedValue.valueBlock.valueHex, keyIdentifier.valueBlock.valueHex))
								result.push(possibleIssuer);
							
							break;
						}
					}
					
					if(extensionFound)
						return;
				}
			}
			//endregion
			
			//region Now search for authorityCertSerialNumber
			let authorityCertSerialNumberEqual = false;
			
			if(authorityCertSerialNumber !== null)
				authorityCertSerialNumberEqual = possibleIssuer.serialNumber.isEqual(authorityCertSerialNumber);
			//endregion
			
			//region And at least search for Issuer data
			if(authorityCertIssuer !== null)
			{
				if(possibleIssuer.subject.isEqual(authorityCertIssuer))
				{
					if(authorityCertSerialNumberEqual)
						result.push(possibleIssuer);
				}
			}
			else
			{
				if(certificate.issuer.isEqual(possibleIssuer.subject))
					result.push(possibleIssuer);
			}
			//endregion
		}
		//endregion
		
		//region Search in Trusted Certificates
		for(const trustedCert of validationEngine.trustedCerts)
			checkCertificate(trustedCert);
		//endregion
		
		//region Search in Intermediate Certificates
		for(const intermediateCert of validationEngine.certs)
			checkCertificate(intermediateCert);
		//endregion
		
		//region Now perform certificate verification checking
		for(let i = 0; i < result.length; i++)
		{
			try
			{
				const verificationResult = await certificate.verify(result[i]);
				if(verificationResult === false)
					result.splice(i, 1);
			}
			catch(ex)
			{
				result.splice(i, 1); // Something wrong, remove the certificate
			}
		}
		//endregion
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Return default values for all class members
	 * @param {string} memberName String name for a class member
	 */
	defaultValues(memberName)
	{
		switch(memberName)
		{
			case "trustedCerts":
				return [];
			case "certs":
				return [];
			case "crls":
				return [];
			case "ocsps":
				return [];
			case "checkDate":
				return new Date();
			case "findOrigin":
				return CertificateChainValidationEngine.defaultFindOrigin;
			case "findIssuer":
				return this.defaultFindIssuer;
			default:
				throw new Error(`Invalid member name for CertificateChainValidationEngine class: ${memberName}`);
		}
	}
	//**********************************************************************************
	async sort(passedWhenNotRevValues = false)
	{
		//region Initial variables
		const localCerts = [];
		const _this = this;
		//endregion
		
		//region Building certificate path
		async function buildPath(certificate)
		{
			const result = [];
			
			//region Aux function checking array for unique elements
			function checkUnique(array)
			{
				let unique = true;
				
				for(let i = 0; i < array.length; i++)
				{
					for(let j = 0; j < array.length; j++)
					{
						if(j === i)
							continue;
						
						if(array[i] === array[j])
						{
							unique = false;
							break;
						}
					}
					
					if(!unique)
						break;
				}
				
				return unique;
			}
			
			//endregion
			
			const findIssuerResult = await _this.findIssuer(certificate, _this);
			if(findIssuerResult.length === 0)
				throw new Error("No valid certificate paths found");
			
			for(let i = 0; i < findIssuerResult.length; i++)
			{
				if(isEqualBuffer(findIssuerResult[i].tbs, certificate.tbs))
				{
					result.push([findIssuerResult[i]]);
					continue;
				}
				
				const buildPathResult = await buildPath(findIssuerResult[i]);
				
				for(let j = 0; j < buildPathResult.length; j++)
				{
					const copy = buildPathResult[j].slice();
					copy.splice(0, 0, findIssuerResult[i]);
					
					if(checkUnique(copy))
						result.push(copy);
					else
						result.push(buildPathResult[j]);
				}
			}
			
			return result;
		}
		//endregion
		
		//region Find CRL for specific certificate
		async function findCRL(certificate)
		{
			//region Initial variables
			const issuerCertificates = [];
			const crls = [];
			const crlsAndCertificates = [];
			//endregion
			
			//region Find all possible CRL issuers
			issuerCertificates.push(...localCerts.filter(element => certificate.issuer.isEqual(element.subject)));
			if(issuerCertificates.length === 0)
			{
				return {
					status: 1,
					statusMessage: "No certificate's issuers"
				};
			}
			//endregion
			
			//region Find all CRLs for certificate's issuer
			crls.push(..._this.crls.filter(element => element.issuer.isEqual(certificate.issuer)));
			if(crls.length === 0)
			{
				return {
					status: 2,
					statusMessage: "No CRLs for specific certificate issuer"
				};
			}
			//endregion
			
			//region Find specific certificate of issuer for each CRL
			for(let i = 0; i < crls.length; i++)
			{
				//region Check "nextUpdate" for the CRL
				// The "nextUpdate" is older than "checkDate".
				// Thus we should do have another, updated CRL.
				// Thus the CRL assumed to be invalid.
				if(crls[i].nextUpdate.value < _this.checkDate)
					continue;
				//endregion
				
				for(let j = 0; j < issuerCertificates.length; j++)
				{
					try
					{
						const result = await crls[i].verify({ issuerCertificate: issuerCertificates[j] });
						if(result)
						{
							crlsAndCertificates.push({
								crl: crls[i],
								certificate: issuerCertificates[j]
							});
							
							break;
						}
					}
					catch(ex)
					{
					}
				}
			}
			//endregion
			
			if(crlsAndCertificates.length)
			{
				return {
					status: 0,
					statusMessage: "",
					result: crlsAndCertificates
				};
			}
			
			return {
				status: 3,
				statusMessage: "No valid CRLs found"
			};
		}
		//endregion
		
		//region Find OCSP for specific certificate
		async function findOCSP(certificate, issuerCertificate)
		{
			//region Get hash algorithm from certificate
			const hashAlgorithm = getAlgorithmByOID(certificate.signatureAlgorithm.algorithmId);
			if(("name" in hashAlgorithm) === false)
				return 1;
			if(("hash" in hashAlgorithm) === false)
				return 1;
			//endregion
			
			//region Search for OCSP response for the certificate
			for(let i = 0; i < _this.ocsps.length; i++)
			{
				const result = await _this.ocsps[i].getCertificateStatus(certificate, issuerCertificate);
				if(result.isForCertificate)
				{
					if(result.status === 0)
						return 0;
					
					return 1;
				}
			}
			//endregion
			
			return 2;
		}
		//endregion
		
		//region Check for certificate to be CA
		async function checkForCA(certificate, needToCheckCRL = false)
		{
			//region Initial variables
			let isCA = false;
			let mustBeCA = false;
			let keyUsagePresent = false;
			let cRLSign = false;
			//endregion
			
			if("extensions" in certificate)
			{
				for(let j = 0; j < certificate.extensions.length; j++)
				{
					if((certificate.extensions[j].critical === true) &&
						(("parsedValue" in certificate.extensions[j]) === false))
					{
						return {
							result: false,
							resultCode: 6,
							resultMessage: `Unable to parse critical certificate extension: ${certificate.extensions[j].extnID}`
						};
					}
					
					if(certificate.extensions[j].extnID === "2.5.29.15") // KeyUsage
					{
						keyUsagePresent = true;
						
						const view = new Uint8Array(certificate.extensions[j].parsedValue.valueBlock.valueHex);
						
						if((view[0] & 0x04) === 0x04) // Set flag "keyCertSign"
							mustBeCA = true;
						
						if((view[0] & 0x02) === 0x02) // Set flag "cRLSign"
							cRLSign = true;
					}
					
					if(certificate.extensions[j].extnID === "2.5.29.19") // BasicConstraints
					{
						if("cA" in certificate.extensions[j].parsedValue)
						{
							if(certificate.extensions[j].parsedValue.cA === true)
								isCA = true;
						}
					}
				}
				
				if((mustBeCA === true) && (isCA === false))
				{
					return {
						result: false,
						resultCode: 3,
						resultMessage: "Unable to build certificate chain - using \"keyCertSign\" flag set without BasicConstaints"
					};
				}
				
				if((keyUsagePresent === true) && (isCA === true) && (mustBeCA === false))
				{
					return {
						result: false,
						resultCode: 4,
						resultMessage: "Unable to build certificate chain - \"keyCertSign\" flag was not set"
					};
				}
				
				// noinspection OverlyComplexBooleanExpressionJS
				if((isCA === true) && (keyUsagePresent === true) && ((needToCheckCRL) && (cRLSign === false)))
				{
					return {
						result: false,
						resultCode: 5,
						resultMessage: "Unable to build certificate chain - intermediate certificate must have \"cRLSign\" key usage flag"
					};
				}
			}
			
			if(isCA === false)
			{
				return {
					result: false,
					resultCode: 7,
					resultMessage: "Unable to build certificate chain - more than one possible end-user certificate"
				};
			}
			
			return {
				result: true,
				resultCode: 0,
				resultMessage: ""
			};
		}
		//endregion
		
		//region Basic check for certificate path
		async function basicCheck(path, checkDate)
		{
			//region Check that all dates are valid
			for(let i = 0; i < path.length; i++)
			{
				if((path[i].notBefore.value > checkDate) ||
					(path[i].notAfter.value < checkDate))
				{
					return {
						result: false,
						resultCode: 8,
						resultMessage: "The certificate is either not yet valid or expired"
					};
				}
			}
			//endregion
			
			//region Check certificate name chain
			
			// We should have at least two certificates: end entity and trusted root
			if(path.length < 2)
			{
				return {
					result: false,
					resultCode: 9,
					resultMessage: "Too short certificate path"
				};
			}
			
			for(let i = (path.length - 2); i >= 0; i--)
			{
				//region Check that we do not have a "self-signed" certificate
				if(path[i].issuer.isEqual(path[i].subject) === false)
				{
					if(path[i].issuer.isEqual(path[i + 1].subject) === false)
					{
						return {
							result: false,
							resultCode: 10,
							resultMessage: "Incorrect name chaining"
						};
					}
				}
				//endregion
			}
			//endregion
			
			//region Check each certificate (except "trusted root") to be non-revoked
			if((_this.crls.length !== 0) || (_this.ocsps.length !== 0)) // If CRLs and OCSPs are empty then we consider all certificates to be valid
			{
				for(let i = 0; i < (path.length - 1); i++)
				{
					//region Initial variables
					let ocspResult = 2;
					let crlResult = {
						status: 0,
						statusMessage: ""
					};
					//endregion
					
					//region Check OCSPs first
					if(_this.ocsps.length !== 0)
					{
						ocspResult = await findOCSP(path[i], path[i + 1]);
						
						switch(ocspResult)
						{
							case 0:
								continue;
							case 1:
								return {
									result: false,
									resultCode: 12,
									resultMessage: "One of certificates was revoked via OCSP response"
								};
							case 2: // continue to check the certificate with CRL
								break;
							default:
						}
					}
					//endregion
					
					//region Check CRLs
					if(_this.crls.length !== 0)
					{
						crlResult = await findCRL(path[i]);

						if(crlResult.status === 0)
						{
							for(let j = 0; j < crlResult.result.length; j++)
							{
								//region Check that the CRL issuer certificate have not been revoked
								const isCertificateRevoked = crlResult.result[j].crl.isCertificateRevoked(path[i]);
								if(isCertificateRevoked)
								{
									return {
										result: false,
										resultCode: 12,
										resultMessage: "One of certificates had been revoked"
									};
								}
								//endregion

								//region Check that the CRL issuer certificate is a CA certificate
								const isCertificateCA = await checkForCA(crlResult.result[j].certificate, true);
								if(isCertificateCA.result === false)
								{
									return {
										result: false,
										resultCode: 13,
										resultMessage: "CRL issuer certificate is not a CA certificate or does not have crlSign flag"
									};
								}
								//endregion
							}
						}
						else
						{
							if(passedWhenNotRevValues === false)
							{
								throw {
									result: false,
									resultCode: 11,
									resultMessage: `No revocation values found for one of certificates: ${crlResult.statusMessage}`
								};
							}
						}
					}
					else
					{
						if(ocspResult === 2)
						{
							return {
								result: false,
								resultCode: 11,
								resultMessage: "No revocation values found for one of certificates"
							};
						}
					}
					//endregion

					//region Check we do have links to revocation values inside issuer's certificate
					if((ocspResult === 2) && (crlResult.status === 2) && passedWhenNotRevValues)
					{
						const issuerCertificate = path[i + 1];
						let extensionFound = false;

						if("extensions" in issuerCertificate)
						{
							for(const extension of issuerCertificate.extensions)
							{
								switch(extension.extnID)
								{
									case "2.5.29.31": // CRLDistributionPoints
									case "2.5.29.46": // FreshestCRL
									case "1.3.6.1.5.5.7.1.1": // AuthorityInfoAccess
										extensionFound = true;
										break;
									default:
								}
							}
						}

						if(extensionFound)
						{
							throw {
								result: false,
								resultCode: 11,
								resultMessage: `No revocation values found for one of certificates: ${crlResult.statusMessage}`
							};
						}
					}
					//endregion
				}
			}
			//endregion
			
			//region Check each certificate (except "end entity") in the path to be a CA certificate
			for(let i = 1; i < path.length; i++)
			{
				const result = await checkForCA(path[i]);
				if(result.result === false)
				{
					return {
						result: false,
						resultCode: 14,
						resultMessage: "One of intermediate certificates is not a CA certificate"
					};
				}
			}
			//endregion
			
			return {
				result: true
			};
		}
		//endregion
		
		//region Do main work
		//region Initialize "localCerts" by value of "_this.certs" + "_this.trustedCerts" arrays
		localCerts.push(..._this.trustedCerts);
		localCerts.push(..._this.certs);
		//endregion
		
		//region Check all certificates for been unique
		for(let i = 0; i < localCerts.length; i++)
		{
			for(let j = 0; j < localCerts.length; j++)
			{
				if(i === j)
					continue;
				
				if(isEqualBuffer(localCerts[i].tbs, localCerts[j].tbs))
				{
					localCerts.splice(j, 1);
					i = 0;
					break;
				}
			}
		}
		//endregion
		
		//region Initial variables
		let result;
		const certificatePath = [localCerts[localCerts.length - 1]]; // The "end entity" certificate must be the least in "certs" array
		//endregion
		
		//region Build path for "end entity" certificate
		result = await buildPath(localCerts[localCerts.length - 1]);
		if(result.length === 0)
		{
			return {
				result: false,
				resultCode: 60,
				resultMessage: "Unable to find certificate path"
			};
		}
		//endregion
		
		//region Exclude certificate paths not ended with "trusted roots"
		for(let i = 0; i < result.length; i++)
		{
			let found = false;
			
			for(let j = 0; j < (result[i]).length; j++)
			{
				const certificate = (result[i])[j];
				
				for(let k = 0; k < _this.trustedCerts.length; k++)
				{
					if(isEqualBuffer(certificate.tbs, _this.trustedCerts[k].tbs))
					{
						found = true;
						break;
					}
				}
				
				if(found)
					break;
			}
			
			if(!found)
			{
				result.splice(i, 1);
				i = 0;
			}
		}
		
		if(result.length === 0)
		{
			throw {
				result: false,
				resultCode: 97,
				resultMessage: "No valid certificate paths found"
			};
		}
		//endregion
		
		//region Find shortest certificate path (for the moment it is the only criteria)
		let shortestLength = result[0].length;
		let shortestIndex = 0;
		
		for(let i = 0; i < result.length; i++)
		{
			if(result[i].length < shortestLength)
			{
				shortestLength = result[i].length;
				shortestIndex = i;
			}
		}
		//endregion
		
		//region Create certificate path for basic check
		for(let i = 0; i < result[shortestIndex].length; i++)
			certificatePath.push((result[shortestIndex])[i]);
		//endregion
		
		//region Perform basic checking for all certificates in the path
		result = await basicCheck(certificatePath, _this.checkDate);
		if(result.result === false)
			throw result;
		//endregion
		
		return certificatePath;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Major verification function for certificate chain.
	 * @param {{initialPolicySet, initialExplicitPolicy, initialPolicyMappingInhibit, initialInhibitPolicy, initialPermittedSubtreesSet, initialExcludedSubtreesSet, initialRequiredNameForms}} [parameters]
	 * @returns {Promise}
	 */
	async verify(parameters = {})
	{
		//region Auxiliary functions for name constraints checking
		function compareDNSName(name, constraint)
		{
			/// <summary>Compare two dNSName values</summary>
			/// <param name="name" type="String">DNS from name</param>
			/// <param name="constraint" type="String">Constraint for DNS from name</param>
			/// <returns type="Boolean">Boolean result - valid or invalid the "name" against the "constraint"</returns>
			
			//region Make a "string preparation" for both name and constrain
			const namePrepared = stringPrep(name);
			const constraintPrepared = stringPrep(constraint);
			//endregion
			
			//region Make a "splitted" versions of "constraint" and "name"
			const nameSplitted = namePrepared.split(".");
			const constraintSplitted = constraintPrepared.split(".");
			//endregion
			
			//region Length calculation and additional check
			const nameLen = nameSplitted.length;
			const constrLen = constraintSplitted.length;
			
			if((nameLen === 0) || (constrLen === 0) || (nameLen < constrLen))
				return false;
			//endregion
			
			//region Check that no part of "name" has zero length
			for(let i = 0; i < nameLen; i++)
			{
				if(nameSplitted[i].length === 0)
					return false;
			}
			//endregion
			
			//region Check that no part of "constraint" has zero length
			for(let i = 0; i < constrLen; i++)
			{
				if(constraintSplitted[i].length === 0)
				{
					if(i === 0)
					{
						if(constrLen === 1)
							return false;
						
						continue;
					}
					
					return false;
				}
			}
			//endregion
			
			//region Check that "name" has a tail as "constraint"
			
			for(let i = 0; i < constrLen; i++)
			{
				if(constraintSplitted[constrLen - 1 - i].length === 0)
					continue;
				
				if(nameSplitted[nameLen - 1 - i].localeCompare(constraintSplitted[constrLen - 1 - i]) !== 0)
					return false;
			}
			//endregion
			
			return true;
		}
		
		function compareRFC822Name(name, constraint)
		{
			/// <summary>Compare two rfc822Name values</summary>
			/// <param name="name" type="String">E-mail address from name</param>
			/// <param name="constraint" type="String">Constraint for e-mail address from name</param>
			/// <returns type="Boolean">Boolean result - valid or invalid the "name" against the "constraint"</returns>
			
			//region Make a "string preparation" for both name and constrain
			const namePrepared = stringPrep(name);
			const constraintPrepared = stringPrep(constraint);
			//endregion
			
			//region Make a "splitted" versions of "constraint" and "name"
			const nameSplitted = namePrepared.split("@");
			const constraintSplitted = constraintPrepared.split("@");
			//endregion
			
			//region Splitted array length checking
			if((nameSplitted.length === 0) || (constraintSplitted.length === 0) || (nameSplitted.length < constraintSplitted.length))
				return false;
			//endregion
			
			if(constraintSplitted.length === 1)
			{
				const result = compareDNSName(nameSplitted[1], constraintSplitted[0]);
				
				if(result)
				{
					//region Make a "splitted" versions of domain name from "constraint" and "name"
					const ns = nameSplitted[1].split(".");
					const cs = constraintSplitted[0].split(".");
					//endregion
					
					if(cs[0].length === 0)
						return true;
					
					return ns.length === cs.length;
				}
				
				return false;
			}
			
			return (namePrepared.localeCompare(constraintPrepared) === 0);
		}
		
		function compareUniformResourceIdentifier(name, constraint)
		{
			/// <summary>Compare two uniformResourceIdentifier values</summary>
			/// <param name="name" type="String">uniformResourceIdentifier from name</param>
			/// <param name="constraint" type="String">Constraint for uniformResourceIdentifier from name</param>
			/// <returns type="Boolean">Boolean result - valid or invalid the "name" against the "constraint"</returns>
			
			//region Make a "string preparation" for both name and constrain
			let namePrepared = stringPrep(name);
			const constraintPrepared = stringPrep(constraint);
			//endregion
			
			//region Find out a major URI part to compare with
			const ns = namePrepared.split("/");
			const cs = constraintPrepared.split("/");
			
			if(cs.length > 1) // Malformed constraint
				return false;
			
			if(ns.length > 1) // Full URI string
			{
				for(let i = 0; i < ns.length; i++)
				{
					if((ns[i].length > 0) && (ns[i].charAt(ns[i].length - 1) !== ":"))
					{
						const nsPort = ns[i].split(":");
						namePrepared = nsPort[0];
						break;
					}
				}
			}
			//endregion
			
			const result = compareDNSName(namePrepared, constraintPrepared);
			
			if(result)
			{
				//region Make a "splitted" versions of "constraint" and "name"
				const nameSplitted = namePrepared.split(".");
				const constraintSplitted = constraintPrepared.split(".");
				//endregion
				
				if(constraintSplitted[0].length === 0)
					return true;
				
				return nameSplitted.length === constraintSplitted.length;
			}
			
			return false;
		}
		
		function compareIPAddress(name, constraint)
		{
			/// <summary>Compare two iPAddress values</summary>
			/// <param name="name" type="in_window.org.pkijs.asn1.OCTETSTRING">iPAddress from name</param>
			/// <param name="constraint" type="in_window.org.pkijs.asn1.OCTETSTRING">Constraint for iPAddress from name</param>
			/// <returns type="Boolean">Boolean result - valid or invalid the "name" against the "constraint"</returns>
			
			//region Common variables
			const nameView = new Uint8Array(name.valueBlock.valueHex);
			const constraintView = new Uint8Array(constraint.valueBlock.valueHex);
			//endregion
			
			//region Work with IPv4 addresses
			if((nameView.length === 4) && (constraintView.length === 8))
			{
				for(let i = 0; i < 4; i++)
				{
					if((nameView[i] ^ constraintView[i]) & constraintView[i + 4])
						return false;
				}
				
				return true;
			}
			//endregion
			
			//region Work with IPv6 addresses
			if((nameView.length === 16) && (constraintView.length === 32))
			{
				for(let i = 0; i < 16; i++)
				{
					if((nameView[i] ^ constraintView[i]) & constraintView[i + 16])
						return false;
				}
				
				return true;
			}
			//endregion
			
			return false;
		}
		
		function compareDirectoryName(name, constraint)
		{
			/// <summary>Compare two directoryName values</summary>
			/// <param name="name" type="in_window.org.pkijs.simpl.RDN">directoryName from name</param>
			/// <param name="constraint" type="in_window.org.pkijs.simpl.RDN">Constraint for directoryName from name</param>
			/// <param name="any" type="Boolean">Boolean flag - should be comparision interrupted after first match or we need to match all "constraints" parts</param>
			/// <returns type="Boolean">Boolean result - valid or invalid the "name" against the "constraint"</returns>
			
			//region Initial check
			if((name.typesAndValues.length === 0) || (constraint.typesAndValues.length === 0))
				return true;
			
			if(name.typesAndValues.length < constraint.typesAndValues.length)
				return false;
			//endregion
			
			//region Initial variables
			let result = true;
			let nameStart = 0;
			//endregion
			
			for(let i = 0; i < constraint.typesAndValues.length; i++)
			{
				let localResult = false;
				
				for(let j = nameStart; j < name.typesAndValues.length; j++)
				{
					localResult = name.typesAndValues[j].isEqual(constraint.typesAndValues[i]);
					
					if(name.typesAndValues[j].type === constraint.typesAndValues[i].type)
						result = result && localResult;
					
					if(localResult === true)
					{
						if((nameStart === 0) || (nameStart === j))
						{
							nameStart = j + 1;
							break;
						}
						else // Structure of "name" must be the same with "constraint"
							return false;
					}
				}
				
				if(localResult === false)
					return false;
			}
			
			return (nameStart === 0) ? false : result;
		}
		//endregion

		try
		{
			//region Initial checks
			if(this.certs.length === 0)
				throw "Empty certificate array";
			//endregion
			
			//region Get input variables
			let passedWhenNotRevValues = false;

			if("passedWhenNotRevValues" in parameters)
				passedWhenNotRevValues = parameters.passedWhenNotRevValues;

			let initialPolicySet = [];
			initialPolicySet.push("2.5.29.32.0"); // "anyPolicy"
			
			let initialExplicitPolicy = false;
			let initialPolicyMappingInhibit = false;
			let initialInhibitPolicy = false;
			
			let initialPermittedSubtreesSet = []; // Array of "simpl.x509.GeneralSubtree"
			let initialExcludedSubtreesSet = [];  // Array of "simpl.x509.GeneralSubtree"
			let initialRequiredNameForms = [];    // Array of "simpl.x509.GeneralSubtree"
			
			if("initialPolicySet" in parameters)
				initialPolicySet = parameters.initialPolicySet;
			
			if("initialExplicitPolicy" in parameters)
				initialExplicitPolicy = parameters.initialExplicitPolicy;
			
			if("initialPolicyMappingInhibit" in parameters)
				initialPolicyMappingInhibit = parameters.initialPolicyMappingInhibit;
			
			if("initialInhibitPolicy" in parameters)
				initialInhibitPolicy = parameters.initialInhibitPolicy;
			
			if("initialPermittedSubtreesSet" in parameters)
				initialPermittedSubtreesSet = parameters.initialPermittedSubtreesSet;
			
			if("initialExcludedSubtreesSet" in parameters)
				initialExcludedSubtreesSet = parameters.initialExcludedSubtreesSet;
			
			if("initialRequiredNameForms" in parameters)
				initialRequiredNameForms = parameters.initialRequiredNameForms;
			
			let explicitPolicyIndicator = initialExplicitPolicy;
			let policyMappingInhibitIndicator = initialPolicyMappingInhibit;
			let inhibitAnyPolicyIndicator = initialInhibitPolicy;
			
			const pendingConstraints = new Array(3);
			pendingConstraints[0] = false; // For "explicitPolicyPending"
			pendingConstraints[1] = false; // For "policyMappingInhibitPending"
			pendingConstraints[2] = false; // For "inhibitAnyPolicyPending"
			
			let explicitPolicyPending = 0;
			let policyMappingInhibitPending = 0;
			let inhibitAnyPolicyPending = 0;
			
			let permittedSubtrees = initialPermittedSubtreesSet;
			let excludedSubtrees = initialExcludedSubtreesSet;
			const requiredNameForms = initialRequiredNameForms;
			
			let pathDepth = 1;
			//endregion
			
			//region Sorting certificates in the chain array
			this.certs = await this.sort(passedWhenNotRevValues);
			//endregion
			
			//region Work with policies
			//region Support variables
			const allPolicies = []; // Array of all policies (string values)
			allPolicies.push("2.5.29.32.0"); // Put "anyPolicy" at first place
			
			const policiesAndCerts = []; // In fact "array of array" where rows are for each specific policy, column for each certificate and value is "true/false"
			
			const anyPolicyArray = new Array(this.certs.length - 1); // Minus "trusted anchor"
			for(let ii = 0; ii < (this.certs.length - 1); ii++)
				anyPolicyArray[ii] = true;
			
			policiesAndCerts.push(anyPolicyArray);
			
			const policyMappings = new Array(this.certs.length - 1); // Array of "PolicyMappings" for each certificate
			const certPolicies = new Array(this.certs.length - 1); // Array of "CertificatePolicies" for each certificate
			
			let explicitPolicyStart = (explicitPolicyIndicator) ? (this.certs.length - 1) : (-1);
			//endregion
			
			//region Gather all neccessary information from certificate chain
			for(let i = (this.certs.length - 2); i >= 0; i--, pathDepth++)
			{
				if("extensions" in this.certs[i])
				{
					//region Get information about certificate extensions
					for(let j = 0; j < this.certs[i].extensions.length; j++)
					{
						//region CertificatePolicies
						if(this.certs[i].extensions[j].extnID === "2.5.29.32")
						{
							certPolicies[i] = this.certs[i].extensions[j].parsedValue;
							
							//region Remove entry from "anyPolicies" for the certificate
							for(let s = 0; s < allPolicies.length; s++)
							{
								if(allPolicies[s] === "2.5.29.32.0")
								{
									delete (policiesAndCerts[s])[i];
									break;
								}
							}
							//endregion
							
							for(let k = 0; k < this.certs[i].extensions[j].parsedValue.certificatePolicies.length; k++)
							{
								let policyIndex = (-1);
								
								//region Try to find extension in "allPolicies" array
								for(let s = 0; s < allPolicies.length; s++)
								{
									if(this.certs[i].extensions[j].parsedValue.certificatePolicies[k].policyIdentifier === allPolicies[s])
									{
										policyIndex = s;
										break;
									}
								}
								//endregion
								
								if(policyIndex === (-1))
								{
									allPolicies.push(this.certs[i].extensions[j].parsedValue.certificatePolicies[k].policyIdentifier);
									
									const certArray = new Array(this.certs.length - 1);
									certArray[i] = true;
									
									policiesAndCerts.push(certArray);
								}
								else
									(policiesAndCerts[policyIndex])[i] = true;
							}
						}
						//endregion
						
						//region PolicyMappings
						if(this.certs[i].extensions[j].extnID === "2.5.29.33")
						{
							if(policyMappingInhibitIndicator)
							{
								return {
									result: false,
									resultCode: 98,
									resultMessage: "Policy mapping prohibited"
								};
							}
							
							policyMappings[i] = this.certs[i].extensions[j].parsedValue;
						}
						//endregion
						
						//region PolicyConstraints
						if(this.certs[i].extensions[j].extnID === "2.5.29.36")
						{
							if(explicitPolicyIndicator === false)
							{
								//region requireExplicitPolicy
								if(this.certs[i].extensions[j].parsedValue.requireExplicitPolicy === 0)
								{
									explicitPolicyIndicator = true;
									explicitPolicyStart = i;
								}
								else
								{
									if(pendingConstraints[0] === false)
									{
										pendingConstraints[0] = true;
										explicitPolicyPending = this.certs[i].extensions[j].parsedValue.requireExplicitPolicy;
									}
									else
										explicitPolicyPending = (explicitPolicyPending > this.certs[i].extensions[j].parsedValue.requireExplicitPolicy) ? this.certs[i].extensions[j].parsedValue.requireExplicitPolicy : explicitPolicyPending;
								}
								//endregion
								
								//region inhibitPolicyMapping
								if(this.certs[i].extensions[j].parsedValue.inhibitPolicyMapping === 0)
									policyMappingInhibitIndicator = true;
								else
								{
									if(pendingConstraints[1] === false)
									{
										pendingConstraints[1] = true;
										policyMappingInhibitPending = this.certs[i].extensions[j].parsedValue.inhibitPolicyMapping + 1;
									}
									else
										policyMappingInhibitPending = (policyMappingInhibitPending > (this.certs[i].extensions[j].parsedValue.inhibitPolicyMapping + 1)) ? (this.certs[i].extensions[j].parsedValue.inhibitPolicyMapping + 1) : policyMappingInhibitPending;
								}
								//endregion
							}
						}
						//endregion
						
						//region InhibitAnyPolicy
						if(this.certs[i].extensions[j].extnID === "2.5.29.54")
						{
							if(inhibitAnyPolicyIndicator === false)
							{
								if(this.certs[i].extensions[j].parsedValue.valueBlock.valueDec === 0)
									inhibitAnyPolicyIndicator = true;
								else
								{
									if(pendingConstraints[2] === false)
									{
										pendingConstraints[2] = true;
										inhibitAnyPolicyPending = this.certs[i].extensions[j].parsedValue.valueBlock.valueDec;
									}
									else
										inhibitAnyPolicyPending = (inhibitAnyPolicyPending > this.certs[i].extensions[j].parsedValue.valueBlock.valueDec) ? this.certs[i].extensions[j].parsedValue.valueBlock.valueDec : inhibitAnyPolicyPending;
								}
							}
						}
						//endregion
					}
					//endregion
					
					//region Check "inhibitAnyPolicyIndicator"
					if(inhibitAnyPolicyIndicator === true)
					{
						let policyIndex = (-1);
						
						//region Find "anyPolicy" index
						for(let searchAnyPolicy = 0; searchAnyPolicy < allPolicies.length; searchAnyPolicy++)
						{
							if(allPolicies[searchAnyPolicy] === "2.5.29.32.0")
							{
								policyIndex = searchAnyPolicy;
								break;
							}
						}
						//endregion
						
						if(policyIndex !== (-1))
							delete (policiesAndCerts[0])[i]; // Unset value to "undefined" for "anyPolicies" value for current certificate
					}
					//endregion
					
					//region Process with "pending constraints"
					if(explicitPolicyIndicator === false)
					{
						if(pendingConstraints[0] === true)
						{
							explicitPolicyPending--;
							if(explicitPolicyPending === 0)
							{
								explicitPolicyIndicator = true;
								explicitPolicyStart = i;
								
								pendingConstraints[0] = false;
							}
						}
					}
					
					if(policyMappingInhibitIndicator === false)
					{
						if(pendingConstraints[1] === true)
						{
							policyMappingInhibitPending--;
							if(policyMappingInhibitPending === 0)
							{
								policyMappingInhibitIndicator = true;
								pendingConstraints[1] = false;
							}
						}
					}
					
					if(inhibitAnyPolicyIndicator === false)
					{
						if(pendingConstraints[2] === true)
						{
							inhibitAnyPolicyPending--;
							if(inhibitAnyPolicyPending === 0)
							{
								inhibitAnyPolicyIndicator = true;
								pendingConstraints[2] = false;
							}
						}
					}
					//endregion
				}
			}
			//endregion
			
			//region Working with policy mappings
			for(let i = 0; i < (this.certs.length - 1); i++)
			{
				//region Check that there is "policy mapping" for level "i + 1"
				if((i < (this.certs.length - 2)) && (typeof policyMappings[i + 1] !== "undefined"))
				{
					for(let k = 0; k < policyMappings[i + 1].mappings.length; k++)
					{
						//region Check that we do not have "anyPolicy" in current mapping
						if((policyMappings[i + 1].mappings[k].issuerDomainPolicy === "2.5.29.32.0") || (policyMappings[i + 1].mappings[k].subjectDomainPolicy === "2.5.29.32.0"))
						{
							return {
								result: false,
								resultCode: 99,
								resultMessage: "The \"anyPolicy\" should not be a part of policy mapping scheme"
							};
						}
						//endregion
						
						//region Initial variables
						let issuerDomainPolicyIndex = (-1);
						let subjectDomainPolicyIndex = (-1);
						//endregion
						
						//region Search for index of policies indedes
						for(let n = 0; n < allPolicies.length; n++)
						{
							if(allPolicies[n] === policyMappings[i + 1].mappings[k].issuerDomainPolicy)
								issuerDomainPolicyIndex = n;
							
							if(allPolicies[n] === policyMappings[i + 1].mappings[k].subjectDomainPolicy)
								subjectDomainPolicyIndex = n;
						}
						//endregion
						
						//region Delete existing "issuerDomainPolicy" because on the level we mapped the policy to another one
						if(typeof (policiesAndCerts[issuerDomainPolicyIndex])[i] !== "undefined")
							delete (policiesAndCerts[issuerDomainPolicyIndex])[i];
						//endregion
						
						//region Check all policies for the certificate
						for(let j = 0; j < certPolicies[i].certificatePolicies.length; j++)
						{
							if(policyMappings[i + 1].mappings[k].subjectDomainPolicy === certPolicies[i].certificatePolicies[j].policyIdentifier)
							{
								//region Set mapped policy for current certificate
								if((issuerDomainPolicyIndex !== (-1)) && (subjectDomainPolicyIndex !== (-1)))
								{
									for(let m = 0; m <= i; m++)
									{
										if(typeof (policiesAndCerts[subjectDomainPolicyIndex])[m] !== "undefined")
										{
											(policiesAndCerts[issuerDomainPolicyIndex])[m] = true;
											delete (policiesAndCerts[subjectDomainPolicyIndex])[m];
										}
									}
								}
								//endregion
							}
						}
						//endregion
					}
				}
				//endregion
			}
			//endregion
			
			//region Working with "explicitPolicyIndicator" and "anyPolicy"
			for(let i = 0; i < allPolicies.length; i++)
			{
				if(allPolicies[i] === "2.5.29.32.0")
				{
					for(let j = 0; j < explicitPolicyStart; j++)
						delete (policiesAndCerts[i])[j];
				}
			}
			//endregion
			
			//region Create "set of authorities-constrained policies"
			const authConstrPolicies = [];
			
			for(let i = 0; i < policiesAndCerts.length; i++)
			{
				let found = true;
				
				for(let j = 0; j < (this.certs.length - 1); j++)
				{
					let anyPolicyFound = false;
					
					if((j < explicitPolicyStart) && (allPolicies[i] === "2.5.29.32.0") && (allPolicies.length > 1))
					{
						found = false;
						break;
					}
					
					if(typeof (policiesAndCerts[i])[j] === "undefined")
					{
						if(j >= explicitPolicyStart)
						{
							//region Search for "anyPolicy" in the policy set
							for(let k = 0; k < allPolicies.length; k++)
							{
								if(allPolicies[k] === "2.5.29.32.0")
								{
									if((policiesAndCerts[k])[j] === true)
										anyPolicyFound = true;
									
									break;
								}
							}
							//endregion
						}
						
						if(!anyPolicyFound)
						{
							found = false;
							break;
						}
					}
				}
				
				if(found === true)
					authConstrPolicies.push(allPolicies[i]);
			}
			//endregion
			
			//region Create "set of user-constrained policies"
			let userConstrPolicies = [];
			
			if((initialPolicySet.length === 1) && (initialPolicySet[0] === "2.5.29.32.0") && (explicitPolicyIndicator === false))
				userConstrPolicies = initialPolicySet;
			else
			{
				if((authConstrPolicies.length === 1) && (authConstrPolicies[0] === "2.5.29.32.0"))
					userConstrPolicies = initialPolicySet;
				else
				{
					for(let i = 0; i < authConstrPolicies.length; i++)
					{
						for(let j = 0; j < initialPolicySet.length; j++)
						{
							if((initialPolicySet[j] === authConstrPolicies[i]) || (initialPolicySet[j] === "2.5.29.32.0"))
							{
								userConstrPolicies.push(authConstrPolicies[i]);
								break;
							}
						}
					}
				}
			}
			//endregion
			
			//region Combine output object
			const policyResult = {
				result: (userConstrPolicies.length > 0),
				resultCode: 0,
				resultMessage: (userConstrPolicies.length > 0) ? "" : "Zero \"userConstrPolicies\" array, no intersections with \"authConstrPolicies\"",
				authConstrPolicies,
				userConstrPolicies,
				explicitPolicyIndicator,
				policyMappings,
				certificatePath: this.certs
			};
			
			if(userConstrPolicies.length === 0)
				return policyResult;
			//endregion
			//endregion
			
			//region Work with name constraints
			//region Check a result from "policy checking" part
			if(policyResult.result === false)
				return policyResult;
			//endregion
			
			//region Check all certificates, excluding "trust anchor"
			pathDepth = 1;
			
			for(let i = (this.certs.length - 2); i >= 0; i--, pathDepth++)
			{
				//region Support variables
				let subjectAltNames = [];
				
				let certPermittedSubtrees = [];
				let certExcludedSubtrees = [];
				//endregion
				
				if("extensions" in this.certs[i])
				{
					for(let j = 0; j < this.certs[i].extensions.length; j++)
					{
						//region NameConstraints
						if(this.certs[i].extensions[j].extnID === "2.5.29.30")
						{
							if("permittedSubtrees" in this.certs[i].extensions[j].parsedValue)
								certPermittedSubtrees = certPermittedSubtrees.concat(this.certs[i].extensions[j].parsedValue.permittedSubtrees);
							
							if("excludedSubtrees" in this.certs[i].extensions[j].parsedValue)
								certExcludedSubtrees = certExcludedSubtrees.concat(this.certs[i].extensions[j].parsedValue.excludedSubtrees);
						}
						//endregion
						
						//region SubjectAltName
						if(this.certs[i].extensions[j].extnID === "2.5.29.17")
							subjectAltNames = subjectAltNames.concat(this.certs[i].extensions[j].parsedValue.altNames);
						//endregion
					}
				}
				
				//region Checking for "required name forms"
				let formFound = (requiredNameForms.length <= 0);
				
				for(let j = 0; j < requiredNameForms.length; j++)
				{
					switch(requiredNameForms[j].base.type)
					{
						case 4: // directoryName
						{
							if(requiredNameForms[j].base.value.typesAndValues.length !== this.certs[i].subject.typesAndValues.length)
								continue;
							
							formFound = true;
							
							for(let k = 0; k < this.certs[i].subject.typesAndValues.length; k++)
							{
								if(this.certs[i].subject.typesAndValues[k].type !== requiredNameForms[j].base.value.typesAndValues[k].type)
								{
									formFound = false;
									break;
								}
							}
							
							if(formFound === true)
								break;
						}
							break;
						default: // ??? Probably here we should reject the certificate ???
					}
				}
				
				if(formFound === false)
				{
					policyResult.result = false;
					policyResult.resultCode = 21;
					policyResult.resultMessage = "No neccessary name form found";
					
					throw policyResult;
				}
				//endregion
				
				//region Checking for "permited sub-trees"
				//region Make groups for all types of constraints
				const constrGroups = []; // Array of array for groupped constraints
				constrGroups[0] = []; // rfc822Name
				constrGroups[1] = []; // dNSName
				constrGroups[2] = []; // directoryName
				constrGroups[3] = []; // uniformResourceIdentifier
				constrGroups[4] = []; // iPAddress
				
				for(let j = 0; j < permittedSubtrees.length; j++)
				{
					switch(permittedSubtrees[j].base.type)
					{
						//region rfc822Name
						case 1:
							constrGroups[0].push(permittedSubtrees[j]);
							break;
						//endregion
						//region dNSName
						case 2:
							constrGroups[1].push(permittedSubtrees[j]);
							break;
						//endregion
						//region directoryName
						case 4:
							constrGroups[2].push(permittedSubtrees[j]);
							break;
						//endregion
						//region uniformResourceIdentifier
						case 6:
							constrGroups[3].push(permittedSubtrees[j]);
							break;
						//endregion
						//region iPAddress
						case 7:
							constrGroups[4].push(permittedSubtrees[j]);
							break;
						//endregion
						//region default
						default:
						//endregion
					}
				}
				//endregion
				
				//region Check name constraints groupped by type, one-by-one
				for(let p = 0; p < 5; p++)
				{
					let groupPermitted = false;
					let valueExists = false;
					const group = constrGroups[p];
					
					for(let j = 0; j < group.length; j++)
					{
						switch(p)
						{
							//region rfc822Name
							case 0:
								if(subjectAltNames.length > 0)
								{
									for(let k = 0; k < subjectAltNames.length; k++)
									{
										if(subjectAltNames[k].type === 1) // rfc822Name
										{
											valueExists = true;
											groupPermitted = groupPermitted || compareRFC822Name(subjectAltNames[k].value, group[j].base.value);
										}
									}
								}
								else // Try to find out "emailAddress" inside "subject"
								{
									for(let k = 0; k < this.certs[i].subject.typesAndValues.length; k++)
									{
										if((this.certs[i].subject.typesAndValues[k].type === "1.2.840.113549.1.9.1") ||    // PKCS#9 e-mail address
											(this.certs[i].subject.typesAndValues[k].type === "0.9.2342.19200300.100.1.3")) // RFC1274 "rfc822Mailbox" e-mail address
										{
											valueExists = true;
											groupPermitted = groupPermitted || compareRFC822Name(this.certs[i].subject.typesAndValues[k].value.valueBlock.value, group[j].base.value);
										}
									}
								}
								break;
							//endregion
							//region dNSName
							case 1:
								if(subjectAltNames.length > 0)
								{
									for(let k = 0; k < subjectAltNames.length; k++)
									{
										if(subjectAltNames[k].type === 2) // dNSName
										{
											valueExists = true;
											groupPermitted = groupPermitted || compareDNSName(subjectAltNames[k].value, group[j].base.value);
										}
									}
								}
								break;
							//endregion
							//region directoryName
							case 2:
								valueExists = true;
								groupPermitted = compareDirectoryName(this.certs[i].subject, group[j].base.value);
								break;
							//endregion
							//region uniformResourceIdentifier
							case 3:
								if(subjectAltNames.length > 0)
								{
									for(let k = 0; k < subjectAltNames.length; k++)
									{
										if(subjectAltNames[k].type === 6) // uniformResourceIdentifier
										{
											valueExists = true;
											groupPermitted = groupPermitted || compareUniformResourceIdentifier(subjectAltNames[k].value, group[j].base.value);
										}
									}
								}
								break;
							//endregion
							//region iPAddress
							case 4:
								if(subjectAltNames.length > 0)
								{
									for(let k = 0; k < subjectAltNames.length; k++)
									{
										if(subjectAltNames[k].type === 7) // iPAddress
										{
											valueExists = true;
											groupPermitted = groupPermitted || compareIPAddress(subjectAltNames[k].value, group[j].base.value);
										}
									}
								}
								break;
							//endregion
							//region default
							default:
							//endregion
						}
						
						if(groupPermitted)
							break;
					}
					
					if((groupPermitted === false) && (group.length > 0) && valueExists)
					{
						policyResult.result = false;
						policyResult.resultCode = 41;
						policyResult.resultMessage = "Failed to meet \"permitted sub-trees\" name constraint";
						
						throw policyResult;
					}
				}
				//endregion
				//endregion
				
				//region Checking for "excluded sub-trees"
				let excluded = false;
				
				for(let j = 0; j < excludedSubtrees.length; j++)
				{
					switch(excludedSubtrees[j].base.type)
					{
						//region rfc822Name
						case 1:
							if(subjectAltNames.length >= 0)
							{
								for(let k = 0; k < subjectAltNames.length; k++)
								{
									if(subjectAltNames[k].type === 1) // rfc822Name
										excluded = excluded || compareRFC822Name(subjectAltNames[k].value, excludedSubtrees[j].base.value);
								}
							}
							else // Try to find out "emailAddress" inside "subject"
							{
								for(let k = 0; k < this.certs[i].subject.typesAndValues.length; k++)
								{
									if((this.certs[i].subject.typesAndValues[k].type === "1.2.840.113549.1.9.1") ||    // PKCS#9 e-mail address
										(this.certs[i].subject.typesAndValues[k].type === "0.9.2342.19200300.100.1.3")) // RFC1274 "rfc822Mailbox" e-mail address
										excluded = excluded || compareRFC822Name(this.certs[i].subject.typesAndValues[k].value.valueBlock.value, excludedSubtrees[j].base.value);
								}
							}
							break;
						//endregion
						//region dNSName
						case 2:
							if(subjectAltNames.length > 0)
							{
								for(let k = 0; k < subjectAltNames.length; k++)
								{
									if(subjectAltNames[k].type === 2) // dNSName
										excluded = excluded || compareDNSName(subjectAltNames[k].value, excludedSubtrees[j].base.value);
								}
							}
							break;
						//endregion
						//region directoryName
						case 4:
							excluded = excluded || compareDirectoryName(this.certs[i].subject, excludedSubtrees[j].base.value);
							break;
						//endregion
						//region uniformResourceIdentifier
						case 6:
							if(subjectAltNames.length > 0)
							{
								for(let k = 0; k < subjectAltNames.length; k++)
								{
									if(subjectAltNames[k].type === 6) // uniformResourceIdentifier
										excluded = excluded || compareUniformResourceIdentifier(subjectAltNames[k].value, excludedSubtrees[j].base.value);
								}
							}
							break;
						//endregion
						//region iPAddress
						case 7:
							if(subjectAltNames.length > 0)
							{
								for(let k = 0; k < subjectAltNames.length; k++)
								{
									if(subjectAltNames[k].type === 7) // iPAddress
										excluded = excluded || compareIPAddress(subjectAltNames[k].value, excludedSubtrees[j].base.value);
								}
							}
							break;
						//endregion
						//region default
						default: // No action, but probably here we need to create a warning for "malformed constraint"
						//endregion
					}
					
					if(excluded)
						break;
				}
				
				if(excluded === true)
				{
					policyResult.result = false;
					policyResult.resultCode = 42;
					policyResult.resultMessage = "Failed to meet \"excluded sub-trees\" name constraint";
					
					throw policyResult;
				}
				//endregion
				
				//region Append "cert_..._subtrees" to "..._subtrees"
				permittedSubtrees = permittedSubtrees.concat(certPermittedSubtrees);
				excludedSubtrees = excludedSubtrees.concat(certExcludedSubtrees);
				//endregion
			}
			//endregion
			
			return policyResult;
			//endregion
		}
		catch(error)
		{
			if(error instanceof Object)
			{
				if("resultMessage" in error)
					return error;
				
				if("message" in error)
				{
					return {
						result: false,
						resultCode: -1,
						resultMessage: error.message
					};
				}
			}
			
			return {
				result: false,
				resultCode: -1,
				resultMessage: error
			};
		}
	}
	//**********************************************************************************
}
//**************************************************************************************
