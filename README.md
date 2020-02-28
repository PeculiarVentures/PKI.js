# PKIjs

[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://github.com/PeculiarVentures/PKI.js/blob/master/LICENSE) 
[![CircleCI](https://circleci.com/gh/PeculiarVentures/PKI.js/tree/master.svg?style=svg)](https://circleci.com/gh/PeculiarVentures/PKI.js/tree/master)
 [![Known Vulnerabilities](https://snyk.io/test/github/PeculiarVentures/PKI.js/badge.svg)](https://snyk.io/test/github/PeculiarVentures/PKI.js) [![Coverage Status](https://coveralls.io/repos/github/PeculiarVentures/PKI.js/badge.svg)](https://coveralls.io/github/PeculiarVentures/PKI.js) 


[![NPM](https://nodei.co/npm/pkijs.png?downloads=true&downloadRank=true)](https://nodei.co/npm/pkijs/)



Public Key Infrastructure (PKI) is the basis of how identity and key management is performed on the web today. PKIjs is a pure JavaScript library implementing the formats that are used in PKI applications. It is built on WebCrypto ([_**Web Cryptography API**_](http://www.w3.org/TR/WebCryptoAPI/)) and aspires to make it possible to build native web applications that utilize X.509 and the related formats on the web without plug-ins.

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

## Features And Additional information
<details>
<summary>Feature List of PKI.js</summary>

* First "crypto-related" library completely written on ES6 (ES2015);
* First and **ONLY** open-source JS library with full support for all "Suite B" algorithms in CMS messages;
* First library with support for CMS Enveloped data (encrypt/decrypt) in pure JavaScript + Web Cryptography API;
* Fully object-oriented. Inheritence is used everywhere in the lib;
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
</details>


Description of PKI.js code structure could be found [_**in separate file**_](https://github.com/PeculiarVentures/PKI.js/blob/master/src/README.MD).

## Important Information for PKI.js V1 Users

PKI.js V2 (ES2015 version) is **incompatible** with PKI.js V1 code. In order to make it easier to move from PKIjs V1 code to PKIjs V2 code we made a file that provides a [_**mapping**_](MAPPING.md) between old and new class names.

## Information about PKIjs internal structure

First of all a few words about what the PKI itself is. The PKI is a set of many related RFCs (Request For Comment, [_**https://www.ietf.org/standards/rfcs/**_](https://www.ietf.org/standards/rfcs/)). All PKI data initially are in binary format, called ASN.1. Each ASN.1 PKI-related structure has its "ASN.1 schema" - textual representation in ASN.1 notation language. Inside PKI documentation you would find something like this (example from RFC5280):
```asn1
Certificate  ::=  SEQUENCE  {
    tbsCertificate       TBSCertificate,
    signatureAlgorithm   AlgorithmIdentifier,
    signatureValue       BIT STRING  }
```
 
The PKIjs library is a set of "helpers", providing you easy access to necessary internal structures. Each PKIjs class is a direct "mirror" (in most cases) of ASN.1 structure, defined in related RFC. So, assume we have this ASN.1 structure representation (example from RFC5280):
```asn1
AccessDescription  ::=  SEQUENCE {
       accessMethod          OBJECT IDENTIFIER,
       accessLocation        GeneralName  }
```
Then inside PKIjs you would have class `AccessDescription` with properties `accessMethod` and `accessLocation`. Description of each property of such data you could find in related RFC. Each class has a link to the RFC the definition came from right before definition of the PKIjs class - `Class from RFC5280`, for example. Full table with links between PKIjs classes and related RFC you could find [_**here**_](https://github.com/PeculiarVentures/PKI.js/blob/master/src/README.MD).

Each PKIjs class has these common functions:
* `constructor` - Standard constructor for each class. Common for any ES6 class. Has `parameters` parameter having `Object` type. So, any PKIjs class could be initialized using this call `new <class>({ propertyName1: value1, propertyName2: value2 })`. Also constructor could be called in order to initialize PKIjs class from _**[ASN1js]**_ internal data (schema) - `new <class>({ schema: schemaData })`;
* `defaultValues` - Static function. It is a common source of default values (pre-defined constants), specific for this particular class;
* `schema` - Static function. The function returns pre-defined ASN.1 schema for this particular class. Usually using in call to `asn1js.compareSchema` function;
* `fromSchema` - Major function initializing internal PKIjs class data from input _**[ASN1js]**_ internal data;
* `toSchema` - Major function producing _**[ASN1js]**_ internal data from PKIjs class data;
* `toJSON` - Standard function producing JSON representation of each class. Usually using indirectly during call to `JSON.stringify(<PKIjs class>)`;  

In some complicated case PKIjs class could have additional functions, specific only for this particular class. For example, `sign`, `verify` etc.

So, here is step-by-step description on how PKIjs parses binary PKI structures:
1) Binary data parsed via _**[ASN1js]**_ package (`asn1js.fromBER` function). Outcome from this step is _**[ASN1js]**_ internal classes;
2) In order to produce a "helper" user need to provide data from step #1 to specific class of PKIjs to function `<class>.fromSchema` (for example `Certificate.fromSchema`). Usually code will looks like `const cert = new Certificate({ schema: asn1.result })` - this code internally would call `Certificate.fromSchema` function;
3) Inside `fromSchema` function PKIjs class would parse _**[ASN1js]**_ internal structures and produce easy to access class properties. Also in `fromSchema` PKIjs compare input ASN.1 structure with how it should like (compare with pre-defined ASN.1 schema); 

So, usually user would use this code snippet:
```javascript
const asn1 = asn1js.fromBER(binaryData);
if(asn1.offset === (-1))
	alert("Can not parse binary data");

const certificate = new Certificate({ schema: asn1.result });
```

Here is step-by-step description on how PKIjs class data converts back to binary representation:
1) User need to convert PKIjs class to _**[ASN1js]**_ internal class. In order to do this user need to call `<class>.toSchema` function;
2) As a result from step #1 we would have _**[ASN1js]**_ structures. And each of _**[ASN1js]**_ structure has its class member `toBER` - this function would return binary represenmtation of _**[ASN1js]**_ structure as ArrayBuffer;

So, usually user would use this code snippet:
```javascript
const certificateBinary = certificate.toSchema().toBER(false);
```

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

    certificate.extensions = []; // Extensions are not a part of certificate by default, it's an optional array

    //region "BasicConstraints" extension
    const basicConstr = new BasicConstraints({
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
    const bitArray = new ArrayBuffer(1);
    const bitView = new Uint8Array(bitArray);

    bitView[0] |= 0x02; // Key usage "cRLSign" flag
    bitView[0] |= 0x04; // Key usage "keyCertSign" flag

    const keyUsage = new asn1js.BitString({ valueHex: bitArray });

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
            eContent: new asn1js.OctetString({ valueHex: buffer })
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

    return cmsSigned.sign(privateKey, 0, hashAlgorithm);
    //endregion

```

### Use in Node.js

At the moment PKI.js code is compiled for Node v6 version. But in fact initially PKI.js code is a pure ES6 code and you could build it for any Node version by changing [_**this line**_](https://github.com/PeculiarVentures/PKI.js/blob/master/.babelrc#L8) and run `npm run build` again.

_**WARNING**_: if you would try to build PKI.js code for Node version <= 4 then you would need to have `require("babel-polyfill")` once per entire project.

```javascript
    //require("babel-polyfill"); // Would be required only if you compiled PKI.js for Node <= v4
    const asn1js = require("asn1js");
    const pkijs = require("pkijs");
    const Certificate = pkijs.Certificate;

    const buffer = new Uint8Array([
        // ... cert hex bytes ...
    ]).buffer;

    const asn1 = asn1js.fromBER(buffer);
    const certificate = new Certificate({ schema: asn1.result });
```

### How to use PKI.js ES6 files directly in browser

Currently there is a posibility to use ES6 modules directly from Web pages, without any transpilations (Babel, Rollup etc.). In order to do this all used files must point to direct or relative names and should be achievable via browser. Almost all modern browsers would support the "native ES6 modules". You could check [_**this link to caniuse site**_](https://caniuse.com/#feat=es6-module) for current status.
 
You could check [_**full-featured example here**_](https://github.com/PeculiarVentures/PKI.js/tree/master/examples/HowToUseES6DirectlyInBrowser). And please carefully read [_**this README**_](https://github.com/PeculiarVentures/PKI.js/tree/master/examples/HowToUseES6DirectlyInBrowser/README.md) before run it.
 
You could use PKI.js code by this way, but before you need to perform some additional steps:
- Replace all occurences of `import * as asn1js from "asn1js"` and `import { <something> } from "pvutils"` inside `pkijs/src` directory with correct paths to `asn1js` and `pvutils` files. Usually you would have something like `import * as asn1js from "../../asn1js/src/asn1.js"` and `import { <something> } from "./pvutils/src/utils.js"`. Correct paths depends on your project structure. Also you would need to replace path to `pvutils` inside used `asn1js/src/asn1.js` file. How to replace - usually it is done via `sed "s/<what_to_find>/<replacement>/g" *` inside target directory;
- Make a correct main ES6 file (initial application). It could be not a separate ES6 file, but a script on your page, but anyway it must has exports inside `windows` namespace in order to communicate with Web page:
```javascript
window.handleFileBrowseParseEncrypted = handleFileBrowseParseEncrypted;
window.handleFileBrowseCreateEncrypted = handleFileBrowseCreateEncrypted;
```
- Next part is your main Web page. In short, it should looks like this one:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Testing</title>

    <script type="module" src="es6.js"></script>

    <script>
        function onload()
        {
	        document.getElementById('parseEncrypted').addEventListener('change', handleFileBrowseParseEncrypted, false);
	        document.getElementById('createEncrypted').addEventListener('change', handleFileBrowseCreateEncrypted, false);
        }
    </script>
</head>
<body onload="onload()">
    <p>
        <label for="parseEncrypted">PDF file to parse:</label>
        <input type="file" id="parseEncrypted" title="Input file for parsing" />
    </p>
    <p>
        <label for="createEncrypted">PDF file to create encrypted:</label>
        <input type="file" id="createEncrypted" title="Input file for making encrypted" />
    </p>
</body>
</html>
```
- Now you need to run your application as Node.js application. It is necessary just because modern CORS would prevent you from loading files from local filesystem;

OK, now you are ready to launch your favorite Node.js Web Server and have fun with direct links to your wounderful PKI.js application! You could check [_**full-featured example here**_](). And please carefully read [_**this README**_]() before run it.

### More examples

More examples could be found in [_**examples**_](https://github.com/PeculiarVentures/PKI.js/tree/master/examples) folder. To run these samples you must compile them, for example you would run:

```command
npm install
npm run build:examples
```

Live examples can be found at [_**pkijs.org**_](https://pkijs.org).

## Tests using Node environment

_**WARNING:**_ 

**!!!** in order to test PKIjs in Node environment you would need to install additional package `node-webcrypto-ossl` **!!!**

The `node-webcrypto-ossl` is not referenced in PKIjs dependencies anymore because we were noticed users have a problems with the package installation, especially on Windows platform.

The `node-webcrypto-ossl` is NOT a mandatory for testing PKIjs - you could visit `test/browser` subdir and run all the same tests in your favorite browser.

Also you could check [_**CircleCI**_](https://circleci.com/gh/PeculiarVentures/PKI.js) - for each build the service runs all tests and results could be easily observed.

If you do need to run PKIjs tests locally using Node please use
```command
npm run build:examples
npm run test:node
```

## Limitations

* Safari, Edge, and IE do not have complete, or correct implementations of Web Crypto. To work around these limitations you will probably need [_**webcrypto-liner**_](https://github.com/PeculiarVentures/webcrypto-liner/).
* You can check the capabilities of your browser's Web Crypto implementation [_**here**_](https://peculiarventures.github.io/pv-webcrypto-tests/).
* Web Crypto support in browsers is always improving. Please check [_**this page**_](http://caniuse.com/#feat=cryptography) for information about Web Cryptography API browser support.

## Suitability
There are several commercial products, enterprise solitions as well as open source project based on versions of PKIjs. You should, however, do your own code and security review before utilization in a production application before utilizing any open source library to ensure it will meet your needs.

## Bug Reporting
Please report bugs either as pull requests or as issues in the issue tracker. PKIjs has a full disclosure vulnerability policy. Please do NOT attempt to report any security vulnerability in this code privately to anybody.

## Related source code

* [_**ASN1js project**_](https://github.com/PeculiarVentures/ASN1.js) - in fact **[PKIjs][]** will not work without **[ASN1js][]**, it's neccessary part of the **[PKIjs][]** project;
* [_**C++ ASN1:2008 BER coder/decoder**_](https://github.com/YuryStrozhevsky/C-plus-plus-ASN.1-2008-coder-decoder) - the "father" of **[ASN1js][]** project;
* [_**Freely available ASN.1:2008 test suite**_](https://github.com/YuryStrozhevsky/ASN1-2008-free-test-suite) - the suite which can help you to validate (and better understand) any ASN.1 coder/decoder;

## License

*Copyright (c) 2016-2018, [_**Peculiar Ventures**_](http://peculiarventures.com/)* 
*All rights reserved.*

*Author 2014-2018 [_**Yury Strozhevsky**_](http://www.strozhevsky.com/).*

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

*THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT 
NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR 
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, 
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY 
OF SUCH DAMAGE.* 


[ASN.1]: http://en.wikipedia.org/wiki/Abstract_Syntax_Notation_One
[ASN1js]: http://asn1js.org/
[PKIjs]: http://pkijs.org/
[BER]: http://en.wikipedia.org/wiki/X.690#BER_encoding
[DER]: http://en.wikipedia.org/wiki/X.690#DER_encoding
[freely available ASN.1:2008 test suite]: http://www.strozhevsky.com/free_docs/free_asn1_testsuite_descr.pdf


## Cryptography Notice

This distribution includes cryptographic software. The country in which you currently reside may have restrictions on the import, possession, use, and/or re-export to another country, of encryption software.
BEFORE using any encryption software, please check your country's laws, regulations and policies concerning the import, possession, or use, and re-export of encryption software, to see if this is permitted.
See **<http://www.wassenaar.org/>** for more information.

The U.S. Government Department of Commerce, Bureau of Industry and Security (BIS), has classified this software as Export Commodity Control Number (ECCN) 5D002.C.1, which includes information security software using or performing cryptographic functions with asymmetric algorithms.
The form and manner of this distribution makes it eligible for export under the License Exception ENC Technology Software Unrestricted (TSU) exception (see the BIS Export Administration Regulations, Section 740.13) for both object code and source code.



