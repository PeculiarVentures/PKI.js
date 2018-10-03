/* eslint-disable no-undef,no-unreachable,no-unused-vars */
import * as asn1js from "asn1js";
import {
	arrayBufferToString,
	stringToArrayBuffer,
	bufferToHexCodes,
	fromBase64,
	toBase64
} from "pvutils";
import { getCrypto, getAlgorithmParameters, getRandomValues, setEngine } from "../../src/common";
import Certificate from "../../src/Certificate";
import EnvelopedData from "../../src/EnvelopedData";
import ContentInfo from "../../src/ContentInfo";
import AttributeTypeAndValue from "../../src/AttributeTypeAndValue";
import RSAPublicKey from "../../src/RSAPublicKey.js";
import CertificateChainValidationEngine from "../../src/CertificateChainValidationEngine.js";
import CertificateRevocationList from "../../src/CertificateRevocationList.js";
import BasicConstraints from "../../src/BasicConstraints";
import Extension from "../../src/Extension";

import MimeNode from "emailjs-mime-builder";
import parse from "emailjs-mime-parser";
//*********************************************************************************
import Attribute from "../../src/Attribute";
import SignedData from "../../src/SignedData";
import EncapsulatedContentInfo from "../../src/EncapsulatedContentInfo";
import SignerInfo from "../../src/SignerInfo";
import IssuerAndSerialNumber from "../../src/IssuerAndSerialNumber";
import SignedAndUnsignedAttributes from "../../src/SignedAndUnsignedAttributes";
import ExtKeyUsage from "../../src/ExtKeyUsage.js";
//*********************************************************************************
import CertificationRequest from "../../src/CertificationRequest.js";
import Extensions from "../../src/Extensions.js";
import GeneralNames from "../../src/GeneralNames.js";
import GeneralName from "../../src/GeneralName.js";
//*********************************************************************************
import AltName from "../../src/AltName.js";
//*********************************************************************************
import AuthenticatedSafe from "../../src/AuthenticatedSafe";
import SafeContents from "../../src/SafeContents";
import SafeBag from "../../src/SafeBag";
import CertBag from "../../src/CertBag";
import PFX from "../../src/PFX";
import PKCS8ShroudedKeyBag from "../../src/PKCS8ShroudedKeyBag";
import PrivateKeyInfo from "../../src/PrivateKeyInfo";
//*********************************************************************************
//<nodewebcryptoossl>
let certificateBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CERT 
let pkcs10Buffer = new ArrayBuffer(0); // CSR ArrayBuffer
const trustedCertificates = []; // Array of root certificates from "CA Bundle"

const intermadiateCertificates = []; // Array of intermediate certificates
const crls = []; // Array of CRLs for all certificates (trusted + intermediate)
let hashAlg = "SHA-1";
let signAlg = "RSASSA-PKCS1-v1_5";
let oaepHashAlg = "SHA-1";
let cmsSignedBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CMS_Signed
let cmsSigners = new Array;
let parsedCMSContentSimpl = null;
// let privateKeyBuffer = new ArrayBuffer(0);
let dataBuffer = new ArrayBuffer(0);
let addExt = false;
let detachedSignature = false;

const encAlg = {
	name: "AES-CBC",
	length: 128
};
//*********************************************************************************
//region Auxiliary functions 
//*********************************************************************************
function formatPEM(pemString)
{
	const stringLength = pemString.length;
	let resultString = "";
	
	for(let i = 0, count = 0; i < stringLength; i++, count++)
	{
		if(count > 63)
		{
			resultString = `${resultString}\r\n`;
			count = 0;
		}
		
		resultString = `${resultString}${pemString[i]}`;
	}
	
	return resultString;
}
var PEMtoCertArray = function (pemcerts) {
	pemcerts = pemcerts.replace (/\r/g, '');
	pemcerts = pemcerts.replace (/\n/g, '');
	let certpemreg = new RegExp(
	    '(-----(BEGIN|END)( NEW)? CERTIFICATE-----|\n)',
	    'g'
	);
	let certat = pemcerts.replace (
	    certpemreg,
	    '@'
	);
	certat = certat.replace (/ /g, '');
	let certsplit = certat.split ('@');
	let certsBASE64 = new Array;
	let i = 0;
	while (i < certsplit.length) {
	    if (certsplit[i].length != 0) {
	        certsBASE64.push (
	            certsplit[i]
	        );
	    }
	    i++;
	}
	i = 0;
	let certSimpl = new Array;
	while (i < certsBASE64.length) {
	    let asn1 = asn1js.fromBER(
	        stringToArrayBuffer (
	            window.atob (
	                certsBASE64[i]
	            )
	         )
	    );
	    certSimpl.push (new Certificate({ schema: asn1.result }));
	    i++;
	}
	return certSimpl;
}

var certBufftoPEM = function (certBuff) {
// Takes a single asn.1 object certificate, or an array of
// asn1 object certs.
	var i = 0;
	var pemcert = '';
	if (Array.isArray (certBuff)) {
	    while (i < certBuff.length) {
	        pemcert += "-----BEGIN CERTIFICATE-----\r\n"
	            + formatPEM(window.btoa(arrayBufferToString(certBuff[i])))
	            + "\r\n-----END CERTIFICATE-----\r\n";
	        i++;
	    }
	} else {
	    pemcert = "-----BEGIN CERTIFICATE-----\r\n"
	        + formatPEM(window.btoa(arrayBufferToString(certBuff)))
	        + "\r\n-----END CERTIFICATE-----\r\n";
	}
	return pemcert;
}

