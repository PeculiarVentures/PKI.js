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
			file: "../../test/browser/NISTPKITS.js",
			format: "es"
		}
	]
};
