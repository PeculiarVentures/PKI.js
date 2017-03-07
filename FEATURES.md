## Overview

* More than 33 000 lines of code and comments ([PKIjs][url-pkijs] library + [ASN1js][url-asnjs] library).
* More than 90 specialized "helpers" working with almost all internal data (for example "GeneralName" type, all X.509 certificate extensions types, "revoked certificates" type, etc.).
* Everything that you need to work with all five major parts of PKI: X.509, PKCS#10, CMS, OCSP, Time-stamping.

## Features

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

[url-pkijs]: https://github.com/PeculiarVentures/PKI.js
[url-asnjs]: https://github.com/PeculiarVentures/ASN1.js