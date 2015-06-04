/**
 * CMP schemas from rfc 4210
 * See http://tools.ietf.org/html/rfc4210
 **/
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

    if(typeof in_window.org.pkijs.schema.cmp === "undefined")
        in_window.org.pkijs.schema.cmp = {};
    else
    {
        if(typeof in_window.org.pkijs.schema.cmp !== "object")
            throw new Error("Name org.pkijs.schema.cmp already exists and it's not an object" + " but " + (typeof in_window.org.pkijs.schema.cmp));
    }

    var local = {};


    in_window.org.pkijs.schema.cmp.InfoTypeAndValue =
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

    in_window.org.pkijs.schema.cmp.GenMsgContent =
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
                    value: in_window.org.pkijs.schema.cmp.InfoTypeAndValue(names.infoValues || {})
                })
            ]
        }));
    };

    in_window.org.pkijs.schema.cmp.GenRepContent =
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
                    value: in_window.org.pkijs.schema.cmp.InfoTypeAndValue(names.infoValues || {})
                })
            ]
        }));
    };

    in_window.org.pkijs.schema.cmp.POPOSigningKeyInput =
    function(input_names, input_optional)
    {
        // POPOSigningKeyInput ::= SEQUENCE {
        //    authInfo            CHOICE {
        //       sender              [0] GeneralName,
        //       publicKeyMAC        [1] PKMACValue
        //    },
        //    publicKey           SubjectPublicKeyInfo    -- from CertTemplate
        // }

        var names = in_window.org.pkijs.getNames(arguments[0]);
        var optional = (input_optional || false);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || ""),
            value: [
                // authInfo
                new in_window.org.pkijs.asn1.CHOICE({
                    value: [
                        new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                            id_block: {
                                tag_class: 3,
                                tag_number: 0
                            },
                            value: [
                                new in_window.org.pkijs.schema.GENERAL_NAME({
                                    name: (names.sender || "sender"),
                                })
                            ]
                        }),
                        new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                            id_block: {
                                tag_class: 3,
                                tag_number: 1
                            },
                            value: [
                                new in_window.org.pkijs.asn1.SEQUENCE({
                                    name: (names.publicKeyMAC || "publicKeyMAC"),
                                    value: [
                                        new in_window.org.pkijs.schema.ALGORITHM_IDENTIFIER(names.algorithmIdentifier || {}),
                                        new in_window.org.pkijs.asn1.BITSTRING({ name: (names.signature || "") })
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                // publicKey
                in_window.org.pkijs.schema.PUBLIC_KEY_INFO(names.subjectPublicKeyInfo || {
                    names: {
                        block_name: "tbsCertificate.subjectPublicKeyInfo"
                    }
                })
            ]
        }));
    };

    in_window.org.pkijs.schema.cmp.POPOSigningKey =
    function(input_names, input_optional)
    {
        // POPOSigningKey ::= SEQUENCE {
        //    poposkInput         [0] POPOSigningKeyInput OPTIONAL,
        //    algorithmIdentifier     AlgorithmIdentifier,
        //    signature               BIT STRING }

        var names = in_window.org.pkijs.getNames(arguments[0]);
        var optional = (input_optional || false);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || ""),
            value: [
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    optional: true,
                    id_block: {
                        tag_class: 3,
                        tag_number: 0
                    },
                    value: [ new in_window.org.pkijs.schema.cmp.POPOSigningKeyInput() ]
                }),
                new in_window.org.pkijs.schema.ALGORITHM_IDENTIFIER(names.algorithmIdentifier || {}),
                new in_window.org.pkijs.asn1.BITSTRING({ name: (names.signature || "") })
            ]
        }));
    };

    in_window.org.pkijs.schema.cmp.ProofOfPossession =
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
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (name.POP_signature || "signature"),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 1 // [2]
                    },
                    value: [
                        new in_window.org.pkijs.schema.cmp.POPOSigningKey()
                    ]
                }),
                /* TODO
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

    in_window.org.pkijs.schema.cmp.CertTemplate =
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
                // version
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
                }),
                // serialNumber
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || ""),
                    optional: true,
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 1 // [1]
                    },
                    value: [
                        new in_window.org.pkijs.asn1.INTEGER({ name: (names.certTemplate_serialNumber || "certTemplate.serialNumber") }),
                    ]
                }),
                // signingAlg
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || ""),
                    optional: true,
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 2 // [2]
                    },
                    value: [
                        new in_window.org.pkijs.schema.ALGORITHM_IDENTIFIER(name.certTemplate_signingAlg || {}),
                    ]
                }),
                // issuer
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || ""),
                    optional: true,
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 3 // [3]
                    },
                    value: [
                        new in_window.org.pkijs.schema.GENERAL_NAME(name.certTemplate_issuer || "")
                    ]
                }),

                // TODO validity

                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || ""),
                    optional: true,
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 5 // [5]
                    },
                    value: [
                        new in_window.org.pkijs.schema.GENERAL_NAME(name.certTemplate_subject || "")
                    ]
                }),
                // publicKey
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || ""),
                    optional: true,
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 6 // [6]
                    },
                    value: [
                        new in_window.org.pkijs.schema.PUBLIC_KEY_INFO(name.certTemplate_publicKey || {})
                    ]
                })
                // TODO issuerUID
                // TODO subjectUID
                // TODO extensions
            ]
        }));
    }

    in_window.org.pkijs.schema.cmp.CertRequest =
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
                new in_window.org.pkijs.schema.cmp.CertTemplate({ name: (names.certTemplate || "certTemplate") }),
                new in_window.org.pkijs.asn1.REPEATED({
                    optional: true,
                    name: (names.controls || "controls"),
                    value: new in_window.org.pkijs.schema.ATTRIBUTE(names.attributes || {})
                })
            ]
        }));
    };

    in_window.org.pkijs.schema.cmp.GenRepContent =
    function(input_names, input_optional)
    {
        // GenRepContent ::= SEQUENCE OF InfoTypeAndValue

        var names = in_window.org.pkijs.getNames(arguments[0]);
        var optional = (input_optional || false);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || "GenRepContent"),
            value: [
                new in_window.org.pkijs.asn1.REPEATED({
                    value: in_window.org.pkijs.schema.cmp.InfoTypeAndValue()
                })
            ]
        }));
    };

    in_window.org.pkijs.schema.cmp.CertReqMsg =
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
                new in_window.org.pkijs.schema.cmp.CertRequest({ name: (names.certRequest || "certReq") }),
                new in_window.org.pkijs.schema.cmp.ProofOfPossession({
                    optional: true,
                    name: (names.proofOfPossession || "popo") }),
                    /*
                new in_window.org.pkijs.asn1.REPEATED({
                    optional: true,
                    name: (names.regInfo || "regInfo"),
                    value: new in_window.org.pkijs.schema.ATTRIBUTE()
                })
                */
            ]
        }));
    };

    in_window.org.pkijs.schema.cmp.PKIHeader =
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
                new in_window.org.pkijs.schema.GENERAL_NAME({ names: { block_name: (names.PKIHeader_sender || "PKIHeader.sender") }}),
                new in_window.org.pkijs.schema.GENERAL_NAME({ names: { block_name: (names.PKIHeader_recipient || "PKIHeader.recipient") }}),
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
                    name: (names.block_name || ""),
                    optional: true,
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 1 // [1]
                    },
                    value: [new in_window.org.pkijs.schema.ALGORITHM_IDENTIFIER(names.protectionAlg || {
                        names: {
                            block_name: "PKIHeader.protectionAlg"
                        }
                    })]
                }),

                // TODO tags 2 and 3

                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || "PKIHeader.transactionID"),
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
                            value: new in_window.org.pkijs.asn1.UTF8STRING()
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
                            value: new in_window.org.pkijs.asn1.SEQUENCE({
                                value: [
                                    new in_window.org.pkijs.schema.cmp.InfoTypeAndValue(names.infoValues || {})
                                ]
                            })
                        })
                    ]
                })
            ]
        }));
    }


    in_window.org.pkijs.schema.cmp.PKIBody =
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
                    name: (names.block_name || "PKIBody.ir"),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 0 // [0]
                    },
                    value: [
                        new in_window.org.pkijs.asn1.REPEATED({
                            name: (names.PKIBody_certRequestMessage || "certRequestMessages"),
                            value: new in_window.org.pkijs.schema.cmp.CertReqMsg()
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
                        new in_window.org.pkijs.schema.cmp.CertRepMessage({
                            names: {
                                block_name: "PKIBody.ip"
                            }
                        })
                    ]
                }),
                */
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || "PKIBody.cr"),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 2 // [2]
                    },
                    value: [
                        new in_window.org.pkijs.asn1.REPEATED({
                            name: (names.PKIBody_certRequestMessage || "certRequestMessages"),
                            value: new in_window.org.pkijs.schema.cmp.CertReqMsg()
                        })
                    ]
                }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || "PKIBody.cp"),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 3 // [3]
                    },
                    value: [
                        new in_window.org.pkijs.schema.cmp.CertReqMsg()
                    ]
                }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || "PKIBody.p10cr"),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 4 // [4]
                    },
                    value: [
                        new in_window.org.pkijs.schema.PKCS10()
                    ]
                }),

                // TODO choices 5 - 20

                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || "PKIBody.genm"),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 21 // [21]
                    },
                    value: [
                        new in_window.org.pkijs.schema.cmp.GenMsgContent()
                    ]
                }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || "PKIBody.genp"),
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 22 // [22]
                    },
                    value: [
                        new in_window.org.pkijs.schema.cmp.GenRepContent()
                    ]
                })
            ]
        }));
    }

    in_window.org.pkijs.schema.cmp.PKIMessage =
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
                new in_window.org.pkijs.schema.cmp.PKIHeader({ name: (names.PKIMessage_header || "PKIMessage.header") }),
                new in_window.org.pkijs.schema.cmp.PKIBody({ name: (names.PKIMessage_body || "PKIMessage.body") }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || "PKIMessage.protection"),
                    optional: true,
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 0 // [0]
                    },
                    value: [
                        new in_window.org.pkijs.asn1.BITSTRING({ name: (names.protection || "") })
                    ]
                /** TODO
                }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || "PKIMessage.extraCerts"),
                    optional: true,
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 1 // [1]
                    },
                    value: [
                        new in_window.org.pkijs.asn1.REPEATED({
                            name: (names.extraCerts || ""),
                            value: in_window.org.pkijs.cmp.CMPCertificate()
                        })
                    ]
                */
                })
            ]
        }));
    };
}
)(typeof exports !== "undefined" ? exports : window);
