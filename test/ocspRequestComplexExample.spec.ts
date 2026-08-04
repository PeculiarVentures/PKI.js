import { describe, it, expect } from "vitest";
import * as pkijs from "../src/index";
import * as example from "./ocspRequestComplexExample";

describe("OCSP Request Complex Example", () => {
  it("Create And Parse OCSP Request", async () => {
    const ocspReqRaw = await example.createOCSPReq();
    expect(pkijs.OCSPRequest.fromBER(ocspReqRaw)).toBeInstanceOf(pkijs.OCSPRequest);
  });
});
