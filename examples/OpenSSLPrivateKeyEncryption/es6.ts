import { base64, hex, toArrayBuffer, utf8 } from "@peculiar/utils";
import * as example from "./example";
import * as utils from "../utils";
import * as pkijs from "../../src";
import * as common from "../common";

let ivBuffer = new ArrayBuffer(0);
let aesKeyLength = 16;

async function createOpenSSLPrivateKey() {
  const privateKeyData = utils.fromPEM(common.getElement("pkijs_data", "textarea").value);
  const passwordBuffer = toArrayBuffer(utf8.encode(common.getElement("password", "input").value));

  const encryptedKey = await example.createOpenSSLPrivateKey(aesKeyLength, passwordBuffer, privateKeyData);
  ivBuffer = encryptedKey.ivBuffer;

  const resultString: string[] = [
    "-----BEGIN RSA PRIVATE KEY-----",
    "Proc-Type: 4,ENCRYPTED",
    `DEK-Info: AES-${aesKeyLength << 3}-CBC,${hex.encode(ivBuffer, { case: "upper" })}`,
    "",
    utils.formatPEM(base64.encode(encryptedKey.encryptedKeyBuffer)),
    "-----END RSA PRIVATE KEY-----",
  ];

  common.getElement("openssl_data", "textarea").value = resultString.join("\n");
}

async function parseOpenSSLPrivateKey() {
  let pemBody = "";

  const headerExp = /([\x21-\x7e]+):\s*([\x21-\x7e\s^:]+)/;

  const stringPEM = common.getElement("openssl_data", "textarea").value.replace(/(-+(BEGIN|END)( RSA)? PRIVATE KEY-+)/g, "");
  const lines = stringPEM.split(/\r?\n/);

  let dekFound = false;

  for (let i = 0; i < lines.length; i++) {
    const lineMatch = lines[i].match(headerExp);
    if (lineMatch !== null) {
      if (lineMatch[1] === "DEK-Info") {
        dekFound = true;

        const values = lineMatch[2].split(",");

        for (let j = 0; j < values.length; j++) values[j] = values[j].trim();

        switch (values[0].toLocaleUpperCase()) {
          case "AES-128-CBC":
            aesKeyLength = 16;
            break;
          case "AES-192-CBC":
            aesKeyLength = 24;
            break;
          case "AES-256-CBC":
            aesKeyLength = 32;
            break;
          default:
            throw new Error(`Unsupported algorithm ${values[0].toLocaleUpperCase()}`);
        }

        ivBuffer = toArrayBuffer(hex.decode(values[1]));
      }
    } else {
      if (dekFound) pemBody += lines[i];
    }
  }

  if (dekFound === false) throw new Error("Can not find DEK-Info section!");

  const privateKeyData = utils.fromBase64(pemBody.trim());
  const passwordBuffer = toArrayBuffer(utf8.encode(common.getElement("password", "input").value));

  const decryptedKey = await example.parseOpenSSLPrivateKey(aesKeyLength, ivBuffer, passwordBuffer, privateKeyData);

  // Just in order to check all was decoded correctly
  pkijs.RSAPrivateKey.fromBER(decryptedKey);

  common.getElement("pkijs_data", "textarea").value = utils.toPEM(decryptedKey, "RSA PRIVATE KEY");
}

function handleContentEncLenOnChange(): void {
  const encryptionAlgorithmLengthSelect = common.getElement("content_enc_alg_len", "select").value;
  switch (encryptionAlgorithmLengthSelect) {
    case "len_128":
      aesKeyLength = 128 << 3;
      break;
    case "len_192":
      aesKeyLength = 192 << 3;
      break;
    case "len_256":
      aesKeyLength = 256 << 3;
      break;
    default:
  }
}

async function generateOpenSSLPrivateKey() {
  const alg = {
    name: "RSASSA-PKCS1-v1_5",
    hash: "SHA-256",
    publicExponent: new Uint8Array([1, 0, 1]),
    modulusLength: 2048,
  };
  const { privateKey } = await crypto.subtle.generateKey(alg, true, ["sign", "verify"]);
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", privateKey);
  const pki = pkijs.PrivateKeyInfo.fromBER(pkcs8);
  common.getElement("pkijs_data", "textarea").innerHTML = utils.toPEM(pki.privateKey.valueBlock.valueHexView as BufferSource, "RSA PRIVATE KEY");
}

common.getElement("open_ssl_encrypt").addEventListener("click", createOpenSSLPrivateKey);
common.getElement("open_ssl_decrypt").addEventListener("click", parseOpenSSLPrivateKey);
common.getElement("open_ssl_generate").addEventListener("click", generateOpenSSLPrivateKey);
common.getElement("content_enc_alg_len").addEventListener("change", handleContentEncLenOnChange);
