import * as assert from "assert";
import * as crypto from "crypto";
import "./utils";
import * as example from "./pkcs12SimpleExample";
import { CryptoEngine } from "../src";
import { Convert } from "pvtsutils";

context("PKCS#12 Simple Example", () => {
  const password = "12345567890";

  it("Password-based Integrity, SHA-1", async () => {
    await example.passwordBasedIntegrity(password, "SHA-1");
  });

  it("Password-based Integrity, SHA-256", async () => {
    await example.passwordBasedIntegrity(password, "SHA-256");
  });

  it("Password-based Integrity, SHA-384", async () => {
    await example.passwordBasedIntegrity(password, "SHA-384");
  });

  it("Password-based Integrity, SHA-512", async () => {
    await example.passwordBasedIntegrity(password, "SHA-512");
  });

  it("Password-based Integrity, incorrect algorithm", async () => {
    assert.rejects(async () => {
      await example.passwordBasedIntegrity(password, "SHA-5122");
    });
  });

  it("Certificate-based Integrity", async () => {
    await example.certificateBasedIntegrity();
  });

  it("No-Privacy Test", async () => {
    await example.noPrivacy(password);
  });

  it("Password Privacy", async () => {
    await example.passwordPrivacy(password);
  });

  it("Certificate Privacy", async () => {
    await example.certificatePrivacy(password);
  });

  context("Making OpenSSL-like PKCS#12 Data", () => {
    it("ASCII", async () => {
      const pfx = await example.openSSLLike(password);
      await example.parsePKCS12(pfx, password);
    });

    it("UTF-8", async () => {
      const password = "пароль";
      const pfx = await example.openSSLLike(password);
      await example.parsePKCS12(pfx, password);
    });

    it("Binary", async () => {
      const password = "\x04\xff\x20\x21"; // decode/encode -> [ 4, 239, 191, 189, 32, 33 ]
      const pfx = await example.openSSLLike(password);
      await example.parsePKCS12(pfx, password);
    });
  });

  it("Speed test for stampDataWithPassword", async () => {
    const engine = new CryptoEngine({ name: "node", crypto: crypto.webcrypto as globalThis.Crypto });
    const encData = await engine.stampDataWithPassword({
      password: Convert.FromUtf8String(password),
      salt: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
      iterationCount: 6e5,
      hashAlgorithm: "SHA-256",
      contentToStamp: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
    });
    assert.strictEqual(Convert.ToBase64(encData), "4iwFEULKTVUoMs1fF6EQ9q+vhr+DFeT10IRnVVSqKdg=");
  });
});
