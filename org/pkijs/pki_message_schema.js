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

    if(typeof in_window.org.pkijs.schema.x509 === "undefined")
        in_window.org.pkijs.schema.x509 = {};
    else
    {
        if(typeof in_window.org.pkijs.schema.x509 !== "object")
            throw new Error("Name org.pkijs.schema.x509 already exists and it's not an object" + " but " + (typeof in_window.org.pkijs.schema.x509));
    }

    var local = {};


    if(typeof in_window.org.pkijs.schema.pkiMessage === "undefined")
        in_window.org.pkijs.schema.pkiMessage = {};
    else
    {
        if(typeof in_window.org.pkijs.schema.pkiMessage !== "object")
            throw new Error("Name org.pkijs.schema.pkiMessage already exists and it's not an object" + " but " + (typeof in_window.org.pkijs.schema.pkiMessage));
    }


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
                    value: in_window.org.pkijs.schema.pkiMessage.InfoTypeAndValue(names.infoTypes || {})
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
                    value: in_window.org.pkijs.schema.pkiMessage.InfoTypeAndValue(names.infoTypes || {})
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
        // PKIBody ::= CHOICE {
        //    ir       [0]  CertReqMessages,       --Initialization Req
        //    ip       [1]  CertRepMessage,        --Initialization Resp
        //    cr       [2]  CertReqMessages,       --Certification Req
        //    cp       [3]  CertRepMessage,        --Certification Resp
        //    p10cr    [4]  CertificationRequest,  --PKCS #10 Cert.  Req.
        //    popdecc  [5]  POPODecKeyChallContent --pop Challenge
        //    popdecr  [6]  POPODecKeyRespContent, --pop Response
        //    kur      [7]  CertReqMessages,       --Key Update Request
        //    kup      [8]  CertRepMessage,        --Key Update Response
        //    krr      [9]  CertReqMessages,       --Key Recovery Req
        //    krp      [10] KeyRecRepContent,      --Key Recovery Resp
        //    rr       [11] RevReqContent,         --Revocation Request
        //    rp       [12] RevRepContent,         --Revocation Response
        //    ccr      [13] CertReqMessages,       --Cross-Cert.  Request
        //    ccp      [14] CertRepMessage,        --Cross-Cert.  Resp
        //    ckuann   [15] CAKeyUpdAnnContent,    --CA Key Update Ann.
        //    cann     [16] CertAnnContent,        --Certificate Ann.
        //    cation Ann.
        //    crlann   [18] CRLAnnContent,         --CRL Announcement
        //    pkiconf  [19] PKIConfirmContent,     --Confirmation
        //    nested   [20] NestedMessageContent,  --Nested Message
        //    genm     [21] GenMsgContent,         --General Message
        //    genp     [22] GenRepContent,         --General Response
        //    error    [23] ErrorMsgContent,       --Error Message
        //    certConf [24] CertConfirmContent,    --Certificate confirm
        //    pollReq  [25] PollReqContent,        --Polling request
        //    pollRep  [26] PollRepContent         --Polling response }
        //
        // PKIMessages ::= SEQUENCE SIZE (1..MAX) OF PKIMessage

        var names = in_window.org.pkijs.getNames(arguments[0]);
        var optional = (input_optional || false);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || "PKIMessage"),
            value: [
                new in_window.org.pkijs.schema.pkiMessage.PKIHeader({ name: (names.PKIMessage_header || "PKIMessage.header") }),
                new in_window.org.pkijs.asn1.CHOICE({
                    name: (names.PKIMessage_body || "PKIBody"),
                    value: [
                        new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                            name: (names.block_name || "PKIBody.genMsgContent"),
                            id_block: {
                                tag_class: 3, // CONTEXT-SPECIFIC
                                tag_number: 21 // [21]
                            },
                            value: [
                                new in_window.org.pkijs.schema.pkiMessage.GenMsgContent(names.genMessage || {
                                names: {
                                    block_name: ""
                                }
                            })]
                        }),
                        new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                            name: (names.block_name || "PKIBody.genRepContent"),
                            id_block: {
                                tag_class: 3, // CONTEXT-SPECIFIC
                                tag_number: 22 // [22]
                            },
                            value: [
                                new in_window.org.pkijs.schema.pkiMessage.GenRepContent(names.genRepMessage || {
                                names: {
                                    block_name: ""
                                }
                            })]
                        }),
                    ]
                }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    name: (names.block_name || "PKIProtection"),
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
