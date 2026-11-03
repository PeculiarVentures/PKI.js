import * as asn1js from "asn1js";
import { describe, it, assert } from "vitest";
import * as pkijs from "./index";
import * as utils from "../test/utils";

const contentType = "1.2.840.113549.1.9.3";
const messageDigest = "1.2.840.113549.1.9.4";
const signingTime = "1.2.840.113549.1.9.5";

// The order from issue #402: messageDigest is encoded longer than signingTime,
// so DER puts it last.
function createAttributes(digest: ArrayBuffer): pkijs.Attribute[] {
  return [
    new pkijs.Attribute({
      type: contentType,
      values: [new asn1js.ObjectIdentifier({ value: "1.2.840.113549.1.7.1" })],
    }),
    new pkijs.Attribute({
      type: messageDigest,
      values: [new asn1js.OctetString({ valueHex: digest })],
    }),
    new pkijs.Attribute({
      type: signingTime,
      values: [new asn1js.UTCTime({ valueDate: new Date() })],
    }),
  ];
}

function encodedTypes(attrs: asn1js.Constructed): string[] {
  return attrs.valueBlock.value.map((attr) => new pkijs.Attribute({ schema: attr }).type);
}

function assertDerOrder(attrs: asn1js.Constructed) {
  const encodings = attrs.valueBlock.value.map((attr) => new Uint8Array(attr.toBER(false)));
  for (let i = 1; i < encodings.length; i++) {
    const a = encodings[i - 1];
    const b = encodings[i];
    const length = Math.max(a.length, b.length);
    let diff = 0;
    for (let j = 0; j < length && diff === 0; j++) diff = (a[j] ?? 0) - (b[j] ?? 0);
    assert.isAtMost(diff, 0, `attribute ${i - 1} must not sort after attribute ${i}`);
  }
}

describe("SignedAndUnsignedAttributes", () => {
  it("orders signed attributes by their DER encoding", () => {
    const attrs = new pkijs.SignedAndUnsignedAttributes({
      type: 0,
      attributes: createAttributes(new ArrayBuffer(32)),
    });

    const schema = attrs.toSchema() as asn1js.Constructed;
    assert.deepEqual(encodedTypes(schema), [contentType, signingTime, messageDigest]);
    assertDerOrder(schema);
  });

  it("signs the DER encoding of signed attributes", async () => {
    const crypto = pkijs.getCrypto(true);
    const data = new Uint8Array([1, 2, 3, 4]).buffer;
    const { certificate, privateKey } = await utils.createSelfSignedCertificate("SHA-256", "RSASSA-PKCS1-V1_5");

    const signedData = new pkijs.SignedData({
      version: 1,
      encapContentInfo: new pkijs.EncapsulatedContentInfo({
        eContentType: "1.2.840.113549.1.7.1",
        eContent: new asn1js.OctetString({ valueHex: data }),
      }),
      signerInfos: [
        new pkijs.SignerInfo({
          version: 1,
          sid: new pkijs.IssuerAndSerialNumber({
            issuer: certificate.issuer,
            serialNumber: certificate.serialNumber,
          }),
          signedAttrs: new pkijs.SignedAndUnsignedAttributes({
            type: 0,
            attributes: createAttributes(await crypto.digest({ name: "SHA-256" }, data)),
          }),
        }),
      ],
      certificates: [certificate],
    });
    await signedData.sign(privateKey, 0, "SHA-256");

    const encoded = new pkijs.ContentInfo({
      contentType: pkijs.ContentInfo.SIGNED_DATA,
      content: signedData.toSchema(true),
    })
      .toSchema()
      .toBER(false);

    const parsed = new pkijs.SignedData({ schema: pkijs.ContentInfo.fromBER(encoded).content });
    const parsedAttrs = parsed.signerInfos[0].signedAttrs!;

    // The transmitted attributes are in DER order...
    const transmitted = asn1js.fromBER(parsedAttrs.encodedValue).result as asn1js.Constructed;
    assert.deepEqual(encodedTypes(transmitted), [contentType, signingTime, messageDigest]);
    assertDerOrder(transmitted);

    // ...and the signature was computed over exactly those bytes.
    const ok = await parsed.verify({ signer: 0, trustedCerts: [certificate] });
    assert.isTrue(ok);
  });

  it("keeps the received order of parsed signed attributes", () => {
    const unsorted = new asn1js.Constructed({
      idBlock: { tagClass: 3, tagNumber: 0 },
      value: createAttributes(new ArrayBuffer(32)).map((attr) => attr.toSchema()),
    }).toBER(false);

    const attrs = new pkijs.SignedAndUnsignedAttributes({ type: 0, schema: asn1js.fromBER(unsorted).result });

    assert.deepEqual(new Uint8Array(attrs.toSchema().toBER(false)), new Uint8Array(unsorted));
  });

  it("does not reorder unsigned attributes", () => {
    const attrs = new pkijs.SignedAndUnsignedAttributes({
      type: 1,
      attributes: createAttributes(new ArrayBuffer(32)),
    });

    const schema = attrs.toSchema() as asn1js.Constructed;
    assert.deepEqual(encodedTypes(schema), [contentType, messageDigest, signingTime]);
  });
});
