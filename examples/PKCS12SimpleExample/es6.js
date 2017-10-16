import * as asn1js from "asn1js";
import { stringToArrayBuffer, arrayBufferToString, fromBase64, toBase64 } from "pvutils";
import { getCrypto, getAlgorithmParameters, getRandomValues, setEngine } from "../../src/common";
import Certificate from "../../src/Certificate";
import PrivateKeyInfo from "../../src/PrivateKeyInfo";
import AuthenticatedSafe from "../../src/AuthenticatedSafe";
import SafeContents from "../../src/SafeContents";
import SafeBag from "../../src/SafeBag";
import CertBag from "../../src/CertBag";
import PFX from "../../src/PFX";
import Attribute from "../../src/Attribute";
import PKCS8ShroudedKeyBag from "../../src/PKCS8ShroudedKeyBag";
//*********************************************************************************
//region Global variables
//*********************************************************************************
const certificateBASE64 = `MIIDRDCCAi6gAwIBAgIBATALBgkqhkiG9w0BAQswODE2MAkGA1UEBhMCVVMwKQYDVQQDHiIAUABlAGMAdQBsAGkAYQByACAAVgBlAG4AdAB1AHIAZQBzMB4XDTEzMDEzMTIxMDAwMFoXDTE2MDEzMTIxMDAwMFowODE2MAkGA1UEBhMCVVMwKQYDVQQDHiIAUABlAGMAdQBsAGkAYQByACAAVgBlAG4AdAB1AHIAZQBzMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4qEnCuFxZqTEM/8cYcaYxexT6+fAHan5/eGCFOe1Yxi0BjRuDooWBPX71+hmWK/MKrKpWTpA3ZDeWrQR2WIcaf/ypd6DAEEWWzlQgBYpEUj/o7cykNwIvZReU9JXCbZu0EmeZXzBm1mIcWYRdk17UdneIRUkU379wVJcKXKlgZsx8395UNeOMk11G5QaHzAafQ1ljEKB/x2xDgwFxNaKpSIq3LQFq0PxoYt/PBJDMfUSiWT5cFh1FdKITXQzxnIthFn+NVKicAWBRaSZCRQxcShX6KHpQ1Lmk0/7QoCcDOAmVSfUAaBl2w8bYpnobFSStyY0RJHBqNtnTV3JonGAHwIDAQABo10wWzAMBgNVHRMEBTADAQH/MAsGA1UdDwQEAwIA/zAdBgNVHQ4EFgQU5QmA6U960XL4SII2SEhCcxij0JYwHwYDVR0jBBgwFoAU5QmA6U960XL4SII2SEhCcxij0JYwCwYJKoZIhvcNAQELA4IBAQAikQls3LhY8rYQCZ+8jXrdaRTY3L5J3S2xzoAofkEnQNzNMClaWrZbY/KQ+gG25MIFwPOWZn/uYUKB2j0yHTRMPEAp/v5wawSqM2BkdnkGP4r5Etx9pe3mog2xNUBqSeopNNto7QgV0o1yYHtuMKQhNAzcFB1CGz25+lXv8VuuU1PoYNrTjiprkjLDgPurNXUjUh9AZl06+Cakoe75LEkuaZKuBQIMNLJFcM2ZSK/QAAaI0E1DovcsCctW8x/6Qk5fYwNu0jcIdng9dzKYXytzV53+OGxdK5mldyBBkyvTrbO8bWwYT3c+weB1huNpgnpRHJKMz5xVj0bbdnHir6uc`;

