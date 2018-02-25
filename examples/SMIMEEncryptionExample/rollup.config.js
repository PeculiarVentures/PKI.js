import rollupNodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import nodeBuiltins from "rollup-plugin-node-builtins";

export default {
	input: "es6.js",
	plugins: [
		rollupNodeResolve({
			jsnext: true,
			main: true,
			preferBuiltins: false
		}),
		commonjs(),
		nodeBuiltins()
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