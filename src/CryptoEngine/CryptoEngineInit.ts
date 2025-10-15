import * as common from "../common";
import { CryptoEngine } from "./CryptoEngine";

export function initCryptoEngine() {
  if (typeof globalThis !== "undefined" && "crypto" in globalThis) {
    let engineName = "webcrypto";

    // Apple Safari support
    if ("webkitSubtle" in globalThis.crypto) {
      engineName = "safari";
    }

    common.setEngine(engineName, new CryptoEngine({ name: engineName, crypto: globalThis.crypto }));
  } else if (typeof crypto !== "undefined" && "webcrypto" in crypto) {
    // NodeJS ^15
    const name = "NodeJS ^15";
    const nodeCrypto = (crypto as any).webcrypto as Crypto;
    common.setEngine(name, new CryptoEngine({ name, crypto: nodeCrypto }));
  }

}
