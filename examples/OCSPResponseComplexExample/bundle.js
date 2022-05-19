import * as asn1js from 'https://unpkg.com/asn1js@latest?module';
import * as pvtsutils from 'https://unpkg.com/pvtsutils@latest?module';
import * as pkijs from '../pkijs.es.js';

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
async function createSelfSignedCertificate(hashAlg, signAlg) {
    const crypto = pkijs.getCrypto(true);
    //#region Create certificate
    const certificate = new pkijs.Certificate();
    certificate.version = 2;
    certificate.serialNumber = new asn1js.Integer({ value: 1 });
    certificate.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.6",
        value: new asn1js.PrintableString({ value: "RU" })
    }));
    certificate.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.3",
        value: new asn1js.BmpString({ value: "Test" })
    }));
    certificate.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.6",
        value: new asn1js.PrintableString({ value: "RU" })
    }));
    certificate.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.3",
        value: new asn1js.BmpString({ value: "Test" })
    }));
    certificate.notBefore.value = new Date();
    const notAfter = new Date();
    notAfter.setUTCFullYear(notAfter.getUTCFullYear() + 1);
    certificate.notAfter.value = notAfter;
    certificate.extensions = []; // Extensions are not a part of certificate by default, it's an optional array
    //#region "BasicConstraints" extension
    const basicConstr = new pkijs.BasicConstraints({
        cA: true,
        pathLenConstraint: 3
    });
    certificate.extensions.push(new pkijs.Extension({
        extnID: "2.5.29.19",
        critical: false,
        extnValue: basicConstr.toSchema().toBER(false),
        parsedValue: basicConstr // Parsed value for well-known extensions
    }));
    //#endregion
    //#region "KeyUsage" extension
    const bitArray = new ArrayBuffer(1);
    const bitView = new Uint8Array(bitArray);
    bitView[0] |= 0x02; // Key usage "cRLSign" flag
    bitView[0] |= 0x04; // Key usage "keyCertSign" flag
    const keyUsage = new asn1js.BitString({ valueHex: bitArray });
    certificate.extensions.push(new pkijs.Extension({
        extnID: "2.5.29.15",
        critical: false,
        extnValue: keyUsage.toBER(false),
        parsedValue: keyUsage // Parsed value for well-known extensions
    }));
    //#endregion
    //#endregion
    const algorithm = pkijs.getAlgorithmParameters(signAlg, "generateKey");
    if ("hash" in algorithm.algorithm) {
        algorithm.algorithm.hash.name = hashAlg;
    }
    const { privateKey, publicKey } = await crypto.generateKey(algorithm.algorithm, true, algorithm.usages);
    // Exporting public key into "subjectPublicKeyInfo" value of certificate
    await certificate.subjectPublicKeyInfo.importKey(publicKey);
    // Signing final certificate
    await certificate.sign(privateKey, hashAlg);
    // Exporting keys
    const pkcs8 = await crypto.exportKey("pkcs8", privateKey);
    const spki = await crypto.exportKey("spki", publicKey);
    return {
        certificate,
        privateKey,
        publicKey,
        pkcs8,
        spki,
        pem: toPEM(certificate.toSchema().toBER(), "CERTIFICATE"),
    };
}

/**
 * Create OCSP response
 * @param hashAlg Hash algorithm
 * @param signAlg Signing algorithm
 * @returns
 */
