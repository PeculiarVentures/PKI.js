import * as asn1js from 'https://unpkg.com/asn1js@latest?module';
import * as pkijs from '../pkijs.es.js';
import * as pvtsutils from 'https://unpkg.com/pvtsutils@latest?module';

/**
 * Create PKCS#10
 * @param hashAlg HAsh algorithm
 * @param signAlg Sign algorithm
 * @returns
 */
async function createPKCS10Internal(hashAlg, signAlg) {
    //#region Initial variables
    const pkcs10 = new pkijs.CertificationRequest();
    //#endregion
    //#region Get a "crypto" extension
    const crypto = pkijs.getCrypto(true);
    //#endregion
    //#region Put a static values
    pkcs10.version = 0;
    pkcs10.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.6",
        value: new asn1js.PrintableString({ value: "RU" })
    }));
    pkcs10.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.3",
        value: new asn1js.Utf8String({ value: "Simple test (простой тест)" })
    }));
    const altNames = new pkijs.GeneralNames({
        names: [
            new pkijs.GeneralName({
                type: 1,
                value: "email@address.com"
            }),
            new pkijs.GeneralName({
                type: 2,
                value: "www.domain.com"
            }),
            new pkijs.GeneralName({
                type: 2,
                value: "www.anotherdomain.com"
            }),
            new pkijs.GeneralName({
                type: 7,
                value: new asn1js.OctetString({ valueHex: (new Uint8Array([0xC0, 0xA8, 0x00, 0x01])).buffer })
            }),
        ]
    });
    pkcs10.attributes = [];
    //#endregion
    //#region Create a new key pair
    //#region Get default algorithm parameters for key generation
    const algorithm = pkijs.getAlgorithmParameters(signAlg, "generateKey");
    if ("hash" in algorithm.algorithm)
        algorithm.algorithm.hash.name = hashAlg;
    //#endregion
    const { privateKey, publicKey } = await crypto.generateKey(algorithm.algorithm, true, algorithm.usages);
    //#endregion
    //#region Exporting public key into "subjectPublicKeyInfo" value of PKCS#10
    await pkcs10.subjectPublicKeyInfo.importKey(publicKey);
    //#endregion
    // SubjectKeyIdentifier
    const subjectKeyIdentifier = await crypto.digest({ name: "SHA-1" }, pkcs10.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHexView);
    pkcs10.attributes.push(new pkijs.Attribute({
        type: "1.2.840.113549.1.9.14",
        values: [(new pkijs.Extensions({
                extensions: [
                    new pkijs.Extension({
                        extnID: "2.5.29.14",
                        critical: false,
                        extnValue: (new asn1js.OctetString({ valueHex: subjectKeyIdentifier })).toBER(false)
                    }),
                    new pkijs.Extension({
                        extnID: "2.5.29.17",
                        critical: false,
                        extnValue: altNames.toSchema().toBER(false)
                    }),
                    new pkijs.Extension({
                        extnID: "1.2.840.113549.1.9.7",
                        critical: false,
                        extnValue: (new asn1js.PrintableString({ value: "passwordChallenge" })).toBER(false)
                    })
                ]
            })).toSchema()]
    }));
    // Signing final PKCS#10 request
    await pkcs10.sign(privateKey, hashAlg);
    return pkcs10.toSchema().toBER(false);
}
async function verifyPKCS10Internal(pkcs10Buffer) {
    // Decode existing PKCS#10
    const pkcs10 = pkijs.CertificationRequest.fromBER(pkcs10Buffer);
    // PKCS#10
    return pkcs10.verify();
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

let pkcs10Buffer = new ArrayBuffer(0);
let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-V1_5";
async function createPKCS10() {
    pkcs10Buffer = await createPKCS10Internal(hashAlg, signAlg);
    getElement("pem-text-block", "textarea").value = toPEM(pkcs10Buffer, "CERTIFICATE REQUEST");
    parsePKCS10();
}
function parsePKCS10() {
    getElement("pkcs10-subject").innerHTML = "";
    getElement("pkcs10-exten").innerHTML = "";
    getElement("pkcs10-data-block").style.display = "none";
    getElement("pkcs10-attributes").style.display = "none";
    //#region Decode existing PKCS#10
    const pkcs10Raw = fromPEM(getElement("pem-text-block", "textarea").value);
    const pkcs10 = pkijs.CertificationRequest.fromBER(pkcs10Raw);
    //#endregion
    //#region Parse and display information about "subject"
    const typemap = {
        "2.5.4.6": "C",
        "2.5.4.11": "OU",
        "2.5.4.10": "O",
        "2.5.4.3": "CN",
        "2.5.4.7": "L",
        "2.5.4.8": "ST",
        "2.5.4.12": "T",
        "2.5.4.42": "GN",
        "2.5.4.43": "I",
        "2.5.4.4": "SN",
        "1.2.840.113549.1.9.1": "E-mail"
    };
    for (let i = 0; i < pkcs10.subject.typesAndValues.length; i++) {
        let typeval = typemap[pkcs10.subject.typesAndValues[i].type];
        if (typeof typeval === "undefined")
            typeval = pkcs10.subject.typesAndValues[i].type;
        const subjval = pkcs10.subject.typesAndValues[i].value.valueBlock.value;
        const ulrow = `<li><p><span>${typeval}</span> ${subjval}</p></li>`;
        getElement("pkcs10-subject").innerHTML = getElement("pkcs10-subject").innerHTML + ulrow;
        if (typeval === "CN") {
            getElement("pkcs10-subject-cn").innerHTML = subjval;
        }
    }
    //#endregion
    //#region Put information about public key size
    let publicKeySize = "< unknown >";
    if (pkcs10.subjectPublicKeyInfo.algorithm.algorithmId.indexOf("1.2.840.113549") !== (-1)) {
        const rsaPublicKeySimple = pkijs.RSAPublicKey.fromBER(pkcs10.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHexView);
        const modulusView = rsaPublicKeySimple.modulus.valueBlock.valueHexView;
        let modulusBitLength = 0;
        if (modulusView[0] === 0x00)
            modulusBitLength = (rsaPublicKeySimple.modulus.valueBlock.valueHexView.byteLength - 1) * 8;
        else
            modulusBitLength = rsaPublicKeySimple.modulus.valueBlock.valueHexView.byteLength * 8;
        publicKeySize = modulusBitLength.toString();
    }
    getElement("keysize").innerHTML = publicKeySize;
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
    };
    let signatureAlgorithm = algomap[pkcs10.signatureAlgorithm.algorithmId];
    if (typeof signatureAlgorithm === "undefined")
        signatureAlgorithm = pkcs10.signatureAlgorithm.algorithmId;
    else
        signatureAlgorithm = `${signatureAlgorithm} (${pkcs10.signatureAlgorithm.algorithmId})`;
    getElement("sig-algo").innerHTML = signatureAlgorithm;
    //#endregion
    //#region Put information about PKCS#10 attributes
    if (pkcs10.attributes) {
        for (let i = 0; i < pkcs10.attributes.length; i++) {
            const typeval = pkcs10.attributes[i].type;
            let subjval = "";
            for (let j = 0; j < pkcs10.attributes[i].values.length; j++) {
                if ((pkcs10.attributes[i].values[j] instanceof asn1js.Utf8String) ||
                    (pkcs10.attributes[i].values[j] instanceof asn1js.BmpString) ||
                    (pkcs10.attributes[i].values[j] instanceof asn1js.UniversalString) ||
                    (pkcs10.attributes[i].values[j] instanceof asn1js.NumericString) ||
                    (pkcs10.attributes[i].values[j] instanceof asn1js.PrintableString) ||
                    (pkcs10.attributes[i].values[j] instanceof asn1js.TeletexString) ||
                    (pkcs10.attributes[i].values[j] instanceof asn1js.VideotexString) ||
                    (pkcs10.attributes[i].values[j] instanceof asn1js.IA5String) ||
                    (pkcs10.attributes[i].values[j] instanceof asn1js.GraphicString) ||
                    (pkcs10.attributes[i].values[j] instanceof asn1js.VisibleString) ||
                    (pkcs10.attributes[i].values[j] instanceof asn1js.GeneralString) ||
                    (pkcs10.attributes[i].values[j] instanceof asn1js.CharacterString)) {
                    subjval = subjval + ((subjval.length === 0) ? "" : ";") + pkcs10.attributes[i].values[j].valueBlock.value;
                }
                else
                    subjval = subjval + ((subjval.length === 0) ? "" : ";") + pkcs10.attributes[i].values[j].constructor.blockName();
            }
            const ulrow = `<li><p><span>${typeval}</span> ${subjval}</p></li>`;
            getElement("pkcs10-exten").innerHTML = getElement("pkcs10-exten").innerHTML + ulrow;
        }
        getElement("pkcs10-attributes").style.display = "block";
    }
    //#endregion
    getElement("pkcs10-data-block").style.display = "block";
}
async function verifyPKCS10() {
    try {
        pkcs10Buffer = fromPEM(getElement("pem-text-block", "textarea").value);
        const result = await verifyPKCS10Internal(pkcs10Buffer);
        alert(`Verification passed: ${result}`);
    }
    catch (error) {
        alert(`Error during verification: ${error instanceof Error ? error.message : error}`);
    }
}
function handleHashAlgOnChange() {
    const hashOption = getElement("hashAlg").value;
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
    const signOption = getElement("signAlg").value;
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
getElement("hashAlg").addEventListener("change", handleHashAlgOnChange);
getElement("signAlg").addEventListener("change", handleSignAlgOnChange);
getElement("create_pkcs10").addEventListener("click", createPKCS10);
getElement("parse_pkcs10").addEventListener("click", parsePKCS10);
getElement("verify_pkcs10").addEventListener("click", verifyPKCS10);

export { hashAlg, pkcs10Buffer, signAlg };
