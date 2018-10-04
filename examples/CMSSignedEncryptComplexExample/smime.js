var smimehandler = new SMIMEHandler(false); // true/false protect private key.
/* Initial variables */
smimehandler.newcert.dc = [
	'com',
	'example',
	'www'
];
smimehandler.newcert.uid = 'user1';
smimehandler.newcert.co = 'US'; // Country Code, Origin
smimehandler.newcert.cn = 'Example Certificate';
/* START OPTIONAL FIELDS */
smimehandler.newcert.o  = 'OrgName'; /* Organization */
smimehandler.newcert.ou = 'OrgUnit'; /* Organizational Unit */
smimehandler.newcert.pc = '55555'; /* Postal Code */
smimehandler.newcert.st = 'SomeStateProv'; /* State full spelling */
smimehandler.newcert.l  = 'Locality'; /* Locality */
smimehandler.newcert.street = 
	'5555 Street Address'; /* Street/Top address line*/
smimehandler.newcert.po  = '5555'; /* PO Box */
smimehandler.newcert.tel = '+1 555 555 5555'; /* Telephone Number E.123 */
smimehandler.newcert.title = 'CEO'; /* Title */
smimehandler.newcert.gn = 'John'; /* Given Name */
smimehandler.newcert.i = 'J'; /* Initial */
smimehandler.newcert.sn = 'Doe'; /* Surname */
/* END OPTIONAL FIELDS */
smimehandler.newcert.notbefore = new Date;
smimehandler.newcert.notafter  = new Date ('2019-01-01T00:00:00');
smimehandler.newcert.altnames  = new Array;
smimehandler.newcert.altnames  = [
	'127.0.0.1',
	'::1',
	'user1@localhost',
	'localhost'
];

smimehandler.senderaddr = 'user1@localhost';
smimehandler.recipientaddr = 'user1@localhost';
smimehandler.msgsubject = 'Example SMIME/CMS Email';

var document = window.document;

var cbobj       = new Object;
cbobj.successcb = function () {};
cbobj.failurecb = function () {};
cbobj.errorcb   = function () {};
cbobj.error     = new String;

/* Begin bind DOM elements to variables */
var createselfbutton   = document.getElementById ('createselfbutton' );
var createcsrbutton    = document.getElementById ('createcsrbutton'  );
var new_signed_data    = document.getElementById ('new_signed_data'  );
var importbutton       = document.getElementById ('importbutton'     );
var encryptbutton      = document.getElementById ('encryptbutton'    );
var decryptbutton      = document.getElementById ('decryptbutton'    );
var signbutton         = document.getElementById ('signbutton'       );
var verifysignedbutton = document.getElementById ('verifysignedbutton');
var verifycertbutton   = document.getElementById ('verifycertbutton' );
var recipcertbox       = document.getElementById ('recipcertbox'     );
var cert_data          = document.getElementById ('cert_data'        );
var pkcs8_key          = document.getElementById ('pkcs8_key'        );
var input_text         = document.getElementById ('input_text'       );
var encryptedbox       = document.getElementById ('encrypted_content');
var decryptedbox       = document.getElementById ('decrypted_content');
var parsebutton        = document.getElementById ('parsebutton'      );
var extractbox         = document.getElementById ('extractbox'       );
var input_file         = document.getElementById ('input_file'       );
var parsing_file       = document.getElementById ('parsing_file'     );
var ca_bundle          = document.getElementById ('ca_bundle'        );
var inter_certs        = document.getElementById ('inter_certs'      );
var trusted_certtext   = document.getElementById ('trusted_certtext' );
var pkcs12_file        = document.getElementById ('pkcs12_file'      );
var exppkcs12_file     = document.getElementById ('exppkcs12_file'   );
var password           = document.getElementById ('password'         );
var cmsdgstalgos       = document.getElementById ('cms-dgst-algos'   );
var divtable           = document.getElementById ('divtable'         );
var divtablemsgcerts   = document.getElementById ('divtablemsgcerts' );
/* End bind DOM elements to variables */

