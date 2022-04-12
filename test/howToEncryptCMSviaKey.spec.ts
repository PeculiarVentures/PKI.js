import * as assert from "assert";
import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as utils from "./utils";
import * as pkijs from "../src";
import * as example from "./howToEncryptCMSviaKey";

context("How To Encrypt CMS via Key Identifier", () => {
  //#region Initial variables
  const kdfHashAlgs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
  const curveNames = ["P-256", "P-384", "P-521"];
  const encAlgs = ["AES-CBC", "AES-GCM"];
  const encLens = [128, 192, 256];

  const valueBuffer = (new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09])).buffer;
  //#endregion

  encAlgs.forEach(encAlg => {
    encLens.forEach(encLen => {
      curveNames.forEach(curveName => {
        kdfHashAlgs.forEach(kdfHashAlg => {
          const testName = `${encAlg} with ${encLen} + ${curveName}, OAEP hash: ${kdfHashAlg}`;

          it(testName, async () => {

            const encryptionAlgorithm = {
              name: encAlg,
              length: encLen,
              kdfHash: kdfHashAlg,
              namedCurve: curveName
            };

            const keys = await example.createKeyPair(curveName);
            const cmsEnvelopedBuffer = await example.envelopedEncrypt(keys, encryptionAlgorithm, valueBuffer);
            const result = await example.envelopedDecrypt(keys.pkcs8, cmsEnvelopedBuffer);
            assert.equal(pvutils.isEqualBuffer(result, valueBuffer), true, "Decrypted value must be equal with initially encrypted value");
          });
        });
      });
    });
  });
});

