import * as assert from "assert";
import "./utils";
import * as example from "./pkcs12SimpleExample";

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

  it("Making OpenSSL-like PKCS#12 Data", async () => {
    const pfx = await example.openSSLLike(password);
    await example.parsePKCS12(pfx, password);
  });
});
