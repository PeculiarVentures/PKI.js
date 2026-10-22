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

- import from `pkijs`, `asn1js`, and the `createIdentity` helper in `docs/examples/helpers.ts`, with each import on one line;
- print results with `console.log`, which the Run button shows below the code;
- throw when a result is wrong, so that running them catches regressions;
- are typechecked and run in Node.js against the library source in the website workflow. To do the same locally, run these commands in the repository root:

```
$ npx tsc --noEmit -p website/docs/examples
$ npx vitest run --config website/docs/examples/vitest.config.mts
```

Set `EXAMPLES_OUTPUT=1` to see what the examples print.
