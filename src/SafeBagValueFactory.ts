export type BagType = PrivateKeyInfo | PKCS8ShroudedKeyBag | CertBag | CRLBag | SecretBag | SafeContents;

export interface BagTypeConstructor<T extends BagType> {
  new(params: { schema: any; }): T;
}

export class SafeBagValueFactory {
  private static items?: Record<string, BagTypeConstructor<BagType>>;
  public static register<T extends BagType = BagType>(id: string, type: BagTypeConstructor<T>): void {
    if (!this.items) {
      this.items = {};

      SafeBagValueFactory.register("1.2.840.113549.1.12.10.1.1", PrivateKeyInfo);
      SafeBagValueFactory.register("1.2.840.113549.1.12.10.1.2", PKCS8ShroudedKeyBag);
      SafeBagValueFactory.register("1.2.840.113549.1.12.10.1.3", CertBag);
      SafeBagValueFactory.register("1.2.840.113549.1.12.10.1.4", CRLBag);
      SafeBagValueFactory.register("1.2.840.113549.1.12.10.1.5", SecretBag);
      SafeBagValueFactory.register("1.2.840.113549.1.12.10.1.6", SafeContents);
    }
    this.items[id] = type;
  }

  public static find(id: string): BagTypeConstructor<BagType> | null {
    return this.items?.[id] || null;
  }

}

//! NOTE Bag type must be imported after the SafeBagValueFactory declaration
import { CertBag } from "./CertBag";
import { CRLBag } from "./CRLBag";
import { PKCS8ShroudedKeyBag } from "./PKCS8ShroudedKeyBag";
import { PrivateKeyInfo } from "./PrivateKeyInfo";
import { SafeContents } from "./SafeContents";
import { SecretBag } from "./SecretBag";