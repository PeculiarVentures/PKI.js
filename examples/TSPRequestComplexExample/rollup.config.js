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
window.createTSPReq = createTSPReq;
window.handleFileBrowse = handleFileBrowse;

function context(name, func) {}`
		},
		{
			file: "../../test/browser/tspReqComplexExample.js",
			format: "es"
		}
	]
};