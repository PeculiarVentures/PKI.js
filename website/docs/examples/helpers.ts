import * as asn1js from "asn1js";
import * as pkijs from "pkijs";

export interface Identity {
  certificate: pkijs.Certificate;
  keys: CryptoKeyPair;
}

export interface CreateIdentityParams {
  /** Subject common name */
  name: string;
  /** Signs the certificate; when omitted, the certificate is self-signed */
  issuer?: Identity;
  /** Makes the certificate a CA that can sign certificates and CRLs */
  ca?: boolean;
  /** Extended key usage OIDs, such as "1.3.6.1.5.5.7.3.8" for timestamping */
  extKeyUsage?: string[];
  /** "RSA" creates an RSA key, which can also encrypt; "ECDSA" (the default) a P-256 key */
  keyType?: "ECDSA" | "RSA";
}

let lastSerialNumber = 0;

/** Creates a key pair and a certificate for it, valid for one year */
export async function createIdentity({ name, issuer, ca = false, extKeyUsage, keyType = "ECDSA" }: CreateIdentityParams): Promise<Identity> {
  const keys =
    keyType === "RSA"
      ? await crypto.subtle.generateKey(
          { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
          true,
          ["sign", "verify"],
        )
      : await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);

  const certificate = new pkijs.Certificate();
  certificate.version = 2;
  certificate.serialNumber = new asn1js.Integer({ value: ++lastSerialNumber });
  certificate.subject.typesAndValues.push(
    new pkijs.AttributeTypeAndValue({
      type: "2.5.4.3", // Common name
      value: new asn1js.Utf8String({ value: name }),
    }),
  );
  certificate.issuer = issuer ? issuer.certificate.subject : certificate.subject;
  certificate.notBefore.value = new Date();
  certificate.notAfter.value = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const basicConstraints = new pkijs.BasicConstraints({ cA: ca });
  certificate.extensions = [
    new pkijs.Extension({
      extnID: pkijs.id_BasicConstraints,
      critical: true,
      extnValue: basicConstraints.toSchema().toBER(),
      parsedValue: basicConstraints,
    }),
  ];
  if (extKeyUsage) {
    const extKeyUsageValue = new pkijs.ExtKeyUsage({ keyPurposes: extKeyUsage });
    certificate.extensions.push(
      new pkijs.Extension({
        extnID: pkijs.id_ExtKeyUsage,
        critical: true,
        extnValue: extKeyUsageValue.toSchema().toBER(),
        parsedValue: extKeyUsageValue,
      }),
    );
  }

  await certificate.subjectPublicKeyInfo.importKey(keys.publicKey);
  await certificate.sign((issuer ?? { keys }).keys.privateKey, "SHA-256");

  return { certificate, keys };
}

/** Decodes base64, ignoring line breaks and other whitespace */
export function fromBase64(base64: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(base64.replace(/\s+/g, "")), (char) => char.charCodeAt(0));
}

/** Encodes base64 in lines of 64 characters, as PEM does */
export function toBase64(data: BufferSource, lineLength = 64): string {
  const bytes = ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : new Uint8Array(data);
  const base64 = btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));
  return base64.match(new RegExp(`.{1,${lineLength}}`, "g"))?.join("\n") ?? "";
}

/** Encodes DER as PEM, such as "-----BEGIN CERTIFICATE-----" for the label "CERTIFICATE" */
export function toPEM(der: BufferSource, label: string): string {
  return `-----BEGIN ${label}-----\n${toBase64(der)}\n-----END ${label}-----\n`;
}

/** Reads one DER certificate, or any number of PEM certificates, such as a CA bundle */
export function readCertificates(data: Uint8Array<ArrayBuffer>): pkijs.Certificate[] {
  const text = new TextDecoder().decode(data);
  if (!text.includes("-----BEGIN CERTIFICATE-----")) {
    return [pkijs.Certificate.fromBER(data)];
  }
  const blocks = text.matchAll(/-----BEGIN CERTIFICATE-----([^-]+)-----END CERTIFICATE-----/g);
  return Array.from(blocks, ([, base64]) => pkijs.Certificate.fromBER(fromBase64(base64)));
}
