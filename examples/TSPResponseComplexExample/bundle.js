import * as pkijs from '../pkijs.es.js';
import * as asn1js from 'https://unpkg.com/asn1js@latest?module';
import * as pvtsutils from 'https://unpkg.com/pvtsutils@latest?module';
import { Convert } from 'https://unpkg.com/pvtsutils@latest?module';

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

const testData = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09]);
/**
 * Creates TSP response
 * @param hashAlgorithm Hash algorithm
 * @param signAlg Signing algorithm
 * @returns
 */
async function createTSPResp$1(hashAlgorithm, signAlg) {
    const crypto = pkijs.getCrypto(true);
    const certWithKey = await createSelfSignedCertificate(hashAlgorithm, signAlg);
    //#region Hash "testData" value
    const hashedMessage = await crypto.digest(hashAlgorithm, testData);
    //#endregion
    //#region Create specific TST info structure to sign
    const hashedBuffer = new ArrayBuffer(4);
    const hashedView = new Uint8Array(hashedBuffer);
    hashedView[0] = 0x7F;
    hashedView[1] = 0x02;
    hashedView[2] = 0x03;
    hashedView[3] = 0x04;
    const tstInfoSimpl = new pkijs.TSTInfo({
        version: 1,
        policy: "1.1.1",
        messageImprint: new pkijs.MessageImprint({
            hashAlgorithm: new pkijs.AlgorithmIdentifier({ algorithmId: pkijs.getOIDByAlgorithm({ name: hashAlgorithm }, true, "hashAlgorithm") }),
            hashedMessage: new asn1js.OctetString({ valueHex: hashedMessage })
        }),
        serialNumber: new asn1js.Integer({ valueHex: hashedBuffer }),
        genTime: new Date(),
        ordering: true,
        accuracy: new pkijs.Accuracy({
            seconds: 1,
            millis: 1,
            micros: 10
        }),
        nonce: new asn1js.Integer({ valueHex: hashedBuffer })
    });
    const tstInfoRaw = tstInfoSimpl.toSchema().toBER(false);
    //#endregion
    //#region Initialize CMS Signed Data structures and sign it
    const encapContent = new pkijs.EncapsulatedContentInfo();
    encapContent.eContentType = "1.2.840.113549.1.9.16.1.4"; // "tSTInfo" content type
    encapContent.eContent = new asn1js.OctetString({ valueHex: tstInfoRaw });
    const cmsSignedSimpl = new pkijs.SignedData({
        version: 3,
        encapContentInfo: encapContent,
        signerInfos: [
            new pkijs.SignerInfo({
                version: 1,
                sid: new pkijs.IssuerAndSerialNumber({
                    issuer: certWithKey.certificate.issuer,
                    serialNumber: certWithKey.certificate.serialNumber
                })
            })
        ],
        certificates: [certWithKey.certificate]
    });
    await cmsSignedSimpl.sign(certWithKey.privateKey, 0, hashAlgorithm);
    //#endregion
    //#region Create internal CMS Signed Data
    const cmsSignedSchema = cmsSignedSimpl.toSchema(true);
    const cmsContentSimp = new pkijs.ContentInfo({
        contentType: "1.2.840.113549.1.7.2",
        content: cmsSignedSchema
    });
    const cmsRaw = cmsContentSimp.toSchema();
    //#endregion
    //#region Finally create completed TSP response structure
    const tspResponse = new pkijs.TimeStampResp({
        status: new pkijs.PKIStatusInfo({ status: 0 }),
        timeStampToken: new pkijs.ContentInfo({ schema: cmsRaw })
    });
    //#endregion
    return {
        ...certWithKey,
        trustedCertificates: [certWithKey.certificate],
        tspResponse,
    };
}
/**
 * Verify existing TSP response
 * @param params TSP parameters
 * @returns
 */
