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

async function openAdminInvitationsPage(page, userKey) {
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
  await page.goto(`${server.baseUrl}/admin/invitations.html`, { waitUntil: "networkidle" });
  return {
    consoleErrors,
    failedRequests,
    pageErrors,
    server,
  };
}

async function closeAdminInvitationsPage(page, context) {
  await workspaceV2CoverageReporter.stop(page);
  await context.server.close();
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("Admin Invitations uses shared navigation and creates personalized Beta invitation records", async ({ page }) => {
  const context = await openAdminInvitationsPage(page, SEED_DB_KEYS.users.admin);
  try {
    await expect(page).toHaveTitle(/Invitations - Game Foundry Studio LLC/);
    await expect(page.getByRole("heading", { exact: true, name: "Invitations" })).toBeVisible();
    await expect(page.locator("nav[aria-label='Admin tool pages'] a")).toContainText([
      "Analytics",
      "Branding",
      "Controls",
      "DB Viewer",
      "Design System",
      "Environments",
      "Game Migration",
      "Grouping Colors",
      "Infrastructure",
      "Invitations",
      "Moderation",
      "Operations",
      "Platform Settings",
      "Ratings",
      "Roles",
      "Site Settings",
      "Site Setup",
      "System Health",
      "Themes",
      "Tool Votes",
      "Users",
    ]);
    await expect(page.locator("nav[aria-label='Admin tool pages'] a[aria-current='page']")).toHaveText("Invitations");

    await page.locator("[data-admin-invitation-email]").fill("personalized-beta@example.invalid");
    await page.locator("[data-admin-invitation-recipient-name]").fill("Personalized Beta");
    await page.locator("[data-admin-invitation-relationship-note]").fill("Community playtester");
    await page.locator("[data-admin-invitation-message]").fill("Welcome into the private Beta preview.");
    await page.locator("[data-admin-invitation-source]").fill("manual-admin");
    await page.locator("[data-admin-invitation-form] button[type='submit']").click();

    await expect(page.locator("[data-admin-invitation-status]")).toContainText("PASS: Created pending Beta invitation for personalized-beta@example.invalid.");
    await expect(page.locator("[data-admin-invitation-rows]")).toContainText("personalized-beta@example.invalid");
    await expect(page.locator("[data-admin-invitation-rows]")).toContainText("Personalized Beta");
    await expect(page.locator("[data-admin-invitation-rows]")).toContainText("Community playtester");
    await expect(page.locator("[data-admin-invitation-rows]")).toContainText("Welcome into the private Beta preview.");
    await expect(page.locator("[data-admin-invitation-rows]")).toContainText("manual-admin");
    await expect(page.locator("[data-admin-invitation-rows]")).toContainText("pending");
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await closeAdminInvitationsPage(page, context);
  }
});

test("non-Admin users cannot access Admin Invitations", async ({ page }) => {
  const context = await openAdminInvitationsPage(page, SEED_DB_KEYS.users.user1);
  try {
    await expect(page.getByRole("heading", { name: "Admin role required" })).toBeVisible();
    await expect(page.locator("[data-session-access-blocked='admin']")).toBeVisible();
    await expect(page.locator("[data-admin-invitation-rows]")).toHaveCount(0);
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await closeAdminInvitationsPage(page, context);
  }
});

test("Admin Invitations page keeps scripts and styles external", async () => {
  const pageSource = await fs.readFile(path.resolve("admin/invitations.html"), "utf8");
  expect(pageSource).not.toMatch(/<style\b/i);
  expect(pageSource).not.toMatch(/<script\b(?![^>]+src=)/i);
  expect(pageSource).not.toMatch(/\son[a-z]+\s*=/i);
  expect(pageSource).not.toMatch(/\sstyle\s*=/i);
  expect(pageSource).toContain("assets/theme-v2/js/admin-owner-navigation.js");
  expect(pageSource).toContain("assets/theme-v2/js/admin-invitations.js");
});