var PEMtoKey = function (PEMkey) {
	let keypemreg = new RegExp(
	    '(-----(BEGIN|END)( NEW)? PRIVATE KEY-----|\n)',
	    'g'
	);
	let privateKeyBASE64 = PEMkey.replace (
	    keypemreg,
	    ''
	);
	privateKeyBASE64 = privateKeyBASE64.replace (
	    /\n/g,
	    ''
	);
	privateKeyBASE64 = privateKeyBASE64.replace (
	    / /g,
	    ''
	);
	let asn1 = asn1js.fromBER (
	    stringToArrayBuffer (
	        window.atob (
	            privateKeyBASE64
	        )
	    )
	);
	return new PrivateKeyInfo({ schema: asn1.result });
}
var keyBufftoPEM = function (keyBuff) {
	var pemkey = "-----BEGIN PRIVATE KEY-----\r\n"
	    + formatPEM(window.btoa(arrayBufferToString(keyBuff)))
	    + "\r\n-----END PRIVATE KEY-----\r\n";
	return pemkey;
}
//*********************************************************************************
//endregion
//*********************************************************************************
//region SMIME Object  
//*********************************************************************************
// noinspection FunctionWithInconsistentReturnsJS
function SMIMEHandler (varprotkey) {
	var that = this;
	var protkey = new Boolean (varprotkey);
	var key = new String;
	var objectCerts = null;
	var objectPrivateKey = null;
	var certSimpl = new Array;
	var pkcs8Simpl = null;
	this.newcert = new Object;
	this.error = new String;
	this.keytoimport = null;
	this.unprotkey = new String;
	this.newcert.co = new String;
	this.newcert.cn = new String;
	this.notbefore = new Date;
	this.notafter  = new Date;
	this.certs = new String;
	this.recipcert = new String;
	this.dataBuffer = new ArrayBuffer(0);
	this.createcertcb = function () {};
	this.nocryptocb = function () {};
	this.certgenerror = function () {};
	this.certcreatedcb = function () {};
	this.selfsignfailcb = function () {};
	this.privatekeyexportcb = function () {};
	this.privatekeyexportfailcb = function () {};
	this.encryptnorecipientcb = function () {};
	this.parsepkcs12cb = function () {};
	this.parsepkcs12failcb = function () {};
	this.recipientcertbadformatcb = function () {};
	this.new_signed_data = new String;
	this.signedcb = function () {};
	this.encrypted = new String;
	this.decryptparserrorcb = function () {};
	this.decrypted = new String;
	this.encryptedcb = function () {};
	this.decryptedcb = function () {};
	this.parseCAformaterrorcb = function () {};
//*********************************************************************************
//region Create CERT  
//*********************************************************************************
// noinspection FunctionWithInconsistentReturnsJS
this.createCertificate = function ()
{
	// Check to make sure needed variables are set.

	if ((typeof that.newcert.co !== 'string' 
	    && !(that.newcert.co instanceof String))
	    || that.newcert.co.length == 0) {
	    that.error = 'CO not correctly set.';
	    that.certgenerror ();
	    return;
	}
	if ((typeof that.newcert.cn !== 'string' 
	    && !(that.newcert.cn instanceof String))
	    || that.newcert.cn.length == 0) {
	    that.error = 'CN not correctly set.';
	    that.certgenerror ();
	    return;
	}
	if (!that.newcert.notbefore instanceof Date) {
	    that.error = 'NotBefore not correctly set.';
	    that.certgenerror ();
	    return;
	}
	if (!that.newcert.notafter instanceof Date) {
	    that.error = 'NotAfter not correctly set.';
	    that.certgenerror ();
	    return;
	}
	if (that.newcert.notafter.getTime()
	    < that.newcert.notbefore.getTime()) {
	    that.error = 'NotAfter is before NotBefore.';
	    that.certgenerror ();
	    return;
	}

	//region Initial variables
	let sequence = Promise.resolve();
	
	const certificate = new Certificate();
	
	let publicKey;
	let privateKey;
	//endregion
	
	//region Get a "crypto" extension
	const crypto = getCrypto();
	if(typeof crypto === "undefined")
	{
		that.nocryptocb(); 
		return;
	}
	//endregion
	
	//region Put a static values
	certificate.version = 2;
	certificate.serialNumber = new asn1js.Integer({ value: 1 });

	if (that.newcert.dc instanceof Array) {
	    var c3 = 0;
	    while (c3 < that.newcert.dc.length) {
	        certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
	            type: "0.9.2342.19200300.100.1.25",
	            value: new asn1js.PrintableString({ value: that.newcert.dc[c3] })
	        }));
	        c3++;
	    }
	}

	if ((typeof that.newcert.uid == 'string' 
	    || (that.newcert.uid instanceof String))
	    && that.newcert.uid.length != 0) {
	    certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
	        type: "0.9.2342.19200300.100.1.1", // UID 
	        value: new asn1js.PrintableString({ value: that.newcert.uid })
	    }));
	}

	certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.6", // Country Origin
		value: new asn1js.PrintableString({ value: that.newcert.co })
	}));

	if ((typeof that.newcert.o == 'string' 
	    || (that.newcert.o instanceof String))
	    && that.newcert.o.length != 0) {
	    certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.10", // Organization
	        value: new asn1js.PrintableString({ value: that.newcert.o })
	    }));
	}

	if ((typeof that.newcert.ou == 'string' 
	    || (that.newcert.ou instanceof String))
	    && that.newcert.ou.length != 0) {
	    certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.11", // Organizational Unit
	        value: new asn1js.PrintableString({ value: that.newcert.ou })
	    }));
	}

	if ((typeof that.newcert.pc == 'string' 
	    || (that.newcert.pc instanceof String))
	    && that.newcert.pc.length != 0) {
	    certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.17", // Postal Code 
	        value: new asn1js.PrintableString({ value: that.newcert.pc })
	    }));
	}

	if ((typeof that.newcert.st == 'string' 
	    || (that.newcert.st instanceof String))
	    && that.newcert.st.length != 0) {
	    certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.8", // State/Province not abreviated.
	        value: new asn1js.PrintableString({ value: that.newcert.st })
	    }));
	}

	if ((typeof that.newcert.l == 'string' 
	    || (that.newcert.l instanceof String))
	    && that.newcert.l.length != 0) {
	    certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.7", // Locality
	        value: new asn1js.PrintableString({ value: that.newcert.l })
	    }));
	}

	if ((typeof that.newcert.street == 'string' 
	    || (that.newcert.street instanceof String))
	    && that.newcert.street.length != 0) {
	    certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.9", // Street
	        value: new asn1js.PrintableString({ value: that.newcert.street })
	    }));
	}

	if ((typeof that.newcert.po == 'string' 
	    || (that.newcert.po instanceof String))
	    && that.newcert.po.length != 0) {
	    certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.18", // PO Box 
	        value: new asn1js.PrintableString({ value: that.newcert.po })
	    }));
	}

	if ((typeof that.newcert.tel == 'string' 
	    || (that.newcert.tel instanceof String))
	    && that.newcert.tel.length != 0) {
	        if (!that.newcert.tel.match(
	            /^\+\d{1,3} \d\d\d \d\d\d \d\d\d\d$/
	        )) {
	            that.error = 'Telephone number is invalid';
	            that.certgenerror ();
	            return;
	        }
	    certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.20", // Telephone Number
	        // CCITT Rec. E.123 international format
	        value: new asn1js.PrintableString({ value: that.newcert.tel })
	    }));
	}

	if ((typeof that.newcert.title == 'string' 
	    || (that.newcert.title instanceof String))
	    && that.newcert.title.length != 0) {
	    certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.12", // Title
	        value: new asn1js.PrintableString({ value: that.newcert.title })
	    }));
	}

	if ((typeof that.newcert.gn == 'string' 
	    || (that.newcert.gn instanceof String))
	    && that.newcert.gn.length != 0) {
	    certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.42", // Given Name
	        value: new asn1js.PrintableString({ value: that.newcert.gn })
	    }));
	}

	if ((typeof that.newcert.i == 'string' 
	    || (that.newcert.i instanceof String))
	    && that.newcert.i.length != 0) {
	    certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.43", // Initials
	        value: new asn1js.PrintableString({ value: that.newcert.i })
	    }));
	}

	if ((typeof that.newcert.sn == 'string' 
	    || (that.newcert.sn instanceof String))
	    && that.newcert.sn.length != 0) {
	    certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.4", // Surname
	        value: new asn1js.PrintableString({ value: that.newcert.sn })
	    }));
	}


	certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.3", // Common Name
		value: new asn1js.Utf8String({ value: that.newcert.cn })
	}));

	if (that.newcert.dc instanceof Array) {
	    var c3 = 0;
	    while (c3 < that.newcert.dc.length) {
	        certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
	            type: "0.9.2342.19200300.100.1.25",
	            // Domain Component
	            value: new asn1js.PrintableString({ value: that.newcert.dc[c3] })
	        }));
	        c3++;
	    }
	}

	if ((typeof that.newcert.uid == 'string' 
	    || (that.newcert.uid instanceof String))
	    && that.newcert.uid.length != 0) {
	    certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "0.9.2342.19200300.100.1.1", // UID 
	        value: new asn1js.PrintableString({ value: that.newcert.uid })
	    }));
	}

	certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.6", // Country Origin
		value: new asn1js.PrintableString({ value: that.newcert.co })
	}));

	if ((typeof that.newcert.o == 'string' 
	    || (that.newcert.o instanceof String))
	    && that.newcert.o.length != 0) {
	    certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.10", // Organization
	        value: new asn1js.PrintableString({ value: that.newcert.o })
	    }));
	}

	if ((typeof that.newcert.ou == 'string' 
	    || (that.newcert.ou instanceof String))
	    && that.newcert.ou.length != 0) {
	    certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.11", // Organizational Unit
	        value: new asn1js.PrintableString({ value: that.newcert.ou })
	    }));
	}

	if ((typeof that.newcert.pc == 'string' 
	    || (that.newcert.pc instanceof String))
	    && that.newcert.pc.length != 0) {
	    certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.17", // Postal Code 
	        value: new asn1js.PrintableString({ value: that.newcert.pc })
	    }));
	}

	if ((typeof that.newcert.st == 'string' 
	    || (that.newcert.st instanceof String))
	    && that.newcert.st.length != 0) {
	    certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.8", // State/Province not abreviated.
	        value: new asn1js.PrintableString({ value: that.newcert.st })
	    }));
	}

	if ((typeof that.newcert.l == 'string' 
	    || (that.newcert.l instanceof String))
	    && that.newcert.l.length != 0) {
	    certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.7", // Locality
	        value: new asn1js.PrintableString({ value: that.newcert.l })
	    }));
	}

	if ((typeof that.newcert.street == 'string' 
	    || (that.newcert.street instanceof String))
	    && that.newcert.street.length != 0) {
	    certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.9", // Street
	        value: new asn1js.PrintableString({ value: that.newcert.street })
	    }));
	}

	if ((typeof that.newcert.po == 'string' 
	    || (that.newcert.po instanceof String))
	    && that.newcert.po.length != 0) {
	    certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.18", // PO Box 
	        value: new asn1js.PrintableString({ value: that.newcert.po })
	    }));
	}

	if ((typeof that.newcert.tel == 'string' 
	    || (that.newcert.tel instanceof String))
	    && that.newcert.tel.length != 0) {
	        if (!that.newcert.tel.match(
	            /^\+\d{1,3} \d\d\d \d\d\d \d\d\d\d$/
	        )) {
	            that.error = 'Telephone number is invalid';
	            that.certgenerror ();
	            return;
	        }
	    certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.20", // Telephone Number
	        // CCITT Rec. E.123 international format
	        value: new asn1js.PrintableString({ value: that.newcert.tel })
	    }));
	}

	if ((typeof that.newcert.title == 'string' 
	    || (that.newcert.title instanceof String))
	    && that.newcert.title.length != 0) {
	    certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.12", // Title
	        value: new asn1js.PrintableString({ value: that.newcert.title })
	    }));
	}

	if ((typeof that.newcert.gn == 'string' 
	    || (that.newcert.gn instanceof String))
	    && that.newcert.gn.length != 0) {
	    certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.42", // Given Name
	        value: new asn1js.PrintableString({ value: that.newcert.gn })
	    }));
	}

	if ((typeof that.newcert.i == 'string' 
	    || (that.newcert.i instanceof String))
	    && that.newcert.i.length != 0) {
	    certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.43", // Initials
	        value: new asn1js.PrintableString({ value: that.newcert.i })
	    }));
	}

	if ((typeof that.newcert.sn == 'string' 
	    || (that.newcert.sn instanceof String))
	    && that.newcert.sn.length != 0) {
	    certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.4", // Surname
	        value: new asn1js.PrintableString({ value: that.newcert.sn })
	    }));
	}

	certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.3", // Common Name
		value: new asn1js.Utf8String({ value: that.newcert.cn })
	}));


	
	certificate.notBefore.value = that.newcert.notbefore;
	certificate.notAfter.value = that.newcert.notafter;
	
	certificate.extensions = []; // Extensions are not a part of certificate by default, it"s an optional array
	
	//region "BasicConstraints" extension
	const basicConstr = new BasicConstraints({
		cA: true,
		pathLenConstraint: 3
	});
	
	certificate.extensions.push(new Extension({
		extnID: "2.5.29.19",
		critical: false,
		extnValue: basicConstr.toSchema().toBER(false),
		parsedValue: basicConstr // Parsed value for well-known extensions
	}));
	//endregion
	
	//region "KeyUsage" extension
	const bitArray = new ArrayBuffer(1);
	const bitView = new Uint8Array(bitArray);
	
	bitView[0] |= 0x80; // Key usage "digitalSignature" flag
	bitView[0] |= 0x20; // Key usage "dataEncipherment" flag
	// bitView[0] |= 0x40; // Key usage "contentCommitment" flag
	bitView[0] |= 0x10; // Key usage "keyEncipherment" flag
	bitView[0] |= 0x08; // Key usage "keyAgreement" flag
	bitView[0] |= 0x04; // Key usage "keyCertSign" flag
	bitView[0] |= 0x02; // Key usage "cRLSign" flag
	
	const keyUsage = new asn1js.BitString({ valueHex: bitArray });
	
	certificate.extensions.push(new Extension({
		extnID: "2.5.29.15",
		critical: false,
		extnValue: keyUsage.toBER(false),
		parsedValue: keyUsage // Parsed value for well-known extensions
	}));
	//endregion
	//region "ExtendedKeyUsage" extension
	const extKeyUsage = new ExtKeyUsage({
	    keyPurposes: [
	    // "2.5.29.37.0",       // anyExtendedKeyUsage
	    // "1.3.6.1.5.5.7.3.1", // id-kp-serverAuth
	    "1.3.6.1.5.5.7.3.2", // id-kp-clientAuth
	    "1.3.6.1.5.5.7.3.3", // id-kp-codeSigning
	    "1.3.6.1.5.5.7.3.4", // id-kp-emailProtection
	    // "1.3.6.1.5.5.7.3.5", // id-kp-ipsecEndSystem
	    // "1.3.6.1.5.5.7.3.6", // id-kp-ipsecTunnel
	    // "1.3.6.1.5.5.7.3.7", // id-kp-ipsecUser
	    // "1.3.6.1.5.5.7.3.8", // id-kp-timeStamping
	    // "1.3.6.1.5.5.7.3.9", // id-kp-OCSPSigning
	    '1.3.6.1.5.5.7.3.19', // WiFi Certificate
	    // "1.3.6.1.4.1.311.10.3.1", // Microsoft Certificate Trust
	                              // List signing
	    // "1.3.6.1.4.1.311.10.3.4",  // Microsoft Encrypted File
	                              // System
	    ]
	});
 
	certificate.extensions.push(new Extension({
	    extnID: "2.5.29.37",
	    critical: false,
	    extnValue: extKeyUsage.toSchema().toBER(false),
	    parsedValue: extKeyUsage // Parsed value for well-known
	                             // extensions
	}));
	//endregion
	//endregion
	
	//region Create a new key pair
	sequence = sequence.then(() =>
	{
		//region Get default algorithm parameters for key generation
		const algorithm = getAlgorithmParameters(signAlg, "generatekey");
		if("hash" in algorithm.algorithm)
			algorithm.algorithm.hash.name = hashAlg;
		//endregion
		
		return crypto.generateKey(algorithm.algorithm, true, algorithm.usages);
	});
	//endregion
	
	//region Store new key in an interim variables
	sequence = sequence.then(keyPair =>
	{
		publicKey = keyPair.publicKey;
		privateKey = keyPair.privateKey;
	}, error =>
	{
		that.error = error;
		that.certgenerror();
	});
	//endregion
	
	//region AltSubject fields.
	var alt_names = that.newcert.altnames;
	var temp_altnames = new Array;
	var c = 0;
	var alttype = 0;
	var newalt = new String;
	var ipf = new Array;
	var ipv4addrregexp = new RegExp (
	    '^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$'
	);
	var ipv6addrregexp = new RegExp (
	    '^([0-9A-Fa-f]{0,4}:){2,7}([0-9A-Fa-f]{1,4}$|((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\\.|$)){4})$'
	);
	while (c < alt_names.length) {
	    if (alt_names[c].match(/@/g)) {
	        alttype = 1; // rfc822Name
	    } else if (
	        alt_names[c].match(
	            ipv4addrregexp
	        )
	        || alt_names[c].match(
	            ipv6addrregexp
	        )
	    ) {
	        alttype = 7; // IP address
	    } else {
	        alttype = 2; // Domain name
	    }
	    if (alttype == 7) {
	        // Test for IP address type
		if (
	            alt_names[c].match(
	                ipv4addrregexp
	           )
	        ) {
	            // IPv4 address
	            var ipf = alt_names[c].split('.');
	            var ipuint = new Uint8Array
	            ([
	                parseInt(ipf[0]),
	                parseInt(ipf[1]),
	                parseInt(ipf[2]),
	                parseInt(ipf[3])
	            ]).buffer;
	        } else {
	            // IPv6 address
	            var ipv6delim = new RegExp(':', 'g');
	            var ip6l = alt_names[c].replace (
	                ipv6delim,
	                ''
	            );
	            var ip6l = ip6l.length;
	            var c5 = 0;
	            var mis0 = 32 - ip6l;
	            var zeros = '';
	            while (c5 < mis0) {
	                zeros = zeros + '0';
	                c5++;
	            }
	            var ipv6fstr = alt_names[c].replace (
	                '::',
	                zeros
	            );
	            ipv6fstr = ipv6fstr.replace (
	                ipv6delim,
	                ''
	            );
	            var ipoctarr = new Array;
	            c5 = 0;
	            var c6 = 2;
	            while (c6 < 33) {
	                ipoctarr.push (
	                    parseInt (
	                        ipv6fstr.slice (c5, c6),
	                        16
	                    )
	                );
	                c5 = c5 + 2;
	                c6 = c6 + 2;
	            }
	            var ipuint = new Uint8Array (
	                ipoctarr
	            );
	        }
		newalt = new GeneralName({
		    type: alttype,
	            value: new asn1js.OctetString ({ 
	                valueHex: ipuint
	            })
		});
	    } else {
	        newalt = new GeneralName({
	            type: alttype, // rfc822Name
	            value: alt_names[c]
	        });
	    }
	    temp_altnames.push (newalt);
	    c++;
	}
	
	const altNames = new GeneralNames({
		names: temp_altnames
	});
	//endregion
	
	//region Exporting public key into "subjectPublicKeyInfo" value of certificate
	sequence = sequence.then(() =>
		certificate.subjectPublicKeyInfo.importKey(publicKey)
	);
	//endregion
	//region SubjectKeyIdentifier
	sequence = sequence.then(() => crypto.digest({ name: "SHA-1" }, certificate.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex))
	    .then(result =>
	    {
	        certificate.extensions.push(
	            new Extension({
	                extnID: "2.5.29.14",
	                critical: false,
	                extnValue: (new asn1js.OctetString({ valueHex: result })).toBER(false)
	            })
	        );
	        certificate.extensions.push(
	            new Extension({
	                extnID: "2.5.29.17",
	                critical: false,
	                extnValue: altNames.toSchema().toBER(false)
	            })
	        );
	    }
	);
	//endregion
	
	//region Signing final certificate
	sequence = sequence.then(() =>
		certificate.sign(privateKey, hashAlg),
	error =>
	{
		that.error = error;
		that.pubkeyexprterrorcb();
	});
	//endregion
	
	//region Encode and store certificate
	sequence = sequence.then(() =>
	{
		certificateBuffer = certificate.toSchema(true).toBER(false);
		
		const certificateString = String.fromCharCode.apply(null, new Uint8Array(certificateBuffer));
		
		let resultString = "-----BEGIN CERTIFICATE-----\r\n";
		resultString = `${resultString}${formatPEM(window.btoa(certificateString))}`;
		resultString = `${resultString}\r\n-----END CERTIFICATE-----\r\n`;
		
		// noinspection InnerHTMLJS
		// document.getElementById("new_signed_data").value = resultString;
		certSimpl.push(certificate);
		that.certs = resultString;
		
		that.certcreatedcb();
	}, error =>
	{
		that.selfsignfailcb();
		that.error = error;
	});
	//endregion
	
	//region Exporting private key
	sequence = sequence.then(() =>
		crypto.exportKey("pkcs8", privateKey)
	);
	//endregion
	
	//region Store exported key on Web page
	sequence = sequence.then(result =>
	{
		// noinspection JSCheckFunctionSignatures
		const privateKeyString = String.fromCharCode.apply(null, new Uint8Array(result));
		
		let resultString = "";
		
		resultString = `${resultString}-----BEGIN PRIVATE KEY-----\r\n`;
		resultString = `${resultString}${formatPEM(window.btoa(privateKeyString))}`;
		resultString = `${resultString}\r\n-----END PRIVATE KEY-----\r\n`;
		
		// noinspection InnerHTMLJS
		// document.getElementById("pkcs8_key").value = resultString;
	        if (protkey == true)
		    key = resultString;
	        else
	            that.unprotkey = resultString;
		
		var parsedcerts =  new Array;
		var cbobj2  = new Object;
		cbobj2.cert = certificate;
                let pcert = parseCert (cbobj2);
                parsedcerts.push (pcert);

		that.parsedcerts = parsedcerts;

		that.privatekeyexportcb();
		that.createcertcb();
	}, error =>
	{
		that.error = error;
		that.privatekeyexportfailcb();
	});
	//endregion
	
	return sequence;
}
//*********************************************************************************
//endregion
//*********************************************************************************
//region Create PKCS#10
//*********************************************************************************
this.createPKCS10 = function ()
{
// noinspection FunctionWithInconsistentReturnsJS
	if ((typeof that.newcert.co !== 'string' 
	    && !(that.newcert.co instanceof String))
	    || that.newcert.co.length == 0) {
	    that.error = 'CO not correctly set.';
	    that.certgenerror ();
	    return;
	}
	if ((typeof that.newcert.cn !== 'string' 
	    && !(that.newcert.cn instanceof String))
	    || that.newcert.cn.length == 0) {
	    that.error = 'CN not correctly set.';
	    that.certgenerror ();
	    return;
	}

	//region Initial variables
	let sequence = Promise.resolve();
	
	
	const pkcs10 = new CertificationRequest();
	
	let publicKey;
	let privateKey;
	//endregion
	
	//region Get a "crypto" extension
	const crypto = getCrypto();
	if(typeof crypto === "undefined")
	{
		that.nocryptocb(); 
		return;
	}
	//endregion
	
	//region Put a static values
	pkcs10.version = 0;
	if (that.newcert.dc instanceof Array) {
	    var c3 = 0;
	    while (c3 < that.newcert.dc.length) {
	        pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
	            type: "0.9.2342.19200300.100.1.25",
	            value: new asn1js.PrintableString({ value: that.newcert.dc[c3] })
	        }));
	        c3++;
	    }
	}
	if ((typeof that.newcert.uid == 'string' 
	    || (that.newcert.uid instanceof String))
	    && that.newcert.uid.length != 0) {
	    pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "0.9.2342.19200300.100.1.1", // UID 
	        value: new asn1js.PrintableString({ value: that.newcert.uid })
	    }));
	}
	pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.6", // Country Origin
		value: new asn1js.PrintableString({ value: that.newcert.co })
	}));

	if ((typeof that.newcert.o == 'string' 
	    || (that.newcert.o instanceof String))
	    && that.newcert.o.length != 0) {
	    pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.10", // Organization
	        value: new asn1js.PrintableString({ value: that.newcert.o })
	    }));
	}

	if ((typeof that.newcert.ou == 'string' 
	    || (that.newcert.ou instanceof String))
	    && that.newcert.ou.length != 0) {
	    pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.11", // Organizational Unit
	        value: new asn1js.PrintableString({ value: that.newcert.ou })
	    }));
	}

	if ((typeof that.newcert.pc == 'string' 
	    || (that.newcert.pc instanceof String))
	    && that.newcert.pc.length != 0) {
	    pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.17", // Postal Code 
	        value: new asn1js.PrintableString({ value: that.newcert.pc })
	    }));
	}

	if ((typeof that.newcert.st == 'string' 
	    || (that.newcert.st instanceof String))
	    && that.newcert.st.length != 0) {
	    pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.8", // State/Province not abreviated.
	        value: new asn1js.PrintableString({ value: that.newcert.st })
	    }));
	}

	if ((typeof that.newcert.l == 'string' 
	    || (that.newcert.l instanceof String))
	    && that.newcert.l.length != 0) {
	    pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.7", // Locality
	        value: new asn1js.PrintableString({ value: that.newcert.l })
	    }));
	}

	if ((typeof that.newcert.street == 'string' 
	    || (that.newcert.street instanceof String))
	    && that.newcert.street.length != 0) {
	    pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.9", // Street
	        value: new asn1js.PrintableString({ value: that.newcert.street })
	    }));
	}

	if ((typeof that.newcert.po == 'string' 
	    || (that.newcert.po instanceof String))
	    && that.newcert.po.length != 0) {
	    pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.18", // PO Box 
	        value: new asn1js.PrintableString({ value: that.newcert.po })
	    }));
	}

	if ((typeof that.newcert.tel == 'string' 
	    || (that.newcert.tel instanceof String))
	    && that.newcert.tel.length != 0) {
	        if (!that.newcert.tel.match(
	            /^\+\d{1,3} \d\d\d \d\d\d \d\d\d\d$/
	        )) {
	            that.error = 'Telephone number is invalid';
	            that.certgenerror ();
	            return;
	        }
	    pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.20", // Telephone Number
	        // CCITT Rec. E.123 international format
	        value: new asn1js.PrintableString({ value: that.newcert.tel })
	    }));
	}

	if ((typeof that.newcert.title == 'string' 
	    || (that.newcert.title instanceof String))
	    && that.newcert.title.length != 0) {
	    pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.12", // Title
	        value: new asn1js.PrintableString({ value: that.newcert.title })
	    }));
	}

	if ((typeof that.newcert.gn == 'string' 
	    || (that.newcert.gn instanceof String))
	    && that.newcert.gn.length != 0) {
	    pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.42", // Given Name
	        value: new asn1js.PrintableString({ value: that.newcert.gn })
	    }));
	}

	if ((typeof that.newcert.i == 'string' 
	    || (that.newcert.i instanceof String))
	    && that.newcert.i.length != 0) {
	    pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.43", // Initials
	        value: new asn1js.PrintableString({ value: that.newcert.i })
	    }));
	}

	if ((typeof that.newcert.sn == 'string' 
	    || (that.newcert.sn instanceof String))
	    && that.newcert.sn.length != 0) {
	    pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
	        type: "2.5.4.4", // Surname
	        value: new asn1js.PrintableString({ value: that.newcert.sn })
	    }));
	}

	pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
		type: "2.5.4.3", // Common Name
		value: new asn1js.Utf8String({ value: that.newcert.cn })
	}));

	var alt_names = that.newcert.altnames;
	var temp_altnames = new Array;
	var c = 0;
	var alttype = 0;
	var newalt = new String;
	var ipf = new Array;
	var ipv4addrregexp = new RegExp (
	    '^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$'
	);
	var ipv6addrregexp = new RegExp (
	    '^([0-9A-Fa-f]{0,4}:){2,7}([0-9A-Fa-f]{1,4}$|((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\\.|$)){4})$'
	);
	while (c < alt_names.length) {
	    if (alt_names[c].match('@')) {
	        alttype = 1; // rfc822Name
	    } else if (
	        alt_names[c].match(
	            ipv4addrregexp
	        )
	        || alt_names[c].match(
	            ipv6addrregexp
	        )
	    ) {
	        alttype = 7; // IP address
	    } else {
	        alttype = 2; // Domain name
	    }
	    if (alttype == 7) {
	        // Test for IP address type
		if (
	            alt_names[c].match(
	                ipv4addrregexp
	           )
	        ) {
	            // IPv4 address
	            var ipf = alt_names[c].split('.');
	            var ipuint = new Uint8Array
	            ([
	                parseInt(ipf[0]),
	                parseInt(ipf[1]),
	                parseInt(ipf[2]),
	                parseInt(ipf[3])
	            ]).buffer;
	        } else {
	            // IPv6 address
	            var ipv6delim = new RegExp(':', 'g');
	            var ip6l = alt_names[c].replace (
	                ipv6delim,
	                ''
	            );
	            var ip6l = ip6l.length;
	            var c5 = 0;
	            var mis0 = 32 - ip6l;
	            var zeros = '';
	            while (c5 < mis0) {
	                zeros = zeros + '0';
	                c5++;
	            }
	            var ipv6fstr = alt_names[c].replace (
	                '::',
	                zeros
	            );
	            ipv6fstr = ipv6fstr.replace (
	                ipv6delim,
	                ''
	            );
	            var ipoctarr = new Array;
	            c5 = 0;
	            var c6 = 2;
	            while (c6 < 33) {
	                ipoctarr.push (
	                    parseInt (
	                        ipv6fstr.slice (c5, c6),
	                        16
	                    )
	                );
	                c5 = c5 + 2;
	                c6 = c6 + 2;
	            }
	            var ipuint = new Uint8Array (
	                ipoctarr
	            );
	        }
		newalt = new GeneralName({
		    type: alttype,
	            value: new asn1js.OctetString ({ 
	                valueHex: ipuint
	            })
		});
	    } else {
	        newalt = new GeneralName({
	            type: alttype, // rfc822Name
	            value: alt_names[c]
	        });
	    }
	    temp_altnames.push (newalt);
	    c++;
	}
	
	const altNames = new GeneralNames({
		names: temp_altnames
	});

	//region "KeyUsage" extension
	const bitArray = new ArrayBuffer(1);
	const bitView = new Uint8Array(bitArray);
	
	bitView[0] |= 0x80; // Key usage "digitalSignature" flag
	bitView[0] |= 0x20; // Key usage "dataEncipherment" flag
	// bitView[0] |= 0x40; // Key usage "contentCommitment" flag
	bitView[0] |= 0x10; // Key usage "keyEncipherment" flag
	bitView[0] |= 0x08; // Key usage "keyAgreement" flag
	bitView[0] |= 0x04; // Key usage "keyCertSign" flag
	bitView[0] |= 0x02; // Key usage "cRLSign" flag
	
	const keyUsage = new asn1js.BitString({ valueHex: bitArray });
	
	//endregion
	
	const extKeyUsage = new ExtKeyUsage({
	    keyPurposes: [
	    // "2.5.29.37.0",       // anyExtendedKeyUsage
	    // "1.3.6.1.5.5.7.3.1", // id-kp-serverAuth
	    // "1.3.6.1.5.5.7.3.2", // id-kp-clientAuth
	    // "1.3.6.1.5.5.7.3.3", // id-kp-codeSigning
	    "1.3.6.1.5.5.7.3.4", // id-kp-emailProtection
	    // "1.3.6.1.5.5.7.3.5", // id-kp-ipsecEndSystem
	    // "1.3.6.1.5.5.7.3.6", // id-kp-ipsecTunnel
	    // "1.3.6.1.5.5.7.3.7", // id-kp-ipsecUser
	    // "1.3.6.1.5.5.7.3.8", // id-kp-timeStamping
	    // "1.3.6.1.5.5.7.3.9", // id-kp-OCSPSigning
	    // '1.3.6.1.5.5.7.3.19', // WiFi Certificate
	    // "1.3.6.1.4.1.311.10.3.1", // Microsoft Certificate Trust
	                              // List signing
	    // "1.3.6.1.4.1.311.10.3.4",  // Microsoft Encrypted File
	                              // System
	    ]
	});

	pkcs10.attributes = [];
	//endregion

	
	//region Create a new key pair
	sequence = sequence.then(() =>
	{
		//region Get default algorithm parameters for key generation
		const algorithm = getAlgorithmParameters(signAlg, "generatekey");
		if("hash" in algorithm.algorithm)
			algorithm.algorithm.hash.name = hashAlg;
		//endregion
		
		return crypto.generateKey(algorithm.algorithm, true, algorithm.usages);
	});
	//endregion
	
	//region Store new key in an interim variables
	sequence = sequence.then(keyPair =>
	{
		publicKey = keyPair.publicKey;
		privateKey = keyPair.privateKey;
	},
	error => 
	{
	    that.error = error;
	    that.csrgenerrorcb();
	    return;
	});
	//endregion
	
	//region Exporting public key into "subjectPublicKeyInfo" value of PKCS#10
	sequence = sequence.then(() => pkcs10.subjectPublicKeyInfo.importKey(publicKey));
	//endregion
	
	//region SubjectKeyIdentifier
	sequence = sequence.then(() => crypto.digest({ name: "SHA-1" }, pkcs10.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex))
		.then(result =>
		{
			pkcs10.attributes.push(new Attribute({
				type: "1.2.840.113549.1.9.14", // pkcs-9-at-extensionRequest
				values: [(new Extensions({
					extensions: [
						new Extension({
							extnID: "2.5.29.14",
							critical: false,
							extnValue: (new asn1js.OctetString({ valueHex: result })).toBER(false)
						}),
						new Extension({
							extnID: "2.5.29.17",
							critical: false,
							extnValue: altNames.toSchema().toBER(false)
						}),
						new Extension({
							extnID: "2.5.29.15",
							critical: false,
							extnValue: keyUsage.toBER(false),
							parsedValue: keyUsage // Parsed value for well-known extensions
						}),
						new Extension({
							extnID: "2.5.29.37",
							critical: false,
							extnValue: extKeyUsage.toSchema().toBER(false),
							parsedValue: extKeyUsage // Parsed value for well-known

						})
					]
				})).toSchema()]
			}));
		}
		);
	//endregion
	
	//region Signing final PKCS#10 request
	sequence = sequence.then(() =>
	    pkcs10.sign(privateKey, hashAlg),
	error => {
	
	    that.error = error;
	    that.pubkeyexprterrorcb();
	    return;
	});
	//endregion
	
	sequence = sequence.then(() =>
	{
		pkcs10Buffer = pkcs10.toSchema().toBER(false);
		let resultString = "-----BEGIN CERTIFICATE REQUEST-----\r\n";
		resultString = `${resultString}${formatPEM(toBase64(arrayBufferToString(pkcs10Buffer)))}`;
		resultString = `${resultString}\r\n-----END CERTIFICATE REQUEST-----\r\n`;
		
		that.csr = resultString;
	        that.csrcreatedcb;
	}, error => 
	{ 
	    that.error = error;
	    that.csrsignfailcb;
	});

	//region Exporting private key
	sequence = sequence.then(() =>
		crypto.exportKey("pkcs8", privateKey)
	);
	//endregion
	
	//region Store exported key on Web page
	sequence = sequence.then(result =>
	{
		// noinspection JSCheckFunctionSignatures
		const privateKeyString = String.fromCharCode.apply(null, new Uint8Array(result));
		
		let resultString = "";
		
		resultString = `${resultString}-----BEGIN PRIVATE KEY-----\r\n`;
		resultString = `${resultString}${formatPEM(window.btoa(privateKeyString))}`;
		resultString = `${resultString}\r\n-----END PRIVATE KEY-----\r\n`;
		
		// noinspection InnerHTMLJS
		// document.getElementById("pkcs8_key").value = resultString;
	        if (protkey == true)
		    key = resultString;
	        else
	            that.unprotkey = resultString;
		
		that.privatekeyexportcb();
		that.createcsrcb();
	}, error =>
	{
		that.error = error;
		that.privatekeyexportfailcb();
	});
	//endregion
	
	return sequence;
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region openSSLLikeInteral
//*********************************************************************************
var openSSLLikeInternal = function (password)
{
	//region Initial variables
	let sequence = Promise.resolve();
	
	const keyLocalIDBuffer = new ArrayBuffer(4);
	const keyLocalIDView = new Uint8Array(keyLocalIDBuffer);
	
	getRandomValues(keyLocalIDView);
	
	const certLocalIDBuffer = new ArrayBuffer(4);
	const certLocalIDView = new Uint8Array(certLocalIDBuffer);
	
	getRandomValues(certLocalIDView);
	
	//region "KeyUsage" attribute
	const bitArray = new ArrayBuffer(1);
	const bitView = new Uint8Array(bitArray);
	
	bitView[0] |= 0x80;
	
	const keyUsage = new asn1js.BitString({
	    valueHex: bitArray,
	    unusedBits: 7
	});
	//endregion
	
	const passwordConverted = stringToArrayBuffer(password);
	//endregion
	
	//region Create simplified structires for certificate and private key
	var i = 0;
	var sBags = new Array;
	while (i < certSimpl.length) {
	    sBags.push(
	        new SafeBag ({
	           bagId: "1.2.840.113549.1.12.10.1.3",
	           bagValue: new CertBag({
	               parsedValue: certSimpl[i++]
	           }),
	           bagAttributes: [
	               new Attribute({
	                   type: "1.2.840.113549.1.9.20", // friendlyName
	                   values: [
	                       new asn1js.BmpString({ value: "CertBag from PKIjs" })
	                   ]
	               }),
	               new Attribute({
	                   type: "1.2.840.113549.1.9.21", // localKeyID
	                   values: [
	                       new asn1js.OctetString({ valueHex: certLocalIDBuffer })
	                   ]
	               }),
	               new Attribute({
	                   type: "1.3.6.1.4.1.311.17.1", // pkcs12KeyProviderNameAttr
	                   values: [
	                       new asn1js.BmpString({ value: "http://www.pkijs.org" })
	                   ]
	               })
	            ]
	        })
	    );
	}
	i = 0;
	
	
	//region Add "keyUsage" attribute
	pkcs8Simpl.attributes = [
	    new Attribute({
	        type: "2.5.29.15",
	        values: [
	            keyUsage
	        ]
	    })
	];
	//endregion
	//endregion
	
	//region Put initial values for PKCS#12 structures
	const pkcs12 = new PFX({
	    parsedValue: {
	        integrityMode: 0, // Password-Based Integrity Mode
	        authenticatedSafe: new AuthenticatedSafe({
	            parsedValue: {
	                safeContents: [
	                    {
	                        privacyMode: 0, // "No-privacy" Protection Mode
	                        value: new SafeContents({
	                            safeBags: [
	                                new SafeBag({
	                                    bagId: "1.2.840.113549.1.12.10.1.2",
	                                    bagValue: new PKCS8ShroudedKeyBag({
	                                        parsedValue: pkcs8Simpl
	                                    }),
	                                    bagAttributes: [
	                                        new Attribute({
	                                            type: "1.2.840.113549.1.9.20", // friendlyName
	                                            values: [
	                                                new asn1js.BmpString({ value: "PKCS8ShroudedKeyBag from PKIjs" })
	                                            ]
	                                        }),
	                                        new Attribute({
	                                            type: "1.2.840.113549.1.9.21", // localKeyID
	                                            values: [
	                                                new asn1js.OctetString({ valueHex: keyLocalIDBuffer })
	                                            ]
	                                        }),
	                                        new Attribute({
	                                            type: "1.3.6.1.4.1.311.17.1", // pkcs12KeyProviderNameAttr
	                                            values: [
	                                                new asn1js.BmpString({ value: "http://www.pkijs.org" })
	                                            ]
	                                        })
	                                    ]
	                                })
	                            ]
	                        })
	                    },
	                    {
	                        privacyMode: 1, // Password-Based Privacy Protection Mode
	                        value: new SafeContents({
	                            safeBags: sBags
	                        })
	                    }
	                ]
	            }
	        })
	    }
	});
	//endregion
	
	//region Encode internal values for "PKCS8ShroudedKeyBag"
	sequence = sequence.then(
	    () => pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[0].value.safeBags[0].bagValue.makeInternalValues({
	        password: passwordConverted,
	        contentEncryptionAlgorithm: {
	            name: "AES-CBC", // OpenSSL can handle AES-CBC only
	            length: 128
	        },
	        hmacHashAlgorithm: "SHA-1", // OpenSSL can handle SHA-1 only
	        iterationCount: 100000
	    })
	);
	//endregion
	
	//region Encode internal values for all "SafeContents" firts (create all "Privacy Protection" envelopes)
	sequence = sequence.then(
	    () => pkcs12.parsedValue.authenticatedSafe.makeInternalValues({
	        safeContents: [
	            {
	                // Empty parameters for first SafeContent since "No Privacy" protection mode there
	            },
	            {
	                password: passwordConverted,
	                contentEncryptionAlgorithm: {
	                    name: "AES-CBC", // OpenSSL can handle AES-CBC only
	                    length: 128
	                },
	                hmacHashAlgorithm: "SHA-1", // OpenSSL can handle SHA-1 only
	                iterationCount: 100000
	            }
	        ]
	    })
	);
	//endregion
	
	//region Encode internal values for "Integrity Protection" envelope
	sequence = sequence.then(
	    () => pkcs12.makeInternalValues({
	        password: passwordConverted,
	        iterations: 100000,
	        pbkdf2HashAlgorithm: "SHA-256", // OpenSSL can not handle usage of PBKDF2, only PBKDF1
	        hmacHashAlgorithm: "SHA-256"
	    })
	);
	//endregion
	
	//region Save encoded data
	sequence = sequence.then(() => pkcs12.toSchema().toBER(false));
	//endregion
	
	return sequence;
}
//*********************************************************************************
this.exportOpenSSLLike = function (password)
{
	return Promise.resolve().then(() => openSSLLikeInternal(password)).then(result =>
	{
	    const pkcs12AsBlob = new Blob([result], { type: "application/x-pkcs12" });
	    that.exportpkcs12cb (pkcs12AsBlob);
	});
}
//*********************************************************************************
//endregion
//*********************************************************************************
//region parsePKCS12internal
//*********************************************************************************
var parsePKCS12Internal = function (buffer, password)
{
	//region Initial variables
	let sequence = Promise.resolve();
	
	const passwordConverted = stringToArrayBuffer(password);
	//endregion
	
	//region Parse internal PKCS#12 values
	const asn1 = asn1js.fromBER(buffer);
	const pkcs12 = new PFX({ schema: asn1.result });
	//endregion
	
	//region Parse "AuthenticatedSafe" value of PKCS#12 data
	sequence = sequence.then(
	    () => pkcs12.parseInternalValues({
	        password: passwordConverted,
	        checkIntegrity: true
	    })
	);
	//endregion
	
	//region Parse "SafeContents" values
	sequence = sequence.then(
	    () => pkcs12.parsedValue.authenticatedSafe.parseInternalValues({
	        safeContents: [
	            {
	                // Empty parameters since for first "SafeContent" OpenSSL uses "no privacy" protection mode
	                password: passwordConverted
	            },
	            {
	                password: passwordConverted
	            }
	        ]
	    })
	);
	//endregion
	
	//region Parse "PKCS8ShroudedKeyBag" value
	sequence = sequence.then(
	    () => pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[0].value.safeBags[0].bagValue.parseInternalValues({
	        password: passwordConverted
	    })
	);
	//endregion
	
	//region Store parsed value to Web page
	sequence = sequence.then(
	    () => pkcs12
	);
	//endregion
	
	return sequence;
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region parsePKCS12
//*********************************************************************************
this.parsePKCS12 =  function (buffer, password)
{
	return Promise.resolve().then(() => parsePKCS12Internal(buffer,password)).then(pkcs12 =>
	{
	    //region Initial variables
	    let pemcerts = "";
	    let pemkey = "";
	    certSimpl = new Array;
	    //endregion
	    
	    //region Store X.509 certificate value
	        var c = 0;
	        const numCerts = 
	            pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[1].value.safeBags.length;
	        while (c < numCerts) {
	            var certificateBuffer = pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[1].value.safeBags[c].bagValue.parsedValue.toSchema().toBER(false);
	    
	            pemcerts += certBufftoPEM(certificateBuffer);
	            let asn1 = asn1js.fromBER(certificateBuffer);
	            certSimpl.push (new Certificate({ schema: asn1.result }));
	            c++;
	        }
	    c = 0;
	    var cbobj2 = new Object;
	    var parsedcerts = new Array;
	    while (c < certSimpl.length) {
	        let cbobj2  = new Object;
	        cbobj2.cert = certSimpl[c];
                let pcert = parseCert (cbobj2);
                parsedcerts.push (pcert);
	        c++;
	    }

	    that.parsedcerts = parsedcerts;
	    that.certs = pemcerts;
	    //endregion
	    
	    //endregion Store PKCS#8 (private key) value
	    const pkcs8Buffer = pkcs12.parsedValue.authenticatedSafe.parsedValue.safeContents[0].value.safeBags[0].bagValue.parsedValue.toSchema().toBER(false);
	    
	    pemkey += keyBufftoPEM(pkcs8Buffer);

	    that.keytoimport = pemkey;
	    that.keyimportedcb = function () {};
	    that.importKey ();
	    //endregion
	    
	    // noinspection InnerHTMLJS
	    that.parsepkcs12cb();
	});
}
//*********************************************************************************
//*********************************************************************************
//endregion 
//*********************************************************************************
//region importKey
//*********************************************************************************
this.importKey = function () {
	if (that.keytoimport == null) {
	    objectPrivateKey = null;
	}
	if (objectPrivateKey != null
	    && pkcs8Simpl != null) {
	    that.keyimportedcb();
	    return;
	}
	//region Get a "crypto" extension
	const crypto = getCrypto();
	if(typeof crypto === "undefined")
	{
		that.nocryptocb();
		return;
	}
	//endregion
	
	//region Decode input private key 
	if ((that.keytoimport != null) && (protkey == true)) {
	    key = that.keytoimport;
	} else if ((that.keytoimport != null) && (protkey == false)) {
	    that.unprotkey = that.keytoimport;
	}
	that.keytoimport = null;
	let encodedPrivateKey;
	if (protkey == true) {
	    encodedPrivateKey = key;
	} else {
	    encodedPrivateKey = that.unprotkey;
	}
	pkcs8Simpl = PEMtoKey (encodedPrivateKey);
	const clearPrivateKey = encodedPrivateKey.replace(/(-----(BEGIN|END)( NEW)? PRIVATE KEY-----|\n)/g, "");
	const privateKeyBuffer = stringToArrayBuffer(window.atob(clearPrivateKey));
	let importprom;
	importprom = crypto.importKey(
            "pkcs8",
            privateKeyBuffer,
            {
                name: signAlg,
                hash: {name: hashAlg}
            },
            true,
            ["sign"]
	).then(function (importedPrivateKey) {
	    objectPrivateKey = importedPrivateKey;
	    that.keyimportedcb();
	})
	.catch( function (error) {
	    that.error = error;
	    that.keyimportfailcb ();
	});
	//endregion 
	
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region Create CMS_Signed
//*********************************************************************************
this.createCMSSignedInternal = function (dataToSign)
{
	dataBuffer = dataToSign
	//region Initial variables
	let sequence = Promise.resolve();
	let cmsSignedSimpl;
	
	//endregion
	
	//region Encode and store certificate
	sequence = sequence.then(
		() =>
		{
			certificateBuffer = certSimpl[0].toSchema(true).toBER(false);
		},
		error => Promise.reject(`Error during signing: ${error}`)
	);
	//endregion
	
	//region Check if user wants us to include signed extensions
	if(addExt)
	{
		//region Create a message digest
		sequence = sequence.then(
			() => crypto.digest({ name: hashAlg }, new Uint8Array(dataBuffer))
		);
		//endregion
		
		//region Combine all signed extensions
		sequence = sequence.then(
			result =>
			{
				const signedAttr = [];
				
				signedAttr.push(new Attribute({
					type: "1.2.840.113549.1.9.3",
					values: [
						new asn1js.ObjectIdentifier({ value: "1.2.840.113549.1.7.1" })
					]
				})); // contentType
				
				signedAttr.push(new Attribute({
					type: "1.2.840.113549.1.9.5",
					values: [
						new asn1js.UTCTime({ valueDate: new Date() })
					]
				})); // signingTime
				
				signedAttr.push(new Attribute({
					type: "1.2.840.113549.1.9.4",
					values: [
						new asn1js.OctetString({ valueHex: result })
					]
				})); // messageDigest
				
				return signedAttr;
			}
		);
		//endregion
	}
	//endregion
	
	//region Initialize CMS Signed Data structures and sign it
	sequence = sequence.then(
		result =>
		{
			cmsSignedSimpl = new SignedData({
				version: 1,
				encapContentInfo: new EncapsulatedContentInfo({
					eContentType: "1.2.840.113549.1.7.1" // "data" content type
				}),
				signerInfos: [
					new SignerInfo({
						version: 1,
						sid: new IssuerAndSerialNumber({
							issuer: certSimpl[0].issuer,
							serialNumber: certSimpl[0].serialNumber
						})
					})
				],
				certificates: certSimpl
			});
			
			if(addExt)
			{
				cmsSignedSimpl.signerInfos[0].signedAttrs = new SignedAndUnsignedAttributes({
					type: 0,
					attributes: result
				});
			}
			
			if(detachedSignature === false)
			{
				const contentInfo = new EncapsulatedContentInfo({
					eContent: new asn1js.OctetString({ valueHex: dataBuffer })
				});
				
				cmsSignedSimpl.encapContentInfo.eContent = contentInfo.eContent;
				
				return cmsSignedSimpl.sign(objectPrivateKey, 0, hashAlg);
			}
			
			return cmsSignedSimpl.sign(objectPrivateKey, 0, hashAlg, dataBuffer);
		}
	);
	//endregion
	
	//region Create final result
	sequence.then(
		() =>
		{
			const cmsSignedSchema = cmsSignedSimpl.toSchema(true);
			
			const cmsContentSimp = new ContentInfo({
				contentType: "1.2.840.113549.1.7.2",
				content: cmsSignedSchema
			});
			
			const _cmsSignedSchema = cmsContentSimp.toSchema();
			
			//region Make length of some elements in "indefinite form"
			_cmsSignedSchema.lenBlock.isIndefiniteForm = true;
			
			const block1 = _cmsSignedSchema.valueBlock.value[1];
			block1.lenBlock.isIndefiniteForm = true;
			
			const block2 = block1.valueBlock.value[0];
			block2.lenBlock.isIndefiniteForm = true;
			
			if(detachedSignature === false)
			{
				const block3 = block2.valueBlock.value[2];
				block3.lenBlock.isIndefiniteForm = true;
				block3.valueBlock.value[1].lenBlock.isIndefiniteForm = true;
				block3.valueBlock.value[1].valueBlock.value[0].lenBlock.isIndefiniteForm = true;
			}
			//endregion
			
			cmsSignedBuffer = _cmsSignedSchema.toBER(false);
		},
		error => Promise.reject(`Erorr during signing of CMS Signed Data: ${error}`)
	);
	//endregion
	
	return sequence;
}
//*********************************************************************************
this.createCMSSigned = function (dataBuffer)
{
	return that.createCMSSignedInternal(dataBuffer).then(() =>
	{
		const certSimplString = String.fromCharCode.apply(null, new Uint8Array(certificateBuffer));
		
		let resultString = new String;
		
		const signedDataString = String.fromCharCode.apply(null, new Uint8Array(cmsSignedBuffer));

		resultString = 'MIME-Version: 1.0\r\n';
		resultString += 'Content-Disposition: attachment; filename="smime.p7m"\r\n';
		resultString += 'Content-Type: application/pkcs7-mime; smime-type=signed-data; name="smime.p7m"\r\n';
		resultString += 'Content-Transfer-Encoding: base64\r\n';
		resultString += '\r\n';
		resultString += formatPEM(window.btoa(signedDataString));
		resultString += '\r\n';
		
		// noinspection InnerHTMLJS
		that.new_signed_data = resultString;
		
		// parseCMSSigned();
		
		that.signedcb();
	});
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region Encrypt input data and format as S/MIME message
//*********************************************************************************
this.smimeEncrypt = function ()
{
	//region Decode input certificate 
	// noinspection InnerHTMLJS
	const encodedCertificate = that.recipcert;
	if (encodedCertificate.length == 0) {
	    that.encryptnorecipientcb ();
	}
	if (!encodedCertificate.match(/(-----(BEGIN|END)( NEW)? CERTIFICATE-----|\n)/g)) {
	    that.recipientcertbadformatcb();
	}
	const clearEncodedCertificate = encodedCertificate.replace(/(-----(BEGIN|END)( NEW)? CERTIFICATE-----|\n)/g, "");
	certificateBuffer = stringToArrayBuffer(window.atob(clearEncodedCertificate));
	
	const asn1 = asn1js.fromBER(certificateBuffer);
	const certSimpl = new Certificate({ schema: asn1.result });
	//endregion 
	
	const cmsEnveloped = new EnvelopedData();
	
	cmsEnveloped.addRecipientByCertificate(certSimpl, { oaepHashAlgorithm: oaepHashAlg });
	
	return cmsEnveloped.encrypt (encAlg, stringToArrayBuffer (that.new_signed_data)).then (
		() =>
		{
			const cmsContentSimpl = new ContentInfo();
			cmsContentSimpl.contentType = "1.2.840.113549.1.7.3";
			cmsContentSimpl.content = cmsEnveloped.toSchema();
			
			const schema = cmsContentSimpl.toSchema();
			const ber = schema.toBER(false);
			
			// Insert enveloped data into new Mime message
			// noinspection JSUnresolvedFunction
			const mimeBuilder = new MimeNode("application/pkcs7-mime; name=smime.p7m; smime-type=enveloped-data; charset=binary")
				.setHeader("content-description", "Enveloped Data")
				.setHeader("content-disposition", "attachment; filename=smime.p7m")
				.setHeader("content-transfer-encoding", "base64")
				.setContent(new Uint8Array(ber));
			mimeBuilder.setHeader("from", that.senderaddr);
			mimeBuilder.setHeader("to", that.recipientaddr);
			mimeBuilder.setHeader("subject", that.msgsubject);
			
			// noinspection InnerHTMLJS
			that.encrypted = mimeBuilder.build();
			that.encryptedcb(true);
			
		},
		error => {
			that.error = error;
			that.encryptedcb(false);
		} 
	);
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region Import Certificates 
//*********************************************************************************
this.importCerts = function ()
{
	certSimpl = PEMtoCertArray (that.certs);
	var parsedcerts =  new Array;
	var c = 0;
	while (c < certSimpl.length) {
	    let cbobj2  = new Object;
	    cbobj2.cert = certSimpl[c];
            let pcert = parseCert (cbobj2);
            parsedcerts.push (pcert);
	    c++;
	}

	that.parsedcerts = parsedcerts;
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region Decrypt input data 
//*********************************************************************************
this.smimeDecrypt = function ()
{
	//region Decode input certificate
	certSimpl = PEMtoCertArray (that.certs);
	//endregion 
	
	//region Decode input private key 
	let encodedPrivateKey = key;
	if (protkey == true) {
	    encodedPrivateKey = key;
	} else {
	    encodedPrivateKey = that.unprotkey;
	}
	const clearPrivateKey = encodedPrivateKey.replace(/(-----(BEGIN|END)( NEW)? PRIVATE KEY-----|\n)/g, "");
	const privateKeyBuffer = stringToArrayBuffer(window.atob(clearPrivateKey));
	//endregion 
	
	//region Parse S/MIME message to get CMS enveloped content 
	const parser = parse(that.encrypted);
	//endregion
	
	//region Make all CMS data
	// noinspection JSUnresolvedVariable
	let asn1 = asn1js.fromBER(parser.content.buffer);
	if(asn1.offset === (-1))
	{
		that.decryptparserrorcb();
		return;
	}
	
	const cmsContentSimpl = new ContentInfo({ schema: asn1.result });
	const cmsEnvelopedSimp = new EnvelopedData({ schema: cmsContentSimpl.content });
	//endregion 
	
	return cmsEnvelopedSimp.decrypt(0,
		{
			recipientCertificate: certSimpl[0],
			recipientPrivateKey: privateKeyBuffer
		}).then(
		result =>
		{
			// noinspection InnerHTMLJS
			that.decrypted = arrayBufferToString(result);
			that.decryptedcb(true);
		},
		error => {
		    that.error = error;
		    that.decryptedcb(false);
		} 
	);
}
//*********************************************************************************
//endregion 
//*********************************************************************************
}
//*********************************************************************************
//endregion SMIME Object
//*********************************************************************************
function handleHashAlgOnChange()
{
	const hashOption = document.getElementById("hash_alg").value;
	switch(hashOption)
	{
		case "alg_SHA1":
			hashAlg = "sha-1";
			break;
		case "alg_SHA256":
			hashAlg = "sha-256";
			break;
		case "alg_SHA384":
			hashAlg = "sha-384";
			break;
		case "alg_SHA512":
			hashAlg = "sha-512";
			break;
		default:
	}
}
//*********************************************************************************
function handleSignAlgOnChange()
{
	const signOption = document.getElementById("sign_alg").value;
	switch(signOption)
	{
		case "alg_RSA15":
			signAlg = "RSASSA-PKCS1-V1_5";
			break;
		case "alg_RSA2":
			signAlg = "RSA-PSS";
			break;
		case "alg_ECDSA":
			signAlg = "ECDSA";
			break;
		default:
	}
}
//*********************************************************************************
function handleEncAlgOnChange()
{
	const encryptionAlgorithmSelect = document.getElementById("content_enc_alg").value;
	switch(encryptionAlgorithmSelect)
	{
		case "alg_CBC":
			encAlg.name = "AES-CBC";
			break;
		case "alg_GCM":
			encAlg.name = "AES-GCM";
			break;
		default:
	}
}
//*********************************************************************************
function handleEncLenOnChange()
{
	const encryptionAlgorithmLengthSelect = document.getElementById("content_enc_alg_len").value;
	switch(encryptionAlgorithmLengthSelect)
	{
		case "len_128":
			encAlg.length = 128;
			break;
		case "len_192":
			encAlg.length = 192;
			break;
		case "len_256":
			encAlg.length = 256;
			break;
		default:
	}
}
//*********************************************************************************
function handleOAEPHashAlgOnChange()
{
	const hashOption = document.getElementById("oaep_hash_alg").value;
	switch(hashOption)
	{
		case "alg_SHA1":
			oaepHashAlg = "sha-1";
			break;
		case "alg_SHA256":
			oaepHashAlg = "sha-256";
			break;
		case "alg_SHA384":
			oaepHashAlg = "sha-384";
			break;
		case "alg_SHA512":
			oaepHashAlg = "sha-512";
			break;
		default:
	}
}
//*********************************************************************************

//*********************************************************************************
//*********************************************************************************
//*********************************************************************************
// Start Signing regeon 
//*********************************************************************************
//*********************************************************************************
//*********************************************************************************


//*********************************************************************************
//region Parse "CA Bundle" file
//*********************************************************************************
function parseCAbundle(buffer, cbobj)
{
	//region Initial variables
	const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	
	const startChars = "-----BEGIN CERTIFICATE-----";
	const endChars = "-----END CERTIFICATE-----";
	const endLineChars = "\r\n";
	
	const view = new Uint8Array(buffer);
	
	let waitForStart = false;
	let middleStage = true;
	let waitForEnd = false;
	let waitForEndLine = false;
	let started = false;
	
	let certBodyEncoded = "";
	//endregion
	
	for(let i = 0; i < view.length; i++)
	{
		if(started === true)
		{
			if(base64Chars.indexOf(String.fromCharCode(view[i])) !== (-1))
				certBodyEncoded += String.fromCharCode(view[i]);
			else
			{
				if(String.fromCharCode(view[i]) === "-")
				{
					//region Decoded trustedCertificates
					const asn1 = asn1js.fromBER(stringToArrayBuffer(window.atob(certBodyEncoded)));
					try
					{
						trustedCertificates.push(new Certificate({ schema: asn1.result }));
					}
					catch(ex)
					{
						cbobj.error = ex;
						cbobj.errorcb();
						return;
					}
					//endregion
					
					//region Set all "flag variables"
					certBodyEncoded = "";
					
					started = false;
					waitForEnd = true;
					//endregion
				}
			}
		}
		else
		{
			if(waitForEndLine === true)
			{
				if(endLineChars.indexOf(String.fromCharCode(view[i])) === (-1))
				{
					waitForEndLine = false;
					
					if(waitForEnd === true)
					{
						waitForEnd = false;
						middleStage = true;
					}
					else
					{
						if(waitForStart === true)
						{
							waitForStart = false;
							started = true;
							
							certBodyEncoded += String.fromCharCode(view[i]);
						}
						else
							middleStage = true;
					}
				}
			}
			else
			{
				if(middleStage === true)
				{
					if(String.fromCharCode(view[i]) === "-")
					{
						if((i === 0) ||
							((String.fromCharCode(view[i - 1]) === "\r") ||
							(String.fromCharCode(view[i - 1]) === "\n")))
						{
							middleStage = false;
							waitForStart = true;
						}
					}
				}
				else
				{
					if(waitForStart === true)
					{
						if(startChars.indexOf(String.fromCharCode(view[i])) === (-1))
							waitForEndLine = true;
					}
					else
					{
						if(waitForEnd === true)
						{
							if(endChars.indexOf(String.fromCharCode(view[i])) === (-1))
								waitForEndLine = true;
						}
					}
				}
			}
		}
	}
}
//*********************************************************************************
//endregion
//*********************************************************************************
//region Parse Certificate
//*********************************************************************************
var parseCert = function (cbobj)
{
	const rdnmap = {
	        "0.9.2342.19200300.100.1.25": "DC",
	        "0.9.2342.19200300.100.1.1": "UID",
		"2.5.4.6": "C",
	        "2.5.4.17": "PC",
		"2.5.4.8": "ST",
		"2.5.4.10": "O",
		"2.5.4.11": "OU",
		"2.5.4.7": "L",
		"2.5.4.9": "STREET",
	        "2.5.4.18": "PO Box",
	        "2.5.4.20": "TN",
		"2.5.4.12": "T",
		"2.5.4.42": "GN",
		"2.5.4.43": "I",
		"2.5.4.4": "SN",
		"2.5.4.3": "CN",
		"1.2.840.113549.1.9.1": "E-mail"
	};
	        var asn1cert = cbobj.cert;
	        var pcert = new Object;
	        var issuer = new Object;
	        issuer.dn = new Array;
	        for(let i = 0; i < asn1cert.issuer.typesAndValues.length; i++)
	        {
	            let typeval = rdnmap[asn1cert.issuer.typesAndValues[i].type];
	            if(typeof typeval === "undefined")
	                typeval = asn1cert.issuer.typesAndValues[i].type;
	            const subjval = asn1cert.issuer.typesAndValues[i].value.valueBlock.value;
	            issuer.dn.push ([typeval, subjval]);
	        }
	        pcert.serial = bufferToHexCodes(asn1cert.serialNumber.valueBlock.valueHex)
	        var subject = new Object;
	        subject.dn = new Array;
	        for(let i = 0; i < asn1cert.subject.typesAndValues.length; i++)
	        {
	            let typeval = rdnmap[asn1cert.subject.typesAndValues[i].type];
	            if(typeof typeval === "undefined")
	                typeval = asn1cert.subject.typesAndValues[i].type;
	            const subjval = asn1cert.subject.typesAndValues[i].value.valueBlock.value;
	            subject.dn.push ([typeval, subjval]);
	        }
if (asn1cert.extensions !== undefined) {
	let c = 0;
	var extensions =
	    asn1cert.extensions;
	var thatAltName;
	while (c < extensions.length) {
	    if (
		(extensions[c].parsedValue !== undefined)
		&& ((extensions[c].extnID == '2.5.29.17')
	        ||(extensions[c].extnID == '2.5.29.18'))
	    ) {
	        if (extensions[c].extnID == '2.5.29.17')
		{
	            const subjectAltName = extensions[c].parsedValue.altNames;
	            thatAltName = subjectAltName;
	        } else {
	            const issuerAltName = extensions[c].parsedValue.altNames;
	            thatAltName = issuerAltName;
	        }
	        var c2 = 0;
	        var alt_names = new Array;
	        while (c2 < thatAltName.length) {
	            if (thatAltName[c2].type == 1) {
	                var valpair = new Array;
	                valpair.push('EMAIL');
	                valpair.push(thatAltName[c2].value);
	            } else if (thatAltName[c2].type == 2) {
	                var valpair = new Array;
	                valpair.push('DNS');
	                valpair.push(thatAltName[c2].value);
	            } else if (thatAltName[c2].type == 7) {
	                var valpair = new Array;
	                valpair.push('IP');
	                var ipbuf = thatAltName[c2].value.valueBlock.valueHex;
	                var ipint = new Uint8Array (ipbuf);
	                if (ipint.length == 4) {
	                    // IPv4 Address
	                    var ip = '' + ipint[0] 
	                        + '.' + ipint[1]
	                        + '.' + ipint[2]
	                        + '.' + ipint[3];
	                } else if (ipint.length == 16) {
	                    // IPv6 address.
	                    var ip = '';
	                    var c7 = 1;
	                    var tempstr = '';
	                    var pad0 = '';
	                    tempstr = ipint[0].toString(16);
	                    while (
	                        pad0.length +
	                        tempstr.length
	                        < 2 
	                    ) {
	                        pad0 = pad0 + '0';
	                    }
	                    ip = pad0 + tempstr;
	                    while (c7 < 16) {
	                        pad0 = '';
	                        if (!(c7 % 2)) {
	                            ip = ip + ':';
	                        }
	                        tempstr =  ipint[c7].toString(16);
	                        while (
	                            pad0.length +
	                            tempstr.length
	                            < 2 
	                        ) {
	                            pad0 = pad0 + '0';
	                        }
	                        ip = ip + pad0 + tempstr;
	                        c7++;
	                    }
	                }
	                valpair.push (ip);
	            } else {
	                valpair.push(
	                    ''
	                    + thatAltName[c2].type
	                );
	                valpair.push(thatAltName[c2].value);
	            }
	            alt_names.push (valpair);
	            c2++;
	        }
	    }
	    c++;
	}
}
	subject.alt_names = alt_names;
	issuer.alt_names = alt_names;
	pcert.issuer = issuer;
	pcert.subject = subject;
	return pcert;
}
//*********************************************************************************
//endregion
//*********************************************************************************
//region Parse existing CMS_Signed
//*********************************************************************************
function parseCMSSigned(cbobj)
{
	const dgstmap = {
		"1.3.14.3.2.26": "SHA-1",
		"2.16.840.1.101.3.4.2.1": "SHA-256",
		"2.16.840.1.101.3.4.2.2": "SHA-384",
		"2.16.840.1.101.3.4.2.3": "SHA-512"
	};
	const contypemap = {
		"1.3.6.1.4.1.311.2.1.4": "Authenticode signing information",
		"1.2.840.113549.1.7.1": "Data content"
	};
	
	//region Initial check
	cmsSignedBuffer = cbobj.cmsSignedBuffer;
	if(cmsSignedBuffer.byteLength === 0)
	{
		cbobj.error = 'Nothing to parse!';
		cbobj.errorcb();
		return;
	}
	//endregion
	
	//region Initial activities
	
	//region Decode existing CMS Signed Data
	cbobj.messageinfo = new Object;
	const mimnod = parse (cmsSignedBuffer);
	cbobj.messageinfo.type = mimnod.contentType.value;
	if (mimnod.contentType.value == 'multipart/signed') {
	    var c = 0;
	    var smtype;
	    var smcont;
	    while (c < mimnod.childNodes.length) {
	        smtype = mimnod.childNodes[c].contentType.value;
	        smcont = mimnod.childNodes[c].content.buffer;
	        if (smtype == 'text/plain') {
	            cbobj.contentdecoded = new Blob (
	                [smcont],
	                {type: smtype}
	            );
	            if (!mimnod.childNodes[c].raw.match('\r')) {
	                var regm = new RegExp ('\n', 'g');
	                var corrected_text =
	                    mimnod.childNodes[c].raw.replace (regm, '\r\n');
	                var enc = new TextEncoder('iso-8859-1');
	                dataBuffer = enc.encode(corrected_text).buffer;
	            } else {
	                dataBuffer = mimnod.childNodes[c].raw;
	            }
	            detachedSignature = true;
	        } else if (smtype == 'application/x-pkcs7-signature') {
	            cmsSignedBuffer = smcont;
	        }
	        c++;
	    }
	} else if (mimnod.contentType.value == 'application/pkcs7-mime') {
	    cmsSignedBuffer = mimnod.content.buffer;
	} else {
	}
	const asn1 = asn1js.fromBER(cmsSignedBuffer);
	const cmsContentSimpl = new ContentInfo({ schema: asn1.result });
	parsedCMSContentSimpl = cmsContentSimpl;
	const cmsSignedSimpl = new SignedData({ schema: cmsContentSimpl.content });
	//endregion
	
	//region Put information about digest algorithms in the CMS Signed Data
	var digalgs = new Array;
	for(let i = 0; i < cmsSignedSimpl.digestAlgorithms.length; i++)
	{
		let typeval = dgstmap[cmsSignedSimpl.digestAlgorithms[i].algorithmId];
		if(typeof typeval === "undefined")
			typeval = cmsSignedSimpl.digestAlgorithms[i].algorithmId;
	        digalgs.push (typeval);
	}
	cbobj.digalgs = digalgs;
	//endregion
	
	//region Put information about encapsulated content type
	
	if (mimnod.contentType.value == 'application/pkcs7-mime') {
	    let eContentInfo = cmsSignedSimpl.encapContentInfo;
	    let messagehex = eContentInfo.eContent.valueBlock.value[0].valueBlock.valueHex;
	    var slicetext = '';
	    if (messagehex.byteLength < 29) {
	        slicetext =
	             new TextDecoder('utf-8').decode(messagehex);
	    } else {
	        slicetext =
	            new TextDecoder('utf-8').decode(
	                messagehex.slice(0,50)
	            );
	    }
	    let headindex = slicetext.indexOf ('\r\n\r\n');
	    smtype = slicetext.slice (14, headindex);
	    smcont = messagehex.slice (headindex + 4);

	    cbobj.contentdecoded = new Blob (
	        [new Uint8Array(smcont).buffer],
	        {type: smtype}
	    );
	}

	let eContentType = contypemap[cmsSignedSimpl.encapContentInfo.eContentType];
	if(typeof eContentType === "undefined")
		eContentType = cmsSignedSimpl.encapContentInfo.eContentType;
	
	cbobj.enctype = eContentType;
	
	//region Put information about included certificates
	
	var parsedcerts = new Array;
	var cbobj2 =  new Object;
	cbobj.messageinfo.signerindex = new Array;
	cmsSigners = new Array;
	if("certificates" in cmsSignedSimpl)
	{
	    for(let j = 0; j < cmsSignedSimpl.certificates.length; j++)
	    {
	        for (
	            let h = 0;
	            h < cmsSignedSimpl.signerInfos.length;
	            h++
	        ){
	            if((cmsSignedSimpl.certificates[j].issuer.isEqual(cmsSignedSimpl.signerInfos[h].sid.issuer)) &&
	                (cmsSignedSimpl.certificates[j].serialNumber.isEqual(cmsSignedSimpl.signerInfos[h].sid.serialNumber)))
	            {
	                cmsSigners.push (j);
	                cbobj.messageinfo.signerindex.push(j);
	            }
	        }
	                
	        cbobj2.cert =
	            cmsSignedSimpl.certificates[j];
	        let pcert = parseCert (cbobj2);
	        parsedcerts.push (pcert);
	    }
	}
	//endregion
	
	//region Put information about included CRLs
	var crls = new Array;
	if("crls" in cmsSignedSimpl)
	{
	    for(let j = 0; j < cmsSignedSimpl.crls.length; j++)
	    {
	        for(let i = 0; i < cmsSignedSimpl.crls[j].issuer.typesAndValues.length; i++)
	        {
	            let typeval = rdnmap[cmsSignedSimpl.crls[j].issuer.typesAndValues[i].type];
	            if(typeof typeval === "undefined")
	                typeval = cmsSignedSimpl.crls[j].issuer.typesAndValues[i].type;
	                const subjval = cmsSignedSimpl.crls[j].issuer.typesAndValues[i].value.valueBlock.value;
	                crls.push ([typeval, subjval]);
	        }
	    }
	}
	//endregion
	
	cbobj.messageinfo.crls = crls;
	//region Put information about number of signers
	// cbobj.messageinfo.signersn = cmsSignedSimpl.signerInfos.length.toString();
	//endregion
	
	cbobj.parsedcerts = parsedcerts;
	cbobj.success(cbobj);
}
//*********************************************************************************
//endregion
//*********************************************************************************
//*********************************************************************************
//region Verify existing CMS_Signed
//*********************************************************************************
function verifyCMSSignedInternal()
{
	//region Initial check
	if(cmsSignedBuffer.byteLength === 0)
		return Promise.reject("Nothing to verify!");
	//endregion
	
	return Promise.resolve().then(() =>
	{
		//region Decode existing CMS_Signed
		const asn1 = asn1js.fromBER(cmsSignedBuffer);
		const cmsContentSimpl = new ContentInfo({ schema: asn1.result });
		const cmsSignedSimpl = new SignedData({ schema: cmsContentSimpl.content });
		//endregion
		certificateBuffer = cmsContentSimpl.content.SignedData.certificates[0].valueBeforeDecode;
		
		//region Verify CMS_Signed
		const verificationParameters = {
			signer: 0,
			trustedCerts: trustedCertificates
		};
		if(detachedSignature)
			verificationParameters.data = dataBuffer;
		
		return cmsSignedSimpl.verify(verificationParameters);
	});
	//endregion
}
//*********************************************************************************
function verifyCMSSigned(verifysigcb, errorverifysigcb)
{
	//region Initial check
	if(cmsSignedBuffer.byteLength === 0)
	{
		errorverifysigcb ('Nothing to verify!');
		return Promise.resolve();
	}
	//endregion
	
	return verifyCMSSignedInternal().
		then(
			result => verifysigcb(result),
			error => errorverifysigcb(error)
		);
}
//*********************************************************************************
//endregion 
//*********************************************************************************
// Regeon verify certificate chain.
//*********************************************************************************
function verifyCertificateInternal()
{
	//region Initial variables
	let sequence = Promise.resolve();
	//endregion

	var c = 0;
	var j = 0;
	var signerbool = false;
	var msgcerts =
	    parsedCMSContentSimpl.content.SignedData.certificates;

	//region Major activities
	sequence = sequence.then(() =>
	{
		const certificates = [];
		//region Initial check
		c = 0;
		while (c < msgcerts.length) {
			certificateBuffer = msgcerts[c].valueBeforeDecode;
(certificateBuffer.byteLength);
			if(certificateBuffer.byteLength === 0)
				return Promise.resolve({ result: false });
			const asn1 = asn1js.fromBER(certificateBuffer);
			const certificate = new Certificate({ schema: asn1.result });
			j = 0;
			while (j < cmsSigners.length) {
				if (cmsSigners[j] == c) {
					signerbool = true;
				}
				j++;
			}
			if (signerbool === true) {
				certificates.push(certificate);
			} else {
				intermadiateCertificates.push(certificate);
			}
			signerbool = false;
	    		c++;
		}
		if(certificates.length < 1)
			return Promise.resolve({ result: false });
		//endregion
		
		//region Decode existing CERT
		//endregion
		
		//region Create certificate's array (end-user certificate + intermediate certificates)
	        if (intermadiateCertificates.length > 0) {
		    certificates.push(...intermadiateCertificates);
	        }
		//endregion
		
		//region Make a copy of trusted certificates array
				
		const trustedCerts = [];
	        if (trustedCertificates.length > 0) {
	            var c = 0;
	            while (c < trustedCertificates.length) {
		        trustedCerts.push(trustedCertificates[c++]);
	            }
	        }
		//endregion
		
		//region Create new X.509 certificate chain object
		const certChainVerificationEngine = new CertificateChainValidationEngine({
			trustedCerts,
			certs: certificates,
			crls
		});
		//endregion
		
		//region Verify CERT
		return certChainVerificationEngine.verify();
		//endregion
	});
	//endregion
	
	//region Error handling stub
	sequence = sequence.then(
	    result => result,
	     () => Promise.resolve (
	            {result: false}
	          )
	    );
	//endregion
	
	return sequence;
}
//*********************************************************************************
function verifyCertificate(certvcb)
{
	return verifyCertificateInternal().then(result =>
	{
		certvcb (result.result, null);
	}, error =>
	{
		certvcb (result.result, error.resultMessage);
	});
}
//*********************************************************************************
//endregion 
//*********************************************************************************
//region Functions handling file selection
//*********************************************************************************
function handleFileBrowse(evt, cbobj)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	// noinspection AnonymousFunctionJS
	tempReader.onload =
		event =>
		{
			// noinspection JSUnresolvedVariable
			dataBuffer = event.target.result;
			cbobj.importKey();
		};
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
function handleParsingFile(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	// noinspection AnonymousFunctionJS
	tempReader.onload =
		event =>
		{
			// noinspection JSUnresolvedVariable
			cmsSignedBuffer = event.target.result;
			parseCMSSigned(null, null);
		};
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
function handleCABundle(evt, cbobj)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	
	// noinspection JSUnresolvedVariable, AnonymousFunctionJS
	tempReader.onload =
		event => parseCAbundle(event.target.result, cbobj);
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
function handleTrustedCertsText(encodedCertificate)
{

	const clearEncodedCertificate = encodedCertificate.replace(/(-----(BEGIN|END)( NEW)? CERTIFICATE-----|\n)/g, "");
	const trustedCertificateBuffer = stringToArrayBuffer(window.atob(clearEncodedCertificate));
	var textBlob = new Blob([trustedCertificateBuffer], { type: 'application/octet-stream' });
	const tempReader = new FileReader();
	
	// noinspection AnonymousFunctionJS
	tempReader.onload =
		function(event)
		{
			try
			{
				// noinspection JSUnresolvedVariable
				const asn1 = asn1js.fromBER(event.target.result);
				const certificate = new Certificate({ schema: asn1.result });

				trustedCertificates.push(certificate);
			}
			catch(ex)
			{
			}
		};
	
	tempReader.readAsArrayBuffer(textBlob);
}
//*********************************************************************************
//*********************************************************************************
function handleTrustedCertsFile(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	let currentIndex = 0;
	
	// noinspection AnonymousFunctionJS
	tempReader.onload =
		function(event)
		{
			try
			{
				// noinspection JSUnresolvedVariable
				const asn1 = asn1js.fromBER(event.target.result);
				const certificate = new Certificate({ schema: asn1.result });
				
				trustedCertificates.push(certificate);
			}
			catch(ex)
			{
			}
		};
	
	// noinspection AnonymousFunctionJS
	tempReader.onloadend =
		function(event)
		{
			// noinspection JSUnresolvedVariable
			if(event.target.readyState === FileReader.DONE)
			{
				currentIndex++;
				
				if(currentIndex < currentFiles.length)
					tempReader.readAsArrayBuffer(currentFiles[currentIndex]);
			}
		};
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
function handleInterCertsFile(evt)
{
	const tempReader = new FileReader();
	
	const currentFiles = evt.target.files;
	let currentIndex = 0;
	
	// noinspection AnonymousFunctionJS
	tempReader.onload =
		function(event)
		{
			try
			{
				// noinspection JSUnresolvedVariable
				const asn1 = asn1js.fromBER(event.target.result);
				const certificate = new Certificate({ schema: asn1.result });
				
				intermadiateCertificates.push(certificate);
			}
			catch(ex)
			{
			}
		};
	
	// noinspection AnonymousFunctionJS
	tempReader.onloadend =
		function(event)
		{
			// noinspection JSUnresolvedVariable
			if(event.target.readyState === FileReader.DONE)
			{
				currentIndex++;
				
				if(currentIndex < currentFiles.length)
					tempReader.readAsArrayBuffer(currentFiles[currentIndex]);
			}
		};
	
	tempReader.readAsArrayBuffer(currentFiles[0]);
}
//*********************************************************************************
function handleAddExtOnChange()
{
	addExt = document.getElementById("add_ext").checked;
}
//*********************************************************************************
function handleDetachedSignatureOnChange()
{
	detachedSignature = document.getElementById("detached_signature").checked;
}
//*********************************************************************************
//endregion
//*********************************************************************************
context("Hack for Rollup.js", () =>
{
	return;
	
	// noinspection UnreachableCodeJS
	parseCMSSigned();
	verifyCMSSigned();
	parseCAbundle();
	handleFileBrowse();
	handleParsingFile();
	handleCABundle();
	handleHashAlgOnChange();
	handleSignAlgOnChange();
	handleAddExtOnChange();
	handleDetachedSignatureOnChange();
	setEngine();
	verifyCertificate();
	handleInterCertsFile();
	handleTrustedCertsFile();
	handleTrustedCertsText();
});
//*********************************************************************************
context("CMS Signed Complex Example", () =>
{
	return;
	
	SMIMEHandler();
	// noinspection UnreachableCodeJS
	// createCertificate();
	// smimeEncrypt();
	// smimeDecrypt();
	handleHashAlgOnChange();
	handleSignAlgOnChange();
	handleEncAlgOnChange();
	handleEncLenOnChange();
	handleOAEPHashAlgOnChange();
	stringToArrayBuffer();
	//region Initial variables
	const hashAlgs = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
	const signAlgs = ["RSASSA-PKCS1-V1_5", "ECDSA", "RSA-PSS"];
	const addExts = [false, true];
	const detachedSignatures = [false, true];
	
	dataBuffer = (new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09])).buffer;
	//endregion
	
	signAlgs.forEach(_signAlg =>
	{
		hashAlgs.forEach(_hashAlg =>
		{
			addExts.forEach(_addExt =>
			{
				detachedSignatures.forEach(_detachedSignature =>
				{
					const testName = `${_hashAlg} + ${_signAlg}, add ext: ${_addExt}, detached signature: ${_detachedSignature}`;
					
					it(testName, () =>
					{
						hashAlg = _hashAlg;
						signAlg = _signAlg;
						addExt = _addExt;
						detachedSignature = _detachedSignature;
						
						return createCMSSignedInternal().then(() =>
						{
							//region Simple test for decoding data
							const asn1 = asn1js.fromBER(cmsSignedBuffer);
							const cmsContentSimpl = new ContentInfo({ schema: asn1.result });
							// noinspection JSUnusedLocalSymbols
							const cmsSignedSimpl = new SignedData({ schema: cmsContentSimpl.content });
							//endregion
							
							return verifyCMSSignedInternal().then(result =>
							{
								assert.equal(result, true, "CMS SignedData must be verified sucessfully");
							});
						});
					});
				});
			});
		});
	});
	
	it("Special test case for issue #170", () =>
	{
		const testData = "MIIIZQYJKoZIhvcNAQcCoIIIVjCCCFICAQExDzANBglghkgBZQMEAgEFADCBigYJKoZIhvcNAQcBoH0Ee0RUOGxPTTNwQjE4PVRlc3QgRm9ybGl0YW5kZWNlcnRpZmlrYXQwMzczNTk5YTYxY2M2YjNiYzAyYTc4YzM0MzEzZTE3MzdhZTljZmQ1NmI5YmIyNDM2MGI0MzdkNDY5ZWZkZjNiMTVTaWduIHlvdXIgZXNwbGl4IGtleaCCBTUwggUxMIIDGaADAgECAg8BYZ2jWZQuegs0UmKVSWkwDQYJKoZIhvcNAQEFBQAwTzELMAkGA1UEBhMCU0UxEzARBgNVBAoMClRlbGlhIFRlc3QxKzApBgNVBAMMIlRlbGlhIGUtbGVnaXRpbWF0aW9uIFRlc3QgUFAgQ0EgdjMwHhcNMTgwMjE2MDgwMjUyWhcNMjAwMjE3MDgwMjUyWjBeMQswCQYDVQQGEwJTRTEWMBQGA1UEAwwNRWJiZSBUZXN0c3NvbjERMA8GA1UEBAwIVGVzdHNzb24xDTALBgNVBCoMBEViYmUxFTATBgNVBAUTDDE5MDEwNDIyNjM3ODCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAM3NNdLpfEJphjXNJ3/bK7TM56wDc/7IXCSvgl5fNirG1CnPjGmSTdno3NNXfqb2PRtwfEXRFPVw8jUsa7KhO8ND2o8Unmgo+tgrKklLZFwrQYQZ9oE3AhM1FX0luTmwFWZKJtL1y80SRaxjLTcWpYpFYniA+xPxcOMJPWK4PoA/KoFtvi1+6yUpvSc+ITPWrDJLDOZtBhWKXjqFehWiCSFSAR8JipyM2BgxawttH8AcMGj5fkbzLPC7n9/F4YRTVcGpX9vmy+o8XbQku4GMV23n2q+ykhC0XjiRyN7NhfFReBBmgjHgR81ZMsZ6MS0qboQs/OTB/YNTkY7dBLtvF9MCAwEAAaOB+jCB9zAfBgNVHSMEGDAWgBR9vkdBjANmExSqmDAQ1KwK7c/t9jAdBgNVHQ4EFgQU/ieVlJtDgp/4VU/4xxmJDd3l2pAwDgYDVR0PAQH/BAQDAgZAMEUGA1UdIAQ+MDwwOgYGKoVwI2MCMDAwLgYIKwYBBQUHAgEWImh0dHBzOi8vcmVwb3NpdG9yeS50cnVzdC50ZWxpYS5jb20wHQYDVR0lBBYwFAYIKwYBBQUHAwQGCCsGAQUFBwMCMD8GCCsGAQUFBwEBBDMwMTAvBggrBgEFBQcwAYYjaHR0cDovL29jc3AucHJlcHJvZC50cnVzdC50ZWxpYS5jb20wDQYJKoZIhvcNAQEFBQADggIBAF/s4mtDzIjJns5b3YI2j9CKcbNOpVjCV9jUqZ+w5vSEsiOwZhNw6VXEnOVfANRZt+IDIyS5Ce9rWXqT5aUB5GDduOQL4jClLdMGPW1caOwD8f5QoBEeQCXnYvBefwYiiCw+aa7XGpgmQD+qhWZWB4Xv4wOSilyvT40CPQAHYPlJhawtoOo7JOdSxSkaoeqQ3XvNuCIH0xiuqJmWQGSzslIsWhv3hEYRxsD/6u1NxxOTCIJ19tXDy/IG7utxX7bbaj3AHG+56IbvWuWODxS+KwzAvSub0vT9Uxy9hJOIPGe82DH/08Spk7FM/Q9ELlYdwFHet7xFMyirj5kTpVwYp+qB+cN/H6y4DlrKut2j7qi859GWSMAX1a5+/UckuGHTXwA2IvzazQws+hp8fv33eg8Oof7STepV6EYCw+Fw0xveg3OQaFip5lSpawcKnhWdA4T2z8OvV1oR6CuokSwnFXN0bHeM4QbP6yjIQSi7J0Pmzi0DE7vU7OtenHaM3B6tZ9ZtNyCOx6iAAOkUsVHz/O/tsVw8QEodg/OnCHwNsAPF0876ZF0nMQVYmcKYsxNj7im9oTZFc/3VxJh4TMjJQc2H6qiM3LZHuSu309i5fkJy9CPtw8ebB5pjFvuU77ZfyB/oqFoA/pM1/Bi/ARFBWAWVIGCo6Yp7sIQ8EkM6Of4gMYICdDCCAnACAQEwYjBPMQswCQYDVQQGEwJTRTETMBEGA1UECgwKVGVsaWEgVGVzdDErMCkGA1UEAwwiVGVsaWEgZS1sZWdpdGltYXRpb24gVGVzdCBQUCBDQSB2MwIPAWGdo1mULnoLNFJilUlpMA0GCWCGSAFlAwQCAQUAoIHkMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTE4MDQxOTEyNDQ0MlowLwYJKoZIhvcNAQkEMSIEIKHFvPWi9uCq04rLzVviJjdfUuCni4uxivw1n7jBr3eXMHkGCSqGSIb3DQEJDzFsMGowCwYJYIZIAWUDBAEqMAsGCWCGSAFlAwQBFjALBglghkgBZQMEAQIwCgYIKoZIhvcNAwcwDgYIKoZIhvcNAwICAgCAMA0GCCqGSIb3DQMCAgFAMAcGBSsOAwIHMA0GCCqGSIb3DQMCAgEoMA0GCSqGSIb3DQEBAQUABIIBAAga2QlXM4ba8LxA9pD51cFfN8VZcSgMBQwxNpy0y7vDWazE1M/IXPEEUUMsk6OVMLgS/Q/LCQ8nxYpZXRAkIMtnl1/L93LEI/xa35gYFXrVp352b7evA3iDvE9O0aN4lufLGCxOiT5bJISmaaCVSVe8QFrSVSmFSW/MkJKaFiFBWsXJJ3vQGnULlH0WIc5QnC2rpkAeEswsxgCA9VnQNclktv7gwS3GNH2lLUbRl+tMMrrQ8Il4lEOnRG7W22tVdypVndLbeEoZe71u7bumJCc/U754SCCiuX8CEZd55uzNPOPUPgTvWbSybh36oeMsWd21g57ZFU6FV6CNh3hGkp8=";
		
		//region Simple test for decoding data
		cmsSignedBuffer = stringToArrayBuffer(fromBase64(testData));
		
		const asn1 = asn1js.fromBER(cmsSignedBuffer);
		const cmsContentSimpl = new ContentInfo({ schema: asn1.result });
		// noinspection JSUnusedLocalSymbols
		const cmsSignedSimpl = new SignedData({ schema: cmsContentSimpl.content });
		//endregion
		
		return verifyCMSSignedInternal().then(result =>
		{
			assert.equal(result, true, "CMS SignedData must be verified sucessfully");
		});
	});
});
//***************************************************************************************
