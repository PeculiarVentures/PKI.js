import { afterEach, beforeAll, describe, it, expect, vi } from "vitest";
import * as asn1js from "asn1js";
import { Convert } from "pvtsutils";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { runInThisContext } from "node:vm";
import * as pkijs from "./index";

function loadSeparateAsn1js(): typeof asn1js {
  const nodeRequire = createRequire(__filename);
  const filename = nodeRequire.resolve("asn1js");
  const separateModule = { exports: {} };
  // Evaluate the installed module again without changing Node's shared module cache.
  const evaluate = runInThisContext(`(function (exports, require, module, __filename, __dirname) {\n${readFileSync(filename, "utf8")}\n})`, { filename });
  evaluate(separateModule.exports, createRequire(filename), separateModule, filename, dirname(filename));
  return separateModule.exports as typeof asn1js;
}

function snapshot(certificate: pkijs.Certificate) {
  return {
    extensions: certificate.extensions,
    items: certificate.extensions?.slice(),
    tbs: certificate.tbsView,
    tbsBytes: certificate.tbsView.slice(),
    der: Convert.ToHex(certificate.toSchema(true).toBER(false)),
    hasExtensions: Reflect.ownKeys(certificate).includes("extensions"),
  };
}

function expectUnchanged(certificate: pkijs.Certificate, original: ReturnType<typeof snapshot>) {
  expect(certificate.extensions).toBe(original.extensions);
  expect(certificate.extensions).toEqual(original.items);
  original.items?.forEach((extension, index) => expect(certificate.extensions?.[index]).toBe(extension));
  expect(certificate.tbsView).toBe(original.tbs);
  expect(certificate.tbsView).toEqual(original.tbsBytes);
  expect(Convert.ToHex(certificate.toSchema(true).toBER(false))).toBe(original.der);
  expect(Reflect.ownKeys(certificate).includes("extensions")).toBe(original.hasExtensions);
}

