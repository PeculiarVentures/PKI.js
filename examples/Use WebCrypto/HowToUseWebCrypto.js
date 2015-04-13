/*
 * Copyright (c) 2014, GMO GlobalSign
 * Copyright (c) 2015, Peculiar Ventures
 * All rights reserved.
 *
 * Author 2014-2015, Yury Strozhevsky <www.strozhevsky.com>.
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
function test_web_crypto()
{
    var publicKey = {};
    var privateKey = {};

    var value_hex = new ArrayBuffer(6);
    var value_hex_view = new Uint8Array(value_hex);
    value_hex_view[0] = 0x06;
    value_hex_view[1] = 0x05;
    value_hex_view[2] = 0x04;
    value_hex_view[3] = 0x03;
    value_hex_view[4] = 0x02;
    value_hex_view[5] = 0x01;

    // #region Get a "crypto" extension 
    if(typeof window.crypto == "undefined")
    {
        alert("No WebCrypto extension found");
        return;
    }
    if(typeof window.crypto.subtle == "undefined")
    {
        alert("No WebCrypto extension found");
        return;
    }
    var crypto = window.crypto.subtle;
    // #endregion 

    crypto.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([0x01, 0x00, 0x01]), hash: { name: "sha-1" } },
                        true,
                        ["sign", "verify"]).
    then(
    function(result) // result of generating key pair
    {
        publicKey = result.publicKey;
        privateKey = result.privateKey;

        return crypto.exportKey("spki", publicKey);
    },
    function(error)
    {
        console.log("ERROR #1: " + error);
    }
    ).
    then(
    function(result) // result of exporting public key
    {
        return crypto.importKey("spki", new Uint8Array(result), { name: "RSASSA-PKCS1-v1_5", hash: { name: "sha-1" } }, true, ["verify"]);
    },
    function(error)
    {
        console.log("ERROR #2: " + error);
    }
    ).
    then(
    function(result) // result of importing public key
    {
        publicKey = result;
        return crypto.exportKey("pkcs8", privateKey);
    },
    function(error)
    {
        console.log("ERROR #3: " + error);
    }
    ).
    then(
    function(result) // result of exporting private key
    {
        return crypto.importKey("pkcs8", new Uint8Array(result), { name: "RSASSA-PKCS1-v1_5", hash: { name: "sha-1" } }, true, ["sign"]);
    },
    function(error)
    {
        console.log("ERROR #4: " + error);
    }
    ).
    then(
    function(result) // result of importing private key
    {
        privateKey = result;
        return crypto.sign({ name: "RSASSA-PKCS1-v1_5", hash: { name: "sha-512" } }, result, value_hex_view);
    },
    function(error)
    {
        console.log("ERROR #5: " + error);
    }
    ).
    then(
    function(result) // result of signing test data
    {
        return crypto.verify({ name: "RSASSA-PKCS1-v1_5", hash: { name: "sha-512" } }, publicKey, new Uint8Array(result), value_hex_view);
    },
    function(error)
    {
        console.log("ERROR #6: " + error);
    }
    ).
    then(
    function(result) // result of verifying test signature
    {
        alert("Message verified: " + result);
    },
    function(error)
    {
        console.log("ERROR #7: " + error);
    }
    );
}
