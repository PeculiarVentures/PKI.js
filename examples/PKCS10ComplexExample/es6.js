/* eslint-disable no-undef,no-unreachable */
import * as asn1js from "asn1js";
import { arrayBufferToString, stringToArrayBuffer, toBase64, fromBase64 } from "pvutils";
import { getCrypto, getAlgorithmParameters, setEngine } from "../../src/common.js";
import { formatPEM } from "../../examples/examples_common.js";
import CertificationRequest from "../../src/CertificationRequest.js";
import AttributeTypeAndValue from "../../src/AttributeTypeAndValue.js";
import Attribute from "../../src/Attribute.js";
import Extension from "../../src/Extension.js";
import Extensions from "../../src/Extensions.js";
import RSAPublicKey from "../../src/RSAPublicKey.js";
import GeneralNames from "../../src/GeneralNames.js";
import GeneralName from "../../src/GeneralName.js";
//<nodewebcryptoossl>
//*********************************************************************************
let pkcs10Buffer = new ArrayBuffer(0);

let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-V1_5";
//*********************************************************************************
//region Create PKCS#10
//*********************************************************************************
function createPKCS10Internal()
{
	//region Initial variables
	let sequence = Promise.resolve();
	
	const pkcs10 = new CertificationRequest();
	
	let publicKey;
	let privateKey;
	//endregion
	
	//region Get a "crypto" extension
	const crypto = getCrypto();
	if(typeof crypto === "undefined")
		return Promise.reject("No WebCrypto extension found");
	//endregion
	
	//region Put a static values
	pkcs10.version = 0;
	pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.6",
		value: new asn1js.PrintableString({ value: "RU" })
	}));
	pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.3",
		value: new asn1js.Utf8String({ value: "Simple test (простой тест)" })
	}));
	
	const altNames = new GeneralNames({
		names: [
			new GeneralName({
				type: 1, // rfc822Name
				value: "email@address.com"
			}),
			new GeneralName({
				type: 2, // dNSName
				value: "www.domain.com"
			}),
			new GeneralName({
				type: 2, // dNSName
				value: "www.anotherdomain.com"
			}),
			new GeneralName({
				type: 7, // iPAddress
				value: new asn1js.OctetString({ valueHex: (new Uint8Array([0xC0, 0xA8, 0x00, 0x01])).buffer })
			}),
		]
	});
	
	pkcs10.attributes = [];
	//endregion
	
	//region Create a new key pair
	sequence = sequence.then(() =>
	{
		//region Get default algorithm parameters for key generation
		const algorithm = getAlgorithmParameters(signAlg, "generatekey");
		if("hash" in algorithm.algorithm)
			algorithm.algorithm.hash.name = hashAlg;
		//endregion
		
		return crypto.generateKey(algorithm.algorithm, true, algorithm.usages);
	});
	//endregion
	
	//region Store new key in an interim variables
	sequence = sequence.then(keyPair =>
	{
		publicKey = keyPair.publicKey;
		privateKey = keyPair.privateKey;
	},
	error => Promise.reject((`Error during key generation: ${error}`))
	);
	//endregion
	
	//region Exporting public key into "subjectPublicKeyInfo" value of PKCS#10
	sequence = sequence.then(() => pkcs10.subjectPublicKeyInfo.importKey(publicKey));
	//endregion
	
	//region SubjectKeyIdentifier
	sequence = sequence.then(() => crypto.digest({ name: "SHA-1" }, pkcs10.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex))
		.then(result =>
		{
			pkcs10.attributes.push(new Attribute({
				type: "1.2.840.113549.1.9.14", // pkcs-9-at-extensionRequest
				values: [(new Extensions({
					extensions: [
						new Extension({
							extnID: "2.5.29.14",
							critical: false,
							extnValue: (new asn1js.OctetString({ valueHex: result })).toBER(false)
						}),
						new Extension({
							extnID: "2.5.29.17",
							critical: false,
							extnValue: altNames.toSchema().toBER(false)
						}),
						new Extension({
							extnID: "1.2.840.113549.1.9.7",
							critical: false,
							extnValue: (new asn1js.PrintableString({ value: "passwordChallenge" })).toBER(false)
						})
					]
				})).toSchema()]
			}));
		}
		);
	//endregion
	
	//region Signing final PKCS#10 request
	sequence = sequence.then(() => pkcs10.sign(privateKey, hashAlg), error => Promise.reject(`Error during exporting public key: ${error}`));
	//endregion
	
	return sequence.then(() =>
	{
		pkcs10Buffer = pkcs10.toSchema().toBER(false);
		
	}, error => Promise.reject(`Error signing PKCS#10: ${error}`));
}
//*********************************************************************************
function createPKCS10()
{
	return Promise.resolve().then(() => createPKCS10Internal()).then(() =>
	{
		let resultString = "-----BEGIN CERTIFICATE REQUEST-----\r\n";
		resultString = `${resultString}${formatPEM(toBase64(arrayBufferToString(pkcs10Buffer)))}`;
		resultString = `${resultString}\r\n-----END CERTIFICATE REQUEST-----\r\n`;
		
		document.getElementById("pem-text-block").value = resultString;
		
		parsePKCS10();
	});
}
//*********************************************************************************
//endregion
//*********************************************************************************
//region Parse existing PKCS#10
//*********************************************************************************
function parsePKCS10()
{
	//region Initial activities
	// noinspection InnerHTMLJS
	document.getElementById("pkcs10-subject").innerHTML = "";
	// noinspection InnerHTMLJS
	document.getElementById("pkcs10-exten").innerHTML = "";
	
	document.getElementById("pkcs10-data-block").style.display = "none";
	document.getElementById("pkcs10-attributes").style.display = "none";
	//endregion
	
	//region Decode existing PKCS#10
	const stringPEM = document.getElementById("pem-text-block").value.replace(/(-----(BEGIN|END) CERTIFICATE REQUEST-----|\n)/g, "");
	
	const asn1 = asn1js.fromBER(stringToArrayBuffer(fromBase64((stringPEM))));
	const pkcs10 = new CertificationRequest({ schema: asn1.result });
	//endregion
	
	//region Parse and display information about "subject"
	const typemap = {
		"2.5.4.6": "C",
		"2.5.4.11": "OU",
		"2.5.4.10": "O",
		"2.5.4.3": "CN",
		"2.5.4.7": "L",
		"2.5.4.8": "S",
		"2.5.4.12": "T",
		"2.5.4.42": "GN",
		"2.5.4.43": "I",
		"2.5.4.4": "SN",
		"1.2.840.113549.1.9.1": "E-mail"
	};
	
	for(let i = 0; i < pkcs10.subject.typesAndValues.length; i++)
	{
		let typeval = typemap[pkcs10.subject.typesAndValues[i].type];
		if(typeof typeval === "undefined")
			typeval = pkcs10.subject.typesAndValues[i].type;
		
		const subjval = pkcs10.subject.typesAndValues[i].value.valueBlock.value;
		const ulrow = `<li><p><span>${typeval}</span> ${subjval}</p></li>`;
		
		// noinspection InnerHTMLJS
		document.getElementById("pkcs10-subject").innerHTML = document.getElementById("pkcs10-subject").innerHTML + ulrow;
		if(typeval === "CN")
		{
			// noinspection InnerHTMLJS
			document.getElementById("pkcs10-subject-cn").innerHTML = subjval;
		}
	}
	//endregion
	
	//region Put information about public key size
	let publicKeySize = "< unknown >";
	
	if(pkcs10.subjectPublicKeyInfo.algorithm.algorithmId.indexOf("1.2.840.113549") !== (-1))
	{
		const asn1PublicKey = asn1js.fromBER(pkcs10.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex);
		const rsaPublicKeySimple = new RSAPublicKey({ schema: asn1PublicKey.result });
		const modulusView = new Uint8Array(rsaPublicKeySimple.modulus.valueBlock.valueHex);
		let modulusBitLength = 0;
		
		if(modulusView[0] === 0x00)
			modulusBitLength = (rsaPublicKeySimple.modulus.valueBlock.valueHex.byteLength - 1) * 8;
		else
			modulusBitLength = rsaPublicKeySimple.modulus.valueBlock.valueHex.byteLength * 8;
		
		publicKeySize = modulusBitLength.toString();
	}
	
	// noinspection InnerHTMLJS
	document.getElementById("keysize").innerHTML = publicKeySize;
	//endregion
	
	//region Put information about signature algorithm
	const algomap = {
		"1.2.840.113549.1.1.2": "MD2 with RSA",
		"1.2.840.113549.1.1.4": "MD5 with RSA",
		"1.2.840.10040.4.3": "SHA1 with DSA",
		"1.2.840.10045.4.1": "SHA1 with ECDSA",
		"1.2.840.10045.4.3.2": "SHA256 with ECDSA",
		"1.2.840.10045.4.3.3": "SHA384 with ECDSA",
		"1.2.840.10045.4.3.4": "SHA512 with ECDSA",
		"1.2.840.113549.1.1.10": "RSA-PSS",
		"1.2.840.113549.1.1.5": "SHA1 with RSA",
		"1.2.840.113549.1.1.14": "SHA224 with RSA",
		"1.2.840.113549.1.1.11": "SHA256 with RSA",
		"1.2.840.113549.1.1.12": "SHA384 with RSA",
		"1.2.840.113549.1.1.13": "SHA512 with RSA"
	};
	let signatureAlgorithm = algomap[pkcs10.signatureAlgorithm.algorithmId];
	if(typeof signatureAlgorithm === "undefined")
		signatureAlgorithm = pkcs10.signatureAlgorithm.algorithmId;
	else
		signatureAlgorithm = `${signatureAlgorithm} (${pkcs10.signatureAlgorithm.algorithmId})`;
	
	// noinspection InnerHTMLJS
	document.getElementById("sig-algo").innerHTML = signatureAlgorithm;
	//endregion
	
	//region Put information about PKCS#10 attributes
	if("attributes" in pkcs10)
	{
		for(let i = 0; i < pkcs10.attributes.length; i++)
		{
			const typeval = pkcs10.attributes[i].type;
			let subjval = "";
			
			for(let j = 0; j < pkcs10.attributes[i].values.length; j++)
			{
				// noinspection OverlyComplexBooleanExpressionJS
				if((pkcs10.attributes[i].values[j] instanceof asn1js.Utf8String) ||
					(pkcs10.attributes[i].values[j] instanceof asn1js.BmpString) ||
					(pkcs10.attributes[i].values[j] instanceof asn1js.UniversalString) ||
					(pkcs10.attributes[i].values[j] instanceof asn1js.NumericString) ||
					(pkcs10.attributes[i].values[j] instanceof asn1js.PrintableString) ||
					(pkcs10.attributes[i].values[j] instanceof asn1js.TeletexString) ||
					(pkcs10.attributes[i].values[j] instanceof asn1js.VideotexString) ||
					(pkcs10.attributes[i].values[j] instanceof asn1js.IA5String) ||
					(pkcs10.attributes[i].values[j] instanceof asn1js.GraphicString) ||
					(pkcs10.attributes[i].values[j] instanceof asn1js.VisibleString) ||
					(pkcs10.attributes[i].values[j] instanceof asn1js.GeneralString) ||
					(pkcs10.attributes[i].values[j] instanceof asn1js.CharacterString))
				{
					subjval = subjval + ((subjval.length === 0) ? "" : ";") + pkcs10.attributes[i].values[j].valueBlock.value;
				}
				else
					subjval = subjval + ((subjval.length === 0) ? "" : ";") + pkcs10.attributes[i].values[j].constructor.blockName();
			}
			
			const ulrow = `<li><p><span>${typeval}</span> ${subjval}</p></li>`;
			// noinspection InnerHTMLJS
			document.getElementById("pkcs10-exten").innerHTML = document.getElementById("pkcs10-exten").innerHTML + ulrow;
		}
		
		document.getElementById("pkcs10-attributes").style.display = "block";
	}
	//endregion
	
	document.getElementById("pkcs10-data-block").style.display = "block";
}
//*********************************************************************************
//endregion
//*********************************************************************************
//region Verify existing PKCS#10
//*********************************************************************************
function verifyPKCS10Internal()
{
	//region Decode existing PKCS#10
	const asn1 = asn1js.fromBER(pkcs10Buffer);
	const pkcs10 = new CertificationRequest({ schema: asn1.result });
	//endregion
	
	//region Verify PKCS#10
	return pkcs10.verify();
	//endregion
}
//*********************************************************************************
function verifyPKCS10()
{
	return Promise.resolve().then(() =>
	{
		pkcs10Buffer = stringToArrayBuffer(fromBase64(document.getElementById("pem-text-block").value.replace(/(-----(BEGIN|END) CERTIFICATE REQUEST-----|\n)/g, "")));
	}).then(() => verifyPKCS10Internal()).then(result =>
	{
		alert(`Verification passed: ${result}`);
	}, error =>
	{
		alert(`Error during verification: ${error}`);
	});
}
//*********************************************************************************
//endregion
//*********************************************************************************
function handleHashAlgOnChange()
{
	const hashOption = document.getElementById("hashAlg").value;
	switch(hashOption)
	{
		case "alg_SHA1":
			hashAlg = "sha-1";
			break;
		case "alg_SHA256":
			hashAlg = "sha-256";
			break;
		case "alg_SHA384":
			hashAlg = "sha-384";
			break;
		case "alg_SHA512":
			hashAlg = "sha-512";
			break;
		default:
	}
}
//*********************************************************************************
function handleSignAlgOnChange()
{
	const signOption = document.getElementById("signAlg").value;
	switch(signOption)
	{
		case "alg_RSA15":
			signAlg = "RSASSA-PKCS1-V1_5";
			break;
		case "alg_RSA2":
			signAlg = "RSA-PSS";
			break;
		case "alg_ECDSA":
			signAlg = "ECDSA";
			break;
		default:
	}
}
//*********************************************************************************
context("Hack for Rollup.js", () =>
{
	return;
	
	// noinspection UnreachableCodeJS
	createPKCS10();
	parsePKCS10();
	verifyPKCS10();
	handleHashAlgOnChange();
	handleSignAlgOnChange();
	setEngine();
});
//*********************************************************************************
context("PKCS#10 Complex Example", () =>
{
	//region Initial variables
	const hashAlgs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
	const signAlgs = ["RSASSA-PKCS1-V1_5", "ECDSA", "RSA-PSS"];
	
	const algorithmsMap = new Map([
		["SHA-1 + RSASSA-PKCS1-V1_5", "1.2.840.113549.1.1.5"],
		["SHA-256 + RSASSA-PKCS1-V1_5", "1.2.840.113549.1.1.11"],
		["SHA-384 + RSASSA-PKCS1-V1_5", "1.2.840.113549.1.1.12"],
		["SHA-512 + RSASSA-PKCS1-V1_5", "1.2.840.113549.1.1.13"],
		
		["SHA-1 + ECDSA", "1.2.840.10045.4.1"],
		["SHA-256 + ECDSA", "1.2.840.10045.4.3.2"],
		["SHA-384 + ECDSA", "1.2.840.10045.4.3.3"],
		["SHA-512 + ECDSA", "1.2.840.10045.4.3.4"],
		
		["SHA-1 + RSA-PSS", "1.2.840.113549.1.1.10"],
		["SHA-256 + RSA-PSS", "1.2.840.113549.1.1.10"],
		["SHA-384 + RSA-PSS", "1.2.840.113549.1.1.10"],
		["SHA-512 + RSA-PSS", "1.2.840.113549.1.1.10"]
	]);
	//endregion
	
	signAlgs.forEach(_signAlg =>
	{
		hashAlgs.forEach(_hashAlg =>
		{
			const testName = `${_hashAlg} + ${_signAlg}`;
			
			it(testName, () =>
			{
				hashAlg = _hashAlg;
				signAlg = _signAlg;
				
				return createPKCS10Internal().then(() =>
				{
					const asn1 = asn1js.fromBER(pkcs10Buffer);
					const pkcs10 = new CertificationRequest({ schema: asn1.result });
					
					assert.equal(pkcs10.signatureAlgorithm.algorithmId, algorithmsMap.get(testName), `Signature algorithm must be ${testName}`);
					
					return verifyPKCS10Internal().then(result =>
					{
						assert.equal(result, true, "PKCS#10 must be verified sucessfully");
					});
				});
			});
		});
	});
});
//*********************************************************************************
