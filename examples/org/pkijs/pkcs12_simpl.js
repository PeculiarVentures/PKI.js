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

    // #region "org.pkijs.simpl" namespace 
    if(typeof in_window.org.pkijs.simpl === "undefined")
        in_window.org.pkijs.simpl = {};
    else
    {
        if(typeof in_window.org.pkijs.simpl !== "object")
            throw new Error("Name org.pkijs.simpl already exists and it's not an object" + " but " + (typeof in_window.org.pkijs.simpl));
    }
    // #endregion 

    // #region "org.pkijs.simpl.pkcs12" namespace 
    if(typeof in_window.org.pkijs.simpl.pkcs12 === "undefined")
        in_window.org.pkijs.simpl.pkcs12 = {};
    else
    {
        if(typeof in_window.org.pkijs.simpl.pkcs12 !== "object")
            throw new Error("Name org.pkijs.simpl.pkcs12 already exists and it's not an object" + " but " + (typeof in_window.org.pkijs.simpl.pkcs12));
    }
    // #endregion 

    // #region "local" namespace 
    var local = {};
    // #endregion   
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "DigestInfo" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.DigestInfo =
    function()
    {
        // #region Internal properties of the object 
        this.digestAlgorithm = new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER();
        this.digest = new in_window.org.pkijs.asn1.OCTETSTRING();
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.DigestInfo.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.digestAlgorithm = (arguments[0].digestAlgorithm || new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER());
                this.digest = (arguments[0].digest || new in_window.org.pkijs.asn1.OCTETSTRING());
            }
        }
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.DigestInfo.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.DigestInfo({
                names: {
                    digestAlgorithm: {
                        names: {
                            block_name: "digestAlgorithm"
                        }
                    },
                    digest: "digest"
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for DigestInfo");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.digestAlgorithm = new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER({ schema: asn1.result["digestAlgorithm"] });
        this.digest = asn1.result["digest"];
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.DigestInfo.prototype.toSchema =
    function()
    {
        // #region Construct and return new ASN.1 schema for this object 
        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: [
                this.digestAlgorithm.toSchema(),
                this.digest
            ]
        }));
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.DigestInfo.prototype.toJSON =
    function()
    {
        return {
            digestAlgorithm: this.digestAlgorithm.toJSON(),
            digest: this.digest.toJSON()
        };
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "MacData" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.MacData =
    function()
    {
        // #region Internal properties of the object 
        this.mac = new in_window.org.pkijs.simpl.DigestInfo();
        this.macSalt = new in_window.org.pkijs.asn1.OCTETSTRING();
        // OPTIONAL this.iterations = 1;
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.pkcs12.MacData.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.mac = (arguments[0].mac || new in_window.org.pkijs.simpl.DigestInfo());
                this.macSalt = (arguments[0].macSalt || new in_window.org.pkijs.asn1.OCTETSTRING());

                if("iterations" in arguments[0])
                    this.iterations = arguments[0].iterations;
            }
        }
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.MacData.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.pkcs12.MacData({
                names: {
                    mac: {
                        names: {
                            block_name: "mac"
                        }
                    },
                    macSalt: "macSalt",
                    iterations: "iterations"
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for MacData");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.mac = new in_window.org.pkijs.simpl.DigestInfo({ schema: asn1.result["mac"] });
        this.macSalt = asn1.result["macSalt"];

        if("iterations" in asn1.result)
            this.iterations = asn1.result["iterations"].value_block.value_dec;
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.MacData.prototype.toSchema =
    function()
    {
        // #region Construct and return new ASN.1 schema for this object 
        var output_array = [
            this.mac.toSchema(),
            this.macSalt
        ];

        if("iterations" in this)
            output_array.push(new in_window.org.pkijs.asn1.INTEGER({ value: this.iterations }));

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: output_array
        }));
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.MacData.prototype.toJSON =
    function()
    {
        var output = {
            mac: this.mac.toJSON(),
            macSalt: this.macSalt.toJSON()
        };

        if("iterations" in this)
            output.iterations = this.iterations.toJSON();
            
        return output;
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "PFX" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.PFX =
    function()
    {
        // #region Internal properties of the object 
        this.version = 3;
        this.authSafe = new in_window.org.pkijs.simpl.CMS_CONTENT_INFO();
        // OPTIONAL this.macData = new in_window.org.pkijs.simpl.pkcs12.MacData();

        // OPTIONAL this.parsedValue = {}; // Object having all parsed data from initial "authSafe"
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.PFX.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.version = (arguments[0].version || 3);
                this.authSafe = (arguments[0].authSafe || new in_window.org.pkijs.simpl.CMS_CONTENT_INFO());

                if("macData" in arguments[0])
                    this.macData = arguments[0].macData;

                if("parsedValue" in arguments[0])
                    this.parsedValue = arguments[0].parsedValue;
            }
        }
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.PFX.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.PFX({
                names: {
                    version: "version",
                    authSafe: {
                        names: {
                            block_name: "authSafe"
                        }
                    },
                    macData: {
                        names: {
                            block_name: "macData"
                        }
                    }
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for PFX");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.version = asn1.result["version"].value_block.value_dec;
        this.authSafe = new in_window.org.pkijs.simpl.CMS_CONTENT_INFO({ schema: asn1.result["authSafe"] });

        if("macData" in asn1.result)
            this.macData = new in_window.org.pkijs.simpl.pkcs12.MacData({ schema: asn1.result["macData"] });
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.PFX.prototype.toSchema =
    function()
    {
        // #region Construct and return new ASN.1 schema for this object 
        var output_array = [
            new in_window.org.pkijs.asn1.INTEGER({ value: this.version }),
            this.authSafe.toSchema()
        ];

        if("macData" in this)
            output_array.push(this.macData.toSchema());

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: output_array
        }));
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.PFX.prototype.toJSON =
    function()
    {
        var output = {
            version: this.version,
            authSafe: this.authSafe.toJSON()
        };

        if("macData" in this)
            output.macData = this.macData.toJSON();

        return output;
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.PFX.prototype.makeInternalValues =
    function(parameters)
    {
        /// <summary>Making "CMS_CONTENT_INFO" from "parsedValue" object</summary>
        /// <param name="parameters" type="Object">Parameters, specific to each "integrity mode"</param>

        // #region Check mandatory parameter 
        if((parameters instanceof Object) == false)
            return Promise.reject("The \"parameters\" must has \"Object\" type");

        if(("parsedValue" in this) == false)
            return Promise.reject("Please call \"parseValues\" function first in order to make \"parsedValue\" data");

        if(("integrityMode" in this.parsedValue) == false)
            return Promise.reject("Absent mandatory parameter \"integrityMode\" inside \"parsedValue\"");
        // #endregion   

        // #region Initial variables 
        var _this = this;
        var sequence = Promise.resolve();
        // #endregion 

        // #region Get a "crypto" extension 
        var crypto = in_window.org.pkijs.getCrypto();
        if(typeof crypto == "undefined")
            return Promise.reject("Unable to create WebCrypto object");
        // #endregion 

        // #region Makes values for each particular integrity mode 
        // #region Check that we do have neccessary fields in "parsedValue" object
        if(("authenticatedSafe" in _this.parsedValue) == false)
            return Promise.reject("Absent mandatory parameter \"authenticatedSafe\" in \"parsedValue\"");
        // #endregion 

        switch(this.parsedValue.integrityMode)
        {
            // #region HMAC-based integrity 
            case 0:
                {
                    // #region Check additional mandatory parameters 
                    if(("iterations" in parameters) == false)
                        return Promise.reject("Absent mandatory parameter \"iterations\"");

                    if(("pbkdf2HashAlgorithm" in parameters) == false)
                        return Promise.reject("Absent mandatory parameter \"pbkdf2HashAlgorithm\"");

                    if(("hmacHashAlgorithm" in parameters) == false)
                        return Promise.reject("Absent mandatory parameter \"hmacHashAlgorithm\"");

                    if(("password" in parameters) == false)
                        return Promise.reject("Absent mandatory parameter \"password\"");
                    // #endregion   

                    // #region Initial variables 
                    var saltBuffer = new ArrayBuffer(64);
                    var saltView = new Uint8Array(saltBuffer);

                    in_window.org.pkijs.getRandomValues(saltView);

                    var length;

                    // #region Choose correct length for HMAC key 
                    switch(parameters.hmacHashAlgorithm.toLowerCase())
                    {
                        case "sha-1":
                            length = 160;
                            break;
                        case "sha-256":
                            length = 256;
                            break;
                        case "sha-384":
                            length = 384;
                            break;
                        case "sha-512":
                            length = 512;
                            break;
                        default:
                            return Promise.reject("Incorrect \"parameters.hmacHashAlgorithm\" parameter: " + parameters.hmacHashAlgorithm);
                    }
                    // #endregion 

                    var hmacAlgorithm = {
                        name: "HMAC",
                        length: length,
                        hash: {
                            name: parameters.hmacHashAlgorithm
                        }
                    };
                    // #endregion 

                    // #region Generate HMAC key using PBKDF2 
                    // #region Derive PBKDF2 key from "password" buffer 
                    sequence = sequence.then(
                        function(result)
                        {
                            var passwordView = new Uint8Array(parameters.password);

                            return crypto.importKey("raw",
                                passwordView,
                                "PBKDF2",
                                true,
                                ['deriveKey']);
                        },
                        function(error)
                        {
                            return Promise.reject(error);
                        }
                        );
                    // #endregion 

                    // #region Derive key for HMAC 
                    sequence = sequence.then(
                        function(result)
                        {
                            return crypto.deriveKey({
                                name: "PBKDF2",
                                hash: {
                                    name: parameters.pbkdf2HashAlgorithm
                                },
                                salt: saltView,
                                iterations: parameters.iterations
                            },
                            result,
                            hmacAlgorithm,
                            true,
                            ['sign']);
                        },
                        function(error)
                        {
                            return Promise.reject(error);
                        }
                        );
                    // #endregion 
                    // #endregion   

                    // #region Make final "MacData" value 
                    // #region Make signed HMAC value 
                    sequence = sequence.then(
                        function(result)
                        {
                            _this.authSafe = new in_window.org.pkijs.simpl.CMS_CONTENT_INFO({
                                contentType: "1.2.840.113549.1.7.1",
                                content: new in_window.org.pkijs.asn1.OCTETSTRING({ value_hex: _this.parsedValue.authenticatedSafe.toSchema().toBER(false) })
                            });

                            var data = _this.authSafe.content.toBER(false);
                            var view = new Uint8Array(data);

                            return crypto.sign(hmacAlgorithm, result, view);
                        },
                        function(error)
                        {
                            return Promise.reject(error);
                        }
                        );
                    // #endregion 

                    // #region Make "MacData" values 
                    sequence = sequence.then(
                        function(result)
                        {
                            _this.macData = new in_window.org.pkijs.simpl.pkcs12.MacData({
                                mac: new in_window.org.pkijs.simpl.DigestInfo({
                                    digestAlgorithm: new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER({
                                        algorithm_id: in_window.org.pkijs.getOIDByAlgorithm({ name: parameters.hmacHashAlgorithm })
                                    }),
                                    digest: new in_window.org.pkijs.asn1.OCTETSTRING({ value_hex: result })
                                }),
                                macSalt: new in_window.org.pkijs.asn1.OCTETSTRING({ value_hex: saltBuffer }),
                                iterations: parameters.iterations
                            });
                        },
                        function(error)
                        {
                            return Promise.reject(error);
                        }
                        );
                    // #endregion   
                    // #endregion   
                }
                break;
            // #endregion 
            // #region publicKey-based integrity 
            case 1:
                {
                    // #region Check additional mandatory parameters 
                    if(("signingCertificate" in parameters) == false)
                        return Promise.reject("Absent mandatory parameter \"signingCertificate\"");

                    if(("privateKey" in parameters) == false)
                        return Promise.reject("Absent mandatory parameter \"privateKey\"");

                    if(("hashAlgorithm" in parameters) == false)
                        return Promise.reject("Absent mandatory parameter \"hashAlgorithm\"");
                    // #endregion   

                    // #region Making data to be signed
                    // NOTE: all internal data for "authenticatedSafe" must be already prepared.
                    // Thus user must call "makeValues" for all internal "SafeContent" value with appropriate parameters.
                    // Or user can choose to use values from initial parsing of existing PKCS#12 data.

                    var toBeSigned = _this.parsedValue.authenticatedSafe.toSchema().toBER(false);
                    // #endregion 

                    // #region Initial variables 
                    var cms_signed_simpl = new in_window.org.pkijs.simpl.CMS_SIGNED_DATA({
                        version: 1,
                        encapContentInfo: new in_window.org.pkijs.simpl.cms.EncapsulatedContentInfo({
                            eContentType: "1.2.840.113549.1.7.1", // "data" content type
                            eContent: new in_window.org.pkijs.asn1.OCTETSTRING({ value_hex: toBeSigned })
                        }),
                        certificates: [parameters.signingCertificate]
                    });
                    // #endregion 

                    // #region Making additional attributes for CMS Signed Data 
                    // #region Create a message digest 
                    sequence = sequence.then(
                        function()
                        {
                            return crypto.digest({ name: parameters.hashAlgorithm }, new Uint8Array(toBeSigned));
                        }
                        );
                    // #endregion 

                    // #region Combine all signed extensions 
                    sequence = sequence.then(
                        function(result)
                        {
                            // #region Initial variables 
                            var signed_attr = new Array();
                            // #endregion 

                            // #region contentType 
                            signed_attr.push(new in_window.org.pkijs.simpl.cms.Attribute({
                                attrType: "1.2.840.113549.1.9.3",
                                attrValues: [
                                    new in_window.org.pkijs.asn1.OID({ value: "1.2.840.113549.1.7.1" })
                                ]
                            }));
                            // #endregion 
                            // #region signingTime 
                            signed_attr.push(new in_window.org.pkijs.simpl.cms.Attribute({
                                attrType: "1.2.840.113549.1.9.5",
                                attrValues: [
                                    new in_window.org.pkijs.asn1.UTCTIME({ value_date: new Date() })
                                ]
                            }));
                            // #endregion 
                            // #region messageDigest 
                            signed_attr.push(new in_window.org.pkijs.simpl.cms.Attribute({
                                attrType: "1.2.840.113549.1.9.4",
                                attrValues: [
                                    new in_window.org.pkijs.asn1.OCTETSTRING({ value_hex: result })
                                ]
                            }));
                            // #endregion 

                            // #region Making final value for "SignerInfo" type 
                            cms_signed_simpl.signerInfos.push(new in_window.org.pkijs.simpl.CMS_SIGNER_INFO({
                                version: 1,
                                sid: new in_window.org.pkijs.simpl.cms.IssuerAndSerialNumber({
                                    issuer: parameters.signingCertificate.issuer,
                                    serialNumber: parameters.signingCertificate.serialNumber
                                }),
                                signedAttrs: new in_window.org.pkijs.simpl.cms.SignedUnsignedAttributes({
                                    type: 0,
                                    attributes: signed_attr
                                })
                            }));
                            // #endregion 
                        },
                        function(error)
                        {
                            return Promise.reject("Error during making digest for message: " + error);
                        }
                        );
                    // #endregion 
                    // #endregion 

                    // #region Signing CMS Signed Data 
                    sequence = sequence.then(
                        function()
                        {
                            return cms_signed_simpl.sign(parameters.privateKey, 0, parameters.hashAlgorithm);
                        }
                        );
                    // #endregion   

                    // #region Making final CMS_CONTENT_INFO type 
                    sequence = sequence.then(
                        function(result)
                        {
                            _this.authSafe = new in_window.org.pkijs.simpl.CMS_CONTENT_INFO({
                                contentType: "1.2.840.113549.1.7.2",
                                content: cms_signed_simpl.toSchema(true)
                            });
                        },
                        function(error)
                        {
                            return Promise.reject("Error during making signature: " + error);
                        }
                        );
                    // #endregion 
                }
                break;
            // #endregion 
            // #region default 
            default:
                return Promise.reject("Parameter \"integrityMode\" has unknown value: " + parameters.integrityMode);
            // #endregion 
        }
        // #endregion   

        return sequence;
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.PFX.prototype.parseInternalValues =
    function(parameters)
    {
        // #region Check input data from "parameters" 
        if((parameters instanceof Object) == false)
            return Promise.reject("The \"parameters\" must has \"Object\" type");

        if(("checkIntegrity" in parameters) == false)
            parameters.checkIntegrity = true;
        // #endregion 

        // #region Initial variables 
        var _this = this;
        var sequence = Promise.resolve();
        // #endregion 

        // #region Get a "crypto" extension 
        var crypto = in_window.org.pkijs.getCrypto();
        if(typeof crypto == "undefined")
            return Promise.reject("Unable to create WebCrypto object");
        // #endregion 

        // #region Create value for "this.parsedValue.authenticatedSafe" and check integrity 
        this.parsedValue = {};

        switch(this.authSafe.contentType)
        {
            // #region data 
            case "1.2.840.113549.1.7.1": 
                {
                    // #region Check additional mandatory parameters 
                    if(("password" in parameters) == false)
                        return Promise.reject("Absent mandatory parameter \"password\"");
                    // #endregion   

                    // #region Integrity based on HMAC 
                    this.parsedValue.integrityMode = 0;
                    // #endregion 

                    // #region Check that we do have OCTETSTRING as "content" 
                    if((this.authSafe.content instanceof in_window.org.pkijs.asn1.OCTETSTRING) == false)
                        return Promise.reject("Wrong type of \"this.authSafe.content\"");
                    // #endregion 

                    // #region Parse internal ASN.1 data 
                    var asn1 = in_window.org.pkijs.fromBER(this.authSafe.content.value_block.value_hex);
                    if(asn1.offset == (-1))
                        return Promise.reject("Error during parsing of ASN.1 data inside \"this.authSafe.content\"");
                    // #endregion   

                    // #region Set "authenticatedSafe" value 
                    this.parsedValue.authenticatedSafe = new in_window.org.pkijs.simpl.pkcs12.AuthenticatedSafe({ schema: asn1.result });
                    // #endregion 

                    // #region Check integrity 
                    if(parameters.checkIntegrity)
                    {
                        // #region Check that "MacData" exists 
                        if(("macData" in _this) == false)
                            return Promise.reject("Absent \"macData\" value, can not check PKCS# data integrity");
                        // #endregion   

                        // #region Initial variables 
                        var hashAlgorithm = in_window.org.pkijs.getAlgorithmByOID(_this.macData.mac.digestAlgorithm.algorithm_id);
                        if(("name" in hashAlgorithm) === false)
                            return Promise.reject("Unsupported digest algorithm: " + _this.macData.mac.digestAlgorithm.algorithm_id);

                        var length;

                        // #region Choose correct length for HMAC key 
                        switch(hashAlgorithm.name.toLowerCase())
                        {
                            case "sha-1":
                                length = 160;
                                break;
                            case "sha-256":
                                length = 256;
                                break;
                            case "sha-384":
                                length = 384;
                                break;
                            case "sha-512":
                                length = 512;
                                break;
                            default:
                                return Promise.reject("Incorrect \"hashAlgorithm\": " + hashAlgorithm.name);
                        }
                        // #endregion 

                        var hmacAlgorithm = {
                            name: "HMAC",
                            length: length,
                            hash: {
                                name: hashAlgorithm.name
                            }
                        };
                        // #endregion 

                        // #region Generate HMAC key using PBKDF2 
                        // #region Derive PBKDF2 key from "password" buffer 
                        sequence = sequence.then(
                            function(result)
                            {
                                var passwordView = new Uint8Array(parameters.password);

                                return crypto.importKey("raw",
                                    passwordView,
                                    "PBKDF2",
                                    true,
                                    ['deriveKey']);
                            },
                            function(error)
                            {
                                return Promise.reject(error);
                            }
                            );
                        // #endregion 

                        // #region Derive key for HMAC 
                        sequence = sequence.then(
                            function(result)
                            {
                                return crypto.deriveKey({
                                    name: "PBKDF2",
                                    hash: {
                                        name: hashAlgorithm.name
                                    },
                                    salt: new Uint8Array(_this.macData.macSalt.value_block.value_hex),
                                    iterations: _this.macData.iterations
                                },
                                result,
                                hmacAlgorithm,
                                true,
                                ['verify']);
                            },
                            function(error)
                            {
                                return Promise.reject(error);
                            }
                            );
                        // #endregion 
                        // #endregion   

                        // #region Verify HMAC signature 
                        sequence = sequence.then(
                            function(result)
                            {
                                var data = _this.authSafe.content.toBER(false);
                                var view = new Uint8Array(data);

                                return crypto.verify(hmacAlgorithm,
                                    result,
                                    new Uint8Array(_this.macData.mac.digest.value_block.value_hex),
                                    view);
                            },
                            function(error)
                            {
                                return Promise.reject(error);
                            }
                            );

                        sequence = sequence.then(
                            function(result)
                            {
                                if(result == false)
                                    return Promise.reject("Integrity for the PKCS#12 data is broken!");
                            },
                            function(error)
                            {
                                return Promise.reject(error);
                            }
                            );
                        // #endregion   
                    }
                    // #endregion 
                }
                break;
            // #endregion 
            // #region signedData 
            case "1.2.840.113549.1.7.2":
                {
                    // #region Integrity based on signature using public key 
                    this.parsedValue.integrityMode = 1;
                    // #endregion 

                    // #region Parse CMS Signed Data 
                    var cms_signed_simpl = new in_window.org.pkijs.simpl.CMS_SIGNED_DATA({ schema: this.authSafe.content });
                    // #endregion   

                    // #region Check that we do have OCTETSTRING as "content" 
                    if(("eContent" in cms_signed_simpl.encapContentInfo) == false)
                        return Promise.reject("Absent of attached data in \"cms_signed_simpl.encapContentInfo\"");

                    if((cms_signed_simpl.encapContentInfo.eContent instanceof in_window.org.pkijs.asn1.OCTETSTRING) == false)
                        return Promise.reject("Wrong type of \"cms_signed_simpl.encapContentInfo.eContent\"");
                    // #endregion 

                    // #region Create correct data block for verification 
                    var data = new ArrayBuffer(0);

                    if(cms_signed_simpl.encapContentInfo.eContent.id_block.is_constructed == false)
                        data = cms_signed_simpl.encapContentInfo.eContent.value_block.value_hex;
                    else
                    {
                        for(var i = 0; i < cms_signed_simpl.encapContentInfo.eContent.value_block.value.length; i++)
                            data = in_window.org.pkijs.concat_buffers(data, cms_signed_simpl.encapContentInfo.eContent.value_block.value[i].value_block.value_hex);
                    }
                    // #endregion 

                    // #region Parse internal ASN.1 data 
                    var asn1 = in_window.org.pkijs.fromBER(data);
                    if(asn1.offset == (-1))
                        return Promise.reject("Error during parsing of ASN.1 data inside \"this.authSafe.content\"");
                    // #endregion   

                    // #region Set "authenticatedSafe" value 
                    this.parsedValue.authenticatedSafe = new in_window.org.pkijs.simpl.pkcs12.AuthenticatedSafe({ schema: asn1.result });
                    // #endregion 

                    // #region Check integrity 
                    sequence = sequence.then(
                        function()
                        {
                            return cms_signed_simpl.verify({ signer: 0, checkChain: false });
                        }
                        ).then(
                        function(result)
                        {
                            if(result == false)
                                return Promise.reject("Integrity for the PKCS#12 data is broken!");
                        },
                        function(error)
                        {
                            return Promise.reject("Error during integrity verification: " + error);
                        }
                        );
                    // #endregion 
                }
                break;
            // #endregion   
            // #region default 
            default:
                return Promise.reject("Incorrect value for \"this.authSafe.contentType\": " + _this.authSafe.contentType);
            // #endregion 
        }
        // #endregion 

        // #region Return result of the function 
        return sequence.then(
            function(result)
            {
                return _this;
            },
            function(error)
            {
                return Promise.reject("Error during parsing: " + error);
            }
            );
        // #endregion   
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "AuthenticatedSafe" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.AuthenticatedSafe =
    function()
    {
        // #region Internal properties of the object 
        this.safeContents = new Array(); // Array of "in_window.org.pkijs.simpl.CMS_CONTENT_INFO"

        // OPTIONAL this.parsedValue = {}; // Object having all parsed data from initial "safeContents"
        // #endregion 

        // #region Initialize internal properties based on input data 
        if(arguments[0] instanceof Object)
        {
            switch(true)
            {
                case ("schema" in arguments[0]):
                    in_window.org.pkijs.simpl.pkcs12.AuthenticatedSafe.prototype.fromSchema.call(this, arguments[0].schema);
                    break;
                default:
                    this.safeContents = (arguments[0].safeContents || new Array());

                    if("parsedValue" in arguments[0])
                        this.parsedValue = arguments[0].parsedValue;
            }
        }
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.AuthenticatedSafe.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.pkcs12.AuthenticatedSafe({
                names: {
                    contentInfos: "contentInfos"
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for AuthenticatedSafe");
        // #endregion 

        // #region Get internal properties from parsed schema 
        for(var i = 0; i < asn1.result["contentInfos"].length; i++)
            this.safeContents.push(new in_window.org.pkijs.simpl.CMS_CONTENT_INFO({ schema: (asn1.result["contentInfos"])[i] }));
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.AuthenticatedSafe.prototype.toSchema =
    function()
    {
        // #region Construct and return new ASN.1 schema for this object 
        var output_array = new Array();

        for(var i = 0; i < this.safeContents.length; i++)
            output_array.push(this.safeContents[i].toSchema());

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: output_array
        }));
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.AuthenticatedSafe.prototype.toJSON =
    function()
    {
        var output = {
            contentInfos: new Array()
        };

        for(var i = 0; i < this.safeContents.length; i++)
            output.contentInfos.push(this.safeContents[i].toJSON());

        return output;
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.AuthenticatedSafe.prototype.parseInternalValues =
    function(parameters)
    {
        // #region Check input data from "parameters" 
        if((parameters instanceof Object) == false)
            return Promise.reject("The \"parameters\" must has \"Object\" type");

        if(("safeContents" in parameters) == false)
            return Promise.reject("Absent mandatory parameter \"safeContents\"");

        if((parameters.safeContents instanceof Array) == false)
            return Promise.reject("The \"parameters.safeContents\" must has \"Array\" type");

        if(parameters.safeContents.length != this.safeContents.length)
            return Promise.reject("Length of \"parameters.safeContents\" must be equal to \"this.safeContents.length\"");
        // #endregion 

        // #region Initial variables 
        var _this = this;
        var sequence = Promise.resolve();

        var _safeContents = _this.safeContents.slice();
        // #endregion 

        // #region Create value for "this.parsedValue.authenticatedSafe" 
        _this.parsedValue = {
            safeContents: new Array()
        };

        for(var j = 0; j < _this.safeContents.length; j++)
        {
            switch(_this.safeContents[j].contentType)
            {
                // #region data 
                case "1.2.840.113549.1.7.1":
                    {
                        // #region Check that we do have OCTETSTRING as "content" 
                        if((_this.safeContents[j].content instanceof in_window.org.pkijs.asn1.OCTETSTRING) == false)
                            return Promise.reject("Wrong type of \"this.safeContents[j].content\"");
                        // #endregion 

                        // #region Parse internal ASN.1 data 
                        var asn1 = in_window.org.pkijs.fromBER(_this.safeContents[j].content.value_block.value_hex);
                        if(asn1.offset == (-1))
                            return Promise.reject("Error during parsing of ASN.1 data inside \"_this.safeContents[j].content\"");
                        // #endregion   

                        // #region Finilly initialize initial values of "SafeContents" type
                        _this.parsedValue.safeContents.push({
                            privacyMode: 0, // No privacy, clear data
                            value: new in_window.org.pkijs.simpl.pkcs12.SafeContents({ schema: asn1.result })
                        });
                        // #endregion   
                    }
                    break;
                // #endregion 
                // #region envelopedData 
                case "1.2.840.113549.1.7.3":
                    {
                        // #region Initial variables 
                        var cms_enveloped_simp = new in_window.org.pkijs.simpl.CMS_ENVELOPED_DATA({ schema: _this.safeContents[j].content });
                        // #endregion   

                        // #region Check mandatory parameters 
                        if(("recipientCertificate" in parameters.safeContents[j]) == false)
                            return Promise.reject("Absent mandatory parameter \"recipientCertificate\" in \"parameters.safeContents[j]\"");

                        var recipientCertificate = parameters.safeContents[j].recipientCertificate;

                        if(("recipientKey" in parameters.safeContents[j]) == false)
                            return Promise.reject("Absent mandatory parameter \"recipientKey\" in \"parameters.safeContents[j]\"");

                        var recipientKey = parameters.safeContents[j].recipientKey;
                        // #endregion 

                        // #region Decrypt CMS EnvelopedData using first recipient information 
                        sequence = sequence.then(
                            function()
                            {
                                return cms_enveloped_simp.decrypt(0, {
                                    recipientCertificate: recipientCertificate,
                                    recipientPrivateKey: recipientKey
                                });
                            }
                            );

                        sequence = sequence.then(
                            function(result)
                            {
                                var asn1 = in_window.org.pkijs.fromBER(result);
                                if(asn1.offset == (-1))
                                    return Promise.reject("Error during parsing of decrypted data");

                                _this.parsedValue.safeContents.push({
                                    privacyMode: 2, // Public-key privacy mode
                                    value: new in_window.org.pkijs.simpl.pkcs12.SafeContents({ schema: asn1.result })
                                });
                            }
                            );
                        // #endregion 
                    }
                    break;
                // #endregion   
                // #region encryptedData 
                case "1.2.840.113549.1.7.6":
                    {
                        // #region Initial variables 
                        var cms_encrypted_simpl = new in_window.org.pkijs.simpl.CMS_ENCRYPTED_DATA({ schema: _this.safeContents[j].content });
                        // #endregion   

                        // #region Check mandatory parameters 
                        if(("password" in parameters.safeContents[j]) == false)
                            return Promise.reject("Absent mandatory parameter \"password\" in \"parameters.safeContents[j]\"");

                        var password = parameters.safeContents[j].password;
                        // #endregion 

                        // #region Decrypt CMS EncryptedData using password 
                        sequence = sequence.then(
                            function(result)
                            {
                                return cms_encrypted_simpl.decrypt({
                                    password: password
                                });
                            },
                            function(error)
                            {
                                return Promise.reject(error);
                            }
                            );
                        // #endregion   

                        // #region Initialize internal data 
                        sequence = sequence.then(
                            function(result)
                            {
                                var asn1 = in_window.org.pkijs.fromBER(result);
                                if(asn1.offset == (-1))
                                    return Promise.reject("Error during parsing of decrypted data");

                                _this.parsedValue.safeContents.push({
                                    privacyMode: 1, // Password-based privacy mode
                                    value: new in_window.org.pkijs.simpl.pkcs12.SafeContents({ schema: asn1.result })
                                });
                            },
                            function(error)
                            {
                                return Promise.reject(error);
                            }
                            );
                        // #endregion   
                    }
                    break;
                // #endregion   
                // #region default 
                default:
                    throw new Error("Unknown \"contentType\" for AuthenticatedSafe: " + contentInfo.contentType);
                // #endregion 
            }
        };
        // #endregion 

        return sequence;
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.AuthenticatedSafe.prototype.makeInternalValues =
    function(parameters)
    {
        // #region Check data in "parsedValue" 
        if(("parsedValue" in this) == false)
            return Promise.reject("Please run \"parseValues\" first or add \"parsedValue\" manually");

        if((this.parsedValue instanceof Object) == false)
            return Promise.reject("The \"this.parsedValue\" must has \"Object\" type");

        if((this.parsedValue.safeContents instanceof Array) == false)
            return Promise.reject("The \"this.parsedValue.safeContents\" must has \"Array\" type");
        // #endregion 

        // #region Check input data from "parameters" 
        if((parameters instanceof Object) == false)
            return Promise.reject("The \"parameters\" must has \"Object\" type");

        if(("safeContents" in parameters) == false)
            return Promise.reject("Absent mandatory parameter \"safeContents\"");

        if((parameters.safeContents instanceof Array) == false)
            return Promise.reject("The \"parameters.safeContents\" must has \"Array\" type");

        if(parameters.safeContents.length != this.parsedValue.safeContents.length)
            return Promise.reject("Length of \"parameters.safeContents\" must be equal to \"this.parsedValue.safeContents\"");
        // #endregion 

        // #region Initial variables 
        var _this = this;
        var sequence = Promise.resolve();

        var promises = new Array();
        // #endregion 

        // #region Create internal values from already parsed values 
        _this.safeContents = new Array();

        for(var i = 0; i < _this.parsedValue.safeContents.length; i++)
        {
            // #region Check current "_this.parsedValue.safeContents[i]" value
            if(("privacyMode" in _this.parsedValue.safeContents[i]) == false)
                return Promise.reject("The \"privacyMode\" is a mandatory parameter for \"_this.parsedValue.safeContents[i]\"");

            if(("value" in _this.parsedValue.safeContents[i]) == false)
                return Promise.reject("The \"value\" is a mandatory parameter for \"_this.parsedValue.safeContents[i]\"");

            if((_this.parsedValue.safeContents[i].value instanceof in_window.org.pkijs.simpl.pkcs12.SafeContents) == false)
                return Promise.reject("The \"_this.parsedValue.safeContents[i].value\" must has \"in_window.org.pkijs.simpl.pkcs12.SafeContents\" type");
            // #endregion 

            switch(_this.parsedValue.safeContents[i].privacyMode)
            {
                // #region No privacy 
                case 0:
                    {
                        var content = _this.parsedValue.safeContents[i].value.toSchema().toBER(false);

                        sequence = sequence.then(
                            function()
                            {
                                _this.safeContents.push(new in_window.org.pkijs.simpl.CMS_CONTENT_INFO({
                                    contentType: "1.2.840.113549.1.7.1",
                                    content: new in_window.org.pkijs.asn1.OCTETSTRING({ value_hex: content })
                                }));
                            });
                    }
                    break;
                // #endregion 
                // #region Privacy with password
                case 1:
                    {
                        // #region Initial variables 
                        var cms_encrypted_simp = new in_window.org.pkijs.simpl.CMS_ENCRYPTED_DATA();

                        var currentParameters = parameters.safeContents[i];
                        currentParameters.contentToEncrypt = _this.parsedValue.safeContents[i].value.toSchema().toBER(false);
                        // #endregion   

                        // #region Encrypt CMS EncryptedData using password 
                        sequence = sequence.then(
                            function()
                            {
                                return cms_encrypted_simp.encrypt(currentParameters);
                            },
                            function(error)
                            {
                                return Promise.reject(error);
                            }
                            );
                        // #endregion 

                        // #region Store result content in CMS_CONTENT_INFO type 
                        sequence = sequence.then(
                            function(result)
                            {
                                _this.safeContents.push(new in_window.org.pkijs.simpl.CMS_CONTENT_INFO({
                                    contentType: "1.2.840.113549.1.7.6",
                                    content: cms_encrypted_simp.toSchema()
                                }));
                            },
                            function(error)
                            {
                                return Promise.reject(error);
                            }
                            );
                        // #endregion 
                    }
                    break;
                // #endregion 
                // #region Privacy with public key
                case 2:
                    {
                        // #region Initial variables 
                        var cmsEnveloped = new in_window.org.pkijs.simpl.CMS_ENVELOPED_DATA();
                        var contentToEncrypt = _this.parsedValue.safeContents[i].value.toSchema().toBER(false);
                        // #endregion 

                        // #region Check mandatory parameters 
                        if(("encryptingCertificate" in parameters.safeContents[i]) == false)
                            return Promise.reject("Absent mandatory parameter \"encryptingCertificate\" in \"parameters.safeContents[i]\"");

                        if(("encryptionAlgorithm" in parameters.safeContents[i]) == false)
                            return Promise.reject("Absent mandatory parameter \"encryptionAlgorithm\" in \"parameters.safeContents[i]\"");

                        switch(true)
                        {
                            case (parameters.safeContents[i].encryptionAlgorithm.name.toLowerCase() == "aes-cbc"):
                            case (parameters.safeContents[i].encryptionAlgorithm.name.toLowerCase() == "aes-gcm"):
                                break;
                            default:
                                return Promise.reject("Incorrect parameter \"encryptionAlgorithm\" in \"parameters.safeContents[i]\": " + parameters.safeContents[i].encryptionAlgorithm);
                        }

                        switch(true)
                        {
                            case (parameters.safeContents[i].encryptionAlgorithm.length == 128):
                            case (parameters.safeContents[i].encryptionAlgorithm.length == 192):
                            case (parameters.safeContents[i].encryptionAlgorithm.length == 256):
                                break;
                            default:
                                return Promise.reject("Incorrect parameter \"encryptionAlgorithm.length\" in \"parameters.safeContents[i]\": " + parameters.safeContents[i].encryptionAlgorithm.length);
                        }
                        // #endregion   

                        // #region Making correct "encryptionAlgorithm" variable 
                        var encryptionAlgorithm = parameters.safeContents[i].encryptionAlgorithm;
                        // #endregion   

                        // #region Append recipient for enveloped data 
                        cmsEnveloped.addRecipientByCertificate(parameters.safeContents[i].encryptingCertificate);
                        // #endregion   

                        // #region Making encryption 
                        sequence = sequence.then(
                            function()
                            {
                                return cmsEnveloped.encrypt(encryptionAlgorithm, contentToEncrypt);
                            }
                            );

                        sequence = sequence.then(
                            function()
                            {
                                _this.safeContents.push(new in_window.org.pkijs.simpl.CMS_CONTENT_INFO({
                                    contentType: "1.2.840.113549.1.7.3",
                                    content: cmsEnveloped.toSchema()
                                }));
                            }
                            );
                        // #endregion 
                    }
                    break;
                // #endregion 
                // #region default 
                default:
                    return Promise.reject("Incorrect value for \"_this.parsedValue.safeContents[i].privacyMode\": " + _this.parsedValue.safeContents[i].privacyMode);
                // #endregion 
            }
        }
        // #endregion 

        // #region Return result of the function 
        return sequence.then(
            function(result)
            {
                return _this;
            },
            function(error)
            {
                return Promise.reject("Error during parsing: " + error);
            }
            );
        // #endregion   
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "PKCS8ShroudedKeyBag" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.PKCS8ShroudedKeyBag =
    function()
    {
        // #region Internal properties of the object 
        this.encryptionAlgorithm = new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER();
        this.encryptedData = new in_window.org.pkijs.asn1.OCTETSTRING();

        // OPTIONAL this.parsedValue
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.pkcs12.PKCS8ShroudedKeyBag.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.encryptionAlgorithm = (arguments[0].encryptionAlgorithm || new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER());
                this.encryptedData = (arguments[0].encryptedData || new in_window.org.pkijs.asn1.OCTETSTRING());

                if("parsedValue" in arguments[0])
                    this.parsedValue = arguments[0].parsedValue;
            }
        }
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.PKCS8ShroudedKeyBag.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.pkcs12.PKCS8ShroudedKeyBag({
                names: {
                    encryptionAlgorithm: {
                        names: {
                            block_name: "encryptionAlgorithm"
                        }
                    },
                    encryptedData: "encryptedData"
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for PKCS8ShroudedKeyBag");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.encryptionAlgorithm = new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER({ schema: asn1.result["encryptionAlgorithm"] });
        this.encryptedData = asn1.result["encryptedData"];
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.PKCS8ShroudedKeyBag.prototype.toSchema =
    function()
    {
        // #region Construct and return new ASN.1 schema for this object 
        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: [
                this.encryptionAlgorithm.toSchema(),
                this.encryptedData
            ]
        }));
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.PKCS8ShroudedKeyBag.prototype.toJSON =
    function()
    {
        return {
            encryptionAlgorithm: this.encryptionAlgorithm.toJSON(),
            encryptedData: this.encryptedData.toJSON()
        };
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.PKCS8ShroudedKeyBag.prototype.parseInternalValues =
    function(parameters)
    {
        // #region Initial variables 
        var sequence = Promise.resolve();
        var _this = this;

        var cms_encrypted_simpl = new in_window.org.pkijs.simpl.CMS_ENCRYPTED_DATA({
            encryptedContentInfo: new in_window.org.pkijs.simpl.cms.EncryptedContentInfo({
                contentEncryptionAlgorithm: this.encryptionAlgorithm,
                encryptedContent: this.encryptedData
            })
        });
        // #endregion 

        // #region Decrypt internal data 
        sequence = sequence.then(
            function(result)
            {
                return cms_encrypted_simpl.decrypt(parameters);
            },
            function(error)
            {
                return Promise.reject(error);
            }
            );
        // #endregion 

        // #region Initialize "parsedValue" with decrypted PKCS#8 private key 
        sequence = sequence.then(
            function(result)
            {
                var asn1 = in_window.org.pkijs.fromBER(result);
                if(asn1.offset == (-1))
                    return Promise.reject("Error during parsing ASN.1 data");

                _this.parsedValue = new in_window.org.pkijs.simpl.PKCS8({ schema: asn1.result });
            },
            function(error)
            {
                return Promise.reject(error);
            }
            );
        // #endregion 

        return sequence;
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.PKCS8ShroudedKeyBag.prototype.makeInternalValues =
    function(parameters)
    {
        // #region Check that we do have "parsedValue" 
        if(("parsedValue" in this) == false)
            return Promise.reject("Please initialize \"parsedValue\" first");
        // #endregion 

        // #region Initial variables 
        var _this = this;
        var sequence = Promise.resolve();

        var cms_encrypted_simpl = new in_window.org.pkijs.simpl.CMS_ENCRYPTED_DATA();
        // #endregion 

        // #region Encrypt internal data 
        sequence = sequence.then(
            function(result)
            {
                parameters.contentToEncrypt = _this.parsedValue.toSchema().toBER(false);

                return cms_encrypted_simpl.encrypt(parameters);
            },
            function(error)
            {
                return Promise.reject(error);
            }
            );
        // #endregion 

        // #region Initialize internal values 
        sequence = sequence.then(
            function(result)
            {
                _this.encryptionAlgorithm = cms_encrypted_simpl.encryptedContentInfo.contentEncryptionAlgorithm;
                _this.encryptedData = cms_encrypted_simpl.encryptedContentInfo.encryptedContent;
            }
            );
        // #endregion 

        return sequence;
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "CertBag" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.CertBag =
    function()
    {
        // #region Internal properties of the object 
        this.certId = ""; 
        this.certValue = new in_window.org.pkijs.asn1.ANY();
        // OPTIONAL this.parsedValue = new in_window.org.pkijs.simpl.CERT(); // In case "this.certId = 1.2.840.113549.1.9.22.1"
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.pkcs12.CertBag.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.certId = (arguments[0].certId || "");
                this.certValue = (arguments[0].certValue || new in_window.org.pkijs.asn1.ANY());

                if("parsedValue" in arguments[0])
                    this.parsedValue = arguments[0].parsedValue;
            }
        }
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.CertBag.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.pkcs12.CertBag({
                names: {
                    id: "certId",
                    value: "certValue"
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for CertBag");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.certId = asn1.result.certId.value_block.toString();
        this.certValue = asn1.result["certValue"];

        switch(this.certId)
        {
            case "1.2.840.113549.1.9.22.1": // x509Certificate
                {
                    var asn1_cert = in_window.org.pkijs.fromBER(this.certValue.value_block.value_hex);
                    this.parsedValue = new in_window.org.pkijs.simpl.CERT({ schema: asn1_cert.result });
                }
                break;
            case "1.2.840.113549.1.9.22.2": // sdsiCertificate
            default:
                throw new Error("Incorrect \"certId\" value in CertBag: " + this.certId);
        }
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.CertBag.prototype.toSchema =
    function()
    {
        // #region Construct and return new ASN.1 schema for this object 
        if("parsedValue" in this)
        {
            this.certId = "1.2.840.113549.1.9.22.1";
            this.certValue = new in_window.org.pkijs.asn1.OCTETSTRING({ value_hex: this.parsedValue.toSchema().toBER(false) });
        }

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: [
                new in_window.org.pkijs.asn1.OID({ value: this.certId }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 0 // [0]
                    },
                    value: [(("toSchema" in this.certValue) ? this.certValue.toSchema() : this.certValue)]
                })
            ]
        }));
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.CertBag.prototype.toJSON =
    function()
    {
        return {
            certId: this.certId,
            certValue: this.certValue.toJSON()
        };
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "CRLBag" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.CRLBag =
    function()
    {
        // #region Internal properties of the object 
        this.crlId = "";
        this.crlValue = new in_window.org.pkijs.asn1.ANY();

        // OPTIONAL this.parsedValue = new in_window.org.pkijs.simpl.CRL();
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.pkcs12.CRLBag.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.crlId = (arguments[0].crlId || "");
                this.crlValue = (arguments[0].crlValue || new in_window.org.pkijs.asn1.ANY());

                if("parsedValue" in arguments[0])
                    this.parsedValue = arguments[0].parsedValue;
            }
        }
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.CRLBag.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.pkcs12.CRLBag({
                names: {
                    id: "crlId",
                    value: "crlValue"
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for CRLBag");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.crlId = asn1.result.crlId.value_block.toString();
        this.crlValue = asn1.result["crlValue"];

        switch(this.crlId)
        {
            case "1.2.840.113549.1.9.23.1": // x509CRL
                {
                    var asn1_cert = in_window.org.pkijs.fromBER(this.certValue.value_block.value_hex);
                    this.parsedValue = new in_window.org.pkijs.simpl.CRL({ schema: asn1_cert.result });
                }
                break;
            default:
                throw new Error("Incorrect \"certId\" value in CertBag: " + this.certId);
        }
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.CRLBag.prototype.toSchema =
    function()
    {
        // #region Construct and return new ASN.1 schema for this object 
        if("parsedValue" in this)
        {
            this.certId = "1.2.840.113549.1.9.23.1";
            this.certValue = new in_window.org.pkijs.asn1.OCTETSTRING({ value_hex: this.parsedValue.toSchema().toBER(false) });
        }

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: [
                new in_window.org.pkijs.asn1.OID({ value: this.crlId }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 0 // [0]
                    },
                    value: [this.crlValue.toSchema()]
                })
            ]
        }));
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.CRLBag.prototype.toJSON =
    function()
    {
        return {
            crlId: this.crlId,
            crlValue: this.crlValue.toJSON()
        };
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "SecretBag" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.SecretBag =
    function()
    {
        // #region Internal properties of the object 
        this.secretTypeId = "";
        this.secretValue = new in_window.org.pkijs.asn1.ANY();
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.pkcs12.SecretBag.prototype.fromSchema.call(this, arguments[0].schema);
            // #endregion 
            // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.secretTypeId = (arguments[0].secretTypeId || "");
                this.secretValue = (arguments[0].secretValue || new in_window.org.pkijs.asn1.ANY());
            }
        }
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.SecretBag.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.pkcs12.SecretBag({
                names: {
                    id: "secretTypeId",
                    value: "secretValue"
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for SecretBag");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.secretTypeId = asn1.result.secretTypeId.value_block.toString();
        this.secretValue = asn1.result["secretValue"];
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.SecretBag.prototype.toSchema =
    function()
    {
        // #region Construct and return new ASN.1 schema for this object 
        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: [
                new in_window.org.pkijs.asn1.OID({ value: this.secretTypeId }),
                new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    id_block: {
                        tag_class: 3, // CONTEXT-SPECIFIC
                        tag_number: 0 // [0]
                    },
                    value: [this.secretValue.toSchema()]
                })
            ]
        }));
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.SecretBag.prototype.toJSON =
    function()
    {
        return {
            secretTypeId: this.secretTypeId,
            secretValue: this.secretValue.toJSON()
        };
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "SafeBag" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.SafeBag =
    function()
    {
        // #region Internal properties of the object 
        this.bagId = ""; 
        this.bagValue = new in_window.org.pkijs.asn1.ANY();
        // OPTIONAL this.bagAttributes = new Array(); // Array of "in_window.org.pkijs.simpl.cms.Attribute"
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.pkcs12.SafeBag.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.bagId = (arguments[0].bagId || "");
                this.bagValue = (arguments[0].bagValue || new in_window.org.pkijs.asn1.ANY());

                if("bagAttributes" in arguments[0])
                    this.bagAttributes = arguments[0].bagAttributes;
            }
        }
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.SafeBag.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.pkcs12.SafeBag({
                names: {
                    bagId: "bagId",
                    bagValue: "bagValue",
                    bagAttributes: "bagAttributes"
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for SafeBag");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.bagId = asn1.result.bagId.value_block.toString();

        switch(this.bagId)
        {
            case "1.2.840.113549.1.12.10.1.1": // keyBag
                this.bagValue = new in_window.org.pkijs.simpl.PKCS8({ schema: asn1.result["bagValue"] });
                break;
            case "1.2.840.113549.1.12.10.1.2": // pkcs8ShroudedKeyBag
                this.bagValue = new in_window.org.pkijs.simpl.pkcs12.PKCS8ShroudedKeyBag({ schema: asn1.result["bagValue"] });
                break;
            case "1.2.840.113549.1.12.10.1.3": // certBag
                this.bagValue = new in_window.org.pkijs.simpl.pkcs12.CertBag({ schema: asn1.result["bagValue"] });
                break;
            case "1.2.840.113549.1.12.10.1.4": // crlBag
                this.bagValue = new in_window.org.pkijs.simpl.pkcs12.CRLBag({ schema: asn1.result["bagValue"] });
                break;
            case "1.2.840.113549.1.12.10.1.5": // secretBag
                this.bagValue = new in_window.org.pkijs.simpl.pkcs12.SecretBag({ schema: asn1.result["bagValue"] });
                break;
            case "1.2.840.113549.1.12.10.1.6": // safeContentsBag
                this.bagValue = new in_window.org.pkijs.simpl.pkcs12.SafeContents({ schema: asn1.result["bagValue"] });
                break;
            default:
                throw new Error("Invalid \"bagId\" for SafeBag: " + this.bagId);
        }

        if("bagAttributes" in asn1.result)
        {
            this.bagAttributes = new Array();

            for(var i = 0; i < asn1.result["bagAttributes"].length; i++)
                this.bagAttributes.push(new in_window.org.pkijs.simpl.cms.Attribute({ schema: (asn1.result["bagAttributes"])[i] }));
        }
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.SafeBag.prototype.toSchema =
    function()
    {
        // #region Construct and return new ASN.1 schema for this object 
        var output_array = [
            new in_window.org.pkijs.asn1.OID({ value: this.bagId }),
            new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                id_block: {
                    tag_class: 3, // CONTEXT-SPECIFIC
                    tag_number: 0 // [0]
                },
                value: [this.bagValue.toSchema()]
            })
        ];

        if("bagAttributes" in this)
        {
            var attributesArray = new Array();

            for(var i = 0; i < this.bagAttributes.length; i++)
                attributesArray.push(this.bagAttributes[i].toSchema());

            output_array.push(new in_window.org.pkijs.asn1.SET({
                value: attributesArray
            }));
        }

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: output_array
        }));
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.SafeBag.prototype.toJSON =
    function()
    {
        var output = {
            bagId: this.bagId,
            bagValue: this.bagValue.toJSON()
        };

        if("bagAttributes" in this)
        {
            output.bagAttributes = new Array();

            for(var i = 0; i < this.bagAttributes.length; i++)
                output.bagAttributes.push(this.bagAttributes[i].toJSON());
        }

        return output;
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "SafeContents" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.SafeContents =
    function()
    {
        // #region Internal properties of the object 
        this.safeBags = new Array(); // Array of "in_window.org.pkijs.simpl.pkcs12.SafeBag"
        // #endregion 

        // #region Initialize internal properties based on input data 
        if(arguments[0] instanceof Object)
        {
            switch(true)
            {
                case ("schema" in arguments[0]):
                    in_window.org.pkijs.simpl.pkcs12.SafeContents.prototype.fromSchema.call(this, arguments[0].schema);
                    break;
                case ("contentInfo" in arguments[0]):
                    in_window.org.pkijs.simpl.pkcs12.SafeContents.prototype.fromContentInfo.call(this, arguments[0].contentInfo);
                    break;
                default:
                    this.safeBags = (arguments[0].safeBags || new Array());

                    this.privacyMode = (arguments[0].privacyMode || 0);
                    this.privacyParameters = (arguments[0].privacyParameters || {});
            }
        }
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.SafeContents.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.pkcs12.SafeContents({
                names: {
                    safeBags: "safeBags"
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for SafeContents");
        // #endregion 

        // #region Get internal properties from parsed schema 
        for(var i = 0; i < asn1.result["safeBags"].length; i++)
            this.safeBags.push(new in_window.org.pkijs.simpl.pkcs12.SafeBag({ schema: (asn1.result["safeBags"])[i] }));
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.SafeContents.prototype.toSchema =
    function()
    {
        // #region Construct and return new ASN.1 schema for this object 
        var output_array = new Array();

        for(var i = 0; i < this.safeBags.length; i++)
            output_array.push(this.safeBags[i].toSchema());

        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: output_array
        }));
        // #endregion 
    };
    //**************************************************************************************
    in_window.org.pkijs.simpl.pkcs12.SafeContents.prototype.toJSON =
    function()
    {
        var output = {
            safeBags: new Array()
        };

        for(var i = 0; i < this.safeBags.length; i++)
            output.safeBags.push(this.safeBags[i].toJSON());

        return output;
    };
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
}
)(typeof exports !== "undefined" ? exports : window);