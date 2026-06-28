import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../../api/persistence/mock-db-store.js";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const ADMIN_TOOL_MENU_LABELS = [
  "Infrastructure",
  "Operations",
  "Platform Settings",
  "System Health",
  "Tool Votes",
  "Creators",
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
  { heading: "Creators", path: "/admin/users.html", slug: "users", statusText: "Read-only Admin view." },
  { heading: "Platform Settings", liveSettings: true, path: "/admin/platform-settings.html", slug: "platform-settings" },
];

function storagePathStatusFor(configuredPath) {
  const lanes = [
    { lane: "DEV", path: "/dev/projects/" },
    { lane: "IST", path: "/ist/projects/" },
    { lane: "UAT", path: "/uat/projects/" },
    { lane: "PRD", path: "/prod/projects/" },
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
    connectionSummary: {
      account: { configured: true, status: "ready" },
      environmentSwitching: "manual-env-change-and-server-restart",
      productData: { configured: true, status: "adapter-ready" },
      projectAssetStorage: { configured: true, status: "configured" },
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
    details: [
      { area: "Account/session readiness", field: "Session", status: "PASS", value: "authenticated" },
      { area: "Product Data / Local DB", field: "Database name", status: "PASS", value: "gamefoundry_dev" },
      { area: "Project Asset Storage / R2", field: "Projects prefix", status: "PASS", value: "/dev/projects/" },
      { area: "Environment configuration", field: "GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX", status: "PASS", value: "valid lane match" },
      { area: "Secrets status", field: "Storage secret key", status: "PASS", value: "configured; value hidden" },
      { area: "Migration status", field: "Migration counts", status: "PASS", value: "DDL=15; DML=15" },
      { area: "Project package readiness", field: ".gfsp decision", status: "PASS", value: "dev/build/codex/decisions/project-packages.md" },
      { area: "Promotion/package safety", field: "Import overwrite", status: "PASS", value: "fail-visible-until-explicit-confirmation" },
    ],
    limits: [
      { variableName: "GAMEFOUNDRY_STORAGE_LIMIT_BYTES", limit: "1073741824", usage: "NOT AVAILABLE", pressure: "NOT AVAILABLE", status: "PASS", nextStep: "Future R2 provider telemetry can report project asset storage bytes used through the Local API." },
      { variableName: "GAMEFOUNDRY_STORAGE_CLASS_A_LIMIT_MONTHLY", limit: "1000000", usage: "NOT AVAILABLE", pressure: "NOT AVAILABLE", status: "PASS", nextStep: "Future R2 provider telemetry can report monthly Class A operation count through the Local API." },
      { variableName: "GAMEFOUNDRY_STORAGE_CLASS_B_LIMIT_MONTHLY", limit: "10000000", usage: "NOT AVAILABLE", pressure: "NOT AVAILABLE", status: "PASS", nextStep: "Future R2 provider telemetry can report monthly Class B operation count through the Local API." },
      { variableName: "GAMEFOUNDRY_DB_SIZE_LIMIT_BYTES", limit: "1073741824", usage: "NOT AVAILABLE", pressure: "NOT AVAILABLE", status: "PASS", nextStep: "Future Local DB storage telemetry can report database bytes used through the Local API." },
      { variableName: "GAMEFOUNDRY_DB_CONNECTION_LIMIT", limit: "20", usage: "NOT AVAILABLE", pressure: "NOT AVAILABLE", status: "PASS", nextStep: "Future Local DB pool telemetry can report active connection count through the Local API." },
    ],
    message: "Admin System Health loaded safe status only.",
    overview: [
      { area: "Account/session readiness", status: "PASS", summary: "Current session is authenticated with Admin access." },
      { area: "Product Data / Local DB", status: "PASS", summary: "Local DB status is configured for gamefoundry_dev." },
      { area: "Project Asset Storage / R2", status: "PASS", summary: "Project asset storage is configured. Credential values are hidden." },
      { area: "Environment configuration", status: "PASS", summary: "GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX matches exactly one project storage lane." },
      { area: "Secrets status", status: "PASS", summary: "Storage credentials are configured; secret values are hidden." },
      { area: "Environment limits", status: "PASS", summary: "Required limits are configured correctly; live usage is NOT AVAILABLE until provider usage metrics are exposed safely." },
      { area: "Migration status", status: "PASS", summary: "DDL=15; DML=15; last=support-tickets.sql." },
      { area: "Project package readiness", status: "PASS", summary: "Project package decision note is ready for .gfsp export/import/validate planning." },
      { area: "Promotion/package safety", status: "PASS", summary: "Export and Validate are read-only; Import overwrite is blocked until explicit confirmation exists." },
    ],
    r2Readiness: {
      rows: [
        { area: "Project Asset Storage / R2", field: "Endpoint", status: "PASS", value: "https://r2.example.test", nextStep: "Endpoint is configured." },
        { area: "Project Asset Storage / R2", field: "Bucket", status: "PASS", value: "gamefoundry-project-assets", nextStep: "Bucket is configured." },
        { area: "Project Asset Storage / R2", field: "Prefix", status: "PASS", value: "/dev/projects/", nextStep: "Prefix is configured." },
        { area: "Project Asset Storage / R2", field: "Credential configured status", status: "PASS", value: "configured; values hidden", nextStep: "Credentials are configured and hidden." },
        { area: "Project Asset Storage / R2", field: "Connectivity test status", status: "SKIP", value: "NOT RUN", nextStep: "Use Admin System Health connectivity actions for List, Write test object, Read test object, and Delete test object validation." },
        { area: "R2 operational readiness", field: "Ready for Assets", status: "PASS", value: "Ready", nextStep: "Configuration is ready; collect live connectivity evidence before release or promotion signoff." },
        { area: "R2 operational readiness", field: "Ready for Project Packages", status: "PASS", value: "Ready", nextStep: "Configuration is ready; collect live connectivity evidence before release or promotion signoff." },
        { area: "R2 operational readiness", field: "Ready for Promotion Packages", status: "PASS", value: "Ready", nextStep: "Configuration is ready; collect live connectivity evidence before release or promotion signoff." },
      ],
      status: "PASS",
    },
    secretEditingAllowed: false,
    secretsExposed: false,
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
    summary: {
      counts: { FAIL: 0, PASS: 9, WARN: 0 },
      lastRefreshAt: "2026-06-17T16:00:00.000Z",
      score: 100,
      status: "PASS",
      total: 9,
    },
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
            { label: "Operations", path: "admin/operations.html", route: "admin-operations" },
            { label: "Platform Settings", path: "admin/platform-settings.html", route: "admin-platform-settings" },
            { label: "System Health", path: "admin/system-health.html", route: "admin-system-health" },
            { label: "Tool Votes", path: "admin/tool-votes.html", route: "admin-tool-votes" },
            { label: "Creators", path: "admin/users.html", route: "admin-users" },
          ],
          ownerMenuItems: [
            { label: "DB Viewer", path: "admin/db-viewer.html", route: "admin-db-viewer" },
            { label: "Design System", path: "admin/design-system.html", route: "admin-design-system" },
            { label: "Grouping Colors", path: "admin/grouping-colors.html", route: "admin-grouping-colors" },
            { href: "/admin/admin-notes.html", label: "Notes", localNotes: true },
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
  await page.route("**/api/admin/system-health/storage-connectivity-action", async (route) => {
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
  const paths = ["/dev/projects/", "/ist/projects/", "/uat/projects/", "/prod/projects/"];
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
  await expect(page.locator("nav.nav-links > .nav-item > a[data-route='owner']")).toHaveAttribute("href", /admin\/db-viewer\.html$/);
  const ownerSubmenu = page.locator("nav.nav-links > .nav-item[data-owner-menu] > .sub-menu");
  await expect(ownerSubmenu.locator("a")).toHaveText(["DB Viewer", "Design System", "Grouping Colors", "Notes"]);
  const adminSubmenu = page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin']) > .sub-menu");
  await expect(adminSubmenu.locator(":scope > a[data-route='admin-infrastructure']")).toHaveText("Infrastructure");
  await expect(adminSubmenu.locator(":scope > a[data-route='admin-operations']")).toHaveText("Operations");
  await expect(adminSubmenu.locator(":scope > a[data-route='admin-platform-settings']")).toHaveText("Platform Settings");
  await expect(adminSubmenu.locator(":scope > a[data-route='admin-system-health']")).toHaveText("System Health");
  await expect(adminSubmenu.locator(":scope > a[data-route='admin-tool-votes']")).toHaveText("Tool Votes");
  await expect(adminSubmenu.locator(":scope > a[data-route='admin-users']")).toHaveText("Creators");
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
      await expect(page.locator(".tool-column").first().locator("details.vertical-accordion")).toHaveCount(adminPage.liveSettings ? 1 : (adminPage.systemHealth ? 3 : 2));
      await expect(page.locator(".tool-column").last().locator("details.vertical-accordion")).toHaveCount(adminPage.systemHealth ? 4 : 2);
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
        await expect(page.locator("body")).toContainText("/prod/projects/");
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
        await expect(page.getByRole("link", { name: "Database Status" })).toHaveAttribute("href", /admin\/system-health\.html$/);
        await expect(page.getByRole("link", { name: "Storage Status" })).toHaveAttribute("href", /admin\/system-health\.html$/);
        await expect(page.getByRole("link", { name: "Admin Operations" })).toHaveAttribute("href", /admin\/operations\.html$/);
        await expect(page.getByRole("link", { name: "Promotion Foundation" })).toHaveAttribute("href", /admin\/system-health\.html$/);
        await expect(page.locator("[data-admin-storage-connectivity-action]")).toHaveCount(0);
        await expect(page.locator("[data-admin-storage-connectivity-result-rows]")).toHaveCount(0);
        await expect(page.locator("body")).toContainText("Storage connectivity tests run from Admin System Health");
      } else if (adminPage.systemHealth) {
        await expect(page.locator("[data-admin-system-health-status]")).toContainText("PASS: Admin System Health loaded safe status only.");
        await expect(page.locator("[data-admin-system-health-summary-rows]")).toContainText("100");
        await expect(page.locator("[data-admin-system-health-summary-rows]")).toContainText("2026-06-17T16:00:00.000Z");
        await expect(page.locator("[data-admin-system-health-summary-rows]")).toContainText("9");
        await expect(page.locator("[data-admin-system-health-summary-rows]")).toContainText("0");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Account/session readiness");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Product Data / Local DB");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Project Asset Storage / R2");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Environment configuration");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Secrets status");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Environment limits");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Migration status");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Project package readiness");
        await expect(page.locator("[data-admin-system-health-overview-rows]")).toContainText("Promotion/package safety");
        await expect(page.locator("[data-admin-system-health-overview-rows]").filter({ hasText: "Environment limits" })).toContainText("PASS");
        await expect(page.locator("[data-admin-system-health-connection-summary]")).toContainText("Account");
        await expect(page.locator("[data-admin-system-health-connection-summary]")).toContainText("Product Data / Local DB");
        await expect(page.locator("[data-admin-system-health-connection-summary]")).toContainText("Project Asset Storage / R2");
        await expect(page.locator("[data-admin-system-health-connection-summary]")).toContainText("not exposed");
        await expect(page.locator("[data-admin-system-health-database-status-rows]")).toContainText("Connection Configured");
        await expect(page.locator("[data-admin-system-health-database-status-rows]")).toContainText("Database Host");
        await expect(page.locator("[data-admin-system-health-database-status-rows]")).toContainText("192.168.2.5");
        await expect(page.locator("[data-admin-system-health-database-status-rows]")).toContainText("Database Port");
        await expect(page.locator("[data-admin-system-health-database-status-rows]")).toContainText("55431");
        await expect(page.locator("[data-admin-system-health-database-status-rows]")).toContainText("Database Name");
        await expect(page.locator("[data-admin-system-health-database-status-rows]")).toContainText("gamefoundry_dev");
        await expect(page.locator("[data-admin-system-health-database-status-rows]")).toContainText("SSL Mode");
        await expect(page.locator("[data-admin-system-health-database-status-rows]")).toContainText("disable");
        await expect(page.locator("[data-admin-system-health-database-status-rows]")).toContainText("Migration Counts");
        await expect(page.locator("[data-admin-system-health-database-status-rows]")).toContainText("DDL=15; DML=15");
        await expect(page.locator("[data-admin-system-health-database-status-rows]")).toContainText("Last Migration");
        await expect(page.locator("[data-admin-system-health-database-status-rows]")).not.toContainText("postgres://");
        await expect(page.locator("[data-admin-system-health-storage-status-rows]")).toContainText("Storage Configured");
        await expect(page.locator("[data-admin-system-health-storage-status-rows]")).toContainText("Storage Endpoint");
        await expect(page.locator("[data-admin-system-health-storage-status-rows]")).toContainText("https://storage.example.invalid");
        await expect(page.locator("[data-admin-system-health-storage-status-rows]")).toContainText("Storage Bucket");
        await expect(page.locator("[data-admin-system-health-storage-status-rows]")).toContainText("gamefoundry-dev-assets");
        await expect(page.locator("[data-admin-system-health-storage-status-rows]")).toContainText("Projects Prefix");
        await expect(page.locator("[data-admin-system-health-storage-status-rows]")).toContainText("/dev/projects/");
        await expect(page.locator("[data-admin-system-health-storage-status-rows]")).toContainText("configured; value hidden");
        await expect(page.locator("[data-admin-system-health-storage-status-rows]")).not.toContainText("asset-test-secret-key");
        await expect(page.locator("[data-admin-system-health-storage-status-rows]")).not.toContainText("asset-test-access-key");
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
        await expect(page.locator("[data-admin-system-health-limit-rows]")).toContainText("1073741824");
        await expect(page.locator("[data-admin-system-health-limit-rows]")).toContainText("20");
        await expect(page.locator("caption").filter({ hasText: "values may differ by DEV/IST/UAT/PRD" })).toBeVisible();
        await expect(page.locator("[data-admin-system-health-r2-readiness-rows]")).toContainText("Endpoint");
        await expect(page.locator("[data-admin-system-health-r2-readiness-rows]")).toContainText("Bucket");
        await expect(page.locator("[data-admin-system-health-r2-readiness-rows]")).toContainText("Prefix");
        await expect(page.locator("[data-admin-system-health-r2-readiness-rows]")).toContainText("Credential configured status");
        await expect(page.locator("[data-admin-system-health-r2-readiness-rows]")).toContainText("Connectivity test status");
        await expect(page.locator("[data-admin-system-health-r2-readiness-rows]")).toContainText("Ready for Assets");
        await expect(page.locator("[data-admin-system-health-r2-readiness-rows]")).toContainText("Ready for Project Packages");
        await expect(page.locator("[data-admin-system-health-r2-readiness-rows]")).toContainText("Ready for Promotion Packages");
        await expect(page.locator("[data-admin-system-health-r2-readiness-rows]")).toContainText("configured; values hidden");
        await expect(page.locator("[data-admin-system-health-r2-readiness-rows]")).toContainText("NOT RUN");
        await expect(page.locator("[data-admin-system-health-r2-readiness-rows]")).toContainText("collect live connectivity evidence");
        await expect(page.locator("[data-admin-system-health-r2-readiness-rows]")).not.toContainText("asset-test-secret-key");
        await expect(page.locator("[data-admin-system-health-r2-readiness-rows]")).not.toContainText("asset-test-access-key");
        await expect(page.locator("[data-admin-system-health-storage-action='storage-list']")).toHaveText("List");
        await expect(page.locator("[data-admin-system-health-storage-action='storage-write-test-object']")).toHaveText("Write Test Object");
        await expect(page.locator("[data-admin-system-health-storage-action='storage-read-test-object']")).toHaveText("Read Test Object");
        await expect(page.locator("[data-admin-system-health-storage-action='storage-delete-test-object']")).toHaveText("Delete Test Object");
        await expect(page.locator("[data-admin-system-health-storage-connectivity-status]")).toContainText("PASS: Storage connectivity startup completed List, Write Test Object, Read Test Object, and Delete Test Object.");
        await expect(page.locator("[data-admin-system-health-storage-connectivity-result-rows]")).toContainText("storage-list");
        await expect(page.locator("[data-admin-system-health-storage-connectivity-result-rows]")).toContainText("storage-write-test-object");
        await expect(page.locator("[data-admin-system-health-storage-connectivity-result-rows]")).toContainText("storage-read-test-object");
        await expect(page.locator("[data-admin-system-health-storage-connectivity-result-rows]")).toContainText("storage-delete-test-object");
        await expect(page.locator("[data-admin-system-health-storage-connectivity-result-rows]")).not.toContainText("asset-test-secret-key");
        await expect(page.locator("[data-admin-system-health-storage-connectivity-result-rows]")).not.toContainText("asset-test-access-key");
        expect(failures.adminStorageConnectivityPosts).toEqual([
          { actionId: "storage-list" },
          { actionId: "storage-write-test-object" },
          { actionId: "storage-read-test-object" },
          { actionId: "storage-delete-test-object" },
        ]);
        await page.locator("[data-admin-system-health-storage-action='storage-list']").click();
        await expect(page.locator("[data-admin-system-health-storage-connectivity-status]")).toContainText("PASS: List completed through Local API under /dev/projects/.");
        await page.locator("[data-admin-system-health-storage-action='storage-write-test-object']").click();
        await expect(page.locator("[data-admin-system-health-storage-connectivity-status]")).toContainText("PASS: Write test object completed through Local API under /dev/projects/.");
        await page.locator("[data-admin-system-health-storage-action='storage-read-test-object']").click();
        await expect(page.locator("[data-admin-system-health-storage-connectivity-status]")).toContainText("PASS: Read test object completed through Local API under /dev/projects/.");
        await page.locator("[data-admin-system-health-storage-action='storage-delete-test-object']").click();
        await expect(page.locator("[data-admin-system-health-storage-connectivity-status]")).toContainText("PASS: Delete test object completed through Local API under /dev/projects/.");
        await expect(page.locator("[data-admin-system-health-storage-connectivity-result-rows] tr").first()).toContainText("storage-delete-test-object");
        await expect(page.locator("[data-admin-system-health-storage-connectivity-result-rows] tr").first()).toContainText("yes");
        expect(failures.adminStorageConnectivityPosts).toEqual([
          { actionId: "storage-list" },
          { actionId: "storage-write-test-object" },
          { actionId: "storage-read-test-object" },
          { actionId: "storage-delete-test-object" },
          { actionId: "storage-list" },
          { actionId: "storage-write-test-object" },
          { actionId: "storage-read-test-object" },
          { actionId: "storage-delete-test-object" },
        ]);
        await expect(page.getByRole("link", { name: "Infrastructure Reference" })).toHaveAttribute("href", /admin\/infrastructure\.html$/);
        await expect(page.getByRole("link", { name: "Admin Operations Actions" })).toHaveAttribute("href", /admin\/operations\.html$/);
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
    const platformBanners = page.locator("[data-platform-banner-source='platform-settings']");
    await expect(platformBanners).toHaveCount(2);
    await expect(page.locator("[data-platform-banner-source='platform-settings'][data-platform-banner-placement='header']")).toContainText("Temporary data notice for creators.");
    await expect(page.locator("[data-platform-banner-source='platform-settings'][data-platform-banner-placement='header']")).toHaveClass(/platform-banner--warning/);
    await expect(page.locator("[data-platform-banner-source='platform-settings'][data-platform-banner-placement='footer']")).toContainText("Temporary data notice for creators.");
    await expect(page.locator("[data-platform-banner-source='platform-settings'][data-platform-banner-placement='footer']")).toHaveClass(/platform-banner--warning/);
    await expect.poll(async () => page.evaluate(() => window.GameFoundryPlatformBannerDiagnostics)).toEqual({
      active: true,
      message: "Temporary data notice for creators.",
      sourceTable: "platform_settings",
      sourceTableRowKey: "01KVRBANNERACTIVE00000001",
    });
    const layout = await page.evaluate(() => {
      const header = document.querySelector("header.site-header");
      const headerBanner = document.querySelector("[data-platform-banner-source='platform-settings'][data-platform-banner-placement='header']");
      const footerBanner = document.querySelector("[data-platform-banner-source='platform-settings'][data-platform-banner-placement='footer']");
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
      const platformHeaderBanner = page.locator("[data-platform-banner-source='platform-settings'][data-platform-banner-placement='header']");
      await expect(platformHeaderBanner).toHaveClass(new RegExp(`platform-banner--${tone}`));
      toneMetrics[tone] = await platformHeaderBanner.evaluate((element) => {
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
              { label: "Operations", path: "admin/operations.html", route: "admin-operations" },
              { label: "Platform Settings", path: "admin/platform-settings.html", route: "admin-platform-settings" },
              { label: "System Health", path: "admin/system-health.html", route: "admin-system-health" },
              { label: "Tool Votes", path: "admin/tool-votes.html", route: "admin-tool-votes" },
              { label: "Creators", path: "admin/users.html", route: "admin-users" },
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
    await expect(page.locator("[data-platform-banner-source='platform-settings']")).toHaveCount(2);
    await expect(page.locator("[data-platform-banner-source='platform-settings'][data-platform-banner-placement='header']")).toContainText("Outage notice for creators.");
    await expect(page.locator("[data-platform-banner-source='platform-settings'][data-platform-banner-placement='footer']")).toContainText("Outage notice for creators.");

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
    await expect(page.locator("[data-platform-banner-source='platform-settings']")).toHaveCount(0);
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
              { label: "Creators", path: "admin/users.html", route: "admin-users" },
            ],
            ownerMenuItems: [
              { label: "DB Viewer", path: "admin/db-viewer.html", route: "admin-db-viewer" },
              { label: "Design System", path: "admin/design-system.html", route: "admin-design-system" },
              { label: "Grouping Colors", path: "admin/grouping-colors.html", route: "admin-grouping-colors" },
              { href: "/admin/admin-notes.html", label: "Notes", localNotes: true },
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
    ]);

    sessionRoles.splice(0, sessionRoles.length, "owner", "admin", "creator");
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("gamefoundry:data-changed")));
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item[data-owner-menu]")).toBeVisible();
  } finally {
    await server.close();
  }
});

