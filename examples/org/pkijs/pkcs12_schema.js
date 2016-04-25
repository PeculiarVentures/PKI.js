/*
 * Copyright (c) 2015, Peculiar Ventures
 * All rights reserved.
 *
 * Author 2015, Yury Strozhevsky <www.strozhevsky.com>.
 *
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, 
 *    this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, 
 *    this list of conditions and the following disclaimer in the documentation 
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors 
 *    may be used to endorse or promote products derived from this software without 
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT 
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR 
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, 
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY 
 * OF SUCH DAMAGE. 
 *
 */
(
function(in_window)
{
    //**************************************************************************************
    // #region Declaration of global variables 
    //**************************************************************************************
    // #region "org" namespace 
    if(typeof in_window.org === "undefined")
        in_window.org = {};
    else
    {
        if(typeof in_window.org !== "object")
            throw new Error("Name org already exists and it's not an object");
    }
    // #endregion 

    // #region "org.pkijs" namespace 
    if(typeof in_window.org.pkijs === "undefined")
        in_window.org.pkijs = {};
    else
    {
        if(typeof in_window.org.pkijs !== "object")
            throw new Error("Name org.pkijs already exists and it's not an object" + " but " + (typeof in_window.org.pkijs));
    }
    // #endregion 

    // #region "org.pkijs.schema" namespace 
    if(typeof in_window.org.pkijs.schema === "undefined")
        in_window.org.pkijs.schema = {};
    else
    {
        if(typeof in_window.org.pkijs.schema !== "object")
            throw new Error("Name org.pkijs.schema already exists and it's not an object" + " but " + (typeof in_window.org.pkijs.schema));
    }
    // #endregion 

    // #region "org.pkijs.schema.cms" namespace 
    if(typeof in_window.org.pkijs.schema.pkcs12 === "undefined")
        in_window.org.pkijs.schema.pkcs12 = {};
    else
    {
        if(typeof in_window.org.pkijs.schema.pkcs12 !== "object")
            throw new Error("Name org.pkijs.schema.pkcs12 already exists and it's not an object" + " but " + (typeof in_window.org.pkijs.schema.pkcs12));
    }
    // #endregion 

    // #region "local" namespace 
    var local = {};
    // #endregion   
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region ASN.1 schema definition for "DigestInfo" type (RFC2315) 
    //**************************************************************************************
    in_window.org.pkijs.schema.DigestInfo =
    function()
    {
        //DigestInfo ::= SEQUENCE {
        //    digestAlgorithm DigestAlgorithmIdentifier,
        //    digest Digest }

        //Digest ::= OCTET STRING

        var names = in_window.org.pkijs.getNames(arguments[0]);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || ""),
            value: [
                in_window.org.pkijs.schema.ALGORITHM_IDENTIFIER(names.digestAlgorithm || {
                    names: {
                        block_name: "digestAlgorithm"
                    }
                }),
                new in_window.org.pkijs.asn1.OCTETSTRING({ name: (names.digest || "digest") })
            ]
        }));
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region ASN.1 schema definition for "MacData" type (RFC7292) 
    //**************************************************************************************
    in_window.org.pkijs.schema.pkcs12.MacData =
    function()
    {
        //MacData ::= SEQUENCE {
        //    mac 		DigestInfo,
        //    macSalt       OCTET STRING,
        //    iterations	INTEGER DEFAULT 1
        //    -- Note: The default is for historical reasons and its use is
        //    -- deprecated. A higher value, like 1024 is recommended.
        //    }

        var names = in_window.org.pkijs.getNames(arguments[0]);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || ""),
            optional: (names.optional || true),
            value: [
                in_window.org.pkijs.schema.DigestInfo(names.mac || {
                    names: {
                        block_name: "mac"
                    }
                }),
                new in_window.org.pkijs.asn1.OCTETSTRING({ name: (names.macSalt || "macSalt") }),
                new in_window.org.pkijs.asn1.INTEGER({
                    optional: true,
                    name: (names.iterations || "iterations")
                })
            ]
        }));
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region ASN.1 schema definition for "PFX" type (RFC7292) 
    //**************************************************************************************
    in_window.org.pkijs.schema.PFX =
    function()
    {
        //PFX ::= SEQUENCE {
        //    version		INTEGER {v3(3)}(v3,...),
        //    authSafe	ContentInfo,
        //    macData    	MacData OPTIONAL
        //}

        var names = in_window.org.pkijs.getNames(arguments[0]);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || ""),
            value: [
                new in_window.org.pkijs.asn1.INTEGER({ name: (names.version || "version") }),
                in_window.org.pkijs.schema.CMS_CONTENT_INFO(names.authSafe || {
                    names: {
                        block_name: "authSafe"
                    }
                }),
                in_window.org.pkijs.schema.pkcs12.MacData(names.macData || {
                    names: {
                        block_name: "macData",
                        optional: true
                    }
                })
            ]
        }));
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region ASN.1 schema definition for "AuthenticatedSafe" type (RFC7292) 
    //**************************************************************************************
    in_window.org.pkijs.schema.pkcs12.AuthenticatedSafe =
    function()
    {
        //AuthenticatedSafe ::= SEQUENCE OF ContentInfo
        //-- Data if unencrypted
        //-- EncryptedData if password-encrypted
        //-- EnvelopedData if public key-encrypted

        var names = in_window.org.pkijs.getNames(arguments[0]);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || ""),
            value: [
                new in_window.org.pkijs.asn1.REPEATED({
                    name: (names.contentInfos || ""),
                    value: in_window.org.pkijs.schema.CMS_CONTENT_INFO()
                })
            ]
        }));
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region ASN.1 schema definition for "SafeBag" type (RFC7292) 
    //**************************************************************************************
    in_window.org.pkijs.schema.pkcs12.SafeBag =
    function()
    {
        //SafeBag ::= SEQUENCE {
        //    bagId	      	BAG-TYPE.&id ({PKCS12BagSet}),
        //    bagValue      [0] EXPLICIT BAG-TYPE.&Type({PKCS12BagSet}{@bagId}),
  	    //    bagAttributes SET OF PKCS12Attribute OPTIONAL
        //}

        //rsadsi	OBJECT IDENTIFIER ::= {iso(1) member-body(2) us(840) rsadsi(113549)}
        //pkcs    OBJECT IDENTIFIER ::= {rsadsi pkcs(1)}
        //pkcs-12	OBJECT IDENTIFIER ::= {pkcs 12}

        //bagtypes			OBJECT IDENTIFIER ::= {pkcs-12 10 1}

        //keyBag 	  BAG-TYPE ::= 
        //{KeyBag IDENTIFIED BY {bagtypes 1}}
        //pkcs8ShroudedKeyBag BAG-TYPE ::=
        //{PKCS8ShroudedKeyBag IDENTIFIED BY {bagtypes 2}}
        //certBag BAG-TYPE ::= 
        //{CertBag IDENTIFIED BY {bagtypes 3}}
        //crlBag BAG-TYPE ::=
        //{CRLBag IDENTIFIED BY {bagtypes 4}}
        //secretBag BAG-TYPE ::=    
        //{SecretBag IDENTIFIED BY {bagtypes 5}}
        //safeContentsBag BAG-TYPE ::=
        //{SafeContents IDENTIFIED BY {bagtypes 6}}

        var names = in_window.org.pkijs.getNames(arguments[0]);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || ""),
            value: [
                new in_window.org.pkijs.asn1.OID({ name: (names.bagId || "bagId") }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 0 // [0]
                    },
                    value: [new in_window.org.pkijs.asn1.ANY({ name: (names.bagValue || "bagValue") })] // EXPLICIT ANY value
                }),
                new in_window.org.pkijs.asn1.SET({
                    optional: true,
                    value: [
                        new in_window.org.pkijs.asn1.REPEATED({
                            name: (names.bagAttributes || "bagAttributes"),
                            value: in_window.org.pkijs.schema.cms.Attribute()
                        })
                    ]
                })
            ]
        }));
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region ASN.1 schema definition for "SafeContents" type (RFC7292) 
    //**************************************************************************************
    in_window.org.pkijs.schema.pkcs12.SafeContents =
    function()
    {
        //SafeContents ::= SEQUENCE OF SafeBag

        var names = in_window.org.pkijs.getNames(arguments[0]);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || ""),
            value: [
                new in_window.org.pkijs.asn1.REPEATED({
                    name: (names.safeBags || ""),
                    value: in_window.org.pkijs.schema.pkcs12.SafeBag()
                })
            ]
        }));
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region ASN.1 schema definition for "KeyBag" type (RFC7292) 
    //**************************************************************************************
    in_window.org.pkijs.schema.pkcs12.KeyBag =
    function()
    {
        return in_window.org.pkijs.schema.PKCS8.apply(null, arguments);
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region ASN.1 schema definition for "PKCS8ShroudedKeyBag" type (RFC7292) 
    //**************************************************************************************
    in_window.org.pkijs.schema.pkcs12.PKCS8ShroudedKeyBag =
    function()
    {
        //PKCS8ShroudedKeyBag ::= EncryptedPrivateKeyInfo

        //EncryptedPrivateKeyInfo ::= SEQUENCE {
        //    encryptionAlgorithm AlgorithmIdentifier {{KeyEncryptionAlgorithms}},
        //    encryptedData EncryptedData 
        //}

        //EncryptedData ::= OCTET STRING

        var names = in_window.org.pkijs.getNames(arguments[0]);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || ""),
            value: [
                in_window.org.pkijs.schema.ALGORITHM_IDENTIFIER(names.hashAlgorithm || {
                    names: {
                        block_name: "encryptionAlgorithm"
                    }
                }),
                new in_window.org.pkijs.asn1.CHOICE({
                    value: [
                        new in_window.org.pkijs.asn1.OCTETSTRING({ name: (names.encryptedData || "encryptedData") }),
                        new in_window.org.pkijs.asn1.OCTETSTRING({
                            id_block: {
                                is_constructed: true
                            },
                            name: (names.encryptedData || "encryptedData")
                        })
                    ]
                })
            ]
        }));
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region ASN.1 schema definition for "local.StandardBag" type 
    //**************************************************************************************
    local.StandardBag = 
    function()
    {
        //SEQUENCE {
        //    certId    BAG-TYPE.&id   ({CertTypes}),
        //    certValue [0] EXPLICIT BAG-TYPE.&Type ({CertTypes}{@certId})
        //}

        var names = in_window.org.pkijs.getNames(arguments[0]);

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            name: (names.block_name || ""),
            value: [
                new in_window.org.pkijs.asn1.OID({ name: (names.id || "id") }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 0 // [0]
                    },
                    value: [new in_window.org.pkijs.asn1.ANY({ name: (names.value || "value") })] // EXPLICIT ANY value
                })
            ]
        }));
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region ASN.1 schema definition for "CertBag" type (RFC7292) 
    //**************************************************************************************
    in_window.org.pkijs.schema.pkcs12.CertBag =
    function()
    {
        //CertBag ::= SEQUENCE {
        //    certId    BAG-TYPE.&id   ({CertTypes}),
        //    certValue [0] EXPLICIT BAG-TYPE.&Type ({CertTypes}{@certId})
        //}

        return local.StandardBag.apply(null, arguments);
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region ASN.1 schema definition for "CRLBag" type (RFC7292) 
    //**************************************************************************************
    in_window.org.pkijs.schema.pkcs12.CRLBag =
    function()
    {
        //CRLBag ::= SEQUENCE {
        //    crlId     	BAG-TYPE.&id ({CRLTypes}),
        //    crlValue 	[0] EXPLICIT BAG-TYPE.&Type ({CRLTypes}{@crlId})
        //}

        return local.StandardBag.apply(null, arguments);
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region ASN.1 schema definition for "SecretBag" type (RFC7292) 
    //**************************************************************************************
    in_window.org.pkijs.schema.pkcs12.SecretBag =
    function()
    {
        //SecretBag ::= SEQUENCE {
        //    secretTypeId BAG-TYPE.&id ({SecretTypes}),
        //    secretValue  [0] EXPLICIT BAG-TYPE.&Type ({SecretTypes}{@secretTypeId})
        //}

        return local.StandardBag.apply(null, arguments);
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
}
)(typeof exports !== "undefined" ? exports : window);