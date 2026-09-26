import { describe, it, assert, expect } from "vitest";
import * as asn1js from "asn1js";
import * as pvtsutils from "pvtsutils";
import { Crypto } from "@peculiar/webcrypto";
import * as pkijs from "../src/index";
import { createSelfSignedCertificate } from "./utils";

// Several tests reach past pkijs to seal or malform a fixture WebCrypto-side.
// The engine under test is the one test/vitest.setup.ts installs.
const webcrypto = new Crypto();

describe("GCMParams (RFC 5084 §3.2)", () => {
  //#region Schema round-trip
  describe("schema round-trip", () => {
    it("encodes nonce + icvLen 16, parses back with identical values", () => {
      const nonceBytes = new Uint8Array([
        0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x00, 0x11, 0x22, 0x33, 0x44, 0x55
      ]);
      const original = new pkijs.GCMParams({ nonce: nonceBytes.buffer, icvLen: 16 });

      const der = original.toSchema().toBER(false);
      const parsed = new pkijs.GCMParams({ schema: asn1js.fromBER(der).result });

      assert.strictEqual(
        pvtsutils.Convert.ToHex(parsed.nonce),
        pvtsutils.Convert.ToHex(nonceBytes.buffer)
      );
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

    it("defaults the nonce to an empty buffer when constructed with no parameters", () => {
      const params = new pkijs.GCMParams();

      assert.strictEqual(params.nonce.byteLength, 0);
      assert.strictEqual(params.icvLen, undefined);
    });

    it("names every schema element when told to, and leaves them empty when not", () => {
      const named = pkijs.GCMParams.schema({
        names: { blockName: "gcm", nonce: "gcm-nonce", icvLen: "gcm-icvLen" }
      }) as asn1js.Sequence;

      assert.strictEqual(named.name, "gcm");
      assert.strictEqual(named.valueBlock.value[0].name, "gcm-nonce");
      assert.strictEqual(named.valueBlock.value[1].name, "gcm-icvLen");

      const unnamed = pkijs.GCMParams.schema() as asn1js.Sequence;

      assert.strictEqual(unnamed.name, "");
      assert.strictEqual(unnamed.valueBlock.value[0].name, "");
      assert.strictEqual(unnamed.valueBlock.value[1].name, "");
    });

    it("rejects an unknown member name in defaultValues", () => {
      assert.throws(() => (pkijs.GCMParams as any).defaultValues("bogus"));
    });

    it("encodes to the DER an RFC 5084 reader expects", () => {
      // Pinned so a change to the encoder has to be deliberate: an encoder and a
      // decoder that drift together stay self-consistent and still fail interop.
      const nonce = pvtsutils.Convert.FromHex("aabbccddeeff001122334455");

      assert.strictEqual(
        pvtsutils.Convert.ToHex(new pkijs.GCMParams({ nonce, icvLen: 16 }).toSchema().toBER(false)),
        "3011040caabbccddeeff001122334455020110"
      );
      assert.strictEqual(
        pvtsutils.Convert.ToHex(new pkijs.GCMParams({ nonce, icvLen: 12 }).toSchema().toBER(false)),
        "300e040caabbccddeeff001122334455"
      );
    });

    it("refuses an aes-ICVlen outside the RFC 5084 set, on parse and on emit", () => {
      const nonce = pvtsutils.Convert.FromHex("aabbccddeeff001122334455");

      for (const icvLen of [4, 8, 11, 17]) {
        assert.throws(
          () => new pkijs.GCMParams({ nonce, icvLen }).toSchema(),
          /aes-ICVlen/,
          `emit should refuse icvLen ${icvLen}`
        );

        // Same value arriving off the wire, where it would otherwise reach
        // WebCrypto as a tag length.
        const der = new asn1js.Sequence({
          value: [
            new asn1js.OctetString({ valueHex: nonce }),
            new asn1js.Integer({ value: icvLen })
          ]
        }).toBER(false);

        assert.throws(
          () => new pkijs.GCMParams({ schema: asn1js.fromBER(der).result }),
          /aes-ICVlen/,
          `parse should refuse icvLen ${icvLen}`
        );
      }
    });

    it("accepts every aes-ICVlen the RFC permits", () => {
      const nonce = pvtsutils.Convert.FromHex("aabbccddeeff001122334455");

      for (const icvLen of [12, 13, 14, 15, 16]) {
        const der = new pkijs.GCMParams({ nonce, icvLen }).toSchema().toBER(false);
        const parsed = new pkijs.GCMParams({ schema: asn1js.fromBER(der).result });

        // 12 is the DEFAULT, so it is absent from the DER and parses as undefined.
        assert.strictEqual(parsed.icvLen, icvLen === 12 ? undefined : icvLen);
      }
    });

    it("refuses an AES-GCM AlgorithmIdentifier that carries no parameters", () => {
      // RFC 5084 Section 3.2 requires the parameters field to be present and to
      // hold a GCMParameters, so an absent one cannot be read as an empty nonce.
      assert.throws(() => pkijs.GCMParams.fromAlgorithmParams(undefined), /GCMParameters/);
    });

    it("refuses a zero-length aes-nonce", () => {
      const der = new asn1js.Sequence({
        value: [new asn1js.OctetString({ valueHex: new ArrayBuffer(0) })]
      }).toBER(false);

      assert.throws(() => new pkijs.GCMParams({ schema: asn1js.fromBER(der).result }), /aes-nonce/);
    });

    it("clears a previously set icvLen when re-parsing input that omits it", () => {
      const nonce = pvtsutils.Convert.FromHex("aabbccddeeff001122334455");
      const params = new pkijs.GCMParams({ nonce, icvLen: 16 });

      const der = new pkijs.GCMParams({ nonce }).toSchema().toBER(false);
      params.fromSchema(asn1js.fromBER(der).result);

      // Re-emitting must not resurrect the icvLen the new input never carried.
      assert.strictEqual(params.icvLen, undefined);
      assert.strictEqual(
        pvtsutils.Convert.ToHex(params.toSchema().toBER(false)),
        "300e040caabbccddeeff001122334455"
      );
    });

    it("toJSON carries the nonce and omits icvLen at the RFC 5084 default", () => {
      const nonce = new Uint8Array([
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c
      ]).buffer;

      const tagged = new pkijs.GCMParams({ nonce, icvLen: 16 }).toJSON();
      assert.strictEqual(tagged.nonce.toLowerCase(), pvtsutils.Convert.ToHex(nonce));
      assert.strictEqual(tagged.icvLen, 16);

      const defaulted = new pkijs.GCMParams({ nonce, icvLen: 12 }).toJSON();
      assert.strictEqual(defaulted.icvLen, undefined);
    });
  });
  //#endregion

  //#region PBES2 with AES-GCM
  describe("PBES2 encrypt/decrypt with AES-GCM (issue #486)", () => {
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
        contentToEncrypt: plaintext
      });
    }

    it("emits inner AES-GCM AlgorithmIdentifier.algorithmParams as a SEQUENCE", async () => {
      const plaintext = new TextEncoder().encode("hello gcm").buffer;
      const eci = await encryptSample(plaintext);

      // The outer AlgorithmIdentifier is pkcs5PBES2; unwrap to reach the inner cipher AI.
      const pbes2 = new pkijs.PBES2Params({
        schema: eci.contentEncryptionAlgorithm.algorithmParams
      });
      const innerParams = pbes2.encryptionScheme.algorithmParams;

      // Before the fix these parameters were a bare OCTET STRING carrying the IV.
      assert.ok(
        innerParams instanceof asn1js.Sequence,
        "AES-GCM AlgorithmIdentifier.parameters must be a GCMParameters SEQUENCE per RFC 5084 §3.2"
      );

      const gcmParams = new pkijs.GCMParams({ schema: innerParams });
      assert.strictEqual(
        gcmParams.nonce.byteLength,
        12,
        "AES-GCM nonce should be 12 bytes (RFC 5084)"
      );
      assert.strictEqual(
        gcmParams.icvLen,
        16,
        "ICV length must reflect WebCrypto's 128-bit default tag"
      );
    });

    it("normalizes a lower-case algorithm name and still emits a SEQUENCE", async () => {
      // `getOIDByAlgorithm` upper-cases before matching, so "aes-gcm" resolves to
      // the AES-GCM OID. The parameter encoding has to follow the same
      // normalization, or a case variant silently falls back to a bare OCTET STRING.
      const plaintext = new TextEncoder().encode("lower-case gcm").buffer;
      const crypto = pkijs.getCrypto(true);
      const eci = await crypto.encryptEncryptedContentInfo({
        password,
        contentEncryptionAlgorithm: { name: "aes-gcm", length: 256 } as any,
        hmacHashAlgorithm: "SHA-256",
        iterationCount: 1000,
        contentType,
        contentToEncrypt: plaintext
      });

      const pbes2 = new pkijs.PBES2Params({
        schema: eci.contentEncryptionAlgorithm.algorithmParams
      });
      assert.ok(pbes2.encryptionScheme.algorithmParams instanceof asn1js.Sequence);
      assert.strictEqual(
        new pkijs.GCMParams({ schema: pbes2.encryptionScheme.algorithmParams }).nonce.byteLength,
        12
      );
    });

    it("decrypt recovers the original plaintext (new-format round-trip)", async () => {
      const plaintext = new TextEncoder().encode("hello gcm round-trip").buffer;
      const eci = await encryptSample(plaintext);

      const crypto = pkijs.getCrypto(true);
      const decrypted = await crypto.decryptEncryptedContentInfo({
        password,
        encryptedContentInfo: eci
      });
      assert.strictEqual(pvtsutils.Convert.ToHex(decrypted), pvtsutils.Convert.ToHex(plaintext));
    });

    it("legacy fallback: decrypts a blob whose params are a bare OCTET STRING", async () => {
      const plaintext = new TextEncoder().encode("legacy gcm output").buffer;
      const eci = await encryptSample(plaintext);

      // Simulate pre-fix pkijs output by rewriting the inner algorithmParams from
      // GCMParameters SEQUENCE back to a bare OCTET STRING carrying the same nonce.
      // The ciphertext stays valid because it was encrypted with that exact nonce.
      const pbes2 = new pkijs.PBES2Params({
        schema: eci.contentEncryptionAlgorithm.algorithmParams
      });
      const gcm = new pkijs.GCMParams({ schema: pbes2.encryptionScheme.algorithmParams });
      pbes2.encryptionScheme.algorithmParams = new asn1js.OctetString({ valueHex: gcm.nonce });
      eci.contentEncryptionAlgorithm.algorithmParams = pbes2.toSchema();

      const crypto = pkijs.getCrypto(true);
      const decrypted = await crypto.decryptEncryptedContentInfo({
        password,
        encryptedContentInfo: eci
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
        "raw",
        new Uint8Array(password),
        "PBKDF2",
        false,
        ["deriveKey"]
      );
      const aesKey = await webcrypto.subtle.deriveKey(
        { name: "PBKDF2", hash: "SHA-256", salt, iterations: iterationCount },
        pbkdfKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
      );
      const ciphertext = await webcrypto.subtle.encrypt(
        { name: "AES-GCM", iv: nonce16 },
        aesKey,
        new Uint8Array(plaintext)
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
              algorithmParams: new asn1js.Null()
            })
          }).toSchema()
        }),
        encryptionScheme: new pkijs.AlgorithmIdentifier({
          algorithmId: "2.16.840.1.101.3.4.1.46", // aes256-GCM
          algorithmParams: new asn1js.OctetString({ valueHex: nonce16.buffer })
        })
      });

      const eci = new pkijs.EncryptedContentInfo({
        contentType,
        contentEncryptionAlgorithm: new pkijs.AlgorithmIdentifier({
          algorithmId: "1.2.840.113549.1.5.13", // pkcs5PBES2
          algorithmParams: pbes2.toSchema()
        }),
        encryptedContent: new asn1js.OctetString({ valueHex: ciphertext })
      });

      const crypto = pkijs.getCrypto(true);
      const decrypted = await crypto.decryptEncryptedContentInfo({
        password,
        encryptedContentInfo: eci
      });
      assert.strictEqual(pvtsutils.Convert.ToHex(decrypted), pvtsutils.Convert.ToHex(plaintext));
    });

    it("surfaces a malformed GCMParameters instead of reading it as a raw IV", async () => {
      // A SEQUENCE that is not GCMParameters must not be mistaken for the legacy
      // bare-OCTET-STRING shape: a constructed block carries no valueHex, so
      // treating it as one yields a zero-length IV and an unrelated error.
      const plaintext = new TextEncoder().encode("malformed params").buffer;
      const eci = await encryptSample(plaintext);

      const pbes2 = new pkijs.PBES2Params({
        schema: eci.contentEncryptionAlgorithm.algorithmParams
      });
      pbes2.encryptionScheme.algorithmParams = new asn1js.Sequence({
        value: [new asn1js.Integer({ value: 12 })]
      });
      eci.contentEncryptionAlgorithm.algorithmParams = pbes2.toSchema();

      const crypto = pkijs.getCrypto(true);
      await expect(
        crypto.decryptEncryptedContentInfo({ password, encryptedContentInfo: eci })
      ).rejects.toThrow(/schema/i);
    });

    it("rejects a tampered ciphertext", async () => {
      const plaintext = new TextEncoder().encode("integrity still enforced").buffer;
      const eci = await encryptSample(plaintext);

      const sealed = new Uint8Array(eci.getEncryptedContent().slice(0));
      sealed[0] ^= 0xff;
      eci.encryptedContent = new asn1js.OctetString({ valueHex: sealed.buffer });

      const crypto = pkijs.getCrypto(true);
      await expect(
        crypto.decryptEncryptedContentInfo({ password, encryptedContentInfo: eci })
      ).rejects.toThrow(Error);
    });

    it("rejects a substituted nonce", async () => {
      const plaintext = new TextEncoder().encode("nonce is authenticated too").buffer;
      const eci = await encryptSample(plaintext);

      const pbes2 = new pkijs.PBES2Params({
        schema: eci.contentEncryptionAlgorithm.algorithmParams
      });
      const other = new Uint8Array(12);
      webcrypto.getRandomValues(other);
      pbes2.encryptionScheme.algorithmParams = new pkijs.GCMParams({
        nonce: other.buffer,
        icvLen: 16
      }).toSchema();
      eci.contentEncryptionAlgorithm.algorithmParams = pbes2.toSchema();

      const crypto = pkijs.getCrypto(true);
      await expect(
        crypto.decryptEncryptedContentInfo({ password, encryptedContentInfo: eci })
      ).rejects.toThrow(Error);
    });

    it("honors the RFC 5084 icvLen default of 12 when the INTEGER is absent", async () => {
      // DER omits a DEFAULT, so GCMParameters carrying only a nonce means a
      // 12-octet ICV. WebCrypto's own default is 16, and reading it that way
      // would put the tag boundary four octets late.
      const plaintext = new TextEncoder().encode("default icv length").buffer;

      const salt = new Uint8Array(64);
      webcrypto.getRandomValues(salt);
      const nonce = new Uint8Array(12);
      webcrypto.getRandomValues(nonce);
      const iterationCount = 1000;

      const pbkdfKey = await webcrypto.subtle.importKey(
        "raw",
        new Uint8Array(password),
        "PBKDF2",
        false,
        ["deriveKey"]
      );
      const aesKey = await webcrypto.subtle.deriveKey(
        { name: "PBKDF2", hash: "SHA-256", salt, iterations: iterationCount },
        pbkdfKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
      );
      const ciphertext = await webcrypto.subtle.encrypt(
        { name: "AES-GCM", iv: nonce, tagLength: 96 },
        aesKey,
        new Uint8Array(plaintext)
      );

      const pbes2 = new pkijs.PBES2Params({
        keyDerivationFunc: new pkijs.AlgorithmIdentifier({
          algorithmId: "1.2.840.113549.1.5.12", // id-PBKDF2
          algorithmParams: new pkijs.PBKDF2Params({
            salt: new asn1js.OctetString({ valueHex: salt.buffer }),
            iterationCount,
            prf: new pkijs.AlgorithmIdentifier({
              algorithmId: "1.2.840.113549.2.9", // hmacWithSHA256
              algorithmParams: new asn1js.Null()
            })
          }).toSchema()
        }),
        encryptionScheme: new pkijs.AlgorithmIdentifier({
          algorithmId: "2.16.840.1.101.3.4.1.46", // aes256-GCM
          algorithmParams: new pkijs.GCMParams({ nonce: nonce.buffer }).toSchema()
        })
      });

      const eci = new pkijs.EncryptedContentInfo({
        contentType,
        contentEncryptionAlgorithm: new pkijs.AlgorithmIdentifier({
          algorithmId: "1.2.840.113549.1.5.13", // pkcs5PBES2
          algorithmParams: pbes2.toSchema()
        }),
        encryptedContent: new asn1js.OctetString({ valueHex: ciphertext })
      });

      const crypto = pkijs.getCrypto(true);
      const decrypted = await crypto.decryptEncryptedContentInfo({
        password,
        encryptedContentInfo: eci
      });
      assert.strictEqual(pvtsutils.Convert.ToHex(decrypted), pvtsutils.Convert.ToHex(plaintext));
    });

    it("round-trips a private key through the PKCS#12 privacy layer", async () => {
      // PKCS8ShroudedKeyBag protects its key through EncryptedData, so this is the
      // AlgorithmIdentifier a PFX carries.
      const keyPair = await webcrypto.subtle.generateKey(
        {
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: "SHA-256"
        },
        true,
        ["sign", "verify"]
      );
      const pkcs8 = await webcrypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      const encrypted = new pkijs.EncryptedData();
      await encrypted.encrypt({
        contentEncryptionAlgorithm: { name: "AES-GCM", length: 256 } as any,
        hmacHashAlgorithm: "SHA-256",
        iterationCount: 1000,
        password,
        contentToEncrypt: pkcs8
      });

      const pbes2 = new pkijs.PBES2Params({
        schema: encrypted.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams
      });
      assert.ok(pbes2.encryptionScheme.algorithmParams instanceof asn1js.Sequence);

      const reparsed = pkijs.EncryptedData.fromBER(encrypted.toSchema().toBER(false));
      const recovered = await reparsed.decrypt({ password });

      assert.strictEqual(pvtsutils.Convert.ToHex(recovered), pvtsutils.Convert.ToHex(pkcs8));
      // And the recovered octets are still a well-formed PKCS#8 key.
      assert.ok(pkijs.PrivateKeyInfo.fromBER(recovered).privateKeyAlgorithm.algorithmId.length > 0);
    });
  });
  //#endregion

  //#region CMS EnvelopedData with AES-GCM
  describe("EnvelopedData AES-GCM emission (issue #287)", () => {
    it("emits the inner AES-GCM AlgorithmIdentifier.algorithmParams as a SEQUENCE", async () => {
      const plaintext = new TextEncoder().encode("hello enveloped").buffer;

      // EnvelopedData.encrypt builds encryptedContentInfo regardless of whether
      // any recipient infos are attached, so no recipient setup is needed to
      // exercise the AlgorithmIdentifier emission path.
      const enveloped = new pkijs.EnvelopedData({ version: 0 });
      await enveloped.encrypt({ name: "AES-GCM", length: 256 } as AesKeyGenParams, plaintext);

      const innerParams = enveloped.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams;
      assert.ok(
        innerParams instanceof asn1js.Sequence,
        "CMS AES-GCM AlgorithmIdentifier.parameters must be a GCMParameters SEQUENCE per RFC 5084 §3.2"
      );

      const gcmParams = new pkijs.GCMParams({ schema: innerParams });
      assert.strictEqual(gcmParams.nonce.byteLength, 12);
      assert.strictEqual(gcmParams.icvLen, 16);
    });

    it("normalizes a lower-case algorithm name and still emits a SEQUENCE", async () => {
      const plaintext = new TextEncoder().encode("lower-case enveloped").buffer;

      const enveloped = new pkijs.EnvelopedData({ version: 0 });
      await enveloped.encrypt({ name: "aes-gcm", length: 256 } as AesKeyGenParams, plaintext);

      const innerParams = enveloped.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams;
      assert.ok(innerParams instanceof asn1js.Sequence);
      assert.strictEqual(new pkijs.GCMParams({ schema: innerParams }).nonce.byteLength, 12);
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
      assert.ok(innerParams instanceof asn1js.Sequence);

      // Re-import the PKCS#8 private key as RSA-OAEP for recipient decryption.
      const recipientKey = await webcrypto.subtle.importKey(
        "pkcs8",
        certData.pkcs8,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["decrypt"]
      );
      const decrypted = await parsed.decrypt(0, { recipientPrivateKey: recipientKey });
      assert.strictEqual(pvtsutils.Convert.ToHex(decrypted), pvtsutils.Convert.ToHex(plaintext));
    });

    it("legacy fallback: decrypts a blob whose params are a bare OCTET STRING", async () => {
      const plaintext = new TextEncoder().encode("legacy enveloped output").buffer;
      const certData = await createSelfSignedCertificate("SHA-256", "RSASSA-PKCS1-v1_5");

      const enveloped = new pkijs.EnvelopedData({ version: 0 });
      enveloped.addRecipientByCertificate(certData.certificate, { oaepHashAlgorithm: "SHA-256" });
      await enveloped.encrypt({ name: "AES-GCM", length: 256 } as AesKeyGenParams, plaintext);

      // Rewrite the parameters to the pre-fix shape: a bare OCTET STRING holding
      // the same nonce. The ciphertext stays valid because the fallback leaves
      // WebCrypto on the 128-bit tag that produced it.
      const gcm = new pkijs.GCMParams({
        schema: enveloped.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams
      });
      enveloped.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams =
        new asn1js.OctetString({ valueHex: gcm.nonce });

      const recipientKey = await webcrypto.subtle.importKey(
        "pkcs8",
        certData.pkcs8,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["decrypt"]
      );
      const decrypted = await enveloped.decrypt(0, { recipientPrivateKey: recipientKey });
      assert.strictEqual(pvtsutils.Convert.ToHex(decrypted), pvtsutils.Convert.ToHex(plaintext));
    });

    it("honors the RFC 5084 icvLen default of 12 when the INTEGER is absent", async () => {
      // The content was sealed under WebCrypto's 16-octet ICV. Dropping the
      // explicit icvLen leaves the DEFAULT of 12, which moves the tag boundary,
      // so the open must fail rather than hand back four octets of tag as data.
      const plaintext = new TextEncoder().encode("icv default enveloped").buffer;
      const certData = await createSelfSignedCertificate("SHA-256", "RSASSA-PKCS1-v1_5");

      const enveloped = new pkijs.EnvelopedData({ version: 0 });
      enveloped.addRecipientByCertificate(certData.certificate, { oaepHashAlgorithm: "SHA-256" });
      await enveloped.encrypt({ name: "AES-GCM", length: 256 } as AesKeyGenParams, plaintext);

      const gcm = new pkijs.GCMParams({
        schema: enveloped.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams
      });
      const recipientKey = await webcrypto.subtle.importKey(
        "pkcs8",
        certData.pkcs8,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["decrypt"]
      );

      // Open it once untouched, so the rejection below cannot be blamed on the
      // recipient, the nonce or the ciphertext.
      const control = await enveloped.decrypt(0, { recipientPrivateKey: recipientKey });
      assert.strictEqual(pvtsutils.Convert.ToHex(control), pvtsutils.Convert.ToHex(plaintext));

      enveloped.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams =
        new pkijs.GCMParams({ nonce: gcm.nonce }).toSchema();

      await expect(enveloped.decrypt(0, { recipientPrivateKey: recipientKey })).rejects.toThrow(
        Error
      );
    });
  });
  //#endregion
});
