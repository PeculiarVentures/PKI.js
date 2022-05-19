import * as asn1js from "asn1js";
import * as pkijs from "../src";

/**
 * Create PKCS#10
 * @param hashAlg HAsh algorithm
 * @param signAlg Sign algorithm
 * @returns
 */
export async function createPKCS10Internal(hashAlg: string, signAlg: string) {
  //#region Initial variables
  const pkcs10 = new pkijs.CertificationRequest();
  //#endregion
  //#region Get a "crypto" extension
  const crypto = pkijs.getCrypto(true);
  //#endregion
  //#region Put a static values
  pkcs10.version = 0;
  pkcs10.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
    type: "2.5.4.6",
    value: new asn1js.PrintableString({ value: "RU" })
  }));
  pkcs10.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
    type: "2.5.4.3",
    value: new asn1js.Utf8String({ value: "Simple test (простой тест)" })
  }));

  const altNames = new pkijs.GeneralNames({
    names: [
      new pkijs.GeneralName({
        type: 1,
        value: "email@address.com"
      }),
      new pkijs.GeneralName({
        type: 2,
        value: "www.domain.com"
      }),
      new pkijs.GeneralName({
        type: 2,
        value: "www.anotherdomain.com"
      }),
      new pkijs.GeneralName({
        type: 7,
        value: new asn1js.OctetString({ valueHex: (new Uint8Array([0xC0, 0xA8, 0x00, 0x01])).buffer })
      }),
    ]
  });

  pkcs10.attributes = [];
  //#endregion
  //#region Create a new key pair
  //#region Get default algorithm parameters for key generation
  const algorithm = pkijs.getAlgorithmParameters(signAlg, "generateKey") as any;
  if ("hash" in algorithm.algorithm)
    algorithm.algorithm.hash.name = hashAlg;
  //#endregion
  const { privateKey, publicKey } = await crypto.generateKey(algorithm.algorithm, true, algorithm.usages) as Required<CryptoKeyPair>;
  //#endregion
  //#region Exporting public key into "subjectPublicKeyInfo" value of PKCS#10
  await pkcs10.subjectPublicKeyInfo.importKey(publicKey);
  //#endregion

  // SubjectKeyIdentifier
  const subjectKeyIdentifier = await crypto.digest({ name: "SHA-1" }, pkcs10.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHexView);
  pkcs10.attributes.push(new pkijs.Attribute({
    type: "1.2.840.113549.1.9.14",
    values: [(new pkijs.Extensions({
      extensions: [
        new pkijs.Extension({
          extnID: "2.5.29.14",
          critical: false,
          extnValue: (new asn1js.OctetString({ valueHex: subjectKeyIdentifier })).toBER(false)
        }),
        new pkijs.Extension({
          extnID: "2.5.29.17",
          critical: false,
          extnValue: altNames.toSchema().toBER(false)
        }),
        new pkijs.Extension({
          extnID: "1.2.840.113549.1.9.7",
          critical: false,
          extnValue: (new asn1js.PrintableString({ value: "passwordChallenge" })).toBER(false)
        })
      ]
    })).toSchema()]
  }));

  // Signing final PKCS#10 request
  await pkcs10.sign(privateKey, hashAlg);

  return pkcs10.toSchema().toBER(false);
}

export async function verifyPKCS10Internal(pkcs10Buffer: ArrayBuffer) {
  // Decode existing PKCS#10
  const pkcs10 = pkijs.CertificationRequest.fromBER(pkcs10Buffer);

  // PKCS#10
  return pkcs10.verify();
}
