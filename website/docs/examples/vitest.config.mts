import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = (path: string) => fileURLToPath(new URL(`../../../${path}`, import.meta.url));

// Runs every example in Node.js against the library source, as the website does in the browser.
export default defineConfig({
  // Same class-field semantics as the library's own vitest.config.ts.
  oxc: {
    assumptions: { setPublicClassFields: true },
    typescript: { removeClassFieldsWithoutInitializer: true },
  },
  resolve: {
    alias: {
      pkijs: root("src/index.ts"),
      asn1js: root("node_modules/asn1js"),
    },
  },
  test: {
    root: fileURLToPath(new URL(".", import.meta.url)),
    environment: "node",
    include: ["examples.spec.ts"],
    // RSA key generation can be slow on CI runners.
    testTimeout: 30000,
  },
});
