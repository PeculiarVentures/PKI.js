import * as pkijs from "pkijs";
import { createIdentity, fromBase64, toBase64 } from "../helpers";
import { download, text } from "../io";

// Change the message to encrypt
export const inputs = {
  message: text("Message", { sample: "Hello Bob,\n\nthis message is encrypted for you.\n\nAlice" }),
};

// The recipient's certificate and private key (see the overview for createIdentity)
const ca = await createIdentity({ name: "Example CA", ca: true });
const bob = await createIdentity({ name: "Bob", issuer: ca, keyType: "RSA" });

// 1. The content to encrypt is a MIME entity: headers, a blank line, and the text, with CRLF line breaks
const entity = `Content-Type: text/plain; charset=utf-8\r\n\r\n${inputs.message.value.replace(/\r?\n/g, "\r\n")}`;

// 2. Encrypt it as CMS EnvelopedData for the recipient's certificate
const enveloped = new pkijs.EnvelopedData();
enveloped.addRecipientByCertificate(bob.certificate, { oaepHashAlgorithm: "SHA-256" });
await enveloped.encrypt({ name: "AES-CBC", length: 256 } as AesKeyGenParams, new TextEncoder().encode(entity).buffer);
const cms = new pkijs.ContentInfo({
  contentType: pkijs.ContentInfo.ENVELOPED_DATA,
  content: enveloped.toSchema(),
}).toSchema().toBER();

// 3. Wrap it in an S/MIME message: an application/pkcs7-mime entity with base64 content
const email = [
  "From: Alice <alice@example.com>",
  "To: Bob <bob@example.com>",
  "Subject: Encrypted message from PKIjs",
  "MIME-Version: 1.0",
  'Content-Type: application/pkcs7-mime; smime-type=enveloped-data; name="smime.p7m"',
  "Content-Transfer-Encoding: base64",
  'Content-Disposition: attachment; filename="smime.p7m"',
  "",
  toBase64(cms, 76).replace(/\n/g, "\r\n"),
  "",
].join("\r\n");
console.log(email);
download("encrypted.eml", email);

// 4. Bob reads the message: decode the base64 body, then decrypt it with his private key
const body = email.slice(email.indexOf("\r\n\r\n") + 4);
const received = new pkijs.EnvelopedData({ schema: pkijs.ContentInfo.fromBER(fromBase64(body)).content });
const decrypted = await received.decrypt(0, {
  recipientCertificate: bob.certificate,
  recipientPrivateKey: await crypto.subtle.exportKey("pkcs8", bob.keys.privateKey),
});
console.log("Bob decrypts:");
console.log(new TextDecoder().decode(decrypted));