test("Admin Operations exposes ordered guarded operation actions", async ({ page }) => {
  const server = await startRepoServer();
  const adminActionPosts = [];
  const actionGroups = [
    {
      id: "project-packaging",
      label: "Project Packaging",
      actions: [
        { id: "export-project-package", label: "Export Project Package", status: "PASS", diagnostic: "Export Project Package creates a .gfsp ZIP package for the active Game Hub record." },
        { id: "validate-project-package", label: "Validate Project Package", status: "PASS", diagnostic: "Validate Project Package checks package integrity without import.", requiresPackageFile: true },
        { id: "import-project-package", label: "Import Project Package", status: "WARN", diagnostic: "Import Project Package validates first and blocks silent overwrite.", confirmationMessage: "Replace Existing requires explicit confirmation before overwrite.", confirmationPhrase: "REPLACE", confirmationRequired: true, requiresPackageFile: true, risky: true, supportsImportModes: true },
      ],
    },
    {
      id: "backup-recovery",
      label: "Backup & Recovery",
      actions: [
        { id: "create-backup", label: "Create Backup", status: "PASS", diagnostic: "Create Backup validates the configured Local DB connection, runs server-side pg_dump --format=custom into temporary staging, uploads the .dump to the configured R2 backup prefix, then removes staging." },
        { id: "restore-from-backup", label: "Restore From Backup", status: "WARN", diagnostic: "Restore From Backup remains scaffold-only until server-side pg_restore safety is approved.", confirmationMessage: "Restore From Backup is scaffold-only until server-side pg_restore safety is approved.", confirmationPhrase: "RESTORE", confirmationRequired: true, requiresBackupFile: true, risky: true },
      ],
    },
    {
      id: "database-operations",
      label: "Database Operations",
      actions: [
        { id: "validate-current-connection", label: "Validate Current Connection", status: "PASS", diagnostic: "Validate Current Connection checks configured services without changing data." },
        { id: "database-connectivity-test", label: "Database Connectivity Test", status: "PASS", diagnostic: "Database Connectivity Test checks the configured Local DB without changing data." },
        { id: "run-migration", label: "Run Migration", status: "SKIP", diagnostic: "Run Migration is not implemented from Admin Operations; use reviewed server-side migration scripts.", confirmationMessage: "Run Migration is risky and must require explicit confirmation before migration execution is implemented.", confirmationRequired: true, notImplemented: true, risky: true },
        { id: "reseed-dev", label: "Reseed DEV", status: "SKIP", diagnostic: "Reseed DEV is not implemented from Admin Operations; use reviewed DEV-only reseed scripts.", confirmationMessage: "Reseed DEV is destructive and is only available when the configured project storage lane resolves to DEV.", confirmationRequired: true, notImplemented: true, risky: true },
      ],
    },
  ];
  const actionLabels = Object.fromEntries(actionGroups.flatMap((group) => group.actions.map((action) => [action.id, action.label])));
  const actionMessages = {
    "export-project-package": "Export Project Package generated DemoGame-26168-001.gfsp with 3 required file(s) and 0 asset reference(s); export validation PASS.",
    "validate-project-package": "Validate Project Package passed integrity, required file, schema, compatibility, and asset reference checks. No import performed.",
    "import-project-package": "Import Project Package replaced existing project Demo Game after explicit REPLACE confirmation.",
    "create-backup": "Create Backup uploaded gamefoundry-dev-db-26168-001.dump to R2 key /dev/backups/postgres/gamefoundry-dev-db-26168-001.dump for DEV at 2026-06-17T16:00:00.000Z; size 2048 bytes.",
    "restore-from-backup": "Restore From Backup is scaffold-only. Server-side pg_restore safety, conflict validation, and explicit restore approval must be implemented before restore can run.",
    "run-migration": "Run Migration is not implemented in Admin Operations. Run Migration is risky and must require explicit confirmation before migration execution is implemented.",
    "reseed-dev": "Reseed DEV is not implemented in Admin Operations. Reseed DEV is destructive and is only available when the configured project storage lane resolves to DEV.",
  };
  try {
    await page.route("**/api/session/current", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            authenticated: true,
            displayName: "DavidQ",
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
              { label: "Infrastructure", path: "admin/infrastructure.html", route: "admin-infrastructure" },
              { label: "Operations", path: "admin/operations.html", route: "admin-operations" },
              { label: "Platform Settings", path: "admin/platform-settings.html", route: "admin-platform-settings" },
              { label: "System Health", path: "admin/system-health.html", route: "admin-system-health" },
              { label: "Tool Votes", path: "admin/tool-votes.html", route: "admin-tool-votes" },
              { label: "Creators", path: "admin/users.html", route: "admin-users" },
            ],
            ownerMenuItems: [
              { label: "DB Viewer", path: "admin/db-viewer.html", route: "admin-db-viewer" },
              { label: "Design System", path: "admin/design-system.html", route: "admin-design-system" },
              { label: "Grouping Colors", path: "admin/grouping-colors.html", route: "admin-grouping-colors" },
              { href: "/admin/admin-notes.html", label: "Notes", localNotes: true },
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
    await page.route("**/api/admin/operations/status", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            actionGroups,
            currentEnvironment: "DEV",
            message: "Admin Operations loaded.",
            status: "PASS",
          },
          ok: true,
        }),
      });
    });
    await page.route("**/api/admin/operations/action", async (route) => {
      const body = route.request().postDataJSON();
      const actionLabel = actionLabels[body.actionId] || body.actionId;
      adminActionPosts.push(body);
      const liveMessages = {
        "database-connectivity-test": "Database Connectivity Test completed for the configured Local DB.",
        "validate-current-connection": "Current configured connections validated.",
      };
      const packageMessages = {
        "export-project-package": { executed: true, status: "PASS" },
        "validate-project-package": { executed: Boolean(body.packageBytesBase64), status: body.packageBytesBase64 ? "PASS" : "FAIL" },
        "import-project-package": {
          executed: body.packageBytesBase64 && body.importMode === "replace-existing" && body.overwriteConfirmed === true && body.confirmationPhrase === "REPLACE",
          status: body.packageBytesBase64 && body.importMode === "replace-existing" && body.overwriteConfirmed === true && body.confirmationPhrase === "REPLACE" ? "PASS" : "FAIL",
        },
        "create-backup": { executed: true, status: "PASS" },
        "restore-from-backup": {
          executed: false,
          status: "SKIP",
        },
      };
      const packageResult = packageMessages[body.actionId];
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            actionId: body.actionId,
            actionLabel,
            backup: body.actionId === "create-backup" ? {
              createdAt: "2026-06-17T16:00:00.000Z",
              environment: "DEV",
              fileName: "gamefoundry-dev-db-26168-001.dump",
              format: "custom",
              r2Key: "/dev/backups/postgres/gamefoundry-dev-db-26168-001.dump",
              sizeBytes: 2048,
              storageProvider: "r2",
            } : undefined,
            executed: packageResult ? packageResult.executed : body.actionId === "validate-current-connection" || body.actionId === "database-connectivity-test",
            manualOnly: !packageResult && body.actionId !== "validate-current-connection" && body.actionId !== "database-connectivity-test",
            message: liveMessages[body.actionId] || actionMessages[body.actionId] || `${actionLabel} is not implemented in Admin Operations.`,
            package: body.actionId === "export-project-package" ? {
              filename: "DemoGame-26168-001.gfsp",
              packageBytesBase64: Buffer.from("fake-gfsp-package").toString("base64"),
            } : undefined,
            status: packageResult?.status || (liveMessages[body.actionId] ? "PASS" : "SKIP"),
          },
          ok: true,
        }),
      });
    });

    await page.goto(`${server.baseUrl}/admin/operations.html`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: "Operations" })).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin']) > .sub-menu a")).toHaveText(ADMIN_TOOL_MENU_LABELS);
    await expect(page.locator("nav.nav-links > .nav-item[data-owner-menu]")).toHaveCount(0);
    await expect(page.locator("[data-admin-operations] .tool-column").first().locator("summary")).toHaveText([
      "Project Packaging",
      "Backup & Recovery",
      "Database Operations",
    ]);
    await expect(page.locator("[data-admin-operation-group='project-packaging'] button")).toHaveText([
      "Export Project Package",
      "Validate Project Package",
      "Import Project Package",
    ]);
    await expect(page.locator("[data-admin-operation-group='backup-recovery'] button")).toHaveText([
      "Create Backup",
      "Restore From Backup",
    ]);
    await expect(page.locator("[data-admin-operation-group='database-operations'] button")).toHaveText([
      "Validate Current Connection",
      "Database Connectivity Test",
      "Run Migration",
      "Reseed DEV",
    ]);
    await expect(page.locator("[data-admin-operations]")).not.toContainText("Promote DEV to IST");
    await expect(page.locator("[data-admin-operations]")).not.toContainText("Promote IST to UAT");
    await expect(page.locator("[data-admin-operations]")).not.toContainText("Promote UAT to PROD");
    await expect(page.locator("[data-owner-database-status-rows]")).toHaveCount(0);
    await expect(page.locator("[data-owner-promotion-foundation-rows]")).toHaveCount(0);
    await expect(page.locator("[data-admin-operations-status]")).toContainText("PASS: Admin Operations loaded.");
    await expect(page.locator("[data-admin-operations-environment]")).toContainText("DEV");
    await expect(page.locator("[data-admin-operation-safety-rows]")).toContainText("Import Project Package");
    await expect(page.locator("[data-admin-operation-safety-rows]")).toContainText("Restore From Backup");
    await expect(page.locator("[data-admin-operation-safety-rows]")).toContainText("Run Migration");
    await expect(page.locator("[data-admin-operation-safety-rows]")).toContainText("Reseed DEV");
    await expect(page.locator("[data-admin-operation-safety-rows]")).toContainText("required before execution");
    await expect(page.locator("[data-admin-operation-safety-rows]")).toContainText("not implemented");
    await expect(page.locator("[data-admin-operation-package-file='validate-project-package']")).toHaveAttribute("accept", ".gfsp");
    await expect(page.locator("[data-admin-operation-package-file='import-project-package']")).toHaveAttribute("accept", ".gfsp");
    await expect(page.locator("[data-admin-operation-import-mode='import-project-package']")).toHaveValue("import-as-new");
    await expect(page.locator("[data-admin-operation-backup-file='restore-from-backup']")).toHaveAttribute("accept", ".json");
    await expect(page.locator("[data-admin-operation-confirmation-phrase='import-project-package']")).toHaveAttribute("placeholder", "REPLACE");
    await expect(page.locator("[data-admin-operation-confirmation-phrase='restore-from-backup']")).toHaveAttribute("placeholder", "RESTORE");
    await expect(page.locator("[data-admin-operations]")).not.toContainText("asset-test-secret-key");
    await expect(page.locator("[data-admin-operations]")).not.toContainText("asset-test-access-key");

    const exportDownloadPromise = page.waitForEvent("download");
    await page.locator("[data-admin-operation-action='export-project-package']").click();
    const exportDownload = await exportDownloadPromise;
    expect(exportDownload.suggestedFilename()).toBe("DemoGame-26168-001.gfsp");
    await expect(page.locator("[data-admin-operations-status]")).toContainText("PASS: Export Project Package generated DemoGame-26168-001.gfsp");
    await expect(page.locator("[data-admin-operation-result-rows] tr").first()).toContainText("Export Project Package");
    await expect(page.locator("[data-admin-operation-result-rows] tr").first()).toContainText("yes");
    await expect(page.locator("[data-admin-operation-result-rows] tr").first()).toContainText("Download started: DemoGame-26168-001.gfsp.");
    await page.locator("[data-admin-operation-package-file='validate-project-package']").setInputFiles({
      buffer: Buffer.from("fake-gfsp-package"),
      mimeType: "application/octet-stream",
      name: "DemoGame-26168-001.gfsp",
    });
    await page.locator("[data-admin-operation-action='validate-project-package']").click();
    await expect(page.locator("[data-admin-operations-status]")).toContainText("PASS: Validate Project Package passed integrity");
    await page.locator("[data-admin-operation-package-file='import-project-package']").setInputFiles({
      buffer: Buffer.from("fake-gfsp-package"),
      mimeType: "application/octet-stream",
      name: "DemoGame-26168-001.gfsp",
    });
    await page.locator("[data-admin-operation-import-mode='import-project-package']").selectOption("replace-existing");
    await page.locator("[data-admin-operation-confirmation='import-project-package']").check();
    await page.locator("[data-admin-operation-confirmation-phrase='import-project-package']").fill("REPLACE");
    await page.locator("[data-admin-operation-action='import-project-package']").click();
    await expect(page.locator("[data-admin-operations-status]")).toContainText("PASS: Import Project Package replaced existing project Demo Game after explicit REPLACE confirmation.");
    await page.locator("[data-admin-operation-action='create-backup']").click();
    await expect(page.locator("[data-admin-operations-status]")).toContainText("PASS: Create Backup uploaded gamefoundry-dev-db-26168-001.dump to R2 key /dev/backups/postgres/gamefoundry-dev-db-26168-001.dump for DEV");
    await expect(page.locator("[data-admin-operation-result-rows] tr").first()).toContainText("Create Backup");
    await expect(page.locator("[data-admin-operation-result-rows] tr").first()).toContainText("yes");
    await expect(page.locator("[data-admin-operation-result-rows] tr").first()).toContainText("/dev/backups/postgres/gamefoundry-dev-db-26168-001.dump");
    await expect(page.locator("[data-admin-operation-result-rows] tr").first()).toContainText("size 2048 bytes.");
    await page.locator("[data-admin-operation-backup-file='restore-from-backup']").setInputFiles({
      buffer: Buffer.from("{\"backupType\":\"Game Foundry Studio Local API Backup\"}"),
      mimeType: "application/json",
      name: "gamefoundry-local-api-backup.json",
    });
    await page.locator("[data-admin-operation-confirmation='restore-from-backup']").check();
    await page.locator("[data-admin-operation-confirmation-phrase='restore-from-backup']").fill("RESTORE");
    await page.locator("[data-admin-operation-action='restore-from-backup']").click();
    await expect(page.locator("[data-admin-operations-status]")).toContainText("SKIP: Restore From Backup is scaffold-only.");
    await page.locator("[data-admin-operation-action='validate-current-connection']").click();
    await expect(page.locator("[data-admin-operations-status]")).toContainText("PASS: Current configured connections validated.");
    await expect(page.locator("[data-admin-operation-result-rows] tr").first()).toContainText("Validate Current Connection");
    await expect(page.locator("[data-admin-operation-result-rows] tr").first()).toContainText("yes");
    await page.locator("[data-admin-operation-action='database-connectivity-test']").click();
    await expect(page.locator("[data-admin-operations-status]")).toContainText("PASS: Database Connectivity Test completed for the configured Local DB.");
    await page.locator("[data-admin-operation-action='run-migration']").click();
    await expect(page.locator("[data-admin-operations-status]")).toContainText("SKIP: Run Migration is not implemented in Admin Operations.");
    await page.locator("[data-admin-operation-action='reseed-dev']").click();
    await expect(page.locator("[data-admin-operations-status]")).toContainText("SKIP: Reseed DEV is not implemented in Admin Operations.");
    expect(adminActionPosts.map((post) => post.actionId)).toEqual([
      "export-project-package",
      "validate-project-package",
      "import-project-package",
      "create-backup",
      "restore-from-backup",
      "validate-current-connection",
      "database-connectivity-test",
      "run-migration",
      "reseed-dev",
    ]);
    expect(adminActionPosts.find((post) => post.actionId === "validate-project-package")).toEqual(expect.objectContaining({
      packageBytesBase64: Buffer.from("fake-gfsp-package").toString("base64"),
      packageFileName: "DemoGame-26168-001.gfsp",
    }));
    expect(adminActionPosts.find((post) => post.actionId === "import-project-package")).toEqual(expect.objectContaining({
      confirmationPhrase: "REPLACE",
      importMode: "replace-existing",
      overwriteConfirmed: true,
      packageFileName: "DemoGame-26168-001.gfsp",
    }));
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
  } finally {
    await server.close();
  }
});

