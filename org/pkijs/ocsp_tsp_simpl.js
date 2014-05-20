/*
 * Copyright (c) 2014, GMO GlobalSign
 * All rights reserved.
 *
 * Author 2014, Yury Strozhevsky <www.strozhevsky.com>.
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

    // #region "org.pkijs.simpl.ocsp" namespace 
    if(typeof in_window.org.pkijs.simpl.ocsp === "undefined")
        in_window.org.pkijs.simpl.ocsp = {};
    else
    {
        if(typeof in_window.org.pkijs.simpl.ocsp !== "object")
            throw new Error("Name org.pkijs.simpl.ocsp already exists and it's not an object" + " but " + (typeof in_window.org.pkijs.simpl.ocsp));
    }
    // #endregion 

    // #region "org.pkijs.simpl.tsp" namespace 
    if(typeof in_window.org.pkijs.simpl.tsp === "undefined")
        in_window.org.pkijs.simpl.tsp = {};
    else
    {
        if(typeof in_window.org.pkijs.simpl.tsp !== "object")
            throw new Error("Name org.pkijs.simpl.tsp already exists and it's not an object" + " but " + (typeof in_window.org.pkijs.simpl.tsp));
    }
    // #endregion 

    // #region "local" namespace 
    var local = {};
    // #endregion   
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "CertID" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.CertID =
    function()
    {
        // #region Internal properties of the object 
        this.hashAlgorithm = new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER();
        this.issuerNameHash = new in_window.org.pkijs.asn1.OCTETSTRING();
        this.issuerKeyHash = new in_window.org.pkijs.asn1.OCTETSTRING();
        this.serialNumber = new in_window.org.pkijs.asn1.INTEGER();
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.ocsp.CertID.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.hashAlgorithm = arguments[0].hashAlgorithm || new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER();
                this.issuerNameHash = arguments[0].issuerNameHash || new in_window.org.pkijs.asn1.OCTETSTRING();
                this.issuerKeyHash = arguments[0].issuerKeyHash || new in_window.org.pkijs.asn1.OCTETSTRING();
                this.serialNumber = arguments[0].serialNumber || new in_window.org.pkijs.asn1.INTEGER();
            }
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.CertID.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.ocsp.CertID({
                names: {
                    hashAlgorithm: "hashAlgorithm",
                    issuerNameHash: "issuerNameHash",
                    issuerKeyHash: "issuerKeyHash",
                    serialNumber: "serialNumber"
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for CertID");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.hashAlgorithm = new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER({ schema: asn1.result["hashAlgorithm"] });
        this.issuerNameHash = asn1.result["issuerNameHash"];
        this.issuerKeyHash = asn1.result["issuerKeyHash"];
        this.serialNumber = asn1.result["serialNumber"];;
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.CertID.prototype.toSchema =
    function()
    {
        // #region Construct and return new ASN.1 schema for this object 
        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: [
                this.hashAlgorithm.toSchema(),
                this.issuerNameHash,
                this.issuerKeyHash,
                this.serialNumber
            ]
        }));
        // #endregion 
    }
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "Request" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.Request =
    function()
    {
        // #region Internal properties of the object 
        this.reqCert = new in_window.org.pkijs.simpl.ocsp.CertID();
        // OPTIONAL this.singleRequestExtensions = new Array(); // Array of in_window.org.pkijs.simpl.EXTENSION();
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.ocsp.Request.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.reqCert = arguments[0].reqCert || new in_window.org.pkijs.simpl.ocsp.CertID();
                if("singleRequestExtensions" in arguments[0])
                    this.singleRequestExtensions = arguments[0].singleRequestExtensions;
            }
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.Request.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.ocsp.Request({
                names: {
                    reqCert: {
                        names: {
                            block_name: "reqCert"
                        }
                    },
                    singleRequestExtensions: {
                        names: {
                            block_name: "singleRequestExtensions"
                        }
                    }
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for Request");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.reqCert = new in_window.org.pkijs.simpl.ocsp.CertID({ schema: asn1.result["reqCert"] });

        if("singleRequestExtensions" in asn1.result)
        {
            this.singleRequestExtensions = new Array();
            var exts = asn1.result["singleRequestExtensions"];

            for(var i = 0; i < exts.length; i++)
                this.singleRequestExtensions.push(new in_window.org.pkijs.simpl.EXTENSION({ schema: exts[i] }));
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.Request.prototype.toSchema =
    function()
    {
        // #region Create array for output sequence 
        var output_array = new Array();

        output_array.push(this.reqCert.toSchema());

        if("singleRequestExtensions" in this)
        {
            var extensions = new Array();

            for(var j = 0; j < this.singleRequestExtensions.length; j++)
                extensions.push(this.singleRequestExtensions[j].toSchema());

            output_array.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                optional: true,
                id_block_tag_class: 3, // CONTEXT-SPECIFIC
                id_block_tag_number: 0, // [0]
                value: [
                    new in_window.org.pkijs.asn1.SEQUENCE({
                        value: extensions
                    })
                ]
            }));
        }
        // #endregion 

        // #region Construct and return new ASN.1 schema for this object 
        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: output_array
        }));
        // #endregion 
    }
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "TBSRequest" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.TBSRequest =
    function()
    {
        // #region Internal properties of the object 
        this.tbs = new ArrayBuffer(0); // Value of TBS part before decode

        // OPTIONAL this.version = 0;
        // OPTIONAL this.requestorName = new in_window.org.pkijs.simpl.GENERAL_NAME();
        this.requestList = new Array(); // Array of "Request" objects
        // OPTIONAL this.requestExtensions = new Array(); // Array of in_window.org.pkijs.simpl.EXTENSION();
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.ocsp.TBSRequest.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.tbs = arguments[0].tbs || new ArrayBuffer(0); // Value of TBS part before decode

                if("version" in arguments[0])
                    this.version = arguments[0].version;
                if("requestorName" in arguments[0])
                    this.requestorName = arguments[0].requestorName;
                this.requestList = arguments[0].requestList || new Array(); // Array of "Request" objects
                if("requestExtensions" in arguments[0])
                    this.requestExtensions = arguments[0].requestExtensions;
            }
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.TBSRequest.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.ocsp.TBSRequest()
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for TBSRequest");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.tbs = asn1.result["TBSRequest"].value_before_decode;

        if("TBSRequest.version" in asn1.result)
            this.version = asn1.result["TBSRequest.version"].value_block.value_dec;
        if("TBSRequest.requestorName" in asn1.result)
            this.requestorName = new in_window.org.pkijs.simpl.GENERAL_NAME({ schema: asn1.result["TBSRequest.requestorName"] });

        var requests = asn1.result["TBSRequest.requests"];
        for(var i = 0; i < requests.length; i++)
            this.requestList.push(new in_window.org.pkijs.simpl.ocsp.Request({ schema: requests[i] }));

        if("TBSRequest.requestExtensions" in asn1.result)
        {
            this.requestExtensions = new Array();
            var exts = asn1.result["TBSRequest.requestExtensions"];

            for(var i = 0; i < exts.length; i++)
                this.requestExtensions.push(new in_window.org.pkijs.simpl.EXTENSION({ schema: exts[i] }));
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.TBSRequest.prototype.toSchema =
    function(encodeFlag)
    {
        /// <param name="encodeFlag" type="Boolean">If param equal to false then create TBS schema via decoding stored value. In othe case create TBS schema via assembling from TBS parts.</param>

        // #region Check "encodeFlag" 
        if(typeof encodeFlag === "undefined")
            encodeFlag = false;
        // #endregion 

        // #region Decode stored TBS value 
        var tbs_schema;

        if(encodeFlag === false)
        {
            if(this.tbs.byteLength === 0) // No stored TBS part
                return in_window.org.pkijs.schema.ocsp.TBSRequest();

            tbs_schema = in_window.org.pkijs.fromBER(this.tbs).result;
        }
        // #endregion 
        // #region Create TBS schema via assembling from TBS parts
        else
        {
            var output_array = new Array();

            if("version" in this)
                output_array.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    optional: true,
                    id_block_tag_class: 3, // CONTEXT-SPECIFIC
                    id_block_tag_number: 0, // [0]
                    value: [new in_window.org.pkijs.asn1.INTEGER({ value: this.version })]
                }));

            if("requestorName" in this)
                output_array.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    optional: true,
                    id_block_tag_class: 3, // CONTEXT-SPECIFIC
                    id_block_tag_number: 1, // [1]
                    value: [this.requestorName.toSchema()]
                }));

            var requests = new Array();

            for(var i = 0; i < this.requestList.length; i++)
                requests.push(this.requestList[i].toSchema());

            output_array.push(new in_window.org.pkijs.asn1.SEQUENCE({
                value: requests
            }));

            if("requestExtensions" in this)
            {
                var extensions = new Array();

                for(var j = 0; j < this.requestExtensions.length; j++)
                    extensions.push(this.requestExtensions[j].toSchema());

                output_array.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    optional: true,
                    id_block_tag_class: 3, // CONTEXT-SPECIFIC
                    id_block_tag_number: 2, // [2]
                    value: [
                        new in_window.org.pkijs.asn1.SEQUENCE({
                            value: extensions
                        })
                    ]
                }));
            }

            tbs_schema = new in_window.org.pkijs.asn1.SEQUENCE({
                value: output_array
            });
        }
        // #endregion 

        // #region Construct and return new ASN.1 schema for this object 
        return tbs_schema;
        // #endregion 
    }
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "Signature" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.Signature =
    function()
    {
        // #region Internal properties of the object 
        this.signatureAlgorithm = new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER();
        this.signature = new in_window.org.pkijs.asn1.BITSTRING();
        // OPTIONAL this.certs = new Array(); // Array of X.509 certificates
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.ocsp.Signature.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.signatureAlgorithm = arguments[0].signatureAlgorithm || new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER();
                this.signature = arguments[0].signature || new in_window.org.pkijs.asn1.BITSTRING();
                if("certs" in arguments[0])
                    this.certs = arguments[0].certs; // Array of X.509 certificates
            }
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.Signature.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.ocsp.Signature({
                names: {
                    signatureAlgorithm: {
                        names: {
                            block_name: "signatureAlgorithm"
                        }
                    },
                    signature: "signature",
                    certs: "certs"
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for ocsp.Signature");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.signatureAlgorithm = new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER({ schema: asn1.result["signatureAlgorithm"] });
        this.signature = asn1.result["signature"];
        if("certs" in asn1.result)
        {
            this.certs = new Array();

            var certs_array = asn1.result["certs"];
            for(var i = 0; i < certs_array; i++)
                this.certs.push(new in_window.org.pkijs.simpl.CERT({ schema: certs_array[i] }));
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.Signature.prototype.toSchema =
    function()
    {
        // #region Create array of output sequence 
        var output_array = new Array();

        output_array.push(this.signatureAlgorithm.toSchema());
        output_array.push(this.signature);
        if("certs" in this)
        {
            // #region Create certificate array 
            var cert_array = new Array();

            for(var i = 0; i < this.certs; i++)
                cert_array.push(this.certs[i].toSchema());
            // #endregion 

            output_array.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                optional: true,
                id_block_tag_class: 3, // CONTEXT-SPECIFIC
                id_block_tag_number: 0, // [0]
                value: [
                    new in_window.org.pkijs.asn1.SEQUENCE({
                        value: cert_array
                    })
                ]
            }));
        }
        // #endregion 

        // #region Construct and return new ASN.1 schema for this object 
        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: output_array
        }));
        // #endregion 
    }
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "OCSP_REQUEST" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.OCSP_REQUEST =
    function()
    {
        // #region Internal properties of the object 
        // OPTIONAL this.version = 0;
        // OPTIONAL this.requestorName = new in_window.org.pkijs.simpl.GENERAL_NAME();
        this.requestList = new Array(); // Array of "Request" objects
        // OPTIONAL this.requestExtensions = new Array(); // Array of in_window.org.pkijs.simpl.EXTENSION();

        // OPTIONAL this.optionalSignature = new in_window.org.pkijs.simpl.ocsp.Signature();
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.OCSP_REQUEST.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.tbsRequest = arguments[0].tbsRequest || new in_window.org.pkijs.simpl.ocsp.TBSRequest();
                if("optionalSignature" in arguments[0])
                    this.optionalSignature = arguments[0].optionalSignature;
            }
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.OCSP_REQUEST.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.OCSP_REQUEST()
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for OCSP_REQUEST");
        // #endregion 

        // #region Get internal properties from parsed schema 
        if("TBSRequest.version" in asn1.result)
            this.version = asn1.result["TBSRequest.version"].value_block.value_dec;
        if("TBSRequest.requestorName" in asn1.result)
            this.requestorName = new in_window.org.pkijs.simpl.GENERAL_NAME({ schema: asn1.result["TBSRequest.requestorName"] });

        var requests = asn1.result["TBSRequest.requests"];
        for(var i = 0; i < requests.length; i++)
            this.requestList.push(new in_window.org.pkijs.simpl.ocsp.Request({ schema: requests[i] }));

        if("TBSRequest.requestExtensions" in asn1.result)
        {
            this.requestExtensions = new Array();
            var exts = asn1.result["TBSRequest.requestExtensions"];

            for(var i = 0; i < exts.length; i++)
                this.requestExtensions.push(new in_window.org.pkijs.simpl.EXTENSION({ schema: exts[i] }));
        }
        if("optionalSignature" in asn1.result)
            this.optionalSignature = new in_window.org.pkijs.simpl.ocsp.Signature({ schema: asn1.result["optionalSignature"] });
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.OCSP_REQUEST.prototype.toSchema =
    function()
    {
        // #region Create array for output sequence 
        var output_array = new Array();

        // #region Create TBSRequest 
        var tbs_array = new Arra();

        if("version" in this)
            tbs_array.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                optional: true,
                id_block_tag_class: 3, // CONTEXT-SPECIFIC
                id_block_tag_number: 0, // [0]
                value: [new in_window.org.pkijs.asn1.INTEGER({ value: this.version })]
            }));

        if("requestorName" in this)
            tbs_array.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                optional: true,
                id_block_tag_class: 3, // CONTEXT-SPECIFIC
                id_block_tag_number: 1, // [1]
                value: [this.requestorName.toSchema()]
            }));

        var requests = new Array();

        for(var i = 0; i < this.requestList.length; i++)
            requests.push(this.requestList[i].toSchema());

        tbs_array.push(new in_window.org.pkijs.asn1.SEQUENCE({
            value: requests
        }));

        if("requestExtensions" in this)
        {
            var extensions = new Array();

            for(var j = 0; j < this.requestExtensions.length; j++)
                extensions.push(this.requestExtensions[j].toSchema());

            tbs_array.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                optional: true,
                id_block_tag_class: 3, // CONTEXT-SPECIFIC
                id_block_tag_number: 2, // [2]
                value: [
                    new in_window.org.pkijs.asn1.SEQUENCE({
                        value: extensions
                    })
                ]
            }));
        }

        output_array.push(new in_window.org.pkijs.asn1.SEQUENCE({ value: tbs_array }));
        // #endregion   

        if("optionalSignature" in this)
            output_array.push(this.optionalSignature.toSchema());
        // #endregion   

        // #region Construct and return new ASN.1 schema for this object 
        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: output_array
        }));
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.OCSP_REQUEST.prototype.sign =
    function(privateKey)
    {
        /// <param name="privateKey" type="Key">Private key for "subjectPublicKeyInfo" structure</param>

        // #region Initial variables 
        var _this = this;
        // #endregion 

        // #region Get a private key from function parameter 
        if(typeof privateKey === "undefined")
            return new Promise(function(resolve, reject) { reject("Need to provide a private key for signing"); });
        // #endregion 

        // #region Check that "optionalSignature" exists in the current request  
        if(("optionalSignature" in this) === false)
            return new Promise(function(resolve, reject) { reject("Need to create \"optionalSignature\" field before signing"); });
        // #endregion   

        // #region Find a correct hashing algorithm 
        var sha_algorithm = "";

        switch(this.optionalSignature.signatureAlgorithm.algorithm_id)
        {
            case "1.2.840.113549.1.1.5":
                sha_algorithm = "sha-1";
                break;
            case "1.2.840.113549.1.1.11":
                sha_algorithm = "sha-256";
                break;
            case "1.2.840.113549.1.1.12":
                sha_algorithm = "sha-384";
                break;
            case "1.2.840.113549.1.1.13":
                sha_algorithm = "sha-512";
                break;
            default:
                return new Promise(function(resolve, reject) { reject("Unsupported signature algorithm: " + this.signature.signatureAlgorithm.algorithm_id); });
        };
        // #endregion 

        // #region Create TBS data for signing 
        var tbs = this.tbsRequest.toSchema(true).toBER(false);
        // #endregion 

        // #region Get a "crypto" extension 
        var crypto = in_window.org.pkijs.getCrypto();
        if(typeof crypto == "undefined")
            return new Promise(function(resolve, reject) { reject("Unable to create WebCrypto object"); });
        // #endregion 

        // #region Signing TBS data on provided private key 
        return crypto.sign({ name: privateKey.algorithm.name, hash: { name: sha_algorithm } },
            privateKey,
            new Uint8Array(tbs)).then(
            function(result)
            {
                _this.optionalSignature.signature = new in_window.org.pkijs.asn1.BITSTRING({ value_hex: result });
            },
            function(error)
            {
                return new Promise(function(resolve, reject) { reject("Signing error: " + error); });
            }
            );
        // #endregion 
    }
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "ResponseBytes" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.ResponseBytes =
    function()
    {
        // #region Internal properties of the object 
        this.responseType = "";
        this.response = new in_window.org.pkijs.asn1.OCTETSTRING();
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.ocsp.ResponseBytes.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.responseType = arguments[0].responseType || "";
                this.response = arguments[0].response || new in_window.org.pkijs.asn1.OCTETSTRING();
            }
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.ResponseBytes.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.ocsp.ResponseBytes({
                names: {
                    responseType: "responseType",
                    response: "response"
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for ResponseBytes");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.responseType = asn1.result["responseType"].value_block.toString();
        this.response = asn1.result["response"];
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.ResponseBytes.prototype.toSchema =
    function()
    {
        // #region Construct and return new ASN.1 schema for this object 
        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: [
                new in_window.org.pkijs.asn1.OID({ value: this.responseType }),
                this.response
            ]
        }));
        // #endregion 
    }
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "OCSP_RESPONSE" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.OCSP_RESPONSE =
    function()
    {
        // #region Internal properties of the object 
        this.responseStatus = new in_window.org.pkijs.asn1.ENUMERATED();
        // OPTIONAL this.responseBytes = new in_window.org.pkijs.simpl.ocsp.ResponseBytes();
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.OCSP_RESPONSE.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.responseStatus = arguments[0].responseStatus || new in_window.org.pkijs.asn1.ENUMERATED();
                if("responseBytes" in arguments[0])
                    this.responseBytes = arguments[0].responseBytes;
            }
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.OCSP_RESPONSE.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.OCSP_RESPONSE()
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for OCSP_RESPONSE");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.responseStatus = asn1.result["responseStatus"];
        if("responseBytes" in asn1.result)
            this.responseBytes = new in_window.org.pkijs.simpl.ocsp.ResponseBytes({ schema: asn1.result["responseBytes"] });
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.OCSP_RESPONSE.prototype.toSchema =
    function()
    {
        // #region Create array for output sequence 
        var output_array = new Array();

        output_array.push(this.responseStatus);
        if("responseBytes" in this)
            output_array.push(this.responseBytes.toSchema());
        // #endregion 

        // #region Construct and return new ASN.1 schema for this object 
        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: output_array
        }));
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.OCSP_RESPONSE.prototype.verify =
    function()
    {
        /// <summary>!!! Works well in Chrome dev versions only (April 2014th) !!!</summary>
        /// <returns type="Promise">Returns a new Promise object (in case of error), or a result of "crypto.subtle.veryfy" function</returns>

        // #region Check that ResponseBytes exists in the object 
        if(("responseBytes" in this) === false)
            return new Promise(function(resolve, reject) { reject("Empty ResponseBytes field"); });
        // #endregion 

        // #region Check that ResponceData has type BasicOCSPResponse and verify it 
        if(this.responseBytes.responseType === "1.3.6.1.5.5.7.48.1.1")
        {
            var asn1 = in_window.org.pkijs.fromBER(this.responseBytes.response.value_block.value_hex);
            var basic_resp_simpl = new in_window.org.pkijs.simpl.OCSP_BASIC_RESPONSE({ schema: asn1.result });

            return basic_resp_simpl.verify();
        }
        else
            return new Promise(function(resolve, reject) { reject("Unknown ResponseBytes type: " + this.responseBytes.responseType); });
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.OCSP_RESPONSE.prototype.sign =
    function(privateKey)
    {
        /// <param name="privateKey" type="Key">Private key for "subjectPublicKeyInfo" structure</param>

        // #region Check that ResponceData has type BasicOCSPResponse and verify it 
        if(this.responseBytes.responseType === "1.3.6.1.5.5.7.48.1.1")
        {
            var asn1 = in_window.org.pkijs.fromBER(this.responseBytes.response.value_block.value_hex);
            var basic_resp_simpl = new in_window.org.pkijs.simpl.OCSP_BASIC_RESPONSE({ schema: asn1.result });

            return basic_resp_simpl.sign(privateKey);
        }
        else
            return new Promise(function(resolve, reject) { reject("Unknown ResponseBytes type: " + this.responseBytes.responseType); });
        // #endregion 
    }
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "SingleResponse" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.SingleResponse =
    function()
    {
        // #region Internal properties of the object 
        this.certID = new in_window.org.pkijs.simpl.ocsp.CertID();
        this.certStatus = new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
            id_block_tag_class: 3, // CONTEXT-SPECIFIC
            id_block_tag_number: 3, // [3]
            value: []
        }); // Fiction value
        this.thisUpdate = new Date(0, 0, 0);
        // OPTIONAL this.nextUpdate = new Date(0, 0, 0);
        // OPTIONAL this.singleExtensions = new Array(); // Array of in_window.org.pkijs.simpl.EXTENSION();
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.ocsp.SingleResponse.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.certID = arguments[0].certID || new in_window.org.pkijs.simpl.ocsp.CertID();
                this.certStatus = arguments[0].certStatus || new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    id_block_tag_class: 3, // CONTEXT-SPECIFIC
                    id_block_tag_number: 3, // [3]
                    value: []
                }); // Fiction value
                this.thisUpdate = arguments[0].thisUpdate || new Date(0, 0, 0);
                if("nextUpdate" in arguments[0])
                    this.nextUpdate = arguments[0].nextUpdate;
                if("singleExtensions" in arguments[0])
                    this.singleExtensions = arguments[0].singleExtensions;
            }
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.SingleResponse.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.ocsp.SingleResponse({
                names: {
                    certID: {
                        names: {
                            block_name: "certID"
                        }
                    },
                    certStatus: "certStatus",
                    thisUpdate: "thisUpdate",
                    nextUpdate: "nextUpdate",
                    singleExtensions: "singleExtensions"
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for SingleResponse");
        // #endregion 

        // #region Get internal properties from parsed schema
        this.certID = new in_window.org.pkijs.simpl.ocsp.CertID({ schema: asn1.result["certID"] });
        this.certStatus = asn1.result["certStatus"];
        this.thisUpdate = asn1.result["thisUpdate"].toDate();
        if("nextUpdate" in asn1.result)
            this.nextUpdate = asn1.result["nextUpdate"].toDate();

        if("singleExtensions" in asn1.result)
        {
            this.singleExtensions = new Array();
            var exts = asn1.result["singleExtensions"];

            for(var i = 0; i < exts.length; i++)
                this.singleExtensions.push(new in_window.org.pkijs.simpl.EXTENSION({ schema: exts[i] }));
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.SingleResponse.prototype.toSchema =
    function()
    {
        // #region Create value array for output sequence 
        var output_array = new Array();

        output_array.push(this.certID.toSchema());
        output_array.push(this.certStatus);
        output_array.push(new in_window.org.pkijs.asn1.GENERALIZEDTIME({ value_date: this.thisUpdate }));
        if("nextUpdate" in this)
            output_array.push(new in_window.org.pkijs.asn1.GENERALIZEDTIME({ value_date: this.nextUpdate }));

        if("singleExtensions" in this)
        {
            var extensions = new Array();

            for(var j = 0; j < this.singleExtensions.length; j++)
                extensions.push(this.singleExtensions[j].toSchema());

            output_array.push(new in_window.org.pkijs.asn1.SEQUENCE({
                value: extensions
            }));
        }
        // #endregion 

        // #region Construct and return new ASN.1 schema for this object 
        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: output_array
        }));
        // #endregion 
    }
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "ResponseData" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.ResponseData =
    function()
    {
        // #region Internal properties of the object 
        this.tbs = new ArrayBuffer(0);

        // OPTIONAL this.version = 0;
        this.responderID = new in_window.org.pkijs.simpl.RDN(); // Fake value
        this.producedAt = new Date(0, 0, 0);
        this.responses = new Array(); // Array of "SingleResponse" objects
        // OPTIONAL this.responseExtensions = new Array(); // Array of in_window.org.pkijs.simpl.EXTENSION();
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.ocsp.ResponseData.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                if("version" in arguments[0])
                    this.version = arguments[0].version;
                this.responderID = arguments[0].responderID || new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    id_block_tag_class: 3, // CONTEXT-SPECIFIC
                    id_block_tag_number: 10, // [10]
                    value: []
                }); // Fake value
                this.producedAt = arguments[0].producedAt || new Date(0, 0, 0);
                this.responses = arguments[0].responses || new Array(); // Array of "SingleResponse" objects
                if("responseExtensions" in arguments[0])
                    this.responseExtensions = arguments[0].responseExtensions;
            }
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.ResponseData.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.ocsp.ResponseData()
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for ocsp.ResponseData");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.tbs = asn1.result["ResponseData"].value_before_decode;

        if("ResponseData.version" in asn1.result)
            this.version = asn1.result["ResponseData.version"].value_block.value_dec;

        if(asn1.result["ResponseData.responderID"].id_block.tag_number === 1)
            this.responderID = new in_window.org.pkijs.simpl.RDN({ schema: asn1.result["ResponseData.responderID"].value_block.value[0] });
        else
            this.responderID = asn1.result["ResponseData.responderID"].value_block.value[0]; // OCTETSTRING

        this.producedAt = asn1.result["ResponseData.producedAt"].toDate();

        var responses_array = asn1.result["ResponseData.responses"];
        for(var i = 0; i < responses_array.length; i++)
            this.responses.push(new in_window.org.pkijs.simpl.ocsp.SingleResponse({ schema: responses_array[i] }));

        if("ResponseData.responseExtensions" in asn1.result)
        {
            this.responseExtensions = new Array();
            var exts = asn1.result["ResponseData.responseExtensions"];

            for(var i = 0; i < exts.length; i++)
                this.responseExtensions.push(new in_window.org.pkijs.simpl.EXTENSION({ schema: exts[i] }));
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.ocsp.ResponseData.prototype.toSchema =
    function(encodeFlag)
    {
        /// <param name="encodeFlag" type="Boolean">If param equal to false then create TBS schema via decoding stored value. In othe case create TBS schema via assembling from TBS parts.</param>

        // #region Check "encodeFlag" 
        if(typeof encodeFlag === "undefined")
            encodeFlag = false;
        // #endregion 

        // #region Decode stored TBS value 
        var tbs_schema;

        if(encodeFlag === false)
        {
            if(this.tbs.length === 0) // No stored certificate TBS part
                return in_window.org.pkijs.schema.ocsp.ResponseData();

            tbs_schema = in_window.org.pkijs.fromBER(this.tbs).result;
        }
        // #endregion 
        // #region Create TBS schema via assembling from TBS parts
        else
        {
            var output_array = new Array();

            if("version" in this)
                output_array.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    id_block_tag_class: 3, // CONTEXT-SPECIFIC
                    id_block_tag_number: 0, // [0]
                    value: [new in_window.org.pkijs.asn1.INTEGER({ value: this.version })]
                }));

            if(this.responderID instanceof in_window.org.pkijs.simpl.RDN)
                output_array.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    id_block_tag_class: 3, // CONTEXT-SPECIFIC
                    id_block_tag_number: 1, // [1]
                    value: [this.responderID.toSchema()]
                }));
            else
                output_array.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                    id_block_tag_class: 3, // CONTEXT-SPECIFIC
                    id_block_tag_number: 2, // [2]
                    value: [this.responderID]
                }));

            output_array.push(new in_window.org.pkijs.asn1.GENERALIZEDTIME({ value_date: this.producedAt }));

            var responses = new Array();

            for(var i = 0; i < this.responses.length; i++)
                responses.push(this.responses[i].toSchema());

            output_array.push(new in_window.org.pkijs.asn1.SEQUENCE({
                value: responses
            }));

            if("responseExtensions" in this)
            {
                var extensions = new Array();

                for(var j = 0; j < this.responseExtensions.length; j++)
                    extensions.push(this.responseExtensions[j].toSchema());

                output_array.push(new in_window.org.pkijs.asn1.SEQUENCE({
                    value: extensions
                }));
            }

            tbs_schema = new in_window.org.pkijs.asn1.SEQUENCE({
                value: output_array
            });
        }
        // #endregion 

        // #region Construct and return new ASN.1 schema for this object 
        return tbs_schema;
        // #endregion 
    }
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "OCSP_BASIC_RESPONSE" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.OCSP_BASIC_RESPONSE =
    function()
    {
        // #region Internal properties of the object 
        this.tbsResponseData = new in_window.org.pkijs.simpl.ocsp.ResponseData();
        this.signatureAlgorithm = new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER();
        this.signature = new in_window.org.pkijs.asn1.BITSTRING();
        // OPTIONAL this.certs = new Array();
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.OCSP_BASIC_RESPONSE.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.tbsResponseData = arguments[0].tbsResponseData || new in_window.org.pkijs.simpl.ocsp.ResponseData();
                this.signatureAlgorithm = arguments[0].signatureAlgorithm || new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER();
                this.signature = arguments[0].signature || new in_window.org.pkijs.asn1.BITSTRING();
                if("certs" in arguments[0])
                    this.certs = arguments[0].certs;
            }
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.OCSP_BASIC_RESPONSE.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.OCSP_BASIC_RESPONSE()
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for OCSP_BASIC_RESPONSE");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.tbsResponseData = new in_window.org.pkijs.simpl.ocsp.ResponseData({ schema: asn1.result["BasicOCSPResponse.tbsResponseData"] });
        this.signatureAlgorithm = new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER({ schema: asn1.result["BasicOCSPResponse.signatureAlgorithm"] });
        this.signature = asn1.result["BasicOCSPResponse.signature"];

        if("BasicOCSPResponse.certs" in asn1.result)
        {
            this.certs = new Array();

            var certs_array = asn1.result["BasicOCSPResponse.certs"];

            for(var i = 0; i < certs_array.length; i++)
                this.certs.push(new in_window.org.pkijs.simpl.CERT({ schema: certs_array[i] }));
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.OCSP_BASIC_RESPONSE.prototype.toSchema =
    function()
    {
        // #region Create array for output sequence 
        var output_array = new Array();

        output_array.push(this.tbsResponseData.toSchema());
        output_array.push(this.signatureAlgorithm.toSchema());
        output_array.push(this.signature);

        // #region Create array of certificates 
        if("certs" in this)
        {
            var certs_array = new Array();

            for(var i = 0; i < this.certs.length; i++)
                certs_array.push(this.certs[i].toSchema());

            output_array.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                optional: true,
                id_block_tag_class: 3, // CONTEXT-SPECIFIC
                id_block_tag_number: 0, // [0]
                value: [
                    new in_window.org.pkijs.asn1.SEQUENCE({
                        value: certs_array
                    })
                ]
            }));
        }
        // #endregion 
        // #endregion 

        // #region Construct and return new ASN.1 schema for this object 
        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: output_array
        }));
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.OCSP_BASIC_RESPONSE.prototype.verify =
    function()
    {
        /// <summary>!!! Works well in Chrome dev versions only (April 2014th) !!!</summary>
        /// <returns type="Promise">Returns a new Promise object (in case of error), or a result of "crypto.subtle.veryfy" function</returns>

        // #region Check amount of certificates 
        if(("certs" in this) === false)
            return new Promise(function(resolve, reject) { reject("No certificates attached to the BasicOCSPResponce"); });
        // #endregion 

        // #region Global variables (used in "promises") 
        var certs = this.certs;
        var signature_view = new Uint8Array(this.signature.value_block.value_hex);
        var tbs_view = new Uint8Array(this.tbsResponseData.tbs);

        var cert_index = -1;

        var sequence = Promise.resolve();

        var sha_algorithm = "";
        // #endregion 

        // #region Get a "crypto" extension 
        var crypto = in_window.org.pkijs.getCrypto();
        if(typeof crypto == "undefined")
            return new Promise(function(resolve, reject) { reject("Unable to create WebCrypto object"); });
        // #endregion 

        // #region Find a correct hashing algorithm 
        switch(this.signatureAlgorithm.algorithm_id)
        {
            case "1.2.840.113549.1.1.5":
                sha_algorithm = "sha-1";
                break;
            case "1.2.840.113549.1.1.11":
                sha_algorithm = "sha-256";
                break;
            case "1.2.840.113549.1.1.12":
                sha_algorithm = "sha-384";
                break;
            case "1.2.840.113549.1.1.13":
                sha_algorithm = "sha-512";
                break;
            default:
                return new Promise(function(resolve, reject) { reject("Unsupported signature algorithm: " + this.signature.signatureAlgorithm.algorithm_id); });
        };
        // #endregion 

        // #region Find correct value for "responderID" 
        var responder_type = 0;
        var responder_id = {};

        if(this.tbsResponseData.responderID.id_block.tag_number === 1) // [1] Name
        {
            var asn1 = org.pkijs.fromBER(this.tbsResponseData.responderID.value_block.value_hex);
            responder_id = new in_window.org.pkijs.simpl.RDN({ schema: asn1.result });
        }
        else
        {
            if(this.tbsResponseData.responderID.id_block.tag_number === 2) // [2] KeyHash
            {
                responder_type = 1;

                responder_id = this.tbsResponseData.responderID.value_block.value[0];
            }
            else
                return new Promise(function(resolve, reject) { reject("Wrong value for responderID"); });
        }
        // #endregion 

        // #region Compare responderID with all certificates one-by-one
        if(responder_type === 0) // By Name
        {
            sequence = sequence.then(
                function()
                {
                    for(var i = 0; i < certs.length; i++)
                    {
                        if(certs[i].subject.isEqual(responder_id))
                        {
                            cert_index = i;
                            break;
                        }
                    }
                }
            );
        }
        else  // By KeyHash
        {
            sequence = sequence.then(
                function()
                {
                    var digest_promises = new Array();

                    for(var i = 0; i < certs.length; i++)
                        digest_promises.push(crypto.digest({ name: "sha-1" }, new Uint8Array(certs[i].subjectPublicKeyInfo.subjectPublicKey.value_block.value_hex)));

                    return Promise.all(digest_promises).then(
                            function(results)
                            {
                                for(var i = 0; i < certs.length; i++)
                                {
                                    if(in_window.org.pkijs.isEqual_buffer(results[i], responder_id.value_block.value_hex))
                                    {
                                        cert_index = i;
                                        break;
                                    }
                                }
                            }
                        );
                }
                );
        }
        // #endregion 

        // #region Import public key from responder certificate
        sequence = sequence.then(
            function()
            {
                var publicKeyInfo_schema = certs[cert_index].subjectPublicKeyInfo.toSchema();
                var publicKeyInfo_buffer = publicKeyInfo_schema.toBER(false);
                var publicKeyInfo_view = new Uint8Array(publicKeyInfo_buffer);

                return crypto.importKey("spki", publicKeyInfo_view, { name: "RSASSA-PKCS1-v1_5", hash: { name: sha_algorithm } }, true, ["sign", "verify"]);
            }
            );
        // #endregion 

        // #region Verifying TBS part of BasicOCSPResponce
        sequence = sequence.then(
            function(publicKey)
            {
                return crypto.verify({ name: "RSASSA-PKCS1-v1_5", hash: { name: sha_algorithm } },
                    publicKey,
                    signature_view,
                    tbs_view);
            }
            );
        // #endregion 

        return sequence;
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.OCSP_BASIC_RESPONSE.prototype.sign =
    function(privateKey)
    {
        // #region Initial variables 
        var _this = this;
        // #endregion 

        // #region Get a private key from function parameter 
        if(typeof privateKey === "undefined")
            return new Promise(function(resolve, reject) { reject("Need to provide a private key for signing"); });
        // #endregion 

        // #region Find a correct hashing algorithm 
        var sha_algorithm = "";

        switch(this.signatureAlgorithm.algorithm_id)
        {
            case "1.2.840.113549.1.1.5":
                sha_algorithm = "sha-1";
                break;
            case "1.2.840.113549.1.1.11":
                sha_algorithm = "sha-256";
                break;
            case "1.2.840.113549.1.1.12":
                sha_algorithm = "sha-384";
                break;
            case "1.2.840.113549.1.1.13":
                sha_algorithm = "sha-512";
                break;
            default:
                return new Promise(function(resolve, reject) { reject("Unsupported signature algorithm: " + this.signature.signatureAlgorithm.algorithm_id); });
        };
        // #endregion 

        // #region Create TBS data for signing 
        _this.tbsResponseData.tbs = _this.tbsResponseData.toSchema(true).toBER(false);
        // #endregion 

        // #region Get a "crypto" extension 
        var crypto = in_window.org.pkijs.getCrypto();
        if(typeof crypto == "undefined")
            return new Promise(function(resolve, reject) { reject("Unable to create WebCrypto object"); });
        // #endregion 

        // #region Signing TBS data on provided private key 
        return crypto.sign({ name: privateKey.algorithm.name, hash: { name: sha_algorithm } },
            privateKey,
            new Uint8Array(_this.tbsResponseData.tbs)).then(
            function(result)
            {
                _this.signature = new in_window.org.pkijs.asn1.BITSTRING({ value_hex: result });
            },
            function(error)
            {
                return new Promise(function(resolve, reject) { reject("Signing error: " + error); });
            }
            );
        // #endregion 
    }
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "MessageImprint" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.tsp.MessageImprint =
    function()
    {
        // #region Internal properties of the object 
        this.hashAlgorithm = new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER();
        this.hashedMessage = new in_window.org.pkijs.asn1.OCTETSTRING();
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.tsp.MessageImprint.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.hashAlgorithm = arguments[0].hashAlgorithm || new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER();
                this.hashedMessage = arguments[0].hashedMessage || new in_window.org.pkijs.asn1.OCTETSTRING();
            }
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.tsp.MessageImprint.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.tsp.MessageImprint({
                names: {
                    hashAlgorithm: {
                        names: {
                            block_name: "hashAlgorithm"
                        }
                    },
                    hashedMessage: "hashedMessage"
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for MessageImprint");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.hashAlgorithm = new in_window.org.pkijs.simpl.ALGORITHM_IDENTIFIER({ schema: asn1.result["hashAlgorithm"] });
        this.hashedMessage = asn1.result["hashedMessage"];
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.tsp.MessageImprint.prototype.toSchema =
    function()
    {
        // #region Construct and return new ASN.1 schema for this object 
        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: [
                this.hashAlgorithm.toSchema(),
                this.hashedMessage
            ]
        }));
        // #endregion 
    }
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "TSP_REQUEST" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.TSP_REQUEST =
    function()
    {
        // #region Internal properties of the object 
        this.version = 0;
        this.messageImprint = new in_window.org.pkijs.simpl.tsp.MessageImprint();
        // OPTIONAL this.reqPolicy = "";
        // OPTIONAL this.nonce = new in_window.org.pkijs.asn1.INTEGER();
        // OPTIONAL this.certReq = -1; // In order to designate that no schema value stored
        // OPTIONAL this.extensions = new Array(); // Array of EXTENSION
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.TSP_REQUEST.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.version = arguments[0].version || 0;
                this.messageImprint = arguments[0].messageImprint || new in_window.org.pkijs.simpl.tsp.MessageImprint();
                if("reqPolicy" in arguments[0])
                    this.reqPolicy = arguments[0].reqPolicy;
                if("nonce" in arguments[0])
                    this.nonce = arguments[0].nonce;
                if("certReq" in arguments[0])
                    this.certReq = arguments[0].certReq;
                if("extensions" in arguments[0])
                    this.extensions = arguments[0].extensions; // Array of EXTENSION
            }
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.TSP_REQUEST.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.TSP_REQUEST()
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for TSP_REQUEST");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.version = asn1.result["TimeStampReq.version"].value_block.value_dec;
        this.messageImprint = new in_window.org.pkijs.simpl.tsp.MessageImprint({ schema: asn1.result["TimeStampReq.messageImprint"] });
        if("TimeStampReq.reqPolicy" in asn1.result)
            this.reqPolicy = asn1.result["TimeStampReq.reqPolicy"].value_block.toString();
        if("TimeStampReq.nonce" in asn1.result)
            this.nonce = asn1.result["TimeStampReq.nonce"];
        if("TimeStampReq.certReq" in asn1.result)
            this.certReq = asn1.result["TimeStampReq.certReq"].value_block.value;
        if("TimeStampReq.extensions" in asn1.result)
        {
            this.extensions = new Array();

            var extensions_array = asn1.result["TimeStampReq.extensions"];

            for(var i = 0; i < extensions_array.length; i++)
                this.extensions.push(new in_window.org.pkijs.simpl.EXTENSION({ schema: extensions_array[i] }));
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.TSP_REQUEST.prototype.toSchema =
    function()
    {
        // #region Create array for output sequence 
        var output_array = new Array();

        output_array.push(new in_window.org.pkijs.asn1.INTEGER({ value: this.version }));
        output_array.push(this.messageImprint.toSchema());
        if("reqPolicy" in this)
            output_array.push(new in_window.org.pkijs.asn1.OID({ value: this.reqPolicy }));
        if("nonce" in this)
            output_array.push(this.nonce);
        if("certReq" in this)
            output_array.push(new in_window.org.pkijs.asn1.BOOLEAN({ value: this.certReq }));

        // #region Create array of extensions 
        if("extensions" in this)
        {
            var extensions_array = new Array();

            for(var i = 0; i < this.extensions; i++)
                extensions_array.push(this.extensions[i].toSchema());

            output_array.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                optional: true,
                id_block_tag_class: 3, // CONTEXT-SPECIFIC
                id_block_tag_number: 0, // [0]
                value: extensions_array
            }));
        }
        // #endregion 
        // #endregion 

        // #region Construct and return new ASN.1 schema for this object 
        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: output_array
        }));
        // #endregion 
    }
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "Accuracy" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.tsp.Accuracy =
    function()
    {
        // #region Internal properties of the object 
        // OPTIONAL this.seconds = 0;
        // OPTIONAL this.millis = 0;
        // OPTIONAL this.micros = 0;
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.tsp.Accuracy.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                if("seconds" in arguments[0])
                    this.seconds = arguments[0].seconds;
                if("millis" in arguments[0])
                    this.millis = arguments[0].millis;
                if("micros" in arguments[0])
                    this.micros = arguments[0].micros;
            }
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.tsp.Accuracy.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.tsp.Accuracy({
                names: {
                    seconds: "seconds",
                    millis: "millis",
                    micros: "micros"
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for tsp.Accuracy");
        // #endregion 

        // #region Get internal properties from parsed schema 
        if("seconds" in asn1.result)
            this.seconds = asn1.result["seconds"].value_block.value_dec;
        if("millis" in asn1.result)
            this.millis = asn1.result["millis"].value_block.value_dec;
        if("micros" in asn1.result)
            this.micros = asn1.result["micros"].value_block.value_dec;
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.tsp.Accuracy.prototype.toSchema =
    function()
    {
        // #region Create array of output sequence 
        var output_array = new Array();

        if("seconds" in this)
            output_array.push(this.seconds);
        if("millis" in this)
            output_array.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                optional: true,
                id_block_tag_class: 3, // CONTEXT-SPECIFIC
                id_block_tag_number: 0, // [0]
                value: [new in_window.org.pkijs.asn1.INTEGER({ value: this.millis })]
            }));
        if("micros" in this)
            output_array.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                optional: true,
                id_block_tag_class: 3, // CONTEXT-SPECIFIC
                id_block_tag_number: 1, // [1]
                value: [new in_window.org.pkijs.asn1.INTEGER({ value: this.micros })]
            }));
        // #endregion 

        // #region Construct and return new ASN.1 schema for this object 
        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: output_array
        }));
        // #endregion 
    }
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "TST_INFO" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.TST_INFO =
    function()
    {
        // #region Internal properties of the object 
        this.version = 0;
        this.policy = "";
        this.messageImprint = new in_window.org.pkijs.simpl.tsp.MessageImprint();
        this.serialNumber = new in_window.org.pkijs.asn1.INTEGER();
        this.genTime = new Date(0, 0, 0);
        // OPTIONAL this.accuracy = new in_window.org.pkijs.simpl.tsp.Accuracy();
        // OPTIONAL this.ordering = -1; // In order to designate uninitialized value
        // OPTIONAL this.nonce = new in_window.org.pkijs.asn1.INTEGER();
        // OPTIONAL this.tsa = new in_window.org.pkijs.simpl.GENERAL_NAME();
        // OPTIONAL this.extensions = new Array(); // Array of EXTENSION
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.TST_INFO.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.version = arguments[0].version || 0;
                this.policy = arguments[0].policy || "";
                this.messageImprint = arguments[0].messageImprint || new in_window.org.pkijs.simpl.tsp.MessageImprint();
                this.serialNumber = arguments[0].serialNumber || new in_window.org.pkijs.asn1.INTEGER();
                this.genTime = arguments[0].genTime || new Date(0, 0, 0);
                if("accuracy" in arguments[0])
                    this.accuracy = arguments[0].accuracy;
                if("ordering" in arguments[0])
                    this.ordering = arguments[0].ordering; 
                if("nonce" in arguments[0])
                    this.nonce = arguments[0].nonce;
                if("tsa" in arguments[0])
                    this.tsa = arguments[0].tsa;
                if("extensions" in arguments[0])
                    this.extensions = arguments[0].extensions; // Array of EXTENSION
            }
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.TST_INFO.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.TST_INFO()
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for TST_INFO");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.version = asn1.result["TSTInfo.version"].value_block.value_dec;
        this.policy = asn1.result["TSTInfo.policy"].value_block.toString();
        this.messageImprint = new in_window.org.pkijs.simpl.tsp.MessageImprint({ schema: asn1.result["TSTInfo.messageImprint"] });
        this.serialNumber = asn1.result["TSTInfo.serialNumber"];
        this.genTime = asn1.result["TSTInfo.genTime"].toDate();
        if("TSTInfo.accuracy" in asn1.result)
            this.accuracy = new in_window.org.pkijs.simpl.tsp.Accuracy({ schema: asn1.result["TSTInfo.accuracy"] });
        if("TSTInfo.ordering" in asn1.result)
            this.ordering = asn1.result["TSTInfo.ordering"].value_block.value;
        if("TSTInfo.nonce" in asn1.result)
            this.nonce = asn1.result["TSTInfo.nonce"];
        if("TSTInfo.tsa" in asn1.result)
            this.tsa = new in_window.org.pkijs.simpl.GENERAL_NAME({ schema: asn1.result["TSTInfo.tsa"] });
        if("TSTInfo.extensions" in asn1.result)
        {
            var extensions_array = asn1.result["TSTInfo.extensions"];

            for(var i = 0; i < extensions_array.length; i++)
                this.extensions.push(new in_window.org.pkijs.simpl.EXTENSION({ schema: extensions_array[i] }));
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.TST_INFO.prototype.toSchema =
    function()
    {
        // #region Create array for output sequence 
        var output_array = new Array();

        output_array.push(new in_window.org.pkijs.asn1.INTEGER({ value: this.version }));
        output_array.push(new in_window.org.pkijs.asn1.OID({ value: this.policy }));
        output_array.push(this.messageImprint.toSchema());
        output_array.push(this.serialNumber);
        output_array.push(new in_window.org.pkijs.asn1.GENERALIZEDTIME({ value_date: this.genTime }));
        if("accuracy" in this)
            output_array.push(this.accuracy.toSchema());
        if("ordering" in this)
            output_array.push(new in_window.org.pkijs.asn1.BOOLEAN({ value: this.ordering }));
        if("nonce" in this)
            output_array.push(this.nonce);
        if("tsa" in this)
            output_array.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                optional: true,
                id_block_tag_class: 3, // CONTEXT-SPECIFIC
                id_block_tag_number: 0, // [0]
                value: [this.tsa.toSchema()]
            }));

        // #region Create array of extensions 
        if("extensions" in this)
        {
            var extensions_array = new Array();

            for(var i = 0; i < this.extensions; i++)
                extensions_array.push(this.extensions[i].toSchema());

            output_array.push(new in_window.org.pkijs.asn1.ASN1_CONSTRUCTED({
                optional: true,
                id_block_tag_class: 3, // CONTEXT-SPECIFIC
                id_block_tag_number: 1, // [1]
                value: extensions_array
            }));
        }
        // #endregion 
        // #endregion   

        // #region Construct and return new ASN.1 schema for this object 
        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: output_array
        }));
        // #endregion 
    }
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "PKIStatusInfo" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.tsp.PKIStatusInfo =
    function()
    {
        // #region Internal properties of the object 
        this.status = new in_window.org.pkijs.asn1.INTEGER();
        // OPTIONAL this.statusStrings = new Array(); // Array of UTF8STRING
        // OPTIONAL this.failInfo = new in_window.org.pkijs.asn1.BITSTRING();
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.tsp.PKIStatusInfo.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.status = arguments[0].status || new in_window.org.pkijs.asn1.INTEGER();
                if("statusStrings" in arguments[0])
                    this.statusStrings = arguments[0].statusStrings; // Array of UTF8STRING
                if("failInfo" in arguments[0])
                    this.failInfo = arguments[0].failInfo;
            }
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.tsp.PKIStatusInfo.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.tsp.PKIStatusInfo({
                names: {
                    status: "status",
                    statusStrings: "statusStrings",
                    failInfo: "failInfo"
                }
            })
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for PKIStatusInfo");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.status = asn1.result["status"];
        if("statusStrings" in asn1.result)
            this.statusStrings = asn1.result["statusStrings"];
        if("failInfo" in asn1.result)
            this.failInfo = asn1.result["failInfo"];
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.tsp.PKIStatusInfo.prototype.toSchema =
    function()
    {
        // #region Create array of output sequence 
        var output_array = new Array();

        output_array.push(this.status);
        if("statusStrings" in this)
            output_array.push(new in_window.org.pkijs.asn1.SEQUENCE({
                optional: true,
                value: this.statusStrings
            }));
        if("failInfo" in this)
            output_array.push(this.failInfo);
        // #endregion 

        // #region Construct and return new ASN.1 schema for this object 
        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: output_array
        }));
        // #endregion 
    }
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
    // #region Simplified structure for "TSP_RESPONSE" type
    //**************************************************************************************
    in_window.org.pkijs.simpl.TSP_RESPONSE =
    function()
    {
        // #region Internal properties of the object 
        this.status = new in_window.org.pkijs.simpl.tsp.PKIStatusInfo();
        // OPTIONAL this.timeStampToken = new in_window.org.pkijs.simpl.CMS_CONTENT_INFO();
        // #endregion 

        // #region If input argument array contains "schema" for this object 
        if((arguments[0] instanceof Object) && ("schema" in arguments[0]))
            in_window.org.pkijs.simpl.TSP_RESPONSE.prototype.fromSchema.call(this, arguments[0].schema);
        // #endregion 
        // #region If input argument array contains "native" values for internal properties 
        else
        {
            if(arguments[0] instanceof Object)
            {
                this.status = arguments[0].status || new in_window.org.pkijs.simpl.tsp.PKIStatusInfo();
                if("timeStampToken" in arguments[0])
                    this.timeStampToken = arguments[0].timeStampToken;
            }
        }
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.TSP_RESPONSE.prototype.fromSchema =
    function(schema)
    {
        // #region Check the schema is valid 
        var asn1 = in_window.org.pkijs.compareSchema(schema,
            schema,
            in_window.org.pkijs.schema.TSP_RESPONSE()
            );

        if(asn1.verified === false)
            throw new Error("Object's schema was not verified against input data for TSP_RESPONSE");
        // #endregion 

        // #region Get internal properties from parsed schema 
        this.status = new in_window.org.pkijs.simpl.tsp.PKIStatusInfo({ schema: asn1.result["TimeStampResp.status"] });
        if("TimeStampResp.timeStampToken" in asn1.result)
            this.timeStampToken = new in_window.org.pkijs.simpl.CMS_CONTENT_INFO({ schema: asn1.result["TimeStampResp.timeStampToken"] });
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.TSP_RESPONSE.prototype.toSchema =
    function()
    {
        // #region Create array for output sequence 
        var output_array = new Array();

        output_array.push(this.status.toSchema());
        if("timeStampToken" in this)
            output_array.push(this.timeStampToken.toSchema());
        // #endregion 

        // #region Construct and return new ASN.1 schema for this object 
        return (new in_window.org.pkijs.asn1.SEQUENCE({
            value: output_array
        }));
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.TSP_RESPONSE.prototype.verify =
    function()
    {
        /// <summary>!!! Works well in Chrome dev versions only (April 2014th) !!!</summary>
        /// <returns type="Promise">Returns a new Promise object (in case of error), or a result of "crypto.subtle.veryfy" function</returns>

        // #region Check that "timeStampToken" exists
        if(("timeStampToken" in this) === false)
            return new Promise(function(resolve, reject) { reject("timeStampToken is absent in TSP response"); });
        // #endregion 

        // #region Check that "timeStampToken" has a right internal format 
        if(this.timeStampToken.contentType !== "1.2.840.113549.1.7.2") // Must be a CMS signed data
            return new Promise(function(resolve, reject) { reject("Wrong format of timeStampToken: " + this.timeStampToken.contentType); });
        // #endregion 

        // #region Verify internal signed data value 
        var signed_simp = new in_window.org.pkijs.simpl.CMS_SIGNED_DATA({ schema: this.timeStampToken.content });

        return signed_simp.verify({ signer: 0 });
        // #endregion 
    }
    //**************************************************************************************
    in_window.org.pkijs.simpl.TSP_RESPONSE.prototype.sign =
    function(privateKey)
    {
        /// <param name="privateKey" type="Key">Private key for "subjectPublicKeyInfo" structure</param>

        // #region Check that "timeStampToken" exists
        if(("timeStampToken" in this) === false)
            return new Promise(function(resolve, reject) { reject("timeStampToken is absent in TSP response"); });
        // #endregion 

        // #region Check that "timeStampToken" has a right internal format 
        if(this.timeStampToken.contentType !== "1.2.840.113549.1.7.2") // Must be a CMS signed data
            return new Promise(function(resolve, reject) { reject("Wrong format of timeStampToken: " + this.timeStampToken.contentType); });
        // #endregion 

        // #region Sign internal signed data value 
        var signed_simp = new in_window.org.pkijs.simpl.CMS_SIGNED_DATA({ schema: this.timeStampToken.content });

        return signed_simp.sign(privateKey, 0);
        // #endregion 
    }
    //**************************************************************************************
    // #endregion 
    //**************************************************************************************
}
)(typeof exports !== "undefined" ? exports : window);