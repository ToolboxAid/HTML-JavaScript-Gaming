import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const ADMIN_TOOL_MENU_LABELS = [
  "Platform Settings",
  "Tool Votes",
  "Users",
];

const ADMIN_WIREFRAME_PAGES = [
  { heading: "Users", path: "/admin/users.html", slug: "users", statusText: "Read-only Admin view." },
  { heading: "Platform Settings", liveSettings: true, path: "/admin/platform-settings.html", slug: "platform-settings" },
];

test.beforeEach(async ({ page }) => {
  await workspaceV2CoverageReporter.start(page);
  await installPlaywrightStorageIsolation(page, {
    lane: "admin-platform-tools-wireframes",
    surface: "Admin platform wireframe pages",
  });
});

test.afterEach(async ({ page }) => {
  await workspaceV2CoverageReporter.stop(page);
  await workspaceV2CoverageReporter.writeReport();
  await clearPlaywrightStorage(page);
});

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

  await page.route("**/api/session/current", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          authenticated: true,
          displayName: "DavidQ",
          roleSlugs: ["owner", "admin", "creator"],
          userKey: MOCK_DB_KEYS.users.admin,
        },
        ok: true,
      }),
    });
  });
  await page.route("**/api/navigation/admin-menu", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          adminMainItems: [
            { label: "Platform Settings", path: "admin/platform-settings.html", route: "admin-platform-settings" },
            { label: "Tool Votes", path: "admin/tool-votes.html", route: "admin-tool-votes" },
            { label: "Users", path: "admin/users.html", route: "admin-users" },
          ],
          ownerMenuItems: [
            { label: "DB Viewer", path: "admin/db-viewer.html", route: "admin-db-viewer" },
            { label: "Design System", path: "admin/design-system.html", route: "admin-design-system" },
            { label: "Grouping Colors", path: "admin/grouping-colors.html", route: "admin-grouping-colors" },
            { href: "/admin/admin-notes.html", label: "Notes", localNotes: true },
            { label: "Operations", path: "owner/operations.html", route: "owner-operations" },
          ],
        },
        ok: true,
      }),
    });
  });
  await page.route("**/api/platform-settings/banner", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          banner: {
            active: false,
            message: "",
            sourceTable: "platform_settings",
            sourceTableRowKey: "01KVRBANNERACTIVE00000001",
            tone: "info",
          },
          diagnostics: {
            active: false,
            message: "",
            sourceTable: "platform_settings",
            sourceTableRowKey: "01KVRBANNERACTIVE00000001",
          },
          sourceTable: "platform_settings",
        },
        ok: true,
      }),
    });
  });
  await page.route("**/api/admin/platform-settings/banner", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          banner: {
            active: false,
            message: "",
            sourceTable: "platform_settings",
            sourceTableRowKey: "01KVRBANNERACTIVE00000001",
            tone: "info",
          },
          diagnostics: {
            active: false,
            message: "",
            sourceTable: "platform_settings",
            sourceTableRowKey: "01KVRBANNERACTIVE00000001",
          },
          recordsWritten: 0,
          sourceTable: "platform_settings",
        },
        ok: true,
      }),
    });
  });
  await page.route("**/api/product-data/snapshot", async (route) => {
    const timestamp = "2026-06-16T00:00:00.000Z";
    const audit = {
      createdAt: timestamp,
      createdBy: MOCK_DB_KEYS.users.admin,
      updatedAt: timestamp,
      updatedBy: MOCK_DB_KEYS.users.admin,
    };
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          schemas: {
            roles: [{ name: "key" }],
            user_roles: [{ name: "key" }],
            users: [{ name: "key" }],
          },
          tables: {
            roles: [
              { key: MOCK_DB_KEYS.roles.creator, roleSlug: "creator", name: "Creator", isActive: true, ...audit },
              { key: MOCK_DB_KEYS.roles.admin, roleSlug: "admin", name: "Admin", isActive: true, ...audit },
              { key: MOCK_DB_KEYS.roles.owner, roleSlug: "owner", name: "Owner", isActive: true, ...audit },
              { key: MOCK_DB_KEYS.roles.guest, roleSlug: "guest", name: "Guest", isActive: true, ...audit },
            ],
            user_roles: [
              { key: MOCK_DB_KEYS.userRoles.user1User, userKey: MOCK_DB_KEYS.users.user1, roleKey: MOCK_DB_KEYS.roles.creator, ...audit },
              { key: MOCK_DB_KEYS.userRoles.adminUser, userKey: MOCK_DB_KEYS.users.admin, roleKey: MOCK_DB_KEYS.roles.creator, ...audit },
              { key: MOCK_DB_KEYS.userRoles.adminAdmin, userKey: MOCK_DB_KEYS.users.admin, roleKey: MOCK_DB_KEYS.roles.admin, ...audit },
              { key: MOCK_DB_KEYS.userRoles.adminOwner, userKey: MOCK_DB_KEYS.users.admin, roleKey: MOCK_DB_KEYS.roles.owner, ...audit },
            ],
            users: [
              { key: MOCK_DB_KEYS.users.user1, displayName: "User 1", email: "user1@example.invalid", isActive: true, ...audit },
              { key: MOCK_DB_KEYS.users.admin, displayName: "DavidQ", email: "qbytes.dq@gmail.com", isActive: true, ...audit },
            ],
          },
        },
        ok: true,
      }),
    });
  });
  await page.route("**/api/toolbox/votes/snapshot", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          currentUserName: "DavidQ",
          rows: [
            {
              currentUserVote: "",
              down: 0,
              downPercent: 0,
              group: "Platform",
              order: 1,
              path: "admin/platform-settings.html",
              releaseChannel: "wireframe",
              releaseChannelLabel: "Wireframe",
              status: "wireframe",
              toolId: "admin-platform-settings",
              toolKey: "admin-platform-settings",
              toolName: "Platform Settings",
              totalVotes: 0,
              up: 0,
              upPercent: 0,
            },
          ],
        },
        ok: true,
      }),
    });
  });
  await page.route("**/api/toolbox/registry/snapshot", async (route) => {
    const tool = {
      active: true,
      displayName: "Platform Settings",
      folderName: "admin-platform-settings",
      id: "admin-platform-settings",
      imageSources: {
        badge: "/assets/theme-v2/images/image-missing.svg",
        tool: "/assets/theme-v2/images/image-missing.svg",
      },
      name: "Platform Settings",
      path: "admin/platform-settings.html",
      route: "admin/platform-settings.html",
      status: "wireframe",
    };
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          activeTools: [tool],
          readinessByStatus: {
            wireframe: "No",
          },
          tools: [tool],
          toolboxContract: {},
        },
        ok: true,
      }),
    });
  });
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function expectAdminHeaderMenu(page) {
  await expect(page.locator("nav.nav-links > .nav-item > a[data-route='admin']")).toHaveAttribute("href", /admin\/platform-settings\.html$/);
  await expect(page.locator("nav.nav-links > .nav-item > a[data-route='owner']")).toHaveText("Owner \u25BE");
  await expect(page.locator("nav.nav-links > .nav-item > a[data-route='owner']")).toHaveAttribute("href", /owner\/operations\.html$/);
  const ownerSubmenu = page.locator("nav.nav-links > .nav-item[data-owner-menu] > .sub-menu");
  await expect(ownerSubmenu.locator("a")).toHaveText(["DB Viewer", "Design System", "Grouping Colors", "Notes", "Operations"]);
  const adminSubmenu = page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin']) > .sub-menu");
  await expect(adminSubmenu.locator(":scope > a[data-route='admin-platform-settings']")).toHaveText("Platform Settings");
  await expect(adminSubmenu.locator(":scope > a[data-route='admin-tool-votes']")).toHaveText("Tool Votes");
  await expect(adminSubmenu.locator(":scope > a[data-route='admin-users']")).toHaveText("Users");
  await expect(adminSubmenu.locator(":scope > a[data-route='admin-environments'], :scope > a[data-route='admin-game-migration'], :scope > a[data-route='admin-site-setup']")).toHaveCount(0);
  await expect(adminSubmenu.locator("[data-owner-menu], [data-admin-my-stuff-menu], [data-admin-notes-local-menu]")).toHaveCount(0);
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
      await expect(page.locator("[data-admin-tool-menu] a")).toHaveText(adminPage.menuLabels || ADMIN_TOOL_MENU_LABELS);
      await expect(page.locator("[data-admin-tool-menu] a[aria-current='page']")).toHaveText(adminPage.heading);
      await expect(page.locator(".tool-column").first().locator("details.vertical-accordion")).toHaveCount(adminPage.liveSettings ? 1 : 2);
      await expect(page.locator(".tool-column").last().locator("details.vertical-accordion")).toHaveCount(2);
      if (adminPage.liveSettings) {
        await expect(page.locator("[data-platform-settings-status]")).toBeVisible();
        await expect(page.locator("[data-platform-banner-active]")).toBeVisible();
        await expect(page.locator("[data-platform-banner-tone]")).toBeVisible();
        await expect(page.locator("[data-platform-banner-message]")).toBeVisible();
        await expect(page.locator("[data-platform-banner-save]")).toBeEnabled();
        const controlLayout = await page.evaluate(() => {
          const center = document.querySelector(".tool-center-panel");
          const message = center?.querySelector("[data-platform-banner-message]");
          const messageLabel = message?.closest("label");
          const controls = messageLabel?.nextElementSibling;
          const preview = controls?.nextElementSibling;
          return {
            activeInControls: Boolean(controls?.querySelector("[data-platform-banner-active]")),
            previewAfterControls: Boolean(preview?.matches("[data-platform-banner-preview]")),
            saveInControls: Boolean(controls?.querySelector("[data-platform-banner-save]")),
            toneInControls: Boolean(controls?.querySelector("[data-platform-banner-tone]")),
          };
        });
        expect(controlLayout).toEqual({
          activeInControls: true,
          previewAfterControls: true,
          saveInControls: true,
          toneInControls: true,
        });
      } else {
        await expect(page.locator(".tool-column").last().getByText(adminPage.statusText || "Wireframe only.")).toBeVisible();
        await expect(page.locator("main button:disabled, main input:disabled, main select:disabled").first()).toBeVisible();
      }
      await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);

      await expectNoPageFailures(failures);
    } finally {
      await failures.server.close();
    }
  });
}

