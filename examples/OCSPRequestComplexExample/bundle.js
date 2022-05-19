import * as pvtsutils from 'https://unpkg.com/pvtsutils@latest?module';
import * as asn1js from 'https://unpkg.com/asn1js@latest?module';
import * as pkijs from '../pkijs.es.js';

/**
 * Create OCSP request
 * @returns
 */
async function createOCSPReq$1() {
    //#region Initial variables
    const ocspReqSimpl = new pkijs.OCSPRequest();
    //#endregion
    //#region Put static variables
    ocspReqSimpl.tbsRequest.requestorName = new pkijs.GeneralName({
        type: 4,
        value: new pkijs.RelativeDistinguishedNames({
            typesAndValues: [
                new pkijs.AttributeTypeAndValue({
                    type: "2.5.4.6",
                    value: new asn1js.PrintableString({ value: "RU" })
                }),
                new pkijs.AttributeTypeAndValue({
                    type: "2.5.4.3",
                    value: new asn1js.BmpString({ value: "Test" })
                })
            ]
        })
    });
    const fictionBuffer = new ArrayBuffer(4);
    const fictionView = new Uint8Array(fictionBuffer);
    fictionView[0] = 0x7F;
    fictionView[1] = 0x01;
    fictionView[2] = 0x02;
    fictionView[3] = 0x03;
    ocspReqSimpl.tbsRequest.requestList = [new pkijs.Request({
            reqCert: new pkijs.CertID({
                hashAlgorithm: new pkijs.AlgorithmIdentifier({
                    algorithmId: "1.3.14.3.2.26"
                }),
                issuerNameHash: new asn1js.OctetString({ valueHex: fictionBuffer }),
                issuerKeyHash: new asn1js.OctetString({ valueHex: fictionBuffer }),
                serialNumber: new asn1js.Integer({ valueHex: fictionBuffer })
            })
        })];
    ocspReqSimpl.tbsRequest.requestExtensions = [
        new pkijs.Extension({
            extnID: "1.3.6.1.5.5.7.48.1.2",
            extnValue: (new asn1js.OctetString({ valueHex: fictionBuffer })).toBER(false)
        })
    ];
    //#endregion
    // Encode OCSP request and put on the Web page
    return ocspReqSimpl.toSchema(true).toBER(false);
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

/**
 * ArrayBuffer with loaded or created OCSP request
 */
let ocspReqBuffer = new ArrayBuffer(0);
async function createOCSPReq() {
    const ocspRequestBuffer = await createOCSPReq$1();
    getElement("new_signed_data").innerHTML = toPEM(ocspRequestBuffer, "OCSP REQUEST");
    parseOCSPReq(ocspRequestBuffer);
    alert("OCSP request has created successfully!");
}
/**
 * Parse existing OCSP request
 * @returns
 */
function parseOCSPReq(source) {
    //#region Initial check
    if (source.byteLength === 0) {
        alert("Nothing to parse!");
        return;
    }
    //#endregion
    //#region Initial activities
    getElement("ocsp-req-extn-div").style.display = "none";
    const requestsTable = getElement("ocsp-req-requests", "table");
    while (requestsTable.rows.length > 1)
        requestsTable.deleteRow(requestsTable.rows.length - 1);
    const extensionTable = getElement("ocsp-req-extn-table", "table");
    while (extensionTable.rows.length > 1)
        extensionTable.deleteRow(extensionTable.rows.length - 1);
    const requestorTable = getElement("ocsp-req-name", "table");
    while (requestorTable.rows.length > 1)
        requestorTable.deleteRow(requestorTable.rows.length - 1);
    //#endregion
    //#region Decode existing OCSP request
    const ocspReqSimpl = pkijs.OCSPRequest.fromBER(source);
    //#endregion
    //#region Put information about OCSP request requestor
    if (ocspReqSimpl.tbsRequest.requestorName) {
        switch (ocspReqSimpl.tbsRequest.requestorName.type) {
            case 1: // rfc822Name
            case 2: // dNSName
            case 6: // uniformResourceIdentifier
                getElement("ocsp-req-name-simpl").innerHTML = ocspReqSimpl.tbsRequest.requestorName.value.valueBlock.value;
                getElement("ocsp-req-nm-simpl").style.display = "block";
                break;
            case 7: // iPAddress
                {
                    const view = new Uint8Array(ocspReqSimpl.tbsRequest.requestorName.value.valueBlock.valueHex);
                    getElement("ocsp-req-name-simpl").innerHTML = `${view[0].toString()}.${view[1].toString()}.${view[2].toString()}.${view[3].toString()}`;
                    getElement("ocsp-req-nm-simpl").style.display = "block";
                }
                break;
            case 3: // x400Address
            case 5: // ediPartyName
                getElement("ocsp-req-name-simpl").innerHTML = (ocspReqSimpl.tbsRequest.requestorName.type === 3) ? "<type \"x400Address\">" : "<type \"ediPartyName\">";
                getElement("ocsp-req-nm-simpl").style.display = "block";
                break;
            case 4: // directoryName
                {
                    const rdnmap = {
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
                    getElement("ocsp-req-name-div").style.display = "block";
                }
                break;
        }
    }
    //#endregion
    //#region Put information about requests
    for (let i = 0; i < ocspReqSimpl.tbsRequest.requestList.length; i++) {
        const row = requestsTable.insertRow(requestsTable.rows.length);
        const cell0 = row.insertCell(0);
        cell0.innerHTML = pvtsutils.Convert.ToHex(ocspReqSimpl.tbsRequest.requestList[i].reqCert.serialNumber.valueBlock.valueHexView);
    }
    //#endregion
    //#region Put information about request extensions
    if (ocspReqSimpl.tbsRequest.requestExtensions) {
        for (let i = 0; i < ocspReqSimpl.tbsRequest.requestExtensions.length; i++) {
            const row = extensionTable.insertRow(extensionTable.rows.length);
            const cell0 = row.insertCell(0);
            cell0.innerHTML = ocspReqSimpl.tbsRequest.requestExtensions[i].extnID;
        }
        getElement("ocsp-req-extn-div").style.display = "block";
    }
    //#endregion
    ocspReqBuffer = source;
}
function handleFileBrowse(evt) {
    handleFileBrowse$1(evt, parseOCSPReq);
}
getElement("ocsp-req-file").addEventListener("change", handleFileBrowse, false);
getElement("ocsp-req-create").addEventListener("click", createOCSPReq, false);

export { ocspReqBuffer };
