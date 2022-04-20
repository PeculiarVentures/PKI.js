/* eslint-disable no-console,no-undef,no-unreachable */
import * as asn1js from "asn1js";
import * as pkijs from "../../src";
import * as common from "../common";

// pdf.js
declare const PDFDocument: any;
declare const isRef: any;

const trustedCertificates: pkijs.Certificate[] = []; // Array of Certificates

async function verifyPDFSignature(buffer: ArrayBuffer) {
  try {
    const view = new Uint8Array(buffer);
    const pdf = new PDFDocument(null, view, null);
    pdf.parseStartXRef();
    pdf.parse();

    const acroForm = pdf.xref.root.get("AcroForm");
    if (typeof acroForm === "undefined")
      throw new Error("The PDF has no signature!");

    const fields = acroForm.get("Fields");
    if (isRef(fields[0]) === false)
      throw new Error("Wrong structure of PDF!");

    const sigField = pdf.xref.fetch(fields[0]);

    const sigFieldType = sigField.get("FT");
    if ((typeof sigFieldType === "undefined") || (sigFieldType.name !== "Sig"))
      throw new Error("Wrong structure of PDF!");

    const v = sigField.get("V");
    const byteRange = v.get("ByteRange");
    const contents = v.get("Contents");

    const contentLength = contents.length;
    const contentBuffer = new ArrayBuffer(contentLength);
    const contentView = new Uint8Array(contentBuffer);

    for (let i = 0; i < contentLength; i++)
      contentView[i] = contents.charCodeAt(i);

    const asn1 = asn1js.fromBER(contentBuffer);
    pkijs.AsnError.assert(asn1, "CMS SignedData");

    const cmsContentSimp = new pkijs.ContentInfo({ schema: asn1.result });
    const cmsSignedSimp = new pkijs.SignedData({ schema: cmsContentSimp.content });

    const signedDataBuffer = new ArrayBuffer(byteRange[1] + byteRange[3]);
    const signedDataView = new Uint8Array(signedDataBuffer);

    let count = 0;
    for (let i = byteRange[0]; i < (byteRange[0] + byteRange[1]); i++, count++)
      signedDataView[count] = view[i];

    for (let j = byteRange[2]; j < (byteRange[2] + byteRange[3]); j++, count++)
      signedDataView[count] = view[j];

    const verifyResult = await cmsSignedSimp.verify({
      signer: 0,
      data: signedDataBuffer,
      trustedCerts: trustedCertificates
    });

    if ("signedAttrs" in cmsSignedSimp.signerInfos[0]) {
      const crypto = pkijs.getCrypto(true);
      let shaAlgorithm = "";

      switch (cmsSignedSimp.signerInfos[0].digestAlgorithm.algorithmId) {
        case "1.3.14.3.2.26":
          shaAlgorithm = "sha-1";
          break;
        case "2.16.840.1.101.3.4.2.1":
          shaAlgorithm = "sha-256";
          break;
        case "2.16.840.1.101.3.4.2.2":
          shaAlgorithm = "sha-384";
          break;
        case "2.16.840.1.101.3.4.2.3":
          shaAlgorithm = "sha-512";
          break;
        default:
          throw new Error("Unknown hashing algorithm");
      }

      if (verifyResult === false)
        throw new Error("Signature verification failed");

      const digest = await crypto.digest({ name: shaAlgorithm }, new Uint8Array(signedDataBuffer));

      let messageDigest = new ArrayBuffer(0);

      const signedAttrs = cmsSignedSimp.signerInfos[0].signedAttrs;
      for (let j = 0; signedAttrs && j < signedAttrs.attributes.length; j++) {
        if (signedAttrs.attributes[j].type === "1.2.840.113549.1.9.4") {
          messageDigest = signedAttrs.attributes[j].values[0].valueBlock.valueHex;
          break;
        }
      }

      if (messageDigest.byteLength === 0)
        throw new Error("No signed attribute 'MessageDigest'");

      const view1 = new Uint8Array(messageDigest);
      const view2 = new Uint8Array(digest);

      if (view1.length !== view2.length)
        throw new Error("Hash is not correct");

      for (let i = 0; i < view1.length; i++) {
        if (view1[i] !== view2[i])
          throw new Error("Hash is not correct");
      }
    }

    if (!verifyResult) {
      alert("PDF verification failed!");
    } else {
      alert("PDF successfully verified!");
    }
  } catch (e) {
    console.error(e);
    alert("Error on PDF verification. See developer console for more details");
  }
}

function handleFileBrowse(evt: Event) {
  common.handleFileBrowse(evt, file => {
    verifyPDFSignature(file);
  });
}

function handleCABundle(evt: Event) {
  common.handleFileBrowse(evt, file => {
    trustedCertificates.push(...common.parseCertificate(file));
  });
}

common.getElement("pdfFile").addEventListener("change", handleFileBrowse, false);
common.getElement("caBundle").addEventListener("change", handleCABundle, false);