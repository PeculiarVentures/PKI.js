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
window.parseCertificate = parseCertificate;
window.createCertificate = createCertificate;
window.verifyCertificate = verifyCertificate;
window.parseCAbundle = parseCAbundle;
window.handleFileBrowse = handleFileBrowse;
window.handleTrustedCertsFile = handleTrustedCertsFile;
window.handleInterCertsFile = handleInterCertsFile;
window.handleCRLsFile = handleCRLsFile;
window.handleCABundle = handleCABundle;
window.handleHashAlgOnChange = handleHashAlgOnChange;
window.handleSignAlgOnChange = handleSignAlgOnChange;

function context(name, func) {}`
		},
		{
			file: "../../test/browser/certificateComplexExample.js",
			format: "es"
		}
	]
};
