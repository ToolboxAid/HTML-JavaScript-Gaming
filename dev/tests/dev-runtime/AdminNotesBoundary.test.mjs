import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import { handleAdminNotesDirectoryApiRequest } from "../../../api/admin/admin-notes-directory.mjs";
import {
  ADMIN_NOTES_LOCAL_MENU_LABEL,
  ADMIN_NOTES_LOCAL_SOURCE_PATH,
  ADMIN_NOTES_LOCAL_VIEWER_PATH,
  ADMIN_MY_STUFF_MENU_LABEL,
  localAdminNotesHeaderPartialPath,
} from "../../../api/admin/admin-notes-menu.mjs";

const repoRoot = process.cwd();
const productionRoots = [
  "www/account",
  "www/admin",
  "www/assets",
  "www/owner",
  "www/src/engine",
  "www/src/shared",
  "www/toolbox",
];

const expectedDevNotes = [
  "dev/archive/legacy-docs-build/admin-notes/BusinessPlan.txt",
  "dev/archive/legacy-docs-build/admin-notes/index.txt",
  "dev/archive/legacy-docs-build/admin-notes/notes/index.txt",
  "dev/archive/legacy-docs-build/admin-notes/other/index.txt",
  "dev/archive/legacy-docs-build/admin-notes/PS_commands.txt",
  "dev/archive/legacy-docs-build/admin-notes/roadmap2MVP.txt",
  "dev/archive/legacy-docs-build/admin-notes/sample.txt",
  "dev/archive/legacy-docs-build/admin-notes/tools/index.txt",
  "www/src/dev-runtime/admin/notes.html",
];

const retiredProductionFiles = [
  "www/admin/notes.html",
  "src/dev-runtime/admin/admin-notes.html",
  "www/admin/notes/index.txt",
  "www/admin/notes/other/index.txt",
  "dev/archive/legacy-docs-build/admin-notes/notes/Other/index.txt",
];

const devOnlyAdminLabels = [
  "DB Viewer",
  "Design System",
  "Environments",
  "Game Migration",
  "Grouping Colors",
  "Notes",
];

