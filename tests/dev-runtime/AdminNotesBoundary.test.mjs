import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const repoRoot = process.cwd();
const productionRoots = [
  "account",
  "admin",
  "assets",
  "src/engine",
  "src/shared",
  "toolbox",
];
const allowedAdminMenuLinkPath = "assets/theme-v2/partials/header-nav.html";
const allowedAdminMenuRoutePath = "assets/theme-v2/js/gamefoundry-partials.js";
const allowedAdminMenuHref = "docs_build/dev/admin-notes/index.txt";

const expectedDevNotes = [
  "docs_build/dev/admin-notes/README.md",
  "docs_build/dev/admin-notes/index.txt",
  "docs_build/dev/admin-notes/notes/index.txt",
  "docs_build/dev/admin-notes/other/index.txt",
  "docs_build/dev/admin-notes/quick-reference.txt",
  "docs_build/dev/admin-notes/sample.txt",
];

const retiredProductionFiles = [
  "admin/notes.html",
  "admin/notes/index.txt",
  "admin/notes/other/index.txt",
  "docs_build/dev/admin-notes/notes/Other/index.txt",
];

function repoPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function walkTextFiles(root) {
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
    if (/\.(html|js|mjs|json|md|txt)$/.test(current)) {
      results.push(current);
    }
  }
  return results;
}

function relativePath(absolutePath) {
  return path.relative(repoRoot, absolutePath).replaceAll(path.sep, "/");
}

function allowedAdminMenuLinkOnly(filePath, source) {
  const relative = relativePath(filePath);
  let allowedFragment = "";
  if (relative === allowedAdminMenuLinkPath) {
    allowedFragment = `<a data-nav-link data-route="admin-notes-dev" href="${allowedAdminMenuHref}">Notes (Dev/Admin Only)</a>`;
  }
  if (relative === allowedAdminMenuRoutePath) {
    allowedFragment = `"admin-notes-dev": "${allowedAdminMenuHref}",`;
  }
  if (!allowedFragment || !source.includes(allowedFragment)) {
    return false;
  }
  const remainder = source.replace(allowedFragment, "");
  return !/docs_build\/dev\/admin-notes|docs_build\\dev\\admin-notes|src\/dev-runtime\/admin|src\\dev-runtime\\admin|admin-notes|Admin Notes/.test(remainder);
}

test("Admin Notes dev documents live under docs_build/dev/admin-notes only", () => {
  expectedDevNotes.forEach((filePath) => {
    assert.equal(fs.existsSync(repoPath(filePath)), true, `${filePath} exists`);
  });
  retiredProductionFiles.forEach((filePath) => {
    assert.equal(fs.existsSync(repoPath(filePath)), false, `${filePath} is retired`);
  });
});

test("Admin Notes implementation is isolated under src/dev-runtime/admin", () => {
  assert.equal(
    fs.existsSync(repoPath("src/dev-runtime/admin/admin-notes-viewer.js")),
    true,
    "dev-runtime Admin Notes viewer exists",
  );
});

test("only the admin menu links to dev Admin Notes content", () => {
  const headerSource = fs.readFileSync(repoPath(allowedAdminMenuLinkPath), "utf8");
  assert.match(
    headerSource,
    /data-route="admin-notes-dev" href="docs_build\/dev\/admin-notes\/index\.txt">Notes \(Dev\/Admin Only\)<\/a>/,
    "Admin menu has the dev/admin-only Admin Notes link",
  );
  assert.doesNotMatch(
    headerSource,
    /href="admin\/notes\.html"/,
    "Admin Notes must not restore the retired production route",
  );

  const violations = productionRoots
    .flatMap(walkTextFiles)
    .filter((filePath) => {
      const source = fs.readFileSync(filePath, "utf8");
      if (!/docs_build\/dev\/admin-notes|docs_build\\dev\\admin-notes|src\/dev-runtime\/admin|src\\dev-runtime\\admin|admin-notes|Admin Notes/.test(source)) {
        return false;
      }
      return !allowedAdminMenuLinkOnly(filePath, source);
    })
    .map(relativePath);

  assert.deepEqual(violations, [], "only the Admin menu may expose Admin Notes");
});
