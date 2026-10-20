import * as asn1js from "asn1js";
import { assert, describe, it } from "vitest";
import { hex, toArrayBuffer } from "@peculiar/utils";
import { createCMSECDSASignature, createECDSASignatureFromCMS } from "./index";

const testVectors = [
  {
    name: "P-521, s with redundant leading zeros",
    rHex: "010fc11f9fa733d62042904c2a4f5077d84a0cb61162e10dec784830521327a4a50d8be8a7b3778568a6c51355519ea12dad6347583c0ff6921285c7ed3db7439586",
    sHex: "000000000dadfe9ce0563383ef6dc2f06a6cb35f72cc66b5626bf91a1508b309207390ff302164c2e78f7e2958ee8d9e9cc7cca4a6a20cb9a011b0850212a50ca515",
    derHex:
      "3081840242010fc11f9fa733d62042904c2a4f5077d84a0cb61162e10dec784830521327a4a50d8be8a7b3778568a6c51355519ea12dad6347583c0ff6921285c7ed3db7439586023e0dadfe9ce0563383ef6dc2f06a6cb35f72cc66b5626bf91a1508b309207390ff302164c2e78f7e2958ee8d9e9cc7cca4a6a20cb9a011b0850212a50ca515",
  },
  {
    name: "P-521, r with redundant leading zeros",
    rHex: "00000000068e322ecf4487d24ab2484276f20f5b660e1f651df2d24623f74e216588de5fe4ee65b84cb62579e06dedb4be87bd96e0d9726ac64f6cdfd4369465b31b",
    sHex: "01ead398135ff59757a0400074f885a7a22eb624349d3cd245309266f7229e8ca977492634b8960c2ea86215d8a9dcfb8d3e17775bcbf33cf46f1f8e8d7c3f3e4c53",
    derHex:
      "308184023e068e322ecf4487d24ab2484276f20f5b660e1f651df2d24623f74e216588de5fe4ee65b84cb62579e06dedb4be87bd96e0d9726ac64f6cdfd4369465b31b024201ead398135ff59757a0400074f885a7a22eb624349d3cd245309266f7229e8ca977492634b8960c2ea86215d8a9dcfb8d3e17775bcbf33cf46f1f8e8d7c3f3e4c53",
  },
  {
    name: "small values r = 1, s = 2",
    rHex: "000000000000000000000000000000000000000000000000000000000000000000000000000000000001",
    sHex: "000000000000000000000000000000000000000000000000000000000000000000000000000000000002",
    derHex: "3006020101020102",
  },
  {
    name: "P-256, s with high bit set",
    rHex: "52e3f7b727fba9e8eddb1d083b75c1882517e6dc63ded9c0524f8f9a45dc8661",
    sHex: "b8930438de8d33bdab12c3a2bdad979592a1fd6576d1734c3eb0af340456aef4",
    derHex: "3045022052e3f7b727fba9e8eddb1d083b75c1882517e6dc63ded9c0524f8f9a45dc8661022100b8930438de8d33bdab12c3a2bdad979592a1fd6576d1734c3eb0af340456aef4",
  },
  {
    name: "padded r = 128 with a 00 sign octet",
    rHex: "0000000000000000000000000000000000000000000000000000000000000080",
    sHex: "0000000000000000000000000000000000000000000000000000000000000002",
    derHex: "300702020080020102",
  },
  {
    name: "zero r as a single 00 octet",
    rHex: "0000000000000000000000000000000000000000000000000000000000000000",
    sHex: "0000000000000000000000000000000000000000000000000000000000000002",
    derHex: "3006020100020102",
  },
];

describe("createCMSECDSASignature - ", () => {
  testVectors.forEach(({ name, rHex, sHex, derHex }) => {
    it(`should encode ${name} as DER`, () => {
      const signatureBuffer = toArrayBuffer(hex.decode(rHex + sHex));
      const derBuffer = createCMSECDSASignature(signatureBuffer);

      assert.strictEqual(hex.encode(derBuffer), derHex);
    });

    it(`should round-trip ${name} through createECDSASignatureFromCMS`, () => {
      const signatureBuffer = toArrayBuffer(hex.decode(rHex + sHex));
      const derBuffer = createCMSECDSASignature(signatureBuffer);
      const asn1 = asn1js.fromBER(derBuffer);

      const restored = createECDSASignatureFromCMS(asn1.result, rHex.length / 2);

      assert.strictEqual(hex.encode(restored), rHex + sHex);
    });
  });
});
