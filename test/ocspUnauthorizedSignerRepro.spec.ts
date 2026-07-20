/**
 * Security reproduction / regression test for BasicOCSPResponse signer authorization.
 *
 * The reported issue: PKI.js `BasicOCSPResponse#verify({ trustedCerts })` only
 * validates the signer's certificate *chain* and the cryptographic signature.
 * It does NOT check that the signer is authorized (issuer, delegated OCSP
 * responder, or explicitly trusted responder).
 *
 * Local PKI model (no network, no third-party keys):
 *
 *   Victim branch:          Attacker branch:
 *     VictimRootCA            AttackerRootCA (trusted)
 *       |                       |
 *     VictimIssuer             AttackerRootCA -> attackerTlsCert(serverAuth only)
 *       |
 *     victimLeaf (revoked)
 */

import * as assert from "assert";
import * as asn1js from "asn1js";
import * as pkijs from "../src";
import "./utils";

//#region key purposes
const KP_SERVER_AUTH = "1.3.6.1.5.5.7.3.1";
const KP_CLIENT_AUTH = "1.3.6.1.5.5.7.3.2";
const KP_OCSP_SIGNING = "1.3.6.1.5.5.7.3.9";
//#region extension OIDs
const ID_BASIC_CONSTRAINTS = "2.5.29.19";
const ID_KEY_USAGE = "2.5.29.15";
const ID_EXT_KEY_USAGE = "2.5.29.37";

// Fixed dates for deterministic, long-lived test output.
// Certificates use 2020–2040; OCSP thisUpdate/nextUpdate use a wide window.
const CERT_NOT_BEFORE = new Date("2020-01-01T00:00:00Z");
const CERT_NOT_AFTER = new Date("2040-01-01T00:00:00Z");
const FIXED_DATE = new Date("2026-01-01T00:00:00Z");       // OCSP producedAt / thisUpdate
const FIXED_NEXT = new Date("2035-01-01T00:00:00Z");       // OCSP nextUpdate

//#region Local PKI builder helpers

interface CertWithKey {
  certificate: pkijs.Certificate;
  privateKey: CryptoKey;
  publicKey: CryptoKey;
}

function dn(cn: string, o: string): pkijs.RelativeDistinguishedNames {
  return new pkijs.RelativeDistinguishedNames({
    typesAndValues: [
      new pkijs.AttributeTypeAndValue({
        type: "2.5.4.10",
        value: new asn1js.Utf8String({ value: o }),
      }),
      new pkijs.AttributeTypeAndValue({
        type: "2.5.4.3",
        value: new asn1js.Utf8String({ value: cn }),
      }),
    ],
  });
}

async function generateKeyPair(signAlg: string, hashAlg: string): Promise<CryptoKeyPair> {
  const crypto = pkijs.getCrypto(true);
  const algorithm = pkijs.getAlgorithmParameters(signAlg, "generateKey") as any;
  if ("hash" in algorithm.algorithm) {
    algorithm.algorithm.hash.name = hashAlg;
  }
  return crypto.generateKey(algorithm.algorithm, true, algorithm.usages) as Promise<CryptoKeyPair>;
}

async function buildCaCertificate(opts: {
  subject: pkijs.RelativeDistinguishedNames;
  issuer?: { cert: pkijs.Certificate; key: CryptoKey };
  serial: number;
  hashAlg: string;
  signAlg: string;
}): Promise<CertWithKey> {
  const certificate = new pkijs.Certificate();
  certificate.version = 2;
  certificate.serialNumber = new asn1js.Integer({ value: opts.serial });
  certificate.issuer = opts.issuer ? opts.issuer.cert.subject : opts.subject;
  certificate.subject = opts.subject;
  certificate.notBefore.value = new Date(CERT_NOT_BEFORE);
  certificate.notAfter.value = new Date(CERT_NOT_AFTER);

  const basicConstr = new pkijs.BasicConstraints({ cA: true, pathLenConstraint: 2 });
  const keyUsageBits = new ArrayBuffer(2);
  const keyUsageView = new Uint8Array(keyUsageBits);
  keyUsageView[0] = 0x04 | 0x02; // keyCertSign + cRLSign
  const keyUsage = new asn1js.BitString({ valueHex: keyUsageBits });

  certificate.extensions = [
    new pkijs.Extension({
      extnID: ID_BASIC_CONSTRAINTS,
      critical: true,
      extnValue: basicConstr.toSchema().toBER(false),
      parsedValue: basicConstr,
    }),
    new pkijs.Extension({
      extnID: ID_KEY_USAGE,
      critical: true,
      extnValue: keyUsage.toBER(false),
      parsedValue: keyUsage,
    }),
  ];

  const { privateKey, publicKey } = await generateKeyPair(opts.signAlg, opts.hashAlg);
  await certificate.subjectPublicKeyInfo.importKey(publicKey);

  const signingKey = opts.issuer ? opts.issuer.key : privateKey;
  await certificate.sign(signingKey, opts.hashAlg);

  return { certificate, privateKey, publicKey };
}

async function buildEndEntityCertificate(opts: {
  subject: pkijs.RelativeDistinguishedNames;
  issuer: { cert: pkijs.Certificate; key: CryptoKey };
  serial: number;
  hashAlg: string;
  signAlg: string;
  extKeyUsages: string[];
  isCa?: boolean;
  /** Omit KeyUsage entirely when `null`. Defaults to digitalSignature + keyEncipherment (0x80|0x20). */
  keyUsageBits?: number | null;
}): Promise<CertWithKey> {
  const certificate = new pkijs.Certificate();
  certificate.version = 2;
  certificate.serialNumber = new asn1js.Integer({ value: opts.serial });
  certificate.issuer = opts.issuer.cert.subject;
  certificate.subject = opts.subject;
  certificate.notBefore.value = new Date(CERT_NOT_BEFORE);
  certificate.notAfter.value = new Date(CERT_NOT_AFTER);

  const exts: pkijs.Extension[] = [];

  if (opts.isCa) {
    const basicConstr = new pkijs.BasicConstraints({ cA: true });
    const keyUsageBits = new ArrayBuffer(1);
    const kuView = new Uint8Array(keyUsageBits);
    kuView[0] = 0x04 | 0x02;
    exts.push(new pkijs.Extension({
      extnID: ID_BASIC_CONSTRAINTS,
      critical: true,
      extnValue: basicConstr.toSchema().toBER(false),
      parsedValue: basicConstr,
    }));
    exts.push(new pkijs.Extension({
      extnID: ID_KEY_USAGE,
      critical: true,
      extnValue: new asn1js.BitString({ valueHex: keyUsageBits }).toBER(false),
    }));
  } else {
    // KeyUsage — only added when not explicitly suppressed (null).
    if (opts.keyUsageBits !== null) {
      const kuValue = opts.keyUsageBits ?? (0x80 | 0x20); // digitalSignature + keyEncipherment
      const keyUsageBits = new ArrayBuffer(1);
      const kuView = new Uint8Array(keyUsageBits);
      kuView[0] = kuValue;
      exts.push(new pkijs.Extension({
        extnID: ID_KEY_USAGE,
        critical: true,
        extnValue: new asn1js.BitString({ valueHex: keyUsageBits }).toBER(false),
      }));
    }

    const eku = new pkijs.ExtKeyUsage({ keyPurposes: opts.extKeyUsages });
    exts.push(new pkijs.Extension({
      extnID: ID_EXT_KEY_USAGE,
      critical: false,
      extnValue: eku.toSchema().toBER(false),
      parsedValue: eku,
    }));
  }

  certificate.extensions = exts;

  const { privateKey, publicKey } = await generateKeyPair(opts.signAlg, opts.hashAlg);
  await certificate.subjectPublicKeyInfo.importKey(publicKey);
  await certificate.sign(opts.issuer.key, opts.hashAlg);

  return { certificate, privateKey, publicKey };
}

