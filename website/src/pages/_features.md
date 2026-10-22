<li>

#### Certificates and requests

Create, parse, sign, and verify X.509 certificates ([RFC 5280](https://datatracker.ietf.org/doc/html/rfc5280)) and PKCS#10 certificate requests ([RFC 2986](https://datatracker.ietf.org/doc/html/rfc2986)), with typed classes for the standard extensions.

</li>

<li>

#### Chain validation and revocation

Build and validate certificate chains against your trusted roots, checking revocation with CRLs ([RFC 5280](https://datatracker.ietf.org/doc/html/rfc5280)) and OCSP responses ([RFC 6960](https://datatracker.ietf.org/doc/html/rfc6960)), which PKIjs can also create and parse.

</li>

<li>

#### Signing with CMS

Sign and verify data with Cryptographic Message Syntax ([RFC 5652](https://datatracker.ietf.org/doc/html/rfc5652)), with attached or detached content and signed attributes. CMS is the basis of S/MIME, signed PDFs, and code signing.

</li>

<li>

#### Encryption with CMS

Encrypt and decrypt CMS enveloped data for certificate holders (RSA-OAEP or ECDH), with a shared key, or with a password, using AES-CBC or AES-GCM.

</li>

<li>

#### Timestamping

Create and verify Time-Stamp Protocol ([RFC 3161](https://datatracker.ietf.org/doc/html/rfc3161)) requests and responses, which prove that data existed before a given time and keep signatures verifiable long after certificates expire.

</li>

<li>

#### PKCS#12 and private keys

Create and parse PKCS#12 (PFX) files ([RFC 7292](https://datatracker.ietf.org/doc/html/rfc7292)) protected with passwords or certificates, and PKCS#8 private keys ([RFC 5208](https://datatracker.ietf.org/doc/html/rfc5208)).

</li>
