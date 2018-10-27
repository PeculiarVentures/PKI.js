let smimehandler = new SMIMEHandler(false); // true/false protect private key.
/* Initial variables */
smimehandler.newcert.dc = [
    "com",
    "example",
    "www"
];
smimehandler.newcert.uid = "user1";
smimehandler.newcert.co = "US"; // Country Code, Origin
smimehandler.newcert.cn = "Example Certificate";
/* START OPTIONAL FIELDS */
smimehandler.newcert.o = "OrgName"; /* Organization */
smimehandler.newcert.ou = "OrgUnit"; /* Organizational Unit */
smimehandler.newcert.pc = "55555"; /* Postal Code */
smimehandler.newcert.st = "SomeStateProv"; /* State full spelling */
smimehandler.newcert.l = "Locality"; /* Locality */
smimehandler.newcert.street =
        "5555 Street Address"; /* Street/Top address line*/
smimehandler.newcert.po = "5555"; /* PO Box */
smimehandler.newcert.tel = "+1 555 555 5555"; /* Telephone Number E.123 */
smimehandler.newcert.title = "CEO"; /* Title */
smimehandler.newcert.gn = "John"; /* Given Name */
smimehandler.newcert.i = "J"; /* Initial */
smimehandler.newcert.sn = "Doe"; /* Surname */
/* END OPTIONAL FIELDS */
smimehandler.newcert.notbefore = new Date();
smimehandler.newcert.notafter = new Date("2019-01-01T00:00:00");
smimehandler.newcert.altnames = [];
smimehandler.newcert.altnames = [
    "127.0.0.1",
    "::1",
    "user1@localhost",
    "localhost"
];

smimehandler.senderaddr = "user1@localhost";
smimehandler.recipientaddr = "user1@localhost";
smimehandler.msgsubject = "Example SMIME/CMS Email";

// let document = window.document;

let cbobj = {};
cbobj.successcb = function () {
    "use strict";
    return null;
};
cbobj.failurecb = function () {
    "use strict";
    return null;
};
cbobj.errorcb = function () {
    "use strict";
    return null;
};
cbobj.error = "";

/* Begin bind DOM elements to variables */
let createselfbutton = document.getElementById("createselfbutton");
let createcsrbutton = document.getElementById("createcsrbutton");
let new_signed_data = document.getElementById("new_signed_data");
let importbutton = document.getElementById("importbutton");
let encryptbutton = document.getElementById("encryptbutton");
let decryptbutton = document.getElementById("decryptbutton");
let signbutton = document.getElementById("signbutton");
let verifysignedbutton = document.getElementById("verifysignedbutton");
let verifycertbutton = document.getElementById("verifycertbutton");
let recipcertbox = document.getElementById("recipcertbox");
let cert_data = document.getElementById("cert_data");
let pkcs8_key = document.getElementById("pkcs8_key");
let input_text = document.getElementById("input_text");
let encryptedbox = document.getElementById("encrypted_content");
let decryptedbox = document.getElementById("decrypted_content");
let parsebutton = document.getElementById("parsebutton");
let extractbox = document.getElementById("extractbox");
let input_file = document.getElementById("input_file");
let parsing_file = document.getElementById("parsing_file");
let ca_bundle = document.getElementById("ca_bundle");
let inter_certs = document.getElementById("inter_certs");
let trusted_certtext = document.getElementById("trusted_certtext");
let pkcs12_file = document.getElementById("pkcs12_file");
let exppkcs12_file = document.getElementById("exppkcs12_file");
let password = document.getElementById("password");
let cmsdgstalgos = document.getElementById("cms-dgst-algos");
let divtable = document.getElementById("divtable");
let divtablemsgcerts = document.getElementById("divtablemsgcerts");
/* End bind DOM elements to variables */

/* Begin callback declarations */
let nullfunction = function () {
    return null;
};

smimehandler.createcertcb = function () {
    "use strict";
    cert_data.value = smimehandler.certs;
};

smimehandler.createcsrcb = function () {
    "use strict";
    cert_data.value = smimehandler.csr;
};

