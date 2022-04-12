import * as asn1js from "asn1js";
import * as utils from "./utils";
import * as pvtsutils from "pvtsutils";
import * as pvutils from "pvutils";
import * as pkijs from "../src";

function md5(data: BufferSource, offset: number): ArrayBuffer {
  //#region Initial variables
  const r = new Uint8Array([
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21]);

  const k = new Int32Array([
    -680876936, -389564586, 606105819, -1044525330, -176418897, 1200080426,
    -1473231341, -45705983, 1770035416, -1958414417, -42063, -1990404162,
    1804603682, -40341101, -1502002290, 1236535329, -165796510, -1069501632,
    643717713, -373897302, -701558691, 38016083, -660478335, -405537848,
    568446438, -1019803690, -187363961, 1163531501, -1444681467, -51403784,
    1735328473, -1926607734, -378558, -2022574463, 1839030562, -35309556,
    -1530992060, 1272893353, -155497632, -1094730640, 681279174, -358537222,
    -722521979, 76029189, -640364487, -421815835, 530742520, -995338651,
    -198630844, 1126891415, -1416354905, -57434055, 1700485571, -1894986606,
    -1051523, -2054922799, 1873313359, -30611744, -1560198380, 1309151649,
    -145523070, -1120210379, 718787259, -343485551]);

  let h0 = 1732584193;
  let h1 = -271733879;
  let h2 = -1732584194;
  let h3 = 271733878;

  const w = new Int32Array(16);

  let i;
  let j;
  //#endregion

  // pre-processing
  const length = data.byteLength;
  const view = pvtsutils.BufferSourceConverter.toUint8Array(data);


  const paddedLength = (length + 72) & ~63; // data + 9 extra bytes
  const padded = new Uint8Array(paddedLength);

  for (i = 0; i < length; ++i)
    padded[i] = view[offset++];

  padded[i++] = 0x80;
  const n = paddedLength - 8;

  while (i < n)
    padded[i++] = 0;

  padded[i++] = (length << 3) & 0xFF;
  padded[i++] = (length >> 5) & 0xFF;
  padded[i++] = (length >> 13) & 0xFF;
  padded[i++] = (length >> 21) & 0xFF;
  padded[i++] = (length >>> 29) & 0xFF;
  padded[i++] = 0;
  padded[i++] = 0;
  padded[i++] = 0;

  for (i = 0; i < paddedLength;) {
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let f;
    let g;

    for (j = 0; j < 16; ++j, i += 4)
      w[j] = (padded[i] | (padded[i + 1] << 8) | (padded[i + 2] << 16) | (padded[i + 3] << 24));

    for (j = 0; j < 64; ++j) {
      switch (true) {
        case (j < 16):
          f = (b & c) | ((~b) & d);
          g = j;
          break;
        case (j < 32):
          f = (d & b) | ((~d) & c);
          g = (5 * j + 1) & 15;
          break;
        case (j < 48):
          f = b ^ c ^ d;
          g = (3 * j + 5) & 15;
          break;
        default:
          f = c ^ (b | (~d));
          g = (7 * j) & 15;
      }

      const tmp = d;
      const rotateArg = (a + f + k[j] + w[g]) | 0;
      const rotate = r[j];

      d = c;
      c = b;
      b = (b + ((rotateArg << rotate) | (rotateArg >>> (32 - rotate)))) | 0;
      a = tmp;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
  }

  return (new Uint8Array([
    h0 & 0xFF, (h0 >> 8) & 0xFF, (h0 >> 16) & 0xFF, (h0 >>> 24) & 0xFF,
    h1 & 0xFF, (h1 >> 8) & 0xFF, (h1 >> 16) & 0xFF, (h1 >>> 24) & 0xFF,
    h2 & 0xFF, (h2 >> 8) & 0xFF, (h2 >> 16) & 0xFF, (h2 >>> 24) & 0xFF,
    h3 & 0xFF, (h3 >> 8) & 0xFF, (h3 >> 16) & 0xFF, (h3 >>> 24) & 0xFF
  ])).buffer;
}

function openSSLBytesToKey(password: ArrayBuffer, salt: ArrayBuffer, keyLength: number, count: number): ArrayBuffer {
  //#region Initial variables
  const hashes: ArrayBuffer[] = [];
  //#endregion

  hashes.push(md5(pvutils.utilConcatBuf(password, salt), 0));

  for (let i = 1; i <= count; i++)
    hashes.push(md5(pvutils.utilConcatBuf(hashes[i - 1], password, salt), 0));

  return pvutils.utilConcatBuf(...hashes).slice(0, keyLength);
}

/**
 * Create OpenSSL Encrypted Private Key
 */
export async function createOpenSSLPrivateKey(aesKeyLength: number, passwordBuffer: ArrayBuffer, privateKeyData: ArrayBuffer) {
  const algorithm: any = {
    name: "AES-CBC",
    length: aesKeyLength << 3
  };

  // Get a "crypto" extension
  const crypto = pkijs.getCrypto(true);

  // Generate IV
  const ivBuffer = new ArrayBuffer(16);
  const ivView = new Uint8Array(ivBuffer);
  await crypto.getRandomValues(ivView);

  algorithm.iv = ivBuffer.slice(0);

  // Generate OpenSSL encryption key
  const openSSLKey = openSSLBytesToKey(passwordBuffer, ivBuffer.slice(0, 8), aesKeyLength, 1);

  // Import OpenSSL key into crypto engine internals
  const key = await crypto.subtle.importKey("raw", openSSLKey, algorithm, false, ["encrypt", "decrypt"]);

  // Finally encrypt privatekey
  const encryptedKeyBuffer = await crypto.subtle.encrypt(algorithm, key, new Uint8Array(privateKeyData));

  return {
    encryptedKeyBuffer,
    ivBuffer,
    aesKeyLength,
  };
}

/**
 * Parse existing OpenSSL Encrypted Private Key
 */
export async function parseOpenSSLPrivateKey(aesKeyLength: number, ivBuffer: ArrayBuffer, passwordBuffer: ArrayBuffer, encryptedKeyBuffer: ArrayBuffer) {
  const algorithm = {
    name: "AES-CBC",
    length: aesKeyLength >> 3,
    iv: ivBuffer.slice(0)
  };

  const crypto = pkijs.getCrypto(true);
  const openSSLKey = openSSLBytesToKey(passwordBuffer, ivBuffer.slice(0, 8), aesKeyLength, 1);

  const key = await crypto.subtle.importKey("raw", openSSLKey, algorithm, false, ["encrypt", "decrypt"]);

  return crypto.subtle.decrypt(algorithm, key, encryptedKeyBuffer);
}