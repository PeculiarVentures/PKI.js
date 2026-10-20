/// <reference path="types.d.ts" />

import { binary, toArrayBuffer, utf8 } from "@peculiar/utils";
import mimeParser from "emailjs-mime-parser";
import * as pkijs from "../../src";
import * as common from "../common";

/**
 * Array of root certificates from "CA Bundle"
 */
const trustedCertificates: pkijs.Certificate[] = [];

/**
 * Verify S/MIME signature
 */
async function verifySMIME() {
  //#region Parse MIME contents to find signature and detached data
  const parser = mimeParser.default(common.getElement("smime_message", "textarea").value);
  //#endregion

  if ("childNodes" in parser || parser.childNodes.length !== 2) {
    const lastNode = parser.childNodes[1];
    if (lastNode.contentType.value === "application/x-pkcs7-signature" || lastNode.contentType.value === "application/pkcs7-signature") {
      // Parse into pkijs types
      let cmsContentSimpl;
      let cmsSignedSimpl;

      try {
        cmsContentSimpl = pkijs.ContentInfo.fromBER(lastNode.content.buffer);
        cmsSignedSimpl = new pkijs.SignedData({ schema: cmsContentSimpl.content });
      } catch {
        alert("Incorrect message format!");
        return;
      }

      // Get signed data buffer
      const signedDataBuffer = toArrayBuffer(binary.decode(parser.childNodes[0].raw.replace(/\n/g, "\r\n")));

      // Verify the signed data
      try {
        const result = await cmsSignedSimpl.verify({
          signer: 0,
          data: signedDataBuffer,
          trustedCerts: trustedCertificates,
        });
        alert(`S/MIME message ${!result ? "verification failed" : "successfully verified"}!`);
      } catch (e) {
        console.error(e);
        alert("Error during verification. Please see developer console for more details");
      }
    }
  } else alert("No child nodes!");
}

// Functions handling file selection

function handleMIMEFile(evt: Event) {
  common.handleFileBrowse(evt, (file) => {
    common.getElement("smime_message", "textarea").value = utf8.decode(file);
  });
}

function handleCABundle(evt: Event) {
  common.handleFileBrowse(evt, (file) => {
    try {
      trustedCertificates.push(...common.parseCertificate(file));
    } catch (e) {
      console.error(e);
      alert("Incorrect certificate data");
    }
  });
}

common.getElement("verify_smime").addEventListener("click", verifySMIME, false);
common.getElement("ca_bundle").addEventListener("change", handleCABundle, false);
common.getElement("mime_file").addEventListener("change", handleMIMEFile, false);
