# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

### Installation

The API pages are generated from the library source in `../src`, so install the library's dependencies too:

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
