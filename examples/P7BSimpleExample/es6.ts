import * as utils from "../../test/utils";
import * as example from "../../test/p7bSimpleExample";
import * as common from "../common";

let cmsSignedBuffer = new ArrayBuffer(0);
let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-v1_5";

async function createP7B() {
  try {
    cmsSignedBuffer = await example.createP7B(hashAlg, signAlg);
    common.getElement("newSignedData").innerHTML = utils.toPEM(cmsSignedBuffer, "CMS");
  } catch (e) {
    common.processError(e, "Error on CMS creating");
  }
}

//#endregion

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

common.getElement("hashAlg").addEventListener("click", handleHashAlgOnChange);
common.getElement("signAlg").addEventListener("click", handleSignAlgOnChange);
common.getElement("create_p7b").addEventListener("click", createP7B);