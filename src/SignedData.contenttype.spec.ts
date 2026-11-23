import { describe, it, assert } from "vitest";
import * as asn1js from "asn1js";
import * as pkijs from "./index";
import * as utils from "../test/utils";

// RFC 5652 Section 11.1: when signed attributes are present, the value of the content-type
// attribute MUST match the eContentType of the EncapsulatedContentInfo, there MUST be exactly
// one content-type attribute, and its single value MUST be an OBJECT IDENTIFIER. These tests
// build CMS SignedData structures that satisfy or violate each of those requirements.

const ID_DATA = "1.2.840.113549.1.7.1";
const ID_OTHER = "1.3.6.1.4.1.99999.1";
const CONTENT_TYPE_OID = "1.2.840.113549.1.9.3";
const MESSAGE_DIGEST_OID = "1.2.840.113549.1.9.4";

function contentTypeAttr(oid: string) {
  return new pkijs.Attribute({ type: CONTENT_TYPE_OID, values: [new asn1js.ObjectIdentifier({ value: oid })] });
}

interface CreateSignedOptions {
  // Builds the full signed-attributes list; receives the ready-made message-digest attribute so
  // callers only decide how the content-type attribute(s) are arranged. Defaults to a single,
  // matching content-type attribute followed by the message-digest attribute.
  buildAttributes?: (messageDigestAttr: pkijs.Attribute) => pkijs.Attribute[];
  // Mutates the SignedData after signing (e.g. to tamper the unsigned outer eContentType).
  afterSign?: (signed: pkijs.SignedData) => void;
  hashAlg?: string;
  signAlg?: string;
}

async function createSigned(options: CreateSignedOptions = {}) {
  const { hashAlg = "SHA-256", signAlg = "RSASSA-PKCS1-V1_5", buildAttributes, afterSign } = options;
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
  const messageDigestAttr = new pkijs.Attribute({
    type: MESSAGE_DIGEST_OID,
    values: [new asn1js.OctetString({ valueHex: digest })],
  });

  signed.signerInfos[0].signedAttrs = new pkijs.SignedAndUnsignedAttributes({
    type: 0,
    attributes: buildAttributes ? buildAttributes(messageDigestAttr) : [contentTypeAttr(ID_DATA), messageDigestAttr],
  });

  signed.encapContentInfo.eContent = new asn1js.OctetString({ valueHex: dataBuffer });
  await signed.sign(certWithKey.privateKey, 0, hashAlg);

  if (afterSign) afterSign(signed);

  const cms = new pkijs.ContentInfo({ contentType: "1.2.840.113549.1.7.2", content: signed.toSchema(true) });
  return { ber: cms.toSchema().toBER(false), certificate: certWithKey.certificate };
}

async function createSignedWithContentType(contentTypeOid: string, hashAlg = "SHA-256", signAlg = "RSASSA-PKCS1-V1_5") {
  return createSigned({ hashAlg, signAlg, buildAttributes: (md) => [contentTypeAttr(contentTypeOid), md] });
}

async function verifyBER(ber: ArrayBuffer, certificate: pkijs.Certificate) {
  const contentInfo = pkijs.ContentInfo.fromBER(ber);
  const signedData = new pkijs.SignedData({ schema: contentInfo.content });
  return signedData.verify({ signer: 0, trustedCerts: [certificate] });
}

async function expectVerifyError(ber: ArrayBuffer, certificate: pkijs.Certificate, code: number, messagePattern: RegExp) {
  let caught: any;
  try {
    await verifyBER(ber, certificate);
  } catch (err) {
    caught = err;
  }
  assert.ok(caught, `verification must reject (expected SignedDataVerifyError code ${code})`);
  assert.equal(caught.code, code, `expected SignedDataVerifyError code ${code}, got ${caught.code}: ${caught.message}`);
  assert.match(caught.message, messagePattern);
}

describe("SignedData content-type signed attribute (RFC 5652 Section 11.1)", () => {
  it("verifies successfully when the content-type attribute matches eContentType", async () => {
    const { ber, certificate } = await createSignedWithContentType(ID_DATA);
    const result = await verifyBER(ber, certificate);
    assert.equal(result, true, "A CMS whose content-type attribute matches eContentType must verify");
  });

  it("rejects when the content-type attribute does not match eContentType", async () => {
    const { ber, certificate } = await createSignedWithContentType(ID_OTHER);
    await expectVerifyError(ber, certificate, 11, /content-type.*does not match.*eContentType/);
  });

  it("rejects a content-type value that is not an OBJECT IDENTIFIER even when its string matches eContentType", async () => {
    const relative = new asn1js.RelativeObjectIdentifier({ value: ID_DATA });
    // A RelativeObjectIdentifier is a different ASN.1 type that renders to the same dotted-decimal
    // string as the OID, so a valueBlock.toString()-only comparison would wrongly accept it.
    assert.equal(relative.valueBlock.toString(), ID_DATA);
    const { ber, certificate } = await createSigned({
      buildAttributes: (md) => [new pkijs.Attribute({ type: CONTENT_TYPE_OID, values: [relative] }), md],
    });
    await expectVerifyError(ber, certificate, 12, /not an OBJECT IDENTIFIER/);
  });

  it("rejects a content-type attribute carrying more than one value (cardinality)", async () => {
    const { ber, certificate } = await createSigned({
      buildAttributes: (md) => [
        new pkijs.Attribute({
          type: CONTENT_TYPE_OID,
          values: [new asn1js.ObjectIdentifier({ value: ID_DATA }), new asn1js.ObjectIdentifier({ value: ID_OTHER })],
        }),
        md,
      ],
    });
    await expectVerifyError(ber, certificate, 13, /exactly one value/);
  });

  it("rejects duplicate content-type attributes, including one appearing after both mandatory attributes", async () => {
    // Built as [content-type, message-digest, content-type]. DER SET OF ordering places the
    // shorter message-digest attribute first, so the duplicate content-type is only reached after
    // both mandatory attributes have already been found - the case the former early-exit would miss.
    const { ber, certificate } = await createSigned({
      buildAttributes: (md) => [contentTypeAttr(ID_DATA), md, contentTypeAttr(ID_DATA)],
    });
    await expectVerifyError(ber, certificate, 13, /[Mm]ultiple "content-type"/);
  });

  it("rejects a CMS whose eContentType is modified after signing (content-type confusion)", async () => {
    // Sign a valid, consistent CMS, then tamper only the unsigned outer eContentType. The signed
    // attributes (including the original content-type attribute) and the signature are untouched,
    // so the rejection comes solely from the content-type binding, not a broken signature or digest.
    const { ber, certificate } = await createSigned({
      afterSign: (signed) => {
        signed.encapContentInfo.eContentType = ID_OTHER;
      },
    });
    await expectVerifyError(ber, certificate, 11, /content-type.*does not match.*eContentType/);
  });
});
