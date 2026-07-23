import { Crypto as NodeCrypto } from "@peculiar/webcrypto";
import * as pkijs from "../src/index";

const webcrypto = new NodeCrypto();
const name = "newEngine";
pkijs.setEngine(name, new pkijs.CryptoEngine({ name, crypto: webcrypto }));
