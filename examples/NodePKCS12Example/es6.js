import * as asn1js from "asn1js";
import { stringToArrayBuffer, arrayBufferToString, fromBase64, toBase64 } from "pvutils";
import { getAlgorithmParameters, getRandomValues, setEngine } from "../../src/common";
import Certificate from "../../src/Certificate";
import AttributeCertificateV1 from "../../src/AttributeCertificateV1";
import PrivateKeyInfo from "../../src/PrivateKeyInfo";
import AuthenticatedSafe from "../../src/AuthenticatedSafe";
import SafeContents from "../../src/SafeContents";
import SafeBag from "../../src/SafeBag";
import CertBag from "../../src/CertBag";
import PFX from "../../src/PFX";
import Attribute from "../../src/Attribute";
import PKCS8ShroudedKeyBag from "../../src/PKCS8ShroudedKeyBag";
import NodeEngine from "./NodeEngine";
//*********************************************************************************
const nodeEngine = new NodeEngine();
setEngine(nodeEngine.name, nodeEngine.crypto, nodeEngine.subtle);
//*********************************************************************************
//region Global variables
//*********************************************************************************
const x509CertificateBASE64 = "MIIDRDCCAi6gAwIBAgIBATALBgkqhkiG9w0BAQswODE2MAkGA1UEBhMCVVMwKQYDVQQDHiIAUABlAGMAdQBsAGkAYQByACAAVgBlAG4AdAB1AHIAZQBzMB4XDTEzMDEzMTIxMDAwMFoXDTE2MDEzMTIxMDAwMFowODE2MAkGA1UEBhMCVVMwKQYDVQQDHiIAUABlAGMAdQBsAGkAYQByACAAVgBlAG4AdAB1AHIAZQBzMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4qEnCuFxZqTEM/8cYcaYxexT6+fAHan5/eGCFOe1Yxi0BjRuDooWBPX71+hmWK/MKrKpWTpA3ZDeWrQR2WIcaf/ypd6DAEEWWzlQgBYpEUj/o7cykNwIvZReU9JXCbZu0EmeZXzBm1mIcWYRdk17UdneIRUkU379wVJcKXKlgZsx8395UNeOMk11G5QaHzAafQ1ljEKB/x2xDgwFxNaKpSIq3LQFq0PxoYt/PBJDMfUSiWT5cFh1FdKITXQzxnIthFn+NVKicAWBRaSZCRQxcShX6KHpQ1Lmk0/7QoCcDOAmVSfUAaBl2w8bYpnobFSStyY0RJHBqNtnTV3JonGAHwIDAQABo10wWzAMBgNVHRMEBTADAQH/MAsGA1UdDwQEAwIA/zAdBgNVHQ4EFgQU5QmA6U960XL4SII2SEhCcxij0JYwHwYDVR0jBBgwFoAU5QmA6U960XL4SII2SEhCcxij0JYwCwYJKoZIhvcNAQELA4IBAQAikQls3LhY8rYQCZ+8jXrdaRTY3L5J3S2xzoAofkEnQNzNMClaWrZbY/KQ+gG25MIFwPOWZn/uYUKB2j0yHTRMPEAp/v5wawSqM2BkdnkGP4r5Etx9pe3mog2xNUBqSeopNNto7QgV0o1yYHtuMKQhNAzcFB1CGz25+lXv8VuuU1PoYNrTjiprkjLDgPurNXUjUh9AZl06+Cakoe75LEkuaZKuBQIMNLJFcM2ZSK/QAAaI0E1DovcsCctW8x/6Qk5fYwNu0jcIdng9dzKYXytzV53+OGxdK5mldyBBkyvTrbO8bWwYT3c+weB1huNpgnpRHJKMz5xVj0bbdnHir6uc";
const attributeCertificateBASE64 = "MIIBkDCCATgCAQEwIqAgMBikFjAUMRIwEAYDVQQDDAlCYWNrZW5kQ0ECBAEAAAGgGjAYpBYwFDESMBAGA1UEAwwJQmFja2VuZENBMA8GDSsGAQQBlmQDBoN9BW4CBAYAAAEwIhgPMjAxNzA4MjkyMjAwMDBaGA85OTk5MTIzMTIzNTk1OVowGTAXBg0rBgEEAZZkAwaDfQVnMQYEBDEBAmowgZwwHwYDVR0jBBgwFoAUYHHiUMQRfF/MiTvN6ZE7mRndccAwFwYNKwYBBAGWZAMGg30FZQEB/wQDBAEFMBcGDSsGAQQBlmQDBoN9BWsBAf8EAwQBADAeBg0rBgEEAZZkAwaDfQVoAQH/BAoxCAwGRVpTMjIzMCcGDSsGAQQBlmQDBoN9BW8EFgQUAAAAAAAAAAAAAAAAAAAAAAAAAAAwDwYNKwYBBAGWZAMGg30FbgNBAIiBWMPICHnWqU0923pfv/B0P18XDMQPoPBvJE7btu6jZLjztJIGq5wssYuHvWCGstpOGvJSXDjdJdYweI0rMwM=";

