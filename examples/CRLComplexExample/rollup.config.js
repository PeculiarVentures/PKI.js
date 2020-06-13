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
window.createCRL = createCRL;
window.verifyCRL = verifyCRL;
window.handleFileBrowse = handleFileBrowse;
window.handleIssuerCert = handleIssuerCert;

function context(name, func) {}`
		},
		{
			file: "../../test/browser/crlComplexExample.js",
			format: "es"
		}
	]
};
