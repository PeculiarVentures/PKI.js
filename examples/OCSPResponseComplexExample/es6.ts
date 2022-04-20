import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as example from "../../test/ocspResponseComplexExample";
import * as utils from "../../test/utils";
import * as pkijs from "../../src";
import * as common from "../common";

let ocspResponseBuffer = new ArrayBuffer(0);
const trustedCertificates: pkijs.Certificate[] = []; // Array of root certificates from "CA Bundle"

let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-V1_5";

async function createOCSPResp() {
  const ocsp = await example.createOCSPResp(hashAlg, signAlg);
  ocspResponseBuffer = ocsp.ocspResp.toSchema().toBER();

  trustedCertificates.push(ocsp.certificate);

  const resultString = [
    utils.toPEM(ocsp.certificate.toSchema().toBER(), "CERTIFICATE"),
    utils.toPEM(ocsp.pkcs8, "PRIVATE KEY"),
    utils.toPEM(ocspResponseBuffer, "OCSP RESPONSE"),
  ];

  console.info("Certificate created successfully!");
  console.info("Private key exported successfully!");

  common.getElement("new_signed_data").innerHTML = resultString.join("\n\n");

  parseOCSPResp(ocspResponseBuffer);

  console.info("OCSP response has created successfully!");
  alert("OCSP response has created successfully!");
}

/**
 * Parse existing OCSP response
 */
function parseOCSPResp(source: ArrayBuffer) {
  let ocspBasicResp: pkijs.BasicOCSPResponse;

  //#region Initial activities
  common.getElement("ocsp-resp-extensions").style.display = "none";
  common.getElement("ocsp-resp-rspid-rdn").style.display = "none";
  common.getElement("ocsp-resp-rspid-simpl").style.display = "none";

  const respIDTable = common.getElement("ocsp-resp-respid-rdn", "table");
  while (respIDTable.rows.length > 1)
    respIDTable.deleteRow(respIDTable.rows.length - 1);

  const extensionTable = common.getElement("ocsp-resp-extensions-table", "table");
  while (extensionTable.rows.length > 1)
    extensionTable.deleteRow(extensionTable.rows.length - 1);

  const responsesTable = common.getElement("ocsp-resp-attr-table", "table");
  while (extensionTable.rows.length > 1)
    extensionTable.deleteRow(extensionTable.rows.length - 1);
  //#endregion

  //#region Decode existing OCSP response
  const ocspRespSimpl = pkijs.OCSPResponse.fromBER(source);
  //#endregion

  //#region Put information about overall response status
  let status = "";

  switch (ocspRespSimpl.responseStatus.valueBlock.valueDec) {
    case 0:
      status = "successful";
      break;
    case 1:
      status = "malformedRequest";
      break;
    case 2:
      status = "internalError";
      break;
    case 3:
      status = "tryLater";
      break;
    case 4:
      status = "<not used>";
      break;
    case 5:
      status = "sigRequired";
      break;
    case 6:
      status = "unauthorized";
      break;
    default:
      alert("Wrong OCSP response status");
      return;
  }

  common.getElement("resp-status").innerHTML = status;
  //#endregion

  //#region Check that we do have "responseBytes"
  if (ocspRespSimpl.responseBytes) {
    ocspBasicResp = pkijs.BasicOCSPResponse.fromBER(ocspRespSimpl.responseBytes.response.valueBlock.valueHex);
  }
  else
    return; // Nothing else to display - only status information exists
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
  };

  let signatureAlgorithm = algomap[ocspBasicResp.signatureAlgorithm.algorithmId];
  if (typeof signatureAlgorithm === "undefined")
    signatureAlgorithm = ocspBasicResp.signatureAlgorithm.algorithmId;
  else
    signatureAlgorithm = `${signatureAlgorithm} (${ocspBasicResp.signatureAlgorithm.algorithmId})`;

  common.getElement("sig-algo").innerHTML = signatureAlgorithm;
  //#endregion

  //#region Put information about "Responder ID"
  if (ocspBasicResp.tbsResponseData.responderID instanceof pkijs.RelativeDistinguishedNames) {
    const typemap: Record<string, string> = {
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

    for (let i = 0; i < ocspBasicResp.tbsResponseData.responderID.typesAndValues.length; i++) {
      let typeval = typemap[ocspBasicResp.tbsResponseData.responderID.typesAndValues[i].type];
      if (typeof typeval === "undefined")
        typeval = ocspBasicResp.tbsResponseData.responderID.typesAndValues[i].type;

      const subjval = ocspBasicResp.tbsResponseData.responderID.typesAndValues[i].value.valueBlock.value;

      const row = respIDTable.insertRow(respIDTable.rows.length);
      const cell0 = row.insertCell(0);
      cell0.innerHTML = typeval;
      const cell1 = row.insertCell(1);
      cell1.innerHTML = subjval;
    }

    common.getElement("ocsp-resp-rspid-rdn").style.display = "block";
  }
  else {
    if (ocspBasicResp.tbsResponseData.responderID instanceof asn1js.OctetString) {
      common.getElement("ocsp-resp-respid-simpl").innerHTML = pvutils.bufferToHexCodes(ocspBasicResp.tbsResponseData.responderID.valueBlock.valueHex, 0, ocspBasicResp.tbsResponseData.responderID.valueBlock.valueHex.byteLength);
      common.getElement("ocsp-resp-rspid-simpl").style.display = "block";
    }
    else {
      alert("Wrong OCSP response responderID");
      return;
    }
  }
  //#endregion

  // Put information about a time when the response was produced
  common.getElement("prod-at").innerHTML = ocspBasicResp.tbsResponseData.producedAt.toString();

  //#region Put information about extensions of the OCSP response
  if (ocspBasicResp.tbsResponseData.responseExtensions) {
    const extenmap: Record<string, string> = {
      "1.3.6.1.5.5.7.48.1.2": "Nonce",
      "1.3.6.1.5.5.7.48.1.3": "CRL References",
      "1.3.6.1.5.5.7.48.1.4": "Acceptable Response Types",
      "1.3.6.1.5.5.7.48.1.6": "Archive Cutoff",
      "1.3.6.1.5.5.7.48.1.7": "Service Locator",
      "1.3.6.1.5.5.7.48.1.8": "Preferred Signature Algorithms",
      "1.3.6.1.5.5.7.48.1.9": "Extended Revoked Definition",
      "2.5.29.21": "CRL Reason",
      "2.5.29.24": "Invalidity Date",
      "2.5.29.29": "Certificate Issuer",
      "1.3.6.1.4.1.311.21.4": "Next Update"
    };

    for (let i = 0; i < ocspBasicResp.tbsResponseData.responseExtensions.length; i++) {
      let typeval = extenmap[ocspBasicResp.tbsResponseData.responseExtensions[i].extnID];
      if (typeof typeval === "undefined")
        typeval = ocspBasicResp.tbsResponseData.responseExtensions[i].extnID;

      const row = extensionTable.insertRow(extensionTable.rows.length);
      const cell0 = row.insertCell(0);
      cell0.innerHTML = typeval;
    }

    common.getElement("ocsp-resp-extensions").style.display = "block";
  }
  //#endregion

  //#region Put information about OCSP responses
  for (let i = 0; i < ocspBasicResp.tbsResponseData.responses.length; i++) {
    const typeval = pvutils.bufferToHexCodes(ocspBasicResp.tbsResponseData.responses[i].certID.serialNumber.valueBlock.valueHex);
    let subjval = "";

    switch (ocspBasicResp.tbsResponseData.responses[i].certStatus.idBlock.tagNumber) {
      case 0:
        subjval = "good";
        break;
      case 1:
        subjval = "revoked";
        break;
      case 2:
      default:
        subjval = "unknown";
    }

    const row = responsesTable.insertRow(responsesTable.rows.length);
    const cell0 = row.insertCell(0);
    cell0.innerHTML = typeval;
    const cell1 = row.insertCell(1);
    cell1.innerHTML = subjval;
  }
  //#endregion

  common.getElement("ocsp-resp-data-block").style.display = "block";

  ocspResponseBuffer = source;
}

