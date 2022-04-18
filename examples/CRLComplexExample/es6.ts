import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as pkijs from "../../src";
import * as example from "../../test/crlComplexExample";
import * as utils from "../../test/utils";
import * as common from "../common";

let crlBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CRL

let issuerPublicKey: ArrayBuffer = new ArrayBuffer(0);

let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-V1_5";

/**
 * Create CRL
 */
async function createCRL() {
	const crl = await example.createCRL(hashAlg, signAlg);
	const clrPem = utils.toPEM(crl.crlBuffer, "CRL");

	crlBuffer = crl.crlBuffer;
	issuerPublicKey = crl.publicKeyBuffer;

	parseCRL(crl.crlBuffer);

	common.getElement("newSignedData").innerHTML = clrPem;
}

/**
 * Parse existing CRL
 * @param crlBuffer
 */
function parseCRL(crlBuffer: ArrayBuffer) {
	common.getElement("crl-extn-div").style.display = "none";

	const revokedTable = common.getElement("crl-rev-certs", "table");
	while (revokedTable.rows.length > 1)
		revokedTable.deleteRow(revokedTable.rows.length - 1);

	const extensionTable = common.getElement("crl-extn-table", "table");
	while (extensionTable.rows.length > 1)
		extensionTable.deleteRow(extensionTable.rows.length - 1);

	const issuerTable = common.getElement("crl-issuer-table", "table");
	while (issuerTable.rows.length > 1)
		issuerTable.deleteRow(issuerTable.rows.length - 1);

	//#region Decode existing CRL
	pkijs.AsnError.assert(asn1, "CRL");
	const asn1 = asn1js.fromBER(crlBuffer);
	const crlSimpl = new pkijs.CertificateRevocationList({
		schema: asn1.result
	});
	//#endregion

	//#region Put information about CRL issuer
	const rdnmap: Record<string, string> = {
		"2.5.4.6": "C",
		"2.5.4.10": "O",
		"2.5.4.11": "OU",
		"2.5.4.3": "CN",
		"2.5.4.7": "L",
		"2.5.4.8": "ST",
		"2.5.4.12": "T",
		"2.5.4.42": "GN",
		"2.5.4.43": "I",
		"2.5.4.4": "SN",
		"1.2.840.113549.1.9.1": "E-mail"
	};

	for (let i = 0; i < crlSimpl.issuer.typesAndValues.length; i++) {
		let typeval = rdnmap[crlSimpl.issuer.typesAndValues[i].type];
		if (typeof typeval === "undefined") {
			typeval = crlSimpl.issuer.typesAndValues[i].type;
		}

		const subjval = crlSimpl.issuer.typesAndValues[i].value.valueBlock.value;

		const row = issuerTable.insertRow(issuerTable.rows.length);
		const cell0 = row.insertCell(0);
		cell0.innerHTML = typeval;
		const cell1 = row.insertCell(1);
		cell1.innerHTML = subjval;
	}
	//#endregion

	// Put information about issuance date
	common.getElement("crl-this-update").innerHTML = crlSimpl.thisUpdate.value.toString();

	//#region Put information about expiration date
	if (crlSimpl.nextUpdate) {
		common.getElement("crl-next-update").innerHTML = crlSimpl.nextUpdate.value.toString();
		common.getElement("crl-next-update-div").style.display = "block";
	}
	//#endregion

	//#region Put information about signature algorithm
	const algomap: Record<string, string> = {
		"1.2.840.113549.2.1": "MD2",
		"1.2.840.113549.1.1.2": "MD2 with RSA",
		"1.2.840.113549.2.5": "MD5",
		"1.2.840.113549.1.1.4": "MD5 with RSA",
		"1.3.14.3.2.26": "SHA1",
		"1.2.840.10040.4.3": "SHA1 with DSA",
		"1.2.840.10045.4.1": "SHA1 with ECDSA",
		"1.2.840.113549.1.1.5": "SHA1 with RSA",
		"2.16.840.1.101.3.4.2.4": "SHA224",
		"1.2.840.113549.1.1.14": "SHA224 with RSA",
		"2.16.840.1.101.3.4.2.1": "SHA256",
		"1.2.840.113549.1.1.11": "SHA256 with RSA",
		"2.16.840.1.101.3.4.2.2": "SHA384",
		"1.2.840.113549.1.1.12": "SHA384 with RSA",
		"2.16.840.1.101.3.4.2.3": "SHA512",
		"1.2.840.113549.1.1.13": "SHA512 with RSA"
	};       // array mapping of common algorithm OIDs and corresponding types

	let signatureAlgorithm = algomap[crlSimpl.signature.algorithmId];
	if (typeof signatureAlgorithm === "undefined")
		signatureAlgorithm = crlSimpl.signature.algorithmId;
	else
		signatureAlgorithm = `${signatureAlgorithm} (${crlSimpl.signature.algorithmId})`;

	// noinspection InnerHTMLJS
	common.getElement("crl-sign-algo").innerHTML = signatureAlgorithm;
	//#endregion

	//#region Put information about revoked certificates
	if (crlSimpl.revokedCertificates) {
		for (let i = 0; i < crlSimpl.revokedCertificates.length; i++) {
			const row = revokedTable.insertRow(revokedTable.rows.length);
			const cell0 = row.insertCell(0);
			// noinspection InnerHTMLJS
			cell0.innerHTML = pvutils.bufferToHexCodes(crlSimpl.revokedCertificates[i].userCertificate.valueBlock.valueHex);
			const cell1 = row.insertCell(1);
			// noinspection InnerHTMLJS
			cell1.innerHTML = crlSimpl.revokedCertificates[i].revocationDate.value.toString();
		}

		common.getElement("crl-rev-certs-div").style.display = "block";
	}
	//#endregion
	//#region Put information about CRL extensions
	if (crlSimpl.crlExtensions) {
		for (let i = 0; i < crlSimpl.crlExtensions.extensions.length; i++) {
			const row = extensionTable.insertRow(extensionTable.rows.length);
			const cell0 = row.insertCell(0);
			// noinspection InnerHTMLJS
			cell0.innerHTML = crlSimpl.crlExtensions.extensions[i].extnID;
		}

		common.getElement("crl-extn-div").style.display = "block";
	}
	//#endregion
}

