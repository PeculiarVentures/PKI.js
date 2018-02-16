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
window.envelopedEncrypt = envelopedEncrypt;
window.envelopedDecrypt = envelopedDecrypt;
window.handleContentEncAlgOnChange = handleContentEncAlgOnChange;
window.handleContentEncLenOnChange = handleContentEncLenOnChange;
window.handleContentTypeOnChange = handleContentTypeOnChange;

function context(name, func) {}`
		},
		{
			file: "../../test/howToEncryptCMSviaPassword.js",
			format: "es",
			intro: `const WebCrypto = require("node-webcrypto-ossl");
const webcrypto = new WebCrypto();`,
			outro: `const assert = require("assert");
setEngine("newEngine", webcrypto, new CryptoEngine({ name: "", crypto: webcrypto, subtle: webcrypto.subtle }));`,
		},
		{
			file: "../../test/browser/howToEncryptCMSviaPassword.js",
			format: "es"
		}
	]
};