const x509PrivateKeyBASE64 = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDioScK4XFmpMQz/xxhxpjF7FPr58Adqfn94YIU57VjGLQGNG4OihYE9fvX6GZYr8wqsqlZOkDdkN5atBHZYhxp//Kl3oMAQRZbOVCAFikRSP+jtzKQ3Ai9lF5T0lcJtm7QSZ5lfMGbWYhxZhF2TXtR2d4hFSRTfv3BUlwpcqWBmzHzf3lQ144yTXUblBofMBp9DWWMQoH/HbEODAXE1oqlIirctAWrQ/Ghi388EkMx9RKJZPlwWHUV0ohNdDPGci2EWf41UqJwBYFFpJkJFDFxKFfooelDUuaTT/tCgJwM4CZVJ9QBoGXbDxtimehsVJK3JjREkcGo22dNXcmicYAfAgMBAAECggEBANMO1fdyIVRAWmE6UspUU+7vuvBWMjruE9126NhjOjABz5Z/uYdc3kjcdSCMVNR/VBrnrINmlwZBZnL+hCj5EBE/xlDnOwU/mHx4khnXiYOJglqLwFHcOV+lD3vsxhZLikP8a8GEQCJXbZR+RADzA8gkqJQSxnPkLpqeAyqulKhviQ2lq2ZxeCXI+iZvURQPTSm86+szClwgzr2uW6NSlNKKeeLHMILed4mrwbPOdyhutnqvV79GUYH3yYdzbEbbw5GOat77+xPLt33cfLCL7pg5lGDrKEomu6V1d5KmBOhv0K8gGPKfxPrpeUG5n1q58k/2ouCiyAaKWpVoOWmnbzECgYEA/UzAGZ2N8YE+kC85Nl0wQof+WVm+RUDsv6C3L2vPUht3GwnbxSTMl4+NixbCWG46udVhsM2x7ZzYY1eB7LtnBnjvXZTYU4wqZtGR/+X2Rw5ou+oWm16/OgcEuFjP2zpQtr9r/bpKhyBV+IdSngnLy00RueKGUL6nvtecRklEhQ0CgYEA5Quek+c12qMtrmg5znHPQC7uuieZRzUL9jTlQtuZM5m4B3AfB/N/0qIQS06PHS1ijeHQ9SxEmG72weamUYC0SPi8GxJioFzaJEDVit0Ra38gf0CXQvcYT0XD1CwY/m+jDXDWL5L1CCIr60AzNjM3WEfGO4VHaNsovVLn1Fvy5tsCgYEA4ZOEUEubqUOsb8NedCexXs61mOTvKcWUEWQTP0wHqduDyrSQ35TSDvds2j0+fnpMGksJYOcOWcmge3fm4OhT69Ovd+uia2UcLczc9MPa+5S9ePwTffJ24jp13aZaFaZtUxJOHfvVe1k0tsvsq4mV0EumSaCOdUIVKUPijEWbm9ECgYBpFa+nxAidSwiGYCNFaEnh9KZqmghk9x2J1DLrPb1IQ1p/bx2NlFYs2VYIdv6KMGxrFBO+qJTAKwjjZWMhOZ99a0FCWmkNkgwzXdubXlnDrAvI1mWPv7ZTiHqUObct5SI15HMgWJg7JxJnWIkmcNEPm76DSF6+6O4EDql2cMk8yQKBgF5roj+l90lfwImr6V1NJo3J5VCi9wTT5x9enPY9WRcfSyRjqU7JWy6h0C+Jq+AYAxrkQVjQuv1AOhO8Uhc6amM5FA+gfg5HKKPnwuOe7r7B48LFF8eRjYRtHmrQUrFY0jH6O+t12dEQI+7qE+SffUScsZWCREX7QYEK/tuznv/U";
const attributePrivateKeyBASE64 = "MDgCAQAwDwYNKwYBBAGWZAMGg30FbgQiBCAShWZocFw8WW2dca/UUt9xQM5nhPdP9JLGNZiR0AAAAAAslAAYGBgYGBg==";

