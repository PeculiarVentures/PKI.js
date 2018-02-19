let pkg = require("./package.json");
let external = Object.keys(pkg.dependencies);

export default {
    entry: pkg["jsnext:main"],
    plugins: [],
    external: external,
    targets: [
        {
            dest: pkg.main,
            format: "cjs"
        }
    ]
};