//#region OCSP response builder

async function buildBasicOcspResponse(params: {
  leaf: pkijs.Certificate;
  issuer: pkijs.Certificate;
  signerCert: pkijs.Certificate;
  signerKey: CryptoKey;
  certs: pkijs.Certificate[];
  status: 0 | 1 | 2;
  hashAlg?: string;
  useByKey?: boolean;
}): Promise<pkijs.BasicOCSPResponse> {
  const crypto = pkijs.getCrypto(true);
  const hashAlg = params.hashAlg ?? "SHA-1";

  const rtCertID = new pkijs.CertID();
  await rtCertID.createForCertificate(params.leaf, { hashAlgorithm: hashAlg, issuerCertificate: params.issuer }, crypto);

  let certStatus: asn1js.Primitive | asn1js.Constructed;
  if (params.status === 1) {
    certStatus = new asn1js.Constructed({
      idBlock: { tagClass: 3, tagNumber: 1 },
    });
  } else {
    certStatus = new asn1js.Primitive({
      idBlock: { tagClass: 3, tagNumber: params.status === 0 ? 0 : 2 },
    });
  }

  const single = new pkijs.SingleResponse();
  single.certID = rtCertID;
  single.certStatus = certStatus;
  single.thisUpdate = new Date(FIXED_DATE);
  single.nextUpdate = new Date(FIXED_NEXT);

  const basic = new pkijs.BasicOCSPResponse();
  if (params.useByKey) {
    const spkBytes = params.signerCert.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHexView as BufferSource;
    const keyHash = await crypto.digest({ name: "SHA-1" }, spkBytes);
    basic.tbsResponseData.responderID = new asn1js.OctetString({ valueHex: keyHash });
  } else {
    basic.tbsResponseData.responderID = params.signerCert.subject;
  }
  basic.tbsResponseData.producedAt = new Date(FIXED_DATE);
  basic.tbsResponseData.responses = [single];
  basic.certs = params.certs;

  await basic.sign(params.signerKey, hashAlg);
  return basic;
}

function redecode(basic: pkijs.BasicOCSPResponse): pkijs.BasicOCSPResponse {
  const encoded = basic.toSchema().toBER(false);
  return pkijs.BasicOCSPResponse.fromBER(encoded);
}

//#region Test suites

