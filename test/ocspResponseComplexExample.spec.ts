import * as assert from "assert";
import * as pkijs from "../src";
import * as example from "./ocspResponseComplexExample";

context("OCSP Response Complex Example", () => {
  //#region Initial variables
  const hashAlgs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
  const signAlgs = ["RSASSA-PKCS1-V1_5", "ECDSA", "RSA-PSS"];
  //#endregion

  signAlgs.forEach(sigAlg => {
    hashAlgs.forEach(hashAlg => {
      const testName = `${hashAlg} + ${sigAlg}`;

      it(testName, async () => {
        const ocspResp = await example.createOCSPResp(hashAlg, sigAlg);
        const ocspRespRaw = ocspResp.ocspResp.toSchema().toBER();
        pkijs.OCSPResponse.fromBER(ocspRespRaw);

        const result = await example.verifyOCSPResp(ocspRespRaw, [ocspResp.certificate]);
        assert.equal(result, true, "OCSP Response must be verified successfully");
      });
    });
  });
});

