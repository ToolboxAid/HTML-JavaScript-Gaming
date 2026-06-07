import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS, getStandaloneMockDbSeedTables } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const standaloneSeedTables = getStandaloneMockDbSeedTables();
const standaloneSeedState = {
  cleared: false,
  owners: Object.fromEntries(Object.keys(standaloneSeedTables).map((tableName) => [tableName, "standalone"])),
  tables: standaloneSeedTables,
  version: 3,
};

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

async function openRepoPage(page, pathName, options = {}) {
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

  await page.addInitScript(({ seedStandalone, seedState, sessionModeId, sessionUserKey }) => {
    if (seedStandalone && !window.localStorage.getItem("gamefoundry.mockDb.v1")) {
      window.localStorage.setItem("gamefoundry.mockDb.v1", JSON.stringify(seedState));
    }
    if (sessionModeId) {
      window.localStorage.setItem("gamefoundry.mockDb.sessionMode.v1", sessionModeId);
    }
    if (sessionUserKey) {
      window.localStorage.setItem("gamefoundry.mockDb.sessionUser.v1", sessionUserKey);
    } else {
      window.localStorage.removeItem("gamefoundry.mockDb.sessionUser.v1");
    }
  }, {
    seedStandalone: Boolean(options.seedStandalone),
    seedState: options.seedState || standaloneSeedState,
    sessionModeId: options.sessionModeId || "local",
    sessionUserKey: options.sessionUserKey || "",
  });

  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
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
}

async function mockDbSessionSnapshot(page) {
  return page.evaluate(async () => {
    const db = await import("/src/dev-runtime/persistence/mock-db-store.js");
    const tables = db.getStandaloneMockDbTables();
    return {
      mode: db.getMockDbSessionMode(),
      persistenceEnabled: db.mockDbPersistenceEnabled(),
      sessionUser: db.getMockDbSessionUser(),
      userNames: tables.users.map((user) => user.displayName),
    };
  });
}

test("Login page switches DEV and Local modes without storing Guest as a user", async ({ page }) => {
  const failures = await openRepoPage(page, "/login.html");

  try {
    await expect(page.getByRole("heading", { name: "Login", level: 1 })).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-login-mode='local']")).toHaveClass(/primary/);
    await expect(page.locator("[data-login-mode-title]")).toHaveText("Local");
    await expect(page.locator("[data-login-mode-description]")).toHaveText("Uses the persisted Memory DB.");
    await expect(page.locator("[data-login-user]")).toHaveText(["Guest", "User 1", "User 2", "User 3", "Admin"]);
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Login");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='account']) > .sub-menu")).toBeHidden();

    let snapshot = await mockDbSessionSnapshot(page);
    expect(snapshot.mode.id).toBe("local");
    expect(snapshot.persistenceEnabled).toBe(true);
    expect(snapshot.userNames).toEqual(["User 1", "User 2", "User 3", "Admin", "forge-bot"]);
    expect(snapshot.userNames).not.toContain("Guest");

    await page.locator("[data-login-mode='dev']").click();
    await expect(page.locator("[data-login-mode='dev']")).toHaveClass(/primary/);
    await expect(page.locator("[data-login-mode-title]")).toHaveText("DEV");
    await expect(page.locator("[data-login-mode-description]")).toHaveText("Only gets the JSON data.");
    await expect(page.locator("[data-login-user]")).toHaveCount(0);
    await expect(page.locator("[data-login-user-controls]")).toBeHidden();
    await expect(page.locator("[data-login-user-status]")).toHaveText("DEV mode uses read-only/demo JSON access. No users are selectable.");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Login");

    snapshot = await mockDbSessionSnapshot(page);
    expect(snapshot.mode.id).toBe("dev");
    expect(snapshot.persistenceEnabled).toBe(false);
    expect(snapshot.sessionUser.id).toBe("guest");

    await page.locator("[data-login-mode='local']").click();
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
    sessionUserKey: MOCK_DB_KEYS.users.admin,
  });

  try {
    await expect(page.locator("[data-session-access-blocked='admin']")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Admin role required", level: 1 })).toBeVisible();
    await expect(page.locator("[data-session-access-status]")).toContainText("Current session: Login.");
    await expect(page.locator("[data-session-access-status]")).toContainText("Login/session diagnostic: Persisted Memory DB users and roles are not seeded.");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Login");
    await expect(page.locator("nav.nav-links > .nav-item:has(> a[data-route='admin'])")).toBeHidden();
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }

  failures = await openRepoPage(page, "/admin/db-viewer.html", {
    seedStandalone: true,
    sessionModeId: "dev",
    sessionUserKey: MOCK_DB_KEYS.users.admin,
  });

  try {
    await expect(page.locator("[data-session-access-blocked='admin']")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Admin role required", level: 1 })).toBeVisible();
    await expect(page.locator("[data-session-access-status]")).toContainText("Current session: Login.");
    await expect(page.locator("[data-session-access-status]")).toContainText("DEV mode uses read-only/demo JSON access.");
    await expect(page.locator("nav.nav-links > .nav-item > a[data-route='account']")).toHaveText("Login");
    await expect(page.locator("[data-admin-db-viewer]")).toHaveCount(0);
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

    const storedUsers = await page.evaluate(() => {
      const snapshot = JSON.parse(window.localStorage.getItem("gamefoundry.mockDb.v1") || "{}");
      return (snapshot.tables?.users || []).map((user) => user.displayName);
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