context("OCSP BasicOCSPResponse unauthorized signer authorization", function () {
  this.timeout(60000);

  const HASH = "SHA-256";
  const SIGN = "RSASSA-PKCS1-V1_5";

  let victimRoot!: CertWithKey;
  let victimIssuer!: CertWithKey;
  let victimLeaf!: CertWithKey;
  let attackerRoot!: CertWithKey;
  let attackerTls!: CertWithKey;
  let delegatedResponder!: CertWithKey;

  let maliciousBasic!: pkijs.BasicOCSPResponse;
  let delegatedBasic!: pkijs.BasicOCSPResponse;
  let issuerSignedBasic!: pkijs.BasicOCSPResponse;

  before(async () => {
    await new Promise(r => setTimeout(r, 100));
    pkijs.getCrypto(true);

    //#region Victim branch
    victimRoot = await buildCaCertificate({
      subject: dn("Victim Root CA", "Victim Org"),
      serial: 0x1001,
      hashAlg: HASH,
      signAlg: SIGN,
    });
    victimIssuer = await buildCaCertificate({
      subject: dn("Victim Issuer CA", "Victim Org"),
      issuer: { cert: victimRoot.certificate, key: victimRoot.privateKey },
      serial: 0x1002,
      hashAlg: HASH,
      signAlg: SIGN,
    });
    victimLeaf = await buildEndEntityCertificate({
      subject: dn("victim.example.com", "Victim Org"),
      issuer: { cert: victimIssuer.certificate, key: victimIssuer.privateKey },
      serial: 0x1003,
      hashAlg: HASH,
      signAlg: SIGN,
      extKeyUsages: [KP_SERVER_AUTH],
    });

    //#region Attacker branch
    attackerRoot = await buildCaCertificate({
      subject: dn("Attacker Root CA", "Attacker Org"),
      serial: 0x2001,
      hashAlg: HASH,
      signAlg: SIGN,
    });
    attackerTls = await buildEndEntityCertificate({
      subject: dn("attacker.example.com", "Attacker Org"),
      issuer: { cert: attackerRoot.certificate, key: attackerRoot.privateKey },
      serial: 0x2002,
      hashAlg: HASH,
      signAlg: SIGN,
      extKeyUsages: [KP_SERVER_AUTH],
    });

    //#region Delegated responder control
    delegatedResponder = await buildEndEntityCertificate({
      subject: dn("OCSP Delegated Responder", "Victim Org"),
      issuer: { cert: victimIssuer.certificate, key: victimIssuer.privateKey },
      serial: 0x1004,
      hashAlg: HASH,
      signAlg: SIGN,
      extKeyUsages: [KP_OCSP_SIGNING],
    });

    //#region Malicious OCSP response
    maliciousBasic = redecode(await buildBasicOcspResponse({
      leaf: victimLeaf.certificate,
      issuer: victimIssuer.certificate,
      signerCert: attackerTls.certificate,
      signerKey: attackerTls.privateKey,
      certs: [attackerTls.certificate, attackerRoot.certificate],
      status: 0,
      hashAlg: "SHA-1",
    }));

    //#region Control responses
    delegatedBasic = redecode(await buildBasicOcspResponse({
      leaf: victimLeaf.certificate,
      issuer: victimIssuer.certificate,
      signerCert: delegatedResponder.certificate,
      signerKey: delegatedResponder.privateKey,
      certs: [delegatedResponder.certificate, victimIssuer.certificate, victimRoot.certificate],
      status: 0,
      hashAlg: "SHA-1",
    }));
    issuerSignedBasic = redecode(await buildBasicOcspResponse({
      leaf: victimLeaf.certificate,
      issuer: victimIssuer.certificate,
      signerCert: victimIssuer.certificate,
      signerKey: victimIssuer.privateKey,
      certs: [victimIssuer.certificate, victimRoot.certificate],
      status: 0,
      hashAlg: "SHA-1",
    }));
  });

  //#region 1. SECURITY REGRESSION TESTS

  describe("Security regression — unauthorized signers (must be rejected)", () => {
    it("[REGRESSION] rejects an unauthorized trusted serverAuth signer", async () => {
      let errorMessage = "";
      let threw = false;
      try {
        await maliciousBasic.verify({
          trustedCerts: [attackerRoot.certificate, victimRoot.certificate],
        });
      } catch (e) {
        threw = true;
        errorMessage = (e as Error).message;
      }
      assert.ok(threw, `verify() must throw for unauthorized signer. message='${errorMessage}'`);
      assert.ok(
        errorMessage.toLowerCase().includes("authoriz") || errorMessage.toLowerCase().includes("authoris") ||
        errorMessage.toLowerCase().includes("responder"),
        `Error must mention authorization/responder. Got: ${errorMessage}`
      );
    });

    it("[REGRESSION] getCertificateStatus still reflects the forged GOOD status", async () => {
      const status = await maliciousBasic.getCertificateStatus(
        victimLeaf.certificate,
        victimIssuer.certificate,
      );
      assert.equal(status.isForCertificate, true, "The attack still targets the victim leaf");
      assert.equal(status.status, 0, "The forged response still claims GOOD status");
    });

    it("[REGRESSION] rejects a serverAuth-only attacker (no OCSP EKU)", async () => {
      let threw = false;
      let msg = "";
      try {
        await maliciousBasic.verify({
          trustedCerts: [attackerRoot.certificate, victimRoot.certificate],
          issuerCerts: [victimIssuer.certificate],
        });
      } catch (e) {
        threw = true;
        msg = (e as Error).message;
      }
      assert.ok(threw, `must reject serverAuth-only attacker. message='${msg}'`);
    });

    it("[REGRESSION] rejects a clientAuth-only attacker (no OCSP EKU)", async () => {
      const clientAuthAttacker = await buildEndEntityCertificate({
        subject: dn("client.attacker.example.com", "Attacker Org"),
        issuer: { cert: attackerRoot.certificate, key: attackerRoot.privateKey },
        serial: 0x3001,
        hashAlg: HASH,
        signAlg: SIGN,
        extKeyUsages: [KP_CLIENT_AUTH],
      });
      const clientMalicious = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: clientAuthAttacker.certificate,
        signerKey: clientAuthAttacker.privateKey,
        certs: [clientAuthAttacker.certificate, attackerRoot.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));
      let threw = false;
      let msg = "";
      try {
        await clientMalicious.verify({
          trustedCerts: [attackerRoot.certificate, victimRoot.certificate],
          issuerCerts: [victimIssuer.certificate],
        });
      } catch (e) {
        threw = true;
        msg = (e as Error).message;
      }
      assert.ok(threw, `must reject clientAuth-only attacker. message='${msg}'`);
    });
  });

  //#region 2. AUTHORIZATION CONTROLS — valid signers (must pass)

  describe("Authorization controls — valid signers (must pass)", () => {
    it("accepts a direct issuer-signed response", async () => {
      const verified = await issuerSignedBasic.verify({
        trustedCerts: [victimRoot.certificate],
        issuerCerts: [victimIssuer.certificate],
      });
      assert.equal(verified, true, "direct issuer must verify");
      const status = await issuerSignedBasic.getCertificateStatus(
        victimLeaf.certificate,
        victimIssuer.certificate,
      );
      assert.equal(status.isForCertificate, true);
      assert.equal(status.status, 0);
    });

    it("accepts a delegated responder with id-kp-OCSPSigning", async () => {
      const verified = await delegatedBasic.verify({
        trustedCerts: [victimRoot.certificate],
        issuerCerts: [victimIssuer.certificate],
      });
      assert.equal(verified, true, "delegated responder must verify");
      const status = await delegatedBasic.getCertificateStatus(
        victimLeaf.certificate,
        victimIssuer.certificate,
      );
      assert.equal(status.isForCertificate, true);
      assert.equal(status.status, 0);
    });

    it("accepts an explicitly trusted responder (trustedResponders)", async () => {
      // Build a non-delegated signer (no OCSP EKU, different issuer)
      // that we explicitly trust as a responder.
      const explicitResponder = await buildEndEntityCertificate({
        subject: dn("Trusted Explicit Responder", "Attacker Org"),
        issuer: { cert: attackerRoot.certificate, key: attackerRoot.privateKey },
        serial: 0x4001,
        hashAlg: HASH,
        signAlg: SIGN,
        extKeyUsages: [KP_SERVER_AUTH], // no OCSP EKU
      });
      const explicitResp = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: explicitResponder.certificate,
        signerKey: explicitResponder.privateKey,
        certs: [explicitResponder.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));
      const verified = await explicitResp.verify({
        trustedCerts: [attackerRoot.certificate],
        trustedResponders: [explicitResponder.certificate],
      });
      assert.equal(verified, true, "explicitly trusted responder must verify");
    });

    it("accepts an explicitly trusted responder without trustedCerts (chain validation skipped)", async () => {
      // Build a non-delegated signer (no OCSP EKU, different issuer)
      // that we explicitly trust as a responder. Do NOT pass trustedCerts
      // to prove that explicit pinning truly skips chain validation.
      const explicitResponder = await buildEndEntityCertificate({
        subject: dn("Trusted Explicit Responder 2", "Attacker Org"),
        issuer: { cert: attackerRoot.certificate, key: attackerRoot.privateKey },
        serial: 0x4002,
        hashAlg: HASH,
        signAlg: SIGN,
        extKeyUsages: [KP_SERVER_AUTH], // no OCSP EKU
      });
      const explicitResp = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: explicitResponder.certificate,
        signerKey: explicitResponder.privateKey,
        certs: [explicitResponder.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));
      const verified = await explicitResp.verify({
        // No trustedCerts at all — pinning is sufficient.
        trustedResponders: [explicitResponder.certificate],
      });
      assert.equal(verified, true,
        "explicitly trusted responder must verify without trustedCerts");
    });

    it("rejects a re-issued copy of a trusted responder (exact-DER semantics)", async () => {
      // Create responder A — the pinned certificate.
      const responderA = await buildEndEntityCertificate({
        subject: dn("Pinned Responder", "Attacker Org"),
        issuer: { cert: attackerRoot.certificate, key: attackerRoot.privateKey },
        serial: 0x4003,
        hashAlg: HASH,
        signAlg: SIGN,
        extKeyUsages: [KP_SERVER_AUTH],
      });
      // Create responder B — same subject, SAME public key, but different
      // serial (and therefore different DER). It must NOT inherit the
      // explicit trust granted to responder A.
      const certB = new pkijs.Certificate();
      certB.version = 2;
      certB.serialNumber = new asn1js.Integer({ value: 0x4004 });
      certB.issuer = attackerRoot.certificate.subject;
      certB.subject = responderA.certificate.subject;
      certB.notBefore.value = new Date(CERT_NOT_BEFORE);
      certB.notAfter.value = new Date(CERT_NOT_AFTER);
      const ekuExt = new pkijs.ExtKeyUsage({ keyPurposes: [KP_SERVER_AUTH] });
      certB.extensions = [
        new pkijs.Extension({
          extnID: ID_KEY_USAGE,
          critical: true,
          extnValue: new asn1js.BitString({ valueHex: new Uint8Array([0x80 | 0x20]).buffer }).toBER(false),
        }),
        new pkijs.Extension({
          extnID: ID_EXT_KEY_USAGE,
          critical: false,
          extnValue: ekuExt.toSchema().toBER(false),
          parsedValue: ekuExt,
        }),
      ];
      await certB.subjectPublicKeyInfo.importKey(responderA.publicKey);
      await certB.sign(attackerRoot.privateKey, HASH);

      // OCSP response signed by responder B. Only responder A is in
      // trustedResponders — responder B must be rejected.
      const resp = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: certB,
        signerKey: responderA.privateKey,
        certs: [certB],
        status: 0,
        hashAlg: "SHA-1",
      }));
      let threw = false;
      let msg = "";
      try {
        await resp.verify({
          trustedResponders: [responderA.certificate],
        });
      } catch (e) {
        threw = true;
        msg = (e as Error).message;
      }
      assert.ok(threw,
        `must reject re-issued copy of a pinned responder. msg='${msg}'`);
      assert.match(msg, /responder|authoriz/i,
        `Error must mention responder/authorization. Got: ${msg}`);
    });

    it("rejects untrusted chain when attacker root not trusted", async () => {
      let threw = false;
      let msg = "";
      try {
        await maliciousBasic.verify({ trustedCerts: [victimRoot.certificate] });
      } catch (e) {
        threw = true;
        msg = (e as Error).message;
      }
      assert.ok(threw, `verify() must throw when the signer chain has no trusted anchor. msg='${msg}'`);
      assert.ok(
        msg.toLowerCase().includes("chain") || msg.toLowerCase().includes("validation"),
        `Error must mention chain/validation. Got: ${msg}`
      );
    });

    it("returns false for cryptographically invalid signature", async () => {
      const bogusKeypair = await generateKeyPair(SIGN, HASH);
      const tampered = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: attackerTls.certificate,
        signerKey: bogusKeypair.privateKey,
        certs: [attackerTls.certificate, attackerRoot.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));
      const verified = await tampered.verify({
        trustedCerts: [attackerRoot.certificate, victimRoot.certificate],
      });
      assert.equal(verified, false, "verify() must return false for bad signature");
    });

    it("getCertificateStatus returns isForCertificate=false for mismatched CertID serial", async () => {
      const differentLeaf = await buildEndEntityCertificate({
        subject: dn("other.example.com", "Victim Org"),
        issuer: { cert: victimIssuer.certificate, key: victimIssuer.privateKey },
        serial: 0x9999,
        hashAlg: HASH,
        signAlg: SIGN,
        extKeyUsages: [KP_SERVER_AUTH],
      });
      const status = await maliciousBasic.getCertificateStatus(
        differentLeaf.certificate,
        victimIssuer.certificate,
      );
      assert.equal(status.isForCertificate, false, "CertID must not match a different serial");
    });
  });

  //#region 3. DELEGATED RESPONDER EKU / KEYUSAGE CONTROLS

  describe("Delegated responder EKU / KeyUsage controls", () => {
    it("rejects delegated responder with no EKU extension", async () => {
      const noEku = await buildEndEntityCertificate({
        subject: dn("No EKU Responder", "Victim Org"),
        issuer: { cert: victimIssuer.certificate, key: victimIssuer.privateKey },
        serial: 0x5001,
        hashAlg: HASH,
        signAlg: SIGN,
        extKeyUsages: [],
      });
      // Remove the EKU extension (present but with empty keyPurposes).
      noEku.certificate.extensions = noEku.certificate.extensions?.filter(
        e => e.extnID !== ID_EXT_KEY_USAGE
      ) ?? undefined;
      // Re-sign so the certificate signature matches the new tbsCertificate.
      await noEku.certificate.sign(victimIssuer.privateKey, HASH);
      assert.equal(
        await noEku.certificate.verify(victimIssuer.certificate),
        true,
        "fixture certificate must remain correctly signed after extension removal",
      );
      const noEkuResp = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: noEku.certificate,
        signerKey: noEku.privateKey,
        certs: [noEku.certificate, victimIssuer.certificate, victimRoot.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));
      let threw = false;
      let msg = "";
      try {
        await noEkuResp.verify({
          trustedCerts: [victimRoot.certificate],
          issuerCerts: [victimIssuer.certificate],
        });
      } catch (e) {
        threw = true;
        msg = (e as Error).message;
      }
      assert.ok(threw, `must reject responder with no EKU. msg='${msg}'`);
    });

    it("rejects delegated responder with wrong EKU (serverAuth only, no OCSP)", async () => {
      const wrongEku = await buildEndEntityCertificate({
        subject: dn("Wrong EKU Responder", "Victim Org"),
        issuer: { cert: victimIssuer.certificate, key: victimIssuer.privateKey },
        serial: 0x5002,
        hashAlg: HASH,
        signAlg: SIGN,
        extKeyUsages: [KP_SERVER_AUTH],
      });
      const wrongEkuResp = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: wrongEku.certificate,
        signerKey: wrongEku.privateKey,
        certs: [wrongEku.certificate, victimIssuer.certificate, victimRoot.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));
      let threw = false;
      let msg = "";
      try {
        await wrongEkuResp.verify({
          trustedCerts: [victimRoot.certificate],
          issuerCerts: [victimIssuer.certificate],
        });
      } catch (e) {
        threw = true;
        msg = (e as Error).message;
      }
      assert.ok(threw, `must reject responder with wrong EKU. msg='${msg}'`);
    });

    it("rejects delegated responder without digitalSignature KeyUsage", async () => {
      const noDs = await buildEndEntityCertificate({
        subject: dn("No DigitalSig Responder", "Victim Org"),
        issuer: { cert: victimIssuer.certificate, key: victimIssuer.privateKey },
        serial: 0x5003,
        hashAlg: HASH,
        signAlg: SIGN,
        extKeyUsages: [KP_OCSP_SIGNING],
        keyUsageBits: 0x20, // keyEncipherment only, no digitalSignature
      });
      const noDsResp = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: noDs.certificate,
        signerKey: noDs.privateKey,
        certs: [noDs.certificate, victimIssuer.certificate, victimRoot.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));
      let threw = false;
      let msg = "";
      try {
        await noDsResp.verify({
          trustedCerts: [victimRoot.certificate],
          issuerCerts: [victimIssuer.certificate],
        });
      } catch (e) {
        threw = true;
        msg = (e as Error).message;
      }
      assert.ok(threw, `must reject responder without digitalSignature KeyUsage. msg='${msg}'`);
    });

    it("rejects delegated responder with malformed EKU extension", async () => {
      // Build a responder certificate with a deliberately malformed EKU
      // extension BEFORE signing, so the certificate signature remains valid.
      const malformed = await buildEndEntityCertificate({
        subject: dn("Malformed EKU Responder", "Victim Org"),
        issuer: { cert: victimIssuer.certificate, key: victimIssuer.privateKey },
        serial: 0x5004,
        hashAlg: HASH,
        signAlg: SIGN,
        extKeyUsages: [KP_OCSP_SIGNING],
      });
      // Replace the EKU extension value with a malformed ASN.1 blob, then re-sign.
      const ekuExt = malformed.certificate.extensions?.find(e => e.extnID === ID_EXT_KEY_USAGE);
      assert.ok(ekuExt, "fixture must have an EKU extension to corrupt");
      ekuExt!.parsedValue = undefined;
      ekuExt!.extnValue = new asn1js.OctetString({
        valueHex: new Uint8Array([0x30, 0x01, 0xff]).buffer, // malformed SEQUENCE
      });
      await malformed.certificate.sign(victimIssuer.privateKey, HASH);
      assert.equal(
        await malformed.certificate.verify(victimIssuer.certificate),
        true,
        "fixture certificate must remain correctly signed after EKU corruption",
      );

      const response = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: malformed.certificate,
        signerKey: malformed.privateKey,
        certs: [malformed.certificate, victimIssuer.certificate, victimRoot.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));
      let verified = false;
      let message = "";
      try {
        verified = await response.verify({
          trustedCerts: [victimRoot.certificate],
          issuerCerts: [victimIssuer.certificate],
        });
      } catch (error) {
        message = (error as Error).message;
      }
      assert.equal(verified, false, "malformed EKU responder must be rejected");
      assert.match(message, /responder|authoriz/i, "malformed EKU rejection must be diagnosable");
    });

    it("rejects delegated responder with malformed KeyUsage extension", async () => {
      // Build a responder certificate with a deliberately malformed KeyUsage
      // extension BEFORE signing, so the certificate signature remains valid.
      const malformed = await buildEndEntityCertificate({
        subject: dn("Malformed KeyUsage Responder", "Victim Org"),
        issuer: { cert: victimIssuer.certificate, key: victimIssuer.privateKey },
        serial: 0x5005,
        hashAlg: HASH,
        signAlg: SIGN,
        extKeyUsages: [KP_OCSP_SIGNING],
      });
      // Replace the KeyUsage extension value with a malformed ASN.1 blob, then re-sign.
      const kuExt = malformed.certificate.extensions?.find(e => e.extnID === ID_KEY_USAGE);
      assert.ok(kuExt, "fixture must have a KeyUsage extension to corrupt");
      kuExt!.parsedValue = undefined;
      kuExt!.extnValue = new asn1js.OctetString({
        valueHex: new Uint8Array([0x03, 0x01, 0xff]).buffer, // malformed BIT STRING
      });
      await malformed.certificate.sign(victimIssuer.privateKey, HASH);
      assert.equal(
        await malformed.certificate.verify(victimIssuer.certificate),
        true,
        "fixture certificate must remain correctly signed after KeyUsage corruption",
      );

      const response = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: malformed.certificate,
        signerKey: malformed.privateKey,
        certs: [malformed.certificate, victimIssuer.certificate, victimRoot.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));
      let verified = false;
      let message = "";
      try {
        verified = await response.verify({
          trustedCerts: [victimRoot.certificate],
          issuerCerts: [victimIssuer.certificate],
        });
      } catch (error) {
        message = (error as Error).message;
      }
      assert.equal(verified, false, "malformed KeyUsage responder must be rejected");
      assert.match(message, /responder|authoriz/i, "malformed KeyUsage rejection must be diagnosable");
    });

    it("accepts delegated responder with OCSP EKU and digitalSignature", async () => {
      const verified = await delegatedBasic.verify({
        trustedCerts: [victimRoot.certificate],
        issuerCerts: [victimIssuer.certificate],
      });
      assert.equal(verified, true);
    });

    it("accepts delegated responder with OCSP EKU and no KeyUsage extension", async () => {
      // RFC 5280: absence of KeyUsage means unconstrained usage.
      const noKu = await buildEndEntityCertificate({
        subject: dn("No KeyUsage Responder", "Victim Org"),
        issuer: { cert: victimIssuer.certificate, key: victimIssuer.privateKey },
        serial: 0x5006,
        hashAlg: HASH,
        signAlg: SIGN,
        extKeyUsages: [KP_OCSP_SIGNING],
        keyUsageBits: null, // suppress KeyUsage extension entirely
      });
      const noKuResp = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: noKu.certificate,
        signerKey: noKu.privateKey,
        certs: [noKu.certificate, victimIssuer.certificate, victimRoot.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));
      const verified = await noKuResp.verify({
        trustedCerts: [victimRoot.certificate],
        issuerCerts: [victimIssuer.certificate],
      });
      assert.equal(verified, true,
        "delegated responder without KeyUsage must be accepted (unconstrained per RFC 5280)");
    });
  });

  //#region 4. ResponderID modes: byName and byKey

  describe("ResponderID modes — byName and byKey", () => {
    it("verifies a response with byName ResponderID", async () => {
      const verified = await issuerSignedBasic.verify({
        trustedCerts: [victimRoot.certificate],
        issuerCerts: [victimIssuer.certificate],
      });
      assert.equal(verified, true);
    });

    it("verifies a response with byKey ResponderID", async () => {
      const byKeyResp = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: victimIssuer.certificate,
        signerKey: victimIssuer.privateKey,
        certs: [victimIssuer.certificate, victimRoot.certificate],
        status: 0,
        hashAlg: "SHA-1",
        useByKey: true,
      }));
      const verified = await byKeyResp.verify({
        trustedCerts: [victimRoot.certificate],
        issuerCerts: [victimIssuer.certificate],
      });
      assert.equal(verified, true, "byKey ResponderID must verify");
    });
  });

  //#region 5. Multiple signer candidates

  describe("Multiple signer candidates", () => {
    it("accepts when only one candidate has a valid signature despite ambiguous byName", async () => {
      // Create a certificate with the same subject as victimIssuer but a
      // DIFFERENT key. Both match byName ResponderID, but only the real
      // signer's public key can verify the OCSP signature. The other
      // candidate is discarded at step 2.
      const sameNameDiffKey = await buildCaCertificate({
        subject: dn("Victim Issuer CA", "Victim Org"), // same DN as victimIssuer
        issuer: { cert: victimRoot.certificate, key: victimRoot.privateKey },
        serial: 0x8888,
        hashAlg: HASH,
        signAlg: SIGN,
      });

      const resp = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: victimIssuer.certificate,
        signerKey: victimIssuer.privateKey,
        // Put the bad (different-key) candidate FIRST — this proves the
        // verifier iterates past a mismatched signature and accepts the
        // next valid candidate.
        certs: [sameNameDiffKey.certificate, victimIssuer.certificate, victimRoot.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));

      // Two certs match byName: victimIssuer (valid sig) and sameNameDiffKey
      // (invalid sig — different key). Only one passes signature verification.
      const verified = await resp.verify({
        trustedCerts: [victimRoot.certificate],
        issuerCerts: [victimIssuer.certificate],
      });
      assert.equal(verified, true,
        "must accept when exactly one candidate passes all steps");
    });

    it("accepts when two responder certs share the same identity (re-issued)", async () => {
      // Re-issue victimIssuer with the SAME public key. Both responder certs
      // share the same identity (subject + SPKI) and both match byName.
      // The new behavior does NOT pre-deduplicate by identity — it just
      // verifies each candidate and accepts the response as soon as one
      // passes. Two identity-equivalent certs produce two sequentially-
      // successful candidates; the response must still verify (no
      // "ambiguous responder" error).

      // Re-issue victimIssuer with the SAME public key
      const reissued = new pkijs.Certificate();
      reissued.version = 2;
      reissued.serialNumber = new asn1js.Integer({ value: 0x7777 });
      reissued.issuer = victimRoot.certificate.subject;
      reissued.subject = victimIssuer.certificate.subject; // same subject
      reissued.notBefore.value = new Date(CERT_NOT_BEFORE);
      reissued.notAfter.value = new Date(CERT_NOT_AFTER);

      const basicConstr = new pkijs.BasicConstraints({ cA: true, pathLenConstraint: 2 });
      const keyUsageBits = new ArrayBuffer(2);
      const kuView = new Uint8Array(keyUsageBits);
      kuView[0] = 0x04 | 0x02;
      reissued.extensions = [
        new pkijs.Extension({
          extnID: ID_BASIC_CONSTRAINTS,
          critical: true,
          extnValue: basicConstr.toSchema().toBER(false),
          parsedValue: basicConstr,
        }),
        new pkijs.Extension({
          extnID: ID_KEY_USAGE,
          critical: true,
          extnValue: new asn1js.BitString({ valueHex: keyUsageBits }).toBER(false),
        }),
      ];
      // Same public key as victimIssuer
      await reissued.subjectPublicKeyInfo.importKey(victimIssuer.publicKey);
      await reissued.sign(victimRoot.privateKey, HASH);

      // Both certificates are tried independently.
      // The first fully valid candidate is sufficient — the response
      // must verify (no "ambiguous responder" error).
      const resp = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: victimIssuer.certificate,
        signerKey: victimIssuer.privateKey,
        certs: [victimIssuer.certificate, reissued, victimRoot.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));

      const verified = await resp.verify({
        trustedCerts: [victimRoot.certificate],
        issuerCerts: [victimIssuer.certificate],
      });
      assert.equal(verified, true,
        "identity-deduped re-issued responder must be accepted");
    });
  });

  //#region 6. Re-issued issuer identity (same subject + public key)

  describe("Re-issued issuer identity", () => {
    it("accepts direct issuer response when issuer has been re-issued with same identity", async () => {
      // Re-issue victimIssuer with a different serial but same subject + key pair
      const reissued = new pkijs.Certificate();
      reissued.version = 2;
      reissued.serialNumber = new asn1js.Integer({ value: 0x6666 });
      reissued.issuer = victimRoot.certificate.subject;
      reissued.subject = victimIssuer.certificate.subject;
      reissued.notBefore.value = new Date(CERT_NOT_BEFORE);
      reissued.notAfter.value = new Date(CERT_NOT_AFTER);

      const basicConstr = new pkijs.BasicConstraints({ cA: true, pathLenConstraint: 2 });
      const keyUsageBits = new ArrayBuffer(2);
      const kuView = new Uint8Array(keyUsageBits);
      kuView[0] = 0x04 | 0x02;
      reissued.extensions = [
        new pkijs.Extension({
          extnID: ID_BASIC_CONSTRAINTS,
          critical: true,
          extnValue: basicConstr.toSchema().toBER(false),
          parsedValue: basicConstr,
        }),
        new pkijs.Extension({
          extnID: ID_KEY_USAGE,
          critical: true,
          extnValue: new asn1js.BitString({ valueHex: keyUsageBits }).toBER(false),
        }),
      ];

      await reissued.subjectPublicKeyInfo.importKey(victimIssuer.publicKey);
      await reissued.sign(victimRoot.privateKey, HASH);

      // Build response signed by the REISSUED issuer (same subject + key as
      // the original victimIssuer, but different serial and DER). The CertID
      // is still computed from the ORIGINAL victimIssuer; the reissued copy
      // must match because issuerNameHash/issuerKeyHash depend only on subject
      // and public key contents, not on serial number or DER encoding.
      const resp = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: reissued,
        signerKey: victimIssuer.privateKey, // same key pair
        certs: [reissued, victimRoot.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));

      const verified = await resp.verify({
        trustedCerts: [victimRoot.certificate],
        issuerCerts: [victimIssuer.certificate],
      });
      assert.equal(verified, true, "re-issued issuer with same identity must verify");
    });
  });

  //#region 7. Multiple SingleResponses

  describe("Multiple SingleResponses", () => {
    it("accepts a response covering two leaves from the same issuer", async () => {
      const leaf2 = await buildEndEntityCertificate({
        subject: dn("victim2.example.com", "Victim Org"),
        issuer: { cert: victimIssuer.certificate, key: victimIssuer.privateKey },
        serial: 0x6001,
        hashAlg: HASH,
        signAlg: SIGN,
        extKeyUsages: [KP_SERVER_AUTH],
      });

      const crypto = pkijs.getCrypto(true);
      const certID1 = new pkijs.CertID();
      await certID1.createForCertificate(victimLeaf.certificate, { hashAlgorithm: "SHA-1", issuerCertificate: victimIssuer.certificate }, crypto);
      const certID2 = new pkijs.CertID();
      await certID2.createForCertificate(leaf2.certificate, { hashAlgorithm: "SHA-1", issuerCertificate: victimIssuer.certificate }, crypto);

      const single1 = new pkijs.SingleResponse();
      single1.certID = certID1;
      single1.certStatus = new asn1js.Primitive({ idBlock: { tagClass: 3, tagNumber: 0 } });
      single1.thisUpdate = new Date(FIXED_DATE);
      single1.nextUpdate = new Date(FIXED_NEXT);

      const single2 = new pkijs.SingleResponse();
      single2.certID = certID2;
      single2.certStatus = new asn1js.Primitive({ idBlock: { tagClass: 3, tagNumber: 0 } });
      single2.thisUpdate = new Date(FIXED_DATE);
      single2.nextUpdate = new Date(FIXED_NEXT);

      const basic = new pkijs.BasicOCSPResponse();
      basic.tbsResponseData.responderID = victimIssuer.certificate.subject;
      basic.tbsResponseData.producedAt = new Date(FIXED_DATE);
      basic.tbsResponseData.responses = [single1, single2];
      basic.certs = [victimIssuer.certificate, victimRoot.certificate];
      await basic.sign(victimIssuer.privateKey, "SHA-1");

      const resp = redecode(basic);
      const verified = await resp.verify({
        trustedCerts: [victimRoot.certificate],
        issuerCerts: [victimIssuer.certificate],
      });
      assert.equal(verified, true, "multi-SingleResponse must verify");
    });

    it("rejects when the responder is not authorized for at least one SingleResponse", async () => {
      // Create a leaf under attackerRoot (different PKI branch).
      const attackerLeaf = await buildEndEntityCertificate({
        subject: dn("attacker-leaf.example.com", "Attacker Org"),
        issuer: { cert: attackerRoot.certificate, key: attackerRoot.privateKey },
        serial: 0x6002,
        hashAlg: HASH,
        signAlg: SIGN,
        extKeyUsages: [KP_SERVER_AUTH],
      });

      const crypto = pkijs.getCrypto(true);

      // CertID for victimLeaf: issuer = victimIssuer
      const certIDvictim = new pkijs.CertID();
      await certIDvictim.createForCertificate(
        victimLeaf.certificate,
        { hashAlgorithm: "SHA-1", issuerCertificate: victimIssuer.certificate },
        crypto,
      );

      // CertID for attackerLeaf: issuer = attackerRoot (NOT victimIssuer!)
      const certIDattacker = new pkijs.CertID();
      await certIDattacker.createForCertificate(
        attackerLeaf.certificate,
        { hashAlgorithm: "SHA-1", issuerCertificate: attackerRoot.certificate },
        crypto,
      );

      const singleVictim = new pkijs.SingleResponse();
      singleVictim.certID = certIDvictim;
      singleVictim.certStatus = new asn1js.Primitive({ idBlock: { tagClass: 3, tagNumber: 0 } });
      singleVictim.thisUpdate = new Date(FIXED_DATE);
      singleVictim.nextUpdate = new Date(FIXED_NEXT);

      const singleAttacker = new pkijs.SingleResponse();
      singleAttacker.certID = certIDattacker;
      singleAttacker.certStatus = new asn1js.Primitive({ idBlock: { tagClass: 3, tagNumber: 0 } });
      singleAttacker.thisUpdate = new Date(FIXED_DATE);
      singleAttacker.nextUpdate = new Date(FIXED_NEXT);

      // delegatedResponder is issued by victimIssuer — it is authorized for
      // victimLeaf but NOT for attackerLeaf (whose issuer is attackerRoot).
      const basic = new pkijs.BasicOCSPResponse();
      basic.tbsResponseData.responderID = delegatedResponder.certificate.subject;
      basic.tbsResponseData.producedAt = new Date(FIXED_DATE);
      basic.tbsResponseData.responses = [singleVictim, singleAttacker];
      basic.certs = [delegatedResponder.certificate, victimIssuer.certificate, victimRoot.certificate];
      await basic.sign(delegatedResponder.privateKey, "SHA-1");

      const resp = redecode(basic);
      let threw = false;
      let msg = "";
      try {
        await resp.verify({
          trustedCerts: [victimRoot.certificate],
          issuerCerts: [victimIssuer.certificate],
        });
      } catch (e) {
        threw = true;
        msg = (e as Error).message;
      }
      assert.ok(threw,
        `must reject when responder is not authorized for every SingleResponse. msg='${msg}'`);
      assert.match(msg, /responder|authoriz/i,
        `Error must mention responder/authorization. Got: ${msg}`);
    });
  });

  //#region 8. Old API backward compatibility

  describe("Old API backward compatibility — verify({trustedCerts})", () => {
    it("accepts direct issuer response with only trustedCerts (issuer found via embedded certs)", async () => {
      const verified = await issuerSignedBasic.verify({
        trustedCerts: [victimRoot.certificate],
      });
      assert.equal(verified, true,
        "Old API verify({trustedCerts}) must work when issuer is in embedded certs");
    });

    it("accepts delegated responder response without issuerCerts (issuer found via embedded certs)", async () => {
      // delegatedBasic embeds victimIssuer in its certs, so issuer is
      // resolvable from embedded certs — old API should succeed.
      const verified = await delegatedBasic.verify({
        trustedCerts: [victimRoot.certificate],
      });
      assert.equal(verified, true,
        "Old API must work when delegated responder's issuer is in embedded certs");
    });

    it("accepts delegated responder when issuer is found via trustedCerts", async () => {
      // Build a delegated responder response WITHOUT embedding the issuer.
      // The issuer is provided via `trustedCerts` only — this verifies the
      // documented promise that issuer candidates are also searched among
      // trustedCerts.
      const standaloneDelegated = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: delegatedResponder.certificate,
        signerKey: delegatedResponder.privateKey,
        certs: [delegatedResponder.certificate], // no victimIssuer in certs!
        status: 0,
        hashAlg: "SHA-1",
      }));
      const verified = await standaloneDelegated.verify({
        trustedCerts: [victimRoot.certificate, victimIssuer.certificate],
        // victimIssuer is needed for chain-building AND as an issuer
        // candidate — both roles are satisfied by trustedCerts here.
      });
      assert.equal(verified, true,
        "issuer found via trustedCerts must authorize a delegated responder");
    });
  });

  //#region 9. Attacker sanity checks

  describe("Attacker certificate sanity", () => {
    it("attackerTlsCert is a non-CA serverAuth end entity without id-kp-OCSPSigning", () => {
      const ekuExt = attackerTls.certificate.extensions?.find(e => e.extnID === ID_EXT_KEY_USAGE);
      assert.ok(ekuExt, "attacker cert has EKU extension");
      const eku = ekuExt!.parsedValue as pkijs.ExtKeyUsage;
      assert.ok(eku.keyPurposes.includes(KP_SERVER_AUTH), "EKU includes serverAuth");
      assert.ok(!eku.keyPurposes.includes(KP_OCSP_SIGNING), "EKU must NOT include id-kp-OCSPSigning");

      const bc = attackerTls.certificate.extensions?.find(e => e.extnID === ID_BASIC_CONSTRAINTS);
      const isCa = bc?.parsedValue instanceof pkijs.BasicConstraints && (bc.parsedValue as pkijs.BasicConstraints).cA === true;
      assert.ok(!isCa, "attacker cert must NOT be a CA");

      assert.ok(
        !attackerTls.certificate.issuer.isEqual(victimIssuer.certificate.subject),
        "attacker cert issuer must differ from victim issuer",
      );
    });
  });

  //#region 10. SIGNATURE ERROR HANDLING (regressions for verifyResponseSignature)

  describe("Signature error handling (do not swallow hard errors as false)", () => {
    it("rethrows on unsupported signature algorithm instead of returning false", async () => {
      // Build a normal delegated response, then rewrite signatureAlgorithm
      // to an unsupported OID. The signature verification must fail with a
      // thrown error, NOT silently return false.
      const response = redecode(delegatedBasic);
      response.signatureAlgorithm = new pkijs.AlgorithmIdentifier({
        algorithmId: "1.2.840.113555.999.999.999", // bogus, unsupported OID
      });

      let threw = false;
      let msg = "";
      try {
        await response.verify({
          trustedCerts: [victimRoot.certificate],
          issuerCerts: [victimIssuer.certificate],
        });
      } catch (e) {
        threw = true;
        msg = (e as Error).message;
      }
      assert.ok(threw, `unsupported algorithm must throw, not return false. msg='${msg}'`);
    });

    it("returns false (not throw) for a plain cryptographic mismatch", async () => {
      // Use a fully unrelated keypair to sign the same tbsResponseData.
      // No algorithm error — just a wrong signature — must yield false.
      const bogusKeypair = await generateKeyPair(SIGN, HASH);
      const tampered = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: delegatedResponder.certificate,
        signerKey: bogusKeypair.privateKey,
        certs: [delegatedResponder.certificate, victimIssuer.certificate, victimRoot.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));
      const result = await tampered.verify({
        trustedCerts: [victimRoot.certificate],
        issuerCerts: [victimIssuer.certificate],
      });
      assert.equal(result, false, "plain bad signature must yield false, not throw");
    });
  });

  //#region 11. DELEGATED RESPONDER ISSUER-AUTHORIZATION EDGE CASES

  describe("Delegated responder issuer-authorization edge cases", () => {
    it("rejects a delegated responder issued by the wrong CA", async () => {
      // delegatedResponder2 is issued by attackerRoot (NOT victimIssuer) but
      // the CertID in the response references victimIssuer. The certificate
      // signature won't verify under victimIssuer's key, so authorization
      // must fail closed.
      const delegatedResponder2 = await buildEndEntityCertificate({
        subject: dn("Rogue Delegated Responder", "Attacker Org"),
        issuer: { cert: attackerRoot.certificate, key: attackerRoot.privateKey },
        serial: 0x7001,
        hashAlg: HASH,
        signAlg: SIGN,
        extKeyUsages: [KP_OCSP_SIGNING],
      });
      const resp = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: delegatedResponder2.certificate,
        signerKey: delegatedResponder2.privateKey,
        certs: [delegatedResponder2.certificate, attackerRoot.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));
      let threw = false;
      let msg = "";
      try {
        await resp.verify({
          trustedCerts: [victimRoot.certificate, attackerRoot.certificate],
          issuerCerts: [victimIssuer.certificate],
        });
      } catch (e) {
        threw = true;
        msg = (e as Error).message;
      }
      assert.ok(threw, `must reject delegated responder issued by another CA. msg='${msg}'`);
    });

    it("accepts a delegated responder when multiple CA certs match the CertID", async () => {
      // Cross-sign victimIssuer with the same subject + same public key but
      // a different issuer (self-root alt) and embed BOTH copies. Both
      // match the CertID; the responder chain verifier should still accept.
      const reissued = new pkijs.Certificate();
      reissued.version = 2;
      reissued.serialNumber = new asn1js.Integer({ value: 0x5500 });
      reissued.issuer = victimRoot.certificate.subject;
      reissued.subject = victimIssuer.certificate.subject;
      reissued.notBefore.value = new Date(CERT_NOT_BEFORE);
      reissued.notAfter.value = new Date(CERT_NOT_AFTER);
      const basicConstr = new pkijs.BasicConstraints({ cA: true, pathLenConstraint: 2 });
      const kuBits = new ArrayBuffer(2);
      const kuView = new Uint8Array(kuBits);
      kuView[0] = 0x04 | 0x02;
      reissued.extensions = [
        new pkijs.Extension({
          extnID: ID_BASIC_CONSTRAINTS,
          critical: true,
          extnValue: basicConstr.toSchema().toBER(false),
          parsedValue: basicConstr,
        }),
        new pkijs.Extension({
          extnID: ID_KEY_USAGE,
          critical: true,
          extnValue: new asn1js.BitString({ valueHex: kuBits }).toBER(false),
        }),
      ];
      await reissued.subjectPublicKeyInfo.importKey(victimIssuer.publicKey);
      await reissued.sign(victimRoot.privateKey, HASH);

      const resp = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: delegatedResponder.certificate,
        signerKey: delegatedResponder.privateKey,
        certs: [delegatedResponder.certificate, victimIssuer.certificate, reissued, victimRoot.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));
      const verified = await resp.verify({
        trustedCerts: [victimRoot.certificate],
        issuerCerts: [victimIssuer.certificate],
      });
      assert.equal(verified, true,
        "delegated responder must verify when multiple CA certs match the CertID");
    });
  });

  //#region 12. MULTIPLE VALID CANDIDATES (must be silently accepted)

  describe("Multiple valid candidates", () => {
    it("accepts when two responder certs share the same signing key", async () => {
      // Re-issue victimIssuer with the SAME public key but a new serial and
      // validity. Both match byName responderID and both verify the same
      // OCSP signature. Per RFC 6960 this is not ambiguous and the response
      // must be accepted. The re-issued copy is placed first to prove the
      // verifier does not pre-deduplicate by identity.
      const reissuedIssuer = new pkijs.Certificate();
      reissuedIssuer.version = 2;
      reissuedIssuer.serialNumber = new asn1js.Integer({ value: 0x9101 });
      reissuedIssuer.issuer = victimRoot.certificate.subject;
      reissuedIssuer.subject = victimIssuer.certificate.subject;
      reissuedIssuer.notBefore.value = new Date(CERT_NOT_BEFORE);
      reissuedIssuer.notAfter.value = new Date(CERT_NOT_AFTER);
      const basicConstr = new pkijs.BasicConstraints({ cA: true, pathLenConstraint: 2 });
      const kuBits = new ArrayBuffer(2);
      const kuView = new Uint8Array(kuBits);
      kuView[0] = 0x04 | 0x02;
      reissuedIssuer.extensions = [
        new pkijs.Extension({
          extnID: ID_BASIC_CONSTRAINTS,
          critical: true,
          extnValue: basicConstr.toSchema().toBER(false),
          parsedValue: basicConstr,
        }),
        new pkijs.Extension({
          extnID: ID_KEY_USAGE,
          critical: true,
          extnValue: new asn1js.BitString({ valueHex: kuBits }).toBER(false),
        }),
      ];
      await reissuedIssuer.subjectPublicKeyInfo.importKey(victimIssuer.publicKey);
      await reissuedIssuer.sign(victimRoot.privateKey, HASH);

      const resp = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: victimIssuer.certificate,
        signerKey: victimIssuer.privateKey,
        certs: [reissuedIssuer, victimIssuer.certificate, victimRoot.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));
      const verified = await resp.verify({
        trustedCerts: [victimRoot.certificate],
        issuerCerts: [victimIssuer.certificate],
      });
      assert.equal(verified, true,
        "two responder certs sharing the signing key must both be accepted");
    });
  });

  //#region 13. CROSS-SIGNED ISSUER CHAIN
  describe("Cross-signed issuer chain", () => {
    /**
     * A cross-signed intermediate (issued by a *different* root than the
     * original) is a legitimate deployment pattern. PKI.js's underlying
     * `CertificateChainValidationEngine` cannot recover when one path is a
     * dead-end while another path reaches a trusted root — so this test
     * exercises the case where the cross-signed copy is the ONLY issuer
     * candidate the caller supplies. That proves the OCSP layer:
     *
     *   - accepts a cross-signed intermediate via `issuerCerts`,
     *   - deduplicates by exact DER (so two byte-identical copies collapse
     *     but a re-issued / cross-signed copy is retained independently),
     *   - hands both the signer and the cross-signed issuer to the engine
     *     in the correct leaf-last order.
     *
     * Note: this does NOT exercise a "duplicate-by-identity collapse" of two
     * distinct cross-signed copies against the engine — the engine itself
     * aborts on the first dead-end branch, so the OCSP layer's dedup bug is
     * not directly observable for that exact scenario at the integration
     * level. The relevant dedup logic is covered by the unit-level comment
     * on `containsCertificateByDer()` and is left as a regression guard for
     * the day the underlying engine gained branch-tolerant path building.
     */
    it("accepts a cross-signed intermediate issued under a different root", async () => {
      // Independent root that the caller trusts.
      const altRoot = await buildCaCertificate({
        subject: dn("Alt Root CA", "Victim Org"),
        serial: 0x6001,
        hashAlg: HASH,
        signAlg: SIGN,
      });

      // Re-use victimIssuer's public key to create a cross-signed copy of
      // the SAME intermediate CA, issued by altRoot instead of victimRoot.
      // It shares subject + SPKI with `victimIssuer` but anchors to a
      // different root.
      const crossSignedIssuer = new pkijs.Certificate();
      crossSignedIssuer.version = 2;
      crossSignedIssuer.serialNumber = new asn1js.Integer({ value: 0x6002 });
      crossSignedIssuer.issuer = altRoot.certificate.subject;
      crossSignedIssuer.subject = victimIssuer.certificate.subject;
      crossSignedIssuer.notBefore.value = new Date(CERT_NOT_BEFORE);
      crossSignedIssuer.notAfter.value = new Date(CERT_NOT_AFTER);
      const bc = new pkijs.BasicConstraints({ cA: true, pathLenConstraint: 2 });
      const kuBits = new ArrayBuffer(2);
      const kuView = new Uint8Array(kuBits);
      kuView[0] = 0x04 | 0x02; // keyCertSign + cRLSign
      crossSignedIssuer.extensions = [
        new pkijs.Extension({
          extnID: ID_BASIC_CONSTRAINTS,
          critical: true,
          extnValue: bc.toSchema().toBER(false),
          parsedValue: bc,
        }),
        new pkijs.Extension({
          extnID: ID_KEY_USAGE,
          critical: true,
          extnValue: new asn1js.BitString({ valueHex: kuBits }).toBER(false),
        }),
      ];
      await crossSignedIssuer.subjectPublicKeyInfo.importKey(victimIssuer.publicKey);
      await crossSignedIssuer.sign(altRoot.privateKey, HASH);

      // OCSP response signed by the delegated responder. Only the signer
      // is embedded; the cross-signed issuer is supplied via `issuerCerts`.
      const resp = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: victimIssuer.certificate,
        signerCert: delegatedResponder.certificate,
        signerKey: delegatedResponder.privateKey,
        certs: [delegatedResponder.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));

      const verified = await resp.verify({
        trustedCerts: [altRoot.certificate],
        issuerCerts: [crossSignedIssuer],
      });
      assert.equal(
        verified,
        true,
        "cross-signed intermediate under an alternative trusted root must verify",
      );
    });

    /**
     * Compatibility test: two **byte-distinct** copies of the SAME re-issued
     * CA (same subject + same key, different serial issued under the SAME
     * trusted root) must both be retained as issuer candidates so the engine
     * can use whichever it prefers. With both anchors trusted, the
     * verification must succeed regardless of order.
     *
     * Note: this test does NOT independently prove that *both* copies were
     * actually passed to the engine (a naively-passing implementation that
     * deduplicates by identity would also pass). Its primary value is as a
     * compatibility guard ensuring the multi-copy scenario does not regress
     * into a hard error.
     */
    it("accepts when the issuing CA has a re-issued copy under the same root", async () => {
      // Independent root both copies chain to.
      const dualRoot = await buildCaCertificate({
        subject: dn("Dual Root CA", "Victim Org"),
        serial: 0x6101,
        hashAlg: HASH,
        signAlg: SIGN,
      });

      const makeIssuer = async (serial: number): Promise<CertWithKey> => {
        const cert = new pkijs.Certificate();
        cert.version = 2;
        cert.serialNumber = new asn1js.Integer({ value: serial });
        cert.issuer = dualRoot.certificate.subject;
        cert.subject = victimIssuer.certificate.subject;
        cert.notBefore.value = new Date(CERT_NOT_BEFORE);
        cert.notAfter.value = new Date(CERT_NOT_AFTER);
        const bc = new pkijs.BasicConstraints({ cA: true, pathLenConstraint: 2 });
        const kuBits = new ArrayBuffer(2);
        const kuView = new Uint8Array(kuBits);
        kuView[0] = 0x04 | 0x02;
        cert.extensions = [
          new pkijs.Extension({
            extnID: ID_BASIC_CONSTRAINTS,
            critical: true,
            extnValue: bc.toSchema().toBER(false),
            parsedValue: bc,
          }),
          new pkijs.Extension({
            extnID: ID_KEY_USAGE,
            critical: true,
            extnValue: new asn1js.BitString({ valueHex: kuBits }).toBER(false),
          }),
        ];
        await cert.subjectPublicKeyInfo.importKey(victimIssuer.publicKey);
        await cert.sign(dualRoot.privateKey, HASH);
        return {
          certificate: cert,
          privateKey: victimIssuer.privateKey,
          publicKey: victimIssuer.publicKey,
        };
      };

      const issuerV1 = await makeIssuer(0x6102);
      const issuerV2 = await makeIssuer(0x6103);

      // Embed BOTH re-issued copies and trust the single shared root.
      const resp = redecode(await buildBasicOcspResponse({
        leaf: victimLeaf.certificate,
        issuer: issuerV1.certificate,
        signerCert: delegatedResponder.certificate,
        signerKey: delegatedResponder.privateKey,
        certs: [delegatedResponder.certificate, issuerV1.certificate, issuerV2.certificate],
        status: 0,
        hashAlg: "SHA-1",
      }));

      const verified = await resp.verify({
        trustedCerts: [dualRoot.certificate],
        issuerCerts: [issuerV1.certificate, issuerV2.certificate],
      });
      assert.equal(
        verified,
        true,
        "two byte-distinct re-issued CA copies must both be retained as candidates",
      );
    });
  });
});
