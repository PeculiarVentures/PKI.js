import * as asn1js from "asn1js";
import { describe, it, assert, expect } from "vitest";
import * as pkijs from "./index";
import * as utils from "../test/utils";

// Generated with OpenSSL 3.0.13 from MESSAGE:
//   openssl cms -encrypt -aes-256-gcm -binary -secretkey <KEK> -secretkeyid 6b656b31 -in msg.txt -outform DER
//   openssl cms -encrypt -aes-128-gcm -binary -recip rsa.crt -keyopt rsa_padding_mode:oaep \
//     -keyopt rsa_oaep_md:sha256 -keyopt rsa_mgf1_md:sha256 -in msg.txt -outform DER
const MESSAGE = "Hello, AuthEnvelopedData!\n";
const KEK = new Uint8Array(Array.from({ length: 32 }, (_, i) => i)).buffer;
const KEK_CMS = [
  "MIG3BgsqhkiG9w0BCRABF6CBpzCBpAIBADFEokICAQQwBgQEa2VrMTALBglghkgBZQMEAS0EKHIVlDbH/EgE7d5PBYDNwMdir87Y",
  "xaxh1AJ72F+smsqxwD9a3RxRXkQwRwYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAyKQM2n/haOTKlUA2gCARCAGlFAHObrg/I9",
  "FwT8+LmW/jjkXf9hYRMZLSZUBBB5Wxi+2cmReeUohbQCEhl7",
].join("");
const RSA_CMS = [
  "MIIB5AYLKoZIhvcNAQkQARegggHTMIIBzwIBADGCAW0wggFpAgEAMCYwDjEMMAoGA1UEAwwDcnNhAhQBFzrmvLnka+ww/7w7gvPc",
  "DeQrIjA4BgkqhkiG9w0BAQcwK6ANMAsGCWCGSAFlAwQCAaEaMBgGCSqGSIb3DQEBCDALBglghkgBZQMEAgEEggEARrtTLbvZBrgV",
  "nbOXd8eSHqDUYyPjp52JO1G49DOMnMXTgCj95T6iMJlsDVIDVY+k++IOCLd0EPoybLpKqpEgNj6y2O1zYuH65Gb55tB517u+I6BY",
  "7kkfIOD2AxZXwuvTdvqRF8XA3GZCEQMpubDTMCUUNCjAeeDMLG/4d4t0O0WrIENmCbgkKHbuxw+h63B/+OLjeK9dOR3xOAX/zsHp",
  "3U6jHJIU4iKEbQlRD+60p54FqNuGHteEmGQRNBzmPTfjXaCYFnVoSGhWJkXICZvIGhSmT1ASNIQ/ZD0GnCb7OMTWdkUCIr7f4Wy+",
  "3rAHduCgBUnLNIp4wCn/X6Gs/RWhkjBHBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEGMBEEDPODfwa1xaZ0WoD0xAIBEIAaHnbuqTD4",
  "lnAmjSog/8OqqmUjw6xWownAVMYEEEnIAmYGHdvMEybwvsN2BDg=",
].join("");
const RSA_PKCS8 = [
  "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCVRjsBaWo3RGJRuXuScWENZnkxU+hr3PZuwFjIGQOi88M/DGAX",
  "KPs1teAc4WNoumVY+9lZ1nWx6BiRXBum4QVTmx0LhQOiC26UWDyFcfLmGykCUjoODHJXVt9HXdBelIQISZxeWS9ILUVV9C+nEBBM",
  "ne2p/e1L4IWMmCSJS8ZDjbosOM9dWUG4e14NAmuT5BXdC3ViHAcGKogfPCUISGWKfercqj4ag/eGaS2f1Tx1MQr0Zd/lR1qa9n5w",
  "vJspvMn3ESX0sEzx9qguCwHti4WtAaQlQlZ55ccCbPSEzzOnQwPeNnDgElPo8DsmdML4qUsTbh5Qi5y2mzBhA0bum0OBAgMBAAEC",
  "ggEAAnYIdgL/ac7aUh+dPnJZF8f3Oo14GQMpGvVX4WCsMy0SrIDvOqKF1cJcYg2DPpBIKHnqgPUstpSthwP+PreaB2FYzr5QK4VF",
  "uvNjeA3DY/DRscSaSW4CGpeHkd0lmNGZBav1BIcy5N0+NecTPA1jP2ghKXrSxTv757AAdjUGHUn78J47Ss7N7cZ7ENoxsUmDeYQt",
  "Ypj8N8PQo9swlJlIppU0D2Os+elbI+Pk4NouhgAeVifSbE+LSPXaQq4ZV3UTV074LpFiXlVXb/6gM1eSJw+S+upezDQdj77GKdj+",
  "liIjTUYXT/7kINfKW4evf+FkHFwmB+E1NXmRsd1yo4/E4wKBgQDQqZ/tYsmDK0tMO1kuE0MXrCsw9jNB+5LPaivDksjv2/Utie+N",
  "rJZFmToG221WD9Dzun+Ih9o+AJnsSpeOZgicJo1dsTjblUzCqdJpjhlm362L6aj4GngNiJypZcr2MKfqbE6TnpIsjAwi2oqaE7go",
  "l8IRKoXIv0w6kiURHWnPTwKBgQC3I4x3HXxCnp+U4R5Fj/r2mid8vr7+6S2Zv2kf/6igPejl7yn1Wsbx9P6i29jxm1x0/AYwejh9",
  "vfyQIJw4G9xEd/LnSsuvgPt0L4EqzTKBsCH5jZyEQ33kJ+AwcCBzNyy04+SlM7XoKpAs1VKE7MlVPpoSHgd3Kms7mUnkjIGMLwKB",
  "gQCf8vbp5EjuKHjO1cuVuyQ5+DsfjApcsPin0A3+G/21h9mYb9zWsA59CWjmqrtUNkmJG1P5l5He510WOVOVz3cYI6FHybr476ho",
  "q/7j9Q5ZwmppDtL8ZGXUkfztCV+cek2tMBrHo80PIseGzBlk5GrNiw8zU3I8IQ/Q8ghB51cdlwKBgQCxb3fAUIj74sOqcxHpQ75a",
  "/rATZJuYTkMoGxO3NPQjjNgBLt7wIKtv8XZkQ6zFKUlC7orwnPnumgwBeBbjJdsbWzu0a/s8ZzM5Nm1nErhEfmnsZw+l9d4bF6dW",
  "Rsyp1GM0Pzhf9uHftp1JUsVIlEHcnXKY6w9AnZCXhcTZ8mfxcQKBgGloL6CH0/yJ3cYLYy+W29++SoI0MPz5nwAxVdYG+GHfA5Kh",
  "JSPBrg/eHLJAsd1tmHAr5Wxduxn4J/q9DYYLAgEY+ePm3b2qSY5f9GY0b0QPBvo0xvfrVehAxjMHzctLaYbYDkxKDpOwUM8TRsc8",
  "h1fYBeklLugPXdv1En0Vzt+r",
].join("");