test("Grouping Colors uses current group color model copy", async ({ page }) => {
  const failures = await startAdminPage(page, "/admin/grouping-colors.html");

  try {
    await expect(page.getByRole("heading", { name: "Tool grouping and color reference.", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Group Color Model", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Restored Group Color Model" })).toHaveCount(0);
    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Platform banner renders active settings under the header and above the footer", async ({ page }) => {
  const server = await startRepoServer();
  try {
    await page.route("**/api/session/current", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            authenticated: false,
            displayName: "Sign In",
            roleSlugs: [],
          },
          ok: true,
        }),
      });
    });
    await page.route("**/api/platform-settings/banner", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            banner: {
              active: true,
              message: "Temporary data notice for creators.",
              sourceTable: "platform_settings",
              sourceTableRowKey: "01KVRBANNERACTIVE00000001",
              tone: "warning",
            },
            diagnostics: {
              active: true,
              message: "Temporary data notice for creators.",
              sourceTable: "platform_settings",
              sourceTableRowKey: "01KVRBANNERACTIVE00000001",
            },
            sourceTable: "platform_settings",
          },
          ok: true,
        }),
      });
    });

    await page.goto(`${server.baseUrl}/account/sign-in.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-platform-banner]")).toHaveCount(2);
    await expect(page.locator("[data-platform-banner-placement='header']")).toContainText("Temporary data notice for creators.");
    await expect(page.locator("[data-platform-banner-placement='header']")).toHaveClass(/platform-banner--warning/);
    await expect(page.locator("[data-platform-banner-placement='footer']")).toContainText("Temporary data notice for creators.");
    await expect(page.locator("[data-platform-banner-placement='footer']")).toHaveClass(/platform-banner--warning/);
    await expect.poll(async () => page.evaluate(() => window.GameFoundryPlatformBannerDiagnostics)).toEqual({
      active: true,
      message: "Temporary data notice for creators.",
      sourceTable: "platform_settings",
      sourceTableRowKey: "01KVRBANNERACTIVE00000001",
    });
    const layout = await page.evaluate(() => {
      const header = document.querySelector("header.site-header");
      const headerBanner = document.querySelector("[data-platform-banner-placement='header']");
      const footerBanner = document.querySelector("[data-platform-banner-placement='footer']");
      const main = document.querySelector("main");
      const footer = document.querySelector("footer.footer");
      const headerBox = header?.getBoundingClientRect();
      const headerBannerBox = headerBanner?.getBoundingClientRect();
      const footerBannerBox = footerBanner?.getBoundingClientRect();
      const mainBox = main?.getBoundingClientRect();
      const footerBox = footer?.getBoundingClientRect();
      return {
        footerBannerAboveFooter: Boolean(footerBanner && footer && footerBanner.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING),
        footerBannerBottom: Math.round(footerBannerBox?.bottom || 0),
        footerBannerWidth: Math.round(footerBannerBox?.width || 0),
        footerTop: Math.round(footerBox?.top || 0),
        headerBannerBeforeMain: Boolean(headerBanner && main && headerBanner.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING),
        headerBannerTop: Math.round(headerBannerBox?.top || 0),
        headerBannerWidth: Math.round(headerBannerBox?.width || 0),
        clientWidth: document.documentElement.clientWidth,
        headerBottom: Math.round(headerBox?.bottom || 0),
        mainTop: Math.round(mainBox?.top || 0),
        viewportWidth: window.innerWidth,
      };
    });
    expect(layout.headerBannerBeforeMain).toBe(true);
    expect(layout.headerBannerTop).toBeGreaterThanOrEqual(layout.headerBottom - 2);
    expect(layout.mainTop).toBeGreaterThanOrEqual(layout.headerBannerTop);
    expect(layout.headerBannerWidth).toBe(layout.clientWidth);
    expect(layout.footerBannerAboveFooter).toBe(true);
    expect(layout.footerTop).toBeGreaterThanOrEqual(layout.footerBannerBottom - 2);
    expect(layout.footerBannerWidth).toBe(layout.clientWidth);
  } finally {
    await server.close();
  }
});

test("Platform banner tones render distinct Theme V2 highlights", async ({ page }) => {
  const server = await startRepoServer();
  const banner = {
    active: true,
    message: "Info tone notice.",
    sourceTable: "platform_settings",
    sourceTableRowKey: "01KVRBANNERACTIVE00000001",
    tone: "info",
  };
  try {
    await page.route("**/api/session/current", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            authenticated: false,
            displayName: "Sign In",
            roleSlugs: [],
          },
          ok: true,
        }),
      });
    });
    await page.route("**/api/platform-settings/banner", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            banner: { ...banner },
            diagnostics: {
              active: banner.active,
              message: banner.message,
              sourceTable: "platform_settings",
              sourceTableRowKey: banner.sourceTableRowKey,
            },
            sourceTable: "platform_settings",
          },
          ok: true,
        }),
      });
    });

    await page.goto(`${server.baseUrl}/account/sign-in.html`, { waitUntil: "networkidle" });
    const toneMetrics = {};
    for (const tone of ["info", "warning", "danger"]) {
      banner.tone = tone;
      banner.message = `${tone} tone notice.`;
      await page.evaluate(() => window.dispatchEvent(new CustomEvent("gamefoundry:platform-settings-changed")));
      await expect(page.locator("[data-platform-banner-placement='header']")).toHaveClass(new RegExp(`platform-banner--${tone}`));
      toneMetrics[tone] = await page.locator("[data-platform-banner-placement='header']").evaluate((element) => {
        const bannerStyle = window.getComputedStyle(element);
        return {
          backgroundColor: bannerStyle.backgroundColor,
          borderBottomColor: bannerStyle.borderBottomColor,
        };
      });
    }
    expect(new Set(Object.values(toneMetrics).map((metric) => metric.backgroundColor)).size).toBe(3);
    expect(new Set(Object.values(toneMetrics).map((metric) => metric.borderBottomColor)).size).toBe(3);
  } finally {
    await server.close();
  }
});

test("Platform Settings Admin controls update banner through the service route", async ({ page }) => {
  const server = await startRepoServer();
  let publicBanner = {
    active: false,
    message: "",
    sourceTable: "platform_settings",
    sourceTableRowKey: "01KVRBANNERACTIVE00000001",
    tone: "info",
  };
  const adminPosts = [];
  try {
    await page.route("**/api/session/current", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            authenticated: true,
            displayName: "Admin",
            roleSlugs: ["admin", "creator"],
            userKey: MOCK_DB_KEYS.users.admin,
          },
          ok: true,
        }),
      });
    });
    await page.route("**/api/navigation/admin-menu", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            adminMainItems: [
              { label: "Platform Settings", path: "admin/platform-settings.html", route: "admin-platform-settings" },
              { label: "Tool Votes", path: "admin/tool-votes.html", route: "admin-tool-votes" },
              { label: "Users", path: "admin/users.html", route: "admin-users" },
            ],
            ownerMenuItems: [],
          },
          ok: true,
        }),
      });
    });
    await page.route("**/api/platform-settings/banner", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            banner: publicBanner,
            diagnostics: {
              active: publicBanner.active,
              message: publicBanner.message,
              sourceTable: "platform_settings",
              sourceTableRowKey: publicBanner.sourceTableRowKey,
            },
            sourceTable: "platform_settings",
          },
          ok: true,
        }),
      });
    });
    await page.route("**/api/admin/platform-settings/banner", async (route) => {
      if (route.request().method() === "POST") {
        const body = route.request().postDataJSON();
        adminPosts.push(body);
        publicBanner = {
          active: body.active === true && Boolean(body.message),
          message: body.message,
          sourceTable: "platform_settings",
          sourceTableRowKey: "01KVRBANNERACTIVE00000001",
          tone: body.tone,
        };
      }
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            banner: publicBanner,
            diagnostics: {
              active: publicBanner.active,
              message: publicBanner.message,
              sourceTable: "platform_settings",
              sourceTableRowKey: publicBanner.sourceTableRowKey,
            },
            recordsWritten: route.request().method() === "POST" ? 3 : 0,
            sourceTable: "platform_settings",
          },
          ok: true,
        }),
      });
    });

    await page.goto(`${server.baseUrl}/admin/platform-settings.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-platform-settings-status]")).toContainText("Platform banner settings loaded.");
    await expect(page.locator("[data-platform-banner-diagnostics]")).toContainText("Active: false.");
    await expect(page.locator("[data-platform-banner-diagnostics]")).toContainText("Source row: 01KVRBANNERACTIVE00000001.");
    const controlLayout = await page.evaluate(() => {
      const center = document.querySelector(".tool-center-panel");
      const message = center?.querySelector("[data-platform-banner-message]");
      const messageLabel = message?.closest("label");
      const controls = messageLabel?.nextElementSibling;
      const preview = controls?.nextElementSibling;
      return {
        activeInControls: Boolean(controls?.querySelector("[data-platform-banner-active]")),
        previewAfterControls: Boolean(preview?.matches("[data-platform-banner-preview]")),
        saveInControls: Boolean(controls?.querySelector("[data-platform-banner-save]")),
        toneInControls: Boolean(controls?.querySelector("[data-platform-banner-tone]")),
      };
    });
    expect(controlLayout).toEqual({
      activeInControls: true,
      previewAfterControls: true,
      saveInControls: true,
      toneInControls: true,
    });
    await page.locator("[data-platform-banner-active]").check();
    await page.locator("[data-platform-banner-tone]").selectOption("danger");
    await page.locator("[data-platform-banner-message]").fill("Outage notice for creators.");
    await expect(page.locator("[data-platform-banner-preview]")).toContainText("Outage notice for creators.");
    await expect(page.locator("[data-platform-banner-preview]")).toHaveClass(/platform-banner--danger/);

    await page.locator("[data-platform-banner-save]").click();
    await expect(page.locator("[data-platform-settings-status]")).toContainText("Platform banner settings saved.");
    expect(adminPosts).toEqual([
      {
        active: true,
        message: "Outage notice for creators.",
        tone: "danger",
      },
    ]);
    await expect(page.locator("[data-platform-banner-diagnostics]")).toContainText("Active: true.");
    await expect(page.locator("[data-platform-banner-diagnostics]")).toContainText("Message: Outage notice for creators.");
    await expect(page.locator("[data-platform-banner]")).toHaveCount(2);
    await expect(page.locator("[data-platform-banner-placement='header']")).toContainText("Outage notice for creators.");
    await expect(page.locator("[data-platform-banner-placement='footer']")).toContainText("Outage notice for creators.");

    await page.locator("[data-platform-banner-active]").uncheck();
    await page.locator("[data-platform-banner-save]").click();
    await expect(page.locator("[data-platform-settings-status]")).toContainText("Platform banner settings saved.");
    expect(adminPosts).toEqual([
      {
        active: true,
        message: "Outage notice for creators.",
        tone: "danger",
      },
      {
        active: false,
        message: "Outage notice for creators.",
        tone: "danger",
      },
    ]);
    await expect(page.locator("[data-platform-banner-preview]")).toContainText("No active banner.");
    await expect(page.locator("[data-platform-banner-diagnostics]")).toContainText("Active: false.");
    await expect(page.locator("[data-platform-banner]")).toHaveCount(0);
  } finally {
    await server.close();
  }
});

