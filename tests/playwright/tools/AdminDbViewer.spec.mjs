import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { expect, test } from "@playwright/test";
import { createAssetToolMockRepository } from "../../../src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js";
import { createProjectWorkspacePaletteRepository } from "../../../src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js";
import {
  MOCK_DB_KEYS,
  getStandaloneMockDbSeedTables,
  normalizeMockDbTables,
} from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
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
let localDbRunId = 0;

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

function nextLocalDbStoragePath() {
  localDbRunId += 1;
  return path.join(process.cwd(), "tmp", "local-db", `admin-db-viewer-${process.pid}-${localDbRunId}.sqlite`);
}

async function openRepoPage(page, pathName, options = {}) {
  const sessionModeId = options.sessionModeId || "local-mem";
  const previousLocalDbStoragePath = process.env.GAMEFOUNDRY_LOCAL_DB_PATH;
  const previousLocalDbDisable = process.env.GAMEFOUNDRY_LOCAL_DB_DISABLE;
  const localDbStoragePath = sessionModeId === "local-db"
    ? (options.localDbStoragePath || nextLocalDbStoragePath())
    : "";
  if (localDbStoragePath) {
    process.env.GAMEFOUNDRY_LOCAL_DB_PATH = localDbStoragePath;
    delete process.env.GAMEFOUNDRY_LOCAL_DB_DISABLE;
  }
  const server = await startRepoServer();
  const sessionUserKey = options.sessionUserKey === undefined ? MOCK_DB_KEYS.users.admin : options.sessionUserKey;
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];

  page.on("pageerror", (error) => {
    const text = error.stack || error.message;
    if (!isBrowserExtensionNoise(text)) {
      pageErrors.push(error.message);
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error" && !isBrowserExtensionNoise(message.text())) {
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

  if (sessionUserKey !== undefined) {
    if (options.seedState) {
      await fetch(`${server.baseUrl}/api/dev/testing/mock-db-state`, {
        body: JSON.stringify({ state: options.seedState }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
    }
    await fetch(`${server.baseUrl}/api/session/mode`, {
      body: JSON.stringify({ modeId: sessionModeId }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    await fetch(`${server.baseUrl}/api/session/user`, {
      body: JSON.stringify({ userKey: sessionUserKey }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    if (options.disableLocalDbAfterSession) {
      process.env.GAMEFOUNDRY_LOCAL_DB_DISABLE = "1";
    }
  }
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return {
    consoleErrors,
    failedRequests,
    localDbStoragePath,
    pageErrors,
    previousLocalDbDisable,
    previousLocalDbStoragePath,
    server,
  };
}

function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function closeAdminDbPage(page, failures) {
  await workspaceV2CoverageReporter.stop(page);
  await failures.server.close();
  if (failures.localDbStoragePath) {
    await fs.rm(failures.localDbStoragePath, { force: true });
  }
  if (failures.previousLocalDbStoragePath) {
    process.env.GAMEFOUNDRY_LOCAL_DB_PATH = failures.previousLocalDbStoragePath;
  } else {
    delete process.env.GAMEFOUNDRY_LOCAL_DB_PATH;
  }
  if (failures.previousLocalDbDisable) {
    process.env.GAMEFOUNDRY_LOCAL_DB_DISABLE = failures.previousLocalDbDisable;
  } else {
    delete process.env.GAMEFOUNDRY_LOCAL_DB_DISABLE;
  }
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

function expectDbShapedRows(tables, tableNames) {
  for (const tableName of tableNames) {
    expect(Array.isArray(tables[tableName]), `${tableName} table should exist`).toBe(true);
    for (const row of tables[tableName]) {
      expect(row.key, `${tableName}.key`).toMatch(ULID_PATTERN);
      expect(row.createdAt, `${tableName}.createdAt`).toBeTruthy();
      expect(row.updatedAt, `${tableName}.updatedAt`).toBeTruthy();
      expect(row.createdBy, `${tableName}.createdBy`).toMatch(ULID_PATTERN);
      expect(row.updatedBy, `${tableName}.updatedBy`).toMatch(ULID_PATTERN);
    }
  }
}

async function seedIntegritySnapshot(page) {
  return page.evaluate(async () => {
    const [snapshot, registry] = await Promise.all([
      fetch("/api/mock-db/snapshot").then((response) => response.json()),
      fetch("/api/toolbox/registry/snapshot").then((response) => response.json()),
    ]);
    return {
      activeToolKeys: (registry.data.activeTools || [])
        .map((tool) => tool.id || tool.key || tool.slug || tool.name)
        .filter(Boolean)
        .sort(),
      samples: snapshot.data.tables.tool_state_samples || [],
    };
  });
}

function expectSeedIntegrity(seedData) {
  const guestSamples = seedData.samples.filter((sample) => sample.audience === "guest");
  const userSamples = seedData.samples.filter((sample) => sample.audience === "user");
  const guestToolKeys = [...new Set(guestSamples.map((sample) => sample.toolKey))].sort();
  const userKeys = userSamples.map((sample) => sample.userKey).sort();
  const projectKeys = userSamples.map((sample) => sample.projectKey);
  const toolStateKeys = userSamples.map((sample) => sample.toolStateKey);

  expect(guestToolKeys).toEqual(seedData.activeToolKeys);
  expect(userKeys).toEqual([
    MOCK_DB_KEYS.users.admin,
    MOCK_DB_KEYS.users.user1,
    MOCK_DB_KEYS.users.user2,
    MOCK_DB_KEYS.users.user3,
  ].sort());
  expect(new Set(projectKeys).size).toBe(projectKeys.length);
  expect(new Set(toolStateKeys).size).toBe(toolStateKeys.length);
  expect(guestSamples.every((sample) => sample.createdBy === MOCK_DB_KEYS.users.forgeBot)).toBe(true);
  expect(userSamples.every((sample) => sample.createdBy === sample.userKey)).toBe(true);
  seedData.samples.forEach((sample) => {
    const createdAtMs = Date.parse(sample.createdAt);
    const updatedAtMs = Date.parse(sample.updatedAt);
    expect(Number.isFinite(createdAtMs), `${sample.key}.createdAt`).toBe(true);
    expect(Number.isFinite(updatedAtMs), `${sample.key}.updatedAt`).toBe(true);
    expect(sample.createdAt.startsWith("2026-06-06T09"), `${sample.key}.createdAt hardcoded`).toBe(false);
    expect(sample.updatedAt.startsWith("2026-06-06T09"), `${sample.key}.updatedAt hardcoded`).toBe(false);
    expect(createdAtMs).toBeGreaterThan(Date.now() - 10 * 60_000);
    expect(createdAtMs).toBeLessThan(Date.now() + 2 * 60 * 60_000);
  });
}

test("Admin DB Viewer shows current read-only Local Mem DB tables, filters, users, roles, and diagnostics", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/db-viewer.html");

  try {
    await expect(page.getByRole("heading", { name: "Local Mem DB", level: 1 })).toBeVisible();
    await expect(page.locator("[data-admin-only='true']")).toHaveCount(1);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("nav.nav-links a[data-route='admin-db-viewer']")).toHaveText("DB Viewer");
    await expect(page.locator(".tool-workspace--wide")).toBeVisible();
    await expect(page.locator(".tool-workspace--wide > .tool-column")).toHaveCount(2);
    await expect(page.locator("#toolDisplayMode")).toBeVisible();
    await expect(page.locator("[data-admin-db-viewer].tool-center-panel")).toBeVisible();
    await expect(page.locator("[data-session-user-header]")).toHaveCount(0);
    await expect(page.locator("[data-session-user-summary]")).toHaveCount(0);
    await expect(page.locator("[data-session-user-controls]")).toHaveCount(0);
    await expect(page.locator("[data-session-user-button]")).toHaveCount(0);
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("DavidQ");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='account']) > .sub-menu")).not.toHaveAttribute("hidden", "");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeVisible();
    await expect(page.locator("nav.nav-links a[data-route='admin-db-viewer']")).toHaveText("DB Viewer");
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/Local Mem DB loaded \d+ tables and \d+ records for All\./);
    await expect(page.locator("[data-admin-db-filter]")).toHaveText([
      "All",
      "Workspace",
      "Game Design",
      "Game Configuration",
      "Project Journey",
      "Palette",
      "Asset",
      "User Roles",
      "Tool State Samples",
      "Tool Metadata",
      "Tool Planning",
      "Toolbox Votes",
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
      "tool_state_samples",
      "toolbox_tool_metadata",
      "toolbox_tool_planning",
      "toolbox_votes",
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
      "roles",
      "user_roles",
      "users",
    ]) {
      const keyCell = page.locator(`[data-admin-db-table="${tableName}"] tbody tr`).first().locator("td").first();
      await expect(keyCell).toHaveText(/^[0-9A-HJKMNP-TV-Z]{10}$/);
      await expect(keyCell).toHaveAttribute("title", ULID_PATTERN);
    }

    for (const tableName of [
      "palette_colors",
      "asset_library_items",
      "asset_storage_objects",
    ]) {
      await expect(page.locator(`[data-admin-db-table='${tableName}']`)).toContainText("No records in this table.");
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

    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("Guest");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("User 1");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("User 2");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("User 3");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("DavidQ");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("forge-bot");
    await expect(page.locator("[data-admin-db-table='roles']")).not.toContainText("guest");
    await expect(page.locator("[data-admin-db-table='roles']")).toContainText("user");
    await expect(page.locator("[data-admin-db-table='roles']")).toContainText("admin");
    await expect(page.locator("[data-admin-db-table='roles']")).toContainText("system");
    await expect(page.locator("[data-admin-db-table='user_roles']")).toContainText("01K2GFSJ0Y");
    const seedData = await seedIntegritySnapshot(page);
    expectSeedIntegrity(seedData);
    const sampleTable = page.locator("[data-admin-db-table='tool_state_samples']");
    await expect(sampleTable.locator("thead")).toContainText("toolStatePayload");
    await expect(sampleTable).toContainText("Guest");
    await expect(sampleTable).toContainText("User 1");
    await expect(sampleTable).toContainText("User 2");
    await expect(sampleTable).toContainText("User 3");
    await expect(sampleTable).toContainText("DavidQ");
    await expect(sampleTable).toContainText("Guest Project Journey starter");
    await expect(sampleTable).toContainText("local-seeds/user-3/");
    await expect(sampleTable).toContainText(seedData.samples[0].createdAt);
    await expect(page.locator("[data-admin-db-table='toolbox_tool_metadata']")).toContainText("Colors");
    await expect(page.locator("[data-admin-db-table='toolbox_tool_metadata'] thead")).toContainText("order");
    await expect(page.locator("[data-admin-db-table='toolbox_tool_planning']")).toContainText("requiredForTestable");
    await expect(page.locator("[data-admin-db-table='toolbox_votes']")).toContainText("No records in this table.");
    await expect(page.locator("[data-admin-db-table='toolbox_votes'] thead")).toContainText("direction");

    await expect(page.locator("[data-admin-db-audit-findings]")).toContainText(
      "All current Local Mem DB tables include createdAt, updatedAt, createdBy, and updatedBy."
    );
    await expect(page.locator("[data-admin-db-bleed-findings]")).toContainText("No table bleed detected.");
    await expect(page.locator("[data-admin-db-stale-display-findings]")).toContainText(
      "No stale display data detected; tables are rendered from current Local Mem DB snapshots."
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "project_journey_items.noteKey -> project_journey_notes.key:"
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "system project_journey_items.templateKey -> active project_journey_templates.key:"
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "*.createdBy -> users.key:"
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "*.updatedBy -> users.key:"
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      /user_roles\.userKey -> users\.key: \d+\/\d+ records linked\./
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      /user_roles\.roleKey -> roles\.key: \d+\/\d+ records linked\./
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "tool_state_samples.userKey -> users.key: 4/4 records linked."
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
    await expect(page.locator("[data-admin-db-table='palette_source_swatches'] > summary")).toContainText("deprecated");
    await expect(page.locator("[data-admin-db-table='palette_source_swatches']")).toContainText(
      "Current Colors grid rendering, editing, save/load, and import/export do not read this table."
    );
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
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("DavidQ");

    await page.getByRole("button", { name: "Tool State Samples" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Tool State Samples\./);
    await expect(page.locator("[data-admin-db-table='tool_state_samples']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='tool_state_samples']")).toContainText("Guest Project Journey starter");
    await expect(page.locator("[data-admin-db-table='users']")).toHaveCount(0);

    await page.getByRole("button", { name: "Tool Metadata" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Tool Metadata\./);
    await expect(page.locator("[data-admin-db-table='toolbox_tool_metadata']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='toolbox_tool_planning']")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-table='toolbox_votes']")).toHaveCount(0);

    await page.getByRole("button", { name: "Tool Planning" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Tool Planning\./);
    await expect(page.locator("[data-admin-db-table='toolbox_tool_planning']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='toolbox_tool_metadata']")).toHaveCount(0);

    await page.getByRole("button", { name: "Toolbox Votes" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Toolbox Votes\./);
    await expect(page.locator("[data-admin-db-table='toolbox_votes']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='toolbox_votes'] thead")).toContainText("direction");
    await expect(page.locator("[data-admin-db-table='toolbox_vote_order']")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-table='toolbox_tool_metadata']")).toHaveCount(0);

    await page.getByRole("button", { name: "All" }).click();
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("Clear all shared Local Mem DB records?");
      await dialog.dismiss();
    });
    await page.locator("[data-admin-db-clear]").click();
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("forge-bot");
    await expect(page.locator("[data-admin-db-clear]")).toHaveText("Clear Local Mem DB");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("Clear all shared Local Mem DB records?");
      await dialog.accept();
    });
    await page.locator("[data-admin-db-clear]").click();
    await expect(page.locator("[data-admin-db-clear]")).toHaveText("Seed Local Mem DB");
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/Local Mem DB loaded \d+ tables and 0 records for All\./);
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toContainText("No records in this table.");
    await expect(page.locator("[data-admin-db-table='project_journey_items'] thead")).toContainText("projectKey");
    await expect(page.locator("[data-admin-db-table='tool_state_samples']")).toContainText("No records in this table.");
    await expect(page.locator("[data-admin-db-table='tool_state_samples'] thead")).toContainText("toolStatePayload");
    await expect(page.locator("[data-admin-db-table='toolbox_tool_metadata']")).toContainText("No records in this table.");
    await expect(page.locator("[data-admin-db-table='toolbox_tool_metadata'] thead")).toContainText("toolKey");
    await expect(page.locator("[data-admin-db-table='toolbox_tool_planning'] thead")).toContainText("progressChecklist");
    await expect(page.locator("[data-admin-db-table='toolbox_votes'] thead")).toContainText("direction");
    await expect(page.locator("[data-admin-db-table='users'] thead")).toContainText("authProviderUserId");
    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("forge-bot");
    await page.locator("[data-admin-db-clear]").click();
    await expect(page.locator("[data-admin-db-clear]")).toHaveText("Clear Local Mem DB");
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/Local Mem DB loaded \d+ tables and \d+ records for All\./);
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("forge-bot");
    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("Guest");
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toContainText("Designer review");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-admin-db-clear]")).toHaveText("Clear Local Mem DB");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("forge-bot");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Admin DB Viewer shows current read-only Local DB tables without write controls", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/db-viewer.html", {
    sessionModeId: "local-db",
  });
  const server = failures.server;

  try {
    await expect(page.getByRole("heading", { name: "Local DB", level: 1 })).toBeVisible();
    await expect(page.locator("[data-admin-db-mode-kicker]").first()).toHaveText("Admin Only / Local DB");
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/Local DB loaded \d+ tables and \d+ records for All\./);
    await expect(page.locator("[data-admin-db-filter]")).toHaveText([
      "All",
      "Workspace",
      "Game Design",
      "Game Configuration",
      "Project Journey",
      "Palette",
      "Asset",
      "User Roles",
      "Tool State Samples",
      "Tool Metadata",
      "Tool Planning",
      "Toolbox Votes",
    ]);
    await expect(page.locator("[data-admin-db-clear]")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-viewer] input, [data-admin-db-viewer] textarea, [data-admin-db-viewer] select")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-viewer] button:not([data-admin-db-filter])")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-table='palette_colors']")).toContainText("No records in this table.");
    await expect(page.locator("[data-admin-db-table='palette_colors']")).toContainText("Local DB read-only inspection still shows schema headers.");
    await expect(page.locator("[data-admin-db-table='palette_colors'] thead")).toContainText("createdAt");
    await expect(page.locator("[data-admin-db-table='asset_library_items'] thead")).toContainText("storageObjectId");
    const localDbSeedData = await seedIntegritySnapshot(page);
    expectSeedIntegrity(localDbSeedData);
    await expect(page.locator("[data-admin-db-table='tool_state_samples']")).toContainText("Guest Project Journey starter");
    await expect(page.locator("[data-admin-db-table='tool_state_samples']")).toContainText(localDbSeedData.samples[0].createdAt);
    await expect(page.locator("[data-admin-db-audit-findings]")).toContainText(
      "All current Local DB tables include createdAt, updatedAt, createdBy, and updatedBy."
    );
    await expect(page.locator("[data-admin-db-stale-display-findings]")).toContainText(
      "No stale display data detected; tables are rendered from current Local DB snapshots."
    );

    const snapshotResponse = await fetch(`${server.baseUrl}/api/mock-db/snapshot`);
    const snapshotPayload = await snapshotResponse.json();
    expect(snapshotResponse.status).toBe(200);
    const nextState = snapshotPayload.data;
    const adminRow = nextState.tables.users.find((user) => user.key === MOCK_DB_KEYS.users.admin);
    adminRow.displayName = "Local DB Readonly Admin";
    adminRow.updatedAt = "2026-06-07T12:00:00.000Z";
    const replaceResponse = await fetch(`${server.baseUrl}/api/dev/testing/mock-db-state`, {
      body: JSON.stringify({ state: nextState }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    expect(replaceResponse.status).toBe(200);
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: "User Roles" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/Local DB loaded \d+ tables and \d+ records for User Roles\./);
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("Local DB Readonly Admin");

    await expectNoPageFailures(failures);
  } finally {
    await closeAdminDbPage(page, failures);
  }
});

test("Admin DB Viewer shows a visible Local DB diagnostic when adapter storage is unavailable", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/db-viewer.html", {
    disableLocalDbAfterSession: true,
    sessionModeId: "local-db",
  });

  try {
    await expect(page.getByRole("heading", { name: "Local DB", level: 1 })).toBeVisible();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(
      "Local DB data error. Fix the local DB storage or adapter configuration, then reload DB Viewer."
    );
    await expect(page.locator("[data-admin-db-audit-findings]")).toContainText("Local DB could not render current data: Local DB adapter not configured");
    await expect(page.locator("[data-admin-db-audit-findings]")).toContainText("GAMEFOUNDRY_LOCAL_DB_DISABLE");
    await expect(page.locator("[data-admin-db-missing-links]")).toContainText(
      "Relationships could not be checked until the Local DB data error is fixed."
    );
    await expect(page.locator("[data-admin-db-table]")).toHaveCount(0);
    expect(failures.failedRequests.some((failure) => failure.includes("/api/mock-db/snapshot"))).toBe(true);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors.filter((failure) => !failure.includes("Failed to load resource"))).toEqual([]);
  } finally {
    await closeAdminDbPage(page, failures);
  }
});

