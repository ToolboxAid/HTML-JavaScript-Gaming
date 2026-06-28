import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import {
  getAdminNavigationItems,
  getOwnerNavigationItems,
} from "../../../src/api/admin-owner-navigation.js";

const ACTIVE_SCAN_ROOTS = Object.freeze([
  "api",
  "src",
  "www/account",
  "www/admin",
  "www/assets",
  "www/owner",
  "www/toolbox",
]);

const EXPECTED_ADMIN_LABELS = Object.freeze([
  "Admin Tools",
  "Analytics",
  "Controls",
  "Creators",
  "DB Viewer",
  "Environments",
  "Game Migration",
  "Infrastructure",
  "Invites",
  "Moderation",
  "Operations",
  "Platform Settings",
  "Ratings",
  "Responsibilities",
  "Site Setup",
  "System Health",
  "Tool Votes",
]);

const EXPECTED_OWNER_LABELS = Object.freeze([
  "Owner Tools",
  "AI Credits",
  "Branding",
  "Design System",
  "Grouping Colors",
  "Legal",
  "Memberships",
  "Marketplace Settings",
  "Notes",
  "Revenue",
  "Site Settings",
  "Themes",
]);

function listTextFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      return listTextFiles(entryPath);
    }
    return /\.(html|js|mjs)$/.test(entry.name) ? [entryPath] : [];
  });
}

function activeTextSources() {
  return ACTIVE_SCAN_ROOTS.flatMap(listTextFiles).map((fileName) => ({
    fileName: fileName.replace(/\\/g, "/"),
    source: fs.readFileSync(fileName, "utf8"),
  }));
}

function assertActivePathExists(item) {
  if (item.disabled) {
    assert.equal(item.path || item.href || item.route || "", "", `${item.label} is disabled/planned and must not expose an active route`);
    return;
  }
  assert.match(item.path, /^(admin|owner)\//, `${item.label} should use an Admin or Owner page path`);
  const browserFilePath = path.join("www", item.path);
  assert.equal(fs.existsSync(browserFilePath), true, `${item.label} active menu path should exist: ${browserFilePath}`);
}

test("server API client lives under src/api and active code does not reference src/engine/api", () => {
  assert.equal(fs.existsSync("src/api/server-api-client.js"), true);
  assert.deepEqual(fs.existsSync("src/engine/api") ? fs.readdirSync("src/engine/api").sort() : [], []);
  const offenders = activeTextSources()
    .filter(({ source }) => /src\/engine\/api\/server-api-client|src\\engine\\api\\server-api-client|engine\/api\/server-api-client/.test(source))
    .map(({ fileName }) => fileName);
  assert.deepEqual(offenders, []);
});

test("Admin and Owner shared menus are non-overlapping by responsibility", () => {
  const adminItems = getAdminNavigationItems();
  const ownerItems = getOwnerNavigationItems();
  assert.deepEqual(adminItems.map((item) => item.label), EXPECTED_ADMIN_LABELS);
  assert.deepEqual(ownerItems.map((item) => item.label), EXPECTED_OWNER_LABELS);
  ["Branding", "Design System", "Grouping Colors", "Legal", "Marketplace Settings", "Notes", "Revenue", "Site Settings", "Themes"].forEach((label) => {
    assert.equal(adminItems.some((item) => item.label === label), false, `Admin menu must not include Owner business item ${label}`);
  });
  ["Creators", "DB Viewer", "Infrastructure", "Invites", "Operations", "Platform Settings", "System Health"].forEach((label) => {
    assert.equal(ownerItems.some((item) => item.label === label), false, `Owner menu must not duplicate Admin operations item ${label}`);
  });
});

test("Owner Notes is active under owner path only", () => {
  const adminItems = getAdminNavigationItems();
  const ownerItems = getOwnerNavigationItems();
  const ownerNotes = ownerItems.find((item) => item.label === "Notes");
  assert.equal(adminItems.some((item) => item.label === "Notes"), false, "Admin menu must not include Notes");
  assert.equal(ownerNotes?.disabled, undefined, "Owner Notes should not be disabled");
  assert.equal(ownerNotes?.planned, undefined, "Owner Notes should not be planned");
  assert.equal(ownerNotes?.path, "owner/notes.html");
  assert.equal(ownerNotes?.route, "owner-notes");
  assert.equal(fs.existsSync("www/owner/notes.html"), true, "Owner Notes route should exist");
});

test("Admin and Owner shared menu active links resolve or are explicitly disabled", () => {
  getAdminNavigationItems().forEach(assertActivePathExists);
  getOwnerNavigationItems().forEach(assertActivePathExists);
});

test("business-control pages moved under owner and are absent from admin", () => {
  ["branding", "design-system", "grouping-colors", "site-settings", "themes"].forEach((slug) => {
    assert.equal(fs.existsSync(`www/owner/${slug}.html`), true, `www/owner/${slug}.html should exist`);
    assert.equal(fs.existsSync(`www/admin/${slug}.html`), false, `www/admin/${slug}.html should be removed`);
  });
});

test("active app code no longer links to moved Admin business paths", () => {
  const offenders = activeTextSources()
    .filter(({ fileName, source }) => {
      if (fileName.startsWith("dev/tests/playwright/tools/LoginSessionMode.spec.mjs")
        || fileName.startsWith("dev/tests/playwright/tools/RootToolsFutureState.spec.mjs")
        || fileName.startsWith("dev/tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs")) {
        return false;
      }
      return /admin\/(branding|design-system|grouping-colors|site-settings|themes)\.html|admin-(branding|design-system|grouping-colors|site-settings|themes)/.test(source);
    })
    .map(({ fileName }) => fileName);
  assert.deepEqual(offenders, []);
});
