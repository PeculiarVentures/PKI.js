import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
	input: "es6.js",
	plugins: [
		resolve({
			mainFields: [ 'jsnext', 'main' ],
			preferBuiltins: false
		}),
		commonjs()
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
