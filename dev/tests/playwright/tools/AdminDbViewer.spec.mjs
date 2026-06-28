import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { expect, test } from "@playwright/test";
import { createAssetToolMockRepository } from "../../../../api/persistence/tool-repositories/assets-mock-repository.js";
import { createGameWorkspacePaletteRepository } from "../../../../api/persistence/tool-repositories/palette-workspace-repository.js";
import {
  MOCK_DB_KEYS,
  getMockDbTableSchemas,
  getStandaloneMockDbSeedTables,
  normalizeMockDbTables,
} from "../../../../api/persistence/mock-db-store.js";
import { getActiveToolRegistry } from "../../../../api/guest-seeds/tool-metadata-inventory.js";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const REMOVED_IDENTITY_TABLE = "act" + "ors";
const GUEST_SEED_GROUP_KEYS = getActiveToolRegistry()
  .filter((tool) => tool.visibleInToolsList !== false && tool.hidden !== true)
  .map((tool) => tool.id || tool.key || tool.slug || tool.name)
  .sort();
const standaloneSeedTables = getStandaloneMockDbSeedTables();
const standaloneSeedState = {
  cleared: false,
  owners: Object.fromEntries(Object.keys(standaloneSeedTables).map((tableName) => [tableName, "standalone"])),
  tables: standaloneSeedTables,
  version: 3,
};
let localDbRunId = 0;

function adminSessionFixture() {
  return {
    adapterId: "supabase-auth",
    adapterName: "SupabaseAuthAdapter",
    adapterStatus: "configured",
    authenticated: true,
    diagnostic: "",
    displayName: "DavidQ",
    environment: "Supabase identity",
    id: MOCK_DB_KEYS.users.admin,
    isAdmin: true,
    isOwner: true,
    label: "DavidQ",
    mode: "supabase-auth",
    persistence: "Configured database",
    roleSlugs: ["admin", "owner"],
    userKey: MOCK_DB_KEYS.users.admin,
  };
}

const SUPABASE_ENV_KEYS = Object.freeze([
  "GAMEFOUNDRY_AUTH_PROVIDER",
  "GAMEFOUNDRY_DB_PROVIDER",
  "GAMEFOUNDRY_SUPABASE_ANON_KEY",
  "GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY",
  "GAMEFOUNDRY_SUPABASE_URL",
]);

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
  return path.join(process.cwd(), "tmp", "local-db", `admin-db-viewer-${process.pid}-${localDbRunId}.local-db-state`);
}

