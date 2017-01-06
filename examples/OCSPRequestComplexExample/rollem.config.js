import rollupNodeResolve from "rollup-plugin-node-resolve";

export default [
	{
        entry: "es6.js",
		dest: "bundle.js",
		format: "iife",
        outro: `
window.createOCSPReq = createOCSPReq;
window.handleFileBrowse = handleFileBrowse;

function context(name, func) {}`,
        plugins: [
            rollupNodeResolve({ jsnext: true, main: true })
        ]
	},
	{
        entry: "es6.js",
        dest: "../../test/ocspRequestComplexExample.js",
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
		dest: "../../test/browser/ocspRequestComplexExample.js",
		plugins: [
			rollupNodeResolve({ jsnext: true, main: true })
		]
	}
];