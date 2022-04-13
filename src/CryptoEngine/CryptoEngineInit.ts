import * as common from "../common";
import { CryptoEngine } from "./CryptoEngine";

export function initCryptoEngine() {
  if (typeof self !== "undefined") {
    if ("crypto" in self) {
      let engineName = "webcrypto";

      const cryptoObject = self.crypto;
      let subtleObject;

      // Apple Safari support
      if ("webkitSubtle" in self.crypto) {
        try {
          subtleObject = (self.crypto as any).webkitSubtle;
        }
        catch (ex) {
          subtleObject = self.crypto.subtle;
        }

        engineName = "safari";
      }

      if ("subtle" in self.crypto)
        subtleObject = self.crypto.subtle;


      if (typeof subtleObject === "undefined") {
        common.engine.name = engineName,
          common.engine.crypto = cryptoObject,
          common.engine.subtle = null;
      }
      else {
        common.engine.name = engineName,
          common.engine.crypto = cryptoObject,
          common.engine.subtle = new CryptoEngine({ name: engineName, crypto: self.crypto as any, subtle: subtleObject });
      }
    }
  }

  common.setEngine(common.engine.name, common.engine.crypto, common.engine.subtle);
}
