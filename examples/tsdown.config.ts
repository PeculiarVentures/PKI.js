import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "tsdown";

// The examples bundle src/ module by module, and package.json declares "sideEffects": false, so rolldown
// would drop the default engine registration in src/index.ts (the published single-file build keeps it).
const keepEngineRegistration = {
  name: "keep-engine-registration",
  transform(code: string, id: string) {
    return id.endsWith("/src/index.ts") ? { code, moduleSideEffects: true } : undefined;
  },
};

// One self-contained browser bundle per example, examples/<Name>/bundle.js, loaded by the example's HTML page.
const examples = readdirSync(import.meta.dirname, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(import.meta.dirname, entry.name, "es6.ts")))
  .map((entry) => entry.name);

export default examples.map((name) =>
  defineConfig({
    entry: { bundle: join(import.meta.dirname, name, "es6.ts") },
    outDir: join(import.meta.dirname, name),
    format: ["esm"],
    platform: "browser",
    tsconfig: join(import.meta.dirname, "tsconfig.json"),
    // Bundle pkijs (from src/) and all of its dependencies; the pages load nothing else.
    deps: { alwaysBundle: [/./] },
    plugins: [keepEngineRegistration],
    fixedExtension: false,
    hash: false,
    clean: false,
    dts: false,
    exports: false,
    attw: false,
    logLevel: "warn",
  }),
);
