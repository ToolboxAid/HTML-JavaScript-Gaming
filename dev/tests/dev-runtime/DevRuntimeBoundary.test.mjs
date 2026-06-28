import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import assert from "node:assert/strict";

const repoRoot = process.cwd();
const browserSurfaceRoots = [
  "www/account",
  "www/admin",
  "www/assets",
  "www/owner",
  "src/engine",
  "src/shared",
  "www/toolbox",
];

const movedDevRuntimeFiles = [
  "api/guest-seeds/palette-source-mock-db.js",
  "api/persistence/tool-repositories/assets-mock-repository.js",
  "api/persistence/tool-repositories/palette-workspace-repository.js",
  "api/persistence/tool-repositories/game-journey-mock-repository.js",
  "api/persistence/tool-repositories/game-workspace-mock-repository.js",
  "api/seed/server-seed-loader.mjs",
];

const retiredToolboxDevRuntimeFiles = [
  "www/toolbox/assets/assets-mock-repository.js",
  "www/toolbox/colors/palette-source-mock-db.js",
  "www/toolbox/colors/palette-workspace-repository.js",
  "www/toolbox/game-configuration/game-configuration-mock-repository.js",
  "www/toolbox/game-design/game-design-mock-repository.js",
  "www/toolbox/game-journey/game-journey-mock-repository.js",
  "www/toolbox/game-hub/game-workspace-mock-repository.js",
];

const retiredBrowserCompatibilityModules = new Set([
  "www/owner/notes.html",
  "www/toolbox/toolRegistry.js",
]);

const retiredAlfaMockRepositories = [
  "api/persistence/tool-repositories/tags-mock-repository.js",
  "api/persistence/tool-repositories/game-design-mock-repository.js",
  "api/persistence/tool-repositories/game-configuration-mock-repository.js",
];

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

function walkActiveCodeFiles(root) {
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
      fs.readdirSync(current)
        .map((name) => path.join(current, name))
        .forEach((entry) => stack.push(entry));
      continue;
    }
    if (/\.(js|mjs)$/.test(current)) {
      results.push(current);
    }
  }
  return results;
}

test("server API mock repositories and guest seeds live under api", () => {
  [
    "api/auth",
    "api/persistence",
    "api/admin",
    "api/testing",
    "api/guest-seeds",
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

test("browser and UAT/PROD candidate surfaces do not import API runtime implementation", () => {
  const violations = browserSurfaceRoots
    .flatMap(walkFiles)
    .filter((filePath) => {
      const source = fs.readFileSync(filePath, "utf8");
      return /src\/dev-runtime|src\\dev-runtime|\.{1,2}\/.*dev-runtime|dev-runtime\/|from\s+["'][^"']*(?:\.\.?\/)+api\/|import\(["'][^"']*(?:\.\.?\/)+api\//.test(source);
    })
    .map(relativePath);

  assert.deepEqual(
    violations.filter((filePath) => !retiredBrowserCompatibilityModules.has(filePath)),
    [],
    "active browser/UAT/PROD candidate surfaces must not import API runtime implementation"
  );
});

test("server seed loading and guest package loading use API modules while preserving existing database compatibility routes", () => {
  const router = read("api/server/local-api-router.mjs");
  assert.match(router, /from "\.\.\/seed\/server-seed-loader\.mjs"/);
  assert.match(router, /readDocsBuildGuestSeedPackages\(\)/);
  assert.match(router, /createServerSeedTables\(\)/);
  assert.match(router, /parts\[1\] === "local-db"/);
  assert.match(router, /mock-db-state/);
  assert.match(router, /parts\[1\] === "guest"/);
  assert.match(router, /parts\[2\] === "seed"/);
  assert.doesNotMatch(router, /toolbox\/(?:assets|colors|game-configuration|game-design|game-journey|game-hub)\/.*mock-repository/);
  assert.doesNotMatch(router, /toolbox\/colors\/palette-source-mock-db/);
});

test("Alfa Creator tools route through API database services, not retired mock repositories", () => {
  retiredAlfaMockRepositories.forEach((filePath) => {
    assert.equal(fs.existsSync(repoPath(filePath)), false, `${filePath} is retired`);
  });

  const router = read("api/server/local-api-router.mjs");
  assert.match(router, /from "\.\.\/toolbox-api\/alfa-tool-services\.mjs"/);
  assert.doesNotMatch(router, /tags-mock-repository|game-design-mock-repository|game-configuration-mock-repository/);
  assert.doesNotMatch(router, /createTagsToolMockRepository|createGameDesignMockRepository|createGameConfigurationMockRepository/);
  assert.match(router, /createTagsApiService/);
  assert.match(router, /createGameDesignApiService/);
  assert.match(router, /createGameConfigurationApiService/);
});

test("active code does not import retired Alfa mock repository modules", () => {
  const forbidden = [
    "tags-mock-repository",
    "game-design-mock-repository",
    "game-configuration-mock-repository",
    "createTagsToolMockRepository",
    "createGameDesignMockRepository",
    "createGameConfigurationMockRepository",
  ];
  const violations = ["api", "src", "dev/tests", "www/assets", "www/toolbox"]
    .flatMap(walkActiveCodeFiles)
    .filter((filePath) => relativePath(filePath) !== "dev/tests/dev-runtime/DevRuntimeBoundary.test.mjs")
    .filter((filePath) => {
      const source = fs.readFileSync(filePath, "utf8");
      return forbidden.some((token) => source.includes(token));
    })
    .map(relativePath);

  assert.deepEqual(violations, [], "active JS/MJS must not import retired Alfa mock repositories");
});
