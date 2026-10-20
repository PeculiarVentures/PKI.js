import { readFileSync } from "node:fs";
import { defineConfig } from "tsdown";

const license = readFileSync("LICENSE", "utf8");
const banner = ["/*!", ...license.split("\n").map((line) => ` * ${line}`), " */"].join("\n");

export default defineConfig({
  entry: "src/index.ts",
  // ESM only. CommonJS consumers load it through require(esm) on Node ^20.19 / >=22.12.
  format: ["esm"],
  platform: "neutral",
  dts: true,
  clean: true,
  // One bundled module, as in v3: index.ts registers the default WebCrypto
  // engine when it runs (initCryptoEngine). Unbundled output would let bundlers
  // skip index.js under "sideEffects": false and drop that registration.
  unbundle: false,
  // Keep .js/.d.ts output names (package.json is "type": "module")
  // instead of fixed .mjs/.d.mts extensions.
  fixedExtension: false,
  deps: {
    neverBundle: true,
  },
  exports: {
    legacy: true,
  },
  outputOptions: {
    // Drop TSDoc from the JS output; docs ship in the .d.ts files. Keep
    // @__PURE__ annotations so bundlers can tree-shake.
    comments: { legal: true, annotation: true, jsdoc: false },
  },
  banner,
  outDir: "build",
  tsconfig: "tsconfig.json",
  attw: {
    level: "error",
    profile: "esm-only",
  },
});
