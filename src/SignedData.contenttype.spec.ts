import { describe, it, assert } from "vitest";
import * as asn1js from "asn1js";
import * as pkijs from "./index";
import * as utils from "../test/utils";

// RFC 5652 Section 11.1: when signed attributes are present, the value of the content-type
// attribute MUST match the eContentType of the EncapsulatedContentInfo. These tests build a
// CMS SignedData whose content-type signed attribute matches / does not match eContentType.

const ID_DATA = "1.2.840.113549.1.7.1";

async function createSignedWithContentType(contentTypeOid: string, hashAlg = "SHA-256", signAlg = "RSASSA-PKCS1-V1_5") {
  const crypto = pkijs.getCrypto(true);
  const dataBuffer = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]).buffer;
  const certWithKey = await utils.createSelfSignedCertificate(hashAlg, signAlg);

  const signed = new pkijs.SignedData({
    version: 1,
    encapContentInfo: new pkijs.EncapsulatedContentInfo({ eContentType: ID_DATA }),
    signerInfos: [
      new pkijs.SignerInfo({
        version: 1,
        sid: new pkijs.IssuerAndSerialNumber({
          issuer: certWithKey.certificate.issuer,
          serialNumber: certWithKey.certificate.serialNumber,
        }),
      }),
    ],
    certificates: [certWithKey.certificate],
  });

  const digest = await crypto.digest({ name: hashAlg }, dataBuffer);
  signed.signerInfos[0].signedAttrs = new pkijs.SignedAndUnsignedAttributes({
    type: 0,
    attributes: [
      new pkijs.Attribute({ type: "1.2.840.113549.1.9.3", values: [new asn1js.ObjectIdentifier({ value: contentTypeOid })] }), // content-type
      new pkijs.Attribute({ type: "1.2.840.113549.1.9.4", values: [new asn1js.OctetString({ valueHex: digest })] }), // message-digest
    ],
  });

  signed.encapContentInfo.eContent = new asn1js.OctetString({ valueHex: dataBuffer });
  await signed.sign(certWithKey.privateKey, 0, hashAlg);

  const cms = new pkijs.ContentInfo({ contentType: "1.2.840.113549.1.7.2", content: signed.toSchema(true) });
  return { ber: cms.toSchema().toBER(false), certificate: certWithKey.certificate };
}

async function verifyBER(ber: ArrayBuffer, certificate: pkijs.Certificate) {
  const contentInfo = pkijs.ContentInfo.fromBER(ber);
  const signedData = new pkijs.SignedData({ schema: contentInfo.content });
  return signedData.verify({ signer: 0, trustedCerts: [certificate] });
}

describe("SignedData content-type signed attribute (RFC 5652 Section 11.1)", () => {
  it("verifies successfully when the content-type attribute matches eContentType", async () => {
    const { ber, certificate } = await createSignedWithContentType(ID_DATA);
    const result = await verifyBER(ber, certificate);
    assert.equal(result, true, "A CMS whose content-type attribute matches eContentType must verify");
  });

  it("rejects when the content-type attribute does not match eContentType", async () => {
    const { ber, certificate } = await createSignedWithContentType("1.3.6.1.4.1.99999.1");
    let threw = false;
    try {
      await verifyBER(ber, certificate);
    } catch (err: any) {
      threw = true;
      assert.equal(err.code, 11, "content-type mismatch must fail with code 11");
      assert.match(err.message, /content-type.*does not match.*eContentType/);
    }
    assert.ok(threw, "verification must reject when content-type does not match eContentType");
  });
});
