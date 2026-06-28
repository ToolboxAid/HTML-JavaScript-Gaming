import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { SEED_DB_KEYS } from "../../../../api/seed/seed-db-keys.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

async function openAiCreditsPage(page) {
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
  await page.route("**/api/platform-settings/banner", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: {
          banner: {
            active: false,
            message: "",
            tone: "info",
          },
          sourceTable: "test-fixture",
        },
        ok: true,
      }),
      contentType: "application/json; charset=utf-8",
      status: 200,
    });
  });
  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: "local-db" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey: SEED_DB_KEYS.users.user1 }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/account/ai-credits.html`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("account AI credits page renders service-backed credits, packs, and diagnostics", async ({ page }) => {
  const { consoleErrors, failedRequests, pageErrors, server } = await openAiCreditsPage(page);

  try {
    await expect(page).toHaveTitle(/AI Credits - Game Foundry Studio/);
    await expect(page.getByRole("heading", { exact: true, name: "AI Credits" })).toBeVisible();
    await expect(page.locator("header.site-header")).toBeVisible();
    await expect(page.locator("footer.footer")).toBeVisible();
    await expect(page.locator("[data-account-side-nav-link][aria-current='page']")).toHaveText("AI Credits");
    await expect(page.locator("[data-ai-credits-status]")).toContainText("WARN:");
    await expect(page.getByRole("heading", { name: "Balance unavailable" })).toBeVisible();
    await expect(page.getByText("No AI credit balance record exists yet.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Free AI grant" })).toBeVisible();
    await expect(page.getByText("0 credits per month")).toBeVisible();
    await expect(page.getByRole("heading", { exact: true, name: "Small" })).toBeVisible();
    await expect(page.getByText("100 credits for $5")).toBeVisible();
    await expect(page.getByRole("heading", { exact: true, name: "Medium" })).toBeVisible();
    await expect(page.getByText("500 credits for $20")).toBeVisible();
    await expect(page.getByRole("heading", { exact: true, name: "Large" })).toBeVisible();
    await expect(page.getByText("3,000 credits for $99")).toBeVisible();
    await expect(page.getByText("No AI credit usage has been recorded for this account yet.")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("account AI credits page keeps scripts and styles external", async () => {
  const pageSource = await fs.readFile(path.resolve("account/ai-credits.html"), "utf8");
  expect(pageSource).not.toMatch(/<style\b/i);
  expect(pageSource).not.toMatch(/<script\b(?![^>]+src=)/i);
  expect(pageSource).not.toMatch(/\son[a-z]+\s*=/i);
  expect(pageSource).not.toMatch(/\sstyle\s*=/i);
  expect(pageSource).toContain("../assets/theme-v2/js/account-ai-credits.js");
});

