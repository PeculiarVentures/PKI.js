import * as asn1js from 'https://unpkg.com/asn1js@latest?module';
import * as pvtsutils from 'https://unpkg.com/pvtsutils@latest?module';
import * as pkijs from '../pkijs.es.js';
import * as pvutils from 'https://unpkg.com/pvutils@latest?module';

/* eslint-disable deprecation/deprecation */
function toPEM(buffer, tag) {
    return [
        `-----BEGIN ${tag}-----`,
        formatPEM(pvtsutils.Convert.ToBase64(buffer)),
        `-----END ${tag}-----`,
        "",
    ].join("\n");
}
/**
 * Format string in order to have each line with length equal to 64
 * @param pemString String to format
 * @returns Formatted string
 */
function formatPEM(pemString) {
    const PEM_STRING_LENGTH = pemString.length, LINE_LENGTH = 64;
    const wrapNeeded = PEM_STRING_LENGTH > LINE_LENGTH;
    if (wrapNeeded) {
        let formattedString = "", wrapIndex = 0;
        for (let i = LINE_LENGTH; i < PEM_STRING_LENGTH; i += LINE_LENGTH) {
            formattedString += pemString.substring(wrapIndex, i) + "\r\n";
            wrapIndex = i;
        }
        formattedString += pemString.substring(wrapIndex, PEM_STRING_LENGTH);
        return formattedString;
    }
    else {
        return pemString;
    }
}
function isNode() {
    return typeof process !== "undefined" &&
        process.versions != null &&
        process.versions.node != null;
}
if (isNode()) {
    import('@peculiar/webcrypto').then(peculiarCrypto => {
        const webcrypto = new peculiarCrypto.Crypto();
        const name = "newEngine";
        pkijs.setEngine(name, new pkijs.CryptoEngine({ name, crypto: webcrypto }));
    });
}

