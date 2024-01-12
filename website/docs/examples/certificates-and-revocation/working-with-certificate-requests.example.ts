import * as pkijs from 'pkijs';
import * as asn1js from 'asn1js';

// Get a "crypto" extension
const crypto = pkijs.getCrypto(true);

const pkcs10 = new pkijs.CertificationRequest();

pkcs10.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
  type: "2.5.4.3",
  value: new asn1js.Utf8String({ value: "Test" })
}));

await pkcs10.subjectPublicKeyInfo.importKey(keys.publicKey);

pkcs10.attributes = [];

// Subject Alternative Name
const altNames = new pkijs.GeneralNames({
  names: [
    new pkijs.GeneralName({ // email
      type: 1,
      value: "email@address.com"
    }),
    new pkijs.GeneralName({ // domain
      type: 2,
      value: "www.domain.com"
    }),
  ]
});

// SubjectKeyIdentifier
const subjectKeyIdentifier = await crypto.digest({ name: "SHA-1" }, pkcs10.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex);

pkcs10.attributes.push(new pkijs.Attribute({
  type: "1.2.840.113549.1.9.14", // pkcs-9-at-extensionRequest
  values: [(new pkijs.Extensions({
    extensions: [
      new pkijs.Extension({
        extnID: "2.5.29.14", // id-ce-subjectKeyIdentifier
        critical: false,
        extnValue: (new asn1js.OctetString({ valueHex: subjectKeyIdentifier })).toBER(false)
      }),
      new pkijs.Extension({
        extnID: "2.5.29.17", // id-ce-subjectAltName
        critical: false,
        extnValue: altNames.toSchema().toBER(false)
      }),
      new pkijs.Extension({
        extnID: "1.2.840.113549.1.9.7", // pkcs-9-at-challengePassword
        critical: false,
        extnValue: (new asn1js.PrintableString({ value: "passwordChallenge" })).toBER(false)
      })
    ]
  })).toSchema()]
}));

// Signing final PKCS#10 request
await pkcs10.sign(keys.privateKey, "SHA-256");

const pkcs10Raw = pkcs10.toSchema(true).toBER();