smimehandler.nocryptocb = function () {
    "use strict";
    alert("No WebCrypto extension found");
};

smimehandler.certgenerror = function () {
    "use strict";
    alert("Error during key generation: " + smimehandler.error);
};

smimehandler.csrgenerrorcb = function () {
    "use strict";
    alert("Error during key generation: " + smimehandler.error);
};

smimehandler.pubkeyexprterrorcb = function () {
    "use strict";
    alert("Error during exporting public key: " + smimehandler.error);
};

smimehandler.certcreatedcb = function () {
    "use strict";
    alert("Certificate created successfully!");
};

smimehandler.selfsignfailcb = function () {
    "use strict";
    alert("Error during signing: " + smimehandler.error);
};

smimehandler.csrsignfailcb = function () {
    "use strict";
    alert("Error during signing: " + smimehandler.error);
};

smimehandler.privatekeyexportcb = function () {
    "use strict";
    alert("Private key exported successfully!");
    if (!smimehandler.unprotkey.length) {
        pkcs8_key.value = "Private key is protected; Cannot display.";
    } else {
        pkcs8_key.value = smimehandler.unprotkey;
    }
};

smimehandler.privatekeyexportfailcb = function () {
    "use strict";
    alert("Error during exporting of private key: " + smimehandler.error);
};

smimehandler.keyimportfailcb = function () {
    "use strict";
    alert("Error importing private key: " + smimehandler.error);
};

let importkey = function () {
    alert ("Key has been imported.");
};

smimehandler.keyimportedcb = function () {
    "use strict";
    alert("Key imported successfully");
};
smimehandler.parsepkcs12cb = function () {
    "use strict";
    alert("PKCS12 key imported.");
    cert_data.value = smimehandler.certs;
    divtable.appendChild(
        certtable(
            smimehandler.parsedcerts
        )
    );
    if (!smimehandler.unprotkey.length) {
        pkcs8_key.value = "Private key is protected; Cannot display.";
    } else {
        pkcs8_key.value = smimehandler.unprotkey;
    }
};
smimehandler.exportpkcs12cb = function (pkcs12AsBlob) {
    "use strict";
    dlblob(pkcs12AsBlob);
};
smimehandler.signedcb = function () {
    "use strict";
    alert("CMS Signed Data created successfully!");
    new_signed_data.value = smimehandler.new_signed_data;
};

smimehandler.encryptnorecipientcb = function () {
    "use strict";
    alert("Recipient no recipient certificate specified.");
};

smimehandler.recipientcertbadformatcb = function () {
    "use strict";
    alert("Recipient certificate is not in valid PEM format.");
};

smimehandler.encryptedcb = function (val) {
    "use strict";
    if (val === true) {
        encryptedbox.value = smimehandler.encrypted;
        alert("Encryption process finished successfully");
    } else {
        alert(
            "ERROR DURING ENCRYPTION PROCESS: "
            + smimehandler.error
        );
    }
};

smimehandler.decryptparserrorcb = function () {
    "use strict";
    alert(
        "Unable to parse your data. "
        + "Please check you have "
        + "\"Content-Type: charset=binary\""
        + " in your S/MIME message"
    );
};

smimehandler.decryptedcb = function (val) {
    "use strict";
    if (val === true) {
        decryptedbox.value = smimehandler.decrypted;
    } else {
        alert("ERROR DURING DECRYPTION PROCESS: " + smimehandler.error);
    }
};
let verifysigcb = function (result) {
    "use strict";
    alert("Verification result: " + result);
};
let errorverifysigcb = function (result) {
    "use strict";
    alert("Error while verifying signature: " + result);
};
smimehandler.certvcb = function (result, message) {
    "use strict";
    if (message) {
        alert("Verification result: "
                + result
                + message);
    } else {
        alert("Verification result: " + result);
    }
};
/* End callback declarations */

