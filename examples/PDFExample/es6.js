/* eslint-disable no-console,no-undef,no-unreachable */
import * as asn1js from "asn1js";
import { getCrypto, setEngine } from "../../src/common";
import { stringToArrayBuffer } from "pvutils";
import ContentInfo from "../../src/ContentInfo";
import SignedData from "../../src/SignedData";
import Certificate from "../../src/Certificate";

//*********************************************************************************
const trustedCertificates = []; // Array of Certificates
//*********************************************************************************
// noinspection FunctionWithInconsistentReturnsJS
function verifyPDFSignature(buffer)
{
	try
	{
		const view = new Uint8Array(buffer);
		const pdf = new window.PDFDocument(null, view, null);
		pdf.parseStartXRef();
		pdf.parse();
		
		const acroForm = pdf.xref.root.get("AcroForm");
		if(typeof acroForm === "undefined")
			throw new Error("The PDF has no signature!");
		
		const fields = acroForm.get("Fields");
		if(window.isRef(fields[0]) === false)
			throw new Error("Wrong structure of PDF!");
		
		const sigField = pdf.xref.fetch(fields[0]);
		
		const sigFieldType = sigField.get("FT");
		if((typeof sigFieldType === "undefined") || (sigFieldType.name !== "Sig"))
			throw new Error("Wrong structure of PDF!");
		
		const v = sigField.get("V");
		const byteRange = v.get("ByteRange");
		const contents = v.get("Contents");
		
		const contentLength = contents.length;
		const contentBuffer = new ArrayBuffer(contentLength);
		const contentView = new Uint8Array(contentBuffer);
		
		for(let i = 0; i < contentLength; i++)
			contentView[i] = contents.charCodeAt(i);
		
		let sequence = Promise.resolve();
		
		const asn1 = asn1js.fromBER(contentBuffer);
		
		const cmsContentSimp = new ContentInfo({ schema: asn1.result });
		const cmsSignedSimp = new SignedData({ schema: cmsContentSimp.content });
		
		const signedDataBuffer = new ArrayBuffer(byteRange[1] + byteRange[3]);
		const signedDataView = new Uint8Array(signedDataBuffer);
		
		let count = 0;
		for(let i = byteRange[0]; i < (byteRange[0] + byteRange[1]); i++, count++)
			signedDataView[count] = view[i];
		
		for(let j = byteRange[2]; j < (byteRange[2] + byteRange[3]); j++, count++)
			signedDataView[count] = view[j];
		
		sequence = sequence.then(() => cmsSignedSimp.verify({
			signer: 0,
			data: signedDataBuffer,
			trustedCerts: trustedCertificates
		}));
		
		if("signedAttrs" in cmsSignedSimp.signerInfos[0])
		{
			const crypto = getCrypto();
			if(typeof crypto === "undefined")
				throw new Error("WebCrypto extension is not installed");
			
			let shaAlgorithm = "";
			
			switch(cmsSignedSimp.signerInfos[0].digestAlgorithm.algorithmId)
			{
				case "1.3.14.3.2.26":
					shaAlgorithm = "sha-1";
					break;
				case "2.16.840.1.101.3.4.2.1":
					shaAlgorithm = "sha-256";
					break;
				case "2.16.840.1.101.3.4.2.2":
					shaAlgorithm = "sha-384";
					break;
				case "2.16.840.1.101.3.4.2.3":
					shaAlgorithm = "sha-512";
					break;
				default:
					throw new Error("Unknown hashing algorithm");
			}
			
			sequence = sequence.then((result) =>
			{
				if(result === false)
					return Promise.reject(new Error("Signature verification failed"));
				
				return crypto.digest({ name: shaAlgorithm }, new Uint8Array(signedDataBuffer));
			});
			
			sequence = sequence.then(result =>
			{
				let messageDigest = new ArrayBuffer(0);
				
				for(let j = 0; j < cmsSignedSimp.signerInfos[0].signedAttrs.attributes.length; j++)
				{
					if(cmsSignedSimp.signerInfos[0].signedAttrs.attributes[j].type === "1.2.840.113549.1.9.4")
					{
						messageDigest = cmsSignedSimp.signerInfos[0].signedAttrs.attributes[j].values[0].valueBlock.valueHex;
						break;
					}
				}
				
				if(messageDigest.byteLength === 0)
					return Promise.reject(new Error("No signed attribute 'MessageDigest'"));
				
				const view1 = new Uint8Array(messageDigest);
				// noinspection JSCheckFunctionSignatures
				const view2 = new Uint8Array(result);
				
				if(view1.length !== view2.length)
					return Promise.reject(new Error("Hash is not correct"));
				
				for(let i = 0; i < view1.length; i++)
				{
					if(view1[i] !== view2[i])
						return Promise.reject(new Error("Hash is not correct"));
				}
				
				return Promise.resolve();
			});
		}
		
		sequence = sequence.then((result) =>
		{
			if(typeof result !== "undefined")
			{
				if(result === false)
				{
					alert("PDF verification failed!");
					return;
				}
			}
			
			alert("PDF successfully verified!");
		});
		
		return sequence.catch((e) =>
		{
			throw e;
		});
	}
	catch(e)
	{
		console.error(e.stack);
	}
}
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
function handleFileBrowse(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	// noinspection AnonymousFunctionJS, JSUnresolvedVariable
	tempReader.onload = event => verifyPDFSignature(event.target.result);
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
function handleCABundle(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	// noinspection AnonymousFunctionJS, JSUnresolvedVariable
	tempReader.onload = event => parseCAbundle(event.target.result);
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
context("Hack for Rollup.js", () =>
{
	return;
	
	// noinspection UnreachableCodeJS
	handleFileBrowse();
	handleCABundle();
	setEngine();
});
//*********************************************************************************
