import CryptoEngine from "../src/CryptoEngine";

const { Crypto } = require("@peculiar/webcrypto");
const webcrypto = new Crypto();

const assert = require("assert");
setEngine("newEngine", webcrypto, new CryptoEngine({ name: "", crypto: webcrypto, subtle: webcrypto.subtle }));
