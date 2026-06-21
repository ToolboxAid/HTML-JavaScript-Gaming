import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { SEED_DB_KEYS } from "../../../src/dev-runtime/seed/seed-db-keys.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

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
  const server = await startRepoServer();
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
  const failedRequests = [];
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
  return {
    consoleErrors,
    failedRequests,
    pageErrors,
    previousApiUrl,
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
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("Admin System Health renders foundation tables without page API calls", async ({ page }) => {
  const context = await openAdminSystemHealthPage(page, SEED_DB_KEYS.users.admin);
  try {
    await expect(page).toHaveTitle(/System Health - Game Foundry Studio LLC/);
    await expect(page.getByRole("heading", { exact: true, name: "System Health" })).toBeVisible();
    await expect(page.getByRole("table", { name: "Environment summary" })).toContainText("DEV");
    await expect(page.getByRole("table", { name: "Environment summary" })).toContainText("IST");
    await expect(page.getByRole("table", { name: "Environment summary" })).toContainText("UAT");
    await expect(page.getByRole("table", { name: "Environment summary" })).toContainText("PRD");
    await expect(page.getByRole("table", { name: "Database health" })).toContainText("Postgres");
    await expect(page.getByRole("table", { name: "Storage health" })).toContainText("Cloudflare R2");
    await expect(page.getByRole("table", { name: "Runtime environment" })).toContainText("********");
    await expect(page.getByRole("table", { name: "Limits and capacity" })).toContainText("Class A Ops");
    await expect(page.getByRole("table", { name: "Diagnostics log" })).toContainText("PASS");
    await expect(page.getByRole("table", { name: "Diagnostics log" })).toContainText("PENDING");
    await expect(page.getByRole("table", { name: "Diagnostics log" })).not.toContainText("FAIL");
    await expect(page.getByText("No active failure is declared")).toHaveCount(0);
    await expect(page.locator("[data-health-status='WARN'], [data-health-status='FAIL']")).toHaveCount(0);
    const nonPassStatuses = page.locator("[data-health-status]:not([data-health-status='PASS'])");
    const nonPassStatusCount = await nonPassStatuses.count();
    expect(nonPassStatusCount).toBeGreaterThan(0);
    for (let index = 0; index < nonPassStatusCount; index += 1) {
      const statusCell = nonPassStatuses.nth(index);
      const title = await statusCell.getAttribute("title");
      const ariaLabel = await statusCell.getAttribute("aria-label");
      expect((title || ariaLabel || "").trim()).not.toEqual("");
    }
    expect(context.requestUrls.some((url) => url.includes("/api/admin/system-health"))).toBe(false);
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
    await expect(page.getByRole("table", { name: "Environment summary" })).toHaveCount(0);
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
  expect(pageSource).not.toContain("assets/theme-v2/js/admin-system-health.js");
  expect(pageSource).toContain("assets/theme-v2/js/admin-owner-navigation.js");
});
