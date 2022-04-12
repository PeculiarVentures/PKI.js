import * as asn1js from "asn1js";
import * as pkijs from "../src";

//#region Create P7B Data
export async function createP7B(hashAlg: string, signAlg: string): Promise<ArrayBuffer> {
  //#region Initial variables
  const certSimpl = new pkijs.Certificate();
  //#endregion
  //#region Get a "crypto" extension
  const crypto = pkijs.getCrypto(true);
  //#endregion
  //#region Put a static values
  certSimpl.version = 2;
  certSimpl.serialNumber = new asn1js.Integer({ value: 1 });

  certSimpl.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
    type: "2.5.4.6",
    value: new asn1js.PrintableString({ value: "RU" })
  }));
  certSimpl.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
    type: "2.5.4.3",
    value: new asn1js.BmpString({ value: "Test" })
  }));
  certSimpl.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
    type: "2.5.4.6",
    value: new asn1js.PrintableString({ value: "RU" })
  }));
  certSimpl.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
    type: "2.5.4.3",
    value: new asn1js.BmpString({ value: "Test" })
  }));

  certSimpl.notBefore.value = new Date(2013, 0, 1);
  certSimpl.notAfter.value = new Date(2016, 0, 1);

  certSimpl.extensions = []; // Extensions are not a part of certificate by default, it's an optional array


  //#region "KeyUsage" extension
  const bitArray = new ArrayBuffer(1);
  const bitView = new Uint8Array(bitArray);
  bitView[0] |= 0x02; // Key usage "cRLSign" flag


  //bitView[0] = bitView[0] | 0x04; // Key usage "keyCertSign" flag
  const keyUsage = new asn1js.BitString({ valueHex: bitArray });
  certSimpl.extensions.push(new pkijs.Extension({
    extnID: "2.5.29.15",
    critical: false,
    extnValue: keyUsage.toBER(false),
    parsedValue: keyUsage // Parsed value for well-known extensions
  }));
  //#endregion
  //#endregion
  //#region Create a new key pair
  //#region Get default algorithm parameters for key generation
  const algorithm = pkijs.getAlgorithmParameters(signAlg, "generateKey") as any;
  if ("hash" in algorithm.algorithm)
    algorithm.algorithm.hash.name = hashAlg;
  //#endregion
  const { privateKey, publicKey } = await crypto.generateKey(algorithm.algorithm, true, algorithm.usages) as Required<CryptoKeyPair>;
  //#endregion
  //#endregion
  //#region Exporting public key into "subjectPublicKeyInfo" value of certificate
  await certSimpl.subjectPublicKeyInfo.importKey(publicKey);
  //#endregion
  //#region Signing final certificate
  await certSimpl.sign(privateKey, hashAlg);
  //#endregion
  //#region Encode final ContentInfo
  const cmsContentSimp = new pkijs.ContentInfo({
    contentType: "1.2.840.113549.1.7.2",
    content: (new pkijs.SignedData({
      version: 1,
      encapContentInfo: new pkijs.EncapsulatedContentInfo({
        eContentType: "1.2.840.113549.1.7.1" // "data" content type
      }),
      certificates: [
        certSimpl,
        certSimpl,
        certSimpl
      ] // Put 3 copies of the same X.509 certificate
    })).toSchema(true)
  });

  return cmsContentSimp.toSchema().toBER(false);
  //#endregion
}
