import * as pkijs from "pkijs";
import { createIdentity } from "../helpers";
import { download } from "../io";

// A certificate chain to bundle (see the overview for createIdentity)
const root = await createIdentity({ name: "Example Root CA", ca: true });
const intermediate = await createIdentity({ name: "Example Intermediate CA", issuer: root, ca: true });
const leaf = await createIdentity({ name: "example.com", issuer: intermediate });

// 1. A P7B file is a CMS SignedData with certificates and no signers or content
const signedData = new pkijs.SignedData({
  version: 1,
  encapContentInfo: new pkijs.EncapsulatedContentInfo({
    eContentType: pkijs.id_ContentType_Data,
  }),
  certificates: [leaf.certificate, intermediate.certificate, root.certificate],
});

const contentInfo = new pkijs.ContentInfo({
  contentType: pkijs.ContentInfo.SIGNED_DATA,
  content: signedData.toSchema(true),
});
const der = contentInfo.toSchema().toBER();
console.log("P7B (base64):", contentInfo.toString("base64"));
download("chain.p7b", der);

// 2. Parse a P7B file and list its certificates
const parsed = new pkijs.SignedData({ schema: pkijs.ContentInfo.fromBER(der).content });
for (const certificate of parsed.certificates ?? []) {
  if (certificate instanceof pkijs.Certificate) {
    const subject = certificate.subject.typesAndValues[0].value.valueBlock.value;
    const issuer = certificate.issuer.typesAndValues[0].value.valueBlock.value;
    console.log(`${subject} (issued by ${issuer})`);
  }
}
