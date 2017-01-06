import rollupNodeResolve from "rollup-plugin-node-resolve";

export default [
	{
        entry: "es6.js",
		dest: "bundle.js",
		format: "iife",
        outro: `
window.createOCSPResp = createOCSPResp;
window.verifyOCSPResp = verifyOCSPResp;
window.parseCAbundle = parseCAbundle;
window.handleFileBrowse = handleFileBrowse;
window.handleCABundle = handleCABundle;
window.handleHashAlgOnChange = handleHashAlgOnChange;
window.handleSignAlgOnChange = handleSignAlgOnChange;

function context(name, func) {}`,
        plugins: [
            rollupNodeResolve({ jsnext: true, main: true })
        ]
	},
	{
        entry: "es6.js",
        dest: "../../test/ocspResponseComplexExample.js",
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
		dest: "../../test/browser/ocspResponseComplexExample.js",
		plugins: [
			rollupNodeResolve({ jsnext: true, main: true })
		]
	}
];