import * as asn1js from "asn1js";
import * as example from "../../test/pkcs10ComplexExample";
import * as utils from "../../test/utils";
import * as pkijs from "../../src";
import * as common from "../common";

export let pkcs10Buffer = new ArrayBuffer(0);
export let hashAlg = "SHA-1";
export let signAlg = "RSASSA-PKCS1-V1_5";

async function createPKCS10() {
  pkcs10Buffer = await example.createPKCS10Internal(hashAlg, signAlg);
  common.getElement("pem-text-block", "textarea").value = utils.toPEM(pkcs10Buffer, "CERTIFICATE REQUEST");
  parsePKCS10();
}

function parsePKCS10() {
  common.getElement("pkcs10-subject").innerHTML = "";
  common.getElement("pkcs10-exten").innerHTML = "";
  common.getElement("pkcs10-data-block").style.display = "none";
  common.getElement("pkcs10-attributes").style.display = "none";

  //#region Decode existing PKCS#10
  const pkcs10Raw = utils.fromPEM(common.getElement("pem-text-block", "textarea").value);
  const pkcs10 = pkijs.CertificationRequest.fromBER(pkcs10Raw);
  //#endregion

  //#region Parse and display information about "subject"
  const typemap: Record<string, string> = {
    "2.5.4.6": "C",
    "2.5.4.11": "OU",
    "2.5.4.10": "O",
    "2.5.4.3": "CN",
    "2.5.4.7": "L",
    "2.5.4.8": "ST",
    "2.5.4.12": "T",
    "2.5.4.42": "GN",
    "2.5.4.43": "I",
    "2.5.4.4": "SN",
    "1.2.840.113549.1.9.1": "E-mail"
  };

  for (let i = 0; i < pkcs10.subject.typesAndValues.length; i++) {
    let typeval = typemap[pkcs10.subject.typesAndValues[i].type];
    if (typeof typeval === "undefined")
      typeval = pkcs10.subject.typesAndValues[i].type;

    const subjval = pkcs10.subject.typesAndValues[i].value.valueBlock.value;
    const ulrow = `<li><p><span>${typeval}</span> ${subjval}</p></li>`;

    common.getElement("pkcs10-subject").innerHTML = common.getElement("pkcs10-subject").innerHTML + ulrow;
    if (typeval === "CN") {
      common.getElement("pkcs10-subject-cn").innerHTML = subjval;
    }
  }
  //#endregion

  //#region Put information about public key size
  let publicKeySize = "< unknown >";

  if (pkcs10.subjectPublicKeyInfo.algorithm.algorithmId.indexOf("1.2.840.113549") !== (-1)) {
    const asn1PublicKey = asn1js.fromBER(pkcs10.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex);
    pkijs.AsnError.assert(asn1, "pkcs10.subjectPublicKeyInfo.subjectPublicKey");
    const rsaPublicKeySimple = new pkijs.RSAPublicKey({ schema: asn1PublicKey.result });
    const modulusView = new Uint8Array(rsaPublicKeySimple.modulus.valueBlock.valueHex);
    let modulusBitLength = 0;

    if (modulusView[0] === 0x00)
      modulusBitLength = (rsaPublicKeySimple.modulus.valueBlock.valueHex.byteLength - 1) * 8;
    else
      modulusBitLength = rsaPublicKeySimple.modulus.valueBlock.valueHex.byteLength * 8;

    publicKeySize = modulusBitLength.toString();
  }

  common.getElement("keysize").innerHTML = publicKeySize;
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
  };
  let signatureAlgorithm = algomap[pkcs10.signatureAlgorithm.algorithmId];
  if (typeof signatureAlgorithm === "undefined")
    signatureAlgorithm = pkcs10.signatureAlgorithm.algorithmId;
  else
    signatureAlgorithm = `${signatureAlgorithm} (${pkcs10.signatureAlgorithm.algorithmId})`;

  common.getElement("sig-algo").innerHTML = signatureAlgorithm;
  //#endregion

  //#region Put information about PKCS#10 attributes
  if (pkcs10.attributes) {
    for (let i = 0; i < pkcs10.attributes.length; i++) {
      const typeval = pkcs10.attributes[i].type;
      let subjval = "";

      for (let j = 0; j < pkcs10.attributes[i].values.length; j++) {
        // noinspection OverlyComplexBooleanExpressionJS
        if ((pkcs10.attributes[i].values[j] instanceof asn1js.Utf8String) ||
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
          (pkcs10.attributes[i].values[j] instanceof asn1js.CharacterString)) {
          subjval = subjval + ((subjval.length === 0) ? "" : ";") + pkcs10.attributes[i].values[j].valueBlock.value;
        }
        else
          subjval = subjval + ((subjval.length === 0) ? "" : ";") + pkcs10.attributes[i].values[j].constructor.blockName();
      }

      const ulrow = `<li><p><span>${typeval}</span> ${subjval}</p></li>`;
      common.getElement("pkcs10-exten").innerHTML = common.getElement("pkcs10-exten").innerHTML + ulrow;
    }

    common.getElement("pkcs10-attributes").style.display = "block";
  }
  //#endregion

  common.getElement("pkcs10-data-block").style.display = "block";
}

async function verifyPKCS10() {
  try {
    pkcs10Buffer = utils.fromPEM(common.getElement("pem-text-block", "textarea").value);
    const result = await example.verifyPKCS10Internal(pkcs10Buffer);
    alert(`Verification passed: ${result}`);
  } catch (error) {
    alert(`Error during verification: ${error instanceof Error ? error.message : error}`);
  }
}

function handleHashAlgOnChange() {
  const hashOption = (common.getElement("hashAlg") as HTMLInputElement).value;
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
  const signOption = (common.getElement("signAlg") as HTMLInputElement).value;
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

common.getElement("hashAlg").addEventListener("change", handleHashAlgOnChange);
common.getElement("signAlg").addEventListener("change", handleSignAlgOnChange);
common.getElement("create_pkcs10").addEventListener("click", createPKCS10);
common.getElement("parse_pkcs10").addEventListener("click", parsePKCS10);
common.getElement("verify_pkcs10").addEventListener("click", verifyPKCS10);
