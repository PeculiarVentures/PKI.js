import rollupNodeResolve from "rollup-plugin-node-resolve";

export default [
	{
        entry: "es6.js",
		dest: "bundle.js",
		format: "iife",
        outro: `
window.createCertificate = createCertificate;
window.smimeEncrypt = smimeEncrypt;
window.smimeDecrypt = smimeDecrypt;
window.handleHashAlgOnChange = handleHashAlgOnChange;
window.handleSignAlgOnChange = handleSignAlgOnChange;
window.handleEncAlgOnChange = handleEncAlgOnChange;
window.handleEncLenOnChange = handleEncLenOnChange;

function context(name, func) {}`,
        plugins: [
            rollupNodeResolve({ jsnext: true, main: true })
        ]
	}
];