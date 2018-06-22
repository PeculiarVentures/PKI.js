var smimehandler = new SMIMEHandler(false); // true/false protect private key.

smimehandler.cn = 'Example Certificate';

var createbutton    = document.getElementById ('createbutton'     );
var new_signed_data = document.getElementById ('new_signed_data'  );
var importbutton    = document.getElementById ('importbutton'     );
var encryptbutton   = document.getElementById ('encryptbutton'    );
var decryptbutton   = document.getElementById ('decryptbutton'    );
var signbutton      = document.getElementById ('signbutton'       );
var recipcertbox    = document.getElementById ('recipcertbox'     );
var cert_data       = document.getElementById ('cert_data'        );
var pkcs8_key       = document.getElementById ('pkcs8_key'        );
var input_text      = document.getElementById ('input_text'       );
var encryptedbox    = document.getElementById ('encrypted_content');
var decryptedbox    = document.getElementById ('decrypted_content');
var parsebutton     = document.getElementById ('parsebutton'      );
var extractbox      = document.getElementById ('extractbox'       );
smimehandler.createcertcb = function () {
	cert_data.value = smimehandler.cert;
	if ( !smimehandler.unprotkey.length ) {
	     pkcs8_key.value = 'Private key is protected; Cannot display.';
	} else {
	    pkcs8_key.value = smimehandler.unprotkey;
	}
}
smimehandler.signedcb = function () {
	new_signed_data.value = smimehandler.new_signed_data;
};
smimehandler.encryptedcb = function () {
	encryptedbox.value = smimehandler.encrypted;
}
smimehandler.decryptedcb = function () {
	decryptedbox.value = smimehandler.decrypted;
}
importbutton.onclick = function () {
	smimehandler.cert = cert_data.value;
	smimehandler.keytoimport = pkcs8_key.value;
}
createbutton.onclick = smimehandler.createCertificate;
signbutton.onclick = function () {
	var textBlob = new Blob([input_text.value], { type: 'text/plain' });
	const tempReader = new FileReader();
	
	// noinspection AnonymousFunctionJS
	tempReader.addEventListener('loadend', function () {
			// noinspection JSUnresolvedVariable
			dataBuffer = tempReader.result;
			smimehandler.dataBuffer = dataBuffer;
			smimehandler.importKey(smimehandler.createCMSSigned, null);
			// smimehandler.createCMSSigned();
	});
	
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
//	encryptedbox = null;
	smimehandler.smimeDecrypt ();
}
var parsecomplcb = function () {
	extractbox.value = new String (messagedecoded).toString();
}
parsebutton.onclick = function () {
	// Needs work.
	const cmssignedtext      = new String (decryptedbox.value).toString();
	const clearcmssignedtext = cmssignedtext.replace(/(-----(BEGIN|END) CMS-----|\n)/g, "");
	CMSSignedData = stringToArrayBuffer(window.atob(clearcmssignedtext));
	cmsSignedBuffer = CMSSignedData;
	parseCMSSigned (parsecomplcb, null);
}
