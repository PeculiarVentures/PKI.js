import * as assert from "assert";
import * as asn1js from "asn1js";
import * as pkijs from "../src";
import "./utils";
import { createTSPReq } from "./tspReqComplexExample";

//#endregion

context("TSP Request Complex Example", () => {
  it("Create And Parse TSP Request", async () => {
    const tspReq = await createTSPReq();
    assert.doesNotThrow(() => {
      const asn1 = asn1js.fromBER(tspReq.toSchema().toBER());
      pkijs.AsnError.assert(asn1, "TimeStampReq");
      new pkijs.TimeStampReq({ schema: asn1.result });
    });
  });
});
