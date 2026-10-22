import { defineConfig } from "vitest/config";

export default defineConfig({
  // Same class-field semantics as tsc and tsdown with "useDefineForClassFields": false.
  // Vite maps that tsconfig option only to setPublicClassFields, so class fields
  // without an initializer would still be emitted and reset values set by a base constructor.
  oxc: {
    assumptions: { setPublicClassFields: true },
    typescript: { removeClassFieldsWithoutInitializer: true },
  },
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts"],
    // Registers the @peculiar/webcrypto engine the specs run against.
    setupFiles: ["vitest.setup.ts"],
    // Carried over from the Mocha config: RSA key generation in the examples can be slow on CI runners.
    testTimeout: 10000,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*"],
      exclude: ["src/**/*.spec.ts", "build/**"],
    },
  },
});
