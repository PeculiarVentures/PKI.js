/* eslint-disable no-undef,no-unreachable,no-unused-vars */
import * as asn1js from "asn1js";
import { stringToArrayBuffer, arrayBufferToString, bufferToHexCodes, toBase64 } from "pvutils";
import { getCrypto, getAlgorithmParameters, setEngine, getOIDByAlgorithm } from "../../src/common";
import { formatPEM } from "../../examples/examples_common";
import Certificate from "../../src/Certificate";
import AttributeTypeAndValue from "../../src/AttributeTypeAndValue";
import Extension from "../../src/Extension";
import TSTInfo from "../../src/TSTInfo";
import MessageImprint from "../../src/MessageImprint";
import AlgorithmIdentifier from "../../src/AlgorithmIdentifier";
import Accuracy from "../../src/Accuracy";
import EncapsulatedContentInfo from "../../src/EncapsulatedContentInfo";
import SignedData from "../../src/SignedData";
import SignerInfo from "../../src/SignerInfo";
import IssuerAndSerialNumber from "../../src/IssuerAndSerialNumber";
import ContentInfo from "../../src/ContentInfo";
import TimeStampResp from "../../src/TimeStampResp";
import PKIStatusInfo from "../../src/PKIStatusInfo";
import BasicConstraints from "../../src/BasicConstraints";
//<nodewebcryptoossl>
//*********************************************************************************
let tspResponseBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created TSP response
let certificateBuffer = new ArrayBuffer(0);
let privateKeyBuffer = new ArrayBuffer(0);

let trustedCertificates = []; // Array of root certificates from "CA Bundle"
const testData = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09]);

