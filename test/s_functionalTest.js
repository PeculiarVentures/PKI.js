/* eslint-disable no-undef,no-unreachable */
import * as asn1js from "asn1js";
import * as pkijs from "../src/index.js";

const { Crypto } = require("@peculiar/webcrypto");
const webcrypto = new Crypto();

const assert = require("assert");
pkijs.setEngine("newEngine", webcrypto, new pkijs.CryptoEngine({ name: "", crypto: webcrypto, subtle: webcrypto.subtle }));
//*********************************************************************************
context("PKIjs functional testing", () => {
	//region Initial variables
	const results = {};
	const fakeHex = (new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x01, 0x02])).buffer;
	const fakeString = "fakeString";
	const fakeOID = "1.2.3.4.5";
	//endregion

	it("GeneralName", () => {
		// results["GeneralName0"] = new pkijs.GeneralName({
		// 	schema: (new pkijs.GeneralName({
		// 		type: 0,
		// 		value: new asn1js.Sequence({
		// 			value: [
		// 				new asn1js.ObjectIdentifier({ value: fakeOID }),
		// 				new asn1js.Constructed({
		// 					idBlock: {
		// 						tagClass: 3, // CONTEXT-SPECIFIC
		// 						tagNumber: 0 // [0]
		// 					},
		// 					value: [new asn1js.Null()]
		// 				})
		// 			]
		// 		})
		// 	})).toSchema()
		// });

		results["GeneralName1"] = new pkijs.GeneralName({
			schema: (new pkijs.GeneralName({
				type: 1,
				value: fakeString
			})).toSchema()
		});



		//
		// results["GeneralName2"] = new pkijs.GeneralName({
		// 	schema: (new pkijs.GeneralName({
		// 		type: 2,
		// 		value: fakeString
		// 	})).toSchema()
		// });

		// results["GeneralName3"] = new pkijs.GeneralName({
		// 	schema: (new pkijs.GeneralName({
		// 		type: 3,
		// 		value: fakeString
		// 	})).toSchema()
		// });
	});

	it("AuthorityKeyIdentifier", () => {
		results["AuthorityKeyIdentifier"] = new pkijs.AuthorityKeyIdentifier({
			schema: (new pkijs.AuthorityKeyIdentifier({
				keyIdentifier: new asn1js.OctetString({ valueHex: fakeHex }),
				authorityCertIssuer: [
					results["GeneralName1"],
					results["GeneralName1"],
					results["GeneralName1"]
				],
				authorityCertSerialNumber: new asn1js.Integer({ valueHex: fakeHex })
			})).toSchema()
		});
	});

	it("Accuracy", () => {
		results["Accuracy"] = new pkijs.Accuracy({
			schema: (new pkijs.Accuracy({
				seconds: 1000,
				millis: 1000,
				micros: 1000
			})).toSchema()
		});
	});

	it("AlgorithmIdentifier", () => {
		results["AlgorithmIdentifier"] = new pkijs.AlgorithmIdentifier({
			schema: (new pkijs.AlgorithmIdentifier({
				algorithmId: fakeOID,
				algorithmParams: new asn1js.Null()
			})).toSchema()
		});
	});

	it("Attribute", () => {
		results["Attribute"] = new pkijs.Attribute({
			schema: (new pkijs.Attribute({
				type: fakeOID,
				values: [
					new asn1js.Null()
				]
			})).toSchema()
		});
	});

	it("AccessDescription", () => {
		results["AccessDescription"] = new pkijs.AccessDescription({
			schema: (new pkijs.AccessDescription({
				accessMethod: fakeOID,
				accessLocation: results["GeneralName1"]
			})).toSchema()
		});
	});

	it("AltName", () => {
		results["AltName"] = new pkijs.AltName({
			schema: (new pkijs.AltName({
				altNames: [
					results["GeneralName1"],
					results["GeneralName1"],
					results["GeneralName1"]
				]
			})).toSchema()
		});
	});

	it("Attribute", () => {
		results["Attribute"] = new pkijs.Attribute({
			schema: (new pkijs.Attribute({
				type: fakeOID,
				values: [
					new asn1js.Null(),
					new asn1js.Null()
				]
			})).toSchema()
		});
	});

	it("BasicConstraints", () => {
		results["BasicConstraints"] = new pkijs.BasicConstraints({
			schema: (new pkijs.BasicConstraints({
				cA: false,
				pathLenConstraint: 10
			})).toSchema()
		});
	});

	it("AttributeTypeAndValue", () => {
		results["AttributeTypeAndValue"] = new pkijs.AttributeTypeAndValue({
			schema: (new pkijs.AttributeTypeAndValue({
				type: fakeOID,
				value: new asn1js.Null()
			})).toSchema()
		});
	});

	it("CertID", () => {
		results["CertID"] = new pkijs.CertID({
			schema: (new pkijs.CertID({
				hashAlgorithm: results["AlgorithmIdentifier"],
				issuerNameHash: new asn1js.OctetString({ valueHex: fakeHex }),
				issuerKeyHash: new asn1js.OctetString({ valueHex: fakeHex }),
				serialNumber: new asn1js.Integer({ value: 10 })
			})).toSchema()
		});
	});

	it("PolicyQualifierInfo", () => {
		results["PolicyQualifierInfo"] = new pkijs.PolicyQualifierInfo({
			schema: (new pkijs.PolicyQualifierInfo({
				policyQualifierId: fakeOID,
				qualifier: new asn1js.Null()
			})).toSchema()
		});
	});

	it("PolicyInformation", () => {
		results["PolicyInformation"] = new pkijs.PolicyInformation({
			schema: (new pkijs.PolicyInformation({
				policyIdentifier: fakeOID,
				policyQualifiers: [
					results["PolicyQualifierInfo"],
					results["PolicyQualifierInfo"],
					results["PolicyQualifierInfo"]
				]
			})).toSchema()
		});
	});

	it("CertificatePolicies", () => {
		results["CertificatePolicies"] = new pkijs.CertificatePolicies({
			schema: (new pkijs.CertificatePolicies({
				certificatePolicies: [
					results["PolicyInformation"],
					results["PolicyInformation"],
					results["PolicyInformation"]
				]
			})).toSchema()
		});
	});

	it("ContentInfo", () => {
		results["ContentInfo"] = new pkijs.ContentInfo({
			schema: (new pkijs.ContentInfo({
				contentType: fakeOID,
				content: new asn1js.Null()
			})).toSchema()
		});
	});

	it("DigestInfo", () => {
		results["DigestInfo"] = new pkijs.DigestInfo({
			schema: (new pkijs.DigestInfo({
				digestAlgorithm: results["AlgorithmIdentifier"],
				digest: new asn1js.OctetString({ valueHex: fakeHex })
			})).toSchema()
		});
	});

	it("RelativeDistinguishedNames", () => {
		results["RelativeDistinguishedNames"] = new pkijs.RelativeDistinguishedNames({
			schema: (new pkijs.RelativeDistinguishedNames({
				typesAndValues: [
					results["AttributeTypeAndValue"],
					results["AttributeTypeAndValue"],
					results["AttributeTypeAndValue"]
				],
				//valueBeforeDecode - should be missing because of "toSchema" internal functionality
			})).toSchema()
		});
	});

	it("DistinguishedName", () => {
		results["DistinguishedName"] = new pkijs.DistinguishedName({
			schema: (new pkijs.DistinguishedName({
				relativeDistinguishedNames: [
					results["RelativeDistinguishedNames"],
					results["RelativeDistinguishedNames"],
					results["RelativeDistinguishedNames"]
				],
				//valueBeforeDecode - should be missing because of "toSchema" internal functionality
			})).toSchema()
		});
	});

	it("DistributionPoint", () => {
		results["DistributionPoint"] = new pkijs.DistributionPoint({
			schema: (new pkijs.DistributionPoint({
				distributionPoint: [
					results["GeneralName1"],
					results["GeneralName1"],
					results["GeneralName1"]
				],
				reasons: new asn1js.BitString({ valueHex: fakeHex }),
				cRLIssuer: [
					results["GeneralName1"],
					results["GeneralName1"],
					results["GeneralName1"]
				]
			})).toSchema()
		});
	});

	it("ECCCMSSharedInfo", () => {
		results["ECCCMSSharedInfo"] = new pkijs.ECCCMSSharedInfo({
			schema: (new pkijs.ECCCMSSharedInfo({
				keyInfo: results["AlgorithmIdentifier"],
				entityUInfo: new asn1js.OctetString({ valueHex: fakeHex }),
				suppPubInfo: new asn1js.OctetString({ valueHex: fakeHex })
			})).toSchema()
		});
	});

	it("ECPublicKey", () => {
		results["ECPublicKey"] = new pkijs.ECPublicKey({
			schema: (new pkijs.ECPublicKey({
				x: fakeHex,
				y: fakeHex,
				namedCurve: "1.2.840.10045.3.1.7"
			})).toSchema().data, // Return specifically ArrayBuffer
			namedCurve: "1.2.840.10045.3.1.7" // Needs specifically for this class
		});
	});

	it("ECPrivateKey", () => {
		results["ECPrivateKey"] = new pkijs.ECPrivateKey({
			schema: (new pkijs.ECPrivateKey({
				version: 1,
				privateKey: new asn1js.OctetString({ valueHex: fakeHex }),
				namedCurve: "1.2.840.10045.3.1.7",
				publicKey: results["ECPublicKey"]
			})).toSchema()
		});
	});

	it("EncapsulatedContentInfo", () => {
		results["EncapsulatedContentInfo"] = new pkijs.EncapsulatedContentInfo({
			schema: (new pkijs.EncapsulatedContentInfo({
				eContentType: fakeOID,
				eContent: new asn1js.OctetString({ valueHex: fakeHex })
			})).toSchema()
		});
	});

	it("EncryptedContentInfo", () => {
		results["EncryptedContentInfo"] = new pkijs.EncryptedContentInfo({
			schema: (new pkijs.EncryptedContentInfo({
				contentType: fakeOID,
				contentEncryptionAlgorithm: results["AlgorithmIdentifier"],
				encryptedContent: new asn1js.OctetString({ valueHex: fakeHex })
			})).toSchema()
		});
	});

	it("EncryptedData", () => {
		results["EncryptedData"] = new pkijs.EncryptedData({
			schema: (new pkijs.EncryptedData({
				version: 1,
				encryptedContentInfo: results["EncryptedContentInfo"],
				unprotectedAttrs: [
					results["Attribute"],
					results["Attribute"],
					results["Attribute"]
				]
			})).toSchema()
		});
	});

	it("Extension", () => {
		results["Extension"] = new pkijs.Extension({
			schema: (new pkijs.Extension({
				extnID: fakeOID,
				critical: true,
				extnValue: fakeHex
			})).toSchema()
		});
	});

	it("Extensions", () => {
		results["Extensions"] = new pkijs.Extensions({
			schema: (new pkijs.Extensions({
				extensions: [
					results["Extension"],
					results["Extension"],
					results["Extension"]
				]
			})).toSchema()
		});
	});

	it("ExtKeyUsage", () => {
		results["ExtKeyUsage"] = new pkijs.ExtKeyUsage({
			schema: (new pkijs.ExtKeyUsage({
				keyPurposes: [
					fakeOID,
					fakeOID,
					fakeOID
				]
			})).toSchema()
		});
	});

	it("GeneralNames", () => {
		results["GeneralNames"] = new pkijs.GeneralNames({
			schema: (new pkijs.GeneralNames({
				names: [
					results["GeneralName1"],
					results["GeneralName1"],
					results["GeneralName1"]
				]
			})).toSchema()
		});
	});

	it("GeneralSubtree", () => {
		results["GeneralSubtree"] = new pkijs.GeneralSubtree({
			schema: (new pkijs.GeneralSubtree({
				base: results["GeneralName1"],
				minimum: 1,
				maximum: 10
			})).toSchema()
		});
	});

	it("InfoAccess", () => {
		results["InfoAccess"] = new pkijs.InfoAccess({
			schema: (new pkijs.InfoAccess({
				accessDescriptions: [
					results["AccessDescription"],
					results["AccessDescription"],
					results["AccessDescription"]
				]
			})).toSchema()
		});
	});

	it("IssuerAndSerialNumber", () => {
		results["IssuerAndSerialNumber"] = new pkijs.IssuerAndSerialNumber({
			schema: (new pkijs.IssuerAndSerialNumber({
				issuer: results["DistinguishedName"],
				serialNumber: new asn1js.Integer({ value: 10 })
			})).toSchema()
		});
	});

	it("IssuingDistributionPoint", () => {
		results["IssuingDistributionPoint1"] = new pkijs.IssuingDistributionPoint({
			schema: (new pkijs.IssuingDistributionPoint({
				distributionPoint: [
					results["GeneralName1"],
					results["GeneralName1"],
					results["GeneralName1"]
				],
				onlyContainsUserCerts: true,
				onlyContainsCACerts: false,
				onlySomeReasons: 10,
				indirectCRL: false,
				onlyContainsAttributeCerts: true
			})).toSchema()
		});

		results["IssuingDistributionPoint2"] = new pkijs.IssuingDistributionPoint({
			schema: (new pkijs.IssuingDistributionPoint({
				distributionPoint: results["DistinguishedName"],
				onlyContainsUserCerts: true,
				onlyContainsCACerts: false,
				onlySomeReasons: 10,
				indirectCRL: false,
				onlyContainsAttributeCerts: true
			})).toSchema()
		});
	});

	it("OtherKeyAttribute", () => {
		results["OtherKeyAttribute"] = new pkijs.OtherKeyAttribute({
			schema: (new pkijs.OtherKeyAttribute({
				keyAttrId: fakeOID,
				keyAttr: new asn1js.Null()
			})).toSchema()
		});
	});

	it("KEKIdentifier", () => {
		results["KEKIdentifier"] = new pkijs.KEKIdentifier({
			schema: (new pkijs.KEKIdentifier({
				keyIdentifier: new asn1js.OctetString({ valueHex: fakeHex }),
				date: new asn1js.GeneralizedTime({ valueDate: new Date() }),
				other: results["OtherKeyAttribute"]
			})).toSchema()
		});
	});

	it("KEKRecipientInfo", () => {
		results["KEKRecipientInfo"] = new pkijs.KEKRecipientInfo({
			schema: (new pkijs.KEKRecipientInfo({
				version: 1,
				kekid: results["KEKIdentifier"],
				keyEncryptionAlgorithm: results["AlgorithmIdentifier"],
				encryptedKey: new asn1js.OctetString({ valueHex: fakeHex }),
				preDefinedKEK: fakeHex
			})).toSchema()
		});
	});

	it("RecipientKeyIdentifier", () => {
		results["RecipientKeyIdentifier"] = new pkijs.RecipientKeyIdentifier({
			schema: (new pkijs.RecipientKeyIdentifier({
				subjectKeyIdentifier: new asn1js.OctetString({ valueHex: fakeHex }),
				date: new asn1js.GeneralizedTime({ valueDate: new Date() }),
				other: results["OtherKeyAttribute"]
			})).toSchema()
		});
	});

	it("KeyAgreeRecipientIdentifier", () => {
		results["KeyAgreeRecipientIdentifier1"] = new pkijs.KeyAgreeRecipientIdentifier({
			schema: (new pkijs.KeyAgreeRecipientIdentifier({
				variant: 1,
				value: results["IssuerAndSerialNumber"]
			})).toSchema()
		});

		results["KeyAgreeRecipientIdentifier2"] = new pkijs.KeyAgreeRecipientIdentifier({
			schema: (new pkijs.KeyAgreeRecipientIdentifier({
				variant: 2,
				value: results["RecipientKeyIdentifier"]
			})).toSchema()
		});
	});

	it("MacData", () => {
		results["MacData"] = new pkijs.MacData({
			schema: (new pkijs.MacData({
				mac: results["DigestInfo"],
				macSalt: new asn1js.OctetString({ valueHex: fakeHex }),
				iterations: 10
			})).toSchema()
		});
	});

	it("MessageImprint", () => {
		results["MessageImprint"] = new pkijs.MessageImprint({
			schema: (new pkijs.MessageImprint({
				hashAlgorithm: results["AlgorithmIdentifier"],
				hashedMessage: new asn1js.OctetString({ valueHex: fakeHex })
			})).toSchema()
		});
	});

	it("NameConstraints", () => {
		results["NameConstraints"] = new pkijs.NameConstraints({
			schema: (new pkijs.NameConstraints({
				permittedSubtrees: [
					results["GeneralSubtree"],
					results["GeneralSubtree"],
					results["GeneralSubtree"]
				],
				excludedSubtrees: [
					results["GeneralSubtree"],
					results["GeneralSubtree"],
					results["GeneralSubtree"]
				]
			})).toSchema()
		});
	});

	it("OriginatorPublicKey", () => {
		results["OriginatorPublicKey"] = new pkijs.OriginatorPublicKey({
			schema: (new pkijs.OriginatorPublicKey({
				algorithm: results["AlgorithmIdentifier"],
				publicKey: new asn1js.BitString({ valueHex: fakeHex })
			})).toSchema()
		});
	});

	it("OriginatorIdentifierOrKey", () => {
		results["OriginatorIdentifierOrKey1"] = new pkijs.OriginatorIdentifierOrKey({
			schema: (new pkijs.OriginatorIdentifierOrKey({
				variant: 1,
				value: results["IssuerAndSerialNumber"]
			})).toSchema()
		});

		results["OriginatorIdentifierOrKey2"] = new pkijs.OriginatorIdentifierOrKey({
			schema: (new pkijs.OriginatorIdentifierOrKey({
				variant: 2,
				value: new asn1js.OctetString({ valueHex: fakeHex })
			})).toSchema()
		});

		results["OriginatorIdentifierOrKey3"] = new pkijs.OriginatorIdentifierOrKey({
			schema: (new pkijs.OriginatorIdentifierOrKey({
				variant: 3,
				value: results["OriginatorPublicKey"]
			})).toSchema()
		});
	});

	it("OtherPrimeInfo", () => {
		results["OtherPrimeInfo"] = new pkijs.OtherPrimeInfo({
			schema: (new pkijs.OtherPrimeInfo({
				prime: new asn1js.Integer({ value: 10 }),
				exponent: new asn1js.Integer({ value: 10 }),
				coefficient: new asn1js.Integer({ value: 10 }),
			})).toSchema()
		});
	});

	it("OtherRecipientInfo", () => {
		results["OtherRecipientInfo"] = new pkijs.OtherRecipientInfo({
			schema: (new pkijs.OtherRecipientInfo({
				oriType: fakeOID,
				oriValue: new asn1js.Null()
			})).toSchema()
		});
	});

	it("OtherRevocationInfoFormat", () => {
		results["OtherRevocationInfoFormat"] = new pkijs.OtherRevocationInfoFormat({
			schema: (new pkijs.OtherRevocationInfoFormat({
				otherRevInfoFormat: fakeString,
				otherRevInfo: new asn1js.Null()
			})).toSchema()
		});
	});

	it("PasswordRecipientinfo", () => {
		results["PasswordRecipientinfo"] = new pkijs.PasswordRecipientinfo({
			schema: (new pkijs.PasswordRecipientinfo({
				version: 10,
				keyDerivationAlgorithm: results["AlgorithmIdentifier"],
				keyEncryptionAlgorithm: results["AlgorithmIdentifier"],
				encryptedKey: new asn1js.OctetString({ valueHex: fakeHex }),
				password: fakeHex
			})).toSchema()
		});
	});

	it("PBES2Params", () => {
		results["PBES2Params"] = new pkijs.PBES2Params({
			schema: (new pkijs.PBES2Params({
				keyDerivationFunc: results["AlgorithmIdentifier"],
				encryptionScheme: results["AlgorithmIdentifier"]
			})).toSchema()
		});
	});

	/*
		it("PBKDF2Params", () =>
		{
			results["PBKDF2Params1"] = new pkijs.PBKDF2Params({
				schema: (new pkijs.PBKDF2Params({
					salt: new asn1js.OctetString({ valueHex: fakeHex }),
					iterationCount: 10,
					keyLength: 10,
					prf: results["AlgorithmIdentifier"]
				})).toSchema()
			});
	
			results["PBKDF2Params2"] = new pkijs.PBKDF2Params({
				schema: (new pkijs.PBKDF2Params({
					salt: results["AlgorithmIdentifier"],
					iterationCount: 10,
					keyLength: 10,
					prf: results["AlgorithmIdentifier"]
				})).toSchema()
			});
		});
	*/

	it("__template__", () => {
		results["AuthorityKeyIdentifier"] = new pkijs.AuthorityKeyIdentifier({
			schema: (new pkijs.AuthorityKeyIdentifier({
			})).toSchema()
		});
	});
});
//*********************************************************************************