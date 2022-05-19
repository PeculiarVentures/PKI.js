import * as assert from "assert";
import * as pkijs from "../src";
import "./utils";
import { createTSPReq } from "./tspReqComplexExample";

//#endregion

context("TSP Request Complex Example", () => {
  it("Create And Parse TSP Request", async () => {
    const tspReq = await createTSPReq();
    assert.doesNotThrow(() => {
      pkijs.TimeStampReq.fromBER(tspReq.toSchema().toBER());
    });
  });
});