// Global variables
const certificateBASE64 = "MIIDRDCCAi6gAwIBAgIBATALBgkqhkiG9w0BAQswODE2MAkGA1UEBhMCVVMwKQYDVQQDHiIAUABlAGMAdQBsAGkAYQByACAAVgBlAG4AdAB1AHIAZQBzMB4XDTEzMDEzMTIxMDAwMFoXDTE2MDEzMTIxMDAwMFowODE2MAkGA1UEBhMCVVMwKQYDVQQDHiIAUABlAGMAdQBsAGkAYQByACAAVgBlAG4AdAB1AHIAZQBzMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4qEnCuFxZqTEM/8cYcaYxexT6+fAHan5/eGCFOe1Yxi0BjRuDooWBPX71+hmWK/MKrKpWTpA3ZDeWrQR2WIcaf/ypd6DAEEWWzlQgBYpEUj/o7cykNwIvZReU9JXCbZu0EmeZXzBm1mIcWYRdk17UdneIRUkU379wVJcKXKlgZsx8395UNeOMk11G5QaHzAafQ1ljEKB/x2xDgwFxNaKpSIq3LQFq0PxoYt/PBJDMfUSiWT5cFh1FdKITXQzxnIthFn+NVKicAWBRaSZCRQxcShX6KHpQ1Lmk0/7QoCcDOAmVSfUAaBl2w8bYpnobFSStyY0RJHBqNtnTV3JonGAHwIDAQABo10wWzAMBgNVHRMEBTADAQH/MAsGA1UdDwQEAwIA/zAdBgNVHQ4EFgQU5QmA6U960XL4SII2SEhCcxij0JYwHwYDVR0jBBgwFoAU5QmA6U960XL4SII2SEhCcxij0JYwCwYJKoZIhvcNAQELA4IBAQAikQls3LhY8rYQCZ+8jXrdaRTY3L5J3S2xzoAofkEnQNzNMClaWrZbY/KQ+gG25MIFwPOWZn/uYUKB2j0yHTRMPEAp/v5wawSqM2BkdnkGP4r5Etx9pe3mog2xNUBqSeopNNto7QgV0o1yYHtuMKQhNAzcFB1CGz25+lXv8VuuU1PoYNrTjiprkjLDgPurNXUjUh9AZl06+Cakoe75LEkuaZKuBQIMNLJFcM2ZSK/QAAaI0E1DovcsCctW8x/6Qk5fYwNu0jcIdng9dzKYXytzV53+OGxdK5mldyBBkyvTrbO8bWwYT3c+weB1huNpgnpRHJKMz5xVj0bbdnHir6uc";
const privateKeyBASE64 = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDioScK4XFmpMQz/xxhxpjF7FPr58Adqfn94YIU57VjGLQGNG4OihYE9fvX6GZYr8wqsqlZOkDdkN5atBHZYhxp//Kl3oMAQRZbOVCAFikRSP+jtzKQ3Ai9lF5T0lcJtm7QSZ5lfMGbWYhxZhF2TXtR2d4hFSRTfv3BUlwpcqWBmzHzf3lQ144yTXUblBofMBp9DWWMQoH/HbEODAXE1oqlIirctAWrQ/Ghi388EkMx9RKJZPlwWHUV0ohNdDPGci2EWf41UqJwBYFFpJkJFDFxKFfooelDUuaTT/tCgJwM4CZVJ9QBoGXbDxtimehsVJK3JjREkcGo22dNXcmicYAfAgMBAAECggEBANMO1fdyIVRAWmE6UspUU+7vuvBWMjruE9126NhjOjABz5Z/uYdc3kjcdSCMVNR/VBrnrINmlwZBZnL+hCj5EBE/xlDnOwU/mHx4khnXiYOJglqLwFHcOV+lD3vsxhZLikP8a8GEQCJXbZR+RADzA8gkqJQSxnPkLpqeAyqulKhviQ2lq2ZxeCXI+iZvURQPTSm86+szClwgzr2uW6NSlNKKeeLHMILed4mrwbPOdyhutnqvV79GUYH3yYdzbEbbw5GOat77+xPLt33cfLCL7pg5lGDrKEomu6V1d5KmBOhv0K8gGPKfxPrpeUG5n1q58k/2ouCiyAaKWpVoOWmnbzECgYEA/UzAGZ2N8YE+kC85Nl0wQof+WVm+RUDsv6C3L2vPUht3GwnbxSTMl4+NixbCWG46udVhsM2x7ZzYY1eB7LtnBnjvXZTYU4wqZtGR/+X2Rw5ou+oWm16/OgcEuFjP2zpQtr9r/bpKhyBV+IdSngnLy00RueKGUL6nvtecRklEhQ0CgYEA5Quek+c12qMtrmg5znHPQC7uuieZRzUL9jTlQtuZM5m4B3AfB/N/0qIQS06PHS1ijeHQ9SxEmG72weamUYC0SPi8GxJioFzaJEDVit0Ra38gf0CXQvcYT0XD1CwY/m+jDXDWL5L1CCIr60AzNjM3WEfGO4VHaNsovVLn1Fvy5tsCgYEA4ZOEUEubqUOsb8NedCexXs61mOTvKcWUEWQTP0wHqduDyrSQ35TSDvds2j0+fnpMGksJYOcOWcmge3fm4OhT69Ovd+uia2UcLczc9MPa+5S9ePwTffJ24jp13aZaFaZtUxJOHfvVe1k0tsvsq4mV0EumSaCOdUIVKUPijEWbm9ECgYBpFa+nxAidSwiGYCNFaEnh9KZqmghk9x2J1DLrPb1IQ1p/bx2NlFYs2VYIdv6KMGxrFBO+qJTAKwjjZWMhOZ99a0FCWmkNkgwzXdubXlnDrAvI1mWPv7ZTiHqUObct5SI15HMgWJg7JxJnWIkmcNEPm76DSF6+6O4EDql2cMk8yQKBgF5roj+l90lfwImr6V1NJo3J5VCi9wTT5x9enPY9WRcfSyRjqU7JWy6h0C+Jq+AYAxrkQVjQuv1AOhO8Uhc6amM5FA+gfg5HKKPnwuOe7r7B48LFF8eRjYRtHmrQUrFY0jH6O+t12dEQI+7qE+SffUScsZWCREX7QYEK/tuznv/U";
async function passwordBasedIntegrity$1(password, hash = "SHA-256") {
    //#region Create simplified structires for certificate and private key
    const certRaw = pvutils.stringToArrayBuffer(pvutils.fromBase64(certificateBASE64));
    const certSimpl = pkijs.Certificate.fromBER(certRaw);
    const pkcs8Raw = pvutils.stringToArrayBuffer(pvutils.fromBase64(privateKeyBASE64));
    const pkcs8Simpl = pkijs.PrivateKeyInfo.fromBER(pkcs8Raw);
    //#endregion
    //#region Put initial values for PKCS#12 structures
    const pkcs12 = new pkijs.PFX({
        parsedValue: {
            integrityMode: 0,
            authenticatedSafe: new pkijs.AuthenticatedSafe({
                parsedValue: {
                    safeContents: [
                        {
                            privacyMode: 0,
                            value: new pkijs.SafeContents({
                                safeBags: [
                                    new pkijs.SafeBag({
                                        bagId: "1.2.840.113549.1.12.10.1.1",
                                        bagValue: pkcs8Simpl
                                    }),
                                    new pkijs.SafeBag({
                                        bagId: "1.2.840.113549.1.12.10.1.3",
                                        bagValue: new pkijs.CertBag({
                                            parsedValue: certSimpl
                                        })
                                    })
                                ]
                            })
                        }
                    ]
                }
            })
        }
    });
    //#endregion
    //#region Encode internal values for all "SafeContents" firts (create all "Privacy Protection" envelopes)
    if (!(pkcs12.parsedValue && pkcs12.parsedValue.authenticatedSafe)) {
        throw new Error("pkcs12.parsedValue.authenticatedSafe is empty");
    }
    await pkcs12.parsedValue.authenticatedSafe.makeInternalValues({
        safeContents: [
            {
            // Empty parameters since we have "No Privacy" protection level for SafeContents
            }
        ]
    });
    //#endregion
    //#region Encode internal values for "Integrity Protection" envelope
    await pkcs12.makeInternalValues({
        password: pvutils.stringToArrayBuffer(password),
        iterations: 100000,
        pbkdf2HashAlgorithm: hash,
        hmacHashAlgorithm: hash
    });
    //#endregion
    //#region Encode output buffer
    return pkcs12.toSchema().toBER();
    //#endregion
}
async function certificateBasedIntegrity$1() {
    //#region Create simplified structires for certificate and private key
    const certRaw = pvutils.stringToArrayBuffer(pvutils.fromBase64(certificateBASE64));
    const certSimpl = pkijs.Certificate.fromBER(certRaw);
    const pkcs8Raw = pvutils.stringToArrayBuffer(pvutils.fromBase64(privateKeyBASE64));
    const pkcs8Simpl = pkijs.PrivateKeyInfo.fromBER(pkcs8Raw);
    //#endregion
    //#region Get a "crypto" extension
    const crypto = pkijs.getCrypto(true);
    //#endregion
    //#region Put initial values for PKCS#12 structures
    const pkcs12 = new pkijs.PFX({
        parsedValue: {
            integrityMode: 1,
            authenticatedSafe: new pkijs.AuthenticatedSafe({
                parsedValue: {
                    safeContents: [
                        {
                            privacyMode: 0,
                            value: new pkijs.SafeContents({
                                safeBags: [
                                    new pkijs.SafeBag({
                                        bagId: "1.2.840.113549.1.12.10.1.1",
                                        bagValue: pkcs8Simpl
                                    }),
                                    new pkijs.SafeBag({
                                        bagId: "1.2.840.113549.1.12.10.1.3",
                                        bagValue: new pkijs.CertBag({
                                            parsedValue: certSimpl
                                        })
                                    })
                                ]
                            })
                        }
                    ]
                }
            })
        }
    });
    //#endregion
    //#region Encode internal values for all "SafeContents" firts (create all "Privacy Protection" envelopes)
    if (!(pkcs12.parsedValue && pkcs12.parsedValue.authenticatedSafe)) {
        throw new Error("pkcs12.parsedValue.authenticatedSafe is empty");
    }
    pkcs12.parsedValue.authenticatedSafe.makeInternalValues({
        safeContents: [
            {
            // Empty parameters since we have "No Privacy" protection level for SafeContents
            }
        ]
    });
    //#endregion
    //#region Import PKCS#8 key into WebCrypto key
    const publicKey = await certSimpl.getPublicKey();
    const algorithm = pkijs.getAlgorithmParameters(publicKey.algorithm.name, "importKey");
    const privateKey = await crypto.importKey("pkcs8", pvutils.stringToArrayBuffer(pvutils.fromBase64(privateKeyBASE64)), algorithm.algorithm, true, ["sign"]);
    //#endregion
    //#region Encode internal values for "Integrity Protection" envelope
    await pkcs12.makeInternalValues({
        signingCertificate: certSimpl,
        privateKey: privateKey,
        hashAlgorithm: "SHA-256"
    });
    //#endregion
    //#region Save encoded data
    return pkcs12.toSchema().toBER(false);
    //#endregion
}
async function passwordPrivacy$1(password) {
    //#region Initial variables
    const passwordConverted = pvutils.stringToArrayBuffer(password);
    //#endregion
    //#region Create simplified structires for certificate and private key
    const certRaw = pvutils.stringToArrayBuffer(pvutils.fromBase64(certificateBASE64));
    const certSimpl = pkijs.Certificate.fromBER(certRaw);
    const pkcs8Raw = pvutils.stringToArrayBuffer(pvutils.fromBase64(privateKeyBASE64));
    const pkcs8Simpl = pkijs.PrivateKeyInfo.fromBER(pkcs8Raw);
    //#endregion
    //#region Put initial values for PKCS#12 structures
    const pkcs12 = new pkijs.PFX({
        parsedValue: {
            integrityMode: 0,
            authenticatedSafe: new pkijs.AuthenticatedSafe({
                parsedValue: {
                    safeContents: [
                        {
                            privacyMode: 1,
                            value: new pkijs.SafeContents({
                                safeBags: [
                                    new pkijs.SafeBag({
                                        bagId: "1.2.840.113549.1.12.10.1.1",
                                        bagValue: pkcs8Simpl
                                    }),
                                    new pkijs.SafeBag({
                                        bagId: "1.2.840.113549.1.12.10.1.3",
                                        bagValue: new pkijs.CertBag({
                                            parsedValue: certSimpl
                                        })
                                    })
                                ]
                            })
                        }
                    ]
                }
            })
        }
    });
    //#endregion
    //#region Encode internal values for all "SafeContents" firts (create all "Privacy Protection" envelopes)
    if (!(pkcs12.parsedValue && pkcs12.parsedValue.authenticatedSafe)) {
        throw new Error("pkcs12.parsedValue.authenticatedSafe is empty");
    }
    await pkcs12.parsedValue.authenticatedSafe.makeInternalValues({
        safeContents: [
            {
                password: passwordConverted,
                contentEncryptionAlgorithm: {
                    name: "AES-CBC",
                    length: 128
                },
                hmacHashAlgorithm: "SHA-256",
                iterationCount: 2048
            }
        ]
    });
    //#endregion
    //#region Encode internal values for "Integrity Protection" envelope
    await pkcs12.makeInternalValues({
        password: passwordConverted,
        iterations: 100000,
        pbkdf2HashAlgorithm: "SHA-256",
        hmacHashAlgorithm: "SHA-256"
    });
    //#endregion
    //#region Save encoded data
    return pkcs12.toSchema().toBER(false);
    //#endregion
}
async function certificatePrivacy$1(password) {
    //#region Create simplified structires for certificate and private key
    const certRaw = pvutils.stringToArrayBuffer(pvutils.fromBase64(certificateBASE64));
    const certSimpl = pkijs.Certificate.fromBER(certRaw);
    const pkcs8Raw = pvutils.stringToArrayBuffer(pvutils.fromBase64(privateKeyBASE64));
    const pkcs8Simpl = pkijs.PrivateKeyInfo.fromBER(pkcs8Raw);
    //#endregion
    //#region Put initial values for PKCS#12 structures
    const pkcs12 = new pkijs.PFX({
        parsedValue: {
            integrityMode: 0,
            authenticatedSafe: new pkijs.AuthenticatedSafe({
                parsedValue: {
                    safeContents: [
                        {
                            privacyMode: 2,
                            value: new pkijs.SafeContents({
                                safeBags: [
                                    new pkijs.SafeBag({
                                        bagId: "1.2.840.113549.1.12.10.1.1",
                                        bagValue: pkcs8Simpl
                                    }),
                                    new pkijs.SafeBag({
                                        bagId: "1.2.840.113549.1.12.10.1.3",
                                        bagValue: new pkijs.CertBag({
                                            parsedValue: certSimpl
                                        })
                                    })
                                ]
                            })
                        }
                    ]
                }
            })
        }
    });
    //#endregion
    //#region Encode internal values for all "SafeContents" firts (create all "Privacy Protection" envelopes)
    if (!(pkcs12.parsedValue && pkcs12.parsedValue.authenticatedSafe)) {
        throw new Error("pkcs12.parsedValue.authenticatedSafe is empty");
    }
    await pkcs12.parsedValue.authenticatedSafe.makeInternalValues({
        safeContents: [
            {
                encryptingCertificate: certSimpl,
                encryptionAlgorithm: {
                    name: "AES-CBC",
                    length: 128
                }
            }
        ]
    });
    //#endregion
    //#region Encode internal values for "Integrity Protection" envelope
    await pkcs12.makeInternalValues({
        password: pvutils.stringToArrayBuffer(password),
        iterations: 100000,
        pbkdf2HashAlgorithm: "SHA-256",
        hmacHashAlgorithm: "SHA-256"
    });
    //#endregion
    //#region Save encoded data
    return pkcs12.toSchema().toBER(false);
    //#endregion
}
async function openSSLLike$1(password) {
    //#region Initial variables
    const keyLocalIDBuffer = new ArrayBuffer(4);
    const keyLocalIDView = new Uint8Array(keyLocalIDBuffer);
    pkijs.getRandomValues(keyLocalIDView);
    const certLocalIDBuffer = new ArrayBuffer(4);
    const certLocalIDView = new Uint8Array(certLocalIDBuffer);
    pkijs.getRandomValues(certLocalIDView);
    //#region "KeyUsage" attribute
    const bitArray = new ArrayBuffer(1);
    const bitView = new Uint8Array(bitArray);
    bitView[0] |= 0x80;
    const keyUsage = new asn1js.BitString({
        valueHex: bitArray,
        unusedBits: 7
    });
    //#endregion
    const passwordConverted = pvutils.stringToArrayBuffer(password);
    //#endregion
    //#region Create simplified structires for certificate and private key
    const certRaw = pvutils.stringToArrayBuffer(pvutils.fromBase64(certificateBASE64));
    const certSimpl = pkijs.Certificate.fromBER(certRaw);
    const pkcs8Raw = pvutils.stringToArrayBuffer(pvutils.fromBase64(privateKeyBASE64));
    const pkcs8Simpl = pkijs.PrivateKeyInfo.fromBER(pkcs8Raw);
    //#region Add "keyUsage" attribute
    pkcs8Simpl.attributes = [
        new pkijs.Attribute({
            type: "2.5.29.15",
            values: [
                keyUsage
            ]
        })
    ];
    //#endregion
    //#endregion
    //#region Put initial values for PKCS#12 structures
    const pkcs12 = new pkijs.PFX({
        parsedValue: {
            integrityMode: 0,
            authenticatedSafe: new pkijs.AuthenticatedSafe({
                parsedValue: {
                    safeContents: [
                        {
                            privacyMode: 0,
                            value: new pkijs.SafeContents({
                                safeBags: [
                                    new pkijs.SafeBag({
                                        bagId: "1.2.840.113549.1.12.10.1.2",
                                        bagValue: new pkijs.PKCS8ShroudedKeyBag({
                                            parsedValue: pkcs8Simpl
                                        }),
                                        bagAttributes: [
                                            new pkijs.Attribute({
                                                type: "1.2.840.113549.1.9.20",
                                                values: [
                                                    new asn1js.BmpString({ value: "PKCS8ShroudedKeyBag from PKIjs" })
                                                ]
                                            }),
                                            new pkijs.Attribute({
                                                type: "1.2.840.113549.1.9.21",
                                                values: [
                                                    new asn1js.OctetString({ valueHex: keyLocalIDBuffer })
                                                ]
                                            }),
                                            new pkijs.Attribute({
                                                type: "1.3.6.1.4.1.311.17.1",
                                                values: [
                                                    new asn1js.BmpString({ value: "http://www.pkijs.org" })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        },
                        {
                            privacyMode: 1,
                            value: new pkijs.SafeContents({
                                safeBags: [
                                    new pkijs.SafeBag({
                                        bagId: "1.2.840.113549.1.12.10.1.3",
                                        bagValue: new pkijs.CertBag({
                                            parsedValue: certSimpl
                                        }),
                                        bagAttributes: [
                                            new pkijs.Attribute({
                                                type: "1.2.840.113549.1.9.20",
                                                values: [
                                                    new asn1js.BmpString({ value: "CertBag from PKIjs" })
                                                ]
                                            }),
                                            new pkijs.Attribute({
                                                type: "1.2.840.113549.1.9.21",
                                                values: [
                                                    new asn1js.OctetString({ valueHex: certLocalIDBuffer })
                                                ]
                                            }),
                                            new pkijs.Attribute({
                                                type: "1.3.6.1.4.1.311.17.1",
                                                values: [
                                                    new asn1js.BmpString({ value: "http://www.pkijs.org" })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        }
                    ]
                }
            })
        }
    });
    //#endregion
    // Encode internal values for "PKCS8ShroudedKeyBag"
    if (!(pkcs12.parsedValue && pkcs12.parsedValue.authenticatedSafe)) {
        throw new Error("pkcs12.parsedValue.authenticatedSafe is empty");
    }
    await pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[0].value.safeBags[0].bagValue.makeInternalValues({
        password: passwordConverted,
        contentEncryptionAlgorithm: {
            name: "AES-CBC",
            length: 128
        },
        hmacHashAlgorithm: "SHA-1",
        iterationCount: 100000
    });
    // Encode internal values for all "SafeContents" firts (create all "Privacy Protection" envelopes)
    await pkcs12.parsedValue.authenticatedSafe.makeInternalValues({
        safeContents: [
            {
            // Empty parameters for first SafeContent since "No Privacy" protection mode there
            },
            {
                password: passwordConverted,
                contentEncryptionAlgorithm: {
                    name: "AES-CBC",
                    length: 128
                },
                hmacHashAlgorithm: "SHA-1",
                iterationCount: 100000
            }
        ]
    });
    // Encode internal values for "Integrity Protection" envelope
    await pkcs12.makeInternalValues({
        password: passwordConverted,
        iterations: 100000,
        pbkdf2HashAlgorithm: "SHA-256",
        hmacHashAlgorithm: "SHA-256"
    });
    //#endregion
    return pkcs12.toSchema().toBER(false);
}
async function parsePKCS12$1(buffer, password) {
    const passwordConverted = pvutils.stringToArrayBuffer(password);
    // Parse internal PKCS#12 values
    const pkcs12 = pkijs.PFX.fromBER(buffer);
    // Parse "AuthenticatedSafe" value of PKCS#12 data
    await pkcs12.parseInternalValues({
        password: passwordConverted,
        checkIntegrity: true
    });
    //Parse "SafeContents" values
    if (!(pkcs12.parsedValue && pkcs12.parsedValue.authenticatedSafe)) {
        throw new Error("pkcs12.parsedValue.authenticatedSafe is empty");
    }
    await pkcs12.parsedValue.authenticatedSafe.parseInternalValues({
        safeContents: [
            {
            // Empty parameters since for first "SafeContent" OpenSSL uses "no privacy" protection mode
            },
            {
                password: passwordConverted
            }
        ]
    });
    // Parse "PKCS8ShroudedKeyBag" value
    await pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[0].value.safeBags[0].bagValue.parseInternalValues({
        password: passwordConverted
    });
    return pkcs12;
}

function getElement(id, type) {
    const el = document.getElementById(id);
    if (!el) {
        throw new Error(`Element with id '${id}' does not exist`);
    }
    if (type && el.nodeName.toLowerCase() !== type) {
        throw new TypeError(`Element '${el.nodeName}' is not requested type '${type}'`);
    }
    return el;
}
class Assert {
    static ok(value, message) {
        if (!value) {
            throw new Error(message || "Value is empty");
        }
    }
}
function handleFileBrowse(evt, cb) {
    Assert.ok(evt.target);
    const target = evt.target;
    const currentFiles = target.files;
    Assert.ok(currentFiles);
    const tempReader = new FileReader();
    tempReader.onload =
        (event) => {
            Assert.ok(event.target);
            const file = event.target.result;
            if (!(file instanceof ArrayBuffer)) {
                throw new Error("incorrect type of the file. Must be ArrayBuffer");
            }
            cb(file);
        };
    if (currentFiles.length) {
        tempReader.readAsArrayBuffer(currentFiles[0]);
    }
}

function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}
function saveFile(result) {
    const pkcs12AsBlob = new Blob([result], { type: "application/x-pkcs12" });
    const downloadLink = document.createElement("a");
    downloadLink.download = "pkijs_pkcs12.p12";
    downloadLink.innerHTML = "Download File";
    downloadLink.href = window.URL.createObjectURL(pkcs12AsBlob);
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}
async function passwordBasedIntegrity(password) {
    if (!password) {
        password = getElement("password2", "input").value;
    }
    const pfx = await passwordBasedIntegrity$1(password);
    saveFile(pfx);
}
async function certificateBasedIntegrity() {
    const pfx = await certificateBasedIntegrity$1();
    saveFile(pfx);
}
async function noPrivacy() {
    await passwordBasedIntegrity(getElement("password3", "input").value); // Same with previous example
}
async function passwordPrivacy() {
    const pfx = await passwordPrivacy$1(getElement("password4", "input").value);
    saveFile(pfx);
}
async function certificatePrivacy() {
    const pfx = await certificatePrivacy$1(getElement("password5", "input").value);
    saveFile(pfx);
}
async function openSSLLike() {
    const pfx = await openSSLLike$1(getElement("password1", "input").value);
    saveFile(pfx);
}
async function parsePKCS12(buffer) {
    const pkcs12 = await parsePKCS12$1(buffer, getElement("password", "input").value);
    const result = [];
    //#region Store X.509 certificate value
    if (!(pkcs12.parsedValue && pkcs12.parsedValue.authenticatedSafe)) {
        throw new Error("pkcs12.parsedValue.authenticatedSafe is empty");
    }
    const certificateBuffer = pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[1].value.safeBags[0].bagValue.parsedValue.toSchema().toBER(false);
    result.push(toPEM(certificateBuffer, "CERTIFICATE"));
    //#endregion
    //#endregion Store PKCS#8 (private key) value
    const pkcs8Buffer = pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[0].value.safeBags[0].bagValue.parsedValue.toSchema().toBER(false);
    result.push(toPEM(pkcs8Buffer, "PRIVATE KEY"));
    //#endregion
    getElement("parsing_result").innerHTML = result.join("\n");
}
function handlePKCS12(evt) {
    handleFileBrowse(evt, file => {
        parsePKCS12(file)
            .catch(e => {
            console.error(e);
            alert("Error on PKCS#12 parsing. See developer console for more details");
        });
    });
}
getElement("open_ssl_like").addEventListener("click", openSSLLike);
getElement("password_based_integrity").addEventListener("click", () => passwordBasedIntegrity());
getElement("certificate_based_integrity").addEventListener("click", certificateBasedIntegrity);
getElement("no_privacy").addEventListener("click", noPrivacy);
getElement("password_privacy").addEventListener("click", passwordPrivacy);
getElement("certificate_privacy").addEventListener("click", certificatePrivacy);
getElement("pkcs12_file").addEventListener("click", handlePKCS12);
