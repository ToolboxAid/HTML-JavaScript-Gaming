import { expect, test } from "@playwright/test";
import { PROJECT_JOURNEY_KEYS } from "../../../toolbox/project-journey/project-journey-mock-repository.js";
import { getStandaloneMockDbSeedTables } from "../../../src/engine/persistence/mock-db-store.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const REMOVED_IDENTITY_TABLE = "act" + "ors";
const standaloneSeedTables = getStandaloneMockDbSeedTables();
const standaloneSeedState = {
  cleared: false,
  owners: Object.fromEntries(Object.keys(standaloneSeedTables).map((tableName) => [tableName, "standalone"])),
  tables: standaloneSeedTables,
  version: 3,
};

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "admin-db-viewer",
    surface: "Admin DB Viewer"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function openRepoPage(page, pathName, options = {}) {
  const server = await startRepoServer();
  const sessionUserId = options.sessionUserId === undefined ? "admin" : options.sessionUserId;
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`FAILED ${request.url()}`);
  });

  if (sessionUserId !== undefined) {
    await page.addInitScript(({ selectedUserId, seedState, storageKey }) => {
      if (!window.localStorage.getItem("gamefoundry.mockDb.v1")) {
        window.localStorage.setItem("gamefoundry.mockDb.v1", JSON.stringify(seedState));
      }
      window.localStorage.setItem("gamefoundry.mockDb.sessionMode.v1", "local");
      const current = window.localStorage.getItem(storageKey);
      if (selectedUserId && !current) {
        window.localStorage.setItem(storageKey, selectedUserId);
      } else if (!selectedUserId) {
        window.localStorage.removeItem(storageKey);
      }
    }, {
      seedState: standaloneSeedState,
      selectedUserId: sessionUserId,
      storageKey: "gamefoundry.mockDb.sessionUser.v1",
    });
  }
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function uploadAsset(page, { assetRole, fileName, mimeType, name, usage }) {
  await page.locator("[data-asset-tool-asset-role]").selectOption(assetRole);
  await page.getByLabel("File").setInputFiles({
    buffer: Buffer.from(`${name} bytes`),
    mimeType,
    name: fileName
  });
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Usage").selectOption(usage);
  await page.getByRole("button", { name: "Upload Asset" }).click();
}

