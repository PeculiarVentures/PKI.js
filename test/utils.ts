import * as asn1js from "asn1js";
import { base64, toArrayBuffer } from "@peculiar/utils";
import * as pkijs from "../src";

export function fromBase64(text: string): ArrayBuffer {
  return toArrayBuffer(base64.decode(text));
}

export function fromPEM(pem: string): ArrayBuffer {
  return fromBase64(pem.replace(/-{5}(BEGIN|END) .*-{5}/gm, "").replace(/\s/gm, ""));
}

export interface CertificateWithPrivateKey {
  certificate: pkijs.Certificate;
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  pkcs8: ArrayBuffer;
  spki: ArrayBuffer;
}

export async function createSelfSignedCertificate(hashAlg: string, signAlg: string): Promise<CertificateWithPrivateKey> {
  const crypto = pkijs.getCrypto(true);

  //#region Create certificate
  const certificate = new pkijs.Certificate();
  certificate.version = 2;
  certificate.serialNumber = new asn1js.Integer({ value: 1 });
  certificate.issuer.typesAndValues.push(
    new pkijs.AttributeTypeAndValue({
      type: "2.5.4.6", // Country name
      value: new asn1js.PrintableString({ value: "RU" }),
    }),
  );
  certificate.issuer.typesAndValues.push(
    new pkijs.AttributeTypeAndValue({
      type: "2.5.4.3", // Common name
      value: new asn1js.BmpString({ value: "Test" }),
    }),
  );
  certificate.subject.typesAndValues.push(
    new pkijs.AttributeTypeAndValue({
      type: "2.5.4.6", // Country name
      value: new asn1js.PrintableString({ value: "RU" }),
    }),
  );
  certificate.subject.typesAndValues.push(
    new pkijs.AttributeTypeAndValue({
      type: "2.5.4.3", // Common name
      value: new asn1js.BmpString({ value: "Test" }),
    }),
  );

  certificate.notBefore.value = new Date();
  const notAfter = new Date();
  notAfter.setUTCFullYear(notAfter.getUTCFullYear() + 1);
  certificate.notAfter.value = notAfter;

  certificate.extensions = []; // Extensions are not a part of certificate by default, it's an optional array

  //#region "BasicConstraints" extension
  const basicConstr = new pkijs.BasicConstraints({
    cA: true,
    pathLenConstraint: 3,
  });

  certificate.extensions.push(
    new pkijs.Extension({
      extnID: "2.5.29.19",
      critical: false,
      extnValue: basicConstr.toSchema().toBER(false),
      parsedValue: basicConstr, // Parsed value for well-known extensions
    }),
  );
  //#endregion

  //#region "KeyUsage" extension
  const bitArray = new ArrayBuffer(1);
  const bitView = new Uint8Array(bitArray);

  bitView[0] |= 0x02; // Key usage "cRLSign" flag
  bitView[0] |= 0x04; // Key usage "keyCertSign" flag

  const keyUsage = new asn1js.BitString({ valueHex: bitArray });

  certificate.extensions.push(
    new pkijs.Extension({
      extnID: "2.5.29.15",
      critical: false,
      extnValue: keyUsage.toBER(false),
      parsedValue: keyUsage, // Parsed value for well-known extensions
    }),
  );
  //#endregion
  //#endregion

  const algorithm = pkijs.getAlgorithmParameters(signAlg, "generateKey") as any;
  if ("hash" in algorithm.algorithm) {
    algorithm.algorithm.hash.name = hashAlg;
  }

  const { privateKey, publicKey } = await crypto.generateKey(algorithm.algorithm, true, algorithm.usages);

  // Exporting public key into "subjectPublicKeyInfo" value of certificate
  await certificate.subjectPublicKeyInfo.importKey(publicKey);

  // Signing final certificate
  await certificate.sign(privateKey, hashAlg);

  // Exporting keys
  const pkcs8 = await crypto.exportKey("pkcs8", privateKey);
  const spki = await crypto.exportKey("spki", publicKey);

  return {
    certificate,
    privateKey,
    publicKey,
    pkcs8,
    spki,
  };
}
