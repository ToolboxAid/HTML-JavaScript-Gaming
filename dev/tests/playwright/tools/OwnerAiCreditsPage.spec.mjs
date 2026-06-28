import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { SEED_DB_KEYS } from "../../../../api/seed/seed-db-keys.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

async function setSessionUser(server, userKey) {
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

async function openOwnerAiCreditsPage(page, userKey) {
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
  await page.goto(`${server.baseUrl}/owner/ai-credits.html`, { waitUntil: "networkidle" });
  return {
    consoleErrors,
    failedRequests,
    pageErrors,
    server,
  };
}

async function closeOwnerAiCreditsPage(page, context) {
  await workspaceV2CoverageReporter.stop(page);
  await context.server.close();
}

async function readAiCreditDisplayAsUser(page, userKey) {
  return page.evaluate(async (nextUserKey) => {
    await fetch("/api/session/user", {
      body: JSON.stringify({ userKey: nextUserKey }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    const response = await fetch("/api/ai-credits/display");
    const payload = await response.json();
    return payload.data;
  }, userKey);
}

async function readOwnerAiSettings(page) {
  return page.evaluate(async () => {
    const response = await fetch("/api/owner/ai-credits/settings");
    const payload = await response.json();
    return payload.data;
  });
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("Owner AI credits page loads DB-backed settings and saves Small pack price edits", async ({ page }) => {
  const context = await openOwnerAiCreditsPage(page, SEED_DB_KEYS.users.admin);
  try {
    await expect(page).toHaveTitle(/Owner AI Credits - GameFoundryStudio/);
    await expect(page.getByRole("heading", { exact: true, name: "AI Credits" })).toBeVisible();
    await expect(page.locator("[data-owner-ai-status]")).toContainText("PASS:");
    await expect(page.locator("nav[aria-label='Owner tool pages'] a")).toHaveText([
      "AI Credits",
      "DB Viewer",
      "Design System",
      "Grouping Colors",
      "Memberships",
      "Notes",
    ]);

    const smallRow = page.locator("[data-owner-ai-kind='pack']").nth(0);
    await expect(smallRow.locator("[data-owner-ai-field='code']")).toHaveValue("SMALL");
    const priceInput = smallRow.locator("[data-owner-ai-field='priceCents']");
    await expect(priceInput).toHaveValue("500");
    await priceInput.fill("650");
    await expect(page.locator("[data-owner-ai-pending]")).toContainText("Pending pack SMALL");
    await expect(page.locator("[data-owner-ai-pending]")).toContainText("650 cents");
    await smallRow.locator("[data-owner-ai-save]").click();
    await expect(page.locator("[data-owner-ai-status]")).toContainText("PASS: Updated SMALL AI credit pack.");
    await expect(smallRow.locator("[data-owner-ai-field='priceCents']")).toHaveValue("650");

    const display = await readAiCreditDisplayAsUser(page, SEED_DB_KEYS.users.user1);
    const smallPack = display.packs.find((pack) => pack.code === "SMALL");
    expect(smallPack.priceCents).toBe(650);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await closeOwnerAiCreditsPage(page, context);
  }
});

test("Owner AI credits page rejects invalid edits with visible diagnostics before mutation", async ({ page }) => {
  const context = await openOwnerAiCreditsPage(page, SEED_DB_KEYS.users.admin);
  try {
    const smallRow = page.locator("[data-owner-ai-kind='pack']").nth(0);
    const mediumRow = page.locator("[data-owner-ai-kind='pack']").nth(1);
    await smallRow.locator("[data-owner-ai-field='priceCents']").fill("-1");
    await smallRow.locator("[data-owner-ai-save]").click();
    await expect(page.locator("[data-owner-ai-status]")).toContainText("FAIL: Pack price cents must be an integer");

    await smallRow.locator("[data-owner-ai-field='priceCents']").fill("500");
    const mediumCode = await mediumRow.locator("[data-owner-ai-field='code']").inputValue();
    await smallRow.locator("[data-owner-ai-field='code']").fill(mediumCode);
    await smallRow.locator("[data-owner-ai-save]").click();
    await expect(page.locator("[data-owner-ai-status]")).toContainText("FAIL: Duplicate AI credit pack code MEDIUM is not allowed.");

    const settings = await readOwnerAiSettings(page);
    const smallPack = settings.packs.find((pack) => pack.code === "SMALL");
    expect(smallPack.priceCents).toBe(500);
    expect(settings.packs.map((pack) => pack.code)).toEqual(["SMALL", "MEDIUM", "LARGE"]);
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await closeOwnerAiCreditsPage(page, context);
  }
});

test("non-Owner users cannot access the Owner AI credits page", async ({ page }) => {
  const context = await openOwnerAiCreditsPage(page, SEED_DB_KEYS.users.user1);
  try {
    await expect(page.getByRole("heading", { name: "Owner role required" })).toBeVisible();
    await expect(page.locator("[data-session-access-blocked='owner']")).toBeVisible();
    await expect(page.locator("[data-owner-ai-pack-rows]")).toHaveCount(0);
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await closeOwnerAiCreditsPage(page, context);
  }
});

test("Owner AI credits page keeps scripts and styles external", async () => {
  const pageSource = await fs.readFile(path.resolve("owner/ai-credits.html"), "utf8");
  expect(pageSource).not.toMatch(/<style\b/i);
  expect(pageSource).not.toMatch(/<script\b(?![^>]+src=)/i);
  expect(pageSource).not.toMatch(/\son[a-z]+\s*=/i);
  expect(pageSource).not.toMatch(/\sstyle\s*=/i);
  expect(pageSource).toContain("assets/theme-v2/js/owner-ai-credits.js");
});
