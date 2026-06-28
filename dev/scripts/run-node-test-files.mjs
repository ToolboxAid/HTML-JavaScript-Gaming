/*
Toolbox Aid
David Quesenberry
05/26/2026
run-node-test-files.mjs
*/
import path from "node:path";
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const ROOT_ALIASES = new Map([
  ["/assets/", "www/assets/"],
  ["/src/", "src/"],
  ["/toolbox/", "www/toolbox/"],
]);

registerHooks({
  resolve(specifier, context, nextResolve) {
    const alias = [...ROOT_ALIASES.entries()].find(([prefix]) => specifier.startsWith(prefix));
    if (alias) {
      const [prefix, targetRoot] = alias;
      const resolved = pathToFileURL(path.join(repoRoot, targetRoot, specifier.slice(prefix.length))).href;
      return nextResolve(resolved, context);
    }
    return nextResolve(specifier, context);
  }
});

class MemoryStorage {
  #items = new Map();

  get length() {
    return this.#items.size;
  }

  clear() {
    this.#items.clear();
  }

  getItem(key) {
    const normalizedKey = String(key);
    return this.#items.has(normalizedKey) ? this.#items.get(normalizedKey) : null;
  }

  key(index) {
    return Array.from(this.#items.keys())[index] ?? null;
  }

  removeItem(key) {
    this.#items.delete(String(key));
  }

  setItem(key, value) {
    this.#items.set(String(key), String(value));
  }
}

function installFreshStorage() {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: new MemoryStorage(),
    writable: true
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: new MemoryStorage(),
    writable: true
  });
}

function toRepoRelative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, "/");
}

function resolveTestPath(inputPath) {
  const absolutePath = path.resolve(repoRoot, inputPath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Test file does not exist: ${inputPath}`);
  }
  return absolutePath;
}

const testFiles = process.argv.slice(2).filter((argument) => !argument.startsWith("--"));

if (testFiles.length === 0) {
  console.error("Usage: node ./dev/scripts/run-node-test-files.mjs <test-file> [test-file...]");
  process.exit(1);
}

let passed = 0;

for (const inputPath of testFiles) {
  const absolutePath = resolveTestPath(inputPath);
  const displayPath = toRepoRelative(absolutePath);
  installFreshStorage();
  const moduleUrl = `${pathToFileURL(absolutePath).href}?laneRun=${Date.now()}-${passed}`;
  const testModule = await import(moduleUrl);
  if (typeof testModule.run === "function") {
    await testModule.run();
  }
  installFreshStorage();
  passed += 1;
  console.log(`PASS ${displayPath}`);
}

console.log(`\n${passed}/${testFiles.length} targeted node test file(s) passed.`);