let certSimpl;
let pkcs8Simpl;
//*********************************************************************************
//endregion 
//*********************************************************************************
function openSSLLike(password, inputAlgorithm, inputHashAlgorithm = "SHA-256")
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
	
	const contentEncryptionAlgorithm = (getAlgorithmParameters(inputAlgorithm, "encrypt")).algorithm;
	if(("name" in contentEncryptionAlgorithm) === false)
		return Promise.reject("No support for selected algorithm");
	
	const makeInternalValuesParameters = {
		password: passwordConverted,
		contentEncryptionAlgorithm,
		hmacHashAlgorithm: inputHashAlgorithm,
		iterationCount: 2048
	};
	//endregion
	
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
						},
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
						}
					]
				}
			})
		}
	});
	//endregion
	
	//region Encode internal values for "PKCS8ShroudedKeyBag"
	sequence = sequence.then(
		() => pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[1].value.safeBags[0].bagValue.makeInternalValues(makeInternalValuesParameters)
	);
	//endregion
	
	//region Encode internal values for all "SafeContents" firts (create all "Privacy Protection" envelopes)
	sequence = sequence.then(
		() => pkcs12.parsedValue.authenticatedSafe.makeInternalValues({
			safeContents: [
				makeInternalValuesParameters,
				{
					// Empty parameters for first SafeContent since "No Privacy" protection mode there
				},
			]
		})
	);
	//endregion
	
	//region Encode internal values for "Integrity Protection" envelope
	sequence = sequence.then(
		() => pkcs12.makeInternalValues({
			password: passwordConverted,
			iterations: 2048,
			pbkdf2HashAlgorithm: inputHashAlgorithm, // OpenSSL can not handle usage of PBKDF2, only PBKDF1
			hmacHashAlgorithm: inputHashAlgorithm
		})
	);
	//endregion
	
	//region Save encoded data
	sequence = sequence.then(() => pkcs12.toSchema().toBER(false));
	//endregion
	
	return sequence;
}
//*********************************************************************************
function windowsLike(password, inputAlgorithm, inputHashAlgorithm = "SHA-256")
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
	
	const contentEncryptionAlgorithm = (getAlgorithmParameters(inputAlgorithm, "encrypt")).algorithm;
	if(("name" in contentEncryptionAlgorithm) === false)
		return Promise.reject("No support for selected algorithm");
	
	const makeInternalValuesParameters = {
		password: passwordConverted,
		contentEncryptionAlgorithm,
		hmacHashAlgorithm: inputHashAlgorithm,
		pbeSchema: "PBES1",
		iterationCount: 2048
	};
	//endregion
	
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
						},
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
						}
					]
				}
			})
		}
	});
	//endregion
	
	//region Encode internal values for "PKCS8ShroudedKeyBag"
	sequence = sequence.then(
		() => pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[1].value.safeBags[0].bagValue.makeInternalValues(makeInternalValuesParameters)
	);
	//endregion
	
	//region Encode internal values for all "SafeContents" firts (create all "Privacy Protection" envelopes)
	sequence = sequence.then(
		() => pkcs12.parsedValue.authenticatedSafe.makeInternalValues({
			safeContents: [
				makeInternalValuesParameters,
				{
					// Empty parameters for first SafeContent since "No Privacy" protection mode there
				},
			]
		})
	);
	//endregion
	
	//region Encode internal values for "Integrity Protection" envelope
	sequence = sequence.then(
		() => pkcs12.makeInternalValues({
			password: passwordConverted,
			iterations: 2048,
			pbkdf2HashAlgorithm: inputHashAlgorithm,
			hmacHashAlgorithm: inputHashAlgorithm
		})
	);
	//endregion
	
	//region Save encoded data
	sequence = sequence.then(() => pkcs12.toSchema().toBER(false));
	//endregion
	
	return sequence;
}
//*********************************************************************************
function parsePKCS12(buffer, password)
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
			checkIntegrity: true
		})
	);
	//endregion
	
	//region Parse "SafeContents" values
	sequence = sequence.then(
		() => pkcs12.parsedValue.authenticatedSafe.parseInternalValues({
			safeContents: [
				{
					password: passwordConverted
				},
				{
					password: passwordConverted
				}
			]
		})
	);
	//endregion
	
	//region Parse "PKCS8ShroudedKeyBag" value
	sequence = sequence.then(() =>
	{
		try
		{
			pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[0].value.safeBags[0].bagValue.parseInternalValues({
				password: passwordConverted
			});
		}
		catch(ex)
		{
			pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[1].value.safeBags[0].bagValue.parseInternalValues({
				password: passwordConverted
			});
		}
	});
	//endregion
	
	//region Store parsed value to Web page
	sequence = sequence.then(
		() => pkcs12
	);
	//endregion
	
	return sequence;
}
//**********************************************************************************
context("Node.js PKCS#12 Example", () =>
{
	//region Initial variables
	const password = "Demo";
	//endregion
	
	it("Parse Windows-like PKCS#12 data", () =>
	{
		let sequence = Promise.resolve();
		
		sequence = sequence.then(() =>
		{
			// Windows RC2
			const windowsP12 = "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";
			return parsePKCS12(stringToArrayBuffer(fromBase64(windowsP12)), "12");
		});

		sequence = sequence.then(() =>
		{
			// Forge 3DES
			const windowsP12 = "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";
			return parsePKCS12(stringToArrayBuffer(fromBase64(windowsP12)), "password");
		});
		
		return sequence;
	});
	
	it("X.509 Certificate, RC2-CBC algorithm", () =>
	{
		let asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(x509CertificateBASE64)));
		certSimpl = new Certificate({ schema: asn1.result });
		
		asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(x509PrivateKeyBASE64)));
		pkcs8Simpl = new PrivateKeyInfo({ schema: asn1.result });
		
		return windowsLike(password, "RC2-CBC", "SHA-1").then(result =>
		{
			console.log(`X.509 Certificate, RC2-CBC algorithm PKCS#12: ${toBase64(arrayBufferToString(result))}`);
			return parsePKCS12(result, password);
		});
	});

	it("X.509 Certificate, DES-EDE3-CBC algorithm", () =>
	{
		let asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(x509CertificateBASE64)));
		certSimpl = new Certificate({ schema: asn1.result });
		
		asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(x509PrivateKeyBASE64)));
		pkcs8Simpl = new PrivateKeyInfo({ schema: asn1.result });
		
		return openSSLLike(password, "DES-EDE3-CBC").then(result =>
		{
			console.log(`X.509 Certificate, DES-EDE3-CBC algorithm PKCS#12: ${toBase64(arrayBufferToString(result))}`);
			return parsePKCS12(result, password);
		});
	});
	
	it("Attribute Certificate, DES-EDE3-CBC algorithm", () =>
	{
		let asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(attributeCertificateBASE64)));
		certSimpl = new AttributeCertificateV1({ schema: asn1.result });
		
		asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(attributePrivateKeyBASE64)));
		pkcs8Simpl = new PrivateKeyInfo({ schema: asn1.result });
		
		return openSSLLike(password, "DES-EDE3-CBC").then(result =>
		{
			console.log(`Attribute Certificate, DES-EDE3-CBC algorithm PKCS#12: ${toBase64(arrayBufferToString(result))}`);
			return parsePKCS12(result, password);
		});
	});
	
	it("X.509 Certificate, AES-256-CBC algorithm", () =>
	{
		let asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(x509CertificateBASE64)));
		certSimpl = new Certificate({ schema: asn1.result });
		
		asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(x509PrivateKeyBASE64)));
		pkcs8Simpl = new PrivateKeyInfo({ schema: asn1.result });
		
		return openSSLLike(password, "AES-256-CBC").then(result =>
		{
			console.log(`X.509 Certificate, AES-256-CBC algorithm PKCS#12: ${toBase64(arrayBufferToString(result))}`);
			return parsePKCS12(result, password);
		});
	});
	
	it("Attribute Certificate, AES-256-CBC algorithm", () =>
	{
		let asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(attributeCertificateBASE64)));
		certSimpl = new AttributeCertificateV1({ schema: asn1.result });
		
		asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64(attributePrivateKeyBASE64)));
		pkcs8Simpl = new PrivateKeyInfo({ schema: asn1.result });
		
		return openSSLLike(password, "AES-256-CBC").then(result =>
		{
			console.log(`Attribute Certificate, AES-256-CBC algorithm PKCS#12: ${toBase64(arrayBufferToString(result))}`);
			return parsePKCS12(result, password);
		});
	});
});
//**********************************************************************************
