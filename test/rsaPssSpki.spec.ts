import * as assert from "assert";
import { Crypto } from "@peculiar/webcrypto";
import * as pkijs from "../src";

context("RSA-PSS public key import", () => {
  it("imports SPKI values with rsaPSS algorithm identifiers", async () => {
    const webcrypto = new Crypto();
    const engine = new pkijs.CryptoEngine({
      name: "test",
      crypto: webcrypto,
    });

    // Prepare RSA-PSS key pair
    const keyPair = (await webcrypto.subtle.generateKey(
      {
        name: "RSA-PSS",
        hash: "SHA-256",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
      },
      true,
      ["sign", "verify"],
    )) as CryptoKeyPair;

    const publicKeyInfo = new pkijs.PublicKeyInfo();
    await publicKeyInfo.importKey(keyPair.publicKey, engine);
    publicKeyInfo.algorithm = new pkijs.AlgorithmIdentifier({
      algorithmId: "1.2.840.113549.1.1.10",
    });
    const spki = publicKeyInfo.toSchema().toBER(false);

    // Verify that the SPKI can be imported
    const key = await engine.importKey(
      "spki",
      spki,
      { name: "RSA-PSS", hash: { name: "SHA-256" } } as RsaHashedImportParams,
      true,
      ["verify"],
    );
    const keyAlgorithm = key.algorithm as RsaHashedKeyAlgorithm;

    assert.equal(keyAlgorithm.name, "RSA-PSS");
    assert.equal(keyAlgorithm.hash.name, "SHA-256");
    assert.equal(keyAlgorithm.modulusLength, 2048);
  });
});
