import { describe, it, assert } from "vitest";
import * as asn1js from "asn1js";
import * as pkijs from "./index";
import { createTSPResp, verifyTSPResp } from "../examples/TSPResponseComplexExample/example";
import { createSelfSignedCertificate } from "../examples/utils";

describe("TSP Response Complex Example", () => {
  const hashAlgs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
  const signAlgs = ["RSASSA-PKCS1-V1_5", "ECDSA", "RSA-PSS"];

  signAlgs.forEach((signAlg) => {
    hashAlgs.forEach((hashAlg) => {
      it(`${hashAlg} + ${signAlg}`, async () => {
        const tsp = await createTSPResp(hashAlg, signAlg);
        assert.doesNotThrow(() => {
          pkijs.TimeStampResp.fromBER(tsp.tspResponse.toSchema().toBER());
        });

        const result = await verifyTSPResp(tsp);
        assert.equal(result, true, "TSP Response must be verified successfully");
      });
    });
  });
});

describe("TSP Response with eContent passed to the EncapsulatedContentInfo constructor", () => {
  // The constructor stores eContent as a constructed OCTET STRING, and toSchema() encodes it that way.
  it("verifies before and after a DER round trip", async () => {
    const data = new Uint8Array([1, 2, 3, 4]).buffer;
    const { certificate, privateKey } = await createSelfSignedCertificate("SHA-256", "ECDSA");

    const tstInfo = new pkijs.TSTInfo({
      version: 1,
      policy: "1.2.3.4.1",
      messageImprint: await pkijs.MessageImprint.create("SHA-256", data),
      serialNumber: new asn1js.Integer({ value: 1 }),
      genTime: new Date(),
    });
    const signedData = new pkijs.SignedData({
      version: 3,
      encapContentInfo: new pkijs.EncapsulatedContentInfo({
        eContentType: pkijs.id_eContentType_TSTInfo,
        eContent: new asn1js.OctetString({ valueHex: tstInfo.toSchema().toBER() }),
      }),
      signerInfos: [
        new pkijs.SignerInfo({
          version: 1,
          sid: new pkijs.IssuerAndSerialNumber({ issuer: certificate.issuer, serialNumber: certificate.serialNumber }),
        }),
      ],
      certificates: [certificate],
    });
    await signedData.sign(privateKey, 0, "SHA-256");

    const response = new pkijs.TimeStampResp({
      status: new pkijs.PKIStatusInfo({ status: pkijs.PKIStatus.granted }),
      timeStampToken: new pkijs.ContentInfo({ contentType: pkijs.ContentInfo.SIGNED_DATA, content: signedData.toSchema(true) }),
    });
    const params = { signer: 0, data, trustedCerts: [certificate] };

    assert.equal(await response.verify(params), true);
    assert.equal(await pkijs.TimeStampResp.fromBER(response.toSchema().toBER()).verify(params), true);
  });
});