async function verifyOCSPResp() {
  try {
    const result = await example.verifyOCSPResp(ocspResponseBuffer, trustedCertificates);
    alert(`Verification result: ${result}`);
  } catch (error) {
    common.processError(error, "Error during OCSP verification");
  }
}

function handleFileBrowse(evt: any) {
  common.handleFileBrowse(evt, file => {
    parseOCSPResp(file);
  });
}

function parseCAbundle(buffer: ArrayBuffer) {
  try {
    trustedCertificates.push(...common.parseCertificate(buffer));
  } catch (e) {
    common.processError(e, "Incorrect certificate data");
  }
}

function handleCABundle(evt: any) {
  common.handleFileBrowse(evt, file => {
    parseCAbundle(file);
  });
}

function handleHashAlgOnChange() {
  const hashOption = common.getElement("hash_alg", "select").value;
  switch (hashOption) {
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

function handleSignAlgOnChange() {
  const signOption = common.getElement("sign_alg", "select").value;
  switch (signOption) {
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

common.getElement("temp_file").addEventListener("change", handleFileBrowse, false);
common.getElement("ca_bundle").addEventListener("change", handleCABundle, false);
common.getElement("hash_alg").addEventListener("change", handleHashAlgOnChange, false);
common.getElement("sign_alg").addEventListener("change", handleSignAlgOnChange, false);
common.getElement("ocsp_resp_create").addEventListener("click", createOCSPResp, false);
common.getElement("ocsp_resp_verify").addEventListener("click", verifyOCSPResp, false);