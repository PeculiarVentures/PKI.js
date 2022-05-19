import * as pvutils from "pvutils";
import * as pkijs from "../../src";
import * as utils from "../../test/utils";
import * as example from "../../test/cmsSignedComplexExample";
import * as common from "../common";

let cmsSignedBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CMS_Signed
let certificateBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CERT
let privateKeyBuffer = new ArrayBuffer(0);
let dataBuffer = new ArrayBuffer(0);

let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-v1_5";
let addExt = false;
let detachedSignature = false;

const trustedCertificates: pkijs.Certificate[] = []; // Array of root certificates from "CA Bundle"

/**
 * Parse "CA Bundle" file
 * @param buffer
 */
function parseCAbundle(buffer: ArrayBuffer) {
  try {
    trustedCertificates.push(...common.parseCertificate(buffer));
  } catch (e) {
    common.processError(e, "Error on Certificate parsing");
  }
}

/**
 * Parse existing CMS_Signed
 */
function parseCMSSigned() {
  //#region Initial check
  if (cmsSignedBuffer.byteLength === 0) {
    alert("Nothing to parse!");
    return;
  }
  //#endregion

  //#region Initial activities
  common.getElement("cms-dgst-algos").innerHTML = "";

  common.getElement("cms-certs").style.display = "none";
  common.getElement("cms-crls").style.display = "none";

  const certificatesTable = common.getElement("cms-certificates", "table");
  while (certificatesTable.rows.length > 1)
    certificatesTable.deleteRow(certificatesTable.rows.length - 1);

  const crlsTable = common.getElement("cms-rev-lists", "table");
  while (crlsTable.rows.length > 1)
    crlsTable.deleteRow(crlsTable.rows.length - 1);
  //#endregion

  //#region Decode existing CMS Signed Data
  const cmsContentSimpl = pkijs.ContentInfo.fromBER(cmsSignedBuffer);
  const cmsSignedSimpl = new pkijs.SignedData({ schema: cmsContentSimpl.content });
  //#endregion

  //#region Put information about digest algorithms in the CMS Signed Data
  const dgstmap: Record<string, string> = {
    "1.3.14.3.2.26": "SHA-1",
    "2.16.840.1.101.3.4.2.1": "SHA-256",
    "2.16.840.1.101.3.4.2.2": "SHA-384",
    "2.16.840.1.101.3.4.2.3": "SHA-512"
  };

  for (let i = 0; i < cmsSignedSimpl.digestAlgorithms.length; i++) {
    let typeval = dgstmap[cmsSignedSimpl.digestAlgorithms[i].algorithmId];
    if (typeof typeval === "undefined")
      typeval = cmsSignedSimpl.digestAlgorithms[i].algorithmId;

    const ulrow = `<li><p><span>${typeval}</span></p></li>`;

    common.getElement("cms-dgst-algos").innerHTML = common.getElement("cms-dgst-algos").innerHTML + ulrow;
  }
  //#endregion

  //#region Put information about encapsulated content type
  const contypemap: Record<string, string> = {
    "1.3.6.1.4.1.311.2.1.4": "Authenticode signing information",
    "1.2.840.113549.1.7.1": "Data content"
  };

  let eContentType = contypemap[cmsSignedSimpl.encapContentInfo.eContentType];
  if (typeof eContentType === "undefined")
    eContentType = cmsSignedSimpl.encapContentInfo.eContentType;

  common.getElement("cms-encap-type").innerHTML = eContentType;
  //#endregion

  //#region Put information about included certificates
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

  if (cmsSignedSimpl.certificates) {
    for (let j = 0; j < cmsSignedSimpl.certificates.length; j++) {
      let ul = "<ul>";
      const cert = cmsSignedSimpl.certificates[j];
      if (!(cert instanceof pkijs.Certificate)) {
        continue;
      }

      for (let i = 0; i < cert.issuer.typesAndValues.length; i++) {
        let typeval = rdnmap[cert.issuer.typesAndValues[i].type];
        if (typeof typeval === "undefined")
          typeval = cert.issuer.typesAndValues[i].type;

        const subjval = cert.issuer.typesAndValues[i].value.valueBlock.value;

        ul += `<li><p><span>${typeval}</span> ${subjval}</p></li>`;
      }

      ul = `${ul}</ul>`;

      const row = certificatesTable.insertRow(certificatesTable.rows.length);
      const cell0 = row.insertCell(0);
      cell0.innerHTML = pvutils.bufferToHexCodes(cert.serialNumber.valueBlock.valueHexView);
      const cell1 = row.insertCell(1);
      cell1.innerHTML = ul;
    }

    common.getElement("cms-certs").style.display = "block";
  }
  //#endregion

  //#region Put information about included CRLs
  if (cmsSignedSimpl.crls) {
    for (let j = 0; j < cmsSignedSimpl.crls.length; j++) {
      let ul = "<ul>";
      const crl = cmsSignedSimpl.crls[j];

      for (let i = 0; crl instanceof pkijs.CertificateRevocationList && i < crl.issuer.typesAndValues.length; i++) {
        let typeval = rdnmap[crl.issuer.typesAndValues[i].type];
        if (typeof typeval === "undefined")
          typeval = crl.issuer.typesAndValues[i].type;

        const subjval = crl.issuer.typesAndValues[i].value.valueBlock.value;

        ul += `<li><p><span>${typeval}</span> ${subjval}</p></li>`;
      }

      ul = `${ul}</ul>`;

      const row = crlsTable.insertRow(certificatesTable.rows.length);
      const cell = row.insertCell(0);
      //  InnerHTMLJS
      cell.innerHTML = ul;
    }

    common.getElement("cms-certs").style.display = "block";
  }
  //#endregion

  //#region Put information about number of signers
  common.getElement("cms-signs").innerHTML = cmsSignedSimpl.signerInfos.length.toString();
  //#endregion

  common.getElement("cms-signed-data-block").style.display = "block";
}

