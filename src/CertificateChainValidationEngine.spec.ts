import { describe, it, assert, beforeAll } from "vitest";
import * as asn1js from "asn1js";
import * as pkijs from "./index";

const checkDate = new Date("2026-01-01T00:00:00Z");

let serial = 1;

const name = (cn: string) => [
  new pkijs.AttributeTypeAndValue({
    type: "2.5.4.3",
    value: new asn1js.Utf8String({ value: cn }),
  }),
];

async function createCertificate(subject: string, issuer: string, publicKey: CryptoKey, issuerPrivateKey: CryptoKey, ca: boolean): Promise<pkijs.Certificate> {
  const certificate = new pkijs.Certificate();
  certificate.version = 2;
  certificate.serialNumber = new asn1js.Integer({ value: serial++ });
  certificate.issuer.typesAndValues = name(issuer);
  certificate.subject.typesAndValues = name(subject);
  certificate.notBefore.value = new Date("2025-01-01T00:00:00Z");
  certificate.notAfter.value = new Date("2027-01-01T00:00:00Z");
  certificate.extensions = [
    new pkijs.Extension({
      extnID: "2.5.29.19",
      critical: true,
      extnValue: new pkijs.BasicConstraints({ cA: ca }).toSchema().toBER(false),
    }),
  ];
  await certificate.subjectPublicKeyInfo.importKey(publicKey);
  await certificate.sign(issuerPrivateKey, "SHA-256");

  return new pkijs.Certificate({ schema: certificate.toSchema() });
}

