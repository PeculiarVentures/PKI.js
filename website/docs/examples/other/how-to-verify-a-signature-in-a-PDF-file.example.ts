import * as pkijs from "pkijs";
import { readCertificates } from "../helpers";
import { file } from "../io";
import { caCertificate, signedPDF } from "../samples";

// Replace the samples with your own signed PDF and the root certificate you trust for it
export const inputs = {
  pdf: file("Signed PDF", { name: "signed.pdf", sample: signedPDF, accept: ".pdf,application/pdf" }),
  trustedRoots: file("Trusted root certificates (PEM or DER)", { name: "sample-ca.pem", sample: caCertificate, accept: ".pem,.crt,.cer,.der" }),
};

const pdf = inputs.pdf.value;
// PDF syntax is ASCII; latin1 maps each byte to one character, so string offsets are byte offsets
const pdfText = new TextDecoder("latin1").decode(pdf);
const trustedCerts = readCertificates(inputs.trustedRoots.value);

// 1. Find the signatures. Each signature dictionary has a /ByteRange, the two parts of the
//    file it covers, and /Contents, a hex-encoded CMS signature that fills the gap between them.
const byteRanges = [...pdfText.matchAll(/\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/g)];
console.log("Signatures:", byteRanges.length);
if (byteRanges.length === 0) {
  throw new Error("The PDF is not signed");
}

for (const [index, match] of byteRanges.entries()) {
  const [start1, length1, start2, length2] = match.slice(1).map(Number);
  console.log(`Signature ${index + 1}:`);

  // 2. Extract the signed bytes and the signature. The hex string is padded with zeros,
  //    which parsing ignores.
  const signedBytes = new Uint8Array(length1 + length2);
  signedBytes.set(pdf.subarray(start1, start1 + length1));
  signedBytes.set(pdf.subarray(start2, start2 + length2), length1);
  const hex = pdfText.slice(start1 + length1 + 1, start2 - 1); // Inside the angle brackets
  const signature = Uint8Array.from(hex.match(/../g) ?? [], (byte) => parseInt(byte, 16));
  const signedData = new pkijs.SignedData({ schema: pkijs.ContentInfo.fromBER(signature).content });

  // 3. Check the signature against the signed bytes (SubFilter adbe.pkcs7.detached or ETSI.CAdES.detached)
  const result = await signedData.verify({ signer: 0, data: signedBytes.buffer, extendedMode: true });
  const signer = result.signerCertificate!;
  console.log("  Signature valid:", result.signatureVerified);
  console.log("  Signed by:", signer.subject.typesAndValues.map((attribute) => attribute.value.valueBlock.value).join(", "));

  // 4. A signature that does not reach the end of the file was followed by changes
  console.log("  Covers the whole file:", start2 + length2 === pdf.byteLength);

  // 5. Check that the signer's certificate chains up to a trusted root
  const engine = new pkijs.CertificateChainValidationEngine({
    trustedCerts,
    certs: [signer, ...(signedData.certificates ?? []).filter((item) => item instanceof pkijs.Certificate)],
  });
  const chain = await engine.verify();
  console.log("  Certificate trusted:", chain.result ? "yes" : `no (${chain.resultMessage})`);

  if (!result.signatureVerified) {
    throw new Error(`Signature ${index + 1} does not match the PDF`);
  }
}
