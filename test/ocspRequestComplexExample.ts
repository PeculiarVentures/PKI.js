import * as asn1js from "asn1js";
import * as pkijs from "../src";

/**
 * Create OCSP request
 * @returns
 */
export async function createOCSPReq(): Promise<ArrayBuffer> {
  //#region Initial variables
  const ocspReqSimpl = new pkijs.OCSPRequest();
  //#endregion
  //#region Put static variables
  ocspReqSimpl.tbsRequest.requestorName = new pkijs.GeneralName({
    type: 4,
    value: new pkijs.RelativeDistinguishedNames({
      typesAndValues: [
        new pkijs.AttributeTypeAndValue({
          type: "2.5.4.6",
          value: new asn1js.PrintableString({ value: "RU" })
        }),
        new pkijs.AttributeTypeAndValue({
          type: "2.5.4.3",
          value: new asn1js.BmpString({ value: "Test" })
        })
      ]
    })
  });

  const fictionBuffer = new ArrayBuffer(4);
  const fictionView = new Uint8Array(fictionBuffer);
  fictionView[0] = 0x7F;
  fictionView[1] = 0x01;
  fictionView[2] = 0x02;
  fictionView[3] = 0x03;

  const issuerName = new pkijs.RelativeDistinguishedNames({
    typesAndValues: [
      new pkijs.AttributeTypeAndValue({
        type: "2.5.4.3", // CN
        value: new asn1js.Utf8String({ value: "test-issuer" }),
      }),
    ],
  });
  const serviceLocatorDer = new asn1js.Sequence({
    value: [issuerName.toSchema()],
  }).toBER(false);
  ocspReqSimpl.tbsRequest.requestList = [new pkijs.Request({
    reqCert: new pkijs.CertID({
      hashAlgorithm: new pkijs.AlgorithmIdentifier({
        algorithmId: "1.3.14.3.2.26"
      }),
      issuerNameHash: new asn1js.OctetString({ valueHex: fictionBuffer }),
      issuerKeyHash: new asn1js.OctetString({ valueHex: fictionBuffer }),
      serialNumber: new asn1js.Integer({ valueHex: fictionBuffer })
    }),
    singleRequestExtensions: [
      new pkijs.Extension({
        extnID: "1.3.6.1.5.5.7.48.1.7", // id-pkix-ocsp-service-locator
        critical: false,
        extnValue: serviceLocatorDer,
      }),
    ]
  })];

  ocspReqSimpl.tbsRequest.requestExtensions = [
    new pkijs.Extension({
      extnID: "1.3.6.1.5.5.7.48.1.2",
      extnValue: (new asn1js.OctetString({ valueHex: fictionBuffer })).toBER(false)
    })
  ];
  //#endregion

  // Encode OCSP request and put on the Web page
  return ocspReqSimpl.toSchema(true).toBER(false);
}
