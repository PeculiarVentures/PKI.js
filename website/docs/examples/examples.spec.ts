import { describe, it, vi } from "vitest";

// Each example runs when it is imported: a failed check throws.
// Set EXAMPLES_OUTPUT=1 to see what the examples print.
const examples = import.meta.glob("./**/*.example.ts");

describe("examples", () => {
  for (const [path, load] of Object.entries(examples)) {
    it(path, async () => {
      if (!process.env.EXAMPLES_OUTPUT) {
        vi.spyOn(console, "log").mockImplementation(() => {});
      }
      await load();
    });
  }
});
