/* eslint-disable no-unused-vars,no-undef,no-unreachable */
import { arrayBufferToString, bufferToHexCodes, toBase64 } from "pvutils";
import { getCrypto, getAlgorithmParameters, setEngine } from "../../src/common";
import { formatPEM } from "../../examples/examples_common";
import * as asn1js from "asn1js";
import Certificate from "../../src/Certificate";
import CertificateRevocationList from "../../src/CertificateRevocationList";
import AttributeTypeAndValue from "../../src/AttributeTypeAndValue";
import Time from "../../src/Time";
import RevokedCertificate from "../../src/RevokedCertificate";
import Extension from "../../src/Extension";
import Extensions from "../../src/Extensions";
import PublicKeyInfo from "../../src/PublicKeyInfo";
//<nodewebcryptoossl>
//*********************************************************************************
let crlBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CRL
let privateKeyBuffer = new ArrayBuffer(0);

let issuerCertificate = null;
let issuerPublicKey = null;

let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-V1_5";
//*********************************************************************************
//region Create CRL
//*********************************************************************************
function createCRLInternal()
{
	//region Initial variables
	let sequence = Promise.resolve();
	
	let publicKey;
	let privateKey;
	//endregion
	
	//region Get a "crypto" extension
	const crypto = getCrypto();
	if(typeof crypto === "undefined")
		return Promise.reject("No WebCrypto extension found");
	//endregion
	
	//region Put a static values
	const crlSimpl = new CertificateRevocationList();
	
	crlSimpl.version = 1;
	
	crlSimpl.issuer.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.6", // Country name
		value: new asn1js.PrintableString({
			value: "RU"
		})
	}));
	crlSimpl.issuer.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.3", // Common name
		value: new asn1js.BmpString({
			value: "Test"
		})
	}));
	
	crlSimpl.thisUpdate = new Time({
		type: 0,
		value: new Date()
	});
	
	const revokedCertificate = new RevokedCertificate({
		userCertificate: new asn1js.Integer({
			value: 999
		}),
		revocationDate: new Time({
			value: new Date()
		}),
		crlEntryExtensions: new Extensions({
			extensions: [new Extension({
				extnID: "2.5.29.21", // cRLReason
				extnValue: (new asn1js.Enumerated({
					value: 1
				})).toBER(false)
			})]
		})
	});
	
	crlSimpl.revokedCertificates = [];
	crlSimpl.revokedCertificates.push(revokedCertificate);
	crlSimpl.crlExtensions = new Extensions({
		extensions: [new Extension({
			extnID: "2.5.29.20", // cRLNumber
			extnValue: (new asn1js.Integer({
				value: 2
			})).toBER(false)
		})]
	});
	//endregion
	
	//region Create a new key pair
	sequence = sequence.then(() =>
	{
		//region Get default algorithm parameters for key generation
		const algorithm = getAlgorithmParameters(signAlg, "generatekey");
		if("hash" in algorithm.algorithm)
			algorithm.algorithm.hash.name = hashAlg;
		//endregion
		
		return crypto.generateKey(algorithm.algorithm, true, algorithm.usages);
	});
	//endregion
	
	//region Store new key in an interim variables
	sequence = sequence.then(keyPair =>
	{
		publicKey = keyPair.publicKey;
		privateKey = keyPair.privateKey;
		
		issuerPublicKey = new PublicKeyInfo();
		issuerPublicKey.importKey(publicKey);
	});
	//endregion
	
	//region Signing final CRL
	sequence = sequence.then(() => crlSimpl.sign(privateKey, hashAlg));
	//endregion
	
	//region Encode and store CRL
	sequence = sequence.then(() =>
	{
		crlBuffer = crlSimpl.toSchema(true).toBER(false);
		
	});
	//endregion
	
	//region Exporting private key
	sequence = sequence.then(() => crypto.exportKey("pkcs8", privateKey));
	//endregion
	
	//region Store exported key on Web page
	sequence = sequence.then(result =>
	{
		privateKeyBuffer = result;
	});
	//endregion
	
	return sequence;
}
//*********************************************************************************
function createCRL()
{
	return Promise.resolve().then(() => createCRLInternal()).then(() =>
	{
		let resultString = "-----BEGIN X509 CRL-----\r\n";
		resultString += formatPEM(toBase64(arrayBufferToString(crlBuffer)));
		resultString = `${resultString}\r\n-----END X509 CRL-----\r\n`;
		
		parseCRL();
		
		resultString = `${resultString}\r\n-----BEGIN PRIVATE KEY-----\r\n`;
		resultString += formatPEM(toBase64(arrayBufferToString(privateKeyBuffer)));
		resultString = `${resultString}\r\n-----END PRIVATE KEY-----\r\n`;
		
		// noinspection InnerHTMLJS
		document.getElementById("newSignedData").innerHTML = resultString;
	});
}
//*********************************************************************************
//endregion
//*********************************************************************************
//region Parse existing CRL
//*********************************************************************************
function parseCRL()
{
	//region Initial check
	if(crlBuffer.byteLength === 0)
	{
		alert("Nothing to parse");
		return;
	}
	//endregion
	
	//region Initial activities
	document.getElementById("crl-extn-div").style.display = "none";
	
	const revokedTable = document.getElementById("crl-rev-certs");
	while(revokedTable.rows.length > 1)
		revokedTable.deleteRow(revokedTable.rows.length - 1);
	
	const extensionTable = document.getElementById("crl-extn-table");
	while(extensionTable.rows.length > 1)
		extensionTable.deleteRow(extensionTable.rows.length - 1);
	
	const issuerTable = document.getElementById("crl-issuer-table");
	while(issuerTable.rows.length > 1)
		issuerTable.deleteRow(issuerTable.rows.length - 1);
	//endregion
	
	//region Decode existing CRL
	const asn1 = asn1js.fromBER(crlBuffer);
	const crlSimpl = new CertificateRevocationList({
		schema: asn1.result
	});
	//endregion
	
	//region Put information about CRL issuer
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
	
	for(let i = 0; i < crlSimpl.issuer.typesAndValues.length; i++)
	{
		let typeval = rdnmap[crlSimpl.issuer.typesAndValues[i].type];
		if(typeof typeval === "undefined")
		{
			typeval = crlSimpl.issuer.typesAndValues[i].type;
		}
		
		const subjval = crlSimpl.issuer.typesAndValues[i].value.valueBlock.value;
		
		const row = issuerTable.insertRow(issuerTable.rows.length);
		const cell0 = row.insertCell(0);
		// noinspection InnerHTMLJS
		cell0.innerHTML = typeval;
		const cell1 = row.insertCell(1);
		// noinspection InnerHTMLJS
		cell1.innerHTML = subjval;
	}
	//endregion
	
	//region Put information about issuance date
	// noinspection InnerHTMLJS
	document.getElementById("crl-this-update").innerHTML = crlSimpl.thisUpdate.value.toString();
	//endregion
	
	//region Put information about expiration date
	if("nextUpdate" in crlSimpl)
	{
		// noinspection InnerHTMLJS
		document.getElementById("crl-next-update").innerHTML = crlSimpl.nextUpdate.value.toString();
		document.getElementById("crl-next-update-div").style.display = "block";
	}
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
	};       // array mapping of common algorithm OIDs and corresponding types
	
	let signatureAlgorithm = algomap[crlSimpl.signature.algorithmId];
	if(typeof signatureAlgorithm === "undefined")
		signatureAlgorithm = crlSimpl.signature.algorithmId;
	else
		signatureAlgorithm = `${signatureAlgorithm} (${crlSimpl.signature.algorithmId})`;
	
	// noinspection InnerHTMLJS
	document.getElementById("crl-sign-algo").innerHTML = signatureAlgorithm;
	//endregion
	
	//region Put information about revoked certificates
	if("revokedCertificates" in crlSimpl)
	{
		for(let i = 0; i < crlSimpl.revokedCertificates.length; i++)
		{
			const row = revokedTable.insertRow(revokedTable.rows.length);
			const cell0 = row.insertCell(0);
			// noinspection InnerHTMLJS
			cell0.innerHTML = bufferToHexCodes(crlSimpl.revokedCertificates[i].userCertificate.valueBlock.valueHex);
			const cell1 = row.insertCell(1);
			// noinspection InnerHTMLJS
			cell1.innerHTML = crlSimpl.revokedCertificates[i].revocationDate.value.toString();
		}
		
		document.getElementById("crl-rev-certs-div").style.display = "block";
	}
	//endregion
	//region Put information about CRL extensions
	if("crlExtensions" in crlSimpl)
	{
		for(let i = 0; i < crlSimpl.crlExtensions.extensions.length; i++)
		{
			const row = extensionTable.insertRow(extensionTable.rows.length);
			const cell0 = row.insertCell(0);
			// noinspection InnerHTMLJS
			cell0.innerHTML = crlSimpl.crlExtensions.extensions[i].extnID;
		}
		
		document.getElementById("crl-extn-div").style.display = "block";
	}
	//endregion
}
//*********************************************************************************
//endregion
//*********************************************************************************
//region Verify existing CRL
//*********************************************************************************
function verifyCRLInternal()
{
	//region Initial check
	if(crlBuffer.byteLength === 0)
		return Promise.reject("Nothing to verify");
	
	if((issuerCertificate === null) && (issuerPublicKey === null))
		return Promise.reject("Load CRL's issuer certificate");
	//endregion
	
	//region Decode existing CRL
	const asn1 = asn1js.fromBER(crlBuffer);
	const crlSimpl = new CertificateRevocationList({
		schema: asn1.result
	});
	//endregion
	
	//region Verify CRL
	const verifyObject = {};
	
	if(issuerCertificate !== null)
		verifyObject.issuerCertificate = issuerCertificate;
	
	if(issuerPublicKey !== null)
		verifyObject.publicKeyInfo = issuerPublicKey;
	
	return crlSimpl.verify(verifyObject);
	//endregion
}
//*********************************************************************************
function verifyCRL()
{
	return Promise.resolve().then(() => verifyCRLInternal()).then(result =>
	{
		alert(`Verification result: ${result}`);
	}, error =>
	{
		alert(`Error during verification: ${error}`);
	});
}
//*********************************************************************************
//endregion
//*********************************************************************************
function handleFileBrowse(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	// noinspection AnonymousFunctionJS
	tempReader.onload = event =>
	{
		// noinspection JSUnresolvedVariable
		crlBuffer = event.target.result;
		parseCRL();
	};
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
function handleIssuerCert(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	// noinspection AnonymousFunctionJS, JSUnresolvedVariable
	tempReader.onload = event =>
	{
		issuerPublicKey = null;
		
		// noinspection JSUnresolvedVariable
		const asn1 = asn1js.fromBER(event.target.result);
		issuerCertificate = new Certificate({
			schema: asn1.result
		});
	};
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
// noinspection JSUnusedLocalSymbols
function handleHashAlgOnChange()
{
	const hashOption = document.getElementById("hashAlg").value;
	switch(hashOption)
	{
		case "algSHA1":
			hashAlg = "sha-1";
			break;
		case "algSHA256":
			hashAlg = "sha-256";
			break;
		case "algSHA384":
			hashAlg = "sha-384";
			break;
		case "algSHA512":
			hashAlg = "sha-512";
			break;
		default:
	}
}
//*********************************************************************************
// noinspection JSUnusedLocalSymbols
function handleSignAlgOnChange()
{
	const signOption = document.getElementById("signAlg").value;
	switch(signOption)
	{
		case "algRSA15":
			signAlg = "RSASSA-PKCS1-V1_5";
			break;
		case "algRSA2":
			signAlg = "RSA-PSS";
			break;
		case "algECDSA":
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
	createCRL();
	verifyCRL();
	handleFileBrowse();
	handleIssuerCert();
	setEngine();
});
//*********************************************************************************
context("CRL Complex Example", () =>
{
	//region Initial variables
	const hashAlgs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
	const signAlgs = ["RSASSA-PKCS1-V1_5", "ECDSA", "RSA-PSS"];
	
	const algorithmsMap = new Map([
		["SHA-1 + RSASSA-PKCS1-V1_5", "1.2.840.113549.1.1.5"],
		["SHA-256 + RSASSA-PKCS1-V1_5", "1.2.840.113549.1.1.11"],
		["SHA-384 + RSASSA-PKCS1-V1_5", "1.2.840.113549.1.1.12"],
		["SHA-512 + RSASSA-PKCS1-V1_5", "1.2.840.113549.1.1.13"],
		
		["SHA-1 + ECDSA", "1.2.840.10045.4.1"],
		["SHA-256 + ECDSA", "1.2.840.10045.4.3.2"],
		["SHA-384 + ECDSA", "1.2.840.10045.4.3.3"],
		["SHA-512 + ECDSA", "1.2.840.10045.4.3.4"],
		
		["SHA-1 + RSA-PSS", "1.2.840.113549.1.1.10"],
		["SHA-256 + RSA-PSS", "1.2.840.113549.1.1.10"],
		["SHA-384 + RSA-PSS", "1.2.840.113549.1.1.10"],
		["SHA-512 + RSA-PSS", "1.2.840.113549.1.1.10"]
	]);
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
				
				return createCRLInternal().then(() =>
				{
					const asn1 = asn1js.fromBER(crlBuffer);
					const crl = new CertificateRevocationList({ schema: asn1.result });
					
					assert.equal(crl.signatureAlgorithm.algorithmId, algorithmsMap.get(testName), `Signature algorithm must be ${testName}`);
					
					return verifyCRLInternal().then(result =>
					{
						assert.equal(result, true, "CRL must be verified sucessfully");
					});
				});
			});
		});
	});
});
//*********************************************************************************
