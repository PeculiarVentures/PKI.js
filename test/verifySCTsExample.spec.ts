import { describe, it, assert } from "vitest";
import { verifySCTs, verifySCTsWithRSA } from "./verifySCTsExample";

describe("SCT Verification Example", () => {
  it("Verifies all of the embedded SCTs", async () => {
    const results = await verifySCTs();
    assert.deepEqual(
      results,
      [true, true, true],
      "SCTs must be verified successfully"
    );
  });
});

describe("SCT Verification Example (with RSA)", () => {
  it("Verifies all of the embedded SCTs (with RSA signatures)", async () => {
    const results = await verifySCTsWithRSA();
    assert.deepEqual(
      results,
      [true, true, true],
      "SCTs must be verified successfully"
    );
  });
});
