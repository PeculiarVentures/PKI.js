import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as pkijs from "../../src";
import * as utils from "../../test/utils";
import * as example from "../../test/tspRespComplexExample";
import * as common from "../common";

let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-V1_5";
const certWithKey = {} as example.CreateTSPResponseResult;

const $newSignedData = common.getElement("new_signed_data");
const $respImprint = common.getElement("resp-imprint", "table");
const $respAccur = common.getElement("resp-accur");
const $respOrd = common.getElement("resp-ord");
const $respOrdering = common.getElement("resp-ordering");
const $respNon = common.getElement("resp-non");
const $respNonce = common.getElement("resp-nonce");
const $respTsRdn = common.getElement("resp-ts-rdn");
const $respTsSimpl = common.getElement("resp-ts-simpl");
const $respExt = common.getElement("resp-ext");
const $respAccuracy = common.getElement("resp-accuracy", "table");
const $respTsa = common.getElement("resp-tsa", "table");
const $respExtensions = common.getElement("resp-extensions", "table");
const $respSerial = common.getElement("resp-serial", "span");
const $signAlg = common.getElement("sign_alg", "select");
const $hashAlg = common.getElement("hash_alg", "select");
const $respStatus = common.getElement("resp-status");
const $respPolicy = common.getElement("resp-policy");
const $respTime = common.getElement("resp-time");

//#region Create TSP response

async function createTSPResp() {
  const tsp = await example.createTSPResp(hashAlg, signAlg);
  let resultString = utils.toPEM(tsp.certificate.toSchema().toBER(), "CERTIFICATE");
  console.info("Certificate created successfully!");

  resultString += utils.toPEM(tsp.pkcs8, "PRIVATE KEY");
  console.info("Private key exported successfully!");

  resultString += utils.toPEM(tsp.tspResponse.toSchema().toBER(), "TSP RESPONSE");
  console.info("TSP response has created successfully!");

  $newSignedData.innerHTML = resultString;

  parseTSPResp(tsp.tspResponse.toSchema().toBER());

  Object.assign(certWithKey, tsp);

  alert("TSP response has created successfully!");
}
//#endregion

