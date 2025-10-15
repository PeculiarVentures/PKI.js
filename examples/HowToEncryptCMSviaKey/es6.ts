import * as pvtsutils from "pvtsutils";
import * as utils from "../../test/utils";
import * as example from "../../test/howToEncryptCMSviaKey";
import * as common from "../common";

let keys: example.CreateKeyPairResult;

let cmsEnvelopedBuffer = new ArrayBuffer(0);
let valueBuffer = new ArrayBuffer(0);

let curveName = "P-256";
let kdfHashAlg = "SHA-1";

const encAlg = {
  name: "AES-CBC",
  length: 128
};

async function createKeyPair() {
  try {
    keys = await example.createKeyPair(curveName);
    // Set private key
    const pkcs8Pem = utils.toPEM(keys.pkcs8, "PRIVATE KEY");
    common.getElement("pkcs8_key").innerHTML = pkcs8Pem;
    alert("Private key exported successfully!");

    // Set public key
    const spkiPem = utils.toPEM(keys.spki, "PUBLIC KEY");
    common.getElement("pkcs8_key_pub").innerHTML = spkiPem;
    alert("Public key exported successfully!");

    // Set key pair id
    common.getElement("pkcs8_key_id").innerHTML = pvtsutils.Convert.ToBase64(keys.keyPairIdBuffer);
    alert("Key pair id generated successfully!");
  } catch (error) {
    common.processError(error, "Error on key generation");
  }
}

async function envelopedEncrypt() {
  keys.spki = utils.fromPEM(common.getElement("pkcs8_key_pub", "textarea").value);

  keys.keyPairIdBuffer = pvtsutils.Convert.FromBase64(common.getElement("pkcs8_key_id", "textarea").value);

  valueBuffer = pvtsutils.Convert.FromUtf8String(common.getElement("content", "textarea").value);
  cmsEnvelopedBuffer = await example.envelopedEncrypt(
    keys,
    {
      ...encAlg,
      kdfHash: kdfHashAlg,
      namedCurve: curveName,
    },
    valueBuffer);

  common.getElement("encrypted_content").innerHTML = utils.toPEM(cmsEnvelopedBuffer, "CMS");

  alert("Encryption process finished successfully");
}

async function envelopedDecrypt() {
  keys.pkcs8 = utils.fromPEM(common.getElement("pkcs8_key", "textarea").value);

  cmsEnvelopedBuffer = utils.fromPEM(common.getElement("encrypted_content", "textarea").value);
  const result = await example.envelopedDecrypt(keys.pkcs8, cmsEnvelopedBuffer);
  common.getElement("decrypted_content").innerHTML = pvtsutils.Convert.ToUtf8String(result);
}

function handleKeyAgreeAlgorithmOnChange() {
  const curveNameOption = (common.getElement("curve_name") as HTMLInputElement).value;
  switch (curveNameOption) {
    case "P-256":
      curveName = "P-256";
      break;
    case "ecdh_p384":
      curveName = "P-384";
      break;
    case "ecdh_p521":
      curveName = "P-521";
      break;
    default:
  }
}

function handleEncAlgOnChange() {
  const encryptionAlgorithmSelect = (common.getElement("content_enc_alg") as HTMLInputElement).value;
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
  const encryptionAlgorithmLengthSelect = (common.getElement("content_enc_alg_len") as HTMLInputElement).value;
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
  const hashOption = (common.getElement("oaep_hash_alg") as HTMLInputElement).value;
  switch (hashOption) {
    case "alg_SHA1":
      kdfHashAlg = "sha-1";
      break;
    case "alg_SHA256":
      kdfHashAlg = "sha-256";
      break;
    case "alg_SHA384":
      kdfHashAlg = "sha-384";
      break;
    case "alg_SHA512":
      kdfHashAlg = "sha-512";
      break;
    default:
  }
}

common.getElement("curve_name").addEventListener("change", handleKeyAgreeAlgorithmOnChange);
common.getElement("content_enc_alg").addEventListener("change", handleEncAlgOnChange);
common.getElement("content_enc_alg_len").addEventListener("change", handleEncLenOnChange);
common.getElement("oaep_hash_alg").addEventListener("change", handleOAEPHashAlgOnChange);
common.getElement("create_key_pair").addEventListener("click", createKeyPair);
common.getElement("enveloped_encrypt").addEventListener("click", envelopedEncrypt);
common.getElement("enveloped_decrypt").addEventListener("click", envelopedDecrypt);