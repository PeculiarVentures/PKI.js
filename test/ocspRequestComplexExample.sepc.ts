/* eslint-disable no-undef,no-unreachable,no-unused-vars */
import * as asn1js from "asn1js";
import * as pkijs from "../src";
import * as example from "./ocspRequestComplexExample";

context("OCSP Request Complex Example", () => {
  it("Create And Parse OCSP Request", async () => {
    const ocspReqRaw = await example.createOCSPReq();
    const asn1 = asn1js.fromBER(ocspReqRaw);
    pkijs.AsnError.assert(asn1, "OCSPRequest");
    new pkijs.OCSPRequest({ schema: asn1.result });
  });
});

