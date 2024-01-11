import * as pkijs from 'pkijs';
import * as asn1js from 'asn1js';

const crypto = pkijs.getCrypto(true);

// Create certificate
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

const algorithm = pkijs.getAlgorithmParameters("RSASSA-PKCS1-v1_5", "generateKey");
if ("hash" in algorithm.algorithm) {
  algorithm.algorithm.hash.name = "SHA-256";
}

const keys = await crypto.generateKey(algorithm.algorithm, true, algorithm.usages);

// Exporting public key into "subjectPublicKeyInfo" value of certificate
await certificate.subjectPublicKeyInfo.importKey(keys.publicKey);

// Signing final certificate
await certificate.sign(keys.privateKey, "SHA-256");

const raw = certificate.toSchema().toBER();
