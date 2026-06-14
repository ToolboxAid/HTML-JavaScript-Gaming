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
    await expect(page.locator(".tool-workspace.tool-workspace--wide")).toBeVisible();
    await expect(page.locator(".tool-workspace > .tool-column")).toHaveCount(2);
    await expect(page.locator(".tool-center-panel")).toBeVisible();
    await expect(page.locator("[data-admin-tool-menu] a")).toHaveText(ADMIN_TOOL_MENU_LABELS);
    await expect(page.locator("[data-admin-tool-menu] a[aria-current='page']")).toHaveText("Tool Votes");
    await expect(page.locator("[data-admin-tool-menu] a[href='/admin/environments.html']")).toHaveText("Environments");
    await expect(page.locator("[data-admin-tool-menu] a[href='/admin/game-migration.html']")).toHaveText("Game Migration");
    await expect(page.locator("[data-admin-tool-menu] a[href='/admin/platform-settings.html']")).toHaveText("Platform Settings");
    await page.getByLabel("Tool Display Mode").click();
    await expect(page.locator("body")).toHaveClass(/tool-focus-mode/);
    await expect(page.locator("header.site-header")).toBeVisible();
    await expect(page.locator("footer.footer")).toBeVisible();
    const fullscreenMetrics = await page.locator("[data-toolbox-votes-layout]").evaluate((workspace) => {
      const left = workspace.querySelector(".tool-column:first-of-type");
      const center = workspace.querySelector("[data-toolbox-votes-panel]");
      const right = workspace.querySelector(".tool-column:last-of-type");
      const scrollRegion = workspace.querySelector("[data-toolbox-votes-scroll-region]");
      const sortButton = scrollRegion?.querySelector("thead [data-toolbox-votes-sort='toolName']");
      const header = document.querySelector("header.site-header");
      const footer = document.querySelector("footer.footer");
      const bodyScrollBefore = document.scrollingElement?.scrollTop || 0;
      const tableBody = scrollRegion?.querySelector("tbody");
      const sourceRow = tableBody?.querySelector("tr");
      if (tableBody && sourceRow) {
        for (let index = 0; index < 90; index += 1) {
          const clone = sourceRow.cloneNode(true);
          clone.dataset.toolboxVotesLargeCountRow = String(index + 1);
          tableBody.append(clone);
        }
      }
      if (scrollRegion) {
        scrollRegion.scrollTop = scrollRegion.scrollHeight;
        scrollRegion.scrollLeft = scrollRegion.scrollWidth;
      }
      if (footer) {
        footer.scrollTop = footer.scrollHeight;
      }
      const headerBox = header?.getBoundingClientRect();
      const footerBox = footer?.getBoundingClientRect();
      const scrollRegionBox = scrollRegion?.getBoundingClientRect();
      const sortButtonBox = sortButton?.getBoundingClientRect();
      const firstBodyRowBox = scrollRegion?.querySelector("tbody tr")?.getBoundingClientRect();
      const stickyHeaderCell = sortButton?.closest("th");
      const stickyHeaderStyle = stickyHeaderCell ? getComputedStyle(stickyHeaderCell) : null;
      const sortButtonStyle = sortButton ? getComputedStyle(sortButton) : null;
      return {
        bodyOverflowY: getComputedStyle(document.body).overflowY,
        bodyScrollAfter: document.scrollingElement?.scrollTop || 0,
        bodyScrollBefore,
        centerOverflowY: center ? getComputedStyle(center).overflowY : "",
        footerBottom: footerBox ? Math.round(footerBox.bottom) : 0,
        footerOverflowY: footer ? getComputedStyle(footer).overflowY : "",
        footerPosition: footer ? getComputedStyle(footer).position : "",
        footerScrollable: footer ? footer.scrollHeight > footer.clientHeight : false,
        footerScrollTop: footer ? footer.scrollTop : 0,
        footerTop: footerBox ? Math.round(footerBox.top) : 0,
        headerPosition: header ? getComputedStyle(header).position : "",
        headerTop: headerBox ? Math.round(headerBox.top) : 0,
        horizontalScrollLeft: scrollRegion ? scrollRegion.scrollLeft : 0,
        horizontalScrollable: scrollRegion ? scrollRegion.scrollWidth > scrollRegion.clientWidth : false,
        firstBodyRowBottom: firstBodyRowBox ? Math.round(firstBodyRowBox.bottom) : 0,
        leftOverflowY: left ? getComputedStyle(left).overflowY : "",
        rightOverflowY: right ? getComputedStyle(right).overflowY : "",
        scrollRegionBottom: scrollRegionBox ? Math.round(scrollRegionBox.bottom) : 0,
        scrollRegionHeight: scrollRegion ? scrollRegion.clientHeight : 0,
        scrollRegionScrollTop: scrollRegion ? scrollRegion.scrollTop : 0,
        scrollRegionVerticalScrollable: scrollRegion ? scrollRegion.scrollHeight > scrollRegion.clientHeight : false,
        scrollRegionOverflowY: scrollRegion ? getComputedStyle(scrollRegion).overflowY : "",
        stickyHeaderBackgroundColor: stickyHeaderStyle?.backgroundColor || "",
        stickyHeaderBackgroundImage: stickyHeaderStyle?.backgroundImage || "",
        sortButtonBackgroundColor: sortButtonStyle?.backgroundColor || "",
        sortButtonBottom: sortButtonBox ? Math.round(sortButtonBox.bottom) : 0,
        sortButtonColor: sortButtonStyle?.color || "",
        sortButtonPosition: stickyHeaderStyle?.position || "",
        sortButtonText: sortButton ? sortButton.textContent.trim() : "",
        sortButtonTop: sortButtonBox ? Math.round(sortButtonBox.top) : 0,
        scrollRegionTop: scrollRegionBox ? Math.round(scrollRegionBox.top) : 0,
        viewportHeight: window.innerHeight,
      };
    });
    expect(fullscreenMetrics.bodyOverflowY).toBe("hidden");
    expect(fullscreenMetrics.bodyScrollAfter).toBe(fullscreenMetrics.bodyScrollBefore);
    expect(fullscreenMetrics.headerPosition).toBe("fixed");
    expect(fullscreenMetrics.headerTop).toBe(0);
    expect(fullscreenMetrics.footerPosition).toBe("fixed");
    expect(fullscreenMetrics.footerBottom).toBeLessThanOrEqual(fullscreenMetrics.viewportHeight);
    expect(fullscreenMetrics.footerOverflowY).toBe("auto");
    expect(fullscreenMetrics.footerScrollable).toBe(true);
    expect(fullscreenMetrics.footerScrollTop).toBeGreaterThan(0);
    expect(fullscreenMetrics.leftOverflowY).toBe("hidden");
    expect(fullscreenMetrics.centerOverflowY).toBe("hidden");
    expect(fullscreenMetrics.rightOverflowY).toBe("hidden");
    expect(fullscreenMetrics.scrollRegionOverflowY).toBe("auto");
    expect(fullscreenMetrics.scrollRegionHeight).toBeGreaterThan(0);
    expect(fullscreenMetrics.scrollRegionVerticalScrollable).toBe(true);
    expect(fullscreenMetrics.scrollRegionScrollTop).toBeGreaterThan(0);
    expect(fullscreenMetrics.horizontalScrollable).toBe(true);
    expect(fullscreenMetrics.horizontalScrollLeft).toBeGreaterThan(0);
    expect(fullscreenMetrics.scrollRegionBottom).toBeLessThanOrEqual(fullscreenMetrics.footerTop);
    expect(fullscreenMetrics.sortButtonPosition).toBe("sticky");
    expect(fullscreenMetrics.stickyHeaderBackgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(fullscreenMetrics.stickyHeaderBackgroundColor).not.toBe("transparent");
    expect(fullscreenMetrics.stickyHeaderBackgroundImage).toBe("none");
    expect(fullscreenMetrics.sortButtonColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(fullscreenMetrics.sortButtonColor).not.toBe(fullscreenMetrics.sortButtonBackgroundColor);
    expect(fullscreenMetrics.sortButtonText).toContain("Tool");
    expect(fullscreenMetrics.sortButtonTop).toBeGreaterThanOrEqual(fullscreenMetrics.scrollRegionTop);
    expect(fullscreenMetrics.sortButtonBottom).toBeLessThanOrEqual(fullscreenMetrics.scrollRegionBottom);
    expect(fullscreenMetrics.sortButtonBottom).toBeLessThan(fullscreenMetrics.footerBottom);
    expect(fullscreenMetrics.firstBodyRowBottom).toBeLessThanOrEqual(fullscreenMetrics.sortButtonTop);

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});
