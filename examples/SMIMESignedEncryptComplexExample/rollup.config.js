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
window.SMIMEHandler = SMIMEHandler;
window.handleHashAlgOnChange = handleHashAlgOnChange;
window.handleSignAlgOnChange = handleSignAlgOnChange;
window.handleEncAlgOnChange = handleEncAlgOnChange;
window.handleEncLenOnChange = handleEncLenOnChange;
window.handleOAEPHashAlgOnChange = handleOAEPHashAlgOnChange;
window.parseCMSSigned = parseCMSSigned;
// window.createCMSSigned = createCMSSigned;
window.verifyCMSSigned = verifyCMSSigned;
window.parseCAbundle = parseCAbundle;
window.handleFileBrowse = handleFileBrowse;
window.handleParsingFile = handleParsingFile;
window.handleCABundle = handleCABundle;
window.handleHashAlgOnChange = handleHashAlgOnChange;
window.handleSignAlgOnChange = handleSignAlgOnChange;
window.handleAddExtOnChange = handleAddExtOnChange;
window.handleDetachedSignatureOnChange = handleDetachedSignatureOnChange;
window.stringToArrayBuffer = stringToArrayBuffer;
window.verifyCertificate = verifyCertificate;
window.handleInterCertsFile = handleInterCertsFile;
window.handleTrustedCertsFile = handleTrustedCertsFile;
window.handleTrustedCertsText = handleTrustedCertsText;

function context(name, func) {}`
       }
};
