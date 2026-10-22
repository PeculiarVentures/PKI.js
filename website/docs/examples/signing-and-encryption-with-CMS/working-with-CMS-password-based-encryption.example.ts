import * as pkijs from "pkijs";

const password = new TextEncoder().encode("correct horse battery staple");
const message = new TextEncoder().encode("Meet me at noon.");

// 1. Add a password recipient (variant 2). The content-encryption key is wrapped
//    with a key derived from the password with PBKDF2.
const enveloped = new pkijs.EnvelopedData();
enveloped.addRecipientByPreDefinedData(
  password.buffer,
  {
    hmacHashAlgorithm: "SHA-256",
    iterationCount: 100_000,
  },
  2, // 1 = shared key-encryption key (KEK), 2 = password
);
await enveloped.encrypt({ name: "AES-CBC", length: 256 } as AesKeyGenParams, message.buffer);

// 2. Wrap it in a ContentInfo and encode it
const contentInfo = new pkijs.ContentInfo({
  contentType: pkijs.ContentInfo.ENVELOPED_DATA,
  content: enveloped.toSchema(),
});
const der = contentInfo.toSchema().toBER();
console.log("CMS EnvelopedData (base64):", contentInfo.toString("base64"));

// 3. Parse and decrypt it with the same password
const parsed = new pkijs.EnvelopedData({ schema: pkijs.ContentInfo.fromBER(der).content });
const decrypted = await parsed.decrypt(0, { preDefinedData: password });
console.log("Decrypted:", new TextDecoder().decode(decrypted));

// A wrong password fails to unwrap the content-encryption key
const wrongPassword = new TextEncoder().encode("wrong password");
const rejected = await parsed.decrypt(0, { preDefinedData: wrongPassword }).then(
  () => false,
  (error: unknown) => {
    console.log("Wrong password rejected:", error instanceof Error ? error.name : error);
    return true;
  },
);
if (!rejected) {
  throw new Error("Decrypted with a wrong password");
}
