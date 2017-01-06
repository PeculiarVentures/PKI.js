import rollupNodeResolve from "rollup-plugin-node-resolve";

export default [
	{
        entry: "es6.js",
		dest: "bundle.js",
		format: "iife",
        outro: `
window.passwordBasedIntegrity = passwordBasedIntegrity;
window.certificateBasedIntegrity = certificateBasedIntegrity;
window.noPrivacy = noPrivacy;
window.passwordPrivacy = passwordPrivacy;
window.certificatePrivacy = certificatePrivacy;
window.openSSLLike = openSSLLike;
window.parsePKCS12 = parsePKCS12;
window.handlePKCS12 = handlePKCS12;

function context(name, func) {}`,
        plugins: [
            rollupNodeResolve({ jsnext: true, main: true })
        ]
	},
	{
        entry: "es6.js",
        dest: "../../test/pkcs12SimpleExample.js",
		intro: `const WebCrypto = require("node-webcrypto-ossl");
const webcrypto = new WebCrypto();`,
		outro: `const assert = require("assert");
setEngine("newEngine", webcrypto, webcrypto.subtle);`,
		plugins: [
			rollupNodeResolve({ jsnext: true, main: true })
		]
	},
	{
		entry: "es6.js",
		dest: "../../test/browser/pkcs12SimpleExample.js",
		plugins: [
			rollupNodeResolve({ jsnext: true, main: true })
		]
	}
];