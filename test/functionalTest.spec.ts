import * as assert from "assert";
import * as asn1js from "asn1js";
import * as pvtsutils from "pvtsutils";
import { Crypto } from "@peculiar/webcrypto";
import * as pkijs from "../src";
import { createCertificate } from "./certificateComplexExample";

context("PKIjs functional testing", () => {
  //region Initial variables
  const results: Record<string, any> = {};
  const fakeHex = (new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x01, 0x02])).buffer;
  const fakeString = "fakeString";
  const fakeOID = "1.2.3.4.5";
  //endregion

  it("GeneralName", () => {
    // results["GeneralName0"] = new pkijs.GeneralName({
    //   schema: (new pkijs.GeneralName({
    //     type: 0,
    //     value: new asn1js.Sequence({
    //       value: [
    //         new asn1js.ObjectIdentifier({ value: fakeOID }),
    //         new asn1js.Constructed({
    //           idBlock: {
    //             tagClass: 3, // CONTEXT-SPECIFIC
    //             tagNumber: 0 // [0]
    //           },
    //           value: [new asn1js.Null()]
    //         })
    //       ]
    //     })
    //   })).toSchema()
    // });

    results["GeneralName1"] = new pkijs.GeneralName({
      schema: (new pkijs.GeneralName({
        type: 1,
        value: fakeString
      })).toSchema()
    });

    //
    // results["GeneralName2"] = new pkijs.GeneralName({
    //   schema: (new pkijs.GeneralName({
    //     type: 2,
    //     value: fakeString
    //   })).toSchema()
    // });

    // results["GeneralName3"] = new pkijs.GeneralName({
    //   schema: (new pkijs.GeneralName({
    //     type: 3,
    //     value: fakeString
    //   })).toSchema()
    // });
  });

  it("AuthorityKeyIdentifier", () => {
    results["AuthorityKeyIdentifier"] = new pkijs.AuthorityKeyIdentifier({
      schema: (new pkijs.AuthorityKeyIdentifier({
        keyIdentifier: new asn1js.OctetString({ valueHex: fakeHex }),
        authorityCertIssuer: [
          results["GeneralName1"],
          results["GeneralName1"],
          results["GeneralName1"]
        ],
        authorityCertSerialNumber: new asn1js.Integer({ valueHex: fakeHex })
      })).toSchema()
    });
  });

  it("Accuracy", () => {
    results["Accuracy"] = new pkijs.Accuracy({
      schema: (new pkijs.Accuracy({
        seconds: 1000,
        millis: 1000,
        micros: 1000
      })).toSchema()
    });
  });

  it("AlgorithmIdentifier", () => {
    results["AlgorithmIdentifier"] = new pkijs.AlgorithmIdentifier({
      schema: (new pkijs.AlgorithmIdentifier({
        algorithmId: fakeOID,
        algorithmParams: new asn1js.Null()
      })).toSchema()
    });
  });

  it("Attribute #1", () => {
    results["Attribute"] = new pkijs.Attribute({
      schema: (new pkijs.Attribute({
        type: fakeOID,
        values: [
          new asn1js.Null()
        ]
      })).toSchema()
    });
  });

  it("AccessDescription", () => {
    results["AccessDescription"] = new pkijs.AccessDescription({
      schema: (new pkijs.AccessDescription({
        accessMethod: fakeOID,
        accessLocation: results["GeneralName1"]
      })).toSchema()
    });
  });

  it("AltName", () => {
    results["AltName"] = new pkijs.AltName({
      schema: (new pkijs.AltName({
        altNames: [
          results["GeneralName1"],
          results["GeneralName1"],
          results["GeneralName1"]
        ]
      })).toSchema()
    });
  });

  it("Attribute #2", () => {
    results["Attribute"] = new pkijs.Attribute({
      schema: (new pkijs.Attribute({
        type: fakeOID,
        values: [
          new asn1js.Null(),
          new asn1js.Null()
        ]
      })).toSchema()
    });
  });

  it("BasicConstraints", () => {
    results["BasicConstraints"] = new pkijs.BasicConstraints({
      schema: (new pkijs.BasicConstraints({
        cA: false,
        pathLenConstraint: 10
      })).toSchema()
    });
  });

  it("AttributeTypeAndValue", () => {
    results["AttributeTypeAndValue"] = new pkijs.AttributeTypeAndValue({
      schema: (new pkijs.AttributeTypeAndValue({
        type: fakeOID,
        value: new asn1js.Null() as any,
      })).toSchema()
    });
  });

  it("CertID", () => {
    results["CertID"] = new pkijs.CertID({
      schema: (new pkijs.CertID({
        hashAlgorithm: results["AlgorithmIdentifier"],
        issuerNameHash: new asn1js.OctetString({ valueHex: fakeHex }),
        issuerKeyHash: new asn1js.OctetString({ valueHex: fakeHex }),
        serialNumber: new asn1js.Integer({ value: 10 })
      })).toSchema()
    });
  });

  it("PolicyQualifierInfo", () => {
    results["PolicyQualifierInfo"] = new pkijs.PolicyQualifierInfo({
      schema: (new pkijs.PolicyQualifierInfo({
        policyQualifierId: fakeOID,
        qualifier: new asn1js.Null()
      })).toSchema()
    });
  });

  it("PolicyInformation", () => {
    results["PolicyInformation"] = new pkijs.PolicyInformation({
      schema: (new pkijs.PolicyInformation({
        policyIdentifier: fakeOID,
        policyQualifiers: [
          results["PolicyQualifierInfo"],
          results["PolicyQualifierInfo"],
          results["PolicyQualifierInfo"]
        ]
      })).toSchema()
    });
  });

  it("CertificatePolicies", () => {
    results["CertificatePolicies"] = new pkijs.CertificatePolicies({
      schema: (new pkijs.CertificatePolicies({
        certificatePolicies: [
          results["PolicyInformation"],
          results["PolicyInformation"],
          results["PolicyInformation"]
        ]
      })).toSchema()
    });
  });

  it("ContentInfo", () => {
    results["ContentInfo"] = new pkijs.ContentInfo({
      schema: (new pkijs.ContentInfo({
        contentType: fakeOID,
        content: new asn1js.Null()
      })).toSchema()
    });
  });

  it("DigestInfo", () => {
    results["DigestInfo"] = new pkijs.DigestInfo({
      schema: (new pkijs.DigestInfo({
        digestAlgorithm: results["AlgorithmIdentifier"],
        digest: new asn1js.OctetString({ valueHex: fakeHex })
      })).toSchema()
    });
  });

  it("RelativeDistinguishedNames", () => {
    results["RelativeDistinguishedNames"] = new pkijs.RelativeDistinguishedNames({
      schema: (new pkijs.RelativeDistinguishedNames({
        typesAndValues: [
          results["AttributeTypeAndValue"],
          results["AttributeTypeAndValue"],
          results["AttributeTypeAndValue"]
        ],
        //valueBeforeDecode - should be missing because of "toSchema" internal functionality
      })).toSchema()
    });
  });

  it("DistributionPoint", () => {
    results["DistributionPoint"] = new pkijs.DistributionPoint({
      schema: (new pkijs.DistributionPoint({
        distributionPoint: [
          results["GeneralName1"],
          results["GeneralName1"],
          results["GeneralName1"]
        ],
        reasons: new asn1js.BitString({ valueHex: fakeHex }),
        cRLIssuer: [
          results["GeneralName1"],
          results["GeneralName1"],
          results["GeneralName1"]
        ]
      })).toSchema()
    });
  });

  it("ECCCMSSharedInfo", () => {
    results["ECCCMSSharedInfo"] = new pkijs.ECCCMSSharedInfo({
      schema: (new pkijs.ECCCMSSharedInfo({
        keyInfo: results["AlgorithmIdentifier"],
        entityUInfo: new asn1js.OctetString({ valueHex: fakeHex }),
        suppPubInfo: new asn1js.OctetString({ valueHex: fakeHex })
      })).toSchema()
    });
  });

  it("ECPublicKey", () => {
    results["ECPublicKey"] = new pkijs.ECPublicKey({
      schema: (new pkijs.ECPublicKey({
        x: fakeHex,
        y: fakeHex,
        namedCurve: "1.2.840.10045.3.1.7"
      })).toSchema().dataView.slice().buffer, // Return specifically ArrayBuffer
      namedCurve: "1.2.840.10045.3.1.7" // Needs specifically for this class
    });
  });

  it("ECPrivateKey", () => {
    results["ECPrivateKey"] = new pkijs.ECPrivateKey({
      schema: (new pkijs.ECPrivateKey({
        version: 1,
        privateKey: new asn1js.OctetString({ valueHex: fakeHex }),
        namedCurve: "1.2.840.10045.3.1.7",
        publicKey: results["ECPublicKey"]
      })).toSchema()
    });
  });

  it("EncapsulatedContentInfo", () => {
    results["EncapsulatedContentInfo"] = new pkijs.EncapsulatedContentInfo({
      schema: (new pkijs.EncapsulatedContentInfo({
        eContentType: fakeOID,
        eContent: new asn1js.OctetString({ valueHex: fakeHex })
      })).toSchema()
    });
  });

  it("EncryptedContentInfo", () => {
    results["EncryptedContentInfo"] = new pkijs.EncryptedContentInfo({
      schema: (new pkijs.EncryptedContentInfo({
        contentType: fakeOID,
        contentEncryptionAlgorithm: results["AlgorithmIdentifier"],
        encryptedContent: new asn1js.OctetString({ valueHex: fakeHex })
      })).toSchema()
    });
  });

  it("EncryptedData", () => {
    results["EncryptedData"] = new pkijs.EncryptedData({
      schema: (new pkijs.EncryptedData({
        version: 1,
        encryptedContentInfo: results["EncryptedContentInfo"],
        unprotectedAttrs: [
          results["Attribute"],
          results["Attribute"],
          results["Attribute"]
        ]
      })).toSchema()
    });
  });

  context("EnvelopedData", () => {
    context("disableSplit", () => {

      const tests: {
        name: string;
        params: {
          disableSplit?: boolean;
        };
        want: boolean;
      }[] = [
          {
            name: "disabled",
            params: {
              disableSplit: true,
            },
            want: false,
          },
          {
            name: "enabled",
            params: {
              disableSplit: false,
            },
            want: true,
          },
          {
            name: "default",
            params: {},
            want: true,
          },
        ];
      const crypto = new Crypto();

      for (const t of tests) {
        it(t.name, async () => {
          const data = new Uint8Array(10).buffer;
          const certData = await createCertificate("SHA-256", "RSASSA-PKCS1-v1_5");

          let envelopedData = new pkijs.EnvelopedData({
            version: 0,
            ...t.params,
          });
          envelopedData.addRecipientByCertificate(certData.certificate, { oaepHashAlgorithm: "SHA-256" });

          await envelopedData.encrypt({ name: "AES-CBC", length: 256 } as AesKeyGenParams, data);

          const raw = envelopedData.toSchema().toBER(false);

          const key = await crypto.subtle.importKey("pkcs8", certData.privateKeyBuffer, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["decrypt"]);
          envelopedData = pkijs.EnvelopedData.fromBER(raw);
          assert.ok(envelopedData.encryptedContentInfo.encryptedContent);
          assert.equal(envelopedData.encryptedContentInfo.encryptedContent.idBlock.isConstructed, t.want);

          const decryptedData = await envelopedData.decrypt(0, {
            recipientPrivateKey: key,
            crypto: pkijs.getCrypto(true).crypto,
          });

          assert.equal(pvtsutils.Convert.ToHex(decryptedData), pvtsutils.Convert.ToHex(data));
        });
      }

    });
  });

  it("Extension", () => {
    results["Extension"] = new pkijs.Extension({
      schema: (new pkijs.Extension({
        extnID: fakeOID,
        critical: true,
        extnValue: fakeHex
      })).toSchema()
    });
  });

  it("Extensions", () => {
    results["Extensions"] = new pkijs.Extensions({
      schema: (new pkijs.Extensions({
        extensions: [
          results["Extension"],
          results["Extension"],
          results["Extension"]
        ]
      })).toSchema()
    });
  });

  it("ExtKeyUsage", () => {
    results["ExtKeyUsage"] = new pkijs.ExtKeyUsage({
      schema: (new pkijs.ExtKeyUsage({
        keyPurposes: [
          fakeOID,
          fakeOID,
          fakeOID
        ]
      })).toSchema()
    });
  });

  it("GeneralNames", () => {
    results["GeneralNames"] = new pkijs.GeneralNames({
      schema: (new pkijs.GeneralNames({
        names: [
          results["GeneralName1"],
          results["GeneralName1"],
          results["GeneralName1"]
        ]
      })).toSchema()
    });
  });

  it("GeneralSubtree", () => {
    results["GeneralSubtree"] = new pkijs.GeneralSubtree({
      schema: (new pkijs.GeneralSubtree({
        base: results["GeneralName1"],
        minimum: 1,
        maximum: 10
      })).toSchema()
    });
  });

  it("InfoAccess", () => {
    results["InfoAccess"] = new pkijs.InfoAccess({
      schema: (new pkijs.InfoAccess({
        accessDescriptions: [
          results["AccessDescription"],
          results["AccessDescription"],
          results["AccessDescription"]
        ]
      })).toSchema()
    });
  });

  it("IssuerAndSerialNumber", () => {
    results["IssuerAndSerialNumber"] = new pkijs.IssuerAndSerialNumber({
      schema: (new pkijs.IssuerAndSerialNumber({
        issuer: results["RelativeDistinguishedNames"],
        serialNumber: new asn1js.Integer({ value: 10 })
      })).toSchema()
    });
  });

  it("IssuingDistributionPoint", () => {
    results["IssuingDistributionPoint1"] = new pkijs.IssuingDistributionPoint({
      schema: (new pkijs.IssuingDistributionPoint({
        distributionPoint: [
          results["GeneralName1"],
          results["GeneralName1"],
          results["GeneralName1"]
        ],
        onlyContainsUserCerts: true,
        onlyContainsCACerts: false,
        onlySomeReasons: 10,
        indirectCRL: false,
        onlyContainsAttributeCerts: true
      })).toSchema()
    });

    results["IssuingDistributionPoint2"] = new pkijs.IssuingDistributionPoint({
      schema: (new pkijs.IssuingDistributionPoint({
        distributionPoint: results["RelativeDistinguishedNames"],
        onlyContainsUserCerts: true,
        onlyContainsCACerts: false,
        onlySomeReasons: 10,
        indirectCRL: false,
        onlyContainsAttributeCerts: true
      })).toSchema()
    });
  });

  it("OtherKeyAttribute", () => {
    results["OtherKeyAttribute"] = new pkijs.OtherKeyAttribute({
      schema: (new pkijs.OtherKeyAttribute({
        keyAttrId: fakeOID,
        keyAttr: new asn1js.Null()
      })).toSchema()
    });
  });

  it("KEKIdentifier", () => {
    results["KEKIdentifier"] = new pkijs.KEKIdentifier({
      schema: (new pkijs.KEKIdentifier({
        keyIdentifier: new asn1js.OctetString({ valueHex: fakeHex }),
        date: new asn1js.GeneralizedTime({ valueDate: new Date() }),
        other: results["OtherKeyAttribute"]
      })).toSchema()
    });
  });

  it("KEKRecipientInfo", () => {
    results["KEKRecipientInfo"] = new pkijs.KEKRecipientInfo({
      schema: (new pkijs.KEKRecipientInfo({
        version: 1,
        kekid: results["KEKIdentifier"],
        keyEncryptionAlgorithm: results["AlgorithmIdentifier"],
        encryptedKey: new asn1js.OctetString({ valueHex: fakeHex }),
        preDefinedKEK: fakeHex
      })).toSchema()
    });
  });

  it("RecipientKeyIdentifier", () => {
    results["RecipientKeyIdentifier"] = new pkijs.RecipientKeyIdentifier({
      schema: (new pkijs.RecipientKeyIdentifier({
        subjectKeyIdentifier: new asn1js.OctetString({ valueHex: fakeHex }),
        date: new asn1js.GeneralizedTime({ valueDate: new Date() }),
        other: results["OtherKeyAttribute"]
      })).toSchema()
    });
  });

  it("KeyAgreeRecipientIdentifier", () => {
    results["KeyAgreeRecipientIdentifier1"] = new pkijs.KeyAgreeRecipientIdentifier({
      schema: (new pkijs.KeyAgreeRecipientIdentifier({
        variant: 1,
        value: results["IssuerAndSerialNumber"]
      })).toSchema()
    });

    results["KeyAgreeRecipientIdentifier2"] = new pkijs.KeyAgreeRecipientIdentifier({
      schema: (new pkijs.KeyAgreeRecipientIdentifier({
        variant: 2,
        value: results["RecipientKeyIdentifier"]
      })).toSchema()
    });
  });

  it("MacData", () => {
    results["MacData"] = new pkijs.MacData({
      schema: (new pkijs.MacData({
        mac: results["DigestInfo"],
        macSalt: new asn1js.OctetString({ valueHex: fakeHex }),
        iterations: 10
      })).toSchema()
    });
  });

  it("MessageImprint", () => {
    results["MessageImprint"] = new pkijs.MessageImprint({
      schema: (new pkijs.MessageImprint({
        hashAlgorithm: results["AlgorithmIdentifier"],
        hashedMessage: new asn1js.OctetString({ valueHex: fakeHex })
      })).toSchema()
    });
  });

  it("NameConstraints", () => {
    results["NameConstraints"] = new pkijs.NameConstraints({
      schema: (new pkijs.NameConstraints({
        permittedSubtrees: [
          results["GeneralSubtree"],
          results["GeneralSubtree"],
          results["GeneralSubtree"]
        ],
        excludedSubtrees: [
          results["GeneralSubtree"],
          results["GeneralSubtree"],
          results["GeneralSubtree"]
        ]
      })).toSchema()
    });
  });

  it("OriginatorPublicKey", () => {
    results["OriginatorPublicKey"] = new pkijs.OriginatorPublicKey({
      schema: (new pkijs.OriginatorPublicKey({
        algorithm: results["AlgorithmIdentifier"],
        publicKey: new asn1js.BitString({ valueHex: fakeHex })
      })).toSchema()
    });
  });

  it("OriginatorIdentifierOrKey", () => {
    results["OriginatorIdentifierOrKey1"] = new pkijs.OriginatorIdentifierOrKey({
      schema: (new pkijs.OriginatorIdentifierOrKey({
        variant: 1,
        value: results["IssuerAndSerialNumber"]
      })).toSchema()
    });

    results["OriginatorIdentifierOrKey2"] = new pkijs.OriginatorIdentifierOrKey({
      schema: (new pkijs.OriginatorIdentifierOrKey({
        variant: 2,
        value: new asn1js.OctetString({ valueHex: fakeHex })
      })).toSchema()
    });

    results["OriginatorIdentifierOrKey3"] = new pkijs.OriginatorIdentifierOrKey({
      schema: (new pkijs.OriginatorIdentifierOrKey({
        variant: 3,
        value: results["OriginatorPublicKey"]
      })).toSchema()
    });
  });

  it("OtherPrimeInfo", () => {
    results["OtherPrimeInfo"] = new pkijs.OtherPrimeInfo({
      schema: (new pkijs.OtherPrimeInfo({
        prime: new asn1js.Integer({ value: 10 }),
        exponent: new asn1js.Integer({ value: 10 }),
        coefficient: new asn1js.Integer({ value: 10 }),
      })).toSchema()
    });
  });

  it("OtherRecipientInfo", () => {
    results["OtherRecipientInfo"] = new pkijs.OtherRecipientInfo({
      schema: (new pkijs.OtherRecipientInfo({
        oriType: fakeOID,
        oriValue: new asn1js.Null()
      })).toSchema()
    });
  });

  it("OtherRevocationInfoFormat", () => {
    results["OtherRevocationInfoFormat"] = new pkijs.OtherRevocationInfoFormat({
      schema: (new pkijs.OtherRevocationInfoFormat({
        otherRevInfoFormat: fakeString,
        otherRevInfo: new asn1js.Null()
      })).toSchema()
    });
  });

  it("PasswordRecipientinfo", () => {
    results["PasswordRecipientinfo"] = new pkijs.PasswordRecipientinfo({
      schema: (new pkijs.PasswordRecipientinfo({
        version: 10,
        keyDerivationAlgorithm: results["AlgorithmIdentifier"],
        keyEncryptionAlgorithm: results["AlgorithmIdentifier"],
        encryptedKey: new asn1js.OctetString({ valueHex: fakeHex }),
        password: fakeHex
      })).toSchema()
    });
  });

  it("PBES2Params", () => {
    results["PBES2Params"] = new pkijs.PBES2Params({
      schema: (new pkijs.PBES2Params({
        keyDerivationFunc: results["AlgorithmIdentifier"],
        encryptionScheme: results["AlgorithmIdentifier"]
      })).toSchema()
    });
  });

  /*
    it("PBKDF2Params", () =>
    {
      results["PBKDF2Params1"] = new pkijs.PBKDF2Params({
        schema: (new pkijs.PBKDF2Params({
          salt: new asn1js.OctetString({ valueHex: fakeHex }),
          iterationCount: 10,
          keyLength: 10,
          prf: results["AlgorithmIdentifier"]
        })).toSchema()
      });

      results["PBKDF2Params2"] = new pkijs.PBKDF2Params({
        schema: (new pkijs.PBKDF2Params({
          salt: results["AlgorithmIdentifier"],
          iterationCount: 10,
          keyLength: 10,
          prf: results["AlgorithmIdentifier"]
        })).toSchema()
      });
    });
  */

  it("__template__", () => {
    results["AuthorityKeyIdentifier"] = new pkijs.AuthorityKeyIdentifier({
      schema: (new pkijs.AuthorityKeyIdentifier({
      })).toSchema()
    });
  });

  context("SignedData", () => {

    context("get signing certificate", () => {

      const b64 = "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";
      const raw = new Uint8Array(pvtsutils.Convert.FromBase64(b64)).buffer;
      let signedData: pkijs.SignedData;

      before(() => {
        const asn = asn1js.fromBER(raw);
        assert.ok(asn.result, "Cannot parse ASN.1 SignedData");

        signedData = new pkijs.SignedData({ schema: asn.result });
      });

      it("IssuerAndSerialNumber", async () => {
        const ok = await signedData.verify({
          checkChain: false,
          signer: 0,
          trustedCerts: signedData.certificates as pkijs.Certificate[],
        });
        assert.deepEqual(ok, true);
      });

      it("Primitive KeyIdentifier", async () => {
        const ok = await signedData.verify({
          checkChain: false,
          signer: 1,
          trustedCerts: signedData.certificates as pkijs.Certificate[],
        });
        assert.deepEqual(ok, true);
      });

      it("Constructed KeyIdentifier", async () => {
        const ok = await signedData.verify({
          checkChain: false,
          signer: 2,
          trustedCerts: signedData.certificates as pkijs.Certificate[],
        });
        assert.deepEqual(ok, true);
      });

    });

  });

  context("setEngine/getEngine", () => {
    const crypto = new Crypto();
    const provider = new pkijs.CryptoEngine({
      name: "",
      crypto,
    });

    const tests: {
      name: string;
      args: [string, ...any[]];
      want: null | Crypto;
      browser?: boolean;
    }[] = [
        {
          name: "use deprecated (name, crypto, subtle)",
          args: ["test", crypto, crypto.subtle],
          want: crypto,
        },
        {
          name: "use deprecated (name, provider, provider)",
          args: ["test", provider, provider],
          want: crypto,
        },
        {
          name: "name, provider",
          args: ["test", provider],
          want: crypto,
        },
        {
          name: "default NodeJS",
          args: ["test"],
          want: null,
        },
        {
          name: "default Browser",
          args: ["test"],
          want: crypto,
          browser: true,
        },
      ];

    let oldEngine: pkijs.GlobalCryptoEngine;
    before(() => {
      oldEngine = pkijs.getEngine();
    });

    beforeEach(() => {
      pkijs.engine.name = "none";
      pkijs.engine.crypto = null;
      delete (global as any)[process.pid];
    });

    after(() => {
      if (oldEngine.crypto) {
        pkijs.setEngine(oldEngine.name, oldEngine.crypto);
      }
    });

    for (const t of tests) {
      it(t.name, () => {
        if (t.browser) {
          (global as any).self = (global as any).window = { crypto };
        }

        try {
          pkijs.setEngine.apply(undefined, t.args as any);
          const engine = pkijs.getEngine();
          assert.strictEqual(engine.name, t.args[0], "incorrect name");
          if (t.want === null) {
            assert.strictEqual(engine.crypto, t.want, "engine.crypto shall be null");
          } else {
            assert.ok(engine.crypto instanceof pkijs.CryptoEngine, "engine.crypto shall be CryptoEngine");
            assert.ok(engine.crypto.crypto instanceof Crypto, "engine.crypto.crypto shall be Crypto");
            assert.equal(engine.crypto.subtle, crypto.subtle, "engine.subtle shall be SubtleCrypto");
          }
        } finally {
          if (t.browser) {
            delete (global as any).self;
            delete (global as any).window;
          }
        }
      });
    }

  });

});
