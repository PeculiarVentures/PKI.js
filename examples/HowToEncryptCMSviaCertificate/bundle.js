import * as pvtsutils from 'https://unpkg.com/pvtsutils@latest?module';
import * as pkijs from '../pkijs.es.js';
import * as asn1js from 'https://unpkg.com/asn1js@latest?module';

async function envelopedEncrypt$1(certificateBuffer, encAlg, valueBuffer) {
    // Decode input certificate
    const certSimpl = pkijs.Certificate.fromBER(certificateBuffer);
    const cmsEnveloped = new pkijs.EnvelopedData({
        originatorInfo: new pkijs.OriginatorInfo({
            certs: new pkijs.CertificateSet({
                certificates: [certSimpl]
            })
        })
    });
    cmsEnveloped.addRecipientByCertificate(certSimpl, { oaepHashAlgorithm: encAlg.oaepHashAlg });
    await cmsEnveloped.encrypt(encAlg, valueBuffer);
    const cmsContentSimpl = new pkijs.ContentInfo();
    cmsContentSimpl.contentType = "1.2.840.113549.1.7.3";
    cmsContentSimpl.content = cmsEnveloped.toSchema();
    return cmsContentSimpl.toSchema().toBER(false);
}
async function envelopedDecrypt$1(certificateBuffer, privateKeyBuffer, cmsEnvelopedBuffer) {
    //#region Decode input certificate
    const certSimpl = pkijs.Certificate.fromBER(certificateBuffer);
    //#endregion
    //#region Decode CMS Enveloped content
    const cmsContentSimpl = pkijs.ContentInfo.fromBER(cmsEnvelopedBuffer);
    const cmsEnvelopedSimp = new pkijs.EnvelopedData({ schema: cmsContentSimpl.content });
    //#endregion
    return cmsEnvelopedSimp.decrypt(0, {
        recipientCertificate: certSimpl,
        recipientPrivateKey: privateKeyBuffer
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

let certificateBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CERT
let privateKeyBuffer = new ArrayBuffer(0);
let cmsEnvelopedBuffer = new ArrayBuffer(0);
let valueBuffer = new ArrayBuffer(0);
let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-v1_5";
let oaepHashAlg = "SHA-1";
const encAlg = {
    name: "AES-CBC",
    length: 128
};
/**
 * Create CERT
 */
async function createCertificate() {
    try {
        const certWithKey = await createSelfSignedCertificate(hashAlg, signAlg);
        certificateBuffer = certWithKey.certificate.toSchema().toBER();
        getElement("cert").innerHTML = toPEM(certificateBuffer, "CERTIFICATE");
        console.info("Certificate created successfully!");
        privateKeyBuffer = certWithKey.pkcs8;
        getElement("pkcs8_key").innerHTML = toPEM(certWithKey.pkcs8, "PRIVATE KEY");
        console.info("Private key exported successfully!");
        alert("Certificate created successfully!");
    }
    catch (error) {
        processError(error, "Error on certificate creation");
    }
}
/**
 * Encrypt input data
 */
async function envelopedEncrypt() {
    certificateBuffer = fromPEM(getElement("cert", "textarea").value);
    valueBuffer = pvtsutils.Convert.FromUtf8String(getElement("encrypted_content", "textarea").value);
    cmsEnvelopedBuffer = await envelopedEncrypt$1(certificateBuffer, {
        ...encAlg,
        oaepHashAlg,
    }, valueBuffer);
    getElement("encrypted_content").innerHTML = toPEM(cmsEnvelopedBuffer, "CMS");
    alert("Encryption process finished successfully");
}
/**
 * Decrypt input data
 */
async function envelopedDecrypt() {
    certificateBuffer = fromPEM(getElement("cert", "textarea").value);
    privateKeyBuffer = fromPEM(getElement("pkcs8_key", "textarea").value);
    cmsEnvelopedBuffer = fromPEM(getElement("encrypted_content", "textarea").value);
    const result = await envelopedDecrypt$1(certificateBuffer, privateKeyBuffer, cmsEnvelopedBuffer);
    getElement("decrypted_content").innerHTML = pvtsutils.Convert.ToUtf8String(result);
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
function handleEncAlgOnChange() {
    const encryptionAlgorithmSelect = getElement("content_enc_alg", "select").value;
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
    const encryptionAlgorithmLengthSelect = getElement("content_enc_alg_len", "select").value;
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
    const hashOption = getElement("oaep_hash_alg", "select").value;
    switch (hashOption) {
        case "alg_SHA1":
            oaepHashAlg = "sha-1";
            break;
        case "alg_SHA256":
            oaepHashAlg = "sha-256";
            break;
        case "alg_SHA384":
            oaepHashAlg = "sha-384";
            break;
        case "alg_SHA512":
            oaepHashAlg = "sha-512";
            break;
    }
}
getElement("oaep_hash_alg").addEventListener("change", handleOAEPHashAlgOnChange);
getElement("content_enc_alg_len").addEventListener("change", handleEncLenOnChange);
getElement("content_enc_alg").addEventListener("change", handleEncAlgOnChange);
getElement("sign_alg").addEventListener("change", handleSignAlgOnChange);
getElement("hash_alg").addEventListener("change", handleHashAlgOnChange);
getElement("enveloped_decrypt").addEventListener("click", envelopedDecrypt);
getElement("enveloped_encrypt").addEventListener("click", envelopedEncrypt);
getElement("cert_create").addEventListener("click", createCertificate);
