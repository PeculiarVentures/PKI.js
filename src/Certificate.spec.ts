import { describe, it, expect } from "vitest";
import * as asn1js from "asn1js";
import { Convert } from "pvtsutils";
import { Certificate, Extension } from "./index";

function makeExtension(extnID: string): Extension {
  return new Extension({ extnID, extnValue: new asn1js.Null().toBER(false) });
}

function getExtensions(tbs: asn1js.Sequence): asn1js.Constructed | undefined {
  return tbs.valueBlock.value.find((value) => value.idBlock.tagClass === 3 && value.idBlock.tagNumber === 3) as asn1js.Constructed | undefined;
}

describe("Certificate.encodeTBS extensions", () => {
  it("keeps the certificate's extensions when no override is supplied", () => {
    const extensions = [makeExtension("1.2.3.4"), makeExtension("1.2.3.5")];
    const certificate = new Certificate({ version: 2, extensions });
    const tbs = certificate.encodeTBS();

    expect(Convert.ToHex(tbs.toBER(false))).toBe(Convert.ToHex(certificate.encodeTBS({}).toBER(false)));
    expect(Convert.ToHex(tbs.toBER(false))).toBe(Convert.ToHex(certificate.encodeTBS({ extensions: undefined }).toBER(false)));
    expect(Convert.ToHex(getExtensions(tbs)!.valueBlock.value[0].toBER(false))).toBe(Convert.ToHex(new asn1js.Sequence({ value: extensions.map((extension) => extension.toSchema()) }).toBER(false)));
    expect(certificate.extensions).toBe(extensions);
  });

  it("uses a readonly override in its supplied order without changing any certificate fields", () => {
    const extensions = [makeExtension("1.2.3.4"), makeExtension("1.2.3.5")];
    const certificate = new Certificate({ version: 2, extensions });
    const originalTbs = certificate.encodeTBS();
    const override = Object.freeze([extensions[1], extensions[0]]);
    Object.freeze(extensions);
    Object.freeze(certificate);

    const tbs = certificate.encodeTBS({ extensions: override });
    expect(Convert.ToHex(getExtensions(tbs)!.valueBlock.value[0].toBER(false))).toBe(Convert.ToHex(new asn1js.Sequence({ value: override.map((extension) => extension.toSchema()) }).toBER(false)));
    expect(tbs.valueBlock.value.slice(0, -1).map((value) => Convert.ToHex(value.toBER(false)))).toEqual(originalTbs.valueBlock.value.slice(0, -1).map((value) => Convert.ToHex(value.toBER(false))));
    expect(certificate.extensions).toBe(extensions);
    expect(Convert.ToHex(certificate.encodeTBS().toBER(false))).toBe(Convert.ToHex(originalTbs.toBER(false)));
  });

  it("omits the extensions field for an empty override while preserving the original array", () => {
    const extensions = [makeExtension("1.2.3.4")];
    const certificate = new Certificate({ version: 2, extensions });
    const originalTbs = Convert.ToHex(certificate.encodeTBS().toBER(false));

    expect(getExtensions(certificate.encodeTBS({ extensions: Object.freeze([]) }))).toBeUndefined();
    expect(certificate.extensions).toBe(extensions);
    expect(Convert.ToHex(certificate.encodeTBS().toBER(false))).toBe(originalTbs);
  });

  it("omits an empty certificate extensions array", () => {
    const certificate = new Certificate({ version: 2, extensions: [] });
    expect(getExtensions(certificate.encodeTBS())).toBeUndefined();
  });

  it("can supply extensions for a certificate without creating the property on the original", () => {
    const certificate = new Certificate({ version: 2 });
    const extension = makeExtension("1.2.3.4");

    expect(getExtensions(certificate.encodeTBS())).toBeUndefined();
    expect(getExtensions(certificate.encodeTBS({ extensions: [extension] }))).toBeDefined();
    expect(Reflect.ownKeys(certificate)).not.toContain("extensions");
  });
});