//#region Parse existing TSP response
function parseTSPResp(tspResponse: ArrayBuffer) {
  //#region Initial activities
  $respAccur.style.display = "none";
  $respOrd.style.display = "none";
  $respNon.style.display = "none";
  $respTsRdn.style.display = "none";
  $respTsSimpl.style.display = "none";
  $respExt.style.display = "none";

  const imprTable = $respImprint;
  while (imprTable.rows.length > 1)
    imprTable.deleteRow(imprTable.rows.length - 1);

  const accurTable = $respAccuracy;
  while (accurTable.rows.length > 1)
    accurTable.deleteRow(accurTable.rows.length - 1);

  const tsTable = $respTsa;
  while (tsTable.rows.length > 1)
    tsTable.deleteRow(tsTable.rows.length - 1);

  const extTable = $respExtensions;
  while (extTable.rows.length > 1)
    extTable.deleteRow(extTable.rows.length - 1);
  //#endregion

  //#region Decode existing TSP response
  const tspRespSimpl = pkijs.TimeStampResp.fromBER(tspResponse);
  //#endregion

  //#region Put information about TSP response status
  let status = "";

  switch (tspRespSimpl.status.status) {
    case 0:
      status = "granted";
      break;
    case 1:
      status = "grantedWithMods";
      break;
    case 2:
      status = "rejection";
      break;
    case 3:
      status = "waiting";
      break;
    case 4:
      status = "revocationWarning";
      break;
    case 5:
      status = "revocationNotification";
      break;
    default:
  }

  $respStatus.innerHTML = status;
  //#endregion

  //#region Parse internal CMS Signed Data
  if (!tspRespSimpl.timeStampToken) {
    alert("No additional info but PKIStatusInfo");
    return;
  }

  const signedSimpl = new pkijs.SignedData({ schema: tspRespSimpl.timeStampToken.content });
  if (!signedSimpl.encapContentInfo) {
    throw new Error("'signedSimpl.encapContentInfo' is empty");
  }
  if (!signedSimpl.encapContentInfo.eContent) {
    throw new Error("'signedSimpl.encapContentInfo.eContent' is empty");
  }
  const tstInfoSimpl = pkijs.TSTInfo.fromBER(signedSimpl.encapContentInfo.eContent.valueBlock.valueHex);
  //#endregion

  //#region Put information about policy
  $respPolicy.innerHTML = tstInfoSimpl.policy;
  //#endregion

  //#region Put information about TST info message imprint
  const dgstmap: Record<string, string> = {
    "1.3.14.3.2.26": "SHA-1",
    "2.16.840.1.101.3.4.2.1": "SHA-256",
    "2.16.840.1.101.3.4.2.2": "SHA-384",
    "2.16.840.1.101.3.4.2.3": "SHA-512"
  };

  let hashAlgorithm = dgstmap[tstInfoSimpl.messageImprint.hashAlgorithm.algorithmId];
  if (typeof hashAlgorithm === "undefined")
    hashAlgorithm = tstInfoSimpl.messageImprint.hashAlgorithm.algorithmId;

  const imprintTable = $respImprint;

  const row = imprintTable.insertRow(imprintTable.rows.length);
  const cell0 = row.insertCell(0);
  cell0.innerHTML = hashAlgorithm;
  const cell1 = row.insertCell(1);
  cell1.innerHTML = pvutils.bufferToHexCodes(tstInfoSimpl.messageImprint.hashedMessage.valueBlock.valueHex);
  //#endregion

  //#region Put information about TST info serial number
  $respSerial.innerHTML = pvutils.bufferToHexCodes(tstInfoSimpl.serialNumber.valueBlock.valueHex);
  //#endregion

  //#region Put information about the time when TST info was generated
  $respTime.innerHTML = tstInfoSimpl.genTime.toString();
  //#endregion

  //#region Put information about TST info accuracy
  if (tstInfoSimpl.accuracy) {
    const rowInner = $respAccuracy.insertRow($respAccuracy.rows.length);
    const cell0Inner = rowInner.insertCell(0);
    cell0Inner.innerHTML = (tstInfoSimpl.accuracy.seconds || 0).toString();
    const cell1Inner = rowInner.insertCell(1);
    cell1Inner.innerHTML = (tstInfoSimpl.accuracy.millis || 0).toString();
    const cell2 = rowInner.insertCell(2);
    cell2.innerHTML = (tstInfoSimpl.accuracy.micros || 0).toString();

    $respAccur.style.display = "block";
  }
  //#endregion

  //#region Put information about TST info ordering
  if (tstInfoSimpl.ordering !== undefined) {
    $respOrdering.innerHTML = tstInfoSimpl.ordering.toString();
    $respOrd.style.display = "block";
  }
  //#endregion

  //#region Put information about TST info nonce value
  if (tstInfoSimpl.nonce) {
    $respNonce.innerHTML = pvutils.bufferToHexCodes(tstInfoSimpl.nonce.valueBlock.valueHex);
    $respNon.style.display = "block";
  }
  //#endregion

  //#region Put information about TST info TSA
  if (tstInfoSimpl.tsa) {
    switch (tstInfoSimpl.tsa.type) {
      case 1: // rfc822Name
      case 2: // dNSName
      case 6: // uniformResourceIdentifier
        $respTsSimpl.innerHTML = tstInfoSimpl.tsa.value.valueBlock.value;
        $respTsSimpl.style.display = "block";
        break;
      case 7: // iPAddress
        {
          const view = new Uint8Array(tstInfoSimpl.tsa.value.valueBlock.valueHex);

          $respTsSimpl.innerHTML = `${view[0].toString()}.${view[1].toString()}.${view[2].toString()}.${view[3].toString()}`;
          $respTsSimpl.style.display = "block";
        }
        break;
      case 3: // x400Address
      case 5: // ediPartyName
        $respTsSimpl.innerHTML = (tstInfoSimpl.tsa.type === 3) ? "<type \"x400Address\">" : "<type \"ediPartyName\">";
        $respTsSimpl.style.display = "block";
        break;
      case 4: // directoryName
        {
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

          for (let i = 0; i < tstInfoSimpl.tsa.value.typesAndValues.length; i++) {
            let typeval = rdnmap[tstInfoSimpl.tsa.value.typesAndValues[i].type];
            if (typeof typeval === "undefined")
              typeval = tstInfoSimpl.tsa.value.typesAndValues[i].type;

            const subjval = tstInfoSimpl.tsa.value.typesAndValues[i].value.valueBlock.value;

            const rowInner = $respTsa.insertRow($respTsa.rows.length);
            const cell0Inner = rowInner.insertCell(0);
            cell0Inner.innerHTML = typeval;
            const cell1Inner = rowInner.insertCell(1);
            cell1Inner.innerHTML = subjval;
          }

          $respTsRdn.style.display = "block";
        }
        break;
      default:
    }
  }
  //#endregion

  //#region Put information about TST info extensions
  if (tstInfoSimpl.extensions) {
    for (let i = 0; i < tstInfoSimpl.extensions.length; i++) {
      const rowInner = $respExtensions.insertRow($respExtensions.rows.length);
      const cell0Inner = rowInner.insertCell(0);
      cell0Inner.innerHTML = tstInfoSimpl.extensions[i].extnID;
    }

    $respExt.style.display = "block";
  }
  //#endregion
}

//#endregion

//#region Verify existing TSP response
async function verifyTSPResp() {
  try {
    const result = await example.verifyTSPResp(certWithKey);
    alert(`Verification result: ${result}`);
  } catch (error) {
    console.error(error);
    alert(`Error during verification. See developer console for detailed information`);
  }
}

//#endregion

//#region Parse "CA Bundle" file

function parseCAbundle(buffer: ArrayBuffer) {
  try {
    certWithKey.trustedCertificates.push(...common.parseCertificate(buffer));
  } catch (e) {
    console.error(e);
    alert("Incorrect certificate data");
  }
}

//#endregion

function handleTSPResp(evt: Event) {
  common.handleFileBrowse(evt, (file) => {
    parseTSPResp(file);
  });
}

function handleCA(evt: Event) {
  common.handleFileBrowse(evt, (file) => {
    parseCAbundle(file);
  });
}

function handleHashAlgOnChange() {
  const hashOption = $hashAlg.value;
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
  const signOption = $signAlg.value;
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

// Register events
common.getElement("temp_file").addEventListener("change", handleTSPResp, false);
common.getElement("ca_bundle").addEventListener("change", handleCA, false);
common.getElement("create-tsp-resp").addEventListener("click", createTSPResp, false);
common.getElement("verify-tsp-resp").addEventListener("click", verifyTSPResp, false);
$signAlg.addEventListener("change", handleSignAlgOnChange, false);
$hashAlg.addEventListener("change", handleHashAlgOnChange, false);
