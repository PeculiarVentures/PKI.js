import * as pvtsutils from 'https://unpkg.com/pvtsutils@latest?module';
import { Convert } from 'https://unpkg.com/pvtsutils@latest?module';
import * as pkijs from '../pkijs.es.js';
import * as asn1js from 'https://unpkg.com/asn1js@latest?module';

/**
 * Create TSP request
 * @returns
 */
async function createTSPReq$1() {
    const tspReqSimpl = new pkijs.TimeStampReq();
    //#region Put static variables
    const fictionBuffer = new ArrayBuffer(4);
    const fictionView = new Uint8Array(fictionBuffer);
    fictionView[0] = 0x7F;
    fictionView[1] = 0x01;
    fictionView[2] = 0x02;
    fictionView[3] = 0x03;
    tspReqSimpl.messageImprint = new pkijs.MessageImprint({
        hashAlgorithm: new pkijs.AlgorithmIdentifier({
            algorithmId: "1.3.14.3.2.26"
        }),
        hashedMessage: new asn1js.OctetString({ valueHex: fictionBuffer })
    });
    tspReqSimpl.reqPolicy = "1.1.1";
    tspReqSimpl.certReq = true;
    tspReqSimpl.nonce = new asn1js.Integer({ valueHex: fictionBuffer });
    //#endregion
    return tspReqSimpl;
}

/* eslint-disable deprecation/deprecation */
function toPEM(buffer, tag) {
    return [
        `-----BEGIN ${tag}-----`,
        formatPEM(pvtsutils.Convert.ToBase64(buffer)),
        `-----END ${tag}-----`,
        "",
    ].join("\n");
}
/**
 * Format string in order to have each line with length equal to 64
 * @param pemString String to format
 * @returns Formatted string
 */
function formatPEM(pemString) {
    const PEM_STRING_LENGTH = pemString.length, LINE_LENGTH = 64;
    const wrapNeeded = PEM_STRING_LENGTH > LINE_LENGTH;
    if (wrapNeeded) {
        let formattedString = "", wrapIndex = 0;
        for (let i = LINE_LENGTH; i < PEM_STRING_LENGTH; i += LINE_LENGTH) {
            formattedString += pemString.substring(wrapIndex, i) + "\r\n";
            wrapIndex = i;
        }
        formattedString += pemString.substring(wrapIndex, PEM_STRING_LENGTH);
        return formattedString;
    }
    else {
        return pemString;
    }
}
function isNode() {
    return typeof process !== "undefined" &&
        process.versions != null &&
        process.versions.node != null;
}
if (isNode()) {
    import('@peculiar/webcrypto').then(peculiarCrypto => {
        const webcrypto = new peculiarCrypto.Crypto();
        const name = "newEngine";
        pkijs.setEngine(name, new pkijs.CryptoEngine({ name, crypto: webcrypto }));
    });
}

function getElement(id, type) {
    const el = document.getElementById(id);
    if (!el) {
        throw new Error(`Element with id '${id}' does not exist`);
    }
    if (type && el.nodeName.toLowerCase() !== type) {
        throw new TypeError(`Element '${el.nodeName}' is not requested type '${type}'`);
    }
    return el;
}
class Assert {
    static ok(value, message) {
        if (!value) {
            throw new Error(message || "Value is empty");
        }
    }
}
function handleFileBrowse$1(evt, cb) {
    Assert.ok(evt.target);
    const target = evt.target;
    const currentFiles = target.files;
    Assert.ok(currentFiles);
    const tempReader = new FileReader();
    tempReader.onload =
        (event) => {
            Assert.ok(event.target);
            const file = event.target.result;
            if (!(file instanceof ArrayBuffer)) {
                throw new Error("incorrect type of the file. Must be ArrayBuffer");
            }
            cb(file);
        };
    if (currentFiles.length) {
        tempReader.readAsArrayBuffer(currentFiles[0]);
    }
}

let tspReqBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created TSP request
/**
 * Create TSP request
 */
async function createTSPReq() {
    const tspReq = await createTSPReq$1();
    tspReqBuffer = tspReq.toSchema().toBER();
    getElement("new_signed_data").innerHTML = toPEM(tspReqBuffer, "TSP REQUEST");
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
    getElement("tsp-req-extn-div").style.display = "none";
    const imprintTable = getElement("tsp-req-imprint");
    while (imprintTable.rows.length > 1)
        imprintTable.deleteRow(imprintTable.rows.length - 1);
    const extensionTable = getElement("tsp-req-extn-table");
    while (extensionTable.rows.length > 1)
        extensionTable.deleteRow(extensionTable.rows.length - 1);
    //#endregion
    //#region Decode existing TSP request
    const tspReqSimpl = pkijs.TimeStampReq.fromBER(tspReqBuffer);
    //#endregion
    //#region Put information about message imprint
    const dgstmap = {
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
    cell1.innerHTML = Convert.ToHex(tspReqSimpl.messageImprint.hashedMessage.valueBlock.valueHexView);
    //#endregion
    //#region Put information about policy
    if (tspReqSimpl.reqPolicy) {
        getElement("tsp-req-policy").innerHTML = tspReqSimpl.reqPolicy;
        getElement("tsp-req-pol").style.display = "block";
    }
    //#endregion
    //#region Put information about nonce
    if (tspReqSimpl.nonce) {
        getElement("tsp-req-nonce").innerHTML = Convert.ToHex(tspReqSimpl.nonce.valueBlock.valueHexView);
        getElement("tsp-req-non").style.display = "block";
    }
    //#endregion
    //#region Put information about existence of "certReq" flag
    if ("certReq" in tspReqSimpl) {
        getElement("tsp-req-cert-req").innerHTML = (tspReqSimpl.certReq) ? "true" : "false";
        getElement("tsp-req-cert").style.display = "block";
    }
    //#endregion
    //#region Put information about TST info extensions
    if (tspReqSimpl.extensions) {
        const extensionTableInner = getElement("resp-extensions");
        for (let i = 0; i < tspReqSimpl.extensions.length; i++) {
            const rowInner = extensionTableInner.insertRow(extensionTableInner.rows.length);
            const cell0Inner = rowInner.insertCell(0);
            cell0Inner.innerHTML = tspReqSimpl.extensions[i].extnID;
        }
        getElement("tsp-req-extn-div").style.display = "block";
    }
    //#endregion
}
function handleFileBrowse(evt) {
    handleFileBrowse$1(evt, () => {
        parseTSPReq();
    });
}
// Register events
getElement("tsp-req-file").addEventListener("change", handleFileBrowse, false);
getElement("create-tsp-req").addEventListener("click", createTSPReq, false);
