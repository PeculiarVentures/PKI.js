import rollupNodeResolve from "rollup-plugin-node-resolve";
import commonjs from 'rollup-plugin-commonjs';

export default [
	{
		entry: "es6.js",
		dest: "../../test/nodePKCS12Example.js",
		format: "cjs",
		plugins: [
			rollupNodeResolve({ jsnext: true, main: true }),
			commonjs()
		]
	}
];