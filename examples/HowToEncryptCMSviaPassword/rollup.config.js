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
window.envelopedEncrypt = envelopedEncrypt;
window.envelopedDecrypt = envelopedDecrypt;
window.handleContentEncAlgOnChange = handleContentEncAlgOnChange;
window.handleContentEncLenOnChange = handleContentEncLenOnChange;
window.handleContentTypeOnChange = handleContentTypeOnChange;

function context(name, func) {}`
		},
		{
			file: "../../test/browser/howToEncryptCMSviaPassword.js",
			format: "es"
		}
	]
};