describe("verifySCTsForCertificate preserves the certificate", () => {
  let keys: CryptoKeyPair;
  let issuer: pkijs.Certificate;
  let issuerKeyHash: ArrayBuffer;
  let logs: pkijs.Log[];
  const crypto = pkijs.getCrypto(true);

  beforeAll(async () => {
    keys = (await crypto.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" } as RsaHashedKeyGenParams, true, [
      "sign",
      "verify",
    ])) as CryptoKeyPair;
    issuer = new pkijs.Certificate({ version: 2, serialNumber: new asn1js.Integer({ value: 1 }) });
    issuer.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({ type: "2.5.4.3", value: new asn1js.Utf8String({ value: "SCT regression test issuer" }) }));
    issuer.subject = issuer.issuer;
    issuer.notBefore.value = new Date("2026-01-01T00:00:00Z");
    issuer.notAfter.value = new Date("2027-01-01T00:00:00Z");
    await issuer.subjectPublicKeyInfo.importKey(keys.publicKey);
    await issuer.sign(keys.privateKey, "SHA-256");

    const spki = await crypto.exportKey("spki", keys.publicKey);
    issuerKeyHash = await crypto.digest("SHA-256", spki);
    logs = [{ log_id: Convert.ToBase64(issuerKeyHash), key: Convert.ToBase64(spki) }];
  });

  afterEach(() => vi.restoreAllMocks());

  async function createCertificateFixture({ withOtherExtensions = true, explicitCriticalFalse = false } = {}) {
    const certificate = pkijs.Certificate.fromBER(issuer.toSchema().toBER(false));
    certificate.serialNumber = new asn1js.Integer({ value: 2 });
    const otherExtensions = [
      new pkijs.Extension({ extnID: pkijs.id_BasicConstraints, extnValue: new pkijs.BasicConstraints().toSchema().toBER(false) }),
      new pkijs.Extension({ extnID: pkijs.id_SubjectKeyIdentifier, extnValue: new asn1js.OctetString({ valueHex: new Uint8Array([1, 2, 3]).buffer }).toBER(false) }),
    ];
    if (withOtherExtensions) certificate.extensions = otherExtensions;
    function encodeTBS(): ArrayBuffer {
      const schema = certificate.encodeTBS();
      if (explicitCriticalFalse) {
        const wrapper = schema.valueBlock.value.find((field) => field.idBlock.tagClass === 3 && field.idBlock.tagNumber === 3) as asn1js.Constructed;
        const extensions = wrapper.valueBlock.value[0] as asn1js.Sequence;
        const basicConstraints = extensions.valueBlock.value[0] as asn1js.Sequence;
        basicConstraints.valueBlock.value.splice(1, 0, new asn1js.Boolean({ value: false }));
      }
      return schema.toBER(false);
    }

    const tbs = new Uint8Array(encodeTBS());
    const timestamps = await Promise.all(
      [1767225600000, 1767225601000].map(async (time) => {
        // RFC 6962: version, signature type, uint64 timestamp, precert entry type,
        // issuer key hash, uint24 TBS length, TBS, and an empty SCT extensions vector.
        const signedData = new Uint8Array(12 + 32 + 3 + tbs.length + 2);
        const view = new DataView(signedData.buffer);
        view.setUint32(2, Math.floor(time / 0x100000000));
        view.setUint32(6, time >>> 0);
        view.setUint16(10, 1);
        signedData.set(new Uint8Array(issuerKeyHash), 12);
        signedData[44] = (tbs.length >>> 16) & 0xff;
        signedData[45] = (tbs.length >>> 8) & 0xff;
        signedData[46] = tbs.length & 0xff;
        signedData.set(tbs, 47);
        const signature = await crypto.sign({ name: "RSASSA-PKCS1-v1_5" }, keys.privateKey, signedData);
        // Encode the TLS SCT vector independently of the production serializer.
        const timestamp = new Uint8Array(49 + signature.byteLength);
        const timestampView = new DataView(timestamp.buffer);
        timestampView.setUint16(0, timestamp.length - 2);
        timestamp.set(new Uint8Array(issuerKeyHash), 3);
        timestampView.setUint32(35, Math.floor(time / 0x100000000));
        timestampView.setUint32(39, time >>> 0);
        timestamp[45] = 4; // SHA-256
        timestamp[46] = 1; // RSA
        timestampView.setUint16(47, signature.byteLength);
        timestamp.set(new Uint8Array(signature), 49);
        return timestamp;
      }),
    );

    const list = new Uint8Array(2 + timestamps.reduce((length, timestamp) => length + timestamp.length, 0));
    new DataView(list.buffer).setUint16(0, list.length - 2);
    let offset = 2;
    for (const timestamp of timestamps) {
      list.set(timestamp, offset);
      offset += timestamp.length;
    }
    const extension = new pkijs.Extension({ extnID: pkijs.id_SignedCertificateTimestampList, extnValue: new asn1js.OctetString({ valueHex: list.buffer }).toBER(false) });
    certificate.extensions = withOtherExtensions ? [otherExtensions[0], extension, otherExtensions[1]] : [extension];
    await certificate.sign(keys.privateKey, "SHA-256");
    if (explicitCriticalFalse) {
      const signedTbs = encodeTBS();
      certificate.tbsView = new Uint8Array(signedTbs);
      certificate.signatureValue = new asn1js.BitString({ valueHex: await crypto.sign({ name: "RSASSA-PKCS1-v1_5" }, keys.privateKey, signedTbs) });
    }
    return { certificate: pkijs.Certificate.fromBER(certificate.toSchema().toBER(false)), loggedTBS: tbs };
  }

  async function createCertificate(withOtherExtensions = true): Promise<pkijs.Certificate> {
    return (await createCertificateFixture({ withOtherExtensions })).certificate;
  }

  it("uses the exact stored TBS bytes even when the model cannot round-trip them", async () => {
    const { certificate, loggedTBS } = await createCertificateFixture({ explicitCriticalFalse: true });
    expect(Convert.ToHex(certificate.encodeTBS().toBER(false))).not.toBe(Convert.ToHex(certificate.tbsView));
    await expect(certificate.verify(issuer)).resolves.toBe(true);
    const original = snapshot(certificate);
    const verify = vi.spyOn(pkijs.SignedCertificateTimestamp.prototype, "verify");
    certificate.extensions!.forEach(Object.freeze);
    Object.freeze(certificate.extensions);
    Object.freeze(certificate);

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).resolves.toEqual([true, true]);
    const preCert = new Uint8Array(verify.mock.calls[0][1]);
    expect(Convert.ToHex(preCert.subarray(0, 32))).toBe(Convert.ToHex(issuerKeyHash));
    expect((preCert[32] << 16) | (preCert[33] << 8) | preCert[34]).toBe(loggedTBS.byteLength);
    expect(Convert.ToHex(preCert.subarray(35))).toBe(Convert.ToHex(loggedTBS));
    expectUnchanged(certificate, original);
  });

  it.each(["replaced", "deleted"] as const)("uses the stored SCTs and TBS when model extensions are %s", async (change) => {
    const certificate = await createCertificate();
    if (change === "replaced") certificate.extensions = (await createCertificate(false)).extensions;
    else delete certificate.extensions;
    certificate.serialNumber = new asn1js.Integer({ value: 99 });
    certificate.notBefore.value = new Date("2020-01-01T00:00:00Z");
    const original = snapshot(certificate);
    const encode = vi.spyOn(pkijs.Certificate.prototype, "encodeTBS");
    certificate.extensions?.forEach(Object.freeze);
    Object.freeze(certificate.extensions);
    Object.freeze(certificate);

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).resolves.toEqual([true, true]);
    expect(encode).not.toHaveBeenCalled();
    expectUnchanged(certificate, original);
  });

  it("does not use model SCTs when the stored TBS has no SCT extension", async () => {
    const certificate = pkijs.Certificate.fromBER(issuer.toSchema().toBER(false));
    certificate.extensions = (await createCertificate()).extensions;
    const original = snapshot(certificate);
    const encode = vi.spyOn(pkijs.Certificate.prototype, "encodeTBS");

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).rejects.toThrow("No SignedCertificateTimestampList extension");
    expect(encode).not.toHaveBeenCalled();
    expectUnchanged(certificate, original);
  });

  it("does not call a subclass encoder when stored TBS bytes are present", async () => {
    class StoredCertificate extends pkijs.Certificate {
      public override encodeTBS(): asn1js.Sequence {
        throw new Error("The stored certificate must not be re-encoded");
      }
    }
    const source = await createCertificate();
    const certificate = StoredCertificate.fromBER(source.toSchema().toBER(false));
    const originalDer = Convert.ToHex(certificate.toSchema().toBER(false));
    const originalTbs = certificate.tbsView;
    const extensions = certificate.extensions;
    const encode = vi.spyOn(StoredCertificate.prototype, "encodeTBS");
    Object.freeze(extensions);
    Object.freeze(certificate);

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).resolves.toEqual([true, true]);
    expect(encode).not.toHaveBeenCalled();
    expect(certificate.tbsView).toBe(originalTbs);
    expect(certificate.extensions).toBe(extensions);
    expect(Convert.ToHex(certificate.toSchema().toBER(false))).toBe(originalDer);
  });

  it("uses one subclass schema for both SCTs and TBS when stored bytes are empty", async () => {
    const source = await createCertificate();
    class EncodedCertificate extends pkijs.Certificate {
      public override encodeTBS(): asn1js.Sequence {
        return asn1js.fromBER(source.tbsView).result as asn1js.Sequence;
      }
    }
    const certificate = new EncodedCertificate({ extensions: [] });
    const original = snapshot(certificate);
    const encode = vi.spyOn(EncodedCertificate.prototype, "encodeTBS");
    Object.freeze(certificate.extensions);
    Object.freeze(certificate);

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).resolves.toEqual([true, true]);
    expect(encode).toHaveBeenCalledExactlyOnceWith();
    expectUnchanged(certificate, original);
  });

  it.each(["truncated", "wrong tag", "empty sequence", "trailing data"])("rejects invalid stored TBS without falling back to the model (%s)", async (kind) => {
    const certificate = await createCertificate();
    switch (kind) {
      case "truncated":
        certificate.tbsView = certificate.tbsView.slice(0, -1);
        break;
      case "wrong tag":
        certificate.tbsView = new Uint8Array([5, 0]);
        break;
      case "empty sequence":
        certificate.tbsView = new Uint8Array([0x30, 0]);
        break;
      case "trailing data": {
        const value = new Uint8Array(certificate.tbsView.length + 2);
        value.set(certificate.tbsView);
        value.set([5, 0], certificate.tbsView.length);
        certificate.tbsView = value;
        break;
      }
    }
    const original = snapshot(certificate);
    const encode = vi.spyOn(pkijs.Certificate.prototype, "encodeTBS");
    Object.freeze(certificate);

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).rejects.toThrow("Invalid certificate TBS encoding");
    expect(encode).not.toHaveBeenCalled();
    expectUnchanged(certificate, original);
  });

  it("reads only the stored TBS view when its buffer also contains other bytes", async () => {
    const certificate = await createCertificate();
    const value = new Uint8Array(certificate.tbsView.length + 5).fill(0xff);
    value.set(certificate.tbsView, 3);
    certificate.tbsView = value.subarray(3, -2);
    const original = snapshot(certificate);

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).resolves.toEqual([true, true]);
    expectUnchanged(certificate, original);
  });

  it("verifies each SCT and then all SCTs repeatedly without changing references or DER", async () => {
    const certificate = await createCertificate();
    const original = snapshot(certificate);

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs, 0)).resolves.toEqual([true]);
    expectUnchanged(certificate, original);
    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs, 1)).resolves.toEqual([true]);
    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).resolves.toEqual([true, true]);
    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).resolves.toEqual([true, true]);
    expectUnchanged(certificate, original);
  });

  it("accepts a frozen certificate and extensions array", async () => {
    const certificate = await createCertificate();
    const original = snapshot(certificate);
    Object.freeze(certificate.extensions);
    Object.freeze(certificate);

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).resolves.toEqual([true, true]);
    expectUnchanged(certificate, original);
  });

  it.each([true, false])("supports a subclass with a legacy encodeTBS override (other extensions: %s)", async (withOtherExtensions) => {
    class CustomCertificate extends pkijs.Certificate {
      public override encodeTBS(): asn1js.Sequence {
        return super.encodeTBS();
      }
    }

    const source = await createCertificate(withOtherExtensions);
    const certificate = CustomCertificate.fromBER(source.toSchema().toBER(false));
    certificate.tbsView = new Uint8Array();
    const original = snapshot(certificate);
    const encode = vi.spyOn(CustomCertificate.prototype, "encodeTBS");
    Object.freeze(certificate.extensions);
    Object.freeze(certificate);

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).resolves.toEqual([true, true]);
    expect(encode).toHaveBeenCalledExactlyOnceWith();
    expectUnchanged(certificate, original);
  });

  it("preserves a cached TBS schema returned by a subclass", async () => {
    class CachedCertificate extends pkijs.Certificate {
      private cachedTbs?: asn1js.Sequence;

      public override encodeTBS(): asn1js.Sequence {
        return (this.cachedTbs ??= super.encodeTBS());
      }
    }

    const source = await createCertificate();
    const certificate = CachedCertificate.fromBER(source.toSchema().toBER(false));
    certificate.tbsView = new Uint8Array();
    const cachedTbs = certificate.encodeTBS();
    const originalTbs = Convert.ToHex(cachedTbs.toBER(false));
    const original = snapshot(certificate);
    const extensions = cachedTbs.valueBlock.value.find((field) => field.idBlock.tagClass === 3 && field.idBlock.tagNumber === 3) as asn1js.Constructed;
    Object.freeze(cachedTbs.valueBlock.value);
    Object.freeze(extensions.valueBlock.value);
    Object.freeze((extensions.valueBlock.value[0] as asn1js.Sequence).valueBlock.value);

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).resolves.toEqual([true, true]);
    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs, 0)).resolves.toEqual([true]);
    expect(certificate.encodeTBS()).toBe(cachedTbs);
    expect(Convert.ToHex(cachedTbs.toBER(false))).toBe(originalTbs);
    expectUnchanged(certificate, original);
  });

  it.each([true, false])("accepts generic Primitive OIDs (other extensions: %s)", async (withOtherExtensions) => {
    class PrimitiveOidCertificate extends pkijs.Certificate {
      public override encodeTBS(): asn1js.Sequence {
        const schema = super.encodeTBS();
        const wrapper = schema.valueBlock.value.find((field) => field.idBlock.tagClass === 3 && field.idBlock.tagNumber === 3) as asn1js.Constructed;
        const extensions = wrapper.valueBlock.value[0] as asn1js.Sequence;
        for (const extension of extensions.valueBlock.value) {
          const sequence = extension as asn1js.Sequence;
          const oid = sequence.valueBlock.value[0];
          const primitive = new asn1js.Primitive({ idBlock: { tagClass: 1, tagNumber: 6 }, valueHex: oid.valueBlock.toBER(false) });
          expect(Convert.ToHex(primitive.toBER(false))).toBe(Convert.ToHex(oid.toBER(false)));
          expect(primitive.valueBlock.toString()).not.toBe(pkijs.id_SignedCertificateTimestampList);
          sequence.valueBlock.value[0] = primitive;
        }
        return schema;
      }
    }

    const source = await createCertificate(withOtherExtensions);
    const certificate = PrimitiveOidCertificate.fromBER(source.toSchema().toBER(false));
    certificate.tbsView = new Uint8Array();
    const original = snapshot(certificate);
    Object.freeze(certificate.extensions);
    Object.freeze(certificate);

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).resolves.toEqual([true, true]);
    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs, 0)).resolves.toEqual([true]);
    expectUnchanged(certificate, original);
  });

  it("preserves legacy empty extensions encoding when signing and rebuilding", async () => {
    const certificate = pkijs.Certificate.fromBER(issuer.toSchema().toBER(false));
    certificate.extensions = [];
    const extensions = certificate.extensions;
    await certificate.sign(keys.privateKey, "SHA-256");

    const tbs = asn1js.fromBER(certificate.tbsView).result as asn1js.Sequence;
    const wrapper = tbs.valueBlock.value.find((field) => field.idBlock.tagClass === 3 && field.idBlock.tagNumber === 3);
    expect(wrapper).toBeDefined();
    expect(Convert.ToHex(wrapper!.toBER(false))).toBe("a3023000");
    expect(Convert.ToHex(certificate.toSchema(true).valueBlock.value[0].toBER(false))).toBe(Convert.ToHex(certificate.tbsView));
    await expect(certificate.verify(issuer)).resolves.toBe(true);
    expect(certificate.extensions).toBe(extensions);
    expect(certificate.extensions).toHaveLength(0);
  });

  it.each(["wrapper", "sequence", "extension", "oid"] as const)("accepts a %s from a separate ASN1js copy", async (part) => {
    const separateAsn1js = loadSeparateAsn1js();
    expect(separateAsn1js.Constructed).not.toBe(asn1js.Constructed);
    expect(separateAsn1js.Sequence).not.toBe(asn1js.Sequence);
    expect(separateAsn1js.ObjectIdentifier).not.toBe(asn1js.ObjectIdentifier);

    function copy<T extends asn1js.AsnType>(value: T): T {
      const encoded = value.toBER(false);
      const decoded = separateAsn1js.fromBER(encoded);
      expect(decoded.offset).toBe(encoded.byteLength);
      expect(decoded.result).not.toBeInstanceOf(value.constructor);
      return decoded.result as T;
    }

    class SeparateSchemaCertificate extends pkijs.Certificate {
      public override encodeTBS(): asn1js.Sequence {
        const schema = super.encodeTBS();
        const index = schema.valueBlock.value.findIndex((field) => field.idBlock.tagClass === 3 && field.idBlock.tagNumber === 3);
        const wrapper = schema.valueBlock.value[index] as asn1js.Constructed;
        const extensions = wrapper.valueBlock.value[0] as asn1js.Sequence;
        const sctIndex = extensions.valueBlock.value.findIndex((extension) => (extension as asn1js.Sequence).valueBlock.value[0].valueBlock.toString() === pkijs.id_SignedCertificateTimestampList);
        const sct = extensions.valueBlock.value[sctIndex] as asn1js.Sequence;

        switch (part) {
          case "wrapper":
            schema.valueBlock.value[index] = copy(wrapper);
            break;
          case "sequence":
            wrapper.valueBlock.value[0] = copy(extensions);
            break;
          case "extension":
            extensions.valueBlock.value[sctIndex] = copy(sct);
            break;
          case "oid":
            sct.valueBlock.value[0] = copy(sct.valueBlock.value[0]);
            break;
        }
        return schema;
      }
    }

    for (const withOtherExtensions of [true, false]) {
      const source = await createCertificate(withOtherExtensions);
      const certificate = SeparateSchemaCertificate.fromBER(source.toSchema().toBER(false));
      certificate.tbsView = new Uint8Array();
      const original = snapshot(certificate);
      Object.freeze(certificate.extensions);
      Object.freeze(certificate);

      await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).resolves.toEqual([true, true]);
      await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs, 0)).resolves.toEqual([true]);
      expectUnchanged(certificate, original);
    }
  });

  it("supports concurrent verification and preserves state while the issuer digest is pending", async () => {
    const certificate = await createCertificate();
    const original = snapshot(certificate);
    const engine = new pkijs.CryptoEngine({ name: "deferred SCT digest", crypto: crypto.crypto });
    let release!: (value: ArrayBuffer) => void;
    const digest = new Promise<ArrayBuffer>((resolve) => {
      release = resolve;
    });
    vi.spyOn(engine, "digest").mockReturnValueOnce(digest);

    const results = Promise.allSettled([pkijs.verifySCTsForCertificate(certificate, issuer, logs, 0, engine), pkijs.verifySCTsForCertificate(certificate, issuer, logs, 1, engine)]);
    try {
      expectUnchanged(certificate, original);
    } finally {
      release(issuerKeyHash);
      await results;
    }
    expect(await results).toEqual([
      { status: "fulfilled", value: [true] },
      { status: "fulfilled", value: [true] },
    ]);
    expectUnchanged(certificate, original);
  });

  it("retains caller changes made while verification is pending", async () => {
    const certificate = await createCertificate();
    const originalExtensions = certificate.extensions!;
    const extra = new pkijs.Extension({ extnID: "1.2.3.4", extnValue: new asn1js.Null().toBER(false) });
    const engine = new pkijs.CryptoEngine({ name: "deferred SCT digest", crypto: crypto.crypto });
    let release!: (value: ArrayBuffer) => void;
    vi.spyOn(engine, "digest").mockReturnValueOnce(
      new Promise<ArrayBuffer>((resolve) => {
        release = resolve;
      }),
    );

    const result = pkijs.verifySCTsForCertificate(certificate, issuer, logs, 0, engine);
    originalExtensions.push(extra);
    release(issuerKeyHash);

    await expect(result).resolves.toEqual([true]);
    expect(certificate.extensions).toBe(originalExtensions);
    expect(certificate.extensions).toHaveLength(4);
    expect(certificate.extensions?.[3]).toBe(extra);
  });

  it("preserves the certificate if the issuer digest rejects", async () => {
    const certificate = await createCertificate();
    const original = snapshot(certificate);
    const engine = new pkijs.CryptoEngine({ name: "rejecting SCT digest", crypto: crypto.crypto });
    const error = new Error("digest rejected");
    vi.spyOn(engine, "digest").mockRejectedValueOnce(error);

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs, 0, engine)).rejects.toBe(error);
    expectUnchanged(certificate, original);
  });

  it("preserves the certificate if TBS encoding throws", async () => {
    const certificate = await createCertificate();
    certificate.tbsView = new Uint8Array();
    const original = snapshot(certificate);
    const error = new Error("TBS encoding failed");
    const encode = vi.spyOn(certificate, "encodeTBS").mockImplementationOnce(() => {
      throw error;
    });

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).rejects.toBe(error);
    encode.mockRestore();
    expectUnchanged(certificate, original);
  });

  it("preserves the certificate if SCT verification rejects", async () => {
    const certificate = await createCertificate();
    const original = snapshot(certificate);
    const error = new Error("SCT verification failed");
    vi.spyOn(pkijs.SignedCertificateTimestamp.prototype, "verify").mockRejectedValueOnce(error);

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs, 0)).rejects.toBe(error);
    expectUnchanged(certificate, original);
  });

  it("omits the extensions field from the signed TBS when SCT is the only extension", async () => {
    const certificate = await createCertificate(false);
    const original = snapshot(certificate);

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).resolves.toEqual([true, true]);
    expectUnchanged(certificate, original);
  });

  it("leaves a certificate without SCT extensions unchanged on rejection", async () => {
    const certificate = await createCertificate();
    certificate.extensions = certificate.extensions!.filter((extension) => extension.extnID !== pkijs.id_SignedCertificateTimestampList);
    certificate.tbsView = new Uint8Array();
    const original = snapshot(certificate);

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).rejects.toThrow("No SignedCertificateTimestampList extension");
    expectUnchanged(certificate, original);
  });

  it("does not add an extensions property to a certificate without extensions", async () => {
    const certificate = await createCertificate();
    delete certificate.extensions;
    certificate.tbsView = new Uint8Array();
    const original = snapshot(certificate);

    await expect(pkijs.verifySCTsForCertificate(certificate, issuer, logs)).rejects.toThrow("No SignedCertificateTimestampList extension");
    expectUnchanged(certificate, original);
  });
});
