(
function(in_window)
{
    if(typeof in_window.org === "undefined")
        in_window.org = {};
    else
    {
        if(typeof in_window.org !== "object")
            throw new Error("Name org already exists and it's not an object");
    }

    if(typeof in_window.org.pkijs === "undefined")
        in_window.org.pkijs = {};
    else
    {
        if(typeof in_window.org.pkijs !== "object")
            throw new Error("Name org.pkijs already exists and it's not an object" + " but " + (typeof in_window.org.pkijs));
    }

    if(typeof in_window.org.pkijs.schema === "undefined")
        in_window.org.pkijs.schema = {};
    else
    {
        if(typeof in_window.org.pkijs.schema !== "object")
            throw new Error("Name org.pkijs.schema already exists and it's not an object" + " but " + (typeof in_window.org.pkijs.schema));
    }

    if(typeof in_window.org.pkijs.schema.pkiMessage === "undefined")
        in_window.org.pkijs.schema.pkiMessage = {};
    else
    {
        if(typeof in_window.org.pkijs.schema.pkiMessage !== "object")
            throw new Error("Name org.pkijs.schema.pkiMessage already exists and it's not an object" + " but " + (typeof in_window.org.pkijs.schema.pkiMessage));
    }

    var local = {};


    in_window.org.pkijs.schema.pkiMessage.InfoTypeAndValue =
    function(input_names, input_optional)
    {
        // InfoTypeAndValue ::= SEQUENCE {
        //    infoType               OBJECT IDENTIFIER,
        //    infoValue              ANY DEFINED BY infoType  OPTIONAL }
        // -- where {id-it} = {id-pkix 4} = {1 3 6 1 5 5 7 4}

        var names = in_window.org.pkijs.getNames(arguments[0]);
        var optional = (input_optional || false);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || ""),
            value: [
                new in_window.org.pkijs.asn1.OID({ name: (names.infoType || "") }),
                new in_window.org.pkijs.asn1.ANY({
                    optional: true,
                    name: (names.infoValue || "")
                })
            ]
        }));
    };

    in_window.org.pkijs.schema.pkiMessage.GenMsgContent =
    function(input_names, input_optional)
    {
        // GenMsgContent ::= SEQUENCE OF InfoTypeAndValue

        var names = in_window.org.pkijs.getNames(arguments[0]);
        var optional = (input_optional || false);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || ""),
            optional: optional,
            value: [
                new in_window.org.pkijs.asn1.REPEATED({
                    name: (names.infoTypes || ""),
                    value: in_window.org.pkijs.schema.pkiMessage.InfoTypeAndValue(names.infoValues || {})
                })
            ]
        }));
    };

    in_window.org.pkijs.schema.pkiMessage.GenRepContent =
    function(input_names, input_optional)
    {
        // GenRepContent ::= SEQUENCE OF InfoTypeAndValue

        var names = in_window.org.pkijs.getNames(arguments[0]);
        var optional = (input_optional || false);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || ""),
            optional: optional,
            value: [
                new in_window.org.pkijs.asn1.REPEATED({
                    name: (names.infoTypes || ""),
                    value: in_window.org.pkijs.schema.pkiMessage.InfoTypeAndValue(names.infoValues || {})
                })
            ]
        }));
    };

    in_window.org.pkijs.schema.pkiMessage.ProofOfPossession =
    function(input_names, input_optional)
    {
        // ProofOfPossession ::= CHOICE {
        //    raVerified        [0] NULL,
        //    -- used if the RA has already verified that the requester is in
        //    -- possession of the private key
        //    signature         [1] POPOSigningKey,
        //    keyEncipherment   [2] POPOPrivKey,
        //    keyAgreement      [3] POPOPrivKey }

        var names = in_window.org.pkijs.getNames(arguments[0]);
        var optional = (input_optional || false);

        return (new in_window.org.pkijs.asn1.CHOICE({
            name: (names.block_name || ""),
            value: [
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (name.POP_raVerified || "raVerified"),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 0 // [0]
                    },
                    value: [ new in_window.org.pkijs.asn1.NULL() ]
                }),
                /* TODO
                new in_window.org.pkijs.asn1.CONSTRUCTED({
                    name: (name.POP_signature || "signature"),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 1 // [2]
                    }
                    value: [ ]
                }),
                new in_window.org.pkijs.asn1.CONSTRUCTED({
                    name: (name.POP_keyEncipherment || "keyEncipherment"),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 2 // [2]
                    }
                    value: [ ]
                }),
                new in_window.org.pkijs.asn1.CONSTRUCTED({
                    name: (name.POP_keyAgreement || "keyAgreement"),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 3 // [3]
                    }
                    value: [ ]
                })
                */
            ]
        }));
    }

    in_window.org.pkijs.schema.pkiMessage.CertTemplate =
    function(input_names, input_optional)
    {
        // CertTemplate ::= SEQUENCE {
        //    version      [0] Version               OPTIONAL,
        //    serialNumber [1] INTEGER               OPTIONAL,
        //    signingAlg   [2] AlgorithmIdentifier{SIGNATURE-ALGORITHM,
        //                  {SignatureAlgorithms}}   OPTIONAL,
        //    issuer       [3] Name                  OPTIONAL,
        //    validity     [4] OptionalValidity      OPTIONAL,
        //    subject      [5] Name                  OPTIONAL,
        //    publicKey    [6] SubjectPublicKeyInfo  OPTIONAL,
        //    issuerUID    [7] UniqueIdentifier      OPTIONAL,
        //    subjectUID   [8] UniqueIdentifier      OPTIONAL,
        //    extensions   [9] Extensions{{CertExtensions}}  OPTIONAL }

        var names = in_window.org.pkijs.getNames(arguments[0]);
        var optional = (input_optional || false);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || ""),
            value: [
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || ""),
                    optional: true,
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 0 // [0]
                    },
                    value: [
                        new in_window.org.pkijs.asn1.INTEGER({ name: (names.certTemplate_version || "certTemplate.version") }),
                    ]
                })
            ]
        }));
    }

    in_window.org.pkijs.schema.pkiMessage.CertRequest =
    function(input_names, input_optional)
    {
        // CertRequest ::= SEQUENCE {
        //    certReqId     INTEGER,
        //    -- ID for matching request and reply
        //    certTemplate  CertTemplate,
        //    -- Selected fields of cert to be issued
        //    controls      Controls OPTIONAL }
        //    -- Attributes affecting issuance
        //
        // Controls  ::= SEQUENCE SIZE(1..MAX) OF SingleAttribute
        //               {{RegControlSet}}

        var names = in_window.org.pkijs.getNames(arguments[0]);
        var optional = (input_optional || false);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || ""),
            value: [
                new in_window.org.pkijs.asn1.INTEGER({ name: (names.certReqId || "certReqId") }),
                new in_window.org.pkijs.schema.pkiMessage.CertTemplate({ name: (names.certTemplate || "certTemplate") }),
                new in_window.org.pkijs.asn1.REPEATED({
                    optional: true,
                    name: (names.controls || "controls"),
                    value: [ new in_window.org.pkijs.schema.ATTRIBUTE() ]
                })
            ]
        }));
    };

    in_window.org.pkijs.schema.pkiMessage.CertReqMessage =
    function(input_names, input_optional)
    {
        // CertReqMsg ::= SEQUENCE {
        //    certReq   CertRequest,
        //    popo       ProofOfPossession  OPTIONAL,
        //    -- content depends upon key type
        //    regInfo   SEQUENCE SIZE(1..MAX) OF
        //        SingleAttribute{{RegInfoSet}} OPTIONAL }

        var names = in_window.org.pkijs.getNames(arguments[0]);
        var optional = (input_optional || false);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || ""),
            optional: optional,
            value: [
                new in_window.org.pkijs.schema.pkiMessage.CertRequest({ name: (names.certRequest || "certReq") }),
                new in_window.org.pkijs.schema.pkiMessage.ProofOfPossession({
                    optional: true,
                    name: (names.proofOfPossession || "popo") }),
                new in_window.org.pkijs.asn1.REPEATED({
                    name: (names.regInfo || "regInfo"),
                    value: [ new in_window.org.pkijs.schema.ATTRIBUTE() ]
                })
            ]
        }));
    };

    in_window.org.pkijs.schema.pkiMessage.PKIHeader =
    function(input_names, input_optional)
    {
        // PKIHeader ::= SEQUENCE {
        //    pvno                INTEGER     { cmp1999(1), cmp2000(2) },
        //    sender              GeneralName,
        //    recipient           GeneralName,
        //    messageTime     [0] GeneralizedTime         OPTIONAL,
        //    protectionAlg   [1] AlgorithmIdentifier     OPTIONAL,
        //    senderKID       [2] KeyIdentifier           OPTIONAL,
        //    recipKID        [3] KeyIdentifier           OPTIONAL,
        //    transactionID   [4] OCTET STRING            OPTIONAL,
        //    senderNonce     [5] OCTET STRING            OPTIONAL,
        //    recipNonce      [6] OCTET STRING            OPTIONAL,
        //    freeText        [7] PKIFreeText             OPTIONAL,
        //    generalInfo     [8] SEQUENCE SIZE (1..MAX) OF
        //    InfoTypeAndValue     OPTIONAL }
        //
        // PKIFreeText ::= SEQUENCE SIZE (1..MAX) OF UTF8String

        var names = in_window.org.pkijs.getNames(arguments[0]);
        var optional = (input_optional || false);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || "PKIHeader"),
            value: [
                new in_window.org.pkijs.asn1.INTEGER({ name: (names.PKIHeader_pvno || "PKIHeader.pvno") }),
                new in_window.org.pkijs.schema.GENERAL_NAME({ name: (names.PKIHeader_sender || "PKIHeader.sender") }),
                new in_window.org.pkijs.schema.GENERAL_NAME({ name: (names.PKIHeader_recipient || "PKIHeader.recipient") }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || ""),
                    optional: true,
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 0 // [0]
                    },
                    value: [
                        new in_window.org.pkijs.schema.TIME(names.PKIHeader_messageTime || {
                        names: {
                            utcTimeName: "PKIHeader.messageTime",
                            generalTimeName: "PKIHeader.messageTime"
                        }})
                    ]
                }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || "PKIHeader.transcationID"),
                    optional: true,
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 4 // [4]
                    },
                    value: [
                        new in_window.org.pkijs.asn1.OCTETSTRING({ name: (names.PKIHeader_transactionID || "") })
                    ]
                }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || "PKIHeader.senderNonce"),
                    optional: true,
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 5 // [5]
                    },
                    value: [
                        new in_window.org.pkijs.asn1.OCTETSTRING({ name: (names.PKIHeader_senderNonce || "") })
                    ]
                }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || "PKIHeader.recipNonce"),
                    optional: true,
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 6 // [6]
                    },
                    value: [
                        new in_window.org.pkijs.asn1.OCTETSTRING({ name: (names.PKIHeader_recipNonce || "") })
                    ]
                }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || "PKIHeader.freeText"),
                    optional: true,
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 7 // [7]
                    },
                    value: [
                        new in_window.org.pkijs.asn1.REPEATED({
                            name: (names.freeText || ""),
                            value: [
                                new in_window.org.pkijs.asn1.UTF8STRING() 
                            ]
                        })
                    ]
                }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || "PKIHeader.generalInfo"),
                    optional: true,
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 8 // [8]
                    },
                    value: [
                        new in_window.org.pkijs.asn1.REPEATED({
                            name: (names.generalInfo || ""),
                            value: [
                                new in_window.org.pkijs.schema.pkiMessage.InfoTypeAndValue(names.infoValues || {})
                            ]
                        })
                    ]
                })
            ]
        }));
    }


    in_window.org.pkijs.schema.pkiMessage.PKIBody =
    function(input_names, input_optional)
    {
        // PKIBody ::= CHOICE {
        //    ir       [0]  CertReqMsgs,           --Initialization Req
        //    ip       [1]  CertRepMessage,        --Initialization Resp
        //    cr       [2]  CertReqMsgs,           --Certification Req
        //    cp       [3]  CertRepMessage,        --Certification Resp
        //    p10cr    [4]  CertificationRequest,  --PKCS #10 Cert.  Req.
        //    popdecc  [5]  POPODecKeyChallContent --pop Challenge
        //    popdecr  [6]  POPODecKeyRespContent, --pop Response
        //    kur      [7]  CertReqMsgs,           --Key Update Request
        //    kup      [8]  CertRepMessage,        --Key Update Response
        //    krr      [9]  CertReqMsgs,           --Key Recovery Req
        //    krp      [10] KeyRecRepContent,      --Key Recovery Resp
        //    rr       [11] RevReqContent,         --Revocation Request
        //    rp       [12] RevRepContent,         --Revocation Response
        //    ccr      [13] CertReqMsgs,           --Cross-Cert.  Request
        //    ccp      [14] CertRepMessage,        --Cross-Cert.  Resp
        //    ckuann   [15] CAKeyUpdAnnContent,    --CA Key Update Ann.
        //    cann     [16] CertAnnContent,        --Certificate Ann.
        //    rann     [17] RevAnnContent,         --Revocation Ann.
        //    crlann   [18] CRLAnnContent,         --CRL Announcement
        //    pkiconf  [19] PKIConfirmContent,     --Confirmation
        //    nested   [20] NestedMessageContent,  --Nested Message
        //    genm     [21] GenMsgContent,         --General Message
        //    genp     [22] GenRepContent,         --General Response
        //    error    [23] ErrorMsgContent,       --Error Message
        //    certConf [24] CertConfirmContent,    --Certificate confirm
        //    pollReq  [25] PollReqContent,        --Polling request
        //    pollRep  [26] PollRepContent         --Polling response }

        var names = in_window.org.pkijs.getNames(arguments[0]);
        var optional = (input_optional || false);

        return (new in_window.org.pkijs.asn1.CHOICE({
            name: (names.PKIMessage_body || "PKIBody"),
            value: [
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || ""),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 0 // [0]
                    },
                    value: [
                        new in_window.org.pkijs.asn1.REPEATED({
                            names: {
                                block_name: "PKIBody.ir"
                            },
                            value: [ new in_window.org.pkijs.schema.pkiMessage.CertReqMessage()]
                        })
                    ]
                }),
                /* TODO
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || ""),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 1 // [1]
                    },
                    value: [
                        new in_window.org.pkijs.schema.pkiMessage.CertRepMessage({
                            names: {
                                block_name: "PKIBody.ip"
                            }
                        })
                    ]
                }),
                */
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || ""),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 2 // [2]
                    },
                    value: [
                        new in_window.org.pkijs.asn1.REPEATED({
                            names: {
                                block_name: "PKIBody.cr"
                            },
                            value: [ new in_window.org.pkijs.schema.pkiMessage.CertReqMessage()]
                        })
                    ]
                }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || ""),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 3 // [3]
                    },
                    value: [
                        new in_window.org.pkijs.schema.pkiMessage.CertReqMessage({
                            names: {
                                block_name: "PKIBody.cp"
                            }
                        })
                    ]
                }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || ""),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 4 // [4]
                    },
                    value: [
                        new in_window.org.pkijs.schema.PKCS10({
                            names: {
                                block_name: "PKIBody.p10cr"
                            }
                        })
                    ]
                }),

                // TODO choices 5 - 20

                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || ""),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 21 // [21]
                    },
                    value: [
                        new in_window.org.pkijs.schema.pkiMessage.GenMsgContent(names.genMessage || {
                        names: {
                            block_name: "PKIBody.genm"
                        }
                    })]
                }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || ""),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 22 // [22]
                    },
                    value: [
                        new in_window.org.pkijs.schema.pkiMessage.GenRepContent(names.genRepMessage || {
                        names: {
                            block_name: "PKIBody.genp"
                        }
                    })]
                }),
            ]
        }));
    }

    in_window.org.pkijs.schema.pkiMessage.PKIMessage =
    function(input_names, input_optional)
    {
        // PKIMessage ::= SEQUENCE {
        //    header           PKIHeader,
        //    body             PKIBody,
        //    protection   [0] PKIProtection OPTIONAL,
        //    extraCerts   [1] SEQUENCE SIZE (1..MAX) OF CMPCertificate OPTIONAL }
        //
        // PKIMessages ::= SEQUENCE SIZE (1..MAX) OF PKIMessage

        var names = in_window.org.pkijs.getNames(arguments[0]);
        var optional = (input_optional || false);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || "PKIMessage"),
            value: [
                new in_window.org.pkijs.schema.pkiMessage.PKIHeader({ name: (names.PKIMessage_header || "PKIMessage.header") }),
                new in_window.org.pkijs.schema.pkiMessage.PKIBody({ name: (names.PKIMessage_body || "PKIMessage.body") }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || "protection"),
                    optional: true,
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 0 // [0]
                    },
                    value: [
                        new in_window.org.pkijs.asn1.BITSTRING({ name: (names.protection || "") })
                    ]
                }),

            ]
        }));
    };
}
)(typeof exports !== "undefined" ? exports : window);