async function verifyTSPResp$1(params) {
    // Verify TSP response
    return params.tspResponse.verify({ signer: 0, trustedCerts: params.trustedCertificates, data: testData.buffer });
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
function handleFileBrowse(evt, cb) {
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

let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-V1_5";
const certWithKey = {};
const $newSignedData = getElement("new_signed_data");
const $respImprint = getElement("resp-imprint", "table");
const $respAccur = getElement("resp-accur");
const $respOrd = getElement("resp-ord");
const $respOrdering = getElement("resp-ordering");
const $respNon = getElement("resp-non");
const $respNonce = getElement("resp-nonce");
const $respTsRdn = getElement("resp-ts-rdn");
const $respTsSimpl = getElement("resp-ts-simpl");
const $respExt = getElement("resp-ext");
const $respAccuracy = getElement("resp-accuracy", "table");
const $respTsa = getElement("resp-tsa", "table");
const $respExtensions = getElement("resp-extensions", "table");
const $respSerial = getElement("resp-serial", "span");
const $signAlg = getElement("sign_alg", "select");
const $hashAlg = getElement("hash_alg", "select");
const $respStatus = getElement("resp-status");
const $respPolicy = getElement("resp-policy");
const $respTime = getElement("resp-time");
//#region Create TSP response
async function createTSPResp() {
    const tsp = await createTSPResp$1(hashAlg, signAlg);
    let resultString = toPEM(tsp.certificate.toSchema().toBER(), "CERTIFICATE");
    console.info("Certificate created successfully!");
    resultString += toPEM(tsp.pkcs8, "PRIVATE KEY");
    console.info("Private key exported successfully!");
    resultString += toPEM(tsp.tspResponse.toSchema().toBER(), "TSP RESPONSE");
    console.info("TSP response has created successfully!");
    $newSignedData.innerHTML = resultString;
    parseTSPResp(tsp.tspResponse.toSchema().toBER());
    Object.assign(certWithKey, tsp);
    alert("TSP response has created successfully!");
}
//#endregion
//#region Parse existing TSP response
function parseTSPResp(tspResponse) {
    //#region Initial activities
    $respAccur.style.display = "none";
    $respOrd.style.display = "none";
    $respNon.style.display = "none";
    $respTsRdn.style.display = "none";
    $respTsSimpl.style.display = "none";
    $respExt.style.display = "none";
    const imprTable = $respImprint;
    while (imprTable.rows.length > 1)
        imprTable.deleteRow(imprTable.rows.length - 1);
    const accurTable = $respAccuracy;
    while (accurTable.rows.length > 1)
        accurTable.deleteRow(accurTable.rows.length - 1);
    const tsTable = $respTsa;
    while (tsTable.rows.length > 1)
        tsTable.deleteRow(tsTable.rows.length - 1);
    const extTable = $respExtensions;
    while (extTable.rows.length > 1)
        extTable.deleteRow(extTable.rows.length - 1);
    //#endregion
    //#region Decode existing TSP response
    const tspRespSimpl = pkijs.TimeStampResp.fromBER(tspResponse);
    //#endregion
    //#region Put information about TSP response status
    $respStatus.innerHTML = pkijs.PKIStatus[tspRespSimpl.status.status] || "unknown";
    //#endregion
    //#region Parse internal CMS Signed Data
    if (!tspRespSimpl.timeStampToken) {
        alert("No additional info but PKIStatusInfo");
        return;
    }
    const signedSimpl = new pkijs.SignedData({ schema: tspRespSimpl.timeStampToken.content });
    if (!signedSimpl.encapContentInfo) {
        throw new Error("'signedSimpl.encapContentInfo' is empty");
    }
    if (!signedSimpl.encapContentInfo.eContent) {
        throw new Error("'signedSimpl.encapContentInfo.eContent' is empty");
    }
    const tstInfoSimpl = pkijs.TSTInfo.fromBER(signedSimpl.encapContentInfo.eContent.valueBlock.valueHexView);
    //#endregion
    //#region Put information about policy
    $respPolicy.innerHTML = tstInfoSimpl.policy;
    //#endregion
    //#region Put information about TST info message imprint
    const dgstmap = {
        "1.3.14.3.2.26": "SHA-1",
        "2.16.840.1.101.3.4.2.1": "SHA-256",
        "2.16.840.1.101.3.4.2.2": "SHA-384",
        "2.16.840.1.101.3.4.2.3": "SHA-512"
    };
    let hashAlgorithm = dgstmap[tstInfoSimpl.messageImprint.hashAlgorithm.algorithmId];
    if (typeof hashAlgorithm === "undefined")
        hashAlgorithm = tstInfoSimpl.messageImprint.hashAlgorithm.algorithmId;
    const imprintTable = $respImprint;
    const row = imprintTable.insertRow(imprintTable.rows.length);
    const cell0 = row.insertCell(0);
    cell0.innerHTML = hashAlgorithm;
    const cell1 = row.insertCell(1);
    cell1.innerHTML = Convert.ToHex(tstInfoSimpl.messageImprint.hashedMessage.valueBlock.valueHexView);
    //#endregion
    //#region Put information about TST info serial number
    $respSerial.innerHTML = Convert.ToHex(tstInfoSimpl.serialNumber.valueBlock.valueHexView);
    //#endregion
    //#region Put information about the time when TST info was generated
    $respTime.innerHTML = tstInfoSimpl.genTime.toString();
    //#endregion
    //#region Put information about TST info accuracy
    if (tstInfoSimpl.accuracy) {
        const rowInner = $respAccuracy.insertRow($respAccuracy.rows.length);
        const cell0Inner = rowInner.insertCell(0);
        cell0Inner.innerHTML = (tstInfoSimpl.accuracy.seconds || 0).toString();
        const cell1Inner = rowInner.insertCell(1);
        cell1Inner.innerHTML = (tstInfoSimpl.accuracy.millis || 0).toString();
        const cell2 = rowInner.insertCell(2);
        cell2.innerHTML = (tstInfoSimpl.accuracy.micros || 0).toString();
        $respAccur.style.display = "block";
    }
    //#endregion
    //#region Put information about TST info ordering
    if (tstInfoSimpl.ordering !== undefined) {
        $respOrdering.innerHTML = tstInfoSimpl.ordering.toString();
        $respOrd.style.display = "block";
    }
    //#endregion
    //#region Put information about TST info nonce value
    if (tstInfoSimpl.nonce) {
        $respNonce.innerHTML = Convert.ToHex(tstInfoSimpl.nonce.valueBlock.valueHexView);
        $respNon.style.display = "block";
    }
    //#endregion
    //#region Put information about TST info TSA
    if (tstInfoSimpl.tsa) {
        switch (tstInfoSimpl.tsa.type) {
            case 1: // rfc822Name
            case 2: // dNSName
            case 6: // uniformResourceIdentifier
                $respTsSimpl.innerHTML = tstInfoSimpl.tsa.value.valueBlock.value;
                $respTsSimpl.style.display = "block";
                break;
            case 7: // iPAddress
                {
                    const view = new Uint8Array(tstInfoSimpl.tsa.value.valueBlock.valueHex);
                    $respTsSimpl.innerHTML = `${view[0].toString()}.${view[1].toString()}.${view[2].toString()}.${view[3].toString()}`;
                    $respTsSimpl.style.display = "block";
                }
                break;
            case 3: // x400Address
            case 5: // ediPartyName
                $respTsSimpl.innerHTML = (tstInfoSimpl.tsa.type === 3) ? "<type \"x400Address\">" : "<type \"ediPartyName\">";
                $respTsSimpl.style.display = "block";
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
                    for (let i = 0; i < tstInfoSimpl.tsa.value.typesAndValues.length; i++) {
                        let typeval = rdnmap[tstInfoSimpl.tsa.value.typesAndValues[i].type];
                        if (typeof typeval === "undefined")
                            typeval = tstInfoSimpl.tsa.value.typesAndValues[i].type;
                        const subjval = tstInfoSimpl.tsa.value.typesAndValues[i].value.valueBlock.value;
                        const rowInner = $respTsa.insertRow($respTsa.rows.length);
                        const cell0Inner = rowInner.insertCell(0);
                        cell0Inner.innerHTML = typeval;
                        const cell1Inner = rowInner.insertCell(1);
                        cell1Inner.innerHTML = subjval;
                    }
                    $respTsRdn.style.display = "block";
                }
                break;
        }
    }
    //#endregion
    //#region Put information about TST info extensions
    if (tstInfoSimpl.extensions) {
        for (let i = 0; i < tstInfoSimpl.extensions.length; i++) {
            const rowInner = $respExtensions.insertRow($respExtensions.rows.length);
            const cell0Inner = rowInner.insertCell(0);
            cell0Inner.innerHTML = tstInfoSimpl.extensions[i].extnID;
        }
        $respExt.style.display = "block";
    }
    //#endregion
}
//#endregion
//#region Verify existing TSP response
async function verifyTSPResp() {
    try {
        const result = await verifyTSPResp$1(certWithKey);
        alert(`Verification result: ${result}`);
    }
    catch (error) {
        console.error(error);
        alert("Error during verification. See developer console for detailed information");
    }
}
//#endregion
//#region Parse "CA Bundle" file
function parseCAbundle(buffer) {
    try {
        certWithKey.trustedCertificates.push(...parseCertificate(buffer));
    }
    catch (e) {
        console.error(e);
        alert("Incorrect certificate data");
    }
}
//#endregion
function handleTSPResp(evt) {
    handleFileBrowse(evt, (file) => {
        parseTSPResp(file);
    });
}
function handleCA(evt) {
    handleFileBrowse(evt, (file) => {
        parseCAbundle(file);
    });
}
function handleHashAlgOnChange() {
    const hashOption = $hashAlg.value;
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
    const signOption = $signAlg.value;
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
// Register events
getElement("temp_file").addEventListener("change", handleTSPResp, false);
getElement("ca_bundle").addEventListener("change", handleCA, false);
getElement("create-tsp-resp").addEventListener("click", createTSPResp, false);
getElement("verify-tsp-resp").addEventListener("click", verifyTSPResp, false);
$signAlg.addEventListener("change", handleSignAlgOnChange, false);
$hashAlg.addEventListener("change", handleHashAlgOnChange, false);
