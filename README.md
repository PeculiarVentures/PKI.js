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

Full detailed information about all PKI.js features could be found [_**in separate file**_](FEATURES.md).
Description of PKI.js code structure could be found [_**in separate file**_](https://github.com/PeculiarVentures/PKI.js/tree/master/src/README.md).

## Important Information for PKI.js V1 Users
PKI.js V2 (ES2015 version) is **incompatible** with PKI.js V1 code. In order to make it easier to move from PKIjs V1 code to PKIjs V2 code we made a file that provides a [_**mapping**_](MAPPING.md) between old and new class names.

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

Currently there is a posibility to use ES6 modules directly from Web pages, without any transpilations (Babel, Rollup etc.). In order to do this all used files must point to direct or relative names and should be achivable via browser. Almost all moder browsers would support the "native ES6 modules". You could check [_**this link to caniuse site**_](https://caniuse.com/#feat=es6-module) for current status.
 
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