async function withSupabaseEnv(baseUrl, callback) {
  const previousEnv = Object.fromEntries(SUPABASE_ENV_KEYS.map((key) => [key, process.env[key]]));
  process.env.GAMEFOUNDRY_AUTH_PROVIDER = "supabase-auth";
  process.env.GAMEFOUNDRY_DB_PROVIDER = "supabase-postgres";
  process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY = "admin-db-viewer-anon-key";
  process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY = "admin-db-viewer-service-role-key";
  process.env.GAMEFOUNDRY_SUPABASE_URL = baseUrl;
  try {
    return await callback();
  } finally {
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

function createSupabaseAdminDbTables() {
  const timestamp = "2026-06-15T00:00:00.000Z";
  const audit = {
    createdAt: timestamp,
    createdBy: MOCK_DB_KEYS.users.admin,
    updatedAt: timestamp,
    updatedBy: MOCK_DB_KEYS.users.admin,
  };
  return {
    roles: [{
      key: MOCK_DB_KEYS.roles.admin,
      roleSlug: "admin",
      name: "Admin",
      description: "Administrative account.",
      isActive: true,
      isSystemRole: false,
      ...audit,
    }],
    toolbox_tool_metadata: [{
      key: "01KDBVIEWER000000000000001",
      toolKey: "colors",
      toolName: "Colors",
      shortLabel: "Colors",
      group: "Design",
      category: "Design",
      path: "toolbox/colors/index.html",
      order: 1,
      status: "beta",
      ...audit,
    }],
    toolbox_tool_planning: [{
      key: "01KDBVIEWER000000000000002",
      toolKey: "colors",
      progressChecklist: ["Palette contract"],
      readiness: "ready",
      requiredForPlayable: true,
      requiredForPublish: true,
      requiredForTestable: true,
      requires: [],
      ...audit,
    }],
    toolbox_votes: [],
    user_roles: [{
      key: MOCK_DB_KEYS.userRoles.adminAdmin,
      userKey: MOCK_DB_KEYS.users.admin,
      roleKey: MOCK_DB_KEYS.roles.admin,
      ...audit,
    }],
    users: [{
      key: MOCK_DB_KEYS.users.admin,
      displayName: "DavidQ",
      email: "qbytes.dq@gmail.com",
      authProvider: "supabase-auth",
      authProviderUserId: "supabase-admin",
      isActive: true,
      ...audit,
    }],
  };
}

function configuredDbViewerGroups(tableNames) {
  const include = (names) => names.filter((name) => tableNames.includes(name));
  return [
    { id: "all", label: "All", tableNames, type: "all" },
    { id: "asset", label: "Asset", tableNames: include(["asset_role_definitions", "asset_library_items", "asset_storage_objects", "asset_import_events", "asset_validation_items"]), type: "tool" },
    { id: "controls", label: "Controls", tableNames: include(["game_input_mappings", "player_controller_profiles", "player_input_device_selections", "input_custom_action_records"]), type: "tool" },
    { id: "game-configuration", label: "Game Configuration", tableNames: include(["game_configuration_records", "game_configuration_validation_items"]), type: "tool" },
    { id: "game-design", label: "Game Design", tableNames: include(["game_design_documents", "game_design_validation_items"]), type: "tool" },
    { id: "game-journey", label: "Game Journey", tableNames: include(["game_journey_completion_metrics", "game_journey_note_types", "game_journey_notes", "game_journey_templates", "game_journey_items", "game_journey_activity"]), type: "tool" },
    { id: "game-hub", label: "Game Hub", tableNames: include(["game_workspace_games", "game_workspace_progress"]), type: "tool" },
    { id: "objects", label: "Objects", tableNames: include(["object_definition_records"]), type: "tool" },
    { id: "palette", label: "Palette", tableNames: include(["palette_colors", "palette_source_swatches", "palette_swatch_usages", "project_workspace_palette_globals"]), type: "tool" },
    { id: "tags", label: "Tags", tableNames: include(["workspace_tag_records"]), type: "tool" },
    { id: "toolbox_tool_metadata", label: "Tool Metadata", tableNames: include(["toolbox_tool_metadata"]), type: "table" },
    { id: "toolbox_tool_planning", label: "Tool Planning", tableNames: include(["toolbox_tool_planning"]), type: "table" },
    { id: "tool_state_samples", label: "Tool State Samples", tableNames: include(["tool_state_samples"]), type: "table" },
    { id: "toolbox_votes", label: "Toolbox Votes", tableNames: include(["toolbox_votes"]), type: "table" },
    { id: "user_roles", label: "Creator Responsibilities", tableNames: include(["users", "user_roles", "roles"]), type: "table" },
    { id: "membership_limits", label: "membership_limits", tableNames: include(["membership_limits"]), type: "table" },
  ].filter((group) => group.tableNames.length);
}

function createConfiguredDbViewerSnapshot(options = {}) {
  const schemas = getMockDbTableSchemas();
  const tableNames = Object.keys(schemas).sort();
  const tables = Object.fromEntries(tableNames.map((tableName) => [tableName, []]));
  const seededTables = createSupabaseAdminDbTables();
  if (!options.empty) {
    Object.entries(seededTables).forEach(([tableName, records]) => {
      if (Object.hasOwn(tables, tableName)) {
        tables[tableName] = records;
      }
    });
  }
  const tableDiagnostics = options.missingMembershipLimits
    ? [{
      code: "DB_VIEWER_TABLE_UNAVAILABLE",
      level: "WARN",
      message: 'membership_limits could not be read from the configured database: relation "membership_limits" does not exist',
      remediation: "Confirm the membership_limits table exists in the configured database and apply the product data migration for that table.",
      status: "WARN",
      tableName: "membership_limits",
    }]
    : [];
  return {
    cleared: false,
    databaseProviderId: "supabase-postgres",
    diagnostics: {
      tableReadFailures: tableDiagnostics,
    },
    provider: {
      databaseProviderId: "supabase-postgres",
      source: "supabase-postgres",
    },
    schemas,
    source: "supabase-postgres",
    tableDiagnostics,
    tables,
    viewerGroups: configuredDbViewerGroups(tableNames),
    version: 4,
  };
}

function startFakeSupabaseAdminDbServer() {
  const tables = createSupabaseAdminDbTables();
  const calls = [];
  const server = http.createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString("utf8");
    const body = rawBody ? JSON.parse(rawBody) : {};
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
    calls.push({
      body,
      headers: request.headers,
      method: request.method,
      path: `${requestUrl.pathname}${requestUrl.search}`,
    });
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    if (requestUrl.pathname === "/auth/v1/health") {
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }
    if (requestUrl.pathname === "/auth/v1/token") {
      response.end(JSON.stringify({
        access_token: "admin-db-viewer-access-token",
        refresh_token: "admin-db-viewer-refresh-token",
        user: {
          email: body.email || "qbytes.dq@gmail.com",
          id: "supabase-admin",
        },
      }));
      return;
    }
    if (requestUrl.pathname.startsWith("/rest/v1/")) {
      const tableName = decodeURIComponent(requestUrl.pathname.split("/").pop() || "");
      tables[tableName] = tables[tableName] || [];
      response.end(JSON.stringify(tables[tableName]));
      return;
    }
    response.statusCode = 404;
    response.end(JSON.stringify({ message: "Unknown fake Supabase route." }));
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start fake Supabase Admin DB server."));
        return;
      }
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        calls,
        close: () => new Promise((closeResolve) => {
          server.closeAllConnections?.();
          server.close(closeResolve);
        }),
      });
    });
  });
}