/* Begin onchange / button use event function declarations */
input_file.onchange = function () {
    "use strict";
    cbobj = smimehandler;
    handleFileBrowse(input_file.files, cbobj);
};
parsing_file.onchange = function () {
    "use strict";
    handleParsingFile(parsing_file.files);
};
let cabundleerrorcb = function () {
    "use strict";
    alert("Error parsing CA file: " + cbobj.error);
};
ca_bundle.onchange = function () {
    "use strict";
    cbobj.errorcb = cabundleerrorcb;
    handleCABundle(ca_bundle.files, cbobj);
};
inter_certs.onchange = function () {
    "use strict";
    handleInterCertsFile(inter_certs.files);
};
trusted_certtext.onchange = function () {
    "use strict";
    handleTrustedCertsText(trusted_certtext.value);
};
importbutton.onclick = function () {
    "use strict";
    smimehandler.certs = cert_data.value;
    smimehandler.keytoimport = pkcs8_key.value;
    smimehandler.importKey();
    smimehandler.importCerts();
};
createselfbutton.onclick = smimehandler.createCertificate;
createcsrbutton.onclick = smimehandler.createPKCS10;
signbutton.onclick = function () {
    "use strict";
    let dataB;
    let header =
            "Content-Type: text/plain\r\n\r\n";
    const tempReader = new FileReader();
    smimehandler.keyimportedcb = function () {
        smimehandler.createCMSSigned(dataB);
    };
    let textBlob = new Blob(
        [header + input_text.value],
        {type: "text/plain"}
    );

    tempReader.onloadend = function () {
        dataB = tempReader.result;
        smimehandler.importKey();
    };

    tempReader.readAsArrayBuffer(textBlob);
};
encryptbutton.onclick = function () {
    "use strict";
    smimehandler.recipcert = String(recipcertbox.value);
    smimehandler.datatoencrypt = new_signed_data.value;
//  messagebox = null;
    smimehandler.smimeEncrypt();
};
decryptbutton.onclick = function () {
    "use strict";
    smimehandler.encrypted = String(encryptedbox.value);
    smimehandler.smimeDecrypt();
};
let parsecomplcb = function (cbobj) {
    "use strict";
    let contreader = new FileReader();
    if (cbobj.contentdecoded.type === "text/plain") {
        contreader.onloadend = function () {
            extractbox.value
                    = contreader.result;
        };
        contreader.readAsText(cbobj.contentdecoded);
    }
    let c = 0;
    while (c < cbobj.digalgs.length) {
        cmsdgstalgos.appendChild(
            document.createElement("li").appendChild(
                document.createTextNode(
                    cbobj.digalgs
                )
            )
        );
        c += 1;
    }
    divtablemsgcerts.appendChild(
        certtable(
            cbobj.parsedcerts,
            cbobj.messageinfo.signerindex
        )
    );
};
verifysignedbutton.onclick = function () {
    "use strict";
    verifyCMSSigned(verifysigcb, errorverifysigcb);
};
verifycertbutton.onclick = function () {
    "use strict";
    verifyCertificate(smimehandler.certvcb);
};
parsebutton.onclick = function () {
    "use strict";
    cbobj.success = parsecomplcb;
    let tmpcmssignedtext = String(
        decryptedbox.value
    );
    const cmssignedtext = tmpcmssignedtext;
    /*
    placeholder
    const clearcmssignedtext = cmssignedtext.replace(
        /(-----(BEGIN|END) CMS-----|\n)/g,
        ""
    );
    const CMSSignedData = stringToArrayBuffer(
        window.atob(clearcmssignedtext)
    );
    cbobj.cmsSignedBuffer = CMSSignedData;
    */
    cbobj.cmsSignedBuffer = cmssignedtext;
    parseCMSSigned(cbobj);
};

pkcs12_file.onchange = function () {
    "use strict";
    const tempReader = new FileReader();
    const currentFiles = pkcs12_file.files;

    // noinspection AnonymousFunctionJS
    tempReader.onload =
            function (event) {
            // noinspection JSUnresolvedVariable
        smimehandler.parsePKCS12(
            event.target.result,
            password.value
        );
    };
    tempReader.readAsArrayBuffer(currentFiles[0]);
};
exppkcs12_file.onclick = function () {
    "use strict";
    smimehandler.exportOpenSSLLike(password.value);
};
/* End onchange / button click event function declarations */
