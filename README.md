# PKIjs

[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://raw.githubusercontent.com/PeculiarVentures/pki.js/master/LICENSE)  [![NPM version](https://badge.fury.io/js/pkijs.svg)](http://badge.fury.io/js/pkijs)  [![CircleCI](https://circleci.com/gh/PeculiarVentures/PKI.js.svg?style=svg)](https://circleci.com/gh/PeculiarVentures/PKI.js) [![Known Vulnerabilities](https://snyk.io/test/github/PeculiarVentures/PKI.js/badge.svg)](https://snyk.io/test/github/PeculiarVentures/PKI.js)

[![NPM](https://nodei.co/npm-dl/pkijs.png?months=3&height=2)](https://nodei.co/npm/pkijs/)



Public Key Infrastructure (PKI) is the basis of how identity and key management is performed on the web today. PKIjs is a pure JavaScript library implementing the formats that are used in PKI applications. It is built on WebCrypto ([Web Cryptography API](http://www.w3.org/TR/WebCryptoAPI/)) and aspires to make it possible to build native web applications that utilize X.509 and the related formats on the web without plug-ins.

New version of the PKIjs based on using ES6 (ES2015) and was designed with these aims in mind:

* Most modern language environment using all ES6 features;
* Simplification of usage PKIjs inside Node.je environment;
* Ability to use only that parts of library code which are needed in user environment (minification of used code);
* Increasing level of documentation inside library;
* Ability to transpline library code into ES5 code;
* Enterprise-level quality of code and testing;

In the new version of library we have some new features:

* New version of "certificate chaing verification engine" passed almost all tests from NIST PKITS. Tests are also shipped with the library;
* Internal "WebCrypto shim" making it possible to work with "spki/pkcs8" formats in any environment;
* Internal realization of special routine working with ES2015 generators;

Full detailed information about all PKI.js features could be found [in separate file](FEATURES.md).
Description of PKI.js code structure could be found [in separate file](https://github.com/PeculiarVentures/PKI.js/tree/master/src/README.md).

## Important Information for PKI.js V1 Users
PKI.js V2 (ES2015 version) is **incompatible** with PKI.js V1 code. In order to make it easier to move from PKIjs V1 code to PKIjs V2 code we made a file that provides a [mapping](MAPPING.md) between old and new class names.

## Examples

### Parse a X.509 certificate

```javascript
    //region Parsing raw data as a X.509 certificate object
    const asn1 = asn1js.fromBER(buffer);
    const certificate = new Certificate({ schema: asn1.result });
    //endregion
```

### Create a X.509 certificate

```javascript
    //region Creation of a new X.509 certificate
    certificate.serialNumber = new asn1js.Integer({ value: 1 });
    certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
        type: "2.5.4.6", // Country name
        value: new asn1js.PrintableString({ value: "RU" })
    }));
    certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
        type: "2.5.4.3", // Common name
        value: new asn1js.PrintableString({ value: "Test" })
    }));
    certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
        type: "2.5.4.6", // Country name
        value: new asn1js.PrintableString({ value: "RU" })
    }));
    certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
        type: "2.5.4.3", // Common name
        value: new asn1js.PrintableString({ value: "Test" })
    }));

    certificate.notBefore.value = new Date(2013, 1, 1);
    certificate.notAfter.value = new Date(2016, 1, 1);

    certificate.extensions = new Array(); // Extensions are not a part of certificate by default, it's an optional array

    //region "BasicConstraints" extension
    var basicConstr = new BasicConstraints({
        cA: true,
        pathLenConstraint: 3
    });

    certificate.extensions.push(new Extension({
        extnID: "2.5.29.19",
        critical: false,
        extnValue: basicConstr.toSchema().toBER(false),
        parsedValue: basicConstr // Parsed value for well-known extensions
    }));
    //endregion

    //region "KeyUsage" extension
    var bitArray = new ArrayBuffer(1);
    var bitView = new Uint8Array(bitArray);

    bitView[0] = bitView[0] | 0x02; // Key usage "cRLSign" flag
    bitView[0] = bitView[0] | 0x04; // Key usage "keyCertSign" flag

    var keyUsage = new asn1js.BitString({ valueHex: bitArray });

    certificate.extensions.push(new Extension({
        extnID: "2.5.29.15",
        critical: false,
        extnValue: keyUsage.toBER(false),
        parsedValue: keyUsage // Parsed value for well-known extensions
    }));
    //endregion
    //endregion
```

### Create signed CMS message

```javascript
    //region Creation of a new CMS Signed Data
    cmsSigned = new SignedData({
        encapContentInfo: new EncapsulatedContentInfo({
            eContentType: "1.2.840.113549.1.7.1", // "data" content type
            eContent: new asn1js.OctetString({ value_hex: buffer })
        }),
        signerInfos: [
            new SignerInfo({
                sid: new IssuerAndSerialNumber({
                    issuer: certificate.issuer,
                    serialNumber: certificate.serialNumber
                })
            })
        ],
        certificates: [certificate]
    });

    return cms_signed_simpl.sign(privateKey, 0, hashAlgorithm);
    //endregion

```

More examples could be found in [**examples**](https://github.com/PeculiarVentures/PKI.js/tree/master/examples) folder. To run these samples you must compile them, for example you would run:

```
npm install
npm run build:examples
```

Live examples can be found at [pkijs.org](https://pkijs.org).

## Limitations

* Safari, Edge, and IE do not have complete, or correct implementations of Web Crypto. To work around these limitations you will probably need [`webcrypto-liner`](https://github.com/PeculiarVentures/webcrypto-liner/).
* You can check the capabilities of your browser's Web Crypto implementation [here](https://peculiarventures.github.io/pv-webcrypto-tests/).
* Web Crypto support in browsers is always improving. Please check [this page](http://caniuse.com/#feat=cryptography) for information about Web Cryptography API browser support.

## Suitability
There are several commercial products, enterprise solitions as well as open source project based on versions of PKIjs. You should, however, do your own code and security review before utilization in a production application before utilizing any open source library to ensure it will meet your needs.

## Bug Reporting
Please report bugs either as pull requests or as issues in the issue tracker. PKIjs has a full disclosure vulnerability policy. Please do NOT attempt to report any security vulnerability in this code privately to anybody.

## Related source code

* [ASN1js project](https://github.com/PeculiarVentures/ASN1.js) - in fact [PKIjs][] will not work without [ASN1js][], it's neccessary part of the [PKIjs][] project;
* [C++ ASN1:2008 BER coder/decoder](https://github.com/YuryStrozhevsky/C-plus-plus-ASN.1-2008-coder-decoder) - the "father" of [ASN1js][] project;
* [Freely available ASN.1:2008 test suite](https://github.com/YuryStrozhevsky/ASN1-2008-free-test-suite) - the suite which can help you to validate (and better understand) any ASN.1 coder/decoder;

## License

Copyright (c) 2016-2018, [Peculiar Ventures](http://peculiarventures.com/)
All rights reserved.

Author 2016-2018 [Yury Strozhevsky](http://www.strozhevsky.com/).

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


## Cryptography Notice

This distribution includes cryptographic software. The country in which you currently reside may have restrictions on the import, possession, use, and/or re-export to another country, of encryption software.
BEFORE using any encryption software, please check your country's laws, regulations and policies concerning the import, possession, or use, and re-export of encryption software, to see if this is permitted.
See <http://www.wassenaar.org/> for more information.

The U.S. Government Department of Commerce, Bureau of Industry and Security (BIS), has classified this software as Export Commodity Control Number (ECCN) 5D002.C.1, which includes information security software using or performing cryptographic functions with asymmetric algorithms.
The form and manner of this distribution makes it eligible for export under the License Exception ENC Technology Software Unrestricted (TSU) exception (see the BIS Export Administration Regulations, Section 740.13) for both object code and source code.



