import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { SEED_DB_KEYS } from "../../../../api/seed/seed-db-keys.mjs";

async function openMembershipsPage(page, options = {}) {
  if (options.viewport) {
    await page.setViewportSize(options.viewport);
  }
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
  await page.goto(`${server.baseUrl}/memberships/index.html`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

test("public memberships page renders tiers with shared Theme V2 chrome", async ({ page }) => {
  const { consoleErrors, failedRequests, pageErrors, server } = await openMembershipsPage(page);

  try {
    await expect(page).toHaveTitle(/Memberships - GameFoundryStudio/);
    await expect(page.getByRole("heading", { exact: true, name: "Memberships" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Active: Free" })).toBeVisible();
    await expect(page.getByRole("heading", { exact: true, name: "Free" })).toBeVisible();
    await expect(page.getByRole("heading", { exact: true, name: "Creator" })).toBeVisible();
    await expect(page.getByRole("heading", { exact: true, name: "Studio" })).toBeVisible();
    await expect(page.getByRole("heading", { exact: true, name: "Beta" })).toBeVisible();
    await expect(page.getByRole("heading", { exact: true, name: "Founding Creator" })).toBeVisible();
    await expect(page.getByRole("heading", { exact: true, name: "Founding Studio" })).toBeVisible();
    await expect(page.getByText("$0/month", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("$9/month", { exact: true })).toBeVisible();
    await expect(page.getByText("$19/month", { exact: true })).toBeVisible();
    await expect(page.getByText("250 MB storage").first()).toBeVisible();
    await expect(page.getByText("1 GB storage").first()).toBeVisible();
    await expect(page.getByText("4 GB storage").first()).toBeVisible();
    await expect(page.getByText("Invitation Only")).toBeVisible();
    await expect(page.getByText("Checkout Coming Soon").first()).toBeVisible();
    await expect(page.getByText("Free", { exact: true })).toBeVisible();
    await expect(page.getByText("Creator", { exact: true })).toBeVisible();
    await expect(page.getByText("Studio", { exact: true })).toBeVisible();
    await expect(page.locator("header.site-header")).toBeVisible();
    await expect(page.locator("footer.footer")).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='marketplace']) > .sub-menu a")).toHaveText([
      "Marketplace Home",
      "Memberships",
    ]);
    await expect(page.locator("nav.nav-links a[data-route='memberships']")).toHaveClass(/active/);
    await expect(page.locator("nav.nav-links a[data-route='memberships']")).toHaveAttribute("href", "../memberships/index.html");
    await expect(page.locator("footer.footer .footer__group").filter({ has: page.locator("#footer-product") }).locator(".footer__links a")).toHaveText([
      "Games",
      "Learn",
      "Marketplace",
      "Memberships",
      "Toolbox",
    ]);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  } finally {
    await server.close();
  }
});

test("memberships link remains visible in the narrow shared navigation layout", async ({ page }) => {
  const { consoleErrors, failedRequests, pageErrors, server } = await openMembershipsPage(page, {
    viewport: { width: 390, height: 900 },
  });

  try {
    await expect(page.locator("header.site-header")).toBeVisible();
    await expect(page.locator("nav.nav-links a[data-route='memberships']")).toBeVisible();
    await expect(page.locator("footer.footer a[data-route='memberships']")).toBeVisible();
    const layout = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  } finally {
    await server.close();
  }
});
