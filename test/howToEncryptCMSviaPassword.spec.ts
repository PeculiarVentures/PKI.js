import * as assert from "assert";
import * as pvutils from "pvutils";
import * as example from "./howToEncryptCMSviaPassword";

context("How To Encrypt CMS via Password", () => {
  //#region Initial variables
  const encryptionVariants = [1, 2];
  const encAlgs = ["AES-CBC", "AES-GCM"];
  const encLens = [128, 192, 256];

  const valueBuffer = (new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09])).buffer;
  const preDefinedDataBuffer = (new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09])).buffer;
  //#endregion

  encAlgs.forEach(encAlg => {
    encLens.forEach(encLen => {
      encryptionVariants.forEach(encryptionVariant => {
        const testName = `${encAlg} with ${encLen}, ${(encryptionVariant === 2) ? "Password-based encryption" : "Pre-defined KEK"}`;

        it(testName, async () => {
          const encryptionAlgorithm = {
            name: encAlg,
            length: encLen,
          };

          const cmsEnvelopedBuffer = await example.envelopedEncrypt(encryptionVariant, preDefinedDataBuffer, encryptionAlgorithm, valueBuffer);
          const result = await example.envelopedDecrypt(encryptionVariant, preDefinedDataBuffer, cmsEnvelopedBuffer);
          assert.equal(pvutils.isEqualBuffer(result, valueBuffer), true, "Decrypted value must be equal with initially encrypted value");
        });
      });
    });
  });
});

