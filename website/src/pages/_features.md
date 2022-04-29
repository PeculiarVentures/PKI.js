<li>

#### Certificates

The creation and validation of X.509 certificates ([RFC 5280](https://datatracker.ietf.org/doc/html/rfc5280)) is used by all certificate-enabled applications.

</li>

<li>

#### Enrollment

PKCS#10 ([RFC 2986](https://datatracker.ietf.org/doc/html/rfc2986)) is the most commonly used enrollment data structure used by X.509 applications. It enables the requestor to prove control of a given public key.

</li>

<li>

#### Signing

Cryptographic Message Syntax ([RFC 5652](https://datatracker.ietf.org/doc/html/rfc5652)) is the most commonly used data structure for signing data in X.509 applications. CMS makes it easy to both sign and represent all of the data needed to verify a signature.

</li>

<li>

#### Encryption

Cryptographic Message Syntax ([RFC 5652](https://datatracker.ietf.org/doc/html/rfc5652)) is also the most commonly used data structure for encrypting data in X.509 applications. CMS makes it easy to provide interoperable data encryption.

</li>

<li>

#### Timestamping

Time-Stamp Protocol ([RFC 3161](https://www.ietf.org/rfc/rfc3161.txt)) is the most commonly used protocol for proving that data existed before a particular time. It is commonly used in signing applications to ensure signatures are verifiable long into the future.

</li>