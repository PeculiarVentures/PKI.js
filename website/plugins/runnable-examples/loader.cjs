// Wraps an example script as `export default async function run(console) { ... }`,
// so the Run button can execute it any number of times and capture its output.
// Imports and exported declarations, such as the example's `inputs`, stay at the top level,
// so the Run button can read them before running the example.
const ts = require("typescript");

module.exports = function runnableExampleLoader(source) {
  const file = ts.createSourceFile(this.resourcePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const topLevel = [];
  const body = [];

  for (const statement of file.statements) {
    // getFullStart() keeps the comments above the statement with it
    const text = source.slice(statement.getFullStart(), statement.getEnd());
    const exported = ts.canHaveModifiers(statement) && ts.getModifiers(statement)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    if (ts.isImportDeclaration(statement) || exported) {
      topLevel.push(text);
    } else {
      body.push(text);
    }
  }

  return `${topLevel.join("")}\nexport default async function run(console) {${body.join("")}\n}\n`;
};
