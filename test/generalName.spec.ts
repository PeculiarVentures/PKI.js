import * as path from "node:path";
import * as ts from "typescript";
import { assert, describe, it } from "vitest";
import * as asn1js from "asn1js";
import * as pkijs from "../src";

function directoryName(): pkijs.GeneralName {
  return new pkijs.GeneralName({
    type: 4,
    value: new pkijs.RelativeDistinguishedNames({
      typesAndValues: [
        new pkijs.AttributeTypeAndValue({
          type: "2.5.4.10",
          value: new asn1js.PrintableString({ value: "Example Org" })
        }),
        new pkijs.AttributeTypeAndValue({
          type: "2.5.4.6",
          value: new asn1js.PrintableString({ value: "DE" })
        })
      ]
    })
  });
}

/**
 * Type-check a consumer that reads `typesAndValues` after narrowing
 * `GeneralNameJson.value` away from `string`. Fails while `value` is
 * typed as `string` only, because the narrowed type is `never`.
 */
function generalNameJsonConsumerErrors(): string[] {
  const root = path.resolve(__dirname, "..");
  const configPath = path.join(root, "tsconfig.json");
  const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root);
  const fileName = path.join(root, "test/generalNameJson.consumer.ts");
  const source = [
    'import type { GeneralNameJson } from "../src/GeneralName";',
    "declare const json: GeneralNameJson;",
    'if (typeof json.value !== "string") {',
    "  json.value.typesAndValues;",
    "}"
  ].join("\n");

  const host = ts.createCompilerHost(parsed.options);
  const origGetSourceFile = host.getSourceFile.bind(host);
  host.fileExists = name => path.resolve(name) === fileName || ts.sys.fileExists(name);
  host.readFile = name => (path.resolve(name) === fileName ? source : ts.sys.readFile(name));
  host.getSourceFile = (name, languageVersion, onError, shouldCreate) => {
    if (path.resolve(name) === fileName) {
      return ts.createSourceFile(fileName, source, languageVersion, true);
    }
    return origGetSourceFile(name, languageVersion, onError, shouldCreate);
  };

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

describe("GeneralName JSON", () => {
  it("serializes rfc822Name as a string", () => {
    const json = new pkijs.GeneralName({
      type: 1,
      value: "email@address.com"
    }).toJSON();

    assert.equal(json.type, 1);
    assert.equal(json.value, "email@address.com");
  });

  it("serializes directoryName as RelativeDistinguishedNames JSON", () => {
    const json = directoryName().toJSON();

    assert.equal(json.type, 4);
    assert.equal(typeof json.value, "object");
    assert.ok(json.value && typeof json.value === "object" && "typesAndValues" in json.value);
    assert.equal(json.value.typesAndValues.length, 2);
    assert.equal(json.value.typesAndValues[0].type, "2.5.4.10");
    assert.equal(json.value.typesAndValues[1].type, "2.5.4.6");
  });

  it("keeps directoryName JSON after a schema round-trip", () => {
    const json = new pkijs.GeneralName({ schema: directoryName().toSchema() }).toJSON();

    assert.equal(json.type, 4);
    assert.ok(json.value && typeof json.value === "object" && "typesAndValues" in json.value);
    assert.equal(json.value.typesAndValues.length, 2);
  });

  it("types GeneralNameJson.value so directoryName JSON is usable", () => {
    assert.deepEqual(generalNameJsonConsumerErrors(), []);
  });
});
