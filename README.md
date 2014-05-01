# PKI.js

Public Key Infrastructure (PKI) is the basis of how identity and key management is performed on the web today. PKI.js is a pure JavaScript library implementing the formats that are used in PKI applications. It is built on WebCrypto (and PolyCrypt at this time) and aspires to make it possible to build native web applications that utilize X.509 and the related formats on the web without plug-ins.

## Introduction

[PKIjs][] library made in order to help people deal with (sometimes) complecated world of PKI-related data. For the moment it is quite easy to create a simple signature but hard to create PKCS#7 output file. Easy to read X.509 certificate from disc but hard to get internal certificate values. [PKIjs][] library will help everyone in all above case and in many-many others. [PKIjs][] has a layered internal structure and could be easily extended by a user. There are many examples of using [PKIjs][] and amount of examples will grow.

## Numbers behind the library

* More than 10 000 lines of code and comments;
* More than 50 specialized pre-defined ASN.1 schemas;
* More than 50 specialized "helpers" working with almost all internal data (for example "GeneralName" type, all X.509 certificate extensions types, "revoked certificates" type etc.);
* All that you need to work with all four major parts of PKI: X.509 data, CMS data, OCSP data, Time-stamping data;

## Features of the library

* Fully object-oriented library. Inhiritence is using everywhere inside the lib;
* Working with HTML5 data objects (ArrayBuffer, Uint8Array, Promises, WebCrypto etc.); 
* Has a greate helpers for all neccessary types like:
  * GeneralName;
  * RelativeDistinguishedName;
  * Time;
  * AlgorithmIdentifier;
  * All types of ASN.1 strings, including "international" like UniversalString, UTF8String and BMPString (with help from [ASN1js][]);
  * All extension types of X.509 certificates (BasicConstraints, CertificatePolicies, AuthorityKeyIdentifier etc.);
  * All "support types" for OCSP requests and responces;
  * All "support types" for Time-Stamping Protocol (TSP) requests and responces;
* Working with all major PKI-related types ("minor" types are not mentioned here but there are huge number of such "minor types"):
  * X.509 certificates;
    * Parsing internal values;
    * Getting/setting any internal values;
    * Creatiion of a new X.509 certificate "from scratch";
    * Internal certificate chain validation engine;
  * X.509 "certificate revocation lists" (CRLs);
    * Parsing internal values;
    * Getting/setting any internal values;
    * Creation of a new CRL "from scratch";
    * Validation of CRL signature;
    * Search inside CRL for specific revoked certificate;
  * PKCS#10 certificate request;
    * Parsing internal values;
    * Getting/setting any internal values;
    * Creation of a new PKCS#10 certificate request "from scratch";
    * Validation of PKCS#10 signature;
  * OCSP request;
    * Parsing internal values;
    * Getting/setting any internal values;
    * Creation of a new OCSP request "from scratch";
  * OCSP response;
    * Parsing internal values;
    * Getting/setting any internal values;
    * Creation of a new OCSP response "from scratch";
    * Validation of OCSP response signature;
  * Time-stamping request;
    * Parsing internal values;
    * Getting/setting any internal values;
    * Creation of a new Time-stamping request "from scratch";
    * Validation of Time-stamping request signature;
  * Time-stamping response;
    * Parsing internal values;
    * Getting/setting any internal values;
    * Creation of a new Time-stamping response "from scratch";
    * Validation of Time-stamping response signature;

## Examples

```
            // #region Parsing raw data as a X.509 certificate object
            var asn1 = org.pkijs.fromBER(buffer);
            var cert_simpl = new org.pkijs.simpl.CERT({ schema: asn1.result });
            // #endregion
```

```
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

            cert_simpl.signatureAlgorithm.algorithm_id = "1.2.840.113549.1.1.5"; // RSA + SHA-1
            cert_simpl.signature.algorithm_id = cert_simpl.signatureAlgorithm.algorithm_id; // Must be the same value
            // #endregion 
```

```
        // #region Creation of a new CMS Signed Data 
        cms_signed_simpl = new org.pkijs.simpl.CMS_SIGNED_DATA({
            digestAlgorithms: [
                new org.pkijs.simpl.ALGORITHM_IDENTIFIER({ algorithm_id: "1.3.14.3.2.26" }) // SHA-1
            ],
            encapContentInfo: new org.pkijs.simpl.cms.EncapsulatedContentInfo({
                eContentType: "1.2.840.113549.1.7.1", // "data" content type
                eContent: new org.pkijs.asn1.OCTETSTRING({ value_hex: buffer })
            }),
            signerInfos: [
                new org.pkijs.simpl.CMS_SIGNER_INFO({
                    sid: new org.pkijs.simpl.cms.IssuerAndSerialNumber({
                        issuer: cert_simpl.issuer,
                        serialNumber: cert_simpl.serialNumber
                    }),
                    digestAlgorithm: new org.pkijs.simpl.ALGORITHM_IDENTIFIER({ algorithm_id: "1.3.14.3.2.26" }), // SHA-1
                    signatureAlgorithm: new org.pkijs.simpl.ALGORITHM_IDENTIFIER({ algorithm_id: "1.2.840.113549.1.1.5" }), // RSA + SHA-1
                })
            ],
            certificates: [cert_simpl]
        });

        return cms_signed_simpl.sign(privateKey, 0);
        // #endregion 

```

## Limitations

* Currently (April 2014) there is no support for PKCS#12 data, coming soon;
* Currently (April 2014) there is no full support for CMS Enveloped Data. The data type can be parsed and encoded back to binary data, but there is no functions working with key agreement and encryption. Coming soon;

## License

Copyright (c) 2014, [GMO GlobalSign](http://www.globalsign.com/)
All rights reserved.

Author 2014, [Yury Strozhevsky](http://www.strozhevsky.com/).

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