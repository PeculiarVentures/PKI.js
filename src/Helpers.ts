import type * as asn1js from "asn1js";
import { EMPTY_STRING } from "./constants";

/**
 * String preparation function. In a future here will be realization of algorithm from RFC4518
 * @param inputString JavaScript string. As soon as for each ASN.1 string type we have a specific
 *                    transformation function here we will work with pure JavaScript string
 * @returns Formatted string
 */
export function stringPrep(inputString: string): string {
  //#region Initial variables
  let isSpace = false;
  let cutResult = EMPTY_STRING;
  //#endregion

  const result = inputString.trim(); // Trim input string

  //#region Change all sequence of SPACE down to SPACE char
  for (let i = 0; i < result.length; i++) {
    if (result.charCodeAt(i) === 32) {
      if (isSpace === false) isSpace = true;
    } else {
      if (isSpace) {
        cutResult += " ";
        isSpace = false;
      }

      cutResult += result[i];
    }
  }
  //#endregion

  return cutResult.toLowerCase();
}

/**
 * Orders the elements of a SET OF as DER requires (X.690, 11.6): ascending by their
 * encodings, with the shorter encoding padded at its trailing end with zero octets.
 * @param values Elements of the SET OF
 * @returns A new array with the elements in DER order
 */
export function sortDerSetOf<T extends asn1js.BaseBlock>(values: T[]): T[] {
  const encoded = values.map((value) => ({ value, der: new Uint8Array(value.toBER(false)) }));
  encoded.sort((a, b) => {
    const length = Math.max(a.der.length, b.der.length);
    for (let i = 0; i < length; i++) {
      const diff = (a.der[i] ?? 0) - (b.der[i] ?? 0);
      if (diff !== 0) return diff;
    }
    return 0;
  });
  return encoded.map((o) => o.value);
}
