import { describe, it, assert, beforeAll } from "vitest";
import * as asn1js from "asn1js";
import * as pkijs from "./index";

const checkDate = new Date("2026-01-01T00:00:00Z");

const COMMON_NAME = "2.5.4.3";
const EMAIL_ADDRESS = "1.2.840.113549.1.9.1";

let serial = 1;

const attribute = (type: string, value: string) => new pkijs.AttributeTypeAndValue({ type, value: new asn1js.Utf8String({ value }) });
const name = (...values: string[]) => new pkijs.RelativeDistinguishedNames({ typesAndValues: values.map((value) => attribute(COMMON_NAME, value)) });

const dns = (value: string) => new pkijs.GeneralName({ type: 2, value });
const email = (value: string) => new pkijs.GeneralName({ type: 1, value });
const uri = (value: string) => new pkijs.GeneralName({ type: 6, value });
const ip = (...value: number[]) => new pkijs.GeneralName({ type: 7, value: new asn1js.OctetString({ valueHex: new Uint8Array(value).buffer }) });
const directory = (...values: string[]) => new pkijs.GeneralName({ type: 4, value: name(...values) });

const subjectAltName = (altNames: pkijs.GeneralName[]) => new pkijs.Extension({ extnID: "2.5.29.17", critical: false, extnValue: new pkijs.AltName({ altNames }).toSchema().toBER(false) });

interface Constraints {
  permitted?: pkijs.GeneralName[];
  excluded?: pkijs.GeneralName[];
}

const nameConstraints = ({ permitted, excluded }: Constraints) => {
  const subtrees = (names: pkijs.GeneralName[]) => names.map((base) => new pkijs.GeneralSubtree({ base }));
  const value = new pkijs.NameConstraints({
    ...(permitted ? { permittedSubtrees: subtrees(permitted) } : {}),
    ...(excluded ? { excludedSubtrees: subtrees(excluded) } : {}),
  });

  return new pkijs.Extension({ extnID: "2.5.29.30", critical: true, extnValue: value.toSchema().toBER(false) });
};

