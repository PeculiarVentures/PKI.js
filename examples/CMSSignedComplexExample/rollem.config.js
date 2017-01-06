import rollupNodeResolve from "rollup-plugin-node-resolve";

export default [
	{
        entry: "es6.js",
		dest: "bundle.js",
		format: "iife",
        outro: `
window.parseCMSSigned = parseCMSSigned;
window.createCMSSigned = createCMSSigned;
window.verifyCMSSigned = verifyCMSSigned;
window.parseCAbundle = parseCAbundle;
window.handleFileBrowse = handleFileBrowse;
window.handleParsingFile = handleParsingFile;
window.handleCABundle = handleCABundle;
window.handleHashAlgOnChange = handleHashAlgOnChange;
window.handleSignAlgOnChange = handleSignAlgOnChange;
window.handleAddExtOnChange = handleAddExtOnChange;
window.handleDetachedSignatureOnChange = handleDetachedSignatureOnChange;

function context(name, func) {}`,
        plugins: [
            rollupNodeResolve({ jsnext: true, main: true })
        ]
	},
	{
        entry: "es6.js",
        dest: "../../test/cmsSignedComplexExample.js",
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
		dest: "../../test/browser/cmsSignedComplexExample.js",
		plugins: [
			rollupNodeResolve({ jsnext: true, main: true })
		]
	}
];