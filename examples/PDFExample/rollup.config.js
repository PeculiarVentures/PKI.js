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
window.handleFileBrowse = handleFileBrowse;
window.handleCABundle = handleCABundle;

function context(name, func) {}`
	}
};