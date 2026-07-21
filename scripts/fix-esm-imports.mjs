import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildDir = resolve(__dirname, "../build/mjs");

/**
 * Walk directory recursively and process all .js files
 */
function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith(".js")) {
      fixImports(fullPath);
    }
  }
}

/**
 * Resolve a relative import specifier from the given file to a real file path.
 * Returns the corrected specifier with proper extension.
 */
function resolveImport(fromFile, specifier) {
  const fromDir = dirname(fromFile);

  // Try as a file with .js extension
  const asFile = resolve(fromDir, specifier + ".js");
  if (existsSync(asFile)) {
    return specifier + ".js";
  }

  // Try as a directory with index.js
  const asDir = resolve(fromDir, specifier, "index.js");
  if (existsSync(asDir)) {
    return specifier + "/index.js";
  }

  // Fallback: add .js
  return specifier + ".js";
}

/**
 * Add .js extension to relative import/export specifiers that lack an extension
 */
function fixImports(filePath) {
  let content = readFileSync(filePath, "utf8");
  const original = content;

  content = content.replace(
    /((?:from|import)\s+["'])(\.\.?\/[^"']*?)(["'])/g,
    (match, prefix, specifier, suffix) => {
      // Skip if already has a known extension
      if (/\.(js|mjs|cjs|json|node)$/.test(specifier)) {
        return match;
      }
      const newSpecifier = resolveImport(filePath, specifier);
      return `${prefix}${newSpecifier}${suffix}`;
    }
  );

  if (content !== original) {
    writeFileSync(filePath, content);
    console.log(`  Fixed: ${filePath}`);
  }
}

console.log("Fixing ESM imports in build/mjs/...");
walk(buildDir);
console.log("Done.");
