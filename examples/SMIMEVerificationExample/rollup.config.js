import rollupNodeResolve from "rollup-plugin-node-resolve";

export default {
	input: "es6.js",
	plugins: [
		rollupNodeResolve({ jsnext: true, main: true })
	],
	output: {
		file: "bundle.js",
		format: "iife",
		outro: `
window.verifySMIME = verifySMIME;
window.handleMIMEFile = handleMIMEFile;
window.handleCABundle = handleCABundle;

function context(name, func) {}`
	}
};