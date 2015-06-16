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

    if(typeof in_window.org.pkijs.simpl === "undefined")
        in_window.org.pkijs.simpl = {};
    else
    {
        if(typeof in_window.org.pkijs.simpl !== "object")
            throw new Error("Name org.pkijs.simpl already exists and it's not an object" + " but " + (typeof in_window.org.pkijs.simpl));
    }

    if(typeof in_window.org.pkijs.simpl.cmp === "undefined")
        in_window.org.pkijs.simpl.cmp = {};
    else
    {
        if(typeof in_window.org.pkijs.simpl.cmp !== "object")
            throw new Error("Name org.pkijs.simpl.cmp already exists and it's not an object" + " but " + (typeof in_window.org.pkijs.simpl.cmp));
    }

    var local = {};

    in_window.org.pkijs.simpl.cmp.getOIDByAlgorithm =
    function(algorithm)
    {
        var result = "";

        switch(algorithm.name.toUpperCase())
        {
            case "PASSWORDBASEDMAC":
                result = "1.2.840.113533.7.66.13";
                break;
            default:;
        }

        return result;
    }

    in_window.org.pkijs.simpl.cmp.getAlgorithmByOID =
    function(oid)
    {
        var result = {};

        switch(oid)
        {
            case "1.2.840.113533.7.66.13":
                result = {
                    name: "passwordBasedMac"
                };
                break;
        }

        return result;
    }

    in_window.org.pkijs.simpl.cmp.getInfoTypeByOID =
    function(oid)
    {
        // see https://tools.ietf.org/html/rfc4210#appendix-F

        var result = "";

        switch(oid)
        {
            case "1.3.6.1.5.5.7.4.1":
                result = "caProtEncCert";
                break;

            case "1.3.6.1.5.5.7.4.2":
                result = "signKeyPairTypes";
                break;

            case "1.3.6.1.5.5.7.4.12":
                result = "revPassphrase";
                break;
        }
        return result;
    }

    in_window.org.pkijs.simpl.cmp.getOIDByInfoType =
    function(infoType)
    {
        // see https://tools.ietf.org/html/rfc4210#appendix-F

        var result = "";

        switch(infoType)
        {
            case "caProtEncCert":
                result = "1.3.6.1.5.5.7.4.1";
                break;

            case "signKeyPairTypes":
                result =  "1.3.6.1.5.5.7.4.2";
                break;

            case "revPassphrase":
                result = "1.3.6.1.5.5.7.4.12";
                break;
        }
        return result;
    }

    /**
     * Common PKI message header
     *
     * When an object is passed, the keys must correspond to the ASN.1 spec
     * for a PKI message header.
     * Integers can be assigned directly, all other items need to be schema types.
     **/
    in_window.org.pkijs.simpl.cmp.PKIHeader =
    function()
    {
        this.pvno;
        this.sender;
        this.recipient;

        if((arguments[0] instanceof Object) && ('schema' in arguments[0])) {
            in_window.org.pkijs.simpl.cmp.PKIHeader.prototype.fromSchema.call(this, arguments[0].schema);
        } else {
            if(arguments[0] instanceof Object) {

                // Either 1 or 2
                this.pvno = arguments[0].pvno || new in_window.org.pkijs.asn1.INTEGER();
                this.sender = arguments[0].sender || new in_window.org.pkijs.simpl.GENERAL_NAME();
                this.recipient = arguments[0].recipient || new in_window.org.pkijs.simpl.GENERAL_NAME();

                // Optionals
                if ('messageTime' in arguments[0])
                    this.messageTime = arguments[0].messageTime || new in_window.org.pkijs.schema.TIME();
                if ('protectionAlg' in arguments[0])
                    this.protectionAlg = arguments[0].protectionAlg || new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER();
                // TODO this.senderKID;
                // TODO this.recipKID;
                if ('transactionID' in arguments[0])
                    this.transactionID = arguments[0].transactionID || new in_window.org.pkijs.asn1.OCTETSTRING();
                if ('senderNonce' in arguments[0])
                    this.senderNonce = arguments[0].senderNonce || new in_window.org.pkijs.asn1.OCTETSTRING();
                if ('recipNonce' in arguments[0])
                    this.recipNonce = arguments[0].recipNonce || new in_window.org.pkijs.asn1.OCTETSTRING();
                // TODO this.freeText;
                if ('generalInfo' in arguments[0])
                    this.generalInfo = arguments[0].generalInfo || new in_windnow.org.pkijs.asn1.SEQUENCE();
            }
        }
    };

    in_window.org.pkijs.simpl.cmp.PKIHeader.prototype.fromSchema =
    function(schema)
    {
        var asn1 = in_window.org.pkijs.compareSchema(
            schema, schema,
            in_window.org.pkijs.schema.cmp.PKIHeader()
        );

        if (asn1.verified === false) {
            throw new Error('Could not verify PKI header schema');
        }

        this.pvno = new in_window.org.pkijs.asn1.INTEGER({ schema: asn1.result['PKIHeader.pvno'] });
        this.sender = new in_window.org.pkijs.simpl.GENERAL_NAME({ schema: asn1.result['PKIHeader.sender'] });
        this.recipient = new in_window.org.pkijs.simpl.GENERAL_NAME({ schema: asn1.result['PKIHeader.recipient'] });

        if ('PKIHeader.messageTime' in asn1.result)
            this.messageTime = asn1.result['PKIHeader.messageTime'];
        if ('PKIHeader.protectionAlg' in asn1.result)
            this.protectionAlg = asn1.result['PKIHeader.protectionAlg'];
        if ('PKIHeader.transactionID' in asn1.result)
            this.transactionID = asn1.result['PKIHeader.transactionID'];
        if ('PKIHeader.senderNonce' in asn1.result)
            this.senderNonce = asn1.result['PKIHeader.senderNonce'];
        if ('PKIHeader.recipNonce' in asn1.result)
            this.recipNonce = asn1.result['PKIHeader.recipNonce'];
        if ('PKIHeader.freeText' in asn1.result)
            this.freeText = asn1.result['PKIHeader.freeText'];
        if ('PKIHeader.generalInfo' in asn1.result)
            this.generalInfo = asn1.result['PKIHeader.generalInfo'];
    };

    in_window.org.pkijs.simpl.cmp.PKIHeader.prototype.toSchema =
    function()
    {
        var out = [];

        out.push(this.pvno);
        out.push(this.sender.toSchema());
        out.push(this.recipient.toSchema());

        if ('messageTime' in this) {
            out.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                id_block: {
                    tag_class: 3, // CONTEXT-SPECIFIC
                    tag_number: 0 // [0]
                },
                value: [this.messageTime]
            }));
        }
        if ('protectionAlg' in this) {
            out.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                id_block: {
                    tag_class: 3, // CONTEXT-SPECIFIC
                    tag_number: 1 // [1]
                },
                value: [this.protectionAlg.toSchema()]
            }));
        }
        if ('senderKID' in this) {
            out.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                id_block: {
                    tag_class: 3, // CONTEXT-SPECIFIC
                    tag_number: 2 // [2]
                },
                value: [this.senderKID]
            }));
        }
        if ('recipKID' in this) {
            out.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                id_block: {
                    tag_class: 3, // CONTEXT-SPECIFIC
                    tag_number: 3 // [3]
                },
                value: [this.recipKID]
            }));
        }
        if ('transactionID' in this) {
            out.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                id_block: {
                    tag_class: 3, // CONTEXT-SPECIFIC
                    tag_number: 4 // [4]
                },
                value: [this.transactionID]
            }));
        }
        if ('senderNonce' in this) {
            out.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                id_block: {
                    tag_class: 3, // CONTEXT-SPECIFIC
                    tag_number: 5 // [5]
                },
                value: [this.senderNonce]
            }));
        }
        if ('recipNonce' in this) {
            out.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                id_block: {
                    tag_class: 3, // CONTEXT-SPECIFIC
                    tag_number: 6 // [6]
                },
                value: [this.recipNonce]
            }));
        }
        if ('freeText' in this) {
            out.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                id_block: {
                    tag_class: 3, // CONTEXT-SPECIFIC
                    tag_number: 7 // [7]
                },
                value: [this.freeText]
            }));
        }
        if ('generalInfo' in this) {
            out.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                id_block: {
                    tag_class: 3, // CONTEXT-SPECIFIC
                    tag_number: 8 // [8]
                },
                value: [this.generalInfo]
            }));
        }

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: out
        }));
    };

    in_window.org.pkijs.simpl.cmp.PKIMessage =
    function()
    {
        this.header;
        this.body;

        if((arguments[0] instanceof Object) && ('schema' in arguments[0])) {
            in_window.org.pkijs.simpl.cmp.PKIMessage.prototype.fromSchema.call(this, arguments[0].schema);
        } else {
            if(arguments[0] instanceof Object) {

                this.header = arguments[0].header || new in_window.org.pkijs.simpl.cmp.PKIHeader();
                this.body = arguments[0].body || new in_window.org.pkijs.asn1.SEQUENCE();
                if ('protection' in arguments[0])
                    this.protection = arguments[0].protection || new in_window.org.pkijs.asn1.BITSTRING();
            }
        }

    };

    in_window.org.pkijs.simpl.cmp.PKIMessage.prototype.fromSchema =
    function(schema)
    {
        var asn1 = in_window.org.pkijs.compareSchema(
            schema, schema,
            in_window.org.pkijs.schema.cmp.PKIBody()
        );

        if (asn1.verified === false) {
            throw new Error('Could not verify PKI body schema');
        }

        this.header = new in_window.org.pkijs.simpl.cmp.PKIHeader({ schema: asn1.result['PKIMessage.header'] });
        this.body = asn1.result['PKIMessage.body'];
        if ('PKIMessage.protection' in asn1.result)
            this.protection = asn1.result['PKIMessage.protection'];
    };

    in_window.org.pkijs.simpl.cmp.PKIMessage.prototype.toSchema =
    function()
    {
        var out = [];

        out.push(this.header.toSchema());
        out.push(this.body.toSchema());
        if ('protection' in this)
            out.push(this.protection);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: out
        }));
    };

    in_window.org.pkijs.simpl.cmp.InfoTypeAndValue =
    function()
    {
        this.infoType;
        this.infoValue;

        if((arguments[0] instanceof Object) && ('schema' in arguments[0])) {
            in_window.org.pkijs.simpl.cmp.InfoTypeAndValue.prototype.fromSchema.call(this, arguments[0].schema);
        } else {
            if(arguments[0] instanceof Object) {

                this.infoType = arguments[0].infoType || new in_window.org.pkijs.asn1.OID();

                // Optionals
                if ('infoValue' in arguments[0])
                    this.infoValue = arguments[0].infoValue || new in_window.org.pkijs.asn1.ANY();
            }
        }
    };

    in_window.org.pkijs.simpl.cmp.InfoTypeAndValue.prototype.fromSchema =
    function(schema)
    {
        var asn1 = in_window.org.pkijs.compareSchema(
            schema, schema,
            in_window.org.pkijs.schema.cmp.InfoTypeAndValue(
                {
                names: {
                    infoType: 'infoType',
                    infoValue: 'infoValue'
                }
            })
        );

        if (asn1.verified === false) {
            throw new Error('Could not verify InfoTypeAndValue schema');
        }

        this.infoType = asn1.result.infoType;
        if ('infoType' in asn1.result)
            this.infoValue = asn1.result.infoType;
    };

    in_window.org.pkijs.simpl.cmp.InfoTypeAndValue.prototype.toSchema =
    function()
    {
        var out = [];

        out.push(this.infoType);
        if ('infoValue' in this)
            out.push(this.infoValue);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: out
        }));
    };

    /**
     * Pass the following object:
     *
     * {
     *    certReqId,
     *    certTemplate: { // any of
     *       version,
     *       serialNumber,
     *       signingAlg,
     *       issuer,
     *       subject,
     *       publicKey
     *    },
     *    controls // optional
     **/
    in_window.org.pkijs.simpl.cmp.CertRequest =
    function()
    {
        
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.cmp.CertRequest.prototype.fromSchema.call(this, arguments[0].schema);
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.certReqId = arguments[0].certReqId || new in_window.org.pkijs.asn1.INTEGER();

                // CertTemplate
                if ('certTemplate' in arguments[0]) {
                    this.certTemplate = {};
                    var template = arguments[0].certTemplate;
                    if ('version' in template)
                        this.certTemplate.version = template.version || new in_window.org.pkijs.asn1.INTEGER();
                    if ('serialNumber' in template)
                        this.certTemplate.serialNumber = template.serialNumber || new in_window.org.pkijs.asn1.INTEGER();
                    if ('signingAlg' in template)
                        this.certTemplate.signingAlg = template.signingAlg || new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER();
                    if ('issuer' in template)
                        this.certTemplate.issuer = template.issuer || new in_window.org.pkijs.simpl.GENERAL_NAME();
                    // validity
                    if ('subject' in template)
                        this.certTemplate.subject = template.subject || new in_window.org.pkijs.simpl.GENERAL_NAME();
                    // publicKey
                    if ('publicKey' in template)
                        this.certTemplate.publicKey = template.publicKey || new in_window.org.pkijs.schema.PUBLIC_KEY_INFO();
                    // issuerUID
                    // subjectUID
                    // extensions
                }
            }
        }
    }

    in_window.org.pkijs.simpl.cmp.CertRequest.prototype.fromSchema =
    function(schema)
    {
        var asn1 = in_window.org.pkijs.compareSchema(
            schema, schema,
            in_window.org.pkijs.schema.cmp.CertRequest()
        );

        if (asn1.verified === false) {
            throw new Error('Could not verify CertRequest schema');
        }

        this.certReqId = new in_window.org.pkijs.asn1.INTEGER({ schema: asn1.result['certReqId'] });
        this.certTemplate = {};

        if ('certTemplate.version' in asn1.result)
            this.certTemplate.version = new in_window.org.pkijs.asn1.INTEGER({ schema: asn1.result['certTemplate.version'] });
        if ('certTemplate.serialNumber' in asn1.result)
            this.certTemplate.serialNumber = new in_window.org.pkijs.asn1.INTEGER({ schema: asn1.result['certTemplate.serialNumber'] });
        if ('certTemplate.signingAlg' in asn1.result)
            this.certTemplate.signingAlg = new in_window.org.pkijs.schema.ALGORITHM_IDENTIFIER({ schema: asn1.result['certTemplate.signingAlg'] });
        if ('certTemplate.issuer' in asn1.result)
            this.certTemplate.issuer = new in_window.org.pkijs.schema.GENERAL_NAME({ schema: asn1.result['certTemplate.issuer'] });
        if ('certTemplate.subject' in asn1.result)
            this.certTemplate.subject = new in_window.org.pkijs.schema.GENERAL_NAME({ schema: asn1.result['certTemplate.subject'] });
        if ('certTemplate.publicKey' in asn1.result)
            this.certTemplate.publicKey = new in_window.org.pkijs.schema.PUBLIC_KEY_INFO({ schema: asn1.result['certTemplate.publicKey'] });

    };

    in_window.org.pkijs.simpl.cmp.CertRequest.prototype.toSchema =
    function()
    {
        var request = [];

        request.push(this.certReqId);

        // CertTemplate
        var tmpl = [];
        if ('version' in this.certTemplate) {
            tmpl.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                id_block: { tag_class: 3, tag_number: 0 },
                value: [ this.certTemplate.version ]
            }));
        }
        if ('serialNumber' in this.certTemplate) {
            tmpl.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                id_block: { tag_class: 3, tag_number: 1 },
                value: [ this.certTemplate.serialNumber ]
            }));
        }
        if ('signingAlg' in this.certTemplate) {
            tmpl.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                id_block: { tag_class: 3, tag_number: 2 },
                value: [ this.certTemplate.signingAlg ]
            }));
        }
        if ('issuer' in this.certTemplate) {
            tmpl.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                id_block: { tag_class: 3, tag_number: 3 },
                value: [ this.certTemplate.issuer ]
            }));
        }
        if ('validity' in this.certTemplate) {
            tmpl.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                id_block: { tag_class: 3, tag_number: 4 },
                value: [ this.certTemplate.validity ]
            }));
        }
        if ('subject' in this.certTemplate) {
            tmpl.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                id_block: { tag_class: 3, tag_number: 5 },
                value: [ this.certTemplate.subject ]
            }));
        }
        if ('publicKey' in this.certTemplate) {
            tmpl.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                id_block: { tag_class: 3, tag_number: 6 },
                value: [ this.certTemplate.publicKey ]
            }));
        }
        // TODO
        // issuerUID
        // subjectUID
        // extensions

        var certTmpl = new in_window.org.pkijs.asn1.SEQUENCE({
            value: tmpl
        });
        var verifyCertTemplate = in_window.org.pkijs.compareSchema(
            certTmpl, certTmpl,
            in_window.org.pkijs.schema.cmp.CertTemplate()
        );
        if (!verifyCertTemplate.verified)
            throw new Error('Unable to verify CertTemplate schema');

        // Add template to parent
        request.push(certTmpl);

        // TODO controls
        /**
        request.push(new in_window.org.pkijs.asn1.SEQUENCE({
            value: controls
        }));
        */

        var certRequest = new in_window.org.pkijs.asn1.SEQUENCE({
            value: request
        });
        var verifyCertRequest = in_window.org.pkijs.compareSchema(
            certRequest, certRequest,
            in_window.org.pkijs.schema.cmp.CertRequest()
        );
        if (!verifyCertRequest.verified)
            throw new Error('Unable to verify CertRequest schema');

        return certRequest;
    }

    /**
     * Pass the following object:
     *
     * {
     *    certRequest,
     *    pop: { // one of
     *       raVerified,
     *       signature,
     *       sender,
     *       pkmacAlgorithm,
     *       kmacValue,
     *       publicKey,
     *       keyEncipherment,
     *       keyAgreement
     *    },
     *    regInfo
     **/
    in_window.org.pkijs.simpl.cmp.CertReqMsg =
    function()
    {
        // Optional
        //this.proof = {};
        
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.cmp.CertReqMsg.prototype.fromSchema.call(this, arguments[0].schema);
        else
        {
            if(arguments[0] instanceof Object)
            {
                // CertRequest
                if (!('certRequest' in arguments[0]))
                    throw new Error('CertRequest required');

                this.certRequest = (arguments[0].certRequest || new in_window.org.pkijs.simpl.CertRequest());

                // Proof of possession
                if ('pop' in arguments[0]) {
                    this.proof = {};
                    var pop = arguments[0].pop;

                    if ('raVerified' in pop) {
                        // always null
                        this.proof.raVerified = new in_window.org.pkijs.asn1.NULL();

                    } else if('signature' in pop) {
                        // POPOSigningKey
                        this.proof.algorithm = pop.algorithm || new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER();
                        this.proof.signature = pop.signature || new in_window.org.pkijs.asn1.BITSTRING();

                        // POPOSigningKeyInput?
                        if (('sender' in pop) || (('pkmacAlgorithm' in pop) && ('pkmacValue' in pop))) {
                            // Either sender or publicKeyMac
                            if ('sender' in pop) {
                                this.proof.sender = pop.sender || new in_window.org.pkijs.simpl.GENERAL_NAME();
                            } else {
                                this.proof.pkmacAlgorithm = pop.pkmacAlgorithm || new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER();
                                // Result of signing the certRequest
                                this.proof.pkmacValue = pop.pkmacValue || new in_window.org.pkijs.asn1.BITSTRING();
                            }
                            // MUST be equal to template's
                            if (!('publicKey' in pop))
                                throw new Error('POP publicKey not found');
                            this.proof.publicKey = pop.publicKey;
                        } else {
                            throw new Error('POP sender or PKMAC required in POPOSigningKeyInput');
                        }

                    } else if ('keyEncipherment' in pop) {
                        this.proof.keyEncipherment = pop.keyEncipherment;

                    } else if ('keyAgreement' in pop) {
                        this.proof.keyAgreement = pop.keyAgreement;
                    }
                }
            }
        }
    };

    in_window.org.pkijs.simpl.cmp.CertReqMsg.prototype.fromSchema =
    function(schema)
    {
        var asn1 = in_window.org.pkijs.compareSchema(
            schema, schema,
            in_window.org.pkijs.schema.cmp.CertReqMsg({
            })
        );

        if (asn1.verified === false) {
            throw new Error('Could not verify CertReqMsg schema');
        }

        // TODO
    };

    in_window.org.pkijs.simpl.cmp.CertReqMsg.prototype.toSchema =
    function()
    {

        var pop;

        if ('proof' in this) {
            if ('raVerified' in this.proof) {
                pop = new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    id_block: { tag_class: 3, tag_number: 0 },
                    value: [ this.proof.raVerified ]
                });

            } else if ('signature' in this.proof) {
                var popoSigningKeyValues = [];

                // Optional poposkInput
                var poposkInput = [];
                if (('sender' in this.proof) || ('pkmacValue' in this.proof)) {
                    if ('sender' in this.proof) {
                        poposkInput.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                            id_block: { tag_class: 3, tag_number: 0 },
                            value: [ this.proof.sender.toSchema() ]
                        }));

                    } else {
                        poposkInput.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                            id_block: { tag_class: 3, tag_number: 1 },
                            value: [
                                new in_window.org.pkijs.asn1.SEQUENCE({
                                    value: [
                                        this.proof.pkmacAlgorithm.toSchema(),
                                        this.proof.pkmacValue
                                    ]
                                })
                            ]
                        }));
                    }
                    // MUST be equal to cert request template's
                    poposkInput.push(this.proof.publicKey);
                }

                if (poposkInput.length) {
                    popoSigningKeyValues.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                        id_block: { tag_class: 3, tag_number: 0 },
                        value: [
                            new in_window.org.pkijs.asn1.SEQUENCE({
                                value: poposkInput
                            })
                        ]
                    }));
                }

                // Copmlete the POPOSigningKey sequence
                popoSigningKeyValues.push(this.proof.algorithm.toSchema());
                popoSigningKeyValues.push(this.proof.signature);


                // Complete the ProofOfPossesion signature option
                pop = new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    id_block: { tag_class: 3, tag_number: 1 },
                    value: [ 
                        new in_window.org.pkijs.asn1.SEQUENCE({
                            value: popoSigningKeyValues
                        })
                    ]
                });

            } else if ('keyEncipherment' in this.proof) {
                // TODO
                pop = new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    id_block: { tag_class: 3, tag_number: 2 },
                    value: []
                });
            } else if ('keyAgreement' in this.proof) {
                // TODO
                pop = new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    id_block: { tag_class: 3, tag_number: 3 },
                    value: []
                });
            }
        }
        // end proof

        if (typeof pop !== 'undefined') {
            var verifyPOP = in_window.org.pkijs.compareSchema(
                pop, pop,
                in_window.org.pkijs.schema.cmp.ProofOfPossession()
            );
            if (!verifyPOP.verified)
                throw new Error('Unable to verify ProofOfPossession schema');
        }

        // TODO regInfo

        var certReqMsg = new in_window.org.pkijs.asn1.SEQUENCE({
            value: [
                this.certRequest.toSchema(),
                pop
                // regInfo
            ]
        });

        var verifyCertReqMsg = in_window.org.pkijs.compareSchema(
            certReqMsg, certReqMsg,
            in_window.org.pkijs.schema.cmp.CertReqMsg()
        );
        if (!verifyCertReqMsg.verified)
            throw new Error('Unable to verify CertReqMsg schema');

        return certReqMsg;
    }
}
)(typeof exports !== "undefined" ? exports : window);
