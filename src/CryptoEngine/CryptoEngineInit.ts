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


      common.engine.name = engineName;
      if (typeof subtleObject === "undefined") {
        common.engine.crypto = cryptoObject;
        common.engine.subtle = null;
      }
      else {
        common.engine.crypto = cryptoObject;
        common.engine.subtle = new CryptoEngine({ name: engineName, crypto: self.crypto as any, subtle: subtleObject });
      }
    }
  }
  if (typeof crypto !== "undefined" && "webcrypto" in crypto) {
    // NodeJS ^15
    const name = "NodeJS ^15";
    common.engine.name = name;
    const nodeCrypto = (crypto as any).webcrypto as Crypto;
    common.engine.crypto = (nodeCrypto as any).webcrypto;
    common.engine.subtle = new CryptoEngine({ name, crypto: nodeCrypto, subtle: nodeCrypto.subtle });
  }

  common.setEngine(common.engine.name, common.engine.crypto, common.engine.subtle);
}
