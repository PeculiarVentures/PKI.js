import * as asn1js from "asn1js";
import * as pkijs from "../src";

export async function createCRL(hashAlg: string, signAlg: string) {
  // Get a "crypto" extension
  const crypto = pkijs.getCrypto(true);

  // Put a static values
  const crlSimpl = new pkijs.CertificateRevocationList();

  crlSimpl.version = 1;

  crlSimpl.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
    type: "2.5.4.6", // Country name
    value: new asn1js.PrintableString({
      value: "RU"
    })
  }));
  crlSimpl.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
    type: "2.5.4.3", // Common name
    value: new asn1js.BmpString({
      value: "Test"
    })
  }));

  crlSimpl.thisUpdate = new pkijs.Time({
    type: 0,
    value: new Date()
  });

  const revokedCertificate = new pkijs.RevokedCertificate({
    userCertificate: new asn1js.Integer({
      value: 999
    }),
    revocationDate: new pkijs.Time({
      value: new Date()
    }),
    crlEntryExtensions: new pkijs.Extensions({
      extensions: [new pkijs.Extension({
        extnID: "2.5.29.21", // cRLReason
        extnValue: (new asn1js.Enumerated({
          value: 1
        })).toBER(false)
      })]
    })
  });

  crlSimpl.revokedCertificates = [];
  crlSimpl.revokedCertificates.push(revokedCertificate);
  crlSimpl.crlExtensions = new pkijs.Extensions({
    extensions: [new pkijs.Extension({
      extnID: "2.5.29.20", // cRLNumber
      extnValue: (new asn1js.Integer({
        value: 2
      })).toBER(false)
    })]
  });

  // Create a new key pair
  //#region Get default algorithm parameters for key generation
  const algorithm = pkijs.getAlgorithmParameters(signAlg, "generateKey") as any;
  if ("hash" in algorithm.algorithm)
    algorithm.algorithm.hash.name = hashAlg;
  //#endregion

  const { privateKey, publicKey } = await crypto.generateKey(algorithm.algorithm, true, algorithm.usages) as Required<CryptoKeyPair>;

  // Store new key in an interim variables
  const issuerPublicKey = new pkijs.PublicKeyInfo();
  await issuerPublicKey.importKey(publicKey);

  // Signing final CRL
  await crlSimpl.sign(privateKey, hashAlg);

  // Encode and store CRL
  const crlBuffer = crlSimpl.toSchema(true).toBER(false);

  // Exporting private key
  const publicKeyBuffer = await crypto.exportKey("spki", publicKey);

  return {
    crlBuffer,
    publicKeyBuffer,
  };
}

export async function verifyCRL(crlBuffer: ArrayBuffer, issuer: pkijs.Certificate | ArrayBuffer) {
  //#region Initial check
  if (crlBuffer.byteLength === 0)
    throw new Error("Nothing to verify");

  if (!issuer)
    throw new Error("Load CRL's issuer certificate or public key");
  //#endregion

  //#region Decode existing CRL
  const asn1 = asn1js.fromBER(crlBuffer);
  const crlSimpl = new pkijs.CertificateRevocationList({
    schema: asn1.result
  });
  //#endregion

  //#region Verify CRL
  let verifyParams;

  if (issuer instanceof pkijs.Certificate) {
    verifyParams = {
      issuerCertificate: issuer,
    };
  } else {
    const asn = asn1js.fromBER(issuer);
    const publicKeyInfo = new pkijs.PublicKeyInfo({ schema: asn.result });
    verifyParams = {
      publicKeyInfo: publicKeyInfo,
    };
  }

  return crlSimpl.verify(verifyParams);
  //#endregion
}