var liner = (function (exports) {
  'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  class Debug {
    static get enabled() {
      return typeof self !== "undefined" && self.PV_WEBCRYPTO_LINER_LOG;
    }

    static log(message, ...optionalParams) {
      if (this.enabled) {
        console.log.apply(console, arguments);
      }
    }

    static error(message, ...optionalParams) {
      if (this.enabled) {
        console.error.apply(console, arguments);
      }
    }

    static info(message, ...optionalParams) {
      if (this.enabled) {
        console.info.apply(console, arguments);
      }
    }

    static warn(message, ...optionalParams) {
      if (this.enabled) {
        console.warn.apply(console, arguments);
      }
    }

    static trace(message, ...optionalParams) {
      if (this.enabled) {
        console.trace.apply(console, arguments);
      }
    }

  }

  let window;

  if (typeof self === "undefined") {
    const crypto = require("crypto");

    window = {
      crypto: {
        subtle: {},
        getRandomValues: array => {
          const buf = array.buffer;
          const uint8buf = new Uint8Array(buf);
          const rnd = crypto.randomBytes(uint8buf.length);
          rnd.forEach((octet, index) => uint8buf[index] = octet);
          return array;
        }
      }
    };
  } else {
    window = self;
  }

  const nativeCrypto = window.msCrypto || window.crypto || {};
  let nativeSubtle = null;

  try {
    nativeSubtle = nativeCrypto.subtle || nativeCrypto.webkitSubtle;
  } catch (err) {
    console.warn("Cannot get subtle from crypto", err);
  }
  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */


  function __decorate(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  }

  function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }

      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }

      function step(result) {
        result.done ? resolve(result.value) : new P(function (resolve) {
          resolve(result.value);
        }).then(fulfilled, rejected);
      }

      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }

  function PrepareBuffer(buffer) {
    if (typeof Buffer !== "undefined") {
      return new Uint8Array(buffer);
    } else {
      return new Uint8Array(buffer instanceof ArrayBuffer ? buffer : buffer.buffer);
    }
  }

  class Convert {
    static ToString(buffer, enc = "utf8") {
      const buf = PrepareBuffer(buffer);

      switch (enc.toLowerCase()) {
        case "utf8":
          return this.ToUtf8String(buf);

        case "binary":
          return this.ToBinary(buf);

        case "hex":
          return this.ToHex(buf);

        case "base64":
          return this.ToBase64(buf);

        case "base64url":
          return this.ToBase64Url(buf);

        default:
          throw new Error(`Unknown type of encoding '${enc}'`);
      }
    }

    static FromString(str, enc = "utf8") {
      switch (enc.toLowerCase()) {
        case "utf8":
          return this.FromUtf8String(str);

        case "binary":
          return this.FromBinary(str);

        case "hex":
          return this.FromHex(str);

        case "base64":
          return this.FromBase64(str);

        case "base64url":
          return this.FromBase64Url(str);

        default:
          throw new Error(`Unknown type of encoding '${enc}'`);
      }
    }

    static ToBase64(buffer) {
      const buf = PrepareBuffer(buffer);

      if (typeof btoa !== "undefined") {
        const binary = this.ToString(buf, "binary");
        return btoa(binary);
      } else {
        return Buffer.from(buf).toString("base64");
      }
    }

    static FromBase64(base64Text) {
      base64Text = base64Text.replace(/\n/g, "").replace(/\r/g, "").replace(/\t/g, "").replace(/\s/g, "");

      if (typeof atob !== "undefined") {
        return this.FromBinary(atob(base64Text));
      } else {
        return new Uint8Array(Buffer.from(base64Text, "base64")).buffer;
      }
    }

    static FromBase64Url(base64url) {
      return this.FromBase64(this.Base64Padding(base64url.replace(/\-/g, "+").replace(/\_/g, "/")));
    }

    static ToBase64Url(data) {
      return this.ToBase64(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/\=/g, "");
    }

    static FromUtf8String(text) {
      const s = unescape(encodeURIComponent(text));
      const uintArray = new Uint8Array(s.length);

      for (let i = 0; i < s.length; i++) {
        uintArray[i] = s.charCodeAt(i);
      }

      return uintArray.buffer;
    }

    static ToUtf8String(buffer) {
      const buf = PrepareBuffer(buffer);
      const encodedString = String.fromCharCode.apply(null, buf);
      const decodedString = decodeURIComponent(escape(encodedString));
      return decodedString;
    }

    static FromBinary(text) {
      const stringLength = text.length;
      const resultView = new Uint8Array(stringLength);

      for (let i = 0; i < stringLength; i++) {
        resultView[i] = text.charCodeAt(i);
      }

      return resultView.buffer;
    }

    static ToBinary(buffer) {
      const buf = PrepareBuffer(buffer);
      let resultString = "";
      const len = buf.length;

      for (let i = 0; i < len; i++) {
        resultString = resultString + String.fromCharCode(buf[i]);
      }

      return resultString;
    }

    static ToHex(buffer) {
      const buf = PrepareBuffer(buffer);
      const splitter = "";
      const res = [];
      const len = buf.length;

      for (let i = 0; i < len; i++) {
        const char = buf[i].toString(16);
        res.push(char.length === 1 ? "0" + char : char);
      }

      return res.join(splitter);
    }

    static FromHex(hexString) {
      const res = new Uint8Array(hexString.length / 2);

      for (let i = 0; i < hexString.length; i = i + 2) {
        const c = hexString.slice(i, i + 2);
        res[i / 2] = parseInt(c, 16);
      }

      return res.buffer;
    }

    static Base64Padding(base64) {
      const padCount = 4 - base64.length % 4;

      if (padCount < 4) {
        for (let i = 0; i < padCount; i++) {
          base64 += "=";
        }
      }

      return base64;
    }

  }
  /**
   * Copyright (c) 2019, Peculiar Ventures, All rights reserved.
   */


  class CryptoError extends Error {}

  class AlgorithmError extends CryptoError {}

  class UnsupportedOperationError extends CryptoError {
    constructor(methodName) {
      super(`Unsupported operation: ${methodName ? `${methodName}` : ""}`);
    }

  }

  class OperationError extends CryptoError {}

  class RequiredPropertyError extends CryptoError {
    constructor(propName) {
      super(`${propName}: Missing required property`);
    }

  }

  class BufferSourceConverter {
    static toArrayBuffer(data) {
      if (data instanceof ArrayBuffer) {
        return data;
      }

      if (typeof Buffer !== "undefined" && Buffer.isBuffer(data)) {
        return new Uint8Array(data);
      }

      if (ArrayBuffer.isView(data)) {
        return data.buffer;
      }

      throw new TypeError("The provided value is not of type '(ArrayBuffer or ArrayBufferView)'");
    }

    static toUint8Array(data) {
      return new Uint8Array(this.toArrayBuffer(data));
    }

    static isBufferSource(data) {
      return ArrayBuffer.isView(data) || data instanceof ArrayBuffer;
    }

  }

  function isJWK(data) {
    return typeof data === "object" && "kty" in data;
  }

  class ProviderCrypto {
    digest(algorithm, data) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkDigest.apply(this, arguments);
        return this.onDigest.apply(this, arguments);
      });
    }

    checkDigest(algorithm, data) {
      this.checkAlgorithmName(algorithm);
    }

    onDigest(algorithm, data) {
      return __awaiter(this, void 0, void 0, function* () {
        throw new UnsupportedOperationError("digest");
      });
    }

    generateKey(algorithm, extractable, keyUsages) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkGenerateKey.apply(this, arguments);
        return this.onGenerateKey.apply(this, arguments);
      });
    }

    checkGenerateKey(algorithm, extractable, keyUsages) {
      this.checkAlgorithmName(algorithm);
      this.checkGenerateKeyParams(algorithm);

      if (!(keyUsages && keyUsages.length)) {
        throw new TypeError(`Usages cannot be empty when creating a key.`);
      }

      let allowedUsages;

      if (Array.isArray(this.usages)) {
        allowedUsages = this.usages;
      } else {
        allowedUsages = this.usages.privateKey.concat(this.usages.publicKey);
      }

      this.checkKeyUsages(keyUsages, allowedUsages);
    }

    checkGenerateKeyParams(algorithm) {}

    onGenerateKey(algorithm, extractable, keyUsages) {
      return __awaiter(this, void 0, void 0, function* () {
        throw new UnsupportedOperationError("generateKey");
      });
    }

    sign(algorithm, key, data) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkSign.apply(this, arguments);
        return this.onSign.apply(this, arguments);
      });
    }

    checkSign(algorithm, key, data) {
      this.checkAlgorithmName(algorithm);
      this.checkAlgorithmParams(algorithm);
      this.checkCryptoKey(key, "sign");
    }

    onSign(algorithm, key, data) {
      return __awaiter(this, void 0, void 0, function* () {
        throw new UnsupportedOperationError("sign");
      });
    }

    verify(algorithm, key, signature, data) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkVerify.apply(this, arguments);
        return this.onVerify.apply(this, arguments);
      });
    }

    checkVerify(algorithm, key, signature, data) {
      this.checkAlgorithmName(algorithm);
      this.checkAlgorithmParams(algorithm);
      this.checkCryptoKey(key, "verify");
    }

    onVerify(algorithm, key, signature, data) {
      return __awaiter(this, void 0, void 0, function* () {
        throw new UnsupportedOperationError("verify");
      });
    }

    encrypt(algorithm, key, data, options) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkEncrypt.apply(this, arguments);
        return this.onEncrypt.apply(this, arguments);
      });
    }

    checkEncrypt(algorithm, key, data, options = {}) {
      this.checkAlgorithmName(algorithm);
      this.checkAlgorithmParams(algorithm);
      this.checkCryptoKey(key, options.keyUsage ? "encrypt" : void 0);
    }

    onEncrypt(algorithm, key, data) {
      return __awaiter(this, void 0, void 0, function* () {
        throw new UnsupportedOperationError("encrypt");
      });
    }

    decrypt(algorithm, key, data, options) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkDecrypt.apply(this, arguments);
        return this.onDecrypt.apply(this, arguments);
      });
    }

    checkDecrypt(algorithm, key, data, options = {}) {
      this.checkAlgorithmName(algorithm);
      this.checkAlgorithmParams(algorithm);
      this.checkCryptoKey(key, options.keyUsage ? "decrypt" : void 0);
    }

    onDecrypt(algorithm, key, data) {
      return __awaiter(this, void 0, void 0, function* () {
        throw new UnsupportedOperationError("decrypt");
      });
    }

    deriveBits(algorithm, baseKey, length, options) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkDeriveBits.apply(this, arguments);
        return this.onDeriveBits.apply(this, arguments);
      });
    }

    checkDeriveBits(algorithm, baseKey, length, options = {}) {
      this.checkAlgorithmName(algorithm);
      this.checkAlgorithmParams(algorithm);
      this.checkCryptoKey(baseKey, options.keyUsage ? "deriveBits" : void 0);

      if (length % 8 !== 0) {
        throw new OperationError("length: Is not multiple of 8");
      }
    }

    onDeriveBits(algorithm, baseKey, length) {
      return __awaiter(this, void 0, void 0, function* () {
        throw new UnsupportedOperationError("deriveBits");
      });
    }

    exportKey(format, key) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkExportKey.apply(this, arguments);
        return this.onExportKey.apply(this, arguments);
      });
    }

    checkExportKey(format, key) {
      this.checkKeyFormat(format);
      this.checkCryptoKey(key);

      if (!key.extractable) {
        throw new CryptoError("key: Is not extractable");
      }
    }

    onExportKey(format, key) {
      return __awaiter(this, void 0, void 0, function* () {
        throw new UnsupportedOperationError("exportKey");
      });
    }

    importKey(format, keyData, algorithm, extractable, keyUsages) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkImportKey.apply(this, arguments);
        return this.onImportKey.apply(this, arguments);
      });
    }

    checkImportKey(format, keyData, algorithm, extractable, keyUsages) {
      this.checkKeyFormat(format);
      this.checkKeyData(format, keyData);
      this.checkAlgorithmName(algorithm);
      this.checkImportParams(algorithm);

      if (Array.isArray(this.usages)) {
        this.checkKeyUsages(keyUsages, this.usages);
      }
    }

    onImportKey(format, keyData, algorithm, extractable, keyUsages) {
      return __awaiter(this, void 0, void 0, function* () {
        throw new UnsupportedOperationError("importKey");
      });
    }

    checkAlgorithmName(algorithm) {
      if (algorithm.name.toLowerCase() !== this.name.toLowerCase()) {
        throw new AlgorithmError("Unrecognized name");
      }
    }

    checkAlgorithmParams(algorithm) {}

    checkDerivedKeyParams(algorithm) {}

    checkKeyUsages(usages, allowed) {
      for (const usage of usages) {
        if (allowed.indexOf(usage) === -1) {
          throw new TypeError("Cannot create a key using the specified key usages");
        }
      }
    }

    checkCryptoKey(key, keyUsage) {
      this.checkAlgorithmName(key.algorithm);

      if (keyUsage && key.usages.indexOf(keyUsage) === -1) {
        throw new CryptoError(`key does not match that of operation`);
      }
    }

    checkRequiredProperty(data, propName) {
      if (!(propName in data)) {
        throw new RequiredPropertyError(propName);
      }
    }

    checkHashAlgorithm(algorithm, hashAlgorithms) {
      for (const item of hashAlgorithms) {
        if (item.toLowerCase() === algorithm.name.toLowerCase()) {
          return;
        }
      }

      throw new OperationError(`hash: Must be one of ${hashAlgorithms.join(", ")}`);
    }

    checkImportParams(algorithm) {}

    checkKeyFormat(format) {
      switch (format) {
        case "raw":
        case "pkcs8":
        case "spki":
        case "jwk":
          break;

        default:
          throw new TypeError("format: Is invalid value. Must be 'jwk', 'raw', 'spki', or 'pkcs8'");
      }
    }

    checkKeyData(format, keyData) {
      if (!keyData) {
        throw new TypeError("keyData: Cannot be empty on empty on key importing");
      }

      if (format === "jwk") {
        if (!isJWK(keyData)) {
          throw new TypeError("keyData: Is not JsonWebToken");
        }
      } else if (!BufferSourceConverter.isBufferSource(keyData)) {
        throw new TypeError("keyData: Is not ArrayBufferView or ArrrayBuffer");
      }
    }

    prepareData(data) {
      return BufferSourceConverter.toArrayBuffer(data);
    }

  }

  class AesProvider extends ProviderCrypto {
    checkGenerateKeyParams(algorithm) {
      this.checkRequiredProperty(algorithm, "length");

      if (typeof algorithm.length !== "number") {
        throw new TypeError("length: Is not of type Number");
      }

      switch (algorithm.length) {
        case 128:
        case 192:
        case 256:
          break;

        default:
          throw new TypeError("length: Must be 128, 192, or 256");
      }
    }

    checkDerivedKeyParams(algorithm) {
      this.checkGenerateKeyParams(algorithm);
    }

  }

  class AesCbcProvider extends AesProvider {
    constructor() {
      super(...arguments);
      this.name = "AES-CBC";
      this.usages = ["encrypt", "decrypt", "wrapKey", "unwrapKey"];
    }

    checkAlgorithmParams(algorithm) {
      this.checkRequiredProperty(algorithm, "iv");

      if (!(algorithm.iv instanceof ArrayBuffer || ArrayBuffer.isView(algorithm.iv))) {
        throw new TypeError("iv: Is not of type '(ArrayBuffer or ArrayBufferView)'");
      }

      if (algorithm.iv.byteLength !== 16) {
        throw new TypeError("iv: Must have length 16 bytes");
      }
    }

  }

  class AesCtrProvider extends AesProvider {
    constructor() {
      super(...arguments);
      this.name = "AES-CTR";
      this.usages = ["encrypt", "decrypt", "wrapKey", "unwrapKey"];
    }

    checkAlgorithmParams(algorithm) {
      this.checkRequiredProperty(algorithm, "counter");

      if (!(algorithm.counter instanceof ArrayBuffer || ArrayBuffer.isView(algorithm.counter))) {
        throw new TypeError("counter: Is not of type '(ArrayBuffer or ArrayBufferView)'");
      }

      if (algorithm.counter.byteLength !== 16) {
        throw new TypeError("iv: Must have length 16 bytes");
      }

      this.checkRequiredProperty(algorithm, "length");

      if (typeof algorithm.length !== "number") {
        throw new TypeError("length: Is not a Number");
      }

      if (algorithm.length < 1) {
        throw new OperationError("length: Must be more than 0");
      }
    }

  }

  class AesEcbProvider extends AesProvider {
    constructor() {
      super(...arguments);
      this.name = "AES-ECB";
      this.usages = ["encrypt", "decrypt", "wrapKey", "unwrapKey"];
    }

  }

  class AesGcmProvider extends AesProvider {
    constructor() {
      super(...arguments);
      this.name = "AES-GCM";
      this.usages = ["encrypt", "decrypt", "wrapKey", "unwrapKey"];
    }

    checkAlgorithmParams(algorithm) {
      this.checkRequiredProperty(algorithm, "iv");

      if (!(algorithm.iv instanceof ArrayBuffer || ArrayBuffer.isView(algorithm.iv))) {
        throw new TypeError("iv: Is not of type '(ArrayBuffer or ArrayBufferView)'");
      }

      if (algorithm.iv.byteLength < 1) {
        throw new OperationError("iv: Must have length more than 0 and less than 2^64 - 1");
      }

      if (!("tagLength" in algorithm)) {
        algorithm.tagLength = 128;
      }

      switch (algorithm.tagLength) {
        case 32:
        case 64:
        case 96:
        case 104:
        case 112:
        case 120:
        case 128:
          break;

        default:
          throw new OperationError("tagLength: Must be one of 32, 64, 96, 104, 112, 120 or 128");
      }
    }

  }

  class AesKwProvider extends AesProvider {
    constructor() {
      super(...arguments);
      this.name = "AES-KW";
      this.usages = ["wrapKey", "unwrapKey"];
    }

  }

  class DesProvider extends ProviderCrypto {
    constructor() {
      super(...arguments);
      this.usages = ["encrypt", "decrypt", "wrapKey", "unwrapKey"];
    }

    checkAlgorithmParams(algorithm) {
      if (this.ivSize) {
        this.checkRequiredProperty(algorithm, "iv");

        if (!(algorithm.iv instanceof ArrayBuffer || ArrayBuffer.isView(algorithm.iv))) {
          throw new TypeError("iv: Is not of type '(ArrayBuffer or ArrayBufferView)'");
        }

        if (algorithm.iv.byteLength !== this.ivSize) {
          throw new TypeError(`iv: Must have length ${this.ivSize} bytes`);
        }
      }
    }

    checkGenerateKeyParams(algorithm) {
      this.checkRequiredProperty(algorithm, "length");

      if (typeof algorithm.length !== "number") {
        throw new TypeError("length: Is not of type Number");
      }

      if (algorithm.length !== this.keySizeBits) {
        throw new OperationError(`algorith.length: Must be ${this.keySizeBits}`);
      }
    }

    checkDerivedKeyParams(algorithm) {
      this.checkGenerateKeyParams(algorithm);
    }

  }

  class RsaProvider extends ProviderCrypto {
    constructor() {
      super(...arguments);
      this.hashAlgorithms = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
    }

    checkGenerateKeyParams(algorithm) {
      this.checkRequiredProperty(algorithm, "hash");
      this.checkHashAlgorithm(algorithm.hash, this.hashAlgorithms);
      this.checkRequiredProperty(algorithm, "publicExponent");

      if (!(algorithm.publicExponent && algorithm.publicExponent instanceof Uint8Array)) {
        throw new TypeError("publicExponent: Missing or not a Uint8Array");
      }

      const publicExponent = Convert.ToBase64(algorithm.publicExponent);

      if (!(publicExponent === "Aw==" || publicExponent === "AQAB")) {
        throw new TypeError("publicExponent: Must be [3] or [1,0,1]");
      }

      this.checkRequiredProperty(algorithm, "modulusLength");

      switch (algorithm.modulusLength) {
        case 1024:
        case 2048:
        case 4096:
          break;

        default:
          throw new TypeError("modulusLength: Must be 1024, 2048, or 4096");
      }
    }

    checkImportParams(algorithm) {
      this.checkRequiredProperty(algorithm, "hash");
      this.checkHashAlgorithm(algorithm.hash, this.hashAlgorithms);
    }

  }

  class RsaSsaProvider extends RsaProvider {
    constructor() {
      super(...arguments);
      this.name = "RSASSA-PKCS1-v1_5";
      this.usages = {
        privateKey: ["sign"],
        publicKey: ["verify"]
      };
    }

  }

  class RsaPssProvider extends RsaProvider {
    constructor() {
      super(...arguments);
      this.name = "RSA-PSS";
      this.usages = {
        privateKey: ["sign"],
        publicKey: ["verify"]
      };
    }

    checkAlgorithmParams(algorithm) {
      this.checkRequiredProperty(algorithm, "saltLength");

      if (typeof algorithm.saltLength !== "number") {
        throw new TypeError("saltLength: Is not a Number");
      }

      if (algorithm.saltLength < 1) {
        throw new RangeError("saltLength: Must be more than 0");
      }
    }

  }

  class RsaOaepProvider extends RsaProvider {
    constructor() {
      super(...arguments);
      this.name = "RSA-OAEP";
      this.usages = {
        privateKey: ["decrypt", "unwrapKey"],
        publicKey: ["encrypt", "wrapKey"]
      };
    }

    checkAlgorithmParams(algorithm) {
      if (algorithm.label && !(algorithm.label instanceof ArrayBuffer || ArrayBuffer.isView(algorithm.label))) {
        throw new TypeError("label: Is not of type '(ArrayBuffer or ArrayBufferView)'");
      }
    }

  }

  class EllipticProvider extends ProviderCrypto {
    checkGenerateKeyParams(algorithm) {
      this.checkRequiredProperty(algorithm, "namedCurve");
      this.checkNamedCurve(algorithm.namedCurve);
    }

    checkNamedCurve(namedCurve) {
      for (const item of this.namedCurves) {
        if (item.toLowerCase() === namedCurve.toLowerCase()) {
          return;
        }
      }

      throw new OperationError(`namedCurve: Must be one of ${this.namedCurves.join(", ")}`);
    }

  }

  class EcdsaProvider extends EllipticProvider {
    constructor() {
      super(...arguments);
      this.name = "ECDSA";
      this.hashAlgorithms = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
      this.usages = {
        privateKey: ["sign"],
        publicKey: ["verify"]
      };
      this.namedCurves = ["P-256", "P-384", "P-521", "K-256"];
    }

    checkAlgorithmParams(algorithm) {
      this.checkRequiredProperty(algorithm, "hash");
      this.checkHashAlgorithm(algorithm.hash, this.hashAlgorithms);
    }

  }

  const KEY_TYPES = ["secret", "private", "public"];

  class CryptoKey {
    static create(algorithm, type, extractable, usages) {
      const key = new this();
      key.algorithm = algorithm;
      key.type = type;
      key.extractable = extractable;
      key.usages = usages;
      return key;
    }

    static isKeyType(data) {
      return KEY_TYPES.indexOf(data) !== -1;
    }

  }

  class EcdhProvider extends EllipticProvider {
    constructor() {
      super(...arguments);
      this.name = "ECDH";
      this.usages = {
        privateKey: ["deriveBits", "deriveKey"],
        publicKey: []
      };
      this.namedCurves = ["P-256", "P-384", "P-521"];
    }

    checkAlgorithmParams(algorithm) {
      this.checkRequiredProperty(algorithm, "public");

      if (!(algorithm.public instanceof CryptoKey)) {
        throw new TypeError("public: Is not a CryptoKey");
      }

      if (algorithm.public.type !== "public") {
        throw new OperationError("public: Is not a public key");
      }

      if (algorithm.public.algorithm.name !== this.name) {
        throw new OperationError(`public: Is not ${this.name} key`);
      }
    }

  }

  class Pbkdf2Provider extends ProviderCrypto {
    constructor() {
      super(...arguments);
      this.name = "PBKDF2";
      this.hashAlgorithms = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
      this.usages = ["deriveBits", "deriveKey"];
    }

    checkAlgorithmParams(algorithm) {
      this.checkRequiredProperty(algorithm, "hash");
      this.checkHashAlgorithm(algorithm.hash, this.hashAlgorithms);
      this.checkRequiredProperty(algorithm, "salt");

      if (!(algorithm.salt instanceof ArrayBuffer || ArrayBuffer.isView(algorithm.salt))) {
        throw new TypeError("salt: Is not of type '(ArrayBuffer or ArrayBufferView)'");
      }

      this.checkRequiredProperty(algorithm, "iterations");

      if (typeof algorithm.iterations !== "number") {
        throw new TypeError("iterations: Is not a Number");
      }

      if (algorithm.iterations < 1) {
        throw new TypeError("iterations: Is less than 1");
      }
    }

    checkImportKey(format, keyData, algorithm, extractable, keyUsages) {
      super.checkImportKey(format, keyData, algorithm, extractable, keyUsages);

      if (extractable) {
        throw new SyntaxError("extractable: Must be False");
      }
    }

  }

  class Crypto {}

  class ProviderStorage {
    constructor() {
      this.items = {};
    }

    get(algorithmName) {
      return this.items[algorithmName.toLowerCase()] || null;
    }

    set(provider) {
      this.items[provider.name.toLowerCase()] = provider;
    }

    removeAt(algorithmName) {
      const provider = this.get(algorithmName.toLowerCase());

      if (provider) {
        delete this.items[algorithmName];
      }

      return provider;
    }

    has(name) {
      return !!this.get(name);
    }

    get length() {
      return Object.keys(this.items).length;
    }

    get algorithms() {
      const algorithms = [];

      for (const key in this.items) {
        const provider = this.items[key];
        algorithms.push(provider.name);
      }

      return algorithms.sort();
    }

  }

  class SubtleCrypto {
    constructor() {
      this.providers = new ProviderStorage();
    }

    static isHashedAlgorithm(data) {
      return data instanceof Object && "name" in data && "hash" in data;
    }

    digest(algorithm, data) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkRequiredArguments(arguments, 2, "digest");
        const preparedAlgorithm = this.prepareAlgorithm(algorithm);
        const preparedData = BufferSourceConverter.toArrayBuffer(data);
        const provider = this.getProvider(preparedAlgorithm.name);
        const result = yield provider.digest(preparedAlgorithm, preparedData);
        return result;
      });
    }

    generateKey(algorithm, extractable, keyUsages) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkRequiredArguments(arguments, 3, "generateKey");
        const preparedAlgorithm = this.prepareAlgorithm(algorithm);
        const provider = this.getProvider(preparedAlgorithm.name);
        const result = yield provider.generateKey(Object.assign({}, preparedAlgorithm, {
          name: provider.name
        }), extractable, keyUsages);
        return result;
      });
    }

    sign(algorithm, key, data) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkRequiredArguments(arguments, 3, "sign");
        this.checkCryptoKey(key);
        const preparedAlgorithm = this.prepareAlgorithm(algorithm);
        const preparedData = BufferSourceConverter.toArrayBuffer(data);
        const provider = this.getProvider(preparedAlgorithm.name);
        const result = yield provider.sign(Object.assign({}, preparedAlgorithm, {
          name: provider.name
        }), key, preparedData);
        return result;
      });
    }

    verify(algorithm, key, signature, data) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkRequiredArguments(arguments, 4, "verify");
        this.checkCryptoKey(key);
        const preparedAlgorithm = this.prepareAlgorithm(algorithm);
        const preparedData = BufferSourceConverter.toArrayBuffer(data);
        const preparedSignature = BufferSourceConverter.toArrayBuffer(signature);
        const provider = this.getProvider(preparedAlgorithm.name);
        const result = yield provider.verify(Object.assign({}, preparedAlgorithm, {
          name: provider.name
        }), key, preparedSignature, preparedData);
        return result;
      });
    }

    encrypt(algorithm, key, data) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkRequiredArguments(arguments, 3, "encrypt");
        this.checkCryptoKey(key);
        const preparedAlgorithm = this.prepareAlgorithm(algorithm);
        const preparedData = BufferSourceConverter.toArrayBuffer(data);
        const provider = this.getProvider(preparedAlgorithm.name);
        const result = yield provider.encrypt(Object.assign({}, preparedAlgorithm, {
          name: provider.name
        }), key, preparedData, {
          keyUsage: true
        });
        return result;
      });
    }

    decrypt(algorithm, key, data) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkRequiredArguments(arguments, 3, "decrypt");
        this.checkCryptoKey(key);
        const preparedAlgorithm = this.prepareAlgorithm(algorithm);
        const preparedData = BufferSourceConverter.toArrayBuffer(data);
        const provider = this.getProvider(preparedAlgorithm.name);
        const result = yield provider.decrypt(Object.assign({}, preparedAlgorithm, {
          name: provider.name
        }), key, preparedData, {
          keyUsage: true
        });
        return result;
      });
    }

    deriveBits(algorithm, baseKey, length) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkRequiredArguments(arguments, 3, "deriveBits");
        this.checkCryptoKey(baseKey);
        const preparedAlgorithm = this.prepareAlgorithm(algorithm);
        const provider = this.getProvider(preparedAlgorithm.name);
        const result = yield provider.deriveBits(Object.assign({}, preparedAlgorithm, {
          name: provider.name
        }), baseKey, length, {
          keyUsage: true
        });
        return result;
      });
    }

    deriveKey(algorithm, baseKey, derivedKeyType, extractable, keyUsages) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkRequiredArguments(arguments, 5, "deriveKey");
        const preparedDerivedKeyType = this.prepareAlgorithm(derivedKeyType);
        const importProvider = this.getProvider(preparedDerivedKeyType.name);
        importProvider.checkDerivedKeyParams(preparedDerivedKeyType);
        const preparedAlgorithm = this.prepareAlgorithm(algorithm);
        const provider = this.getProvider(preparedAlgorithm.name);
        provider.checkCryptoKey(baseKey, "deriveKey");
        const derivedBits = yield provider.deriveBits(Object.assign({}, preparedAlgorithm, {
          name: provider.name
        }), baseKey, derivedKeyType.length, {
          keyUsage: false
        });
        return this.importKey("raw", derivedBits, derivedKeyType, extractable, keyUsages);
      });
    }

    exportKey(format, key) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkRequiredArguments(arguments, 2, "exportKey");
        this.checkCryptoKey(key);
        const provider = this.getProvider(key.algorithm.name);
        const result = yield provider.exportKey(format, key);
        return result;
      });
    }

    importKey(format, keyData, algorithm, extractable, keyUsages) {
      return __awaiter(this, arguments, void 0, function* () {
        this.checkRequiredArguments(arguments, 5, "importKey");
        const preparedAlgorithm = this.prepareAlgorithm(algorithm);
        const provider = this.getProvider(preparedAlgorithm.name);

        if (["pkcs8", "spki", "raw"].indexOf(format) !== -1) {
          const preparedData = BufferSourceConverter.toArrayBuffer(keyData);
          return provider.importKey(format, preparedData, Object.assign({}, preparedAlgorithm, {
            name: provider.name
          }), extractable, keyUsages);
        } else {
          if (!keyData.kty) {
            throw new TypeError("keyData: Is not JSON");
          }
        }

        return provider.importKey(format, keyData, Object.assign({}, preparedAlgorithm, {
          name: provider.name
        }), extractable, keyUsages);
      });
    }

    wrapKey(format, key, wrappingKey, wrapAlgorithm) {
      return __awaiter(this, void 0, void 0, function* () {
        let keyData = yield this.exportKey(format, key);

        if (format === "jwk") {
          const json = JSON.stringify(keyData);
          keyData = Convert.FromUtf8String(json);
        }

        const preparedAlgorithm = this.prepareAlgorithm(wrapAlgorithm);
        const preparedData = BufferSourceConverter.toArrayBuffer(keyData);
        const provider = this.getProvider(preparedAlgorithm.name);
        return provider.encrypt(Object.assign({}, preparedAlgorithm, {
          name: provider.name
        }), wrappingKey, preparedData, {
          keyUsage: false
        });
      });
    }

    unwrapKey(format, wrappedKey, unwrappingKey, unwrapAlgorithm, unwrappedKeyAlgorithm, extractable, keyUsages) {
      return __awaiter(this, void 0, void 0, function* () {
        const preparedAlgorithm = this.prepareAlgorithm(unwrapAlgorithm);
        const preparedData = BufferSourceConverter.toArrayBuffer(wrappedKey);
        const provider = this.getProvider(preparedAlgorithm.name);
        let keyData = yield provider.decrypt(Object.assign({}, preparedAlgorithm, {
          name: provider.name
        }), unwrappingKey, preparedData, {
          keyUsage: false
        });

        if (format === "jwk") {
          try {
            keyData = JSON.parse(Convert.ToUtf8String(keyData));
          } catch (e) {
            const error = new TypeError("wrappedKey: Is not a JSON");
            error.internal = e;
            throw error;
          }
        }

        return this.importKey(format, keyData, unwrappedKeyAlgorithm, extractable, keyUsages);
      });
    }

    checkRequiredArguments(args, size, methodName) {
      if (args.length !== size) {
        throw new TypeError(`Failed to execute '${methodName}' on 'SubtleCrypto': ${size} arguments required, but only ${args.length} present`);
      }
    }

    prepareAlgorithm(algorithm) {
      if (typeof algorithm === "string") {
        return {
          name: algorithm
        };
      }

      if (SubtleCrypto.isHashedAlgorithm(algorithm)) {
        const preparedAlgorithm = Object.assign({}, algorithm);
        preparedAlgorithm.hash = this.prepareAlgorithm(algorithm.hash);
        return preparedAlgorithm;
      }

      return Object.assign({}, algorithm);
    }

    getProvider(name) {
      const provider = this.providers.get(name);

      if (!provider) {
        throw new AlgorithmError("Unrecognized name");
      }

      return provider;
    }

    checkCryptoKey(key) {
      if (!(key instanceof CryptoKey)) {
        throw new TypeError(`Key is not of type 'CryptoKey'`);
      }
    }

  }

  function unwrapExports(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
  }

  function createCommonjsModule(fn, module) {
    return module = {
      exports: {}
    }, fn(module, module.exports), module.exports;
  } //**************************************************************************************

  /**
   * Making UTC date from local date
   * @param {Date} date Date to convert from
   * @returns {Date}
   */


  function getUTCDate(date) {
    // noinspection NestedFunctionCallJS, MagicNumberJS
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  } //**************************************************************************************
  // noinspection FunctionWithMultipleReturnPointsJS

  /**
   * Get value for input parameters, or set a default value
   * @param {Object} parameters
   * @param {string} name
   * @param defaultValue
   */


  function getParametersValue(parameters, name, defaultValue) {
    // noinspection ConstantOnRightSideOfComparisonJS, NonBlockStatementBodyJS
    if (parameters instanceof Object === false) return defaultValue; // noinspection NonBlockStatementBodyJS

    if (name in parameters) return parameters[name];
    return defaultValue;
  } //**************************************************************************************

  /**
   * Converts "ArrayBuffer" into a hexdecimal string
   * @param {ArrayBuffer} inputBuffer
   * @param {number} [inputOffset=0]
   * @param {number} [inputLength=inputBuffer.byteLength]
   * @param {boolean} [insertSpace=false]
   * @returns {string}
   */


  function bufferToHexCodes(inputBuffer, inputOffset = 0, inputLength = inputBuffer.byteLength - inputOffset, insertSpace = false) {
    let result = "";

    for (const item of new Uint8Array(inputBuffer, inputOffset, inputLength)) {
      // noinspection ChainedFunctionCallJS
      const str = item.toString(16).toUpperCase(); // noinspection ConstantOnRightSideOfComparisonJS, NonBlockStatementBodyJS

      if (str.length === 1) result += "0";
      result += str; // noinspection NonBlockStatementBodyJS

      if (insertSpace) result += " ";
    }

    return result.trim();
  } //**************************************************************************************
  // noinspection JSValidateJSDoc, FunctionWithMultipleReturnPointsJS

  /**
   * Check input "ArrayBuffer" for common functions
   * @param {LocalBaseBlock} baseBlock
   * @param {ArrayBuffer} inputBuffer
   * @param {number} inputOffset
   * @param {number} inputLength
   * @returns {boolean}
   */


  function checkBufferParams(baseBlock, inputBuffer, inputOffset, inputLength) {
    // noinspection ConstantOnRightSideOfComparisonJS
    if (inputBuffer instanceof ArrayBuffer === false) {
      // noinspection JSUndefinedPropertyAssignment
      baseBlock.error = "Wrong parameter: inputBuffer must be \"ArrayBuffer\"";
      return false;
    } // noinspection ConstantOnRightSideOfComparisonJS


    if (inputBuffer.byteLength === 0) {
      // noinspection JSUndefinedPropertyAssignment
      baseBlock.error = "Wrong parameter: inputBuffer has zero length";
      return false;
    } // noinspection ConstantOnRightSideOfComparisonJS


    if (inputOffset < 0) {
      // noinspection JSUndefinedPropertyAssignment
      baseBlock.error = "Wrong parameter: inputOffset less than zero";
      return false;
    } // noinspection ConstantOnRightSideOfComparisonJS


    if (inputLength < 0) {
      // noinspection JSUndefinedPropertyAssignment
      baseBlock.error = "Wrong parameter: inputLength less than zero";
      return false;
    } // noinspection ConstantOnRightSideOfComparisonJS


    if (inputBuffer.byteLength - inputOffset - inputLength < 0) {
      // noinspection JSUndefinedPropertyAssignment
      baseBlock.error = "End of input reached before message was fully decoded (inconsistent offset and length values)";
      return false;
    }

    return true;
  } //**************************************************************************************
  // noinspection FunctionWithMultipleReturnPointsJS

  /**
   * Convert number from 2^base to 2^10
   * @param {Uint8Array} inputBuffer
   * @param {number} inputBase
   * @returns {number}
   */


  function utilFromBase(inputBuffer, inputBase) {
    let result = 0; // noinspection ConstantOnRightSideOfComparisonJS, NonBlockStatementBodyJS

    if (inputBuffer.length === 1) return inputBuffer[0]; // noinspection ConstantOnRightSideOfComparisonJS, NonBlockStatementBodyJS

    for (let i = inputBuffer.length - 1; i >= 0; i--) result += inputBuffer[inputBuffer.length - 1 - i] * Math.pow(2, inputBase * i);

    return result;
  } //**************************************************************************************
  // noinspection FunctionWithMultipleLoopsJS, FunctionWithMultipleReturnPointsJS

  /**
   * Convert number from 2^10 to 2^base
   * @param {!number} value The number to convert
   * @param {!number} base The base for 2^base
   * @param {number} [reserved=0] Pre-defined number of bytes in output array (-1 = limited by function itself)
   * @returns {ArrayBuffer}
   */


  function utilToBase(value, base, reserved = -1) {
    const internalReserved = reserved;
    let internalValue = value;
    let result = 0;
    let biggest = Math.pow(2, base); // noinspection ConstantOnRightSideOfComparisonJS

    for (let i = 1; i < 8; i++) {
      if (value < biggest) {
        let retBuf; // noinspection ConstantOnRightSideOfComparisonJS

        if (internalReserved < 0) {
          retBuf = new ArrayBuffer(i);
          result = i;
        } else {
          // noinspection NonBlockStatementBodyJS
          if (internalReserved < i) return new ArrayBuffer(0);
          retBuf = new ArrayBuffer(internalReserved);
          result = internalReserved;
        }

        const retView = new Uint8Array(retBuf); // noinspection ConstantOnRightSideOfComparisonJS

        for (let j = i - 1; j >= 0; j--) {
          const basis = Math.pow(2, j * base);
          retView[result - j - 1] = Math.floor(internalValue / basis);
          internalValue -= retView[result - j - 1] * basis;
        }

        return retBuf;
      }

      biggest *= Math.pow(2, base);
    }

    return new ArrayBuffer(0);
  } //**************************************************************************************
  // noinspection FunctionWithMultipleLoopsJS

  /**
   * Concatenate two ArrayBuffers
   * @param {...ArrayBuffer} buffers Set of ArrayBuffer
   */


  function utilConcatBuf(...buffers) {
    //region Initial variables
    let outputLength = 0;
    let prevLength = 0; //endregion
    //region Calculate output length
    // noinspection NonBlockStatementBodyJS

    for (const buffer of buffers) outputLength += buffer.byteLength; //endregion


    const retBuf = new ArrayBuffer(outputLength);
    const retView = new Uint8Array(retBuf);

    for (const buffer of buffers) {
      // noinspection NestedFunctionCallJS
      retView.set(new Uint8Array(buffer), prevLength);
      prevLength += buffer.byteLength;
    }

    return retBuf;
  } //**************************************************************************************
  // noinspection FunctionWithMultipleLoopsJS

  /**
   * Concatenate two Uint8Array
   * @param {...Uint8Array} views Set of Uint8Array
   */


  function utilConcatView(...views) {
    //region Initial variables
    let outputLength = 0;
    let prevLength = 0; //endregion
    //region Calculate output length
    // noinspection NonBlockStatementBodyJS

    for (const view of views) outputLength += view.length; //endregion


    const retBuf = new ArrayBuffer(outputLength);
    const retView = new Uint8Array(retBuf);

    for (const view of views) {
      retView.set(view, prevLength);
      prevLength += view.length;
    }

    return retView;
  } //**************************************************************************************
  // noinspection FunctionWithMultipleLoopsJS

  /**
   * Decoding of "two complement" values
   * The function must be called in scope of instance of "hexBlock" class ("valueHex" and "warnings" properties must be present)
   * @returns {number}
   */


  function utilDecodeTC() {
    const buf = new Uint8Array(this.valueHex); // noinspection ConstantOnRightSideOfComparisonJS

    if (this.valueHex.byteLength >= 2) {
      //noinspection JSBitwiseOperatorUsage, ConstantOnRightSideOfComparisonJS, LocalVariableNamingConventionJS, MagicNumberJS, NonShortCircuitBooleanExpressionJS
      const condition1 = buf[0] === 0xFF && buf[1] & 0x80; // noinspection ConstantOnRightSideOfComparisonJS, LocalVariableNamingConventionJS, MagicNumberJS, NonShortCircuitBooleanExpressionJS

      const condition2 = buf[0] === 0x00 && (buf[1] & 0x80) === 0x00; // noinspection NonBlockStatementBodyJS

      if (condition1 || condition2) this.warnings.push("Needlessly long format");
    } //region Create big part of the integer


    const bigIntBuffer = new ArrayBuffer(this.valueHex.byteLength);
    const bigIntView = new Uint8Array(bigIntBuffer); // noinspection NonBlockStatementBodyJS

    for (let i = 0; i < this.valueHex.byteLength; i++) bigIntView[i] = 0; // noinspection MagicNumberJS, NonShortCircuitBooleanExpressionJS


    bigIntView[0] = buf[0] & 0x80; // mask only the biggest bit

    const bigInt = utilFromBase(bigIntView, 8); //endregion
    //region Create small part of the integer

    const smallIntBuffer = new ArrayBuffer(this.valueHex.byteLength);
    const smallIntView = new Uint8Array(smallIntBuffer); // noinspection NonBlockStatementBodyJS

    for (let j = 0; j < this.valueHex.byteLength; j++) smallIntView[j] = buf[j]; // noinspection MagicNumberJS


    smallIntView[0] &= 0x7F; // mask biggest bit

    const smallInt = utilFromBase(smallIntView, 8); //endregion

    return smallInt - bigInt;
  } //**************************************************************************************
  // noinspection FunctionWithMultipleLoopsJS, FunctionWithMultipleReturnPointsJS

  /**
   * Encode integer value to "two complement" format
   * @param {number} value Value to encode
   * @returns {ArrayBuffer}
   */


  function utilEncodeTC(value) {
    // noinspection ConstantOnRightSideOfComparisonJS, ConditionalExpressionJS
    const modValue = value < 0 ? value * -1 : value;
    let bigInt = 128; // noinspection ConstantOnRightSideOfComparisonJS

    for (let i = 1; i < 8; i++) {
      if (modValue <= bigInt) {
        // noinspection ConstantOnRightSideOfComparisonJS
        if (value < 0) {
          const smallInt = bigInt - modValue;
          const retBuf = utilToBase(smallInt, 8, i);
          const retView = new Uint8Array(retBuf); // noinspection MagicNumberJS

          retView[0] |= 0x80;
          return retBuf;
        }

        let retBuf = utilToBase(modValue, 8, i);
        let retView = new Uint8Array(retBuf); //noinspection JSBitwiseOperatorUsage, MagicNumberJS, NonShortCircuitBooleanExpressionJS

        if (retView[0] & 0x80) {
          //noinspection JSCheckFunctionSignatures
          const tempBuf = retBuf.slice(0);
          const tempView = new Uint8Array(tempBuf);
          retBuf = new ArrayBuffer(retBuf.byteLength + 1); // noinspection ReuseOfLocalVariableJS

          retView = new Uint8Array(retBuf); // noinspection NonBlockStatementBodyJS

          for (let k = 0; k < tempBuf.byteLength; k++) retView[k + 1] = tempView[k]; // noinspection MagicNumberJS


          retView[0] = 0x00;
        }

        return retBuf;
      }

      bigInt *= Math.pow(2, 8);
    }

    return new ArrayBuffer(0);
  } //**************************************************************************************
  // noinspection FunctionWithMultipleReturnPointsJS, ParameterNamingConventionJS

  /**
   * Compare two array buffers
   * @param {!ArrayBuffer} inputBuffer1
   * @param {!ArrayBuffer} inputBuffer2
   * @returns {boolean}
   */


  function isEqualBuffer(inputBuffer1, inputBuffer2) {
    // noinspection NonBlockStatementBodyJS
    if (inputBuffer1.byteLength !== inputBuffer2.byteLength) return false; // noinspection LocalVariableNamingConventionJS

    const view1 = new Uint8Array(inputBuffer1); // noinspection LocalVariableNamingConventionJS

    const view2 = new Uint8Array(inputBuffer2);

    for (let i = 0; i < view1.length; i++) {
      // noinspection NonBlockStatementBodyJS
      if (view1[i] !== view2[i]) return false;
    }

    return true;
  } //**************************************************************************************
  // noinspection FunctionWithMultipleReturnPointsJS

  /**
   * Pad input number with leade "0" if needed
   * @returns {string}
   * @param {number} inputNumber
   * @param {number} fullLength
   */


  function padNumber(inputNumber, fullLength) {
    const str = inputNumber.toString(10); // noinspection NonBlockStatementBodyJS

    if (fullLength < str.length) return "";
    const dif = fullLength - str.length;
    const padding = new Array(dif); // noinspection NonBlockStatementBodyJS

    for (let i = 0; i < dif; i++) padding[i] = "0";

    const paddingString = padding.join("");
    return paddingString.concat(str);
  } //**************************************************************************************


  const base64Template = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  const base64UrlTemplate = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_="; //**************************************************************************************
  // noinspection FunctionWithMultipleLoopsJS, OverlyComplexFunctionJS, FunctionTooLongJS, FunctionNamingConventionJS

  /**
   * Encode string into BASE64 (or "base64url")
   * @param {string} input
   * @param {boolean} useUrlTemplate If "true" then output would be encoded using "base64url"
   * @param {boolean} skipPadding Skip BASE-64 padding or not
   * @param {boolean} skipLeadingZeros Skip leading zeros in input data or not
   * @returns {string}
   */

  function toBase64(input, useUrlTemplate = false, skipPadding = false, skipLeadingZeros = false) {
    let i = 0; // noinspection LocalVariableNamingConventionJS

    let flag1 = 0; // noinspection LocalVariableNamingConventionJS

    let flag2 = 0;
    let output = ""; // noinspection ConditionalExpressionJS

    const template = useUrlTemplate ? base64UrlTemplate : base64Template;

    if (skipLeadingZeros) {
      let nonZeroPosition = 0;

      for (let i = 0; i < input.length; i++) {
        // noinspection ConstantOnRightSideOfComparisonJS
        if (input.charCodeAt(i) !== 0) {
          nonZeroPosition = i; // noinspection BreakStatementJS

          break;
        }
      } // noinspection AssignmentToFunctionParameterJS


      input = input.slice(nonZeroPosition);
    }

    while (i < input.length) {
      // noinspection LocalVariableNamingConventionJS, IncrementDecrementResultUsedJS
      const chr1 = input.charCodeAt(i++); // noinspection NonBlockStatementBodyJS

      if (i >= input.length) flag1 = 1; // noinspection LocalVariableNamingConventionJS, IncrementDecrementResultUsedJS

      const chr2 = input.charCodeAt(i++); // noinspection NonBlockStatementBodyJS

      if (i >= input.length) flag2 = 1; // noinspection LocalVariableNamingConventionJS, IncrementDecrementResultUsedJS

      const chr3 = input.charCodeAt(i++); // noinspection LocalVariableNamingConventionJS

      const enc1 = chr1 >> 2; // noinspection LocalVariableNamingConventionJS, MagicNumberJS, NonShortCircuitBooleanExpressionJS

      const enc2 = (chr1 & 0x03) << 4 | chr2 >> 4; // noinspection LocalVariableNamingConventionJS, MagicNumberJS, NonShortCircuitBooleanExpressionJS

      let enc3 = (chr2 & 0x0F) << 2 | chr3 >> 6; // noinspection LocalVariableNamingConventionJS, MagicNumberJS, NonShortCircuitBooleanExpressionJS

      let enc4 = chr3 & 0x3F; // noinspection ConstantOnRightSideOfComparisonJS

      if (flag1 === 1) {
        // noinspection NestedAssignmentJS, AssignmentResultUsedJS, MagicNumberJS
        enc3 = enc4 = 64;
      } else {
        // noinspection ConstantOnRightSideOfComparisonJS
        if (flag2 === 1) {
          // noinspection MagicNumberJS
          enc4 = 64;
        }
      } // noinspection NonBlockStatementBodyJS


      if (skipPadding) {
        // noinspection ConstantOnRightSideOfComparisonJS, NonBlockStatementBodyJS, MagicNumberJS
        if (enc3 === 64) output += `${template.charAt(enc1)}${template.charAt(enc2)}`;else {
          // noinspection ConstantOnRightSideOfComparisonJS, NonBlockStatementBodyJS, MagicNumberJS
          if (enc4 === 64) output += `${template.charAt(enc1)}${template.charAt(enc2)}${template.charAt(enc3)}`;else output += `${template.charAt(enc1)}${template.charAt(enc2)}${template.charAt(enc3)}${template.charAt(enc4)}`;
        }
      } else output += `${template.charAt(enc1)}${template.charAt(enc2)}${template.charAt(enc3)}${template.charAt(enc4)}`;
    }

    return output;
  } //**************************************************************************************
  // noinspection FunctionWithMoreThanThreeNegationsJS, FunctionWithMultipleLoopsJS, OverlyComplexFunctionJS, FunctionNamingConventionJS

  /**
   * Decode string from BASE64 (or "base64url")
   * @param {string} input
   * @param {boolean} [useUrlTemplate=false] If "true" then output would be encoded using "base64url"
   * @param {boolean} [cutTailZeros=false] If "true" then cut tailing zeroz from function result
   * @returns {string}
   */


  function fromBase64(input, useUrlTemplate = false, cutTailZeros = false) {
    // noinspection ConditionalExpressionJS
    const template = useUrlTemplate ? base64UrlTemplate : base64Template; //region Aux functions
    // noinspection FunctionWithMultipleReturnPointsJS, NestedFunctionJS

    function indexof(toSearch) {
      // noinspection ConstantOnRightSideOfComparisonJS, MagicNumberJS
      for (let i = 0; i < 64; i++) {
        // noinspection NonBlockStatementBodyJS
        if (template.charAt(i) === toSearch) return i;
      } // noinspection MagicNumberJS


      return 64;
    } // noinspection NestedFunctionJS


    function test(incoming) {
      // noinspection ConstantOnRightSideOfComparisonJS, ConditionalExpressionJS, MagicNumberJS
      return incoming === 64 ? 0x00 : incoming;
    } //endregion


    let i = 0;
    let output = "";

    while (i < input.length) {
      // noinspection NestedFunctionCallJS, LocalVariableNamingConventionJS, IncrementDecrementResultUsedJS
      const enc1 = indexof(input.charAt(i++)); // noinspection NestedFunctionCallJS, LocalVariableNamingConventionJS, ConditionalExpressionJS, MagicNumberJS, IncrementDecrementResultUsedJS

      const enc2 = i >= input.length ? 0x00 : indexof(input.charAt(i++)); // noinspection NestedFunctionCallJS, LocalVariableNamingConventionJS, ConditionalExpressionJS, MagicNumberJS, IncrementDecrementResultUsedJS

      const enc3 = i >= input.length ? 0x00 : indexof(input.charAt(i++)); // noinspection NestedFunctionCallJS, LocalVariableNamingConventionJS, ConditionalExpressionJS, MagicNumberJS, IncrementDecrementResultUsedJS

      const enc4 = i >= input.length ? 0x00 : indexof(input.charAt(i++)); // noinspection LocalVariableNamingConventionJS, NonShortCircuitBooleanExpressionJS

      const chr1 = test(enc1) << 2 | test(enc2) >> 4; // noinspection LocalVariableNamingConventionJS, MagicNumberJS, NonShortCircuitBooleanExpressionJS

      const chr2 = (test(enc2) & 0x0F) << 4 | test(enc3) >> 2; // noinspection LocalVariableNamingConventionJS, MagicNumberJS, NonShortCircuitBooleanExpressionJS

      const chr3 = (test(enc3) & 0x03) << 6 | test(enc4);
      output += String.fromCharCode(chr1); // noinspection ConstantOnRightSideOfComparisonJS, NonBlockStatementBodyJS, MagicNumberJS

      if (enc3 !== 64) output += String.fromCharCode(chr2); // noinspection ConstantOnRightSideOfComparisonJS, NonBlockStatementBodyJS, MagicNumberJS

      if (enc4 !== 64) output += String.fromCharCode(chr3);
    }

    if (cutTailZeros) {
      const outputLength = output.length;
      let nonZeroStart = -1; // noinspection ConstantOnRightSideOfComparisonJS

      for (let i = outputLength - 1; i >= 0; i--) {
        // noinspection ConstantOnRightSideOfComparisonJS
        if (output.charCodeAt(i) !== 0) {
          nonZeroStart = i; // noinspection BreakStatementJS

          break;
        }
      } // noinspection NonBlockStatementBodyJS, NegatedIfStatementJS


      if (nonZeroStart !== -1) output = output.slice(0, nonZeroStart + 1);else output = "";
    }

    return output;
  } //**************************************************************************************


  function arrayBufferToString(buffer) {
    let resultString = "";
    const view = new Uint8Array(buffer); // noinspection NonBlockStatementBodyJS

    for (const element of view) resultString += String.fromCharCode(element);

    return resultString;
  } //**************************************************************************************


  function stringToArrayBuffer(str) {
    const stringLength = str.length;
    const resultBuffer = new ArrayBuffer(stringLength);
    const resultView = new Uint8Array(resultBuffer); // noinspection NonBlockStatementBodyJS

    for (let i = 0; i < stringLength; i++) resultView[i] = str.charCodeAt(i);

    return resultBuffer;
  } //**************************************************************************************


  const log2 = Math.log(2); //**************************************************************************************
  // noinspection FunctionNamingConventionJS

  /**
   * Get nearest to input length power of 2
   * @param {number} length Current length of existing array
   * @returns {number}
   */

  function nearestPowerOf2(length) {
    const base = Math.log(length) / log2;
    const floor = Math.floor(base);
    const round = Math.round(base); // noinspection ConditionalExpressionJS

    return floor === round ? floor : round;
  } //**************************************************************************************

  /**
   * Delete properties by name from specified object
   * @param {Object} object Object to delete properties from
   * @param {Array.<string>} propsArray Array of properties names
   */


  function clearProps(object, propsArray) {
    for (const prop of propsArray) delete object[prop];
  } //**************************************************************************************


  var utils =
  /*#__PURE__*/
  Object.freeze({
    getUTCDate: getUTCDate,
    getParametersValue: getParametersValue,
    bufferToHexCodes: bufferToHexCodes,
    checkBufferParams: checkBufferParams,
    utilFromBase: utilFromBase,
    utilToBase: utilToBase,
    utilConcatBuf: utilConcatBuf,
    utilConcatView: utilConcatView,
    utilDecodeTC: utilDecodeTC,
    utilEncodeTC: utilEncodeTC,
    isEqualBuffer: isEqualBuffer,
    padNumber: padNumber,
    toBase64: toBase64,
    fromBase64: fromBase64,
    arrayBufferToString: arrayBufferToString,
    stringToArrayBuffer: stringToArrayBuffer,
    nearestPowerOf2: nearestPowerOf2,
    clearProps: clearProps
  });
  var asn1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.RawData = exports.Repeated = exports.Any = exports.Choice = exports.TIME = exports.Duration = exports.DateTime = exports.TimeOfDay = exports.DATE = exports.GeneralizedTime = exports.UTCTime = exports.CharacterString = exports.GeneralString = exports.VisibleString = exports.GraphicString = exports.IA5String = exports.VideotexString = exports.TeletexString = exports.PrintableString = exports.NumericString = exports.UniversalString = exports.BmpString = exports.Utf8String = exports.ObjectIdentifier = exports.Enumerated = exports.Integer = exports.BitString = exports.OctetString = exports.Null = exports.Set = exports.Sequence = exports.Boolean = exports.EndOfContent = exports.Constructed = exports.Primitive = exports.BaseBlock = undefined;
    exports.fromBER = fromBER;
    exports.compareSchema = compareSchema;
    exports.verifySchema = verifySchema;
    exports.fromJSON = fromJSON; //**************************************************************************************
    //region Declaration of global variables
    //**************************************************************************************

    const powers2 = [new Uint8Array([1])];
    /* eslint-disable indent */

    /*
     * Copyright (c) 2016-2018, Peculiar Ventures
     * All rights reserved.
     *
     * Author 2016-2018, Yury Strozhevsky <www.strozhevsky.com>.
     *
     * Redistribution and use in source and binary forms, with or without modification,
     * are permitted provided that the following conditions are met:
     *
     * 1. Redistributions of source code must retain the above copyright notice,
     *    this list of conditions and the following disclaimer.
     *
     * 2. Redistributions in binary form must reproduce the above copyright notice,
     *    this list of conditions and the following disclaimer in the documentation
     *    and/or other materials provided with the distribution.
     *
     * 3. Neither the name of the copyright holder nor the names of its contributors
     *    may be used to endorse or promote products derived from this software without
     *    specific prior written permission.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
     * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
     * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
     * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
     * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
     * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
     * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
     * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
     * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
     * OF SUCH DAMAGE.
     *
     */
    //**************************************************************************************

    const digitsString = "0123456789"; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration for "LocalBaseBlock" class
    //**************************************************************************************

    /**
     * Class used as a base block for all remaining ASN.1 classes
     * @typedef LocalBaseBlock
     * @interface
     * @property {number} blockLength
     * @property {string} error
     * @property {Array.<string>} warnings
     * @property {ArrayBuffer} valueBeforeDecode
     */

    class LocalBaseBlock {
      //**********************************************************************************

      /**
       * Constructor for "LocalBaseBlock" class
       * @param {Object} [parameters={}]
       * @property {ArrayBuffer} [valueBeforeDecode]
       */
      constructor(parameters = {}) {
        /**
         * @type {number} blockLength
         */
        this.blockLength = (0, utils.getParametersValue)(parameters, "blockLength", 0);
        /**
         * @type {string} error
         */

        this.error = (0, utils.getParametersValue)(parameters, "error", "");
        /**
         * @type {Array.<string>} warnings
         */

        this.warnings = (0, utils.getParametersValue)(parameters, "warnings", []); //noinspection JSCheckFunctionSignatures

        /**
         * @type {ArrayBuffer} valueBeforeDecode
         */

        if ("valueBeforeDecode" in parameters) this.valueBeforeDecode = parameters.valueBeforeDecode.slice(0);else this.valueBeforeDecode = new ArrayBuffer(0);
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "baseBlock";
      } //**********************************************************************************

      /**
       * Convertion for the block to JSON object
       * @returns {{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
       */


      toJSON() {
        return {
          blockName: this.constructor.blockName(),
          blockLength: this.blockLength,
          error: this.error,
          warnings: this.warnings,
          valueBeforeDecode: (0, utils.bufferToHexCodes)(this.valueBeforeDecode, 0, this.valueBeforeDecode.byteLength)
        };
      } //**********************************************************************************


    } //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Description for "LocalHexBlock" class
    //**************************************************************************************

    /**
     * Class used as a base block for all remaining ASN.1 classes
     * @extends LocalBaseBlock
     * @typedef LocalHexBlock
     * @property {number} blockLength
     * @property {string} error
     * @property {Array.<string>} warnings
     * @property {ArrayBuffer} valueBeforeDecode
     * @property {boolean} isHexOnly
     * @property {ArrayBuffer} valueHex
     */
    //noinspection JSUnusedLocalSymbols


    const LocalHexBlock = BaseClass => class LocalHexBlockMixin extends BaseClass {
      //**********************************************************************************
      //noinspection JSUnusedGlobalSymbols

      /**
       * Constructor for "LocalHexBlock" class
       * @param {Object} [parameters={}]
       * @property {ArrayBuffer} [valueHex]
       */
      constructor(parameters = {}) {
        super(parameters);
        /**
         * @type {boolean}
         */

        this.isHexOnly = (0, utils.getParametersValue)(parameters, "isHexOnly", false);
        /**
         * @type {ArrayBuffer}
         */

        if ("valueHex" in parameters) this.valueHex = parameters.valueHex.slice(0);else this.valueHex = new ArrayBuffer(0);
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "hexBlock";
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number} Offset after least decoded byte
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        //region Basic check for parameters
        //noinspection JSCheckFunctionSignatures
        if ((0, utils.checkBufferParams)(this, inputBuffer, inputOffset, inputLength) === false) return -1; //endregion
        //region Getting Uint8Array from ArrayBuffer

        const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength); //endregion
        //region Initial checks

        if (intBuffer.length === 0) {
          this.warnings.push("Zero buffer length");
          return inputOffset;
        } //endregion
        //region Copy input buffer to internal buffer


        this.valueHex = inputBuffer.slice(inputOffset, inputOffset + inputLength); //endregion

        this.blockLength = inputLength;
        return inputOffset + inputLength;
      } //**********************************************************************************

      /**
       * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
       * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
       * @returns {ArrayBuffer}
       */


      toBER(sizeOnly = false) {
        if (this.isHexOnly !== true) {
          this.error = "Flag \"isHexOnly\" is not set, abort";
          return new ArrayBuffer(0);
        }

        if (sizeOnly === true) return new ArrayBuffer(this.valueHex.byteLength); //noinspection JSCheckFunctionSignatures

        return this.valueHex.slice(0);
      } //**********************************************************************************

      /**
       * Convertion for the block to JSON object
       * @returns {Object}
       */


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.blockName = this.constructor.blockName();
        object.isHexOnly = this.isHexOnly;
        object.valueHex = (0, utils.bufferToHexCodes)(this.valueHex, 0, this.valueHex.byteLength);
        return object;
      } //**********************************************************************************


    }; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of identification block class
    //**************************************************************************************


    class LocalIdentificationBlock extends LocalHexBlock(LocalBaseBlock) {
      //**********************************************************************************

      /**
       * Constructor for "LocalBaseBlock" class
       * @param {Object} [parameters={}]
       * @property {Object} [idBlock]
       */
      constructor(parameters = {}) {
        super();

        if ("idBlock" in parameters) {
          //region Properties from hexBlock class
          this.isHexOnly = (0, utils.getParametersValue)(parameters.idBlock, "isHexOnly", false);
          this.valueHex = (0, utils.getParametersValue)(parameters.idBlock, "valueHex", new ArrayBuffer(0)); //endregion

          this.tagClass = (0, utils.getParametersValue)(parameters.idBlock, "tagClass", -1);
          this.tagNumber = (0, utils.getParametersValue)(parameters.idBlock, "tagNumber", -1);
          this.isConstructed = (0, utils.getParametersValue)(parameters.idBlock, "isConstructed", false);
        } else {
          this.tagClass = -1;
          this.tagNumber = -1;
          this.isConstructed = false;
        }
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "identificationBlock";
      } //**********************************************************************************

      /**
       * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
       * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
       * @returns {ArrayBuffer}
       */


      toBER(sizeOnly = false) {
        //region Initial variables
        let firstOctet = 0;
        let retBuf;
        let retView; //endregion

        switch (this.tagClass) {
          case 1:
            firstOctet |= 0x00; // UNIVERSAL

            break;

          case 2:
            firstOctet |= 0x40; // APPLICATION

            break;

          case 3:
            firstOctet |= 0x80; // CONTEXT-SPECIFIC

            break;

          case 4:
            firstOctet |= 0xC0; // PRIVATE

            break;

          default:
            this.error = "Unknown tag class";
            return new ArrayBuffer(0);
        }

        if (this.isConstructed) firstOctet |= 0x20;

        if (this.tagNumber < 31 && !this.isHexOnly) {
          retBuf = new ArrayBuffer(1);
          retView = new Uint8Array(retBuf);

          if (!sizeOnly) {
            let number = this.tagNumber;
            number &= 0x1F;
            firstOctet |= number;
            retView[0] = firstOctet;
          }

          return retBuf;
        }

        if (this.isHexOnly === false) {
          const encodedBuf = (0, utils.utilToBase)(this.tagNumber, 7);
          const encodedView = new Uint8Array(encodedBuf);
          const size = encodedBuf.byteLength;
          retBuf = new ArrayBuffer(size + 1);
          retView = new Uint8Array(retBuf);
          retView[0] = firstOctet | 0x1F;

          if (!sizeOnly) {
            for (let i = 0; i < size - 1; i++) retView[i + 1] = encodedView[i] | 0x80;

            retView[size] = encodedView[size - 1];
          }

          return retBuf;
        }

        retBuf = new ArrayBuffer(this.valueHex.byteLength + 1);
        retView = new Uint8Array(retBuf);
        retView[0] = firstOctet | 0x1F;

        if (sizeOnly === false) {
          const curView = new Uint8Array(this.valueHex);

          for (let i = 0; i < curView.length - 1; i++) retView[i + 1] = curView[i] | 0x80;

          retView[this.valueHex.byteLength] = curView[curView.length - 1];
        }

        return retBuf;
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number}
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        //region Basic check for parameters
        //noinspection JSCheckFunctionSignatures
        if ((0, utils.checkBufferParams)(this, inputBuffer, inputOffset, inputLength) === false) return -1; //endregion
        //region Getting Uint8Array from ArrayBuffer

        const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength); //endregion
        //region Initial checks

        if (intBuffer.length === 0) {
          this.error = "Zero buffer length";
          return -1;
        } //endregion
        //region Find tag class


        const tagClassMask = intBuffer[0] & 0xC0;

        switch (tagClassMask) {
          case 0x00:
            this.tagClass = 1; // UNIVERSAL

            break;

          case 0x40:
            this.tagClass = 2; // APPLICATION

            break;

          case 0x80:
            this.tagClass = 3; // CONTEXT-SPECIFIC

            break;

          case 0xC0:
            this.tagClass = 4; // PRIVATE

            break;

          default:
            this.error = "Unknown tag class";
            return -1;
        } //endregion
        //region Find it's constructed or not


        this.isConstructed = (intBuffer[0] & 0x20) === 0x20; //endregion
        //region Find tag number

        this.isHexOnly = false;
        const tagNumberMask = intBuffer[0] & 0x1F; //region Simple case (tag number < 31)

        if (tagNumberMask !== 0x1F) {
          this.tagNumber = tagNumberMask;
          this.blockLength = 1;
        } //endregion
        //region Tag number bigger or equal to 31
        else {
            let count = 1;
            this.valueHex = new ArrayBuffer(255);
            let tagNumberBufferMaxLength = 255;
            let intTagNumberBuffer = new Uint8Array(this.valueHex); //noinspection JSBitwiseOperatorUsage

            while (intBuffer[count] & 0x80) {
              intTagNumberBuffer[count - 1] = intBuffer[count] & 0x7F;
              count++;

              if (count >= intBuffer.length) {
                this.error = "End of input reached before message was fully decoded";
                return -1;
              } //region In case if tag number length is greater than 255 bytes (rare but possible case)


              if (count === tagNumberBufferMaxLength) {
                tagNumberBufferMaxLength += 255;
                const tempBuffer = new ArrayBuffer(tagNumberBufferMaxLength);
                const tempBufferView = new Uint8Array(tempBuffer);

                for (let i = 0; i < intTagNumberBuffer.length; i++) tempBufferView[i] = intTagNumberBuffer[i];

                this.valueHex = new ArrayBuffer(tagNumberBufferMaxLength);
                intTagNumberBuffer = new Uint8Array(this.valueHex);
              } //endregion

            }

            this.blockLength = count + 1;
            intTagNumberBuffer[count - 1] = intBuffer[count] & 0x7F; // Write last byte to buffer
            //region Cut buffer

            const tempBuffer = new ArrayBuffer(count);
            const tempBufferView = new Uint8Array(tempBuffer);

            for (let i = 0; i < count; i++) tempBufferView[i] = intTagNumberBuffer[i];

            this.valueHex = new ArrayBuffer(count);
            intTagNumberBuffer = new Uint8Array(this.valueHex);
            intTagNumberBuffer.set(tempBufferView); //endregion
            //region Try to convert long tag number to short form

            if (this.blockLength <= 9) this.tagNumber = (0, utils.utilFromBase)(intTagNumberBuffer, 7);else {
              this.isHexOnly = true;
              this.warnings.push("Tag too long, represented as hex-coded");
            } //endregion
          } //endregion
        //endregion
        //region Check if constructed encoding was using for primitive type


        if (this.tagClass === 1 && this.isConstructed) {
          switch (this.tagNumber) {
            case 1: // Boolean

            case 2: // REAL

            case 5: // Null

            case 6: // OBJECT IDENTIFIER

            case 9: // REAL

            case 14: // Time

            case 23:
            case 24:
            case 31:
            case 32:
            case 33:
            case 34:
              this.error = "Constructed encoding used for primitive type";
              return -1;

            default:
          }
        } //endregion


        return inputOffset + this.blockLength; // Return current offset in input buffer
      } //**********************************************************************************

      /**
       * Convertion for the block to JSON object
       * @returns {{blockName: string,
       *  tagClass: number,
       *  tagNumber: number,
       *  isConstructed: boolean,
       *  isHexOnly: boolean,
       *  valueHex: ArrayBuffer,
       *  blockLength: number,
       *  error: string, warnings: Array.<string>,
       *  valueBeforeDecode: string}}
       */


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.blockName = this.constructor.blockName();
        object.tagClass = this.tagClass;
        object.tagNumber = this.tagNumber;
        object.isConstructed = this.isConstructed;
        return object;
      } //**********************************************************************************


    } //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of length block class
    //**************************************************************************************


    class LocalLengthBlock extends LocalBaseBlock {
      //**********************************************************************************

      /**
       * Constructor for "LocalLengthBlock" class
       * @param {Object} [parameters={}]
       * @property {Object} [lenBlock]
       */
      constructor(parameters = {}) {
        super();

        if ("lenBlock" in parameters) {
          this.isIndefiniteForm = (0, utils.getParametersValue)(parameters.lenBlock, "isIndefiniteForm", false);
          this.longFormUsed = (0, utils.getParametersValue)(parameters.lenBlock, "longFormUsed", false);
          this.length = (0, utils.getParametersValue)(parameters.lenBlock, "length", 0);
        } else {
          this.isIndefiniteForm = false;
          this.longFormUsed = false;
          this.length = 0;
        }
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "lengthBlock";
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number}
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        //region Basic check for parameters
        //noinspection JSCheckFunctionSignatures
        if ((0, utils.checkBufferParams)(this, inputBuffer, inputOffset, inputLength) === false) return -1; //endregion
        //region Getting Uint8Array from ArrayBuffer

        const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength); //endregion
        //region Initial checks

        if (intBuffer.length === 0) {
          this.error = "Zero buffer length";
          return -1;
        }

        if (intBuffer[0] === 0xFF) {
          this.error = "Length block 0xFF is reserved by standard";
          return -1;
        } //endregion
        //region Check for length form type


        this.isIndefiniteForm = intBuffer[0] === 0x80; //endregion
        //region Stop working in case of indefinite length form

        if (this.isIndefiniteForm === true) {
          this.blockLength = 1;
          return inputOffset + this.blockLength;
        } //endregion
        //region Check is long form of length encoding using


        this.longFormUsed = !!(intBuffer[0] & 0x80); //endregion
        //region Stop working in case of short form of length value

        if (this.longFormUsed === false) {
          this.length = intBuffer[0];
          this.blockLength = 1;
          return inputOffset + this.blockLength;
        } //endregion
        //region Calculate length value in case of long form


        const count = intBuffer[0] & 0x7F;

        if (count > 8) // Too big length value
          {
            this.error = "Too big integer";
            return -1;
          }

        if (count + 1 > intBuffer.length) {
          this.error = "End of input reached before message was fully decoded";
          return -1;
        }

        const lengthBufferView = new Uint8Array(count);

        for (let i = 0; i < count; i++) lengthBufferView[i] = intBuffer[i + 1];

        if (lengthBufferView[count - 1] === 0x00) this.warnings.push("Needlessly long encoded length");
        this.length = (0, utils.utilFromBase)(lengthBufferView, 8);
        if (this.longFormUsed && this.length <= 127) this.warnings.push("Unneccesary usage of long length form");
        this.blockLength = count + 1; //endregion

        return inputOffset + this.blockLength; // Return current offset in input buffer
      } //**********************************************************************************

      /**
       * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
       * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
       * @returns {ArrayBuffer}
       */


      toBER(sizeOnly = false) {
        //region Initial variables
        let retBuf;
        let retView; //endregion

        if (this.length > 127) this.longFormUsed = true;

        if (this.isIndefiniteForm) {
          retBuf = new ArrayBuffer(1);

          if (sizeOnly === false) {
            retView = new Uint8Array(retBuf);
            retView[0] = 0x80;
          }

          return retBuf;
        }

        if (this.longFormUsed === true) {
          const encodedBuf = (0, utils.utilToBase)(this.length, 8);

          if (encodedBuf.byteLength > 127) {
            this.error = "Too big length";
            return new ArrayBuffer(0);
          }

          retBuf = new ArrayBuffer(encodedBuf.byteLength + 1);
          if (sizeOnly === true) return retBuf;
          const encodedView = new Uint8Array(encodedBuf);
          retView = new Uint8Array(retBuf);
          retView[0] = encodedBuf.byteLength | 0x80;

          for (let i = 0; i < encodedBuf.byteLength; i++) retView[i + 1] = encodedView[i];

          return retBuf;
        }

        retBuf = new ArrayBuffer(1);

        if (sizeOnly === false) {
          retView = new Uint8Array(retBuf);
          retView[0] = this.length;
        }

        return retBuf;
      } //**********************************************************************************

      /**
       * Convertion for the block to JSON object
       * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
       */


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.blockName = this.constructor.blockName();
        object.isIndefiniteForm = this.isIndefiniteForm;
        object.longFormUsed = this.longFormUsed;
        object.length = this.length;
        return object;
      } //**********************************************************************************


    } //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of value block class
    //**************************************************************************************


    class LocalValueBlock extends LocalBaseBlock {
      //**********************************************************************************

      /**
       * Constructor for "LocalValueBlock" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "valueBlock";
      } //**********************************************************************************
      //noinspection JSUnusedLocalSymbols,JSUnusedLocalSymbols,JSUnusedLocalSymbols

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number}
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        //region Throw an exception for a function which needs to be specified in extended classes
        throw TypeError("User need to make a specific function in a class which extends \"LocalValueBlock\""); //endregion
      } //**********************************************************************************
      //noinspection JSUnusedLocalSymbols

      /**
       * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
       * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
       * @returns {ArrayBuffer}
       */


      toBER(sizeOnly = false) {
        //region Throw an exception for a function which needs to be specified in extended classes
        throw TypeError("User need to make a specific function in a class which extends \"LocalValueBlock\""); //endregion
      } //**********************************************************************************


    } //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of basic ASN.1 block class
    //**************************************************************************************


    class BaseBlock extends LocalBaseBlock {
      //**********************************************************************************

      /**
       * Constructor for "BaseBlock" class
       * @param {Object} [parameters={}]
       * @property {Object} [primitiveSchema]
       * @property {string} [name]
       * @property {boolean} [optional]
       * @param valueBlockType Type of value block
       */
      constructor(parameters = {}, valueBlockType = LocalValueBlock) {
        super(parameters);
        if ("name" in parameters) this.name = parameters.name;
        if ("optional" in parameters) this.optional = parameters.optional;
        if ("primitiveSchema" in parameters) this.primitiveSchema = parameters.primitiveSchema;
        this.idBlock = new LocalIdentificationBlock(parameters);
        this.lenBlock = new LocalLengthBlock(parameters);
        this.valueBlock = new valueBlockType(parameters);
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "BaseBlock";
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number}
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);

        if (resultOffset === -1) {
          this.error = this.valueBlock.error;
          return resultOffset;
        }

        if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;
        if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;
        if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;
        return resultOffset;
      } //**********************************************************************************

      /**
       * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
       * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
       * @returns {ArrayBuffer}
       */


      toBER(sizeOnly = false) {
        let retBuf;
        const idBlockBuf = this.idBlock.toBER(sizeOnly);
        const valueBlockSizeBuf = this.valueBlock.toBER(true);
        this.lenBlock.length = valueBlockSizeBuf.byteLength;
        const lenBlockBuf = this.lenBlock.toBER(sizeOnly);
        retBuf = (0, utils.utilConcatBuf)(idBlockBuf, lenBlockBuf);
        let valueBlockBuf;
        if (sizeOnly === false) valueBlockBuf = this.valueBlock.toBER(sizeOnly);else valueBlockBuf = new ArrayBuffer(this.lenBlock.length);
        retBuf = (0, utils.utilConcatBuf)(retBuf, valueBlockBuf);

        if (this.lenBlock.isIndefiniteForm === true) {
          const indefBuf = new ArrayBuffer(2);

          if (sizeOnly === false) {
            const indefView = new Uint8Array(indefBuf);
            indefView[0] = 0x00;
            indefView[1] = 0x00;
          }

          retBuf = (0, utils.utilConcatBuf)(retBuf, indefBuf);
        }

        return retBuf;
      } //**********************************************************************************

      /**
       * Convertion for the block to JSON object
       * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
       */


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.idBlock = this.idBlock.toJSON();
        object.lenBlock = this.lenBlock.toJSON();
        object.valueBlock = this.valueBlock.toJSON();
        if ("name" in this) object.name = this.name;
        if ("optional" in this) object.optional = this.optional;
        if ("primitiveSchema" in this) object.primitiveSchema = this.primitiveSchema.toJSON();
        return object;
      } //**********************************************************************************


    }

    exports.BaseBlock = BaseBlock; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of basic block for all PRIMITIVE types
    //**************************************************************************************

    class LocalPrimitiveValueBlock extends LocalValueBlock {
      //**********************************************************************************

      /**
       * Constructor for "LocalPrimitiveValueBlock" class
       * @param {Object} [parameters={}]
       * @property {ArrayBuffer} [valueBeforeDecode]
       */
      constructor(parameters = {}) {
        super(parameters); //region Variables from "hexBlock" class

        if ("valueHex" in parameters) this.valueHex = parameters.valueHex.slice(0);else this.valueHex = new ArrayBuffer(0);
        this.isHexOnly = (0, utils.getParametersValue)(parameters, "isHexOnly", true); //endregion
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number}
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        //region Basic check for parameters
        //noinspection JSCheckFunctionSignatures
        if ((0, utils.checkBufferParams)(this, inputBuffer, inputOffset, inputLength) === false) return -1; //endregion
        //region Getting Uint8Array from ArrayBuffer

        const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength); //endregion
        //region Initial checks

        if (intBuffer.length === 0) {
          this.warnings.push("Zero buffer length");
          return inputOffset;
        } //endregion
        //region Copy input buffer into internal buffer


        this.valueHex = new ArrayBuffer(intBuffer.length);
        const valueHexView = new Uint8Array(this.valueHex);

        for (let i = 0; i < intBuffer.length; i++) valueHexView[i] = intBuffer[i]; //endregion


        this.blockLength = inputLength;
        return inputOffset + inputLength;
      } //**********************************************************************************
      //noinspection JSUnusedLocalSymbols

      /**
       * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
       * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
       * @returns {ArrayBuffer}
       */


      toBER(sizeOnly = false) {
        return this.valueHex.slice(0);
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "PrimitiveValueBlock";
      } //**********************************************************************************

      /**
       * Convertion for the block to JSON object
       * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
       */


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.valueHex = (0, utils.bufferToHexCodes)(this.valueHex, 0, this.valueHex.byteLength);
        object.isHexOnly = this.isHexOnly;
        return object;
      } //**********************************************************************************


    } //**************************************************************************************


    class Primitive extends BaseBlock {
      //**********************************************************************************

      /**
       * Constructor for "Primitive" class
       * @param {Object} [parameters={}]
       * @property {ArrayBuffer} [valueHex]
       */
      constructor(parameters = {}) {
        super(parameters, LocalPrimitiveValueBlock);
        this.idBlock.isConstructed = false;
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "PRIMITIVE";
      } //**********************************************************************************


    }

    exports.Primitive = Primitive; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of basic block for all CONSTRUCTED types
    //**************************************************************************************

    class LocalConstructedValueBlock extends LocalValueBlock {
      //**********************************************************************************

      /**
       * Constructor for "LocalConstructedValueBlock" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.value = (0, utils.getParametersValue)(parameters, "value", []);
        this.isIndefiniteForm = (0, utils.getParametersValue)(parameters, "isIndefiniteForm", false);
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number}
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        //region Store initial offset and length
        const initialOffset = inputOffset;
        const initialLength = inputLength; //endregion
        //region Basic check for parameters
        //noinspection JSCheckFunctionSignatures

        if ((0, utils.checkBufferParams)(this, inputBuffer, inputOffset, inputLength) === false) return -1; //endregion
        //region Getting Uint8Array from ArrayBuffer

        const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength); //endregion
        //region Initial checks

        if (intBuffer.length === 0) {
          this.warnings.push("Zero buffer length");
          return inputOffset;
        } //endregion
        //region Aux function


        function checkLen(indefiniteLength, length) {
          if (indefiniteLength === true) return 1;
          return length;
        } //endregion


        let currentOffset = inputOffset;

        while (checkLen(this.isIndefiniteForm, inputLength) > 0) {
          const returnObject = LocalFromBER(inputBuffer, currentOffset, inputLength);

          if (returnObject.offset === -1) {
            this.error = returnObject.result.error;
            this.warnings.concat(returnObject.result.warnings);
            return -1;
          }

          currentOffset = returnObject.offset;
          this.blockLength += returnObject.result.blockLength;
          inputLength -= returnObject.result.blockLength;
          this.value.push(returnObject.result);
          if (this.isIndefiniteForm === true && returnObject.result.constructor.blockName() === EndOfContent.blockName()) break;
        }

        if (this.isIndefiniteForm === true) {
          if (this.value[this.value.length - 1].constructor.blockName() === EndOfContent.blockName()) this.value.pop();else this.warnings.push("No EndOfContent block encoded");
        } //region Copy "inputBuffer" to "valueBeforeDecode"


        this.valueBeforeDecode = inputBuffer.slice(initialOffset, initialOffset + initialLength); //endregion

        return currentOffset;
      } //**********************************************************************************

      /**
       * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
       * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
       * @returns {ArrayBuffer}
       */


      toBER(sizeOnly = false) {
        let retBuf = new ArrayBuffer(0);

        for (let i = 0; i < this.value.length; i++) {
          const valueBuf = this.value[i].toBER(sizeOnly);
          retBuf = (0, utils.utilConcatBuf)(retBuf, valueBuf);
        }

        return retBuf;
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "ConstructedValueBlock";
      } //**********************************************************************************

      /**
       * Convertion for the block to JSON object
       * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
       */


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.isIndefiniteForm = this.isIndefiniteForm;
        object.value = [];

        for (let i = 0; i < this.value.length; i++) object.value.push(this.value[i].toJSON());

        return object;
      } //**********************************************************************************


    } //**************************************************************************************


    class Constructed extends BaseBlock {
      //**********************************************************************************

      /**
       * Constructor for "Constructed" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters, LocalConstructedValueBlock);
        this.idBlock.isConstructed = true;
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "CONSTRUCTED";
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number}
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;
        const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);

        if (resultOffset === -1) {
          this.error = this.valueBlock.error;
          return resultOffset;
        }

        if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;
        if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;
        if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;
        return resultOffset;
      } //**********************************************************************************


    }

    exports.Constructed = Constructed; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of ASN.1 EndOfContent type class
    //**************************************************************************************

    class LocalEndOfContentValueBlock extends LocalValueBlock {
      //**********************************************************************************

      /**
       * Constructor for "LocalEndOfContentValueBlock" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
      } //**********************************************************************************
      //noinspection JSUnusedLocalSymbols,JSUnusedLocalSymbols

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number}
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        //region There is no "value block" for EndOfContent type and we need to return the same offset
        return inputOffset; //endregion
      } //**********************************************************************************
      //noinspection JSUnusedLocalSymbols

      /**
       * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
       * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
       * @returns {ArrayBuffer}
       */


      toBER(sizeOnly = false) {
        return new ArrayBuffer(0);
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "EndOfContentValueBlock";
      } //**********************************************************************************


    } //**************************************************************************************


    class EndOfContent extends BaseBlock {
      //**********************************************************************************
      constructor(paramaters = {}) {
        super(paramaters, LocalEndOfContentValueBlock);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 0; // EndOfContent
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "EndOfContent";
      } //**********************************************************************************


    }

    exports.EndOfContent = EndOfContent; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of ASN.1 Boolean type class
    //**************************************************************************************

    class LocalBooleanValueBlock extends LocalValueBlock {
      //**********************************************************************************

      /**
       * Constructor for "LocalBooleanValueBlock" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.value = (0, utils.getParametersValue)(parameters, "value", false);
        this.isHexOnly = (0, utils.getParametersValue)(parameters, "isHexOnly", false);
        if ("valueHex" in parameters) this.valueHex = parameters.valueHex.slice(0);else {
          this.valueHex = new ArrayBuffer(1);

          if (this.value === true) {
            const view = new Uint8Array(this.valueHex);
            view[0] = 0xFF;
          }
        }
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number} Offset after least decoded byte
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        //region Basic check for parameters
        //noinspection JSCheckFunctionSignatures
        if ((0, utils.checkBufferParams)(this, inputBuffer, inputOffset, inputLength) === false) return -1; //endregion
        //region Getting Uint8Array from ArrayBuffer

        const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength); //endregion

        if (inputLength > 1) this.warnings.push("Boolean value encoded in more then 1 octet");
        this.isHexOnly = true; //region Copy input buffer to internal array

        this.valueHex = new ArrayBuffer(intBuffer.length);
        const view = new Uint8Array(this.valueHex);

        for (let i = 0; i < intBuffer.length; i++) view[i] = intBuffer[i]; //endregion


        if (utils.utilDecodeTC.call(this) !== 0) this.value = true;else this.value = false;
        this.blockLength = inputLength;
        return inputOffset + inputLength;
      } //**********************************************************************************
      //noinspection JSUnusedLocalSymbols

      /**
       * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
       * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
       * @returns {ArrayBuffer}
       */


      toBER(sizeOnly = false) {
        return this.valueHex;
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "BooleanValueBlock";
      } //**********************************************************************************

      /**
       * Convertion for the block to JSON object
       * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
       */


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.value = this.value;
        object.isHexOnly = this.isHexOnly;
        object.valueHex = (0, utils.bufferToHexCodes)(this.valueHex, 0, this.valueHex.byteLength);
        return object;
      } //**********************************************************************************


    } //**************************************************************************************


    class Boolean extends BaseBlock {
      //**********************************************************************************

      /**
       * Constructor for "Boolean" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters, LocalBooleanValueBlock);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 1; // Boolean
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "Boolean";
      } //**********************************************************************************


    }

    exports.Boolean = Boolean; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of ASN.1 Sequence and Set type classes
    //**************************************************************************************

    class Sequence extends Constructed {
      //**********************************************************************************

      /**
       * Constructor for "Sequence" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 16; // Sequence
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "Sequence";
      } //**********************************************************************************


    }

    exports.Sequence = Sequence; //**************************************************************************************

    class Set extends Constructed {
      //**********************************************************************************

      /**
       * Constructor for "Set" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 17; // Set
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "Set";
      } //**********************************************************************************


    }

    exports.Set = Set; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of ASN.1 Null type class
    //**************************************************************************************

    class Null extends BaseBlock {
      //**********************************************************************************

      /**
       * Constructor for "Null" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters, LocalBaseBlock); // We will not have a call to "Null value block" because of specified "fromBER" and "toBER" functions

        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 5; // Null
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "Null";
      } //**********************************************************************************
      //noinspection JSUnusedLocalSymbols

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number} Offset after least decoded byte
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        if (this.lenBlock.length > 0) this.warnings.push("Non-zero length of value block for Null type");
        if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;
        if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;
        this.blockLength += inputLength;

        if (inputOffset + inputLength > inputBuffer.byteLength) {
          this.error = "End of input reached before message was fully decoded (inconsistent offset and length values)";
          return -1;
        }

        return inputOffset + inputLength;
      } //**********************************************************************************

      /**
       * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
       * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
       * @returns {ArrayBuffer}
       */


      toBER(sizeOnly = false) {
        const retBuf = new ArrayBuffer(2);
        if (sizeOnly === true) return retBuf;
        const retView = new Uint8Array(retBuf);
        retView[0] = 0x05;
        retView[1] = 0x00;
        return retBuf;
      } //**********************************************************************************


    }

    exports.Null = Null; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of ASN.1 OctetString type class
    //**************************************************************************************

    class LocalOctetStringValueBlock extends LocalHexBlock(LocalConstructedValueBlock) {
      //**********************************************************************************

      /**
       * Constructor for "LocalOctetStringValueBlock" class
       * @param {Object} [parameters={}]
       * @property {ArrayBuffer} [valueHex]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.isConstructed = (0, utils.getParametersValue)(parameters, "isConstructed", false);
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number} Offset after least decoded byte
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        let resultOffset = 0;

        if (this.isConstructed === true) {
          this.isHexOnly = false;
          resultOffset = LocalConstructedValueBlock.prototype.fromBER.call(this, inputBuffer, inputOffset, inputLength);
          if (resultOffset === -1) return resultOffset;

          for (let i = 0; i < this.value.length; i++) {
            const currentBlockName = this.value[i].constructor.blockName();

            if (currentBlockName === EndOfContent.blockName()) {
              if (this.isIndefiniteForm === true) break;else {
                this.error = "EndOfContent is unexpected, OCTET STRING may consists of OCTET STRINGs only";
                return -1;
              }
            }

            if (currentBlockName !== OctetString.blockName()) {
              this.error = "OCTET STRING may consists of OCTET STRINGs only";
              return -1;
            }
          }
        } else {
          this.isHexOnly = true;
          resultOffset = super.fromBER(inputBuffer, inputOffset, inputLength);
          this.blockLength = inputLength;
        }

        return resultOffset;
      } //**********************************************************************************

      /**
       * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
       * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
       * @returns {ArrayBuffer}
       */


      toBER(sizeOnly = false) {
        if (this.isConstructed === true) return LocalConstructedValueBlock.prototype.toBER.call(this, sizeOnly);
        let retBuf = new ArrayBuffer(this.valueHex.byteLength);
        if (sizeOnly === true) return retBuf;
        if (this.valueHex.byteLength === 0) return retBuf;
        retBuf = this.valueHex.slice(0);
        return retBuf;
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "OctetStringValueBlock";
      } //**********************************************************************************


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.isConstructed = this.isConstructed;
        object.isHexOnly = this.isHexOnly;
        object.valueHex = (0, utils.bufferToHexCodes)(this.valueHex, 0, this.valueHex.byteLength);
        return object;
      } //**********************************************************************************


    } //**************************************************************************************


    class OctetString extends BaseBlock {
      //**********************************************************************************

      /**
       * Constructor for "OctetString" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters, LocalOctetStringValueBlock);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 4; // OctetString
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number} Offset after least decoded byte
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        this.valueBlock.isConstructed = this.idBlock.isConstructed;
        this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm; //region Ability to encode empty OCTET STRING

        if (inputLength === 0) {
          if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;
          if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;
          return inputOffset;
        } //endregion


        return super.fromBER(inputBuffer, inputOffset, inputLength);
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "OctetString";
      } //**********************************************************************************
      //noinspection JSUnusedGlobalSymbols

      /**
       * Checking that two OCTETSTRINGs are equal
       * @param {OctetString} octetString
       */


      isEqual(octetString) {
        //region Check input type
        if (octetString instanceof OctetString === false) return false; //endregion
        //region Compare two JSON strings

        if (JSON.stringify(this) !== JSON.stringify(octetString)) return false; //endregion

        return true;
      } //**********************************************************************************


    }

    exports.OctetString = OctetString; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of ASN.1 BitString type class
    //**************************************************************************************

    class LocalBitStringValueBlock extends LocalHexBlock(LocalConstructedValueBlock) {
      //**********************************************************************************

      /**
       * Constructor for "LocalBitStringValueBlock" class
       * @param {Object} [parameters={}]
       * @property {ArrayBuffer} [valueHex]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.unusedBits = (0, utils.getParametersValue)(parameters, "unusedBits", 0);
        this.isConstructed = (0, utils.getParametersValue)(parameters, "isConstructed", false);
        this.blockLength = this.valueHex.byteLength;
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number} Offset after least decoded byte
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        //region Ability to decode zero-length BitString value
        if (inputLength === 0) return inputOffset; //endregion

        let resultOffset = -1; //region If the BISTRING supposed to be a constructed value

        if (this.isConstructed === true) {
          resultOffset = LocalConstructedValueBlock.prototype.fromBER.call(this, inputBuffer, inputOffset, inputLength);
          if (resultOffset === -1) return resultOffset;

          for (let i = 0; i < this.value.length; i++) {
            const currentBlockName = this.value[i].constructor.blockName();

            if (currentBlockName === EndOfContent.blockName()) {
              if (this.isIndefiniteForm === true) break;else {
                this.error = "EndOfContent is unexpected, BIT STRING may consists of BIT STRINGs only";
                return -1;
              }
            }

            if (currentBlockName !== BitString.blockName()) {
              this.error = "BIT STRING may consists of BIT STRINGs only";
              return -1;
            }

            if (this.unusedBits > 0 && this.value[i].valueBlock.unusedBits > 0) {
              this.error = "Usign of \"unused bits\" inside constructive BIT STRING allowed for least one only";
              return -1;
            }

            this.unusedBits = this.value[i].valueBlock.unusedBits;

            if (this.unusedBits > 7) {
              this.error = "Unused bits for BitString must be in range 0-7";
              return -1;
            }
          }

          return resultOffset;
        } //endregion
        //region If the BitString supposed to be a primitive value
        //region Basic check for parameters
        //noinspection JSCheckFunctionSignatures


        if ((0, utils.checkBufferParams)(this, inputBuffer, inputOffset, inputLength) === false) return -1; //endregion

        const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
        this.unusedBits = intBuffer[0];

        if (this.unusedBits > 7) {
          this.error = "Unused bits for BitString must be in range 0-7";
          return -1;
        } //region Copy input buffer to internal buffer


        this.valueHex = new ArrayBuffer(intBuffer.length - 1);
        const view = new Uint8Array(this.valueHex);

        for (let i = 0; i < inputLength - 1; i++) view[i] = intBuffer[i + 1]; //endregion


        this.blockLength = intBuffer.length;
        return inputOffset + inputLength; //endregion
      } //**********************************************************************************

      /**
       * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
       * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
       * @returns {ArrayBuffer}
       */


      toBER(sizeOnly = false) {
        if (this.isConstructed === true) return LocalConstructedValueBlock.prototype.toBER.call(this, sizeOnly);
        if (sizeOnly === true) return new ArrayBuffer(this.valueHex.byteLength + 1);
        if (this.valueHex.byteLength === 0) return new ArrayBuffer(0);
        const curView = new Uint8Array(this.valueHex);
        const retBuf = new ArrayBuffer(this.valueHex.byteLength + 1);
        const retView = new Uint8Array(retBuf);
        retView[0] = this.unusedBits;

        for (let i = 0; i < this.valueHex.byteLength; i++) retView[i + 1] = curView[i];

        return retBuf;
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "BitStringValueBlock";
      } //**********************************************************************************

      /**
       * Convertion for the block to JSON object
       * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
       */


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.unusedBits = this.unusedBits;
        object.isConstructed = this.isConstructed;
        object.isHexOnly = this.isHexOnly;
        object.valueHex = (0, utils.bufferToHexCodes)(this.valueHex, 0, this.valueHex.byteLength);
        return object;
      } //**********************************************************************************


    } //**************************************************************************************


    class BitString extends BaseBlock {
      //**********************************************************************************

      /**
       * Constructor for "BitString" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters, LocalBitStringValueBlock);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 3; // BitString
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "BitString";
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number} Offset after least decoded byte
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        //region Ability to encode empty BitString
        if (inputLength === 0) return inputOffset; //endregion

        this.valueBlock.isConstructed = this.idBlock.isConstructed;
        this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;
        return super.fromBER(inputBuffer, inputOffset, inputLength);
      } //**********************************************************************************

      /**
       * Checking that two BITSTRINGs are equal
       * @param {BitString} bitString
       */


      isEqual(bitString) {
        //region Check input type
        if (bitString instanceof BitString === false) return false; //endregion
        //region Compare two JSON strings

        if (JSON.stringify(this) !== JSON.stringify(bitString)) return false; //endregion

        return true;
      } //**********************************************************************************


    }

    exports.BitString = BitString; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of ASN.1 Integer type class
    //**************************************************************************************

    /**
     * @extends LocalValueBlock
     */

    class LocalIntegerValueBlock extends LocalHexBlock(LocalValueBlock) {
      //**********************************************************************************

      /**
       * Constructor for "LocalIntegerValueBlock" class
       * @param {Object} [parameters={}]
       * @property {ArrayBuffer} [valueHex]
       */
      constructor(parameters = {}) {
        super(parameters);
        if ("value" in parameters) this.valueDec = parameters.value;
      } //**********************************************************************************

      /**
       * Setter for "valueHex"
       * @param {ArrayBuffer} _value
       */


      set valueHex(_value) {
        this._valueHex = _value.slice(0);

        if (_value.byteLength >= 4) {
          this.warnings.push("Too big Integer for decoding, hex only");
          this.isHexOnly = true;
          this._valueDec = 0;
        } else {
          this.isHexOnly = false;
          if (_value.byteLength > 0) this._valueDec = utils.utilDecodeTC.call(this);
        }
      } //**********************************************************************************

      /**
       * Getter for "valueHex"
       * @returns {ArrayBuffer}
       */


      get valueHex() {
        return this._valueHex;
      } //**********************************************************************************

      /**
       * Getter for "valueDec"
       * @param {number} _value
       */


      set valueDec(_value) {
        this._valueDec = _value;
        this.isHexOnly = false;
        this._valueHex = (0, utils.utilEncodeTC)(_value);
      } //**********************************************************************************

      /**
       * Getter for "valueDec"
       * @returns {number}
       */


      get valueDec() {
        return this._valueDec;
      } //**********************************************************************************

      /**
       * Base function for converting block from DER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 DER encoded array
       * @param {!number} inputOffset Offset in ASN.1 DER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @param {number} [expectedLength=0] Expected length of converted "valueHex" buffer
       * @returns {number} Offset after least decoded byte
       */


      fromDER(inputBuffer, inputOffset, inputLength, expectedLength = 0) {
        const offset = this.fromBER(inputBuffer, inputOffset, inputLength);
        if (offset === -1) return offset;
        const view = new Uint8Array(this._valueHex);

        if (view[0] === 0x00 && (view[1] & 0x80) !== 0) {
          const updatedValueHex = new ArrayBuffer(this._valueHex.byteLength - 1);
          const updatedView = new Uint8Array(updatedValueHex);
          updatedView.set(new Uint8Array(this._valueHex, 1, this._valueHex.byteLength - 1));
          this._valueHex = updatedValueHex.slice(0);
        } else {
          if (expectedLength !== 0) {
            if (this._valueHex.byteLength < expectedLength) {
              if (expectedLength - this._valueHex.byteLength > 1) expectedLength = this._valueHex.byteLength + 1;
              const updatedValueHex = new ArrayBuffer(expectedLength);
              const updatedView = new Uint8Array(updatedValueHex);
              updatedView.set(view, expectedLength - this._valueHex.byteLength);
              this._valueHex = updatedValueHex.slice(0);
            }
          }
        }

        return offset;
      } //**********************************************************************************

      /**
       * Encoding of current ASN.1 block into ASN.1 encoded array (DER rules)
       * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
       * @returns {ArrayBuffer}
       */


      toDER(sizeOnly = false) {
        const view = new Uint8Array(this._valueHex);

        switch (true) {
          case (view[0] & 0x80) !== 0:
            {
              const updatedValueHex = new ArrayBuffer(this._valueHex.byteLength + 1);
              const updatedView = new Uint8Array(updatedValueHex);
              updatedView[0] = 0x00;
              updatedView.set(view, 1);
              this._valueHex = updatedValueHex.slice(0);
            }
            break;

          case view[0] === 0x00 && (view[1] & 0x80) === 0:
            {
              const updatedValueHex = new ArrayBuffer(this._valueHex.byteLength - 1);
              const updatedView = new Uint8Array(updatedValueHex);
              updatedView.set(new Uint8Array(this._valueHex, 1, this._valueHex.byteLength - 1));
              this._valueHex = updatedValueHex.slice(0);
            }
            break;

          default:
        }

        return this.toBER(sizeOnly);
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number} Offset after least decoded byte
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        const resultOffset = super.fromBER(inputBuffer, inputOffset, inputLength);
        if (resultOffset === -1) return resultOffset;
        this.blockLength = inputLength;
        return inputOffset + inputLength;
      } //**********************************************************************************

      /**
       * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
       * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
       * @returns {ArrayBuffer}
       */


      toBER(sizeOnly = false) {
        //noinspection JSCheckFunctionSignatures
        return this.valueHex.slice(0);
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "IntegerValueBlock";
      } //**********************************************************************************
      //noinspection JSUnusedGlobalSymbols

      /**
       * Convertion for the block to JSON object
       * @returns {Object}
       */


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.valueDec = this.valueDec;
        return object;
      } //**********************************************************************************

      /**
       * Convert current value to decimal string representation
       */


      toString() {
        //region Aux functions
        function viewAdd(first, second) {
          //region Initial variables
          const c = new Uint8Array([0]);
          let firstView = new Uint8Array(first);
          let secondView = new Uint8Array(second);
          let firstViewCopy = firstView.slice(0);
          const firstViewCopyLength = firstViewCopy.length - 1;
          let secondViewCopy = secondView.slice(0);
          const secondViewCopyLength = secondViewCopy.length - 1;
          let value = 0;
          const max = secondViewCopyLength < firstViewCopyLength ? firstViewCopyLength : secondViewCopyLength;
          let counter = 0; //endregion

          for (let i = max; i >= 0; i--, counter++) {
            switch (true) {
              case counter < secondViewCopy.length:
                value = firstViewCopy[firstViewCopyLength - counter] + secondViewCopy[secondViewCopyLength - counter] + c[0];
                break;

              default:
                value = firstViewCopy[firstViewCopyLength - counter] + c[0];
            }

            c[0] = value / 10;

            switch (true) {
              case counter >= firstViewCopy.length:
                firstViewCopy = (0, utils.utilConcatView)(new Uint8Array([value % 10]), firstViewCopy);
                break;

              default:
                firstViewCopy[firstViewCopyLength - counter] = value % 10;
            }
          }

          if (c[0] > 0) firstViewCopy = (0, utils.utilConcatView)(c, firstViewCopy);
          return firstViewCopy.slice(0);
        }

        function power2(n) {
          if (n >= powers2.length) {
            for (let p = powers2.length; p <= n; p++) {
              const c = new Uint8Array([0]);
              let digits = powers2[p - 1].slice(0);

              for (let i = digits.length - 1; i >= 0; i--) {
                const newValue = new Uint8Array([(digits[i] << 1) + c[0]]);
                c[0] = newValue[0] / 10;
                digits[i] = newValue[0] % 10;
              }

              if (c[0] > 0) digits = (0, utils.utilConcatView)(c, digits);
              powers2.push(digits);
            }
          }

          return powers2[n];
        }

        function viewSub(first, second) {
          //region Initial variables
          let b = 0;
          let firstView = new Uint8Array(first);
          let secondView = new Uint8Array(second);
          let firstViewCopy = firstView.slice(0);
          const firstViewCopyLength = firstViewCopy.length - 1;
          let secondViewCopy = secondView.slice(0);
          const secondViewCopyLength = secondViewCopy.length - 1;
          let value;
          let counter = 0; //endregion

          for (let i = secondViewCopyLength; i >= 0; i--, counter++) {
            value = firstViewCopy[firstViewCopyLength - counter] - secondViewCopy[secondViewCopyLength - counter] - b;

            switch (true) {
              case value < 0:
                b = 1;
                firstViewCopy[firstViewCopyLength - counter] = value + 10;
                break;

              default:
                b = 0;
                firstViewCopy[firstViewCopyLength - counter] = value;
            }
          }

          if (b > 0) {
            for (let i = firstViewCopyLength - secondViewCopyLength + 1; i >= 0; i--, counter++) {
              value = firstViewCopy[firstViewCopyLength - counter] - b;

              if (value < 0) {
                b = 1;
                firstViewCopy[firstViewCopyLength - counter] = value + 10;
              } else {
                b = 0;
                firstViewCopy[firstViewCopyLength - counter] = value;
                break;
              }
            }
          }

          return firstViewCopy.slice();
        } //endregion
        //region Initial variables


        const firstBit = this._valueHex.byteLength * 8 - 1;
        let digits = new Uint8Array(this._valueHex.byteLength * 8 / 3);
        let bitNumber = 0;
        let currentByte;
        const asn1View = new Uint8Array(this._valueHex);
        let result = "";
        let flag = false; //endregion
        //region Calculate number

        for (let byteNumber = this._valueHex.byteLength - 1; byteNumber >= 0; byteNumber--) {
          currentByte = asn1View[byteNumber];

          for (let i = 0; i < 8; i++) {
            if ((currentByte & 1) === 1) {
              switch (bitNumber) {
                case firstBit:
                  digits = viewSub(power2(bitNumber), digits);
                  result = "-";
                  break;

                default:
                  digits = viewAdd(digits, power2(bitNumber));
              }
            }

            bitNumber++;
            currentByte >>= 1;
          }
        } //endregion
        //region Print number


        for (let i = 0; i < digits.length; i++) {
          if (digits[i]) flag = true;
          if (flag) result += digitsString.charAt(digits[i]);
        }

        if (flag === false) result += digitsString.charAt(0); //endregion

        return result;
      } //**********************************************************************************


    } //**************************************************************************************


    class Integer extends BaseBlock {
      //**********************************************************************************

      /**
       * Constructor for "Integer" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters, LocalIntegerValueBlock);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 2; // Integer
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "Integer";
      } //**********************************************************************************
      //noinspection JSUnusedGlobalSymbols

      /**
       * Compare two Integer object, or Integer and ArrayBuffer objects
       * @param {!Integer|ArrayBuffer} otherValue
       * @returns {boolean}
       */


      isEqual(otherValue) {
        if (otherValue instanceof Integer) {
          if (this.valueBlock.isHexOnly && otherValue.valueBlock.isHexOnly) // Compare two ArrayBuffers
            return (0, utils.isEqualBuffer)(this.valueBlock.valueHex, otherValue.valueBlock.valueHex);
          if (this.valueBlock.isHexOnly === otherValue.valueBlock.isHexOnly) return this.valueBlock.valueDec === otherValue.valueBlock.valueDec;
          return false;
        }

        if (otherValue instanceof ArrayBuffer) return (0, utils.isEqualBuffer)(this.valueBlock.valueHex, otherValue);
        return false;
      } //**********************************************************************************

      /**
       * Convert current Integer value from BER into DER format
       * @returns {Integer}
       */


      convertToDER() {
        const integer = new Integer({
          valueHex: this.valueBlock.valueHex
        });
        integer.valueBlock.toDER();
        return integer;
      } //**********************************************************************************

      /**
       * Convert current Integer value from DER to BER format
       * @returns {Integer}
       */


      convertFromDER() {
        const expectedLength = this.valueBlock.valueHex.byteLength % 2 ? this.valueBlock.valueHex.byteLength + 1 : this.valueBlock.valueHex.byteLength;
        const integer = new Integer({
          valueHex: this.valueBlock.valueHex
        });
        integer.valueBlock.fromDER(integer.valueBlock.valueHex, 0, integer.valueBlock.valueHex.byteLength, expectedLength);
        return integer;
      } //**********************************************************************************


    }

    exports.Integer = Integer; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of ASN.1 Enumerated type class
    //**************************************************************************************

    class Enumerated extends Integer {
      //**********************************************************************************

      /**
       * Constructor for "Enumerated" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 10; // Enumerated
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "Enumerated";
      } //**********************************************************************************


    }

    exports.Enumerated = Enumerated; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of ASN.1 ObjectIdentifier type class
    //**************************************************************************************

    class LocalSidValueBlock extends LocalHexBlock(LocalBaseBlock) {
      //**********************************************************************************

      /**
       * Constructor for "LocalSidValueBlock" class
       * @param {Object} [parameters={}]
       * @property {number} [valueDec]
       * @property {boolean} [isFirstSid]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.valueDec = (0, utils.getParametersValue)(parameters, "valueDec", -1);
        this.isFirstSid = (0, utils.getParametersValue)(parameters, "isFirstSid", false);
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "sidBlock";
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number} Offset after least decoded byte
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        if (inputLength === 0) return inputOffset; //region Basic check for parameters
        //noinspection JSCheckFunctionSignatures

        if ((0, utils.checkBufferParams)(this, inputBuffer, inputOffset, inputLength) === false) return -1; //endregion

        const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
        this.valueHex = new ArrayBuffer(inputLength);
        let view = new Uint8Array(this.valueHex);

        for (let i = 0; i < inputLength; i++) {
          view[i] = intBuffer[i] & 0x7F;
          this.blockLength++;
          if ((intBuffer[i] & 0x80) === 0x00) break;
        } //region Ajust size of valueHex buffer


        const tempValueHex = new ArrayBuffer(this.blockLength);
        const tempView = new Uint8Array(tempValueHex);

        for (let i = 0; i < this.blockLength; i++) tempView[i] = view[i]; //noinspection JSCheckFunctionSignatures


        this.valueHex = tempValueHex.slice(0);
        view = new Uint8Array(this.valueHex); //endregion

        if ((intBuffer[this.blockLength - 1] & 0x80) !== 0x00) {
          this.error = "End of input reached before message was fully decoded";
          return -1;
        }

        if (view[0] === 0x00) this.warnings.push("Needlessly long format of SID encoding");
        if (this.blockLength <= 8) this.valueDec = (0, utils.utilFromBase)(view, 7);else {
          this.isHexOnly = true;
          this.warnings.push("Too big SID for decoding, hex only");
        }
        return inputOffset + this.blockLength;
      } //**********************************************************************************

      /**
       * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
       * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
       * @returns {ArrayBuffer}
       */


      toBER(sizeOnly = false) {
        //region Initial variables
        let retBuf;
        let retView; //endregion

        if (this.isHexOnly) {
          if (sizeOnly === true) return new ArrayBuffer(this.valueHex.byteLength);
          const curView = new Uint8Array(this.valueHex);
          retBuf = new ArrayBuffer(this.blockLength);
          retView = new Uint8Array(retBuf);

          for (let i = 0; i < this.blockLength - 1; i++) retView[i] = curView[i] | 0x80;

          retView[this.blockLength - 1] = curView[this.blockLength - 1];
          return retBuf;
        }

        const encodedBuf = (0, utils.utilToBase)(this.valueDec, 7);

        if (encodedBuf.byteLength === 0) {
          this.error = "Error during encoding SID value";
          return new ArrayBuffer(0);
        }

        retBuf = new ArrayBuffer(encodedBuf.byteLength);

        if (sizeOnly === false) {
          const encodedView = new Uint8Array(encodedBuf);
          retView = new Uint8Array(retBuf);

          for (let i = 0; i < encodedBuf.byteLength - 1; i++) retView[i] = encodedView[i] | 0x80;

          retView[encodedBuf.byteLength - 1] = encodedView[encodedBuf.byteLength - 1];
        }

        return retBuf;
      } //**********************************************************************************

      /**
       * Create string representation of current SID block
       * @returns {string}
       */


      toString() {
        let result = "";
        if (this.isHexOnly === true) result = (0, utils.bufferToHexCodes)(this.valueHex, 0, this.valueHex.byteLength);else {
          if (this.isFirstSid) {
            let sidValue = this.valueDec;
            if (this.valueDec <= 39) result = "0.";else {
              if (this.valueDec <= 79) {
                result = "1.";
                sidValue -= 40;
              } else {
                result = "2.";
                sidValue -= 80;
              }
            }
            result += sidValue.toString();
          } else result = this.valueDec.toString();
        }
        return result;
      } //**********************************************************************************
      //noinspection JSUnusedGlobalSymbols

      /**
       * Convertion for the block to JSON object
       * @returns {Object}
       */


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.valueDec = this.valueDec;
        object.isFirstSid = this.isFirstSid;
        return object;
      } //**********************************************************************************


    } //**************************************************************************************


    class LocalObjectIdentifierValueBlock extends LocalValueBlock {
      //**********************************************************************************

      /**
       * Constructor for "LocalObjectIdentifierValueBlock" class
       * @param {Object} [parameters={}]
       * @property {ArrayBuffer} [valueHex]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.fromString((0, utils.getParametersValue)(parameters, "value", ""));
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number} Offset after least decoded byte
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        let resultOffset = inputOffset;

        while (inputLength > 0) {
          const sidBlock = new LocalSidValueBlock();
          resultOffset = sidBlock.fromBER(inputBuffer, resultOffset, inputLength);

          if (resultOffset === -1) {
            this.blockLength = 0;
            this.error = sidBlock.error;
            return resultOffset;
          }

          if (this.value.length === 0) sidBlock.isFirstSid = true;
          this.blockLength += sidBlock.blockLength;
          inputLength -= sidBlock.blockLength;
          this.value.push(sidBlock);
        }

        return resultOffset;
      } //**********************************************************************************

      /**
       * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
       * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
       * @returns {ArrayBuffer}
       */


      toBER(sizeOnly = false) {
        let retBuf = new ArrayBuffer(0);

        for (let i = 0; i < this.value.length; i++) {
          const valueBuf = this.value[i].toBER(sizeOnly);

          if (valueBuf.byteLength === 0) {
            this.error = this.value[i].error;
            return new ArrayBuffer(0);
          }

          retBuf = (0, utils.utilConcatBuf)(retBuf, valueBuf);
        }

        return retBuf;
      } //**********************************************************************************

      /**
       * Create "LocalObjectIdentifierValueBlock" class from string
       * @param {string} string Input string to convert from
       * @returns {boolean}
       */


      fromString(string) {
        this.value = []; // Clear existing SID values

        let pos1 = 0;
        let pos2 = 0;
        let sid = "";
        let flag = false;

        do {
          pos2 = string.indexOf(".", pos1);
          if (pos2 === -1) sid = string.substr(pos1);else sid = string.substr(pos1, pos2 - pos1);
          pos1 = pos2 + 1;

          if (flag) {
            const sidBlock = this.value[0];
            let plus = 0;

            switch (sidBlock.valueDec) {
              case 0:
                break;

              case 1:
                plus = 40;
                break;

              case 2:
                plus = 80;
                break;

              default:
                this.value = []; // clear SID array

                return false;
              // ???
            }

            const parsedSID = parseInt(sid, 10);
            if (isNaN(parsedSID)) return true;
            sidBlock.valueDec = parsedSID + plus;
            flag = false;
          } else {
            const sidBlock = new LocalSidValueBlock();
            sidBlock.valueDec = parseInt(sid, 10);
            if (isNaN(sidBlock.valueDec)) return true;

            if (this.value.length === 0) {
              sidBlock.isFirstSid = true;
              flag = true;
            }

            this.value.push(sidBlock);
          }
        } while (pos2 !== -1);

        return true;
      } //**********************************************************************************

      /**
       * Converts "LocalObjectIdentifierValueBlock" class to string
       * @returns {string}
       */


      toString() {
        let result = "";
        let isHexOnly = false;

        for (let i = 0; i < this.value.length; i++) {
          isHexOnly = this.value[i].isHexOnly;
          let sidStr = this.value[i].toString();
          if (i !== 0) result = `${result}.`;

          if (isHexOnly) {
            sidStr = `{${sidStr}}`;
            if (this.value[i].isFirstSid) result = `2.{${sidStr} - 80}`;else result += sidStr;
          } else result += sidStr;
        }

        return result;
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "ObjectIdentifierValueBlock";
      } //**********************************************************************************

      /**
       * Convertion for the block to JSON object
       * @returns {Object}
       */


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.value = this.toString();
        object.sidArray = [];

        for (let i = 0; i < this.value.length; i++) object.sidArray.push(this.value[i].toJSON());

        return object;
      } //**********************************************************************************


    } //**************************************************************************************

    /**
     * @extends BaseBlock
     */


    class ObjectIdentifier extends BaseBlock {
      //**********************************************************************************

      /**
       * Constructor for "ObjectIdentifier" class
       * @param {Object} [parameters={}]
       * @property {ArrayBuffer} [valueHex]
       */
      constructor(parameters = {}) {
        super(parameters, LocalObjectIdentifierValueBlock);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 6; // OBJECT IDENTIFIER
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "ObjectIdentifier";
      } //**********************************************************************************


    }

    exports.ObjectIdentifier = ObjectIdentifier; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of all string's classes
    //**************************************************************************************

    class LocalUtf8StringValueBlock extends LocalHexBlock(LocalBaseBlock) {
      //**********************************************************************************
      //noinspection JSUnusedGlobalSymbols

      /**
       * Constructor for "LocalUtf8StringValueBlock" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.isHexOnly = true;
        this.value = ""; // String representation of decoded ArrayBuffer
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "Utf8StringValueBlock";
      } //**********************************************************************************
      //noinspection JSUnusedGlobalSymbols

      /**
       * Convertion for the block to JSON object
       * @returns {Object}
       */


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.value = this.value;
        return object;
      } //**********************************************************************************


    } //**************************************************************************************

    /**
     * @extends BaseBlock
     */


    class Utf8String extends BaseBlock {
      //**********************************************************************************

      /**
       * Constructor for "Utf8String" class
       * @param {Object} [parameters={}]
       * @property {ArrayBuffer} [valueHex]
       */
      constructor(parameters = {}) {
        super(parameters, LocalUtf8StringValueBlock);
        if ("value" in parameters) this.fromString(parameters.value);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 12; // Utf8String
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "Utf8String";
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number} Offset after least decoded byte
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);

        if (resultOffset === -1) {
          this.error = this.valueBlock.error;
          return resultOffset;
        }

        this.fromBuffer(this.valueBlock.valueHex);
        if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;
        if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;
        if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;
        return resultOffset;
      } //**********************************************************************************

      /**
       * Function converting ArrayBuffer into ASN.1 internal string
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       */


      fromBuffer(inputBuffer) {
        this.valueBlock.value = String.fromCharCode.apply(null, new Uint8Array(inputBuffer));

        try {
          //noinspection JSDeprecatedSymbols
          this.valueBlock.value = decodeURIComponent(escape(this.valueBlock.value));
        } catch (ex) {
          this.warnings.push(`Error during "decodeURIComponent": ${ex}, using raw string`);
        }
      } //**********************************************************************************

      /**
       * Function converting JavaScript string into ASN.1 internal class
       * @param {!string} inputString ASN.1 BER encoded array
       */


      fromString(inputString) {
        //noinspection JSDeprecatedSymbols
        const str = unescape(encodeURIComponent(inputString));
        const strLen = str.length;
        this.valueBlock.valueHex = new ArrayBuffer(strLen);
        const view = new Uint8Array(this.valueBlock.valueHex);

        for (let i = 0; i < strLen; i++) view[i] = str.charCodeAt(i);

        this.valueBlock.value = inputString;
      } //**********************************************************************************


    }

    exports.Utf8String = Utf8String; //**************************************************************************************

    /**
     * @extends LocalBaseBlock
     * @extends LocalHexBlock
     */

    class LocalBmpStringValueBlock extends LocalHexBlock(LocalBaseBlock) {
      //**********************************************************************************

      /**
       * Constructor for "LocalBmpStringValueBlock" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.isHexOnly = true;
        this.value = "";
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "BmpStringValueBlock";
      } //**********************************************************************************
      //noinspection JSUnusedGlobalSymbols

      /**
       * Convertion for the block to JSON object
       * @returns {Object}
       */


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.value = this.value;
        return object;
      } //**********************************************************************************


    } //**************************************************************************************

    /**
     * @extends BaseBlock
     */


    class BmpString extends BaseBlock {
      //**********************************************************************************

      /**
       * Constructor for "BmpString" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters, LocalBmpStringValueBlock);
        if ("value" in parameters) this.fromString(parameters.value);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 30; // BmpString
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "BmpString";
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number} Offset after least decoded byte
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);

        if (resultOffset === -1) {
          this.error = this.valueBlock.error;
          return resultOffset;
        }

        this.fromBuffer(this.valueBlock.valueHex);
        if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;
        if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;
        if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;
        return resultOffset;
      } //**********************************************************************************

      /**
       * Function converting ArrayBuffer into ASN.1 internal string
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       */


      fromBuffer(inputBuffer) {
        //noinspection JSCheckFunctionSignatures
        const copyBuffer = inputBuffer.slice(0);
        const valueView = new Uint8Array(copyBuffer);

        for (let i = 0; i < valueView.length; i += 2) {
          const temp = valueView[i];
          valueView[i] = valueView[i + 1];
          valueView[i + 1] = temp;
        }

        this.valueBlock.value = String.fromCharCode.apply(null, new Uint16Array(copyBuffer));
      } //**********************************************************************************

      /**
       * Function converting JavaScript string into ASN.1 internal class
       * @param {!string} inputString ASN.1 BER encoded array
       */


      fromString(inputString) {
        const strLength = inputString.length;
        this.valueBlock.valueHex = new ArrayBuffer(strLength * 2);
        const valueHexView = new Uint8Array(this.valueBlock.valueHex);

        for (let i = 0; i < strLength; i++) {
          const codeBuf = (0, utils.utilToBase)(inputString.charCodeAt(i), 8);
          const codeView = new Uint8Array(codeBuf);
          if (codeView.length > 2) continue;
          const dif = 2 - codeView.length;

          for (let j = codeView.length - 1; j >= 0; j--) valueHexView[i * 2 + j + dif] = codeView[j];
        }

        this.valueBlock.value = inputString;
      } //**********************************************************************************


    }

    exports.BmpString = BmpString; //**************************************************************************************

    class LocalUniversalStringValueBlock extends LocalHexBlock(LocalBaseBlock) {
      //**********************************************************************************

      /**
       * Constructor for "LocalUniversalStringValueBlock" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.isHexOnly = true;
        this.value = "";
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "UniversalStringValueBlock";
      } //**********************************************************************************
      //noinspection JSUnusedGlobalSymbols

      /**
       * Convertion for the block to JSON object
       * @returns {Object}
       */


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.value = this.value;
        return object;
      } //**********************************************************************************


    } //**************************************************************************************

    /**
     * @extends BaseBlock
     */


    class UniversalString extends BaseBlock {
      //**********************************************************************************

      /**
       * Constructor for "UniversalString" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters, LocalUniversalStringValueBlock);
        if ("value" in parameters) this.fromString(parameters.value);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 28; // UniversalString
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "UniversalString";
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number} Offset after least decoded byte
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);

        if (resultOffset === -1) {
          this.error = this.valueBlock.error;
          return resultOffset;
        }

        this.fromBuffer(this.valueBlock.valueHex);
        if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;
        if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;
        if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;
        return resultOffset;
      } //**********************************************************************************

      /**
       * Function converting ArrayBuffer into ASN.1 internal string
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       */


      fromBuffer(inputBuffer) {
        //noinspection JSCheckFunctionSignatures
        const copyBuffer = inputBuffer.slice(0);
        const valueView = new Uint8Array(copyBuffer);

        for (let i = 0; i < valueView.length; i += 4) {
          valueView[i] = valueView[i + 3];
          valueView[i + 1] = valueView[i + 2];
          valueView[i + 2] = 0x00;
          valueView[i + 3] = 0x00;
        }

        this.valueBlock.value = String.fromCharCode.apply(null, new Uint32Array(copyBuffer));
      } //**********************************************************************************

      /**
       * Function converting JavaScript string into ASN.1 internal class
       * @param {!string} inputString ASN.1 BER encoded array
       */


      fromString(inputString) {
        const strLength = inputString.length;
        this.valueBlock.valueHex = new ArrayBuffer(strLength * 4);
        const valueHexView = new Uint8Array(this.valueBlock.valueHex);

        for (let i = 0; i < strLength; i++) {
          const codeBuf = (0, utils.utilToBase)(inputString.charCodeAt(i), 8);
          const codeView = new Uint8Array(codeBuf);
          if (codeView.length > 4) continue;
          const dif = 4 - codeView.length;

          for (let j = codeView.length - 1; j >= 0; j--) valueHexView[i * 4 + j + dif] = codeView[j];
        }

        this.valueBlock.value = inputString;
      } //**********************************************************************************


    }

    exports.UniversalString = UniversalString; //**************************************************************************************

    class LocalSimpleStringValueBlock extends LocalHexBlock(LocalBaseBlock) {
      //**********************************************************************************

      /**
       * Constructor for "LocalSimpleStringValueBlock" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.value = "";
        this.isHexOnly = true;
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "SimpleStringValueBlock";
      } //**********************************************************************************
      //noinspection JSUnusedGlobalSymbols

      /**
       * Convertion for the block to JSON object
       * @returns {Object}
       */


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.value = this.value;
        return object;
      } //**********************************************************************************


    } //**************************************************************************************

    /**
     * @extends BaseBlock
     */


    class LocalSimpleStringBlock extends BaseBlock {
      //**********************************************************************************

      /**
       * Constructor for "LocalSimpleStringBlock" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters, LocalSimpleStringValueBlock);
        if ("value" in parameters) this.fromString(parameters.value);
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "SIMPLESTRING";
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number} Offset after least decoded byte
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);

        if (resultOffset === -1) {
          this.error = this.valueBlock.error;
          return resultOffset;
        }

        this.fromBuffer(this.valueBlock.valueHex);
        if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;
        if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;
        if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;
        return resultOffset;
      } //**********************************************************************************

      /**
       * Function converting ArrayBuffer into ASN.1 internal string
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       */


      fromBuffer(inputBuffer) {
        this.valueBlock.value = String.fromCharCode.apply(null, new Uint8Array(inputBuffer));
      } //**********************************************************************************

      /**
       * Function converting JavaScript string into ASN.1 internal class
       * @param {!string} inputString ASN.1 BER encoded array
       */


      fromString(inputString) {
        const strLen = inputString.length;
        this.valueBlock.valueHex = new ArrayBuffer(strLen);
        const view = new Uint8Array(this.valueBlock.valueHex);

        for (let i = 0; i < strLen; i++) view[i] = inputString.charCodeAt(i);

        this.valueBlock.value = inputString;
      } //**********************************************************************************


    } //**************************************************************************************

    /**
     * @extends LocalSimpleStringBlock
     */


    class NumericString extends LocalSimpleStringBlock {
      //**********************************************************************************

      /**
       * Constructor for "NumericString" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 18; // NumericString
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "NumericString";
      } //**********************************************************************************


    }

    exports.NumericString = NumericString; //**************************************************************************************

    /**
     * @extends LocalSimpleStringBlock
     */

    class PrintableString extends LocalSimpleStringBlock {
      //**********************************************************************************

      /**
       * Constructor for "PrintableString" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 19; // PrintableString
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "PrintableString";
      } //**********************************************************************************


    }

    exports.PrintableString = PrintableString; //**************************************************************************************

    /**
     * @extends LocalSimpleStringBlock
     */

    class TeletexString extends LocalSimpleStringBlock {
      //**********************************************************************************

      /**
       * Constructor for "TeletexString" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 20; // TeletexString
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "TeletexString";
      } //**********************************************************************************


    }

    exports.TeletexString = TeletexString; //**************************************************************************************

    /**
     * @extends LocalSimpleStringBlock
     */

    class VideotexString extends LocalSimpleStringBlock {
      //**********************************************************************************

      /**
       * Constructor for "VideotexString" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 21; // VideotexString
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "VideotexString";
      } //**********************************************************************************


    }

    exports.VideotexString = VideotexString; //**************************************************************************************

    /**
     * @extends LocalSimpleStringBlock
     */

    class IA5String extends LocalSimpleStringBlock {
      //**********************************************************************************

      /**
       * Constructor for "IA5String" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 22; // IA5String
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "IA5String";
      } //**********************************************************************************


    }

    exports.IA5String = IA5String; //**************************************************************************************

    /**
     * @extends LocalSimpleStringBlock
     */

    class GraphicString extends LocalSimpleStringBlock {
      //**********************************************************************************

      /**
       * Constructor for "GraphicString" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 25; // GraphicString
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "GraphicString";
      } //**********************************************************************************


    }

    exports.GraphicString = GraphicString; //**************************************************************************************

    /**
     * @extends LocalSimpleStringBlock
     */

    class VisibleString extends LocalSimpleStringBlock {
      //**********************************************************************************

      /**
       * Constructor for "VisibleString" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 26; // VisibleString
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "VisibleString";
      } //**********************************************************************************


    }

    exports.VisibleString = VisibleString; //**************************************************************************************

    /**
     * @extends LocalSimpleStringBlock
     */

    class GeneralString extends LocalSimpleStringBlock {
      //**********************************************************************************

      /**
       * Constructor for "GeneralString" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 27; // GeneralString
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "GeneralString";
      } //**********************************************************************************


    }

    exports.GeneralString = GeneralString; //**************************************************************************************

    /**
     * @extends LocalSimpleStringBlock
     */

    class CharacterString extends LocalSimpleStringBlock {
      //**********************************************************************************

      /**
       * Constructor for "CharacterString" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 29; // CharacterString
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "CharacterString";
      } //**********************************************************************************


    }

    exports.CharacterString = CharacterString; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of all date and time classes
    //**************************************************************************************

    /**
     * @extends VisibleString
     */

    class UTCTime extends VisibleString {
      //**********************************************************************************

      /**
       * Constructor for "UTCTime" class
       * @param {Object} [parameters={}]
       * @property {string} [value] String representatio of the date
       * @property {Date} [valueDate] JavaScript "Date" object
       */
      constructor(parameters = {}) {
        super(parameters);
        this.year = 0;
        this.month = 0;
        this.day = 0;
        this.hour = 0;
        this.minute = 0;
        this.second = 0; //region Create UTCTime from ASN.1 UTC string value

        if ("value" in parameters) {
          this.fromString(parameters.value);
          this.valueBlock.valueHex = new ArrayBuffer(parameters.value.length);
          const view = new Uint8Array(this.valueBlock.valueHex);

          for (let i = 0; i < parameters.value.length; i++) view[i] = parameters.value.charCodeAt(i);
        } //endregion
        //region Create GeneralizedTime from JavaScript Date type


        if ("valueDate" in parameters) {
          this.fromDate(parameters.valueDate);
          this.valueBlock.valueHex = this.toBuffer();
        } //endregion


        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 23; // UTCTime
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number} Offset after least decoded byte
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);

        if (resultOffset === -1) {
          this.error = this.valueBlock.error;
          return resultOffset;
        }

        this.fromBuffer(this.valueBlock.valueHex);
        if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;
        if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;
        if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;
        return resultOffset;
      } //**********************************************************************************

      /**
       * Function converting ArrayBuffer into ASN.1 internal string
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       */


      fromBuffer(inputBuffer) {
        this.fromString(String.fromCharCode.apply(null, new Uint8Array(inputBuffer)));
      } //**********************************************************************************

      /**
       * Function converting ASN.1 internal string into ArrayBuffer
       * @returns {ArrayBuffer}
       */


      toBuffer() {
        const str = this.toString();
        const buffer = new ArrayBuffer(str.length);
        const view = new Uint8Array(buffer);

        for (let i = 0; i < str.length; i++) view[i] = str.charCodeAt(i);

        return buffer;
      } //**********************************************************************************

      /**
       * Function converting "Date" object into ASN.1 internal string
       * @param {!Date} inputDate JavaScript "Date" object
       */


      fromDate(inputDate) {
        this.year = inputDate.getUTCFullYear();
        this.month = inputDate.getUTCMonth() + 1;
        this.day = inputDate.getUTCDate();
        this.hour = inputDate.getUTCHours();
        this.minute = inputDate.getUTCMinutes();
        this.second = inputDate.getUTCSeconds();
      } //**********************************************************************************
      //noinspection JSUnusedGlobalSymbols

      /**
       * Function converting ASN.1 internal string into "Date" object
       * @returns {Date}
       */


      toDate() {
        return new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second));
      } //**********************************************************************************

      /**
       * Function converting JavaScript string into ASN.1 internal class
       * @param {!string} inputString ASN.1 BER encoded array
       */


      fromString(inputString) {
        //region Parse input string
        const parser = /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z/ig;
        const parserArray = parser.exec(inputString);

        if (parserArray === null) {
          this.error = "Wrong input string for convertion";
          return;
        } //endregion
        //region Store parsed values


        const year = parseInt(parserArray[1], 10);
        if (year >= 50) this.year = 1900 + year;else this.year = 2000 + year;
        this.month = parseInt(parserArray[2], 10);
        this.day = parseInt(parserArray[3], 10);
        this.hour = parseInt(parserArray[4], 10);
        this.minute = parseInt(parserArray[5], 10);
        this.second = parseInt(parserArray[6], 10); //endregion
      } //**********************************************************************************

      /**
       * Function converting ASN.1 internal class into JavaScript string
       * @returns {string}
       */


      toString() {
        const outputArray = new Array(7);
        outputArray[0] = (0, utils.padNumber)(this.year < 2000 ? this.year - 1900 : this.year - 2000, 2);
        outputArray[1] = (0, utils.padNumber)(this.month, 2);
        outputArray[2] = (0, utils.padNumber)(this.day, 2);
        outputArray[3] = (0, utils.padNumber)(this.hour, 2);
        outputArray[4] = (0, utils.padNumber)(this.minute, 2);
        outputArray[5] = (0, utils.padNumber)(this.second, 2);
        outputArray[6] = "Z";
        return outputArray.join("");
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "UTCTime";
      } //**********************************************************************************

      /**
       * Convertion for the block to JSON object
       * @returns {Object}
       */


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.year = this.year;
        object.month = this.month;
        object.day = this.day;
        object.hour = this.hour;
        object.minute = this.minute;
        object.second = this.second;
        return object;
      } //**********************************************************************************


    }

    exports.UTCTime = UTCTime; //**************************************************************************************

    /**
     * @extends VisibleString
     */

    class GeneralizedTime extends VisibleString {
      //**********************************************************************************

      /**
       * Constructor for "GeneralizedTime" class
       * @param {Object} [parameters={}]
       * @property {string} [value] String representatio of the date
       * @property {Date} [valueDate] JavaScript "Date" object
       */
      constructor(parameters = {}) {
        super(parameters);
        this.year = 0;
        this.month = 0;
        this.day = 0;
        this.hour = 0;
        this.minute = 0;
        this.second = 0;
        this.millisecond = 0; //region Create UTCTime from ASN.1 UTC string value

        if ("value" in parameters) {
          this.fromString(parameters.value);
          this.valueBlock.valueHex = new ArrayBuffer(parameters.value.length);
          const view = new Uint8Array(this.valueBlock.valueHex);

          for (let i = 0; i < parameters.value.length; i++) view[i] = parameters.value.charCodeAt(i);
        } //endregion
        //region Create GeneralizedTime from JavaScript Date type


        if ("valueDate" in parameters) {
          this.fromDate(parameters.valueDate);
          this.valueBlock.valueHex = this.toBuffer();
        } //endregion


        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 24; // GeneralizedTime
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number} Offset after least decoded byte
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        const resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);

        if (resultOffset === -1) {
          this.error = this.valueBlock.error;
          return resultOffset;
        }

        this.fromBuffer(this.valueBlock.valueHex);
        if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;
        if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;
        if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;
        return resultOffset;
      } //**********************************************************************************

      /**
       * Function converting ArrayBuffer into ASN.1 internal string
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       */


      fromBuffer(inputBuffer) {
        this.fromString(String.fromCharCode.apply(null, new Uint8Array(inputBuffer)));
      } //**********************************************************************************

      /**
       * Function converting ASN.1 internal string into ArrayBuffer
       * @returns {ArrayBuffer}
       */


      toBuffer() {
        const str = this.toString();
        const buffer = new ArrayBuffer(str.length);
        const view = new Uint8Array(buffer);

        for (let i = 0; i < str.length; i++) view[i] = str.charCodeAt(i);

        return buffer;
      } //**********************************************************************************

      /**
       * Function converting "Date" object into ASN.1 internal string
       * @param {!Date} inputDate JavaScript "Date" object
       */


      fromDate(inputDate) {
        this.year = inputDate.getUTCFullYear();
        this.month = inputDate.getUTCMonth() + 1;
        this.day = inputDate.getUTCDate();
        this.hour = inputDate.getUTCHours();
        this.minute = inputDate.getUTCMinutes();
        this.second = inputDate.getUTCSeconds();
        this.millisecond = inputDate.getUTCMilliseconds();
      } //**********************************************************************************
      //noinspection JSUnusedGlobalSymbols

      /**
       * Function converting ASN.1 internal string into "Date" object
       * @returns {Date}
       */


      toDate() {
        return new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.millisecond));
      } //**********************************************************************************

      /**
       * Function converting JavaScript string into ASN.1 internal class
       * @param {!string} inputString ASN.1 BER encoded array
       */


      fromString(inputString) {
        //region Initial variables
        let isUTC = false;
        let timeString = "";
        let dateTimeString = "";
        let fractionPart = 0;
        let parser;
        let hourDifference = 0;
        let minuteDifference = 0; //endregion
        //region Convert as UTC time

        if (inputString[inputString.length - 1] === "Z") {
          timeString = inputString.substr(0, inputString.length - 1);
          isUTC = true;
        } //endregion
        //region Convert as local time
        else {
            //noinspection JSPrimitiveTypeWrapperUsage
            const number = new Number(inputString[inputString.length - 1]);
            if (isNaN(number.valueOf())) throw new Error("Wrong input string for convertion");
            timeString = inputString;
          } //endregion
        //region Check that we do not have a "+" and "-" symbols inside UTC time


        if (isUTC) {
          if (timeString.indexOf("+") !== -1) throw new Error("Wrong input string for convertion");
          if (timeString.indexOf("-") !== -1) throw new Error("Wrong input string for convertion");
        } //endregion
        //region Get "UTC time difference" in case of local time
        else {
            let multiplier = 1;
            let differencePosition = timeString.indexOf("+");
            let differenceString = "";

            if (differencePosition === -1) {
              differencePosition = timeString.indexOf("-");
              multiplier = -1;
            }

            if (differencePosition !== -1) {
              differenceString = timeString.substr(differencePosition + 1);
              timeString = timeString.substr(0, differencePosition);
              if (differenceString.length !== 2 && differenceString.length !== 4) throw new Error("Wrong input string for convertion"); //noinspection JSPrimitiveTypeWrapperUsage

              let number = new Number(differenceString.substr(0, 2));
              if (isNaN(number.valueOf())) throw new Error("Wrong input string for convertion");
              hourDifference = multiplier * number;

              if (differenceString.length === 4) {
                //noinspection JSPrimitiveTypeWrapperUsage
                number = new Number(differenceString.substr(2, 2));
                if (isNaN(number.valueOf())) throw new Error("Wrong input string for convertion");
                minuteDifference = multiplier * number;
              }
            }
          } //endregion
        //region Get position of fraction point


        let fractionPointPosition = timeString.indexOf("."); // Check for "full stop" symbol

        if (fractionPointPosition === -1) fractionPointPosition = timeString.indexOf(","); // Check for "comma" symbol
        //endregion
        //region Get fraction part

        if (fractionPointPosition !== -1) {
          //noinspection JSPrimitiveTypeWrapperUsage
          const fractionPartCheck = new Number(`0${timeString.substr(fractionPointPosition)}`);
          if (isNaN(fractionPartCheck.valueOf())) throw new Error("Wrong input string for convertion");
          fractionPart = fractionPartCheck.valueOf();
          dateTimeString = timeString.substr(0, fractionPointPosition);
        } else dateTimeString = timeString; //endregion
        //region Parse internal date


        switch (true) {
          case dateTimeString.length === 8:
            // "YYYYMMDD"
            parser = /(\d{4})(\d{2})(\d{2})/ig;
            if (fractionPointPosition !== -1) throw new Error("Wrong input string for convertion"); // Here we should not have a "fraction point"

            break;

          case dateTimeString.length === 10:
            // "YYYYMMDDHH"
            parser = /(\d{4})(\d{2})(\d{2})(\d{2})/ig;

            if (fractionPointPosition !== -1) {
              let fractionResult = 60 * fractionPart;
              this.minute = Math.floor(fractionResult);
              fractionResult = 60 * (fractionResult - this.minute);
              this.second = Math.floor(fractionResult);
              fractionResult = 1000 * (fractionResult - this.second);
              this.millisecond = Math.floor(fractionResult);
            }

            break;

          case dateTimeString.length === 12:
            // "YYYYMMDDHHMM"
            parser = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/ig;

            if (fractionPointPosition !== -1) {
              let fractionResult = 60 * fractionPart;
              this.second = Math.floor(fractionResult);
              fractionResult = 1000 * (fractionResult - this.second);
              this.millisecond = Math.floor(fractionResult);
            }

            break;

          case dateTimeString.length === 14:
            // "YYYYMMDDHHMMSS"
            parser = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/ig;

            if (fractionPointPosition !== -1) {
              const fractionResult = 1000 * fractionPart;
              this.millisecond = Math.floor(fractionResult);
            }

            break;

          default:
            throw new Error("Wrong input string for convertion");
        } //endregion
        //region Put parsed values at right places


        const parserArray = parser.exec(dateTimeString);
        if (parserArray === null) throw new Error("Wrong input string for convertion");

        for (let j = 1; j < parserArray.length; j++) {
          switch (j) {
            case 1:
              this.year = parseInt(parserArray[j], 10);
              break;

            case 2:
              this.month = parseInt(parserArray[j], 10);
              break;

            case 3:
              this.day = parseInt(parserArray[j], 10);
              break;

            case 4:
              this.hour = parseInt(parserArray[j], 10) + hourDifference;
              break;

            case 5:
              this.minute = parseInt(parserArray[j], 10) + minuteDifference;
              break;

            case 6:
              this.second = parseInt(parserArray[j], 10);
              break;

            default:
              throw new Error("Wrong input string for convertion");
          }
        } //endregion
        //region Get final date


        if (isUTC === false) {
          const tempDate = new Date(this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
          this.year = tempDate.getUTCFullYear();
          this.month = tempDate.getUTCMonth();
          this.day = tempDate.getUTCDay();
          this.hour = tempDate.getUTCHours();
          this.minute = tempDate.getUTCMinutes();
          this.second = tempDate.getUTCSeconds();
          this.millisecond = tempDate.getUTCMilliseconds();
        } //endregion

      } //**********************************************************************************

      /**
       * Function converting ASN.1 internal class into JavaScript string
       * @returns {string}
       */


      toString() {
        const outputArray = [];
        outputArray.push((0, utils.padNumber)(this.year, 4));
        outputArray.push((0, utils.padNumber)(this.month, 2));
        outputArray.push((0, utils.padNumber)(this.day, 2));
        outputArray.push((0, utils.padNumber)(this.hour, 2));
        outputArray.push((0, utils.padNumber)(this.minute, 2));
        outputArray.push((0, utils.padNumber)(this.second, 2));

        if (this.millisecond !== 0) {
          outputArray.push(".");
          outputArray.push((0, utils.padNumber)(this.millisecond, 3));
        }

        outputArray.push("Z");
        return outputArray.join("");
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "GeneralizedTime";
      } //**********************************************************************************

      /**
       * Convertion for the block to JSON object
       * @returns {Object}
       */


      toJSON() {
        let object = {}; //region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object

        try {
          object = super.toJSON();
        } catch (ex) {} //endregion


        object.year = this.year;
        object.month = this.month;
        object.day = this.day;
        object.hour = this.hour;
        object.minute = this.minute;
        object.second = this.second;
        object.millisecond = this.millisecond;
        return object;
      } //**********************************************************************************


    }

    exports.GeneralizedTime = GeneralizedTime; //**************************************************************************************

    /**
     * @extends Utf8String
     */

    class DATE extends Utf8String {
      //**********************************************************************************

      /**
       * Constructor for "DATE" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 31; // DATE
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "DATE";
      } //**********************************************************************************


    }

    exports.DATE = DATE; //**************************************************************************************

    /**
     * @extends Utf8String
     */

    class TimeOfDay extends Utf8String {
      //**********************************************************************************

      /**
       * Constructor for "TimeOfDay" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 32; // TimeOfDay
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "TimeOfDay";
      } //**********************************************************************************


    }

    exports.TimeOfDay = TimeOfDay; //**************************************************************************************

    /**
     * @extends Utf8String
     */

    class DateTime extends Utf8String {
      //**********************************************************************************

      /**
       * Constructor for "DateTime" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 33; // DateTime
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "DateTime";
      } //**********************************************************************************


    }

    exports.DateTime = DateTime; //**************************************************************************************

    /**
     * @extends Utf8String
     */

    class Duration extends Utf8String {
      //**********************************************************************************

      /**
       * Constructor for "Duration" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 34; // Duration
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "Duration";
      } //**********************************************************************************


    }

    exports.Duration = Duration; //**************************************************************************************

    /**
     * @extends Utf8String
     */

    class TIME extends Utf8String {
      //**********************************************************************************

      /**
       * Constructor for "Time" class
       * @param {Object} [parameters={}]
       */
      constructor(parameters = {}) {
        super(parameters);
        this.idBlock.tagClass = 1; // UNIVERSAL

        this.idBlock.tagNumber = 14; // Time
      } //**********************************************************************************

      /**
       * Aux function, need to get a block name. Need to have it here for inhiritence
       * @returns {string}
       */


      static blockName() {
        return "TIME";
      } //**********************************************************************************


    }

    exports.TIME = TIME; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of special ASN.1 schema type Choice
    //**************************************************************************************

    class Choice {
      //**********************************************************************************

      /**
       * Constructor for "Choice" class
       * @param {Object} [parameters={}]
       * @property {Array} [value] Array of ASN.1 types for make a choice from
       * @property {boolean} [optional]
       */
      constructor(parameters = {}) {
        this.value = (0, utils.getParametersValue)(parameters, "value", []);
        this.optional = (0, utils.getParametersValue)(parameters, "optional", false);
      } //**********************************************************************************


    }

    exports.Choice = Choice; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of special ASN.1 schema type Any
    //**************************************************************************************

    class Any {
      //**********************************************************************************

      /**
       * Constructor for "Any" class
       * @param {Object} [parameters={}]
       * @property {string} [name]
       * @property {boolean} [optional]
       */
      constructor(parameters = {}) {
        this.name = (0, utils.getParametersValue)(parameters, "name", "");
        this.optional = (0, utils.getParametersValue)(parameters, "optional", false);
      } //**********************************************************************************


    }

    exports.Any = Any; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of special ASN.1 schema type Repeated
    //**************************************************************************************

    class Repeated {
      //**********************************************************************************

      /**
       * Constructor for "Repeated" class
       * @param {Object} [parameters={}]
       * @property {string} [name]
       * @property {boolean} [optional]
       */
      constructor(parameters = {}) {
        this.name = (0, utils.getParametersValue)(parameters, "name", "");
        this.optional = (0, utils.getParametersValue)(parameters, "optional", false);
        this.value = (0, utils.getParametersValue)(parameters, "value", new Any());
        this.local = (0, utils.getParametersValue)(parameters, "local", false); // Could local or global array to store elements
      } //**********************************************************************************


    }

    exports.Repeated = Repeated; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Declaration of special ASN.1 schema type RawData
    //**************************************************************************************

    /**
     * @description Special class providing ability to have "toBER/fromBER" for raw ArrayBuffer
     */

    class RawData {
      //**********************************************************************************

      /**
       * Constructor for "Repeated" class
       * @param {Object} [parameters={}]
       * @property {string} [name]
       * @property {boolean} [optional]
       */
      constructor(parameters = {}) {
        this.data = (0, utils.getParametersValue)(parameters, "data", new ArrayBuffer(0));
      } //**********************************************************************************

      /**
       * Base function for converting block from BER encoded array of bytes
       * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
       * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
       * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
       * @returns {number} Offset after least decoded byte
       */


      fromBER(inputBuffer, inputOffset, inputLength) {
        this.data = inputBuffer.slice(inputOffset, inputLength);
        return inputOffset + inputLength;
      } //**********************************************************************************

      /**
       * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
       * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
       * @returns {ArrayBuffer}
       */


      toBER(sizeOnly = false) {
        return this.data;
      } //**********************************************************************************


    }

    exports.RawData = RawData; //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Major ASN.1 BER decoding function
    //**************************************************************************************

    /**
     * Internal library function for decoding ASN.1 BER
     * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
     * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
     * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
     * @returns {{offset: number, result: Object}}
     */

    function LocalFromBER(inputBuffer, inputOffset, inputLength) {
      const incomingOffset = inputOffset; // Need to store initial offset since "inputOffset" is changing in the function
      //region Local function changing a type for ASN.1 classes

      function localChangeType(inputObject, newType) {
        if (inputObject instanceof newType) return inputObject;
        const newObject = new newType();
        newObject.idBlock = inputObject.idBlock;
        newObject.lenBlock = inputObject.lenBlock;
        newObject.warnings = inputObject.warnings; //noinspection JSCheckFunctionSignatures

        newObject.valueBeforeDecode = inputObject.valueBeforeDecode.slice(0);
        return newObject;
      } //endregion
      //region Create a basic ASN.1 type since we need to return errors and warnings from the function


      let returnObject = new BaseBlock({}, Object); //endregion
      //region Basic check for parameters

      if ((0, utils.checkBufferParams)(new LocalBaseBlock(), inputBuffer, inputOffset, inputLength) === false) {
        returnObject.error = "Wrong input parameters";
        return {
          offset: -1,
          result: returnObject
        };
      } //endregion
      //region Getting Uint8Array from ArrayBuffer


      const intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength); //endregion
      //region Initial checks

      if (intBuffer.length === 0) {
        this.error = "Zero buffer length";
        return {
          offset: -1,
          result: returnObject
        };
      } //endregion
      //region Decode indentifcation block of ASN.1 BER structure


      let resultOffset = returnObject.idBlock.fromBER(inputBuffer, inputOffset, inputLength);
      returnObject.warnings.concat(returnObject.idBlock.warnings);

      if (resultOffset === -1) {
        returnObject.error = returnObject.idBlock.error;
        return {
          offset: -1,
          result: returnObject
        };
      }

      inputOffset = resultOffset;
      inputLength -= returnObject.idBlock.blockLength; //endregion
      //region Decode length block of ASN.1 BER structure

      resultOffset = returnObject.lenBlock.fromBER(inputBuffer, inputOffset, inputLength);
      returnObject.warnings.concat(returnObject.lenBlock.warnings);

      if (resultOffset === -1) {
        returnObject.error = returnObject.lenBlock.error;
        return {
          offset: -1,
          result: returnObject
        };
      }

      inputOffset = resultOffset;
      inputLength -= returnObject.lenBlock.blockLength; //endregion
      //region Check for usign indefinite length form in encoding for primitive types

      if (returnObject.idBlock.isConstructed === false && returnObject.lenBlock.isIndefiniteForm === true) {
        returnObject.error = "Indefinite length form used for primitive encoding form";
        return {
          offset: -1,
          result: returnObject
        };
      } //endregion
      //region Switch ASN.1 block type


      let newASN1Type = BaseBlock;

      switch (returnObject.idBlock.tagClass) {
        //region UNIVERSAL
        case 1:
          //region Check for reserved tag numbers
          if (returnObject.idBlock.tagNumber >= 37 && returnObject.idBlock.isHexOnly === false) {
            returnObject.error = "UNIVERSAL 37 and upper tags are reserved by ASN.1 standard";
            return {
              offset: -1,
              result: returnObject
            };
          } //endregion


          switch (returnObject.idBlock.tagNumber) {
            //region EndOfContent type
            case 0:
              //region Check for EndOfContent type
              if (returnObject.idBlock.isConstructed === true && returnObject.lenBlock.length > 0) {
                returnObject.error = "Type [UNIVERSAL 0] is reserved";
                return {
                  offset: -1,
                  result: returnObject
                };
              } //endregion


              newASN1Type = EndOfContent;
              break;
            //endregion
            //region Boolean type

            case 1:
              newASN1Type = Boolean;
              break;
            //endregion
            //region Integer type

            case 2:
              newASN1Type = Integer;
              break;
            //endregion
            //region BitString type

            case 3:
              newASN1Type = BitString;
              break;
            //endregion
            //region OctetString type

            case 4:
              newASN1Type = OctetString;
              break;
            //endregion
            //region Null type

            case 5:
              newASN1Type = Null;
              break;
            //endregion
            //region OBJECT IDENTIFIER type

            case 6:
              newASN1Type = ObjectIdentifier;
              break;
            //endregion
            //region Enumerated type

            case 10:
              newASN1Type = Enumerated;
              break;
            //endregion
            //region Utf8String type

            case 12:
              newASN1Type = Utf8String;
              break;
            //endregion
            //region Time type

            case 14:
              newASN1Type = TIME;
              break;
            //endregion
            //region ASN.1 reserved type

            case 15:
              returnObject.error = "[UNIVERSAL 15] is reserved by ASN.1 standard";
              return {
                offset: -1,
                result: returnObject
              };
            //endregion
            //region Sequence type

            case 16:
              newASN1Type = Sequence;
              break;
            //endregion
            //region Set type

            case 17:
              newASN1Type = Set;
              break;
            //endregion
            //region NumericString type

            case 18:
              newASN1Type = NumericString;
              break;
            //endregion
            //region PrintableString type

            case 19:
              newASN1Type = PrintableString;
              break;
            //endregion
            //region TeletexString type

            case 20:
              newASN1Type = TeletexString;
              break;
            //endregion
            //region VideotexString type

            case 21:
              newASN1Type = VideotexString;
              break;
            //endregion
            //region IA5String type

            case 22:
              newASN1Type = IA5String;
              break;
            //endregion
            //region UTCTime type

            case 23:
              newASN1Type = UTCTime;
              break;
            //endregion
            //region GeneralizedTime type

            case 24:
              newASN1Type = GeneralizedTime;
              break;
            //endregion
            //region GraphicString type

            case 25:
              newASN1Type = GraphicString;
              break;
            //endregion
            //region VisibleString type

            case 26:
              newASN1Type = VisibleString;
              break;
            //endregion
            //region GeneralString type

            case 27:
              newASN1Type = GeneralString;
              break;
            //endregion
            //region UniversalString type

            case 28:
              newASN1Type = UniversalString;
              break;
            //endregion
            //region CharacterString type

            case 29:
              newASN1Type = CharacterString;
              break;
            //endregion
            //region BmpString type

            case 30:
              newASN1Type = BmpString;
              break;
            //endregion
            //region DATE type

            case 31:
              newASN1Type = DATE;
              break;
            //endregion
            //region TimeOfDay type

            case 32:
              newASN1Type = TimeOfDay;
              break;
            //endregion
            //region Date-Time type

            case 33:
              newASN1Type = DateTime;
              break;
            //endregion
            //region Duration type

            case 34:
              newASN1Type = Duration;
              break;
            //endregion
            //region default

            default:
              {
                let newObject;
                if (returnObject.idBlock.isConstructed === true) newObject = new Constructed();else newObject = new Primitive();
                newObject.idBlock = returnObject.idBlock;
                newObject.lenBlock = returnObject.lenBlock;
                newObject.warnings = returnObject.warnings;
                returnObject = newObject;
                resultOffset = returnObject.fromBER(inputBuffer, inputOffset, inputLength);
              }
            //endregion
          }

          break;
        //endregion
        //region All other tag classes

        case 2: // APPLICATION

        case 3: // CONTEXT-SPECIFIC

        case 4: // PRIVATE

        default:
          {
            if (returnObject.idBlock.isConstructed === true) newASN1Type = Constructed;else newASN1Type = Primitive;
          }
        //endregion
      } //endregion
      //region Change type and perform BER decoding


      returnObject = localChangeType(returnObject, newASN1Type);
      resultOffset = returnObject.fromBER(inputBuffer, inputOffset, returnObject.lenBlock.isIndefiniteForm === true ? inputLength : returnObject.lenBlock.length); //endregion
      //region Coping incoming buffer for entire ASN.1 block

      returnObject.valueBeforeDecode = inputBuffer.slice(incomingOffset, incomingOffset + returnObject.blockLength); //endregion

      return {
        offset: resultOffset,
        result: returnObject
      };
    } //**************************************************************************************

    /**
     * Major function for decoding ASN.1 BER array into internal library structuries
     * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array of bytes
     */


    function fromBER(inputBuffer) {
      if (inputBuffer.byteLength === 0) {
        const result = new BaseBlock({}, Object);
        result.error = "Input buffer has zero length";
        return {
          offset: -1,
          result
        };
      }

      return LocalFromBER(inputBuffer, 0, inputBuffer.byteLength);
    } //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Major scheme verification function
    //**************************************************************************************

    /**
     * Compare of two ASN.1 object trees
     * @param {!Object} root Root of input ASN.1 object tree
     * @param {!Object} inputData Input ASN.1 object tree
     * @param {!Object} inputSchema Input ASN.1 schema to compare with
     * @return {{verified: boolean}|{verified:boolean, result: Object}}
     */


    function compareSchema(root, inputData, inputSchema) {
      //region Special case for Choice schema element type
      if (inputSchema instanceof Choice) {
        for (let j = 0; j < inputSchema.value.length; j++) {
          const result = compareSchema(root, inputData, inputSchema.value[j]);

          if (result.verified === true) {
            return {
              verified: true,
              result: root
            };
          }
        }

        {
          const _result = {
            verified: false,
            result: {
              error: "Wrong values for Choice type"
            }
          };
          if (inputSchema.hasOwnProperty("name")) _result.name = inputSchema.name;
          return _result;
        }
      } //endregion
      //region Special case for Any schema element type


      if (inputSchema instanceof Any) {
        //region Add named component of ASN.1 schema
        if (inputSchema.hasOwnProperty("name")) root[inputSchema.name] = inputData; //endregion

        return {
          verified: true,
          result: root
        };
      } //endregion
      //region Initial check


      if (root instanceof Object === false) {
        return {
          verified: false,
          result: {
            error: "Wrong root object"
          }
        };
      }

      if (inputData instanceof Object === false) {
        return {
          verified: false,
          result: {
            error: "Wrong ASN.1 data"
          }
        };
      }

      if (inputSchema instanceof Object === false) {
        return {
          verified: false,
          result: {
            error: "Wrong ASN.1 schema"
          }
        };
      }

      if ("idBlock" in inputSchema === false) {
        return {
          verified: false,
          result: {
            error: "Wrong ASN.1 schema"
          }
        };
      } //endregion
      //region Comparing idBlock properties in ASN.1 data and ASN.1 schema
      //region Encode and decode ASN.1 schema idBlock
      /// <remarks>This encoding/decoding is neccessary because could be an errors in schema definition</remarks>


      if ("fromBER" in inputSchema.idBlock === false) {
        return {
          verified: false,
          result: {
            error: "Wrong ASN.1 schema"
          }
        };
      }

      if ("toBER" in inputSchema.idBlock === false) {
        return {
          verified: false,
          result: {
            error: "Wrong ASN.1 schema"
          }
        };
      }

      const encodedId = inputSchema.idBlock.toBER(false);

      if (encodedId.byteLength === 0) {
        return {
          verified: false,
          result: {
            error: "Error encoding idBlock for ASN.1 schema"
          }
        };
      }

      const decodedOffset = inputSchema.idBlock.fromBER(encodedId, 0, encodedId.byteLength);

      if (decodedOffset === -1) {
        return {
          verified: false,
          result: {
            error: "Error decoding idBlock for ASN.1 schema"
          }
        };
      } //endregion
      //region tagClass


      if (inputSchema.idBlock.hasOwnProperty("tagClass") === false) {
        return {
          verified: false,
          result: {
            error: "Wrong ASN.1 schema"
          }
        };
      }

      if (inputSchema.idBlock.tagClass !== inputData.idBlock.tagClass) {
        return {
          verified: false,
          result: root
        };
      } //endregion
      //region tagNumber


      if (inputSchema.idBlock.hasOwnProperty("tagNumber") === false) {
        return {
          verified: false,
          result: {
            error: "Wrong ASN.1 schema"
          }
        };
      }

      if (inputSchema.idBlock.tagNumber !== inputData.idBlock.tagNumber) {
        return {
          verified: false,
          result: root
        };
      } //endregion
      //region isConstructed


      if (inputSchema.idBlock.hasOwnProperty("isConstructed") === false) {
        return {
          verified: false,
          result: {
            error: "Wrong ASN.1 schema"
          }
        };
      }

      if (inputSchema.idBlock.isConstructed !== inputData.idBlock.isConstructed) {
        return {
          verified: false,
          result: root
        };
      } //endregion
      //region isHexOnly


      if ("isHexOnly" in inputSchema.idBlock === false) // Since 'isHexOnly' is an inhirited property
        {
          return {
            verified: false,
            result: {
              error: "Wrong ASN.1 schema"
            }
          };
        }

      if (inputSchema.idBlock.isHexOnly !== inputData.idBlock.isHexOnly) {
        return {
          verified: false,
          result: root
        };
      } //endregion
      //region valueHex


      if (inputSchema.idBlock.isHexOnly === true) {
        if ("valueHex" in inputSchema.idBlock === false) // Since 'valueHex' is an inhirited property
          {
            return {
              verified: false,
              result: {
                error: "Wrong ASN.1 schema"
              }
            };
          }

        const schemaView = new Uint8Array(inputSchema.idBlock.valueHex);
        const asn1View = new Uint8Array(inputData.idBlock.valueHex);

        if (schemaView.length !== asn1View.length) {
          return {
            verified: false,
            result: root
          };
        }

        for (let i = 0; i < schemaView.length; i++) {
          if (schemaView[i] !== asn1View[1]) {
            return {
              verified: false,
              result: root
            };
          }
        }
      } //endregion
      //endregion
      //region Add named component of ASN.1 schema


      if (inputSchema.hasOwnProperty("name")) {
        inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
        if (inputSchema.name !== "") root[inputSchema.name] = inputData;
      } //endregion
      //region Getting next ASN.1 block for comparition


      if (inputSchema.idBlock.isConstructed === true) {
        let admission = 0;
        let result = {
          verified: false
        };
        let maxLength = inputSchema.valueBlock.value.length;

        if (maxLength > 0) {
          if (inputSchema.valueBlock.value[0] instanceof Repeated) maxLength = inputData.valueBlock.value.length;
        } //region Special case when constructive value has no elements


        if (maxLength === 0) {
          return {
            verified: true,
            result: root
          };
        } //endregion
        //region Special case when "inputData" has no values and "inputSchema" has all optional values


        if (inputData.valueBlock.value.length === 0 && inputSchema.valueBlock.value.length !== 0) {
          let _optional = true;

          for (let i = 0; i < inputSchema.valueBlock.value.length; i++) _optional = _optional && (inputSchema.valueBlock.value[i].optional || false);

          if (_optional === true) {
            return {
              verified: true,
              result: root
            };
          } //region Delete early added name of block


          if (inputSchema.hasOwnProperty("name")) {
            inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
            if (inputSchema.name !== "") delete root[inputSchema.name];
          } //endregion


          root.error = "Inconsistent object length";
          return {
            verified: false,
            result: root
          };
        } //endregion


        for (let i = 0; i < maxLength; i++) {
          //region Special case when there is an "optional" element of ASN.1 schema at the end
          if (i - admission >= inputData.valueBlock.value.length) {
            if (inputSchema.valueBlock.value[i].optional === false) {
              const _result = {
                verified: false,
                result: root
              };
              root.error = "Inconsistent length between ASN.1 data and schema"; //region Delete early added name of block

              if (inputSchema.hasOwnProperty("name")) {
                inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");

                if (inputSchema.name !== "") {
                  delete root[inputSchema.name];
                  _result.name = inputSchema.name;
                }
              } //endregion


              return _result;
            }
          } //endregion
          else {
              //region Special case for Repeated type of ASN.1 schema element
              if (inputSchema.valueBlock.value[0] instanceof Repeated) {
                result = compareSchema(root, inputData.valueBlock.value[i], inputSchema.valueBlock.value[0].value);

                if (result.verified === false) {
                  if (inputSchema.valueBlock.value[0].optional === true) admission++;else {
                    //region Delete early added name of block
                    if (inputSchema.hasOwnProperty("name")) {
                      inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
                      if (inputSchema.name !== "") delete root[inputSchema.name];
                    } //endregion


                    return result;
                  }
                }

                if ("name" in inputSchema.valueBlock.value[0] && inputSchema.valueBlock.value[0].name.length > 0) {
                  let arrayRoot = {};
                  if ("local" in inputSchema.valueBlock.value[0] && inputSchema.valueBlock.value[0].local === true) arrayRoot = inputData;else arrayRoot = root;
                  if (typeof arrayRoot[inputSchema.valueBlock.value[0].name] === "undefined") arrayRoot[inputSchema.valueBlock.value[0].name] = [];
                  arrayRoot[inputSchema.valueBlock.value[0].name].push(inputData.valueBlock.value[i]);
                }
              } //endregion
              else {
                  result = compareSchema(root, inputData.valueBlock.value[i - admission], inputSchema.valueBlock.value[i]);

                  if (result.verified === false) {
                    if (inputSchema.valueBlock.value[i].optional === true) admission++;else {
                      //region Delete early added name of block
                      if (inputSchema.hasOwnProperty("name")) {
                        inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
                        if (inputSchema.name !== "") delete root[inputSchema.name];
                      } //endregion


                      return result;
                    }
                  }
                }
            }
        }

        if (result.verified === false) // The situation may take place if last element is "optional" and verification failed
          {
            const _result = {
              verified: false,
              result: root
            }; //region Delete early added name of block

            if (inputSchema.hasOwnProperty("name")) {
              inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");

              if (inputSchema.name !== "") {
                delete root[inputSchema.name];
                _result.name = inputSchema.name;
              }
            } //endregion


            return _result;
          }

        return {
          verified: true,
          result: root
        };
      } //endregion
      //region Ability to parse internal value for primitive-encoded value (value of OctetString, for example)


      if ("primitiveSchema" in inputSchema && "valueHex" in inputData.valueBlock) {
        //region Decoding of raw ASN.1 data
        const asn1 = fromBER(inputData.valueBlock.valueHex);

        if (asn1.offset === -1) {
          const _result = {
            verified: false,
            result: asn1.result
          }; //region Delete early added name of block

          if (inputSchema.hasOwnProperty("name")) {
            inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");

            if (inputSchema.name !== "") {
              delete root[inputSchema.name];
              _result.name = inputSchema.name;
            }
          } //endregion


          return _result;
        } //endregion


        return compareSchema(root, asn1.result, inputSchema.primitiveSchema);
      }

      return {
        verified: true,
        result: root
      }; //endregion
    } //**************************************************************************************
    //noinspection JSUnusedGlobalSymbols

    /**
     * ASN.1 schema verification for ArrayBuffer data
     * @param {!ArrayBuffer} inputBuffer Input BER-encoded ASN.1 data
     * @param {!Object} inputSchema Input ASN.1 schema to verify against to
     * @return {{verified: boolean}|{verified:boolean, result: Object}}
     */


    function verifySchema(inputBuffer, inputSchema) {
      //region Initial check
      if (inputSchema instanceof Object === false) {
        return {
          verified: false,
          result: {
            error: "Wrong ASN.1 schema type"
          }
        };
      } //endregion
      //region Decoding of raw ASN.1 data


      const asn1 = fromBER(inputBuffer);

      if (asn1.offset === -1) {
        return {
          verified: false,
          result: asn1.result
        };
      } //endregion
      //region Compare ASN.1 struct with input schema


      return compareSchema(asn1.result, asn1.result, inputSchema); //endregion
    } //**************************************************************************************
    //endregion
    //**************************************************************************************
    //region Major function converting JSON to ASN.1 objects
    //**************************************************************************************
    //noinspection JSUnusedGlobalSymbols

    /**
     * Converting from JSON to ASN.1 objects
     * @param {string|Object} json JSON string or object to convert to ASN.1 objects
     */


    function fromJSON(json) {} // TODO Implement
    //**************************************************************************************
    //endregion
    //**************************************************************************************

  });
  unwrapExports(asn1);
  var asn1_1 = asn1.RawData;
  var asn1_2 = asn1.Repeated;
  var asn1_3 = asn1.Any;
  var asn1_4 = asn1.Choice;
  var asn1_5 = asn1.TIME;
  var asn1_6 = asn1.Duration;
  var asn1_7 = asn1.DateTime;
  var asn1_8 = asn1.TimeOfDay;
  var asn1_9 = asn1.DATE;
  var asn1_10 = asn1.GeneralizedTime;
  var asn1_11 = asn1.UTCTime;
  var asn1_12 = asn1.CharacterString;
  var asn1_13 = asn1.GeneralString;
  var asn1_14 = asn1.VisibleString;
  var asn1_15 = asn1.GraphicString;
  var asn1_16 = asn1.IA5String;
  var asn1_17 = asn1.VideotexString;
  var asn1_18 = asn1.TeletexString;
  var asn1_19 = asn1.PrintableString;
  var asn1_20 = asn1.NumericString;
  var asn1_21 = asn1.UniversalString;
  var asn1_22 = asn1.BmpString;
  var asn1_23 = asn1.Utf8String;
  var asn1_24 = asn1.ObjectIdentifier;
  var asn1_25 = asn1.Enumerated;
  var asn1_26 = asn1.Integer;
  var asn1_27 = asn1.BitString;
  var asn1_28 = asn1.OctetString;
  var asn1_29 = asn1.Null;
  var asn1_30 = asn1.Set;
  var asn1_31 = asn1.Sequence;
  var asn1_32 = asn1.Boolean;
  var asn1_33 = asn1.EndOfContent;
  var asn1_34 = asn1.Constructed;
  var asn1_35 = asn1.Primitive;
  var asn1_36 = asn1.BaseBlock;
  var asn1_37 = asn1.fromBER;
  var asn1_38 = asn1.compareSchema;
  var asn1_39 = asn1.verifySchema;
  var asn1_40 = asn1.fromJSON;
  var build = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', {
      value: true
    });
    const AsnAnyConverter = {
      fromASN: value => value instanceof asn1.Null ? null : value.valueBeforeDecode,
      toASN: value => {
        if (value === null) {
          return new asn1.Null();
        }

        const schema = asn1.fromBER(value);

        if (schema.result.error) {
          throw new Error(schema.result.error);
        }

        return schema.result;
      }
    };
    const AsnIntegerConverter = {
      fromASN: value => !value.valueBlock.valueDec && value.valueBlock.valueHex.byteLength > 0 ? value.valueBlock.toString() : value.valueBlock.valueDec,
      toASN: value => new asn1.Integer({
        value
      })
    };
    const AsnEnumeratedConverter = {
      fromASN: value => value.valueBlock.valueDec,
      toASN: value => new asn1.Enumerated({
        value
      })
    };
    const AsnIntegerArrayBufferConverter = {
      fromASN: value => value.valueBlock.valueHex,
      toASN: value => new asn1.Integer({
        valueHex: value
      })
    };
    const AsnBitStringConverter = {
      fromASN: value => value.valueBlock.valueHex,
      toASN: value => new asn1.BitString({
        valueHex: value
      })
    };
    const AsnObjectIdentifierConverter = {
      fromASN: value => value.valueBlock.toString(),
      toASN: value => new asn1.ObjectIdentifier({
        value
      })
    };
    const AsnBooleanConverter = {
      fromASN: value => value.valueBlock.value,
      toASN: value => new asn1.Boolean({
        value
      })
    };
    const AsnOctetStringConverter = {
      fromASN: value => value.valueBlock.valueHex,
      toASN: value => new asn1.OctetString({
        valueHex: value
      })
    };

    function createStringConverter(Asn1Type) {
      return {
        fromASN: value => value.valueBlock.value,
        toASN: value => new Asn1Type({
          value
        })
      };
    }

    const AsnUtf8StringConverter = createStringConverter(asn1.Utf8String);
    const AsnBmpStringConverter = createStringConverter(asn1.BmpString);
    const AsnUniversalStringConverter = createStringConverter(asn1.UniversalString);
    const AsnNumericStringConverter = createStringConverter(asn1.NumericString);
    const AsnPrintableStringConverter = createStringConverter(asn1.PrintableString);
    const AsnTeletexStringConverter = createStringConverter(asn1.TeletexString);
    const AsnVideotexStringConverter = createStringConverter(asn1.VideotexString);
    const AsnIA5StringConverter = createStringConverter(asn1.IA5String);
    const AsnGraphicStringConverter = createStringConverter(asn1.GraphicString);
    const AsnVisibleStringConverter = createStringConverter(asn1.VisibleString);
    const AsnGeneralStringConverter = createStringConverter(asn1.GeneralString);
    const AsnCharacterStringConverter = createStringConverter(asn1.CharacterString);
    const AsnUTCTimeConverter = {
      fromASN: value => value.toDate(),
      toASN: value => new asn1.UTCTime({
        valueDate: value
      })
    };
    const AsnGeneralizedTimeConverter = {
      fromASN: value => value.toDate(),
      toASN: value => new asn1.GeneralizedTime({
        valueDate: value
      })
    };
    var defaultConverters =
    /*#__PURE__*/
    Object.freeze({
      AsnAnyConverter: AsnAnyConverter,
      AsnIntegerConverter: AsnIntegerConverter,
      AsnEnumeratedConverter: AsnEnumeratedConverter,
      AsnIntegerArrayBufferConverter: AsnIntegerArrayBufferConverter,
      AsnBitStringConverter: AsnBitStringConverter,
      AsnObjectIdentifierConverter: AsnObjectIdentifierConverter,
      AsnBooleanConverter: AsnBooleanConverter,
      AsnOctetStringConverter: AsnOctetStringConverter,
      AsnUtf8StringConverter: AsnUtf8StringConverter,
      AsnBmpStringConverter: AsnBmpStringConverter,
      AsnUniversalStringConverter: AsnUniversalStringConverter,
      AsnNumericStringConverter: AsnNumericStringConverter,
      AsnPrintableStringConverter: AsnPrintableStringConverter,
      AsnTeletexStringConverter: AsnTeletexStringConverter,
      AsnVideotexStringConverter: AsnVideotexStringConverter,
      AsnIA5StringConverter: AsnIA5StringConverter,
      AsnGraphicStringConverter: AsnGraphicStringConverter,
      AsnVisibleStringConverter: AsnVisibleStringConverter,
      AsnGeneralStringConverter: AsnGeneralStringConverter,
      AsnCharacterStringConverter: AsnCharacterStringConverter,
      AsnUTCTimeConverter: AsnUTCTimeConverter,
      AsnGeneralizedTimeConverter: AsnGeneralizedTimeConverter
    });

    (function (AsnTypeTypes) {
      AsnTypeTypes[AsnTypeTypes["Sequence"] = 0] = "Sequence";
      AsnTypeTypes[AsnTypeTypes["Set"] = 1] = "Set";
      AsnTypeTypes[AsnTypeTypes["Choice"] = 2] = "Choice";
    })(exports.AsnTypeTypes || (exports.AsnTypeTypes = {}));

    (function (AsnPropTypes) {
      AsnPropTypes[AsnPropTypes["Any"] = 0] = "Any";
      AsnPropTypes[AsnPropTypes["Boolean"] = 1] = "Boolean";
      AsnPropTypes[AsnPropTypes["OctetString"] = 2] = "OctetString";
      AsnPropTypes[AsnPropTypes["BitString"] = 3] = "BitString";
      AsnPropTypes[AsnPropTypes["Integer"] = 4] = "Integer";
      AsnPropTypes[AsnPropTypes["Enumerated"] = 5] = "Enumerated";
      AsnPropTypes[AsnPropTypes["ObjectIdentifier"] = 6] = "ObjectIdentifier";
      AsnPropTypes[AsnPropTypes["Utf8String"] = 7] = "Utf8String";
      AsnPropTypes[AsnPropTypes["BmpString"] = 8] = "BmpString";
      AsnPropTypes[AsnPropTypes["UniversalString"] = 9] = "UniversalString";
      AsnPropTypes[AsnPropTypes["NumericString"] = 10] = "NumericString";
      AsnPropTypes[AsnPropTypes["PrintableString"] = 11] = "PrintableString";
      AsnPropTypes[AsnPropTypes["TeletexString"] = 12] = "TeletexString";
      AsnPropTypes[AsnPropTypes["VideotexString"] = 13] = "VideotexString";
      AsnPropTypes[AsnPropTypes["IA5String"] = 14] = "IA5String";
      AsnPropTypes[AsnPropTypes["GraphicString"] = 15] = "GraphicString";
      AsnPropTypes[AsnPropTypes["VisibleString"] = 16] = "VisibleString";
      AsnPropTypes[AsnPropTypes["GeneralString"] = 17] = "GeneralString";
      AsnPropTypes[AsnPropTypes["CharacterString"] = 18] = "CharacterString";
      AsnPropTypes[AsnPropTypes["UTCTime"] = 19] = "UTCTime";
      AsnPropTypes[AsnPropTypes["GeneralizedTime"] = 20] = "GeneralizedTime";
      AsnPropTypes[AsnPropTypes["DATE"] = 21] = "DATE";
      AsnPropTypes[AsnPropTypes["TimeOfDay"] = 22] = "TimeOfDay";
      AsnPropTypes[AsnPropTypes["DateTime"] = 23] = "DateTime";
      AsnPropTypes[AsnPropTypes["Duration"] = 24] = "Duration";
      AsnPropTypes[AsnPropTypes["TIME"] = 25] = "TIME";
      AsnPropTypes[AsnPropTypes["Null"] = 26] = "Null";
    })(exports.AsnPropTypes || (exports.AsnPropTypes = {}));

    const asn1$1 = asn1;

    class AsnSchemaStorage {
      constructor() {
        this.items = new Map();
      }

      has(target) {
        return this.items.has(target);
      }

      get(target) {
        const schema = this.items.get(target);

        if (!schema) {
          throw new Error("Cannot get schema for current target");
        }

        return schema;
      }

      cache(target) {
        const schema = this.get(target);

        if (!schema.schema) {
          schema.schema = this.create(target, true);
        }
      }

      createDefault(target) {
        const schema = {
          type: exports.AsnTypeTypes.Sequence,
          items: {}
        };
        const parentSchema = this.findParentSchema(target);

        if (parentSchema) {
          Object.assign(schema, parentSchema);
          schema.items = Object.assign({}, schema.items, parentSchema.items);
        }

        return schema;
      }

      create(target, useNames) {
        const schema = this.items.get(target) || this.createDefault(target);
        const asn1Value = [];

        for (const key in schema.items) {
          const item = schema.items[key];
          const name = useNames ? key : "";
          let asn1Item;

          if (typeof item.type === "number") {
            const Asn1TypeName = exports.AsnPropTypes[item.type];
            const Asn1Type = asn1$1[Asn1TypeName];

            if (!Asn1Type) {
              throw new Error(`Cannot get ASN1 class by name '${Asn1TypeName}'`);
            }

            asn1Item = new Asn1Type({
              name
            });
          } else {
            asn1Item = new asn1$1.Any({
              name
            });
          }

          const optional = !!item.optional || item.defaultValue !== undefined;

          if (item.repeated) {
            asn1Item.name = "";
            asn1Item = new asn1$1.Repeated({
              name,
              value: asn1Item
            });
          }

          if (item.context !== null && item.context !== undefined) {
            if (item.implicit) {
              if (typeof item.type === "number") {
                asn1Value.push(new asn1$1.Primitive({
                  name,
                  optional,
                  idBlock: {
                    tagClass: 3,
                    tagNumber: item.context
                  }
                }));
              } else {
                this.cache(item.type);
                const value = this.get(item.type).schema.valueBlock.value;
                asn1Value.push(new asn1$1.Constructed({
                  name,
                  optional,
                  idBlock: {
                    tagClass: 3,
                    tagNumber: item.context
                  },
                  value
                }));
              }
            } else {
              asn1Value.push(new asn1$1.Constructed({
                optional,
                idBlock: {
                  tagClass: 3,
                  tagNumber: item.context
                },
                value: [asn1Item]
              }));
            }
          } else {
            asn1Item.optional = optional;
            asn1Value.push(asn1Item);
          }
        }

        switch (schema.type) {
          case exports.AsnTypeTypes.Sequence:
            return new asn1$1.Sequence({
              value: asn1Value,
              name: ""
            });

          case exports.AsnTypeTypes.Set:
            return new asn1$1.Set({
              value: asn1Value,
              name: ""
            });

          case exports.AsnTypeTypes.Choice:
            return new asn1$1.Choice({
              value: asn1Value,
              name: ""
            });

          default:
            throw new Error(`Unsupported ASN1 type in use`);
        }
      }

      set(target, schema) {
        this.items.set(target, schema);
        return this;
      }

      findParentSchema(target) {
        const parent = target.__proto__;

        if (parent) {
          const schema = this.items.get(parent);
          return schema || this.findParentSchema(parent);
        }

        return null;
      }

    }

    const schemaStorage = new AsnSchemaStorage();

    const AsnType = options => target => {
      const schema = schemaStorage.get(target);
      Object.assign(schema, options);
    };

    const AsnProp = options => (target, propertyKey) => {
      let schema;

      if (!schemaStorage.has(target.constructor)) {
        schema = schemaStorage.createDefault(target.constructor);
        schemaStorage.set(target.constructor, schema);
      } else {
        schema = schemaStorage.get(target.constructor);
      }

      const copyOptions = Object.assign({}, options);

      if (typeof copyOptions.type === "number" && !copyOptions.converter) {
        const converterName = `Asn${exports.AsnPropTypes[options.type]}Converter`;
        const defaultConverter = defaultConverters[converterName];

        if (!defaultConverter) {
          throw new Error(`Cannot get '${converterName}' for property '${propertyKey}' of ${target.constructor.name}`);
        }

        copyOptions.converter = defaultConverter;
      }

      schema.items[propertyKey] = copyOptions;
    };

    function isConvertible(target) {
      if (target && target.prototype) {
        if (target.prototype.toASN && target.prototype.fromASN) {
          return true;
        } else {
          return isConvertible(target.prototype);
        }
      } else {
        return !!(target && target.toASN && target.fromASN);
      }
    }

    const asn1$2 = asn1;

    class AsnParser {
      static parse(data, target, obj) {
        let buf;

        if (data instanceof ArrayBuffer) {
          buf = data;
        } else if (typeof Buffer !== undefined && Buffer.isBuffer(data)) {
          buf = new Uint8Array(data).buffer;
        } else if (ArrayBuffer.isView(data)) {
          buf = data.buffer;
        } else {
          throw new TypeError("Wrong type of 'data' argument");
        }

        const asn1Parsed = asn1$2.fromBER(buf);

        if (asn1Parsed.result.error) {
          throw new Error(asn1Parsed.result.error);
        }

        const res = this.fromASN(asn1Parsed.result, target, obj);
        return res;
      }

      static fromASN(asn1Schema, target, obj) {
        if (isConvertible(target)) {
          const value = obj || new target();
          return value.fromASN(asn1Schema);
        }

        const schema = schemaStorage.get(target);
        schemaStorage.cache(target);
        let targetSchema = schema.schema;

        if (asn1Schema.constructor === asn1$2.Constructed && schema.type !== exports.AsnTypeTypes.Choice) {
          targetSchema = new asn1$2.Constructed({
            idBlock: {
              tagClass: 3,
              tagNumber: asn1Schema.idBlock.tagNumber
            },
            value: schema.schema.valueBlock.value
          });

          for (const key in schema.items) {
            delete asn1Schema[key];
          }
        }

        const asn1ComparedSchema = asn1$2.compareSchema(asn1Schema, asn1Schema, targetSchema);

        if (!asn1ComparedSchema.verified) {
          throw new Error(`Data does not match to ${target.name} ASN1 schema. ${asn1ComparedSchema.result.error}`);
        }

        const res = obj || new target();

        for (const key in schema.items) {
          if (!asn1Schema[key]) {
            continue;
          }

          const schemaItem = schema.items[key];

          if (typeof schemaItem.type === "number") {
            const converter = schemaItem.converter;

            if (!converter) {
              throw new Error("Converter is empty");
            }

            if (schemaItem.repeated) {
              res[key] = Array.from(asn1Schema[key], element => converter.fromASN(element));
            } else {
              let value = asn1Schema[key];

              if (schemaItem.implicit) {
                const Asn1TypeName = exports.AsnPropTypes[schemaItem.type];
                const Asn1Type = asn1$2[Asn1TypeName];

                if (!Asn1Type) {
                  throw new Error(`Cannot get '${Asn1TypeName}' class from asn1js module`);
                }

                const newItem = new Asn1Type();
                newItem.valueBlock = value.valueBlock;
                value = asn1$2.fromBER(newItem.toBER(false)).result;
              }

              res[key] = converter.fromASN(value);
            }
          } else {
            if (schemaItem.repeated) {
              res[key] = Array.from(asn1Schema[key], element => this.fromASN(element, schemaItem.type));
            } else {
              res[key] = this.fromASN(asn1Schema[key], schemaItem.type);
            }
          }
        }

        res._cache = {
          asn1: asn1Schema
        };
        return res;
      }

    }

    const asn1$3 = asn1;

    class AsnSerializer {
      static serialize(obj) {
        return this.toASN(obj).toBER(false);
      }

      static toASN(obj) {
        if (obj && isConvertible(obj.constructor)) {
          return obj.toASN();
        }

        const target = obj.constructor;
        const schema = schemaStorage.get(target);
        schemaStorage.cache(target);
        let asn1Value = [];

        for (const key in schema.items) {
          const item = schema.items[key];
          const objProp = obj[key];

          if (objProp === undefined || item.defaultValue === objProp) {
            continue;
          }

          let asn1Item;

          if (typeof item.type === "number") {
            const converter = item.converter;

            if (!converter) {
              throw new Error(`Property '${key}' doesn't have converter for type ${exports.AsnPropTypes[item.type]} in schema '${target.name}'`);
            }

            if (item.repeated) {
              asn1Item = Array.from(objProp, element => converter.toASN(element));
            } else {
              asn1Item = converter.toASN(objProp);
            }
          } else {
            if (item.repeated) {
              asn1Item = Array.from(objProp, element => this.toASN(element));
            } else {
              asn1Item = this.toASN(objProp);
            }
          }

          if (item.context !== null && item.context !== undefined) {
            if (item.implicit) {
              if (typeof item.type === "number") {
                const value = {};
                value.valueHex = asn1Item.valueBlock.toBER();
                asn1Value.push(new asn1$3.Primitive(_objectSpread({
                  optional: item.optional,
                  idBlock: {
                    tagClass: 3,
                    tagNumber: item.context
                  }
                }, value)));
              } else {
                asn1Value.push(new asn1$3.Constructed({
                  optional: item.optional,
                  idBlock: {
                    tagClass: 3,
                    tagNumber: item.context
                  },
                  value: asn1Item.valueBlock.value
                }));
              }
            } else {
              asn1Value.push(new asn1$3.Constructed({
                optional: item.optional,
                idBlock: {
                  tagClass: 3,
                  tagNumber: item.context
                },
                value: [asn1Item]
              }));
            }
          } else if (item.repeated) {
            asn1Value = asn1Value.concat(asn1Item);
          } else {
            asn1Value.push(asn1Item);
          }
        }

        let asnSchema;

        switch (schema.type) {
          case exports.AsnTypeTypes.Sequence:
            asnSchema = new asn1$3.Sequence({
              value: asn1Value
            });
            break;

          case exports.AsnTypeTypes.Set:
            asnSchema = new asn1$3.Set({
              value: asn1Value
            });
            break;

          case exports.AsnTypeTypes.Choice:
            if (!asn1Value[0]) {
              throw new Error(`Schema '${target.name}' has wrong data. Choice cannot be empty.`);
            }

            asnSchema = asn1Value[0];
            break;
        }

        return asnSchema;
      }

    }

    exports.AsnProp = AsnProp;
    exports.AsnType = AsnType;
    exports.AsnParser = AsnParser;
    exports.AsnSerializer = AsnSerializer;
    exports.AsnAnyConverter = AsnAnyConverter;
    exports.AsnIntegerConverter = AsnIntegerConverter;
    exports.AsnEnumeratedConverter = AsnEnumeratedConverter;
    exports.AsnIntegerArrayBufferConverter = AsnIntegerArrayBufferConverter;
    exports.AsnBitStringConverter = AsnBitStringConverter;
    exports.AsnObjectIdentifierConverter = AsnObjectIdentifierConverter;
    exports.AsnBooleanConverter = AsnBooleanConverter;
    exports.AsnOctetStringConverter = AsnOctetStringConverter;
    exports.AsnUtf8StringConverter = AsnUtf8StringConverter;
    exports.AsnBmpStringConverter = AsnBmpStringConverter;
    exports.AsnUniversalStringConverter = AsnUniversalStringConverter;
    exports.AsnNumericStringConverter = AsnNumericStringConverter;
    exports.AsnPrintableStringConverter = AsnPrintableStringConverter;
    exports.AsnTeletexStringConverter = AsnTeletexStringConverter;
    exports.AsnVideotexStringConverter = AsnVideotexStringConverter;
    exports.AsnIA5StringConverter = AsnIA5StringConverter;
    exports.AsnGraphicStringConverter = AsnGraphicStringConverter;
    exports.AsnVisibleStringConverter = AsnVisibleStringConverter;
    exports.AsnGeneralStringConverter = AsnGeneralStringConverter;
    exports.AsnCharacterStringConverter = AsnCharacterStringConverter;
    exports.AsnUTCTimeConverter = AsnUTCTimeConverter;
    exports.AsnGeneralizedTimeConverter = AsnGeneralizedTimeConverter;
  });
  unwrapExports(build);
  var build_1 = build.AsnTypeTypes;
  var build_2 = build.AsnPropTypes;
  var build_3 = build.AsnProp;
  var build_4 = build.AsnType;
  var build_5 = build.AsnParser;
  var build_6 = build.AsnSerializer;
  var build_7 = build.AsnAnyConverter;
  var build_8 = build.AsnIntegerConverter;
  var build_9 = build.AsnEnumeratedConverter;
  var build_10 = build.AsnIntegerArrayBufferConverter;
  var build_11 = build.AsnBitStringConverter;
  var build_12 = build.AsnObjectIdentifierConverter;
  var build_13 = build.AsnBooleanConverter;
  var build_14 = build.AsnOctetStringConverter;
  var build_15 = build.AsnUtf8StringConverter;
  var build_16 = build.AsnBmpStringConverter;
  var build_17 = build.AsnUniversalStringConverter;
  var build_18 = build.AsnNumericStringConverter;
  var build_19 = build.AsnPrintableStringConverter;
  var build_20 = build.AsnTeletexStringConverter;
  var build_21 = build.AsnVideotexStringConverter;
  var build_22 = build.AsnIA5StringConverter;
  var build_23 = build.AsnGraphicStringConverter;
  var build_24 = build.AsnVisibleStringConverter;
  var build_25 = build.AsnGeneralStringConverter;
  var build_26 = build.AsnCharacterStringConverter;
  var build_27 = build.AsnUTCTimeConverter;
  var build_28 = build.AsnGeneralizedTimeConverter;
  var build$1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    class JsonError extends Error {
      constructor(message, innerError) {
        super(innerError ? `${message}. See the inner exception for more details.` : message);
        this.message = message;
        this.innerError = innerError;
      }

    }

    class TransformError extends JsonError {
      constructor(schema, message, innerError) {
        super(message, innerError);
        this.schema = schema;
      }

    }

    class ParserError extends TransformError {
      constructor(schema, message, innerError) {
        super(schema, `JSON doesn't match to '${schema.target.name}' schema. ${message}`, innerError);
      }

    }

    class ValidationError extends JsonError {}

    class SerializerError extends JsonError {
      constructor(schemaName, message, innerError) {
        super(`Cannot serialize by '${schemaName}' schema. ${message}`, innerError);
        this.schemaName = schemaName;
      }

    }

    class KeyError extends ParserError {
      constructor(schema, keys, errors = {}) {
        super(schema, "Some keys doesn't match to schema");
        this.keys = keys;
        this.errors = errors;
      }

    }

    (function (JsonPropTypes) {
      JsonPropTypes[JsonPropTypes["Any"] = 0] = "Any";
      JsonPropTypes[JsonPropTypes["Boolean"] = 1] = "Boolean";
      JsonPropTypes[JsonPropTypes["Number"] = 2] = "Number";
      JsonPropTypes[JsonPropTypes["String"] = 3] = "String";
    })(exports.JsonPropTypes || (exports.JsonPropTypes = {}));

    function checkType(value, type) {
      switch (type) {
        case exports.JsonPropTypes.Boolean:
          return typeof value === "boolean";

        case exports.JsonPropTypes.Number:
          return typeof value === "number";

        case exports.JsonPropTypes.String:
          return typeof value === "string";
      }

      return true;
    }

    function throwIfTypeIsWrong(value, type) {
      if (!checkType(value, type)) {
        throw new TypeError(`Value must be ${exports.JsonPropTypes[type]}`);
      }
    }

    function isConvertible(target) {
      if (target && target.prototype) {
        if (target.prototype.toJSON && target.prototype.fromJSON) {
          return true;
        } else {
          return isConvertible(target.prototype);
        }
      } else {
        return !!(target && target.toJSON && target.fromJSON);
      }
    }

    class JsonSchemaStorage {
      constructor() {
        this.items = new Map();
      }

      has(target) {
        return this.items.has(target) || !!this.findParentSchema(target);
      }

      get(target) {
        const schema = this.items.get(target) || this.findParentSchema(target);

        if (!schema) {
          throw new Error("Cannot get schema for current target");
        }

        return schema;
      }

      create(target) {
        const schema = {
          names: {}
        };
        const parentSchema = this.findParentSchema(target);

        if (parentSchema) {
          Object.assign(schema, parentSchema);
          schema.names = {};

          for (const name in parentSchema.names) {
            schema.names[name] = Object.assign({}, parentSchema.names[name]);
          }
        }

        schema.target = target;
        return schema;
      }

      set(target, schema) {
        this.items.set(target, schema);
        return this;
      }

      findParentSchema(target) {
        const parent = target.__proto__;

        if (parent) {
          const schema = this.items.get(parent);
          return schema || this.findParentSchema(parent);
        }

        return null;
      }

    }

    const DEFAULT_SCHEMA = "default";
    const schemaStorage = new JsonSchemaStorage();

    class PatternValidation {
      constructor(pattern) {
        this.pattern = new RegExp(pattern);
      }

      validate(value) {
        const pattern = new RegExp(this.pattern.source, this.pattern.flags);

        if (typeof value !== "string") {
          throw new ValidationError("Incoming value must be string");
        }

        if (!pattern.exec(value)) {
          throw new ValidationError(`Value doesn't match to pattern '${pattern.toString()}'`);
        }
      }

    }

    class InclusiveValidation {
      constructor(min = Number.MIN_VALUE, max = Number.MAX_VALUE) {
        this.min = min;
        this.max = max;
      }

      validate(value) {
        throwIfTypeIsWrong(value, exports.JsonPropTypes.Number);

        if (!(this.min <= value && value <= this.max)) {
          const min = this.min === Number.MIN_VALUE ? "MIN" : this.min;
          const max = this.max === Number.MAX_VALUE ? "MAX" : this.max;
          throw new ValidationError(`Value doesn't match to diapason [${min},${max}]`);
        }
      }

    }

    class ExclusiveValidation {
      constructor(min = Number.MIN_VALUE, max = Number.MAX_VALUE) {
        this.min = min;
        this.max = max;
      }

      validate(value) {
        throwIfTypeIsWrong(value, exports.JsonPropTypes.Number);

        if (!(this.min < value && value < this.max)) {
          const min = this.min === Number.MIN_VALUE ? "MIN" : this.min;
          const max = this.max === Number.MAX_VALUE ? "MAX" : this.max;
          throw new ValidationError(`Value doesn't match to diapason (${min},${max})`);
        }
      }

    }

    class LengthValidation {
      constructor(length, minLength, maxLength) {
        this.length = length;
        this.minLength = minLength;
        this.maxLength = maxLength;
      }

      validate(value) {
        if (this.length !== undefined) {
          if (value.length !== this.length) {
            throw new ValidationError(`Value length must be exactly ${this.length}.`);
          }

          return;
        }

        if (this.minLength !== undefined) {
          if (value.length < this.minLength) {
            throw new ValidationError(`Value length must be more than ${this.minLength}.`);
          }
        }

        if (this.maxLength !== undefined) {
          if (value.length > this.maxLength) {
            throw new ValidationError(`Value length must be less than ${this.maxLength}.`);
          }
        }
      }

    }

    class EnumerationValidation {
      constructor(enumeration) {
        this.enumeration = enumeration;
      }

      validate(value) {
        throwIfTypeIsWrong(value, exports.JsonPropTypes.String);

        if (!this.enumeration.includes(value)) {
          throw new ValidationError(`Value must be one of ${this.enumeration.map(v => `'${v}'`).join(", ")}`);
        }
      }

    }

    class JsonTransform {
      static checkValues(data, schemaItem) {
        const values = Array.isArray(data) ? data : [data];

        for (const value of values) {
          for (const validation of schemaItem.validations) {
            if (validation instanceof LengthValidation && schemaItem.repeated) {
              validation.validate(data);
            } else {
              validation.validate(value);
            }
          }
        }
      }

      static checkTypes(value, schemaItem) {
        if (schemaItem.repeated && !Array.isArray(value)) {
          throw new TypeError("Value must be Array");
        }

        if (typeof schemaItem.type === "number") {
          const values = Array.isArray(value) ? value : [value];

          for (const v of values) {
            throwIfTypeIsWrong(v, schemaItem.type);
          }
        }
      }

      static getSchemaByName(schema, name = DEFAULT_SCHEMA) {
        return _objectSpread({}, schema.names[DEFAULT_SCHEMA], schema.names[name]);
      }

    }

    class JsonSerializer extends JsonTransform {
      static serialize(obj, options, replacer, space) {
        const json = this.toJSON(obj, options);
        return JSON.stringify(json, replacer, space);
      }

      static toJSON(obj, options = {}) {
        let res;
        let targetSchema = options.targetSchema;
        const schemaName = options.schemaName || DEFAULT_SCHEMA;

        if (isConvertible(obj)) {
          return obj.toJSON();
        }

        if (Array.isArray(obj)) {
          res = [];

          for (const item of obj) {
            res.push(this.toJSON(item, options));
          }
        } else if (typeof obj === "object") {
          if (targetSchema && !schemaStorage.has(targetSchema)) {
            throw new JsonError("Cannot get schema for `targetSchema` param");
          }

          targetSchema = targetSchema || obj.constructor;

          if (schemaStorage.has(targetSchema)) {
            const schema = schemaStorage.get(targetSchema);
            res = {};
            const namedSchema = this.getSchemaByName(schema, schemaName);

            for (const key in namedSchema) {
              try {
                const item = namedSchema[key];
                const objItem = obj[key];
                let value;

                if (item.optional && objItem === undefined || item.defaultValue !== undefined && objItem === item.defaultValue) {
                  continue;
                }

                if (!item.optional && objItem === undefined) {
                  throw new SerializerError(targetSchema.name, `Property '${key}' is required.`);
                }

                if (typeof item.type === "number") {
                  if (item.converter) {
                    if (item.repeated) {
                      value = objItem.map(el => item.converter.toJSON(el, obj));
                    } else {
                      value = item.converter.toJSON(objItem, obj);
                    }
                  } else {
                    value = objItem;
                  }
                } else {
                  if (item.repeated) {
                    value = objItem.map(el => this.toJSON(el, {
                      schemaName
                    }));
                  } else {
                    value = this.toJSON(objItem, {
                      schemaName
                    });
                  }
                }

                this.checkTypes(value, item);
                this.checkValues(value, item);
                res[item.name || key] = value;
              } catch (e) {
                if (e instanceof SerializerError) {
                  throw e;
                } else {
                  throw new SerializerError(schema.target.name, `Property '${key}' is wrong. ${e.message}`, e);
                }
              }
            }
          } else {
            res = {};

            for (const key in obj) {
              res[key] = this.toJSON(obj[key], {
                schemaName
              });
            }
          }
        } else {
          res = obj;
        }

        return res;
      }

    }

    class JsonParser extends JsonTransform {
      static parse(data, options) {
        const obj = JSON.parse(data);
        return this.fromJSON(obj, options);
      }

      static fromJSON(target, options) {
        const targetSchema = options.targetSchema;
        const schemaName = options.schemaName || DEFAULT_SCHEMA;
        const obj = new targetSchema();

        if (isConvertible(obj)) {
          return obj.fromJSON(target);
        }

        const schema = schemaStorage.get(targetSchema);
        const namedSchema = this.getSchemaByName(schema, schemaName);
        const keyErrors = {};

        if (options.strictProperty && !Array.isArray(target)) {
          JsonParser.checkStrictProperty(target, namedSchema, schema);
        }

        for (const key in namedSchema) {
          try {
            const item = namedSchema[key];
            const name = item.name || key;
            const value = target[name];

            if (value === undefined && (item.optional || item.defaultValue !== undefined)) {
              continue;
            }

            if (!item.optional && value === undefined) {
              throw new ParserError(schema, `Property '${name}' is required.`);
            }

            this.checkTypes(value, item);
            this.checkValues(value, item);

            if (typeof item.type === "number") {
              if (item.converter) {
                if (item.repeated) {
                  obj[key] = value.map(el => item.converter.fromJSON(el, obj));
                } else {
                  obj[key] = item.converter.fromJSON(value, obj);
                }
              } else {
                obj[key] = value;
              }
            } else {
              const newOptions = _objectSpread({}, options, {
                targetSchema: item.type,
                schemaName
              });

              if (item.repeated) {
                obj[key] = value.map(el => this.fromJSON(el, newOptions));
              } else {
                obj[key] = this.fromJSON(value, newOptions);
              }
            }
          } catch (e) {
            if (!(e instanceof ParserError)) {
              e = new ParserError(schema, `Property '${key}' is wrong. ${e.message}`, e);
            }

            if (options.strictAllKeys) {
              keyErrors[key] = e;
            } else {
              throw e;
            }
          }
        }

        const keys = Object.keys(keyErrors);

        if (keys.length) {
          throw new KeyError(schema, keys, keyErrors);
        }

        return obj;
      }

      static checkStrictProperty(target, namedSchema, schema) {
        const jsonProps = Object.keys(target);
        const schemaProps = Object.keys(namedSchema);
        const keys = [];

        for (const key of jsonProps) {
          if (schemaProps.indexOf(key) === -1) {
            keys.push(key);
          }
        }

        if (keys.length) {
          throw new KeyError(schema, keys);
        }
      }

    }

    function getValidations(item) {
      const validations = [];

      if (item.pattern) {
        validations.push(new PatternValidation(item.pattern));
      }

      if (item.type === exports.JsonPropTypes.Number || item.type === exports.JsonPropTypes.Any) {
        if (item.minInclusive !== undefined || item.maxInclusive !== undefined) {
          validations.push(new InclusiveValidation(item.minInclusive, item.maxInclusive));
        }

        if (item.minExclusive !== undefined || item.maxExclusive !== undefined) {
          validations.push(new ExclusiveValidation(item.minExclusive, item.maxExclusive));
        }

        if (item.enumeration !== undefined) {
          validations.push(new EnumerationValidation(item.enumeration));
        }
      }

      if (item.type === exports.JsonPropTypes.String || item.repeated || item.type === exports.JsonPropTypes.Any) {
        if (item.length !== undefined || item.minLength !== undefined || item.maxLength !== undefined) {
          validations.push(new LengthValidation(item.length, item.minLength, item.maxLength));
        }
      }

      return validations;
    }

    const JsonProp = (options = {}) => (target, propertyKey) => {
      const errorMessage = `Cannot set type for ${propertyKey} property of ${target.constructor.name} schema`;
      let schema;

      if (!schemaStorage.has(target.constructor)) {
        schema = schemaStorage.create(target.constructor);
        schemaStorage.set(target.constructor, schema);
      } else {
        schema = schemaStorage.get(target.constructor);

        if (schema.target !== target.constructor) {
          schema = schemaStorage.create(target.constructor);
          schemaStorage.set(target.constructor, schema);
        }
      }

      const defaultSchema = {
        type: exports.JsonPropTypes.Any,
        validations: []
      };
      const copyOptions = Object.assign(defaultSchema, options);
      copyOptions.validations = getValidations(copyOptions);

      if (typeof copyOptions.type !== "number") {
        if (!schemaStorage.has(copyOptions.type) && !isConvertible(copyOptions.type)) {
          throw new Error(`${errorMessage}. Assigning type doesn't have schema.`);
        }
      }

      let schemaNames;

      if (Array.isArray(options.schema)) {
        schemaNames = options.schema;
      } else {
        schemaNames = [options.schema || DEFAULT_SCHEMA];
      }

      for (const schemaName of schemaNames) {
        if (!schema.names[schemaName]) {
          schema.names[schemaName] = {};
        }

        const namedSchema = schema.names[schemaName];
        namedSchema[propertyKey] = copyOptions;
      }
    };

    exports.JsonSerializer = JsonSerializer;
    exports.JsonParser = JsonParser;
    exports.JsonProp = JsonProp;
  });
  unwrapExports(build$1);
  var build_1$1 = build$1.JsonPropTypes;
  var build_2$1 = build$1.JsonSerializer;
  var build_3$1 = build$1.JsonParser;
  var build_4$1 = build$1.JsonProp;
  let ObjectIdentifier = class ObjectIdentifier {
    constructor(value) {
      if (value) {
        this.value = value;
      }
    }

  };

  __decorate([build_3({
    type: build_2.ObjectIdentifier
  })], ObjectIdentifier.prototype, "value", void 0);

  ObjectIdentifier = __decorate([build_4({
    type: build_1.Choice
  })], ObjectIdentifier);

  class AlgorithmIdentifier {
    constructor(params) {
      Object.assign(this, params);
    }

  }

  __decorate([build_3({
    type: build_2.ObjectIdentifier
  })], AlgorithmIdentifier.prototype, "algorithm", void 0);

  __decorate([build_3({
    type: build_2.Any,
    optional: true
  })], AlgorithmIdentifier.prototype, "parameters", void 0);

  class PrivateKeyInfo {
    constructor() {
      this.version = 0;
      this.privateKeyAlgorithm = new AlgorithmIdentifier();
      this.privateKey = new ArrayBuffer(0);
    }

  }

  __decorate([build_3({
    type: build_2.Integer
  })], PrivateKeyInfo.prototype, "version", void 0);

  __decorate([build_3({
    type: AlgorithmIdentifier
  })], PrivateKeyInfo.prototype, "privateKeyAlgorithm", void 0);

  __decorate([build_3({
    type: build_2.OctetString
  })], PrivateKeyInfo.prototype, "privateKey", void 0);

  __decorate([build_3({
    type: build_2.Any,
    optional: true
  })], PrivateKeyInfo.prototype, "attributes", void 0);

  class PublicKeyInfo {
    constructor() {
      this.publicKeyAlgorithm = new AlgorithmIdentifier();
      this.publicKey = new ArrayBuffer(0);
    }

  }

  __decorate([build_3({
    type: AlgorithmIdentifier
  })], PublicKeyInfo.prototype, "publicKeyAlgorithm", void 0);

  __decorate([build_3({
    type: build_2.BitString
  })], PublicKeyInfo.prototype, "publicKey", void 0);

  const JsonBase64UrlArrayBufferConverter = {
    fromJSON: value => Convert.FromBase64Url(value),
    toJSON: value => Convert.ToBase64Url(new Uint8Array(value))
  };
  var Browser;

  (function (Browser) {
    Browser["Unknown"] = "Unknown";
    Browser["IE"] = "Internet Explorer";
    Browser["Safari"] = "Safari";
    Browser["Edge"] = "Edge";
    Browser["Chrome"] = "Chrome";
    Browser["Firefox"] = "Firefox Mozilla";
    Browser["Mobile"] = "Mobile";
  })(Browser || (Browser = {}));

  function BrowserInfo() {
    const res = {
      name: Browser.Unknown,
      version: "0"
    };
    const userAgent = self.navigator.userAgent;
    let reg;

    if (reg = /edge\/([\d\.]+)/i.exec(userAgent)) {
      res.name = Browser.Edge;
      res.version = reg[1];
    } else if (/msie/i.test(userAgent)) {
      res.name = Browser.IE;
      res.version = /msie ([\d\.]+)/i.exec(userAgent)[1];
    } else if (/Trident/i.test(userAgent)) {
      res.name = Browser.IE;
      res.version = /rv:([\d\.]+)/i.exec(userAgent)[1];
    } else if (/chrome/i.test(userAgent)) {
      res.name = Browser.Chrome;
      res.version = /chrome\/([\d\.]+)/i.exec(userAgent)[1];
    } else if (/firefox/i.test(userAgent)) {
      res.name = Browser.Firefox;
      res.version = /firefox\/([\d\.]+)/i.exec(userAgent)[1];
    } else if (/mobile/i.test(userAgent)) {
      res.name = Browser.Mobile;
      res.version = /mobile\/([\w]+)/i.exec(userAgent)[1];
    } else if (/safari/i.test(userAgent)) {
      res.name = Browser.Safari;
      res.version = /version\/([\d\.]+)/i.exec(userAgent)[1];
    }

    return res;
  }

  function concat(...buf) {
    const res = new Uint8Array(buf.map(item => item.length).reduce((prev, cur) => prev + cur));
    let offset = 0;
    buf.forEach((item, index) => {
      for (let i = 0; i < item.length; i++) {
        res[offset + i] = item[i];
      }

      offset += item.length;
    });
    return res;
  }

  const AsnIntegerArrayBufferConverter = {
    fromASN: value => {
      const valueHex = value.valueBlock.valueHex;
      return !new Uint8Array(valueHex)[0] ? value.valueBlock.valueHex.slice(1) : value.valueBlock.valueHex;
    },
    toASN: value => {
      const valueHex = new Uint8Array(value)[0] > 127 ? concat(new Uint8Array([0]), new Uint8Array(value)) : new Uint8Array(value);
      return new asn1_26({
        valueHex: new Uint8Array(valueHex).buffer
      });
    }
  };

  class RsaPrivateKey {
    constructor() {
      this.version = 0;
      this.modulus = new ArrayBuffer(0);
      this.publicExponent = new ArrayBuffer(0);
      this.privateExponent = new ArrayBuffer(0);
      this.prime1 = new ArrayBuffer(0);
      this.prime2 = new ArrayBuffer(0);
      this.exponent1 = new ArrayBuffer(0);
      this.exponent2 = new ArrayBuffer(0);
      this.coefficient = new ArrayBuffer(0);
    }

  }

  __decorate([build_3({
    type: build_2.Integer,
    converter: build_8
  })], RsaPrivateKey.prototype, "version", void 0);

  __decorate([build_3({
    type: build_2.Integer,
    converter: AsnIntegerArrayBufferConverter
  }), build_4$1({
    name: "n",
    converter: JsonBase64UrlArrayBufferConverter
  })], RsaPrivateKey.prototype, "modulus", void 0);

  __decorate([build_3({
    type: build_2.Integer,
    converter: AsnIntegerArrayBufferConverter
  }), build_4$1({
    name: "e",
    converter: JsonBase64UrlArrayBufferConverter
  })], RsaPrivateKey.prototype, "publicExponent", void 0);

  __decorate([build_3({
    type: build_2.Integer,
    converter: AsnIntegerArrayBufferConverter
  }), build_4$1({
    name: "d",
    converter: JsonBase64UrlArrayBufferConverter
  })], RsaPrivateKey.prototype, "privateExponent", void 0);

  __decorate([build_3({
    type: build_2.Integer,
    converter: AsnIntegerArrayBufferConverter
  }), build_4$1({
    name: "p",
    converter: JsonBase64UrlArrayBufferConverter
  })], RsaPrivateKey.prototype, "prime1", void 0);

  __decorate([build_3({
    type: build_2.Integer,
    converter: AsnIntegerArrayBufferConverter
  }), build_4$1({
    name: "q",
    converter: JsonBase64UrlArrayBufferConverter
  })], RsaPrivateKey.prototype, "prime2", void 0);

  __decorate([build_3({
    type: build_2.Integer,
    converter: AsnIntegerArrayBufferConverter
  }), build_4$1({
    name: "dp",
    converter: JsonBase64UrlArrayBufferConverter
  })], RsaPrivateKey.prototype, "exponent1", void 0);

  __decorate([build_3({
    type: build_2.Integer,
    converter: AsnIntegerArrayBufferConverter
  }), build_4$1({
    name: "dq",
    converter: JsonBase64UrlArrayBufferConverter
  })], RsaPrivateKey.prototype, "exponent2", void 0);

  __decorate([build_3({
    type: build_2.Integer,
    converter: AsnIntegerArrayBufferConverter
  }), build_4$1({
    name: "qi",
    converter: JsonBase64UrlArrayBufferConverter
  })], RsaPrivateKey.prototype, "coefficient", void 0);

  __decorate([build_3({
    type: build_2.Any,
    optional: true
  })], RsaPrivateKey.prototype, "otherPrimeInfos", void 0);

  class RsaPublicKey {
    constructor() {
      this.modulus = new ArrayBuffer(0);
      this.publicExponent = new ArrayBuffer(0);
    }

  }

  __decorate([build_3({
    type: build_2.Integer,
    converter: AsnIntegerArrayBufferConverter
  }), build_4$1({
    name: "n",
    converter: JsonBase64UrlArrayBufferConverter
  })], RsaPublicKey.prototype, "modulus", void 0);

  __decorate([build_3({
    type: build_2.Integer,
    converter: AsnIntegerArrayBufferConverter
  }), build_4$1({
    name: "e",
    converter: JsonBase64UrlArrayBufferConverter
  })], RsaPublicKey.prototype, "publicExponent", void 0);

  let EcPublicKey = class EcPublicKey {
    constructor(value) {
      this.value = new ArrayBuffer(0);

      if (value) {
        this.value = value;
      }
    }

    toJSON() {
      let bytes = new Uint8Array(this.value);

      if (bytes[0] !== 0x04) {
        throw new CryptoError("Wrong ECPoint. Current version supports only Uncompressed (0x04) point");
      }

      bytes = new Uint8Array(this.value.slice(1));
      const size = bytes.length / 2;
      const offset = 0;
      const json = {
        x: Convert.ToBase64Url(bytes.buffer.slice(offset, offset + size)),
        y: Convert.ToBase64Url(bytes.buffer.slice(offset + size, offset + size + size))
      };
      return json;
    }

    fromJSON(json) {
      if (!("x" in json)) {
        throw new Error("x: Missing required property");
      }

      if (!("y" in json)) {
        throw new Error("y: Missing required property");
      }

      const x = Convert.FromBase64Url(json.x);
      const y = Convert.FromBase64Url(json.y);
      const value = concat(new Uint8Array([0x04]), new Uint8Array(x), new Uint8Array(y));
      this.value = new Uint8Array(value).buffer;
      return this;
    }

  };

  __decorate([build_3({
    type: build_2.OctetString
  })], EcPublicKey.prototype, "value", void 0);

  EcPublicKey = __decorate([build_4({
    type: build_1.Choice
  })], EcPublicKey);

  class EcPrivateKey {
    constructor() {
      this.version = 1;
      this.privateKey = new ArrayBuffer(0);
    }

    fromJSON(json) {
      if (!("d" in json)) {
        throw new Error("d: Missing required property");
      }

      this.privateKey = Convert.FromBase64Url(json.d);

      if ("x" in json) {
        const publicKey = new EcPublicKey();
        publicKey.fromJSON(json);
        this.publicKey = build_6.toASN(publicKey).valueBlock.valueHex;
      }

      return this;
    }

    toJSON() {
      const jwk = {};
      jwk.d = Convert.ToBase64Url(this.privateKey);

      if (this.publicKey) {
        Object.assign(jwk, new EcPublicKey(this.publicKey).toJSON());
      }

      return jwk;
    }

  }

  __decorate([build_3({
    type: build_2.Integer,
    converter: build_8
  })], EcPrivateKey.prototype, "version", void 0);

  __decorate([build_3({
    type: build_2.OctetString
  })], EcPrivateKey.prototype, "privateKey", void 0);

  __decorate([build_3({
    context: 0,
    type: build_2.Any,
    optional: true
  })], EcPrivateKey.prototype, "parameters", void 0);

  __decorate([build_3({
    context: 1,
    type: build_2.BitString,
    optional: true
  })], EcPrivateKey.prototype, "publicKey", void 0);

  const AsnIntegerWithoutPaddingConverter = {
    fromASN: value => {
      const bytes = new Uint8Array(value.valueBlock.valueHex);
      return bytes[0] === 0 ? bytes.buffer.slice(1) : bytes.buffer;
    },
    toASN: value => {
      const bytes = new Uint8Array(value);

      if (bytes[0] > 127) {
        const newValue = new Uint8Array(bytes.length + 1);
        newValue.set(bytes, 1);
        return new asn1_26({
          valueHex: newValue
        });
      }

      return new asn1_26({
        valueHex: value
      });
    }
  };

  class EcDsaSignature {
    constructor() {
      this.r = new ArrayBuffer(0);
      this.s = new ArrayBuffer(0);
    }

  }

  __decorate([build_3({
    type: build_2.Integer,
    converter: AsnIntegerWithoutPaddingConverter
  })], EcDsaSignature.prototype, "r", void 0);

  __decorate([build_3({
    type: build_2.Integer,
    converter: AsnIntegerWithoutPaddingConverter
  })], EcDsaSignature.prototype, "s", void 0);

  class CryptoKey$1 extends CryptoKey {
    constructor(algorithm, extractable, type, usages) {
      super();
      this.extractable = extractable;
      this.type = type;
      this.usages = usages;
      this.algorithm = _objectSpread({}, algorithm);
    }

  }

  function isAlgorithm(algorithm, name) {
    return algorithm.name.toUpperCase() === name.toUpperCase();
  }

  class AesCryptoKey extends CryptoKey$1 {
    constructor(algorithm, extractable, usages, raw) {
      super(algorithm, extractable, "secret", usages);
      this.raw = raw;
    }

    toJSON() {
      const jwk = {
        kty: "oct",
        alg: this.getJwkAlgorithm(),
        k: Convert.ToBase64Url(this.raw),
        ext: this.extractable,
        key_ops: this.usages
      };
      return jwk;
    }

    getJwkAlgorithm() {
      switch (this.algorithm.name.toUpperCase()) {
        case "AES-CBC":
          return `A${this.algorithm.length}CBC`;

        case "AES-CTR":
          return `A${this.algorithm.length}CTR`;

        case "AES-GCM":
          return `A${this.algorithm.length}GCM`;

        case "AES-ECB":
          return `A${this.algorithm.length}ECB`;

        default:
          throw new AlgorithmError("Unsupported algorithm name");
      }
    }

  }

  class AesCrypto {
    static checkLib() {
      if (typeof asmCrypto === "undefined") {
        throw new OperationError("Cannot implement DES mechanism. Add 'https://peculiarventures.github.io/pv-webcrypto-tests/src/asmcrypto.js' script to your project");
      }
    }

    static checkCryptoKey(key) {
      if (!(key instanceof AesCryptoKey)) {
        throw new TypeError("key: Is not AesCryptoKey");
      }
    }

    static async generateKey(algorithm, extractable, usages) {
      this.checkLib();
      const raw = nativeCrypto.getRandomValues(new Uint8Array(algorithm.length / 8));
      return new AesCryptoKey(algorithm, extractable, usages, raw);
    }

    static async encrypt(algorithm, key, data) {
      return this.cipher(algorithm, key, data, true);
    }

    static async decrypt(algorithm, key, data) {
      return this.cipher(algorithm, key, data, false);
    }

    static async exportKey(format, key) {
      this.checkLib();

      switch (format) {
        case "jwk":
          return key.toJSON();

        case "raw":
          return key.raw.buffer;

        default:
          throw new OperationError("format: Must be 'jwk' or 'raw'");
      }
    }

    static async importKey(format, keyData, algorithm, extractable, keyUsages) {
      this.checkLib();
      let raw;

      if (isJWK(keyData)) {
        raw = Convert.FromBase64Url(keyData.k);
      } else {
        raw = BufferSourceConverter.toArrayBuffer(keyData);
      }

      switch (raw.byteLength << 3) {
        case 128:
        case 192:
        case 256:
          break;

        default:
          throw new OperationError("keyData: Is wrong key length");
      }

      const key = new AesCryptoKey({
        name: algorithm.name,
        length: raw.byteLength << 3
      }, extractable, keyUsages, new Uint8Array(raw));
      return key;
    }

    static async cipher(algorithm, key, data, encrypt) {
      this.checkLib();
      const action = encrypt ? "encrypt" : "decrypt";
      let res;

      if (isAlgorithm(algorithm, AesCrypto.AesCBC)) {
        const iv = BufferSourceConverter.toArrayBuffer(algorithm.iv);
        res = asmCrypto.AES_CBC[action](data, key.raw, undefined, iv);
      } else if (isAlgorithm(algorithm, AesCrypto.AesGCM)) {
        const iv = BufferSourceConverter.toArrayBuffer(algorithm.iv);
        let additionalData;

        if (algorithm.additionalData) {
          additionalData = BufferSourceConverter.toArrayBuffer(algorithm.additionalData);
        }

        const tagLength = (algorithm.tagLength || 128) / 8;
        res = asmCrypto.AES_GCM[action](data, key.raw, iv, additionalData, tagLength);
      } else if (isAlgorithm(algorithm, AesCrypto.AesECB)) {
        res = asmCrypto.AES_ECB[action](data, key.raw, true);
      } else {
        throw new OperationError(`algorithm: Is not recognized`);
      }

      return res.buffer;
    }

  }

  AesCrypto.AesCBC = "AES-CBC";
  AesCrypto.AesECB = "AES-ECB";
  AesCrypto.AesGCM = "AES-GCM";

  class AesCbcProvider$1 extends AesCbcProvider {
    async onGenerateKey(algorithm, extractable, keyUsages) {
      return AesCrypto.generateKey(algorithm, extractable, keyUsages);
    }

    async onEncrypt(algorithm, key, data) {
      return AesCrypto.encrypt(algorithm, key, data);
    }

    async onDecrypt(algorithm, key, data) {
      return AesCrypto.decrypt(algorithm, key, data);
    }

    async onExportKey(format, key) {
      return AesCrypto.exportKey(format, key);
    }

    async onImportKey(format, keyData, algorithm, extractable, keyUsages) {
      return AesCrypto.importKey(format, keyData, algorithm, extractable, keyUsages);
    }

    async checkCryptoKey(key, keyUsage) {
      super.checkCryptoKey(key, keyUsage);
      AesCrypto.checkCryptoKey(key);
    }

  }

  class AesEcbProvider$1 extends AesEcbProvider {
    async onGenerateKey(algorithm, extractable, keyUsages) {
      return AesCrypto.generateKey(algorithm, extractable, keyUsages);
    }

    async onEncrypt(algorithm, key, data) {
      return AesCrypto.encrypt(algorithm, key, data);
    }

    async onDecrypt(algorithm, key, data) {
      return AesCrypto.decrypt(algorithm, key, data);
    }

    async onExportKey(format, key) {
      return AesCrypto.exportKey(format, key);
    }

    async onImportKey(format, keyData, algorithm, extractable, keyUsages) {
      return AesCrypto.importKey(format, keyData, algorithm, extractable, keyUsages);
    }

    async checkCryptoKey(key, keyUsage) {
      super.checkCryptoKey(key, keyUsage);
      AesCrypto.checkCryptoKey(key);
    }

  }

  class AesGcmProvider$1 extends AesGcmProvider {
    async onGenerateKey(algorithm, extractable, keyUsages) {
      return AesCrypto.generateKey(algorithm, extractable, keyUsages);
    }

    async onEncrypt(algorithm, key, data) {
      return AesCrypto.encrypt(algorithm, key, data);
    }

    async onDecrypt(algorithm, key, data) {
      return AesCrypto.decrypt(algorithm, key, data);
    }

    async onExportKey(format, key) {
      return AesCrypto.exportKey(format, key);
    }

    async onImportKey(format, keyData, algorithm, extractable, keyUsages) {
      return AesCrypto.importKey(format, keyData, algorithm, extractable, keyUsages);
    }

    async checkCryptoKey(key, keyUsage) {
      super.checkCryptoKey(key, keyUsage);
      AesCrypto.checkCryptoKey(key);
    }

  }

  class AesCtrProvider$1 extends AesCtrProvider {
    async onEncrypt(algorithm, key, data) {
      throw new Error("Method not implemented.");
    }

    async onDecrypt(algorithm, key, data) {
      throw new Error("Method not implemented.");
    }

    async onGenerateKey(algorithm, extractable, keyUsages) {
      throw new Error("Method not implemented.");
    }

    async onExportKey(format, key) {
      throw new Error("Method not implemented.");
    }

    async onImportKey(format, keyData, algorithm, extractable, keyUsages) {
      throw new Error("Method not implemented.");
    }

  }

  class AesKwProvider$1 extends AesKwProvider {
    async onEncrypt(algorithm, key, data) {
      throw new Error("Method not implemented.");
    }

    async onDecrypt(algorithm, key, data) {
      throw new Error("Method not implemented.");
    }

    async onGenerateKey(algorithm, extractable, keyUsages) {
      throw new Error("Method not implemented.");
    }

    async onExportKey(format, key) {
      throw new Error("Method not implemented.");
    }

    async onImportKey(format, keyData, algorithm, extractable, keyUsages) {
      throw new Error("Method not implemented.");
    }

  }

  class RsaCryptoKey extends CryptoKey$1 {
    constructor(algorithm, extractable, type, usages, data) {
      super(algorithm, extractable, type, usages);
      this.data = data;
    }

  }

  class RsaCrypto {
    static checkLib() {
      if (typeof asmCrypto === "undefined") {
        throw new OperationError("Cannot implement DES mechanism. Add 'https://peculiarventures.github.io/pv-webcrypto-tests/src/asmcrypto.js' script to your project");
      }
    }

    static checkCryptoKey(key) {
      if (!(key instanceof RsaCryptoKey)) {
        throw new TypeError("key: Is not RsaCryptoKey");
      }
    }

    static async generateKey(algorithm, extractable, keyUsages) {
      this.checkLib();
      const pubExp = algorithm.publicExponent[0] === 3 ? 3 : 65537;
      const rsaKey = asmCrypto.RSA.generateKey(algorithm.modulusLength, pubExp);
      const hashAlgorithm = algorithm.hash.name.toUpperCase();
      const privateKey = new RsaCryptoKey(_objectSpread({}, algorithm, {
        hash: {
          name: hashAlgorithm
        }
      }), extractable, "private", keyUsages.filter(usage => ~this.privateUsages.indexOf(usage)), rsaKey);
      const publicKey = new RsaCryptoKey(_objectSpread({}, algorithm, {
        hash: {
          name: hashAlgorithm
        }
      }), true, "public", keyUsages.filter(usage => ~this.publicUsages.indexOf(usage)), rsaKey);
      return {
        privateKey,
        publicKey
      };
    }

    static async exportKey(format, key) {
      this.checkLib();

      switch (format) {
        case "pkcs8":
          return this.exportPkcs8Key(key);

        case "spki":
          return this.exportSpkiKey(key);

        case "jwk":
          return this.exportJwkKey(key);

        default:
          throw new OperationError("format: Must be 'jwk', 'pkcs8' or 'spki'");
      }
    }

    static async importKey(format, keyData, algorithm, extractable, keyUsages) {
      this.checkLib();
      let asmKey;

      switch (format) {
        case "pkcs8":
          asmKey = this.importPkcs8Key(keyData);
          break;

        case "spki":
          asmKey = this.importSpkiKey(keyData);
          break;

        case "jwk":
          asmKey = this.importJwkKey(keyData);
          break;

        default:
          throw new OperationError("format: Must be 'jwk', 'pkcs8' or 'spki'");
      }

      const key = new RsaCryptoKey(_objectSpread({
        publicExponent: asmKey[1][1] === 1 ? asmKey[1].slice(1) : asmKey[1].slice(3),
        modulusLength: asmKey[0].byteLength << 3
      }, algorithm), extractable, asmKey.length === 2 ? "public" : "private", keyUsages, asmKey);
      return key;
    }

    static exportPkcs8Key(key) {
      const keyInfo = new PrivateKeyInfo();
      keyInfo.privateKeyAlgorithm.algorithm = "1.2.840.113549.1.1.1";
      keyInfo.privateKeyAlgorithm.parameters = null;
      keyInfo.privateKey = build_6.serialize(this.exportAsmKey(key.data));
      return build_6.serialize(keyInfo);
    }

    static importPkcs8Key(data) {
      const keyInfo = build_5.parse(data, PrivateKeyInfo);
      const privateKey = build_5.parse(keyInfo.privateKey, RsaPrivateKey);
      return this.importAsmKey(privateKey);
    }

    static importSpkiKey(data) {
      const keyInfo = build_5.parse(data, PublicKeyInfo);
      const publicKey = build_5.parse(keyInfo.publicKey, RsaPublicKey);
      return this.importAsmKey(publicKey);
    }

    static exportSpkiKey(key) {
      const publicKey = new RsaPublicKey();
      publicKey.modulus = key.data[0].buffer;
      publicKey.publicExponent = key.data[1][1] === 1 ? key.data[1].buffer.slice(1) : key.data[1].buffer.slice(3);
      const keyInfo = new PublicKeyInfo();
      keyInfo.publicKeyAlgorithm.algorithm = "1.2.840.113549.1.1.1";
      keyInfo.publicKeyAlgorithm.parameters = null;
      keyInfo.publicKey = build_6.serialize(publicKey);
      return build_6.serialize(keyInfo);
    }

    static importJwkKey(data) {
      let key;

      if (data.d) {
        key = build_3$1.fromJSON(data, {
          targetSchema: RsaPrivateKey
        });
      } else {
        key = build_3$1.fromJSON(data, {
          targetSchema: RsaPublicKey
        });
      }

      return this.importAsmKey(key);
    }

    static exportJwkKey(key) {
      const asnKey = this.exportAsmKey(key.data);
      const jwk = build_2$1.toJSON(asnKey);
      jwk.ext = true;
      jwk.key_ops = key.usages;
      jwk.kty = "RSA";
      jwk.alg = this.getJwkAlgorithm(key.algorithm);
      return jwk;
    }

    static getJwkAlgorithm(algorithm) {
      switch (algorithm.name.toUpperCase()) {
        case "RSA-OAEP":
          const mdSize = /(\d+)$/.exec(algorithm.hash.name)[1];
          return `RSA-OAEP${mdSize !== "1" ? `-${mdSize}` : ""}`;

        case "RSASSA-PKCS1-V1_5":
          return `RS${/(\d+)$/.exec(algorithm.hash.name)[1]}`;

        case "RSA-PSS":
          return `PS${/(\d+)$/.exec(algorithm.hash.name)[1]}`;

        default:
          throw new OperationError("algorithm: Is not recognized");
      }
    }

    static exportAsmKey(asmKey) {
      let key;

      if (asmKey.length > 2) {
        const privateKey = new RsaPrivateKey();
        privateKey.privateExponent = asmKey[2].buffer;
        privateKey.prime1 = asmKey[3].buffer;
        privateKey.prime2 = asmKey[4].buffer;
        privateKey.exponent1 = asmKey[5].buffer;
        privateKey.exponent2 = asmKey[6].buffer;
        privateKey.coefficient = asmKey[7].buffer;
        key = privateKey;
      } else {
        key = new RsaPublicKey();
      }

      key.modulus = asmKey[0].buffer;
      key.publicExponent = asmKey[1][1] === 1 ? asmKey[1].buffer.slice(1) : asmKey[1].buffer.slice(3);
      return key;
    }

    static importAsmKey(key) {
      const expPadding = new Uint8Array(4 - key.publicExponent.byteLength);
      const asmKey = [new Uint8Array(key.modulus), concat(expPadding, new Uint8Array(key.publicExponent))];

      if (key instanceof RsaPrivateKey) {
        asmKey.push(new Uint8Array(key.privateExponent));
        asmKey.push(new Uint8Array(key.prime1));
        asmKey.push(new Uint8Array(key.prime2));
        asmKey.push(new Uint8Array(key.exponent1));
        asmKey.push(new Uint8Array(key.exponent2));
        asmKey.push(new Uint8Array(key.coefficient));
      }

      return asmKey;
    }

  }

  RsaCrypto.RsaSsa = "RSASSA-PKCS1-v1_5";
  RsaCrypto.RsaPss = "RSA-PSS";
  RsaCrypto.RsaOaep = "RSA-OAEP";
  RsaCrypto.privateUsages = ["sign", "decrypt", "unwrapKey"];
  RsaCrypto.publicUsages = ["verify", "encrypt", "wrapKey"];

  class RsaOaepProvider$1 extends RsaOaepProvider {
    async onGenerateKey(algorithm, extractable, keyUsages) {
      return RsaCrypto.generateKey(algorithm, extractable, keyUsages);
    }

    async onExportKey(format, key) {
      return RsaCrypto.exportKey(format, key);
    }

    async onImportKey(format, keyData, algorithm, extractable, keyUsages) {
      return RsaCrypto.importKey(format, keyData, algorithm, extractable, keyUsages);
    }

    async onEncrypt(algorithm, key, data) {
      RsaCrypto.checkLib();
      return this.cipher(algorithm, key, data, true);
    }

    async onDecrypt(algorithm, key, data) {
      RsaCrypto.checkLib();
      return this.cipher(algorithm, key, data, false);
    }

    cipher(algorithm, key, data, encrypt) {
      const fn = this.getOperation(key.algorithm, encrypt);
      let label;

      if (algorithm.label) {
        label = BufferSourceConverter.toArrayBuffer(algorithm.label);
      }

      return fn(data, key.data, label).slice(0).buffer;
    }

    getOperation(keyAlgorithm, encrypt) {
      const action = encrypt ? "encrypt" : "decrypt";

      switch (keyAlgorithm.hash.name) {
        case "SHA-1":
          return asmCrypto.RSA_OAEP_SHA1[action];

        case "SHA-256":
          return asmCrypto.RSA_OAEP_SHA256[action];

        case "SHA-512":
          return asmCrypto.RSA_OAEP_SHA512[action];

        default:
          throw new AlgorithmError("keyAlgorithm.hash: Is not recognized");
      }
    }

  }

  class RsaPssProvider$1 extends RsaPssProvider {
    async onGenerateKey(algorithm, extractable, keyUsages) {
      return RsaCrypto.generateKey(algorithm, extractable, keyUsages);
    }

    async onExportKey(format, key) {
      return RsaCrypto.exportKey(format, key);
    }

    async onImportKey(format, keyData, algorithm, extractable, keyUsages) {
      return RsaCrypto.importKey(format, keyData, algorithm, extractable, keyUsages);
    }

    async onSign(algorithm, key, data) {
      RsaCrypto.checkLib();
      const fn = this.getOperation(key.algorithm, true);
      return fn(data, key.data, algorithm.saltLength).buffer;
    }

    async onVerify(algorithm, key, signature, data) {
      RsaCrypto.checkLib();
      const fn = this.getOperation(key.algorithm, false);
      return fn(signature, data, key.data, algorithm.saltLength);
    }

    async checkCryptoKey(key, keyUsage) {
      super.checkCryptoKey(key, keyUsage);
      RsaCrypto.checkCryptoKey(key);
    }

    getOperation(keyAlgorithm, sign) {
      const action = sign ? "sign" : "verify";

      switch (keyAlgorithm.hash.name) {
        case "SHA-1":
          return asmCrypto.RSA_PSS_SHA1[action];

        case "SHA-256":
          return asmCrypto.RSA_PSS_SHA256[action];

        case "SHA-512":
          return asmCrypto.RSA_PSS_SHA512[action];

        default:
          throw new AlgorithmError("keyAlgorithm.hash: Is not recognized");
      }
    }

  }

  class RsaSsaProvider$1 extends RsaSsaProvider {
    async onGenerateKey(algorithm, extractable, keyUsages) {
      return RsaCrypto.generateKey(algorithm, extractable, keyUsages);
    }

    async onExportKey(format, key) {
      return RsaCrypto.exportKey(format, key);
    }

    async onImportKey(format, keyData, algorithm, extractable, keyUsages) {
      return RsaCrypto.importKey(format, keyData, algorithm, extractable, keyUsages);
    }

    async onSign(algorithm, key, data) {
      RsaCrypto.checkLib();
      const fn = this.getOperation(key.algorithm, true);
      return fn(data, key.data).buffer;
    }

    async onVerify(algorithm, key, signature, data) {
      RsaCrypto.checkLib();
      const fn = this.getOperation(key.algorithm, false);
      return fn(signature, data, key.data);
    }

    async checkCryptoKey(key, keyUsage) {
      super.checkCryptoKey(key, keyUsage);
      RsaCrypto.checkCryptoKey(key);
    }

    getOperation(keyAlgorithm, sign) {
      const action = sign ? "sign" : "verify";

      switch (keyAlgorithm.hash.name) {
        case "SHA-1":
          return asmCrypto.RSA_PKCS1_v1_5_SHA1[action];

        case "SHA-256":
          return asmCrypto.RSA_PKCS1_v1_5_SHA256[action];

        case "SHA-512":
          return asmCrypto.RSA_PKCS1_v1_5_SHA512[action];

        default:
          throw new AlgorithmError("keyAlgorithm.hash: Is not recognized");
      }
    }

  }

  const namedOIDs = {
    "1.2.840.10045.3.1.7": "P-256",
    "P-256": "1.2.840.10045.3.1.7",
    "1.3.132.0.34": "P-384",
    "P-384": "1.3.132.0.34",
    "1.3.132.0.35": "P-521",
    "P-521": "1.3.132.0.35",
    "1.3.132.0.10": "K-256",
    "K-256": "1.3.132.0.10"
  };

  function getOidByNamedCurve(namedCurve) {
    const oid = namedOIDs[namedCurve];

    if (!oid) {
      throw new OperationError(`Cannot convert WebCrypto named curve '${namedCurve}' to OID`);
    }

    return oid;
  }

  class EcCryptoKey extends CryptoKey$1 {
    constructor(algorithm, extractable, type, usages, data) {
      super(algorithm, extractable, type, usages);
      this.data = data;
    }

  }

  class EcCrypto {
    static checkLib() {
      if (typeof elliptic === "undefined") {
        throw new OperationError("Cannot implement DES mechanism. Add 'https://peculiarventures.github.io/pv-webcrypto-tests/src/elliptic.js' script to your project");
      }
    }

    static async generateKey(algorithm, extractable, keyUsages) {
      this.checkLib();
      const key = this.initEcKey(algorithm.namedCurve);
      const ecKey = key.genKeyPair();
      ecKey.getPublic();
      const prvKey = new EcCryptoKey(_objectSpread({}, algorithm), extractable, "private", keyUsages.filter(usage => ~this.privateUsages.indexOf(usage)), ecKey);
      const pubKey = new EcCryptoKey(_objectSpread({}, algorithm), true, "public", keyUsages.filter(usage => ~this.publicUsages.indexOf(usage)), ecKey);
      return {
        privateKey: prvKey,
        publicKey: pubKey
      };
    }

    static checkCryptoKey(key) {
      if (!(key instanceof EcCryptoKey)) {
        throw new TypeError("key: Is not EcCryptoKey");
      }
    }

    static concat(...buf) {
      const res = new Uint8Array(buf.map(item => item.length).reduce((prev, cur) => prev + cur));
      let offset = 0;
      buf.forEach((item, index) => {
        for (let i = 0; i < item.length; i++) {
          res[offset + i] = item[i];
        }

        offset += item.length;
      });
      return res;
    }

    static async exportKey(format, key) {
      this.checkLib();

      switch (format) {
        case "pkcs8":
          return this.exportPkcs8Key(key);

        case "spki":
          return this.exportSpkiKey(key);

        case "jwk":
          return this.exportJwkKey(key);

        case "raw":
          return new Uint8Array(key.data.getPublic("der")).buffer;

        default:
          throw new OperationError("format: Must be 'jwk', 'raw, 'pkcs8' or 'spki'");
      }
    }

    static async importKey(format, keyData, algorithm, extractable, keyUsages) {
      this.checkLib();
      let ecKey;

      switch (format) {
        case "pkcs8":
          ecKey = this.importPkcs8Key(keyData, algorithm.namedCurve);
          break;

        case "spki":
          ecKey = this.importSpkiKey(keyData, algorithm.namedCurve);
          break;

        case "raw":
          ecKey = this.importEcKey(new EcPublicKey(keyData), algorithm.namedCurve);
          break;

        case "jwk":
          ecKey = this.importJwkKey(keyData);
          break;

        default:
          throw new OperationError("format: Must be 'jwk', 'raw', 'pkcs8' or 'spki'");
      }

      const key = new EcCryptoKey(_objectSpread({}, algorithm), extractable, ecKey.priv ? "private" : "public", keyUsages, ecKey);
      return key;
    }

    static getNamedCurve(wcNamedCurve) {
      const crv = wcNamedCurve.toUpperCase();
      let res = "";

      if (["P-256", "P-384", "P-521"].indexOf(crv) > -1) {
        res = crv.replace("-", "").toLowerCase();
      } else if (crv === "K-256") {
        res = "secp256k1";
      } else {
        throw new OperationError(`Unsupported named curve '${wcNamedCurve}'`);
      }

      return res;
    }

    static initEcKey(namedCurve) {
      return elliptic.ec(this.getNamedCurve(namedCurve));
    }

    static exportPkcs8Key(key) {
      const keyInfo = new PrivateKeyInfo();
      keyInfo.privateKeyAlgorithm.algorithm = this.ASN_ALGORITHM;
      keyInfo.privateKeyAlgorithm.parameters = build_6.serialize(new ObjectIdentifier(getOidByNamedCurve(key.algorithm.namedCurve)));
      keyInfo.privateKey = build_6.serialize(this.exportEcKey(key));
      return build_6.serialize(keyInfo);
    }

    static importPkcs8Key(data, namedCurve) {
      const keyInfo = build_5.parse(data, PrivateKeyInfo);
      const privateKey = build_5.parse(keyInfo.privateKey, EcPrivateKey);
      return this.importEcKey(privateKey, namedCurve);
    }

    static importSpkiKey(data, namedCurve) {
      const keyInfo = build_5.parse(data, PublicKeyInfo);
      const publicKey = new EcPublicKey(keyInfo.publicKey);
      return this.importEcKey(publicKey, namedCurve);
    }

    static exportSpkiKey(key) {
      const publicKey = new EcPublicKey(new Uint8Array(key.data.getPublic("der")).buffer);
      const keyInfo = new PublicKeyInfo();
      keyInfo.publicKeyAlgorithm.algorithm = this.ASN_ALGORITHM;
      keyInfo.publicKeyAlgorithm.parameters = build_6.serialize(new ObjectIdentifier(getOidByNamedCurve(key.algorithm.namedCurve)));
      keyInfo.publicKey = publicKey.value;
      return build_6.serialize(keyInfo);
    }

    static importJwkKey(data) {
      let key;

      if (data.d) {
        key = build_3$1.fromJSON(data, {
          targetSchema: EcPrivateKey
        });
      } else {
        key = build_3$1.fromJSON(data, {
          targetSchema: EcPublicKey
        });
      }

      return this.importEcKey(key, data.crv);
    }

    static exportJwkKey(key) {
      const asnKey = this.exportEcKey(key);
      const jwk = build_2$1.toJSON(asnKey);
      jwk.ext = true;
      jwk.key_ops = key.usages;
      jwk.crv = key.algorithm.namedCurve;
      jwk.kty = "EC";
      return jwk;
    }

    static exportEcKey(ecKey) {
      if (ecKey.type === "private") {
        const privateKey = new EcPrivateKey();
        const point = new Uint8Array(ecKey.data.getPrivate("der").toArray());
        const pointPad = new Uint8Array(this.getPointSize(ecKey.algorithm.namedCurve) - point.length);
        privateKey.privateKey = concat(pointPad, point);
        privateKey.publicKey = new Uint8Array(ecKey.data.getPublic("der"));
        return privateKey;
      } else if (ecKey.data.pub) {
        return new EcPublicKey(new Uint8Array(ecKey.data.getPublic("der")).buffer);
      } else {
        throw new Error("Cannot get private or public key");
      }
    }

    static importEcKey(key, namedCurve) {
      const ecKey = this.initEcKey(namedCurve);

      if (key instanceof EcPublicKey) {
        return ecKey.keyFromPublic(new Uint8Array(key.value));
      }

      return ecKey.keyFromPrivate(new Uint8Array(key.privateKey));
    }

    static getPointSize(namedCurve) {
      switch (namedCurve) {
        case "P-256":
        case "K-256":
          return 32;

        case "P-384":
          return 48;

        case "P-521":
          return 66;
      }

      throw new Error("namedCurve: Is not recognized");
    }

  }

  EcCrypto.privateUsages = ["sign", "deriveKey", "deriveBits"];
  EcCrypto.publicUsages = ["verify"];
  EcCrypto.ASN_ALGORITHM = "1.2.840.10045.2.1";

  class EcdhProvider$1 extends EcdhProvider {
    async onGenerateKey(algorithm, extractable, keyUsages) {
      return EcCrypto.generateKey(algorithm, extractable, keyUsages);
    }

    async onExportKey(format, key) {
      return EcCrypto.exportKey(format, key);
    }

    async onImportKey(format, keyData, algorithm, extractable, keyUsages) {
      return EcCrypto.importKey(format, keyData, algorithm, extractable, keyUsages);
    }

    async onDeriveBits(algorithm, baseKey, length) {
      EcCrypto.checkLib();
      const shared = baseKey.data.derive(algorithm.public.data.getPublic());
      let array = new Uint8Array(shared.toArray());
      let len = array.length;
      len = len > 32 ? len > 48 ? 66 : 48 : 32;

      if (array.length < len) {
        array = EcCrypto.concat(new Uint8Array(len - array.length), array);
      }

      const buf = array.slice(0, length / 8).buffer;
      return buf;
    }

    async checkCryptoKey(key, keyUsage) {
      super.checkCryptoKey(key, keyUsage);
      EcCrypto.checkCryptoKey(key);
    }

  }

  function b2a(buffer) {
    const buf = new Uint8Array(buffer);
    const res = [];

    for (let i = 0; i < buf.length; i++) {
      res.push(buf[i]);
    }

    return res;
  }

  function hex2buffer(hexString, padded) {
    if (hexString.length % 2) {
      hexString = "0" + hexString;
    }

    let res = new Uint8Array(hexString.length / 2);

    for (let i = 0; i < hexString.length; i++) {
      const c = hexString.slice(i, ++i + 1);
      res[(i - 1) / 2] = parseInt(c, 16);
    }

    if (padded) {
      let len = res.length;
      len = len > 32 ? len > 48 ? 66 : 48 : 32;

      if (res.length < len) {
        res = EcCrypto.concat(new Uint8Array(len - res.length), res);
      }
    }

    return res;
  }

  function buffer2hex(buffer, padded) {
    let res = "";

    for (let i = 0; i < buffer.length; i++) {
      const char = buffer[i].toString(16);
      res += char.length % 2 ? "0" + char : char;
    }

    if (padded) {
      let len = buffer.length;
      len = len > 32 ? len > 48 ? 66 : 48 : 32;

      if (res.length / 2 < len) {
        res = new Array(len * 2 - res.length + 1).join("0") + res;
      }
    }

    return res;
  }

  class EcdsaProvider$1 extends EcdsaProvider {
    async onGenerateKey(algorithm, extractable, keyUsages) {
      return EcCrypto.generateKey(algorithm, extractable, keyUsages);
    }

    async onExportKey(format, key) {
      return EcCrypto.exportKey(format, key);
    }

    async onImportKey(format, keyData, algorithm, extractable, keyUsages) {
      return EcCrypto.importKey(format, keyData, algorithm, extractable, keyUsages);
    }

    async onSign(algorithm, key, data) {
      EcCrypto.checkLib();
      const crypto = new Crypto$1();
      let array;
      const hash = await crypto.subtle.digest(algorithm.hash, data);
      array = b2a(hash);
      const signature = await key.data.sign(array);
      const hexSignature = buffer2hex(signature.r.toArray(), true) + buffer2hex(signature.s.toArray(), true);
      return hex2buffer(hexSignature).buffer;
    }

    async onVerify(algorithm, key, signature, data) {
      EcCrypto.checkLib();
      const crypto = new Crypto$1();
      const sig = {
        r: new Uint8Array(signature.slice(0, signature.byteLength / 2)),
        s: new Uint8Array(signature.slice(signature.byteLength / 2))
      };
      const hashedData = await crypto.subtle.digest(algorithm.hash, data);
      const array = b2a(hashedData);
      return key.data.verify(array, sig);
    }

    async checkCryptoKey(key, keyUsage) {
      super.checkCryptoKey(key, keyUsage);
      EcCrypto.checkCryptoKey(key);
    }

  }

  class ShaCrypto {
    static checkLib() {
      if (typeof asmCrypto === "undefined") {
        throw new OperationError("Cannot implement DES mechanism. Add 'https://peculiarventures.github.io/pv-webcrypto-tests/src/asmcrypto.js' script to your project");
      }
    }

    static async digest(algorithm, data) {
      this.checkLib();
      const mech = asmCrypto[algorithm.name.replace("-", "")];
      return mech.bytes(data).buffer;
    }

  }

  class Sha1Provider extends ProviderCrypto {
    constructor() {
      super(...arguments);
      this.name = "SHA-1";
      this.usages = [];
    }

    async onDigest(algorithm, data) {
      return ShaCrypto.digest(algorithm, data);
    }

  }

  class Sha256Provider extends Sha1Provider {
    constructor() {
      super(...arguments);
      this.name = "SHA-256";
    }

  }

  class Sha512Provider extends Sha1Provider {
    constructor() {
      super(...arguments);
      this.name = "SHA-512";
    }

  }

  class PbkdfCryptoKey extends CryptoKey$1 {
    constructor(algorithm, extractable, usages, raw) {
      super(algorithm, extractable, "secret", usages);
      this.raw = raw;
    }

  }

  class Pbkdf2Provider$1 extends Pbkdf2Provider {
    checkLib() {
      if (typeof asmCrypto === "undefined") {
        throw new OperationError("Cannot implement DES mechanism. Add 'https://peculiarventures.github.io/pv-webcrypto-tests/src/asmcrypto.js' script to your project");
      }
    }

    async onImportKey(format, keyData, algorithm, extractable, keyUsages) {
      this.checkLib();
      return new PbkdfCryptoKey(algorithm, extractable, keyUsages, BufferSourceConverter.toUint8Array(keyData));
    }

    async onDeriveBits(algorithm, baseKey, length) {
      this.checkLib();
      let result;
      const salt = BufferSourceConverter.toUint8Array(algorithm.salt);
      const password = baseKey.raw;

      switch (algorithm.hash.name.toUpperCase()) {
        case "SHA-1":
          result = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, salt, algorithm.iterations, length >> 3);
          break;

        case "SHA-256":
          result = asmCrypto.PBKDF2_HMAC_SHA256.bytes(password, salt, algorithm.iterations, length >> 3);
          break;

        default:
          throw new OperationError(`algorithm.hash: '${algorithm.hash.name}' hash algorithm is not supported`);
      }

      return result.buffer;
    }

  }

  class DesCryptoKey extends CryptoKey$1 {
    constructor(algorithm, extractable, usages, raw) {
      super(algorithm, extractable, "secret", usages);
      this.raw = raw;
    }

    toJSON() {
      const jwk = {
        kty: "oct",
        alg: this.getJwkAlgorithm(),
        k: Convert.ToBase64Url(this.raw),
        ext: this.extractable,
        key_ops: this.usages
      };
      return jwk;
    }

    getJwkAlgorithm() {
      switch (this.algorithm.name.toUpperCase()) {
        case "DES-CBC":
          return `DES-CBC`;

        case "DES-EDE3-CBC":
          return `3DES-CBC`;

        default:
          throw new AlgorithmError("Unsupported algorithm name");
      }
    }

  }

  class DesCrypto {
    static checkLib() {
      if (typeof des === "undefined") {
        throw new OperationError("Cannot implement DES mechanism. Add 'https://peculiarventures.github.io/pv-webcrypto-tests/src/des.js' script to your project");
      }
    }

    static async generateKey(algorithm, extractable, keyUsages) {
      this.checkLib();
      const raw = nativeCrypto.getRandomValues(new Uint8Array(algorithm.length / 8));
      return new DesCryptoKey(algorithm, extractable, keyUsages, raw);
    }

    static async exportKey(format, key) {
      this.checkLib();

      switch (format) {
        case "jwk":
          return key.toJSON();

        case "raw":
          return key.raw.buffer;

        default:
          throw new OperationError("format: Must be 'jwk' or 'raw'");
      }
    }

    static async importKey(format, keyData, algorithm, extractable, keyUsages) {
      this.checkLib();
      let raw;

      if (isJWK(keyData)) {
        raw = Convert.FromBase64Url(keyData.k);
      } else {
        raw = BufferSourceConverter.toArrayBuffer(keyData);
      }

      if (algorithm.name === "DES-CBC" && raw.byteLength !== 8 || algorithm.name === "DES-EDE3-CBC" && raw.byteLength !== 24) {
        throw new OperationError("keyData: Is wrong key length");
      }

      const key = new DesCryptoKey({
        name: algorithm.name,
        length: raw.byteLength << 3
      }, extractable, keyUsages, new Uint8Array(raw));
      return key;
    }

    static async encrypt(algorithm, key, data) {
      return this.cipher(algorithm, key, data, true);
    }

    static async decrypt(algorithm, key, data) {
      return this.cipher(algorithm, key, data, false);
    }

    static async cipher(algorithm, key, data, encrypt) {
      this.checkLib();
      const type = encrypt ? "encrypt" : "decrypt";
      let DesCipher;
      const iv = BufferSourceConverter.toUint8Array(algorithm.iv);

      switch (algorithm.name.toUpperCase()) {
        case "DES-CBC":
          DesCipher = des.CBC.instantiate(des.DES).create({
            key: key.raw,
            type,
            iv
          });
          break;

        case "DES-EDE3-CBC":
          DesCipher = des.CBC.instantiate(des.EDE).create({
            key: key.raw,
            type,
            iv
          });
          break;

        default:
          throw new OperationError("algorithm: Is not recognized");
      }

      const enc = DesCipher.update(new Uint8Array(data)).concat(DesCipher.final());
      return new Uint8Array(enc).buffer;
    }

  }

  class DesCbcProvider extends DesProvider {
    constructor() {
      super(...arguments);
      this.keySizeBits = 64;
      this.ivSize = 8;
      this.name = "DES-CBC";
    }

    async onGenerateKey(algorithm, extractable, keyUsages) {
      return DesCrypto.generateKey(algorithm, extractable, keyUsages);
    }

    async onExportKey(format, key) {
      return DesCrypto.exportKey(format, key);
    }

    async onImportKey(format, keyData, algorithm, extractable, keyUsages) {
      return DesCrypto.importKey(format, keyData, algorithm, extractable, keyUsages);
    }

    async onEncrypt(algorithm, key, data) {
      return DesCrypto.encrypt(algorithm, key, data);
    }

    async onDecrypt(algorithm, key, data) {
      return DesCrypto.decrypt(algorithm, key, data);
    }

  }

  class DesEde3CbcProvider extends DesProvider {
    constructor() {
      super(...arguments);
      this.keySizeBits = 192;
      this.ivSize = 8;
      this.name = "DES-EDE3-CBC";
    }

    async onGenerateKey(algorithm, extractable, keyUsages) {
      return DesCrypto.generateKey(algorithm, extractable, keyUsages);
    }

    async onExportKey(format, key) {
      return DesCrypto.exportKey(format, key);
    }

    async onImportKey(format, keyData, algorithm, extractable, keyUsages) {
      return DesCrypto.importKey(format, keyData, algorithm, extractable, keyUsages);
    }

    async onEncrypt(algorithm, key, data) {
      return DesCrypto.encrypt(algorithm, key, data);
    }

    async onDecrypt(algorithm, key, data) {
      return DesCrypto.decrypt(algorithm, key, data);
    }

  }

  class SubtleCrypto$1 extends SubtleCrypto {
    constructor() {
      super();
      this.browserInfo = BrowserInfo();
      this.providers.set(new AesCbcProvider$1());
      this.providers.set(new AesCtrProvider$1());
      this.providers.set(new AesEcbProvider$1());
      this.providers.set(new AesGcmProvider$1());
      this.providers.set(new AesKwProvider$1());
      this.providers.set(new DesCbcProvider());
      this.providers.set(new DesEde3CbcProvider());
      this.providers.set(new RsaSsaProvider$1());
      this.providers.set(new RsaPssProvider$1());
      this.providers.set(new RsaOaepProvider$1());
      this.providers.set(new EcdsaProvider$1());
      this.providers.set(new EcdhProvider$1());
      this.providers.set(new Sha1Provider());
      this.providers.set(new Sha256Provider());
      this.providers.set(new Sha512Provider());
      this.providers.set(new Pbkdf2Provider$1());
    }

    static isAnotherKey(key) {
      if (typeof key === "object" && typeof key.type === "string" && typeof key.extractable === "boolean" && typeof key.algorithm === "object") {
        return !(key instanceof CryptoKey$1);
      }

      return false;
    }

    async digest(...args) {
      return this.wrapNative("digest", ...args);
    }

    async importKey(...args) {
      this.fixFirefoxEcImportPkcs8(args);
      return this.wrapNative("importKey", ...args);
    }

    async exportKey(...args) {
      return (await this.fixFirefoxEcExportPkcs8(args)) || (await this.wrapNative("exportKey", ...args));
    }

    async generateKey(...args) {
      return this.wrapNative("generateKey", ...args);
    }

    async sign(...args) {
      return this.wrapNative("sign", ...args);
    }

    async verify(...args) {
      return this.wrapNative("verify", ...args);
    }

    async encrypt(...args) {
      return this.wrapNative("encrypt", ...args);
    }

    async decrypt(...args) {
      return this.wrapNative("decrypt", ...args);
    }

    async wrapKey(...args) {
      return this.wrapNative("wrapKey", ...args);
    }

    async unwrapKey(...args) {
      return this.wrapNative("unwrapKey", ...args);
    }

    async deriveBits(...args) {
      return this.wrapNative("deriveBits", ...args);
    }

    async deriveKey(...args) {
      return this.wrapNative("deriveKey", ...args);
    }

    async wrapNative(method, ...args) {
      if (~["generateKey", "unwrapKey", "deriveKey", "importKey"].indexOf(method)) {
        this.fixAlgorithmName(args);
      }

      try {
        if (method !== "digest" || !args.some(a => a instanceof CryptoKey$1)) {
          Debug.info(`Call native '${method}' method`, args);
          const res = await nativeSubtle[method].apply(nativeSubtle, args);
          return res;
        }
      } catch (e) {
        Debug.warn(`Error on native '${method}' calling. ${e.message}`, e);
      }

      if (method === "wrapKey") {
        try {
          Debug.info(`Trying to wrap key by using native functions`, args);
          const data = await this.exportKey(args[0], args[1]);
          const keyData = args[0] === "jwk" ? Convert.FromUtf8String(JSON.stringify(data)) : data;
          const res = await this.encrypt(args[3], args[2], keyData);
          return res;
        } catch (e) {
          Debug.warn(`Cannot wrap key by native functions. ${e.message}`, e);
        }
      }

      if (method === "unwrapKey") {
        try {
          Debug.info(`Trying to unwrap key by using native functions`, args);
          const data = await this.decrypt(args[3], args[2], args[1]);
          const keyData = args[0] === "jwk" ? JSON.parse(Convert.ToUtf8String(data)) : data;
          const res = await this.importKey(args[0], keyData, args[4], args[5], args[6]);
          return res;
        } catch (e) {
          Debug.warn(`Cannot unwrap key by native functions. ${e.message}`, e);
        }
      }

      if (method === "deriveKey") {
        try {
          Debug.info(`Trying to derive key by using native functions`, args);
          const data = await this.deriveBits(args[0], args[1], args[2].length);
          const res = await this.importKey("raw", data, args[2], args[3], args[4]);
          return res;
        } catch (e) {
          Debug.warn(`Cannot derive key by native functions. ${e.message}`, e);
        }
      }

      if (method === "deriveBits" || method === "deriveKey") {
        for (const arg of args) {
          if (typeof arg === "object" && arg.public && SubtleCrypto$1.isAnotherKey(arg.public)) {
            arg.public = await this.castKey(arg.public);
          }
        }
      }

      for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (SubtleCrypto$1.isAnotherKey(arg)) {
          args[i] = await this.castKey(arg);
        }
      }

      return super[method].apply(this, args);
    }

    async castKey(key) {
      Debug.info("Cast native CryptoKey to linter key.", key);

      if (!key.extractable) {
        throw new Error("Cannot cast unextractable crypto key");
      }

      const provider = this.getProvider(key.algorithm.name);
      const jwk = await this.exportKey("jwk", key);
      return provider.importKey("jwk", jwk, key.algorithm, true, key.usages);
    }

    fixAlgorithmName(args) {
      if (this.browserInfo.name === Browser.Edge) {
        for (let i = 0; i < args.length; i++) {
          const arg = args[0];

          if (typeof arg === "string") {
            for (const algorithm of this.providers.algorithms) {
              if (algorithm.toLowerCase() === arg.toLowerCase()) {
                args[i] = algorithm;
                break;
              }
            }
          } else if (typeof arg === "object" && typeof arg.name === "string") {
            for (const algorithm of this.providers.algorithms) {
              if (algorithm.toLowerCase() === arg.name.toLowerCase()) {
                arg.name = algorithm;
              }

              if (typeof arg.hash === "string" && algorithm.toLowerCase() === arg.hash.toLowerCase() || typeof arg.hash === "object" && typeof arg.hash.name === "string" && algorithm.toLowerCase() === arg.hash.name.toLowerCase()) {
                arg.hash = {
                  name: algorithm
                };
              }
            }
          }
        }
      }
    }

    fixFirefoxEcImportPkcs8(args) {
      const preparedAlgorithm = this.prepareAlgorithm(args[2]);
      const algName = preparedAlgorithm.name.toUpperCase();

      if (this.browserInfo.name === Browser.Firefox && args[0] === "pkcs8" && ~["ECDSA", "ECDH"].indexOf(algName) && ~["P-256", "P-384", "P-521"].indexOf(preparedAlgorithm.namedCurve)) {
        if (!BufferSourceConverter.isBufferSource(args[1])) {
          throw new TypeError("data: Is not ArrayBuffer or ArrayBufferView");
        }

        const preparedData = BufferSourceConverter.toArrayBuffer(args[1]);
        const keyInfo = build_5.parse(preparedData, PrivateKeyInfo);
        const privateKey = build_5.parse(keyInfo.privateKey, EcPrivateKey);
        const jwk = build_2$1.toJSON(privateKey);
        jwk.ext = true;
        jwk.key_ops = args[4];
        jwk.crv = preparedAlgorithm.namedCurve;
        jwk.kty = "EC";
        args[0] = "jwk";
        args[1] = jwk;
      }
    }

    async fixFirefoxEcExportPkcs8(args) {
      try {
        if (this.browserInfo.name === Browser.Firefox && args[0] === "pkcs8" && ~["ECDSA", "ECDH"].indexOf(args[1].algorithm.name) && ~["P-256", "P-384", "P-521"].indexOf(args[1].algorithm.namedCurve)) {
          const jwk = await this.exportKey("jwk", args[1]);
          const ecKey = build_3$1.fromJSON(jwk, {
            targetSchema: EcPrivateKey
          });
          const keyInfo = new PrivateKeyInfo();
          keyInfo.privateKeyAlgorithm.algorithm = EcCrypto.ASN_ALGORITHM;
          keyInfo.privateKeyAlgorithm.parameters = build_6.serialize(new ObjectIdentifier(getOidByNamedCurve(args[1].algorithm.namedCurve)));
          keyInfo.privateKey = build_6.serialize(ecKey);
          return build_6.serialize(keyInfo);
        }
      } catch (err) {
        Debug.error(err);
        return null;
      }
    }

  }

  SubtleCrypto$1.methods = ["digest", "importKey", "exportKey", "sign", "verify", "generateKey", "encrypt", "decrypt", "deriveBits", "deriveKey", "wrapKey", "unwrapKey"];

  class Crypto$1 extends Crypto {
    constructor() {
      super(...arguments);
      this.subtle = new SubtleCrypto$1();
    }

    getRandomValues(array) {
      return nativeCrypto.getRandomValues(array);
    }

  }

  if (!Math.imul) {
    Math.imul = function imul(a, b) {
      const ah = a >>> 16 & 0xffff;
      const al = a & 0xffff;
      const bh = b >>> 16 & 0xffff;
      const bl = b & 0xffff;
      return al * bl + (ah * bl + al * bh << 16 >>> 0) | 0;
    };
  }

  const window$1 = self;

  if (nativeCrypto) {
    Object.freeze(nativeCrypto.getRandomValues);
  }

  try {
    delete self.crypto;
    window$1.crypto = new Crypto$1();
    Object.freeze(window$1.crypto);
  } catch (e) {
    Debug.error(e);
  }

  const crypto = window$1.crypto;

  exports.crypto = crypto;

  return exports;

}({}));
