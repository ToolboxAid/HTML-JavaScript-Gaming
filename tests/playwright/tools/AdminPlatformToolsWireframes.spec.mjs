import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const ADMIN_TOOL_MENU_LABELS = [
  "Infrastructure",
  "Platform Settings",
  "System Health",
  "Tool Votes",
  "Users",
];

const ADMIN_WIREFRAME_PAGES = [
  {
    heading: "Infrastructure",
    infrastructure: true,
    path: "/admin/infrastructure.html",
    slug: "infrastructure",
    statusText: "Infrastructure status remains a read-only Admin reference.",
  },
  {
    heading: "System Health",
    path: "/admin/system-health.html",
    slug: "system-health",
    systemHealth: true,
  },
  { heading: "Users", path: "/admin/users.html", slug: "users", statusText: "Read-only Admin view." },
  { heading: "Platform Settings", liveSettings: true, path: "/admin/platform-settings.html", slug: "platform-settings" },
];

function storagePathStatusFor(configuredPath) {
  const lanes = [
    { lane: "DEV", path: "/dev/projects/" },
    { lane: "IST", path: "/ist/projects/" },
    { lane: "UAT", path: "/uat/projects/" },
    { lane: "PRD", path: "/prd/projects/" },
  ];
  const matchedLane = lanes.find((lane) => lane.path === configuredPath);
  const invalidPath = !matchedLane;
  const rows = lanes.map((lane) => {
    if (invalidPath) {
      return {
        ...lane,
        active: false,
        status: "ERROR",
        value: "ERROR",
      };
    }
    const active = configuredPath === lane.path;
    return {
      ...lane,
      active,
      status: active ? "PASS" : "SKIP",
      value: active ? "yes" : "no",
    };
  });
  return {
    configured: !invalidPath,
    invalidPath,
    missing: !configuredPath,
    rows,
    secretsExposed: false,
    status: invalidPath ? "ERROR" : "PASS",
    variableName: "GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX",
  };
}

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

