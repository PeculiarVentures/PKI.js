import * as assert from "assert";
import * as asn1js from "asn1js";
import * as pvtsutils from "pvtsutils";
import { Crypto } from "@peculiar/webcrypto";
import * as pkijs from "../src";
import { createSelfSignedCertificate } from "./utils";

// Install a crypto engine for this test file (matches test/utils.ts pattern)
const webcrypto = new Crypto();
pkijs.setEngine(
  "gcm-params-test",
  new pkijs.CryptoEngine({ name: "gcm-params-test", crypto: webcrypto }),
);

// asn1js block-tag numbers used by the structure assertions below.
const SEQUENCE_TAG = 16;

context("GCMParams (RFC 5084 §3.2)", () => {
  //#region Tier 1: schema round-trip
  context("schema round-trip", () => {
    it("encodes nonce + icvLen 16, parses back with identical values", () => {
      const nonceBytes = new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x00, 0x11, 0x22, 0x33, 0x44, 0x55]);
      const original = new pkijs.GCMParams({ nonce: nonceBytes.buffer, icvLen: 16 });

      const der = original.toSchema().toBER(false);
      const parsed = new pkijs.GCMParams({ schema: asn1js.fromBER(der).result });

      assert.strictEqual(pvtsutils.Convert.ToHex(parsed.nonce), pvtsutils.Convert.ToHex(nonceBytes.buffer));
      assert.strictEqual(parsed.icvLen, 16);
    });

    it("omits icvLen from DER when value equals the RFC 5084 default (12)", () => {
      const nonce = new Uint8Array(12).buffer;
      const seq = new pkijs.GCMParams({ nonce, icvLen: 12 }).toSchema();
      // SEQUENCE should contain only the OCTET STRING; the INTEGER for icvLen
      // must be absent because 12 is the ASN.1 DEFAULT value.
      assert.strictEqual(seq.valueBlock.value.length, 1);
    });

    it("round-trips with icvLen absent (parses as undefined)", () => {
      const nonce = new Uint8Array(12).buffer;
      const der = new pkijs.GCMParams({ nonce }).toSchema().toBER(false);
      const parsed = new pkijs.GCMParams({ schema: asn1js.fromBER(der).result });

      assert.strictEqual(pvtsutils.Convert.ToHex(parsed.nonce), pvtsutils.Convert.ToHex(nonce));
      assert.strictEqual(parsed.icvLen, undefined);
    });
  });
  //#endregion

  //#region Tier 2: PBES2 + AES-GCM via CryptoEngine (closes #486)
  context("PBES2 encrypt/decrypt with AES-GCM (closes #486)", () => {
    const password = new TextEncoder().encode("test-password").buffer;
    const contentType = "1.2.840.113549.1.7.1"; // id-data

    async function encryptSample(plaintext: ArrayBuffer) {
      const crypto = pkijs.getCrypto(true);
      return crypto.encryptEncryptedContentInfo({
        password,
        // `ContentEncryptionAesGcmParams` requires `iv`, but the encrypt method
        // generates its own nonce and ignores the one on the input. Cast to
        // `any` to satisfy the type without supplying a throwaway IV.
        contentEncryptionAlgorithm: { name: "AES-GCM", length: 256 } as any,
        hmacHashAlgorithm: "SHA-256",
        iterationCount: 1000,
        contentType,
        contentToEncrypt: plaintext,
      });
    }

    it("emits inner AES-GCM AlgorithmIdentifier.algorithmParams as a SEQUENCE", async () => {
      const plaintext = new TextEncoder().encode("hello gcm").buffer;
      const eci = await encryptSample(plaintext);

      // The outer AlgorithmIdentifier is pkcs5PBES2; unwrap to reach the inner cipher AI.
      const pbes2 = new pkijs.PBES2Params({ schema: eci.contentEncryptionAlgorithm.algorithmParams });
      const innerParams = pbes2.encryptionScheme.algorithmParams;

      // Before the fix: innerParams was a bare OCTET STRING (tag 4).
      // After the fix: innerParams must be a SEQUENCE (tag 16) matching GCMParameters.
      assert.strictEqual(
        innerParams.idBlock.tagNumber,
        SEQUENCE_TAG,
        "AES-GCM AlgorithmIdentifier.parameters must be a GCMParameters SEQUENCE per RFC 5084 §3.2",
      );

      const gcmParams = new pkijs.GCMParams({ schema: innerParams });
      assert.strictEqual(gcmParams.nonce.byteLength, 12, "AES-GCM nonce should be 12 bytes (NIST SP 800-38D §8.2.1)");
      assert.strictEqual(gcmParams.icvLen, 16, "ICV length must reflect WebCrypto's 128-bit default tag");
    });

    it("decrypt recovers the original plaintext (new-format round-trip)", async () => {
      const plaintext = new TextEncoder().encode("hello gcm round-trip").buffer;
      const eci = await encryptSample(plaintext);

      const crypto = pkijs.getCrypto(true);
      const decrypted = await crypto.decryptEncryptedContentInfo({
        password,
        encryptedContentInfo: eci,
      });
      assert.strictEqual(pvtsutils.Convert.ToHex(decrypted), pvtsutils.Convert.ToHex(plaintext));
    });

    it("legacy fallback: decrypts a blob whose params are a bare OCTET STRING", async () => {
      const plaintext = new TextEncoder().encode("legacy gcm output").buffer;
      const eci = await encryptSample(plaintext);

      // Simulate pre-fix pkijs output by rewriting the inner algorithmParams from
      // GCMParameters SEQUENCE back to a bare OCTET STRING carrying the same nonce.
      // The ciphertext stays valid because it was encrypted with that exact nonce.
      const pbes2 = new pkijs.PBES2Params({ schema: eci.contentEncryptionAlgorithm.algorithmParams });
      const gcm = new pkijs.GCMParams({ schema: pbes2.encryptionScheme.algorithmParams });
      pbes2.encryptionScheme.algorithmParams = new asn1js.OctetString({ valueHex: gcm.nonce });
      eci.contentEncryptionAlgorithm.algorithmParams = pbes2.toSchema();

      const crypto = pkijs.getCrypto(true);
      const decrypted = await crypto.decryptEncryptedContentInfo({
        password,
        encryptedContentInfo: eci,
      });
      assert.strictEqual(pvtsutils.Convert.ToHex(decrypted), pvtsutils.Convert.ToHex(plaintext));
    });

    it("legacy fallback: decrypts an authentic pre-fix blob with 16-byte nonce", async () => {
      // Pre-fix pkijs always generated a 16-byte IV (new ArrayBuffer(16) in
      // encryptEncryptedContentInfo) regardless of cipher. This test reconstructs
      // an exact pre-fix shape: 16-byte nonce inside a bare OCTET STRING, with
      // matching ciphertext produced by WebCrypto using that same 16-byte IV.
      const plaintext = new TextEncoder().encode("authentic pre-fix gcm blob").buffer;

      const salt = new Uint8Array(64);
      webcrypto.getRandomValues(salt);
      const nonce16 = new Uint8Array(16);
      webcrypto.getRandomValues(nonce16);
      const iterationCount = 1000;

      const pbkdfKey = await webcrypto.subtle.importKey(
        "raw", new Uint8Array(password), "PBKDF2", false, ["deriveKey"],
      );
      const aesKey = await webcrypto.subtle.deriveKey(
        { name: "PBKDF2", hash: "SHA-256", salt, iterations: iterationCount },
        pbkdfKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"],
      );
      const ciphertext = await webcrypto.subtle.encrypt(
        { name: "AES-GCM", iv: nonce16 },
        aesKey,
        new Uint8Array(plaintext),
      );

      // Build the PBES2Params manually with the legacy shape: bare OCTET STRING
      // in encryptionScheme.algorithmParams instead of a GCMParameters SEQUENCE.
      const pbes2 = new pkijs.PBES2Params({
        keyDerivationFunc: new pkijs.AlgorithmIdentifier({
          algorithmId: "1.2.840.113549.1.5.12", // id-PBKDF2
          algorithmParams: new pkijs.PBKDF2Params({
            salt: new asn1js.OctetString({ valueHex: salt.buffer }),
            iterationCount,
            prf: new pkijs.AlgorithmIdentifier({
              algorithmId: "1.2.840.113549.2.9", // hmacWithSHA256
              algorithmParams: new asn1js.Null(),
            }),
          }).toSchema(),
        }),
        encryptionScheme: new pkijs.AlgorithmIdentifier({
          algorithmId: "2.16.840.1.101.3.4.1.46", // aes256-GCM
          algorithmParams: new asn1js.OctetString({ valueHex: nonce16.buffer }),
        }),
      });

      const eci = new pkijs.EncryptedContentInfo({
        contentType,
        contentEncryptionAlgorithm: new pkijs.AlgorithmIdentifier({
          algorithmId: "1.2.840.113549.1.5.13", // pkcs5PBES2
          algorithmParams: pbes2.toSchema(),
        }),
        encryptedContent: new asn1js.OctetString({ valueHex: ciphertext }),
      });

      const crypto = pkijs.getCrypto(true);
      const decrypted = await crypto.decryptEncryptedContentInfo({
        password,
        encryptedContentInfo: eci,
      });
      assert.strictEqual(pvtsutils.Convert.ToHex(decrypted), pvtsutils.Convert.ToHex(plaintext));
    });
  });
  //#endregion

  //#region Tier 3: CMS EnvelopedData with AES-GCM (closes #287)
  context("EnvelopedData AES-GCM emission (closes #287)", () => {
    it("emits the inner AES-GCM AlgorithmIdentifier.algorithmParams as a SEQUENCE", async () => {
      const plaintext = new TextEncoder().encode("hello enveloped").buffer;

      // EnvelopedData.encrypt builds encryptedContentInfo regardless of whether
      // any recipient infos are attached, so no recipient setup is needed to
      // exercise the AlgorithmIdentifier emission path.
      const enveloped = new pkijs.EnvelopedData({ version: 0 });
      await enveloped.encrypt({ name: "AES-GCM", length: 256 } as AesKeyGenParams, plaintext);

      const innerParams = enveloped.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams;
      assert.strictEqual(
        innerParams.idBlock.tagNumber,
        SEQUENCE_TAG,
        "CMS AES-GCM AlgorithmIdentifier.parameters must be a GCMParameters SEQUENCE per RFC 5084 §3.2",
      );

      const gcmParams = new pkijs.GCMParams({ schema: innerParams });
      assert.strictEqual(gcmParams.nonce.byteLength, 12);
      assert.strictEqual(gcmParams.icvLen, 16);
    });

    it("full round-trip via RSA-OAEP cert recipient: encrypt → BER → parse → decrypt", async () => {
      // End-to-end proof that EnvelopedData's decrypt path correctly handles
      // the new GCMParameters SEQUENCE — mirrors the CryptoEngine new-format
      // round-trip but exercises the separate EnvelopedData decrypt code path.
      const plaintext = new TextEncoder().encode("cms enveloped round-trip payload").buffer;
      const certData = await createSelfSignedCertificate("SHA-256", "RSASSA-PKCS1-v1_5");

      const enveloped = new pkijs.EnvelopedData({ version: 0 });
      enveloped.addRecipientByCertificate(certData.certificate, { oaepHashAlgorithm: "SHA-256" });
      await enveloped.encrypt({ name: "AES-GCM", length: 256 } as AesKeyGenParams, plaintext);

      // Serialize and re-parse so the decrypt path runs against bytes, not a
      // live object graph — this is how real consumers hit the decrypt code.
      const raw = enveloped.toSchema().toBER(false);
      const parsed = pkijs.EnvelopedData.fromBER(raw);

      // Sanity check: the parsed structure still carries a GCMParameters SEQUENCE.
      const innerParams = parsed.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams;
      assert.strictEqual(innerParams.idBlock.tagNumber, SEQUENCE_TAG);

      // Re-import the PKCS#8 private key as RSA-OAEP for recipient decryption.
      const recipientKey = await webcrypto.subtle.importKey(
        "pkcs8",
        certData.pkcs8,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["decrypt"],
      );
      const decrypted = await parsed.decrypt(0, { recipientPrivateKey: recipientKey });
      assert.strictEqual(pvtsutils.Convert.ToHex(decrypted), pvtsutils.Convert.ToHex(plaintext));
    });
  });
  //#endregion
});
