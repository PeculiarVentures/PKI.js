/* eslint-disable no-undef,no-unreachable */
import * as asn1js from "asn1js";
import { getCrypto, getAlgorithmParameters, setEngine } from "../../src/common";
import { formatPEM } from "../../examples/examples_common";
import { arrayBufferToString, toBase64 } from "pvutils";
import Certificate from "../../src/Certificate";
import AttributeTypeAndValue from "../../src/AttributeTypeAndValue";
import Extension from "../../src/Extension";
import SignedData from "../../src/SignedData";
import EncapsulatedContentInfo from "../../src/EncapsulatedContentInfo";
import ContentInfo from "../../src/ContentInfo";
//<nodewebcryptoossl>
//*********************************************************************************
let cmsSignedBuffer = new ArrayBuffer(0);

let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-v1_5";
//*********************************************************************************
//region Create P7B Data
//*********************************************************************************
function createP7BInternal()
{
	//region Initial variables
	let sequence = Promise.resolve();
	
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
	
	certSimpl.notBefore.value = new Date(2013, 0, 1);
	certSimpl.notAfter.value = new Date(2016, 0, 1);
	
	certSimpl.extensions = []; // Extensions are not a part of certificate by default, it's an optional array
	
	//region "KeyUsage" extension
	const bitArray = new ArrayBuffer(1);
	const bitView = new Uint8Array(bitArray);
	bitView[0] |= 0x02; // Key usage "cRLSign" flag
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
	sequence = sequence.then((keyPair) =>
	{
		publicKey = keyPair.publicKey;
		privateKey = keyPair.privateKey;
	});
	//endregion
	
	//region Exporting public key into "subjectPublicKeyInfo" value of certificate
	sequence = sequence.then(() => certSimpl.subjectPublicKeyInfo.importKey(publicKey));
	//endregion
	
	//region Signing final certificate
	sequence = sequence.then(() => certSimpl.sign(privateKey, hashAlg));
	//endregion
	
	//region Encode final ContentInfo
	sequence = sequence.then(() =>
	{
		const cmsContentSimp = new ContentInfo({
			contentType: "1.2.840.113549.1.7.2",
			content: (new SignedData({
				version: 1,
				encapContentInfo: new EncapsulatedContentInfo({
					eContentType: "1.2.840.113549.1.7.1" // "data" content type
				}),
				certificates: [
					certSimpl,
					certSimpl,
					certSimpl
				] // Put 3 copies of the same X.509 certificate
			})).toSchema(true)
		});
		
		cmsSignedBuffer = cmsContentSimp.toSchema().toBER(false);
	});
	//endregion
	
	return sequence;
}
//*********************************************************************************
function createP7B()
{
	return Promise.resolve().then(() => createP7BInternal()).then(() =>
	{
		// noinspection InnerHTMLJS
		let resultString = "\r\n-----BEGIN CMS-----\r\n";
		resultString = `${resultString}${formatPEM(toBase64(arrayBufferToString(cmsSignedBuffer)))}`;
		resultString = `${resultString}\r\n-----END CMS-----\r\n\r\n`;
		
		// noinspection InnerHTMLJS
		document.getElementById("newSignedData").innerHTML = resultString;
	});
}
//*********************************************************************************
//endregion
//*********************************************************************************
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
	createP7B();
	handleHashAlgOnChange();
	handleSignAlgOnChange();
	setEngine();
});
//*********************************************************************************
context("P7B Simple Example", () =>
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
				
				return createP7BInternal().then(() =>
				{
					const asn1 = asn1js.fromBER(cmsSignedBuffer);
					const contentInfo = new ContentInfo({ schema: asn1.result });
					
					assert.equal(contentInfo.contentType, "1.2.840.113549.1.7.2", "Content Type ID must be '1.2.840.113549.1.7.2'");
					
					const signedData = new SignedData({ schema: contentInfo.content });
					
					assert.equal(signedData.certificates.length, 3, "SignedData must contains 3 certificates");
				});
			});
		});
	});
});
//*********************************************************************************
