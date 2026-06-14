import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import assert from "node:assert/strict";

const repoRoot = process.cwd();
const browserSurfaceRoots = [
  "account",
  "admin",
  "assets",
  "src/engine",
  "src/shared",
  "toolbox",
];

const movedDevRuntimeFiles = [
  "src/dev-runtime/guest-seeds/palette-source-mock-db.js",
  "src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js",
  "src/dev-runtime/persistence/tool-repositories/game-configuration-mock-repository.js",
  "src/dev-runtime/persistence/tool-repositories/game-design-mock-repository.js",
  "src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js",
  "src/dev-runtime/persistence/tool-repositories/game-journey-mock-repository.js",
  "src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js",
  "src/dev-runtime/seed/server-seed-loader.mjs",
];

const retiredToolboxDevRuntimeFiles = [
  "toolbox/assets/assets-mock-repository.js",
  "toolbox/colors/palette-source-mock-db.js",
  "toolbox/colors/palette-workspace-repository.js",
  "toolbox/game-configuration/game-configuration-mock-repository.js",
  "toolbox/game-design/game-design-mock-repository.js",
  "toolbox/game-journey/game-journey-mock-repository.js",
  "toolbox/game-workspace/game-workspace-mock-repository.js",
];

const retiredBrowserCompatibilityModules = new Set([
  "toolbox/toolRegistry.js",
]);

function repoPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function walkFiles(root) {
  const absoluteRoot = repoPath(root);
  if (!fs.existsSync(absoluteRoot)) {
    return [];
  }
  const results = [];
  const stack = [absoluteRoot];
  while (stack.length) {
    const current = stack.pop();
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      if (current.includes(`${path.sep}src${path.sep}dev-runtime${path.sep}`)) {
        continue;
      }
      fs.readdirSync(current)
        .map((name) => path.join(current, name))
        .forEach((entry) => stack.push(entry));
      continue;
    }
    if (/\.(html|js|mjs)$/.test(current)) {
      results.push(current);
    }
  }
  return results;
}

function relativePath(absolutePath) {
  return path.relative(repoRoot, absolutePath).replaceAll(path.sep, "/");
}

function read(relativePathValue) {
  return fs.readFileSync(repoPath(relativePathValue), "utf8");
}

test("dev-only mock repositories and guest seeds live under src/dev-runtime", () => {
  [
    "src/dev-runtime/auth",
    "src/dev-runtime/persistence",
    "src/dev-runtime/admin",
    "src/dev-runtime/testing",
    "src/dev-runtime/guest-seeds",
  ].forEach((directory) => {
    assert.equal(fs.existsSync(repoPath(directory)), true, `${directory} exists`);
  });

  movedDevRuntimeFiles.forEach((filePath) => {
    assert.equal(fs.existsSync(repoPath(filePath)), true, `${filePath} exists`);
  });

  retiredToolboxDevRuntimeFiles.forEach((filePath) => {
    assert.equal(fs.existsSync(repoPath(filePath)), false, `${filePath} moved out of toolbox`);
  });
});

test("browser and UAT/PROD candidate surfaces do not import src/dev-runtime", () => {
  const violations = browserSurfaceRoots
    .flatMap(walkFiles)
    .filter((filePath) => {
      const source = fs.readFileSync(filePath, "utf8");
      return /src\/dev-runtime|src\\dev-runtime|\.{1,2}\/.*dev-runtime|dev-runtime\//.test(source);
    })
    .map(relativePath);

  assert.deepEqual(
    violations.filter((filePath) => !retiredBrowserCompatibilityModules.has(filePath)),
    [],
    "active browser/UAT/PROD candidate surfaces must not import dev-runtime"
  );
});

test("server Local DB seeds, guest package loading, and reseed use dev-runtime modules", () => {
  const router = read("src/dev-runtime/server/mock-api-router.mjs");
  assert.match(router, /from "\.\.\/seed\/server-seed-loader\.mjs"/);
  assert.match(router, /readDocsBuildGuestSeedPackages\(\)/);
  assert.match(router, /createServerSeedTables\(\)/);
  assert.match(router, /parts\[1\] === "mock-db"/);
  assert.match(router, /parts\[2\] === "seed"/);
  assert.match(router, /parts\[1\] === "guest"/);
  assert.match(router, /parts\[2\] === "seed"/);
  assert.doesNotMatch(router, /toolbox\/(?:assets|colors|game-configuration|game-design|game-journey|game-workspace)\/.*mock-repository/);
  assert.doesNotMatch(router, /toolbox\/colors\/palette-source-mock-db/);
});
