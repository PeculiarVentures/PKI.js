import * as assert from "assert";
import { verifySCTs, verifySCTsWithRSA } from "./verifySCTsExample";

context("SCT Verification Example", () => {
  it("Verifies all of the embedded SCTs", async () => {
    const results = await verifySCTs();
    assert.deepEqual(
      results,
      [true, true, true],
      "SCTs must be verified successfully"
    );
  });
});

context("SCT Verification Example (with RSA)", () => {
  it("Verifies all of the embedded SCTs (with RSA signatures)", async () => {
    const results = await verifySCTsWithRSA();
    assert.deepEqual(
      results,
      [true, true, true],
      "SCTs must be verified successfully"
    );
  });
});