/* Begin callback declarations */
smimehandler.createcertcb = function ()
{
	cert_data.value = smimehandler.certs;
}

smimehandler.createcsrcb = function ()
{
	cert_data.value = smimehandler.csr;
}

smimehandler.nocryptocb = function ()
{
	alert('No WebCrypto extension found');
}

smimehandler.certgenerror = function ()
{
	alert('Error during key generation: ' + smimehandler.error);
}

smimehandler.csrgenerrorcb = function ()
{
	alert('Error during key generation: ' + smimehandler.error);
}

smimehandler.pubkeyexprterrorcb = function ()
{
	alert('Error during exporting public key: ' + smimehandler.error);
}

smimehandler.certcreatedcb = function ()
{
	alert('Certificate created successfully!');
}

smimehandler.selfsignfailcb = function ()
{
	alert('Error during signing: ' + smimehandler.error);
}

smimehandler.csrsignfailcb = function ()
{
	alert('Error during signing: ' + smimehandler.error);
}

smimehandler.privatekeyexportcb = function () {
	alert('Private key exported successfully!');
	if ( !smimehandler.unprotkey.length ) {
	     pkcs8_key.value = 'Private key is protected; Cannot display.';
	} else {
	    pkcs8_key.value = smimehandler.unprotkey;
	}
}

smimehandler.privatekeyexportfailcb = function () {
	alert('Error during exporting of private key: ' + smimehandler.error);
}

smimehandler.keyimportfailcb = function () {
	alert('Error importing private key: ' + smimehandler.error);
}

smimehandler.keyimportedcb = function () {
	smimehandler.createCMSSigned();
}
smimehandler.parsepkcs12cb = function () {
	alert('PKCS12 key imported.');
	cert_data.value = smimehandler.certs;
	divtable.appendChild (
	    certtable (
	        smimehandler.parsedcerts
	    )
	);
	if ( !smimehandler.unprotkey.length ) {
	     pkcs8_key.value = 'Private key is protected; Cannot display.';
	} else {
	    pkcs8_key.value = smimehandler.unprotkey;
	}
}
smimehandler.exportpkcs12cb = function (pkcs12AsBlob) {
	dlblob (pkcs12AsBlob);
}
smimehandler.signedcb = function () {
	alert('CMS Signed Data created successfully!');
	new_signed_data.value = smimehandler.new_signed_data;
}

smimehandler.encryptnorecipientcb = function () {
	alert ('Recipient no recipient certificate specified.');
}

smimehandler.recipientcertbadformatcb = function () {
	alert ('Recipient certificate is not in valid PEM format.');
}

smimehandler.encryptedcb = function (val) {
	if (val == true) {
	    encryptedbox.value = smimehandler.encrypted;
	    alert('Encryption process finished successfully');
	} else {
	    alert(
	        'ERROR DURING ENCRYPTION PROCESS: '
	        + smimehandler.error
	    );
	}
}

smimehandler.decryptparserrorcb = function () {
	alert (
	    'Unable to parse your data. '
	    + 'Please check you have '
	    + '\"Content-Type: charset=binary\"'
	    + ' in your S/MIME message'
	);
}

smimehandler.decryptedcb = function (val) {
	if (val == true) {
	    decryptedbox.value = smimehandler.decrypted;
	} else {
	    alert('ERROR DURING DECRYPTION PROCESS: ' + smimehandler.error);
	}
}
var verifysigcb = function (result) {
	alert ('Verification result: ' + result);
}
var errorverifysigcb = function (result) {
	alert ('Error while verifying signature: ' + result);
}
smimehandler.certvcb = function (result, message) {
	if (message) {
	    alert ('Verification result: '
	        + result
	        + message
	    );
	} else {
	    alert ('Verification result: ' + result);
	}
}
/* End callback declarations */