test("Owner menu is role-gated separately from Admin menu", async ({ page }) => {
  const server = await startRepoServer();
  let authenticated = true;
  const sessionRoles = [];
  try {
    await page.route("**/api/session/current", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            authenticated,
            displayName: "DavidQ",
            roleSlugs: sessionRoles.slice(),
            userKey: MOCK_DB_KEYS.users.admin,
          },
          ok: true,
        }),
      });
    });
    await page.route("**/api/navigation/admin-menu", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            adminMainItems: [
              { label: "Platform Settings", path: "admin/platform-settings.html", route: "admin-platform-settings" },
              { label: "Tool Votes", path: "admin/tool-votes.html", route: "admin-tool-votes" },
              { label: "Users", path: "admin/users.html", route: "admin-users" },
            ],
            ownerMenuItems: [
              { label: "DB Viewer", path: "admin/db-viewer.html", route: "admin-db-viewer" },
              { label: "Design System", path: "admin/design-system.html", route: "admin-design-system" },
              { label: "Grouping Colors", path: "admin/grouping-colors.html", route: "admin-grouping-colors" },
              { href: "/admin/admin-notes.html", label: "Notes", localNotes: true },
              { label: "Operations", path: "owner/operations.html", route: "owner-operations" },
            ],
          },
          ok: true,
        }),
      });
    });
    await page.route("**/api/platform-settings/banner", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ data: { banner: { active: false, message: "", tone: "info" } }, ok: true }),
      });
    });

    authenticated = false;
    sessionRoles.splice(0, sessionRoles.length, "owner", "admin", "creator");
    await page.goto(`${server.baseUrl}/account/sign-in.html`, { waitUntil: "networkidle" });
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toHaveCount(0);
    await expect(page.locator("nav.nav-links > .nav-item[data-owner-menu]")).toHaveCount(0);

    authenticated = true;
    sessionRoles.splice(0, sessionRoles.length, "admin", "creator");
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("gamefoundry:data-changed")));
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item[data-owner-menu]")).toHaveCount(0);

    sessionRoles.splice(0, sessionRoles.length, "owner", "creator");
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("gamefoundry:data-changed")));
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toHaveCount(0);
    await expect(page.locator("nav.nav-links > .nav-item[data-owner-menu]")).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item[data-owner-menu] > .sub-menu a")).toHaveText([
      "DB Viewer",
      "Design System",
      "Grouping Colors",
      "Notes",
      "Operations",
    ]);

    sessionRoles.splice(0, sessionRoles.length, "owner", "admin", "creator");
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("gamefoundry:data-changed")));
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item[data-owner-menu]")).toBeVisible();
  } finally {
    await server.close();
  }
});

