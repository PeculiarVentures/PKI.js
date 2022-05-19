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

//#region Create P7B Data
async function createP7B$1(hashAlg, signAlg) {
    //#region Initial variables
    const certSimpl = new pkijs.Certificate();
    //#endregion
    //#region Get a "crypto" extension
    const crypto = pkijs.getCrypto(true);
    //#endregion
    //#region Put a static values
    certSimpl.version = 2;
    certSimpl.serialNumber = new asn1js.Integer({ value: 1 });
    certSimpl.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.6",
        value: new asn1js.PrintableString({ value: "RU" })
    }));
    certSimpl.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.3",
        value: new asn1js.BmpString({ value: "Test" })
    }));
    certSimpl.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.6",
        value: new asn1js.PrintableString({ value: "RU" })
    }));
    certSimpl.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.3",
        value: new asn1js.BmpString({ value: "Test" })
    }));
    certSimpl.notBefore.value = new Date(2013, 0, 1);
    certSimpl.notAfter.value = new Date(2016, 0, 1);
    certSimpl.extensions = []; // Extensions are not a part of certificate by default, it's an optional array
    //#region "KeyUsage" extension
    const bitArray = new ArrayBuffer(1);
    const bitView = new Uint8Array(bitArray);
    bitView[0] |= 0x02; // Key usage "cRLSign" flag
    //bitView[0] = bitView[0] | 0x04; // Key usage "keyCertSign" flag
    const keyUsage = new asn1js.BitString({ valueHex: bitArray });
    certSimpl.extensions.push(new pkijs.Extension({
        extnID: "2.5.29.15",
        critical: false,
        extnValue: keyUsage.toBER(false),
        parsedValue: keyUsage // Parsed value for well-known extensions
    }));
    //#endregion
    //#endregion
    //#region Create a new key pair
    //#region Get default algorithm parameters for key generation
    const algorithm = pkijs.getAlgorithmParameters(signAlg, "generateKey");
    if ("hash" in algorithm.algorithm)
        algorithm.algorithm.hash.name = hashAlg;
    //#endregion
    const { privateKey, publicKey } = await crypto.generateKey(algorithm.algorithm, true, algorithm.usages);
    //#endregion
    //#endregion
    //#region Exporting public key into "subjectPublicKeyInfo" value of certificate
    await certSimpl.subjectPublicKeyInfo.importKey(publicKey);
    //#endregion
    //#region Signing final certificate
    await certSimpl.sign(privateKey, hashAlg);
    //#endregion
    //#region Encode final ContentInfo
    const cmsContentSimp = new pkijs.ContentInfo({
        contentType: "1.2.840.113549.1.7.2",
        content: (new pkijs.SignedData({
            version: 1,
            encapContentInfo: new pkijs.EncapsulatedContentInfo({
                eContentType: "1.2.840.113549.1.7.1" // "data" content type
            }),
            certificates: [
                certSimpl,
                certSimpl,
                certSimpl
            ] // Put 3 copies of the same X.509 certificate
        })).toSchema(true)
    });
    return cmsContentSimp.toSchema().toBER(false);
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
function processError(e, message) {
    console.error(e);
    alert(`${message}.See developer console for more details`);
}

let cmsSignedBuffer = new ArrayBuffer(0);
let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-v1_5";
async function createP7B() {
    try {
        cmsSignedBuffer = await createP7B$1(hashAlg, signAlg);
        getElement("newSignedData").innerHTML = toPEM(cmsSignedBuffer, "CMS");
    }
    catch (e) {
        processError(e, "Error on CMS creating");
    }
}
//#endregion
function handleHashAlgOnChange() {
    const hashOption = getElement("hashAlg", "select").value;
    switch (hashOption) {
        case "algSHA1":
            hashAlg = "sha-1";
            break;
        case "algSHA256":
            hashAlg = "sha-256";
            break;
        case "algSHA384":
            hashAlg = "sha-384";
            break;
        case "algSHA512":
            hashAlg = "sha-512";
            break;
    }
}
function handleSignAlgOnChange() {
    const signOption = getElement("signAlg", "select").value;
    switch (signOption) {
        case "algRSA15":
            signAlg = "RSASSA-PKCS1-V1_5";
            break;
        case "algRSA2":
            signAlg = "RSA-PSS";
            break;
        case "algECDSA":
            signAlg = "ECDSA";
            break;
    }
}
getElement("hashAlg").addEventListener("click", handleHashAlgOnChange);
getElement("signAlg").addEventListener("click", handleSignAlgOnChange);
getElement("create_p7b").addEventListener("click", createP7B);
