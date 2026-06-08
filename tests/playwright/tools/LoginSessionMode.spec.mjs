import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { startLocalApiServer } from "../../../src/dev-runtime/server/local-api-server.mjs";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "login-session-mode",
    surface: "Login session mode lockdown"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

let localDbRunId = 0;

function nextLocalDbStoragePath() {
  localDbRunId += 1;
  return path.join(process.cwd(), "tmp", "local-db", `login-session-mode-${process.pid}-${localDbRunId}.sqlite`);
}

async function openRepoPage(page, pathName, options = {}) {
  const previousLocalDbStoragePath = process.env.GAMEFOUNDRY_LOCAL_DB_PATH;
  const localDbStoragePath = options.localDbStoragePath || nextLocalDbStoragePath();
  process.env.GAMEFOUNDRY_LOCAL_DB_PATH = localDbStoragePath;
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

  if (options.clearDb) {
    await fetch(`${server.baseUrl}/api/mock-db/clear`, { method: "POST" });
  }
  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: options.sessionModeId || "local-mem" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  if (options.sessionUserKey !== undefined) {
    await fetch(`${server.baseUrl}/api/session/user`, {
      body: JSON.stringify({ userKey: options.sessionUserKey || "" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
  }

  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, localDbStoragePath, pageErrors, previousLocalDbStoragePath, server };
}

async function openFixedLocalApiLoginPage(page) {
  const fixedBaseUrl = "http://127.0.0.1:5501";
  let server;
  try {
    server = await startLocalApiServer({ host: "127.0.0.1", port: 5501 });
  } catch (error) {
    if (error?.code !== "EADDRINUSE") {
      throw error;
    }
    const response = await fetch(`${fixedBaseUrl}/api/session/current`);
    if (!response.ok) {
      throw error;
    }
    server = {
      baseUrl: fixedBaseUrl,
      close: async () => {},
    };
  }
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

  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: "local-mem" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey: MOCK_DB_KEYS.users.admin }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${fixedBaseUrl}/login.html`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function closeWithCoverage(page, failures) {
  await workspaceV2CoverageReporter.stop(page);
  await failures.server.close();
  await fs.rm(failures.localDbStoragePath, { force: true });
  if (failures.previousLocalDbStoragePath) {
    process.env.GAMEFOUNDRY_LOCAL_DB_PATH = failures.previousLocalDbStoragePath;
  } else {
    delete process.env.GAMEFOUNDRY_LOCAL_DB_PATH;
  }
}

async function closeFixedLocalApiPage(page, failures) {
  await workspaceV2CoverageReporter.stop(page);
  await failures.server.close();
}

async function mockDbSessionSnapshot(page) {
  return page.evaluate(async () => {
    const [session, db] = await Promise.all([
      fetch("/api/session/current").then((response) => response.json()),
      fetch("/api/mock-db/snapshot").then((response) => response.json()),
    ]);
    return {
      mode: { id: session.data.mode },
      persistence: session.data.persistence,
      sessionUser: session.data,
      userNames: (db.data.tables.users || []).map((user) => user.displayName),
    };
  });
}

test("Login page switches Local Mem and Local DB without storing Guest as a user", async ({ page }) => {
  const failures = await openRepoPage(page, "/login.html");

  try {
    await expect(page.getByRole("heading", { name: "Login", level: 1 })).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-login-mode]")).toHaveText(["Local Mem", "Local DB"]);
    await expect(page.locator("[data-login-mode='local-mem']")).toBeEnabled();
    await expect(page.locator("[data-login-mode='local-db']")).toBeEnabled();
    await expect(page.locator("main hr")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Local Development Status", level: 2 })).toBeVisible();
    await expect(page.locator("[data-login-status-current-url]")).toContainText(`${failures.server.baseUrl}/login.html`);
    await expect(page.locator("[data-login-status-server-mode]")).toHaveText("API-backed local server (Local Mem)");
    await expect(page.locator("[data-login-status-api]")).toContainText("Available");
    await expect(page.locator("[data-login-status-api]")).toContainText("/api/session/current");
    await expect(page.locator("[data-login-status-disabled-reason]")).toHaveText("Local Mem and Local DB are enabled because the Local API is available.");
    await expect(page.locator("[data-login-status-endpoint]")).toHaveText("/api/session/current");
    await expect(page.locator("[data-login-status-api-url]")).toHaveText("http://127.0.0.1:5501/login.html");
    await expect(page.locator("[data-login-status-command]")).toHaveText("npm run dev:local-api");
    await expect(page.locator("[data-login-reseed-active-mode]")).toHaveText("Local Mem");
    await expect(page.locator("[data-login-reseed-target]")).toHaveText("Local Mem");
    await expect(page.locator("[data-login-reseed-status]")).toHaveText("Ready to reseed Local Mem only.");
    await expect(page.locator("[data-login-reseed-start]")).toBeEnabled();
    await expect(page.locator("[data-login-reseed-confirm]")).toBeHidden();
    await expect(page.locator("[data-login-reseed-cancel]")).toBeHidden();
    await page.locator("[data-login-reseed-start]").click();
    await expect(page.locator("[data-login-reseed-status]")).toHaveText("Confirm reseed for Local Mem only. The other DB mode will not be reseeded.");
    await expect(page.locator("[data-login-reseed-start]")).toBeDisabled();
    await expect(page.locator("[data-login-reseed-confirm]")).toBeVisible();
    await expect(page.locator("[data-login-reseed-cancel]")).toBeVisible();
    await page.locator("[data-login-reseed-cancel]").click();
    await expect(page.locator("[data-login-reseed-status]")).toHaveText("Reseed canceled for Local Mem.");
    await expect(page.locator("[data-login-reseed-start]")).toBeEnabled();
    await page.locator("[data-login-reseed-start]").click();
    await page.locator("[data-login-reseed-confirm]").click();
    await expect(page.locator("[data-login-reseed-status]")).toHaveText("Reseed complete for Local Mem. Only Local Mem was reseeded.");
    await expect(page.locator("[data-login-reseed-start]")).toBeEnabled();
    await expect(page.getByRole("button", { name: "DEV" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "UAT" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Prod" })).toHaveCount(0);
    await expect(page.locator("[data-login-mode='local-mem']")).toHaveClass(/primary/);
    await expect(page.locator("[data-login-mode-title]")).toHaveText("Local Mem");
    await expect(page.locator("[data-login-mode-description]")).toHaveText("Uses MockDbAdapter backed by in-memory lists.");
    await expect(page.locator("[data-login-mode-status]")).toContainText("Environment: Local Mem");
    await expect(page.locator("[data-login-mode-status]")).toContainText("Persistence: Memory");
    await expect(page.locator("[data-login-user]")).toHaveText(["Guest", "User 1", "User 2", "User 3", "Admin"]);
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Login");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='account']) > .sub-menu")).toBeHidden();

    let snapshot = await mockDbSessionSnapshot(page);
    expect(snapshot.mode.id).toBe("local-mem");
    expect(snapshot.persistence).toBe("Memory");
    expect(snapshot.userNames).toEqual(["User 1", "User 2", "User 3", "Admin", "forge-bot"]);
    expect(snapshot.userNames).not.toContain("Guest");

    await page.locator("[data-login-mode='local-db']").click();
    await expect(page.locator("[data-login-mode='local-mem']")).toBeEnabled();
    await expect(page.locator("[data-login-mode='local-db']")).toBeEnabled();
    await expect(page.locator("[data-login-mode='local-db']")).toHaveClass(/primary/);
    await expect(page.locator("[data-login-mode-title]")).toHaveText("Local DB");
    await expect(page.locator("[data-login-mode-description]")).toHaveText("Uses LocalDbAdapter backed by server SQLite storage.");
    await expect(page.locator("[data-login-mode-status]")).toContainText("Environment: Local DB");
    await expect(page.locator("[data-login-mode-status]")).toContainText("Persistence: Local DB");
    await expect(page.locator("[data-login-mode-status]")).not.toContainText("Local DB adapter not configured");
    await expect(page.locator("[data-login-status-server-mode]")).toHaveText("API-backed local server (Local DB)");
    await expect(page.locator("[data-login-status-api]")).toContainText("Available");
    await expect(page.locator("[data-login-reseed-active-mode]")).toHaveText("Local DB");
    await expect(page.locator("[data-login-reseed-target]")).toHaveText("Local DB");
    await expect(page.locator("[data-login-reseed-status]")).toHaveText("Ready to reseed Local DB only.");
    await page.locator("[data-login-reseed-start]").click();
    await expect(page.locator("[data-login-reseed-status]")).toHaveText("Confirm reseed for Local DB only. The other DB mode will not be reseeded.");
    await page.locator("[data-login-reseed-confirm]").click();
    await expect(page.locator("[data-login-reseed-status]")).toHaveText("Reseed complete for Local DB. Only Local DB was reseeded.");
    await expect(page.locator("[data-login-user]")).toHaveText(["Guest", "User 1", "User 2", "User 3", "Admin"]);
    await expect(page.locator("[data-login-user-controls]")).toBeVisible();
    await expect(page.locator("[data-login-user-status]")).toHaveText("Guest is unauthenticated and is not stored in the users table.");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Login");

    let localDbSnapshot = await mockDbSessionSnapshot(page);
    expect(localDbSnapshot.mode.id).toBe("local-db");
    expect(localDbSnapshot.persistence).toBe("Local DB");
    expect(localDbSnapshot.sessionUser.id).toBe("guest");
    expect(localDbSnapshot.userNames).toEqual(expect.arrayContaining(["User 1", "User 2", "User 3", "Admin", "forge-bot"]));
    expect(localDbSnapshot.userNames).not.toContain("Guest");

    await page.locator(`[data-login-user='${MOCK_DB_KEYS.users.user2}']`).click();
    await expect(page.locator(`[data-login-user='${MOCK_DB_KEYS.users.user2}']`)).toHaveClass(/primary/);
    await expect(page.locator("[data-login-user-status]")).toHaveText("Selected local user: User 2.");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("User 2");
    localDbSnapshot = await mockDbSessionSnapshot(page);
    expect(localDbSnapshot.mode.id).toBe("local-db");
    expect(localDbSnapshot.persistence).toBe("Local DB");
    expect(localDbSnapshot.sessionUser.id).toBe(MOCK_DB_KEYS.users.user2);

    await page.locator("[data-login-mode='local-mem']").click();
    await expect(page.locator("[data-login-user]")).toHaveText(["Guest", "User 1", "User 2", "User 3", "Admin"]);
    await page.locator(`[data-login-user='${MOCK_DB_KEYS.users.user1}']`).click();
    await expect(page.locator(`[data-login-user='${MOCK_DB_KEYS.users.user1}']`)).toHaveClass(/primary/);
    await expect(page.locator("[data-login-user-status]")).toHaveText("Selected local user: User 1.");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("User 1");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='account']) > .sub-menu")).not.toHaveAttribute("hidden", "");
    await page.locator("nav.nav-links > .nav-item:has(> a[data-route='account'])").hover();
    await expect(page.locator("[data-account-logout]")).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeHidden();

    await page.getByRole("button", { name: "Guest" }).click();
    await expect(page.getByRole("button", { name: "Guest" })).toHaveClass(/primary/);
    await expect(page.locator("[data-login-user-status]")).toHaveText("Guest is unauthenticated and is not stored in the users table.");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Login");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Protected pages block direct URL access without the required Local session role", async ({ page }) => {
  let failures = await openRepoPage(page, "/admin/site-settings.html", {
    sessionUserKey: "",
  });

  try {
    await expect(page.locator("[data-session-access-blocked='admin']")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Admin role required", level: 1 })).toBeVisible();
    await expect(page.locator("[data-session-access-status]")).toContainText("Current session: Login.");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Login");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeHidden();
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }

  failures = await openRepoPage(page, "/admin/site-settings.html", {
    clearDb: true,
    sessionUserKey: MOCK_DB_KEYS.users.admin,
  });

  try {
    await expect(page.locator("[data-session-access-blocked='admin']")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Admin role required", level: 1 })).toBeVisible();
    await expect(page.locator("[data-session-access-status]")).toContainText("Current session: Login.");
    await expect(page.locator("[data-session-access-status]")).toContainText("Login/session diagnostic: Selected Local user key");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Login");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeHidden();
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }

  failures = await openRepoPage(page, "/admin/db-viewer.html", {
    seedStandalone: true,
    sessionModeId: "local-db",
    sessionUserKey: MOCK_DB_KEYS.users.admin,
  });

  try {
    await expect(page.locator("[data-session-access-blocked]")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Local DB", level: 1 })).toBeVisible();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/Local DB loaded \d+ tables and \d+ records for All\./);
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("Admin");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeVisible();
    await expect(page.locator("[data-admin-db-clear]")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("Admin");
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }

  failures = await openRepoPage(page, "/admin/site-settings.html", {
    seedStandalone: true,
    sessionUserKey: MOCK_DB_KEYS.users.user1,
  });

  try {
    await expect(page.locator("[data-session-access-blocked='admin']")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Admin role required", level: 1 })).toBeVisible();
    await expect(page.locator("[data-session-access-status]")).toContainText("Current session: User 1.");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("User 1");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeHidden();
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }

  failures = await openRepoPage(page, "/account/profile.html", {
    sessionUserKey: "",
  });

  try {
    await expect(page.locator("[data-session-access-blocked='user']")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Login required", level: 1 })).toBeVisible();
    await expect(page.locator("[data-session-access-status]")).toContainText("Current session: Login.");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Login");
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Login reseed shows a visible failure when the seed API fails", async ({ page }) => {
  const failures = await openRepoPage(page, "/login.html");

  try {
    await page.route("**/api/mock-db/seed", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          error: "Forced reseed failure for validation.",
          ok: false,
        }),
        contentType: "application/json",
        status: 200,
      });
    });
    await page.locator("[data-login-reseed-start]").click();
    await page.locator("[data-login-reseed-confirm]").click();
    await expect(page.locator("[data-login-reseed-status]")).toHaveText("Reseed failed for Local Mem: Forced reseed failure for validation.");
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Local users unlock their allowed Account and Admin pages", async ({ page }) => {
  let failures = await openRepoPage(page, "/account/profile.html", {
    seedStandalone: true,
    sessionUserKey: MOCK_DB_KEYS.users.user1,
  });

  try {
    await expect(page.locator("[data-session-access-blocked]")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Profile", level: 1 })).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("User 1");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='account']) > .sub-menu")).not.toHaveAttribute("hidden", "");
    await page.locator("nav.nav-links > .nav-item:has(> a[data-route='account'])").hover();
    await expect(page.locator("[data-account-logout]")).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeHidden();
    await expect(page.locator("[data-admin-my-stuff-menu]")).toBeHidden();
    await expect(page.locator("nav.nav-links a[data-admin-notes-local-menu]")).toBeHidden();
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }

  failures = await openRepoPage(page, "/admin/site-settings.html", {
    seedStandalone: true,
    sessionUserKey: MOCK_DB_KEYS.users.admin,
  });

  try {
    await expect(page.locator("[data-session-access-blocked]")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Site Settings", level: 1 })).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("Admin");
    await page.locator("nav.nav-links > .nav-item:has(> a[data-route='account'])").hover();
    await expect(page.locator("[data-account-logout]")).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeVisible();
    await page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])").hover();
    const adminSubmenu = page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin']) > .sub-menu");
    await expect(adminSubmenu.locator(":scope > [data-admin-my-stuff-menu]")).toBeVisible();
    await expect(adminSubmenu.locator(":scope > [data-admin-my-stuff-separator]")).toBeVisible();
    const firstAdminChildren = await adminSubmenu.evaluate((menu) => {
      return Array.from(menu.children).slice(0, 2).map((child) => {
        if (child.matches("[data-admin-my-stuff-menu]")) return "my-stuff";
        if (child.matches("[data-admin-my-stuff-separator]")) return "separator";
        return child.textContent?.trim() || "";
      });
    });
    expect(firstAdminChildren).toEqual(["my-stuff", "separator"]);
    await expect(adminSubmenu.locator("[data-admin-my-stuff-label]")).toContainText("My Stuff");
    await adminSubmenu.locator("[data-admin-my-stuff-menu]").hover();
    await expect(page.locator("nav.nav-links a[data-admin-notes-local-menu]")).toHaveText("Notes");
    await expect(page.locator("nav.nav-links a[data-admin-notes-local-menu]")).toBeVisible();
    await expect(page.locator("nav.nav-links a[data-admin-notes-local-menu]")).toHaveAttribute(
      "href",
      /\/admin\/admin-notes\.html$/,
    );
    await page.locator("nav.nav-links a[data-admin-notes-local-menu]").click();
    await expect(page).toHaveURL(/\/admin\/admin-notes\.html$/);
    await expect(page.getByRole("heading", { name: "Admin Notes", level: 1 })).toBeVisible();
    await expect(page.locator("[data-admin-notes-status]")).toContainText("Loaded docs_build/dev/admin-notes/index.txt.");
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("API-backed 5501 login page shows the local Admin Notes menu route for Admin", async ({ page }) => {
  const failures = await openFixedLocalApiLoginPage(page);

  try {
    await expect(page).toHaveURL("http://127.0.0.1:5501/login.html");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("Admin");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeVisible();
    await page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])").hover();
    const adminSubmenu = page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin']) > .sub-menu");
    await expect(adminSubmenu.locator(":scope > [data-admin-my-stuff-menu]")).toBeVisible();
    await expect(adminSubmenu.locator(":scope > [data-admin-my-stuff-separator]")).toBeVisible();
    await adminSubmenu.locator("[data-admin-my-stuff-menu]").hover();
    await expect(page.locator("nav.nav-links a[data-admin-notes-local-menu]")).toHaveText("Notes");
    await expect(page.locator("nav.nav-links a[data-admin-notes-local-menu]")).toBeVisible();
    await expect(page.locator("nav.nav-links a[data-admin-notes-local-menu]")).toHaveAttribute(
      "href",
      "/admin/admin-notes.html",
    );
    await page.locator("nav.nav-links a[data-admin-notes-local-menu]").click();
    await expect(page).toHaveURL("http://127.0.0.1:5501/admin/admin-notes.html");
    await expect(page.getByRole("heading", { name: "Admin Notes", level: 1 })).toBeVisible();
    await expect(page.locator("[data-admin-notes-status]")).toContainText("Loaded docs_build/dev/admin-notes/index.txt.");
    await expectNoPageFailures(failures);
  } finally {
    await closeFixedLocalApiPage(page, failures);
  }
});

test("Account logout clears only the current session and blocks protected pages", async ({ page }) => {
  const failures = await openRepoPage(page, "/account/profile.html", {
    seedStandalone: true,
    sessionUserKey: MOCK_DB_KEYS.users.user1,
  });

  try {
    await expect(page.locator("[data-session-access-blocked]")).toHaveCount(0);
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("User 1");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='account']) > .sub-menu")).not.toHaveAttribute("hidden", "");
    await page.locator("nav.nav-links > .nav-item:has(> a[data-route='account'])").hover();
    await page.locator("[data-account-logout]").click();
    await expect(page.locator("[data-session-access-blocked='user']")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Login required", level: 1 })).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Login");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='account']) > .sub-menu")).toBeHidden();
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeHidden();

    const storedUsers = await page.evaluate(async () => {
      const snapshot = await fetch("/api/mock-db/snapshot").then((response) => response.json());
      return (snapshot.data.tables.users || []).map((user) => user.displayName);
    });
    expect(storedUsers).toEqual(["User 1", "User 2", "User 3", "Admin", "forge-bot"]);

    const directPage = await page.context().newPage();
    try {
      await directPage.goto(`${failures.server.baseUrl}/account/profile.html`, { waitUntil: "networkidle" });
      await expect(directPage.locator("[data-session-access-blocked='user']")).toBeVisible();
      await directPage.goto(`${failures.server.baseUrl}/admin/site-settings.html`, { waitUntil: "networkidle" });
      await expect(directPage.locator("[data-session-access-blocked='admin']")).toBeVisible();
    } finally {
      await directPage.close();
    }

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Guest can explore allowed Toolbox pages without persistence access", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/project-journey/index.html?project=demo-project", {
    sessionUserKey: "",
  });

  try {
    await expect(page.locator("[data-session-access-blocked]")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Project Journey", level: 1 })).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Login");
    await expect(page.locator("[data-journey-diagnostics]")).toContainText("Guest is unauthenticated");
    await expect(page.locator("[data-journey-new-note-name]")).toBeDisabled();
    await expect(page.getByRole("button", { name: "Add Note", exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Add Item" })).toBeDisabled();

    const snapshot = await mockDbSessionSnapshot(page);
    expect(snapshot.sessionUser.id).toBe("guest");
    expect(snapshot.userNames).not.toContain("Guest");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});
