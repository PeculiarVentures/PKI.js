/// <reference path="types.d.ts" />

import * as pvutils from "pvutils";
import * as utils from "../../test/utils";
import * as pkijs from "../../src";
import * as common from "../common";

import MimeNode from "emailjs-mime-builder";
import parse from "emailjs-mime-parser";

let certificateBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CERT

let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-v1_5";
let oaepHashAlg = "SHA-1";

const encAlg = {
  name: "AES-CBC",
  length: 128
};

//#region Create CERT

async function createCertificate() {
  try {
    const cert = await utils.createSelfSignedCertificate(hashAlg, signAlg);

    common.getElement("pkcs8_key").innerHTML = utils.toPEM(cert.pkcs8, "PRIVATE KEY");
    common.getElement("new_signed_data").innerHTML = cert.pem;

    alert("Certificate created successfully!");
  } catch (e) {
    console.error(e);
    alert(`Error certificate creation. See developer console for more details`);
  }
}

//#endregion

/**
 * Encrypt input data and format as S/MIME message
 */
async function smimeEncrypt() {
  // Decode input certificate
  certificateBuffer = utils.fromPEM(common.getElement("new_signed_data").innerHTML);
  const certSimpl = pkijs.Certificate.fromBER(certificateBuffer);

  const cmsEnveloped = new pkijs.EnvelopedData();

  cmsEnveloped.addRecipientByCertificate(certSimpl, { oaepHashAlgorithm: oaepHashAlg });

  try {
    await cmsEnveloped.encrypt(encAlg, pvutils.stringToArrayBuffer(common.getElement("content", "textarea").value));
  } catch (e) {
    console.error(e);
    alert(`Error during encryption process. See developer console for more details`);
  }

  const cmsContentSimpl = new pkijs.ContentInfo();
  cmsContentSimpl.contentType = "1.2.840.113549.1.7.3";
  cmsContentSimpl.content = cmsEnveloped.toSchema();

  const schema = cmsContentSimpl.toSchema();
  const ber = schema.toBER(false);

  // Insert enveloped data into new Mime message
  const mimeBuilder = new MimeNode("application/pkcs7-mime; name=smime.p7m; smime-type=enveloped-data; charset=binary")
    .setHeader("content-description", "Enveloped Data")
    .setHeader("content-disposition", "attachment; filename=smime.p7m")
    .setHeader("content-transfer-encoding", "base64")
    .setContent(new Uint8Array(ber));
  mimeBuilder.setHeader("from", "sender@example.com");
  mimeBuilder.setHeader("to", "recipient@example.com");
  mimeBuilder.setHeader("subject", "Example S/MIME encrypted message");

  common.getElement("encrypted_content").innerHTML = mimeBuilder.build();

  alert("Encryption process finished successfully");
}

/**
 * Decrypt input data
 */
async function smimeDecrypt() {
  // Decode input certificate
  certificateBuffer = utils.fromPEM(common.getElement("new_signed_data", "textarea").value);

  const certSimpl = pkijs.Certificate.fromBER(certificateBuffer);

  // Decode input private key
  const privateKeyBuffer = utils.fromPEM(common.getElement("pkcs8_key", "textarea").value);

  // Parse S/MIME message to get CMS enveloped content
  const parser = parse(common.getElement("encrypted_content", "textarea").value);

  // Make all CMS data
  const cmsContentSimpl = pkijs.ContentInfo.fromBER(parser.content.buffer);
  const cmsEnvelopedSimp = new pkijs.EnvelopedData({ schema: cmsContentSimpl.content });

  JSON.parse;
  let result: ArrayBuffer;
  try {
    result = await cmsEnvelopedSimp.decrypt(0,
      {
        recipientCertificate: certSimpl,
        recipientPrivateKey: privateKeyBuffer
      });

    common.getElement("decrypted_content").innerHTML = pvutils.arrayBufferToString(result);
  } catch (e) {
    console.error(e);
    alert(`error during decryption process. See developer console for more details`);
  }
}

function handleHashAlgOnChange() {
  const hashOption = common.getElement("hash_alg", "select").value;
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
    default:
  }
}

function handleSignAlgOnChange() {
  const signOption = common.getElement("sign_alg", "select").value;
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
    default:
  }
}

function handleEncAlgOnChange() {
  const encryptionAlgorithmSelect = common.getElement("content_enc_alg", "select").value;
  switch (encryptionAlgorithmSelect) {
    case "alg_CBC":
      encAlg.name = "AES-CBC";
      break;
    case "alg_GCM":
      encAlg.name = "AES-GCM";
      break;
    default:
  }
}

function handleEncLenOnChange() {
  const encryptionAlgorithmLengthSelect = common.getElement("content_enc_alg_len", "select").value;
  switch (encryptionAlgorithmLengthSelect) {
    case "len_128":
      encAlg.length = 128;
      break;
    case "len_192":
      encAlg.length = 192;
      break;
    case "len_256":
      encAlg.length = 256;
      break;
    default:
  }
}

function handleOAEPHashAlgOnChange() {
  const hashOption = common.getElement("oaep_hash_alg", "select").value;
  switch (hashOption) {
    case "alg_SHA1":
      oaepHashAlg = "sha-1";
      break;
    case "alg_SHA256":
      oaepHashAlg = "sha-256";
      break;
    case "alg_SHA384":
      oaepHashAlg = "sha-384";
      break;
    case "alg_SHA512":
      oaepHashAlg = "sha-512";
      break;
    default:
  }
}

common.getElement("hash_alg").addEventListener("change", handleHashAlgOnChange);
common.getElement("sign_alg").addEventListener("change", handleSignAlgOnChange);
common.getElement("content_enc_alg").addEventListener("change", handleEncAlgOnChange);
common.getElement("content_enc_alg_len").addEventListener("change", handleEncLenOnChange);
common.getElement("oaep_hash_alg").addEventListener("change", handleOAEPHashAlgOnChange);
common.getElement("smime_encrypt").addEventListener("click", smimeEncrypt);
common.getElement("smime_decrypt").addEventListener("click", smimeDecrypt);
common.getElement("create_certificate").addEventListener("click", createCertificate);