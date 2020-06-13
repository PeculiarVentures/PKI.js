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
window.createCertificate = createCertificate;
window.envelopedEncrypt = envelopedEncrypt;
window.envelopedDecrypt = envelopedDecrypt;
window.handleHashAlgOnChange = handleHashAlgOnChange;
window.handleSignAlgOnChange = handleSignAlgOnChange;
window.handleEncAlgOnChange = handleEncAlgOnChange;
window.handleEncLenOnChange = handleEncLenOnChange;
window.handleOAEPHashAlgOnChange = handleOAEPHashAlgOnChange;

function context(name, func) {}`
		},
		{
			file: "../../test/browser/howToEncryptCMSviaCertificate.js",
			format: "es"
		}
	]
};