/**
 * Verify existing CRL
 */
async function verifyCRL() {
	try {
		const result = await example.verifyCRL(crlBuffer, issuerPublicKey);
		alert(`Verification result: ${result}`);
	} catch (error) {
		common.processError(error, "Error during CRL verification");
	}
}

//#endregion

function handleFileBrowse(evt: Event) {
	common.handleFileBrowse(evt, file => {
		parseCRL(file);

		crlBuffer = file;
	});
}

function handleIssuerCert(evt: Event) {
	common.handleFileBrowse(evt, file => {
		try {
			const asn1 = asn1js.fromBER(file);
			pkijs.AsnError.assert(asn1, "Certificate");
			const cert = new pkijs.Certificate({
				schema: asn1.result,
			});
			issuerPublicKey = cert.subjectPublicKeyInfo.toSchema().toBER();
		} catch (e) {
			common.processError(e, "Error on Certificate parsing");
		}
	});
}

function handleHashAlgOnChange() {
	const hashOption = common.getElement("hashAlg", "select").value;
	switch (hashOption) {
		case "algSHA1":
			hashAlg = "sha-1";
			break;
		case "algSHA256":
			hashAlg = "sha-256";
			break;
		case "algSHA384":
			hashAlg = "sha-384";
			break;
		case "algSHA512":
			hashAlg = "sha-512";
			break;
		default:
	}
}

function handleSignAlgOnChange() {
	const signOption = common.getElement("signAlg", "select").value;
	switch (signOption) {
		case "algRSA15":
			signAlg = "RSASSA-PKCS1-V1_5";
			break;
		case "algRSA2":
			signAlg = "RSA-PSS";
			break;
		case "algECDSA":
			signAlg = "ECDSA";
			break;
		default:
	}
}

common.getElement("hashAlg").addEventListener("change", handleHashAlgOnChange, false);
common.getElement("signAlg").addEventListener("change", handleSignAlgOnChange, false);
common.getElement("crl-file").addEventListener("change", handleFileBrowse, false);
common.getElement("issuer-cert").addEventListener("change", handleIssuerCert, false);
common.getElement("crl-create").addEventListener("click", createCRL, false);
common.getElement("crl-verify").addEventListener("click", verifyCRL, false);