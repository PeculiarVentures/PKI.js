import { Crypto } from "@peculiar/webcrypto";
import * as pkijs from "../src";

const webcrypto = new Crypto();
pkijs.setEngine("newEngine", new pkijs.CryptoEngine({ name: "newEngine", crypto: webcrypto }));
