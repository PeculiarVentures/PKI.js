import path from "node:path";
import ts from "typescript";
import type { Plugin } from "@docusaurus/types";

const examplesTsconfig = path.resolve(__dirname, "../../docs/examples/tsconfig.json");

/**
 * Turns the `paths` of the examples tsconfig into webpack aliases, so the examples
 * run against the same library source they are typechecked against, without a build.
 */
function aliasesFromTsconfig(configPath: string): Record<string, string> {
  const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile);
  if (error) {
    throw new Error(ts.flattenDiagnosticMessageText(error.messageText, "\n"));
  }

  const paths: Record<string, string[]> = config.compilerOptions?.paths ?? {};
  const aliases: Record<string, string> = {};
  for (const [name, [target]] of Object.entries(paths)) {
    aliases[`${name}$`] = path.resolve(path.dirname(configPath), target);
  }
  return aliases;
}

/**
 * Lets MDX pages load `*.example.ts?run` as a runnable function (see loader.cjs),
 * with `pkijs` resolved to this repository's source instead of a published version.
 */
export default function runnableExamples(): Plugin {
  return {
    name: "runnable-examples",
    configureWebpack() {
      return {
        resolve: {
          alias: aliasesFromTsconfig(examplesTsconfig),
        },
        module: {
          rules: [
            {
              // src/index.ts registers the default crypto engine when it runs. The published
              // build is one module, but the source is many, and `"sideEffects": false` in the
              // root package.json would let webpack drop that registration.
              include: path.resolve(__dirname, "../../../src"),
              sideEffects: true,
            },
            {
              test: /\.example\.ts$/,
              resourceQuery: /run/,
              enforce: "pre",
              use: [path.resolve(__dirname, "loader.cjs")],
            },
          ],
        },
      };
    },
  };
}