let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-V1_5";
//*********************************************************************************
//region Create TSP response
//*********************************************************************************
function createTSPRespInternal()
{
	//region Initial variables
	let sequence = Promise.resolve();
	
	const certSimpl = new Certificate();
	let cmsSignedSimpl;
	
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
	
	certSimpl.notBefore.value = new Date(2016, 1, 1);
	certSimpl.notAfter.value = new Date(2019, 1, 1);
	
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
	
	//region Hash "testData" value
	sequence = sequence.then(
		() => crypto.digest(hashAlg, testData)
	);
	//endregion
	
	//region Create specific TST info structure to sign
	sequence = sequence.then(
		result =>
		{
			const hashedBuffer = new ArrayBuffer(4);
			const hashedView = new Uint8Array(hashedBuffer);
			hashedView[0] = 0x7F;
			hashedView[1] = 0x02;
			hashedView[2] = 0x03;
			hashedView[3] = 0x04;
			
			const tstInfoSimpl = new TSTInfo({
				version: 1,
				policy: "1.1.1",
				messageImprint: new MessageImprint({
					hashAlgorithm: new AlgorithmIdentifier({ algorithmId: getOIDByAlgorithm({ name: hashAlg }) }),
					hashedMessage: new asn1js.OctetString({ valueHex: result })
				}),
				serialNumber: new asn1js.Integer({ valueHex: hashedBuffer }),
				genTime: new Date(),
				ordering: true,
				accuracy: new Accuracy({
					seconds: 1,
					millis: 1,
					micros: 10
				}),
				nonce: new asn1js.Integer({ valueHex: hashedBuffer })
			});
			
			return tstInfoSimpl.toSchema().toBER(false);
		}
	);
	//endregion
	
	//region Initialize CMS Signed Data structures and sign it
	sequence = sequence.then(
		result =>
		{
			const encapContent = new EncapsulatedContentInfo();
			encapContent.eContentType = "1.2.840.113549.1.9.16.1.4"; // "tSTInfo" content type
			encapContent.eContent = new asn1js.OctetString({ valueHex: result });
			
			cmsSignedSimpl = new SignedData({
				version: 3,
				encapContentInfo: encapContent,
				signerInfos: [
					new SignerInfo({
						version: 1,
						sid: new IssuerAndSerialNumber({
							issuer: certSimpl.issuer,
							serialNumber: certSimpl.serialNumber
						})
					})
				],
				certificates: [certSimpl]
			});
			
			return cmsSignedSimpl.sign(privateKey, 0, hashAlg);
		}
	);
	//endregion
	
	//region Create internal CMS Signed Data
	sequence = sequence.then(
		() =>
		{
			const cmsSignedSchema = cmsSignedSimpl.toSchema(true);
			
			const cmsContentSimp = new ContentInfo({
				contentType: "1.2.840.113549.1.7.2",
				content: cmsSignedSchema
			});
			
			return cmsContentSimp.toSchema();
		},
		error => Promise.reject(`Erorr during signing of CMS Signed Data: ${error}`)
	);
	//endregion
	
	//region Finally create completed TSP response structure
	return sequence.then(
		result =>
		{
			const tspRespSimpl = new TimeStampResp({
				status: new PKIStatusInfo({ status: 0 }),
				timeStampToken: new ContentInfo({ schema: result })
			});
			
			tspResponseBuffer = tspRespSimpl.toSchema().toBER(false);
		}
	);
	//endregion
}
//*********************************************************************************
function createTSPResp()
{
	return Promise.resolve().then(() => createTSPRespInternal()).then(() =>
	{
		let resultString = "-----BEGIN CERTIFICATE-----\r\n";
		resultString = `${resultString}${formatPEM(toBase64(arrayBufferToString(certificateBuffer)))}`;
		resultString = `${resultString}\r\n-----END CERTIFICATE-----\r\n`;
		
		alert("Certificate created successfully!");
		
		resultString = `${resultString}\r\n-----BEGIN PRIVATE KEY-----\r\n`;
		resultString = `${resultString}${formatPEM(toBase64(arrayBufferToString(privateKeyBuffer)))}`;
		resultString = `${resultString}\r\n-----END PRIVATE KEY-----\r\n`;
		
		alert("Private key exported successfully!");
		
		resultString = `${resultString}\r\n-----BEGIN TSP RESPONSE-----\r\n`;
		resultString = `${resultString}${formatPEM(toBase64(arrayBufferToString(tspResponseBuffer)))}`;
		resultString = `${resultString}\r\n-----END TSP RESPONSE-----\r\n\r\n`;
		
		// noinspection InnerHTMLJS
		document.getElementById("new_signed_data").innerHTML = resultString;
		
		parseTSPResp();
		
		alert("TSP response has created successfully!");
	});
}
//*********************************************************************************
//endregion
//*********************************************************************************
//region Parse existing TSP response
//*********************************************************************************
function parseTSPResp()
{
	//region Initial activities
	document.getElementById("resp-accur").style.display = "none";
	document.getElementById("resp-ord").style.display = "none";
	document.getElementById("resp-non").style.display = "none";
	document.getElementById("resp-ts-rdn").style.display = "none";
	document.getElementById("resp-ts-simpl").style.display = "none";
	document.getElementById("resp-ext").style.display = "none";
	
	const imprTable = document.getElementById("resp-imprint");
	while(imprTable.rows.length > 1)
		imprTable.deleteRow(imprTable.rows.length - 1);
	
	const accurTable = document.getElementById("resp-accuracy");
	while(accurTable.rows.length > 1)
		accurTable.deleteRow(accurTable.rows.length - 1);
	
	const tsTable = document.getElementById("resp-tsa");
	while(tsTable.rows.length > 1)
		tsTable.deleteRow(tsTable.rows.length - 1);
	
	const extTable = document.getElementById("resp-extensions");
	while(extTable.rows.length > 1)
		extTable.deleteRow(extTable.rows.length - 1);
	//endregion
	
	//region Decode existing TSP response
	const asn1 = asn1js.fromBER(tspResponseBuffer);
	const tspRespSimpl = new TimeStampResp({ schema: asn1.result });
	//endregion
	
	//region Put information about TSP response status
	let status = "";
	
	switch(tspRespSimpl.status.status)
	{
		case 0:
			status = "granted";
			break;
		case 1:
			status = "grantedWithMods";
			break;
		case 2:
			status = "rejection";
			break;
		case 3:
			status = "waiting";
			break;
		case 4:
			status = "revocationWarning";
			break;
		case 5:
			status = "revocationNotification";
			break;
		default:
	}
	
	// noinspection InnerHTMLJS
	document.getElementById("resp-status").innerHTML = status;
	//endregion
	
	//region Parse internal CMS Signed Data
	if(("timeStampToken" in tspRespSimpl) === false)
	{
		alert("No additional info but PKIStatusInfo");
		return;
	}
	
	const signedSimpl = new SignedData({ schema: tspRespSimpl.timeStampToken.content });
	
	const asn1TST = asn1js.fromBER(signedSimpl.encapContentInfo.eContent.valueBlock.valueHex);
	const tstInfoSimpl = new TSTInfo({ schema: asn1TST.result });
	//endregion
	
	//region Put information about policy
	// noinspection InnerHTMLJS
	document.getElementById("resp-policy").innerHTML = tstInfoSimpl.policy;
	//endregion
	
	//region Put information about TST info message imprint
	const dgstmap = {
		"1.3.14.3.2.26": "SHA-1",
		"2.16.840.1.101.3.4.2.1": "SHA-256",
		"2.16.840.1.101.3.4.2.2": "SHA-384",
		"2.16.840.1.101.3.4.2.3": "SHA-512"
	};
	
	let hashAlgorithm = dgstmap[tstInfoSimpl.messageImprint.hashAlgorithm.algorithmId];
	if(typeof hashAlgorithm === "undefined")
		hashAlgorithm = tstInfoSimpl.messageImprint.hashAlgorithm.algorithmId;
	
	const imprintTable = document.getElementById("resp-imprint");
	
	const row = imprintTable.insertRow(imprintTable.rows.length);
	const cell0 = row.insertCell(0);
	// noinspection InnerHTMLJS
	cell0.innerHTML = hashAlgorithm;
	const cell1 = row.insertCell(1);
	// noinspection InnerHTMLJS
	cell1.innerHTML = bufferToHexCodes(tstInfoSimpl.messageImprint.hashedMessage.valueBlock.valueHex);
	//endregion
	
	//region Put information about TST info serial number
	// noinspection InnerHTMLJS
	document.getElementById("resp-serial").innerHTML = bufferToHexCodes(tstInfoSimpl.serialNumber.valueBlock.valueHex);
	//endregion
	
	//region Put information about the time when TST info was generated
	// noinspection InnerHTMLJS
	document.getElementById("resp-time").innerHTML = tstInfoSimpl.genTime.toString();
	//endregion
	
	//region Put information about TST info accuracy
	if("accuracy" in tstInfoSimpl)
	{
		const accuracyTable = document.getElementById("resp-accuracy");
		
		const rowInner = accuracyTable.insertRow(accuracyTable.rows.length);
		const cell0Inner = rowInner.insertCell(0);
		// noinspection InnerHTMLJS
		cell0Inner.innerHTML = (("seconds" in tstInfoSimpl.accuracy) ? tstInfoSimpl.accuracy.seconds : 0).toString();
		const cell1Inner = rowInner.insertCell(1);
		// noinspection InnerHTMLJS
		cell1Inner.innerHTML = (("millis" in tstInfoSimpl.accuracy) ? tstInfoSimpl.accuracy.millis : 0).toString();
		const cell2 = rowInner.insertCell(2);
		// noinspection InnerHTMLJS
		cell2.innerHTML = (("micros" in tstInfoSimpl.accuracy) ? tstInfoSimpl.accuracy.micros : 0).toString();
		
		document.getElementById("resp-accur").style.display = "block";
	}
	//endregion
	
	//region Put information about TST info ordering
	if("ordering" in tstInfoSimpl)
	{
		// noinspection InnerHTMLJS
		document.getElementById("resp-ordering").innerHTML = tstInfoSimpl.ordering.toString();
		document.getElementById("resp-ord").style.display = "block";
	}
	//endregion
	
	//region Put information about TST info nonce value
	if("nonce" in tstInfoSimpl)
	{
		// noinspection InnerHTMLJS
		document.getElementById("resp-nonce").innerHTML = bufferToHexCodes(tstInfoSimpl.nonce.valueBlock.valueHex);
		document.getElementById("resp-non").style.display = "block";
	}
	//endregion
	
	//region Put information about TST info TSA
	if("tsa" in tstInfoSimpl)
	{
		switch(tstInfoSimpl.tsa.type)
		{
			case 1: // rfc822Name
			case 2: // dNSName
			case 6: // uniformResourceIdentifier
				// noinspection InnerHTMLJS
				document.getElementById("resp-tsa-simpl").innerHTML = tstInfoSimpl.tsa.value.valueBlock.value;
				document.getElementById("resp-ts-simpl").style.display = "block";
				break;
			case 7: // iPAddress
				{
					const view = new Uint8Array(tstInfoSimpl.tsa.value.valueBlock.valueHex);
					
					// noinspection InnerHTMLJS
					document.getElementById("resp-tsa-simpl").innerHTML = `${view[0].toString()}.${view[1].toString()}.${view[2].toString()}.${view[3].toString()}`;
					document.getElementById("resp-ts-simpl").style.display = "block";
				}
				break;
			case 3: // x400Address
			case 5: // ediPartyName
				// noinspection InnerHTMLJS
				document.getElementById("resp-tsa-simpl").innerHTML = (tstInfoSimpl.tsa.type === 3) ? "<type \"x400Address\">" : "<type \"ediPartyName\">";
				document.getElementById("resp-ts-simpl").style.display = "block";
				break;
			case 4: // directoryName
				{
					const rdnmap = {
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
					
					const rdnTable = document.getElementById("resp-tsa");
					
					for(let i = 0; i < tstInfoSimpl.tsa.value.typesAndValues.length; i++)
					{
						let typeval = rdnmap[tstInfoSimpl.tsa.value.typesAndValues[i].type];
						if(typeof typeval === "undefined")
							typeval = tstInfoSimpl.tsa.value.typesAndValues[i].type;
						
						const subjval = tstInfoSimpl.tsa.value.typesAndValues[i].value.valueBlock.value;
						
						const rowInner = rdnTable.insertRow(rdnTable.rows.length);
						const cell0Inner = rowInner.insertCell(0);
						// noinspection InnerHTMLJS
						cell0Inner.innerHTML = typeval;
						const cell1Inner = rowInner.insertCell(1);
						// noinspection InnerHTMLJS
						cell1Inner.innerHTML = subjval;
					}
					
					document.getElementById("resp-ts-rdn").style.display = "block";
				}
				break;
			default:
		}
	}
	//endregion
	
	//region Put information about TST info extensions
	if("extensions" in tstInfoSimpl)
	{
		const extensionTable = document.getElementById("resp-extensions");
		
		for(let i = 0; i < tstInfoSimpl.extensions.length; i++)
		{
			const rowInner = extensionTable.insertRow(extensionTable.rows.length);
			const cell0Inner = rowInner.insertCell(0);
			// noinspection InnerHTMLJS
			cell0Inner.innerHTML = tstInfoSimpl.extensions[i].extnID;
		}
		
		document.getElementById("resp-ext").style.display = "block";
	}
	//endregion
}
//*********************************************************************************
//endregion
//*********************************************************************************
//region Verify existing TSP response
//*********************************************************************************
function verifyTSPRespInternal()
{
	//region Decode existing TSP response
	const asn1 = asn1js.fromBER(tspResponseBuffer);
	const tspRespSimpl = new TimeStampResp({ schema: asn1.result });
	//endregion
	
	//region Verify TSP response
	return tspRespSimpl.verify({ signer: 0, trustedCerts: trustedCertificates, data: testData.buffer });
	//endregion
}
//*********************************************************************************
function verifyTSPResp()
{
	return Promise.resolve().then(() =>  verifyTSPRespInternal()).then(
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
			tspResponseBuffer = event.target.result;
			parseTSPResp();
		};
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
function handleCABundle(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	// noinspection AnonymousFunctionJS
	tempReader.onload =
		event =>
		{
			// noinspection JSUnresolvedVariable
			parseCAbundle(event.target.result);
		};
	
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
	createTSPResp();
	parseTSPResp();
	verifyTSPResp();
	handleFileBrowse();
	handleCABundle();
	handleHashAlgOnChange();
	handleSignAlgOnChange();
	setEngine();
});
//*********************************************************************************
context("TSP Response Complex Example", () =>
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
				
				return createTSPRespInternal().then(() =>
				{
					const asn1 = asn1js.fromBER(tspResponseBuffer);
					// noinspection JSUnusedLocalSymbols
					const tspResponse = new TimeStampResp({ schema: asn1.result });
					
					return verifyTSPRespInternal().then(result =>
					{
						assert.equal(result, true, "TSP Response must be verified sucessfully");
					});
				});
			});
		});
	});
});
//*********************************************************************************