async function startAdminPage(page, pathName, options = {}) {
  const server = await startRepoServer();
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];
  const storagePathStatus = options.storagePathStatus || storagePathStatusFor("/dev/projects/");
  const adminStorageConnectivityPosts = [];
  const systemHealthStatus = options.systemHealthStatus || {
    details: [
      { area: "Account/session readiness", field: "Session", status: "PASS", value: "authenticated" },
      { area: "Product Data / Local DB", field: "Database name", status: "PASS", value: "gamefoundry_dev" },
      { area: "Project Asset Storage / R2", field: "Projects prefix", status: "PASS", value: "/dev/projects/" },
      { area: "Environment configuration", field: "GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX", status: "PASS", value: "valid lane match" },
      { area: "Secrets status", field: "Storage secret key", status: "PASS", value: "configured; value hidden" },
      { area: "Migration status", field: "Migration counts", status: "PASS", value: "DDL=15; DML=15" },
      { area: "Project package readiness", field: ".gfsp decision", status: "PASS", value: "docs_build/codex/decisions/project-packages.md" },
      { area: "Promotion/package safety", field: "Import overwrite", status: "PASS", value: "fail-visible-until-explicit-confirmation" },
    ],
    limits: [
      { variableName: "GAMEFOUNDRY_STORAGE_LIMIT_BYTES", limit: "not configured", usage: "NOT AVAILABLE", pressure: "NOT AVAILABLE", nextStep: "Set GAMEFOUNDRY_STORAGE_LIMIT_BYTES in the selected .env.<target> copy-source, copy it to .env, then add safe Project Asset Storage / R2 usage reporting through the Local API." },
      { variableName: "GAMEFOUNDRY_STORAGE_CLASS_A_LIMIT_MONTHLY", limit: "not configured", usage: "NOT AVAILABLE", pressure: "NOT AVAILABLE", nextStep: "Set GAMEFOUNDRY_STORAGE_CLASS_A_LIMIT_MONTHLY in the selected .env.<target> copy-source, copy it to .env, then add safe Project Asset Storage / R2 usage reporting through the Local API." },
      { variableName: "GAMEFOUNDRY_STORAGE_CLASS_B_LIMIT_MONTHLY", limit: "not configured", usage: "NOT AVAILABLE", pressure: "NOT AVAILABLE", nextStep: "Set GAMEFOUNDRY_STORAGE_CLASS_B_LIMIT_MONTHLY in the selected .env.<target> copy-source, copy it to .env, then add safe Project Asset Storage / R2 usage reporting through the Local API." },
      { variableName: "GAMEFOUNDRY_DB_SIZE_LIMIT_BYTES", limit: "not configured", usage: "NOT AVAILABLE", pressure: "NOT AVAILABLE", nextStep: "Set GAMEFOUNDRY_DB_SIZE_LIMIT_BYTES in the selected .env.<target> copy-source, copy it to .env, then add safe Product Data / Local DB usage reporting through the Local API." },
      { variableName: "GAMEFOUNDRY_DB_CONNECTION_LIMIT", limit: "not configured", usage: "NOT AVAILABLE", pressure: "NOT AVAILABLE", nextStep: "Set GAMEFOUNDRY_DB_CONNECTION_LIMIT in the selected .env.<target> copy-source, copy it to .env, then add safe Product Data / Local DB usage reporting through the Local API." },
    ],
    message: "Admin System Health loaded safe status only.",
    overview: [
      { area: "Account/session readiness", status: "PASS", summary: "Current session is authenticated with Admin access." },
      { area: "Product Data / Local DB", status: "PASS", summary: "Local DB status is configured for gamefoundry_dev." },
      { area: "Project Asset Storage / R2", status: "PASS", summary: "Project asset storage is configured. Credential values are hidden." },
      { area: "Environment configuration", status: "PASS", summary: "GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX matches exactly one project storage lane." },
      { area: "Secrets status", status: "PASS", summary: "Storage credentials are configured; secret values are hidden." },
      { area: "Environment limits", status: "WARN", summary: "Limits are read from current .env because values may differ by DEV/IST/UAT/PRD; live usage is NOT AVAILABLE until provider usage metrics are exposed safely." },
      { area: "Migration status", status: "PASS", summary: "DDL=15; DML=15; last=support-tickets.sql." },
      { area: "Project package readiness", status: "PASS", summary: "Project package decision note is ready for .gfsp export/import/validate planning." },
      { area: "Promotion/package safety", status: "PASS", summary: "Export and Validate are read-only; Import overwrite is blocked until explicit confirmation exists." },
    ],
    secretEditingAllowed: false,
    secretsExposed: false,
    status: "PASS",
  };

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
            { label: "Infrastructure", path: "admin/infrastructure.html", route: "admin-infrastructure" },
            { label: "Platform Settings", path: "admin/platform-settings.html", route: "admin-platform-settings" },
            { label: "System Health", path: "admin/system-health.html", route: "admin-system-health" },
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
  await page.route("**/api/admin/infrastructure/storage-path-status", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        data: storagePathStatus,
        ok: true,
      }),
    });
  });
  await page.route("**/api/admin/system-health/status", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        data: systemHealthStatus,
        ok: true,
      }),
    });
  });
  await page.route("**/api/admin/infrastructure/storage-connectivity-action", async (route) => {
    const body = route.request().postDataJSON();
    adminStorageConnectivityPosts.push(body);
    const actionLabels = {
      "storage-delete-test-object": "Delete test object",
      "storage-list": "List",
      "storage-read-test-object": "Read test object",
      "storage-write-test-object": "Write test object",
    };
    const actionLabel = actionLabels[body.actionId] || body.actionId;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          actionId: body.actionId,
          executed: true,
          message: `${actionLabel} completed through Local API under /dev/projects/. Test object /dev/projects/connectivity/storage-connectivity-test.txt.`,
          projectsPrefix: "/dev/projects/",
          secretsExposed: false,
          status: "PASS",
          testObjectKey: "/dev/projects/connectivity/storage-connectivity-test.txt",
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
  return { adminStorageConnectivityPosts, consoleErrors, failedRequests, pageErrors, server };
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function expectStoragePathStatusRows(page, expectedValues) {
  const storageRows = page.locator("[data-admin-storage-path-status-rows] tr");
  await expect(storageRows).toHaveCount(4);
  const lanes = ["DEV", "IST", "UAT", "PRD"];
  const paths = ["/dev/projects/", "/ist/projects/", "/uat/projects/", "/prd/projects/"];
  for (let index = 0; index < lanes.length; index += 1) {
    await expect(storageRows.nth(index).locator("td")).toHaveText([
      lanes[index],
      paths[index],
      expectedValues[index],
    ]);
  }
  await expect(page.locator("[data-admin-storage-path-status-rows]")).not.toContainText("GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX");
}

async function expectAdminHeaderMenu(page) {
  await expect(page.locator("nav.nav-links > .nav-item > a[data-route='admin']")).toHaveAttribute("href", /admin\/platform-settings\.html$/);
  await expect(page.locator("nav.nav-links > .nav-item > a[data-route='owner']")).toHaveText("Owner \u25BE");
  await expect(page.locator("nav.nav-links > .nav-item > a[data-route='owner']")).toHaveAttribute("href", /owner\/operations\.html$/);
  const ownerSubmenu = page.locator("nav.nav-links > .nav-item[data-owner-menu] > .sub-menu");
  await expect(ownerSubmenu.locator("a")).toHaveText(["DB Viewer", "Design System", "Grouping Colors", "Notes", "Operations"]);
  const adminSubmenu = page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin']) > .sub-menu");
  await expect(adminSubmenu.locator(":scope > a[data-route='admin-infrastructure']")).toHaveText("Infrastructure");
  await expect(adminSubmenu.locator(":scope > a[data-route='admin-platform-settings']")).toHaveText("Platform Settings");
  await expect(adminSubmenu.locator(":scope > a[data-route='admin-system-health']")).toHaveText("System Health");
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
      await expect(page.locator(".tool-column").last().locator("details.vertical-accordion")).toHaveCount(adminPage.infrastructure || adminPage.systemHealth ? 3 : 2);
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
      } else if (adminPage.infrastructure) {
        await expect(page.locator("img[src*='GFS-Infrastructure%20v1-3.png'], img[src*='GFS-Infrastructure v1-3.png']")).toHaveCount(2);
        await expect(page.locator("body")).not.toContainText("GFS-Infrastructure v1-2.png");
        await expect(page.locator("body")).toContainText("/dev/projects/");
        await expect(page.locator("body")).toContainText("/ist/projects/");
        await expect(page.locator("body")).toContainText("/uat/projects/");
        await expect(page.locator("body")).toContainText("/prd/projects/");
        await expect(page.locator("body")).toContainText("GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX");
        await expectStoragePathStatusRows(page, ["yes", "no", "no", "no"]);
        const infrastructureImage = page.locator("[data-image-zoom-target='admin-infrastructure-image-zoom']");
        await expect(infrastructureImage).toBeVisible();
        const imageLayout = await infrastructureImage.evaluate((control) => {
          const image = control.querySelector("img");
          return {
            imageWidth: image?.getBoundingClientRect().width || 0,
            triggerWidth: control.getBoundingClientRect().width,
          };
        });
        expect(Math.round(imageLayout.triggerWidth - imageLayout.imageWidth)).toBeLessThanOrEqual(4);
        await infrastructureImage.click();
        await expect(page.locator("#admin-infrastructure-image-zoom")).toBeVisible();
        await expect(page.locator("#admin-infrastructure-image-zoom img[src*='GFS-Infrastructure%20v1-3.png'], #admin-infrastructure-image-zoom img[src*='GFS-Infrastructure v1-3.png']")).toHaveCount(1);
        await page.locator("#admin-infrastructure-image-zoom").getByRole("button", { name: "Close" }).click();
        await expect(page.locator("#admin-infrastructure-image-zoom")).not.toBeVisible();
        await expect(page.getByRole("link", { name: "Database Status" })).toHaveAttribute("href", /owner\/operations\.html$/);
        await expect(page.getByRole("link", { name: "Storage Status" })).toHaveAttribute("href", /owner\/operations\.html$/);
        await expect(page.getByRole("link", { name: "Owner Operations" })).toHaveAttribute("href", /owner\/operations\.html$/);
        await expect(page.getByRole("link", { name: "Promotion Foundation" })).toHaveAttribute("href", /owner\/operations\.html$/);
        await expect(page.locator("[data-admin-storage-connectivity-action='storage-list']")).toHaveText("List");
        await expect(page.locator("[data-admin-storage-connectivity-action='storage-write-test-object']")).toHaveText("Write Test Object");
        await expect(page.locator("[data-admin-storage-connectivity-action='storage-read-test-object']")).toHaveText("Read Test Object");
        await expect(page.locator("[data-admin-storage-connectivity-action='storage-delete-test-object']")).toHaveText("Delete Test Object");
        await expect(page.locator("[data-admin-storage-connectivity-status]")).toContainText("Storage connectivity not run.");
      } else if (adminPage.systemHealth) {
        await expect(page.locator("[data-admin-system-health-status]")).toContainText("PASS: Admin System Health loaded safe status only.");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Account/session readiness");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Product Data / Local DB");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Project Asset Storage / R2");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Environment configuration");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Secrets status");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Environment limits");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Migration status");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Project package readiness");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Promotion/package safety");
        await expect(page.locator("[data-admin-system-health-detail-rows]")).toContainText("GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX");
        await expect(page.locator("[data-admin-system-health-detail-rows]")).toContainText("configured; value hidden");
        await expect(page.locator("[data-admin-system-health-detail-rows]")).not.toContainText("asset-test-secret-key");
        await expect(page.locator("[data-admin-system-health-detail-rows]")).not.toContainText("asset-test-access-key");
        await expect(page.locator("[data-admin-system-health-limit-rows]")).toContainText("GAMEFOUNDRY_STORAGE_LIMIT_BYTES");
        await expect(page.locator("[data-admin-system-health-limit-rows]")).toContainText("GAMEFOUNDRY_STORAGE_CLASS_A_LIMIT_MONTHLY");
        await expect(page.locator("[data-admin-system-health-limit-rows]")).toContainText("GAMEFOUNDRY_STORAGE_CLASS_B_LIMIT_MONTHLY");
        await expect(page.locator("[data-admin-system-health-limit-rows]")).toContainText("GAMEFOUNDRY_DB_SIZE_LIMIT_BYTES");
        await expect(page.locator("[data-admin-system-health-limit-rows]")).toContainText("GAMEFOUNDRY_DB_CONNECTION_LIMIT");
        await expect(page.locator("[data-admin-system-health-limit-rows]")).toContainText("NOT AVAILABLE");
        await expect(page.locator("[data-admin-system-health-limit-rows]")).toContainText("Local API");
        await expect(page.locator("caption").filter({ hasText: "values may differ by DEV/IST/UAT/PRD" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Infrastructure Reference" })).toHaveAttribute("href", /admin\/infrastructure\.html$/);
        await expect(page.getByRole("link", { name: "Owner Operations Actions" })).toHaveAttribute("href", /owner\/operations\.html$/);
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

test("Infrastructure storage path status reports missing env path as ERROR", async ({ page }) => {
  const failures = await startAdminPage(page, "/admin/infrastructure.html", {
    storagePathStatus: storagePathStatusFor(""),
  });

  try {
    await expectStoragePathStatusRows(page, ["ERROR", "ERROR", "ERROR", "ERROR"]);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Infrastructure storage path status reports invalid env path as ERROR", async ({ page }) => {
  const failures = await startAdminPage(page, "/admin/infrastructure.html", {
    storagePathStatus: storagePathStatusFor("/qa/projects/"),
  });

  try {
    await expectStoragePathStatusRows(page, ["ERROR", "ERROR", "ERROR", "ERROR"]);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Infrastructure storage path status reports DEV match only", async ({ page }) => {
  const failures = await startAdminPage(page, "/admin/infrastructure.html", {
    storagePathStatus: storagePathStatusFor("/dev/projects/"),
  });

  try {
    await expectStoragePathStatusRows(page, ["yes", "no", "no", "no"]);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Infrastructure storage path status reports IST match only", async ({ page }) => {
  const failures = await startAdminPage(page, "/admin/infrastructure.html", {
    storagePathStatus: storagePathStatusFor("/ist/projects/"),
  });

  try {
    await expectStoragePathStatusRows(page, ["no", "yes", "no", "no"]);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Infrastructure storage connectivity actions call Local API and hide secrets", async ({ page }) => {
  const failures = await startAdminPage(page, "/admin/infrastructure.html");

  try {
    await page.locator("[data-admin-storage-connectivity-action='storage-list']").click();
    await expect(page.locator("[data-admin-storage-connectivity-status]")).toContainText("PASS: List completed through Local API under /dev/projects/.");
    await expect(page.locator("[data-admin-storage-connectivity-result-rows] tr").first()).toContainText("storage-list");
    await expect(page.locator("[data-admin-storage-connectivity-result-rows] tr").first()).toContainText("yes");

    await page.locator("[data-admin-storage-connectivity-action='storage-write-test-object']").click();
    await expect(page.locator("[data-admin-storage-connectivity-status]")).toContainText("PASS: Write test object completed through Local API under /dev/projects/.");

    await page.locator("[data-admin-storage-connectivity-action='storage-read-test-object']").click();
    await expect(page.locator("[data-admin-storage-connectivity-status]")).toContainText("PASS: Read test object completed through Local API under /dev/projects/.");

    await page.locator("[data-admin-storage-connectivity-action='storage-delete-test-object']").click();
    await expect(page.locator("[data-admin-storage-connectivity-status]")).toContainText("PASS: Delete test object completed through Local API under /dev/projects/.");
    await expect(page.locator("[data-admin-storage-connectivity-result-rows] tr").first()).toContainText("storage-delete-test-object");
    await expect(page.locator("[data-admin-storage-connectivity-result-rows] tr").first()).toContainText("/dev/projects/connectivity/storage-connectivity-test.txt");
    await expect(page.locator("[data-admin-storage-connectivity-result-rows]")).not.toContainText("asset-test-secret-key");
    await expect(page.locator("[data-admin-storage-connectivity-result-rows]")).not.toContainText("asset-test-access-key");
    expect(failures.adminStorageConnectivityPosts).toEqual([
      { actionId: "storage-list" },
      { actionId: "storage-write-test-object" },
      { actionId: "storage-read-test-object" },
      { actionId: "storage-delete-test-object" },
    ]);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

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
              { label: "System Health", path: "admin/system-health.html", route: "admin-system-health" },
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
              { label: "System Health", path: "admin/system-health.html", route: "admin-system-health" },
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
  const promotionFoundation = {
    browserExecutionAllowed: false,
    destructiveOperationsAllowed: false,
    exportImportRuntime: "reviewed server-side tooling only",
    importOverwriteAllowed: false,
    importOverwritePolicy: "fail-visible-until-explicit-confirmation",
    message: "Project promotion foundation is planning-only for DEV, IST, UAT, and PROD.",
    ownerOnly: true,
    overwriteConfirmationImplemented: false,
    promotionScope: "project metadata, asset references, and project asset storage objects",
    safetyMessage: "Export and Validate are read-only; Import overwrite is blocked until explicit confirmation exists.",
    secretEditingAllowed: false,
    status: "PASS",
    steps: [
      {
        id: "dev-export-plan",
        stage: "DEV",
        operation: "Export",
        safetyDiagnostic: "Read-only export planning only; no project records, asset references, or storage objects are changed.",
        safetyStatus: "PASS",
        status: "PLAN",
        message: "Plan a read-only DEV export through Local API from Local DB/SQLite metadata, asset references, and configured project asset storage object keys.",
      },
      {
        id: "ist-import-plan",
        stage: "IST",
        operation: "Import",
        safetyDiagnostic: "Overwrite confirmation is not implemented; importing over an existing IST project must fail visibly before any write.",
        safetyStatus: "FAIL",
        status: "PLAN",
        message: "Plan DEV to IST promotion through reviewed server-side tooling; no browser import execution.",
      },
      {
        id: "ist-validate-plan",
        stage: "IST",
        operation: "Validate",
        safetyDiagnostic: "Validation planning is read-only and reports metadata/storage reference mismatches without modifying IST.",
        safetyStatus: "PASS",
        status: "PLAN",
        message: "Plan validation of IST project metadata, asset references, and project asset storage objects before UAT promotion.",
      },
      {
        id: "uat-import-plan",
        stage: "UAT",
        operation: "Import",
        safetyDiagnostic: "Overwrite confirmation is not implemented; importing over an existing UAT project must fail visibly before any write.",
        safetyStatus: "FAIL",
        status: "PLAN",
        message: "Plan IST to UAT promotion through reviewed server-side tooling; no browser import execution.",
      },
      {
        id: "uat-validate-plan",
        stage: "UAT",
        operation: "Validate",
        safetyDiagnostic: "Validation planning is read-only and reports metadata/storage reference mismatches without modifying UAT.",
        safetyStatus: "PASS",
        status: "PLAN",
        message: "Plan validation of UAT project metadata, asset references, and project asset storage objects before any PROD promotion.",
      },
      {
        id: "prod-import-plan",
        stage: "PROD",
        operation: "Import",
        safetyDiagnostic: "Overwrite confirmation is not implemented; importing over an existing PROD project must fail visibly before any write.",
        safetyStatus: "FAIL",
        status: "PLAN",
        message: "Plan a PROD import of project metadata, asset references, and project asset storage objects only after UAT validation evidence is reviewed.",
      },
      {
        id: "prod-validate-plan",
        stage: "PROD",
        operation: "Validate",
        safetyDiagnostic: "Validation planning is read-only and reports PROD readiness without modifying project data.",
        safetyStatus: "PASS",
        status: "PLAN",
        message: "Plan runtime-safe PROD validation without destructive browser operations.",
      },
    ],
  };
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
              { label: "System Health", path: "admin/system-health.html", route: "admin-system-health" },
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
            databaseStatus: {
              configured: true,
              databaseName: "gamefoundry_dev",
              databaseNameStatus: "PASS",
              host: "192.168.2.5",
              hostStatus: "PASS",
              lastMigration: {
                appliedAt: "2026-06-17 01:07:30.540517+00",
                name: "support-tickets.sql",
                type: "DML",
              },
              lastMigrationStatus: "PASS",
              migrationCounts: {
                DDL: 15,
                DML: 15,
              },
              migrationStatus: "PASS",
              port: 55431,
              portStatus: "PASS",
              sslMode: "disable",
              sslModeStatus: "PASS",
              status: "PASS",
            },
            promotionFoundation,
            storageStatus: {
              accessKeyConfigured: true,
              accessKeyStatus: "PASS",
              bucket: "gamefoundry-dev-assets",
              bucketStatus: "PASS",
              configured: true,
              endpoint: "https://storage.example.invalid",
              endpointStatus: "PASS",
              projectsPrefix: "/dev/projects/",
              projectsPrefixStatus: "PASS",
              secretKeyConfigured: true,
              secretKeyStatus: "PASS",
              status: "PASS",
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
            databaseStatus: {
              configured: true,
              databaseName: "gamefoundry_dev",
              databaseNameStatus: "PASS",
              host: "192.168.2.5",
              hostStatus: "PASS",
              lastMigration: {
                appliedAt: "2026-06-17 01:07:30.540517+00",
                name: "support-tickets.sql",
                type: "DML",
              },
              lastMigrationStatus: "PASS",
              migrationCounts: {
                DDL: 15,
                DML: 15,
              },
              migrationStatus: "PASS",
              port: 55431,
              portStatus: "PASS",
              sslMode: "disable",
              sslModeStatus: "PASS",
              status: "PASS",
            },
            storageStatus: {
              accessKeyConfigured: true,
              accessKeyStatus: "PASS",
              bucket: "gamefoundry-dev-assets",
              bucketStatus: "PASS",
              configured: true,
              endpoint: "https://storage.example.invalid",
              endpointStatus: "PASS",
              projectsPrefix: "/dev/projects/",
              projectsPrefixStatus: "PASS",
              secretKeyConfigured: true,
              secretKeyStatus: "PASS",
              status: "PASS",
            },
            promotionFoundation,
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
      const actionLabels = {
        "promote-dev-to-ist": "Promote DEV to IST",
        "promote-ist-to-uat": "Promote IST to UAT",
        "reseed-dev": "Reseed DEV",
        "storage-delete-test-object": "Delete test object",
        "storage-list": "List",
        "storage-read-test-object": "Read test object",
        "storage-write-test-object": "Write test object",
      };
      const actionLabel = actionLabels[body.actionId] || body.actionId;
      if (String(body.actionId || "").startsWith("storage-")) {
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              actionId: body.actionId,
              executed: true,
              message: `${actionLabel} completed through configured storage under /dev/projects/. Test object /dev/projects/connectivity/storage-connectivity-test.txt.`,
              projectsPrefix: "/dev/projects/",
              secretsExposed: false,
              status: "PASS",
              testObjectKey: "/dev/projects/connectivity/storage-connectivity-test.txt",
            },
            ok: true,
          }),
        });
        return;
      }
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            actionId: body.actionId,
            executed: false,
            manualOnly: true,
            message: `${actionLabel} is staged in Owner Operations but must be executed manually through reviewed server-side scripts, configuration changes, and server restart.`,
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
    await expect(page.locator("[data-owner-connection-summary]")).toContainText("Project Asset Storage");
    await expect(page.locator("[data-owner-connection-summary]")).toContainText("not exposed");
    await expect(page.locator("[data-owner-operation-action='promote-dev-to-uat']")).toHaveCount(0);
    await expect(page.locator("[data-owner-operation-action='promote-dev-to-ist']")).toHaveText("Promote DEV to IST");
    await expect(page.locator("[data-owner-operation-action='promote-ist-to-uat']")).toHaveText("Promote IST to UAT");
    await expect(page.locator("[data-owner-operation-action='promote-uat-to-prod']")).toHaveText("Promote UAT to PROD");
    await expect(page.locator("[data-owner-operation-action='storage-list']")).toHaveText("List");
    await expect(page.locator("[data-owner-operation-action='storage-write-test-object']")).toHaveText("Write Test Object");
    await expect(page.locator("[data-owner-operation-action='storage-read-test-object']")).toHaveText("Read Test Object");
    await expect(page.locator("[data-owner-operation-action='storage-delete-test-object']")).toHaveText("Delete Test Object");
    await expect(page.locator("[data-owner-operations]")).toContainText("project metadata, asset references, and project asset storage objects");
    await expect(page.locator("[data-owner-database-status-rows]")).toContainText("Connection Configured");
    await expect(page.locator("[data-owner-database-status-rows]")).toContainText("Database Host");
    await expect(page.locator("[data-owner-database-status-rows]")).toContainText("192.168.2.5");
    await expect(page.locator("[data-owner-database-status-rows]")).toContainText("Database Port");
    await expect(page.locator("[data-owner-database-status-rows]")).toContainText("55431");
    await expect(page.locator("[data-owner-database-status-rows]")).toContainText("Database Name");
    await expect(page.locator("[data-owner-database-status-rows]")).toContainText("gamefoundry_dev");
    await expect(page.locator("[data-owner-database-status-rows]")).toContainText("SSL Mode");
    await expect(page.locator("[data-owner-database-status-rows]")).toContainText("disable");
    await expect(page.locator("[data-owner-database-status-rows]")).toContainText("Migration Counts");
    await expect(page.locator("[data-owner-database-status-rows]")).toContainText("DDL=15; DML=15");
    await expect(page.locator("[data-owner-database-status-rows]")).toContainText("Last Migration");
    await expect(page.locator("[data-owner-database-status-rows]")).toContainText("DML support-tickets.sql at 2026-06-17 01:07:30.540517+00");
    await expect(page.locator("[data-owner-database-status-rows]")).not.toContainText("postgres://");
    await expect(page.locator("[data-owner-database-status-rows]")).not.toContainText("password");
    await expect(page.locator("[data-owner-database-status-rows]")).not.toContainText("SERVICE_ROLE");
    await expect(page.locator("[data-owner-storage-status-rows]")).toContainText("Storage Configured");
    await expect(page.locator("[data-owner-storage-status-rows]")).toContainText("Storage Endpoint");
    await expect(page.locator("[data-owner-storage-status-rows]")).toContainText("https://storage.example.invalid");
    await expect(page.locator("[data-owner-storage-status-rows]")).toContainText("Storage Bucket");
    await expect(page.locator("[data-owner-storage-status-rows]")).toContainText("gamefoundry-dev-assets");
    await expect(page.locator("[data-owner-storage-status-rows]")).toContainText("Projects Prefix");
    await expect(page.locator("[data-owner-storage-status-rows]")).toContainText("/dev/projects/");
    await expect(page.locator("[data-owner-storage-status-rows]")).toContainText("configured; value hidden");
    await expect(page.locator("[data-owner-storage-status-rows]")).not.toContainText("asset-test-secret-key");
    await expect(page.locator("[data-owner-storage-status-rows]")).not.toContainText("asset-test-access-key");
    await expect(page.locator("[data-owner-promotion-foundation-rows]")).toContainText("DEV");
    await expect(page.locator("[data-owner-promotion-foundation-rows]")).toContainText("Export");
    await expect(page.locator("[data-owner-promotion-foundation-rows]")).toContainText("IST");
    await expect(page.locator("[data-owner-promotion-foundation-rows]")).toContainText("UAT");
    await expect(page.locator("[data-owner-promotion-foundation-rows]")).toContainText("Import");
    await expect(page.locator("[data-owner-promotion-foundation-rows]")).toContainText("Validate");
    await expect(page.locator("[data-owner-promotion-foundation-rows]")).toContainText("PROD");
    await expect(page.locator("[data-owner-promotion-foundation-rows]")).toContainText("project metadata, asset references, and project asset storage objects");
    await expect(page.locator("[data-owner-promotion-foundation-rows]")).toContainText("Owner-only");
    await expect(page.locator("[data-owner-promotion-foundation-rows]")).toContainText("browser execution disabled");
    await expect(page.locator("[data-owner-promotion-foundation-rows]")).toContainText("destructive operations disabled");
    await expect(page.locator("[data-owner-promotion-foundation-rows]")).toContainText("PASS: Read-only export planning only");
    await expect(page.locator("[data-owner-promotion-foundation-rows]")).toContainText("FAIL: Overwrite confirmation is not implemented");
    await expect(page.locator("[data-owner-promotion-foundation-rows]")).toContainText("must fail visibly before any write");
    await expect(page.locator("[data-owner-promotion-foundation-rows]")).toContainText("PASS: Validation planning is read-only");
    await expect(page.locator("[data-owner-operations-status]")).toContainText("PASS: Owner Operations loaded.");

    await page.locator("[data-owner-operation-validate]").click();
    await expect(page.locator("[data-owner-operations-status]")).toContainText("PASS: Current configured connections validated.");
    await expect(page.locator("[data-owner-database-status-rows]")).toContainText("DDL=15; DML=15");
    await expect(page.locator("[data-owner-storage-status-rows]")).toContainText("/dev/projects/");
    await expect(page.locator("[data-owner-promotion-foundation-rows]")).toContainText("Local API");
    await expect(page.locator("[data-owner-operation-result-rows] tr").first()).toContainText("validate-current-connection");
    await expect(page.locator("[data-owner-operation-result-rows] tr").first()).toContainText("yes");

    await page.locator("[data-owner-operation-action='storage-list']").click();
    await expect(page.locator("[data-owner-operations-status]")).toContainText("PASS: List completed through configured storage under /dev/projects/.");
    await expect(page.locator("[data-owner-operation-result-rows] tr").first()).toContainText("storage-list");
    await expect(page.locator("[data-owner-operation-result-rows] tr").first()).toContainText("yes");
    await page.locator("[data-owner-operation-action='storage-write-test-object']").click();
    await expect(page.locator("[data-owner-operations-status]")).toContainText("PASS: Write test object completed through configured storage under /dev/projects/.");
    await page.locator("[data-owner-operation-action='storage-read-test-object']").click();
    await expect(page.locator("[data-owner-operations-status]")).toContainText("PASS: Read test object completed through configured storage under /dev/projects/.");
    await page.locator("[data-owner-operation-action='storage-delete-test-object']").click();
    await expect(page.locator("[data-owner-operations-status]")).toContainText("PASS: Delete test object completed through configured storage under /dev/projects/.");
    await expect(page.locator("[data-owner-operation-result-rows] tr").first()).toContainText("storage-delete-test-object");
    await expect(page.locator("[data-owner-operation-result-rows] tr").first()).toContainText("/dev/projects/connectivity/storage-connectivity-test.txt");
    await expect(page.locator("[data-owner-operation-result-rows]")).not.toContainText("asset-test-secret-key");
    await expect(page.locator("[data-owner-operation-result-rows]")).not.toContainText("asset-test-access-key");

    await page.locator("[data-owner-operation-action='reseed-dev']").click();
    await expect(page.locator("[data-owner-operations-status]")).toContainText("SKIP: Reseed DEV is staged in Owner Operations");
    await expect(page.locator("[data-owner-operation-result-rows] tr").first()).toContainText("reseed-dev");
    await expect(page.locator("[data-owner-operation-result-rows] tr").first()).toContainText("no");
    await page.locator("[data-owner-operation-action='promote-dev-to-ist']").click();
    await expect(page.locator("[data-owner-operations-status]")).toContainText("SKIP: Promote DEV to IST is staged in Owner Operations");
    await expect(page.locator("[data-owner-operation-result-rows] tr").first()).toContainText("promote-dev-to-ist");
    await expect(page.locator("[data-owner-operation-result-rows] tr").first()).toContainText("no");
    await page.locator("[data-owner-operation-action='promote-ist-to-uat']").click();
    await expect(page.locator("[data-owner-operations-status]")).toContainText("SKIP: Promote IST to UAT is staged in Owner Operations");
    await expect(page.locator("[data-owner-operation-result-rows] tr").first()).toContainText("promote-ist-to-uat");
    await expect(page.locator("[data-owner-operation-result-rows] tr").first()).toContainText("no");
    expect(ownerActionPosts).toEqual([
      { actionId: "storage-list" },
      { actionId: "storage-write-test-object" },
      { actionId: "storage-read-test-object" },
      { actionId: "storage-delete-test-object" },
      { actionId: "reseed-dev" },
      { actionId: "promote-dev-to-ist" },
      { actionId: "promote-ist-to-uat" },
    ]);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
  } finally {
    await server.close();
  }
});

test("Owner Operations blocks signed-in non-owner users", async ({ page }) => {
  const server = await startRepoServer();
  try {
    await page.route("**/api/session/current", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            authenticated: true,
            displayName: "User 1",
            roleSlugs: ["creator"],
            userKey: MOCK_DB_KEYS.users.user1,
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
            adminMainItems: [],
            ownerMenuItems: [
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

    await page.goto(`${server.baseUrl}/owner/operations.html`, { waitUntil: "networkidle" });
    await expect(page.locator("main[data-session-access-blocked='owner']")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Owner role required" })).toBeVisible();
    await expect(page.locator("[data-session-access-status]")).toContainText("Current session: User 1");
    await expect(page.locator("[data-owner-operations]")).toHaveCount(0);
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
