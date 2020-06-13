/* eslint-disable no-undef,no-unreachable */
import * as asn1js from "asn1js";
import { stringToArrayBuffer } from "pvutils";
import Certificate from "../../src/Certificate";
import SignedData from "../../src/SignedData";
import ContentInfo from "../../src/ContentInfo";

import parse from "emailjs-mime-parser";
//*********************************************************************************
const trustedCertificates = []; // Array of root certificates from "CA Bundle"
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
//endregion
//*********************************************************************************
//region Verify SMIME signature
//*********************************************************************************
export function verifySMIME()
{
	//region Parse MIME contents to find signature and detached data
	const parser = parse(document.getElementById("smime_message").value);
	//endregion
	
	// noinspection JSUnresolvedVariable
	if(("childNodes" in parser) || (parser.childNodes.length !== 2))
	{
		// noinspection JSUnresolvedVariable
		const lastNode = parser.childNodes[1];
		if((lastNode.contentType.value === "application/x-pkcs7-signature") || (lastNode.contentType.value === "application/pkcs7-signature"))
		{
			// Parse into pkijs types
			const asn1 = asn1js.fromBER(lastNode.content.buffer);
			if(asn1.offset === (-1))
			{
				alert("Incorrect message format!");
				return;
			}
			
			let cmsContentSimpl;
			let cmsSignedSimpl;
			
			try
			{
				cmsContentSimpl = new ContentInfo({ schema: asn1.result });
				cmsSignedSimpl = new SignedData({ schema: cmsContentSimpl.content });
			}
			catch(ex)
			{
				alert("Incorrect message format!");
				return;
			}
			
			// Get signed data buffer
			// noinspection JSUnresolvedVariable
			const signedDataBuffer = stringToArrayBuffer(parser.childNodes[0].raw.replace(/\n/g, "\r\n"));
			
			// Verify the signed data
			let sequence = Promise.resolve();
			sequence = sequence.then(
				() => cmsSignedSimpl.verify({ signer: 0, data: signedDataBuffer, trustedCerts: trustedCertificates })
			);
			
			sequence.then(
				result =>
				{
					let failed = false;
					if(typeof result !== "undefined")
					{
						if(result === false)
							failed = true;
					}
					
					alert(`S/MIME message ${(failed) ? "verification failed" : "successfully verified"}!`);
				},
				error =>
					alert(`Error during verification: ${error}`)
			);
		}
	}
	else
		alert("No child nodes!");
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region Functions handling file selection
//*********************************************************************************
export function handleMIMEFile(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	// noinspection AnonymousFunctionJS
	tempReader.onload = event =>
	{
		// noinspection JSUnresolvedVariable
		document.getElementById("smime_message").value = String.fromCharCode.apply(null, new Uint8Array(event.target.result));
	};
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
export function handleCABundle(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	// noinspection AnonymousFunctionJS, JSUnresolvedVariable
	tempReader.onload = event => parseCAbundle(event.target.result);
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
//endregion
//*********************************************************************************