async function openRepoPage(page, pathName, options = {}) {
  const sessionModeId = options.sessionModeId || "local-db";
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

  if (options.sessionCurrent) {
    await page.route("**/api/session/current", async (route) => {
      await route.fulfill({
        body: JSON.stringify({ data: options.sessionCurrent, ok: true }),
        contentType: "application/json; charset=utf-8",
        status: 200,
      });
    });
    await page.route("**/api/navigation/admin-menu", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          data: {
            adminMainItems: [{
              label: "DB Viewer",
              path: "admin/db-viewer.html",
              route: "admin-db-viewer",
            }],
            ownerMenuItems: [],
            source: "test-fixture",
          },
          ok: true,
        }),
        contentType: "application/json; charset=utf-8",
        status: 200,
      });
    });
    await page.route("**/api/platform-settings/banner", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          data: {
            banner: {
              active: false,
              message: "",
              tone: "info",
            },
          },
          ok: true,
        }),
        contentType: "application/json; charset=utf-8",
        status: 200,
      });
    });
    await page.route("**/api/toolbox/registry/snapshot", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          data: {
            activeTools: [],
            readinessByStatus: {},
            toolboxContract: {},
            tools: [],
          },
          ok: true,
        }),
        contentType: "application/json; charset=utf-8",
        status: 200,
      });
    });
  }

  if (options.productDataSnapshot || options.productDataError) {
    await page.route("**/api/product-data/snapshot", async (route) => {
      if (options.productDataError) {
        await route.fulfill({
          body: JSON.stringify({ error: options.productDataError, ok: false }),
          contentType: "application/json; charset=utf-8",
          status: 500,
        });
        return;
      }
      await route.fulfill({
        body: JSON.stringify({ data: options.productDataSnapshot, ok: true }),
        contentType: "application/json; charset=utf-8",
        status: 200,
      });
    });
  }

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

