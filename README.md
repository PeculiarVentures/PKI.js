# PKIjs

[![License](https://img.shields.io/badge/license-BSD-green.svg?style=flat)](https://github.com/PeculiarVentures/PKI.js/blob/master/LICENSE)
[![CircleCI](https://circleci.com/gh/PeculiarVentures/PKI.js/tree/master.svg?style=svg)](https://circleci.com/gh/PeculiarVentures/PKI.js/tree/master)
 [![Known Vulnerabilities](https://snyk.io/test/github/PeculiarVentures/PKI.js/badge.svg)](https://snyk.io/test/github/PeculiarVentures/PKI.js) [![Coverage Status](https://coveralls.io/repos/github/PeculiarVentures/PKI.js/badge.svg)](https://coveralls.io/github/PeculiarVentures/PKI.js)

[![NPM](https://nodei.co/npm/pkijs.png?downloads=true&downloadRank=true)](https://nodei.co/npm/pkijs/)

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
- Work uniformly both in browser and in Node/Dino

## Installation

To install the stable version:

```bash
npm install --save pkijs
```

This assumes you are using [npm](https://www.npmjs.com/) as your package manager.


## Examples

### Certificates and Revocation

- [Create and validate an X.509 certificate](https://pkijs.org/examples/X509_cert_complex_example.html)
- [Working with certificate requests](https://pkijs.org/examples/PKCS10_complex_example.html)
- [Creating and parsing CRLs](https://pkijs.org/examples/CRL_complex_example.html)
- [Working with OCSP requests](https://pkijs.org/examples/OCSP_req_complex_example.html)
- [Working with OCSP responses](https://pkijs.org/examples/OCSP_resp_complex_example.html)

### Signing and Encryption with CMS

- [Working with CMS Signing](https://pkijs.org/examples/CMSSigned_complex_example.html)
- [Working with CMS Certificate-based Encryption](https://pkijs.org/examples/CMSEnvelopedExample.html)
- [Working with CMS password-based Encryption](https://pkijs.org/examples/CMSEnvelopedPreDefineDataExample.html)
- [Working with PKCS#7 Certificate bags (P7B)](https://pkijs.org/examples/P7BSimpleExample.html)

### Timestamping
- [Creating a Timestamp request](https://pkijs.org/examples/TSP_req_complex_example.html)
- [Creating a Timestamp response](https://pkijs.org/examples/TSP_resp_complex_example.html)

### Other
- [How to verify a signature in a PDF file](https://pkijs.org/examples/PDFexample.html)
- [S/MIME signature verification](https://pkijs.org/examples/SMIMEexample.html)
- [S/MIME signature encryption](https://pkijs.org/examples/SMIMEEncryptionExample.html)
- [Working with PKCS#12 files](https://pkijs.org/examples/PKCS12SimpleExample.html)

## Documentation
You can find the PKI.js documentation [on the website](https://pkijs.org/docs).

## Want to help?
Want to file a bug, contribute some code, or improve documentation? Excellent! Read up on our guidelines for [contribution](https://github.com/PeculiarVentures/PKI.js/blob/master/CONTRIBUTING.md).

## Core Contributors
[Stepan Miroshin](https://github.com/microshine)
