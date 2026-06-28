import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";
import { SEED_DB_KEYS } from "../../../../api/seed/seed-db-keys.mjs";

async function setSessionUser(server, userKey) {
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

async function openOwnerMembershipsPage(page, userKey) {
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
  await page.goto(`${server.baseUrl}/owner/memberships.html`, { waitUntil: "networkidle" });
  return {
    consoleErrors,
    failedRequests,
    pageErrors,
    server,
  };
}

async function closeOwnerMembershipsPage(page, context) {
  await workspaceV2CoverageReporter.stop(page);
  await context.server.close();
}

async function readMembershipCatalog(page) {
  return page.evaluate(async () => {
    const response = await fetch("/api/memberships/catalog");
    const payload = await response.json();
    return payload.data;
  });
}

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test("Owner memberships page loads DB-backed settings and saves Creator price edits", async ({ page }) => {
  const context = await openOwnerMembershipsPage(page, SEED_DB_KEYS.users.admin);
  try {
    await expect(page).toHaveTitle(/Owner Memberships - GameFoundryStudio/);
    await expect(page.getByRole("heading", { exact: true, name: "Memberships" })).toBeVisible();
    await expect(page.locator("[data-owner-membership-status]")).toContainText("PASS:");
    await expect(page.locator("[data-owner-membership-founding-summary]")).toContainText("Founding capacity: 0 of 100 assigned");
    await expect(page.locator("nav[aria-label='Owner tool pages'] a")).toHaveText([
      "DB Viewer",
      "Design System",
      "Grouping Colors",
      "Memberships",
      "Notes",
    ]);
    const creatorRow = page.locator("[data-owner-membership-plan-code='CREATOR']");
    await expect(creatorRow).toBeVisible();
    const priceInput = creatorRow.locator("[data-owner-membership-field='monthlyPriceCents']");
    await expect(priceInput).toHaveValue("900");
    await priceInput.fill("1300");
    await expect(page.locator("[data-owner-membership-pending]")).toContainText("Pending CREATOR");
    await expect(page.locator("[data-owner-membership-pending]")).toContainText("1300 cents");
    await creatorRow.locator("[data-owner-membership-save]").click();
    await expect(page.locator("[data-owner-membership-status]")).toContainText("PASS: Updated CREATOR membership settings.");
    await expect(creatorRow.locator("[data-owner-membership-field='monthlyPriceCents']")).toHaveValue("1300");

    const catalog = await readMembershipCatalog(page);
    const creator = catalog.plans.find((entry) => entry.plan.code === "CREATOR");
    expect(creator.plan.monthlyPriceCents).toBe(1300);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await closeOwnerMembershipsPage(page, context);
  }
});

test("Owner memberships page rejects invalid edits with visible diagnostics before mutation", async ({ page }) => {
  const context = await openOwnerMembershipsPage(page, SEED_DB_KEYS.users.admin);
  try {
    const creatorRow = page.locator("[data-owner-membership-plan-code='CREATOR']");
    const priceInput = creatorRow.locator("[data-owner-membership-field='monthlyPriceCents']");
    await priceInput.fill("-1");
    await creatorRow.locator("[data-owner-membership-save]").click();
    await expect(page.locator("[data-owner-membership-status]")).toContainText("FAIL: Price cents must be an integer");

    await priceInput.fill("900");
    await creatorRow.locator("[data-owner-membership-field='revenueShareBps']").fill("10001");
    await creatorRow.locator("[data-owner-membership-save]").click();
    await expect(page.locator("[data-owner-membership-status]")).toContainText("FAIL: Revenue bps must be an integer");

    const catalog = await readMembershipCatalog(page);
    const creator = catalog.plans.find((entry) => entry.plan.code === "CREATOR");
    expect(creator.plan.monthlyPriceCents).toBe(900);
    expect(creator.plan.revenueShareBps).toBe(8000);
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await closeOwnerMembershipsPage(page, context);
  }
});

test("non-Owner users cannot access the Owner memberships page", async ({ page }) => {
  const context = await openOwnerMembershipsPage(page, SEED_DB_KEYS.users.user1);
  try {
    await expect(page.getByRole("heading", { name: "Owner role required" })).toBeVisible();
    await expect(page.locator("[data-session-access-blocked='owner']")).toBeVisible();
    await expect(page.locator("[data-owner-membership-rows]")).toHaveCount(0);
    expect(context.pageErrors).toEqual([]);
    expect(context.consoleErrors).toEqual([]);
    expect(context.failedRequests).toEqual([]);
  } finally {
    await closeOwnerMembershipsPage(page, context);
  }
});
