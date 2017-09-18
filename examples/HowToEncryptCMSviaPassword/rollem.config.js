import rollupNodeResolve from "rollup-plugin-node-resolve";

export default [
	{
        entry: "es6.js",
		dest: "bundle.js",
		format: "iife",
        outro: `
window.envelopedEncrypt = envelopedEncrypt;
window.envelopedDecrypt = envelopedDecrypt;
window.handleContentEncAlgOnChange = handleContentEncAlgOnChange;
window.handleContentEncLenOnChange = handleContentEncLenOnChange;
window.handleContentTypeOnChange = handleContentTypeOnChange;

function context(name, func) {}`,
        plugins: [
            rollupNodeResolve({ jsnext: true, main: true })
        ]
	},
	{
        entry: "es6.js",
        dest: "../../test/howToEncryptCMSviaPassword.js",
		intro: `const WebCrypto = require("node-webcrypto-ossl");
const webcrypto = new WebCrypto();`,
		outro: `const assert = require("assert");
setEngine("newEngine", webcrypto, new CryptoEngine({ name: "", crypto: webcrypto, subtle: webcrypto.subtle }));`,
		plugins: [
			rollupNodeResolve({ jsnext: true, main: true })
		]
	},
	{
		entry: "es6.js",
		dest: "../../test/browser/howToEncryptCMSviaPassword.js",
		plugins: [
			rollupNodeResolve({ jsnext: true, main: true })
		]
	}
];