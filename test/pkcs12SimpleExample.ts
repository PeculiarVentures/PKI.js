import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as pkijs from "../src";

// Global variables
export const certificateBASE64 = "MIIDRDCCAi6gAwIBAgIBATALBgkqhkiG9w0BAQswODE2MAkGA1UEBhMCVVMwKQYDVQQDHiIAUABlAGMAdQBsAGkAYQByACAAVgBlAG4AdAB1AHIAZQBzMB4XDTEzMDEzMTIxMDAwMFoXDTE2MDEzMTIxMDAwMFowODE2MAkGA1UEBhMCVVMwKQYDVQQDHiIAUABlAGMAdQBsAGkAYQByACAAVgBlAG4AdAB1AHIAZQBzMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4qEnCuFxZqTEM/8cYcaYxexT6+fAHan5/eGCFOe1Yxi0BjRuDooWBPX71+hmWK/MKrKpWTpA3ZDeWrQR2WIcaf/ypd6DAEEWWzlQgBYpEUj/o7cykNwIvZReU9JXCbZu0EmeZXzBm1mIcWYRdk17UdneIRUkU379wVJcKXKlgZsx8395UNeOMk11G5QaHzAafQ1ljEKB/x2xDgwFxNaKpSIq3LQFq0PxoYt/PBJDMfUSiWT5cFh1FdKITXQzxnIthFn+NVKicAWBRaSZCRQxcShX6KHpQ1Lmk0/7QoCcDOAmVSfUAaBl2w8bYpnobFSStyY0RJHBqNtnTV3JonGAHwIDAQABo10wWzAMBgNVHRMEBTADAQH/MAsGA1UdDwQEAwIA/zAdBgNVHQ4EFgQU5QmA6U960XL4SII2SEhCcxij0JYwHwYDVR0jBBgwFoAU5QmA6U960XL4SII2SEhCcxij0JYwCwYJKoZIhvcNAQELA4IBAQAikQls3LhY8rYQCZ+8jXrdaRTY3L5J3S2xzoAofkEnQNzNMClaWrZbY/KQ+gG25MIFwPOWZn/uYUKB2j0yHTRMPEAp/v5wawSqM2BkdnkGP4r5Etx9pe3mog2xNUBqSeopNNto7QgV0o1yYHtuMKQhNAzcFB1CGz25+lXv8VuuU1PoYNrTjiprkjLDgPurNXUjUh9AZl06+Cakoe75LEkuaZKuBQIMNLJFcM2ZSK/QAAaI0E1DovcsCctW8x/6Qk5fYwNu0jcIdng9dzKYXytzV53+OGxdK5mldyBBkyvTrbO8bWwYT3c+weB1huNpgnpRHJKMz5xVj0bbdnHir6uc";
export const privateKeyBASE64 = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDioScK4XFmpMQz/xxhxpjF7FPr58Adqfn94YIU57VjGLQGNG4OihYE9fvX6GZYr8wqsqlZOkDdkN5atBHZYhxp//Kl3oMAQRZbOVCAFikRSP+jtzKQ3Ai9lF5T0lcJtm7QSZ5lfMGbWYhxZhF2TXtR2d4hFSRTfv3BUlwpcqWBmzHzf3lQ144yTXUblBofMBp9DWWMQoH/HbEODAXE1oqlIirctAWrQ/Ghi388EkMx9RKJZPlwWHUV0ohNdDPGci2EWf41UqJwBYFFpJkJFDFxKFfooelDUuaTT/tCgJwM4CZVJ9QBoGXbDxtimehsVJK3JjREkcGo22dNXcmicYAfAgMBAAECggEBANMO1fdyIVRAWmE6UspUU+7vuvBWMjruE9126NhjOjABz5Z/uYdc3kjcdSCMVNR/VBrnrINmlwZBZnL+hCj5EBE/xlDnOwU/mHx4khnXiYOJglqLwFHcOV+lD3vsxhZLikP8a8GEQCJXbZR+RADzA8gkqJQSxnPkLpqeAyqulKhviQ2lq2ZxeCXI+iZvURQPTSm86+szClwgzr2uW6NSlNKKeeLHMILed4mrwbPOdyhutnqvV79GUYH3yYdzbEbbw5GOat77+xPLt33cfLCL7pg5lGDrKEomu6V1d5KmBOhv0K8gGPKfxPrpeUG5n1q58k/2ouCiyAaKWpVoOWmnbzECgYEA/UzAGZ2N8YE+kC85Nl0wQof+WVm+RUDsv6C3L2vPUht3GwnbxSTMl4+NixbCWG46udVhsM2x7ZzYY1eB7LtnBnjvXZTYU4wqZtGR/+X2Rw5ou+oWm16/OgcEuFjP2zpQtr9r/bpKhyBV+IdSngnLy00RueKGUL6nvtecRklEhQ0CgYEA5Quek+c12qMtrmg5znHPQC7uuieZRzUL9jTlQtuZM5m4B3AfB/N/0qIQS06PHS1ijeHQ9SxEmG72weamUYC0SPi8GxJioFzaJEDVit0Ra38gf0CXQvcYT0XD1CwY/m+jDXDWL5L1CCIr60AzNjM3WEfGO4VHaNsovVLn1Fvy5tsCgYEA4ZOEUEubqUOsb8NedCexXs61mOTvKcWUEWQTP0wHqduDyrSQ35TSDvds2j0+fnpMGksJYOcOWcmge3fm4OhT69Ovd+uia2UcLczc9MPa+5S9ePwTffJ24jp13aZaFaZtUxJOHfvVe1k0tsvsq4mV0EumSaCOdUIVKUPijEWbm9ECgYBpFa+nxAidSwiGYCNFaEnh9KZqmghk9x2J1DLrPb1IQ1p/bx2NlFYs2VYIdv6KMGxrFBO+qJTAKwjjZWMhOZ99a0FCWmkNkgwzXdubXlnDrAvI1mWPv7ZTiHqUObct5SI15HMgWJg7JxJnWIkmcNEPm76DSF6+6O4EDql2cMk8yQKBgF5roj+l90lfwImr6V1NJo3J5VCi9wTT5x9enPY9WRcfSyRjqU7JWy6h0C+Jq+AYAxrkQVjQuv1AOhO8Uhc6amM5FA+gfg5HKKPnwuOe7r7B48LFF8eRjYRtHmrQUrFY0jH6O+t12dEQI+7qE+SffUScsZWCREX7QYEK/tuznv/U";

