/* eslint-disable no-undef,no-unreachable */
import * as asn1js from "asn1js";
import { arrayBufferToString, stringToArrayBuffer } from "pvutils";
import { getCrypto, getAlgorithmParameters } from "../../src/common";
import { formatPEM } from "../../examples/examples_common";
import Certificate from "../../src/Certificate";
import EnvelopedData from "../../src/EnvelopedData";
import ContentInfo from "../../src/ContentInfo";
import AttributeTypeAndValue from "../../src/AttributeTypeAndValue";
import BasicConstraints from "../../src/BasicConstraints";
import Extension from "../../src/Extension";

import MimeNode from "emailjs-mime-builder";
import parse from "emailjs-mime-parser";
//*********************************************************************************
let certificateBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CERT 
const trustedCertificates = []; // Array of root certificates from "CA Bundle"

let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-v1_5";
let oaepHashAlg = "SHA-1";

const encAlg = {
	name: "AES-CBC",
	length: 128
};
//*********************************************************************************
//region Create CERT  
//*********************************************************************************
// noinspection FunctionWithInconsistentReturnsJS
function createCertificate()
{
	//region Initial variables
	let sequence = Promise.resolve();
	
	const certificate = new Certificate();
	
	let publicKey;
	let privateKey;
	//endregion
	
	//region Get a "crypto" extension
	const crypto = getCrypto();
	if(typeof crypto === "undefined")
	{
		alert("No WebCrypto extension found");
		return;
	}
	//endregion
	
	//region Put a static values
	certificate.version = 2;
	certificate.serialNumber = new asn1js.Integer({ value: 1 });
	certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.6", // Country name
		value: new asn1js.PrintableString({ value: "RU" })
	}));
	certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.3", // Common name
		value: new asn1js.BmpString({ value: "Test" })
	}));
	certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.6", // Country name
		value: new asn1js.PrintableString({ value: "RU" })
	}));
	certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.3", // Common name
		value: new asn1js.BmpString({ value: "Test" })
	}));
	
	certificate.notBefore.value = new Date(2016, 1, 1);
	certificate.notAfter.value = new Date(2019, 1, 1);
	
	certificate.extensions = []; // Extensions are not a part of certificate by default, it"s an optional array
	
	//region "BasicConstraints" extension
	const basicConstr = new BasicConstraints({
		cA: true,
		pathLenConstraint: 3
	});
	
	certificate.extensions.push(new Extension({
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
	
	certificate.extensions.push(new Extension({
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
	sequence = sequence.then(keyPair =>
	{
		publicKey = keyPair.publicKey;
		privateKey = keyPair.privateKey;
	}, error =>
	{
		alert(`Error during key generation: ${error}`);
	});
	//endregion
	
	//region Exporting public key into "subjectPublicKeyInfo" value of certificate
	sequence = sequence.then(() =>
		certificate.subjectPublicKeyInfo.importKey(publicKey)
	);
	//endregion
	
	//region Signing final certificate
	sequence = sequence.then(() =>
		certificate.sign(privateKey, hashAlg),
	error =>
	{
		alert(`Error during exporting public key: ${error}`);
	});
	//endregion
	
	//region Encode and store certificate
	sequence = sequence.then(() =>
	{
		certificateBuffer = certificate.toSchema(true).toBER(false);
		
		const certificateString = String.fromCharCode.apply(null, new Uint8Array(certificateBuffer));
		
		let resultString = "-----BEGIN CERTIFICATE-----\r\n";
		resultString = `${resultString}${formatPEM(window.btoa(certificateString))}`;
		resultString = `${resultString}\r\n-----END CERTIFICATE-----\r\n`;
		
		trustedCertificates.push(certificate);
		
		// noinspection InnerHTMLJS
		document.getElementById("new_signed_data").innerHTML = resultString;
		
		alert("Certificate created successfully!");
	}, error =>
	{
		alert(`Error during signing: ${error}`);
	});
	//endregion
	
	//region Exporting private key
	sequence = sequence.then(() =>
		crypto.exportKey("pkcs8", privateKey)
	);
	//endregion
	
	//region Store exported key on Web page
	sequence = sequence.then(result =>
	{
		// noinspection JSCheckFunctionSignatures
		const privateKeyString = String.fromCharCode.apply(null, new Uint8Array(result));
		
		let resultString = "";
		
		resultString = `${resultString}\r\n-----BEGIN PRIVATE KEY-----\r\n`;
		resultString = `${resultString}${formatPEM(window.btoa(privateKeyString))}`;
		resultString = `${resultString}\r\n-----END PRIVATE KEY-----\r\n`;
		
		// noinspection InnerHTMLJS
		document.getElementById("pkcs8_key").innerHTML = resultString;
		
		alert("Private key exported successfully!");
	}, error =>
	{
		alert(`Error during exporting of private key: ${error}`);
	});
	//endregion
	
	return sequence;
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region Encrypt input data and format as S/MIME message
//*********************************************************************************
function smimeEncrypt()
{
	//region Decode input certificate 
	// noinspection InnerHTMLJS
	const encodedCertificate = document.getElementById("new_signed_data").innerHTML;
	const clearEncodedCertificate = encodedCertificate.replace(/(-----(BEGIN|END)( NEW)? CERTIFICATE-----|\n)/g, "");
	certificateBuffer = stringToArrayBuffer(window.atob(clearEncodedCertificate));
	
	const asn1 = asn1js.fromBER(certificateBuffer);
	const certSimpl = new Certificate({ schema: asn1.result });
	//endregion 
	
	const cmsEnveloped = new EnvelopedData();
	
	cmsEnveloped.addRecipientByCertificate(certSimpl, { oaepHashAlgorithm: oaepHashAlg });
	
	return cmsEnveloped.encrypt(encAlg, stringToArrayBuffer(document.getElementById("content").value)).then(
		() =>
		{
			const cmsContentSimpl = new ContentInfo();
			cmsContentSimpl.contentType = "1.2.840.113549.1.7.3";
			cmsContentSimpl.content = cmsEnveloped.toSchema();
			
			const schema = cmsContentSimpl.toSchema();
			const ber = schema.toBER(false);
			
			// Insert enveloped data into new Mime message
			// noinspection JSUnresolvedFunction
			const mimeBuilder = new MimeNode("application/pkcs7-mime; name=smime.p7m; smime-type=enveloped-data; charset=binary")
				.setHeader("content-description", "Enveloped Data")
				.setHeader("content-disposition", "attachment; filename=smime.p7m")
				.setHeader("content-transfer-encoding", "base64")
				.setContent(new Uint8Array(ber));
			mimeBuilder.setHeader("from", "sender@example.com");
			mimeBuilder.setHeader("to", "recipient@example.com");
			mimeBuilder.setHeader("subject", "Example S/MIME encrypted message");
			
			// noinspection InnerHTMLJS
			document.getElementById("encrypted_content").innerHTML = mimeBuilder.build();
			
			alert("Encryption process finished successfully");
		},
		error => alert(`ERROR DURING ENCRYPTION PROCESS: ${error}`)
	);
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region Decrypt input data 
//*********************************************************************************
function smimeDecrypt()
{
	//region Decode input certificate
	const encodedCertificate = document.getElementById("new_signed_data").value;
	const clearEncodedCertificate = encodedCertificate.replace(/(-----(BEGIN|END)( NEW)? CERTIFICATE-----|\n)/g, "");
	certificateBuffer = stringToArrayBuffer(window.atob(clearEncodedCertificate));
	
	let asn1 = asn1js.fromBER(certificateBuffer);
	const certSimpl = new Certificate({ schema: asn1.result });
	//endregion 
	
	//region Decode input private key 
	const encodedPrivateKey = document.getElementById("pkcs8_key").value;
	const clearPrivateKey = encodedPrivateKey.replace(/(-----(BEGIN|END)( NEW)? PRIVATE KEY-----|\n)/g, "");
	const privateKeyBuffer = stringToArrayBuffer(window.atob(clearPrivateKey));
	//endregion 
	
	//region Parse S/MIME message to get CMS enveloped content 
	const parser = parse(document.getElementById("encrypted_content").value);
	//endregion
	
	//region Make all CMS data
	// noinspection JSUnresolvedVariable
	asn1 = asn1js.fromBER(parser.content.buffer);
	if(asn1.offset === (-1))
	{
		alert("Unable to parse your data. Please check you have \"Content-Type: charset=binary\" in your S/MIME message");
		return;
	}
	
	const cmsContentSimpl = new ContentInfo({ schema: asn1.result });
	const cmsEnvelopedSimp = new EnvelopedData({ schema: cmsContentSimpl.content });
	//endregion 
	
	return cmsEnvelopedSimp.decrypt(0,
		{
			recipientCertificate: certSimpl,
			recipientPrivateKey: privateKeyBuffer
		}).then(
		result =>
		{
			// noinspection InnerHTMLJS
			document.getElementById("decrypted_content").innerHTML = arrayBufferToString(result);
		},
		error => alert(`ERROR DURING DECRYPTION PROCESS: ${error}`)
	);
}
//*********************************************************************************
//endregion 
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
function handleEncAlgOnChange()
{
	const encryptionAlgorithmSelect = document.getElementById("content_enc_alg").value;
	switch(encryptionAlgorithmSelect)
	{
		case "alg_CBC":
			encAlg.name = "AES-CBC";
			break;
		case "alg_GCM":
			encAlg.name = "AES-GCM";
			break;
		default:
	}
}
//*********************************************************************************
function handleEncLenOnChange()
{
	const encryptionAlgorithmLengthSelect = document.getElementById("content_enc_alg_len").value;
	switch(encryptionAlgorithmLengthSelect)
	{
		case "len_128":
			encAlg.length = 128;
			break;
		case "len_192":
			encAlg.length = 192;
			break;
		case "len_256":
			encAlg.length = 256;
			break;
		default:
	}
}
//*********************************************************************************
function handleOAEPHashAlgOnChange()
{
	const hashOption = document.getElementById("oaep_hash_alg").value;
	switch(hashOption)
	{
		case "alg_SHA1":
			oaepHashAlg = "sha-1";
			break;
		case "alg_SHA256":
			oaepHashAlg = "sha-256";
			break;
		case "alg_SHA384":
			oaepHashAlg = "sha-384";
			break;
		case "alg_SHA512":
			oaepHashAlg = "sha-512";
			break;
		default:
	}
}
//*********************************************************************************
context("Hack for Rollup.js", () =>
{
	return;
	
	// noinspection UnreachableCodeJS
	createCertificate();
	smimeEncrypt();
	smimeDecrypt();
	handleHashAlgOnChange();
	handleSignAlgOnChange();
	handleEncAlgOnChange();
	handleEncLenOnChange();
	handleOAEPHashAlgOnChange();
});
//*********************************************************************************
