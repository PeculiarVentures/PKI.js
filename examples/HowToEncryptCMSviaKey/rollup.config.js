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
window.createKeyPair = createKeyPair;
window.envelopedEncrypt = envelopedEncrypt;
window.envelopedDecrypt = envelopedDecrypt;
window.handleKeyAgreeAlgorithmOnChange = handleKeyAgreeAlgorithmOnChange;
window.handleEncAlgOnChange = handleEncAlgOnChange;
window.handleEncLenOnChange = handleEncLenOnChange;
window.handleOAEPHashAlgOnChange = handleOAEPHashAlgOnChange;

function context(name, func) {}`
		},
		{
			file: "../../test/browser/howToEncryptCMSviaKey.js",
			format: "es"
		}
	]
};
