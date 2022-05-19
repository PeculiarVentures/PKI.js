import * as asn1js from 'https://unpkg.com/asn1js@latest?module';
import * as pvtsutils from 'https://unpkg.com/pvtsutils@latest?module';
import * as pkijs from '../pkijs.es.js';

async function createCRL$1(hashAlg, signAlg) {
    // Get a "crypto" extension
    const crypto = pkijs.getCrypto(true);
    // Put a static values
    const crlSimpl = new pkijs.CertificateRevocationList();
    crlSimpl.version = 1;
    crlSimpl.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.6",
        value: new asn1js.PrintableString({
            value: "RU"
        })
    }));
    crlSimpl.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.3",
        value: new asn1js.BmpString({
            value: "Test"
        })
    }));
    crlSimpl.thisUpdate = new pkijs.Time({
        type: 0,
        value: new Date()
    });
    const revokedCertificate = new pkijs.RevokedCertificate({
        userCertificate: new asn1js.Integer({
            value: 999
        }),
        revocationDate: new pkijs.Time({
            value: new Date()
        }),
        crlEntryExtensions: new pkijs.Extensions({
            extensions: [new pkijs.Extension({
                    extnID: "2.5.29.21",
                    extnValue: (new asn1js.Enumerated({
                        value: 1
                    })).toBER(false)
                })]
        })
    });
    crlSimpl.revokedCertificates = [];
    crlSimpl.revokedCertificates.push(revokedCertificate);
    crlSimpl.crlExtensions = new pkijs.Extensions({
        extensions: [new pkijs.Extension({
                extnID: "2.5.29.20",
                extnValue: (new asn1js.Integer({
                    value: 2
                })).toBER(false)
            })]
    });
    // Create a new key pair
    //#region Get default algorithm parameters for key generation
    const algorithm = pkijs.getAlgorithmParameters(signAlg, "generateKey");
    if ("hash" in algorithm.algorithm)
        algorithm.algorithm.hash.name = hashAlg;
    //#endregion
    const { privateKey, publicKey } = await crypto.generateKey(algorithm.algorithm, true, algorithm.usages);
    // Store new key in an interim variables
    const issuerPublicKey = new pkijs.PublicKeyInfo();
    await issuerPublicKey.importKey(publicKey);
    // Signing final CRL
    await crlSimpl.sign(privateKey, hashAlg);
    // Encode and store CRL
    const crlBuffer = crlSimpl.toSchema(true).toBER(false);
    // Exporting private key
    const publicKeyBuffer = await crypto.exportKey("spki", publicKey);
    return {
        crlBuffer,
        publicKeyBuffer,
    };
}
async function verifyCRL$1(crlBuffer, issuer) {
    //#region Initial check
    if (crlBuffer.byteLength === 0)
        throw new Error("Nothing to verify");
    if (!issuer)
        throw new Error("Load CRL's issuer certificate or public key");
    //#endregion
    //#region Decode existing CRL
    const asn1 = asn1js.fromBER(crlBuffer);
    pkijs.AsnError.assert(asn1, "CRL");
    const crlSimpl = new pkijs.CertificateRevocationList({
        schema: asn1.result
    });
    //#endregion
    //#region Verify CRL
    let verifyParams;
    if (issuer instanceof pkijs.Certificate) {
        verifyParams = {
            issuerCertificate: issuer,
        };
    }
    else {
        const asn = asn1js.fromBER(issuer);
        pkijs.AsnError.assert(asn1, "PublicKeyInfo");
        const publicKeyInfo = new pkijs.PublicKeyInfo({ schema: asn.result });
        verifyParams = {
            publicKeyInfo: publicKeyInfo,
        };
    }
    return crlSimpl.verify(verifyParams);
    //#endregion
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
function processError(e, message) {
    console.error(e);
    alert(`${message}.See developer console for more details`);
}

let crlBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CRL
let issuerPublicKey = new ArrayBuffer(0);
let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-V1_5";
/**
 * Create CRL
 */
async function createCRL() {
    const crl = await createCRL$1(hashAlg, signAlg);
    const clrPem = toPEM(crl.crlBuffer, "CRL");
    crlBuffer = crl.crlBuffer;
    issuerPublicKey = crl.publicKeyBuffer;
    parseCRL(crl.crlBuffer);
    getElement("newSignedData").innerHTML = clrPem;
}
/**
 * Parse existing CRL
 * @param crlBuffer
 */
function parseCRL(crlBuffer) {
    getElement("crl-extn-div").style.display = "none";
    const revokedTable = getElement("crl-rev-certs", "table");
    while (revokedTable.rows.length > 1)
        revokedTable.deleteRow(revokedTable.rows.length - 1);
    const extensionTable = getElement("crl-extn-table", "table");
    while (extensionTable.rows.length > 1)
        extensionTable.deleteRow(extensionTable.rows.length - 1);
    const issuerTable = getElement("crl-issuer-table", "table");
    while (issuerTable.rows.length > 1)
        issuerTable.deleteRow(issuerTable.rows.length - 1);
    //#region Decode existing CRL
    const crlSimpl = pkijs.CertificateRevocationList.fromBER(crlBuffer);
    //#endregion
    //#region Put information about CRL issuer
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
    for (let i = 0; i < crlSimpl.issuer.typesAndValues.length; i++) {
        let typeval = rdnmap[crlSimpl.issuer.typesAndValues[i].type];
        if (typeof typeval === "undefined") {
            typeval = crlSimpl.issuer.typesAndValues[i].type;
        }
        const subjval = crlSimpl.issuer.typesAndValues[i].value.valueBlock.value;
        const row = issuerTable.insertRow(issuerTable.rows.length);
        const cell0 = row.insertCell(0);
        cell0.innerHTML = typeval;
        const cell1 = row.insertCell(1);
        cell1.innerHTML = subjval;
    }
    //#endregion
    // Put information about issuance date
    getElement("crl-this-update").innerHTML = crlSimpl.thisUpdate.value.toString();
    //#region Put information about expiration date
    if (crlSimpl.nextUpdate) {
        getElement("crl-next-update").innerHTML = crlSimpl.nextUpdate.value.toString();
        getElement("crl-next-update-div").style.display = "block";
    }
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
    }; // array mapping of common algorithm OIDs and corresponding types
    let signatureAlgorithm = algomap[crlSimpl.signature.algorithmId];
    if (typeof signatureAlgorithm === "undefined")
        signatureAlgorithm = crlSimpl.signature.algorithmId;
    else
        signatureAlgorithm = `${signatureAlgorithm} (${crlSimpl.signature.algorithmId})`;
    getElement("crl-sign-algo").innerHTML = signatureAlgorithm;
    //#endregion
    //#region Put information about revoked certificates
    if (crlSimpl.revokedCertificates) {
        for (let i = 0; i < crlSimpl.revokedCertificates.length; i++) {
            const row = revokedTable.insertRow(revokedTable.rows.length);
            const cell0 = row.insertCell(0);
            cell0.innerHTML = pvtsutils.Convert.ToHex(crlSimpl.revokedCertificates[i].userCertificate.valueBlock.valueHexView);
            const cell1 = row.insertCell(1);
            cell1.innerHTML = crlSimpl.revokedCertificates[i].revocationDate.value.toString();
        }
        getElement("crl-rev-certs-div").style.display = "block";
    }
    //#endregion
    //#region Put information about CRL extensions
    if (crlSimpl.crlExtensions) {
        for (let i = 0; i < crlSimpl.crlExtensions.extensions.length; i++) {
            const row = extensionTable.insertRow(extensionTable.rows.length);
            const cell0 = row.insertCell(0);
            cell0.innerHTML = crlSimpl.crlExtensions.extensions[i].extnID;
        }
        getElement("crl-extn-div").style.display = "block";
    }
    //#endregion
}
/**
 * Verify existing CRL
 */
