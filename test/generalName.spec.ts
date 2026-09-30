import * as path from "node:path";
import * as ts from "typescript";
import { assert, describe, it } from "vitest";
import * as asn1js from "asn1js";
import * as pvtsutils from "pvtsutils";
import * as pkijs from "../src";

function fromHex(hex: string): pkijs.GeneralName {
  const asn = asn1js.fromBER(pvtsutils.Convert.FromHex(hex));

  return new pkijs.GeneralName({ schema: asn.result });
}

function roundTrip(name: pkijs.GeneralName): pkijs.GeneralName {
  return new pkijs.GeneralName({
    schema: asn1js.fromBER((name.toSchema() as asn1js.BaseBlock).toBER()).result
  });
}

/**
 * Type-check a consumer snippet against the real declarations. CI does not
 * run tsc over tests, so compatibility of `GeneralNameJson` is asserted here.
 */
function consumerErrors(source: string): string[] {
  const root = path.resolve(__dirname, "..");
  const { config } = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root);
  const fileName = path.join(root, "test/generalNameJson.consumer.ts");

  const host = ts.createCompilerHost(parsed.options);
  const origGetSourceFile = host.getSourceFile.bind(host);
  host.fileExists = name => path.resolve(name) === fileName || ts.sys.fileExists(name);
  host.readFile = name => (path.resolve(name) === fileName ? source : ts.sys.readFile(name));
  host.getSourceFile = (name, languageVersion, onError, shouldCreate) =>
    path.resolve(name) === fileName
      ? ts.createSourceFile(fileName, source, languageVersion, true)
      : origGetSourceFile(name, languageVersion, onError, shouldCreate);

  const program = ts.createProgram({
    rootNames: [fileName],
    options: { ...parsed.options, noEmit: true, skipLibCheck: true },
    host
  });

  return ts
    .getPreEmitDiagnostics(program)
    .filter(d => d.category === ts.DiagnosticCategory.Error)
    .map(d => ts.flattenDiagnosticMessageText(d.messageText, "\n"));
}

describe("GeneralName JSON typedValue", () => {
  it("keeps the legacy value and adds typedValue for string names", () => {
    const cases: [1 | 2 | 6 | 8, string, string][] = [
      [1, "alice@example.com", "rfc822Name"],
      [2, "example.com", "dNSName"],
      [6, "https://example.com", "uniformResourceIdentifier"],
      [8, "1.2.3.4", "registeredID"]
    ];
    for (const [type, value, kind] of cases) {
      const json = roundTrip(new pkijs.GeneralName({ type, value })).toJSON();

      assert.deepEqual(json, { type, value, typedValue: { kind, value } } as pkijs.GeneralNameJson);
    }
  });

  it("types otherName by OID and payload BER", () => {
    const json = fromHex("a00c06032a0304a0050c03666f6f").toJSON();

    assert.deepEqual(json.typedValue, {
      kind: "otherName",
      oid: "1.2.3.4",
      valueBerHex: "0c03666f6f"
    });
  });

  it("keeps the BER of an x400Address", () => {
    const json = fromHex("a3023000").toJSON();

    assert.deepEqual(json.typedValue, { kind: "x400Address", berHex: "a3023000" });
  });

  it("projects directoryName attributes and keeps the legacy value", () => {
    const name = roundTrip(
      new pkijs.GeneralName({
        type: 4,
        value: new pkijs.RelativeDistinguishedNames({
          typesAndValues: [
            new pkijs.AttributeTypeAndValue({
              type: "2.5.4.3",
              value: new asn1js.Utf8String({ value: "Example" })
            }),
            new pkijs.AttributeTypeAndValue({
              type: "2.5.4.6",
              value: new asn1js.PrintableString({ value: "DE" })
            })
          ]
        })
      })
    );
    const json = name.toJSON();

    assert.deepEqual(json.value, name.value.toJSON());
    assert.deepEqual(json.typedValue, {
      kind: "directoryName",
      attributes: [
        { oid: "2.5.4.3", asn1Type: "UTF8String", value: "Example" },
        { oid: "2.5.4.6", asn1Type: "PrintableString", value: "DE" }
      ]
    });
  });

  it("parses ediPartyName with and without nameAssigner", () => {
    assert.deepEqual(fromHex("a512a0090c074578616d706c65a1070c05416c696365").toJSON().typedValue, {
      kind: "ediPartyName",
      nameAssigner: "Example",
      partyName: "Alice"
    });
    assert.deepEqual(fromHex("a509a1070c05416c696365").toJSON().typedValue, {
      kind: "ediPartyName",
      partyName: "Alice"
    });
  });

  it("formats IPv4, IPv6 and address-and-mask forms", () => {
    const cases: [string, object][] = [
      ["87047f000001", { address: "127.0.0.1", bytesHex: "7f000001" }],
      [
        "871020010db8000000000000000000000001",
        { address: "2001:db8::1", bytesHex: "20010db8000000000000000000000001" }
      ],
      [
        "87100000000000000000000000000000000000",
        { address: "::", bytesHex: "00000000000000000000000000000000" }
      ],
      [
        "8708c0a80000ffff0000",
        { address: "192.168.0.0", mask: "255.255.0.0", bytesHex: "c0a80000ffff0000" }
      ],
      [
        "872020010db8000000000000000000000000ffffffffffffffff0000000000000000",
        {
          address: "2001:db8::",
          mask: "ffff:ffff:ffff:ffff::",
          bytesHex: "20010db8000000000000000000000000ffffffffffffffff0000000000000000"
        }
      ]
    ];
    for (const [hex, expected] of cases) {
      assert.deepEqual(fromHex(hex).toJSON().typedValue, {
        kind: "iPAddress",
        ...expected
      } as pkijs.GeneralNameTypedValue);
    }
  });

  it("omits typedValue when it cannot be represented", () => {
    const json = fromHex("87057f00000100").toJSON();

    assert.notProperty(json, "typedValue");
    assert.equal(json.type, 7);
  });

  it("stays compatible with existing GeneralNameJson consumers", () => {
    const source = [
      'import { GeneralName, type GeneralNameJson } from "../src/GeneralName";',
      'const email: string = new GeneralName({ type: 1, value: "alice@example.com" }).toJSON().value;',
      'const json: GeneralNameJson = { type: 2, value: "example.com" };',
      "const typed = json.typedValue;",
      'if (typed?.kind === "directoryName") typed.attributes.map(a => a.oid);',
      'if (typed?.kind === "iPAddress") typed.address.toUpperCase();',
      "void email;"
    ].join("\n");

    assert.deepEqual(consumerErrors(source), []);
  });
});
