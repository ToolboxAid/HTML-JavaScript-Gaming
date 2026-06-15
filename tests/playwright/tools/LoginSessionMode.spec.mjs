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

const DEV_ONLY_ADMIN_LABELS = [
  "DB Viewer",
  "Design System",
  "Grouping Colors",
  "Notes",
];

const UAT_PROD_ADMIN_LABELS = [
  "Analytics",
  "Branding",
  "Controls",
  "Environments",
  "Game Migration",
  "Moderation",
  "Platform Settings",
  "Ratings",
  "Roles",
  "Site Settings",
  "Site Setup",
  "Themes",
  "Tool Votes",
  "Users",
];

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
    await fetch(`${server.baseUrl}/api/local-db/clear`, { method: "POST" });
  }
  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: options.sessionModeId || "local-db" }),
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
  const previousLocalDbStoragePath = process.env.GAMEFOUNDRY_LOCAL_DB_PATH;
  const localDbStoragePath = nextLocalDbStoragePath();
  process.env.GAMEFOUNDRY_LOCAL_DB_PATH = localDbStoragePath;
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

  await fetch(`${server.baseUrl}/api/local-db/seed`, { method: "POST" });
  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: "local-db" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey: MOCK_DB_KEYS.users.admin }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${fixedBaseUrl}/account/sign-in.html`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, localDbStoragePath, pageErrors, previousLocalDbStoragePath, server };
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
  await fs.rm(failures.localDbStoragePath, { force: true });
  if (failures.previousLocalDbStoragePath) {
    process.env.GAMEFOUNDRY_LOCAL_DB_PATH = failures.previousLocalDbStoragePath;
  } else {
    delete process.env.GAMEFOUNDRY_LOCAL_DB_PATH;
  }
}

async function expectLocalAdminMyStuffMenu(page) {
  const adminSubmenu = page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin']) > .sub-menu");
  const myStuffMenu = adminSubmenu.locator(":scope > [data-admin-my-stuff-menu]");
  const separator = adminSubmenu.locator(":scope > [data-admin-my-stuff-separator]");
  await expect(myStuffMenu).toBeVisible();
  await expect(separator).toBeVisible();
  await expect(separator).toHaveAttribute("role", "separator");
  await expect(separator).toHaveAttribute("aria-disabled", "true");
  const firstAdminChildren = await adminSubmenu.evaluate((menu) => {
    return Array.from(menu.children).slice(0, 2).map((child) => {
      if (child.matches("[data-admin-my-stuff-menu]")) return "my-stuff";
      if (child.matches("[data-admin-my-stuff-separator]")) return "separator";
      return child.textContent?.trim() || "";
    });
  });
  expect(firstAdminChildren).toEqual(["my-stuff", "separator"]);
  const separatorFillsWidth = await separator.evaluate((node) => {
    const parent = node.parentElement;
    if (!parent) return false;
    const separatorBox = node.getBoundingClientRect();
    const parentBox = parent.getBoundingClientRect();
    return separatorBox.width >= parentBox.width * 0.85;
  });
  expect(separatorFillsWidth).toBe(true);

  const mainAdminLabels = await adminSubmenu.evaluate((menu) => {
    return Array.from(menu.children)
      .filter((child) => child.matches("a[data-nav-link]"))
      .map((child) => child.textContent?.trim() || "");
  });
  expect(mainAdminLabels).toEqual(UAT_PROD_ADMIN_LABELS);

  await expect(adminSubmenu.locator("[data-admin-my-stuff-label]")).toContainText("My Stuff");
  await myStuffMenu.hover();
  const myStuffSubmenu = myStuffMenu.locator("[data-admin-my-stuff-submenu]");
  await expect(myStuffSubmenu).toBeVisible();
  await expect(myStuffSubmenu.locator("a")).toHaveText(DEV_ONLY_ADMIN_LABELS);
  await expect(page.locator("nav.nav-links a[data-admin-notes-local-menu]")).toHaveText("Notes");
  await expect(page.locator("nav.nav-links a[data-admin-notes-local-menu]")).toBeVisible();
  await expect(page.locator("nav.nav-links a[data-admin-notes-local-menu]")).toHaveAttribute(
    "href",
    /\/admin\/admin-notes\.html$/,
  );
}

async function mockDbSessionSnapshot(page) {
  return page.evaluate(async () => {
    const [session, db] = await Promise.all([
      fetch("/api/session/current").then((response) => response.json()),
      fetch("/api/local-db/snapshot").then((response) => response.json()),
    ]);
    return {
      mode: { id: session.data.mode },
      persistence: session.data.persistence,
      sessionUser: session.data,
      userNames: (db.data.tables.users || []).map((user) => user.displayName),
    };
  });
}

test("Sign-in page uses a production-safe account form without public Local DB controls", async ({ page }) => {
  const failures = await openRepoPage(page, "/account/sign-in.html");

  try {
    await expect(page.getByRole("heading", { name: "Sign In", level: 1 })).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.getByLabel("Email or username")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create Account" })).toHaveAttribute("href", /create-account\.html$/);
    await expect(page.getByRole("link", { name: "Lost Password" })).toHaveAttribute("href", /lost-password\.html$/);
    await expect(page.getByRole("link", { name: "Continue Browsing" })).toBeVisible();
    await expect(page.locator("aside[aria-label='Session mode']")).toHaveCount(0);
    await expect(page.locator("[aria-labelledby='login-local-status-title']")).toHaveCount(0);
    await expect(page.locator("[data-login-local-status]")).toHaveCount(0);
    await expect(page.locator("[data-login-mode]")).toHaveCount(0);
    await expect(page.locator("[data-login-mode='local-mem']")).toHaveCount(0);
    await expect(page.locator("[data-login-user]")).toHaveCount(0);
    await expect(page.locator("[data-login-user-controls]")).toHaveCount(0);
    await expect(page.locator("[data-admin-setup-reseed]")).toHaveCount(0);
    await expect(page.locator("[data-admin-setup-status]")).toHaveCount(0);
    await expect(page.locator("[data-login-reseed-active-mode]")).toHaveCount(0);
    await expect(page.locator("[data-login-reseed-target]")).toHaveCount(0);
    await expect(page.locator("[data-login-reseed-status]")).toHaveCount(0);
    await expect(page.locator("[data-login-reseed-start]")).toHaveCount(0);
    await expect(page.locator("[data-login-reseed-confirm]")).toHaveCount(0);
    await expect(page.locator("[data-login-reseed-cancel]")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Guest" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "User 1" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "User 2" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "User 3" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "DavidQ admin" })).toHaveCount(0);
    await expect(page.locator("a[href='/login.html'], a[href='login.html']")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText("fake");
    await expect(page.locator("main")).not.toContainText("local-mem");
    await expect(page.locator("main")).not.toContainText("reseed");
    await expect(page.locator("main")).not.toContainText("Session mode");
    const authContract = await page.evaluate(() => {
      const provider = window.GameFoundryAuthProvider;
      return {
        canRequireUser: provider.requireRole("user").allowed,
        hasGetCurrentUser: typeof provider.getCurrentUser === "function",
        hasRequireRole: typeof provider.requireRole === "function",
        hasSignIn: typeof provider.signIn === "function",
        hasSignOut: typeof provider.signOut === "function",
        operations: provider.operations,
        providerId: provider.providerId,
      };
    });
    expect(authContract).toEqual({
      canRequireUser: false,
      hasGetCurrentUser: true,
      hasRequireRole: true,
      hasSignIn: true,
      hasSignOut: true,
      operations: ["getCurrentUser", "signIn", "signOut", "requireRole"],
      providerId: "server-session-api",
    });
    await expect(page.getByRole("button", { name: "DEV" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "UAT" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Prod" })).toHaveCount(0);
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Sign In");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='account']) > .sub-menu")).toBeHidden();

    const snapshot = await mockDbSessionSnapshot(page);
    expect(snapshot.mode.id).toBe("local-db");
    expect(snapshot.persistence).toBe("Local DB");
    expect(snapshot.sessionUser.id).toBe("guest");
    expect(snapshot.userNames.sort()).toEqual(["DavidQ admin", "User 1", "User 2", "User 3"].sort());
    expect(snapshot.userNames).not.toContain("Guest");

    await page.getByLabel("Email or username").fill("user@example.invalid");
    await page.getByLabel("Password").fill("not-stored");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.locator("[data-login-status]")).toHaveText("Account features are being connected to the production authentication provider.");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Sign In");

    await page.getByRole("link", { name: "Create Account" }).click();
    await expect(page).toHaveURL(/\/account\/create-account\.html$/);
    await expect(page.getByRole("heading", { name: "Create Account", level: 1 })).toBeVisible();
    await page.goto(`${failures.server.baseUrl}/account/sign-in.html`, { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Lost Password" }).click();
    await expect(page).toHaveURL(/\/account\/lost-password\.html$/);
    await expect(page.getByRole("heading", { name: "Lost Password", level: 1 })).toBeVisible();

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
    await expect(page.locator("[data-session-access-status]")).toContainText("Current session: Sign In.");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Sign In");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toHaveCount(0);
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
    await expect(page.locator("[data-session-access-status]")).toContainText("Current session: Sign In.");
    await expect(page.locator("[data-session-access-status]")).toContainText("Sign-in/session diagnostic: Selected Local user key");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Sign In");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toHaveCount(0);
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
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("DavidQ admin");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeVisible();
    await expect(page.locator("[data-admin-db-clear]")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("DavidQ admin");
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
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toHaveCount(0);
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }

  failures = await openRepoPage(page, "/account/profile.html", {
    sessionUserKey: "",
  });

  try {
    await expect(page.locator("[data-session-access-blocked='user']")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sign-in required", level: 1 })).toBeVisible();
    await expect(page.locator("[data-session-access-status]")).toContainText("Current session: Sign In.");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Sign In");
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Admin Site Setup reseed uses the admin-owned server setup API", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/site-setup.html", {
    sessionUserKey: MOCK_DB_KEYS.users.admin,
  });

  try {
    await expect(page.locator("[data-admin-setup-status]").first()).toHaveText("SKIP: No setup action has been run.");
    await page.locator("[data-admin-setup-reseed]").click();
    await expect(page.locator("[data-admin-setup-status]").first()).toHaveText("PASS: Local DB reseed completed through Admin setup.");
    await expect(page.locator("[data-login-reseed-start]")).toHaveCount(0);
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Admin Site Setup status reads server-owned setup diagnostics", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/site-setup.html", {
    sessionUserKey: MOCK_DB_KEYS.users.admin,
  });

  try {
    await page.locator("[data-admin-setup-refresh]").click();
    await expect(page.locator("[data-admin-setup-status]").first()).toHaveText("WARN: Site Setup status checked 5 setup areas.");
    await expect(page.locator("[data-admin-setup-status-rows] tr")).toHaveCount(5);
    await expect(page.locator("[data-admin-setup-status-rows]")).toContainText("First Admin");
    await expect(page.locator("[data-admin-setup-status-rows]")).toContainText("Tool Metadata Bootstrap");
    await expect(page.locator("[data-admin-setup-status-rows]")).toContainText("PASS");
    await expect(page.locator("[data-admin-setup-status-rows]")).toContainText("WARN");
    await expect(page.locator("[data-admin-setup-status-rows]")).toContainText("SKIP");
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Admin Site Setup reseed shows a visible failure when the setup API fails", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/site-setup.html", {
    sessionUserKey: MOCK_DB_KEYS.users.admin,
  });

  try {
    await page.route("**/api/admin/setup/reseed", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          error: "Forced admin reseed failure for validation.",
          ok: false,
        }),
        contentType: "application/json",
        status: 200,
      });
    });
    await page.locator("[data-admin-setup-reseed]").click();
    await expect(page.locator("[data-admin-setup-status]").first()).toHaveText("FAIL: Forced admin reseed failure for validation.");
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
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toHaveCount(0);
    await expect(page.locator("[data-admin-my-stuff-menu]")).toHaveCount(0);
    await expect(page.locator("nav.nav-links a[data-admin-notes-local-menu]")).toHaveCount(0);
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
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("DavidQ admin");
    await page.locator("nav.nav-links > .nav-item:has(> a[data-route='account'])").hover();
    await expect(page.locator("[data-account-logout]")).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeVisible();
    await page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])").hover();
    await expectLocalAdminMyStuffMenu(page);
    await page.locator("nav.nav-links a[data-admin-notes-local-menu]").click();
    await expect(page).toHaveURL(/\/admin\/admin-notes\.html$/);
    await expect(page.getByRole("heading", { name: "Admin Notes", level: 1 })).toBeVisible();
    await expect(page.locator("[data-admin-notes-status]")).toContainText("Loaded docs_build/dev/admin-notes/index.txt.");
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Admin and Account Local DB pages render identity data or actionable migration diagnostics", async ({ page }) => {
  const pageChecks = [
    {
      assertions: async () => {
        await expect(page.getByRole("heading", { name: "Users", level: 1 })).toBeVisible();
        await expect(page.locator("[data-local-db-status]")).toHaveText("Loaded 4 Local DB users from users, roles, and user_roles.");
        await expect(page.locator("[data-local-db-table='users']")).toContainText("DavidQ admin");
        await expect(page.locator("[data-local-db-table='users']")).toContainText(MOCK_DB_KEYS.users.admin);
        await expect(page.locator("[data-local-db-audit]").first()).toContainText("Audit PASS");
      },
      path: "/admin/users.html",
      sessionUserKey: MOCK_DB_KEYS.users.admin,
    },
    {
      assertions: async () => {
        await expect(page.getByRole("heading", { name: "Roles", level: 1 })).toBeVisible();
        await expect(page.locator("[data-local-db-status]")).toHaveText("Loaded 2 Local DB roles and 5 user-role assignments.");
        await expect(page.locator("[data-local-db-table='roles']")).toContainText("admin");
        await expect(page.locator("[data-local-db-table='roles']")).toContainText("DavidQ admin");
        await expect(page.locator("[data-local-db-audit]").first()).toContainText("Audit PASS");
      },
      path: "/admin/roles.html",
      sessionUserKey: MOCK_DB_KEYS.users.admin,
    },
    {
      assertions: async () => {
        await expect(page.getByRole("heading", { name: "Site Settings", level: 1 })).toBeVisible();
        await expect(page.locator("[data-local-db-status]")).toHaveText("Local DB identity records loaded. Site Settings runtime table is not configured yet.");
        await expect(page.locator("[data-local-db-follow-up='site_settings']")).toContainText("FOLLOW-UP REQUIRED");
        await expect(page.locator("[data-local-db-follow-up='site_settings']")).toContainText("No site_settings table/schema exists");
      },
      path: "/admin/site-settings.html",
      sessionUserKey: MOCK_DB_KEYS.users.admin,
    },
    {
      assertions: async () => {
        await expect(page.getByRole("heading", { name: "Account Home", level: 1 })).toBeVisible();
        await expect(page.locator("[data-local-db-status]")).toHaveText("Loaded account summary from Local DB users, roles, and user_roles.");
        await expect(page.locator("[data-local-db-table='current-user']")).toContainText("User 1");
        await expect(page.locator("[data-local-db-table='current-user']")).toContainText(MOCK_DB_KEYS.users.user1);
      },
      path: "/account/index.html",
      sessionUserKey: MOCK_DB_KEYS.users.user1,
    },
    {
      assertions: async () => {
        await expect(page.getByRole("heading", { name: "Profile", level: 1 })).toBeVisible();
        await expect(page.locator("[data-local-db-status]")).toHaveText("Loaded profile identity from Local DB users and user_roles.");
        await expect(page.locator("[data-local-db-table='current-user']")).toContainText("user1@example.invalid");
      },
      path: "/account/profile.html",
      sessionUserKey: MOCK_DB_KEYS.users.user1,
    },
    {
      assertions: async () => {
        await expect(page.getByRole("heading", { name: "Preferences", level: 1 })).toBeVisible();
        await expect(page.locator("[data-local-db-status]")).toContainText("Preferences storage requires a future account_preferences table.");
        await expect(page.locator("[data-local-db-follow-up='account_preferences']")).toContainText("FOLLOW-UP REQUIRED");
      },
      path: "/account/preferences.html",
      sessionUserKey: MOCK_DB_KEYS.users.user1,
    },
    {
      assertions: async () => {
        await expect(page.getByRole("heading", { name: "Security", level: 1 })).toBeVisible();
        await expect(page.locator("[data-local-db-status]")).toContainText("Security settings require a future provider-backed account security table.");
        await expect(page.locator("[data-local-db-follow-up='account_security_settings']")).toContainText("FOLLOW-UP REQUIRED");
      },
      path: "/account/security.html",
      sessionUserKey: MOCK_DB_KEYS.users.user1,
    },
  ];

  for (const check of pageChecks) {
    const failures = await openRepoPage(page, check.path, {
      seedStandalone: true,
      sessionUserKey: check.sessionUserKey,
    });

    try {
      await expect(page.locator("[data-session-access-blocked]")).toHaveCount(0);
      await check.assertions();
      await expectNoPageFailures(failures);
    } finally {
      await closeWithCoverage(page, failures);
    }
  }
});

test("API-backed 5501 login page shows the local Admin Notes menu route for Admin", async ({ page }) => {
  const failures = await openFixedLocalApiLoginPage(page);

  try {
    await expect(page).toHaveURL("http://127.0.0.1:5501/account/sign-in.html");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("DavidQ admin");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeVisible();
    await page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])").hover();
    await expectLocalAdminMyStuffMenu(page);
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
    await expect(page.getByRole("heading", { name: "Sign-in required", level: 1 })).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Sign In");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='account']) > .sub-menu")).toBeHidden();
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toHaveCount(0);

    const storedUsers = await page.evaluate(async () => {
      const snapshot = await fetch("/api/local-db/snapshot").then((response) => response.json());
      return (snapshot.data.tables.users || []).map((user) => user.displayName);
    });
    expect(storedUsers).toEqual(expect.arrayContaining(["User 1", "User 2", "User 3", "DavidQ admin"]));
    expect(storedUsers).not.toContain("Guest");
    expect(storedUsers).toHaveLength(4);

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
  const failures = await openRepoPage(page, "/toolbox/game-journey/index.html?game=demo-game", {
    sessionUserKey: "",
  });

  try {
    await expect(page.locator("[data-session-access-blocked]")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Game Journey", level: 1 })).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Sign In");
    await expect(page.locator("[data-journey-diagnostics]")).toContainText("Guest is unauthenticated");
    await expect(page.locator("[data-journey-new-note-name]")).toBeDisabled();
    await expect(page.getByRole("button", { name: "Add Note", exact: true })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Add Item" })).toBeEnabled();

    const snapshot = await mockDbSessionSnapshot(page);
    expect(snapshot.sessionUser.id).toBe("guest");
    expect(snapshot.userNames).not.toContain("Guest");

    await page.getByRole("button", { name: "Add Item" }).click();
    await expect(page).toHaveURL(/\/account\/sign-in\.html$/);

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});
