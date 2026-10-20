import { describe, expect, it } from "vitest";
import { ECPublicKey } from "./index";

async function exportJwk(namedCurve: string): Promise<{ crv: string; x: string; y: string }> {
  const keys = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve }, true, ["sign", "verify"]);
  const { crv, x, y } = await crypto.subtle.exportKey("jwk", keys.publicKey);
  return { crv: crv!, x: x!, y: y! };
}

describe("ECPublicKey", () => {
  it.each(["P-256", "P-384", "P-521"])("round-trips a %s JWK", async (namedCurve) => {
    const jwk = await exportJwk(namedCurve);

    expect(new ECPublicKey({ json: jwk }).toJSON()).toEqual(jwk);
  });

  it("accepts padded base64url coordinates", async () => {
    const jwk = await exportJwk("P-256");
    const padded = { ...jwk, x: `${jwk.x}=`, y: `${jwk.y}=` };

    expect(new ECPublicKey({ json: padded }).toJSON()).toEqual(jwk);
  });

  it("rejects coordinates that are not base64url", async () => {
    const jwk = await exportJwk("P-256");

    expect(() => new ECPublicKey({ json: { ...jwk, x: "AQ+B" } })).toThrow(TypeError);
  });
});
