import rollupNodeResolve from "rollup-plugin-node-resolve";
import fs from 'fs';

export default {
	input: "es6.js",
	plugins: [
		rollupNodeResolve({
			jsnext: true,
			main: true
		})
	],
	output: [{
			file: "bundle.js",
			format: "iife",
			outro: `
${fs.readFileSync('./elliptic.min.js', {'encoding':'utf8'})};
${fs.readFileSync('./webcrypto-liner.shim.js', {'encoding':'utf8'})};
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
window.handleCurveOnChange = handleCurveOnChange;
function context(name, func) {}`
		},
		{
			file: "../../test/browser/certificateComplexExample.js",
			format: "es"
		}
	]
};