import { describe, it, assert } from "vitest";
import * as pvutils from "pvutils";
import * as example from "./opensslPrivateKeyEncryption";

describe("OpenSSL Encrypted Private Key", () => {
  //#region Initial variables
  const passwordBuffer = pvutils.stringToArrayBuffer("password");

  const encLens = [128, 192, 256];
  //#endregion

  encLens.forEach(encLen => {
    const aesKeyLength = encLen >> 3;

    it(`Create And Parse OpenSSL Encrypted Private Key for AES-${encLen}-CBC`, async () => {
      const encryptedKey = await example.createOpenSSLPrivateKey(
        aesKeyLength,
        passwordBuffer,
        new ArrayBuffer(10)
      );
      const decryptedKey = await example.parseOpenSSLPrivateKey(
        aesKeyLength,
        encryptedKey.ivBuffer,
        passwordBuffer,
        encryptedKey.encryptedKeyBuffer
      );
      assert.strictEqual(decryptedKey.byteLength, 10);
    });
  });
});
