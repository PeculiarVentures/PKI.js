import * as asn1js from "asn1js";
import * as Schema from "./Schema";

export type ExtensionParsedValue = (Schema.SchemaCompatible & {
  parsingError?: string;
}) | Schema.SchemaType;

export interface ExtensionValueType {
  name: string;
  type: ExtensionValueConstructor;
}

export interface ExtensionValueConstructor {
  new(params?: { schema: any; }): Schema.SchemaCompatible;
}

export class ExtensionValueFactory {

  public static readonly types: Record<string, ExtensionValueType> = {};

  public static fromBER(id: string, raw: ArrayBuffer): ExtensionParsedValue | null {
    const asn1 = asn1js.fromBER(raw);
    if (asn1.offset === (-1)) {
      return null;
    }

    const item = this.find(id);
    if (item) {
      try {
        return new item.type({ schema: asn1.result });
      } catch (ex) {
        const res: ExtensionParsedValue = new item.type();
        res.parsingError = `Incorrectly formatted value of extension ${item.name} (${id})`;

        return res;
      }
    }

    return asn1.result;
  }

  public static find(id: string): ExtensionValueType | null {
    return this.types[id] || null;
  }

  public static register(id: string, name: string, type: ExtensionValueConstructor) {
    this.types[id] = { name, type };
  }

}

export function extensionValue(id: string, name: string) {
  return (target: ExtensionValueConstructor) => {
    ExtensionValueFactory.register(id, name, target);
  };
}
