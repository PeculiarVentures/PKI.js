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
	output: {
			file: "bundle.js",
			format: "iife",
			outro: `
window.handleFileBrowse = handleFileBrowse;
window.handleCABundle = handleCABundle;

function context(name, func) {}`
	}
};
