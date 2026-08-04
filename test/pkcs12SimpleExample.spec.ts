import { describe, it, assert, expect } from "vitest";
import * as crypto from "crypto";
import "./utils";
import * as example from "./pkcs12SimpleExample";
import { CryptoEngine, PFX } from "../src/index";
import { Convert } from "pvtsutils";

describe("PKCS#12 Simple Example", () => {
  const password = "12345567890";

  it("Password-based Integrity, SHA-1", async () => {
    await expect(example.passwordBasedIntegrity(password, "SHA-1")).resolves.toBeInstanceOf(
      ArrayBuffer
    );
  });

  it("Password-based Integrity, SHA-256", async () => {
    await expect(example.passwordBasedIntegrity(password, "SHA-256")).resolves.toBeInstanceOf(
      ArrayBuffer
    );
  });

  it("Password-based Integrity, SHA-384", async () => {
    await expect(example.passwordBasedIntegrity(password, "SHA-384")).resolves.toBeInstanceOf(
      ArrayBuffer
    );
  });

  it("Password-based Integrity, SHA-512", async () => {
    await expect(example.passwordBasedIntegrity(password, "SHA-512")).resolves.toBeInstanceOf(
      ArrayBuffer
    );
  });

  it("Password-based Integrity, incorrect algorithm", async () => {
    await expect(example.passwordBasedIntegrity(password, "SHA-5122")).rejects.toThrow(Error);
  });

  it("Certificate-based Integrity", async () => {
    await expect(example.certificateBasedIntegrity()).resolves.toBeInstanceOf(ArrayBuffer);
  });

  it("No-Privacy Test", async () => {
    await expect(example.noPrivacy(password)).resolves.toBeInstanceOf(ArrayBuffer);
  });

  it("Password Privacy", async () => {
    await expect(example.passwordPrivacy(password)).resolves.toBeInstanceOf(ArrayBuffer);
  });

  it("Certificate Privacy", async () => {
    await expect(example.certificatePrivacy(password)).resolves.toBeInstanceOf(ArrayBuffer);
  });

  describe("Making OpenSSL-like PKCS#12 Data", () => {
    it("ASCII", async () => {
      const pfx = await example.openSSLLike(password);
      await expect(example.parsePKCS12(pfx, password)).resolves.toBeInstanceOf(PFX);
    });

    it("UTF-8", async () => {
      const password = "пароль";
      const pfx = await example.openSSLLike(password);
      await expect(example.parsePKCS12(pfx, password)).resolves.toBeInstanceOf(PFX);
    });

    it("Binary", async () => {
      const password = "\x04\xff\x20\x21"; // decode/encode -> [ 4, 239, 191, 189, 32, 33 ]
      const pfx = await example.openSSLLike(password);
      await expect(example.parsePKCS12(pfx, password)).resolves.toBeInstanceOf(PFX);
    });
  });

  it("Speed test for stampDataWithPassword", async () => {
    const engine = new CryptoEngine({
      name: "node",
      crypto: crypto.webcrypto as globalThis.Crypto
    });
    const encData = await engine.stampDataWithPassword({
      password: Convert.FromUtf8String(password),
      salt: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer,
      iterationCount: 6e5,
      hashAlgorithm: "SHA-256",
      contentToStamp: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer
    });
    assert.strictEqual(Convert.ToBase64(encData), "4iwFEULKTVUoMs1fF6EQ9q+vhr+DFeT10IRnVVSqKdg=");
  });
});
