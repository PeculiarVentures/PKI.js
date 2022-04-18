import * as assert from "assert";
import * as asn1js from "asn1js";
import * as pkijs from "../src";
import { createTSPResp, verifyTSPResp } from "./tspRespComplexExample";

context("TSP Response Complex Example", () => {
  const hashAlgs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
  const signAlgs = ["RSASSA-PKCS1-V1_5", "ECDSA", "RSA-PSS"];

  signAlgs.forEach(signAlg => {
    hashAlgs.forEach(hashAlg => {
      const testName = `${hashAlg} + ${signAlg}`;

      it(testName, async () => {

        const tsp = await createTSPResp(hashAlg, signAlg);
        assert.doesNotThrow(() => {
          const asn1 = asn1js.fromBER(tsp.tspResponse.toSchema().toBER());
          pkijs.AsnError.assert(asn1, "TimeStampResp");
          new pkijs.TimeStampResp({ schema: asn1.result });
        });

        const result = await verifyTSPResp(tsp);
        assert.equal(result, true, "TSP Response must be verified successfully");
      });
    });
  });
});