const privateKeyBASE64 = `MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDioScK4XFmpMQz/xxhxpjF7FPr58Adqfn94YIU57VjGLQGNG4OihYE9fvX6GZYr8wqsqlZOkDdkN5atBHZYhxp//Kl3oMAQRZbOVCAFikRSP+jtzKQ3Ai9lF5T0lcJtm7QSZ5lfMGbWYhxZhF2TXtR2d4hFSRTfv3BUlwpcqWBmzHzf3lQ144yTXUblBofMBp9DWWMQoH/HbEODAXE1oqlIirctAWrQ/Ghi388EkMx9RKJZPlwWHUV0ohNdDPGci2EWf41UqJwBYFFpJkJFDFxKFfooelDUuaTT/tCgJwM4CZVJ9QBoGXbDxtimehsVJK3JjREkcGo22dNXcmicYAfAgMBAAECggEBANMO1fdyIVRAWmE6UspUU+7vuvBWMjruE9126NhjOjABz5Z/uYdc3kjcdSCMVNR/VBrnrINmlwZBZnL+hCj5EBE/xlDnOwU/mHx4khnXiYOJglqLwFHcOV+lD3vsxhZLikP8a8GEQCJXbZR+RADzA8gkqJQSxnPkLpqeAyqulKhviQ2lq2ZxeCXI+iZvURQPTSm86+szClwgzr2uW6NSlNKKeeLHMILed4mrwbPOdyhutnqvV79GUYH3yYdzbEbbw5GOat77+xPLt33cfLCL7pg5lGDrKEomu6V1d5KmBOhv0K8gGPKfxPrpeUG5n1q58k/2ouCiyAaKWpVoOWmnbzECgYEA/UzAGZ2N8YE+kC85Nl0wQof+WVm+RUDsv6C3L2vPUht3GwnbxSTMl4+NixbCWG46udVhsM2x7ZzYY1eB7LtnBnjvXZTYU4wqZtGR/+X2Rw5ou+oWm16/OgcEuFjP2zpQtr9r/bpKhyBV+IdSngnLy00RueKGUL6nvtecRklEhQ0CgYEA5Quek+c12qMtrmg5znHPQC7uuieZRzUL9jTlQtuZM5m4B3AfB/N/0qIQS06PHS1ijeHQ9SxEmG72weamUYC0SPi8GxJioFzaJEDVit0Ra38gf0CXQvcYT0XD1CwY/m+jDXDWL5L1CCIr60AzNjM3WEfGO4VHaNsovVLn1Fvy5tsCgYEA4ZOEUEubqUOsb8NedCexXs61mOTvKcWUEWQTP0wHqduDyrSQ35TSDvds2j0+fnpMGksJYOcOWcmge3fm4OhT69Ovd+uia2UcLczc9MPa+5S9ePwTffJ24jp13aZaFaZtUxJOHfvVe1k0tsvsq4mV0EumSaCOdUIVKUPijEWbm9ECgYBpFa+nxAidSwiGYCNFaEnh9KZqmghk9x2J1DLrPb1IQ1p/bx2NlFYs2VYIdv6KMGxrFBO+qJTAKwjjZWMhOZ99a0FCWmkNkgwzXdubXlnDrAvI1mWPv7ZTiHqUObct5SI15HMgWJg7JxJnWIkmcNEPm76DSF6+6O4EDql2cMk8yQKBgF5roj+l90lfwImr6V1NJo3J5VCi9wTT5x9enPY9WRcfSyRjqU7JWy6h0C+Jq+AYAxrkQVjQuv1AOhO8Uhc6amM5FA+gfg5HKKPnwuOe7r7B48LFF8eRjYRtHmrQUrFY0jH6O+t12dEQI+7qE+SffUScsZWCREX7QYEK/tuznv/U`;
//*********************************************************************************
//endregion 
//*********************************************************************************
//region Auxiliary functions 
//*********************************************************************************
function formatPEM(pemString)
{
	const stringLength = pemString.length;
	let resultString = "";
	
	for(let i = 0, count = 0; i < stringLength; i++, count++)
	{
		if(count > 63)
		{
			resultString = `${resultString}\r\n`;
			count = 0;
		}
		
		resultString = `${resultString}${pemString[i]}`;
	}
	
	return resultString;
}
//*********************************************************************************
function destroyClickedElement(event)
{
	document.body.removeChild(event.target);
}
//*********************************************************************************
//endregion 
//*********************************************************************************
function passwordBasedIntegrityInternal(password)
{
	//region Initial variables
	let sequence = Promise.resolve();
	//endregion
	
	//region Create simplified structires for certificate and private key
	let asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(certificateBASE64)));
	const certSimpl = new Certificate({ schema: asn1.result });
	
	asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(privateKeyBASE64)));
	const pkcs8Simpl = new PrivateKeyInfo({ schema: asn1.result });
	//endregion
	
	//region Put initial values for PKCS#12 structures
	const pkcs12 = new PFX({
		parsedValue: {
			integrityMode: 0, // Password-Based Integrity Mode
			authenticatedSafe: new AuthenticatedSafe({
				parsedValue: {
					safeContents: [
						{
							privacyMode: 0, // "No Privacy" mode
							value: new SafeContents({
								safeBags: [
									new SafeBag({
										bagId: "1.2.840.113549.1.12.10.1.1",
										bagValue: pkcs8Simpl
									}),
									new SafeBag({
										bagId: "1.2.840.113549.1.12.10.1.3",
										bagValue: new CertBag({
											parsedValue: certSimpl
										})
									})
								]
							})
						}
					]
				}
			})
		}
	});
	//endregion
	
	//region Encode internal values for all "SafeContents" firts (create all "Privacy Protection" envelopes)
	sequence = sequence.then(
		() => pkcs12.parsedValue.authenticatedSafe.makeInternalValues({
			safeContents: [
				{
					// Empty parameters since we have "No Privacy" protection level for SafeContents
				}
			]
		})
	);
	//endregion
	
	//region Encode internal values for "Integrity Protection" envelope
	sequence = sequence.then(
		() => pkcs12.makeInternalValues({
			password: stringToArrayBuffer(password),
			iterations: 100000,
			pbkdf2HashAlgorithm: "SHA-256", // Least two parameters are equal because at the moment it is not clear how to use PBMAC1 schema with PKCS#12 integrity protection
			hmacHashAlgorithm: "SHA-256"
		})
	);
	//endregion
	
	//region Encode output buffer
	sequence = sequence.then(() => pkcs12.toSchema().toBER(false));
	//endregion
	
	return sequence;
}
//*********************************************************************************
function passwordBasedIntegrity(password)
{
	if(typeof password === "undefined")
		password = document.getElementById("password2").value;

	return Promise.resolve().then(() => passwordBasedIntegrityInternal(password)).then(result =>
	{
		const pkcs12AsBlob = new Blob([result], { type: "application/x-pkcs12" });
		const downloadLink = document.createElement("a");
		downloadLink.download = "pkijs_pkcs12.p12";
		downloadLink.innerHTML = "Download File";
		
		downloadLink.href = window.URL.createObjectURL(pkcs12AsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
		
		downloadLink.click();
	});
}
//*********************************************************************************
function certificateBasedIntegrityInternal()
{
	//region Initial variables
	let sequence = Promise.resolve();
	//endregion
	
	//region Create simplified structires for certificate and private key
	let asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(certificateBASE64)));
	const certSimpl = new Certificate({ schema: asn1.result });
	
	asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(privateKeyBASE64)));
	const pkcs8Simpl = new PrivateKeyInfo({ schema: asn1.result });
	//endregion
	
	//region Get a "crypto" extension
	const crypto = getCrypto();
	if(typeof crypto === "undefined")
		return Promise.reject("No WebCrypto extension found");
	//endregion
	
	//region Put initial values for PKCS#12 structures
	const pkcs12 = new PFX({
		parsedValue: {
			integrityMode: 1, // Certificate-Based Integrity Mode
			authenticatedSafe: new AuthenticatedSafe({
				parsedValue: {
					safeContents: [
						{
							privacyMode: 0, // "No Privacy" mode
							value: new SafeContents({
								safeBags: [
									new SafeBag({
										bagId: "1.2.840.113549.1.12.10.1.1",
										bagValue: pkcs8Simpl
									}),
									new SafeBag({
										bagId: "1.2.840.113549.1.12.10.1.3",
										bagValue: new CertBag({
											parsedValue: certSimpl
										})
									})
								]
							})
						}
					]
				}
			})
		}
	});
	//endregion
	
	//region Encode internal values for all "SafeContents" firts (create all "Privacy Protection" envelopes)
	sequence = sequence.then(
		() => pkcs12.parsedValue.authenticatedSafe.makeInternalValues({
			safeContents: [
				{
					// Empty parameters since we have "No Privacy" protection level for SafeContents
				}
			]
		})
	);
	//endregion
	
	//region Import PKCS#8 key into WebCrypto key
	sequence = sequence.then(
		() => certSimpl.getPublicKey().then(
			result =>
			{
				const algorithm = getAlgorithmParameters(result.algorithm.name, "importkey");
				
				return crypto.importKey("pkcs8",
					stringToArrayBuffer(fromBase64(privateKeyBASE64)),
					algorithm.algorithm,
					true,
					["sign"]);
			}
		)
	);
	//endregion
	
	//region Encode internal values for "Integrity Protection" envelope
	sequence = sequence.then(
		result => pkcs12.makeInternalValues({
			signingCertificate: certSimpl,
			privateKey: result,
			hashAlgorithm: "SHA-256"
		})
	);
	//endregion
	
	//region Save encoded data
	sequence = sequence.then(() => pkcs12.toSchema().toBER(false));
	//endregion
	
	return sequence;
}
//*********************************************************************************
function certificateBasedIntegrity()
{
	return Promise.resolve().then(() => certificateBasedIntegrityInternal()).then(result =>
	{
		const pkcs12AsBlob = new Blob([result], { type: "application/x-pkcs12" });
		const downloadLink = document.createElement("a");
		downloadLink.download = "pkijs_pkcs12.p12";
		downloadLink.innerHTML = "Download File";
		
		downloadLink.href = window.URL.createObjectURL(pkcs12AsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
		
		downloadLink.click();
	});
}
//*********************************************************************************
function noPrivacyInternal(password)
{
	return passwordBasedIntegrityInternal(password);
}
//*********************************************************************************
function noPrivacy()
{
	return passwordBasedIntegrity(document.getElementById("password3").value); // Same with previous example
}
//*********************************************************************************
function passwordPrivacyInternal(password)
{
	//region Initial variables
	let sequence = Promise.resolve();
	
	const passwordConverted = stringToArrayBuffer(password);
	//endregion
	
	//region Create simplified structires for certificate and private key
	let asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(certificateBASE64)));
	const certSimpl = new Certificate({ schema: asn1.result });
	
	asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(privateKeyBASE64)));
	const pkcs8Simpl = new PrivateKeyInfo({ schema: asn1.result });
	//endregion
	
	//region Put initial values for PKCS#12 structures
	const pkcs12 = new PFX({
		parsedValue: {
			integrityMode: 0, // Password-Based Integrity Mode
			authenticatedSafe: new AuthenticatedSafe({
				parsedValue: {
					safeContents: [
						{
							privacyMode: 1, // Password-Based Privacy Protection Mode
							value: new SafeContents({
								safeBags: [
									new SafeBag({
										bagId: "1.2.840.113549.1.12.10.1.1",
										bagValue: pkcs8Simpl
									}),
									new SafeBag({
										bagId: "1.2.840.113549.1.12.10.1.3",
										bagValue: new CertBag({
											parsedValue: certSimpl
										})
									})
								]
							})
						}
					]
				}
			})
		}
	});
	//endregion
	
	//region Encode internal values for all "SafeContents" firts (create all "Privacy Protection" envelopes)
	sequence = sequence.then(
		() => pkcs12.parsedValue.authenticatedSafe.makeInternalValues({
			safeContents: [
				{
					password: passwordConverted,
					contentEncryptionAlgorithm: {
						name: "AES-CBC",
						length: 128
					},
					hmacHashAlgorithm: "SHA-256",
					iterationCount: 2048
				}
			]
		})
	);
	//endregion
	
	//region Encode internal values for "Integrity Protection" envelope
	sequence = sequence.then(
		() => pkcs12.makeInternalValues({
			password: passwordConverted,
			iterations: 100000,
			pbkdf2HashAlgorithm: "SHA-256", // Least two parameters are equal because at the moment it is not clear how to use PBMAC1 schema with PKCS#12 integrity protection
			hmacHashAlgorithm: "SHA-256"
		})
	);
	//endregion
	
	//region Save encoded data
	sequence = sequence.then(() => pkcs12.toSchema().toBER(false));
	//endregion
	
	return sequence;
}
//*********************************************************************************
function passwordPrivacy()
{
	return Promise.resolve().then(() => passwordPrivacyInternal(document.getElementById("password4").value)).then(result =>
	{
		const pkcs12AsBlob = new Blob([result], { type: "application/x-pkcs12" });
		const downloadLink = document.createElement("a");
		downloadLink.download = "pkijs_pkcs12.p12";
		downloadLink.innerHTML = "Download File";
		
		downloadLink.href = window.URL.createObjectURL(pkcs12AsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
		
		downloadLink.click();
	});
}
//*********************************************************************************
function certificatePrivacyInternal(password)
{
	//region Initial variables
	let sequence = Promise.resolve();
	//endregion
	
	//region Create simplified structires for certificate and private key
	let asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(certificateBASE64)));
	const certSimpl = new Certificate({ schema: asn1.result });
	
	asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(privateKeyBASE64)));
	const pkcs8Simpl = new PrivateKeyInfo({ schema: asn1.result });
	//endregion
	
	//region Put initial values for PKCS#12 structures
	const pkcs12 = new PFX({
		parsedValue: {
			integrityMode: 0, // Password-Based Integrity Mode
			authenticatedSafe: new AuthenticatedSafe({
				parsedValue: {
					safeContents: [
						{
							privacyMode: 2, // Certificate-Based Privacy Protection Mode
							value: new SafeContents({
								safeBags: [
									new SafeBag({
										bagId: "1.2.840.113549.1.12.10.1.1",
										bagValue: pkcs8Simpl
									}),
									new SafeBag({
										bagId: "1.2.840.113549.1.12.10.1.3",
										bagValue: new CertBag({
											parsedValue: certSimpl
										})
									})
								]
							})
						}
					]
				}
			})
		}
	});
	//endregion
	
	//region Encode internal values for all "SafeContents" firts (create all "Privacy Protection" envelopes)
	sequence = sequence.then(
		() => pkcs12.parsedValue.authenticatedSafe.makeInternalValues({
			safeContents: [
				{
					encryptingCertificate: certSimpl,
					encryptionAlgorithm: {
						name: "AES-CBC",
						length: 128
					}
				}
			]
		})
	);
	//endregion
	
	//region Encode internal values for "Integrity Protection" envelope
	sequence = sequence.then(
		() => pkcs12.makeInternalValues({
			password: stringToArrayBuffer(password),
			iterations: 100000,
			pbkdf2HashAlgorithm: "SHA-256", // Least two parameters are equal because at the moment it is not clear how to use PBMAC1 schema with PKCS#12 integrity protection
			hmacHashAlgorithm: "SHA-256"
		})
	);
	//endregion
	
	//region Save encoded data
	sequence = sequence.then(() => pkcs12.toSchema().toBER(false));
	//endregion
	
	return sequence;
}
//*********************************************************************************
function certificatePrivacy()
{
	return Promise.resolve().then(() => certificatePrivacyInternal(document.getElementById("password5").value)).then(result =>
	{
		const pkcs12AsBlob = new Blob([result], { type: "application/x-pkcs12" });
		const downloadLink = document.createElement("a");
		downloadLink.download = "pkijs_pkcs12.p12";
		downloadLink.innerHTML = "Download File";
		
		downloadLink.href = window.URL.createObjectURL(pkcs12AsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
		
		downloadLink.click();
	});
}
//*********************************************************************************
function openSSLLikeInternal(password)
{
	//region Initial variables
	let sequence = Promise.resolve();
	
	const keyLocalIDBuffer = new ArrayBuffer(4);
	const keyLocalIDView = new Uint8Array(keyLocalIDBuffer);
	
	getRandomValues(keyLocalIDView);
	
	const certLocalIDBuffer = new ArrayBuffer(4);
	const certLocalIDView = new Uint8Array(certLocalIDBuffer);
	
	getRandomValues(certLocalIDView);
	
	//region "KeyUsage" attribute
	const bitArray = new ArrayBuffer(1);
	const bitView = new Uint8Array(bitArray);
	
	bitView[0] = bitView[0] | 0x80;
	
	const keyUsage = new asn1js.BitString({
		valueHex: bitArray,
		unusedBits: 7
	});
	//endregion
	
	const passwordConverted = stringToArrayBuffer(password);
	//endregion
	
	//region Create simplified structires for certificate and private key
	let asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(certificateBASE64)));
	const certSimpl = new Certificate({ schema: asn1.result });
	
	asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(privateKeyBASE64)));
	const pkcs8Simpl = new PrivateKeyInfo({ schema: asn1.result });
	
	//region Add "keyUsage" attribute
	pkcs8Simpl.attributes = [
		new Attribute({
			type: "2.5.29.15",
			values: [
				keyUsage
			]
		})
	];
	//endregion
	//endregion
	
	//region Put initial values for PKCS#12 structures
	const pkcs12 = new PFX({
		parsedValue: {
			integrityMode: 0, // Password-Based Integrity Mode
			authenticatedSafe: new AuthenticatedSafe({
				parsedValue: {
					safeContents: [
						{
							privacyMode: 0, // "No-privacy" Protection Mode
							value: new SafeContents({
								safeBags: [
									new SafeBag({
										bagId: "1.2.840.113549.1.12.10.1.2",
										bagValue: new PKCS8ShroudedKeyBag({
											parsedValue: pkcs8Simpl
										}),
										bagAttributes: [
											new Attribute({
												type: "1.2.840.113549.1.9.20", // friendlyName
												values: [
													new asn1js.BmpString({ value: "PKCS8ShroudedKeyBag from PKIjs" })
												]
											}),
											new Attribute({
												type: "1.2.840.113549.1.9.21", // localKeyID
												values: [
													new asn1js.OctetString({ valueHex: keyLocalIDBuffer })
												]
											}),
											new Attribute({
												type: "1.3.6.1.4.1.311.17.1", // pkcs12KeyProviderNameAttr
												values: [
													new asn1js.BmpString({ value: "http://www.pkijs.org" })
												]
											})
										]
									})
								]
							})
						},
						{
							privacyMode: 1, // Password-Based Privacy Protection Mode
							value: new SafeContents({
								safeBags: [
									new SafeBag({
										bagId: "1.2.840.113549.1.12.10.1.3",
										bagValue: new CertBag({
											parsedValue: certSimpl
										}),
										bagAttributes: [
											new Attribute({
												type: "1.2.840.113549.1.9.20", // friendlyName
												values: [
													new asn1js.BmpString({ value: "CertBag from PKIjs" })
												]
											}),
											new Attribute({
												type: "1.2.840.113549.1.9.21", // localKeyID
												values: [
													new asn1js.OctetString({ valueHex: certLocalIDBuffer })
												]
											}),
											new Attribute({
												type: "1.3.6.1.4.1.311.17.1", // pkcs12KeyProviderNameAttr
												values: [
													new asn1js.BmpString({ value: "http://www.pkijs.org" })
												]
											})
										]
									})
								]
							})
						}
					]
				}
			})
		}
	});
	//endregion
	
	//region Encode internal values for "PKCS8ShroudedKeyBag"
	sequence = sequence.then(
		() => pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[0].value.safeBags[0].bagValue.makeInternalValues({
			password: passwordConverted,
			contentEncryptionAlgorithm: {
				name: "AES-CBC", // OpenSSL can handle AES-CBC only
				length: 128
			},
			hmacHashAlgorithm: "SHA-1", // OpenSSL can handle SHA-1 only
			iterationCount: 100000
		})
	);
	//endregion
	
	//region Encode internal values for all "SafeContents" firts (create all "Privacy Protection" envelopes)
	sequence = sequence.then(
		() => pkcs12.parsedValue.authenticatedSafe.makeInternalValues({
			safeContents: [
				{
					// Empty parameters for first SafeContent since "No Privacy" protection mode there
				},
				{
					password: passwordConverted,
					contentEncryptionAlgorithm: {
						name: "AES-CBC", // OpenSSL can handle AES-CBC only
						length: 128
					},
					hmacHashAlgorithm: "SHA-1", // OpenSSL can handle SHA-1 only
					iterationCount: 100000
				}
			]
		})
	);
	//endregion
	
	//region Encode internal values for "Integrity Protection" envelope
	sequence = sequence.then(
		() => pkcs12.makeInternalValues({
			password: passwordConverted,
			iterations: 100000,
			pbkdf2HashAlgorithm: "SHA-256", // OpenSSL can not handle usage of PBKDF2, only PBKDF1
			hmacHashAlgorithm: "SHA-256"
		})
	);
	//endregion
	
	//region Save encoded data
	sequence = sequence.then(() => pkcs12.toSchema().toBER(false));
	//endregion
	
	return sequence;
}
//*********************************************************************************
function openSSLLike()
{
	return Promise.resolve().then(() => openSSLLikeInternal(document.getElementById("password1").value)).then(result =>
	{
		const pkcs12AsBlob = new Blob([result], { type: "application/x-pkcs12" });
		const downloadLink = document.createElement("a");
		downloadLink.download = "pkijs_pkcs12.p12";
		downloadLink.innerHTML = "Download File";
		
		downloadLink.href = window.URL.createObjectURL(pkcs12AsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
		
		downloadLink.click();
	});
}
//*********************************************************************************
function parsePKCS12Internal(buffer, password)
{
	//region Initial variables
	let sequence = Promise.resolve();
	
	const passwordConverted = stringToArrayBuffer(password);
	//endregion
	
	//region Parse internal PKCS#12 values
	const asn1 = asn1js.fromBER(buffer);
	const pkcs12 = new PFX({ schema: asn1.result });
	//endregion
	
	//region Parse "AuthenticatedSafe" value of PKCS#12 data
	sequence = sequence.then(
		() => pkcs12.parseInternalValues({
			password: passwordConverted,
			checkIntegrity: false
		})
	);
	//endregion
	
	//region Parse "SafeContents" values
	sequence = sequence.then(
		() => pkcs12.parsedValue.authenticatedSafe.parseInternalValues({
			safeContents: [
				{
					// Empty parameters since for first "SafeContent" OpenSSL uses "no privacy" protection mode
				},
				{
					password: passwordConverted
				}
			]
		})
	);
	//endregion
	
	//region Parse "PKCS8ShroudedKeyBag" value
	sequence = sequence.then(
		() => pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[0].value.safeBags[0].bagValue.parseInternalValues({
			password: passwordConverted
		})
	);
	//endregion
	
	//region Store parsed value to Web page
	sequence = sequence.then(
		() => pkcs12
	);
	//endregion
	
	return sequence;
}
//*********************************************************************************
function parsePKCS12(buffer)
{
	return Promise.resolve().then(() => parsePKCS12Internal(buffer, document.getElementById("password").value)).then(pkcs12 =>
	{
		//region Initial variables
		let result = "";
		//endregion
		
		//region Store X.509 certificate value
		const certificateBuffer = pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[1].value.safeBags[0].bagValue.parsedValue.toSchema().toBER(false);
		
		result += "-----BEGIN CERTIFICATE-----\r\n";
		result += formatPEM(toBase64(arrayBufferToString(certificateBuffer)));
		result += "\r\n-----END CERTIFICATE-----\r\n";
		//endregion
		
		//endregion Store PKCS#8 (private key) value
		const pkcs8Buffer = pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[0].value.safeBags[0].bagValue.parsedValue.toSchema().toBER(false);
		
		result += "\r\n-----BEGIN PRIVATE KEY-----\r\n";
		result += formatPEM(toBase64(arrayBufferToString(pkcs8Buffer)));
		result += "\r\n-----END PRIVATE KEY-----\r\n";
		//endregion
		
		document.getElementById("parsing_result").innerHTML = result;
	});
}
//*********************************************************************************
function handlePKCS12(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	tempReader.onload =
		event =>
		{
			parsePKCS12(event.target.result);
		};
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
context("Hack for Rollup.js", () =>
{
	return;
	
	passwordBasedIntegrity();
	certificateBasedIntegrity();
	noPrivacy();
	passwordPrivacy();
	certificatePrivacy();
	openSSLLike();
	parsePKCS12();
	handlePKCS12();
	setEngine();
});
//**********************************************************************************
context("PKCS#12 Simple Example", () =>
{
	//region Initial variables
	let sequence = Promise.resolve();
	const password = "12345567890";
	//endregion
	
	it("Password-based Integrity", () => passwordBasedIntegrityInternal(password));
	
	it("Certificate-based Integrity", () => certificateBasedIntegrityInternal());
	
	it("No-Privacy Test", () => noPrivacyInternal(password));
	
	it("Password Privacy", () => passwordPrivacyInternal(password));
	
	it("Certificate Privacy", () => certificatePrivacyInternal(password));
	
	it("Making OpenSSL-like PKCS#12 Data", () => openSSLLikeInternal(password).then(result => parsePKCS12Internal(result, password)));
	
	return sequence;
});
//**********************************************************************************
