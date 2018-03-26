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
window.createPKCS10 = createPKCS10;
window.parsePKCS10 = parsePKCS10;
window.verifyPKCS10 = verifyPKCS10;
window.handleHashAlgOnChange = handleHashAlgOnChange;
window.handleSignAlgOnChange = handleSignAlgOnChange;

function context(name, func) {}`
		},
		{
			file: "../../test/browser/pkcs10ComplexExample.js",
			format: "es"
		}
	]
};