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

function context(name, func) {}`
		},
		{
			file: "../../test/browser/cmsSignedComplexExample.js",
			format: "es"
		}
	]
};