test("Local Mem DB viewer renders live persisted tool records after refresh", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/project-journey/index.html", {
    sessionUserKey: MOCK_DB_KEYS.users.user1,
  });
  const server = failures.server;

  try {
    await page.locator("[data-journey-new-note-name]").fill("Persistence Review");
    await page.getByRole("button", { name: "Add Note", exact: true }).click();
    await expect(page.locator("[data-journey-note-status]")).toContainText("Added Persistence Review");
    await page.locator("[data-journey-new-item-title-input]").fill("Persisted DB item");
    await page.getByRole("button", { name: "Add Item" }).click();
    await page.locator("[data-journey-item-details-input]").fill("Local Mem DB viewer should display this user-created item.");
    await expect(page.locator("[data-journey-item-tree]")).toContainText("Persisted DB item");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Persistence Review");
    await page.locator("[data-journey-note-button]", { hasText: "Persistence Review" }).click();
    await expect(page.locator("[data-journey-item-tree]")).toContainText("Persisted DB item");
    await page.locator("[data-journey-new-item-title-input]").fill("Persisted DB item after reload");
    await page.getByRole("button", { name: "Add Item" }).click();
    await expect(page.locator("[data-journey-item-tree]")).toContainText("Persisted DB item after reload");

    await page.goto(`${server.baseUrl}/toolbox/colors/index.html`, { waitUntil: "networkidle" });
    await page.locator("[data-palette-hex]").fill("#7A52FF");
    await page.locator("[data-palette-name]").fill("Persist Purple");
    await page.locator("[data-palette-add]").click();
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

    await fetch(`${server.baseUrl}/api/session/user`, {
      body: JSON.stringify({ userKey: MOCK_DB_KEYS.users.admin }),
      headers: { "content-type": "application/json" },
      method: "POST",
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

test("Local Mem DB viewer shows a visible diagnostic for invalid persisted audit users", async ({ page }) => {
  const invalidSeedState = JSON.parse(JSON.stringify(standaloneSeedState));
  invalidSeedState.tables.users[0].createdBy = "not-a-user-key";
  const failures = await openRepoPage(page, "/admin/db-viewer.html", {
    seedState: invalidSeedState,
    sessionUserKey: MOCK_DB_KEYS.users.admin,
  });

  try {
    await expect(page.locator("[data-admin-db-missing-links]")).toContainText(
      "*.createdBy -> users.key missing for users.",
    );
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Palette and Asset raw Local Mem DB tables are DB-shaped before viewer rendering", () => {
  const paletteRepository = createProjectWorkspacePaletteRepository({ persist: false });
  const assetRepository = createAssetToolMockRepository({ persist: false });
  const paletteTables = paletteRepository.getTables();
  const assetTables = assetRepository.getTables();

  expect(paletteTables.palette_source_swatches).toBeUndefined();
  expect(assetTables.asset_role_definitions.length).toBeGreaterThan(0);
  expectDbShapedRows(paletteTables, [
    "palette_colors",
    "palette_swatch_usages",
    "project_workspace_palette_globals",
  ]);
  expectDbShapedRows(assetTables, [
    "asset_role_definitions",
    "asset_library_items",
    "asset_storage_objects",
    "asset_import_events",
    "asset_validation_items",
  ]);
});

test("Local Mem DB audit normalization rejects invalid and missing audit users", () => {
  expect(() => normalizeMockDbTables("standalone", {
    users: [{
      key: MOCK_DB_KEYS.users.user1,
      displayName: "Broken Audit User",
      createdAt: "2026-06-06T09:00:00.000Z",
      updatedAt: "2026-06-06T09:00:00.000Z",
      createdBy: "not-a-ulid",
      updatedBy: MOCK_DB_KEYS.users.admin,
    }],
  })).toThrow(/Invalid mock DB audit user key/);

  expect(() => normalizeMockDbTables("standalone", {
    users: [{
      key: MOCK_DB_KEYS.users.user1,
      displayName: "Seed Repair",
    }],
  })).toThrow(/Add explicit createdBy and updatedBy values/);

  const seedTables = normalizeMockDbTables("standalone", {
    users: [{
      key: MOCK_DB_KEYS.users.user1,
      displayName: "Seed Repair",
      createdAt: "2026-06-06T09:00:00.000Z",
      updatedAt: "2026-06-06T09:00:00.000Z",
      createdBy: MOCK_DB_KEYS.users.forgeBot,
      updatedBy: MOCK_DB_KEYS.users.forgeBot,
    }],
  });
  expect(seedTables.users[0].createdBy).toBe(MOCK_DB_KEYS.users.forgeBot);
  expect(seedTables.users[0].updatedBy).toBe(MOCK_DB_KEYS.users.forgeBot);
});
