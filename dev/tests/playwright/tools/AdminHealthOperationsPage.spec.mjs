import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { SEED_DB_KEYS } from "../../../../api/seed/seed-db-keys.mjs";
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
    const comparisonTable = page.getByRole("table", { name: "Environment health comparison" });
    await expect(comparisonTable).toContainText("Local (VS Code)");
    await expect(comparisonTable).toContainText("Local static server + Local API");
    await expect(comparisonTable).toContainText("DEV");
    await expect(comparisonTable).toContainText("Current");
    await expect(comparisonTable).toContainText("IST");
    await expect(comparisonTable).toContainText("UAT");
    await expect(comparisonTable).toContainText("PROD");
    await expect(comparisonTable).toContainText("Not Configured");
    await expect(comparisonTable).toContainText("Unavailable");
    const capabilitiesTable = page.getByRole("table", { name: "Environment capabilities" });
    await expect(capabilitiesTable).toContainText("Hosting");
    await expect(capabilitiesTable).toContainText("API");
    await expect(capabilitiesTable).toContainText("Database");
    await expect(capabilitiesTable).toContainText("Storage");
    await expect(capabilitiesTable).toContainText("Scheduled Monitoring");
    await expect(capabilitiesTable).not.toContainText("/uat");
    const apiContractTable = page.getByRole("table", { name: "Health API contract" });
    await expect(apiContractTable).toContainText("2026-06-24.system-health.v1");
    await expect(apiContractTable).toContainText("Current deployment only");
    await expect(apiContractTable).toContainText("Reference only");
    await expect(apiContractTable).toContainText("GET /api/runtime/health");
    await expect(apiContractTable).toContainText("GET /api/admin/system-health/status");
    const apiRegistryTable = page.getByRole("table", { name: "Admin API registry" });
    await expect(apiRegistryTable).toContainText("/api/runtime/health");
    await expect(apiRegistryTable).toContainText("/api/admin/system-health/status");
    await expect(apiRegistryTable).toContainText("/api/admin/system-health/action");
    await expect(apiRegistryTable).toContainText("/api/admin/infrastructure/storage-path-status");
    await expect(apiRegistryTable).toContainText("/api/admin/operations/status");
    await expect(apiRegistryTable).toContainText("/api/navigation/admin-menu");
    const featureFlagsTable = page.getByRole("table", { name: "Runtime feature flags" });
    await expect(featureFlagsTable).toContainText("system-health.api-contract");
    await expect(featureFlagsTable).toContainText("system-health.environment-capabilities");
    await expect(featureFlagsTable).toContainText("system-health.manual-actions");
    await expect(featureFlagsTable).toContainText("system-health.notifications");
    await expect(featureFlagsTable).toContainText("Not Configured");
    const serviceCards = page.locator("[data-admin-system-health-service-card]");
    await expect(serviceCards).toHaveCount(7);
    const serviceCardText = (await serviceCards.allTextContents()).join("\n");
    ["Runtime", "API", "Database", "Storage", "Authentication", "Email", "Background Jobs"].forEach((label) => {
      expect(serviceCardText).toContain(label);
    });
    const serviceStatuses = await serviceCards.locator("[data-health-status]").allTextContents();
    expect(serviceStatuses.every((status) => ["PASS", "WARN", "FAIL", "NOT CONFIGURED"].includes(status.trim()))).toBe(true);
    expect(serviceStatuses).toContain("PASS");
    const configurationTable = page.getByRole("table", { name: "Configuration summary" });
    await expect(configurationTable).toContainText("Current environment");
    await expect(configurationTable).toContainText("Hosting model");
    await expect(configurationTable).toContainText("Site URL");
    await expect(configurationTable).toContainText("API URL");
    await expect(configurationTable).toContainText("Database provider/type");
    await expect(configurationTable).toContainText("Storage provider/folder");
    await expect(configurationTable).toContainText("Auth provider/status");
    await expect(configurationTable).not.toContainText("env-secret");
    await expect(page.getByRole("button", { name: "Refresh" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Run Runtime Check" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Run Database Check" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Run Storage Check" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Run Full Health Check" })).toBeVisible();
    const scheduledTable = page.getByRole("table", { name: "Scheduled health monitoring" });
    await expect(scheduledTable).toContainText("Last scheduled run");
    await expect(scheduledTable).toContainText("Next scheduled run");
    await expect(scheduledTable).toContainText("Duration");
    await expect(scheduledTable).toContainText("Recent result");
    await expect(scheduledTable).toContainText("Failures/warnings");
    await expect(scheduledTable).toContainText("Not Configured");
    const notificationsTable = page.getByRole("table", { name: "Notifications and alerts" });
    await expect(notificationsTable).toContainText("Email alerts");
    await expect(notificationsTable).toContainText("Admin notifications");
    await expect(notificationsTable).toContainText("Webhook alerts");
    await expect(notificationsTable).toContainText("Messages integration");
    await expect(notificationsTable).toContainText("Not Configured");
    await expect(page.getByRole("table", { name: "Local API startup diagnostics" })).toContainText("Approved diagnostics format");
    await expect(page.getByRole("table", { name: "Local API startup diagnostics" })).toContainText("Environment Variables + All Runtime Ports");
    await expect(page.getByRole("table", { name: "Local API startup diagnostics" })).toContainText("Environment variable order");
    await expect(page.getByRole("table", { name: "Local API startup diagnostics" })).toContainText("Secret masking markers");
    await expect(page.getByRole("table", { name: "Local API startup diagnostics" })).toContainText("Local API URL");
    await expect(page.getByRole("table", { name: "Local API startup diagnostics" })).toContainText("Local site URL port");
    await expect(page.getByRole("table", { name: "Local API startup diagnostics" })).toContainText("Database mode");
    await expect(page.getByRole("table", { name: "Local API startup diagnostics" })).toContainText("Storage status");
    await expect(page.getByRole("table", { name: "Local API startup diagnostics" })).toContainText("Configurable multiple runtime ports");
    await expect(page.getByRole("table", { name: "Local API startup diagnostics" })).toContainText("deprecated/superseded");
    await expect(page.getByRole("table", { name: "Local API startup diagnostics" })).not.toContainText("secret");
    await expect(page.getByRole("table", { name: "Database health" })).toContainText("Postgres");
    await expect(page.locator("[data-admin-system-health-db-value='type']")).toHaveText("Local Docker PostgreSQL");
    await expect(page.locator("[data-admin-system-health-db-value='connectivity']")).not.toHaveText("Loading");
    await expect(page.locator("[data-admin-system-health-db-value='responseTime']")).not.toHaveText("Loading");
    await expect(page.locator("[data-admin-system-health-db-value='version']")).not.toHaveText("Loading");
    await expect(page.locator("[data-admin-system-health-db-value='lastChecked']")).not.toHaveText("Loading");
    await expect(page.getByRole("table", { name: "Database health" })).not.toContainText("postgres://");
    await expect(page.getByRole("table", { name: "Database health" })).not.toContainText("postgresql://");
    const postgresMetricsTable = page.getByRole("table", { name: "Postgres metrics" });
    await expect(postgresMetricsTable).toContainText("Connection status");
    await expect(postgresMetricsTable).toContainText("Database name");
    await expect(postgresMetricsTable).toContainText("Current schema");
    await expect(postgresMetricsTable).toContainText("Migration status");
    await expect(postgresMetricsTable).toContainText("Last migration");
    await expect(postgresMetricsTable).toContainText("Table count");
    await expect(postgresMetricsTable).toContainText("Database size");
    await expect(postgresMetricsTable).not.toContainText("postgres://");
    await expect(postgresMetricsTable).not.toContainText("postgresql://");
    await expect(page.getByRole("table", { name: "Storage health" })).toContainText("Cloudflare R2");
    await expect(page.locator("[data-admin-system-health-storage-value='bucket']")).toContainText("/dev");
    await expect(page.locator("[data-admin-system-health-storage-value='list']")).toContainText("/dev");
    await expect(page.locator("[data-admin-system-health-storage-value='upload']")).toContainText("/dev");
    await expect(page.locator("[data-admin-system-health-storage-value='read']")).not.toHaveText("Health object");
    await expect(page.locator("[data-admin-system-health-storage-value='delete']")).not.toHaveText("Health object");
    await expect(page.locator("[data-admin-system-health-storage-timing='list']")).not.toHaveText("Loading");
    await expect(page.locator("[data-admin-system-health-storage-timing='upload']")).not.toHaveText("Loading");
    await expect(page.locator("[data-admin-system-health-storage-timing='read']")).not.toHaveText("Loading");
    await expect(page.locator("[data-admin-system-health-storage-timing='delete']")).not.toHaveText("Loading");
    await expect(page.getByRole("table", { name: "Runtime health" })).toContainText("Runtime Health");
    await expect(page.locator("[data-admin-system-health-runtime-health-value='environment']")).toHaveText("DEV");
    await expect(page.locator("[data-admin-system-health-runtime-health-value='appVersion']")).toHaveText("1.0.0");
    await expect(page.locator("[data-admin-system-health-runtime-health-value='apiVersion']")).toHaveText("1.0.0");
    await expect(page.locator("[data-admin-system-health-runtime-health-value='nodeVersion']")).toContainText("v");
    await expect(page.locator("[data-admin-system-health-runtime-health-value='serverStartTime']")).not.toHaveText("Loading");
    await expect(page.locator("[data-admin-system-health-runtime-health-value='uptime']")).toContainText("s");
    await expect(page.locator("[data-admin-system-health-runtime-health-value='lastChecked']")).not.toHaveText("Loading");
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
    expect(context.requestUrls.filter((url) => url.includes("/api/admin/system-health/storage-connectivity-action"))).toHaveLength(1);
    await page.getByRole("button", { name: "Run Runtime Check" }).click();
    await expect(page.getByRole("table", { name: "Manual health action results" })).toContainText("Run Runtime Check");
    expect(context.requestUrls.some((url) => url.includes("/api/admin/system-health/action"))).toBe(true);
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
  const retiredFileDbToken = "SQL" + "ite";
  const pageSource = await fs.readFile(path.resolve("www/admin/system-health.html"), "utf8");
  expect(pageSource).not.toMatch(/<style\b/i);
  expect(pageSource).not.toMatch(/<script\b(?![^>]+src=)/i);
  expect(pageSource).not.toMatch(/\son[a-z]+\s*=/i);
  expect(pageSource).not.toMatch(/\sstyle\s*=/i);
  expect(pageSource).not.toMatch(/data-health-status="(?:WARN|FAIL)"/);
  expect(pageSource).not.toContain("No active failure is declared");
  expect(pageSource).not.toMatch(/foundation PR|foundation view|placeholder|Pending metric|intentionally not wired/i);
  expect(pageSource).not.toContain(retiredFileDbToken);
  expect(pageSource).toContain("Environment Identity");
  expect(pageSource).toContain("Environment Map");
  expect(pageSource).toContain("Environment Health Comparison");
  expect(pageSource).toContain("Environment Capabilities");
  expect(pageSource).toContain("Health API Contract");
  expect(pageSource).toContain("Admin API Registry");
  expect(pageSource).toContain("Runtime Feature Flags");
  expect(pageSource).toContain("Service Health");
  expect(pageSource).toContain("Configuration Summary");
  expect(pageSource).toContain("Manual Health Actions");
  expect(pageSource).toContain("Scheduled Health Monitoring");
  expect(pageSource).toContain("Notifications &amp; Alerts");
  expect(pageSource).toContain("Runtime Health");
  expect(pageSource).toContain("Diagnostics Plan");
  expect(pageSource).toContain("Local API Startup Diagnostics");
  expect(pageSource).toContain("Postgres Metrics");
  expect(pageSource).toContain("Server-owned Postgres health reader");
  expect(pageSource).toContain("Server-owned Cloudflare R2 storage diagnostic");
  expect(pageSource).toContain("assets/theme-v2/js/admin-system-health.js");
  expect(pageSource).toContain("assets/theme-v2/js/admin-owner-navigation.js");
  const runtimeSource = await fs.readFile(path.resolve("www/assets/theme-v2/js/admin-system-health.js"), "utf8");
  expect(runtimeSource).not.toContain(retiredFileDbToken);
  expect(runtimeSource).not.toContain("localStorage");
  expect(runtimeSource).not.toContain("sessionStorage");
  expect(runtimeSource).toContain("runAdminSystemHealthAction");
  expect(runtimeSource).toContain("runAdminSystemHealthStorageExpandedValidation");
});
