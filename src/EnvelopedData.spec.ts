import { describe, it, expect, assert } from "vitest";
import * as asn1js from "asn1js";
import * as pkijs from "./index";
import * as utils from "../test/utils";

/**
 * RSA-OAEP with SHA-512 cannot wrap a session key into a 1024-bit modulus
 * (k - 2*hLen - 2 is negative), so WebCrypto encrypt throws.
 */
async function create1024BitRsaCertificate(): Promise<pkijs.Certificate> {
  const crypto = pkijs.getCrypto(true);
  const keys = (await crypto.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 1024,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: { name: "SHA-256" },
    } as RsaHashedKeyGenParams,
    true,
    ["sign", "verify"],
  )) as CryptoKeyPair;

  const certificate = new pkijs.Certificate();
  certificate.version = 2;
  certificate.serialNumber = new asn1js.Integer({ value: 1 });
  certificate.issuer.typesAndValues.push(
    new pkijs.AttributeTypeAndValue({
      type: "2.5.4.3",
      value: new asn1js.Utf8String({ value: "Test" }),
    }),
  );
  certificate.subject.typesAndValues.push(
    new pkijs.AttributeTypeAndValue({
      type: "2.5.4.3",
      value: new asn1js.Utf8String({ value: "Test" }),
    }),
  );
  certificate.notBefore.value = new Date();
  certificate.notAfter.value = new Date(Date.now() + 86400000);
  await certificate.subjectPublicKeyInfo.importKey(keys.publicKey);
  await certificate.sign(keys.privateKey, "SHA-256");
  return certificate;
}

describe("EnvelopedData KeyTransRecipientInfo encrypt errors", () => {
  it("rejects when wrapping the session key fails instead of leaving an empty encryptedKey", async () => {
    const certificate = await create1024BitRsaCertificate();
    const cmsEnveloped = new pkijs.EnvelopedData();
    cmsEnveloped.addRecipientByCertificate(certificate, { oaepHashAlgorithm: "SHA-512" });

    await expect(cmsEnveloped.encrypt({ name: "AES-CBC", length: 128 } as AesKeyGenParams, new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer)).rejects.toThrow(Error);

    const recipient = cmsEnveloped.recipientInfos[0].value as pkijs.KeyTransRecipientInfo;
    expect(recipient.encryptedKey.isEqual(pkijs.KeyTransRecipientInfo.defaultValues("encryptedKey"))).toBe(true);
  });
});

// Generated with OpenSSL 3.0.13, which leaves out ukm (RFC 5753 makes it optional):
//   openssl cms -encrypt -aes-256-cbc -binary -recip ec.crt -keyopt ecdh_kdf_md:sha256 -in msg.txt -outform DER
const OPENSSL_ECDH_ENVELOPED = [
  "MIIBLAYJKoZIhvcNAQcDoIIBHTCCARkCAQIxgcWhgcICAQOgUaFPMAkGByqGSM49AgEDQgAElY0v8cZuxkFJqNABgpsq652dWhM3",
  "NKaILyxxilrE8rLK1NCdBXBO/3A6r5INZa4zLyUGQ+qRBUs6vq7OpJ+eRzAVBgYrgQQBCwEwCwYJYIZIAWUDBAEtMFMwUTAlMA0x",
  "CzAJBgNVBAMMAmVjAhQp7K4AeAJm6rsC+LlZG664QgQjcQQoplWC2B6IR2lWtQt0JHTru4tu2WcUufEWqDvpYqoPXA7tRTRBDnWi",
  "PjBMBgkqhkiG9w0BBwEwHQYJYIZIAWUDBAEqBBDOAXimjcUu78xNXZjdhiv4gCBZIcSW9DD/hWlUVIPzu0OedoveaYGnuIMZjtOu",
  "SWSKmg==",
].join("");
const EC_CERT = [
  "MIIBcDCCARegAwIBAgIUKeyuAHgCZuq7Avi5WRuuuEIEI3EwCgYIKoZIzj0EAwIwDTELMAkGA1UEAwwCZWMwIBcNMjYxMDI3MTgy",
  "MDExWhgPMjEyNjEwMDMxODIwMTFaMA0xCzAJBgNVBAMMAmVjMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEAhKEj+V/jfwqmfWw",
  "KfjbRI35eTuZZIBX9swuL5H8zR7gTC5zViwKsB2Ghs0eMTa677g7283Bn6KWendNVO4GlaNTMFEwHQYDVR0OBBYEFLsqDWC9wpzM",
  "yG7zLFpR0a+wWgiGMB8GA1UdIwQYMBaAFLsqDWC9wpzMyG7zLFpR0a+wWgiGMA8GA1UdEwEB/wQFMAMBAf8wCgYIKoZIzj0EAwID",
  "RwAwRAIgVhwTNgktIUNAtC82How1sJFD5TpLPihnWIXniNQb09sCIEJnFaAV2eHjGnaSBsemJbPqbJoZHR5he7uwVKMy8cnk",
].join("");
const EC_PKCS8 = [
  "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgnjd5b7IDyXE9bQRLMfVZ9vXsdhf+eKO+pg1oUPc/5PChRANCAAQC",
  "EoSP5X+N/CqZ9bAp+NtEjfl5O5lkgFf2zC4vkfzNHuBMLnNWLAqwHYaGzR4xNrrvuDvbzcGfopZ6d01U7gaV",
].join("");

describe("EnvelopedData KeyAgreeRecipientInfo without ukm", () => {
  const message = "Hello, AuthEnvelopedData!\n";

  it("decrypts OpenSSL output", async () => {
    const cmsContent = pkijs.ContentInfo.fromBER(utils.fromBase64(OPENSSL_ECDH_ENVELOPED));
    const cmsEnveloped = new pkijs.EnvelopedData({ schema: cmsContent.content });
    assert.isUndefined((cmsEnveloped.recipientInfos[0].value as pkijs.KeyAgreeRecipientInfo).ukm);

    const result = await cmsEnveloped.decrypt(0, {
      recipientCertificate: pkijs.Certificate.fromBER(utils.fromBase64(EC_CERT)),
      recipientPrivateKey: utils.fromBase64(EC_PKCS8),
    });
    assert.equal(new TextDecoder().decode(result), message);
  });

  it("round-trips", async () => {
    const crypto = pkijs.getCrypto(true);
    const keys = (await crypto.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"])) as CryptoKeyPair;
    const data = new TextEncoder().encode(message).buffer as ArrayBuffer;

    const cmsEnveloped = new pkijs.EnvelopedData();
    cmsEnveloped.addRecipientByKeyIdentifier(keys.publicKey, new Uint8Array([1, 2, 3, 4]).buffer);
    delete (cmsEnveloped.recipientInfos[0].value as pkijs.KeyAgreeRecipientInfo).ukm;
    await cmsEnveloped.encrypt({ name: "AES-CBC", length: 256 } as AesKeyGenParams, data);

    const parsed = new pkijs.EnvelopedData({ schema: asn1js.fromBER(cmsEnveloped.toSchema().toBER(false)).result });
    assert.isUndefined((parsed.recipientInfos[0].value as pkijs.KeyAgreeRecipientInfo).ukm);
    const result = await parsed.decrypt(0, { recipientPrivateKey: await crypto.exportKey("pkcs8", keys.privateKey) });
    assert.equal(new TextDecoder().decode(result), message);
  });
});
