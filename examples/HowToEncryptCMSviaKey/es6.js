/* eslint-disable no-undef,no-unreachable */
import * as asn1js from "asn1js";
import {arrayBufferToString, fromBase64, isEqualBuffer, stringToArrayBuffer, toBase64} from "pvutils";
import {getAlgorithmParameters, getCrypto, setEngine} from "../../src/common.js";
import {formatPEM} from "../../examples/examples_common.js";
import EnvelopedData from "../../src/EnvelopedData.js";
import ContentInfo from "../../src/ContentInfo.js";
//<nodewebcryptoossl>
//*********************************************************************************
let keyPairIdBuffer = new ArrayBuffer(0);
let privateKeyBuffer = new ArrayBuffer(0);
let publicKeyBuffer = new ArrayBuffer(0);

let cmsEnvelopedBuffer = new ArrayBuffer(0);
let valueBuffer = new ArrayBuffer(0);

let curveName = "P-256";
let kdfHashAlg = "SHA-1";

const encAlg = {
	name: "AES-CBC",
	length: 128
};

const crypto = getCrypto();

function getKeyAgreeAlgorithmParams(operation) {
	const algorithm = getAlgorithmParameters("ECDH", operation);
	algorithm.algorithm.namedCurve = curveName;
	return algorithm;
}

