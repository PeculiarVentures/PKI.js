import rollupNodeResolve from "rollup-plugin-node-resolve";

export default [
	{
        entry: "es6.js",
		dest: "bundle.js",
		format: "iife",
        outro: `
window.createPKCS10 = createPKCS10;
window.parsePKCS10 = parsePKCS10;
window.verifyPKCS10 = verifyPKCS10;
window.handleHashAlgOnChange = handleHashAlgOnChange;
window.handleSignAlgOnChange = handleSignAlgOnChange;

function context(name, func) {}`,
        plugins: [
            rollupNodeResolve({ jsnext: true, main: true })
        ]
	},
	{
        entry: "es6.js",
        dest: "../../test/pkcs10ComplexExample.js",
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
		dest: "../../test/browser/pkcs10ComplexExample.js",
		plugins: [
			rollupNodeResolve({ jsnext: true, main: true })
		]
	}
];