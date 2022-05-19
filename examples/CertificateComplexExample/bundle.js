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

async function createCertificate$1(hashAlg, signAlg) {
    const certificate = new pkijs.Certificate();
    const crypto = pkijs.getCrypto(true);
    //#region Put a static values
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
    certificate.notAfter.value = new Date();
    certificate.notAfter.value.setFullYear(certificate.notAfter.value.getFullYear() + 1);
    certificate.extensions = []; // Extensions are not a part of certificate by default, it's an optional array
    //#region "BasicConstraints" extension
    const basicConstr = new pkijs.BasicConstraints({
        cA: true,
        pathLenConstraint: 3
    });
    certificate.extensions.push(new pkijs.Extension({
        extnID: "2.5.29.19",
        critical: true,
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
    //#region "ExtendedKeyUsage" extension
    const extKeyUsage = new pkijs.ExtKeyUsage({
        keyPurposes: [
            "2.5.29.37.0",
            "1.3.6.1.5.5.7.3.1",
            "1.3.6.1.5.5.7.3.2",
            "1.3.6.1.5.5.7.3.3",
            "1.3.6.1.5.5.7.3.4",
            "1.3.6.1.5.5.7.3.8",
            "1.3.6.1.5.5.7.3.9",
            "1.3.6.1.4.1.311.10.3.1",
            "1.3.6.1.4.1.311.10.3.4" // Microsoft Encrypted File System
        ]
    });
    certificate.extensions.push(new pkijs.Extension({
        extnID: "2.5.29.37",
        critical: false,
        extnValue: extKeyUsage.toSchema().toBER(false),
        parsedValue: extKeyUsage // Parsed value for well-known extensions
    }));
    //#region Microsoft-specific extensions
    const certType = new asn1js.Utf8String({ value: "certType" });
    certificate.extensions.push(new pkijs.Extension({
        extnID: "1.3.6.1.4.1.311.20.2",
        critical: false,
        extnValue: certType.toBER(false),
        parsedValue: certType // Parsed value for well-known extensions
    }));
    const prevHash = new asn1js.OctetString({ valueHex: (new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])).buffer });
    certificate.extensions.push(new pkijs.Extension({
        extnID: "1.3.6.1.4.1.311.21.2",
        critical: false,
        extnValue: prevHash.toBER(false),
        parsedValue: prevHash // Parsed value for well-known extensions
    }));
    const certificateTemplate = new pkijs.CertificateTemplate({
        templateID: "1.1.1.1.1.1",
        templateMajorVersion: 10,
        templateMinorVersion: 20
    });
    certificate.extensions.push(new pkijs.Extension({
        extnID: "1.3.6.1.4.1.311.21.7",
        critical: false,
        extnValue: certificateTemplate.toSchema().toBER(false),
        parsedValue: certificateTemplate // Parsed value for well-known extensions
    }));
    const caVersion = new pkijs.CAVersion({
        certificateIndex: 10,
        keyIndex: 20
    });
    certificate.extensions.push(new pkijs.Extension({
        extnID: "1.3.6.1.4.1.311.21.1",
        critical: false,
        extnValue: caVersion.toSchema().toBER(false),
        parsedValue: caVersion // Parsed value for well-known extensions
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
    //#region Exporting public key into "subjectPublicKeyInfo" value of certificate
    await certificate.subjectPublicKeyInfo.importKey(publicKey);
    //#endregion
    //#region Signing final certificate
    await certificate.sign(privateKey, hashAlg);
    //#endregion
    return {
        certificate,
        certificateBuffer: certificate.toSchema(true).toBER(false),
        privateKeyBuffer: await crypto.exportKey("pkcs8", privateKey),
    };
}
async function verifyCertificate$1(certificateBuffer, intermediateCertificates, trustedCertificates, crls) {
    //#region Major activities
    //#region Initial check
    if (certificateBuffer.byteLength === 0)
        return { result: false };
    //#endregion
    //#region Decode existing CERT
    const certificate = pkijs.Certificate.fromBER(certificateBuffer);
    //#endregion
    //#region Create certificate's array (end-user certificate + intermediate certificates)
    const certificates = [];
    certificates.push(...intermediateCertificates);
    certificates.push(certificate);
    //#endregion
    //#region Make a copy of trusted certificates array
    const trustedCerts = [];
    trustedCerts.push(...trustedCertificates);
    //#endregion
    //#region Create new X.509 certificate chain object
    const certChainVerificationEngine = new pkijs.CertificateChainValidationEngine({
        trustedCerts,
        certs: certificates,
        crls,
    });
    //#endregion
    // Verify CERT
    return certChainVerificationEngine.verify();
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
function decodePEM(pem, tag = "[A-Z0-9 ]+") {
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
function parseCertificate$1(source) {
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

let certificateBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CERT
const trustedCertificates = []; // Array of root certificates from "CA Bundle"
const intermediateCertificates = []; // Array of intermediate certificates
const crls = []; // Array of CRLs for all certificates (trusted + intermediate)
let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-v1_5";
function parseCertificate() {
    //#region Initial check
    if (certificateBuffer.byteLength === 0) {
        alert("Nothing to parse!");
        return;
    }
    //#endregion
    //#region Initial activities
    getElement("cert-extn-div").style.display = "none";
    const issuerTable = getElement("cert-issuer-table", "table");
    while (issuerTable.rows.length > 1)
        issuerTable.deleteRow(issuerTable.rows.length - 1);
    const subjectTable = getElement("cert-subject-table", "table");
    while (subjectTable.rows.length > 1)
        subjectTable.deleteRow(subjectTable.rows.length - 1);
    const extensionTable = getElement("cert-extn-table", "table");
    while (extensionTable.rows.length > 1)
        extensionTable.deleteRow(extensionTable.rows.length - 1);
    //#endregion
    //#region Decode existing X.509 certificate
    const certificate = pkijs.Certificate.fromBER(certificateBuffer);
    //#endregion
    //#region Put information about X.509 certificate issuer
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
    for (const typeAndValue of certificate.issuer.typesAndValues) {
        let typeval = rdnmap[typeAndValue.type];
        if (typeof typeval === "undefined")
            typeval = typeAndValue.type;
        const subjval = typeAndValue.value.valueBlock.value;
        const row = issuerTable.insertRow(issuerTable.rows.length);
        const cell0 = row.insertCell(0);
        cell0.innerHTML = typeval;
        const cell1 = row.insertCell(1);
        cell1.innerHTML = subjval;
    }
    //#endregion
    //#region Put information about X.509 certificate subject
    for (const typeAndValue of certificate.subject.typesAndValues) {
        let typeval = rdnmap[typeAndValue.type];
        if (typeof typeval === "undefined")
            typeval = typeAndValue.type;
        const subjval = typeAndValue.value.valueBlock.value;
        const row = subjectTable.insertRow(subjectTable.rows.length);
        const cell0 = row.insertCell(0);
        cell0.innerHTML = typeval;
        const cell1 = row.insertCell(1);
        cell1.innerHTML = subjval;
    }
    //#endregion
    //#region Put information about X.509 certificate serial number
    getElement("cert-serial-number").innerHTML = pvtsutils.Convert.ToHex(certificate.serialNumber.valueBlock.valueHexView);
    //#endregion
    //#region Put information about issuance date
    getElement("cert-not-before").innerHTML = certificate.notBefore.value.toString();
    //#endregion
    //#region Put information about expiration date
    getElement("cert-not-after").innerHTML = certificate.notAfter.value.toString();
    //#endregion
    //#region Put information about subject public key size
    let publicKeySize = "< unknown >";
    if (certificate.subjectPublicKeyInfo.algorithm.algorithmId.indexOf("1.2.840.113549") !== (-1)) {
        const rsaPublicKey = pkijs.RSAPublicKey.fromBER(certificate.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHexView);
        const modulusView = rsaPublicKey.modulus.valueBlock.valueHexView;
        let modulusBitLength = 0;
        if (modulusView[0] === 0x00)
            modulusBitLength = (rsaPublicKey.modulus.valueBlock.valueHexView.byteLength - 1) * 8;
        else
            modulusBitLength = rsaPublicKey.modulus.valueBlock.valueHexView.byteLength * 8;
        publicKeySize = modulusBitLength.toString();
    }
    getElement("cert-keysize").innerHTML = publicKeySize;
    //#endregion
    //#region Put information about signature algorithm
    const algomap = {
        "1.2.840.113549.1.1.2": "MD2 with RSA",
        "1.2.840.113549.1.1.4": "MD5 with RSA",
        "1.2.840.10040.4.3": "SHA1 with DSA",
        "1.2.840.10045.4.1": "SHA1 with ECDSA",
        "1.2.840.10045.4.3.2": "SHA256 with ECDSA",
        "1.2.840.10045.4.3.3": "SHA384 with ECDSA",
        "1.2.840.10045.4.3.4": "SHA512 with ECDSA",
        "1.2.840.113549.1.1.10": "RSA-PSS",
        "1.2.840.113549.1.1.5": "SHA1 with RSA",
        "1.2.840.113549.1.1.14": "SHA224 with RSA",
        "1.2.840.113549.1.1.11": "SHA256 with RSA",
        "1.2.840.113549.1.1.12": "SHA384 with RSA",
        "1.2.840.113549.1.1.13": "SHA512 with RSA"
    }; // array mapping of common algorithm OIDs and corresponding types
    let signatureAlgorithm = algomap[certificate.signatureAlgorithm.algorithmId];
    if (typeof signatureAlgorithm === "undefined")
        signatureAlgorithm = certificate.signatureAlgorithm.algorithmId;
    else
        signatureAlgorithm = `${signatureAlgorithm} (${certificate.signatureAlgorithm.algorithmId})`;
    getElement("cert-sign-algo").innerHTML = signatureAlgorithm;
    //#endregion
    //#region Put information about certificate extensions
    if (certificate.extensions) {
        for (let i = 0; i < certificate.extensions.length; i++) {
            const row = extensionTable.insertRow(extensionTable.rows.length);
            const cell0 = row.insertCell(0);
            cell0.innerHTML = certificate.extensions[i].extnID;
        }
        getElement("cert-extn-div").style.display = "block";
    }
    //#endregion
}
async function createCertificate() {
    try {
        const cert = await createCertificate$1(hashAlg, signAlg);
        certificateBuffer = cert.certificateBuffer;
        trustedCertificates.push(cert.certificate);
        parseCertificate();
        console.info("Certificate created successfully!");
        console.info("Private key exported successfully!");
        getElement("new_signed_data").innerHTML = [
            toPEM(cert.certificateBuffer, "CERTIFICATE"),
            toPEM(cert.privateKeyBuffer, "PRIVATE KEY"),
        ].join("\n\n");
        alert("Certificate created successfully!");
    }
    catch (error) {
        processError(error, "Error on Certificate creation");
    }
}
async function verifyCertificate() {
    try {
        const chainStatus = await verifyCertificate$1(certificateBuffer, intermediateCertificates, trustedCertificates, crls);
        alert(`Verification result: ${chainStatus.result}`);
    }
    catch (e) {
        processError(e, "Error on Certificate verifying");
    }
}
function handleFileBrowse(evt) {
    const tempReader = new FileReader();
    const currentFiles = evt.target.files;
    tempReader.onload =
        (event) => {
            certificateBuffer = event.target.result;
            parseCertificate();
        };
    tempReader.readAsArrayBuffer(currentFiles[0]);
}
function handleCABundle(evt) {
    handleFileBrowse$1(evt, file => {
        trustedCertificates.push(...parseCertificate$1(file));
    });
}
function handleTrustedCertsFile(evt) {
    handleFileBrowse$1(evt, file => {
        trustedCertificates.push(...parseCertificate$1(file));
    });
}
function handleInterCertsFile(evt) {
    handleFileBrowse$1(evt, file => {
        intermediateCertificates.push(...parseCertificate$1(file));
    });
}
function handleCRLsFile(evt) {
    handleFileBrowse$1(evt, file => {
        const crl = pkijs.CertificateRevocationList.fromBER(file);
        crls.push(crl);
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
getElement("hash_alg").addEventListener("change", handleHashAlgOnChange, false);
getElement("sign_alg").addEventListener("change", handleSignAlgOnChange, false);
getElement("cert_file").addEventListener("change", handleFileBrowse, false);
getElement("inter_certs").addEventListener("change", handleInterCertsFile, false);
getElement("trusted_certs").addEventListener("change", handleTrustedCertsFile, false);
getElement("crls").addEventListener("change", handleCRLsFile, false);
getElement("ca_bundle").addEventListener("change", handleCABundle, false);
getElement("cert_create").addEventListener("click", createCertificate, false);
getElement("cert_verify").addEventListener("click", verifyCertificate, false);
