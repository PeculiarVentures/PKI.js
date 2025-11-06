import * as pkijs from "pkijs";
import * as asn1js from "asn1js";
import * as assert from "assert";
import * as crypto from "crypto";
import {getCrypto} from "../src";
import {createPublicKey} from "node:crypto";


it("demonstrate webcrypto verify error", async function () {
    this.timeout(100000);

    const cryptoEngine =  getCrypto(true);

    const caKeyPair = await cryptoEngine.subtle.generateKey( {name: "ECDSA", namedCurve: "P-521"}, true, ["sign", "verify"]);

    const caCert = await getCACertificate(caKeyPair);
    const certificateSigningRequest = await getCertificateSigningRequest(cryptoEngine, caKeyPair.publicKey, caKeyPair.privateKey);

    const certificate = new pkijs.Certificate();
    certificate.version = 2;
    certificate.serialNumber = new asn1js.Integer({value: 1});

    certificate.notBefore.value = new Date();
    certificate.notBefore.value.setDate(certificate.notBefore.value.getDate() - 1);

    certificate.notAfter.value = new Date();
    certificate.notAfter.value.setDate(certificate.notAfter.value.getDate() + 7);

    certificate.subject = certificateSigningRequest.subject;

    certificate.subjectPublicKeyInfo = certificateSigningRequest.subjectPublicKeyInfo;

    certificate.issuer = caCert.subject;

    for (let i = 1; i <= 1000; i++) {
        console.log(`verifying certificate [${i}]`);
        await certificate.sign(caKeyPair.privateKey, "SHA-512");
        const verified_pkijs = await certificate.verify(caCert);
        assert(verified_pkijs);

        console.log(`verifying public key use [${i}]`);
        const certDER = certificate.toSchema(true).toBER(false);
        const x509Certificate = new crypto.X509Certificate(Buffer.from(certDER));
        const spki = await cryptoEngine.subtle.exportKey("spki", caKeyPair.publicKey);
        const nodeKey = createPublicKey({
            key: Buffer.from(spki),
            format: "der",
            type: "spki",
        });

        const verified_crypto = x509Certificate.verify(nodeKey);
        assert(verified_crypto);
    }
});

async function getCertificateSigningRequest(cryptoEngine: any, publicKey: CryptoKey, privateKey: CryptoKey) {
    const csr = new pkijs.CertificationRequest();

    csr.version = 0;

    csr.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.3", // commonName
        value: new asn1js.Utf8String({value: "Test"})
    }));

    csr.attributes = [];

    await csr.subjectPublicKeyInfo.importKey(publicKey, cryptoEngine);

    await csr.sign(privateKey, "SHA-512", cryptoEngine);

    return csr;
}

async function  getCACertificate(caKeyPair: { publicKey: CryptoKey; privateKey: CryptoKey; }) {

    const certificate = new pkijs.Certificate();
    certificate.version = 2;
    certificate.serialNumber = new asn1js.Integer({ value: 1 });
    certificate.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.3", // Common name
        value: new asn1js.BmpString({ value: "Test" })
    }));
    certificate.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.3", // Common name
        value: new asn1js.BmpString({ value: "Test" })
    }));

    certificate.notBefore.value = new Date();
    const notAfter = new Date();
    notAfter.setUTCFullYear(notAfter.getUTCFullYear() + 1);
    certificate.notAfter.value = notAfter;

    certificate.extensions = []; // Extensions are not a part of certificate by default, it's an optional array

// "BasicConstraints" extension
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

// "KeyUsage" extension
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

// Exporting public key into "subjectPublicKeyInfo" value of certificate
    await certificate.subjectPublicKeyInfo.importKey(caKeyPair.publicKey);

// Signing final certificate
    await certificate.sign(caKeyPair.privateKey, "SHA-512");

    return certificate;
}