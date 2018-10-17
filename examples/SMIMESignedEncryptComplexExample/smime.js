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
    return null;
};
cbobj.failurecb = function () {
    return null;
};
cbobj.errorcb = function () {
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
smimehandler.createcertcb = function () {
    cert_data.value = smimehandler.certs;
};

smimehandler.createcsrcb = function () {
    cert_data.value = smimehandler.csr;
};

smimehandler.nocryptocb = function () {
    alert("No WebCrypto extension found");
};

smimehandler.certgenerror = function () {
    alert("Error during key generation: " + smimehandler.error);
};

smimehandler.csrgenerrorcb = function () {
    alert("Error during key generation: " + smimehandler.error);
};

smimehandler.pubkeyexprterrorcb = function () {
    alert("Error during exporting public key: " + smimehandler.error);
};

smimehandler.certcreatedcb = function () {
    alert("Certificate created successfully!");
};

smimehandler.selfsignfailcb = function () {
    alert("Error during signing: " + smimehandler.error);
};

smimehandler.csrsignfailcb = function () {
    alert("Error during signing: " + smimehandler.error);
};

smimehandler.privatekeyexportcb = function () {
    alert("Private key exported successfully!");
    if (!smimehandler.unprotkey.length) {
        pkcs8_key.value = "Private key is protected; Cannot display.";
    } else {
        pkcs8_key.value = smimehandler.unprotkey;
    }
};

smimehandler.privatekeyexportfailcb = function () {
    alert("Error during exporting of private key: " + smimehandler.error);
};

smimehandler.keyimportfailcb = function () {
    alert("Error importing private key: " + smimehandler.error);
};

smimehandler.keyimportedcb = function () {
    smimehandler.createCMSSigned();
};
smimehandler.parsepkcs12cb = function () {
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
    dlblob(pkcs12AsBlob);
};
smimehandler.signedcb = function () {
    alert("CMS Signed Data created successfully!");
    new_signed_data.value = smimehandler.new_signed_data;
};

smimehandler.encryptnorecipientcb = function () {
    alert("Recipient no recipient certificate specified.");
};

smimehandler.recipientcertbadformatcb = function () {
    alert("Recipient certificate is not in valid PEM format.");
};

smimehandler.encryptedcb = function (val) {
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
    alert(
        "Unable to parse your data. "
        + "Please check you have "
        + "\"Content-Type: charset=binary\""
        + " in your S/MIME message"
    );
};

smimehandler.decryptedcb = function (val) {
    if (val === true) {
        decryptedbox.value = smimehandler.decrypted;
    } else {
        alert("ERROR DURING DECRYPTION PROCESS: " + smimehandler.error);
    }
};
let verifysigcb = function (result) {
    alert("Verification result: " + result);
};
let errorverifysigcb = function (result) {
    alert("Error while verifying signature: " + result);
};
smimehandler.certvcb = function (result, message) {
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
    cbobj = smimehandler;
    handleFileBrowse(input_file.files, cbobj);
};
parsing_file.onchange = function () {
    handleParsingFile(parsing_file.files);
};
let cabundleerrorcb = function () {
    alert("Error parsing CA file: " + cbobj.error);
};
ca_bundle.onchange = function () {
    cbobj.errorcb = cabundleerrorcb;
    handleCABundle(ca_bundle.files, cbobj);
};
inter_certs.onchange = function () {
    handleInterCertsFile(inter_certs.files);
};
trusted_certtext.onchange = function () {
    handleTrustedCertsText(trusted_certtext.value);
};
importbutton.onclick = function () {
    smimehandler.certs = cert_data.value;
    smimehandler.keytoimport = pkcs8_key.value;
    smimehandler.importCerts();
};
createselfbutton.onclick = smimehandler.createCertificate;
createcsrbutton.onclick = smimehandler.createPKCS10;
signbutton.onclick = function () {
    let header =
            "Content-Type: text/plain\r\n\r\n";
    const tempReader = new FileReader();
    smimehandler.keyimportedcb = function () {
        dataBuffer = tempReader.result;
        smimehandler.createCMSSigned(dataBuffer);
    };
    let textBlob = new Blob(
        [header + input_text.value],
        {type: "text/plain"}
    );

    tempReader.onloadend = function () {
        dataBuffer = tempReader.result;
        smimehandler.importKey();
    };

    tempReader.readAsArrayBuffer(textBlob);
};
encryptbutton.onclick = function () {
    smimehandler.recipcert = String(recipcertbox.value);
//  messagebox = null;
    smimehandler.smimeEncrypt();
};
decryptbutton.onclick = function () {
    smimehandler.encrypted = String(encryptedbox.value);
    smimehandler.smimeDecrypt();
};
let parsecomplcb = function (cbobj) {
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
    verifyCMSSigned(verifysigcb, errorverifysigcb);
};
verifycertbutton.onclick = function () {
    verifyCertificate(smimehandler.certvcb);
};
parsebutton.onclick = function () {
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
    smimehandler.exportOpenSSLLike(password.value);
};
/* End onchange / button click event function declarations */
