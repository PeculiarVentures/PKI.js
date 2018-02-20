let pkg = require("./package.json");
let external = Object.keys(pkg.dependencies);

export default {
    input: pkg["jsnext:main"],
    plugins: [],
    external: external,
    output: [
        {
            file: pkg.main,
            format: "cjs"
        }
    ]
};