const uatProdAdminLabels = [
  "Analytics",
  "Branding",
  "Controls",
  "Moderation",
  "Platform Settings",
  "Ratings",
  "Roles",
  "Site Settings",
  "Themes",
  "Users",
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

function extractAnchorLabels(source) {
  return [...source.matchAll(/<a\b[^>]*>(.*?)<\/a>/g)].map((match) =>
    match[1].replace(/<[^>]*>/g, "").trim()
  );
}

class CapturedJsonResponse {
  constructor() {
    this.body = "";
    this.headers = {};
    this.statusCode = 200;
  }

  setHeader(name, value) {
    this.headers[name.toLowerCase()] = value;
  }

  end(body) {
    this.body = String(body || "");
  }
}

async function adminNotesDirectoryPayload(folderPath, root = repoRoot) {
  const response = new CapturedJsonResponse();
  const requestUrl = new URL("http://127.0.0.1/api/dev/admin-notes/directory");
  if (folderPath !== undefined) {
    requestUrl.searchParams.set("folder", folderPath);
  }
  const handled = await handleAdminNotesDirectoryApiRequest(requestUrl, response, { repoRoot: root });
  assert.equal(handled, true, "Admin Notes API directory request should be handled");
  return {
    payload: JSON.parse(response.body),
    statusCode: response.statusCode,
  };
}

function makeTempRepoRoot() {
  fs.mkdirSync(repoPath("dev/workspace/tmp"), { recursive: true });
  return fs.mkdtempSync(path.join(repoPath("dev/workspace/tmp"), "admin-notes-boundary-"));
}

test("Admin Notes dev files and local viewer entrypoint exist", () => {
  expectedDevNotes.forEach((filePath) => {
    assert.equal(fs.existsSync(repoPath(filePath)), true, `${filePath} exists`);
  });
  retiredProductionFiles.forEach((filePath) => {
    assert.equal(fs.existsSync(repoPath(filePath)), false, `${filePath} is retired`);
  });
});

test("Admin Notes browser viewer stays under www/src/dev-runtime/admin while server helpers live under api/admin", () => {
  assert.equal(
    fs.existsSync(repoPath("www/src/dev-runtime/admin/admin-notes-viewer.js")),
    true,
    "legacy Admin Notes viewer exists",
  );
  assert.equal(
    fs.existsSync(repoPath("api/admin/admin-notes-directory.mjs")),
    true,
    "API Admin Notes directory handler exists",
  );
  assert.equal(
    fs.existsSync(repoPath("api/admin/admin-notes-menu.mjs")),
    true,
    "API Admin Notes local menu route helper exists",
  );
  assert.equal(
    fs.existsSync(repoPath("www/src/dev-runtime/admin/header-nav.local.html")),
    true,
    "dev-runtime local header partial exists",
  );
});

test("Admin Notes local viewer page uses external dev-runtime JavaScript only", () => {
  const viewerSource = fs.readFileSync(repoPath("www/src/dev-runtime/admin/notes.html"), "utf8");
  assert.doesNotMatch(viewerSource, /<script(?![^>]*\bsrc=)/i, "viewer page must not contain inline scripts");
  assert.doesNotMatch(viewerSource, /<style\b/i, "viewer page must not contain style blocks");
  assert.doesNotMatch(viewerSource, /\son[a-z]+\s*=/i, "viewer page must not contain inline event handlers");
  assert.match(
    viewerSource,
    /<script type="module" src="src\/dev-runtime\/admin\/admin-notes-viewer\.js"><\/script>/,
    "viewer page loads its external dev-runtime viewer script",
  );
  assert.match(viewerSource, /<div data-partial="header-nav"><\/div>/, "viewer page uses the shared header partial slot");
  assert.match(viewerSource, /<div data-partial="footer"><\/div>/, "viewer page uses the shared footer partial slot");
  assert.match(viewerSource, /assets\/theme-v2\/js\/gamefoundry-partials\.js/, "viewer page loads shared Theme V2 partial wiring");
});

test("Owner Notes route is the only production-facing Admin Notes viewer route", () => {
  const ownerNotesSource = fs.readFileSync(repoPath("www/owner/notes.html"), "utf8");
  assert.doesNotMatch(ownerNotesSource, /<script(?![^>]*\bsrc=)/i, "Owner Notes page must not contain inline scripts");
  assert.doesNotMatch(ownerNotesSource, /<style\b/i, "Owner Notes page must not contain style blocks");
  assert.doesNotMatch(ownerNotesSource, /\son[a-z]+\s*=/i, "Owner Notes page must not contain inline event handlers");
  assert.match(ownerNotesSource, /data-owner-notes/, "Owner Notes page keeps Owner route marker");
  assert.match(ownerNotesSource, /data-admin-notes-viewer/, "Owner Notes page reuses the Admin Notes viewer pattern");
  assert.match(ownerNotesSource, /dev\/archive\/legacy-docs-build\/admin-notes/, "Owner Notes page points at the admin-notes source folder");
  assert.match(ownerNotesSource, /\.\.\/src\/dev-runtime\/admin\/admin-notes-viewer\.js/, "Owner Notes page reuses the existing viewer script");
  assert.doesNotMatch(ownerNotesSource, /Game Journey owns note editing|Open Game Journey/, "Owner Notes page must not use the old placeholder workflow");
});

test("production-facing paths only expose Admin Notes through Owner Notes", () => {
  const headerSource = fs.readFileSync(repoPath("www/assets/theme-v2/partials/header-nav.html"), "utf8");
  assert.doesNotMatch(headerSource, /dev\/archive\/legacy-docs-build\/admin-notes|admin-notes-dev|data-admin-notes-local-menu|data-admin-my-stuff-menu|My Stuff|Admin Notes/);
  for (const label of devOnlyAdminLabels) {
    assert.doesNotMatch(headerSource, new RegExp(`>${label}<\\/a>`), `production Admin menu omits dev-only ${label}`);
  }

  const violations = productionRoots
    .flatMap(walkTextFiles)
    .filter((filePath) => {
      if (relativePath(filePath) === "owner/notes.html") {
        return false;
      }
      if (relativePath(filePath) === "www/owner/notes.html") {
        return false;
      }
      const source = fs.readFileSync(filePath, "utf8");
      return /dev\/archive\/legacy-docs-build\/admin-notes|dev\\archive\\legacy-docs-build\\admin-notes|src\/dev-runtime\/admin|src\\dev-runtime\\admin|data-admin-my-stuff-menu|My Stuff|admin-notes|Admin Notes/.test(source);
    })
    .map(relativePath);

  assert.deepEqual(violations, [], "production-facing paths must not expose Admin Notes");
});

test("Admin Notes directory API is read-only, sorted, and restricted to dev/archive/legacy-docs-build/admin-notes", async () => {
  assert.equal(fs.existsSync(repoPath("dev/archive/legacy-docs-build/admin-notes")), true, "Admin Notes source directory exists");

  const rootListing = await adminNotesDirectoryPayload("dev/archive/legacy-docs-build/admin-notes");
  assert.equal(rootListing.statusCode, 200);
  assert.equal(rootListing.payload.ok, true);
  assert.equal(rootListing.payload.folderPath, "dev/archive/legacy-docs-build/admin-notes");
  assert.ok(rootListing.payload.entries.length > 0, "Admin Notes directory has entries");
  assert.ok(
    rootListing.payload.entries.every((entry) => entry.path.startsWith("dev/archive/legacy-docs-build/admin-notes/")),
    "Admin Notes entries stay under the source folder",
  );
  assert.deepEqual(
    rootListing.payload.entries.map((entry) => entry.label),
    rootListing.payload.entries.map((entry) => entry.label).sort((left, right) => left.localeCompare(right)),
    "Admin Notes entries are sorted alphabetically",
  );
  assert.ok(
    rootListing.payload.entries.some((entry) => entry.path === "dev/archive/legacy-docs-build/admin-notes/sample.txt"),
    "Admin Notes list includes an existing text file from the source folder",
  );
  assert.ok(
    rootListing.payload.entries.some((entry) => entry.path === "dev/archive/legacy-docs-build/admin-notes/notes/index.txt"),
    "Admin Notes list includes a folder index from the source folder",
  );

  const traversal = await adminNotesDirectoryPayload("dev/archive/legacy-docs-build/admin-notes/../../reports");
  assert.equal(traversal.statusCode, 403);
  assert.equal(traversal.payload.ok, false);
  assert.match(traversal.payload.error, /restricted to dev\/archive\/legacy-docs-build\/admin-notes/);

  const missingRoot = makeTempRepoRoot();
  try {
    const missing = await adminNotesDirectoryPayload("dev/archive/legacy-docs-build/admin-notes", missingRoot);
    assert.equal(missing.statusCode, 404);
    assert.equal(missing.payload.ok, false);
    assert.match(missing.payload.error, /folder not found/i);
  } finally {
    fs.rmSync(missingRoot, { force: true, recursive: true });
  }

  const emptyRoot = makeTempRepoRoot();
  try {
    fs.mkdirSync(path.join(emptyRoot, "dev/archive/legacy-docs-build/admin-notes"), { recursive: true });
    const empty = await adminNotesDirectoryPayload("dev/archive/legacy-docs-build/admin-notes", emptyRoot);
    assert.equal(empty.statusCode, 200);
    assert.equal(empty.payload.ok, true);
    assert.deepEqual(empty.payload.entries, []);
  } finally {
    fs.rmSync(emptyRoot, { force: true, recursive: true });
  }
});

test("local header partial does not create a competing Admin Notes menu", () => {
  const headerPath = repoPath("www/assets/theme-v2/partials/header-nav.html");
  const source = fs.readFileSync(headerPath, "utf8");
  const localHeaderPath = localAdminNotesHeaderPartialPath(repoRoot, headerPath);
  const servedHeader = fs.readFileSync(localHeaderPath, "utf8");

  assert.equal(relativePath(localHeaderPath), "www/src/dev-runtime/admin/header-nav.local.html");
  assert.doesNotMatch(servedHeader, /data-admin-notes-local-menu|data-admin-my-stuff-menu|data-admin-my-stuff-separator|Admin Notes/);
  assert.doesNotMatch(servedHeader, new RegExp(ADMIN_NOTES_LOCAL_SOURCE_PATH.replace(/\//g, "\\/")));
  assert.doesNotMatch(servedHeader, new RegExp(ADMIN_NOTES_LOCAL_VIEWER_PATH.replace(/\//g, "\\/")));
  assert.doesNotMatch(servedHeader, new RegExp(`>${ADMIN_NOTES_LOCAL_MENU_LABEL}<\\/a>`));
  assert.doesNotMatch(servedHeader, new RegExp(`>${ADMIN_MY_STUFF_MENU_LABEL}<\\/a>`));
  assert.doesNotMatch(source, /data-admin-notes-local-menu|Admin Notes/);
  assert.equal(localAdminNotesHeaderPartialPath(repoRoot, repoPath("www/account/sign-in.html")), repoPath("www/account/sign-in.html"));
});

test("Admin page left menus use dynamic placeholders without Notes duplication", () => {
  const adminDir = repoPath("www/admin");
  const pages = fs.readdirSync(adminDir).filter((name) => name.endsWith(".html")).sort();
  const checkedPages = [];

  for (const pageName of pages) {
    const source = fs.readFileSync(path.join(adminDir, pageName), "utf8");
    if (!/data-admin-tool-menu/.test(source)) {
      continue;
    }
    checkedPages.push(pageName);
    for (const label of devOnlyAdminLabels) {
      assert.doesNotMatch(source, new RegExp(`>${label}<\\/a>`), `${pageName} left menu omits ${label}`);
    }
    assert.doesNotMatch(source, /dev\/archive\/legacy-docs-build\/admin-notes|src\/dev-runtime\/admin|admin-notes|Admin Notes/);
  }

  assert.ok(checkedPages.length > 0, "Admin pages with side menus were checked");
});
