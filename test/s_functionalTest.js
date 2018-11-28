/* eslint-disable no-undef,no-unreachable */
import * as asn1js from "asn1js";
import * as pkijs from "../src/index.js";

const WebCrypto = require("node-webcrypto-ossl");
const webcrypto = new WebCrypto();

const assert = require("assert");
pkijs.setEngine("newEngine", webcrypto, new pkijs.CryptoEngine({ name: "", crypto: webcrypto, subtle: webcrypto.subtle }));
//*********************************************************************************
context("PKIjs functional testing", () =>
{
	//region Initial variables
	const itResults = {};
	const fakeHex = (new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A])).buffer;
	const fakeString = "fakeString";
	const fakeOID = "1.2.3.4.5";
	//endregion

	it("GeneralName", () =>
	{
		// itResults["GeneralName0"] = new pkijs.GeneralName({
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

		itResults["GeneralName1"] = new pkijs.GeneralName({
			schema: (new pkijs.GeneralName({
				type: 1,
				value: fakeString
			})).toSchema()
		});



		//
		// itResults["GeneralName2"] = new pkijs.GeneralName({
		// 	schema: (new pkijs.GeneralName({
		// 		type: 2,
		// 		value: fakeString
		// 	})).toSchema()
		// });

		// itResults["GeneralName3"] = new pkijs.GeneralName({
		// 	schema: (new pkijs.GeneralName({
		// 		type: 3,
		// 		value: fakeString
		// 	})).toSchema()
		// });
	});

	it("AuthorityKeyIdentifier", () =>
	{
		itResults["AuthorityKeyIdentifier"] = new pkijs.AuthorityKeyIdentifier({
			schema: (new pkijs.AuthorityKeyIdentifier({
				keyIdentifier: new asn1js.OctetString({ valueHex: fakeHex }),
				authorityCertIssuer: [
					itResults["GeneralName1"],
					itResults["GeneralName1"],
					itResults["GeneralName1"]
				],
				authorityCertSerialNumber: new asn1js.Integer({ valueHex: fakeHex })
			})).toSchema()
		});
	});

	it("Accuracy", () =>
	{
		itResults["Accuracy"] = new pkijs.Accuracy({
			schema: (new pkijs.Accuracy({
				seconds: 1000,
				millis: 1000,
				micros: 1000
			})).toSchema()
		});
	});

	it("AlgorithmIdentifier", () =>
	{
		itResults["AlgorithmIdentifier"] = new pkijs.AlgorithmIdentifier({
			schema: (new pkijs.AlgorithmIdentifier({
				algorithmId: fakeOID,
				algorithmParams: new asn1js.Null()
			})).toSchema()
		});
	});

	it("Attribute", () =>
	{
		itResults["Attribute"] = new pkijs.Attribute({
			schema: (new pkijs.Attribute({
				type: fakeOID,
				values: [
					new asn1js.Null()
				]
			})).toSchema()
		});
	});

	it("AccessDescription", () =>
	{
		itResults["AccessDescription"] = new pkijs.AccessDescription({
			schema: (new pkijs.AccessDescription({
				accessMethod: fakeOID,
				accessLocation: itResults["GeneralName1"]
			})).toSchema()
		});
	});

	it("AltName", () =>
	{
		itResults["AltName"] = new pkijs.AltName({
			schema: (new pkijs.AltName({
				altNames: [
					itResults["GeneralName1"],
					itResults["GeneralName1"],
					itResults["GeneralName1"]
				]
			})).toSchema()
		});
	});

	it("Attribute", () =>
	{
		itResults["Attribute"] = new pkijs.Attribute({
			schema: (new pkijs.Attribute({
				type: fakeOID,
				values: [
					new asn1js.Null(),
					new asn1js.Null()
				]
			})).toSchema()
		});
	});

	it("BasicConstraints", () =>
	{
		itResults["BasicConstraints"] = new pkijs.BasicConstraints({
			schema: (new pkijs.BasicConstraints({
				cA: false,
				pathLenConstraint: 10
			})).toSchema()
		});
	});

	it("AttributeTypeAndValue", () =>
	{
		itResults["AttributeTypeAndValue"] = new pkijs.AttributeTypeAndValue({
			schema: (new pkijs.AttributeTypeAndValue({
				type: fakeOID,
				value: new asn1js.Null()
			})).toSchema()
		});
	});

	it("CertID", () =>
	{
		itResults["CertID"] = new pkijs.CertID({
			schema: (new pkijs.CertID({
				hashAlgorithm: itResults["AlgorithmIdentifier"],
				issuerNameHash: new asn1js.OctetString({ valueHex: fakeHex }),
				issuerKeyHash: new asn1js.OctetString({ valueHex: fakeHex }),
				serialNumber: new asn1js.Integer({ value: 10 })
			})).toSchema()
		});
	});

	it("__template__", () =>
	{
		itResults["AuthorityKeyIdentifier"] = new pkijs.AuthorityKeyIdentifier({
			schema: (new pkijs.AuthorityKeyIdentifier({

			})).toSchema()
		});
	});
});
//*********************************************************************************
