import * as asn1js from "asn1js";

export interface AsnFromBerResult {
  offset: number;
  result: any;
}

export class AsnError extends Error {
  public static assert(asn: AsnFromBerResult, target: string): void {
    if (asn.offset === -1) {
      throw new AsnError(`Error during parsing of ASN.1 data. Data is not correct for '${target}'.`);
    }
  }

  constructor(message: string) {
    super(message);

    this.name = "AsnError";
  }

}