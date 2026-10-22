// Generates the sample files of the examples into index.ts: a CA certificate, and an S/MIME message and a PDF
// signed by a certificate it issued. The certificates are valid until 2049, so chain validation keeps passing.
//
// Run from the repository root, after `npm run build`: node website/docs/examples/samples/generate.mjs

import { writeFileSync } from "node:fs";
import * as asn1js from "asn1js";
import * as pkijs from "../../../../build/index.js";

const notAfter = new Date("2049-12-31T23:59:59Z"); // The last date UTCTime can hold

function toBase64(bytes, lineLength) {
  const base64 = Buffer.from(bytes).toString("base64");
  return lineLength ? base64.match(new RegExp(`.{1,${lineLength}}`, "g")).join("\r\n") : base64;
}

function toPEM(der) {
  return `-----BEGIN CERTIFICATE-----\n${toBase64(der, 64).replaceAll("\r\n", "\n")}\n-----END CERTIFICATE-----\n`;
}

function createName(attributes) {
  const name = new pkijs.RelativeDistinguishedNames();
  for (const [type, value] of attributes) {
    name.typesAndValues.push(new pkijs.AttributeTypeAndValue({ type, value: new asn1js.Utf8String({ value }) }));
  }
  return name;
}

function extension(extnID, critical, value) {
  return new pkijs.Extension({ extnID, critical, extnValue: value.toSchema ? value.toSchema().toBER() : value.toBER() });
}

async function createCertificate({ serial, subject, issuer, ca, extensions = [] }) {
  const keys = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const certificate = new pkijs.Certificate();
  certificate.version = 2;
  certificate.serialNumber = new asn1js.Integer({ value: serial });
  certificate.subject = subject;
  certificate.issuer = issuer ? issuer.certificate.subject : subject;
  certificate.notBefore.value = new Date("2026-01-01T00:00:00Z");
  certificate.notAfter.value = notAfter;
  certificate.extensions = [extension(pkijs.id_BasicConstraints, true, new pkijs.BasicConstraints({ cA: ca })), ...extensions];
  await certificate.subjectPublicKeyInfo.importKey(keys.publicKey);
  await certificate.sign((issuer ?? { keys }).keys.privateKey, "SHA-256");
  return { certificate, keys };
}

/** Signs data as detached CMS SignedData with the usual signed attributes */
async function signDetached(signer, data) {
  const digest = await crypto.subtle.digest("SHA-256", data);
  const signedData = new pkijs.SignedData({
    version: 1,
    encapContentInfo: new pkijs.EncapsulatedContentInfo({ eContentType: pkijs.id_ContentType_Data }),
    signerInfos: [
      new pkijs.SignerInfo({
        version: 1,
        sid: new pkijs.IssuerAndSerialNumber({ issuer: signer.certificate.issuer, serialNumber: signer.certificate.serialNumber }),
        signedAttrs: new pkijs.SignedAndUnsignedAttributes({
          type: 0,
          attributes: [
            new pkijs.Attribute({ type: "1.2.840.113549.1.9.3", values: [new asn1js.ObjectIdentifier({ value: pkijs.id_ContentType_Data })] }),
            new pkijs.Attribute({ type: "1.2.840.113549.1.9.5", values: [new asn1js.UTCTime({ valueDate: new Date() })] }),
            new pkijs.Attribute({ type: "1.2.840.113549.1.9.4", values: [new asn1js.OctetString({ valueHex: digest })] }),
          ],
        }),
      }),
    ],
    certificates: [signer.certificate],
  });
  await signedData.sign(signer.keys.privateKey, 0, "SHA-256", data);
  return new pkijs.ContentInfo({ contentType: pkijs.ContentInfo.SIGNED_DATA, content: signedData.toSchema(true) }).toSchema().toBER();
}

