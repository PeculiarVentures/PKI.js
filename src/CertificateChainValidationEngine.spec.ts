import { describe, it, assert, beforeAll, afterEach } from "vitest";
import * as asn1js from "asn1js";
import * as pkijs from "./index";

const checkDate = new Date("2026-01-01T00:00:00Z");

const UNKNOWN_EXTENSION = "1.2.3.4.5.6.7.8.9";

let serial = 1;

const name = (cn: string) => [
  new pkijs.AttributeTypeAndValue({
    type: "2.5.4.3",
    value: new asn1js.Utf8String({ value: cn }),
  }),
];

interface CertificateOptions {
  ca: boolean;
  pathLenConstraint?: number;
  extensions?: pkijs.Extension[];
}

async function createCertificate(subject: string, issuer: string, publicKey: CryptoKey, issuerPrivateKey: CryptoKey, options: CertificateOptions): Promise<pkijs.Certificate> {
  const basicConstraints = new pkijs.BasicConstraints({ cA: options.ca });
  if (options.pathLenConstraint !== undefined) {
    basicConstraints.pathLenConstraint = options.pathLenConstraint;
  }

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
      extnValue: basicConstraints.toSchema().toBER(false),
    }),
    ...(options.extensions || []),
  ];
  await certificate.subjectPublicKeyInfo.importKey(publicKey);
  await certificate.sign(issuerPrivateKey, "SHA-256");

  return new pkijs.Certificate({ schema: certificate.toSchema() });
}

const unknownCriticalExtension = () =>
  new pkijs.Extension({
    extnID: UNKNOWN_EXTENSION,
    critical: true,
    extnValue: new asn1js.Null().toBER(false),
  });

describe("CertificateChainValidationEngine", () => {
  let keys: CryptoKeyPair[];

  beforeAll(async () => {
    const crypto = pkijs.getCrypto(true);
    const algorithm = {
      name: "ECDSA",
      namedCurve: "P-256",
    };
    const generateKey = () => crypto.generateKey(algorithm, true, ["sign", "verify"]) as Promise<CryptoKeyPair>;
    keys = await Promise.all([generateKey(), generateKey(), generateKey(), generateKey()]);
  });

  const verify = (trustRoot: pkijs.Certificate, certs: pkijs.Certificate[]) =>
    new pkijs.CertificateChainValidationEngine({
      trustedCerts: [trustRoot],
      certs,
      checkDate,
    }).verify();

  describe("pathLenConstraint", () => {
    const [root, ica, subCa, ee] = [0, 1, 2, 3];

    it("rejects a CA below an intermediate with pathLenConstraint 0", async () => {
      const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
      const ica0 = await createCertificate("ICA0", "Root", keys[ica].publicKey, keys[root].privateKey, { ca: true, pathLenConstraint: 0 });
      const subCaCert = await createCertificate("SubCA", "ICA0", keys[subCa].publicKey, keys[ica].privateKey, { ca: true });
      const endEntity = await createCertificate("EE", "SubCA", keys[ee].publicKey, keys[subCa].privateKey, { ca: false });

      const result = await verify(trustRoot, [ica0, subCaCert, endEntity]);
      assert.isFalse(result.result);
      assert.equal(result.resultCode, 16);
    });

    it("accepts an end entity issued by an intermediate with pathLenConstraint 0", async () => {
      const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
      const ica0 = await createCertificate("ICA0", "Root", keys[ica].publicKey, keys[root].privateKey, { ca: true, pathLenConstraint: 0 });
      const endEntity = await createCertificate("EE", "ICA0", keys[ee].publicKey, keys[ica].privateKey, { ca: false });

      const result = await verify(trustRoot, [ica0, endEntity]);
      assert.isTrue(result.result, result.resultMessage);
    });

    it("applies the pathLenConstraint of the trust anchor", async () => {
      const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true, pathLenConstraint: 0 });
      const icaCert = await createCertificate("ICA", "Root", keys[ica].publicKey, keys[root].privateKey, { ca: true });
      const endEntity = await createCertificate("EE", "ICA", keys[ee].publicKey, keys[ica].privateKey, { ca: false });

      const result = await verify(trustRoot, [icaCert, endEntity]);
      assert.isFalse(result.result);
      assert.equal(result.resultCode, 16);
    });

    it("accepts a path as long as the trust anchor's pathLenConstraint", async () => {
      const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true, pathLenConstraint: 1 });
      const icaCert = await createCertificate("ICA", "Root", keys[ica].publicKey, keys[root].privateKey, { ca: true });
      const endEntity = await createCertificate("EE", "ICA", keys[ee].publicKey, keys[ica].privateKey, { ca: false });

      const result = await verify(trustRoot, [icaCert, endEntity]);
      assert.isTrue(result.result, result.resultMessage);
    });
  });

  describe("critical extensions", () => {
    const [root, ica, , ee] = [0, 1, 2, 3];

    afterEach(() => {
      delete pkijs.ExtensionValueFactory.types?.[UNKNOWN_EXTENSION];
    });

    it("rejects an end entity with an unrecognized critical extension", async () => {
      const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
      const endEntity = await createCertificate("EE", "Root", keys[ee].publicKey, keys[root].privateKey, { ca: false, extensions: [unknownCriticalExtension()] });

      const result = await verify(trustRoot, [endEntity]);
      assert.isFalse(result.result);
      assert.equal(result.resultCode, 15);
      assert.equal(result.resultMessage, `Unrecognized critical certificate extension: ${UNKNOWN_EXTENSION}`);
    });

    it("rejects an intermediate with an unrecognized critical extension", async () => {
      const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
      const icaCert = await createCertificate("ICA", "Root", keys[ica].publicKey, keys[root].privateKey, { ca: true, extensions: [unknownCriticalExtension()] });
      const endEntity = await createCertificate("EE", "ICA", keys[ee].publicKey, keys[ica].privateKey, { ca: false });

      const result = await verify(trustRoot, [icaCert, endEntity]);
      assert.isFalse(result.result);
      assert.equal(result.resultCode, 15);
    });

    it("accepts an end entity with critical keyUsage and extKeyUsage", async () => {
      const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
      const endEntity = await createCertificate("EE", "Root", keys[ee].publicKey, keys[root].privateKey, {
        ca: false,
        extensions: [
          new pkijs.Extension({
            extnID: "2.5.29.15",
            critical: true,
            extnValue: new asn1js.BitString({ valueHex: new Uint8Array([0x80]).buffer, unusedBits: 7 }).toBER(false),
          }),
          new pkijs.Extension({
            extnID: "2.5.29.37",
            critical: true,
            extnValue: new pkijs.ExtKeyUsage({ keyPurposes: ["1.3.6.1.5.5.7.3.2"] }).toSchema().toBER(false),
          }),
        ],
      });

      const result = await verify(trustRoot, [endEntity]);
      assert.isTrue(result.result, result.resultMessage);
    });

    it("accepts a critical extension once its type is registered", async () => {
      class UnknownExtensionValue {
        fromSchema() {}
        toSchema() {
          return new asn1js.Null();
        }
        toJSON() {
          return {};
        }
      }
      pkijs.ExtensionValueFactory.register(UNKNOWN_EXTENSION, "UnknownExtension", UnknownExtensionValue);

      const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
      const endEntity = await createCertificate("EE", "Root", keys[ee].publicKey, keys[root].privateKey, { ca: false, extensions: [unknownCriticalExtension()] });

      const result = await verify(trustRoot, [endEntity]);
      assert.isTrue(result.result, result.resultMessage);
    });
  });
});
