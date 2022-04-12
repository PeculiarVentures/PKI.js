import * as assert from "assert";
import * as asn1js from "asn1js";
import "./utils";
import * as pkijs from "../src";
import * as example from "./p7bSimpleExample";

context("P7B Simple Example", () => {
  //#region Initial variables
  const hashAlgs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
  const signAlgs = ["RSASSA-PKCS1-V1_5", "ECDSA", "RSA-PSS"];
  //#endregion

  signAlgs.forEach(signAlg => {
    hashAlgs.forEach(hashAlg => {
      const testName = `${hashAlg} + ${signAlg}`;

      it(testName, async () => {
        const cmsSignedBuffer = await example.createP7B(hashAlg, signAlg);
        const asn1 = asn1js.fromBER(cmsSignedBuffer);
        const contentInfo = new pkijs.ContentInfo({ schema: asn1.result });

        assert.equal(contentInfo.contentType, "1.2.840.113549.1.7.2", "Content Type ID must be '1.2.840.113549.1.7.2'");

        const signedData = new pkijs.SignedData({ schema: contentInfo.content });

        assert.ok(signedData.certificates);
        assert.equal(signedData.certificates.length, 3, "SignedData must contains 3 certificates");
      });
    });
  });
});