export async function passwordBasedIntegrity(password: string, hash = "SHA-256"): Promise<ArrayBuffer> {
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

export async function certificateBasedIntegrity(): Promise<ArrayBuffer> {
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
      integrityMode: 1, // Certificate-Based Integrity Mode
      authenticatedSafe: new pkijs.AuthenticatedSafe({
        parsedValue: {
          safeContents: [
            {
              privacyMode: 0, // "No Privacy" mode
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
  const algorithm = pkijs.getAlgorithmParameters(publicKey.algorithm.name, "importKey") as any;

  const privateKey = await crypto.importKey("pkcs8",
    pvutils.stringToArrayBuffer(pvutils.fromBase64(privateKeyBASE64)),
    algorithm.algorithm,
    true,
    ["sign"]);
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

export async function noPrivacy(password: string) {
  return passwordBasedIntegrity(password);
}

export async function passwordPrivacy(password: string) {
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
      integrityMode: 0, // Password-Based Integrity Mode
      authenticatedSafe: new pkijs.AuthenticatedSafe({
        parsedValue: {
          safeContents: [
            {
              privacyMode: 1, // Password-Based Privacy Protection Mode
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
    pbkdf2HashAlgorithm: "SHA-256", // Least two parameters are equal because at the moment it is not clear how to use PBMAC1 schema with PKCS#12 integrity protection
    hmacHashAlgorithm: "SHA-256"
  });
  //#endregion

  //#region Save encoded data
  return pkcs12.toSchema().toBER(false);
  //#endregion
}

export async function certificatePrivacy(password: string) {
  //#region Create simplified structires for certificate and private key
  const certRaw = pvutils.stringToArrayBuffer(pvutils.fromBase64(certificateBASE64));
  const certSimpl = pkijs.Certificate.fromBER(certRaw);

  const pkcs8Raw = pvutils.stringToArrayBuffer(pvutils.fromBase64(privateKeyBASE64));
  const pkcs8Simpl = pkijs.PrivateKeyInfo.fromBER(pkcs8Raw);
  //#endregion

  //#region Put initial values for PKCS#12 structures
  const pkcs12 = new pkijs.PFX({
    parsedValue: {
      integrityMode: 0, // Password-Based Integrity Mode
      authenticatedSafe: new pkijs.AuthenticatedSafe({
        parsedValue: {
          safeContents: [
            {
              privacyMode: 2, // Certificate-Based Privacy Protection Mode
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
    pbkdf2HashAlgorithm: "SHA-256", // Least two parameters are equal because at the moment it is not clear how to use PBMAC1 schema with PKCS#12 integrity protection
    hmacHashAlgorithm: "SHA-256"
  });
  //#endregion

  //#region Save encoded data
  return pkcs12.toSchema().toBER(false);
  //#endregion
}

export async function openSSLLike(password: string) {
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
      integrityMode: 0, // Password-Based Integrity Mode
      authenticatedSafe: new pkijs.AuthenticatedSafe({
        parsedValue: {
          safeContents: [
            {
              privacyMode: 0, // "No-privacy" Protection Mode
              value: new pkijs.SafeContents({
                safeBags: [
                  new pkijs.SafeBag({
                    bagId: "1.2.840.113549.1.12.10.1.2",
                    bagValue: new pkijs.PKCS8ShroudedKeyBag({
                      parsedValue: pkcs8Simpl
                    }),
                    bagAttributes: [
                      new pkijs.Attribute({
                        type: "1.2.840.113549.1.9.20", // friendlyName
                        values: [
                          new asn1js.BmpString({ value: "PKCS8ShroudedKeyBag from PKIjs" })
                        ]
                      }),
                      new pkijs.Attribute({
                        type: "1.2.840.113549.1.9.21", // localKeyID
                        values: [
                          new asn1js.OctetString({ valueHex: keyLocalIDBuffer })
                        ]
                      }),
                      new pkijs.Attribute({
                        type: "1.3.6.1.4.1.311.17.1", // pkcs12KeyProviderNameAttr
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
              privacyMode: 1, // Password-Based Privacy Protection Mode
              value: new pkijs.SafeContents({
                safeBags: [
                  new pkijs.SafeBag({
                    bagId: "1.2.840.113549.1.12.10.1.3",
                    bagValue: new pkijs.CertBag({
                      parsedValue: certSimpl
                    }),
                    bagAttributes: [
                      new pkijs.Attribute({
                        type: "1.2.840.113549.1.9.20", // friendlyName
                        values: [
                          new asn1js.BmpString({ value: "CertBag from PKIjs" })
                        ]
                      }),
                      new pkijs.Attribute({
                        type: "1.2.840.113549.1.9.21", // localKeyID
                        values: [
                          new asn1js.OctetString({ valueHex: certLocalIDBuffer })
                        ]
                      }),
                      new pkijs.Attribute({
                        type: "1.3.6.1.4.1.311.17.1", // pkcs12KeyProviderNameAttr
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
      name: "AES-CBC", // OpenSSL can handle AES-CBC only
      length: 128
    },
    hmacHashAlgorithm: "SHA-1", // OpenSSL can handle SHA-1 only
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
          name: "AES-CBC", // OpenSSL can handle AES-CBC only
          length: 128
        },
        hmacHashAlgorithm: "SHA-1", // OpenSSL can handle SHA-1 only
        iterationCount: 100000
      }
    ]
  });

  // Encode internal values for "Integrity Protection" envelope
  await pkcs12.makeInternalValues({
    password: passwordConverted,
    iterations: 100000,
    pbkdf2HashAlgorithm: "SHA-256", // OpenSSL can not handle usage of PBKDF2, only PBKDF1
    hmacHashAlgorithm: "SHA-256"
  });
  //#endregion

  return pkcs12.toSchema().toBER(false);
}

export async function parsePKCS12(buffer: ArrayBuffer, password: string) {
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
