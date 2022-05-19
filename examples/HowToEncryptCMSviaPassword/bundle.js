import * as pvtsutils from 'https://unpkg.com/pvtsutils@latest?module';
import * as pkijs from '../pkijs.es.js';
import 'https://unpkg.com/asn1js@latest?module';

/**
 * Encrypt input data
 * @param encryptionVariant
 * @param preDefinedDataBuffer
 */
async function envelopedEncrypt$1(encryptionVariant, preDefinedDataBuffer, encryptionAlgorithm, valueBuffer) {
    //#region Get input pre-defined data
    /*
     This is an example only and we consider that key encryption algorithm
     has key length in 256 bits (default value).
     */
    if (encryptionVariant === 1) {
        if (preDefinedDataBuffer.byteLength > 32) {
            const newPreDefinedDataBuffer = new ArrayBuffer(32);
            const newPreDefinedDataView = new Uint8Array(newPreDefinedDataBuffer);
            const preDefinedDataView = new Uint8Array(preDefinedDataBuffer);
            for (let i = 0; i < 32; i++)
                newPreDefinedDataView[i] = preDefinedDataView[i];
            preDefinedDataBuffer = newPreDefinedDataBuffer;
        }
        if (preDefinedDataBuffer.byteLength < 32) {
            const newPreDefinedDataBuffer = new ArrayBuffer(32);
            const newPreDefinedDataView = new Uint8Array(newPreDefinedDataBuffer);
            const preDefinedDataView = new Uint8Array(preDefinedDataBuffer);
            for (let i = 0; i < preDefinedDataBuffer.byteLength; i++)
                newPreDefinedDataView[i] = preDefinedDataView[i];
            preDefinedDataBuffer = newPreDefinedDataBuffer;
        }
    }
    //#endregion
    const cmsEnveloped = new pkijs.EnvelopedData();
    cmsEnveloped.addRecipientByPreDefinedData(preDefinedDataBuffer, {}, encryptionVariant);
    await cmsEnveloped.encrypt(encryptionAlgorithm, valueBuffer);
    const cmsContentSimpl = new pkijs.ContentInfo();
    cmsContentSimpl.contentType = "1.2.840.113549.1.7.3";
    cmsContentSimpl.content = cmsEnveloped.toSchema();
    return cmsContentSimpl.toSchema().toBER(false);
}
/**
 * Decrypt input data
 * @param encryptionVariant
 * @param preDefinedDataBuffer
 * @param cmsEnvelopedBuffer
 * @returns
 */
async function envelopedDecrypt$1(encryptionVariant, preDefinedDataBuffer, cmsEnvelopedBuffer) {
    //#region Get input pre-defined data
    /*
     This is an example only and we consider that key encryption algorithm
     has key length in 256 bits (default value).
     */
    if (encryptionVariant === 1) {
        if (preDefinedDataBuffer.byteLength > 32) {
            const newPreDefinedDataBuffer = new ArrayBuffer(32);
            const newPreDefinedDataView = new Uint8Array(newPreDefinedDataBuffer);
            const preDefinedDataView = new Uint8Array(preDefinedDataBuffer);
            for (let i = 0; i < 32; i++)
                newPreDefinedDataView[i] = preDefinedDataView[i];
            preDefinedDataBuffer = newPreDefinedDataBuffer;
        }
        if (preDefinedDataBuffer.byteLength < 32) {
            const newPreDefinedDataBuffer = new ArrayBuffer(32);
            const newPreDefinedDataView = new Uint8Array(newPreDefinedDataBuffer);
            const preDefinedDataView = new Uint8Array(preDefinedDataBuffer);
            for (let i = 0; i < preDefinedDataBuffer.byteLength; i++)
                newPreDefinedDataView[i] = preDefinedDataView[i];
            preDefinedDataBuffer = newPreDefinedDataBuffer;
        }
    }
    //#endregion
    //#region Decode CMS Enveloped content
    const cmsContentSimpl = pkijs.ContentInfo.fromBER(cmsEnvelopedBuffer);
    const cmsEnvelopedSimp = new pkijs.EnvelopedData({ schema: cmsContentSimpl.content });
    //#endregion
    return cmsEnvelopedSimp.decrypt(0, {
        preDefinedData: preDefinedDataBuffer
    });
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
function fromPEM(pem) {
    const base64 = pem
        .replace(/-{5}(BEGIN|END) .*-{5}/gm, "")
        .replace(/\s/gm, "");
    return pvtsutils.Convert.FromBase64(base64);
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

let encryptionVariant = 2;
const encryptionAlgorithm = {
    name: "AES-CBC",
    length: 128
};
let preDefinedDataBuffer = new ArrayBuffer(0);
let valueBuffer = new ArrayBuffer(0);
let cmsEnvelopedBuffer = new ArrayBuffer(0);
async function envelopedEncrypt() {
    preDefinedDataBuffer = pvtsutils.Convert.FromUtf8String(getElement("password", "textarea").value);
    valueBuffer = pvtsutils.Convert.FromUtf8String(getElement("content", "textarea").value);
    cmsEnvelopedBuffer = await envelopedEncrypt$1(encryptionVariant, preDefinedDataBuffer, encryptionAlgorithm, valueBuffer);
    getElement("encrypted_content").innerHTML = toPEM(cmsEnvelopedBuffer, "CMS");
    alert("Encryption process finished successfully");
}
async function envelopedDecrypt() {
    preDefinedDataBuffer = pvtsutils.Convert.FromUtf8String(getElement("password", "textarea").value);
    cmsEnvelopedBuffer = fromPEM(getElement("encrypted_content").innerHTML);
    const result = await envelopedDecrypt$1(encryptionVariant, preDefinedDataBuffer, cmsEnvelopedBuffer);
    getElement("decrypted_content").innerHTML = pvtsutils.Convert.ToBinary(result);
}
function handleContentEncAlgOnChange() {
    const encryptionAlgorithmSelect = getElement("content_enc_alg", "select").value;
    switch (encryptionAlgorithmSelect) {
        case "alg_CBC":
            encryptionAlgorithm.name = "AES-CBC";
            break;
        case "alg_GCM":
            encryptionAlgorithm.name = "AES-GCM";
            break;
    }
}
function handleContentEncLenOnChange() {
    const encryptionAlgorithmLengthSelect = getElement("content_enc_alg_len", "select").value;
    switch (encryptionAlgorithmLengthSelect) {
        case "len_128":
            encryptionAlgorithm.length = 128;
            break;
        case "len_192":
            encryptionAlgorithm.length = 192;
            break;
        case "len_256":
            encryptionAlgorithm.length = 256;
            break;
    }
}
function handleContentTypeOnChange() {
    const encryptionSelect = getElement("content_type", "select").value;
    switch (encryptionSelect) {
        case "type_pass":
            encryptionVariant = 2;
            break;
        case "type_kek":
            encryptionVariant = 1;
            break;
    }
}
getElement("content_type").addEventListener("change", handleContentTypeOnChange);
getElement("content_enc_alg").addEventListener("change", handleContentEncAlgOnChange);
getElement("content_enc_alg_len").addEventListener("change", handleContentEncLenOnChange);
getElement("enveloped_decrypt").addEventListener("click", envelopedDecrypt);
getElement("enveloped_encrypt").addEventListener("click", envelopedEncrypt);
