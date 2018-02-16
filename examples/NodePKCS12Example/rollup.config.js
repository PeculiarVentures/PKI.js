import rollupNodeResolve from "rollup-plugin-node-resolve";
import commonjs from 'rollup-plugin-commonjs';

export default {
	input: "es6.js",
	plugins: [
		rollupNodeResolve({ jsnext: true, main: true }),
		commonjs()
	],
	output: {
		file: "../../test/nodePKCS12Example.js",
		format: "cjs"
	}
};
