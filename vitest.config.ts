import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 60_000,
    include: ["test/**/*.spec.ts"],
    setupFiles: ["test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["lcov", "text-summary"],
      include: ["src/**/*.ts"],
    },
  },
});
