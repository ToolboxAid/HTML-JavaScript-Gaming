import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
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
    await expect(page.locator("[data-login-mode='local-db']")).toHaveClass(/primary/);
    await expect(page.locator("[data-login-mode-title]")).toHaveText("Local DB");
    await expect(page.locator("[data-login-mode-description]")).toHaveText("Uses LocalDbAdapter backed by server SQLite storage.");
    await expect(page.locator("[data-login-mode-status]")).toContainText("Environment: Local DB");
    await expect(page.locator("[data-login-mode-status]")).toContainText("Persistence: Local DB");
    await expect(page.locator("[data-login-mode-status]")).not.toContainText("Local DB adapter not configured");
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
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
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
