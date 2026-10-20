import { describe, expect, it } from "vitest";
import { ECPrivateKey, RSAPrivateKey, type ECPrivateKeyJson, type RSAPrivateKeyJson } from "./index";

async function exportJwk<T>(algorithm: RsaHashedKeyGenParams | EcKeyGenParams): Promise<T> {
  const keys = await crypto.subtle.generateKey(algorithm, true, ["sign", "verify"]);
  return (await crypto.subtle.exportKey("jwk", keys.privateKey)) as T;
}

const RSA: RsaHashedKeyGenParams = { name: "RSASSA-PKCS1-v1_5", modulusLength: 1024, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" };

describe("private key JWK conversion", () => {
  it("round-trips an RSA private key", async () => {
    const jwk = await exportJwk<RSAPrivateKeyJson>(RSA);
    const json = new RSAPrivateKey({ json: jwk }).toJSON();

    for (const name of ["n", "e", "d", "p", "q", "dp", "dq", "qi"] as const) {
      expect(json[name]).toBe(jwk[name]);
    }
  });

  it("round-trips an EC private key", async () => {
    const jwk = await exportJwk<ECPrivateKeyJson>({ name: "ECDSA", namedCurve: "P-256" });
    const json = new ECPrivateKey({ json: jwk }).toJSON();

    expect(json).toMatchObject({ crv: "P-256", d: jwk.d, x: jwk.x, y: jwk.y });
  });

  it("rejects members that are not unpadded base64url", async () => {
    const jwk = await exportJwk<RSAPrivateKeyJson>(RSA);

    expect(() => new RSAPrivateKey({ json: { ...jwk, d: "AQ+B" } })).toThrow(TypeError);
    expect(() => new RSAPrivateKey({ json: { ...jwk, e: "AQAB==" } })).toThrow(TypeError);
    expect(() => new ECPrivateKey({ json: { crv: "P-256", d: "@@" } })).toThrow(TypeError);
  });
});
