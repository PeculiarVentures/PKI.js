# Installation

Run one of the following commands to add `pkijs` and its peer dependency `asn1js` to your project:

```bash npm2yarn
npm install pkijs asn1js
```

pkijs checks `instanceof asn1js.Sequence` and similar on the ASN.1 values you pass in, so your application must use the same copy of `asn1js` as pkijs. Install it next to pkijs rather than bundling another version.

## Requirements

pkijs is an ES module and runs in modern browsers and in Node.js `^20.19.0 || >=22.12.0`. On these Node.js versions, CommonJS code can still load it with `require("pkijs")`.

If you compile TypeScript to CommonJS, set `"module"` to `"node20"` or `"nodenext"` in `tsconfig.json`.

pkijs has no cryptography of its own: it signs, verifies, encrypts and hashes with the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API). It uses `globalThis.crypto` by default, so no setup is needed in browsers or Node.js. To use another implementation, such as [`@peculiar/webcrypto`](https://github.com/PeculiarVentures/webcrypto), pass it to [`setEngine()`](api/index.md#setengine).

## First steps

Create a self-signed certificate, encode it, then parse it back and check its signature:

```ts
import * as asn1js from "asn1js";
import * as pkijs from "pkijs";

// Generate a key pair with the Web Crypto API
const keys = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);

// Create a self-signed certificate
const certificate = new pkijs.Certificate();
certificate.version = 2;
certificate.serialNumber = new asn1js.Integer({ value: 1 });
certificate.subject.typesAndValues.push(
  new pkijs.AttributeTypeAndValue({
    type: "2.5.4.3", // Common name
    value: new asn1js.Utf8String({ value: "Example" }),
  }),
);
certificate.issuer = certificate.subject;
certificate.notBefore.value = new Date();
certificate.notAfter.value = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
await certificate.subjectPublicKeyInfo.importKey(keys.publicKey);
await certificate.sign(keys.privateKey, "SHA-256");

// Encode it to DER, then parse it and check its signature
const der = certificate.toSchema().toBER();
const parsed = pkijs.Certificate.fromBER(der);
console.log(parsed.subject.typesAndValues[0].value.valueBlock.value); // Example
console.log(await parsed.verify()); // true
```

Next, browse the [examples](examples/certificates-and-revocation/index.md) and the [API reference](api/index.md).

## Upgrading from v3

v4 is ESM-only, raises the minimum Node.js version, makes `asn1js` 4 a peer dependency, and tightens some input handling. Read the [breaking changes](https://github.com/PeculiarVentures/PKI.js#breaking-changes-in-v4) before upgrading.
