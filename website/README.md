# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

### Installation

The examples run against, and the API pages are generated from, the library source in `../src`, so install the library's dependencies too:

```
$ (cd .. && npm ci)
$ npm install
```

### Local Development

```
$ npm run dev
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service. Run `npm run serve` to preview it locally, and `npm run typecheck` to typecheck the site's own code.

### Examples

Each example in `docs/examples` is a `*.example.ts` script with an `.mdx` page that shows it with a **Run** button. Examples:

- import from `pkijs`, `asn1js`, the helpers in `docs/examples/helpers.ts`, the sample files in `docs/examples/samples`, and `docs/examples/io.ts`;
- print results with `console.log`, which the Run button shows below the code;
- can declare `export const inputs = { ... }` with `file()` and `text()` from `io.ts`. Each input holds sample data until the reader replaces it with controls above the Run button, so the example also runs unattended. Exported declarations stay outside the function the Run button calls, so they may only use imports;
- can offer results as files with `download()` from `io.ts`, which the Run button shows as buttons below the output;
- throw when a result is wrong, so that running them catches regressions;
- are typechecked and run in Node.js against the library source in the website workflow. To do the same locally, run these commands in the repository root:

```
$ npx tsc --noEmit -p website/docs/examples
$ npx vitest run --config website/docs/examples/vitest.config.mts
```

Set `EXAMPLES_OUTPUT=1` to see what the examples print.

The sample files (a CA certificate, and an S/MIME message and a PDF signed with a certificate it issued) are generated into `docs/examples/samples/index.ts`. To recreate them, run `npm run build && node website/docs/examples/samples/generate.mjs` in the repository root.
