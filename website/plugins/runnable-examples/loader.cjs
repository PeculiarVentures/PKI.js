// Wraps an example script as `export default async function run(console) { ... }`,
// so the Run button can execute it any number of times and capture its output.
// Imports are hoisted out of the function and must each fit on one line.
module.exports = function runnableExampleLoader(source) {
  const imports = [];
  const body = [];

  for (const line of source.split("\n")) {
    if (/^import\s/.test(line)) {
      if (!line.trimEnd().endsWith(";")) {
        throw new Error(`${this.resourcePath}: imports in examples must fit on one line`);
      }
      imports.push(line);
    } else {
      body.push(line);
    }
  }

  return `${imports.join("\n")}\nexport default async function run(console) {\n${body.join("\n")}\n}\n`;
};
