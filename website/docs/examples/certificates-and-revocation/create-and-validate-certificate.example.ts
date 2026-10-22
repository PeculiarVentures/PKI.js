import * as asn1js from "asn1js";
import * as pkijs from "pkijs";
import { download } from "../io";

// Builds a name with a single common name (CN)
function createName(commonName: string) {
  const name = new pkijs.RelativeDistinguishedNames();
  name.typesAndValues.push(
    new pkijs.AttributeTypeAndValue({
      type: "2.5.4.3", // Common name
      value: new asn1js.Utf8String({ value: commonName }),
    }),
  );
  return name;
}

const algorithm = { name: "ECDSA", namedCurve: "P-256" };
const notAfter = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

// 1. A self-signed root CA certificate
const rootKeys = await crypto.subtle.generateKey(algorithm, true, ["sign", "verify"]);
const root = new pkijs.Certificate();
root.version = 2; // X.509 v3
root.serialNumber = new asn1js.Integer({ value: 1 });
root.subject = createName("Example Root CA");
root.issuer = root.subject; // Self-signed
root.notBefore.value = new Date();
root.notAfter.value = notAfter;

const caConstraints = new pkijs.BasicConstraints({ cA: true });
const caKeyUsage = new asn1js.BitString({ valueHex: new Uint8Array([0x06]).buffer, unusedBits: 1 }); // keyCertSign, cRLSign
root.extensions = [
  new pkijs.Extension({
    extnID: pkijs.id_BasicConstraints,
    critical: true,
    extnValue: caConstraints.toSchema().toBER(),
    parsedValue: caConstraints,
  }),
  new pkijs.Extension({
    extnID: pkijs.id_KeyUsage,
    critical: true,
    extnValue: caKeyUsage.toBER(),
    parsedValue: caKeyUsage,
  }),
];
await root.subjectPublicKeyInfo.importKey(rootKeys.publicKey);
await root.sign(rootKeys.privateKey, "SHA-256");

// 2. An end-entity certificate for example.com, signed by the root CA
const leafKeys = await crypto.subtle.generateKey(algorithm, true, ["sign", "verify"]);
const leaf = new pkijs.Certificate();
leaf.version = 2;
leaf.serialNumber = new asn1js.Integer({ value: 2 });
leaf.subject = createName("example.com");
leaf.issuer = root.subject;
leaf.notBefore.value = new Date();
leaf.notAfter.value = notAfter;

const altNames = new pkijs.GeneralNames({
  names: [new pkijs.GeneralName({ type: 2, value: "example.com" })], // dNSName
});
leaf.extensions = [
  new pkijs.Extension({
    extnID: pkijs.id_SubjectAltName,
    critical: false,
    extnValue: altNames.toSchema().toBER(),
    parsedValue: altNames,
  }),
];
await leaf.subjectPublicKeyInfo.importKey(leafKeys.publicKey);
await leaf.sign(rootKeys.privateKey, "SHA-256");

// 3. Encode the certificate to DER, as it would be stored or sent
const der = leaf.toSchema().toBER();
console.log("DER (base64):", leaf.toString("base64"));
download("example.com.cer", der);
download("example-root-ca.cer", root.toSchema().toBER());

// 4. Parse it back and read its fields
const parsed = pkijs.Certificate.fromBER(der);
console.log("Subject:", parsed.subject.typesAndValues[0].value.valueBlock.value);
console.log("Issuer:", parsed.issuer.typesAndValues[0].value.valueBlock.value);
console.log("Serial number:", parsed.serialNumber.valueBlock.toString());
console.log("Valid until:", parsed.notAfter.value.toISOString());
const san = parsed.extensions?.find((extension) => extension.extnID === pkijs.id_SubjectAltName);
if (san?.parsedValue instanceof pkijs.AltName) {
  console.log("Subject alternative names:", san.parsedValue.altNames.map((name) => name.value));
}

// 5. Check the signature with the issuer's certificate
console.log("Signature valid:", await parsed.verify(root));

// 6. Validate the whole chain, from the certificate up to the trusted root
const engine = new pkijs.CertificateChainValidationEngine({
  trustedCerts: [root],
  certs: [parsed],
});
const result = await engine.verify();
console.log("Chain valid:", result.result);
if (!result.result) {
  throw new Error(result.resultMessage);
}