async function openSupabaseAdminDbViewer(page) {
  const server = await startRepoServer();
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

  const signInResponse = await fetch(`${server.baseUrl}/api/auth/sign-in`, {
    body: JSON.stringify({
      identity: "qbytes.dq@gmail.com",
      password: "not-stored-locally",
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const signInPayload = await signInResponse.json();
  expect(signInResponse.ok, JSON.stringify(signInPayload)).toBe(true);
  expect(signInPayload.ok, JSON.stringify(signInPayload)).toBe(true);

  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/admin/db-viewer.html`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
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
    const [snapshot, guestSeed] = await Promise.all([
      fetch("/api/local-db/snapshot").then((response) => response.json()),
      fetch("/api/guest/seed").then((response) => response.json()),
    ]);
    return {
      guestPackages: guestSeed.data.packages || [],
      samples: snapshot.data.tables.tool_state_samples || [],
    };
  });
}

function expectSeedIntegrity(seedData) {
  const userSamples = seedData.samples.filter((sample) => sample.audience === "user");
  const guestToolKeys = [...new Set(seedData.guestPackages.map((sample) => sample.toolKey))].sort();
  const userKeys = userSamples.map((sample) => sample.userKey).sort();
  const gameKeys = userSamples.map((sample) => sample.gameKey);
  const toolStateKeys = userSamples.map((sample) => sample.toolStateKey);

  expect(guestToolKeys).toEqual(GUEST_SEED_GROUP_KEYS);
  expect(seedData.samples.some((sample) => sample.audience === "guest")).toBe(false);
  expect(seedData.guestPackages.every((sample) => sample.readOnly === true && sample.writableByGuest === false)).toBe(true);
  expect(seedData.guestPackages.every((sample) => sample.source.startsWith("dev/build/database/seed/guest/"))).toBe(true);
  expect(userKeys).toEqual([
    MOCK_DB_KEYS.users.admin,
    MOCK_DB_KEYS.users.user1,
    MOCK_DB_KEYS.users.user2,
    MOCK_DB_KEYS.users.user3,
  ].sort());
  expect(new Set(gameKeys).size).toBe(gameKeys.length);
  expect(new Set(toolStateKeys).size).toBe(toolStateKeys.length);
  expect(seedData.guestPackages.every((sample) => sample.createdBy === MOCK_DB_KEYS.users.admin)).toBe(true);
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

test("Admin DB Viewer shows current read-only Local DB tables, filters, users, roles, and diagnostics", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/db-viewer.html");

  try {
    await expect(page.getByRole("heading", { name: "Local DB", level: 1 })).toBeVisible();
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
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/Local DB loaded \d+ tables and \d+ records for All\./);
    await expect(page.locator("[data-admin-db-local-status-card]")).toBeVisible();
    await expect(page.locator("[data-admin-db-status-current-url]")).toContainText(`${failures.server.baseUrl}/admin/db-viewer.html`);
    await expect(page.locator("[data-admin-db-status-server-mode]")).toHaveText("PASS: local-db (Local DB).");
    await expect(page.locator("[data-admin-db-status-provider]")).toHaveText("local-db (Local DB)");
    await expect(page.locator("[data-admin-db-status-source]")).toHaveText("Local DB");
    await expect(page.locator("[data-admin-db-status-api]")).toHaveText("PASS: /api/session/current responded.");
    await expect(page.locator("[data-admin-db-status-endpoint]")).toHaveText("/api/session/current");
    await expect(page.locator("[data-admin-db-status-setup-endpoint]")).toHaveText("/api/admin/setup/reseed");
    await expect(page.locator("[data-admin-setup-reseed]")).toHaveText("Reseed Local DB");
    await expect(page.locator("[data-admin-setup-status]")).toHaveText("SKIP: No setup action has been run.");
    await expect(page.locator("[data-admin-db-filter]")).toHaveText([
      "All",
      "Asset",
      "Controls",
      "Game Configuration",
      "Game Design",
      "Game Journey",
      "Game Hub",
      "Objects",
      "Palette",
      "Tags",
      "Tool Metadata",
      "Tool Planning",
      "Tool State Samples",
      "Toolbox Votes",
      "Creator Responsibilities",
      "Platform Settings",
      "Support Categories",
    ]);
    await expect(page.locator("[data-admin-db-filter='all']")).toHaveClass(/primary/);
    await expect(page.locator("[data-admin-db-filter='all']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-admin-db-filter='users']")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-filter='roles']")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-filter='user_roles']")).toHaveCount(1);

    for (const tableName of [
      "game_workspace_games",
      "game_workspace_progress",
      "game_design_documents",
      "game_design_validation_items",
      "game_configuration_records",
      "game_configuration_validation_items",
      "game_journey_completion_metrics",
      "game_journey_items",
      "game_journey_templates",
      "game_journey_notes",
      "game_journey_note_types",
      "game_journey_activity",
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

    const itemHeaders = await page.locator("[data-admin-db-table='game_journey_items'] thead th").allTextContents();
    expect(itemHeaders[0]).toBe("Key");
    expect(itemHeaders).toEqual(expect.arrayContaining([
      "gameKey",
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
    expect(itemHeaders).not.toEqual(expect.arrayContaining(["id", "itemId", "gameId", "noteId", "templateId"]));
    expect(itemHeaders).not.toEqual(expect.arrayContaining(["CREATEDAT", "UPDATEDAT"]));
    const createdAtHeader = page.locator("[data-admin-db-table='game_journey_items'] thead th", { hasText: "createdAt" });
    await expect(createdAtHeader).toHaveCSS("text-transform", "none");

    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("Guest");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("User 1");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("User 2");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("User 3");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("DavidQ");
    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("forge-bot");
    await expect(page.locator("[data-admin-db-table='roles']")).toContainText("admin");
    await expect(page.locator("[data-admin-db-table='roles']")).toContainText("creator");
    await expect(page.locator("[data-admin-db-table='roles']")).toContainText("guest");
    await expect(page.locator("[data-admin-db-table='roles']")).toContainText("user");
    await expect(page.locator("[data-admin-db-table='roles']")).not.toContainText("system");
    await expect(page.locator("[data-admin-db-table='user_roles']")).toContainText("01K2GFSJ0Y");
    const seedData = await seedIntegritySnapshot(page);
    expectSeedIntegrity(seedData);
    const sampleTable = page.locator("[data-admin-db-table='tool_state_samples']");
    await expect(sampleTable.locator("thead")).toContainText("toolStatePayload");
    await expect(sampleTable).not.toContainText("Guest");
    await expect(sampleTable).toContainText("User 1");
    await expect(sampleTable).toContainText("User 2");
    await expect(sampleTable).toContainText("User 3");
    await expect(sampleTable).toContainText("DavidQ");
    await expect(sampleTable).not.toContainText("Guest Game Journey starter");
    await expect(sampleTable).toContainText("local-seeds/user-3/");
    await expect(sampleTable).toContainText(seedData.samples[0].createdAt);
    await expect(page.locator("[data-admin-db-table='toolbox_tool_metadata']")).toContainText("Colors");
    await expect(page.locator("[data-admin-db-table='toolbox_tool_metadata'] thead")).toContainText("order");
    await expect(page.locator("[data-admin-db-table='toolbox_tool_planning']")).toContainText("requiredForTestable");
    await expect(page.locator("[data-admin-db-table='toolbox_votes']")).toContainText("No records in this table.");
    await expect(page.locator("[data-admin-db-table='toolbox_votes'] thead")).toContainText("direction");

    await expect(page.locator("[data-admin-db-audit-findings]")).toContainText(
      "All current Local DB tables include createdAt, updatedAt, createdBy, and updatedBy."
    );
    await expect(page.locator("[data-admin-db-bleed-findings]")).toContainText("No table bleed detected.");
    await expect(page.locator("[data-admin-db-stale-display-findings]")).toContainText(
      "No stale display data detected; tables are rendered from current Local DB snapshots."
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "game_journey_items.noteKey -> game_journey_notes.key:"
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "system game_journey_items.templateKey -> active game_journey_templates.key:"
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
    await expect(page.locator("[data-admin-db-clear]")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-viewer] input, [data-admin-db-viewer] textarea, [data-admin-db-viewer] select")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-viewer] button:not([data-admin-db-filter])")).toHaveCount(0);

    await page.getByRole("button", { name: "Game Hub" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Game Hub\./);
    await expect(page.locator("[data-admin-db-table='game_workspace_games']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='game_workspace_games'] thead")).toContainText("ownerKey");
    await expect(page.locator("[data-admin-db-table='game_journey_items']")).toHaveCount(0);

    await page.getByRole("button", { name: "Game Design" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Game Design\./);
    await expect(page.locator("[data-admin-db-table='game_design_documents']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='game_design_documents'] thead")).toContainText("gameKey");

    await page.getByRole("button", { name: "Game Configuration" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Game Configuration\./);
    await expect(page.locator("[data-admin-db-table='game_configuration_records']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='game_configuration_records'] thead")).toContainText("summary");
    await expect(page.locator("[data-admin-db-table='game_configuration_records'] thead")).toContainText("playerMode");

    await page.getByRole("button", { name: "Controls" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Controls\./);
    await expect(page.locator("[data-admin-db-table='game_input_mappings']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='player_controller_profiles']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='game_input_mappings'] thead")).toContainText("gameAction");
    await expect(page.locator("[data-admin-db-table='game_input_mappings'] thead")).toContainText("inputFamily");
    await expect(page.locator("[data-admin-db-table='game_input_mappings'] thead")).toContainText("usageLabel");
    await expect(page.locator("[data-admin-db-table='game_input_mappings'] thead")).toContainText("eventD");
    await expect(page.locator("[data-admin-db-table='game_input_mappings'] thead")).toContainText("eventU");
    await expect(page.locator("[data-admin-db-table='game_input_mappings'] thead")).not.toContainText("inputEventPhase");
    await expect(page.locator("[data-admin-db-table='game_input_mappings'] thead")).not.toContainText("binding");
    await expect(page.locator("[data-admin-db-table='player_controller_profiles'] thead")).toContainText("controllerId");
    await expect(page.locator("[data-admin-db-table='player_controller_profiles'] thead")).not.toContainText("gameAction");
    await expect(page.getByRole("button", { name: "Input Mapping" })).toHaveCount(0);

    await page.getByRole("button", { name: "Game Journey" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Game Journey\./);
    await expect(page.locator("[data-admin-db-table='game_journey_items']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='game_journey_items'] > summary")).toContainText("Active runtime data");
    await expect(page.locator("[data-admin-db-table='palette_colors']")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-table='asset_library_items']")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-table='users']")).toHaveCount(0);

    await page.getByRole("button", { name: "Palette" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Palette\./);
    await expect(page.locator("[data-admin-db-table='palette_colors']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='palette_colors'] > summary")).toContainText("Empty schema-only");
    await expect(page.locator("[data-admin-db-table='palette_source_swatches']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='palette_source_swatches'] > summary")).toContainText("Deprecated/history");
    await expect(page.locator("[data-admin-db-table='palette_source_swatches']")).toContainText(
      "Current Colors grid rendering, editing, save/load, and import/export do not read this table."
    );
    await expect(page.locator("[data-admin-db-table='game_journey_items']")).toHaveCount(0);

    await page.getByRole("button", { name: "Asset" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Asset\./);
    await expect(page.locator("[data-admin-db-table='asset_library_items']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='asset_storage_objects']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='palette_colors']")).toHaveCount(0);

    await page.getByRole("button", { name: "Creator Responsibilities" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Creator Responsibilities\./);
    await expect(page.locator("[data-admin-db-table='users']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='user_roles']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='roles']")).toBeVisible();
    expect(await page.locator("[data-admin-db-tables] > details").evaluateAll((details) =>
      details.map((item) => item.dataset.adminDbTable),
    )).toEqual(["users", "user_roles", "roles"]);
    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("Guest");
    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("forge-bot");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("DavidQ");

    await page.getByRole("button", { name: "Tool State Samples" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Tool State Samples\./);
    await expect(page.locator("[data-admin-db-table='tool_state_samples']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='tool_state_samples']")).not.toContainText("Guest Game Journey starter");
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
    await expect(page.locator("[data-admin-db-clear]")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/Local DB loaded \d+ tables and \d+ records for All\./);
    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("forge-bot");
    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("Guest");
    await expect(page.locator("[data-admin-db-table='game_journey_items']")).toContainText("Designer review");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-admin-db-clear]")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("forge-bot");

    await expectNoPageFailures(failures);
  } finally {
    await closeAdminDbPage(page, failures);
  }
});

test("Admin DB Viewer labels Supabase provider/source and shows Supabase-backed tables", async ({ page }) => {
  const fakeSupabase = await startFakeSupabaseAdminDbServer();
  try {
    await withSupabaseEnv(fakeSupabase.baseUrl, async () => {
      const failures = await openSupabaseAdminDbViewer(page);
      try {
        await expect(page.getByRole("heading", { name: "Supabase Postgres", level: 1 })).toBeVisible();
        await expect(page.locator("[data-admin-db-mode-kicker]").first()).toHaveText("Admin Only / Supabase Postgres");
        await expect(page.locator("[data-admin-db-status]")).toHaveText(/Supabase Postgres loaded \d+ tables and \d+ records for All\./);
        await expect(page.locator("[data-admin-db-status-server-mode]")).toHaveText("PASS: supabase-auth (Supabase Auth).");
        await expect(page.locator("[data-admin-db-status-provider]")).toHaveText("supabase-postgres (Supabase Postgres)");
        await expect(page.locator("[data-admin-db-status-source]")).toHaveText("Supabase product DB");
        await expect(page.locator("[data-admin-db-filter]")).toHaveText([
          "All",
          "Asset",
          "Controls",
          "Game Configuration",
          "Game Design",
          "Game Journey",
          "Game Hub",
          "Objects",
          "Palette",
          "Tags",
          "Tool Metadata",
          "Tool Planning",
          "Tool State Samples",
          "Toolbox Votes",
          "Creator Responsibilities",
          "Platform Settings",
          "Support Categories",
        ]);
        await expect(page.locator("[data-admin-db-table='users']")).toContainText("DavidQ");
        await expect(page.locator("[data-admin-db-table='roles']")).toContainText("admin");
        await expect(page.locator("[data-admin-db-table='toolbox_tool_metadata']")).toContainText("Colors");
        await expect(page.locator("[data-admin-db-table='toolbox_tool_planning']")).toContainText("requiredForTestable");
        await expect(page.locator("[data-admin-db-table='toolbox_votes']")).toContainText("No records in this table.");
        await expect(page.locator("[data-admin-db-table='palette_colors']")).toContainText("Supabase Postgres read-only inspection still shows schema headers.");
        await page.getByRole("button", { name: "Tool Metadata" }).click();
        await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Tool Metadata\./);
        await expect(page.locator("[data-admin-db-table='toolbox_tool_metadata']")).toBeVisible();
        await expect(page.locator("[data-admin-db-table='toolbox_tool_planning']")).toHaveCount(0);
        await page.getByRole("button", { name: "Creator Responsibilities" }).click();
        expect(await page.locator("[data-admin-db-tables] > details").evaluateAll((details) =>
          details.map((item) => item.dataset.adminDbTable),
        )).toEqual(["users", "user_roles", "roles"]);
        await expectNoPageFailures(failures);
        expect(fakeSupabase.calls.some((call) => call.path === "/rest/v1/toolbox_tool_metadata?select=*")).toBe(true);
        expect(fakeSupabase.calls.some((call) => call.path === "/rest/v1/toolbox_tool_planning?select=*")).toBe(true);
      } finally {
        await closeAdminDbPage(page, {
          ...failures,
          localDbStoragePath: "",
          previousLocalDbDisable: process.env.GAMEFOUNDRY_LOCAL_DB_DISABLE,
          previousLocalDbStoragePath: process.env.GAMEFOUNDRY_LOCAL_DB_PATH,
        });
      }
    });
  } finally {
    await fakeSupabase.close();
  }
});

test("Admin DB Viewer restores configured table groups when one configured table is unavailable", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/db-viewer.html", {
    productDataSnapshot: createConfiguredDbViewerSnapshot({ missingMembershipLimits: true }),
    sessionCurrent: adminSessionFixture(),
  });

  try {
    await expect(page.getByRole("heading", { name: "Supabase Postgres", level: 1 })).toBeVisible();
    await expect(page.locator("[data-admin-db-mode-kicker]").first()).toHaveText("Admin Only / Supabase Postgres");
    await expect(page.locator("[data-admin-db-status-connection]")).toHaveText("supabase-postgres (Supabase Postgres)");
    await expect(page.locator("[data-admin-db-status-source]")).toHaveText("Supabase product DB");
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/Supabase Postgres loaded \d+ tables and \d+ records for All\./);
    const filterLabels = await page.locator("[data-admin-db-filter]").allTextContents();
    expect(filterLabels).toEqual(expect.arrayContaining([
      "All",
      "Asset",
      "Game Journey",
      "Tool Metadata",
      "Creator Responsibilities",
      "membership_limits",
    ]));
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("DavidQ");
    await expect(page.locator("[data-admin-db-table='roles']")).toContainText("admin");
    await expect(page.locator("[data-admin-db-table='toolbox_tool_metadata']")).toContainText("Colors");
    await expect(page.locator("[data-admin-db-table='membership_limits']")).toContainText("No records in this table.");
    await expect(page.locator("[data-admin-db-table='membership_limits'] thead")).toContainText("storageMb");
    await expect(page.locator("[data-admin-db-source-findings]")).toContainText("membership_limits could not be read");
    await expect(page.locator("[data-admin-db-source-findings]")).toContainText("apply the product data migration");
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText("*.createdBy -> users.key");
    await expectNoPageFailures(failures);
  } finally {
    await closeAdminDbPage(page, failures);
  }
});

test("Admin DB Viewer renders schema headers for an empty configured DB source", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/db-viewer.html", {
    productDataSnapshot: createConfiguredDbViewerSnapshot({ empty: true }),
    sessionCurrent: adminSessionFixture(),
  });

  try {
    await expect(page.getByRole("heading", { name: "Supabase Postgres", level: 1 })).toBeVisible();
    const filterLabels = await page.locator("[data-admin-db-filter]").allTextContents();
    expect(filterLabels).toEqual(expect.arrayContaining(["All", "Palette", "Creator Responsibilities"]));
    await expect(page.locator("[data-admin-db-table='palette_colors']")).toContainText("No records in this table.");
    await expect(page.locator("[data-admin-db-table='palette_colors']")).toContainText("Supabase Postgres read-only inspection still shows schema headers.");
    await expect(page.locator("[data-admin-db-table='palette_colors'] thead")).toContainText("createdAt");
    await expect(page.locator("[data-admin-db-table='membership_limits']")).toContainText("No records in this table.");
    await expect(page.locator("[data-admin-db-table='membership_limits'] thead")).toContainText("monthlyAiCredits");
    await expect(page.locator("[data-admin-db-source-findings]")).toHaveCount(0);
    await expectNoPageFailures(failures);
  } finally {
    await closeAdminDbPage(page, failures);
  }
});

test("Admin DB Viewer shows a visible configured source diagnostic when snapshot loading fails", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/db-viewer.html", {
    productDataError: "Configured database connection is not configured. Add GAMEFOUNDRY_DATABASE_URL on the server.",
    sessionCurrent: adminSessionFixture(),
  });

  try {
    await expect(page.getByRole("heading", { name: "Configured Data", level: 1 })).toBeVisible();
    await expect(page.locator("[data-admin-db-status]")).toHaveText("Configured Data data error. Fix the configured connection, then reload DB Viewer.");
    await expect(page.locator("[data-admin-db-audit-findings]")).toContainText("Configured Data could not render current data");
    await expect(page.locator("[data-admin-db-audit-findings]")).toContainText("GAMEFOUNDRY_DATABASE_URL");
    await expect(page.locator("[data-admin-db-missing-links]")).toContainText("Relationships could not be checked until the Configured Data data error is fixed.");
    await expect(page.locator("[data-admin-db-table]")).toHaveCount(0);
    expect(failures.failedRequests.some((failure) => failure.includes("/api/product-data/snapshot"))).toBe(true);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors.filter((failure) => !failure.includes("Failed to load resource"))).toEqual([]);
  } finally {
    await closeAdminDbPage(page, failures);
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
      "Asset",
      "Controls",
      "Game Configuration",
      "Game Design",
      "Game Journey",
      "Game Hub",
      "Objects",
      "Palette",
      "Tags",
      "Tool Metadata",
      "Tool Planning",
      "Tool State Samples",
      "Toolbox Votes",
      "Creator Responsibilities",
      "Platform Settings",
      "Support Categories",
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
    await expect(page.locator("[data-admin-db-table='tool_state_samples']")).not.toContainText("Guest Game Journey starter");
    await expect(page.locator("[data-admin-db-table='tool_state_samples']")).toContainText(localDbSeedData.samples[0].createdAt);
    await expect(page.locator("[data-admin-db-audit-findings]")).toContainText(
      "All current Local DB tables include createdAt, updatedAt, createdBy, and updatedBy."
    );
    await expect(page.locator("[data-admin-db-stale-display-findings]")).toContainText(
      "No stale display data detected; tables are rendered from current Local DB snapshots."
    );

    const snapshotResponse = await fetch(`${server.baseUrl}/api/local-db/snapshot`);
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
    await page.getByRole("button", { name: "Creator Responsibilities" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/Local DB loaded \d+ tables and \d+ records for Creator Responsibilities\./);
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
    expect(failures.failedRequests.some((failure) => failure.includes("/api/local-db/snapshot"))).toBe(true);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors.filter((failure) => !failure.includes("Failed to load resource"))).toEqual([]);
  } finally {
    await closeAdminDbPage(page, failures);
  }
});

test("Local DB viewer renders live persisted tool records after refresh", async ({ page }) => {
  test.setTimeout(180_000);
  const failures = await openRepoPage(page, "/toolbox/game-journey/index.html", {
    sessionUserKey: MOCK_DB_KEYS.users.user1,
  });
  const server = failures.server;

  try {
    await page.locator("[data-journey-new-note-name]").fill("Persistence Review");
    await page.getByRole("button", { name: "Add Note", exact: true }).click();
    await expect(page.locator("[data-journey-note-status]")).toContainText("Added Persistence Review");
    await page.locator("[data-journey-new-item-title-input]").fill("Persisted DB item");
    await page.getByRole("button", { name: "Add Item" }).click();
    await page.locator("[data-journey-item-details-input]").fill("Local DB viewer should display this user-created item.");
    await expect(page.locator("[data-journey-item-tree]")).toContainText("Persisted DB item");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Persistence Review");
    await page.locator("[data-journey-note-button]", { hasText: "Persistence Review" }).click();
    await expect(page.locator("[data-journey-item-tree]")).toContainText("Persisted DB item");
    await page.locator("[data-journey-new-item-title-input]").fill("Persisted DB item after reload");
    await page.getByRole("button", { name: "Add Item" }).click();
    await expect(page.locator("[data-journey-item-tree]")).toContainText("Persisted DB item after reload");

    await fetch(`${server.baseUrl}/api/session/user`, {
      body: JSON.stringify({ userKey: MOCK_DB_KEYS.users.admin }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    await page.goto(`${server.baseUrl}/admin/db-viewer.html`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Game Journey" }).click();
    await expect(page.locator("[data-admin-db-table='game_journey_notes']")).toContainText("Persistence Review");
    await expect(page.locator("[data-admin-db-table='game_journey_items']")).toContainText("Persisted DB item");
    await expect(page.locator("[data-admin-db-table='game_journey_items']")).toContainText("Persisted DB item after reload");
    const journeyItemKeys = await page.locator("[data-admin-db-table='game_journey_items'] tbody tr").evaluateAll((rows) => (
      rows.map((row) => row.dataset.adminDbRecord)
    ));
    expect(new Set(journeyItemKeys).size).toBe(journeyItemKeys.length);
    await page.getByRole("button", { name: "Creator Responsibilities" }).click();
    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("Guest");
    await expect(page.locator("[data-admin-db-table='users']")).not.toContainText("forge-bot");
    await expect(page.locator("[data-admin-db-table='roles']")).not.toContainText("system");
    await expect(page.locator("[data-admin-db-table='user_roles']")).toContainText("01K2GFSJ0Y");
    await expect(page.locator("[data-admin-db-missing-links]")).toContainText("No missing links detected.");

    await expectNoPageFailures(failures);
  } finally {
    await closeAdminDbPage(page, failures);
  }
});

test("Local DB viewer shows a visible diagnostic for invalid persisted audit users", async ({ page }) => {
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
    await closeAdminDbPage(page, failures);
  }
});

test("Palette and Asset raw Local DB tables are DB-shaped before viewer rendering", () => {
  const paletteRepository = createGameWorkspacePaletteRepository({ persist: false });
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

test("Local DB audit normalization rejects invalid and missing audit users", () => {
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
      createdBy: MOCK_DB_KEYS.users.admin,
      updatedBy: MOCK_DB_KEYS.users.admin,
    }],
  });
  expect(seedTables.users[0].createdBy).toBe(MOCK_DB_KEYS.users.admin);
  expect(seedTables.users[0].updatedBy).toBe(MOCK_DB_KEYS.users.admin);
});