/* Begin onchange / button use event function declarations */
input_file.onchange = function () {
	cbobj = smimehandler;
	handleFileBrowse (input_file.files, cbobj);
}
parsing_file.onchange = function () {
	handleParsingFile (parsing_file.files);
}
cabundleerrorcb = function () { 
	    alert ('Error parsing CA file: ' + cbobj.error);
}
ca_bundle.onchange = function () {
	cbobj.errorcb = cabundleerrorcb;
	handleCABundle (ca_bundle.files, cbobj);
}
inter_certs.onchange = function () {
	handleInterCertsFile (inter_certs.files);
}
trusted_certtext.onchange = function () {
	handleTrustedCertsText (trusted_certtext.value);
}
importbutton.onclick = function () {
	smimehandler.certs = cert_data.value;
	smimehandler.keytoimport = pkcs8_key.value;
	smimehandler.importCerts();
}
createselfbutton.onclick = smimehandler.createCertificate;
createcsrbutton.onclick = smimehandler.createPKCS10;
signbutton.onclick = function () {
	var dataBuffer;
	var header =
	'Content-Type: text/plain\r\n\r\n';
	const tempReader = new FileReader();
	smimehandler.keyimportedcb = function () {
	    dataBuffer = tempReader.result;
	    smimehandler.createCMSSigned(dataBuffer);
	}
	var textBlob = new Blob (
	    [header + input_text.value],
	    { type: 'text/plain' }
	);
	
	tempReader.onloadend = function () {
	    dataBuffer = tempReader.result;
	    smimehandler.importKey();
	}
	
	tempReader.readAsArrayBuffer(textBlob);
}
encryptbutton.onclick = function () {
	smimehandler.recipcert = new String (recipcertbox.value);
	smimehandler.recipcert = smimehandler.recipcert.toString();
//	messagebox = null;
	smimehandler.smimeEncrypt ();
}
decryptbutton.onclick = function () {
	smimehandler.encrypted = new String (encryptedbox.value);
	smimehandler.encrypted = smimehandler.encrypted.toString();
	smimehandler.smimeDecrypt ();
}
var parsecomplcb = function (cbobj) {
	var contreader = new FileReader;
	if (cbobj.contentdecoded.type == 'text/plain') {
	    contreader.onloadend = function () {
	        extractbox.value
	            = contreader.result;
	    }
	    contreader.readAsText (cbobj.contentdecoded);
	}
	var c = 0;
	while (c < cbobj.digalgs.length) {
	    cmsdgstalgos.appendChild (
	        document.createElement('li').appendChild (
	            document.createTextNode (
	                cbobj.digalgs
	            )
	        )
	    );
	    c++;
	}
	divtablemsgcerts.appendChild (
	    certtable (
	        cbobj.parsedcerts,
	        cbobj.messageinfo.signerindex
	    )
	);
}
verifysignedbutton.onclick = function () {
	verifyCMSSigned (verifysigcb, errorverifysigcb);
}
verifycertbutton.onclick =  function () {
	verifyCertificate(smimehandler.certvcb);
}
parsebutton.onclick = function () {
	cbobj.success = parsecomplcb;
	var tmpcmssignedtext = new String (
	    decryptedbox.value
	);
	const cmssignedtext  = tmpcmssignedtext.toString();
	/*
	placeholder
	const clearcmssignedtext = cmssignedtext.replace(
	    /(-----(BEGIN|END) CMS-----|\n)/g,
	    ''
	);
	const CMSSignedData = stringToArrayBuffer(
	    window.atob(clearcmssignedtext)
	);
	cbobj.cmsSignedBuffer = CMSSignedData;
	*/
	cbobj.cmsSignedBuffer = cmssignedtext;
	parseCMSSigned (cbobj);
}

pkcs12_file.onchange = function () {
	const tempReader = new FileReader();
	const currentFiles = pkcs12_file.files;
	
	// noinspection AnonymousFunctionJS
	tempReader.onload =
	    event =>
	    {
	        // noinspection JSUnresolvedVariable
	        smimehandler.parsePKCS12 (
	            event.target.result,
	            password.value
	        );
	    };
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
exppkcs12_file.onclick = function () {
	smimehandler.exportOpenSSLLike (password.value);
}
/* End onchange / button click event function declarations */