// Generated with Bouncy Castle 1.86: AES-256-GCM, a KEK recipient (as above) and authAttrs
const BC_KEK_AUTH_ATTRS_CMS = [
  "MIAGCyqGSIb3DQEJEAEXoIAwgAIBADFEokICAQQwBgQEa2VrMTALBglghkgBZQMEAS0EKF5/fX/ewfbU/Cc9ZE8l3uMrH5J8NyXZ",
  "7kTf/wnfpdocjb1qzNkm+0AwgAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAx+3Bxod4ohneSzGRUCARCggAQZVsBjxfH5GK7E",
  "f2XKNg1LHijwRqw0CIbE6QAAAAChODAYBgkqhkiG9w0BCQMxCwYJKoZIhvcNAQcBMBwGCSqGSIb3DQEJBTEPFw0yNjEwMjcxODI4",
  "MzdaBBBpOinoq1Itnka+wyTz4cRvAAAAAAAA",
].join("");

const contentType = "1.2.840.113549.1.9.3";
const signingTime = "1.2.840.113549.1.9.5";

function parse(encoded: ArrayBuffer): pkijs.AuthEnvelopedData {
  const contentInfo = pkijs.ContentInfo.fromBER(encoded);
  assert.equal(contentInfo.contentType, pkijs.ContentInfo.AUTH_ENVELOPED_DATA);
  return new pkijs.AuthEnvelopedData({ schema: contentInfo.content });
}

function encode(authEnvelopedData: pkijs.AuthEnvelopedData): ArrayBuffer {
  return new pkijs.ContentInfo({
    contentType: pkijs.ContentInfo.AUTH_ENVELOPED_DATA,
    content: authEnvelopedData.toSchema(),
  })
    .toSchema()
    .toBER(false);
}

