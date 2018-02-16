import rollupNodeResolve from "rollup-plugin-node-resolve";

export default {
	input: "es6.js",
	plugins: [
		rollupNodeResolve({ jsnext: true, main: true })
	],
	output: [
		{
			file: "bundle.js",
			format: "iife",
			outro: `
window.createCRL = createCRL;
window.verifyCRL = verifyCRL;
window.handleFileBrowse = handleFileBrowse;
window.handleIssuerCert = handleIssuerCert;

function context(name, func) {}`
		},
		{
			file: "../../test/crlComplexExample.js",
			format: "es",
			intro: `const WebCrypto = require("node-webcrypto-ossl");
const webcrypto = new WebCrypto();`,
			outro: `const assert = require("assert");
setEngine("newEngine", webcrypto, new CryptoEngine({ name: "", crypto: webcrypto, subtle: webcrypto.subtle }));`,
		},
		{
			file: "../../test/browser/crlComplexExample.js",
			format: "es"
		}
	]
};