//*********************************************************************************
//#region Create recipient's key pair
//*********************************************************************************
function createKeyPairInternal()
{
	//#region Initial variables
	let sequence = Promise.resolve();

	let publicKey;
	let privateKey;
	//#endregion

	//#region Validate "crypto" extension
	if(typeof crypto === "undefined")
		return Promise.reject("No WebCrypto extension found");
	//#endregion

	//#region Create a new key pair
	sequence = sequence.then(() =>
	{
		const algorithm = getKeyAgreeAlgorithmParams("generatekey");
		return crypto.generateKey(algorithm.algorithm, true, algorithm.usages);
	});
	//#endregion

	//#region Store new key in an interim variables
	sequence = sequence.then(keyPair =>
	{
		publicKey = keyPair.publicKey;
		privateKey = keyPair.privateKey;
	}, error => Promise.reject(`Error during key generation: ${error}`));
	//#endregion

	//#region Exporting private key
	sequence = sequence.then(() =>
		crypto.exportKey("pkcs8", privateKey)
	);
	sequence = sequence.then(result =>
	{
		privateKeyBuffer = result;
	}, error => Promise.reject(`Error during exporting of private key: ${error}`));
	//#endregion

	//#region Exporting public key
	sequence = sequence.then(() =>
		crypto.exportKey("spki", publicKey)
	);
	sequence = sequence.then(result =>
	{
		publicKeyBuffer = result;
	}, error => Promise.reject(`Error during exporting of public key: ${error}`));
	//#endregion

	//#region Export key id
	sequence = sequence.then(() => {
		const value = new ArrayBuffer(4);
		return crypto.getRandomValues(new Uint8Array(value));
	});
	sequence = sequence.then(result =>
	{
		keyPairIdBuffer = result;
	}, error => Promise.reject(`Error during exporting of private key: ${error}`));
	//#endregion

	return sequence;
}
//*********************************************************************************
function createKeyPair()
{
	return createKeyPairInternal().then(() =>
	{
		//#region Set private key
		const privateKeyString = String.fromCharCode.apply(null, new Uint8Array(privateKeyBuffer));

		let privateKeyPem = "-----BEGIN PRIVATE KEY-----\r\n";
		privateKeyPem = `${privateKeyPem}${formatPEM(toBase64(privateKeyString))}`;
		privateKeyPem = `${privateKeyPem}\r\n-----END PRIVATE KEY-----\r\n`;

		// noinspection InnerHTMLJS
		document.getElementById("pkcs8_key").innerHTML = privateKeyPem;

		alert("Private key exported successfully!");
		//#endregion

		//#region Set public key
		const publicKeyString = String.fromCharCode.apply(null, new Uint8Array(publicKeyBuffer));

		let publicKeyPem = "-----BEGIN PUBLIC KEY-----\r\n";
		publicKeyPem = `${publicKeyPem}${formatPEM(toBase64(publicKeyString))}`;
		publicKeyPem = `${publicKeyPem}\r\n-----END PUBLIC KEY-----\r\n`;

		// noinspection InnerHTMLJS
		document.getElementById("pkcs8_key_pub").innerHTML = publicKeyPem;

		alert("Public key exported successfully!");
		//#endregion

		//#region Set key pair id
		const keyPairIdString = String.fromCharCode.apply(null, new Uint8Array(privateKeyBuffer));
		// noinspection InnerHTMLJS
		document.getElementById("pkcs8_key_id").innerHTML = toBase64(keyPairIdString);
		alert("Key pair id generated successfully!");
		//#endregion
	}, error =>
	{
		if(error instanceof Object)
			alert(error.message);
		else
			alert(error);
	});
}
//*********************************************************************************
//#endregion
//*********************************************************************************
//#region Encrypt input data
//*********************************************************************************
function envelopedEncryptInternal()
{
	const cmsEnveloped = new EnvelopedData();

	return Promise.resolve()
		.then(() => {
			//#region Import public key
			const algorithm = getKeyAgreeAlgorithmParams("importkey");
			return crypto.importKey("spki", publicKeyBuffer, algorithm.algorithm, true, []);
			//#endregion
		})
		.then((publicKey) => {
			cmsEnveloped.addRecipientByKeyIdentifier(publicKey, keyPairIdBuffer, { kdfAlgorithm: kdfHashAlg });
			return cmsEnveloped.encrypt(encAlg, valueBuffer);
		})
		.then(
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
		const encodedPublicKey = document.getElementById("pkcs8_key_pub").value;
		const clearEncodedPublicKey = encodedPublicKey.replace(/(-----(BEGIN|END) PUBLIC KEY-----|\n)/g, "");
		publicKeyBuffer = stringToArrayBuffer(fromBase64(clearEncodedPublicKey));

		const encodedKeyId = document.getElementById("pkcs8_key_id").value;
		keyPairIdBuffer = stringToArrayBuffer(fromBase64(encodedKeyId));

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
//#endregion
//*********************************************************************************
//#region Decrypt input data
//*********************************************************************************
function envelopedDecryptInternal()
{
	//#region Decode CMS Enveloped content
	const asn1 = asn1js.fromBER(cmsEnvelopedBuffer);
	const cmsContentSimpl = new ContentInfo({ schema: asn1.result });
	const cmsEnvelopedSimp = new EnvelopedData({ schema: cmsContentSimpl.content });
	//#endregion

	return cmsEnvelopedSimp.decrypt(0,
		{
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
//#endregion
//*********************************************************************************
function handleKeyAgreeAlgorithmOnChange()
{
	const curveNameOption = document.getElementById("curve_name").value;
	switch(curveNameOption)
	{
		case "P-256":
			curveName = "P-256";
			break;
		case "ecdh_p384":
			curveName = "P-384";
			break;
		case "ecdh_p521":
			curveName = "P-521";
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
			kdfHashAlg = "sha-1";
			break;
		case "alg_SHA256":
			kdfHashAlg = "sha-256";
			break;
		case "alg_SHA384":
			kdfHashAlg = "sha-384";
			break;
		case "alg_SHA512":
			kdfHashAlg = "sha-512";
			break;
		default:
	}
}
//*********************************************************************************
context("Hack for Rollup.js", () =>
{
	return;

	// noinspection UnreachableCodeJS
	createKeyPair();
	envelopedEncrypt();
	envelopedDecrypt();
	handleKeyAgreeAlgorithmOnChange();
	handleEncAlgOnChange();
	handleEncLenOnChange();
	handleOAEPHashAlgOnChange();
	setEngine();
});
//*********************************************************************************
context("How To Encrypt CMS via Key Identifier", () => {
	//#region Initial variables
	const kdfHashAlgs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
	const curveNames = ["P-256", "P-384", "P-521"];
	const encAlgs = ["AES-CBC", "AES-GCM"];
	const encLens = [128, 192, 256];

	valueBuffer = (new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09])).buffer;
	//#endregion

	encAlgs.forEach(_encAlg =>
	{
		encLens.forEach(_encLen =>
		{
			curveNames.forEach(_curveName =>
			{
				kdfHashAlgs.forEach(_kdfHashAlg =>
				{
					const testName = `${_encAlg} with ${_encLen} + ${_curveName}, OAEP hash: ${_kdfHashAlg}`;

					it(testName, () =>
					{
						curveName = _curveName;
						kdfHashAlg = _kdfHashAlg;

						encAlg.name = _encAlg;
						encAlg.length = _encLen;

						return createKeyPairInternal().then(() => envelopedEncryptInternal()).then(() => envelopedDecryptInternal()).then(result =>
						{
							assert.equal(isEqualBuffer(result, valueBuffer), true, "Decrypted value must be equal with initially encrypted value");
						});
					});
				});
			});
		});
	});
});
//*********************************************************************************
