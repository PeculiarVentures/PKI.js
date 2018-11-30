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
window.passwordBasedIntegrity = passwordBasedIntegrity;
window.certificateBasedIntegrity = certificateBasedIntegrity;
window.noPrivacy = noPrivacy;
window.passwordPrivacy = passwordPrivacy;
window.certificatePrivacy = certificatePrivacy;
window.openSSLLike = openSSLLike;
window.windowsLike = windowsLike;
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