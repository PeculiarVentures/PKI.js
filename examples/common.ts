import * as asn1js from "asn1js";
import * as pkijs from "../src";
import { BufferSourceConverter, Convert } from "pvtsutils";
import * as utils from "../test/utils";

export function getElement(id: string, type: "span"): HTMLSpanElement;
export function getElement(id: string, type: "select"): HTMLSelectElement;
export function getElement(id: string, type: "input"): HTMLInputElement;
export function getElement(id: string, type: "textarea"): HTMLTextAreaElement;
export function getElement(id: string, type: "table"): HTMLTableElement;
export function getElement(id: string): HTMLElement;
export function getElement(id: string, type?: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Element with id '${id}' does not exist`);
  }
  if (type && el.nodeName.toLowerCase() !== type) {
    throw new TypeError(`Element '${el.nodeName}' is not requested type '${type}'`);
  }

  return el;
}

export class Assert {
  public static ok(value: unknown, message?: string): asserts value {
    if (!value) {
      throw new Error(message || "Value is empty");
    }
  }
}

export function handleFileBrowse(evt: Event, cb: (file: ArrayBuffer) => void) {
  Assert.ok(evt.target);
  const target = evt.target as HTMLInputElement;
  const currentFiles = target.files;
  Assert.ok(currentFiles);

  const tempReader = new FileReader();
  tempReader.onload =
    (event) => {
      Assert.ok(event.target);
      const file = event.target.result;
      if (!(file instanceof ArrayBuffer)) {
        throw new Error("incorrect type of the file. Must be ArrayBuffer");
      }
      cb(file);
    };

  if (currentFiles.length) {
    tempReader.readAsArrayBuffer(currentFiles[0]);
  }
}

function decodePEM(pem: string, tag = "[A-Z0-9 ]+"): ArrayBuffer[] {
  const pattern = new RegExp(`-{5}BEGIN ${tag}-{5}([a-zA-Z0-9=+\\/\\n\\r]+)-{5}END ${tag}-{5}`, "g");

  const res: ArrayBuffer[] = [];
  let matches: RegExpExecArray | null = null;
  // eslint-disable-next-line no-cond-assign
  while (matches = pattern.exec(pem)) {
    const base64 = matches[1]
      .replace(/\r/g, "")
      .replace(/\n/g, "");
    res.push(Convert.FromBase64(base64));
  }

  return res;
}

export function parseCertificate(source: BufferSource): pkijs.Certificate[] {
  const buffers: ArrayBuffer[] = [];

  const buffer = BufferSourceConverter.toArrayBuffer(source);
  const pem = Convert.ToBinary(buffer);
  if (/----BEGIN CERTIFICATE-----/.test(pem)) {
    buffers.push(...decodePEM(pem, "CERTIFICATE"));
  } else {
    buffers.push(buffer);
  }

  const res: pkijs.Certificate[] = [];
  for (const item of buffers) {
    const asn1 = asn1js.fromBER(buffer);
    if (asn1.offset === (-1)) {
      throw new Error("Bad encoded ASN.1");
    }

    res.push(new pkijs.Certificate({ schema: asn1.result }));
  }

  return res;
}


export function processError(e: unknown, message: string) {
  console.error(e);
  alert(`${message}.See developer console for more details`);
}