async function createOCSPResp$1(hashAlg, signAlg) {
    const ocspRespSimpl = new pkijs.OCSPResponse();
    const ocspBasicResp = new pkijs.BasicOCSPResponse();
    const certWithKey = await createSelfSignedCertificate(hashAlg, signAlg);
    // Create specific TST info structure to sign
    ocspRespSimpl.responseStatus.valueBlock.valueDec = 0; // success
    ocspRespSimpl.responseBytes = new pkijs.ResponseBytes();
    ocspRespSimpl.responseBytes.responseType = "1.3.6.1.5.5.7.48.1.1";
    const responderIDView = new Uint8Array(1);
    responderIDView[0] = 0x01;
    ocspBasicResp.tbsResponseData.responderID = certWithKey.certificate.issuer;
    ocspBasicResp.tbsResponseData.producedAt = new Date();
    const response = new pkijs.SingleResponse();
    response.certID.hashAlgorithm.algorithmId = "1.3.14.3.2.26"; // SHA-1
    response.certID.issuerNameHash.valueBlock.valueHexView = responderIDView; // Fiction hash
    response.certID.issuerKeyHash.valueBlock.valueHexView = responderIDView; // Fiction hash
    response.certID.serialNumber.valueBlock.valueDec = 1; // Fiction serial number
    response.certStatus = new asn1js.Primitive({
        idBlock: {
            tagClass: 3,
            tagNumber: 0 // [0]
        },
    }); // status - success
    response.thisUpdate = new Date();
    ocspBasicResp.tbsResponseData.responses.push(response);
    ocspBasicResp.certs = [certWithKey.certificate];
    await ocspBasicResp.sign(certWithKey.privateKey, hashAlg);
    // Finally create completed OCSP response structure
    const encodedOCSPBasicResp = ocspBasicResp.toSchema().toBER(false);
    ocspRespSimpl.responseBytes.response = new asn1js.OctetString({ valueHex: encodedOCSPBasicResp });
    return {
        ...certWithKey,
        ocspResp: ocspRespSimpl,
    };
}
/**
 * Verify existing OCSP response
 * @param ocspResponseBuffer OCSP response
 * @param trustedCertificates List of trusted certificates
 * @returns
 */
