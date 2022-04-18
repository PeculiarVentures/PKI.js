import * as assert from "assert";
import * as asn1js from "asn1js";
import * as pkijs from "../src";
import "./utils";
import * as pvtsutils from "pvtsutils";

const recipientPrivateKeyPem = `
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgSgh0H70tbGuageLjXJ8+OhH6wzoSQJ96
qJ4PQ8RP2jagCgYIKoZIzj0DAQehRANCAAToW17Szlrc7F6JXyn3HggMkHx1TluBrteZ0WAQHV31u4yi
LaaR70atxlhCdMaTpFey+lnnjfSns3TipH47meUO
-----END PRIVATE KEY-----
`;
const recipientCertificatePem = `
-----BEGIN CERTIFICATE-----
MIIDrDCCAmCgAwIBAgIICTX8CVCpVZcwQQYJKoZIhvcNAQEKMDSgDzANBglghkgBZQMEAgEFAKEcMBoG
CSqGSIb3DQEBCDANBglghkgBZQMEAgEFAKIDAgEgMIGQMYGNMIGKBgNVBAMegYIAMAA2ADQAMABjAGYA
NQAyADMAMgA4ADkAZQBiAGYAMgBiADkAOAA4ADIAYwA2AGIAYQAxADgAYQAxAGIAOQBkAGMAYwAwAGEA
MABmADMAMABiADcAOAA2ADIAZABjADgAMgAxADEAZQA4ADAAZAAyAGIANAA1AGEANQBmAGEANQBkMB4X
DTIxMTAxNDEwMzMxOVoXDTIxMTAxNTEwMzMxOVowgZAxgY0wgYoGA1UEAx6BggAwADYANAAwAGMAZgA1
ADIAMwAyADgAOQBlAGIAZgAyAGIAOQA4ADgAMgBjADYAYgBhADEAOABhADEAYgA5AGQAYwBjADAAYQAw
AGYAMwAwAGIANwA4ADYAMgBkAGMAOAAyADEAMQBlADgAMABkADIAYgA0ADUAYQA1AGYAYQA1AGQwWTAT
BgcqhkjOPQIBBggqhkjOPQMBBwNCAAToW17Szlrc7F6JXyn3HggMkHx1TluBrteZ0WAQHV31u4yiLaaR
70atxlhCdMaTpFey+lnnjfSns3TipH47meUOo2swaTAPBgNVHRMBAf8EBTADAgEAMCsGA1UdIwQkMCKA
IGQM9SMonr8rmILGuhihudzAoPMLeGLcghHoDStFpfpdMCkGA1UdDgQiBCC4UlB2jJfY9+OEU+7mFsXS
qF+Cg/gKWUSxfD/jHpQ1XDBBBgkqhkiG9w0BAQowNKAPMA0GCWCGSAFlAwQCAQUAoRwwGgYJKoZIhvcN
AQEIMA0GCWCGSAFlAwQCAQUAogMCASADggEBAFT2wAXEKwmK0YgFWhX/QdWUAG4mlvcxqF+Re+UyW0/k
hfHKhgKP/z+CWdAKm1DD668rf7nQo4lQH3o8F3ksK3sTqTi5UXDB3S7xWnv1YFh73oQep3aDfKzpccLm
kFMUFatMJZmd+3N9uav5IA8TIIkFCqDVB59X9OCGvNubRZA+5q41b7TovTA04WBpiUxCWtKWJtArcU1I
hmu2w50768pQp9adVJCy7byQIzA1VE4g+85srzEiML2ICC1AVm25OzNs73nkDtdivZF81Wk1qheN0m57
NgeGVBTBKS4YLMeiMowMXJKoFnFqwyv+0JL0ZeFCh0al2RF+FDk86b1rykY=
-----END CERTIFICATE-----
`;
const envelopedDataPem = `
-----BEGIN CMS-----
MIIB/wYJKoZIhvcNAQcDoIIB8DCCAewCAQIxggF3oYIBcwIBA6BRoU8wCQYHKoZIzj0CAQNCAATqtUjV
kFlUhI0eYHRpRUFYeCJL7OXFTDGbFzLo75544lkdQ6QqUOAdjlCctmY1aURutiyp8ClU8S5B1rLPBJuZ
oUIEQO0Gsde4OdIqXuwrBdW+b+5JU4b4LmUJZCzEVpsmtAUBZ3wd7TsjuHbHtSvRpGUyw8Hu8hfyDefA
FQzaMnZjCoYwFwYGK4EEAQsDMA0GCWCGSAFlAwQBLQUAMIG9MIG6MIGdMIGQMYGNMIGKBgNVBAMegYIA
MAA2ADQAMABjAGYANQAyADMAMgA4ADkAZQBiAGYAMgBiADkAOAA4ADIAYwA2AGIAYQAxADgAYQAxAGIA
OQBkAGMAYwAwAGEAMABmADMAMABiADcAOAA2ADIAZABjADgAMgAxADEAZQA4ADAAZAAyAGIANAA1AGEA
NQBmAGEANQBkAggJNfwJUKlVlwQYMK8dCPR+rZ+p8f9JoB2+ns5mGIV45F7MMIAGCSqGSIb3DQEHATAd
BglghkgBZQMEAQIEEFlT3Jb453LG9SVYa7MaWiCggAQgXNT1MFuyL+mH3XORYWrmsk9a1qui+48NZZbJ
qH9W/zoAAAAAoRgwFgYIBAB/ABEAAQAxCgIIMltJu53L4Og=
-----END CMS-----
`;

it("EnvelopedData with an ECCCMSSharedInfo containing algorithmParams should be decrypted", async () => {
	const recipientPrivateKey = pemToDer(recipientPrivateKeyPem);

	const recipientCertificate = new pkijs.Certificate({ schema: pemToAsn1(recipientCertificatePem) });

	const contentInfo = new pkijs.ContentInfo({ schema: pemToAsn1(envelopedDataPem) });
	const envelopedData = new pkijs.EnvelopedData({ schema: contentInfo.content });

	const plaintext = await envelopedData.decrypt(0, { recipientCertificate, recipientPrivateKey });
	assert.equal("Hi. My name is Alice.", pvtsutils.Convert.ToUtf8String(plaintext));
});

function pemToDer(pemString: string) {
	const derBase64 = pemString.replace(/(-----(BEGIN|END) [\w ]+-----|\n)/g, "").replace(/[\r\n]/g, "");
	return pvtsutils.Convert.FromBase64(derBase64);
}

function pemToAsn1(pemString: string) {
	const der = pemToDer(pemString);
	const asn1 = asn1js.fromBER(der);
	pkijs.AsnError.assert(asn1, "DER-encoded data");

	return asn1.result;
}
