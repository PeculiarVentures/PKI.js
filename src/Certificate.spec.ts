import { describe, it, expect } from "vitest";
import * as asn1js from "asn1js";
import { hex } from "@peculiar/utils";
import { Certificate, Time } from "./index";

// asn1js 4 refuses to encode the default 1899 UTCTime, so give the certificates a valid period.
const validity = { notBefore: new Time({ value: new Date(Date.UTC(2024, 0, 1)) }), notAfter: new Time({ value: new Date(Date.UTC(2025, 0, 1)) }) };

function getExtensions(tbs: asn1js.Sequence): asn1js.Constructed | undefined {
  return tbs.valueBlock.value.find((value) => value.idBlock.tagClass === 3 && value.idBlock.tagNumber === 3) as asn1js.Constructed | undefined;
}

describe("Certificate.encodeTBS legacy extensions encoding", () => {
  it("keeps absent extensions omitted without creating the property", () => {
    const certificate = new Certificate({ version: 2, ...validity });

    expect(getExtensions(certificate.encodeTBS())).toBeUndefined();
    expect(Reflect.ownKeys(certificate)).not.toContain("extensions");
  });

  it("preserves the exact legacy DER for an empty extensions array", () => {
    const certificate = new Certificate({ version: 2, ...validity, extensions: [] });
    const extensions = certificate.extensions!;
    Object.freeze(extensions);
    Object.freeze(certificate);

    const encoded = getExtensions(certificate.encodeTBS());
    expect(encoded).toBeDefined();
    expect(hex.encode(encoded!.toBER(false))).toBe("a3023000");

    const rebuiltTbs = certificate.toSchema(true).valueBlock.value[0] as asn1js.Sequence;
    expect(hex.encode(getExtensions(rebuiltTbs)!.toBER(false))).toBe("a3023000");
    expect(certificate.extensions).toBe(extensions);
    expect(certificate.extensions).toHaveLength(0);
  });
});
