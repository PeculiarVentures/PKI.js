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
window.createCertificate = createCertificate;
window.smimeEncrypt = smimeEncrypt;
window.smimeDecrypt = smimeDecrypt;
window.handleHashAlgOnChange = handleHashAlgOnChange;
window.handleSignAlgOnChange = handleSignAlgOnChange;
window.handleEncAlgOnChange = handleEncAlgOnChange;
window.handleEncLenOnChange = handleEncLenOnChange;

function context(name, func) {}`
	}
};