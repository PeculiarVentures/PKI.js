# PKIjs

[![license](https://img.shields.io/badge/license-BSD-green.svg?style=flat)](https://raw.githubusercontent.com/GlobalSign/PKI.js/master/LICENSE)

Public Key Infrastructure (PKI) is the basis of how identity and key management is performed on the web today. PKIjs is a pure JavaScript library implementing the formats that are used in PKI applications. It is built on WebCrypto ([Web Cryptography API](http://www.w3.org/TR/WebCryptoAPI/)) and aspires to make it possible to build native web applications that utilize X.509 and the related formats on the web without plug-ins.

## Introduction

[PKIjs][] is a library made in order to help people deal with (sometimes) complicated world of PKI-related data. For the moment it is quite easy to create a simple signature but hard to create PKCS#7 encoded signature. Easy to read a X.509 certificate but hard to parse values within it. [PKIjs][] library will help all web applications (and chrome plug-ins) acomplish these and many other things. [PKIjs][] was designed in such a way to make it easy to extended by users through a use of layered internal structures. There are [**many examples**](https://github.com/GlobalSign/PKI.js/tree/master/examples) of using [PKIjs][] and the number of examples will grow.

## Numbers behind the library

* More than 25 000 lines of code and comments ([PKIjs][] library + [ASN1js][] library).
* More than 50 specialized pre-defined ASN.1 schemas.
* More than 50 specialized "helpers" working with almost all internal data (for example "GeneralName" type, all X.509 certificate extensions types, "revoked certificates" type, etc.).
* Everything that you need to work with all five major parts of PKI: X.509, PKCS#10, CMS, OCSP, Time-stamping.

## Features of the library

* First and **ONLY** (April 2015) open-source JS library with full support for all "Suite B" algorithms in CMS messages;
* First library with support for CMS Enveloped data (encrypt/decrypt) in pure JavaScript + Web Cryptography API;
* Fully object-oriented library. Inhiritence is using everywhere inside the lib;
* Working with HTML5 data objects (ArrayBuffer, Uint8Array, Promises, Web Cryptography API, etc.);
* Has a complete set of helpers for working with types like:
  * GeneralName;
  * RelativeDistinguishedName;
  * Time;
  * AlgorithmIdentifier;
  * All types of ASN.1 strings, including "international" like UniversalString, UTF8String and BMPString (with help from [ASN1js][]);
  * All extension types of X.509 certificates (BasicConstraints, CertificatePolicies, AuthorityKeyIdentifier etc.);
  * All "support types" for OCSP requests and responces;
  * All "support types" for Time-Stamping Protocol (TSP) requests and responces;
* **Has own certification chain verification engine, built in pure JavaScript, with help from Promises and Web Cryptography API latest standard implementation;**
* Working with **all** Web Cryptography API signature algorithms:
  * RSASSA-PKCS1-v1_5;
  * RSA-PSS;
  * ECDSA;
* Working with **all** "Suite B" (and more) encryption algorithms and schemas:
  * RSASSA-OAEP + AES-KW + AES-CBC/GCM;
  * ECDH + KDF on SHA-1/256/384/512 + AES-KW + AES-CBC/GCM;
  * Pre-defined "key encryption key" + AES-KW + AES-CBC/GCM;
  * Password-based encryption for CMS with PBKDF2 on HMAC on SHA-1/256/384/512 + AES-KW + AES-CBC/GCM;
* Working with all major PKI-related types ("minor" types are not mentioned here but there are huge number of such "minor types"):
  * X.509 certificates:
    * Parsing internal values;
    * Getting/setting any internal values;
    * Creatiion of a new X.509 certificate "from scratch";
    * **Internal certificate chain validation engine**;
  * X.509 "certificate revocation lists" (CRLs):
    * Parsing internal values;
    * Getting/setting any internal values;
    * Creation of a new CRL "from scratch";
    * Validation of CRL signature;
    * Search inside CRL for specific revoked certificate.
  * PKCS#10 certificate request:
    * Parsing internal values;
    * Getting/setting any internal values;
    * Creation of a new PKCS#10 certificate request "from scratch";
    * Validation of PKCS#10 signature;
  * OCSP request:
    * Parsing internal values;
    * Getting/setting any internal values;
    * Creation of a new OCSP request "from scratch".
  * OCSP response:
    * Parsing internal values;
    * Getting/setting any internal values;
    * Creation of a new OCSP response "from scratch";
    * Validation of OCSP response signature.
  * Time-stamping request:
    * Parsing internal values;
    * Getting/setting any internal values;
    * Creation of a new Time-stamping request "from scratch";
    * Validation of Time-stamping request signature;
  * Time-stamping response:
    * Parsing internal values;
    * Getting/setting any internal values;
    * Creation of a new Time-stamping response "from scratch";
    * Validation of Time-stamping response signature
  * CMS Signed Data:
    * Parsing internal values;
    * Getting/setting any internal values;
    * Creation of a new CMS Signed Data "from scratch";
    * Validation of CMS Signed Data signature;
  * CMS Enveloped Data:
    * Parsing internal values;
    * Getting/setting any internal values;
    * Creation (encryption) with full support for "Suite B" algorithms and more;
    * Decryption with full support for "Suite B" algorithms and more;
  * CMS Encrypted Data:
    * Parsing internal values;
    * Getting/setting any internal values;
    * Creation (encryption) with password;
    * Decryption with password;
  * PKCS#12:
    * Parsing internal values;
    * Making any kind of internal values (SafeContexts/SafeBags) with any kind of parameters;

## Examples

```javascript
    // #region Parsing raw data as a X.509 certificate object
    var asn1 = org.pkijs.fromBER(buffer);
    var cert_simpl = new org.pkijs.simpl.CERT({ schema: asn1.result });
    // #endregion
```

```javascript
    // #region Creation of a new X.509 certificate
    cert_simpl.serialNumber = new org.pkijs.asn1.INTEGER({ value: 1 });
    cert_simpl.issuer.types_and_values.push(new org.pkijs.simpl.ATTR_TYPE_AND_VALUE({
        type: "2.5.4.6", // Country name
        value: new org.pkijs.asn1.PRINTABLESTRING({ value: "RU" })
    }));
    cert_simpl.issuer.types_and_values.push(new org.pkijs.simpl.ATTR_TYPE_AND_VALUE({
        type: "2.5.4.3", // Common name
        value: new org.pkijs.asn1.PRINTABLESTRING({ value: "Test" })
    }));
    cert_simpl.subject.types_and_values.push(new org.pkijs.simpl.ATTR_TYPE_AND_VALUE({
        type: "2.5.4.6", // Country name
        value: new org.pkijs.asn1.PRINTABLESTRING({ value: "RU" })
    }));
    cert_simpl.subject.types_and_values.push(new org.pkijs.simpl.ATTR_TYPE_AND_VALUE({
        type: "2.5.4.3", // Common name
        value: new org.pkijs.asn1.PRINTABLESTRING({ value: "Test" })
    }));

    cert_simpl.notBefore.value = new Date(2013, 01, 01);
    cert_simpl.notAfter.value = new Date(2016, 01, 01);

    cert_simpl.extensions = new Array(); // Extensions are not a part of certificate by default, it's an optional array

    // #region "BasicConstraints" extension
    var basic_constr = new org.pkijs.simpl.x509.BasicConstraints({
        cA: true,
        pathLenConstraint: 3
    });

    cert_simpl.extensions.push(new org.pkijs.simpl.EXTENSION({
        extnID: "2.5.29.19",
        critical: false,
        extnValue: basic_constr.toSchema().toBER(false),
        parsedValue: basic_constr // Parsed value for well-known extensions
    }));
    // #endregion 

    // #region "KeyUsage" extension 
    var bit_array = new ArrayBuffer(1);
    var bit_view = new Uint8Array(bit_array);

    bit_view[0] = bit_view[0] | 0x02; // Key usage "cRLSign" flag
    bit_view[0] = bit_view[0] | 0x04; // Key usage "keyCertSign" flag

    var key_usage = new org.pkijs.asn1.BITSTRING({ value_hex: bit_array });

    cert_simpl.extensions.push(new org.pkijs.simpl.EXTENSION({
        extnID: "2.5.29.15",
        critical: false,
        extnValue: key_usage.toBER(false),
        parsedValue: key_usage // Parsed value for well-known extensions
    }));
    // #endregion 
    // #endregion 
```

```javascript
    // #region Creation of a new CMS Signed Data 
    cms_signed_simpl = new org.pkijs.simpl.CMS_SIGNED_DATA({
        encapContentInfo: new org.pkijs.simpl.cms.EncapsulatedContentInfo({
            eContentType: "1.2.840.113549.1.7.1", // "data" content type
            eContent: new org.pkijs.asn1.OCTETSTRING({ value_hex: buffer })
        }),
        signerInfos: [
            new org.pkijs.simpl.CMS_SIGNER_INFO({
                sid: new org.pkijs.simpl.cms.IssuerAndSerialNumber({
                    issuer: cert_simpl.issuer,
                    serialNumber: cert_simpl.serialNumber
                })
            })
        ],
        certificates: [cert_simpl]
    });

        return cms_signed_simpl.sign(privateKey, 0, hashAlgorithm);
        // #endregion 

```

More examples could be found in [**"examples" folder**](https://github.com/GlobalSign/PKI.js/tree/master/examples). Live example can be found at [pkijs.org](https://pkijs.org).

## Limitations

* Does not work with Internet Explorer's implementation of Web Cryptography API it is based on a old draft and also does not support all needed capabilities.
* Does not work with PolyCrypt it is based on a old version of Web Cryptography API and is buggy.
* You can use [PKIjs][] in almost all browsers. Please check [this page](http://caniuse.com/#feat=cryptography) for information about Web Cryptography API browser support.

## Suitability
At this time this library should be considered suitable for research and experimentation, futher code and security review is needed before utilization in a production application.

## Bug Reporting
Please report bugs either as pull requests or as issues in the issue tracker. PKIjs has a full disclosure vulnerability policy. Please do NOT attempt to report any security vulnerability in this code privately to anybody.

## Related source code

* [ASN1js project](https://github.com/GlobalSign/ASN1.js) - in fact [PKIjs][] will not work without [ASN1js][], it's neccessary part of the [PKIjs][] project;
* [C++ ASN1:2008 BER coder/decoder](https://github.com/YuryStrozhevsky/C-plus-plus-ASN.1-2008-coder-decoder) - the "father" of [ASN1js][] project;
* [Freely available ASN.1:2008 test suite](https://github.com/YuryStrozhevsky/ASN1-2008-free-test-suite) - the suite which can help you to validate (and better understand) any ASN.1 coder/decoder;

## How to use PKIjs with Node.js

**!!! WARNING !!!**
**Currently there is no "polyfill" of Web Cryptography API in Node.js. Thus you will not be able to use signature / verification features of PKIjs in Node.js programs.**

In order to use PKIjs you will also need [ASN1js][] plus [node.extend](https://www.npmjs.com/package/node.extend) package.
```javascript
    var merge = require("node.extend");

    var common = require("asn1js/org/pkijs/common");
    var _asn1js = require("asn1js");
    var _pkijs = require("pkijs");
    var _x509schema = require("pkijs/org/pkijs/x509_schema");

    // #region Merging function/object declarations for ASN1js and PKIjs 
    var asn1js = merge(true, _asn1js, common);

    var x509schema = merge(true, _x509schema, asn1js);

    var pkijs_1 = merge(true, _pkijs, asn1js);
    var pkijs = merge(true, pkijs_1, x509schema);
    // #endregion 
```

After that you will ba able to use ASN1js and PKIjs via common way:
```javascript
    // #region Decode and parse X.509 cert 
    var asn1 = pkijs.org.pkijs.fromBER(certBuffer);
    var cert;
    try
    {
        cert = new pkijs.org.pkijs.simpl.CERT({ schema: asn1.result });
    }
    catch(ex)
    {
        return;
    }
    // #endregion 
```

## License

Copyright (c) 2014, [GMO GlobalSign](http://www.globalsign.com/)
Copyright (c) 2015, [Peculiar Ventures](http://peculiarventures.com/)
All rights reserved.

Author 2014-2015, [Yury Strozhevsky](http://www.strozhevsky.com/).

Redistribution and use in source and binary forms, with or without modification, 
are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, 
   this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, 
   this list of conditions and the following disclaimer in the documentation 
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors 
   may be used to endorse or promote products derived from this software without 
   specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT 
NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR 
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, 
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY 
OF SUCH DAMAGE. 


[ASN.1]: http://en.wikipedia.org/wiki/Abstract_Syntax_Notation_One
[ASN1js]: http://asn1js.org/
[PKIjs]: http://pkijs.org/
[BER]: http://en.wikipedia.org/wiki/X.690#BER_encoding
[DER]: http://en.wikipedia.org/wiki/X.690#DER_encoding
[freely available ASN.1:2008 test suite]: http://www.strozhevsky.com/free_docs/free_asn1_testsuite_descr.pdf