test("Admin Operations reports export artifact and Postgres backup failures visibly", async ({ page }) => {
  const server = await startRepoServer();
  const actionGroups = [
    {
      id: "project-packaging",
      label: "Project Packaging",
      actions: [
        { id: "export-project-package", label: "Export Project Package", status: "PASS", diagnostic: "Export Project Package creates a .gfsp ZIP package." },
      ],
    },
    {
      id: "backup-recovery",
      label: "Backup & Recovery",
      actions: [
        { id: "create-backup", label: "Create Backup", status: "PASS", diagnostic: "Create Backup runs server-side pg_dump --format=custom into temporary staging, uploads the .dump to the configured R2 backup prefix, then removes staging." },
      ],
    },
    {
      id: "database-operations",
      label: "Database Operations",
      actions: [],
    },
  ];
  try {
    await page.route("**/api/session/current", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            authenticated: true,
            displayName: "DavidQ",
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
              { label: "Operations", path: "admin/operations.html", route: "admin-operations" },
              { label: "System Health", path: "admin/system-health.html", route: "admin-system-health" },
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
        body: JSON.stringify({ data: { banner: { active: false, message: "", tone: "info" } }, ok: true }),
      });
    });
    await page.route("**/api/toolbox/registry/snapshot", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ data: { activeTools: [], readinessByStatus: {}, tools: [], toolboxContract: {} }, ok: true }),
      });
    });
    await page.route("**/api/admin/operations/status", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            actionGroups,
            currentEnvironment: "DEV",
            message: "Admin Operations loaded.",
            status: "PASS",
          },
          ok: true,
        }),
      });
    });
    await page.route("**/api/admin/operations/action", async (route) => {
      const body = route.request().postDataJSON();
      const createBackup = body.actionId === "create-backup";
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            actionId: body.actionId,
            actionLabel: createBackup ? "Create Backup" : "Export Project Package",
            executed: !createBackup,
            message: createBackup
              ? "Create Backup requires configured R2 backup storage. Missing or empty: GAMEFOUNDRY_DB_BACKUP_STORAGE_PROVIDER, GAMEFOUNDRY_DB_BACKUP_PREFIX."
              : `${body.actionId} returned PASS without artifact bytes.`,
            status: createBackup ? "FAIL" : "PASS",
          },
          ok: true,
        }),
      });
    });

    await page.goto(`${server.baseUrl}/admin/operations.html`, { waitUntil: "networkidle" });
    await page.locator("[data-admin-operation-action='export-project-package']").click();
    await expect(page.locator("[data-admin-operations-status]")).toContainText("FAIL: Export Project Package completed without downloadable .gfsp package bytes.");
    await expect(page.locator("[data-admin-operation-result-rows] tr").first()).toContainText("Export Project Package");
    await expect(page.locator("[data-admin-operation-result-rows] tr").first()).toContainText("FAIL");
    await page.locator("[data-admin-operation-action='create-backup']").click();
    await expect(page.locator("[data-admin-operations-status]")).toContainText("FAIL: Create Backup requires configured R2 backup storage.");
    await expect(page.locator("[data-admin-operation-result-rows] tr").first()).toContainText("Create Backup");
    await expect(page.locator("[data-admin-operation-result-rows] tr").first()).toContainText("FAIL");
    await expect(page.locator("[data-admin-operations]")).not.toContainText("asset-test-secret-key");
    await expect(page.locator("[data-admin-operations]")).not.toContainText("asset-test-access-key");
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
  } finally {
    await server.close();
  }
});

