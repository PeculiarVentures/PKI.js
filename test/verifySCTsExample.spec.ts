import * as assert from "assert";
import { verifySCTs } from "./verifySCTsExample";

context("CST Verification Example", () => {
  it("Verifies all of the embedded SCTs", async () => {
    const results = await verifySCTs();
    assert.deepEqual(
      results,
      [true, true, true],
      "SCTs must be verified successfully"
    );
  });
});
