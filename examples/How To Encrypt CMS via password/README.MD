# Working with CMS EnvelopedData

Working with with CMS Enveloped Data in PKIjs is done with the  **org.pkijs.simpl.CMS_ENVELOPED_DATA** object. Utilizing this object you can encode/encrypt a new CMS Enveloped Data message, decode/decrypt an existing one or add recipients to it. Additionally to make it easier for web developers to work with these messages it is also possible to translate the message to JSON.

## Encrypting
To create an encrypted message with PKIjs the first thing you must do is choose who you want to encrypt the message to. [PKIjs][] supports encrypting to recipients using the public keys in X.509 certificates as well as using preshared keys (KEK) or passwords.

To add a recipient to a message you use one of these methods:
* addRecipientByCertificate;
* addRecipientByPreDefinedData;

**addRecipientByCertificate** is used when encrypting a message to a the subject of an X.509 certificate; S/MIME encryption uses this approach.

>**NOTE**: CMS EnvelopedData supports a concept of recipient types when encrypting to a subject of an certificate. At this time you **can not** specify the "type" of recipient. Certificates with RSA signatures the recipient's type will be **KeyTransRecipientInfo** and  certificates with ECC signatures it will be type **KeyAgreeRecipientInfo**. It is not possible to support this case with WebCrypto at this time because there are no good support for the **DH** algorithm in all browsers ([FireFox has problems with exporting/importing keys][] and [Google Chrome has no implementation for **DH** at all][]). When this changes it will be possible to add support for **KeyAgreeRecipientInfo** for both RSA and ECC certificates.

Parameters for **addRecipientByCertificate**:
* **certificate** - *org.pkijs.simpl.CERT* - The recipients certificate (a PKIjs parsed object);
* **parameters** - *Object* - The options to be used when encrypting the message; options include:
  * **oaepHashAlgorithm** - *String* - The hash algorithm to be used with with RSASSA-OAEP. The default value is - SHA-512;
  * **kdfAlgorithm** - *String* - The hash algorithm to be used when deriving keys for use with ECDH (when using ECC-based certificates). The default value is - SHA-512;
  * **kekEncryptionLength** - *Number* - The length of the key to be use with AES-KW. The default value is - 256;
* **variant** - *Number* - A reserved value. The intention is to use this in the future to support specifying *“recipient type”*; for example *"variant  = 1"* for *KeyTransRecipientInfo* type and *"variant = 2"* for **KeyAgreeRecipientInfo** type;

**addRecipientByPreDefinedData** is used when encrypting to pre-defined keys (**KEKRecipientInfo**) and passwords (**PasswordRecipientInfo**). 

>**WARNING** Working with **PasswordRecipientInfo** currently (as for April 2015) possible only from [latest development versions of Google Chrome](https://www.google.com/intl/en/chrome/browser/desktop/index.html?extra=devchannel#eula)

Parameters for **addRecipientByPreDefinedData**:
* **preDefinedData**. Type - **ArrayBuffer**. The key or password to be used to encrypt the message. 
>**NOTE**: At this time (April 2015) Google Chrome supports only AES-KW-128 and AES-KW-256 algorithms. Thus to use the **KEKRecipientInfo** type you must provide 16 or 32 bytes in this field to use that option;
* **parameters** - *Object* - The options to be used when encrypting the message; options include:
  * **keyIdentifier** - *ArrayBuffer* - Used for **KEKRecipientInfo**. Default value - A random initialized ArrayBuffer 16 bytes length;
  * **hmacHashAlgorithm** - *String* - The hash algorithm to be used in PBKDF2 when producing the HMAC. Default value - SHA-512;
  * **iterationCount** - *Number* - The iteration count used in PBKDF2. The default value is - 2048;
  * **keyEncryptionAlgorithm** - *WebCrypto algorithm* - The key encryption algorithm to be used when encrypting the message. The default value is - { name: *"AES-KW"*, length: *256* };
  * **keyEncryptionAlgorithmParams** - *ASN1js parsed object* - Additional parameters used during key encryption. For example, for AES-CBC here we would put an "initialization vector". Default value - **new org.pkijs.asn1.NULL()**;
* **variant** - *Number* - Possible values: *variant = 1* is for **KEKRecipientInfo** and *variant = 2* is for **PasswordRecipientInfo**;

Once all recipients have been added the message you call the **encrypt** method on **org.pkijs.simpl.CMS_ENVELOPED_DATA** object.

The **encrypt** method has following parameters:
* **contentEncryptionAlgorithm** - *WebCrypto algorithm* - There is no default value for this parameter - At this time [PKIjs][] supports both AES-CBC and AES-GCM. 
> **NOTE:** It is also technically possible to use AES-CTR, but seems that AES-CTR does not have an OID enabling it to be used in an interoperable with CMS Enveloped data messages;
* **contentToEncrypt** - *ArrayBuffer* - The data to encrypt;

## Decrypting
To decrypt a message with PKIjs you use the **decrypt** method of **org.pkijs.simpl.CMS_ENVELOPED_DATA** object.

The **decrypt** method has following parameters:
* **recipientIndex** - *Number* - The index (starting from 0) of the recipient that you want to decrypt the session key for. 
> **NOTE:** In **KeyAgreeRecipientInfo** there is possibility to use one ephemeral ECDH key for many different recipients, inside one CMS Enveloped message. This case is not supported by [PKIjs][] - for each new recipient we use new ECDH ephemeral key. That is why [PKIjs][] has no "recipient's sub-indexes";
* **parameters** - *Object* - The options to be used when decrypting the message; options include:
  * **recipientCertificate** - *org.pkijs.simpl.CERT* - This field is mandatory for recipient's type **KeyAgreeRecipientInfo**;
  * **recipientPrivateKey** - *ArrayBuffer* - The encoded PKCS#8 structure for recipient's private key. This field is mandatory for recipient's types **KeyTransRecipientInfo** and **KeyAgreeRecipientInfo**;
  * **preDefinedData** - *ArrayBuffer* - Early used pre-shared data (pre-shared *"key encryption key"* or password).

> **NOTE:** [PKIjs][] supports combinations of options not yet (as of April 2015) supported by OpenSSL and Microsoft CryptoAPI (and CNG). For example OpenSSL does not support PBKDF2 with AES-KW algorithms. And Microsoft CryptoAPI does not support **dhSinglePass-stdDH-sha1kdf-scheme** and **dhSinglePass-stdDH-sha512kdf-scheme** or any forms of CMS using pre-shared data. 


[PKIjs]: http://pkijs.org/
[FireFox has problems with exporting/importing keys]: https://docs.google.com/spreadsheet/ccc?key=0AiAcidBZRLxndE9LWEs2R1oxZ0xidUVoU3FQbFFobkE#gid=1
[Google Chrome has no implementation for **DH** at all]: https://sites.google.com/a/chromium.org/dev/blink/webcrypto