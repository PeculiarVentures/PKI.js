import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as utils from "./utils";
import * as pkijs from "../src";

interface CreateOcspRespResult extends utils.CertificateWithPrivateKey {
  ocspResp: pkijs.OCSPResponse;
}

/**
 * Create OCSP response
 * @param hashAlg Hash algorithm
 * @param signAlg Signing algorithm
 * @returns
 */
export async function createOCSPResp(hashAlg: string, signAlg: string): Promise<CreateOcspRespResult> {
  const ocspRespSimpl = new pkijs.OCSPResponse();
  const ocspBasicResp = new pkijs.BasicOCSPResponse();

  const certWithKey = await utils.createSelfSignedCertificate(hashAlg, signAlg);

  // Create specific TST info structure to sign
  ocspRespSimpl.responseStatus.valueBlock.valueDec = 0; // success
  ocspRespSimpl.responseBytes = new pkijs.ResponseBytes();
  ocspRespSimpl.responseBytes.responseType = "1.3.6.1.5.5.7.48.1.1";

  const responderIDBuffer = new ArrayBuffer(1);
  const responderIDView = new Uint8Array(responderIDBuffer);
  responderIDView[0] = 0x01;

  ocspBasicResp.tbsResponseData.responderID = certWithKey.certificate.issuer;
  ocspBasicResp.tbsResponseData.producedAt = new Date();

  const response = new pkijs.SingleResponse();
  response.certID.hashAlgorithm.algorithmId = "1.3.14.3.2.26"; // SHA-1
  response.certID.issuerNameHash.valueBlock.valueHex = responderIDBuffer; // Fiction hash
  response.certID.issuerKeyHash.valueBlock.valueHex = responderIDBuffer; // Fiction hash
  response.certID.serialNumber.valueBlock.valueDec = 1; // Fiction serial number
  response.certStatus = new asn1js.Primitive({
    idBlock: {
      tagClass: 3, // CONTEXT-SPECIFIC
      tagNumber: 0 // [0]
    },
    lenBlockLength: 1 // The length contains one byte 0x00
  }); // status - success
  response.thisUpdate = new Date();

  ocspBasicResp.tbsResponseData.responses.push(response);

  ocspBasicResp.certs = [certWithKey.certificate];

  await ocspBasicResp.sign(certWithKey.privateKey, hashAlg);

  // Finally create completed OCSP response structure
  const encodedOCSPBasicResp = ocspBasicResp.toSchema().toBER(false);
  ocspRespSimpl.responseBytes.response = new asn1js.OctetString({ valueHex: encodedOCSPBasicResp });

  return {
    ...certWithKey,
    ocspResp: ocspRespSimpl,
  };
}

/**
 * Verify existing OCSP response
 * @param ocspResponseBuffer OCSP response
 * @param trustedCertificates List of trusted certificates
 * @returns
 */
export async function verifyOCSPResp(ocspResponseBuffer: ArrayBuffer, trustedCertificates: pkijs.Certificate[]): Promise<boolean> {
  let ocspBasicResp: pkijs.BasicOCSPResponse;

  //#region Decode existing OCSP response
  const asn1 = asn1js.fromBER(ocspResponseBuffer);
  const ocspRespSimpl = new pkijs.OCSPResponse({ schema: asn1.result });

  if (ocspRespSimpl.responseBytes) {
    const asn1Basic = asn1js.fromBER(ocspRespSimpl.responseBytes.response.valueBlock.valueHex);
    ocspBasicResp = new pkijs.BasicOCSPResponse({ schema: asn1Basic.result });
  } else {
    throw new Error("No \"ResponseBytes\" in the OCSP Response - nothing to verify");
  }
  //#endregion

  //#region Verify OCSP response
  return ocspBasicResp.verify({ trustedCerts: trustedCertificates });
  //#endregion
}

