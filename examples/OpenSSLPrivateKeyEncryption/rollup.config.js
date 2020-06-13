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
window.parseOpenSSLPrivateKey = parseOpenSSLPrivateKey;
window.createOpenSSLPrivateKey = createOpenSSLPrivateKey;
window.handleContentEncLenOnChange = handleContentEncLenOnChange;

function context(name, func) {}`
		}
	]
};
