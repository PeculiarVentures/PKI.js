import { describe, it, expect } from "vitest";
import * as asn1js from "asn1js";
import * as pkijs from "../src";

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
      hash: { name: "SHA-256" }
    } as RsaHashedKeyGenParams,
    true,
    ["sign", "verify"]
  )) as CryptoKeyPair;

  const certificate = new pkijs.Certificate();
  certificate.version = 2;
  certificate.serialNumber = new asn1js.Integer({ value: 1 });
  certificate.issuer.typesAndValues.push(
    new pkijs.AttributeTypeAndValue({
      type: "2.5.4.3",
      value: new asn1js.Utf8String({ value: "Test" })
    })
  );
  certificate.subject.typesAndValues.push(
    new pkijs.AttributeTypeAndValue({
      type: "2.5.4.3",
      value: new asn1js.Utf8String({ value: "Test" })
    })
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

    await expect(
      cmsEnveloped.encrypt(
        { name: "AES-CBC", length: 128 } as AesKeyGenParams,
        new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer
      )
    ).rejects.toThrow(Error);

    const recipient = cmsEnveloped.recipientInfos[0].value as pkijs.KeyTransRecipientInfo;
    expect(
      recipient.encryptedKey.isEqual(pkijs.KeyTransRecipientInfo.defaultValues("encryptedKey"))
    ).toBe(true);
  });
});
