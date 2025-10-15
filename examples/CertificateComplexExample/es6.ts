import * as pkijs from "../../src";
import * as utils from "../../test/utils";
import * as example from "../../test/certificateComplexExample";
import * as common from "../common";
import * as pvtsutils from "pvtsutils";

let certificateBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CERT
const trustedCertificates: pkijs.Certificate[] = []; // Array of root certificates from "CA Bundle"
const intermediateCertificates: pkijs.Certificate[] = []; // Array of intermediate certificates
const crls: pkijs.CertificateRevocationList[] = []; // Array of CRLs for all certificates (trusted + intermediate)

let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-v1_5";

function parseCertificate() {
  //#region Initial check
  if (certificateBuffer.byteLength === 0) {
    alert("Nothing to parse!");
    return;
  }
  //#endregion

  //#region Initial activities
  common.getElement("cert-extn-div").style.display = "none";

  const issuerTable = common.getElement("cert-issuer-table", "table");
  while (issuerTable.rows.length > 1)
    issuerTable.deleteRow(issuerTable.rows.length - 1);

  const subjectTable = common.getElement("cert-subject-table", "table");
  while (subjectTable.rows.length > 1)
    subjectTable.deleteRow(subjectTable.rows.length - 1);

  const extensionTable = common.getElement("cert-extn-table", "table");
  while (extensionTable.rows.length > 1)
    extensionTable.deleteRow(extensionTable.rows.length - 1);
  //#endregion

  //#region Decode existing X.509 certificate
  const certificates = common.parseCertificate(certificateBuffer);
  if (!certificates.length) {
    throw new Error("Cannot get certificate from the file");
  }
  const certificate = certificates[0];
  //#endregion

  //#region Put information about X.509 certificate issuer
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

  for (const typeAndValue of certificate.issuer.typesAndValues) {
    let typeval = rdnmap[typeAndValue.type];
    if (typeof typeval === "undefined")
      typeval = typeAndValue.type;

    const subjval = typeAndValue.value.valueBlock.value;

    const row = issuerTable.insertRow(issuerTable.rows.length);
    const cell0 = row.insertCell(0);
    cell0.innerHTML = typeval;
    const cell1 = row.insertCell(1);
    cell1.innerHTML = subjval;
  }
  //#endregion

  //#region Put information about X.509 certificate subject
  for (const typeAndValue of certificate.subject.typesAndValues) {
    let typeval = rdnmap[typeAndValue.type];
    if (typeof typeval === "undefined")
      typeval = typeAndValue.type;

    const subjval = typeAndValue.value.valueBlock.value;

    const row = subjectTable.insertRow(subjectTable.rows.length);
    const cell0 = row.insertCell(0);
    cell0.innerHTML = typeval;
    const cell1 = row.insertCell(1);
    cell1.innerHTML = subjval;
  }
  //#endregion

  //#region Put information about X.509 certificate serial number
  common.getElement("cert-serial-number").innerHTML = pvtsutils.Convert.ToHex(certificate.serialNumber.valueBlock.valueHexView);
  //#endregion

  //#region Put information about issuance date
  common.getElement("cert-not-before").innerHTML = certificate.notBefore.value.toString();
  //#endregion

  //#region Put information about expiration date
  common.getElement("cert-not-after").innerHTML = certificate.notAfter.value.toString();
  //#endregion

  //#region Put information about subject public key size
  let publicKeySize = "< unknown >";

  if (certificate.subjectPublicKeyInfo.algorithm.algorithmId.indexOf("1.2.840.113549") !== (-1)) {
    const rsaPublicKey = pkijs.RSAPublicKey.fromBER(certificate.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHexView as BufferSource);

    const modulusView = rsaPublicKey.modulus.valueBlock.valueHexView;
    let modulusBitLength = 0;

    if (modulusView[0] === 0x00)
      modulusBitLength = (rsaPublicKey.modulus.valueBlock.valueHexView.byteLength - 1) * 8;
    else
      modulusBitLength = rsaPublicKey.modulus.valueBlock.valueHexView.byteLength * 8;

    publicKeySize = modulusBitLength.toString();
  }

  common.getElement("cert-keysize").innerHTML = publicKeySize;
  //#endregion

  //#region Put information about signature algorithm
  const algomap: Record<string, string> = {
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
  };       // array mapping of common algorithm OIDs and corresponding types

  let signatureAlgorithm = algomap[certificate.signatureAlgorithm.algorithmId];
  if (typeof signatureAlgorithm === "undefined")
    signatureAlgorithm = certificate.signatureAlgorithm.algorithmId;
  else
    signatureAlgorithm = `${signatureAlgorithm} (${certificate.signatureAlgorithm.algorithmId})`;

  common.getElement("cert-sign-algo").innerHTML = signatureAlgorithm;
  //#endregion

  //#region Put information about certificate extensions
  if (certificate.extensions) {
    for (let i = 0; i < certificate.extensions.length; i++) {
      const row = extensionTable.insertRow(extensionTable.rows.length);
      const cell0 = row.insertCell(0);
      cell0.innerHTML = certificate.extensions[i].extnID;
    }

    common.getElement("cert-extn-div").style.display = "block";
  }
  //#endregion
}

