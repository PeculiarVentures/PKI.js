import { describe, expect, it } from "vitest";
import { RSAPublicKey } from "./index";

/** Base64url of `length` bytes counting up from 0x81, so the value has no leading zero. */
function modulus(length: number): string {
  return Buffer.from(Array.from({ length }, (_, i) => (0x81 + i) & 0xff)).toString("base64url");
}

describe("RSAPublicKey", () => {
  describe("fromJSON", () => {
    it.each([
      ["RSA-2048 modulus, e = 65537", modulus(256), "AQAB"],
      ["e = 3", modulus(256), "Aw"],
      ["4-byte e", modulus(256), "AQAAAQ"],
      ["4000-bit modulus", modulus(500), "AQAB"],
      ["3072-bit modulus", modulus(384), "AQAB"],
    ])("decodes n and e exactly (%s)", (_, n, e) => {
      expect(new RSAPublicKey({ json: { n, e } }).toJSON()).toEqual({ n, e });
    });

    it("accepts padded base64url", () => {
      const json = new RSAPublicKey({ json: { n: `${modulus(128)}=`, e: "AQAB" } }).toJSON();

      expect(json).toEqual({ n: modulus(128), e: "AQAB" });
    });

    it("rejects members that are not base64url", () => {
      expect(() => new RSAPublicKey({ json: { n: "AQ+B", e: "AQAB" } })).toThrow(TypeError);
      expect(() => new RSAPublicKey({ json: { n: modulus(128), e: "A@B" } })).toThrow(TypeError);
    });
  });
});
