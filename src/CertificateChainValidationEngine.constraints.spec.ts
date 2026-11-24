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

  const verify = (trustRoot: pkijs.Certificate | pkijs.Certificate[], certs: pkijs.Certificate[], validationPolicy?: pkijs.CertificateChainValidationPolicy) =>
    new pkijs.CertificateChainValidationEngine({
      trustedCerts: Array.isArray(trustRoot) ? trustRoot : [trustRoot],
      certs,
      checkDate,
      validationPolicy,
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

    for (const [label, validationPolicy, valid] of [
      ["does not apply it by default", undefined, true],
      ["does not apply it when the policy says so", { enforceTrustAnchorPathLenConstraint: false }, true],
      ["applies it when the policy says so", { enforceTrustAnchorPathLenConstraint: true }, false],
    ] as const) {
      it(`the pathLenConstraint of the trust anchor: ${label}`, async () => {
        const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true, pathLenConstraint: 0 });
        const icaCert = await createCertificate("ICA", "Root", keys[ica].publicKey, keys[root].privateKey, { ca: true });
        const endEntity = await createCertificate("EE", "ICA", keys[ee].publicKey, keys[ica].privateKey, { ca: false });

        const result = await verify(trustRoot, [icaCert, endEntity], validationPolicy);
        assert.equal(result.result, valid, result.resultMessage);
        if (!valid) {
          assert.equal(result.resultCode, 16);
        }
      });
    }

    it("accepts a path as long as the trust anchor's pathLenConstraint", async () => {
      const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true, pathLenConstraint: 1 });
      const icaCert = await createCertificate("ICA", "Root", keys[ica].publicKey, keys[root].privateKey, { ca: true });
      const endEntity = await createCertificate("EE", "ICA", keys[ee].publicKey, keys[ica].privateKey, { ca: false });

      const result = await verify(trustRoot, [icaCert, endEntity], { enforceTrustAnchorPathLenConstraint: true });
      assert.isTrue(result.result, result.resultMessage);
    });

    it("applies the pathLenConstraint of an intermediate whatever the policy says about the trust anchor", async () => {
      const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
      const ica0 = await createCertificate("ICA0", "Root", keys[ica].publicKey, keys[root].privateKey, { ca: true, pathLenConstraint: 0 });
      const subCaCert = await createCertificate("SubCA", "ICA0", keys[subCa].publicKey, keys[ica].privateKey, { ca: true });
      const endEntity = await createCertificate("EE", "SubCA", keys[ee].publicKey, keys[subCa].privateKey, { ca: false });

      const result = await verify(trustRoot, [ica0, subCaCert, endEntity], { enforceTrustAnchorPathLenConstraint: false, criticalExtensionHandler: () => true });
      assert.isFalse(result.result);
      assert.equal(result.resultCode, 16);
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
          const result = await verify(roots, [...icas, endEntity], { enforceTrustAnchorPathLenConstraint: true });
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

        const result = await verify([rootA0, rootB0], [icaByA, icaByB, endEntity], { enforceTrustAnchorPathLenConstraint: true });
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

      const result = await verify(trustRoot, [endEntity], {
        criticalExtensionHandler: async (extension, certificate) => {
          seen.push([extension.extnID, certificate]);

          return extension.extnID === UNKNOWN_EXTENSION;
        },
      });
      assert.isTrue(result.result, result.resultMessage);
      assert.deepEqual(seen, [[UNKNOWN_EXTENSION, endEntity]]);
    });

    it("rejects a critical extension that the criticalExtensionHandler does not validate", async () => {
      const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
      const endEntity = await createCertificate("EE", "Root", keys[ee].publicKey, keys[root].privateKey, { ca: false, extensions: [unknownCriticalExtension()] });

      const result = await verify(trustRoot, [endEntity], { criticalExtensionHandler: () => false });
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

            const result = await verify(trustRoot, [icaCert, endEntity], { criticalExtensionHandler: () => true });
            assert.isFalse(result.result);
            // An intermediate whose extension does not decode at all already fails the CA check (14)
            assert.equal(result.resultCode, placement === "intermediate" && kind === "truncated BER" ? 14 : 6);
          });
        }
      }
    }
  });

  describe("duplicate extensions", () => {
    const [root, ica, subCa, ee] = [0, 1, 2, 3];
    const basicConstraints = (pathLenConstraint?: number) =>
      new pkijs.Extension({
        extnID: "2.5.29.19",
        critical: true,
        extnValue: new pkijs.BasicConstraints({ cA: true, pathLenConstraint }).toSchema().toBER(false),
      });

    for (const [label, first, second] of [
      ["restrictive first", 0, 5],
      ["restrictive last", 5, 0],
    ] as const) {
      it(`rejects conflicting BasicConstraints (${label})`, async () => {
        const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
        const icaCert = await createCertificate("ICA", "Root", keys[ica].publicKey, keys[root].privateKey, {
          ca: true,
          pathLenConstraint: first,
          extensions: [basicConstraints(second)],
        });
        const subCaCert = await createCertificate("SubCA", "ICA", keys[subCa].publicKey, keys[ica].privateKey, { ca: true });
        const endEntity = await createCertificate("EE", "SubCA", keys[ee].publicKey, keys[subCa].privateKey, { ca: false });

        const result = await verify(trustRoot, [icaCert, subCaCert, endEntity]);
        assert.isFalse(result.result);
        assert.equal(result.resultCode, 17);
        assert.equal(result.resultMessage, "Certificate extension is present more than once: 2.5.29.19");
      });

      it(`rejects conflicting BasicConstraints of a trust anchor whose limit is applied (${label})`, async () => {
        const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, {
          ca: true,
          pathLenConstraint: first,
          extensions: [basicConstraints(second)],
        });
        const icaCert = await createCertificate("ICA", "Root", keys[ica].publicKey, keys[root].privateKey, { ca: true });
        const endEntity = await createCertificate("EE", "ICA", keys[ee].publicKey, keys[ica].privateKey, { ca: false });

        const result = await verify(trustRoot, [icaCert, endEntity], { enforceTrustAnchorPathLenConstraint: true });
        assert.isFalse(result.result);
        assert.equal(result.resultCode, 17);
      });
    }

    it("rejects a non-critical extension that an end entity has twice", async () => {
      const extension = () => new pkijs.Extension({ extnID: UNKNOWN_EXTENSION, critical: false, extnValue: new asn1js.Null().toBER(false) });
      const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
      const endEntity = await createCertificate("EE", "Root", keys[ee].publicKey, keys[root].privateKey, { ca: false, extensions: [extension(), extension()] });

      const result = await verify(trustRoot, [endEntity]);
      assert.isFalse(result.result);
      assert.equal(result.resultCode, 17);
    });
  });

  describe("values of critical policy constraints", () => {
    const [root, ica, subCa, ee] = [0, 1, 2, 3];
    const inhibitAnyPolicy = (value: asn1js.Integer) => new pkijs.Extension({ extnID: "2.5.29.54", critical: true, extnValue: value.toBER(false) });
    const policyConstraints = (tagNumber: number, content: Uint8Array) =>
      new pkijs.Extension({
        extnID: "2.5.29.36",
        critical: true,
        extnValue: new asn1js.Sequence({
          value: [new asn1js.Primitive({ idBlock: { tagClass: 3, tagNumber }, valueHex: content })],
        }).toBER(false),
      });
    const big = new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0]); // 2^64

    const verifyWith = async (extension: pkijs.Extension) => {
      const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
      const icaCert = await createCertificate("ICA", "Root", keys[ica].publicKey, keys[root].privateKey, { ca: true, extensions: [extension] });
      const subCaCert = await createCertificate("SubCA", "ICA", keys[subCa].publicKey, keys[ica].privateKey, { ca: true });
      const endEntity = await createCertificate("EE", "SubCA", keys[ee].publicKey, keys[subCa].privateKey, { ca: false });

      return verify(trustRoot, [icaCert, subCaCert, endEntity]);
    };

    for (const [label, extension] of [
      ["a negative InhibitAnyPolicy", () => inhibitAnyPolicy(new asn1js.Integer({ value: -1 }))],
      ["a large negative InhibitAnyPolicy", () => inhibitAnyPolicy(asn1js.Integer.fromBigInt(-(BigInt(2) ** BigInt(64))))],
      ["a negative requireExplicitPolicy", () => policyConstraints(0, new Uint8Array([0xff]))],
      ["a negative inhibitPolicyMapping", () => policyConstraints(1, new Uint8Array([0xff]))],
      ["an empty requireExplicitPolicy", () => policyConstraints(0, new Uint8Array())],
    ] as const) {
      it(`rejects ${label}`, async () => {
        const result = await verifyWith(extension());
        assert.isFalse(result.result);
        assert.equal(result.resultCode, 6);
      });
    }

    for (const [label, extension] of [
      ["InhibitAnyPolicy", () => inhibitAnyPolicy(asn1js.Integer.fromBigInt(BigInt(2) ** BigInt(64)))],
      ["requireExplicitPolicy", () => policyConstraints(0, big)],
      ["inhibitPolicyMapping", () => policyConstraints(1, big)],
    ] as const) {
      it(`accepts a large ${label}, which no path reaches`, async () => {
        const result = await verifyWith(extension());
        assert.isTrue(result.result, result.resultMessage);
      });
    }

    it("applies requireExplicitPolicy 0", async () => {
      const result = await verifyWith(policyConstraints(0, new Uint8Array([0])));
      assert.isFalse(result.result);
      assert.isTrue(result.explicitPolicyIndicator);
    });

    it("applies a requireExplicitPolicy below a PolicyConstraints that only has inhibitPolicyMapping", async () => {
      const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
      const icaCert = await createCertificate("ICA", "Root", keys[ica].publicKey, keys[root].privateKey, { ca: true, extensions: [policyConstraints(1, new Uint8Array([5]))] });
      const subCaCert = await createCertificate("SubCA", "ICA", keys[subCa].publicKey, keys[ica].privateKey, { ca: true, extensions: [policyConstraints(0, new Uint8Array([1]))] });
      const endEntity = await createCertificate("EE", "SubCA", keys[ee].publicKey, keys[subCa].privateKey, { ca: false });

      const result = await verify(trustRoot, [icaCert, subCaCert, endEntity]);
      assert.isFalse(result.result);
      assert.isTrue(result.explicitPolicyIndicator);
    });
  });

  describe("critical name constraints that the engine does not check", () => {
    const [root, ica, subCa, ee] = [0, 1, 2, 3];
    const registeredId = (value: string) => new pkijs.GeneralName({ type: 8, value });
    const dnsName = (value: string) => new pkijs.GeneralName({ type: 2, value });
    const nameConstraints = (kind: "permittedSubtrees" | "excludedSubtrees", subtree: pkijs.GeneralSubtreeParameters, critical = true) =>
      new pkijs.Extension({
        extnID: "2.5.29.30",
        critical,
        extnValue: new pkijs.NameConstraints({ [kind]: [new pkijs.GeneralSubtree(subtree)] }).toSchema().toBER(false),
      });
    const subjectAltName = (...altNames: pkijs.GeneralName[]) => new pkijs.Extension({ extnID: "2.5.29.17", critical: false, extnValue: new pkijs.AltName({ altNames }).toSchema().toBER(false) });

    const verifyWith = async (constraint: pkijs.Extension, names: pkijs.GeneralName[]) => {
      const trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true });
      const icaCert = await createCertificate("ICA", "Root", keys[ica].publicKey, keys[root].privateKey, { ca: true, extensions: [constraint] });
      const subCaCert = await createCertificate("SubCA", "ICA", keys[subCa].publicKey, keys[ica].privateKey, { ca: true });
      const endEntity = await createCertificate("EE", "SubCA", keys[ee].publicKey, keys[subCa].privateKey, { ca: false, extensions: [subjectAltName(...names)] });

      return verify(trustRoot, [icaCert, subCaCert, endEntity]);
    };

    for (const kind of ["permittedSubtrees", "excludedSubtrees"] as const) {
      it(`rejects a name of a form that ${kind} restricts and the engine does not check`, async () => {
        const result = await verifyWith(nameConstraints(kind, { base: registeredId("1.2.3") }), [dnsName("a.example"), registeredId("1.2.4")]);
        assert.isFalse(result.result);
        assert.equal(result.resultCode, 18);
      });

      it(`accepts names of other forms below ${kind} of a form that the engine does not check`, async () => {
        const result = await verifyWith(nameConstraints(kind, { base: registeredId("1.2.3") }), [dnsName("a.example")]);
        assert.isTrue(result.result, result.resultMessage);
      });

      it(`accepts a non-critical ${kind} of a form that the engine does not check`, async () => {
        const result = await verifyWith(nameConstraints(kind, { base: registeredId("1.2.3") }, false), [registeredId("1.2.4")]);
        assert.isTrue(result.result, result.resultMessage);
      });

      it(`rejects a minimum other than 0 in ${kind}`, async () => {
        const result = await verifyWith(nameConstraints(kind, { base: dnsName("example"), minimum: 1 }), [dnsName("a.example")]);
        assert.isFalse(result.result);
        assert.equal(result.resultCode, 6);
      });

      it(`rejects a maximum in ${kind}`, async () => {
        const result = await verifyWith(nameConstraints(kind, { base: dnsName("example"), maximum: 1 }), [dnsName("a.example")]);
        assert.isFalse(result.result);
        assert.equal(result.resultCode, 6);
      });
    }

    it("still checks the name forms it knows", async () => {
      const constraint = () => nameConstraints("permittedSubtrees", { base: dnsName("example") });
      const good = await verifyWith(constraint(), [dnsName("a.example")]);
      assert.isTrue(good.result, good.resultMessage);
      const bad = await verifyWith(constraint(), [dnsName("a.test")]);
      assert.isFalse(bad.result);
      assert.equal(bad.resultCode, 41);
    });
  });

  describe("validation policy of other APIs", () => {
    const [root, ica, , ee] = [0, 1, 2, 3];
    const data = new Uint8Array([1, 2, 3]).buffer;
    let trustRoot: pkijs.Certificate;
    let icaCert: pkijs.Certificate;
    let plain: pkijs.Certificate;
    let withCritical: pkijs.Certificate;

    beforeAll(async () => {
      trustRoot = await createCertificate("Root", "Root", keys[root].publicKey, keys[root].privateKey, { ca: true, pathLenConstraint: 0 });
      icaCert = await createCertificate("ICA", "Root", keys[ica].publicKey, keys[root].privateKey, { ca: true });
      plain = await createCertificate("EE", "ICA", keys[ee].publicKey, keys[ica].privateKey, { ca: false });
      withCritical = await createCertificate("EE", "ICA", keys[ee].publicKey, keys[ica].privateKey, { ca: false, extensions: [unknownCriticalExtension()] });
    });

    const sign = async (signer: pkijs.Certificate, eContentType: string, eContent: ArrayBuffer) => {
      const signedData = new pkijs.SignedData({
        version: 3,
        encapContentInfo: new pkijs.EncapsulatedContentInfo({ eContentType, eContent: new asn1js.OctetString({ valueHex: eContent }) }),
        signerInfos: [
          new pkijs.SignerInfo({
            version: 1,
            sid: new pkijs.IssuerAndSerialNumber({ issuer: signer.issuer, serialNumber: signer.serialNumber }),
          }),
        ],
        certificates: [signer, icaCert],
      });
      await signedData.sign(keys[ee].privateKey, 0, "SHA-256");

      return signedData;
    };

    const apis: [string, (signer: pkijs.Certificate, validationPolicy?: pkijs.CertificateChainValidationPolicy) => Promise<boolean>][] = [
      [
        "SignedData",
        async (signer, validationPolicy) => {
          const signedData = await sign(signer, pkijs.ContentInfo.DATA, data);

          return signedData.verify({ signer: 0, trustedCerts: [trustRoot], checkDate, checkChain: true, validationPolicy });
        },
      ],
      [
        "TimeStampResp",
        async (signer, validationPolicy) => {
          const tstInfo = new pkijs.TSTInfo({
            version: 1,
            policy: "1.2.3.4.1",
            messageImprint: await pkijs.MessageImprint.create("SHA-256", data),
            serialNumber: new asn1js.Integer({ value: 1 }),
            genTime: checkDate,
          });
          const signedData = await sign(signer, pkijs.id_eContentType_TSTInfo, tstInfo.toSchema().toBER(false));
          const response = new pkijs.TimeStampResp({
            status: new pkijs.PKIStatusInfo({ status: pkijs.PKIStatus.granted }),
            timeStampToken: new pkijs.ContentInfo({ contentType: pkijs.ContentInfo.SIGNED_DATA, content: signedData.toSchema(true) }),
          });

          return response.verify({ signer: 0, data, trustedCerts: [trustRoot], checkChain: true, validationPolicy });
        },
      ],
      ["BasicOCSPResponse", async (signer, validationPolicy) => (await ocspResponse(signer)).verify({ trustedCerts: [trustRoot], validationPolicy })],
      [
        "OCSPResponse",
        async (signer, validationPolicy) => {
          const basic = await ocspResponse(signer);
          const response = new pkijs.OCSPResponse({
            responseStatus: new asn1js.Enumerated({ value: 0 }),
            responseBytes: new pkijs.ResponseBytes({
              responseType: pkijs.id_PKIX_OCSP_Basic,
              response: new asn1js.OctetString({ valueHex: basic.toSchema().toBER(false) }),
            }),
          });

          return response.verify(null, undefined, { trustedCerts: [trustRoot], validationPolicy });
        },
      ],
    ];

    // An OCSP responder delegated by ICA
    const ocspResponse = async (signer: pkijs.Certificate) => {
      const extensions = [
        new pkijs.Extension({ extnID: "2.5.29.37", critical: false, extnValue: new pkijs.ExtKeyUsage({ keyPurposes: ["1.3.6.1.5.5.7.3.9"] }).toSchema().toBER(false) }),
        ...(signer === withCritical ? [unknownCriticalExtension()] : []),
      ];
      const responder = await createCertificate("Responder", "ICA", keys[ee].publicKey, keys[ica].privateKey, { ca: false, extensions });
      const response = new pkijs.BasicOCSPResponse();
      response.tbsResponseData.responderID = responder.subject;
      response.tbsResponseData.producedAt = checkDate;
      const certID = new pkijs.CertID();
      await certID.createForCertificate(plain, { hashAlgorithm: "SHA-256", issuerCertificate: icaCert });
      response.tbsResponseData.responses.push(new pkijs.SingleResponse({ certID, certStatus: new asn1js.Primitive({ idBlock: { tagClass: 3, tagNumber: 0 } }), thisUpdate: checkDate }));
      response.certs = [responder, icaCert];
      await response.sign(keys[ee].privateKey, "SHA-256");

      return pkijs.BasicOCSPResponse.fromBER(response.toSchema().toBER(false));
    };

    const outcome = async (run: () => Promise<boolean>) => {
      try {
        return (await run()) ? "valid" : "invalid";
      } catch (e) {
        return (e as Error).message;
      }
    };

    for (const [label, verifyApi] of apis) {
      it(`${label}: the limit of the trust anchor is applied only when the policy says so`, async () => {
        assert.equal(await outcome(() => verifyApi(plain)), "valid");
        assert.include(await outcome(() => verifyApi(plain, { enforceTrustAnchorPathLenConstraint: true })), "pathLenConstraint");
      });

      it(`${label}: a critical extension is accepted only by the handler of the policy`, async () => {
        assert.include(await outcome(() => verifyApi(withCritical)), "Unrecognized critical certificate extension");
        assert.include(await outcome(() => verifyApi(withCritical, { criticalExtensionHandler: () => false })), "Unrecognized critical certificate extension");
        assert.equal(await outcome(() => verifyApi(withCritical, { criticalExtensionHandler: ({ extnID }) => extnID === UNKNOWN_EXTENSION })), "valid");
      });
    }
  });
});
