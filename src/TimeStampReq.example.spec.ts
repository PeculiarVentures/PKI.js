import { describe, it, assert } from "vitest";
import * as pkijs from "./index";
import "./test-helpers";
import { createTSPReq } from "./TimeStampReq.example";

//#endregion

describe("TSP Request Complex Example", () => {
  it("Create And Parse TSP Request", async () => {
    const tspReq = await createTSPReq();
    assert.doesNotThrow(() => {
      pkijs.TimeStampReq.fromBER(tspReq.toSchema().toBER());
    });
  });
});
