import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as pkijs from "../../src";
import * as example from "../../test/tspReqComplexExample";
import * as utils from "../../test/utils";
import * as common from "../common";

let tspReqBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created TSP request

/**
 * Create TSP request
 */
async function createTSPReq() {
  const tspReq = await example.createTSPReq();
  tspReqBuffer = tspReq.toSchema().toBER();

  common.getElement("new_signed_data").innerHTML = utils.toPEM(tspReqBuffer, "TSP REQUEST");

  parseTSPReq();

  alert("TSP request has created successfully!");
}

/**
 * Parse existing TSP request
 */
function parseTSPReq() {
  //#region Initial check
  if (tspReqBuffer.byteLength === 0) {
    alert("Nothing to parse!");
    return;
  }
  //#endregion

  //#region Initial activities
  common.getElement("tsp-req-extn-div").style.display = "none";

  const imprintTable = common.getElement("tsp-req-imprint") as HTMLTableElement;
  while (imprintTable.rows.length > 1)
    imprintTable.deleteRow(imprintTable.rows.length - 1);

  const extensionTable = common.getElement("tsp-req-extn-table") as HTMLTableElement;
  while (extensionTable.rows.length > 1)
    extensionTable.deleteRow(extensionTable.rows.length - 1);
  //#endregion

  //#region Decode existing TSP request
  const asn1 = asn1js.fromBER(tspReqBuffer);
  pkijs.AsnError.assert(asn1, "TimeStamp request");
  const tspReqSimpl = new pkijs.TimeStampReq({ schema: asn1.result });
  //#endregion

  //#region Put information about message imprint
  const dgstmap: Record<string, string> = {
    "1.3.14.3.2.26": "SHA-1",
    "2.16.840.1.101.3.4.2.1": "SHA-256",
    "2.16.840.1.101.3.4.2.2": "SHA-384",
    "2.16.840.1.101.3.4.2.3": "SHA-512"
  };

  let hashAlgorithm = dgstmap[tspReqSimpl.messageImprint.hashAlgorithm.algorithmId];
  if (typeof hashAlgorithm === "undefined")
    hashAlgorithm = tspReqSimpl.messageImprint.hashAlgorithm.algorithmId;

  const row = imprintTable.insertRow(imprintTable.rows.length);
  const cell0 = row.insertCell(0);
  cell0.innerHTML = hashAlgorithm;
  const cell1 = row.insertCell(1);
  cell1.innerHTML = pvutils.bufferToHexCodes(tspReqSimpl.messageImprint.hashedMessage.valueBlock.valueHex);
  //#endregion

  //#region Put information about policy
  if (tspReqSimpl.reqPolicy) {
    common.getElement("tsp-req-policy").innerHTML = tspReqSimpl.reqPolicy;
    common.getElement("tsp-req-pol").style.display = "block";
  }
  //#endregion

  //#region Put information about nonce
  if (tspReqSimpl.nonce) {
    common.getElement("tsp-req-nonce").innerHTML = pvutils.bufferToHexCodes(tspReqSimpl.nonce.valueBlock.valueHex);
    common.getElement("tsp-req-non").style.display = "block";
  }
  //#endregion

  //#region Put information about existence of "certReq" flag
  if ("certReq" in tspReqSimpl) {
    common.getElement("tsp-req-cert-req").innerHTML = (tspReqSimpl.certReq) ? "true" : "false";
    common.getElement("tsp-req-cert").style.display = "block";
  }
  //#endregion

  //#region Put information about TST info extensions
  if (tspReqSimpl.extensions) {
    const extensionTableInner = common.getElement("resp-extensions") as HTMLTableElement;

    for (let i = 0; i < tspReqSimpl.extensions.length; i++) {
      const rowInner = extensionTableInner.insertRow(extensionTableInner.rows.length);
      const cell0Inner = rowInner.insertCell(0);
      cell0Inner.innerHTML = tspReqSimpl.extensions[i].extnID;
    }

    common.getElement("tsp-req-extn-div").style.display = "block";
  }
  //#endregion
}

function handleFileBrowse(evt: any) {
  common.handleFileBrowse(evt, () => {
    parseTSPReq();
  });
}

// Register events
common.getElement("tsp-req-file").addEventListener("change", handleFileBrowse, false);
common.getElement("create-tsp-req").addEventListener("click", createTSPReq, false);
