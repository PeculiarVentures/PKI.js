/* eslint-disable no-undef,no-unreachable */
import * as asn1js from "asn1js";
import { arrayBufferToString, stringToArrayBuffer, fromBase64, toBase64, isEqualBuffer } from "pvutils";
import { setEngine } from "../../src/common";
import { formatPEM } from "../../examples/examples_common";
import EnvelopedData from "../../src/EnvelopedData";
import ContentInfo from "../../src/ContentInfo";
//<nodewebcryptoossl>
//*********************************************************************************
let encryptionVariant = 2;
const encryptionAlgorithm = {
	name: "AES-CBC",
	length: 128
};

let preDefinedDataBuffer = new ArrayBuffer(0);
let valueBuffer = new ArrayBuffer(0);
let cmsEnvelopedBuffer = new ArrayBuffer(0);
//*********************************************************************************
//region Encrypt input data
//*********************************************************************************
function envelopedEncryptInternal()
{
	//region Get input pre-defined data
	/*
	 This is an example only and we consider that key encryption algorithm
	 has key length in 256 bits (default value).
	 */
	if(encryptionVariant === 1)
	{
		if(preDefinedDataBuffer.byteLength > 32)
		{
			const newPreDefinedDataBuffer = new ArrayBuffer(32);
			const newPreDefinedDataView = new Uint8Array(newPreDefinedDataBuffer);
			
			const preDefinedDataView = new Uint8Array(preDefinedDataBuffer);
			
			for(let i = 0; i < 32; i++)
				newPreDefinedDataView[i] = preDefinedDataView[i];
			
			preDefinedDataBuffer = newPreDefinedDataBuffer;
		}
		
		if(preDefinedDataBuffer.byteLength < 32)
		{
			const newPreDefinedDataBuffer = new ArrayBuffer(32);
			const newPreDefinedDataView = new Uint8Array(newPreDefinedDataBuffer);
			
			const preDefinedDataView = new Uint8Array(preDefinedDataBuffer);
			
			for(let i = 0; i < preDefinedDataBuffer.byteLength; i++)
				newPreDefinedDataView[i] = preDefinedDataView[i];
			
			preDefinedDataBuffer = newPreDefinedDataBuffer;
		}
	}
	//endregion
	
	const cmsEnveloped = new EnvelopedData();
	
	cmsEnveloped.addRecipientByPreDefinedData(preDefinedDataBuffer, {}, encryptionVariant);
	
	return cmsEnveloped.encrypt(encryptionAlgorithm, valueBuffer).
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
		preDefinedDataBuffer = stringToArrayBuffer(document.getElementById("password").value);
		valueBuffer =  stringToArrayBuffer(document.getElementById("content").value);
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
	//region Get input pre-defined data
	/*
	 This is an example only and we consider that key encryption algorithm
	 has key length in 256 bits (default value).
	 */
	if(encryptionVariant === 1)
	{
		if(preDefinedDataBuffer.byteLength > 32)
		{
			const newPreDefinedDataBuffer = new ArrayBuffer(32);
			const newPreDefinedDataView = new Uint8Array(newPreDefinedDataBuffer);
			
			const preDefinedDataView = new Uint8Array(preDefinedDataBuffer);
			
			for(let i = 0; i < 32; i++)
				newPreDefinedDataView[i] = preDefinedDataView[i];
			
			preDefinedDataBuffer = newPreDefinedDataBuffer;
		}
		
		if(preDefinedDataBuffer.byteLength < 32)
		{
			const newPreDefinedDataBuffer = new ArrayBuffer(32);
			const newPreDefinedDataView = new Uint8Array(newPreDefinedDataBuffer);
			
			const preDefinedDataView = new Uint8Array(preDefinedDataBuffer);
			
			for(let i = 0; i < preDefinedDataBuffer.byteLength; i++)
				newPreDefinedDataView[i] = preDefinedDataView[i];
			
			preDefinedDataBuffer = newPreDefinedDataBuffer;
		}
	}
	//endregion
	
	//region Decode CMS Enveloped content
	const asn1 = asn1js.fromBER(cmsEnvelopedBuffer);
	const cmsContentSimpl = new ContentInfo({ schema: asn1.result });
	const cmsEnvelopedSimp = new EnvelopedData({ schema: cmsContentSimpl.content });
	//endregion
	
	return cmsEnvelopedSimp.decrypt(0,
		{
			preDefinedData: preDefinedDataBuffer
		});
}
//*********************************************************************************
function envelopedDecrypt()
{
	return Promise.resolve().then(() =>
	{
		preDefinedDataBuffer = stringToArrayBuffer(document.getElementById("password").value);
		
		// noinspection InnerHTMLJS
		let encodedCMSEnveloped = document.getElementById("encrypted_content").innerHTML;
		let clearEncodedCMSEnveloped = encodedCMSEnveloped.replace(/(-----(BEGIN|END)( NEW)? CMS-----|\n)/g, "");
		cmsEnvelopedBuffer = stringToArrayBuffer(fromBase64(clearEncodedCMSEnveloped));
	}).then(() => envelopedDecryptInternal()).then(result =>
	{
		// noinspection InnerHTMLJS
		document.getElementById("decrypted_content").innerHTML = arrayBufferToString(result);
	});
}
//*********************************************************************************
//endregion
//*********************************************************************************
function handleContentEncAlgOnChange()
{
	const encryptionAlgorithmSelect = document.getElementById("content_enc_alg").value;
	switch(encryptionAlgorithmSelect)
	{
		case "alg_CBC":
			encryptionAlgorithm.name = "AES-CBC";
			break;
		case "alg_GCM":
			encryptionAlgorithm.name = "AES-GCM";
			break;
		default:
	}
}
//*********************************************************************************
function handleContentEncLenOnChange()
{
	const encryptionAlgorithmLengthSelect = document.getElementById("content_enc_alg_len").value;
	switch(encryptionAlgorithmLengthSelect)
	{
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
//*********************************************************************************
function handleContentTypeOnChange()
{
	const encryptionSelect = document.getElementById("content_type").value;
	switch(encryptionSelect)
	{
		case "type_pass":
			encryptionVariant = 2;
			break;
		case "type_kek":
			encryptionVariant = 1;
			break;
		default:
	}
}
//*********************************************************************************
context("Hack for Rollup.js", () =>
{
	return;
	
	// noinspection UnreachableCodeJS
	envelopedEncrypt();
	envelopedDecrypt();
	handleContentEncAlgOnChange();
	handleContentEncLenOnChange();
	handleContentTypeOnChange();
	setEngine();
});
//*********************************************************************************
context("How To Encrypt CMS via Password", () =>
{
	//region Initial variables
	const encryptionVariants = [1, 2];
	const encAlgs = ["AES-CBC", "AES-GCM"];
	const encLens = [128, 192, 256];
	
	valueBuffer = (new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09])).buffer;
	preDefinedDataBuffer = (new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09])).buffer;
	//endregion
	
	encAlgs.forEach(_encAlg =>
	{
		encLens.forEach(_encLen =>
		{
			encryptionVariants.forEach(_encryptionVariant =>
			{
				const testName = `${_encAlg} with ${_encLen}, ${(_encryptionVariant === 2) ? "Password-based encryption" : "Pre-defined KEK"}`;
				
				it(testName, () =>
				{
					encryptionAlgorithm.name = _encAlg;
					encryptionAlgorithm.length = _encLen;
					
					encryptionVariant = _encryptionVariant;
					
					return envelopedEncryptInternal().then(() => envelopedDecryptInternal()).then(result =>
					{
						assert.equal(isEqualBuffer(result, valueBuffer), true, "Decrypted value must be equal with initially encrypted value");
					});
				});
			});
		});
	});
});
//*********************************************************************************
