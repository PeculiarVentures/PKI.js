import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  {
    ignores: ["website/**/*", "**/*.js", "build/**/*.ts"]
  },
  {
    plugins: {
      "@typescript-eslint": tseslint
    }
  },
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json"
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/ban-ts-ignore": "off",
      "@typescript-eslint/camelcase": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-duplicate-imports": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/triple-slash-reference": "off",
      "no-trailing-spaces": "warn",
      "no-redeclare": "off",
      "no-dupe-class-members": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
    ignores: [
      "build/**/*.ts",
      "**/*.js",
      "website"
    ]
  },
  {
    files: ["test/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json"
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha
      }
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/ban-ts-ignore": "off",
      "@typescript-eslint/camelcase": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-duplicate-imports": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/triple-slash-reference": "off",
      "no-trailing-spaces": "warn",
      "no-redeclare": "off",
      "no-dupe-class-members": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }]
    }
  }
];