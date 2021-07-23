module.exports = {
	"env": {
		"browser": true,
		"es6": true,
		"node": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"sourceType": "module",
		"ecmaVersion": 2017
	},
	"rules": {
		"indent": [
			"error",
			"tab",
			{"SwitchCase": 1, "ignoredNodes": ["SwitchCase > BlockStatement"]}
		],
		"linebreak-style": [
			"error",
			"windows"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		],
		"no-empty": [
			"error",
			{"allowEmptyCatch": true}
		],
		"no-fallthrough": [
			"error",
			{"commentPattern": "break[\\s\\w]*omitted"}
		],
		"no-unused-vars": [
			"error",
			{"args": "none"}
		],
		"brace-style": [
			"error",
			"allman"
		],
		"keyword-spacing": [
			"error",
			{ "overrides": {
				"if": { "after": false },
				"for": { "after": false },
				"while": { "after": false },
				"catch": { "after": false },
			}} 
		]
	}
};
