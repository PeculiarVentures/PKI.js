<h1 align="center">
  PKIjs
</h1>

<div align="center">

![NPM License](https://img.shields.io/npm/l/pkijs)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/PeculiarVentures/PKI.js/publish.yml?branch=master&label=publish)
[![npm version](https://img.shields.io/npm/v/pkijs.svg)](https://www.npmjs.com/package/pkijs)
![Coveralls](https://img.shields.io/coverallsCoverage/github/PeculiarVentures/PKI.js)
[![npm downloads](https://img.shields.io/npm/dm/pkijs.svg)](https://www.npmjs.com/package/pkijs)

</div>

PKIjs provides a Typescript implementation of the most common formats and algorithms needed to build PKI-enabled applications

## Capabilities

- The creation and validation of X.509 certificates (RFC 5280) is used by all certificate-enabled applications.
- PKCS#10 (RFC 2986) is the most commonly used enrollment data structure used by X.509 applications. It enables the requestor to prove control of a given public key.
- Cryptographic Message Syntax (RFC 5652) is the most commonly used data structure for signing data in X.509 applications. CMS makes it easy to both sign and represent all of the data needed to verify a signature.
- Cryptographic Message Syntax (RFC 5652) is also the most commonly used data structure for encrypting data in X.509 applications. CMS makes it easy to provide interoperable data encryption.
- Time-Stamp Protocol (RFC 3161) is the most commonly used protocol for proving that data
  existed before a particular time. It is commonly used in signing applications to ensure signatures are verifiable long into the future.

## Objectives

- Typescript and object-oriented implementation
- Contains no cryptographic implementations and instead leverages Web Crypto API
- Work uniformly both in browser and in [Node](https://nodejs.org/)/[Deno](https://deno.com/)

## Installation

```bash
npm install pkijs asn1js
```

`asn1js` is a peer dependency: pkijs and your application must use the same copy (see below).

## Breaking Changes In v4

v4 is ESM-only and requires Node.js `^20.19.0 || >=22.12.0` (was `>=16.0.0`). CommonJS code can still `require("pkijs")` on these versions; Node.js 22.0–22.11 can't. The exported API is unchanged, but some input handling changed with the move from `pvutils`/`pvtsutils` to `@peculiar/utils` (last three items).

- **TypeScript compiling to CommonJS:** use `"module": "node20"` or `"nodenext"` (`node16` fails with TS1479). ESM and bundler setups need no changes.
- **Jest in CommonJS mode:** switch to ESM mode or Vitest, or configure an ESM-to-CommonJS transformer and make sure `transformIgnorePatterns` doesn't exclude `pkijs` and its ESM dependencies (`asn1js`, `bytestreamjs`, `@peculiar/utils`, `@noble/hashes`).
- **Deep imports** (`pkijs/build/index.js`, `pkijs/build/index.es.js`) are blocked by `exports`; import from `pkijs`.
- **asn1js 4 is a peer dependency** (v3 depended on asn1js 3), and `bytestreamjs` moves to 3. Install `asn1js@^4` next to pkijs. pkijs checks `instanceof asn1js.Sequence` and similar on values you pass in, so they must come from the same asn1js copy as pkijs's: values built with asn1js 3 fail those checks. Upgrade other libraries that still depend on asn1js 3 (such as `@peculiar/asn1-schema` 2) at the same time.
- **Stricter base64:** `RSAPublicKey` and `ECPublicKey` `fromJSON()` throw a `TypeError` when a JWK member isn't base64url (padding is still accepted), and `SignedCertificateTimestamp#verify()` throws one when the log `key` isn't base64. v3 decoded such text into wrong bytes or failed later with an `AsnError`. `RSAPublicKey.fromJSON()` also decodes `n` and `e` exactly: v3 turned `e` = 3 into 196608, cut longer exponents to 3 bytes, and kept a trailing zero byte on some modulus lengths.
- **SCT timestamps:** `SignedCertificateTimestamp` `toStream()`, `toSchema()` and `verify()` throw a `RangeError` for an invalid or pre-1970 `timestamp`; v3 wrote `0` or wrapped bytes.
- **Untyped input:** `PkiObject#toString()` accepts only `"hex"`, `"base64"` and `"base64url"` (v3 also took `"utf8"`, `"binary"` and `"utf16"`), and `new CertificateChainValidationEngine(null)` throws a `TypeError`, like the other constructors.

## Examples

### Certificates and Revocation

- [Create and validate an X.509 certificate](https://pkijs.org/docs/examples/certificates-and-revocation/create-and-validate-certificate)
- [Working with certificate requests](https://pkijs.org/docs/examples/certificates-and-revocation/working-with-certificate-requests)
- [Creating and parsing CRLs](https://pkijs.org/docs/examples/certificates-and-revocation/creating-and-parsing-CRLs)
- [Working with OCSP requests](https://pkijs.org/docs/examples/certificates-and-revocation/working-with-OCSP-requests)
- [Working with OCSP responses](https://pkijs.org/docs/examples/certificates-and-revocation/working-with-OCSP-responses)

### Signing and Encryption with CMS

- [Working with CMS Signing](https://pkijs.org/docs/examples/signing-and-encryption-with-CMS/working-with-CMS-signing)
- [Working with CMS Certificate-based Encryption](https://pkijs.org/docs/examples/signing-and-encryption-with-CMS/working-with-CMS-certificate-based-encryption)
- [Working with CMS password-based Encryption](https://pkijs.org/docs/examples/signing-and-encryption-with-CMS/working-with-CMS-password-based-encryption)
- [Working with PKCS#7 Certificate bags (P7B)](https://pkijs.org/docs/examples/signing-and-encryption-with-CMS/working-with-PKCS-7-certificate-bags-P7B)

### Timestamping

- [Creating a Timestamp request](https://pkijs.org/docs/examples/timestamping/creating-a-timestamp-request)
- [Creating a Timestamp response](https://pkijs.org/docs/examples/timestamping/creating-a-timestamp-response)

### Other

- [How to verify a signature in a PDF file](https://pkijs.org/docs/examples/other/how-to-verify-a-signature-in-a-PDF-file)
- [S/MIME signature verification](https://pkijs.org/docs/examples/other/S-MIME-signature-verification)
- [S/MIME signature encryption](https://pkijs.org/docs/examples/other/S-MIME-signature-encryption)
- [Working with PKCS#12 files](https://pkijs.org/docs/examples/other/working-with-PKCS-12-files)

## Documentation

You can find the PKI.js documentation [on the website](https://pkijs.org/docs/installation).

## Want to help?

Want to file a bug, contribute some code, or improve documentation? Excellent! See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, commit conventions and the release flow.

## Core Contributors

[Stepan Miroshin](https://github.com/microshine)
