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
window.passwordBasedIntegrity = passwordBasedIntegrity;
window.certificateBasedIntegrity = certificateBasedIntegrity;
window.noPrivacy = noPrivacy;
window.passwordPrivacy = passwordPrivacy;
window.certificatePrivacy = certificatePrivacy;
window.openSSLLike = openSSLLike;
window.parsePKCS12 = parsePKCS12;
window.handlePKCS12 = handlePKCS12;

function context(name, func) {}`
		},
		{
			file: "../../test/browser/pkcs12SimpleExample.js",
			format: "es"
		}
	]
};