/**
 * Create CMS_Signed
 */
async function createCMSSigned() {
  try {
    const cms = await example.createCMSSigned(hashAlg, signAlg, dataBuffer, detachedSignature, addExt);

    certificateBuffer = cms.certificate.toSchema().toBER();
    const certPem = utils.toPEM(certificateBuffer, "CERTIFICATE");

    console.info("Certificate created successfully!");

    privateKeyBuffer = cms.pkcs8;
    const pkcs8Pem = utils.toPEM(privateKeyBuffer, "PRIVATE KEY");

    console.info("Private key exported successfully!");

    cmsSignedBuffer = cms.cmsSignedData;
    const cmsPem = utils.toPEM(cmsSignedBuffer, "CMS");

    common.getElement("new_signed_data").innerHTML = [
      certPem,
      pkcs8Pem,
      cmsPem,
    ].join("\n\n");

    parseCMSSigned();

    alert("CMS Signed Data created successfully!");
  } catch (e) {
    common.processError(e, "Error on CMS signing");
  }
}

/**
 * Verify existing CMS_Signed
 */
async function verifyCMSSigned() {
  //#region Initial check
  if (cmsSignedBuffer.byteLength === 0) {
    alert("Nothing to verify!");
    return;
  }
  //#endregion

  try {
    const ok = await example.verifyCMSSigned(cmsSignedBuffer, trustedCertificates, detachedSignature ? dataBuffer : undefined);
    alert(`Verification result: ${ok}`);
  } catch (e) {
    common.processError(e, "Error on CMS verifying");
  }
}

//#region Functions handling file selection

function handleFileBrowse(evt: Event) {
  common.handleFileBrowse(evt, file => {
    dataBuffer = file;

    createCMSSigned();
  });
}

function handleParsingFile(evt: Event) {
  common.handleFileBrowse(evt, file => {
    cmsSignedBuffer = file;

    parseCMSSigned();
  });
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

function handleAddExtOnChange() {
  addExt = common.getElement("add_ext", "input").checked;
}

function handleDetachedSignatureOnChange() {
  detachedSignature = common.getElement("detached_signature", "input").checked;
}
//#endregion

common.getElement("add_ext").addEventListener("change", handleAddExtOnChange, false);
common.getElement("detached_signature").addEventListener("change", handleDetachedSignatureOnChange, false);
common.getElement("hash_alg").addEventListener("change", handleHashAlgOnChange, false);
common.getElement("sign_alg").addEventListener("change", handleSignAlgOnChange, false);
common.getElement("input_file").addEventListener("change", handleFileBrowse, false);
common.getElement("parsing_file").addEventListener("change", handleParsingFile, false);
common.getElement("ca_bundle").addEventListener("change", handleCABundle, false);
common.getElement("cms_verify").addEventListener("click", verifyCMSSigned, false);