async function createCertificate() {
  try {
    const cert = await example.createCertificate(hashAlg, signAlg);

    certificateBuffer = cert.certificateBuffer;
    trustedCertificates.push(cert.certificate);

    parseCertificate();

    console.info("Certificate created successfully!");
    console.info("Private key exported successfully!");

    common.getElement("new_signed_data").innerHTML = [
      utils.toPEM(cert.certificateBuffer, "CERTIFICATE"),
      utils.toPEM(cert.privateKeyBuffer, "PRIVATE KEY"),
    ].join("\n\n");

    alert("Certificate created successfully!");
  } catch (error) {
    common.processError(error, "Error on Certificate creation");
  }
}

async function verifyCertificate() {
  try {
    const chainStatus = await example.verifyCertificate(certificateBuffer, intermediateCertificates, trustedCertificates, crls);
    alert(`Verification result: ${chainStatus.result}`);
  } catch (e) {
    common.processError(e, "Error on Certificate verifying");
  }
}

function handleFileBrowse(evt: any) {
  const tempReader = new FileReader();

  const currentFiles = evt.target.files;

  tempReader.onload =
    (event: any) => {
      certificateBuffer = event.target.result;
      parseCertificate();
    };

  tempReader.readAsArrayBuffer(currentFiles[0]);
}

function handleCABundle(evt: Event) {
  common.handleFileBrowse(evt, file => {
    trustedCertificates.push(...common.parseCertificate(file));
  });
}

function handleTrustedCertsFile(evt: Event) {
  common.handleFileBrowse(evt, file => {
    trustedCertificates.push(...common.parseCertificate(file));
  });
}

function handleInterCertsFile(evt: Event) {
  common.handleFileBrowse(evt, file => {
    intermediateCertificates.push(...common.parseCertificate(file));
  });
}

function handleCRLsFile(evt: Event) {
  common.handleFileBrowse(evt, file => {
    const crl = pkijs.CertificateRevocationList.fromBER(file);

    crls.push(crl);
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

common.getElement("hash_alg").addEventListener("change", handleHashAlgOnChange, false);
common.getElement("sign_alg").addEventListener("change", handleSignAlgOnChange, false);
common.getElement("cert_file").addEventListener("change", handleFileBrowse, false);
common.getElement("inter_certs").addEventListener("change", handleInterCertsFile, false);
common.getElement("trusted_certs").addEventListener("change", handleTrustedCertsFile, false);
common.getElement("crls").addEventListener("change", handleCRLsFile, false);
common.getElement("ca_bundle").addEventListener("change", handleCABundle, false);
common.getElement("cert_create").addEventListener("click", createCertificate, false);
common.getElement("cert_verify").addEventListener("click", verifyCertificate, false);
