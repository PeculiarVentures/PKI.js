import * as pkijs from "../src";
import * as example from "./ocspRequestComplexExample";

describe("OCSP Request Complex Example", () => {
  it("Create And Parse OCSP Request", async () => {
    const ocspReqRaw = await example.createOCSPReq();
    pkijs.OCSPRequest.fromBER(ocspReqRaw);
  });
});