test("Admin Operations hides Reseed DEV outside the DEV lane", async ({ page }) => {
  const server = await startRepoServer();
  try {
    await page.route("**/api/session/current", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            authenticated: true,
            displayName: "DavidQ",
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
              { label: "Infrastructure", path: "admin/infrastructure.html", route: "admin-infrastructure" },
              { label: "Operations", path: "admin/operations.html", route: "admin-operations" },
              { label: "Platform Settings", path: "admin/platform-settings.html", route: "admin-platform-settings" },
              { label: "System Health", path: "admin/system-health.html", route: "admin-system-health" },
              { label: "Tool Votes", path: "admin/tool-votes.html", route: "admin-tool-votes" },
              { label: "Creators", path: "admin/users.html", route: "admin-users" },
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
        body: JSON.stringify({ data: { banner: { active: false, message: "", tone: "info" } }, ok: true }),
      });
    });
    await page.route("**/api/toolbox/registry/snapshot", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ data: { activeTools: [], readinessByStatus: {}, tools: [], toolboxContract: {} }, ok: true }),
      });
    });
    await page.route("**/api/admin/operations/status", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            actionGroups: [
              { id: "project-packaging", label: "Project Packaging", actions: [{ id: "export-project-package", label: "Export Project Package", status: "SKIP", diagnostic: "Export Project Package is not implemented in this PR.", notImplemented: true }] },
              { id: "backup-recovery", label: "Backup & Recovery", actions: [{ id: "create-backup", label: "Create Backup", status: "SKIP", diagnostic: "Create Backup is not implemented in this PR.", notImplemented: true }] },
              {
                id: "database-operations",
                label: "Database Operations",
                actions: [
                  { id: "validate-current-connection", label: "Validate Current Connection", status: "PASS", diagnostic: "Validate Current Connection checks configured services without changing data." },
                  { id: "database-connectivity-test", label: "Database Connectivity Test", status: "PASS", diagnostic: "Database Connectivity Test checks the configured Local DB without changing data." },
                  { id: "run-migration", label: "Run Migration", status: "SKIP", diagnostic: "Run Migration is not implemented from Admin Operations; use reviewed server-side migration scripts.", confirmationRequired: true, notImplemented: true, risky: true },
                ],
              },
            ],
            currentEnvironment: "IST",
            message: "Admin Operations loaded.",
            status: "PASS",
          },
          ok: true,
        }),
      });
    });

    await page.goto(`${server.baseUrl}/admin/operations.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-admin-operations-environment]")).toContainText("IST");
    await expect(page.locator("[data-admin-operation-group='database-operations'] button")).toHaveText([
      "Validate Current Connection",
      "Database Connectivity Test",
      "Run Migration",
    ]);
    await expect(page.locator("[data-admin-operation-action='reseed-dev']")).toHaveCount(0);
    await expect(page.locator("[data-admin-operation-safety-rows]")).not.toContainText("Reseed DEV");
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
  } finally {
    await server.close();
  }
});

test("Admin Operations blocks signed-in non-admin users", async ({ page }) => {
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
            ownerMenuItems: [],
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

    await page.goto(`${server.baseUrl}/admin/operations.html`, { waitUntil: "networkidle" });
    await expect(page.locator("main[data-session-access-blocked='admin']")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Admin role required" })).toBeVisible();
    await expect(page.locator("[data-session-access-status]")).toContainText("Current session: User 1");
    await expect(page.locator("[data-admin-operations]")).toHaveCount(0);
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
