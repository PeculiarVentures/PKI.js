/* eslint-disable no-undef,no-unreachable,no-unused-vars */
import * as asn1js from "asn1js";
import { bufferToHexCodes, stringToArrayBuffer, arrayBufferToString, toBase64 } from "pvutils";
import { getCrypto, getAlgorithmParameters, setEngine } from "../../src/common";
import { formatPEM } from "../../examples/examples_common";
import OCSPResponse from "../../src/OCSPResponse";
import BasicOCSPResponse from "../../src/BasicOCSPResponse";
import Certificate from "../../src/Certificate";
import AttributeTypeAndValue from "../../src/AttributeTypeAndValue";
import Extension from "../../src/Extension";
import ResponseBytes from "../../src/ResponseBytes";
import SingleResponse from "../../src/SingleResponse";
import RelativeDistinguishedNames from "../../src/RelativeDistinguishedNames";
import BasicConstraints from "../../src/BasicConstraints";
//<nodewebcryptoossl>
//*********************************************************************************
let ocspResponseBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created OCSP response
let certificateBuffer = new ArrayBuffer(0);
let privateKeyBuffer = new ArrayBuffer(0);
let trustedCertificates = []; // Array of root certificates from "CA Bundle"

let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-V1_5";
//*********************************************************************************
//region Create OCSP response 
//*********************************************************************************
function createOCSPRespInternal()
{
	//region Initial variables
	let sequence = Promise.resolve();
	
	const ocspRespSimpl = new OCSPResponse();
	const ocspBasicResp = new BasicOCSPResponse();
	
	const certSimpl = new Certificate();
	
	let publicKey;
	let privateKey;
	//endregion
	
	//region Get a "crypto" extension
	const crypto = getCrypto();
	if(typeof crypto === "undefined")
		return Promise.reject("No WebCrypto extension found");
	//endregion
	
	//region Put a static values
	certSimpl.version = 2;
	certSimpl.serialNumber = new asn1js.Integer({ value: 1 });
	certSimpl.issuer.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.6", // Country name
		value: new asn1js.PrintableString({ value: "RU" })
	}));
	certSimpl.issuer.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.3", // Common name
		value: new asn1js.BmpString({ value: "Test" })
	}));
	certSimpl.subject.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.6", // Country name
		value: new asn1js.PrintableString({ value: "RU" })
	}));
	certSimpl.subject.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.3", // Common name
		value: new asn1js.BmpString({ value: "Test" })
	}));
	
	certSimpl.notBefore.value = new Date(2019, 1, 1);
	certSimpl.notAfter.value = new Date(2022, 1, 1);
	
	certSimpl.extensions = []; // Extensions are not a part of certificate by default, it's an optional array
	
	//region "BasicConstraints" extension
	const basicConstr = new BasicConstraints({
		cA: true,
		pathLenConstraint: 3
	});
	
	certSimpl.extensions.push(new Extension({
		extnID: "2.5.29.19",
		critical: false,
		extnValue: basicConstr.toSchema().toBER(false),
		parsedValue: basicConstr // Parsed value for well-known extensions
	}));
	//endregion
	
	//region "KeyUsage" extension
	const bitArray = new ArrayBuffer(1);
	const bitView = new Uint8Array(bitArray);
	
	bitView[0] |= 0x02; // Key usage "cRLSign" flag
	bitView[0] |= 0x04; // Key usage "keyCertSign" flag
	
	const keyUsage = new asn1js.BitString({ valueHex: bitArray });
	
	certSimpl.extensions.push(new Extension({
		extnID: "2.5.29.15",
		critical: false,
		extnValue: keyUsage.toBER(false),
		parsedValue: keyUsage // Parsed value for well-known extensions
	}));
	//endregion
	//endregion
	
	//region Create a new key pair
	sequence = sequence.then(
		() =>
		{
			//region Get default algorithm parameters for key generation
			const algorithm = getAlgorithmParameters(signAlg, "generatekey");
			if("hash" in algorithm.algorithm)
				algorithm.algorithm.hash.name = hashAlg;
			//endregion
			
			return crypto.generateKey(algorithm.algorithm, true, algorithm.usages);
		}
	);
	//endregion
	
	//region Store new key in an interim variables
	sequence = sequence.then(
		keyPair =>
		{
			publicKey = keyPair.publicKey;
			privateKey = keyPair.privateKey;
		},
		error => Promise.reject(`Error during key generation: ${error}`)
	);
	//endregion
	
	//region Exporting public key into "subjectPublicKeyInfo" value of certificate
	sequence = sequence.then(
		() => certSimpl.subjectPublicKeyInfo.importKey(publicKey)
	);
	//endregion
	
	//region Signing final certificate
	sequence = sequence.then(
		() => certSimpl.sign(privateKey, hashAlg),
		error => Promise.reject(`Error during exporting public key: ${error}`)
	);
	//endregion
	
	//region Encode and store certificate
	sequence = sequence.then(
		() =>
		{
			certificateBuffer = certSimpl.toSchema(true).toBER(false);
			trustedCertificates = [certSimpl];
		},
		error => Promise.reject(`Error during signing: ${error}`)
	);
	//endregion
	
	//region Exporting private key
	sequence = sequence.then(
		() => crypto.exportKey("pkcs8", privateKey)
	);
	//endregion
	
	//region Store exported key on Web page
	sequence = sequence.then(
		result =>
		{
			privateKeyBuffer = result;
		},
		error => Promise.reject(`Error during exporting of private key: ${error}`)
	);
	//endregion
	
	//region Create specific TST info structure to sign
	sequence = sequence.then(
		() =>
		{
			ocspRespSimpl.responseStatus.valueBlock.valueDec = 0; // success
			ocspRespSimpl.responseBytes = new ResponseBytes();
			ocspRespSimpl.responseBytes.responseType = "1.3.6.1.5.5.7.48.1.1";
			
			const responderIDBuffer = new ArrayBuffer(1);
			const responderIDView = new Uint8Array(responderIDBuffer);
			responderIDView[0] = 0x01;
			
			ocspBasicResp.tbsResponseData.responderID = certSimpl.issuer;
			ocspBasicResp.tbsResponseData.producedAt = new Date();
			
			const response = new SingleResponse();
			response.certID.hashAlgorithm.algorithmId = "1.3.14.3.2.26"; // SHA-1
			response.certID.issuerNameHash.valueBlock.valueHex = responderIDBuffer; // Fiction hash
			response.certID.issuerKeyHash.valueBlock.valueHex = responderIDBuffer; // Fiction hash
			response.certID.serialNumber.valueBlock.valueDec = 1; // Fiction serial number
			response.certStatus = new asn1js.Primitive({
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				lenBlockLength: 1 // The length contains one byte 0x00
			}); // status - success
			response.thisUpdate = new Date();
			
			ocspBasicResp.tbsResponseData.responses.push(response);
			
			ocspBasicResp.certs = [certSimpl];
			
			return ocspBasicResp.sign(privateKey, hashAlg);
		}
	);
	//endregion
	
	//region Finally create completed OCSP response structure
	return sequence.then(
		() =>
		{
			const encodedOCSPBasicResp = ocspBasicResp.toSchema().toBER(false);
			ocspRespSimpl.responseBytes.response = new asn1js.OctetString({ valueHex: encodedOCSPBasicResp });
			
			ocspResponseBuffer = ocspRespSimpl.toSchema().toBER(false);
		}
	);
	//endregion
}
//*********************************************************************************
function createOCSPResp()
{
	return Promise.resolve().then(() => createOCSPRespInternal()).then(() =>
	{
		let resultString = "-----BEGIN CERTIFICATE-----\r\n";
		resultString = `${resultString}${formatPEM(toBase64(arrayBufferToString(certificateBuffer)))}`;
		resultString = `${resultString}\r\n-----END CERTIFICATE-----\r\n`;
		
		alert("Certificate created successfully!");
		
		resultString = `${resultString}\r\n-----BEGIN PRIVATE KEY-----\r\n`;
		resultString = `${resultString}${formatPEM(toBase64(arrayBufferToString(privateKeyBuffer)))}`;
		resultString = `${resultString}\r\n-----END PRIVATE KEY-----\r\n`;
		
		alert("Private key exported successfully!");
		
		resultString = `${resultString}\r\n-----BEGIN OCSP RESPONSE-----\r\n`;
		resultString = `${resultString}${formatPEM(toBase64(arrayBufferToString(ocspResponseBuffer)))}`;
		resultString = `${resultString}\r\n-----END OCSP RESPONSE-----\r\n\r\n`;
		
		// noinspection InnerHTMLJS
		document.getElementById("new_signed_data").innerHTML = resultString;
		
		parseOCSPResp();
		
		alert("OCSP response has created successfully!");
	});
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region Parse existing OCSP response 
//*********************************************************************************
function parseOCSPResp()
{
	//region Initial variables 
	let ocspBasicResp;
	//endregion 
	
	//region Initial activities 
	document.getElementById("ocsp-resp-extensions").style.display = "none";
	document.getElementById("ocsp-resp-rspid-rdn").style.display = "none";
	document.getElementById("ocsp-resp-rspid-simpl").style.display = "none";
	
	const respIDTable = document.getElementById("ocsp-resp-respid-rdn");
	while(respIDTable.rows.length > 1)
		respIDTable.deleteRow(respIDTable.rows.length - 1);
	
	const extensionTable = document.getElementById("ocsp-resp-extensions-table");
	while(extensionTable.rows.length > 1)
		extensionTable.deleteRow(extensionTable.rows.length - 1);
	
	const responsesTable = document.getElementById("ocsp-resp-attr-table");
	while(extensionTable.rows.length > 1)
		extensionTable.deleteRow(extensionTable.rows.length - 1);
	//endregion
	
	//region Decode existing OCSP response 
	const asn1 = asn1js.fromBER(ocspResponseBuffer);
	const ocspRespSimpl = new OCSPResponse({ schema: asn1.result });
	//endregion 
	
	//region Put information about overall response status 
	let status = "";
	
	switch(ocspRespSimpl.responseStatus.valueBlock.valueDec)
	{
		case 0:
			status = "successful";
			break;
		case 1:
			status = "malformedRequest";
			break;
		case 2:
			status = "internalError";
			break;
		case 3:
			status = "tryLater";
			break;
		case 4:
			status = "<not used>";
			break;
		case 5:
			status = "sigRequired";
			break;
		case 6:
			status = "unauthorized";
			break;
		default:
			alert("Wrong OCSP response status");
			return;
	}
	
	// noinspection InnerHTMLJS
	document.getElementById("resp-status").innerHTML = status;
	//endregion 
	
	//region Check that we do have "responseBytes" 
	if("responseBytes" in ocspRespSimpl)
	{
		const asn1Basic = asn1js.fromBER(ocspRespSimpl.responseBytes.response.valueBlock.valueHex);
		ocspBasicResp = new BasicOCSPResponse({ schema: asn1Basic.result });
	}
	else
		return; // Nothing else to display - only status information exists
	//endregion 
	
	//region Put information about signature algorithm 
	const algomap = {
		"1.2.840.113549.2.1": "MD2",
		"1.2.840.113549.1.1.2": "MD2 with RSA",
		"1.2.840.113549.2.5": "MD5",
		"1.2.840.113549.1.1.4": "MD5 with RSA",
		"1.3.14.3.2.26": "SHA1",
		"1.2.840.10040.4.3": "SHA1 with DSA",
		"1.2.840.10045.4.1": "SHA1 with ECDSA",
		"1.2.840.113549.1.1.5": "SHA1 with RSA",
		"2.16.840.1.101.3.4.2.4": "SHA224",
		"1.2.840.113549.1.1.14": "SHA224 with RSA",
		"2.16.840.1.101.3.4.2.1": "SHA256",
		"1.2.840.113549.1.1.11": "SHA256 with RSA",
		"2.16.840.1.101.3.4.2.2": "SHA384",
		"1.2.840.113549.1.1.12": "SHA384 with RSA",
		"2.16.840.1.101.3.4.2.3": "SHA512",
		"1.2.840.113549.1.1.13": "SHA512 with RSA"
	};
	
	let signatureAlgorithm = algomap[ocspBasicResp.signatureAlgorithm.algorithmId];
	if(typeof signatureAlgorithm === "undefined")
		signatureAlgorithm = ocspBasicResp.signatureAlgorithm.algorithmId;
	else
		signatureAlgorithm = `${signatureAlgorithm} (${ocspBasicResp.signatureAlgorithm.algorithmId})`;
	
	// noinspection InnerHTMLJS
	document.getElementById("sig-algo").innerHTML = signatureAlgorithm;
	//endregion 
	
	//region Put information about "Responder ID" 
	if(ocspBasicResp.tbsResponseData.responderID instanceof RelativeDistinguishedNames)
	{
		const typemap = {
			"2.5.4.6": "C",
			"2.5.4.10": "O",
			"2.5.4.11": "OU",
			"2.5.4.3": "CN",
			"2.5.4.7": "L",
			"2.5.4.8": "S",
			"2.5.4.12": "T",
			"2.5.4.42": "GN",
			"2.5.4.43": "I",
			"2.5.4.4": "SN",
			"1.2.840.113549.1.9.1": "E-mail"
		};
		
		for(let i = 0; i < ocspBasicResp.tbsResponseData.responderID.typesAndValues.length; i++)
		{
			let typeval = typemap[ocspBasicResp.tbsResponseData.responderID.typesAndValues[i].type];
			if(typeof typeval === "undefined")
				typeval = ocspBasicResp.tbsResponseData.responderID.typesAndValues[i].type;
			
			const subjval = ocspBasicResp.tbsResponseData.responderID.typesAndValues[i].value.valueBlock.value;
			
			const row = respIDTable.insertRow(respIDTable.rows.length);
			const cell0 = row.insertCell(0);
			// noinspection InnerHTMLJS
			cell0.innerHTML = typeval;
			const cell1 = row.insertCell(1);
			// noinspection InnerHTMLJS
			cell1.innerHTML = subjval;
		}
		
		document.getElementById("ocsp-resp-rspid-rdn").style.display = "block";
	}
	else
	{
		if(ocspBasicResp.tbsResponseData.responderID instanceof asn1js.OctetString)
		{
			// noinspection InnerHTMLJS
			document.getElementById("ocsp-resp-respid-simpl").innerHTML = bufferToHexCodes(ocspBasicResp.tbsResponseData.responderID.valueBlock.valueHex, 0, ocspBasicResp.tbsResponseData.responderID.valueBlock.valueHex.byteLength);
			document.getElementById("ocsp-resp-rspid-simpl").style.display = "block";
		}
		else
		{
			alert("Wrong OCSP response responderID");
			return;
		}
	}
	//endregion 
	
	//region Put information about a time when the response was produced 
	// noinspection InnerHTMLJS
	document.getElementById("prod-at").innerHTML = ocspBasicResp.tbsResponseData.producedAt.toString();
	//endregion 
	
	//region Put information about extensions of the OCSP response 
	if("responseExtensions" in ocspBasicResp)
	{
		const extenmap = {
			"1.3.6.1.5.5.7.48.1.2": "Nonce",
			"1.3.6.1.5.5.7.48.1.3": "CRL References",
			"1.3.6.1.5.5.7.48.1.4": "Acceptable Response Types",
			"1.3.6.1.5.5.7.48.1.6": "Archive Cutoff",
			"1.3.6.1.5.5.7.48.1.7": "Service Locator",
			"1.3.6.1.5.5.7.48.1.8": "Preferred Signature Algorithms",
			"1.3.6.1.5.5.7.48.1.9": "Extended Revoked Definition",
			"2.5.29.21": "CRL Reason",
			"2.5.29.24": "Invalidity Date",
			"2.5.29.29": "Certificate Issuer",
			"1.3.6.1.4.1.311.21.4": "Next Update"
		};
		
		for(let i = 0; i < ocspBasicResp.responseExtensions.length; i++)
		{
			let typeval = extenmap[ocspBasicResp.responseExtensions[i].extnID];
			if(typeof typeval === "undefined")
				typeval = ocspBasicResp.responseExtensions[i].extnID;
			
			const row = extensionTable.insertRow(extensionTable.rows.length);
			const cell0 = row.insertCell(0);
			// noinspection InnerHTMLJS
			cell0.innerHTML = typeval;
		}
		
		document.getElementById("ocsp-resp-extensions").style.display = "block";
	}
	//endregion 
	
	//region Put information about OCSP responses
	for(let i = 0; i < ocspBasicResp.tbsResponseData.responses.length; i++)
	{
		const typeval = bufferToHexCodes(ocspBasicResp.tbsResponseData.responses[i].certID.serialNumber.valueBlock.valueHex);
		let subjval = "";
		
		switch(ocspBasicResp.tbsResponseData.responses[i].certStatus.idBlock.tagNumber)
		{
			case 0:
				subjval = "good";
				break;
			case 1:
				subjval = "revoked";
				break;
			case 2:
			default:
				subjval = "unknown";
		}
		
		const row = responsesTable.insertRow(responsesTable.rows.length);
		const cell0 = row.insertCell(0);
		// noinspection InnerHTMLJS
		cell0.innerHTML = typeval;
		const cell1 = row.insertCell(1);
		// noinspection InnerHTMLJS
		cell1.innerHTML = subjval;
	}
	//endregion 
	
	document.getElementById("ocsp-resp-data-block").style.display = "block";
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region Verify existing OCSP response 
//*********************************************************************************
function verifyOCSPRespInternal()
{
	//region Initial variables
	let ocspBasicResp;
	//endregion
	
	//region Decode existing OCSP response
	const asn1 = asn1js.fromBER(ocspResponseBuffer);
	const ocspRespSimpl = new OCSPResponse({ schema: asn1.result });
	
	if("responseBytes" in ocspRespSimpl)
	{
		const asn1Basic = asn1js.fromBER(ocspRespSimpl.responseBytes.response.valueBlock.valueHex);
		ocspBasicResp = new BasicOCSPResponse({ schema: asn1Basic.result });
	}
	else
		return Promise.reject("No \"ResponseBytes\" in the OCSP Response - nothing to verify");
	//endregion
	
	//region Verify OCSP response
	return ocspBasicResp.verify({ trustedCerts: trustedCertificates });
	//endregion
}
//*********************************************************************************
function verifyOCSPResp()
{
	return Promise.resolve().then(() => verifyOCSPRespInternal()).then(
		result =>
		{
			alert(`Verification result: ${result}`);
		},
		error =>
		{
			alert(`Error during verification: ${error}`);
		}
	);
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region Parse "CA Bundle" file 
//*********************************************************************************
function parseCAbundle(buffer)
{
	//region Initial variables 
	const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	
	const startChars = "-----BEGIN CERTIFICATE-----";
	const endChars = "-----END CERTIFICATE-----";
	const endLineChars = "\r\n";
	
	const view = new Uint8Array(buffer);
	
	let waitForStart = false;
	let middleStage = true;
	let waitForEnd = false;
	let waitForEndLine = false;
	let started = false;
	
	let certBodyEncoded = "";
	//endregion 
	
	for(let i = 0; i < view.length; i++)
	{
		if(started === true)
		{
			if(base64Chars.indexOf(String.fromCharCode(view[i])) !== (-1))
				certBodyEncoded += String.fromCharCode(view[i]);
			else
			{
				if(String.fromCharCode(view[i]) === "-")
				{
					//region Decoded trustedCertificates 
					const asn1 = asn1js.fromBER(stringToArrayBuffer(window.atob(certBodyEncoded)));
					try
					{
						trustedCertificates.push(new Certificate({ schema: asn1.result }));
					}
					catch(ex)
					{
						alert("Wrong certificate format");
						return;
					}
					//endregion 
					
					//region Set all "flag variables" 
					certBodyEncoded = "";
					
					started = false;
					waitForEnd = true;
					//endregion 
				}
			}
		}
		else
		{
			if(waitForEndLine === true)
			{
				if(endLineChars.indexOf(String.fromCharCode(view[i])) === (-1))
				{
					waitForEndLine = false;
					
					if(waitForEnd === true)
					{
						waitForEnd = false;
						middleStage = true;
					}
					else
					{
						if(waitForStart === true)
						{
							waitForStart = false;
							started = true;
							
							certBodyEncoded += String.fromCharCode(view[i]);
						}
						else
							middleStage = true;
					}
				}
			}
			else
			{
				if(middleStage === true)
				{
					if(String.fromCharCode(view[i]) === "-")
					{
						if((i === 0) ||
							((String.fromCharCode(view[i - 1]) === "\r") ||
							(String.fromCharCode(view[i - 1]) === "\n")))
						{
							middleStage = false;
							waitForStart = true;
						}
					}
				}
				else
				{
					if(waitForStart === true)
					{
						if(startChars.indexOf(String.fromCharCode(view[i])) === (-1))
							waitForEndLine = true;
					}
					else
					{
						if(waitForEnd === true)
						{
							if(endChars.indexOf(String.fromCharCode(view[i])) === (-1))
								waitForEndLine = true;
						}
					}
				}
			}
		}
	}
}
//*********************************************************************************
//endregion 
//*********************************************************************************
function handleFileBrowse(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	// noinspection AnonymousFunctionJS
	tempReader.onload =
		event =>
		{
			// noinspection JSUnresolvedVariable
			ocspResponseBuffer = event.target.result;
			parseOCSPResp();
		};
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
function handleCABundle(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	// noinspection AnonymousFunctionJS, JSUnresolvedVariable
	tempReader.onload = event => parseCAbundle(event.target.result);
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
function handleHashAlgOnChange()
{
	const hashOption = document.getElementById("hash_alg").value;
	switch(hashOption)
	{
		case "alg_SHA1":
			hashAlg = "sha-1";
			break;
		case "alg_SHA256":
			hashAlg = "sha-256";
			break;
		case "alg_SHA384":
			hashAlg = "sha-384";
			break;
		case "alg_SHA512":
			hashAlg = "sha-512";
			break;
		default:
	}
}
//*********************************************************************************
function handleSignAlgOnChange()
{
	const signOption = document.getElementById("sign_alg").value;
	switch(signOption)
	{
		case "alg_RSA15":
			signAlg = "RSASSA-PKCS1-V1_5";
			break;
		case "alg_RSA2":
			signAlg = "RSA-PSS";
			break;
		case "alg_ECDSA":
			signAlg = "ECDSA";
			break;
		default:
	}
}
//*********************************************************************************
context("Hack for Rollup.js", () =>
{
	return;
	
	// noinspection UnreachableCodeJS
	createOCSPResp();
	verifyOCSPResp();
	parseCAbundle();
	handleFileBrowse();
	handleCABundle();
	handleHashAlgOnChange();
	handleSignAlgOnChange();
	setEngine();
});
//*********************************************************************************
context("OCSP Response Complex Example", () =>
{
	//region Initial variables
	const hashAlgs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
	const signAlgs = ["RSASSA-PKCS1-V1_5", "ECDSA", "RSA-PSS"];
	//endregion
	
	signAlgs.forEach(_signAlg =>
	{
		hashAlgs.forEach(_hashAlg =>
		{
			const testName = `${_hashAlg} + ${_signAlg}`;
			
			it(testName, () =>
			{
				hashAlg = _hashAlg;
				signAlg = _signAlg;
				
				return createOCSPRespInternal().then(() =>
				{
					const asn1 = asn1js.fromBER(ocspResponseBuffer);
					// noinspection JSUnusedLocalSymbols
					const ocspResponse = new OCSPResponse({ schema: asn1.result });
					
					return verifyOCSPRespInternal().then(result =>
					{
						assert.equal(result, true, "OCSP Response must be verified sucessfully");
					});
				});
			});
		});
	});
});
//*********************************************************************************
