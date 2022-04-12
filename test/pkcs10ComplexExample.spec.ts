import * as assert from "assert";
import * as asn1js from "asn1js";
import * as pkijs from "../src";
import * as example from "./pkcs10ComplexExample";
import "./utils";

context("PKCS#10 Complex Example", () => {
  //#region Initial variables
  const hashAlgs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
  const signAlgs = ["RSASSA-PKCS1-V1_5", "ECDSA", "RSA-PSS"];

  const algorithmsMap = new Map([
    ["SHA-1 + RSASSA-PKCS1-V1_5", "1.2.840.113549.1.1.5"],
    ["SHA-256 + RSASSA-PKCS1-V1_5", "1.2.840.113549.1.1.11"],
    ["SHA-384 + RSASSA-PKCS1-V1_5", "1.2.840.113549.1.1.12"],
    ["SHA-512 + RSASSA-PKCS1-V1_5", "1.2.840.113549.1.1.13"],

    ["SHA-1 + ECDSA", "1.2.840.10045.4.1"],
    ["SHA-256 + ECDSA", "1.2.840.10045.4.3.2"],
    ["SHA-384 + ECDSA", "1.2.840.10045.4.3.3"],
    ["SHA-512 + ECDSA", "1.2.840.10045.4.3.4"],

    ["SHA-1 + RSA-PSS", "1.2.840.113549.1.1.10"],
    ["SHA-256 + RSA-PSS", "1.2.840.113549.1.1.10"],
    ["SHA-384 + RSA-PSS", "1.2.840.113549.1.1.10"],
    ["SHA-512 + RSA-PSS", "1.2.840.113549.1.1.10"]
  ]);
  //#endregion

  signAlgs.forEach(signAlg => {
    hashAlgs.forEach(hashAlg => {
      const testName = `${hashAlg} + ${signAlg}`;

      it(testName, async () => {
        const pkcs10Buffer = await example.createPKCS10Internal(hashAlg, signAlg);
        const asn1 = asn1js.fromBER(pkcs10Buffer);
        const pkcs10 = new pkijs.CertificationRequest({ schema: asn1.result });

        assert.equal(pkcs10.signatureAlgorithm.algorithmId, algorithmsMap.get(testName), `Signature algorithm must be ${testName}`);

        const result = await example.verifyPKCS10Internal(pkcs10Buffer);
        assert.equal(result, true, "PKCS#10 must be verified successfully");
      });
    });
  });
});
