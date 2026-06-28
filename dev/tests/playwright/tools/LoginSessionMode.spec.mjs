import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../../api/persistence/mock-db-store.js";
import { startLocalApiServer } from "../../../../api/server/local-api-server.mjs";
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
  "Responsibilities",
  "Site Settings",
  "Site Setup",
  "Themes",
  "Tool Votes",
  "Creators",
];

function nextLocalDbStoragePath() {
  localDbRunId += 1;
  return path.join(process.cwd(), "dev", "workspace", "tmp", "local-db", `login-session-mode-${process.pid}-${localDbRunId}.local-db-state`);
}

async function withSupabaseEnv(nextEnv, callback) {
  const previousEnv = {};
  Object.keys(nextEnv).forEach((key) => {
    previousEnv[key] = process.env[key];
    if (nextEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = nextEnv[key];
    }
  });
  try {
    return await callback();
  } finally {
    Object.entries(previousEnv).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  }
}

async function startFakeSupabaseAuthServer(options = {}) {
  const calls = [];
  const identityTables = {
    roles: [...(options.identityTables?.roles || [])],
    user_roles: [...(options.identityTables?.user_roles || [])],
    users: [...(options.identityTables?.users || [])],
  };
  const authUserIdForEmail = (email) => {
    const normalizedEmail = String(email || "creator@example.test").trim();
    if (options.userIdByEmail?.[normalizedEmail]) {
      return options.userIdByEmail[normalizedEmail];
    }
    if (options.authUserId) {
      return options.authUserId;
    }
    if (normalizedEmail === "user1@example.invalid") {
      return "supabase-user-1";
    }
    return `supabase-${normalizedEmail.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  };
  const server = http.createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString("utf8");
    const body = rawBody ? JSON.parse(rawBody) : {};
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
    calls.push({
      body,
      headers: request.headers,
      method: request.method,
      path: `${requestUrl.pathname}${requestUrl.search}`,
    });
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    if (requestUrl.pathname.startsWith("/rest/v1/")) {
      const tableName = decodeURIComponent(requestUrl.pathname.split("/").pop() || "");
      if (request.method === "POST") {
        const rows = Array.isArray(body) ? body : [body];
        identityTables[tableName] = identityTables[tableName] || [];
        rows.forEach((row) => {
          const index = identityTables[tableName].findIndex((existing) => existing.key === row.key);
          if (index >= 0) {
            identityTables[tableName][index] = {
              ...identityTables[tableName][index],
              ...row,
            };
          } else {
            identityTables[tableName].push(row);
          }
        });
        response.end(JSON.stringify(rows));
        return;
      }
      response.end(JSON.stringify(identityTables[tableName] || []));
      return;
    }
    if (requestUrl.pathname === "/auth/v1/health") {
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }
    if (requestUrl.pathname === "/auth/v1/recover") {
      if (options.failPasswordReset) {
        response.statusCode = options.failPasswordReset.status || 500;
        response.end(JSON.stringify(options.failPasswordReset.payload || { message: "Password reset failed" }));
        return;
      }
      response.end(JSON.stringify({ ok: true }));
      return;
    }
    if (requestUrl.pathname === "/auth/v1/admin/users") {
      if (options.failAdminCreateAccount) {
        response.statusCode = options.failAdminCreateAccount.status || 500;
        response.end(JSON.stringify(options.failAdminCreateAccount.payload || { message: "Create account failed" }));
        return;
      }
      if (options.adminCreateAccountPayload) {
        response.end(JSON.stringify(options.adminCreateAccountPayload));
        return;
      }
    }
    response.end(JSON.stringify({
      access_token: "browser-test-access-token",
      refresh_token: "browser-test-refresh-token",
      user: {
        email: body.email || "creator@example.test",
        id: authUserIdForEmail(body.email),
      },
    }));
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Unable to start fake Supabase Auth server.");
  }
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    calls,
    close: async () => {
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

function fakeSupabaseIdentityTables() {
  const timestamp = "2026-06-15T00:00:00.000Z";
  const audit = {
    createdAt: timestamp,
    createdBy: MOCK_DB_KEYS.users.admin,
    updatedAt: timestamp,
    updatedBy: MOCK_DB_KEYS.users.admin,
  };
  return {
    roles: [
      {
        key: MOCK_DB_KEYS.roles.creator,
        roleSlug: "creator",
        name: "Creator",
        isActive: true,
        ...audit,
      },
    ],
    user_roles: [
      {
        key: MOCK_DB_KEYS.userRoles.user1User,
        userKey: MOCK_DB_KEYS.users.user1,
        roleKey: MOCK_DB_KEYS.roles.creator,
        ...audit,
      },
    ],
    users: [
      {
        key: MOCK_DB_KEYS.users.user1,
        displayName: "User 1",
        email: "user1@example.invalid",
        authProvider: "supabase-auth",
        authProviderUserId: "supabase-user-1",
        isActive: true,
        ...audit,
      },
    ],
  };
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
  const previousAuthProvider = process.env.GAMEFOUNDRY_AUTH_PROVIDER;
  const previousDatabaseProvider = process.env.GAMEFOUNDRY_DB_PROVIDER;
  const previousLocalDbStoragePath = process.env.GAMEFOUNDRY_LOCAL_DB_PATH;
  const localDbStoragePath = nextLocalDbStoragePath();
  process.env.GAMEFOUNDRY_AUTH_PROVIDER = "local-db";
  process.env.GAMEFOUNDRY_DB_PROVIDER = "local-db";
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
  return {
    consoleErrors,
    failedRequests,
    localDbStoragePath,
    pageErrors,
    previousAuthProvider,
    previousDatabaseProvider,
    previousLocalDbStoragePath,
    server,
  };
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
  if (failures.previousAuthProvider) {
    process.env.GAMEFOUNDRY_AUTH_PROVIDER = failures.previousAuthProvider;
  } else {
    delete process.env.GAMEFOUNDRY_AUTH_PROVIDER;
  }
  if (failures.previousDatabaseProvider) {
    process.env.GAMEFOUNDRY_DB_PROVIDER = failures.previousDatabaseProvider;
  } else {
    delete process.env.GAMEFOUNDRY_DB_PROVIDER;
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

async function expectOwnerMenu(page) {
  const ownerMenu = page.locator("nav.nav-links > .nav-item[data-owner-menu]");
  const ownerSubmenu = ownerMenu.locator(":scope > .sub-menu");
  const adminSubmenu = page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin']) > .sub-menu");
  await expect(ownerMenu.locator(":scope > a[data-route='owner']")).toContainText("Owner");
  await expect(ownerSubmenu).toBeVisible();

  const mainAdminLabels = await adminSubmenu.evaluate((menu) => {
    return Array.from(menu.children)
      .filter((child) => child.matches("a[data-nav-link]"))
      .map((child) => child.textContent?.trim() || "");
  });
  expect(mainAdminLabels).toEqual(UAT_PROD_ADMIN_LABELS);
  await expect(adminSubmenu.locator("[data-owner-menu], [data-admin-my-stuff-menu], [data-admin-notes-local-menu]")).toHaveCount(0);

  await ownerMenu.hover();
  await expect(ownerSubmenu.locator("a")).toHaveText(DEV_ONLY_ADMIN_LABELS);
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
      userNames: (db.data?.tables?.users || []).map((user) => user.displayName),
    };
  });
}

test("Sign-in page uses a production-safe account form without public Local DB controls", async ({ page }) => {
  const failures = await openRepoPage(page, "/account/sign-in.html");

  try {
    await expect(page.getByRole("heading", { name: "Sign In", level: 1 })).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create Account" })).toHaveAttribute("href", /create-account\.html$/);
    await expect(page.getByRole("link", { name: "Password Reset" })).toHaveAttribute("href", /password-reset\.html$/);
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
    await expect(page.getByRole("button", { name: "DavidQ" })).toHaveCount(0);
    await expect(page.locator("a[href='/login.html'], a[href='login.html']")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText("fake");
    await expect(page.locator("main")).not.toContainText("local-mem");
    await expect(page.locator("main")).not.toContainText("reseed");
    await expect(page.locator("main")).not.toContainText("Session mode");
    const hasBrowserAuthProvider = await page.evaluate(() =>
      Object.prototype.hasOwnProperty.call(window, "GameFoundryAuthProvider")
    );
    expect(hasBrowserAuthProvider).toBe(false);
    await expect(page.getByRole("button", { name: "DEV" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "UAT" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Prod" })).toHaveCount(0);
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Sign In");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='account']) > .sub-menu")).toBeHidden();

    const session = await page.evaluate(async () => fetch("/api/session/current").then((response) => response.json()));
    expect(session.data.authenticated).toBe(false);
    expect(session.data.id).toBe("guest");

    await page.getByLabel("Email").fill("user@example.invalid");
    await page.getByLabel("Password").fill("not-stored");
    await expect(page.getByRole("button", { name: "Sign In" })).toBeDisabled();
    await expect(page.locator("[data-login-status]")).toHaveText("Sign In is not available in this preview. You can continue browsing.");
    await expect(page.locator("main")).not.toContainText("The site is currently unavailable. Please try again later.");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Sign In");

    await page.getByRole("link", { name: "Create Account" }).click();
    await expect(page).toHaveURL(/\/account\/create-account\.html$/);
    await expect(page.getByRole("heading", { name: "Create Account", level: 1 })).toBeVisible();
    await expect(page.locator("[data-account-auth-status]")).toHaveText("Create Account is not available in this preview. Please try again later.");
    await expect(page.locator("main")).toContainText("account service");
    await expect(page.locator("main")).not.toContainText("The site is currently unavailable. Please try again later.");
    await expect(page.locator("main")).not.toContainText("configured account provider");
    await page.goto(`${failures.server.baseUrl}/account/sign-in.html`, { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Password Reset" }).click();
    await expect(page).toHaveURL(/\/account\/password-reset\.html$/);
    await expect(page.getByRole("heading", { name: "Password Reset", level: 1 })).toBeVisible();
    await expect(page.locator("[data-account-auth-status]")).toHaveText("Password Reset is not available in this preview. Please try again later.");
    await expect(page.locator("main")).toContainText("account service");
    await expect(page.locator("main")).not.toContainText("The site is currently unavailable. Please try again later.");
    await expect(page.locator("main")).not.toContainText("configured account provider");

    expect(failures.failedRequests.filter((entry) => !entry.includes("/api/platform-settings/banner"))).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors.filter((entry) => !entry.includes("500"))).toEqual([]);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Configured account auth actions call external Auth and surface identity readiness safely", async ({ page }) => {
  const fakeSupabase = await startFakeSupabaseAuthServer({
    identityTables: fakeSupabaseIdentityTables(),
  });
  await withSupabaseEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "browser-test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "browser-test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const failures = await openRepoPage(page, "/account/sign-in.html");

    try {
      await expect(page.locator("[data-login-status]")).toHaveText("Account service is available.");
      await page.getByLabel("Email").fill("user1@example.invalid");
      await page.getByLabel("Password").fill("not-stored-locally");
      await page.getByRole("button", { name: "Sign In" }).click();
      await expect(page).toHaveURL(/\/account\/sign-in\.html$/);
      await expect(page.locator("[data-login-status]")).toHaveText("Account identity setup is incomplete. Please contact support.");
      await expect(page.locator("main")).not.toContainText("browser-test-access-token");
      await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Sign In");

      await page.goto(`${failures.server.baseUrl}/account/create-account.html`, { waitUntil: "networkidle" });
      await expect(page.locator("[data-account-auth-status]")).toHaveText("Account service is available.");
      await page.getByLabel("Email").fill("new@example.test");
      await page.getByLabel("Password").fill("not-stored-locally");
      await page.getByRole("button", { name: "Create Account" }).click();
      await expect(page.locator("[data-account-auth-status]")).toHaveText("Account identity setup is incomplete. Please contact support.");

      await page.goto(`${failures.server.baseUrl}/account/password-reset.html`, { waitUntil: "networkidle" });
      await expect(page.locator("[data-account-auth-status]")).toHaveText("Account service is available.");
      await page.getByLabel("Email").fill("reset@example.test");
      await page.getByRole("button", { name: "Request Password Reset" }).click();
      await expect(page.locator("[data-account-auth-status]")).toHaveText("If an account exists for that email, password reset instructions will be sent.");

      expect(fakeSupabase.calls.filter((call) => call.path === "/auth/v1/health").length).toBeGreaterThanOrEqual(1);
      expect(fakeSupabase.calls.some((call) => call.path === "/auth/v1/token?grant_type=password")).toBe(true);
      expect(fakeSupabase.calls.some((call) => call.path === "/auth/v1/admin/users")).toBe(true);
      expect(fakeSupabase.calls.some((call) => call.path === "/auth/v1/recover")).toBe(true);
      expect(fakeSupabase.calls
        .filter((call) => call.path.startsWith("/auth/v1/") && call.path !== "/auth/v1/admin/users")
        .every((call) => call.headers.apikey === "browser-test-anon-key")).toBe(true);
      expect(fakeSupabase.calls
        .filter((call) => call.path === "/auth/v1/admin/users")
        .every((call) => call.headers.apikey === "browser-test-service-role-key")).toBe(true);
      expect(failures.failedRequests.filter((entry) => entry.includes("/api/auth/sign-in"))).toHaveLength(1);
      expect(failures.failedRequests.filter((entry) => entry.includes("/api/auth/create-account"))).toHaveLength(1);
      expect(failures.failedRequests.filter((entry) => entry.includes("/api/auth/password-reset"))).toHaveLength(0);
      expect(failures.failedRequests.filter((entry) =>
        !entry.includes("/api/platform-settings/banner") &&
        !entry.includes("/api/auth/sign-in") &&
        !entry.includes("/api/auth/create-account")
      )).toEqual([]);
      expect(failures.pageErrors).toEqual([]);
      expect(failures.consoleErrors.filter((entry) => !entry.includes("503") && !entry.includes("500"))).toEqual([]);
    } finally {
      await closeWithCoverage(page, failures);
    }
  });
  await fakeSupabase.close();
});

test("Account auth actions show actionable identity setup failures without exposing provider details", async ({ page }) => {
  const timestamp = "2026-06-15T00:00:00.000Z";
  const fakeSupabase = await startFakeSupabaseAuthServer({
    identityTables: {
      roles: [{
        createdAt: timestamp,
        createdBy: MOCK_DB_KEYS.users.admin,
        isActive: true,
        key: MOCK_DB_KEYS.roles.creator,
        name: "Creator",
        roleSlug: "creator",
        updatedAt: timestamp,
        updatedBy: MOCK_DB_KEYS.users.admin,
      }],
      user_roles: [],
      users: [],
    },
  });
  await withSupabaseEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "browser-test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "browser-test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: fakeSupabase.baseUrl,
  }, async () => {
    const failures = await openRepoPage(page, "/account/sign-in.html");

    try {
      await expect(page.locator("[data-login-status]")).toHaveText("Account service is available.");
      await page.getByLabel("Email").fill("user1@example.invalid");
      await page.getByLabel("Password").fill("not-stored-locally");
      await page.getByRole("button", { name: "Sign In" }).click();
      await expect(page.locator("[data-login-status]")).toHaveText("Account identity setup is incomplete. Please contact support.");
      await expect(page.locator("main")).not.toContainText("Supabase");
      await expect(page.locator("main")).not.toContainText("DEV");
      expect(failures.failedRequests.filter((entry) => entry.includes("/api/auth/sign-in"))).toHaveLength(1);
      expect(failures.pageErrors).toEqual([]);
      expect(failures.consoleErrors.filter((entry) => !entry.includes("503"))).toEqual([]);
    } finally {
      await closeWithCoverage(page, failures);
    }
  });
  await fakeSupabase.close();
});

test("Create Account shows action-safe service failure and support message for identity provisioning failure", async ({ page }) => {
  const providerFailureSupabase = await startFakeSupabaseAuthServer({
    failAdminCreateAccount: {
      payload: { message: "User already registered" },
      status: 422,
    },
    identityTables: fakeSupabaseIdentityTables(),
  });
  await withSupabaseEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "browser-test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "browser-test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: providerFailureSupabase.baseUrl,
  }, async () => {
    const failures = await openRepoPage(page, "/account/create-account.html");
    try {
      await expect(page.locator("[data-account-auth-status]")).toHaveText("Account service is available.");
      await page.getByLabel("Email").fill("existing@example.test");
      await page.getByLabel("Password").fill("not-stored-locally");
      await page.getByRole("button", { name: "Create Account" }).click();
      await expect(page.locator("[data-account-auth-status]")).toHaveText("Create Account could not be completed. Please try again later.");
      await expect(page.locator("main")).not.toContainText("User already registered");
      expect(failures.failedRequests.filter((entry) => entry.includes("/api/auth/create-account"))).toHaveLength(1);
      expect(failures.pageErrors).toEqual([]);
      expect(failures.consoleErrors.filter((entry) => !entry.includes("503"))).toEqual([]);
    } finally {
      await closeWithCoverage(page, failures);
    }
  });
  await providerFailureSupabase.close();

  const identityFailureSupabase = await startFakeSupabaseAuthServer({
    adminCreateAccountPayload: {
      user: {
        email: "missing-identity@example.test",
      },
    },
    identityTables: {
      roles: [],
      user_roles: [],
      users: [],
    },
  });
  await withSupabaseEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "browser-test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "browser-test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: identityFailureSupabase.baseUrl,
  }, async () => {
    const failures = await openRepoPage(page, "/account/create-account.html");
    try {
      await expect(page.locator("[data-account-auth-status]")).toHaveText("Account service is available.");
      await page.getByLabel("Email").fill("missing-identity@example.test");
      await page.getByLabel("Password").fill("not-stored-locally");
      await page.getByRole("button", { name: "Create Account" }).click();
      await expect(page.locator("[data-account-auth-status]")).toHaveText("Account identity setup is incomplete. Please contact support.");
      await expect(page.locator("main")).not.toContainText("missing-identity@example.test");
      expect(failures.failedRequests.filter((entry) => entry.includes("/api/auth/create-account"))).toHaveLength(1);
      expect(failures.pageErrors).toEqual([]);
      expect(failures.consoleErrors.filter((entry) => !entry.includes("503"))).toEqual([]);
    } finally {
      await closeWithCoverage(page, failures);
    }
  });
  await identityFailureSupabase.close();
});

test("Password Reset maps upstream rate limit safely and keeps service failures action-safe", async ({ page }) => {
  const rateLimitSupabase = await startFakeSupabaseAuthServer({
    failPasswordReset: {
      payload: {
        code: "over_email_send_rate_limit",
        message: "Email rate limit exceeded for browser429@example.test",
      },
      status: 429,
    },
    identityTables: fakeSupabaseIdentityTables(),
  });
  await withSupabaseEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "browser-test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "browser-test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: rateLimitSupabase.baseUrl,
  }, async () => {
    const failures = await openRepoPage(page, "/account/password-reset.html");
    try {
      await expect(page.locator("[data-account-auth-status]")).toHaveText("Account service is available.");
      await page.getByLabel("Email").fill("browser429@example.test");
      await page.getByRole("button", { name: "Request Password Reset" }).click();
      await expect(page.locator("[data-account-auth-status]")).toHaveText("Too many reset requests. Please wait and try again later.");
      await expect(page.locator("main")).not.toContainText("Email rate limit exceeded");
      expect(failures.failedRequests.filter((entry) => entry.includes("/api/auth/password-reset"))).toHaveLength(1);
      expect(failures.pageErrors).toEqual([]);
      expect(failures.consoleErrors.filter((entry) => !entry.includes("429"))).toEqual([]);
    } finally {
      await closeWithCoverage(page, failures);
    }
  });
  await rateLimitSupabase.close();

  const providerFailureSupabase = await startFakeSupabaseAuthServer({
    failPasswordReset: {
      payload: {
        message: "Provider outage for browser500@example.test",
      },
      status: 500,
    },
    identityTables: fakeSupabaseIdentityTables(),
  });
  await withSupabaseEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "supabase-auth",
    GAMEFOUNDRY_DB_PROVIDER: "supabase-postgres",
    GAMEFOUNDRY_SUPABASE_ANON_KEY: "browser-test-anon-key",
    GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY: "browser-test-service-role-key",
    GAMEFOUNDRY_SUPABASE_URL: providerFailureSupabase.baseUrl,
  }, async () => {
    const failures = await openRepoPage(page, "/account/password-reset.html");
    try {
      await expect(page.locator("[data-account-auth-status]")).toHaveText("Account service is available.");
      await page.getByLabel("Email").fill("browser500@example.test");
      await page.getByRole("button", { name: "Request Password Reset" }).click();
      await expect(page.locator("[data-account-auth-status]")).toHaveText("Password Reset could not be completed. Please try again later.");
      await expect(page.locator("main")).not.toContainText("Provider outage");
      expect(failures.failedRequests.filter((entry) => entry.includes("/api/auth/password-reset"))).toHaveLength(1);
      expect(failures.pageErrors).toEqual([]);
      expect(failures.consoleErrors.filter((entry) => !entry.includes("503"))).toEqual([]);
    } finally {
      await closeWithCoverage(page, failures);
    }
  });
  await providerFailureSupabase.close();
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
    await expect(page.locator("[data-session-access-status]")).toContainText("Use an account with the required access and try again.");
    await expect(page.locator("[data-session-access-status]")).not.toContainText("Local");
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
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("DavidQ");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeVisible();
    await expect(page.locator("[data-admin-db-clear]")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("DavidQ");
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
    await expect(page.locator("[data-admin-setup-status]").first()).toHaveText("PASS: Site Setup status checked 5 setup areas.");
    await expect(page.locator("[data-admin-setup-status-rows] tr")).toHaveCount(5);
    await expect(page.locator("[data-admin-setup-status-rows]")).toContainText("First Admin");
    await expect(page.locator("[data-admin-setup-status-rows]")).toContainText("Tool Metadata Bootstrap");
    await expect(page.locator("[data-admin-setup-status-rows]")).toContainText("Starter Platform Settings");
    await expect(page.locator("[data-admin-setup-status-rows]")).toContainText("Support Categories");
    await expect(page.locator("[data-admin-setup-status-rows]")).toContainText("PASS");
    await expect(page.locator("[data-admin-setup-status-rows]")).not.toContainText("WARN");
    await expect(page.locator("[data-admin-setup-status-rows]")).not.toContainText("SKIP");
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
    await expect(page.locator("[data-owner-menu]")).toHaveCount(0);
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
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("DavidQ");
    await page.locator("nav.nav-links > .nav-item:has(> a[data-route='account'])").hover();
    await expect(page.locator("[data-account-logout]")).toBeVisible();
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeVisible();
    await page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])").hover();
    await expectOwnerMenu(page);
    await page.locator("nav.nav-links a[data-admin-notes-local-menu]").click();
    await expect(page).toHaveURL(/\/admin\/admin-notes\.html$/);
    await expect(page.getByRole("heading", { name: "Admin Notes", level: 1 })).toBeVisible();
    await expect(page.locator("[data-admin-notes-status]")).toContainText("Loaded dev/archive/legacy-docs-build/admin-notes/index.txt.");
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Admin Local DB pages and Account service pages render identity data or actionable diagnostics", async ({ page }) => {
  const pageChecks = [
    {
      assertions: async () => {
        await expect(page.getByRole("heading", { name: "Creators", level: 1 })).toBeVisible();
        await expect(page.locator("[data-local-db-status]")).toHaveText("Loaded 4 Local DB users from users, roles, and user_roles.");
        await expect(page.locator("[data-local-db-table='users']")).toContainText("DavidQ");
        await expect(page.locator("[data-local-db-table='users']")).toContainText(MOCK_DB_KEYS.users.admin);
        await expect(page.locator("[data-local-db-audit]").first()).toContainText("Audit PASS");
      },
      path: "/admin/users.html",
      sessionUserKey: MOCK_DB_KEYS.users.admin,
    },
    {
      assertions: async () => {
        await expect(page.getByRole("heading", { name: "Responsibilities", level: 1 })).toBeVisible();
        await expect(page.locator("[data-local-db-status]")).toHaveText("Loaded 4 Local DB roles and 5 user-role assignments.");
        await expect(page.locator("[data-local-db-table='roles']")).toContainText("admin");
        await expect(page.locator("[data-local-db-table='roles']")).toContainText("DavidQ");
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
        await expect(page.locator("[data-local-db-page], [data-local-db-status], [data-local-db-content]")).toHaveCount(0);
        await expect(page.locator("[data-account-status]")).toHaveText("Loaded account summary from the account service.");
        await expect(page.locator("[data-account-table='current-account']")).toContainText("User 1");
        await expect(page.locator("[data-account-table='current-account']")).toContainText(MOCK_DB_KEYS.users.user1);
      },
      path: "/account/index.html",
      sessionUserKey: MOCK_DB_KEYS.users.user1,
    },
    {
      assertions: async () => {
        await expect(page.getByRole("heading", { name: "Profile", level: 1 })).toBeVisible();
        await expect(page.locator("[data-local-db-page], [data-local-db-status], [data-local-db-content]")).toHaveCount(0);
        await expect(page.locator("[data-account-status]")).toHaveText("Loaded profile identity from the account service.");
        await expect(page.locator("[data-account-table='current-account']")).toContainText("User 1");
      },
      path: "/account/profile.html",
      sessionUserKey: MOCK_DB_KEYS.users.user1,
    },
    {
      assertions: async () => {
        await expect(page.getByRole("heading", { name: "Preferences", level: 1 })).toBeVisible();
        await expect(page.locator("[data-local-db-page], [data-local-db-status], [data-local-db-content]")).toHaveCount(0);
        await expect(page.locator("[data-account-status]")).toHaveText("Loaded current account. Preferences storage is not available yet.");
        await expect(page.locator("[data-account-follow-up='account-preferences']")).toContainText("FOLLOW-UP REQUIRED");
        await expect(page.locator("[data-account-follow-up='account-preferences']")).toContainText("Account preferences are not available yet.");
      },
      path: "/account/preferences.html",
      sessionUserKey: MOCK_DB_KEYS.users.user1,
    },
    {
      assertions: async () => {
        await expect(page.getByRole("heading", { name: "Security", level: 1 })).toBeVisible();
        await expect(page.locator("[data-local-db-page], [data-local-db-status], [data-local-db-content]")).toHaveCount(0);
        await expect(page.locator("[data-account-status]")).toHaveText("Loaded current account. Security settings are not available yet.");
        await expect(page.locator("[data-account-follow-up='account-security']")).toContainText("FOLLOW-UP REQUIRED");
        await expect(page.locator("[data-account-follow-up='account-security']")).toContainText("Account security settings are not available yet.");
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
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toContainText("DavidQ");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeVisible();
    await page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])").hover();
    await expectOwnerMenu(page);
    await page.locator("nav.nav-links a[data-admin-notes-local-menu]").click();
    await expect(page).toHaveURL("http://127.0.0.1:5501/admin/admin-notes.html");
    await expect(page.getByRole("heading", { name: "Admin Notes", level: 1 })).toBeVisible();
    await expect(page.locator("[data-admin-notes-status]")).toContainText("Loaded dev/archive/legacy-docs-build/admin-notes/index.txt.");
    await expectNoPageFailures(failures);
  } finally {
    await closeFixedLocalApiPage(page, failures);
  }
});

test("Account logout clears only the current session and blocks protected pages", async ({ page }) => {
  await withSupabaseEnv({
    GAMEFOUNDRY_AUTH_PROVIDER: "local-db",
    GAMEFOUNDRY_DB_PROVIDER: "local-db",
  }, async () => {
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
      await expect(page.locator("main")).toContainText("Sign in with your account to open Account pages.");
      await expect(page.locator("main")).not.toContainText("local user");
      await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Sign In");
      await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='account']) > .sub-menu")).toBeHidden();
      await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toHaveCount(0);

      const storedUsers = await page.evaluate(async () => {
        const snapshot = await fetch("/api/local-db/snapshot").then((response) => response.json());
        return (snapshot.data.tables.users || []).map((user) => user.displayName);
      });
      expect(storedUsers).toEqual(expect.arrayContaining(["User 1", "User 2", "User 3", "DavidQ"]));
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
