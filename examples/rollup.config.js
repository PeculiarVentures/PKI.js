import fs from "fs";
import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import pkg from "../package.json";

const LICENSE = fs.readFileSync("LICENSE", { encoding: "utf-8" });
const banner = [
  "/*!",
  ...LICENSE.split("\n").map(o => ` * ${o}`),
  " */",
  "",
].join("\n");
const input = "src/index.ts";
const external = Object.keys(pkg.dependencies || {});

const pkijsName = "pkijs.es.js";

export default [
  // unpkg
  {
    input,
    plugins: [
      alias({
        entries: [
          { find: /^([^.].*)$/, replacement: "https://unpkg.com/$1@latest?module" },
        ],
      }),
      typescript({
        check: true,
        clean: true,
        tsconfigOverride: {
          compilerOptions: {
            module: "ES2015",
            removeComments: true,
          }
        }
      }),
    ],
    external: [/^https:\/\/unpkg\.com/],
    output: [
      {
        banner,
        file: `examples/${pkijsName}`,
        format: "es",
      },
    ],
  },
  // examples
  ...[
    "CertificateComplexExample",
    "CMSSignedComplexExample",
    "CRLComplexExample",
    "HowToEncryptCMSviaCertificate",
    "HowToEncryptCMSviaKey",
    "HowToEncryptCMSviaPassword",
    "OCSPRequestComplexExample",
    "OCSPResponseComplexExample",
    "OpenSSLPrivateKeyEncryption",
    "P7BSimpleExample",
    "PDFExample",
    "PKCS10ComplexExample",
    "PKCS12SimpleExample",
    "SMIMEEncryptionExample",
    "SMIMEVerificationExample",
    "TSPRequestComplexExample",
    "TSPResponseComplexExample",
  ].map(o => {
    const dir = `examples/${o}`
    const input = `${dir}/es6.ts`
    const output = `${dir}/bundle.js`

    return {
      input,
      plugins: [
        alias({
          entries: [
            ...[
              "punycode",
              ...Object.keys(pkg.dependencies || {})
            ].map(o => {
              return { find: o, replacement: `https://unpkg.com/${o}@latest?module` };
            }),
            { find: "../src", replacement: `../examples/${pkijsName}` },
            { find: "../../src", replacement: `../${pkijsName}` },
          ],
        }),
        commonjs(),
        nodeResolve(),
        typescript({
          check: true,
          clean: true,
          tsconfigOverride: {
            compilerOptions: {
              module: "ES2020",
            }
          }
        }),
      ],
      external: ["crypto", /^https:\/\/unpkg\.com/, /pkijs\.es\.js$/],
      output: [
        {
          file: output,
          format: "es",
        },
      ],
    };
  }),
];