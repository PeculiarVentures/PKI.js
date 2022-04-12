import * as pvtsutils from "pvtsutils";
import * as example from "../../test/howToEncryptCMSviaPassword";
import * as utils from "../../test/utils";
import * as common from "../common";

let encryptionVariant = 2;
const encryptionAlgorithm = {
	name: "AES-CBC",
	length: 128
};

let preDefinedDataBuffer = new ArrayBuffer(0);
let valueBuffer = new ArrayBuffer(0);
let cmsEnvelopedBuffer = new ArrayBuffer(0);

async function envelopedEncrypt() {
	preDefinedDataBuffer = pvtsutils.Convert.FromUtf8String(common.getElement("password", "textarea").value);
	valueBuffer = pvtsutils.Convert.FromUtf8String(common.getElement("content", "textarea").value);
	cmsEnvelopedBuffer = await example.envelopedEncrypt(encryptionVariant, preDefinedDataBuffer, encryptionAlgorithm, valueBuffer);

	common.getElement("encrypted_content").innerHTML = utils.toPEM(cmsEnvelopedBuffer, "CMS");

	alert("Encryption process finished successfully");
}

async function envelopedDecrypt() {
	preDefinedDataBuffer = pvtsutils.Convert.FromUtf8String(common.getElement("password", "textarea").value);

	cmsEnvelopedBuffer = utils.fromPEM(common.getElement("encrypted_content").innerHTML);
	const result = await example.envelopedDecrypt(encryptionVariant, preDefinedDataBuffer, cmsEnvelopedBuffer);
	common.getElement("decrypted_content").innerHTML = pvtsutils.Convert.ToBinary(result);
}


function handleContentEncAlgOnChange() {
	const encryptionAlgorithmSelect = common.getElement("content_enc_alg", "select").value;
	switch (encryptionAlgorithmSelect) {
		case "alg_CBC":
			encryptionAlgorithm.name = "AES-CBC";
			break;
		case "alg_GCM":
			encryptionAlgorithm.name = "AES-GCM";
			break;
		default:
	}
}

function handleContentEncLenOnChange() {
	const encryptionAlgorithmLengthSelect = common.getElement("content_enc_alg_len", "select").value;
	switch (encryptionAlgorithmLengthSelect) {
		case "len_128":
			encryptionAlgorithm.length = 128;
			break;
		case "len_192":
			encryptionAlgorithm.length = 192;
			break;
		case "len_256":
			encryptionAlgorithm.length = 256;
			break;
		default:
	}
}

function handleContentTypeOnChange() {
	const encryptionSelect = common.getElement("content_type", "select").value;
	switch (encryptionSelect) {
		case "type_pass":
			encryptionVariant = 2;
			break;
		case "type_kek":
			encryptionVariant = 1;
			break;
		default:
	}
}

common.getElement("content_type").addEventListener("change", handleContentTypeOnChange);
common.getElement("content_enc_alg").addEventListener("change", handleContentEncAlgOnChange);
common.getElement("content_enc_alg_len").addEventListener("change", handleContentEncLenOnChange);
common.getElement("enveloped_decrypt").addEventListener("click", envelopedDecrypt);
common.getElement("enveloped_encrypt").addEventListener("click", envelopedEncrypt);