/* eslint-disable no-undef,no-unreachable */
import * as asn1js from "asn1js";
import { arrayBufferToString, stringToArrayBuffer, toBase64, fromBase64, isEqualBuffer } from "pvutils";
import { getCrypto, getAlgorithmParameters, setEngine } from "../../src/common.js";
import { formatPEM } from "../../examples/examples_common.js";
import Certificate from "../../src/Certificate.js";
import EnvelopedData from "../../src/EnvelopedData.js";
import ContentInfo from "../../src/ContentInfo.js";
import AttributeTypeAndValue from "../../src/AttributeTypeAndValue.js";
import BasicConstraints from "../../src/BasicConstraints.js";
import Extension from "../../src/Extension.js";
import OriginatorInfo from "../../src/OriginatorInfo.js";
import CertificateSet from "../../src/CertificateSet.js";
//<nodewebcryptoossl>
//*********************************************************************************
let certificateBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CERT 
let privateKeyBuffer = new ArrayBuffer(0);

let cmsEnvelopedBuffer = new ArrayBuffer(0);
let valueBuffer = new ArrayBuffer(0);

let trustedCertificates = []; // Array of root certificates from "CA Bundle"

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
function createCertificateInternal()
{
	//region Initial variables
	let sequence = Promise.resolve();
	
	const certificate = new Certificate();
	
	let publicKey;
	let privateKey;
	
	trustedCertificates = [];
	//endregion
	
	//region Get a "crypto" extension
	const crypto = getCrypto();
	if(typeof crypto === "undefined")
		return Promise.reject("No WebCrypto extension found");
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
	
	certificate.extensions = []; // Extensions are not a part of certificate by default, it's an optional array
	
	//region "BasicConstraints" extension
	const basicConstr = new BasicConstraints({
		cA: true,
		pathLenConstraint: 3
	});
	
	certificate.extensions.push(new Extension({
		extnID: "2.5.29.19",
		critical: true,
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
	}, error => Promise.reject(`Error during key generation: ${error}`));
	//endregion
	
	//region Exporting public key into "subjectPublicKeyInfo" value of certificate
	sequence = sequence.then(() =>
		certificate.subjectPublicKeyInfo.importKey(publicKey)
	);
	//endregion
	
	//region Signing final certificate
	sequence = sequence.then(() =>
		certificate.sign(privateKey, hashAlg),
	error => Promise.reject(`Error during exporting public key: ${error}`));
	//endregion
	
	//region Encode and store certificate
	sequence = sequence.then(() =>
	{
		trustedCertificates.push(certificate);
		certificateBuffer = certificate.toSchema(true).toBER(false);
	}, error => Promise.reject(`Error during signing: ${error}`));
	//endregion
	
	//region Exporting private key
	sequence = sequence.then(() =>
		crypto.exportKey("pkcs8", privateKey)
	);
	//endregion
	
	//region Store exported key on Web page
	sequence = sequence.then(result =>
	{
		privateKeyBuffer = result;
	}, error => Promise.reject(`Error during exporting of private key: ${error}`));
	//endregion
	
	return sequence;
}
//*********************************************************************************
function createCertificate()
{
	return createCertificateInternal().then(() =>
	{
		const certificateString = String.fromCharCode.apply(null, new Uint8Array(certificateBuffer));
		
		let resultString = "-----BEGIN CERTIFICATE-----\r\n";
		resultString = `${resultString}${formatPEM(toBase64(certificateString))}`;
		resultString = `${resultString}\r\n-----END CERTIFICATE-----\r\n`;
		
		// noinspection InnerHTMLJS
		document.getElementById("new_signed_data").innerHTML = resultString;

		alert("Certificate created successfully!");
		
		const privateKeyString = String.fromCharCode.apply(null, new Uint8Array(privateKeyBuffer));
		
		resultString = "-----BEGIN PRIVATE KEY-----\r\n";
		resultString = `${resultString}${formatPEM(toBase64(privateKeyString))}`;
		resultString = `${resultString}\r\n-----END PRIVATE KEY-----\r\n`;
		
		// noinspection InnerHTMLJS
		document.getElementById("pkcs8_key").innerHTML = resultString;
		
		alert("Private key exported successfully!");
	}, error =>
	{
		if(error instanceof Object)
			alert(error.message);
		else
			alert(error);
	});
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region Encrypt input data 
//*********************************************************************************
function envelopedEncryptInternal()
{
	//region Decode input certificate
	const asn1 = asn1js.fromBER(certificateBuffer);
	const certSimpl = new Certificate({ schema: asn1.result });
	//endregion
	
	const cmsEnveloped = new EnvelopedData({
		originatorInfo: new OriginatorInfo({
			certs: new CertificateSet({
				certificates: [certSimpl]
			})
		})
	});
	
	cmsEnveloped.addRecipientByCertificate(certSimpl, { oaepHashAlgorithm: oaepHashAlg });
	
	return cmsEnveloped.encrypt(encAlg, valueBuffer).
		then(
			() =>
			{
				const cmsContentSimpl = new ContentInfo();
				cmsContentSimpl.contentType = "1.2.840.113549.1.7.3";
				cmsContentSimpl.content = cmsEnveloped.toSchema();
				
				cmsEnvelopedBuffer = cmsContentSimpl.toSchema().toBER(false);
			},
			error => Promise.reject(`ERROR DURING ENCRYPTION PROCESS: ${error}`)
		);
}
//*********************************************************************************
function envelopedEncrypt()
{
	return Promise.resolve().then(() =>
	{
		// noinspection InnerHTMLJS
		const encodedCertificate = document.getElementById("new_signed_data").value;
		const clearEncodedCertificate = encodedCertificate.replace(/(-----(BEGIN|END)( NEW)? CERTIFICATE-----|\n)/g, "");
		certificateBuffer = stringToArrayBuffer(fromBase64(clearEncodedCertificate));
		
		valueBuffer = stringToArrayBuffer(document.getElementById("content").value);
	}).then(() => envelopedEncryptInternal()).then(() =>
	{
		let resultString = "-----BEGIN CMS-----\r\n";
		resultString = `${resultString}${formatPEM(toBase64(arrayBufferToString(cmsEnvelopedBuffer)))}`;
		resultString = `${resultString}\r\n-----END CMS-----\r\n`;
		
		// noinspection InnerHTMLJS
		document.getElementById("encrypted_content").innerHTML = resultString;
		
		alert("Encryption process finished successfully");
	});
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region Decrypt input data 
//*********************************************************************************
function envelopedDecryptInternal()
{
	//region Decode input certificate
	let asn1 = asn1js.fromBER(certificateBuffer);
	const certSimpl = new Certificate({ schema: asn1.result });
	//endregion
	
	//region Decode CMS Enveloped content
	asn1 = asn1js.fromBER(cmsEnvelopedBuffer);
	const cmsContentSimpl = new ContentInfo({ schema: asn1.result });
	const cmsEnvelopedSimp = new EnvelopedData({ schema: cmsContentSimpl.content });
	//endregion
	
	return cmsEnvelopedSimp.decrypt(0,
		{
			recipientCertificate: certSimpl,
			recipientPrivateKey: privateKeyBuffer
		}).then(
		result => result,
		error => Promise.reject(`ERROR DURING DECRYPTION PROCESS: ${error}`)
	);
}
//*********************************************************************************
function envelopedDecrypt()
{
	return Promise.resolve().then(() =>
	{
		// noinspection InnerHTMLJS
		const encodedCertificate = document.getElementById("new_signed_data").value;
		const clearEncodedCertificate = encodedCertificate.replace(/(-----(BEGIN|END)( NEW)? CERTIFICATE-----|\n)/g, "");
		certificateBuffer = stringToArrayBuffer(window.atob(clearEncodedCertificate));
		
		// noinspection InnerHTMLJS
		const encodedPrivateKey = document.getElementById("pkcs8_key").value;
		const clearPrivateKey = encodedPrivateKey.replace(/(-----(BEGIN|END)( NEW)? PRIVATE KEY-----|\n)/g, "");
		privateKeyBuffer = stringToArrayBuffer(window.atob(clearPrivateKey));
		
		// noinspection InnerHTMLJS
		const encodedCMSEnveloped = document.getElementById("encrypted_content").value;
		const clearEncodedCMSEnveloped = encodedCMSEnveloped.replace(/(-----(BEGIN|END)( NEW)? CMS-----|\n)/g, "");
		cmsEnvelopedBuffer = stringToArrayBuffer(window.atob(clearEncodedCMSEnveloped));
	}).then(() => envelopedDecryptInternal()).then(result =>
	{
		// noinspection InnerHTMLJS
		document.getElementById("decrypted_content").innerHTML = arrayBufferToString(result);
	});
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
	envelopedEncrypt();
	envelopedDecrypt();
	handleHashAlgOnChange();
	handleSignAlgOnChange();
	handleEncAlgOnChange();
	handleEncLenOnChange();
	handleOAEPHashAlgOnChange();
	setEngine();
});
//*********************************************************************************
context("How To Encrypt CMS via Certificate", () => {
	//region Initial variables
	const hashAlgs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
	const oaepHashAlgs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
	const signAlgs = ["RSASSA-PKCS1-V1_5", "ECDSA", "RSA-PSS"];
	const encAlgs = ["AES-CBC", "AES-GCM"];
	const encLens = [128, 192, 256];
	
	valueBuffer = (new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09])).buffer;
	//endregion
	
	encAlgs.forEach(_encAlg =>
	{
		encLens.forEach(_encLen =>
		{
			signAlgs.forEach(_signAlg =>
			{
				hashAlgs.forEach(_hashAlg =>
				{
					oaepHashAlgs.forEach(_oaepHashAlg =>
					{
						const testName = `${_encAlg} with ${_encLen}, ${_hashAlg} + ${_signAlg}, OAEP hash: ${_oaepHashAlg}`;
						
						it(testName, () =>
						{
							hashAlg = _hashAlg;
							signAlg = _signAlg;
							oaepHashAlg = _oaepHashAlg;
							
							encAlg.name = _encAlg;
							encAlg.length = _encLen;
							
							return createCertificateInternal().then(() => envelopedEncryptInternal()).then(() => envelopedDecryptInternal()).then(result =>
							{
								assert.equal(isEqualBuffer(result, valueBuffer), true, "Decrypted value must be equal with initially encrypted value");
							});
						});
					});
				});
			});
		});
	});
});
//*********************************************************************************
