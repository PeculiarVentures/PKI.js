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
window.parseCertificate = parseCertificate;
window.createCertificate = createCertificate;
window.verifyCertificate = verifyCertificate;
window.parseCAbundle = parseCAbundle;
window.handleFileBrowse = handleFileBrowse;
window.handleTrustedCertsFile = handleTrustedCertsFile;
window.handleInterCertsFile = handleInterCertsFile;
window.handleCRLsFile = handleCRLsFile;
window.handleCABundle = handleCABundle;
window.handleHashAlgOnChange = handleHashAlgOnChange;
window.handleSignAlgOnChange = handleSignAlgOnChange;

function context(name, func) {}`
		},
		{
			file: "../../test/certificateComplexExample.js",
			format: "es",
			intro: `const WebCrypto = require("node-webcrypto-ossl");
const webcrypto = new WebCrypto();`,
			outro: `const assert = require("assert");
setEngine("newEngine", webcrypto, new CryptoEngine({ name: "", crypto: webcrypto, subtle: webcrypto.subtle }));`,
		},
		{
			file: "../../test/browser/certificateComplexExample.js",
			format: "es"
		}
	]
};