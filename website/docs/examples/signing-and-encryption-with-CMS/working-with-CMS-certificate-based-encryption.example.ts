import * as pkijs from "pkijs";
import { createIdentity } from "../helpers";

// Two recipients: Bob has an RSA key, Carol an elliptic-curve key (see the overview for createIdentity)
const ca = await createIdentity({ name: "Example CA", ca: true });
const bob = await createIdentity({ name: "Bob", issuer: ca, keyType: "RSA" });
const carol = await createIdentity({ name: "Carol", issuer: ca });

const message = new TextEncoder().encode("Meet me at noon.");

// 1. Add a recipient per certificate. The content is encrypted once with a random key,
//    which is then encrypted for each recipient: with RSA-OAEP for Bob, ECDH for Carol.
const enveloped = new pkijs.EnvelopedData();
enveloped.addRecipientByCertificate(bob.certificate, { oaepHashAlgorithm: "SHA-256" });
enveloped.addRecipientByCertificate(carol.certificate, { kdfAlgorithm: "SHA-256" });
await enveloped.encrypt({ name: "AES-GCM", length: 256 } as AesKeyGenParams, message.buffer);

// 2. Wrap it in a ContentInfo and encode it
const contentInfo = new pkijs.ContentInfo({
  contentType: pkijs.ContentInfo.ENVELOPED_DATA,
  content: enveloped.toSchema(),
});
const der = contentInfo.toSchema().toBER();
console.log("CMS EnvelopedData (base64):", contentInfo.toString("base64"));

// 3. Each recipient decrypts with their certificate and private key (PKCS#8)
const parsed = new pkijs.EnvelopedData({ schema: pkijs.ContentInfo.fromBER(der).content });
console.log("Recipients:", parsed.recipientInfos.length);

for (const [index, recipient] of [bob, carol].entries()) {
  const decrypted = await parsed.decrypt(index, {
    recipientCertificate: recipient.certificate,
    recipientPrivateKey: await crypto.subtle.exportKey("pkcs8", recipient.keys.privateKey),
  });
  const name = recipient.certificate.subject.typesAndValues[0].value.valueBlock.value;
  console.log(`${name} reads:`, new TextDecoder().decode(decrypted));
}