test("Admin DB Viewer shows current read-only mock DB tables, filters, users, roles, and diagnostics", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/db-viewer.html");

  try {
    await expect(page.getByRole("heading", { name: "Mock DB", level: 1 })).toBeVisible();
    await expect(page.locator("[data-admin-only='true']")).toHaveCount(1);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("nav.nav-links a[data-route='admin-db-viewer']")).toHaveText("DB Viewer");
    await expect(page.locator(".tool-workspace--wide")).toBeVisible();
    await expect(page.locator(".tool-workspace--wide > .tool-column")).toHaveCount(2);
    await expect(page.locator("#toolDisplayMode")).toBeVisible();
    await expect(page.locator("[data-admin-db-viewer].tool-center-panel")).toBeVisible();
    await expect(page.locator("[data-session-user-header]")).toHaveText("Session user: Admin");
    await expect(page.locator("[data-session-user-summary]")).toHaveText("Selected session user: Admin.");
    await expect(page.locator("[data-session-user-button]")).toHaveText(["Guest", "User 1", "User 2", "User 3", "Admin"]);
    await expect(page.locator("[data-session-user-button='admin']")).toHaveClass(/primary/);
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("Admin");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='account']) > .sub-menu")).not.toHaveAttribute("hidden", "");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeVisible();
    await expect(page.locator("[data-session-user-button='forge-bot']")).toHaveCount(0);
    await expect(page.locator("nav.nav-links a[data-route='admin-db-viewer']")).toHaveText("DB Viewer");
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/Mock DB loaded \d+ tables and \d+ records for All\./);
    await expect(page.locator("[data-admin-db-filter]")).toHaveText([
      "All",
      "Workspace",
      "Game Design",
      "Game Configuration",
      "Project Journey",
      "Palette",
      "Asset",
      "User Roles",
    ]);
    await expect(page.locator("[data-admin-db-filter='all']")).toHaveClass(/primary/);
    await expect(page.locator("[data-admin-db-filter='all']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-admin-db-filter='users']")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-filter='roles']")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-filter='user_roles']")).toHaveCount(1);

    for (const tableName of [
      "workspace_projects",
      "workspace_progress",
      "game_design_documents",
      "game_design_validation_items",
      "game_configuration_records",
      "game_configuration_validation_items",
      "project_journey_items",
      "project_journey_templates",
      "project_journey_notes",
      "project_journey_note_types",
      "project_journey_activity",
      "palette_colors",
      "palette_source_swatches",
      "asset_library_items",
      "asset_storage_objects",
      "roles",
      "user_roles",
      "users",
    ]) {
      await expect(page.locator(`[data-admin-db-table='${tableName}']`)).toBeVisible();
      await expect(page.locator(`[data-admin-db-table="${tableName}"] thead th`).first()).toHaveText("Key");
    }
    await expect(page.locator(`[data-admin-db-table='${REMOVED_IDENTITY_TABLE}']`)).toHaveCount(0);
    await expect(page.locator(`[data-admin-db-filter='${REMOVED_IDENTITY_TABLE}']`)).toHaveCount(0);

    for (const tableName of [
      "project_journey_activity",
      "project_journey_items",
      "project_journey_note_types",
      "project_journey_notes",
      "project_journey_templates",
      "roles",
      "user_roles",
      "users",
    ]) {
      const keyCell = page.locator(`[data-admin-db-table="${tableName}"] tbody tr`).first().locator("td").first();
      await expect(keyCell).toHaveText(/^[0-9A-HJKMNP-TV-Z]{10}$/);
      await expect(keyCell).toHaveAttribute("title", ULID_PATTERN);
    }

    const itemHeaders = await page.locator("[data-admin-db-table='project_journey_items'] thead th").allTextContents();
    expect(itemHeaders[0]).toBe("Key");
    expect(itemHeaders).toEqual(expect.arrayContaining([
      "projectKey",
      "noteKey",
      "status",
      "title",
      "userDetails",
      "createdAt",
      "updatedAt",
      "createdBy",
      "updatedBy",
      "templateKey",
    ]));
    expect(itemHeaders).not.toEqual(expect.arrayContaining(["key"]));
    expect(itemHeaders).not.toEqual(expect.arrayContaining(["id", "itemId", "projectId", "noteId", "templateId"]));
    expect(itemHeaders).not.toEqual(expect.arrayContaining(["CREATEDAT", "UPDATEDAT"]));
    const createdAtHeader = page.locator("[data-admin-db-table='project_journey_items'] thead th", { hasText: "createdAt" });
    await expect(createdAtHeader).toHaveCSS("text-transform", "none");
    const designItemRow = page.locator(`[data-admin-db-record="${PROJECT_JOURNEY_KEYS.items.designAffordance}"]`);
    await expect(designItemRow.locator("td").first()).toHaveText(PROJECT_JOURNEY_KEYS.items.designAffordance.slice(0, 10));
    await expect(designItemRow.locator("td").first()).toHaveAttribute("title", PROJECT_JOURNEY_KEYS.items.designAffordance);
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toContainText(PROJECT_JOURNEY_KEYS.items.designAffordance.slice(0, 10));
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).not.toContainText(PROJECT_JOURNEY_KEYS.items.designAffordance);
    await expect(page.locator("[data-admin-db-table='project_journey_templates']")).toContainText(PROJECT_JOURNEY_KEYS.templates.paletteAffordance.slice(0, 10));
    await expect(page.locator("[data-admin-db-table='project_journey_note_types']")).toContainText("Design");
    await expect(page.locator("[data-admin-db-table='project_journey_activity']")).toContainText("Palette and Input Density updated by User 1");

    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("Guest");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("User 1");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("User 2");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("User 3");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("Admin");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("forge-bot");
    await expect(page.locator("[data-admin-db-table='roles']")).not.toContainText("guest");
    await expect(page.locator("[data-admin-db-table='roles']")).toContainText("user");
    await expect(page.locator("[data-admin-db-table='roles']")).toContainText("admin");
    await expect(page.locator("[data-admin-db-table='roles']")).toContainText("system");
    await expect(page.locator("[data-admin-db-table='user_roles']")).toContainText("01K2GFSJ0Y");

    await expect(page.locator("[data-admin-db-audit-findings]")).toContainText(
      "All current mock DB tables include createdAt, updatedAt, createdBy, and updatedBy."
    );
    await expect(page.locator("[data-admin-db-bleed-findings]")).toContainText("No table bleed detected.");
    await expect(page.locator("[data-admin-db-stale-display-findings]")).toContainText(
      "No stale display data detected; tables are rendered from current mock DB snapshots."
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "project_journey_items.noteKey -> project_journey_notes.key: 9/9 records linked."
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "system project_journey_items.templateKey -> active project_journey_templates.key: 9/9 records linked."
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "*.createdBy -> users.key:"
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "*.updatedBy -> users.key:"
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "user_roles.userKey -> users.key: 6/6 records linked."
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "user_roles.roleKey -> roles.key: 6/6 records linked."
    );
    await expect(page.locator("[data-admin-db-missing-links]")).toContainText("No missing links detected.");
    await expect(page.locator("[data-admin-db-viewer] input, [data-admin-db-viewer] textarea, [data-admin-db-viewer] select")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-viewer] button:not([data-admin-db-filter])")).toHaveCount(0);

    await page.getByRole("button", { name: "Workspace" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Workspace\./);
    await expect(page.locator("[data-admin-db-table='workspace_projects']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='workspace_projects'] thead")).toContainText("ownerKey");
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toHaveCount(0);

    await page.getByRole("button", { name: "Game Design" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Game Design\./);
    await expect(page.locator("[data-admin-db-table='game_design_documents']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='game_design_documents'] thead")).toContainText("projectKey");

    await page.getByRole("button", { name: "Game Configuration" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Game Configuration\./);
    await expect(page.locator("[data-admin-db-table='game_configuration_records']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='game_configuration_records'] thead")).toContainText("summary");

    await page.getByRole("button", { name: "Project Journey" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Project Journey\./);
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='palette_colors']")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-table='asset_library_items']")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-table='users']")).toHaveCount(0);

    await page.getByRole("button", { name: "Palette" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Palette\./);
    await expect(page.locator("[data-admin-db-table='palette_colors']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='palette_source_swatches']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toHaveCount(0);

    await page.getByRole("button", { name: "Asset" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Asset\./);
    await expect(page.locator("[data-admin-db-table='asset_library_items']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='asset_storage_objects']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='palette_colors']")).toHaveCount(0);

    await page.getByRole("button", { name: "User Roles" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for User Roles\./);
    await expect(page.locator("[data-admin-db-table='users']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='user_roles']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='roles']")).toBeVisible();
    expect(await page.locator("[data-admin-db-tables] > details").evaluateAll((details) =>
      details.map((item) => item.dataset.adminDbTable),
    )).toEqual(["users", "user_roles", "roles"]);
    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("Guest");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("forge-bot");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("Admin");

    await page.getByRole("button", { name: "All" }).click();
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("Clear all shared Mock DB records?");
      await dialog.dismiss();
    });
    await page.locator("[data-admin-db-clear]").click();
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("forge-bot");
    await expect(page.locator("[data-admin-db-clear]")).toHaveText("Clear Mock DB");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("Clear all shared Mock DB records?");
      await dialog.accept();
    });
    await page.locator("[data-admin-db-clear]").click();
    await expect(page.locator("[data-admin-db-clear]")).toHaveText("Seed Mock DB");
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/Mock DB loaded \d+ tables and 0 records for All\./);
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toContainText("No records in this table.");
    await expect(page.locator("[data-admin-db-table='project_journey_items'] thead")).toContainText("projectKey");
    await expect(page.locator("[data-admin-db-table='users'] thead")).toContainText("authProviderUserId");
    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("forge-bot");
    await page.locator("[data-admin-db-clear]").click();
    await expect(page.locator("[data-admin-db-clear]")).toHaveText("Clear Mock DB");
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/Mock DB loaded \d+ tables and \d+ records for All\./);
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("forge-bot");
    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("Guest");
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toContainText("Review palette swatch affordance");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-admin-db-clear]")).toHaveText("Clear Mock DB");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("forge-bot");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Mock DB viewer renders live persisted tool records after refresh", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/project-journey/index.html", {
    sessionUserId: "user1",
  });
  const server = failures.server;

  try {
    await page.locator("[data-journey-new-note-name]").fill("Persistence Review");
    await page.getByRole("button", { name: "Add Note", exact: true }).click();
    await expect(page.locator("[data-journey-note-status]")).toContainText("Added Persistence Review");
    await page.locator("[data-journey-new-item-title-input]").fill("Persisted DB item");
    await page.getByRole("button", { name: "Add Item" }).click();
    await page.locator("[data-journey-item-details-input]").fill("Mock DB viewer should display this user-created item.");
    await expect(page.locator("[data-journey-item-tree]")).toContainText("Persisted DB item");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Persistence Review");
    await page.locator("[data-journey-note-button]", { hasText: "Persistence Review" }).click();
    await expect(page.locator("[data-journey-item-tree]")).toContainText("Persisted DB item");
    await page.locator("[data-journey-new-item-title-input]").fill("Persisted DB item after reload");
    await page.getByRole("button", { name: "Add Item" }).click();
    await expect(page.locator("[data-journey-item-tree]")).toContainText("Persisted DB item after reload");

    await page.goto(`${server.baseUrl}/toolbox/colors/index.html`, { waitUntil: "networkidle" });
    await page.locator("[data-palette-symbol]").fill("P");
    await page.locator("[data-palette-hex]").fill("#7A52FF");
    await page.locator("[data-palette-name]").fill("Persist Purple");
    await page.getByRole("button", { name: "Add User Defined" }).click();
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Persist Purple']")).toHaveCount(1);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Persist Purple']")).toHaveCount(1);

    await page.goto(`${server.baseUrl}/toolbox/assets/index.html`, { waitUntil: "networkidle" });
    await uploadAsset(page, {
      assetRole: "image",
      fileName: "persist-sprite.png",
      mimeType: "image/png",
      name: "Persist Sprite",
      usage: "sprite"
    });
    await expect(page.locator("[data-asset-tool-library]")).toContainText("Persist Sprite");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-asset-tool-library]")).toContainText("Persist Sprite");

    await page.evaluate(() => {
      window.localStorage.setItem("gamefoundry.mockDb.sessionUser.v1", "admin");
    });
    await page.goto(`${server.baseUrl}/admin/db-viewer.html`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Project Journey" }).click();
    await expect(page.locator("[data-admin-db-table='project_journey_notes']")).toContainText("Persistence Review");
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toContainText("Persisted DB item");
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toContainText("Persisted DB item after reload");
    const journeyItemKeys = await page.locator("[data-admin-db-table='project_journey_items'] tbody tr").evaluateAll((rows) => (
      rows.map((row) => row.dataset.adminDbRecord)
    ));
    expect(new Set(journeyItemKeys).size).toBe(journeyItemKeys.length);
    await page.getByRole("button", { name: "Palette" }).click();
    await expect(page.locator("[data-admin-db-table='palette_colors']")).toContainText("Persist Purple");
    await page.getByRole("button", { name: "Asset" }).click();
    await expect(page.locator("[data-admin-db-table='asset_library_items']")).toContainText("Persist Sprite");
    await page.getByRole("button", { name: "User Roles" }).click();
    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("Guest");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("forge-bot");
    await expect(page.locator("[data-admin-db-table='roles']")).toContainText("system");
    await expect(page.locator("[data-admin-db-table='user_roles']")).toContainText("01K2GFSJ0Y");
    await expect(page.locator("[data-admin-db-missing-links]")).toContainText("No missing links detected.");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
