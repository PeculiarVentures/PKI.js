import rollupNodeResolve from "rollup-plugin-node-resolve";

export default [
	{
        entry: "es6.js",
		dest: "bundle.js",
		format: "iife",
        outro: `
window.verifySMIME = verifySMIME;
window.handleMIMEFile = handleMIMEFile;
window.handleCABundle = handleCABundle;

function context(name, func) {}`,
        plugins: [
            rollupNodeResolve({ jsnext: true, main: true })
        ]
	}
];