describe("CertificateChainValidationEngine", () => {
  describe("path building with a dead-end candidate issuer", () => {
    let trustRoot: pkijs.Certificate;
    let icaByTrustRoot: pkijs.Certificate;
    let icaByMissingRoot: pkijs.Certificate;
    let endEntity: pkijs.Certificate;

    beforeAll(async () => {
      const crypto = pkijs.getCrypto(true);
      const algorithm = {
        name: "ECDSA",
        namedCurve: "P-256",
      };
      const generateKey = () => crypto.generateKey(algorithm, true, ["sign", "verify"]) as Promise<CryptoKeyPair>;
      const [rootKeys, missingRootKeys, icaKeys, endEntityKeys] = await Promise.all([generateKey(), generateKey(), generateKey(), generateKey()]);

      trustRoot = await createCertificate("TrustRoot", "TrustRoot", rootKeys.publicKey, rootKeys.privateKey, true);
      // The same intermediate, cross-signed by a root that is not available
      icaByTrustRoot = await createCertificate("ICA", "TrustRoot", icaKeys.publicKey, rootKeys.privateKey, true);
      icaByMissingRoot = await createCertificate("ICA", "MissingRoot", icaKeys.publicKey, missingRootKeys.privateKey, true);
      endEntity = await createCertificate("EE", "ICA", endEntityKeys.publicKey, icaKeys.privateKey, false);
    });

    const verify = (certs: pkijs.Certificate[]) =>
      new pkijs.CertificateChainValidationEngine({
        trustedCerts: [trustRoot],
        certs,
        checkDate,
      }).verify();

    it("validates without the dead-end certificate", async () => {
      const result = await verify([icaByTrustRoot, endEntity]);
      assert.isTrue(result.result, result.resultMessage);
    });

    it("tries the other candidate when the first one is a dead end", async () => {
      const result = await verify([icaByMissingRoot, icaByTrustRoot, endEntity]);
      assert.isTrue(result.result, result.resultMessage);
      assert.deepEqual(result.certificatePath, [endEntity, icaByTrustRoot, trustRoot]);
    });

    it("tries the other candidate when the last one is a dead end", async () => {
      const result = await verify([icaByTrustRoot, icaByMissingRoot, endEntity]);
      assert.isTrue(result.result, result.resultMessage);
      assert.deepEqual(result.certificatePath, [endEntity, icaByTrustRoot, trustRoot]);
    });

    it("fails when every candidate is a dead end", async () => {
      const result = await verify([icaByMissingRoot, endEntity]);
      assert.isFalse(result.result);
      assert.equal(result.resultCode, pkijs.ChainValidationCode.noValidPath);
      assert.equal(result.resultMessage, "No valid certificate paths found");
      assert.instanceOf(result.error, pkijs.ChainValidationError);
    });

    it("fails when the end entity has no issuer at all", async () => {
      const result = await verify([endEntity]);
      assert.isFalse(result.result);
      assert.equal(result.resultCode, pkijs.ChainValidationCode.noValidPath);
      assert.equal(result.resultMessage, "No valid certificate paths found");
      assert.instanceOf(result.error, pkijs.ChainValidationError);
    });
  });

  describe("path building with an issuer cycle", () => {
    let trustRoot: pkijs.Certificate;
    let icaAByTrustRoot: pkijs.Certificate;
    let icaAByMissingRoot: pkijs.Certificate;
    let icaAByB: pkijs.Certificate;
    let icaBByA: pkijs.Certificate;
    let endEntity: pkijs.Certificate;

    beforeAll(async () => {
      const crypto = pkijs.getCrypto(true);
      const algorithm = {
        name: "ECDSA",
        namedCurve: "P-256",
      };
      const generateKey = () => crypto.generateKey(algorithm, true, ["sign", "verify"]) as Promise<CryptoKeyPair>;
      const [rootKeys, missingRootKeys, aKeys, bKeys, endEntityKeys] = await Promise.all([generateKey(), generateKey(), generateKey(), generateKey(), generateKey()]);

      trustRoot = await createCertificate("TrustRoot", "TrustRoot", rootKeys.publicKey, rootKeys.privateKey, true);
      icaAByTrustRoot = await createCertificate("ICA A", "TrustRoot", aKeys.publicKey, rootKeys.privateKey, true);
      icaAByMissingRoot = await createCertificate("ICA A", "MissingRoot", aKeys.publicKey, missingRootKeys.privateKey, true);
      // A and B are cross-signed by each other: A -> B -> A -> ...
      icaAByB = await createCertificate("ICA A", "ICA B", aKeys.publicKey, bKeys.privateKey, true);
      icaBByA = await createCertificate("ICA B", "ICA A", bKeys.publicKey, aKeys.privateKey, true);
      endEntity = await createCertificate("EE", "ICA A", endEntityKeys.publicKey, aKeys.privateKey, false);
    });

    const verify = (certs: pkijs.Certificate[]) =>
      new pkijs.CertificateChainValidationEngine({
        trustedCerts: [trustRoot],
        certs,
        checkDate,
      }).verify();

    it("fails without hanging on a cycle only", async () => {
      const result = await verify([icaAByB, icaBByA, endEntity]);
      assert.isFalse(result.result);
      assert.equal(result.resultCode, pkijs.ChainValidationCode.noValidPath);
    }, 10000);

    for (const order of ["dead end first", "cycle first"]) {
      it(`fails without hanging on a dead end and a cycle (${order})`, async () => {
        const candidates = order === "dead end first" ? [icaAByMissingRoot, icaAByB] : [icaAByB, icaAByMissingRoot];
        const result = await verify([...candidates, icaBByA, endEntity]);
        assert.isFalse(result.result);
        assert.equal(result.resultCode, pkijs.ChainValidationCode.noValidPath);
      }, 10000);
    }

    const orders: [string, () => pkijs.Certificate[]][] = [
      ["cycle, dead end, valid", () => [icaAByB, icaAByMissingRoot, icaAByTrustRoot]],
      ["dead end, cycle, valid", () => [icaAByMissingRoot, icaAByB, icaAByTrustRoot]],
      ["valid, cycle, dead end", () => [icaAByTrustRoot, icaAByB, icaAByMissingRoot]],
      ["cycle, valid", () => [icaAByB, icaAByTrustRoot]],
    ];
    for (const [order, candidates] of orders) {
      it(`finds the trusted path next to a cycle (${order})`, async () => {
        const result = await verify([...candidates(), icaBByA, endEntity]);
        assert.isTrue(result.result, result.resultMessage);
        assert.deepEqual(result.certificatePath, [endEntity, icaAByTrustRoot, trustRoot]);
      }, 10000);
    }
  });
});