describe("CertificateChainValidationEngine name constraints", () => {
  let keys: CryptoKeyPair[];

  beforeAll(async () => {
    const crypto = pkijs.getCrypto(true);
    const generateKey = () => crypto.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]) as Promise<CryptoKeyPair>;
    keys = await Promise.all([generateKey(), generateKey(), generateKey(), generateKey()]);
  });

  async function createCertificate(
    subject: pkijs.RelativeDistinguishedNames,
    issuer: pkijs.RelativeDistinguishedNames,
    key: number,
    issuerKey: number,
    ca: boolean,
    extensions: pkijs.Extension[] = [],
  ) {
    const certificate = new pkijs.Certificate();
    certificate.version = 2;
    certificate.serialNumber = new asn1js.Integer({ value: serial++ });
    certificate.issuer = issuer;
    certificate.subject = subject;
    certificate.notBefore.value = new Date("2025-01-01T00:00:00Z");
    certificate.notAfter.value = new Date("2027-01-01T00:00:00Z");
    certificate.extensions = [new pkijs.Extension({ extnID: "2.5.29.19", critical: true, extnValue: new pkijs.BasicConstraints({ cA: ca }).toSchema().toBER(false) }), ...extensions];
    await certificate.subjectPublicKeyInfo.importKey(keys[key].publicKey);
    await certificate.sign(keys[issuerKey].privateKey, "SHA-256");

    return new pkijs.Certificate({ schema: certificate.toSchema() });
  }

  /** Root -> CA 1 -> CA 2 -> end entity */
  async function verify(constraints: [Constraints?, Constraints?], altNames: pkijs.GeneralName[], subject = name("EE")) {
    const [first, second] = constraints.map((o) => (o ? [nameConstraints(o)] : []));
    const root = await createCertificate(name("Root"), name("Root"), 0, 0, true);
    const ca1 = await createCertificate(name("CA 1"), name("Root"), 1, 0, true, first);
    const ca2 = await createCertificate(name("CA 2"), name("CA 1"), 2, 1, true, second);
    const endEntity = await createCertificate(subject, name("CA 2"), 3, 2, false, altNames.length > 0 ? [subjectAltName(altNames)] : []);

    return new pkijs.CertificateChainValidationEngine({ trustedCerts: [root], certs: [ca1, ca2, endEntity], checkDate }).verify();
  }

  for (const [form, inside, constraint, outside, otherConstraint] of [
    ["dNSName", dns("a.good.example"), dns("good.example"), dns("a.bad.example"), dns("bad.example")],
    ["rfc822Name", email("me@good.example"), email("good.example"), email("me@bad.example"), email("bad.example")],
    ["uniformResourceIdentifier", uri("https://good.example/x"), uri("good.example"), uri("https://bad.example/x"), uri("bad.example")],
    ["iPAddress", ip(10, 0, 0, 1), ip(10, 0, 0, 0, 255, 0, 0, 0), ip(192, 168, 0, 1), ip(192, 168, 0, 0, 255, 255, 0, 0)],
  ] as const) {
    describe(form, () => {
      it("accepts a permitted name", async () => {
        const result = await verify([{ permitted: [constraint] }], [inside]);
        assert.isTrue(result.result, result.resultMessage);
      });

      for (const [order, names] of [
        ["permitted name first", [inside, outside]],
        ["permitted name last", [outside, inside]],
      ] as const) {
        it(`rejects two names of which one is not permitted (${order})`, async () => {
          const result = await verify([{ permitted: [constraint] }], [...names]);
          assert.isFalse(result.result);
          assert.equal(result.resultCode, 41);
        });

        it(`rejects two names of which one is excluded (${order})`, async () => {
          const result = await verify([{ excluded: [constraint] }], [...names]);
          assert.isFalse(result.result);
          assert.equal(result.resultCode, 42);
        });
      }

      it("rejects a name that only the CA further down permits", async () => {
        const result = await verify([{ permitted: [constraint] }, { permitted: [otherConstraint] }], [outside]);
        assert.isFalse(result.result);
        assert.equal(result.resultCode, 41);
      });

      it("accepts names that different subtrees of one CA permit", async () => {
        const result = await verify([{ permitted: [constraint, otherConstraint] }], [inside, outside]);
        assert.isTrue(result.result, result.resultMessage);
      });
    });
  }

  it("does not restrict names of other forms", async () => {
    const result = await verify([{ permitted: [dns("good.example")] }], [email("me@bad.example")]);
    assert.isTrue(result.result, result.resultMessage);
  });

  describe("directoryName", () => {
    it("checks the directory names of the SubjectAltName too", async () => {
      const constraints: Constraints = { permitted: [directory("A")] };
      const root = await createCertificate(name("Root"), name("Root"), 0, 0, true);
      const ca = await createCertificate(name("A", "CA"), name("Root"), 1, 0, true, [nameConstraints(constraints)]);
      const verifyNames = async (altNames: pkijs.GeneralName[]) => {
        const endEntity = await createCertificate(name("A", "EE"), name("A", "CA"), 2, 1, false, [subjectAltName(altNames)]);

        return new pkijs.CertificateChainValidationEngine({ trustedCerts: [root], certs: [ca, endEntity], checkDate }).verify();
      };

      const good = await verifyNames([directory("A", "x")]);
      assert.isTrue(good.result, good.resultMessage);
      const bad = await verifyNames([directory("A", "x"), directory("B")]);
      assert.isFalse(bad.result);
      assert.equal(bad.resultCode, 41);
    });

    it("compares from the start of the name", async () => {
      const result = await verify([{ excluded: [directory("A")] }], [], name("B", "A"));
      assert.isTrue(result.result, result.resultMessage);
    });

    it("accepts a certificate without a subject", async () => {
      const result = await verify([{ excluded: [directory("A")] }], [dns("a.example")], name());
      assert.isTrue(result.result, result.resultMessage);
    });
  });

  describe("e-mail address of the subject", () => {
    const subject = new pkijs.RelativeDistinguishedNames({ typesAndValues: [attribute(COMMON_NAME, "EE"), attribute(EMAIL_ADDRESS, "me@bad.example")] });

    it("must not be excluded when there is no SubjectAltName", async () => {
      const result = await verify([{ excluded: [email("bad.example")] }], [], subject);
      assert.isFalse(result.result);
      assert.equal(result.resultCode, 42);
    });

    it("must be permitted when there is no SubjectAltName", async () => {
      const result = await verify([{ permitted: [email("good.example")] }], [], subject);
      assert.isFalse(result.result);
      assert.equal(result.resultCode, 41);
    });
  });
});
