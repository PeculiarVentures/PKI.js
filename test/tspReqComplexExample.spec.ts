import { describe, it, assert } from "vitest";
import * as pkijs from "../src/index";
import "./utils";
import { createTSPReq } from "./tspReqComplexExample";

//#endregion

describe("TSP Request Complex Example", () => {
  it("Create And Parse TSP Request", async () => {
    const tspReq = await createTSPReq();
    assert.doesNotThrow(() => {
      pkijs.TimeStampReq.fromBER(tspReq.toSchema().toBER());
    });
  });
});
