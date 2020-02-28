const presets = [
	[
		"@babel/env",
		{
			"targets": {
				"node": "6.0"
			}
		}
	]
];

const compact = false;

const env = {
	"test": {
		"plugins": [
			"istanbul"
		]
	}
};

module.exports = { compact, presets, env };