function createSMIME(signer, signature, signedPart) {
  const boundary = "----=_PKIjs_Sample";
  return [
    "From: Alice <alice@example.com>",
    "To: Bob <bob@example.com>",
    "Subject: Signed message from PKIjs",
    "MIME-Version: 1.0",
    `Content-Type: multipart/signed; protocol="application/pkcs7-signature"; micalg=sha-256; boundary="${boundary}"`,
    "",
    "This is a cryptographically signed message in MIME format.",
    "",
    `--${boundary}`,
    signedPart,
    `--${boundary}`,
    'Content-Type: application/pkcs7-signature; name="smime.p7s"',
    "Content-Transfer-Encoding: base64",
    'Content-Disposition: attachment; filename="smime.p7s"',
    "",
    toBase64(signature, 76),
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

/** A one-page PDF with a signature field whose /Contents holds a detached CMS signature of the rest of the file */
async function createSignedPDF(signer) {
  const contentsLength = 8192; // Hex digits reserved for the signature
  const byteRangePlaceholder = "[0 0000000000 0000000000 0000000000]";
  const text = "BT /F1 24 Tf 72 700 Td (Signed with PKIjs) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R /AcroForm << /Fields [4 0 R] /SigFlags 3 >> >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 6 0 R /Resources << /Font << /F1 7 0 R >> >> /Annots [4 0 R] >>",
    "<< /Type /Annot /Subtype /Widget /FT /Sig /Rect [0 0 0 0] /F 132 /T (Signature1) /V 5 0 R /P 3 0 R >>",
    `<< /Type /Sig /Filter /Adobe.PPKLite /SubFilter /adbe.pkcs7.detached /Name (Alice) /M (D:20260101000000Z) /ByteRange ${byteRangePlaceholder} /Contents <${"0".repeat(contentsLength)}> >>`,
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.7\n";
  const offsets = [];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  // The signature covers everything except the hex string of /Contents, angle brackets included
  const contentsStart = pdf.indexOf("/Contents <") + "/Contents ".length;
  const contentsEnd = contentsStart + contentsLength + 2;
  const byteRange = [0, contentsStart, contentsEnd, pdf.length - contentsEnd];
  const byteRangeText = `[${byteRange.join(" ")}]`.padEnd(byteRangePlaceholder.length, " ");
  pdf = pdf.replace(byteRangePlaceholder, byteRangeText);

  const bytes = new TextEncoder().encode(pdf); // The PDF is ASCII only
  const signedBytes = new Uint8Array([...bytes.subarray(0, byteRange[1]), ...bytes.subarray(byteRange[2])]);
  const signature = Buffer.from(await signDetached(signer, signedBytes)).toString("hex");
  if (signature.length > contentsLength) {
    throw new Error("The signature does not fit in /Contents");
  }
  return pdf.replace(`<${"0".repeat(contentsLength)}>`, `<${signature.padEnd(contentsLength, "0")}>`);
}

const ca = await createCertificate({ serial: 1, subject: createName([["2.5.4.3", "PKIjs Sample CA"]]), ca: true });
const alice = await createCertificate({
  serial: 2,
  subject: createName([
    ["2.5.4.3", "Alice"],
    ["1.2.840.113549.1.9.1", "alice@example.com"],
  ]),
  issuer: ca,
  ca: false,
  extensions: [
    extension(pkijs.id_SubjectAltName, false, new pkijs.GeneralNames({ names: [new pkijs.GeneralName({ type: 1, value: "alice@example.com" })] })),
  ],
});

const signedPart = ["Content-Type: text/plain; charset=utf-8", "", "Hello Bob, this message is signed. -- Alice", ""].join("\r\n");
const smime = createSMIME(alice, await signDetached(alice, new TextEncoder().encode(signedPart)), signedPart);
const pdf = await createSignedPDF(alice);

writeFileSync(
  new URL("index.ts", import.meta.url),
  `// Generated by generate.mjs: run it to recreate these samples.

/** The CA that issued the certificate of the signed samples */
export const caCertificate = ${JSON.stringify(toPEM(ca.certificate.toSchema().toBER()))};

/** An S/MIME message signed by Alice, with CRLF line breaks */
export const signedEmail = ${JSON.stringify(smime)};

/** A one-page PDF signed by Alice */
export const signedPDF = ${JSON.stringify(pdf)};
`,
);
console.log(`Wrote index.ts: S/MIME ${smime.length} bytes, PDF ${pdf.length} bytes`);
