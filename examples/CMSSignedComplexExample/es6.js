import * as asn1js from "asn1js";
import { stringToArrayBuffer, bufferToHexCodes } from "pvutils";
import { getCrypto, getAlgorithmParameters, setEngine } from "../../src/common";
import Certificate from "../../src/Certificate";
import AttributeTypeAndValue from "../../src/AttributeTypeAndValue";
import Extension from "../../src/Extension";
import Attribute from "../../src/Attribute";
import SignedData from "../../src/SignedData";
import EncapsulatedContentInfo from "../../src/EncapsulatedContentInfo";
import SignerInfo from "../../src/SignerInfo";
import IssuerAndSerialNumber from "../../src/IssuerAndSerialNumber";
import SignedAndUnsignedAttributes from "../../src/SignedAndUnsignedAttributes";
import ContentInfo from "../../src/ContentInfo";
//<nodewebcryptoossl>
//*********************************************************************************
let cmsSignedBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CMS_Signed
let certificateBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CERT
let privateKeyBuffer = new ArrayBuffer(0);
let dataBuffer = new ArrayBuffer(0);

let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-v1_5";
let addExt = false;
let detachedSignature = false;

const trustedCertificates = []; // Array of root certificates from "CA Bundle"
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
		
		resultString = resultString + pemString[i];
	}
	
	return resultString;
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
				certBodyEncoded = certBodyEncoded + String.fromCharCode(view[i]);
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
							
							certBodyEncoded = certBodyEncoded + String.fromCharCode(view[i]);
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
//region Parse existing CMS_Signed
//*********************************************************************************
function parseCMSSigned()
{
	//region Initial check
	if(cmsSignedBuffer.byteLength === 0)
	{
		alert("Nothing to parse!");
		return;
	}
	//endregion
	
	//region Initial activities
	document.getElementById("cms-dgst-algos").innerHTML = "";
	
	document.getElementById("cms-certs").style.display = "none";
	document.getElementById("cms-crls").style.display = "none";
	
	const certificatesTable = document.getElementById("cms-certificates");
	while(certificatesTable.rows.length > 1)
		certificatesTable.deleteRow(certificatesTable.rows.length - 1);
	
	const crlsTable = document.getElementById("cms-rev-lists");
	while(crlsTable.rows.length > 1)
		crlsTable.deleteRow(crlsTable.rows.length - 1);
	//endregion
	
	//region Decode existing CMS Signed Data
	const asn1 = asn1js.fromBER(cmsSignedBuffer);
	const cmsContentSimpl = new ContentInfo({ schema: asn1.result });
	const cmsSignedSimpl = new SignedData({ schema: cmsContentSimpl.content });
	//endregion
	
	//region Put information about digest algorithms in the CMS Signed Data
	const dgstmap = {
		"1.3.14.3.2.26": "SHA-1",
		"2.16.840.1.101.3.4.2.1": "SHA-256",
		"2.16.840.1.101.3.4.2.2": "SHA-384",
		"2.16.840.1.101.3.4.2.3": "SHA-512"
	};
	
	for(let i = 0; i < cmsSignedSimpl.digestAlgorithms.length; i++)
	{
		let typeval = dgstmap[cmsSignedSimpl.digestAlgorithms[i].algorithmId];
		if(typeof typeval === "undefined")
			typeval = cmsSignedSimpl.digestAlgorithms[i].algorithmId;
		
		const ulrow = `<li><p><span>${typeval}</span></p></li>`;
		
		document.getElementById("cms-dgst-algos").innerHTML = document.getElementById("cms-dgst-algos").innerHTML + ulrow;
	}
	//endregion
	
	//region Put information about encapsulated content type
	const contypemap = {
		"1.3.6.1.4.1.311.2.1.4": "Authenticode signing information",
		"1.2.840.113549.1.7.1": "Data content"
	};
	
	let eContentType = contypemap[cmsSignedSimpl.encapContentInfo.eContentType];
	if(typeof eContentType === "undefined")
		eContentType = cmsSignedSimpl.encapContentInfo.eContentType;
	
	document.getElementById("cms-encap-type").innerHTML = eContentType;
	//endregion
	
	//region Put information about included certificates
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
	
	if("certificates" in cmsSignedSimpl)
	{
		for(let j = 0; j < cmsSignedSimpl.certificates.length; j++)
		{
			let ul = "<ul>";
			
			for(let i = 0; i < cmsSignedSimpl.certificates[j].issuer.typesAndValues.length; i++)
			{
				let typeval = rdnmap[cmsSignedSimpl.certificates[j].issuer.typesAndValues[i].type];
				if(typeof typeval === "undefined")
					typeval = cmsSignedSimpl.certificates[j].issuer.typesAndValues[i].type;
				
				const subjval = cmsSignedSimpl.certificates[j].issuer.typesAndValues[i].value.valueBlock.value;
				const ulrow = `<li><p><span>${typeval}</span> ${subjval}</p></li>`;
				
				ul = ul + ulrow;
			}
			
			ul = `${ul}</ul>`;
			
			const row = certificatesTable.insertRow(certificatesTable.rows.length);
			const cell0 = row.insertCell(0);
			cell0.innerHTML = bufferToHexCodes(cmsSignedSimpl.certificates[j].serialNumber.valueBlock.valueHex);
			const cell1 = row.insertCell(1);
			cell1.innerHTML = ul;
		}
		
		document.getElementById("cms-certs").style.display = "block";
	}
	//endregion
	
	//region Put information about included CRLs
	if("crls" in cmsSignedSimpl)
	{
		for(let j = 0; j < cmsSignedSimpl.crls.length; j++)
		{
			let ul = "<ul>";
			
			for(let i = 0; i < cmsSignedSimpl.crls[j].issuer.typesAndValues.length; i++)
			{
				let typeval = rdnmap[cmsSignedSimpl.crls[j].issuer.typesAndValues[i].type];
				if(typeof typeval === "undefined")
					typeval = cmsSignedSimpl.crls[j].issuer.typesAndValues[i].type;
				
				const subjval = cmsSignedSimpl.crls[j].issuer.typesAndValues[i].value.valueBlock.value;
				const ulrow = `<li><p><span>${typeval}</span> ${subjval}</p></li>`;
				
				ul = ul + ulrow;
			}
			
			ul = `${ul}</ul>`;
			
			const row = crlsTable.insertRow(certificatesTable.rows.length);
			const cell = row.insertCell(0);
			cell.innerHTML = ul;
		}
		
		document.getElementById("cms-certs").style.display = "block";
	}
	//endregion
	
	//region Put information about number of signers
	document.getElementById("cms-signs").innerHTML = cmsSignedSimpl.signerInfos.length.toString();
	//endregion
	
	document.getElementById("cms-signed-data-block").style.display = "block";
}
//*********************************************************************************
//endregion
//*********************************************************************************
//region Create CMS_Signed
//*********************************************************************************
function createCMSSignedInternal()
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
	
	//region "KeyUsage" extension
	const bitArray = new ArrayBuffer(1);
	const bitView = new Uint8Array(bitArray);
	
	bitView[0] = bitView[0] | 0x02; // Key usage "cRLSign" flag
	//bitView[0] = bitView[0] | 0x04; // Key usage "keyCertSign" flag
	
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
			trustedCertificates.push(certSimpl);
			certificateBuffer = certSimpl.toSchema(true).toBER(false);
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
	
	//region Check if user wants us to include signed extensions
	if(addExt)
	{
		//region Create a message digest
		sequence = sequence.then(
			() => crypto.digest({ name: hashAlg }, new Uint8Array(dataBuffer))
		);
		//endregion
		
		//region Combine all signed extensions
		sequence = sequence.then(
			result =>
			{
				const signedAttr = [];
				
				signedAttr.push(new Attribute({
					type: "1.2.840.113549.1.9.3",
					values: [
						new asn1js.ObjectIdentifier({ value: "1.2.840.113549.1.7.1" })
					]
				})); // contentType
				
				signedAttr.push(new Attribute({
					type: "1.2.840.113549.1.9.5",
					values: [
						new asn1js.UTCTime({ valueDate: new Date() })
					]
				})); // signingTime
				
				signedAttr.push(new Attribute({
					type: "1.2.840.113549.1.9.4",
					values: [
						new asn1js.OctetString({ valueHex: result })
					]
				})); // messageDigest
				
				return signedAttr;
			}
		);
		//endregion
	}
	//endregion
	
	//region Initialize CMS Signed Data structures and sign it
	sequence = sequence.then(
		result =>
		{
			cmsSignedSimpl = new SignedData({
				version: 1,
				encapContentInfo: new EncapsulatedContentInfo({
					eContentType: "1.2.840.113549.1.7.1" // "data" content type
				}),
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
			
			if(addExt)
			{
				cmsSignedSimpl.signerInfos[0].signedAttrs = new SignedAndUnsignedAttributes({
					type: 0,
					attributes: result
				});
			}
			
			if(detachedSignature === false)
			{
				const contentInfo = new EncapsulatedContentInfo({
					eContent: new asn1js.OctetString({ valueHex: dataBuffer })
				});
				
				cmsSignedSimpl.encapContentInfo.eContent = contentInfo.eContent;
				
				return cmsSignedSimpl.sign(privateKey, 0, hashAlg);
			}
			
			return cmsSignedSimpl.sign(privateKey, 0, hashAlg, dataBuffer);
		}
	);
	//endregion
	
	//region Create final result
	sequence.then(
		() =>
		{
			const cmsSignedSchema = cmsSignedSimpl.toSchema(true);
			
			const cmsContentSimp = new ContentInfo({
				contentType: "1.2.840.113549.1.7.2",
				content: cmsSignedSchema
			});
			
			const _cmsSignedSchema = cmsContentSimp.toSchema(true);
			
			//region Make length of some elements in "indefinite form"
			_cmsSignedSchema.lenBlock.isIndefiniteForm = true;
			
			const block1 = _cmsSignedSchema.valueBlock.value[1];
			block1.lenBlock.isIndefiniteForm = true;
			
			const block2 = block1.valueBlock.value[0];
			block2.lenBlock.isIndefiniteForm = true;
			
			if(detachedSignature === false)
			{
				const block3 = block2.valueBlock.value[2];
				block3.lenBlock.isIndefiniteForm = true;
				block3.valueBlock.value[1].lenBlock.isIndefiniteForm = true;
				block3.valueBlock.value[1].valueBlock.value[0].lenBlock.isIndefiniteForm = true;
			}
			//endregion
			
			cmsSignedBuffer = _cmsSignedSchema.toBER(false);
		},
		error => Promise.reject(`Erorr during signing of CMS Signed Data: ${error}`)
	);
	//endregion
	
	return sequence;
}
//*********************************************************************************
function createCMSSigned()
{
	return createCMSSignedInternal().then(() =>
	{
		const certSimplString = String.fromCharCode.apply(null, new Uint8Array(certificateBuffer));
		
		let resultString = "-----BEGIN CERTIFICATE-----\r\n";
		resultString = resultString + formatPEM(window.btoa(certSimplString));
		resultString = `${resultString}\r\n-----END CERTIFICATE-----\r\n`;
		
		alert("Certificate created successfully!");
		
		const privateKeyString = String.fromCharCode.apply(null, new Uint8Array(privateKeyBuffer));
		
		resultString = `${resultString}\r\n-----BEGIN PRIVATE KEY-----\r\n`;
		resultString = resultString + formatPEM(window.btoa(privateKeyString));
		resultString = `${resultString}\r\n-----END PRIVATE KEY-----\r\n`;
		
		document.getElementById("new_signed_data").innerHTML = resultString;
		
		alert("Private key exported successfully!");
		
		const signedDataString = String.fromCharCode.apply(null, new Uint8Array(cmsSignedBuffer));

		resultString = `${resultString}\r\n-----BEGIN CMS-----\r\n`;
		resultString = resultString + formatPEM(window.btoa(signedDataString));
		resultString = `${resultString}\r\n-----END CMS-----\r\n\r\n`;
		
		document.getElementById("new_signed_data").innerHTML = resultString;
		
		parseCMSSigned();
		
		alert("CMS Signed Data created successfully!");
	});
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region Verify existing CMS_Signed
//*********************************************************************************
function verifyCMSSignedInternal()
{
	//region Initial check
	if(cmsSignedBuffer.byteLength === 0)
		return Promise.reject("Nothing to verify!");
	//endregion
	
	return Promise.resolve().then(() =>
	{
		//region Decode existing CMS_Signed
		const asn1 = asn1js.fromBER(cmsSignedBuffer);
		const cmsContentSimpl = new ContentInfo({ schema: asn1.result });
		const cmsSignedSimpl = new SignedData({ schema: cmsContentSimpl.content });
		//endregion
		
		//region Verify CMS_Signed
		const verificationParameters = {
			signer: 0,
			trustedCerts: trustedCertificates
		};
		if(detachedSignature)
			verificationParameters.data = dataBuffer;
		
		return cmsSignedSimpl.verify(verificationParameters);
	});
	//endregion
}
//*********************************************************************************
function verifyCMSSigned()
{
	//region Initial check
	if(cmsSignedBuffer.byteLength === 0)
	{
		alert("Nothing to verify!");
		return;
	}
	//endregion
	
	return verifyCMSSignedInternal().
	then(
		result => alert(`Verification result: ${result}`),
		error => alert(`Error during verification: ${error}`)
	);
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region Functions handling file selection
//*********************************************************************************
function handleFileBrowse(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	tempReader.onload =
		event =>
		{
			dataBuffer = event.target.result;
			createCMSSigned();
		};
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
function handleParsingFile(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	tempReader.onload =
		event =>
		{
			cmsSignedBuffer = event.target.result;
			parseCMSSigned();
		};
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
function handleCABundle(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	tempReader.onload =
		event => parseCAbundle(event.target.result);
	
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
function handleAddExtOnChange()
{
	addExt = document.getElementById("add_ext").checked;
}
//*********************************************************************************
function handleDetachedSignatureOnChange()
{
	detachedSignature = document.getElementById("detached_signature").checked;
}
//*********************************************************************************
//endregion
//*********************************************************************************
context("Hack for Rollup.js", () =>
{
	return;
	
	parseCMSSigned();
	createCMSSigned();
	verifyCMSSigned();
	parseCAbundle();
	handleFileBrowse();
	handleParsingFile();
	handleCABundle();
	handleHashAlgOnChange();
	handleSignAlgOnChange();
	handleAddExtOnChange();
	handleDetachedSignatureOnChange();
	setEngine();
});
//*********************************************************************************
context("CMS Signed Complex Example", () =>
{
	//region Initial variables
	const hashAlgs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
	const signAlgs = ["RSASSA-PKCS1-V1_5", "ECDSA", "RSA-PSS"];
	const addExts = [false, true];
	const detachedSignatures = [false, true];
	
	dataBuffer = (new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09])).buffer;
	//endregion
	
	signAlgs.forEach(_signAlg =>
	{
		hashAlgs.forEach(_hashAlg =>
		{
			addExts.forEach(_addExt =>
			{
				detachedSignatures.forEach(_detachedSignature =>
				{
					const testName = `${_hashAlg} + ${_signAlg}, add ext: ${_addExt}, detached signature: ${_detachedSignature}`;
					
					it(testName, () =>
					{
						hashAlg = _hashAlg;
						signAlg = _signAlg;
						addExt = _addExt;
						detachedSignature = _detachedSignature;
						
						return createCMSSignedInternal().then(() =>
						{
							//region Simple test for decoding data
							const asn1 = asn1js.fromBER(cmsSignedBuffer);
							const cmsContentSimpl = new ContentInfo({ schema: asn1.result });
							const cmsSignedSimpl = new SignedData({ schema: cmsContentSimpl.content });
							//endregion
							
							return verifyCMSSignedInternal().then(result =>
							{
								assert.equal(result, true, "CMS SignedData must be verified sucessfully");
							});
						});
					});
				});
			});
		});
	});
});
//*********************************************************************************
