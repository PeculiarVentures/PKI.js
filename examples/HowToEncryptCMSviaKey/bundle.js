import * as pvtsutils from 'https://unpkg.com/pvtsutils@latest?module';
import 'https://unpkg.com/asn1js@latest?module';
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

function getKeyAgreeAlgorithmParams(operation, curveName) {
    const algorithm = pkijs.getAlgorithmParameters("ECDH", operation);
    algorithm.algorithm.namedCurve = curveName;
    return algorithm;
}
/**
 * Create recipient's key pair
 */
async function createKeyPair$1(curveName) {
    const crypto = pkijs.getCrypto(true);
    // Create a new key pair
    const algorithm = getKeyAgreeAlgorithmParams("generateKey", curveName);
    const { privateKey, publicKey } = await crypto.generateKey(algorithm.algorithm, true, algorithm.usages);
    // Exporting private key
    const pkcs8 = await crypto.exportKey("pkcs8", privateKey);
    // Exporting public key
    const spki = await crypto.exportKey("spki", publicKey);
    // Export key id
    const value = new ArrayBuffer(4);
    const keyPairIdBuffer = crypto.getRandomValues(new Uint8Array(value));
    return {
        pkcs8,
        spki,
        keyPairIdBuffer,
    };
}
/**
 * Encrypt input data
 */
async function envelopedEncrypt$1(keys, alg, valueBuffer) {
    const crypto = pkijs.getCrypto(true);
    const cmsEnveloped = new pkijs.EnvelopedData();
    //#region Import public key
    const algorithm = getKeyAgreeAlgorithmParams("importKey", alg.namedCurve);
    const publicKey = await crypto.importKey("spki", keys.spki, algorithm.algorithm, true, []);
    //#endregion
    cmsEnveloped.addRecipientByKeyIdentifier(publicKey, keys.keyPairIdBuffer, { kdfAlgorithm: alg.kdfHash });
    await cmsEnveloped.encrypt(alg, valueBuffer);
    const cmsContentSimpl = new pkijs.ContentInfo();
    cmsContentSimpl.contentType = "1.2.840.113549.1.7.3";
    cmsContentSimpl.content = cmsEnveloped.toSchema();
    return cmsContentSimpl.toSchema().toBER(false);
}
/**
 * Decrypt input data
 */
async function envelopedDecrypt$1(pkcs8, cmsEnvelopedBuffer) {
    //#region Decode CMS Enveloped content
    const cmsContentSimpl = pkijs.ContentInfo.fromBER(cmsEnvelopedBuffer);
    const cmsEnvelopedSimp = new pkijs.EnvelopedData({ schema: cmsContentSimpl.content });
    //#endregion
    return cmsEnvelopedSimp.decrypt(0, {
        recipientPrivateKey: pkcs8
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
function processError(e, message) {
    console.error(e);
    alert(`${message}.See developer console for more details`);
}

let keys;
let cmsEnvelopedBuffer = new ArrayBuffer(0);
let valueBuffer = new ArrayBuffer(0);
let curveName = "P-256";
let kdfHashAlg = "SHA-1";
const encAlg = {
    name: "AES-CBC",
    length: 128
};
async function createKeyPair() {
    try {
        keys = await createKeyPair$1(curveName);
        // Set private key
        const pkcs8Pem = toPEM(keys.pkcs8, "PRIVATE KEY");
        getElement("pkcs8_key").innerHTML = pkcs8Pem;
        alert("Private key exported successfully!");
        // Set public key
        const spkiPem = toPEM(keys.spki, "PUBLIC KEY");
        getElement("pkcs8_key_pub").innerHTML = spkiPem;
        alert("Public key exported successfully!");
        // Set key pair id
        getElement("pkcs8_key_id").innerHTML = pvtsutils.Convert.ToBase64(keys.keyPairIdBuffer);
        alert("Key pair id generated successfully!");
    }
    catch (error) {
        processError(error, "Error on key generation");
    }
}
async function envelopedEncrypt() {
    keys.spki = fromPEM(getElement("pkcs8_key_pub", "textarea").value);
    keys.keyPairIdBuffer = new Uint8Array(pvtsutils.Convert.FromBase64(getElement("pkcs8_key_id", "textarea").value));
    valueBuffer = pvtsutils.Convert.FromUtf8String(getElement("content", "textarea").value);
    cmsEnvelopedBuffer = await envelopedEncrypt$1(keys, {
        ...encAlg,
        kdfHash: kdfHashAlg,
        namedCurve: curveName,
    }, valueBuffer);
    getElement("encrypted_content").innerHTML = toPEM(cmsEnvelopedBuffer, "CMS");
    alert("Encryption process finished successfully");
}
async function envelopedDecrypt() {
    keys.pkcs8 = fromPEM(getElement("pkcs8_key", "textarea").value);
    cmsEnvelopedBuffer = fromPEM(getElement("encrypted_content", "textarea").value);
    const result = await envelopedDecrypt$1(keys.pkcs8, cmsEnvelopedBuffer);
    getElement("decrypted_content").innerHTML = pvtsutils.Convert.ToUtf8String(result);
}
function handleKeyAgreeAlgorithmOnChange() {
    const curveNameOption = getElement("curve_name").value;
    switch (curveNameOption) {
        case "P-256":
            curveName = "P-256";
            break;
        case "ecdh_p384":
            curveName = "P-384";
            break;
        case "ecdh_p521":
            curveName = "P-521";
            break;
    }
}
function handleEncAlgOnChange() {
    const encryptionAlgorithmSelect = getElement("content_enc_alg").value;
    switch (encryptionAlgorithmSelect) {
        case "alg_CBC":
            encAlg.name = "AES-CBC";
            break;
        case "alg_GCM":
            encAlg.name = "AES-GCM";
            break;
    }
}
function handleEncLenOnChange() {
    const encryptionAlgorithmLengthSelect = getElement("content_enc_alg_len").value;
    switch (encryptionAlgorithmLengthSelect) {
        case "len_128":
            encAlg.length = 128;
            break;
        case "len_192":
            encAlg.length = 192;
            break;
        case "len_256":
            encAlg.length = 256;
            break;
    }
}
function handleOAEPHashAlgOnChange() {
    const hashOption = getElement("oaep_hash_alg").value;
    switch (hashOption) {
        case "alg_SHA1":
            kdfHashAlg = "sha-1";
            break;
        case "alg_SHA256":
            kdfHashAlg = "sha-256";
            break;
        case "alg_SHA384":
            kdfHashAlg = "sha-384";
            break;
        case "alg_SHA512":
            kdfHashAlg = "sha-512";
            break;
    }
}
getElement("curve_name").addEventListener("change", handleKeyAgreeAlgorithmOnChange);
getElement("content_enc_alg").addEventListener("change", handleEncAlgOnChange);
getElement("content_enc_alg_len").addEventListener("change", handleEncLenOnChange);
getElement("oaep_hash_alg").addEventListener("change", handleOAEPHashAlgOnChange);
getElement("create_key_pair").addEventListener("click", createKeyPair);
getElement("enveloped_encrypt").addEventListener("click", envelopedEncrypt);
getElement("enveloped_decrypt").addEventListener("click", envelopedDecrypt);
