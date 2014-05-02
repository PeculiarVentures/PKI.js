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

    crypto.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([0x01, 0x00, 0x01]), hash: { name: "sha-1" }},
                        true,
                        ["encrypt", "decrypt", "sign", "verify"]).
    then(
    function(result) // result of generating key pair
    {
        publicKey = result.publicKey;
        privateKey = result.privateKey;

        return crypto.exportKey("spki", publicKey);
    }).
    then(
    function(result) // result of exporting public key
    {
        return crypto.importKey("spki", new Uint8Array(result), { name: "RSASSA-PKCS1-v1_5", hash: { name: "sha-1" } }, true, ["sign", "verify"]);
    }
    ).
    then(
    function(result) // result of importing public key
    {
        publicKey = result;
        return crypto.exportKey("pkcs8", privateKey);
    }
    ).
    then(
    function(result) // result of exporting private key
    {
        return crypto.importKey("pkcs8", new Uint8Array(result), { name: "RSASSA-PKCS1-v1_5", hash: { name: "sha-1" } }, true, ["sign", "verify"]);
    }
    ).
    then(
    function(result) // result of importing private key
    {
        privateKey = result;
        return crypto.sign({ name: "RSASSA-PKCS1-v1_5", hash: { name: "sha-512" } }, result, value_hex_view);
    }
    ).
    then(
    function(result) // result of signing test data
    {
        return crypto.verify({ name: "RSASSA-PKCS1-v1_5", hash: { name: "sha-512" } }, publicKey, new Uint8Array(result), value_hex_view);
    }
    ).
    then(
    function(result) // result of verifying test signature
    {
        alert("Message verified: " + result);
    }
    );
}