test("Owner Operations exposes owner-only connection validation and manual operation actions", async ({ page }) => {
  const server = await startRepoServer();
  const ownerActionPosts = [];
  try {
    await page.route("**/api/session/current", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            authenticated: true,
            displayName: "DavidQ",
            roleSlugs: ["owner", "admin", "creator"],
            userKey: MOCK_DB_KEYS.users.admin,
          },
          ok: true,
        }),
      });
    });
    await page.route("**/api/navigation/admin-menu", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            adminMainItems: [
              { label: "Platform Settings", path: "admin/platform-settings.html", route: "admin-platform-settings" },
              { label: "Tool Votes", path: "admin/tool-votes.html", route: "admin-tool-votes" },
              { label: "Users", path: "admin/users.html", route: "admin-users" },
            ],
            ownerMenuItems: [
              { label: "DB Viewer", path: "admin/db-viewer.html", route: "admin-db-viewer" },
              { label: "Design System", path: "admin/design-system.html", route: "admin-design-system" },
              { label: "Grouping Colors", path: "admin/grouping-colors.html", route: "admin-grouping-colors" },
              { href: "/admin/admin-notes.html", label: "Notes", localNotes: true },
              { label: "Operations", path: "owner/operations.html", route: "owner-operations" },
            ],
          },
          ok: true,
        }),
      });
    });
    await page.route("**/api/platform-settings/banner", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ data: { banner: { active: false, message: "", tone: "info" } }, ok: true }),
      });
    });
    await page.route("**/api/toolbox/registry/snapshot", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ data: { activeTools: [], readinessByStatus: {}, tools: [], toolboxContract: {} }, ok: true }),
      });
    });
    await page.route("**/api/owner/operations/status", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            connectionSummary: {
              account: { configured: true, status: "ready" },
              environmentSwitching: "manual-env-change-and-server-restart",
              productData: { configured: true, status: "adapter-ready" },
              secretsExposed: false,
            },
            message: "Owner Operations loaded.",
            status: "PASS",
          },
          ok: true,
        }),
      });
    });
    await page.route("**/api/owner/operations/validate", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            connectionSummary: {
              account: { configured: true, status: "ready" },
              environmentSwitching: "manual-env-change-and-server-restart",
              productData: { configured: true, status: "adapter-ready" },
              secretsExposed: false,
            },
            executed: true,
            message: "Current configured connections validated.",
            status: "PASS",
          },
          ok: true,
        }),
      });
    });
    await page.route("**/api/owner/operations/action", async (route) => {
      const body = route.request().postDataJSON();
      ownerActionPosts.push(body);
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            actionId: body.actionId,
            executed: false,
            manualOnly: true,
            message: "Reseed DEV is staged in Owner Operations but must be executed manually through reviewed server-side scripts, configuration changes, and server restart.",
            status: "SKIP",
          },
          ok: true,
        }),
      });
    });

    await page.goto(`${server.baseUrl}/owner/operations.html`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: "Operations" })).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item[data-owner-menu] > .sub-menu a")).toHaveText([
      "DB Viewer",
      "Design System",
      "Grouping Colors",
      "Notes",
      "Operations",
    ]);
    await expect(page.locator("[data-owner-connection-summary]")).toContainText("Account");
    await expect(page.locator("[data-owner-connection-summary]")).toContainText("not exposed");
    await expect(page.locator("[data-owner-operations-status]")).toContainText("PASS: Owner Operations loaded.");

    await page.locator("[data-owner-operation-validate]").click();
    await expect(page.locator("[data-owner-operations-status]")).toContainText("PASS: Current configured connections validated.");
    await expect(page.locator("[data-owner-operation-result-rows] tr").first()).toContainText("validate-current-connection");
    await expect(page.locator("[data-owner-operation-result-rows] tr").first()).toContainText("yes");

    await page.locator("[data-owner-operation-action='reseed-dev']").click();
    await expect(page.locator("[data-owner-operations-status]")).toContainText("SKIP: Reseed DEV is staged in Owner Operations");
    await expect(page.locator("[data-owner-operation-result-rows] tr").first()).toContainText("reseed-dev");
    await expect(page.locator("[data-owner-operation-result-rows] tr").first()).toContainText("no");
    expect(ownerActionPosts).toEqual([{ actionId: "reseed-dev" }]);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
  } finally {
    await server.close();
  }
});

test("Tool Votes side menu includes Admin platform wireframes", async ({ page }) => {
  const failures = await startAdminPage(page, "/admin/tool-votes.html");

  try {
    await expectAdminHeaderMenu(page);
    await expect(page.locator(".tool-workspace.tool-workspace--wide")).toBeVisible();
    await expect(page.locator(".tool-workspace > .tool-column")).toHaveCount(2);
    await expect(page.locator(".tool-center-panel")).toBeVisible();
    await expect(page.locator("[data-admin-tool-menu] a")).toHaveText(ADMIN_TOOL_MENU_LABELS);
    await expect(page.locator("[data-admin-tool-menu] a[aria-current='page']")).toHaveText("Tool Votes");
    await expect(page.locator("[data-admin-tool-menu] a[href='/admin/environments.html'], [data-admin-tool-menu] a[href='/admin/game-migration.html']")).toHaveCount(0);
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
