'use strict';

var merge = require("node.extend");

var common = require("asn1js/org/pkijs/common");
var _asn1js = require("asn1js");
var _pkijs = require("pkijs");
var _x509schema = require("pkijs/org/pkijs/x509_schema");

// #region Merging function/object declarations for ASN1js and PKIjs
var asn1js = merge(true, _asn1js, common);

var x509schema = merge(true, _x509schema, asn1js);

var pkijs_1 = merge(true, _pkijs, asn1js);
var pkijs = merge(true, pkijs_1, x509schema);

var pem = require('fs').readFileSync('./example.cert.pem', 'ascii');
var b64 = pem.replace(/(-----(BEGIN|END) CERTIFICATE-----|[\n\r])/g, '');
var buf = Buffer(b64, 'base64');
var ab = new Uint8Array(buf).buffer;          // WORKS
//var ab = buf.buffer                         // Doesn't work
console.log(ab);
var asn1 = pkijs.org.pkijs.fromBER(ab);
var cert_simpl = new pkijs.org.pkijs.simpl.CERT({ schema: asn1.result });

console.log(cert_simpl);
