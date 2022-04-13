import * as pvtsutils from "pvtsutils";
import * as example from "../../test/howToEncryptCMSviaCertificate";
import * as utils from "../../test/utils";
import * as common from "../common";

let certificateBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CERT
let privateKeyBuffer = new ArrayBuffer(0);

let cmsEnvelopedBuffer = new ArrayBuffer(0);
let valueBuffer = new ArrayBuffer(0);

let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-v1_5";
let oaepHashAlg = "SHA-1";

const encAlg = {
	name: "AES-CBC",
	length: 128
};

/**
 * Create CERT
 */
async function createCertificate() {
	try {
		const certWithKey = await utils.createSelfSignedCertificate(hashAlg, signAlg);
		certificateBuffer = certWithKey.certificate.toSchema().toBER();
		common.getElement("cert").innerHTML = utils.toPEM(certificateBuffer, "CERTIFICATE");

		console.info("Certificate created successfully!");

		privateKeyBuffer = certWithKey.pkcs8;
		common.getElement("pkcs8_key").innerHTML = utils.toPEM(certWithKey.pkcs8, "PRIVATE KEY");

		console.info("Private key exported successfully!");

		alert("Certificate created successfully!");
	} catch (error) {
		common.processError(error, "Error on certificate creation");
	}
}

/**
 * Encrypt input data
 */
async function envelopedEncrypt() {
	certificateBuffer = utils.fromPEM(common.getElement("cert", "textarea").value);
	valueBuffer = pvtsutils.Convert.FromUtf8String(common.getElement("encrypted_content", "textarea").value);

	cmsEnvelopedBuffer = await example.envelopedEncrypt(
		certificateBuffer,
		{
			...encAlg,
			oaepHashAlg,
		},
		valueBuffer);

	common.getElement("encrypted_content").innerHTML = utils.toPEM(cmsEnvelopedBuffer, "CMS");

	alert("Encryption process finished successfully");
}

/**
 * Decrypt input data
 */
async function envelopedDecrypt() {
	certificateBuffer = utils.fromPEM(common.getElement("cert", "textarea").value);
	privateKeyBuffer = utils.fromPEM(common.getElement("pkcs8_key", "textarea").value);
	cmsEnvelopedBuffer = utils.fromPEM(common.getElement("encrypted_content", "textarea").value);

	const result = await example.envelopedDecrypt(certificateBuffer, privateKeyBuffer, cmsEnvelopedBuffer);
	common.getElement("decrypted_content").innerHTML = pvtsutils.Convert.ToUtf8String(result);
}


function handleHashAlgOnChange() {
	const hashOption = common.getElement("hash_alg", "select").value;
	switch (hashOption) {
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

function handleSignAlgOnChange() {
	const signOption = common.getElement("sign_alg", "select").value;
	switch (signOption) {
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

function handleEncAlgOnChange() {
	const encryptionAlgorithmSelect = common.getElement("content_enc_alg", "select").value;
	switch (encryptionAlgorithmSelect) {
		case "alg_CBC":
			encAlg.name = "AES-CBC";
			break;
		case "alg_GCM":
			encAlg.name = "AES-GCM";
			break;
		default:
	}
}

function handleEncLenOnChange() {
	const encryptionAlgorithmLengthSelect = common.getElement("content_enc_alg_len", "select").value;
	switch (encryptionAlgorithmLengthSelect) {
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

function handleOAEPHashAlgOnChange() {
	const hashOption = common.getElement("oaep_hash_alg", "select").value;
	switch (hashOption) {
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

common.getElement("oaep_hash_alg").addEventListener("change", handleOAEPHashAlgOnChange);
common.getElement("content_enc_alg_len").addEventListener("change", handleEncLenOnChange);
common.getElement("content_enc_alg").addEventListener("change", handleEncAlgOnChange);
common.getElement("sign_alg").addEventListener("change", handleSignAlgOnChange);
common.getElement("hash_alg").addEventListener("change", handleHashAlgOnChange);
common.getElement("enveloped_decrypt").addEventListener("click", envelopedDecrypt);
common.getElement("enveloped_encrypt").addEventListener("click", envelopedEncrypt);
common.getElement("cert_create").addEventListener("click", createCertificate);
