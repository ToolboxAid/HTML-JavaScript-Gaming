import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { SEED_DB_KEYS } from "../../../src/dev-runtime/seed/seed-db-keys.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const TEST_RUNTIME_ENV_VALUES = Object.freeze({
  GAMEFOUNDRY_ADMIN_HEALTH_DATABASE_URL: "postgresql://env-user:env-secret@example.invalid:5432/admin_health",
  GAMEFOUNDRY_ADMIN_HEALTH_PASSWORD: "admin-health-password-secret",
  GAMEFOUNDRY_ADMIN_HEALTH_PUBLIC_FLAG: "enabled",
  GAMEFOUNDRY_ADMIN_HEALTH_TOKEN: "admin-health-token-secret",
});

const TEST_PUBLIC_SYSTEM_HEALTH_ENV_VALUES = Object.freeze({
  GAMEFOUNDRY_ENVIRONMENT_LABEL: "DEV",
  GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX: "/dev/projects/",
});

async function setSessionUser(server, userKey) {
  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: "local-db" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

async function openAdminSystemHealthPage(page, userKey) {
  const previousRuntimeEnvValues = {};
  Object.entries({
    ...TEST_RUNTIME_ENV_VALUES,
    ...TEST_PUBLIC_SYSTEM_HEALTH_ENV_VALUES,
  }).forEach(([key, value]) => {
    previousRuntimeEnvValues[key] = process.env[key];
    process.env[key] = value;
  });
  const server = await startRepoServer();
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
  const failedRequests = [];
  const apiResponseTextPromises = [];
  const pageErrors = [];
  const consoleErrors = [];
  const requestUrls = [];
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
    if (response.url().includes("/api/admin/system-health")) {
      apiResponseTextPromises.push(response.text().catch((error) => `response text unavailable: ${error.message}`));
    }
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`FAILED ${request.url()}`);
  });
  page.on("request", (request) => {
    requestUrls.push(request.url());
  });
  await setSessionUser(server, userKey);
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/admin/system-health.html`, { waitUntil: "networkidle" });
  const apiResponseTexts = await Promise.all(apiResponseTextPromises);
  return {
    apiResponseTexts,
    consoleErrors,
    failedRequests,
    pageErrors,
    previousApiUrl,
    previousRuntimeEnvValues,
    previousSiteUrl,
    requestUrls,
    server,
  };
}

function restoreEnvValue(key, value) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}

async function closeAdminSystemHealthPage(page, context) {
  await workspaceV2CoverageReporter.stop(page);
  await context.server.close();
  restoreEnvValue("GAMEFOUNDRY_API_URL", context.previousApiUrl);
  restoreEnvValue("GAMEFOUNDRY_SITE_URL", context.previousSiteUrl);
  Object.entries(context.previousRuntimeEnvValues || {}).forEach(([key, value]) => {
    restoreEnvValue(key, value);
  });
}

async function expectClientToHideSecretValues(page, context) {
  const pageText = await page.locator("body").textContent();
  const clientVisibleText = `${pageText || ""}\n${(context.apiResponseTexts || []).join("\n")}`;
  [
    "GAMEFOUNDRY_DATABASE_URL",
    "GAMEFOUNDRY_STORAGE_ACCESS_KEY_ID",
    "GAMEFOUNDRY_STORAGE_SECRET_ACCESS_KEY",
    "CLOUDFLARE_R2_ACCESS_KEY_ID",
    "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
    ...Object.keys(TEST_RUNTIME_ENV_VALUES),
  ].forEach((key) => {
    const value = String(process.env[key] || "").trim();
    if (value.length > 8) {
      expect(clientVisibleText).not.toContain(value);
    }
  });
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("Admin System Health renders Postgres diagnostics through the safe status API", async ({ page }) => {
  const context = await openAdminSystemHealthPage(page, SEED_DB_KEYS.users.admin);
  try {
    await expect(page).toHaveTitle(/System Health - Game Foundry Studio LLC/);
    await expect(page.getByRole("heading", { exact: true, name: "System Health" })).toBeVisible();
    await expect(page.getByRole("table", { name: "Environment identity" })).toContainText("Environment name");
    await expect(page.locator("[data-admin-system-health-environment-value='name']")).toHaveText("DEV");
    await expect(page.locator("[data-admin-system-health-environment-value='hostingModel']")).toHaveText("Local Docker");
    await expect(page.locator("[data-admin-system-health-environment-value='databaseModel']")).toHaveText("Local Docker PostgreSQL");
    await expect(page.locator("[data-admin-system-health-environment-value='storageFolder']")).toHaveText("/dev");
    await expect(page.getByRole("table", { name: "Environment identity" })).not.toContainText("env-secret");
    await expect(page.getByRole("table", { name: "Environment map" })).toContainText("Local");
    await expect(page.getByRole("table", { name: "Environment map" })).toContainText("DEV");
    await expect(page.getByRole("table", { name: "Environment map" })).toContainText("IST");
    await expect(page.getByRole("table", { name: "Environment map" })).toContainText("UAT");
    await expect(page.getByRole("table", { name: "Environment map" })).toContainText("PRD");
    await expect(page.getByRole("table", { name: "Environment map" }).locator("[data-health-status]")).toHaveCount(0);
    await expect(page.getByRole("table", { name: "Local API startup diagnostics" })).toContainText("Approved diagnostics format");
    await expect(page.getByRole("table", { name: "Local API startup diagnostics" })).toContainText("Environment Variables + All Runtime Ports");
    await expect(page.getByRole("table", { name: "Local API startup diagnostics" })).toContainText("Configurable multiple runtime ports");
    await expect(page.getByRole("table", { name: "Local API startup diagnostics" })).toContainText("deferred/cancelled");
    await expect(page.getByRole("table", { name: "Local API startup diagnostics" })).not.toContainText("secret");
    await expect(page.getByRole("table", { name: "Database health" })).toContainText("Postgres");
    await expect(page.locator("[data-admin-system-health-db-value='type']")).toHaveText("Local Docker PostgreSQL");
    await expect(page.locator("[data-admin-system-health-db-value='connectivity']")).not.toHaveText("Loading");
    await expect(page.locator("[data-admin-system-health-db-value='responseTime']")).not.toHaveText("Loading");
    await expect(page.locator("[data-admin-system-health-db-value='version']")).not.toHaveText("Loading");
    await expect(page.locator("[data-admin-system-health-db-value='lastChecked']")).not.toHaveText("Loading");
    await expect(page.getByRole("table", { name: "Database health" })).not.toContainText("postgres://");
    await expect(page.getByRole("table", { name: "Database health" })).not.toContainText("postgresql://");
    await expect(page.getByRole("table", { name: "Storage health" })).toContainText("Cloudflare R2");
    await expect(page.locator("[data-admin-system-health-storage-value='bucket']")).toContainText("/dev");
    await expect(page.locator("[data-admin-system-health-storage-value='list']")).toContainText("/dev");
    await expect(page.locator("[data-admin-system-health-storage-value='upload']")).toContainText("/dev");
    await expect(page.locator("[data-admin-system-health-storage-value='read']")).not.toHaveText("Health object");
    await expect(page.locator("[data-admin-system-health-storage-value='delete']")).not.toHaveText("Health object");
    const historyTable = page.getByRole("table", { name: "Health check history" });
    await expect(historyTable).toContainText("DEV");
    await expect(historyTable).toContainText("Environment Summary");
    await expect(historyTable).toContainText("Database Health");
    await expect(historyTable).toContainText("Storage Health");
    await expect(historyTable).toContainText("Runtime Health");
    await expect(historyTable).not.toContainText("IST");
    await expect(historyTable).not.toContainText("UAT");
    await expect(historyTable).not.toContainText("PRD");
    await expect(historyTable).not.toContainText("/local");
    await expect(historyTable).not.toContainText("/ist");
    await expect(historyTable).not.toContainText("/uat");
    await expect(historyTable).not.toContainText("/prd");
    await expect(page.getByRole("table", { name: "Runtime environment" })).toContainText("********");
    await expect(page.getByRole("table", { name: "Runtime environment" })).toContainText("GAMEFOUNDRY_ADMIN_HEALTH_DATABASE_URL");
    await expect(page.getByRole("table", { name: "Runtime environment" })).toContainText("GAMEFOUNDRY_ADMIN_HEALTH_PUBLIC_FLAG");
    await expect(page.getByRole("table", { name: "Runtime environment" })).not.toContainText(TEST_RUNTIME_ENV_VALUES.GAMEFOUNDRY_ADMIN_HEALTH_DATABASE_URL);
    await expect(page.getByRole("table", { name: "Runtime environment" })).not.toContainText(TEST_RUNTIME_ENV_VALUES.GAMEFOUNDRY_ADMIN_HEALTH_PASSWORD);
    await expect(page.getByRole("table", { name: "Runtime environment" })).not.toContainText(TEST_RUNTIME_ENV_VALUES.GAMEFOUNDRY_ADMIN_HEALTH_TOKEN);
    const runtimeKeys = await page.locator("[data-admin-system-health-runtime-key]").allTextContents();
    expect(runtimeKeys).toEqual([...runtimeKeys].sort((left, right) => left.localeCompare(right)));
    await expect(page.getByRole("table", { name: "Limits and capacity" })).toContainText("Class A Ops");
    await expect(page.getByRole("table", { name: "Diagnostics plan" })).toContainText("Postgres Connection");
    await expect(page.getByRole("table", { name: "Diagnostics plan" })).toContainText("Postgres Migration Reader");
    await expect(page.getByRole("table", { name: "Diagnostics plan" })).toContainText("R2 Bucket Configured");
    await expect(page.getByRole("table", { name: "Diagnostics plan" })).toContainText("R2 List");
    await expect(page.getByRole("table", { name: "Diagnostics plan" })).toContainText("R2 Read");
    await expect(page.getByRole("table", { name: "Diagnostics plan" })).toContainText("R2 Write");
    await expect(page.getByRole("table", { name: "Diagnostics plan" })).toContainText("R2 Delete");
    await expect(page.getByRole("table", { name: "Diagnostics plan" })).toContainText("Runtime Environment Masking");
    await expect(page.getByRole("table", { name: "Diagnostics plan" })).toContainText("Limits/Capacity Metrics");
    await expect(page.getByRole("table", { name: "Diagnostics log" })).toContainText("PASS");
    await expect(page.getByRole("table", { name: "Diagnostics log" })).toContainText("PENDING");
    await expect(page.getByRole("table", { name: "Diagnostics log" })).not.toContainText("FAIL");
    await expect(page.getByText("No active failure is declared")).toHaveCount(0);
    const nonPassStatuses = page.locator("[data-health-status]:not([data-health-status='PASS'])");
    const nonPassStatusCount = await nonPassStatuses.count();
    expect(nonPassStatusCount).toBeGreaterThan(0);
    for (let index = 0; index < nonPassStatusCount; index += 1) {
      const statusCell = nonPassStatuses.nth(index);
      const title = await statusCell.getAttribute("title");
      const ariaLabel = await statusCell.getAttribute("aria-label");
      expect((title || ariaLabel || "").trim()).not.toEqual("");
    }
    expect(context.requestUrls.some((url) => url.includes("/api/admin/system-health/status"))).toBe(true);
    expect(context.requestUrls.filter((url) => url.includes("/api/admin/system-health/storage-connectivity-action"))).toHaveLength(5);
    await expectClientToHideSecretValues(page, context);
    await expect(page.locator("[data-admin-system-health-storage-action]")).toHaveCount(0);
    await expect(page.locator("[data-owner-ai-save], [data-owner-membership-save], [data-owner-ai-credits], [data-owner-memberships]")).toHaveCount(0);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await closeAdminSystemHealthPage(page, context);
  }
});

test("Creator sessions cannot access Admin System Health operations", async ({ page }) => {
  const context = await openAdminSystemHealthPage(page, SEED_DB_KEYS.users.user1);
  try {
    await expect(page.getByRole("heading", { name: "Admin role required" })).toBeVisible();
    await expect(page.locator("[data-session-access-blocked='admin']")).toBeVisible();
    await expect(page.getByRole("table", { name: "Environment identity" })).toHaveCount(0);
    await expect(page.getByRole("table", { name: "Environment map" })).toHaveCount(0);
    await expect(page.getByRole("table", { name: "Health check history" })).toHaveCount(0);
    expect(context.requestUrls.some((url) => url.includes("/api/admin/system-health/status"))).toBe(false);
    expect(context.requestUrls.some((url) => url.includes("/api/admin/system-health/storage-connectivity-action"))).toBe(false);
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await closeAdminSystemHealthPage(page, context);
  }
});

test("Admin System Health operations page keeps scripts and styles external", async () => {
  const pageSource = await fs.readFile(path.resolve("admin/system-health.html"), "utf8");
  expect(pageSource).not.toMatch(/<style\b/i);
  expect(pageSource).not.toMatch(/<script\b(?![^>]+src=)/i);
  expect(pageSource).not.toMatch(/\son[a-z]+\s*=/i);
  expect(pageSource).not.toMatch(/\sstyle\s*=/i);
  expect(pageSource).not.toMatch(/data-health-status="(?:WARN|FAIL)"/);
  expect(pageSource).not.toContain("No active failure is declared");
  expect(pageSource).not.toContain("SQLite");
  expect(pageSource).toContain("Environment Identity");
  expect(pageSource).toContain("Environment Map");
  expect(pageSource).toContain("Diagnostics Plan");
  expect(pageSource).toContain("Local API Startup Diagnostics");
  expect(pageSource).toContain("Server-owned Postgres health reader");
  expect(pageSource).toContain("Server-owned Cloudflare R2 storage diagnostic");
  expect(pageSource).toContain("assets/theme-v2/js/admin-system-health.js");
  expect(pageSource).toContain("assets/theme-v2/js/admin-owner-navigation.js");
  const runtimeSource = await fs.readFile(path.resolve("assets/theme-v2/js/admin-system-health.js"), "utf8");
  expect(runtimeSource).not.toContain("SQLite");
  expect(runtimeSource).not.toContain("localStorage");
  expect(runtimeSource).not.toContain("sessionStorage");
  expect(runtimeSource).toContain("runAdminSystemHealthStorageConnectivityAction");
});
