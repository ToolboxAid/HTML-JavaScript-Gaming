import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { SEED_DB_KEYS } from "../../../src/dev-runtime/seed/seed-db-keys.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

async function setSessionUser(server, userKey) {
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

async function openAdminSystemHealthPage(page, userKey) {
  const server = await startRepoServer();
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
  await setSessionUser(server, userKey);
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/admin/system-health.html`, { waitUntil: "networkidle" });
  return {
    consoleErrors,
    failedRequests,
    pageErrors,
    server,
  };
}

async function closeAdminSystemHealthPage(page, context) {
  await workspaceV2CoverageReporter.stop(page);
  await context.server.close();
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("Admin System Health renders operational health summaries and filters", async ({ page }) => {
  const context = await openAdminSystemHealthPage(page, SEED_DB_KEYS.users.admin);
  try {
    await expect(page).toHaveTitle(/System Health - Game Foundry Studio LLC/);
    await expect(page.getByRole("heading", { exact: true, name: "System Health" })).toBeVisible();
    await expect(page.locator("[data-admin-system-health-status]")).toContainText("Admin System Health loaded safe status only.");
    await expect(page.locator("[data-admin-health-summary-rows]")).toContainText("Membership operations");
    await expect(page.locator("[data-admin-health-summary-rows]")).toContainText("Invitation support");
    await expect(page.locator("[data-admin-health-summary-rows]")).toContainText("AI credit monitoring");
    await expect(page.locator("[data-admin-health-summary-rows]")).toContainText("Marketplace revenue health");
    await expect(page.locator("[data-admin-health-summary-rows]")).toContainText("Team enforcement health");
    await expect(page.locator("[data-admin-health-config-issue-rows]")).toContainText("Required Admin operations tables and records are available.");

    const membershipFilter = page.locator("[data-admin-health-membership-plan-filter]");
    await expect(membershipFilter).toContainText("FREE");
    await membershipFilter.selectOption("FREE");
    await expect(page.locator("[data-admin-health-membership-rows]")).toContainText("FREE");

    await expect(page.locator("[data-admin-health-invitation-status-filter]")).toBeVisible();
    await expect(page.locator("[data-admin-health-ai-action-filter]")).toBeVisible();
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
    await expect(page.locator("[data-admin-health-summary-rows]")).toHaveCount(0);
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
  expect(pageSource).toContain("assets/theme-v2/js/admin-system-health.js");
});
