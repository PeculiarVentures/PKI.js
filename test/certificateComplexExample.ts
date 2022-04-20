import * as asn1js from "asn1js";
import * as pkijs from "../src";
import "./utils";

export async function createCertificate(hashAlg: string, signAlg: string) {
  const certificate = new pkijs.Certificate();
  const crypto = pkijs.getCrypto(true);

  //#region Put a static values
  certificate.version = 2;
  certificate.serialNumber = new asn1js.Integer({ value: 1 });
  certificate.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
    type: "2.5.4.6", // Country name
    value: new asn1js.PrintableString({ value: "RU" })
  }));
  certificate.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
    type: "2.5.4.3", // Common name
    value: new asn1js.BmpString({ value: "Test" })
  }));
  certificate.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
    type: "2.5.4.6", // Country name
    value: new asn1js.PrintableString({ value: "RU" })
  }));
  certificate.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
    type: "2.5.4.3", // Common name
    value: new asn1js.BmpString({ value: "Test" })
  }));

  certificate.notBefore.value = new Date();
  certificate.notAfter.value = new Date();
  certificate.notAfter.value.setFullYear(certificate.notAfter.value.getFullYear() + 1);

  certificate.extensions = []; // Extensions are not a part of certificate by default, it's an optional array

  //#region "BasicConstraints" extension
  const basicConstr = new pkijs.BasicConstraints({
    cA: true,
    pathLenConstraint: 3
  });

  certificate.extensions.push(new pkijs.Extension({
    extnID: "2.5.29.19",
    critical: true,
    extnValue: basicConstr.toSchema().toBER(false),
    parsedValue: basicConstr // Parsed value for well-known extensions
  }));
  //#endregion

  //#region "KeyUsage" extension
  const bitArray = new ArrayBuffer(1);
  const bitView = new Uint8Array(bitArray);

  bitView[0] |= 0x02; // Key usage "cRLSign" flag
  bitView[0] |= 0x04; // Key usage "keyCertSign" flag

  const keyUsage = new asn1js.BitString({ valueHex: bitArray });

  certificate.extensions.push(new pkijs.Extension({
    extnID: "2.5.29.15",
    critical: false,
    extnValue: keyUsage.toBER(false),
    parsedValue: keyUsage // Parsed value for well-known extensions
  }));
  //#endregion

  //#region "ExtendedKeyUsage" extension
  const extKeyUsage = new pkijs.ExtKeyUsage({
    keyPurposes: [
      "2.5.29.37.0",       // anyExtendedKeyUsage
      "1.3.6.1.5.5.7.3.1", // id-kp-serverAuth
      "1.3.6.1.5.5.7.3.2", // id-kp-clientAuth
      "1.3.6.1.5.5.7.3.3", // id-kp-codeSigning
      "1.3.6.1.5.5.7.3.4", // id-kp-emailProtection
      "1.3.6.1.5.5.7.3.8", // id-kp-timeStamping
      "1.3.6.1.5.5.7.3.9", // id-kp-OCSPSigning
      "1.3.6.1.4.1.311.10.3.1", // Microsoft Certificate Trust List signing
      "1.3.6.1.4.1.311.10.3.4"  // Microsoft Encrypted File System
    ]
  });

  certificate.extensions.push(new pkijs.Extension({
    extnID: "2.5.29.37",
    critical: false,
    extnValue: extKeyUsage.toSchema().toBER(false),
    parsedValue: extKeyUsage // Parsed value for well-known extensions
  }));

  //#region Microsoft-specific extensions
  const certType = new asn1js.Utf8String({ value: "certType" });

  certificate.extensions.push(new pkijs.Extension({
    extnID: "1.3.6.1.4.1.311.20.2",
    critical: false,
    extnValue: certType.toBER(false),
    parsedValue: certType // Parsed value for well-known extensions
  }));

  const prevHash = new asn1js.OctetString({ valueHex: (new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])).buffer });

  certificate.extensions.push(new pkijs.Extension({
    extnID: "1.3.6.1.4.1.311.21.2",
    critical: false,
    extnValue: prevHash.toBER(false),
    parsedValue: prevHash // Parsed value for well-known extensions
  }));

  const certificateTemplate = new pkijs.CertificateTemplate({
    templateID: "1.1.1.1.1.1",
    templateMajorVersion: 10,
    templateMinorVersion: 20
  });

  certificate.extensions.push(new pkijs.Extension({
    extnID: "1.3.6.1.4.1.311.21.7",
    critical: false,
    extnValue: certificateTemplate.toSchema().toBER(false),
    parsedValue: certificateTemplate // Parsed value for well-known extensions
  }));

  const caVersion = new pkijs.CAVersion({
    certificateIndex: 10,
    keyIndex: 20
  });

  certificate.extensions.push(new pkijs.Extension({
    extnID: "1.3.6.1.4.1.311.21.1",
    critical: false,
    extnValue: caVersion.toSchema().toBER(false),
    parsedValue: caVersion // Parsed value for well-known extensions
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

  //#region Exporting public key into "subjectPublicKeyInfo" value of certificate
  await certificate.subjectPublicKeyInfo.importKey(publicKey);
  //#endregion

  //#region Signing final certificate
  await certificate.sign(privateKey, hashAlg);
  //#endregion

  return {
    certificate,
    certificateBuffer: certificate.toSchema(true).toBER(false),
    privateKeyBuffer: await crypto.exportKey("pkcs8", privateKey),
  }
    ;
}

export async function verifyCertificate(certificateBuffer: ArrayBuffer, intermediateCertificates: pkijs.Certificate[], trustedCertificates: pkijs.Certificate[], crls: pkijs.CertificateRevocationList[]) {
  //#region Major activities
  //#region Initial check
  if (certificateBuffer.byteLength === 0)
    return { result: false };
  //#endregion

  //#region Decode existing CERT
  const asn1 = asn1js.fromBER(certificateBuffer);
  pkijs.AsnError.assert(asn1, "Certificate");
  const certificate = new pkijs.Certificate({ schema: asn1.result });
  //#endregion

  //#region Create certificate's array (end-user certificate + intermediate certificates)
  const certificates = [];
  certificates.push(...intermediateCertificates);
  certificates.push(certificate);
  //#endregion

  //#region Make a copy of trusted certificates array
  const trustedCerts = [];
  trustedCerts.push(...trustedCertificates);
  //#endregion

  //#region Create new X.509 certificate chain object
  const certChainVerificationEngine = new pkijs.CertificateChainValidationEngine({
    trustedCerts,
    certs: certificates,
    crls,
  });
  //#endregion

  // Verify CERT
  return certChainVerificationEngine.verify();
  //#endregion
}
