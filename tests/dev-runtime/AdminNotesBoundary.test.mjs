import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import {
  ADMIN_NOTES_LOCAL_MENU_LABEL,
  ADMIN_NOTES_LOCAL_VIEWER_PATH,
  localAdminNotesMenuContent,
} from "../../src/dev-runtime/admin/admin-notes-menu.mjs";

const repoRoot = process.cwd();
const productionRoots = [
  "account",
  "admin",
  "assets",
  "src/engine",
  "src/shared",
  "toolbox",
];

const expectedDevNotes = [
  "docs_build/dev/admin-notes/README.md",
  "docs_build/dev/admin-notes/index.txt",
  "docs_build/dev/admin-notes/notes/index.txt",
  "docs_build/dev/admin-notes/other/index.txt",
  "docs_build/dev/admin-notes/quick-reference.txt",
  "docs_build/dev/admin-notes/sample.txt",
  "src/dev-runtime/admin/admin-notes.html",
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

test("Admin Notes dev files and local viewer entrypoint exist", () => {
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
  assert.equal(
    fs.existsSync(repoPath("src/dev-runtime/admin/admin-notes-directory.mjs")),
    true,
    "dev-runtime Admin Notes directory handler exists",
  );
  assert.equal(
    fs.existsSync(repoPath("src/dev-runtime/admin/admin-notes-menu.mjs")),
    true,
    "dev-runtime Admin Notes local menu injector exists",
  );
});

test("Admin Notes local viewer page uses external dev-runtime JavaScript only", () => {
  const viewerSource = fs.readFileSync(repoPath("src/dev-runtime/admin/admin-notes.html"), "utf8");
  assert.doesNotMatch(viewerSource, /<script(?![^>]*\bsrc=)/i, "viewer page must not contain inline scripts");
  assert.doesNotMatch(viewerSource, /<style\b/i, "viewer page must not contain style blocks");
  assert.doesNotMatch(viewerSource, /\son[a-z]+\s*=/i, "viewer page must not contain inline event handlers");
  assert.match(
    viewerSource,
    /<script type="module" src="\.\/admin-notes-viewer\.js"><\/script>/,
    "viewer page loads its external dev-runtime viewer script",
  );
});

test("production-facing paths do not link to dev Admin Notes files or implementation", () => {
  const headerSource = fs.readFileSync(repoPath("assets/theme-v2/partials/header-nav.html"), "utf8");
  assert.doesNotMatch(headerSource, /docs_build\/dev\/admin-notes|admin-notes-dev|data-admin-notes-local-menu|Admin Notes/);

  const violations = productionRoots
    .flatMap(walkTextFiles)
    .filter((filePath) => {
      const source = fs.readFileSync(filePath, "utf8");
      return /docs_build\/dev\/admin-notes|docs_build\\dev\\admin-notes|src\/dev-runtime\/admin|src\\dev-runtime\\admin|admin-notes|Admin Notes/.test(source);
    })
    .map(relativePath);

  assert.deepEqual(violations, [], "production-facing paths must not expose Admin Notes");
});

test("local dev server injects Admin Notes into the served Admin menu only", () => {
  const headerPath = repoPath("assets/theme-v2/partials/header-nav.html");
  const source = fs.readFileSync(headerPath);
  const servedHeader = localAdminNotesMenuContent(repoRoot, headerPath, source).toString("utf8");

  assert.match(servedHeader, /data-admin-notes-local-menu/);
  assert.match(servedHeader, /data-nav-link data-admin-notes-local-menu/);
  assert.match(servedHeader, new RegExp(ADMIN_NOTES_LOCAL_VIEWER_PATH.replace(/\//g, "\\/")));
  assert.match(servedHeader, new RegExp(ADMIN_NOTES_LOCAL_MENU_LABEL.replace(/[()]/g, "\\$&")));
  assert.ok(
    servedHeader.indexOf("data-admin-notes-local-menu") < servedHeader.indexOf('data-route="admin-analytics"'),
    "local Admin Notes menu entry is sorted before Analytics",
  );
  assert.doesNotMatch(source.toString("utf8"), /data-admin-notes-local-menu/);
});
