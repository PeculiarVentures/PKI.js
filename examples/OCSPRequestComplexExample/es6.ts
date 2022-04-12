import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as example from "../../test/ocspRequestComplexExample";
import * as utils from "../../test/utils";
import * as pkijs from "../../src";
import * as common from "../common";

/**
 * ArrayBuffer with loaded or created OCSP request
 */
export let ocspReqBuffer = new ArrayBuffer(0);

async function createOCSPReq() {
	const ocspRequestBuffer = await example.createOCSPReq();

	common.getElement("new_signed_data").innerHTML = utils.toPEM(ocspRequestBuffer, "OCSP REQUEST");

	parseOCSPReq(ocspRequestBuffer);

	alert("OCSP request has created successfully!");
}

/**
 * Parse existing OCSP request
 * @returns
 */
function parseOCSPReq(source: ArrayBuffer) {
	//#region Initial check
	if (source.byteLength === 0) {
		alert("Nothing to parse!");
		return;
	}
	//#endregion
	//#region Initial activities
	common.getElement("ocsp-req-extn-div").style.display = "none";

	const requestsTable = common.getElement("ocsp-req-requests", "table");
	while (requestsTable.rows.length > 1)
		requestsTable.deleteRow(requestsTable.rows.length - 1);

	const extensionTable = common.getElement("ocsp-req-extn-table", "table");
	while (extensionTable.rows.length > 1)
		extensionTable.deleteRow(extensionTable.rows.length - 1);

	const requestorTable = common.getElement("ocsp-req-name", "table");
	while (requestorTable.rows.length > 1)
		requestorTable.deleteRow(requestorTable.rows.length - 1);
	//#endregion
	//#region Decode existing OCSP request
	const asn1 = asn1js.fromBER(source);
	const ocspReqSimpl = new pkijs.OCSPRequest({ schema: asn1.result });
	//#endregion
	//#region Put information about OCSP request requestor
	if (ocspReqSimpl.tbsRequest.requestorName) {
		switch (ocspReqSimpl.tbsRequest.requestorName.type) {
			case 1: // rfc822Name
			case 2: // dNSName
			case 6: // uniformResourceIdentifier
				common.getElement("ocsp-req-name-simpl").innerHTML = ocspReqSimpl.tbsRequest.requestorName.value.valueBlock.value;
				common.getElement("ocsp-req-nm-simpl").style.display = "block";
				break;
			case 7: // iPAddress
				{
					const view = new Uint8Array(ocspReqSimpl.tbsRequest.requestorName.value.valueBlock.valueHex);

					common.getElement("ocsp-req-name-simpl").innerHTML = `${view[0].toString()}.${view[1].toString()}.${view[2].toString()}.${view[3].toString()}`;
					common.getElement("ocsp-req-nm-simpl").style.display = "block";
				}
				break;
			case 3: // x400Address
			case 5: // ediPartyName
				common.getElement("ocsp-req-name-simpl").innerHTML = (ocspReqSimpl.tbsRequest.requestorName.type === 3) ? "<type \"x400Address\">" : "<type \"ediPartyName\">";
				common.getElement("ocsp-req-nm-simpl").style.display = "block";
				break;
			case 4: // directoryName
				{
					const rdnmap: Record<string, string> = {
						"2.5.4.6": "C",
						"2.5.4.10": "O",
						"2.5.4.11": "OU",
						"2.5.4.3": "CN",
						"2.5.4.7": "L",
						"2.5.4.8": "ST",
						"2.5.4.12": "T",
						"2.5.4.42": "GN",
						"2.5.4.43": "I",
						"2.5.4.4": "SN",
						"1.2.840.113549.1.9.1": "E-mail"
					};

					for (let i = 0; i < ocspReqSimpl.tbsRequest.requestorName.value.typesAndValues.length; i++) {
						let typeval = rdnmap[ocspReqSimpl.tbsRequest.requestorName.value.typesAndValues[i].type];
						if (typeof typeval === "undefined")
							typeval = ocspReqSimpl.tbsRequest.requestorName.value.typesAndValues[i].type;

						const subjval = ocspReqSimpl.tbsRequest.requestorName.value.typesAndValues[i].value.valueBlock.value;

						const row = requestorTable.insertRow(requestorTable.rows.length);
						const cell0 = row.insertCell(0);
						cell0.innerHTML = typeval;
						const cell1 = row.insertCell(1);
						cell1.innerHTML = subjval;
					}

					common.getElement("ocsp-req-name-div").style.display = "block";
				}
				break;
			default:
		}
	}
	//#endregion
	//#region Put information about requests
	for (let i = 0; i < ocspReqSimpl.tbsRequest.requestList.length; i++) {
		const row = requestsTable.insertRow(requestsTable.rows.length);
		const cell0 = row.insertCell(0);
		cell0.innerHTML = pvutils.bufferToHexCodes(ocspReqSimpl.tbsRequest.requestList[i].reqCert.serialNumber.valueBlock.valueHex);
	}
	//#endregion
	//#region Put information about request extensions
	if (ocspReqSimpl.tbsRequest.requestExtensions) {
		for (let i = 0; i < ocspReqSimpl.tbsRequest.requestExtensions.length; i++) {
			const row = extensionTable.insertRow(extensionTable.rows.length);
			const cell0 = row.insertCell(0);
			cell0.innerHTML = ocspReqSimpl.tbsRequest.requestExtensions[i].extnID;
		}

		common.getElement("ocsp-req-extn-div").style.display = "block";
	}
	//#endregion

	ocspReqBuffer = source;
}

function handleFileBrowse(evt: any) {
	common.handleFileBrowse(evt, parseOCSPReq);
}

common.getElement("ocsp-req-file").addEventListener("change", handleFileBrowse, false);
common.getElement("ocsp-req-create").addEventListener("click", createOCSPReq, false);
