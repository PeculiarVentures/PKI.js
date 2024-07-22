import * as assert from "assert";
import * as pvtsutils from "pvtsutils";
import * as pkijs from "../src";
import * as example from "./cmsSignedComplexExample";

context("CMS Signed Complex Example", () => {
  //#region Initial variables
  const hashAlgs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
  const signAlgs = ["RSASSA-PKCS1-V1_5", "ECDSA", "RSA-PSS"];
  const addExts = [false, true];
  const detachedSignatures = [false, true];

  const dataBuffer = (new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09])).buffer;
  //#endregion

  signAlgs.forEach(signAlg => {
    hashAlgs.forEach(hashAlg => {
      addExts.forEach(addExt => {
        detachedSignatures.forEach(detachedSignature => {
          const testName = `${hashAlg} + ${signAlg}, add ext: ${addExt}, detached signature: ${detachedSignature}`;

          it(testName, async () => {
            const cms = await example.createCMSSigned(hashAlg, signAlg, dataBuffer, detachedSignature, addExt);
            //#region Simple test for decoding data
            assert.doesNotThrow(() => {
              const cmsContentSimpl = pkijs.ContentInfo.fromBER(cms.cmsSignedData);
              new pkijs.SignedData({ schema: cmsContentSimpl.content });
            });
            //#endregion

            const result = await example.verifyCMSSigned(cms.cmsSignedData, [cms.certificate], detachedSignature ? dataBuffer : undefined);
            assert.equal(result, true, "CMS SignedData must be verified successfully");
          });
        });
      });
    });
  });

  it("Special test case for issue #170", async () => {
    const testData = "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";

    //#region Simple test for decoding data
    const cmsSignedBuffer = pvtsutils.Convert.FromBase64(testData);
    assert.doesNotThrow(() => {
      const cmsContentSimpl = pkijs.ContentInfo.fromBER(cmsSignedBuffer);
      new pkijs.SignedData({ schema: cmsContentSimpl.content });
    });
    //#endregion

    const ok = await example.verifyCMSSigned(cmsSignedBuffer);
    assert.equal(ok, true, "CMS SignedData must be verified successfully");
  });

  it("should sign data using SHA-256 for message digest and SHA-1 for signature hash, then verify the signature", async () => {
    const cms = await example.createCMSSigned("SHA-256", "RSASSA-PKCS1-V1_5", dataBuffer, false, true, "SHA-1");
    //#region Verify that the CMS SignedData can be decoded without errors
    assert.doesNotThrow(() => {
      const cmsContentSimpl = pkijs.ContentInfo.fromBER(cms.cmsSignedData);
      new pkijs.SignedData({ schema: cmsContentSimpl.content });
    });
    //#endregion
    console.log(Buffer.from(cms.cmsSignedData).toString("base64"));

    // Verify the CMS SignedData using the provided certificate and original data buffer
    const result = await example.verifyCMSSigned(cms.cmsSignedData, [cms.certificate], dataBuffer);
    assert.equal(result, true, "The CMS SignedData should be verified successfully");
  });

  it("should sign data using SHA-256 for message digest and SHA-1 for signature hash without considering the message hash, then verify the signature", async () => {
    const cms = await example.createCMSSigned("SHA-256", "RSASSA-PKCS1-V1_5", dataBuffer, false, false, "SHA-1");
    //#region Verify that the CMS SignedData can be decoded without errors
    assert.doesNotThrow(() => {
      const cmsContentSimpl = pkijs.ContentInfo.fromBER(cms.cmsSignedData);
      new pkijs.SignedData({ schema: cmsContentSimpl.content });
    });
    //#endregion
    console.log(Buffer.from(cms.cmsSignedData).toString("base64"));

    // Verify the CMS SignedData using the provided certificate and original data buffer
    const result = await example.verifyCMSSigned(cms.cmsSignedData, [cms.certificate], dataBuffer);
    assert.equal(result, true, "The CMS SignedData should be verified successfully");
  });
});

