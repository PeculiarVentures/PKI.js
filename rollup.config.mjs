import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));

const LICENSE = fs.readFileSync("LICENSE", { encoding: "utf-8" });
const banner = [
  "/*!",
  ...LICENSE.split("\n").map(o => ` * ${o}`),
  " */",
  "",
].join("\n");
const input = "src/index.ts";
const external = Object.keys(pkg.dependencies || {});
external.push('@noble/hashes/sha1');
external.push('@noble/hashes/sha2');

export default [
  {
    input,
    plugins: [
      typescript({
        check: true,
        clean: true,
        tsconfigOverride: {
          compilerOptions: {
            module: "ES2020",
            removeComments: true,
          }
        }
      }),
    ],
    external: [...external],
    output: [
      {
        banner,
        file: pkg.main,
        format: "cjs",
      },
      {
        banner,
        file: pkg.module,
        format: "es",
      },
    ],
  },
  {
    input,
    external: [...external],
    plugins: [
      dts({
        tsconfig: path.resolve(__dirname, "./tsconfig.json")
      })
    ],
    output: [
      {
        banner,
        file: pkg.types,
      }
    ]
  },
];