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
  pathLenConstraint?: number | asn1js.Integer;
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

const setPathLenConstraint = (cert: pkijs.Certificate, value: asn1js.Integer) => {
  const extension = cert.extensions!.find((o) => o.extnID === "2.5.29.19")!;
  extension.parsedValue = new pkijs.BasicConstraints({ cA: true, pathLenConstraint: value });
};

describe("CertificateChainValidationEngine", () => {
  let keys: CryptoKeyPair[];

  beforeAll(async () => {
    const crypto = pkijs.getCrypto(true);
    const algorithm = {
      name: "ECDSA",
      namedCurve: "P-256",
    };
    const generateKey = () => crypto.generateKey(algorithm, true, ["sign", "verify"]) as Promise<CryptoKeyPair>;
    keys = await Promise.all([generateKey(), generateKey(), generateKey(), generateKey(), generateKey()]);
  });

  const verify = (trustRoot: pkijs.Certificate | pkijs.Certificate[], certs: pkijs.Certificate[], criticalExtensionHandler?: pkijs.CriticalExtensionHandler) =>
    new pkijs.CertificateChainValidationEngine({
      trustedCerts: Array.isArray(trustRoot) ? trustRoot : [trustRoot],
      certs,
      checkDate,
      criticalExtensionHandler,
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

    for (const [label, depth] of [
      ["an end entity directly", 0],
      ["a deeper chain", 1],
    ] as const) {
      it(`rejects a negative pathLenConstraint above ${label}`, async () => {
        const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
        const icaNegative = await createCertificate("ICA", "Root", keys[ica].publicKey, keys[root].privateKey, { ca: true, pathLenConstraint: -1 });
        const certs = [icaNegative];
        let issuer = "ICA";
        let issuerKey = keys[ica].privateKey;
        if (depth === 1) {
          certs.push(await createCertificate("SubCA", "ICA", keys[subCa].publicKey, keys[ica].privateKey, { ca: true }));
          issuer = "SubCA";
          issuerKey = keys[subCa].privateKey;
        }
        certs.push(await createCertificate("EE", issuer, keys[ee].publicKey, issuerKey, { ca: false }));

        const result = await verify(trustRoot, certs);
        assert.isFalse(result.result);
        assert.equal(result.resultCode, 16);
        assert.equal(result.resultMessage, "Invalid pathLenConstraint value: -1");
      });
    }

    describe("asn1js.Integer values", () => {
      for (const [label, value, valid] of [
        ["0", 0, false],
        ["1", 1, true],
      ] as const) {
        it(`enforces an in-memory asn1js.Integer ${label}`, async () => {
          const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
          const icaCert = await createCertificate("ICA", "Root", keys[ica].publicKey, keys[root].privateKey, { ca: true });
          const subCaCert = await createCertificate("SubCA", "ICA", keys[subCa].publicKey, keys[ica].privateKey, { ca: true });
          const endEntity = await createCertificate("EE", "SubCA", keys[ee].publicKey, keys[subCa].privateKey, { ca: false });
          setPathLenConstraint(icaCert, new asn1js.Integer({ value }));

          const result = await verify(trustRoot, [icaCert, subCaCert, endEntity]);
          assert.equal(result.result, valid, result.resultMessage);
        });

        it(`enforces a DER-encoded asn1js.Integer ${label}`, async () => {
          const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
          const icaCert = await createCertificate("ICA", "Root", keys[ica].publicKey, keys[root].privateKey, { ca: true, pathLenConstraint: new asn1js.Integer({ value }) });
          const subCaCert = await createCertificate("SubCA", "ICA", keys[subCa].publicKey, keys[ica].privateKey, { ca: true });
          const endEntity = await createCertificate("EE", "SubCA", keys[ee].publicKey, keys[subCa].privateKey, { ca: false });

          const result = await verify(trustRoot, [icaCert, subCaCert, endEntity]);
          assert.equal(result.result, valid, result.resultMessage);
        });
      }

      it("accepts a pathLenConstraint larger than Number.MAX_SAFE_INTEGER", async () => {
        const big = asn1js.Integer.fromBigInt(BigInt(2) ** BigInt(64));
        const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
        const icaCert = await createCertificate("ICA", "Root", keys[ica].publicKey, keys[root].privateKey, { ca: true, pathLenConstraint: big });
        const subCaCert = await createCertificate("SubCA", "ICA", keys[subCa].publicKey, keys[ica].privateKey, { ca: true });
        const endEntity = await createCertificate("EE", "SubCA", keys[ee].publicKey, keys[subCa].privateKey, { ca: false });
        const parsed = icaCert.extensions!.find((o) => o.extnID === "2.5.29.19")!.parsedValue as pkijs.BasicConstraints;
        assert.instanceOf(parsed.pathLenConstraint, asn1js.Integer);

        const result = await verify(trustRoot, [icaCert, subCaCert, endEntity]);
        assert.isTrue(result.result, result.resultMessage);
      });
    });

    describe("cross-signed alternatives", () => {
      const rootB = 4;
      for (const order of ["failing first", "passing first"]) {
        it(`finds the path that meets the limit (${order})`, async () => {
          const rootA0 = await createCertificate("Root A", "Root A", keys[root].publicKey, keys[root].privateKey, { ca: true, pathLenConstraint: 0 });
          const rootB1 = await createCertificate("Root B", "Root B", keys[rootB].publicKey, keys[rootB].privateKey, { ca: true, pathLenConstraint: 1 });
          const icaByA = await createCertificate("ICA", "Root A", keys[ica].publicKey, keys[root].privateKey, { ca: true });
          const icaByB = await createCertificate("ICA", "Root B", keys[ica].publicKey, keys[rootB].privateKey, { ca: true });
          const endEntity = await createCertificate("EE", "ICA", keys[ee].publicKey, keys[ica].privateKey, { ca: false });

          const roots = order === "failing first" ? [rootA0, rootB1] : [rootB1, rootA0];
          const icas = order === "failing first" ? [icaByA, icaByB] : [icaByB, icaByA];
          const result = await verify(roots, [...icas, endEntity]);
          assert.isTrue(result.result, result.resultMessage);
          assert.deepEqual(result.certificatePath, [endEntity, icaByB, rootB1]);
        });
      }

      it("reports the error when no alternative meets the limit", async () => {
        const rootA0 = await createCertificate("Root A", "Root A", keys[root].publicKey, keys[root].privateKey, { ca: true, pathLenConstraint: 0 });
        const rootB0 = await createCertificate("Root B", "Root B", keys[rootB].publicKey, keys[rootB].privateKey, { ca: true, pathLenConstraint: 0 });
        const icaByA = await createCertificate("ICA", "Root A", keys[ica].publicKey, keys[root].privateKey, { ca: true });
        const icaByB = await createCertificate("ICA", "Root B", keys[ica].publicKey, keys[rootB].privateKey, { ca: true });
        const endEntity = await createCertificate("EE", "ICA", keys[ee].publicKey, keys[ica].privateKey, { ca: false });

        const result = await verify([rootA0, rootB0], [icaByA, icaByB, endEntity]);
        assert.isFalse(result.result);
        assert.equal(result.resultCode, 16);
      });
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

    it("rejects a critical extension that only has a registered decoder", async () => {
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
      assert.isFalse(result.result);
      assert.equal(result.resultCode, 15);
    });

    it("accepts a critical extension that the criticalExtensionHandler validates", async () => {
      const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
      const endEntity = await createCertificate("EE", "Root", keys[ee].publicKey, keys[root].privateKey, { ca: false, extensions: [unknownCriticalExtension()] });
      const seen: [string, pkijs.Certificate][] = [];

      const result = await verify(trustRoot, [endEntity], async (extension, certificate) => {
        seen.push([extension.extnID, certificate]);

        return extension.extnID === UNKNOWN_EXTENSION;
      });
      assert.isTrue(result.result, result.resultMessage);
      assert.deepEqual(seen, [[UNKNOWN_EXTENSION, endEntity]]);
    });

    it("rejects a critical extension that the criticalExtensionHandler does not validate", async () => {
      const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
      const endEntity = await createCertificate("EE", "Root", keys[ee].publicKey, keys[root].privateKey, { ca: false, extensions: [unknownCriticalExtension()] });

      const result = await verify(trustRoot, [endEntity], () => false);
      assert.isFalse(result.result);
      assert.equal(result.resultCode, 15);
    });

    for (const [label, extnID] of [
      ["NameConstraints", "2.5.29.30"],
      ["PolicyConstraints", "2.5.29.36"],
      ["InhibitAnyPolicy", "2.5.29.54"],
    ] as const) {
      for (const [kind, value] of [
        ["a wrong ASN.1 type", new asn1js.Null().toBER(false)],
        ["truncated BER", new Uint8Array([0x30, 0x05, 0x80]).buffer],
      ] as const) {
        for (const placement of ["intermediate", "end entity"]) {
          it(`rejects a malformed critical ${label} (${kind}, ${placement})`, async () => {
            const malformed = [new pkijs.Extension({ extnID, critical: true, extnValue: value })];
            const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
            const icaCert = await createCertificate("ICA", "Root", keys[ica].publicKey, keys[root].privateKey, {
              ca: true,
              extensions: placement === "intermediate" ? malformed : [],
            });
            const endEntity = await createCertificate("EE", "ICA", keys[ee].publicKey, keys[ica].privateKey, {
              ca: false,
              extensions: placement === "end entity" ? malformed : [],
            });

            const result = await verify(trustRoot, [icaCert, endEntity], () => true);
            assert.isFalse(result.result);
            // An intermediate whose extension does not decode at all already fails the CA check (14)
            assert.equal(result.resultCode, placement === "intermediate" && kind === "truncated BER" ? 14 : 6);
          });
        }
      }
    }
  });
});