function text(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

function message(): ArrayBuffer {
  return new TextEncoder().encode(MESSAGE).buffer as ArrayBuffer;
}

async function encryptForKek(algorithm: pkijs.AuthEnvelopedDataEncryptAlgorithm, authAttrs?: pkijs.Attribute[]): Promise<pkijs.AuthEnvelopedData> {
  const authEnvelopedData = new pkijs.AuthEnvelopedData();
  if (authAttrs) authEnvelopedData.authAttrs = authAttrs;
  authEnvelopedData.addRecipientByPreDefinedData(KEK, { keyEncryptionAlgorithm: { name: "AES-KW", length: 256 } }, 1);
  await authEnvelopedData.encrypt(algorithm, message());
  return authEnvelopedData;
}

function createAuthAttrs(): pkijs.Attribute[] {
  // Not in DER order: the encoding of signingTime is longer
  return [
    new pkijs.Attribute({
      type: signingTime,
      values: [new asn1js.UTCTime({ valueDate: new Date() })],
    }),
    new pkijs.Attribute({
      type: contentType,
      values: [new asn1js.ObjectIdentifier({ value: "1.2.840.113549.1.7.1" })],
    }),
  ];
}

describe("AuthEnvelopedData", () => {
  describe("decrypts OpenSSL output", () => {
    it("for a KEK recipient", async () => {
      const result = await parse(utils.fromBase64(KEK_CMS)).decrypt(0, { preDefinedData: KEK });
      assert.equal(text(result), MESSAGE);
    });

    it("for a key transport recipient", async () => {
      const result = await parse(utils.fromBase64(RSA_CMS)).decrypt(0, { recipientPrivateKey: utils.fromBase64(RSA_PKCS8) });
      assert.equal(text(result), MESSAGE);
    });
  });

  it("decrypts Bouncy Castle output with authAttrs", async () => {
    const authEnvelopedData = parse(utils.fromBase64(BC_KEK_AUTH_ATTRS_CMS));
    assert.equal(authEnvelopedData.authAttrs!.length, 2);

    const result = await authEnvelopedData.decrypt(0, { preDefinedData: KEK });
    assert.equal(text(result), "Hello from Bouncy Castle\n");
  });

  it("re-encodes parsed data unchanged", () => {
    const encoded = new Uint8Array(utils.fromBase64(KEK_CMS));
    assert.deepEqual(new Uint8Array(encode(parse(encoded.buffer))), encoded);
  });

  it("encodes RFC 5084 GCMParameters and carries the tag in mac", async () => {
    const authEnvelopedData = parse(encode(await encryptForKek({ name: "AES-GCM", length: 256 })));

    assert.equal(authEnvelopedData.version, 0);
    const algorithm = authEnvelopedData.authEncryptedContentInfo.contentEncryptionAlgorithm;
    assert.equal(algorithm.algorithmId, "2.16.840.1.101.3.4.1.46");
    const [nonce, icvLen] = (algorithm.algorithmParams as asn1js.Sequence).valueBlock.value as [asn1js.OctetString, asn1js.Integer];
    assert.equal(nonce.valueBlock.valueHexView.length, 12);
    assert.equal(icvLen.valueBlock.valueDec, 16);
    assert.equal(authEnvelopedData.mac.valueBlock.valueHexView.length, 16);
    assert.equal(authEnvelopedData.authEncryptedContentInfo.getEncryptedContent().byteLength, MESSAGE.length);

    assert.equal(text(await authEnvelopedData.decrypt(0, { preDefinedData: KEK })), MESSAGE);
  });

  it("omits the default ICV length", async () => {
    const authEnvelopedData = parse(encode(await encryptForKek({ name: "AES-GCM", length: 128, tagLength: 96 })));

    const algorithm = authEnvelopedData.authEncryptedContentInfo.contentEncryptionAlgorithm;
    assert.equal((algorithm.algorithmParams as asn1js.Sequence).valueBlock.value.length, 1);
    assert.equal(authEnvelopedData.mac.valueBlock.valueHexView.length, 12);

    assert.equal(text(await authEnvelopedData.decrypt(0, { preDefinedData: KEK })), MESSAGE);
  });

  it("round-trips with password and key agreement recipients", async () => {
    const crypto = pkijs.getCrypto(true);
    const keys = (await crypto.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"])) as CryptoKeyPair;
    const password = new TextEncoder().encode("password").buffer as ArrayBuffer;

    const authEnvelopedData = new pkijs.AuthEnvelopedData();
    authEnvelopedData.addRecipientByPreDefinedData(password, {}, 2);
    authEnvelopedData.addRecipientByKeyIdentifier(keys.publicKey, new Uint8Array([1, 2, 3, 4]).buffer);
    await authEnvelopedData.encrypt({ name: "AES-GCM", length: 192 }, message());

    const parsed = parse(encode(authEnvelopedData));
    assert.equal(text(await parsed.decrypt(0, { preDefinedData: password })), MESSAGE);
    assert.equal(text(await parsed.decrypt(1, { recipientPrivateKey: await crypto.exportKey("pkcs8", keys.privateKey) })), MESSAGE);
  });

  it("authenticates authAttrs in DER order", async () => {
    const authEnvelopedData = parse(encode(await encryptForKek({ name: "AES-GCM", length: 256 }, createAuthAttrs())));

    assert.deepEqual(
      authEnvelopedData.authAttrs!.map((o) => o.type),
      [contentType, signingTime],
    );
    assert.equal(text(await authEnvelopedData.decrypt(0, { preDefinedData: KEK })), MESSAGE);

    // Changing the authenticated attributes must invalidate the tag
    authEnvelopedData.authAttrs = authEnvelopedData.authAttrs!.slice(0, 1);
    await expect(parse(encode(authEnvelopedData)).decrypt(0, { preDefinedData: KEK })).rejects.toThrow();
  });

  it("rejects a modified mac", async () => {
    const authEnvelopedData = parse(utils.fromBase64(KEK_CMS));
    const mac = authEnvelopedData.mac.valueBlock.valueHexView.slice();
    mac[0] ^= 1;
    authEnvelopedData.mac = new asn1js.OctetString({ valueHex: mac });

    await expect(authEnvelopedData.decrypt(0, { preDefinedData: KEK })).rejects.toThrow();
  });

  it("rejects content encryption algorithms other than AES-GCM", async () => {
    await expect(encryptForKek({ name: "AES-CBC", length: 256 })).rejects.toThrow("Unsupported content encryption algorithm");
  });
});
