/* eslint-disable no-undef,no-unreachable,no-unused-vars */
import * as asn1js from "asn1js";
import { bufferToHexCodes, arrayBufferToString, toBase64 } from "pvutils";
import { setEngine } from "../../src/common";
import TimeStampReq from "../../src/TimeStampReq";
import MessageImprint from "../../src/MessageImprint";
import AlgorithmIdentifier from "../../src/AlgorithmIdentifier";
import { formatPEM } from "../../examples/examples_common";
//<nodewebcryptoossl>
//*********************************************************************************
let tspReqBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created TSP request 
//*********************************************************************************
//region Create TSP request  
//*********************************************************************************
function createTSPReqInternal()
{
	//region Initial variables
	const tspReqSimpl = new TimeStampReq();
	//endregion
	
	//region Put static variables
	const fictionBuffer = new ArrayBuffer(4);
	const fictionView = new Uint8Array(fictionBuffer);
	fictionView[0] = 0x7F;
	fictionView[1] = 0x01;
	fictionView[2] = 0x02;
	fictionView[3] = 0x03;
	
	tspReqSimpl.messageImprint = new MessageImprint({
		hashAlgorithm: new AlgorithmIdentifier({
			algorithmId: "1.3.14.3.2.26"
		}),
		hashedMessage: new asn1js.OctetString({ valueHex: fictionBuffer })
	});
	
	tspReqSimpl.reqPolicy = "1.1.1";
	tspReqSimpl.certReq = true;
	tspReqSimpl.nonce = new asn1js.Integer({ valueHex: fictionBuffer });
	//endregion
	
	//region Encode TSP request and put on the Web page
	tspReqBuffer = tspReqSimpl.toSchema().toBER(false);
	//endregion
	
	return Promise.resolve(true);
}
//*********************************************************************************
function createTSPReq()
{
	return Promise.resolve().then(() => createTSPReqInternal()).then(() =>
	{
		let resultString = "";
		
		resultString = `${resultString}\r\n-----BEGIN TSP REQUEST-----\r\n`;
		resultString = `${resultString}${formatPEM(toBase64(arrayBufferToString(tspReqBuffer)))}`;
		resultString = `${resultString}\r\n-----END TSP REQUEST-----\r\n\r\n`;
		
		// noinspection InnerHTMLJS
		document.getElementById("new_signed_data").innerHTML = resultString;
		
		parseTSPReq();
		
		alert("TSP request has created successfully!");
	});
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region Parse existing TSP request  
//*********************************************************************************
function parseTSPReq()
{
	//region Initial check 
	if(tspReqBuffer.byteLength === 0)
	{
		alert("Nothing to parse!");
		return;
	}
	//endregion 
	
	//region Initial activities 
	document.getElementById("tsp-req-extn-div").style.display = "none";
	
	const imprintTable = document.getElementById("tsp-req-imprint");
	while(imprintTable.rows.length > 1)
		imprintTable.deleteRow(imprintTable.rows.length - 1);
	
	const extensionTable = document.getElementById("tsp-req-extn-table");
	while(extensionTable.rows.length > 1)
		extensionTable.deleteRow(extensionTable.rows.length - 1);
	//endregion
	
	//region Decode existing TSP request
	const asn1 = asn1js.fromBER(tspReqBuffer);
	const tspReqSimpl = new TimeStampReq({ schema: asn1.result });
	//endregion 
	
	//region Put information about message imprint 
	const dgstmap = {
		"1.3.14.3.2.26": "SHA-1",
		"2.16.840.1.101.3.4.2.1": "SHA-256",
		"2.16.840.1.101.3.4.2.2": "SHA-384",
		"2.16.840.1.101.3.4.2.3": "SHA-512"
	};
	
	let hashAlgorithm = dgstmap[tspReqSimpl.messageImprint.hashAlgorithm.algorithmId];
	if(typeof hashAlgorithm === "undefined")
		hashAlgorithm = tspReqSimpl.messageImprint.hashAlgorithm.algorithmId;
	
	const row = imprintTable.insertRow(imprintTable.rows.length);
	const cell0 = row.insertCell(0);
	// noinspection InnerHTMLJS
	cell0.innerHTML = hashAlgorithm;
	const cell1 = row.insertCell(1);
	// noinspection InnerHTMLJS
	cell1.innerHTML = bufferToHexCodes(tspReqSimpl.messageImprint.hashedMessage.valueBlock.valueHex);
	//endregion 
	
	//region Put information about policy 
	if("reqPolicy" in tspReqSimpl)
	{
		// noinspection InnerHTMLJS
		document.getElementById("tsp-req-policy").innerHTML = tspReqSimpl.reqPolicy;
		document.getElementById("tsp-req-pol").style.display = "block";
	}
	//endregion 
	
	//region Put information about nonce 
	if("nonce" in tspReqSimpl)
	{
		// noinspection InnerHTMLJS
		document.getElementById("tsp-req-nonce").innerHTML = bufferToHexCodes(tspReqSimpl.nonce.valueBlock.valueHex);
		document.getElementById("tsp-req-non").style.display = "block";
	}
	//endregion 
	
	//region Put information about existence of "certReq" flag
	if("certReq" in tspReqSimpl)
	{
		// noinspection InnerHTMLJS
		document.getElementById("tsp-req-cert-req").innerHTML = (tspReqSimpl.certReq) ? "true" : "false";
		document.getElementById("tsp-req-cert").style.display = "block";
	}
	//endregion 
	
	//region Put information about TST info extensions 
	if("extensions" in tspReqSimpl)
	{
		const extensionTableInner = document.getElementById("resp-extensions");
		
		for(let i = 0; i < tspReqSimpl.extensions.length; i++)
		{
			const rowInner = extensionTableInner.insertRow(extensionTableInner.rows.length);
			const cell0Inner = rowInner.insertCell(0);
			// noinspection InnerHTMLJS
			cell0Inner.innerHTML = tspReqSimpl.extensions[i].extnID;
		}
		
		document.getElementById("tsp-req-extn-div").style.display = "block";
	}
	//endregion   
}
//*********************************************************************************
//endregion 
//*********************************************************************************
function handleFileBrowse(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	// noinspection AnonymousFunctionJS
	tempReader.onload =
		function(event)
		{
			// noinspection JSUnresolvedVariable
			tspReqBuffer = event.target.result;
			parseTSPReq();
		};
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
context("Hack for Rollup.js", () =>
{
	return;
	
	// noinspection UnreachableCodeJS
	createTSPReq();
	handleFileBrowse();
	setEngine();
});
//*********************************************************************************
context("TSP Request Complex Example", () =>
{
	it("Create And Parse TSP Request", () =>
	{
		return createTSPReqInternal().then(() =>
		{
			const asn1 = asn1js.fromBER(tspReqBuffer);
			// noinspection JSUnusedLocalSymbols
			const tspRequest = new TimeStampReq({ schema: asn1.result });
		});
	});
});
//*********************************************************************************
