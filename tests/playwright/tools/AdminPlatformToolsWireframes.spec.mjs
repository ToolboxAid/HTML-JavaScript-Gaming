import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";

const ADMIN_TOOL_MENU_LABELS = [
  "Tool Votes",
  "Environments",
  "Users",
  "Game Migration",
  "Platform Settings",
];

const ADMIN_WIREFRAME_PAGES = [
  { heading: "Environments", path: "/admin/environments.html", slug: "environments" },
  { heading: "Users", path: "/admin/users.html", slug: "users" },
  { heading: "Game Migration", path: "/admin/game-migration.html", slug: "game-migration" },
  { heading: "Platform Settings", path: "/admin/platform-settings.html", slug: "platform-settings" },
];

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "admin-platform-tools-wireframes",
    surface: "Admin platform wireframe pages",
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

async function setServerSession(server, userKey) {
  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: "local-mem" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

async function startAdminPage(page, pathName) {
  const server = await startRepoServer();
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];

  page.on("pageerror", (error) => {
    const text = error.stack || error.message;
    if (!isBrowserExtensionNoise(text)) {
      pageErrors.push(error.message);
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error" && !isBrowserExtensionNoise(message.text())) {
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

  await setServerSession(server, MOCK_DB_KEYS.users.admin);
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function expectAdminHeaderMenu(page) {
  const adminSubmenu = page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin']) > .sub-menu");
  await expect(adminSubmenu.locator(":scope > a[data-route='admin-environments']")).toHaveText("Environments");
  await expect(adminSubmenu.locator(":scope > a[data-route='admin-users']")).toHaveText("Users");
  await expect(adminSubmenu.locator(":scope > a[data-route='admin-game-migration']")).toHaveText("Game Migration");
  await expect(adminSubmenu.locator(":scope > a[data-route='admin-platform-settings']")).toHaveText("Platform Settings");
  const myStuffLabels = await adminSubmenu.locator("[data-admin-my-stuff-submenu] a").allTextContents();
  expect(myStuffLabels).not.toContain("Environments");
  expect(myStuffLabels).not.toContain("Game Migration");
}

for (const adminPage of ADMIN_WIREFRAME_PAGES) {
  test(`${adminPage.heading} Admin wireframe preserves template structure`, async ({ page }) => {
    const failures = await startAdminPage(page, adminPage.path);

    try {
      await expectAdminHeaderMenu(page);
      await expect(page.locator(`main[data-admin-only='true'][data-admin-wireframe='${adminPage.slug}']`)).toBeVisible();
      await expect(page.getByRole("heading", { level: 1, name: adminPage.heading })).toBeVisible();
      await expect(page.locator(".tool-workspace.tool-workspace--wide")).toBeVisible();
      await expect(page.locator(".tool-workspace > .tool-column")).toHaveCount(2);
      await expect(page.locator(".tool-center-panel")).toBeVisible();
      await expect(page.locator("[data-admin-tool-menu] a")).toHaveText(ADMIN_TOOL_MENU_LABELS);
      await expect(page.locator("[data-admin-tool-menu] a[aria-current='page']")).toHaveText(adminPage.heading);
      await expect(page.locator(".tool-column").first().locator("details.vertical-accordion")).toHaveCount(2);
      await expect(page.locator(".tool-column").last().locator("details.vertical-accordion")).toHaveCount(2);
      await expect(page.locator(".tool-column").last().getByText("Wireframe only.")).toBeVisible();
      await expect(page.locator("main button:disabled, main input:disabled, main select:disabled").first()).toBeVisible();
      await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);

      await expectNoPageFailures(failures);
    } finally {
      await failures.server.close();
    }
  });
}

test("Tool Votes side menu includes Admin platform wireframes", async ({ page }) => {
  const failures = await startAdminPage(page, "/admin/tool-votes.html");

  try {
    await expectAdminHeaderMenu(page);
    const sideMenuLabels = await page.locator(".side-menu a").allTextContents();
    ADMIN_TOOL_MENU_LABELS.forEach((label) => {
      expect(sideMenuLabels).toContain(label);
    });
    await expect(page.locator(".side-menu a[href='/admin/environments.html']")).toHaveText("Environments");
    await expect(page.locator(".side-menu a[href='/admin/game-migration.html']")).toHaveText("Game Migration");
    await expect(page.locator(".side-menu a[href='/admin/platform-settings.html']")).toHaveText("Platform Settings");

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});
