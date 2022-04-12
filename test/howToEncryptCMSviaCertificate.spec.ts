import * as assert from "assert";
import * as pvutils from "pvutils";
import * as example from "./howToEncryptCMSviaCertificate";
import * as utils from "./utils";

context("How To Encrypt CMS via Certificate", () => {
  //#region Initial variables
  const hashAlgs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
  const oaepHashAlgs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
  const signAlgs = ["RSASSA-PKCS1-V1_5", "ECDSA", "RSA-PSS"];
  const encAlgs = ["AES-CBC", "AES-GCM"];
  const encLens = [128, 192, 256];

  const valueBuffer = (new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09])).buffer;
  //#endregion

  encAlgs.forEach(encAlg => {
    encLens.forEach(encLen => {
      signAlgs.forEach(signAlg => {
        hashAlgs.forEach(hashAlg => {
          oaepHashAlgs.forEach(oaepHashAlg => {
            const testName = `${encAlg} with ${encLen}, ${hashAlg} + ${signAlg}, OAEP hash: ${oaepHashAlg}`;

            it(testName, async () => {
              const certWithKey = await utils.createSelfSignedCertificate(hashAlg, signAlg);
              const certRaw = certWithKey.certificate.toSchema().toBER();
              const cmsEnvelopedBuffer = await example.envelopedEncrypt(certRaw, {
                name: encAlg,
                length: encLen,
                oaepHashAlg: oaepHashAlg,
              }, valueBuffer);
              const result = await example.envelopedDecrypt(certRaw, certWithKey.pkcs8, cmsEnvelopedBuffer);
              assert.equal(pvutils.isEqualBuffer(result, valueBuffer), true, "Decrypted value must be equal with initially encrypted value");
            });
          });
        });
      });
    });
  });
});
