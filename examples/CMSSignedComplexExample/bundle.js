import * as pvutils from 'https://unpkg.com/pvutils@latest?module';
import * as pkijs from '../pkijs.es.js';
import * as asn1js from 'https://unpkg.com/asn1js@latest?module';
import * as pvtsutils from 'https://unpkg.com/pvtsutils@latest?module';

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
 * Create CMS_Signed
 */
async function createCMSSigned$1(hashAlg, signAlg, dataBuffer, detachedSignature, addExt) {
    // Get a "crypto" extension
    const crypto = pkijs.getCrypto(true);
    const certWithKey = await createSelfSignedCertificate(hashAlg, signAlg);
    //#region Initialize CMS Signed Data structures and sign it
    const cmsSignedSimpl = new pkijs.SignedData({
        version: 1,
        encapContentInfo: new pkijs.EncapsulatedContentInfo({
            eContentType: "1.2.840.113549.1.7.1" // "data" content type
        }),
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
    //#region Check if user wants us to include signed extensions
    if (addExt) {
        // Create a message digest
        const digest = await crypto.digest({ name: hashAlg }, dataBuffer);
        //#region Combine all signed extensions
        const signedAttr = [];
        signedAttr.push(new pkijs.Attribute({
            type: "1.2.840.113549.1.9.3",
            values: [
                new asn1js.ObjectIdentifier({ value: "1.2.840.113549.1.7.1" })
            ]
        })); // contentType
        signedAttr.push(new pkijs.Attribute({
            type: "1.2.840.113549.1.9.5",
            values: [
                new asn1js.UTCTime({ valueDate: new Date() })
            ]
        })); // signingTime
        signedAttr.push(new pkijs.Attribute({
            type: "1.2.840.113549.1.9.4",
            values: [
                new asn1js.OctetString({ valueHex: digest })
            ]
        })); // messageDigest
        //#endregion
        cmsSignedSimpl.signerInfos[0].signedAttrs = new pkijs.SignedAndUnsignedAttributes({
            type: 0,
            attributes: signedAttr
        });
    }
    //#endregion
    if (detachedSignature === false) {
        const contentInfo = new pkijs.EncapsulatedContentInfo({
            eContent: new asn1js.OctetString({ valueHex: dataBuffer })
        });
        cmsSignedSimpl.encapContentInfo.eContent = contentInfo.eContent;
        await cmsSignedSimpl.sign(certWithKey.privateKey, 0, hashAlg);
    }
    else {
        await cmsSignedSimpl.sign(certWithKey.privateKey, 0, hashAlg, dataBuffer);
    }
    //#endregion
    //#region Create final result
    const cmsSignedSchema = cmsSignedSimpl.toSchema(true);
    const cmsContentSimp = new pkijs.ContentInfo({
        contentType: "1.2.840.113549.1.7.2",
        content: cmsSignedSchema
    });
    const _cmsSignedSchema = cmsContentSimp.toSchema();
    //#region Make length of some elements in "indefinite form"
    _cmsSignedSchema.lenBlock.isIndefiniteForm = true;
    const block1 = _cmsSignedSchema.valueBlock.value[1];
    block1.lenBlock.isIndefiniteForm = true;
    const block2 = block1.valueBlock.value[0];
    block2.lenBlock.isIndefiniteForm = true;
    if (detachedSignature === false) {
        const block3 = block2.valueBlock.value[2];
        block3.lenBlock.isIndefiniteForm = true;
        block3.valueBlock.value[1].lenBlock.isIndefiniteForm = true;
        block3.valueBlock.value[1].valueBlock.value[0].lenBlock.isIndefiniteForm = true;
    }
    //#endregion
    return {
        ...certWithKey,
        cmsSignedData: _cmsSignedSchema.toBER(false),
    };
    //#endregion
}
/**
 * Verify existing CMS_Signed
 */
async function verifyCMSSigned$1(cmsSignedBuffer, trustedCertificates, dataBuffer) {
    //#region Initial check
    if (cmsSignedBuffer.byteLength === 0)
        throw new Error("Nothing to verify!");
    //#endregion
    //#region Decode existing CMS_Signed
    const cmsContentSimpl = pkijs.ContentInfo.fromBER(cmsSignedBuffer);
    const cmsSignedSimpl = new pkijs.SignedData({ schema: cmsContentSimpl.content });
    //#endregion
    //#region Verify CMS_Signed
    const verificationParameters = {
        signer: 0,
        trustedCerts: trustedCertificates
    };
    if (dataBuffer) {
        verificationParameters.data = dataBuffer;
    }
    return cmsSignedSimpl.verify(verificationParameters);
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

let cmsSignedBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CMS_Signed
let certificateBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CERT
let privateKeyBuffer = new ArrayBuffer(0);
let dataBuffer = new ArrayBuffer(0);
let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-v1_5";
let addExt = false;
let detachedSignature = false;
const trustedCertificates = []; // Array of root certificates from "CA Bundle"
/**
 * Parse "CA Bundle" file
 * @param buffer
 */
function parseCAbundle(buffer) {
    try {
        trustedCertificates.push(...parseCertificate(buffer));
    }
    catch (e) {
        processError(e, "Error on Certificate parsing");
    }
}
/**
 * Parse existing CMS_Signed
 */
function parseCMSSigned() {
    //#region Initial check
    if (cmsSignedBuffer.byteLength === 0) {
        alert("Nothing to parse!");
        return;
    }
    //#endregion
    //#region Initial activities
    getElement("cms-dgst-algos").innerHTML = "";
    getElement("cms-certs").style.display = "none";
    getElement("cms-crls").style.display = "none";
    const certificatesTable = getElement("cms-certificates", "table");
    while (certificatesTable.rows.length > 1)
        certificatesTable.deleteRow(certificatesTable.rows.length - 1);
    const crlsTable = getElement("cms-rev-lists", "table");
    while (crlsTable.rows.length > 1)
        crlsTable.deleteRow(crlsTable.rows.length - 1);
    //#endregion
    //#region Decode existing CMS Signed Data
    const cmsContentSimpl = pkijs.ContentInfo.fromBER(cmsSignedBuffer);
    const cmsSignedSimpl = new pkijs.SignedData({ schema: cmsContentSimpl.content });
    //#endregion
    //#region Put information about digest algorithms in the CMS Signed Data
    const dgstmap = {
        "1.3.14.3.2.26": "SHA-1",
        "2.16.840.1.101.3.4.2.1": "SHA-256",
        "2.16.840.1.101.3.4.2.2": "SHA-384",
        "2.16.840.1.101.3.4.2.3": "SHA-512"
    };
    for (let i = 0; i < cmsSignedSimpl.digestAlgorithms.length; i++) {
        let typeval = dgstmap[cmsSignedSimpl.digestAlgorithms[i].algorithmId];
        if (typeof typeval === "undefined")
            typeval = cmsSignedSimpl.digestAlgorithms[i].algorithmId;
        const ulrow = `<li><p><span>${typeval}</span></p></li>`;
        getElement("cms-dgst-algos").innerHTML = getElement("cms-dgst-algos").innerHTML + ulrow;
    }
    //#endregion
    //#region Put information about encapsulated content type
    const contypemap = {
        "1.3.6.1.4.1.311.2.1.4": "Authenticode signing information",
        "1.2.840.113549.1.7.1": "Data content"
    };
    let eContentType = contypemap[cmsSignedSimpl.encapContentInfo.eContentType];
    if (typeof eContentType === "undefined")
        eContentType = cmsSignedSimpl.encapContentInfo.eContentType;
    getElement("cms-encap-type").innerHTML = eContentType;
    //#endregion
    //#region Put information about included certificates
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
    if (cmsSignedSimpl.certificates) {
        for (let j = 0; j < cmsSignedSimpl.certificates.length; j++) {
            let ul = "<ul>";
            const cert = cmsSignedSimpl.certificates[j];
            if (!(cert instanceof pkijs.Certificate)) {
                continue;
            }
            for (let i = 0; i < cert.issuer.typesAndValues.length; i++) {
                let typeval = rdnmap[cert.issuer.typesAndValues[i].type];
                if (typeof typeval === "undefined")
                    typeval = cert.issuer.typesAndValues[i].type;
                const subjval = cert.issuer.typesAndValues[i].value.valueBlock.value;
                ul += `<li><p><span>${typeval}</span> ${subjval}</p></li>`;
            }
            ul = `${ul}</ul>`;
            const row = certificatesTable.insertRow(certificatesTable.rows.length);
            const cell0 = row.insertCell(0);
            cell0.innerHTML = pvutils.bufferToHexCodes(cert.serialNumber.valueBlock.valueHexView);
            const cell1 = row.insertCell(1);
            cell1.innerHTML = ul;
        }
        getElement("cms-certs").style.display = "block";
    }
    //#endregion
    //#region Put information about included CRLs
    if (cmsSignedSimpl.crls) {
        for (let j = 0; j < cmsSignedSimpl.crls.length; j++) {
            let ul = "<ul>";
            const crl = cmsSignedSimpl.crls[j];
            for (let i = 0; crl instanceof pkijs.CertificateRevocationList && i < crl.issuer.typesAndValues.length; i++) {
                let typeval = rdnmap[crl.issuer.typesAndValues[i].type];
                if (typeof typeval === "undefined")
                    typeval = crl.issuer.typesAndValues[i].type;
                const subjval = crl.issuer.typesAndValues[i].value.valueBlock.value;
                ul += `<li><p><span>${typeval}</span> ${subjval}</p></li>`;
            }
            ul = `${ul}</ul>`;
            const row = crlsTable.insertRow(certificatesTable.rows.length);
            const cell = row.insertCell(0);
            //  InnerHTMLJS
            cell.innerHTML = ul;
        }
        getElement("cms-certs").style.display = "block";
    }
    //#endregion
    //#region Put information about number of signers
    getElement("cms-signs").innerHTML = cmsSignedSimpl.signerInfos.length.toString();
    //#endregion
    getElement("cms-signed-data-block").style.display = "block";
}
/**
 * Create CMS_Signed
 */
async function createCMSSigned() {
    try {
        const cms = await createCMSSigned$1(hashAlg, signAlg, dataBuffer, detachedSignature, addExt);
        certificateBuffer = cms.certificate.toSchema().toBER();
        const certPem = toPEM(certificateBuffer, "CERTIFICATE");
        console.info("Certificate created successfully!");
        privateKeyBuffer = cms.pkcs8;
        const pkcs8Pem = toPEM(privateKeyBuffer, "PRIVATE KEY");
        console.info("Private key exported successfully!");
        cmsSignedBuffer = cms.cmsSignedData;
        const cmsPem = toPEM(cmsSignedBuffer, "CMS");
        getElement("new_signed_data").innerHTML = [
            certPem,
            pkcs8Pem,
            cmsPem,
        ].join("\n\n");
        parseCMSSigned();
        alert("CMS Signed Data created successfully!");
    }
    catch (e) {
        processError(e, "Error on CMS signing");
    }
}
/**
 * Verify existing CMS_Signed
 */
async function verifyCMSSigned() {
    //#region Initial check
    if (cmsSignedBuffer.byteLength === 0) {
        alert("Nothing to verify!");
        return;
    }
    //#endregion
    try {
        const ok = await verifyCMSSigned$1(cmsSignedBuffer, trustedCertificates, detachedSignature ? dataBuffer : undefined);
        alert(`Verification result: ${ok}`);
    }
    catch (e) {
        processError(e, "Error on CMS verifying");
    }
}
//#region Functions handling file selection
function handleFileBrowse(evt) {
    handleFileBrowse$1(evt, file => {
        dataBuffer = file;
        createCMSSigned();
    });
}
function handleParsingFile(evt) {
    handleFileBrowse$1(evt, file => {
        cmsSignedBuffer = file;
        parseCMSSigned();
    });
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
function handleAddExtOnChange() {
    addExt = getElement("add_ext", "input").checked;
}
function handleDetachedSignatureOnChange() {
    detachedSignature = getElement("detached_signature", "input").checked;
}
//#endregion
getElement("add_ext").addEventListener("change", handleAddExtOnChange, false);
getElement("detached_signature").addEventListener("change", handleDetachedSignatureOnChange, false);
getElement("hash_alg").addEventListener("change", handleHashAlgOnChange, false);
getElement("sign_alg").addEventListener("change", handleSignAlgOnChange, false);
getElement("input_file").addEventListener("change", handleFileBrowse, false);
getElement("parsing_file").addEventListener("change", handleParsingFile, false);
getElement("ca_bundle").addEventListener("change", handleCABundle, false);
getElement("cms_verify").addEventListener("click", verifyCMSSigned, false);
