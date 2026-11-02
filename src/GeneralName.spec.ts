import * as asn1js from "asn1js";
import { describe, expect, it } from "vitest";
import { GeneralName, GeneralNames } from "./index";

// GeneralNames with one otherName: UPN (1.3.6.1.4.1.311.20.2.3) = UTF8String "test2"
const UPN_GENERAL_NAMES = "3017a015060a2b060104018237140203a0070c057465737432";

function hex(value: asn1js.BaseBlock): string {
  return Buffer.from(value.toBER()).toString("hex");
}

describe("GeneralName", () => {
  describe("otherName", () => {
    it("round-trips a parsed otherName", () => {
      const names = GeneralNames.fromBER(Buffer.from(UPN_GENERAL_NAMES, "hex"));

      expect(names.names[0].type).toBe(0);
      expect(hex(names.toSchema())).toBe(UPN_GENERAL_NAMES);
    });

    it("encodes an OtherName SEQUENCE with an implicit [0] tag", () => {
      const names = new GeneralNames({
        names: [
          new GeneralName({
            type: 0,
            value: new asn1js.Sequence({
              value: [
                new asn1js.ObjectIdentifier({ value: "1.3.6.1.4.1.311.20.2.3" }),
                new asn1js.Constructed({
                  idBlock: {
                    tagClass: 3, // CONTEXT-SPECIFIC
                    tagNumber: 0, // [0]
                  },
                  value: [new asn1js.Utf8String({ value: "test2" })],
                }),
              ],
            }),
          }),
        ],
      });

      expect(hex(names.toSchema())).toBe(UPN_GENERAL_NAMES);
    });
  });
});
