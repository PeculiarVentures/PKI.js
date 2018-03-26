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
window.parseTSPResp = parseTSPResp;
window.createTSPResp = createTSPResp;
window.verifyTSPResp = verifyTSPResp;
window.handleFileBrowse = handleFileBrowse;
window.handleCABundle = handleCABundle;
window.handleHashAlgOnChange = handleHashAlgOnChange;
window.handleSignAlgOnChange = handleSignAlgOnChange;

function context(name, func) {}`
		},
		{
			file: "../../test/browser/tspRespComplexExample.js",
			format: "es"
		}
	]
};