async function verifyOCSPResp$1(ocspResponseBuffer, trustedCertificates) {
    let ocspBasicResp;
    //#region Decode existing OCSP response
    const ocspRespSimpl = pkijs.OCSPResponse.fromBER(ocspResponseBuffer);
    if (ocspRespSimpl.responseBytes) {
        ocspBasicResp = pkijs.BasicOCSPResponse.fromBER(ocspRespSimpl.responseBytes.response.valueBlock.valueHexView);
    }
    else {
        throw new Error("No \"ResponseBytes\" in the OCSP Response - nothing to verify");
    }
    //#endregion
    //#region Verify OCSP response
    return ocspBasicResp.verify({ trustedCerts: trustedCertificates });
    //#endregion
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
function decodePEM(pem, tag) {
    const pattern = new RegExp(`-{5}BEGIN ${tag}-{5}([a-zA-Z0-9=+\\/\\n\\r]+)-{5}END ${tag}-{5}`, "g");
    const res = [];
    let matches = null;
    // eslint-disable-next-line no-cond-assign
    while (matches = pattern.exec(pem)) {
        const base64 = matches[1]
            .replace(/\r/g, "")
            .replace(/\n/g, "");
        res.push(pvtsutils.Convert.FromBase64(base64));
    }
    return res;
}
function parseCertificate(source) {
    const buffers = [];
    const buffer = pvtsutils.BufferSourceConverter.toArrayBuffer(source);
    const pem = pvtsutils.Convert.ToBinary(buffer);
    if (/----BEGIN CERTIFICATE-----/.test(pem)) {
        buffers.push(...decodePEM(pem, "CERTIFICATE"));
    }
    else {
        buffers.push(buffer);
    }
    const res = [];
    for (const item of buffers) {
        res.push(pkijs.Certificate.fromBER(item));
    }
    return res;
}
function processError(e, message) {
    console.error(e);
    alert(`${message}.See developer console for more details`);
}

let ocspResponseBuffer = new ArrayBuffer(0);
const trustedCertificates = []; // Array of root certificates from "CA Bundle"
let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-V1_5";
async function createOCSPResp() {
    const ocsp = await createOCSPResp$1(hashAlg, signAlg);
    ocspResponseBuffer = ocsp.ocspResp.toSchema().toBER();
    trustedCertificates.push(ocsp.certificate);
    const resultString = [
        toPEM(ocsp.certificate.toSchema().toBER(), "CERTIFICATE"),
        toPEM(ocsp.pkcs8, "PRIVATE KEY"),
        toPEM(ocspResponseBuffer, "OCSP RESPONSE"),
    ];
    console.info("Certificate created successfully!");
    console.info("Private key exported successfully!");
    getElement("new_signed_data").innerHTML = resultString.join("\n\n");
    parseOCSPResp(ocspResponseBuffer);
    console.info("OCSP response has created successfully!");
    alert("OCSP response has created successfully!");
}
/**
 * Parse existing OCSP response
 */
function parseOCSPResp(source) {
    let ocspBasicResp;
    //#region Initial activities
    getElement("ocsp-resp-extensions").style.display = "none";
    getElement("ocsp-resp-rspid-rdn").style.display = "none";
    getElement("ocsp-resp-rspid-simpl").style.display = "none";
    const respIDTable = getElement("ocsp-resp-respid-rdn", "table");
    while (respIDTable.rows.length > 1)
        respIDTable.deleteRow(respIDTable.rows.length - 1);
    const extensionTable = getElement("ocsp-resp-extensions-table", "table");
    while (extensionTable.rows.length > 1)
        extensionTable.deleteRow(extensionTable.rows.length - 1);
    const responsesTable = getElement("ocsp-resp-attr-table", "table");
    while (extensionTable.rows.length > 1)
        extensionTable.deleteRow(extensionTable.rows.length - 1);
    //#endregion
    //#region Decode existing OCSP response
    const ocspRespSimpl = pkijs.OCSPResponse.fromBER(source);
    //#endregion
    //#region Put information about overall response status
    let status = "";
    switch (ocspRespSimpl.responseStatus.valueBlock.valueDec) {
        case 0:
            status = "successful";
            break;
        case 1:
            status = "malformedRequest";
            break;
        case 2:
            status = "internalError";
            break;
        case 3:
            status = "tryLater";
            break;
        case 4:
            status = "<not used>";
            break;
        case 5:
            status = "sigRequired";
            break;
        case 6:
            status = "unauthorized";
            break;
        default:
            alert("Wrong OCSP response status");
            return;
    }
    getElement("resp-status").innerHTML = status;
    //#endregion
    //#region Check that we do have "responseBytes"
    if (ocspRespSimpl.responseBytes) {
        ocspBasicResp = pkijs.BasicOCSPResponse.fromBER(ocspRespSimpl.responseBytes.response.valueBlock.valueHexView);
    }
    else
        return; // Nothing else to display - only status information exists
    //#endregion
    //#region Put information about signature algorithm
    const algomap = {
        "1.2.840.113549.2.1": "MD2",
        "1.2.840.113549.1.1.2": "MD2 with RSA",
        "1.2.840.113549.2.5": "MD5",
        "1.2.840.113549.1.1.4": "MD5 with RSA",
        "1.3.14.3.2.26": "SHA1",
        "1.2.840.10040.4.3": "SHA1 with DSA",
        "1.2.840.10045.4.1": "SHA1 with ECDSA",
        "1.2.840.113549.1.1.5": "SHA1 with RSA",
        "2.16.840.1.101.3.4.2.4": "SHA224",
        "1.2.840.113549.1.1.14": "SHA224 with RSA",
        "2.16.840.1.101.3.4.2.1": "SHA256",
        "1.2.840.113549.1.1.11": "SHA256 with RSA",
        "2.16.840.1.101.3.4.2.2": "SHA384",
        "1.2.840.113549.1.1.12": "SHA384 with RSA",
        "2.16.840.1.101.3.4.2.3": "SHA512",
        "1.2.840.113549.1.1.13": "SHA512 with RSA"
    };
    let signatureAlgorithm = algomap[ocspBasicResp.signatureAlgorithm.algorithmId];
    if (typeof signatureAlgorithm === "undefined")
        signatureAlgorithm = ocspBasicResp.signatureAlgorithm.algorithmId;
    else
        signatureAlgorithm = `${signatureAlgorithm} (${ocspBasicResp.signatureAlgorithm.algorithmId})`;
    getElement("sig-algo").innerHTML = signatureAlgorithm;
    //#endregion
    //#region Put information about "Responder ID"
    if (ocspBasicResp.tbsResponseData.responderID instanceof pkijs.RelativeDistinguishedNames) {
        const typemap = {
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
        for (let i = 0; i < ocspBasicResp.tbsResponseData.responderID.typesAndValues.length; i++) {
            let typeval = typemap[ocspBasicResp.tbsResponseData.responderID.typesAndValues[i].type];
            if (typeof typeval === "undefined")
                typeval = ocspBasicResp.tbsResponseData.responderID.typesAndValues[i].type;
            const subjval = ocspBasicResp.tbsResponseData.responderID.typesAndValues[i].value.valueBlock.value;
            const row = respIDTable.insertRow(respIDTable.rows.length);
            const cell0 = row.insertCell(0);
            cell0.innerHTML = typeval;
            const cell1 = row.insertCell(1);
            cell1.innerHTML = subjval;
        }
        getElement("ocsp-resp-rspid-rdn").style.display = "block";
    }
    else {
        if (ocspBasicResp.tbsResponseData.responderID instanceof asn1js.OctetString) {
            getElement("ocsp-resp-respid-simpl").innerHTML = pvtsutils.Convert.ToHex(ocspBasicResp.tbsResponseData.responderID.valueBlock.valueHexView.subarray(0, ocspBasicResp.tbsResponseData.responderID.valueBlock.valueHexView.byteLength));
            getElement("ocsp-resp-rspid-simpl").style.display = "block";
        }
        else {
            alert("Wrong OCSP response responderID");
            return;
        }
    }
    //#endregion
    // Put information about a time when the response was produced
    getElement("prod-at").innerHTML = ocspBasicResp.tbsResponseData.producedAt.toString();
    //#region Put information about extensions of the OCSP response
    if (ocspBasicResp.tbsResponseData.responseExtensions) {
        const extenmap = {
            "1.3.6.1.5.5.7.48.1.2": "Nonce",
            "1.3.6.1.5.5.7.48.1.3": "CRL References",
            "1.3.6.1.5.5.7.48.1.4": "Acceptable Response Types",
            "1.3.6.1.5.5.7.48.1.6": "Archive Cutoff",
            "1.3.6.1.5.5.7.48.1.7": "Service Locator",
            "1.3.6.1.5.5.7.48.1.8": "Preferred Signature Algorithms",
            "1.3.6.1.5.5.7.48.1.9": "Extended Revoked Definition",
            "2.5.29.21": "CRL Reason",
            "2.5.29.24": "Invalidity Date",
            "2.5.29.29": "Certificate Issuer",
            "1.3.6.1.4.1.311.21.4": "Next Update"
        };
        for (let i = 0; i < ocspBasicResp.tbsResponseData.responseExtensions.length; i++) {
            let typeval = extenmap[ocspBasicResp.tbsResponseData.responseExtensions[i].extnID];
            if (typeof typeval === "undefined")
                typeval = ocspBasicResp.tbsResponseData.responseExtensions[i].extnID;
            const row = extensionTable.insertRow(extensionTable.rows.length);
            const cell0 = row.insertCell(0);
            cell0.innerHTML = typeval;
        }
        getElement("ocsp-resp-extensions").style.display = "block";
    }
    //#endregion
    //#region Put information about OCSP responses
    for (let i = 0; i < ocspBasicResp.tbsResponseData.responses.length; i++) {
        const typeval = pvtsutils.Convert.ToHex(ocspBasicResp.tbsResponseData.responses[i].certID.serialNumber.valueBlock.valueHexView);
        let subjval = "";
        switch (ocspBasicResp.tbsResponseData.responses[i].certStatus.idBlock.tagNumber) {
            case 0:
                subjval = "good";
                break;
            case 1:
                subjval = "revoked";
                break;
            case 2:
            default:
                subjval = "unknown";
        }
        const row = responsesTable.insertRow(responsesTable.rows.length);
        const cell0 = row.insertCell(0);
        cell0.innerHTML = typeval;
        const cell1 = row.insertCell(1);
        cell1.innerHTML = subjval;
    }
    //#endregion
    getElement("ocsp-resp-data-block").style.display = "block";
    ocspResponseBuffer = source;
}
async function verifyOCSPResp() {
    try {
        const result = await verifyOCSPResp$1(ocspResponseBuffer, trustedCertificates);
        alert(`Verification result: ${result}`);
    }
    catch (error) {
        processError(error, "Error during OCSP verification");
    }
}
function handleFileBrowse(evt) {
    handleFileBrowse$1(evt, file => {
        parseOCSPResp(file);
    });
}
function parseCAbundle(buffer) {
    try {
        trustedCertificates.push(...parseCertificate(buffer));
    }
    catch (e) {
        processError(e, "Incorrect certificate data");
    }
}
function handleCABundle(evt) {
    handleFileBrowse$1(evt, file => {
        parseCAbundle(file);
    });
}
function handleHashAlgOnChange() {
    const hashOption = getElement("hash_alg", "select").value;
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
    }
}
function handleSignAlgOnChange() {
    const signOption = getElement("sign_alg", "select").value;
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
    }
}
getElement("temp_file").addEventListener("change", handleFileBrowse, false);
getElement("ca_bundle").addEventListener("change", handleCABundle, false);
getElement("hash_alg").addEventListener("change", handleHashAlgOnChange, false);
getElement("sign_alg").addEventListener("change", handleSignAlgOnChange, false);
getElement("ocsp_resp_create").addEventListener("click", createOCSPResp, false);
getElement("ocsp_resp_verify").addEventListener("click", verifyOCSPResp, false);
