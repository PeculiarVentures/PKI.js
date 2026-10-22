import * as asn1js from "asn1js";
import * as pkijs from "pkijs";
import { createIdentity } from "../helpers";

// A CA and two certificates it issued (see the overview for createIdentity)
const ca = await createIdentity({ name: "Example CA", ca: true });
const revoked = await createIdentity({ name: "Revoked user", issuer: ca });
const valid = await createIdentity({ name: "Valid user", issuer: ca });

// 1. The CA creates a CRL that lists the revoked certificate's serial number
const crl = new pkijs.CertificateRevocationList();
crl.version = 1; // v2
crl.issuer = ca.certificate.subject;
crl.thisUpdate = new pkijs.Time({ type: 0, value: new Date() });
crl.nextUpdate = new pkijs.Time({ type: 0, value: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
crl.revokedCertificates = [
  new pkijs.RevokedCertificate({
    userCertificate: revoked.certificate.serialNumber,
    revocationDate: new pkijs.Time({ type: 0, value: new Date() }),
    crlEntryExtensions: new pkijs.Extensions({
      extensions: [
        new pkijs.Extension({
          extnID: "2.5.29.21", // CRL reason code
          critical: false,
          extnValue: new asn1js.Enumerated({ value: 1 }).toBER(), // keyCompromise
        }),
      ],
    }),
  }),
];
crl.crlExtensions = new pkijs.Extensions({
  extensions: [
    new pkijs.Extension({
      extnID: pkijs.id_CRLNumber,
      critical: false,
      extnValue: new asn1js.Integer({ value: 1 }).toBER(),
    }),
  ],
});
await crl.sign(ca.keys.privateKey, "SHA-256");
const der = crl.toSchema().toBER();
console.log("CRL (base64):", crl.toString("base64"));

// 2. A relying party parses the CRL and checks that the CA signed it
const parsed = pkijs.CertificateRevocationList.fromBER(der);
const signatureValid = await parsed.verify({ issuerCertificate: ca.certificate });
console.log("Signature valid:", signatureValid);
console.log("Next update:", parsed.nextUpdate?.value.toISOString());
for (const entry of parsed.revokedCertificates ?? []) {
  console.log("Revoked serial number:", entry.userCertificate.valueBlock.toString(), "on", entry.revocationDate.value.toISOString());
}

// 3. Look up certificates in it
console.log("'Revoked user' revoked:", parsed.isCertificateRevoked(revoked.certificate));
console.log("'Valid user' revoked:", parsed.isCertificateRevoked(valid.certificate));

// 4. Chain validation takes CRLs and fails for a revoked certificate
const engine = new pkijs.CertificateChainValidationEngine({
  trustedCerts: [ca.certificate],
  certs: [revoked.certificate],
  crls: [parsed],
});
const result = await engine.verify();
console.log("Chain valid for 'Revoked user':", result.result, `(${result.resultMessage})`);
if (!signatureValid || result.result) {
  throw new Error("Unexpected CRL check result");
}
