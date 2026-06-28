import { expect, test } from "@playwright/test";
import { SEED_DB_KEYS } from "../../../../api/seed/seed-db-keys.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

async function preparePage(page, userKey = SEED_DB_KEYS.users.user1) {
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
    body: JSON.stringify({ userKey }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  return { consoleErrors, failedRequests, pageErrors, server };
}

async function openMarketplacePage(page, userKey) {
  const context = await preparePage(page, userKey);
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${context.server.baseUrl}/marketplace/index.html`, { waitUntil: "networkidle" });
  return context;
}

async function assignCreatorMembership(server) {
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey: SEED_DB_KEYS.users.admin }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await fetch(`${server.baseUrl}/api/admin/memberships/assign`, {
    body: JSON.stringify({
      externalSubscriptionId: "sub_marketplace_page_creator",
      planCode: "CREATOR",
      source: "paid",
      userKey: SEED_DB_KEYS.users.user1,
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey: SEED_DB_KEYS.users.user1 }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

async function expectApprovedCategories(page) {
  await expect(page.locator("[data-marketplace-categories-status]")).toContainText("PASS:");
  await expect(page.getByRole("heading", { name: "Browse Categories" })).toBeVisible();
  await expect(page.locator("[data-marketplace-category]")).toHaveCount(7);
  await expect(page.locator("[data-marketplace-category] h2")).toHaveText([
    "Assets",
    "Audio",
    "Games",
    "Music",
    "Templates",
    "Tutorials",
    "Worlds",
  ]);
  await expect(page.locator("[data-marketplace-category='assets']")).toContainText("Assets");
  await expect(page.locator("[data-marketplace-category='audio']")).toContainText("Audio");
  await expect(page.locator("[data-marketplace-category='games']")).toContainText("Games");
  await expect(page.locator("[data-marketplace-category='music']")).toContainText("Music");
  await expect(page.locator("[data-marketplace-category='templates']")).toContainText("Templates");
  await expect(page.locator("[data-marketplace-category='tutorials']")).toContainText("Tutorials");
  await expect(page.locator("[data-marketplace-category='worlds']")).toContainText("Worlds");
  await expect(page.locator("[data-marketplace-category='tools']")).toHaveCount(0);
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("marketplace page allows Free users to browse, buy, and download but blocks selling", async ({ page }) => {
  const { consoleErrors, failedRequests, pageErrors, server } = await openMarketplacePage(page, SEED_DB_KEYS.users.user1);

  try {
    await expect(page).toHaveTitle(/Marketplace - GameFoundryStudio/);
    await expect(page.getByRole("heading", { name: "Assets, templates and reusable game parts." })).toBeVisible();
    await expect(page.locator("[data-marketplace-status]")).toContainText("PASS:");
    await expect(page.getByRole("heading", { name: "Active: Free" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Browse Marketplace" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Buy Assets" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Download Free Assets" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Sell Assets" })).toBeDisabled();
    await expect(page.locator("[data-marketplace-action='sell']")).toContainText("Creator or higher membership is required to sell marketplace assets.");
    await expect(page.getByRole("heading", { name: "Seller revenue unavailable" })).toBeVisible();
    await expect(page.locator("[data-marketplace-revenue]")).toContainText("Creator or higher membership is required before seller revenue applies.");
    await expect(page.locator("[data-marketplace-revenue]")).toContainText("Processing fees");
    await expect(page.locator("[data-marketplace-revenue]")).toContainText("Taxes");
    await expect(page.locator("[data-marketplace-revenue]")).toContainText("Refunds");
    await expect(page.locator("[data-marketplace-revenue]")).toContainText("Chargebacks");
    await expect(page.locator("[data-marketplace-revenue]")).toContainText("Required deductions");
    await expectApprovedCategories(page);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("marketplace page enables selling for Creator membership", async ({ page }) => {
  const context = await preparePage(page, SEED_DB_KEYS.users.user1);
  await assignCreatorMembership(context.server);
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${context.server.baseUrl}/marketplace/index.html`, { waitUntil: "networkidle" });

  try {
    await expect(page.getByRole("heading", { name: "Active: Creator" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Browse Marketplace" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Buy Assets" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Download Free Assets" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Sell Assets" })).toBeEnabled();
    await expect(page.locator("[data-marketplace-action='sell']")).toContainText("Active membership allows selling marketplace assets.");
    await expect(page.getByRole("heading", { name: "80% of Net Revenue" })).toBeVisible();
    await expect(page.locator("[data-marketplace-revenue]")).toContainText("Revenue previews require explicit sale, fee, tax, refund, chargeback, and deduction inputs.");
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await context.server.close();
  }
});