async function verifyCRL() {
    try {
        const result = await verifyCRL$1(crlBuffer, issuerPublicKey);
        alert(`Verification result: ${result}`);
    }
    catch (error) {
        processError(error, "Error during CRL verification");
    }
}
//#endregion
function handleFileBrowse(evt) {
    handleFileBrowse$1(evt, file => {
        parseCRL(file);
        crlBuffer = file;
    });
}
function handleIssuerCert(evt) {
    handleFileBrowse$1(evt, file => {
        try {
            const asn1 = asn1js.fromBER(file);
            pkijs.AsnError.assert(asn1, "Certificate");
            const cert = new pkijs.Certificate({
                schema: asn1.result,
            });
            issuerPublicKey = cert.subjectPublicKeyInfo.toSchema().toBER();
        }
        catch (e) {
            processError(e, "Error on Certificate parsing");
        }
    });
}
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
getElement("hashAlg").addEventListener("change", handleHashAlgOnChange, false);
getElement("signAlg").addEventListener("change", handleSignAlgOnChange, false);
getElement("crl-file").addEventListener("change", handleFileBrowse, false);
getElement("issuer-cert").addEventListener("change", handleIssuerCert, false);
getElement("crl-create").addEventListener("click", createCRL, false);
getElement("crl-verify").addEventListener("click", verifyCRL, false);
