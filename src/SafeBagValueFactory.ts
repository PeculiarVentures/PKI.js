export type BagType = PrivateKeyInfo | PKCS8ShroudedKeyBag | CertBag | CRLBag | SecretBag | SafeContents;

export interface BagTypeConstructor<T extends BagType> {
  new(params: { schema: any; }): T;
}

export class SafeBagValueFactory {
  private static items?: Record<string, BagTypeConstructor<BagType>>;

  private static getItems(): Record<string, BagTypeConstructor<BagType>> {
    if (!this.items) {
      this.items = {};

      SafeBagValueFactory.register("1.2.840.113549.1.12.10.1.1", PrivateKeyInfo);
      SafeBagValueFactory.register("1.2.840.113549.1.12.10.1.2", PKCS8ShroudedKeyBag);
      SafeBagValueFactory.register("1.2.840.113549.1.12.10.1.3", CertBag);
      SafeBagValueFactory.register("1.2.840.113549.1.12.10.1.4", CRLBag);
      SafeBagValueFactory.register("1.2.840.113549.1.12.10.1.5", SecretBag);
      SafeBagValueFactory.register("1.2.840.113549.1.12.10.1.6", SafeContents);
    }

    return this.items;
  }
  public static register<T extends BagType = BagType>(id: string, type: BagTypeConstructor<T>): void {
    this.getItems()[id] = type;
  }

  public static find(id: string): BagTypeConstructor<BagType> | null {
    return this.getItems()[id] || null;
  }

}

//! NOTE Bag type must be imported after the SafeBagValueFactory declaration
import { CertBag } from "./CertBag";
import { CRLBag } from "./CRLBag";
import { PKCS8ShroudedKeyBag } from "./PKCS8ShroudedKeyBag";
import { PrivateKeyInfo } from "./PrivateKeyInfo";
import { SafeContents } from "./SafeContents";
import { SecretBag } from "./SecretBag";