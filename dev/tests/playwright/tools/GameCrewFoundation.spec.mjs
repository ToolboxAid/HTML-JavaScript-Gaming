import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createPostgresConnectionClient } from "../../../../api/persistence/postgres-connection-client.mjs";
import { SEED_DB_KEYS } from "../../../../api/seed/seed-db-keys.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "game-crew-foundation",
    surface: "Game Crew project membership foundation"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

let gameCrewSchemaReadyPromise = null;

async function ensureGameCrewDatabaseSchema() {
  if (!gameCrewSchemaReadyPromise) {
    gameCrewSchemaReadyPromise = (async () => {
      const client = createPostgresConnectionClient();
      const ddlFiles = [
        "dev/build/database/ddl/account.sql",
        "dev/build/database/ddl/game-workspace.sql",
        "dev/build/database/ddl/game-crew.sql",
      ];
      for (const ddlFile of ddlFiles) {
        const ddl = await readFile(path.resolve(ddlFile), "utf8");
        await client.query(ddl);
      }
    })();
  }
  try {
    await gameCrewSchemaReadyPromise;
  } catch (error) {
    gameCrewSchemaReadyPromise = null;
    throw error;
  }
}

async function setServerSession(server, userKey = SEED_DB_KEYS.users.user1) {
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
}

async function openRepoPage(page, pathName, options = {}) {
  const server = await startRepoServer();
  await ensureGameCrewDatabaseSchema();
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

  if (options.sessionUserKey !== null) {
    await setServerSession(server, options.sessionUserKey || SEED_DB_KEYS.users.user1);
  }
  await page.addInitScript(() => {
    window.GameFoundryPublicConfig = {
      apiUrl: `${window.location.origin}/api`
    };
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

async function createRepositoryApiClient(server, toolId) {
  const createResponse = await fetch(`${server.baseUrl}/api/toolbox/${toolId}/repositories`, {
    body: JSON.stringify({ options: {} }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
  const createPayload = await createResponse.json();
  expect(createPayload.ok).toBe(true);
  const repositoryId = createPayload.data.repositoryId;

  async function callRepositoryMethod(methodName, ...args) {
    const response = await fetch(`${server.baseUrl}/api/toolbox/${toolId}/repositories/${repositoryId}/methods/${methodName}`, {
      body: JSON.stringify({ args }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    return payload.data.result;
  }
  callRepositoryMethod.repositoryId = repositoryId;
  return callRepositoryMethod;
}

async function readProjectMemberRows(query = "select=*") {
  const client = createPostgresConnectionClient();
  return client.requestTable("project_members", { query });
}

test("Game Crew API adds and removes project members through the database contract", async () => {
  const server = await startRepoServer();
  try {
    await ensureGameCrewDatabaseSchema();
    await setServerSession(server);
    const callGameCrewMethod = await createRepositoryApiClient(server, "game-crew");
    const snapshot = await callGameCrewMethod("getSnapshot");

    expect(Object.keys(snapshot.tables)).toEqual(["project_members"]);
    expect(snapshot.tables.project_members).toEqual(expect.arrayContaining([
      expect.objectContaining({
        createdAt: expect.any(String),
        createdBy: SEED_DB_KEYS.users.user1,
        key: expect.stringMatching(/^[0-9A-HJKMNP-TV-Z]{26}$/),
        projectKey: expect.stringMatching(/^[0-9A-HJKMNP-TV-Z]{26}$/),
        role: "Owner",
        status: "active",
        updatedAt: expect.any(String),
        updatedBy: SEED_DB_KEYS.users.user1,
        userKey: SEED_DB_KEYS.users.user1,
      }),
      expect.objectContaining({
        role: "Member",
        userKey: SEED_DB_KEYS.users.user3,
      }),
    ]));
    expect(snapshot.activeProject).toMatchObject({
      localRecordId: "demo-game",
      name: "Demo Game",
    });
    expect(snapshot.members).toHaveLength(3);
    expect(snapshot.owner).toMatchObject({
      displayName: "User 1",
      role: "Owner",
    });
    const addResult = await callGameCrewMethod("addMember");
    expect(addResult).toMatchObject({
      added: true,
      member: expect.objectContaining({
        displayName: "User 2",
        role: "Member",
        status: "active",
        userKey: SEED_DB_KEYS.users.user2,
      }),
      status: "Ready",
    });
    await expect.poll(async () => {
      const rows = await readProjectMemberRows(`userKey=eq.${encodeURIComponent(SEED_DB_KEYS.users.user2)}`);
      return rows.some((row) => row.status === "active" && row.role === "Member");
    }).toBe(true);

    const removeResult = await callGameCrewMethod("removeMember", SEED_DB_KEYS.users.user2);
    expect(removeResult).toMatchObject({
      removed: true,
      member: expect.objectContaining({
        displayName: "User 2",
        status: "removed",
      }),
    });
    await expect.poll(async () => {
      const rows = await readProjectMemberRows(`userKey=eq.${encodeURIComponent(SEED_DB_KEYS.users.user2)}`);
      return rows.some((row) => row.status === "removed" && row.role === "Member");
    }).toBe(true);
  } finally {
    await server.close();
  }
});

test("Game Crew page renders project owner and member foundation through the API", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-crew/index.html");

  try {
    await expect(page.getByRole("heading", { level: 1, name: "Game Crew" })).toBeVisible();
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("[data-toolbox-selected-game-name]")).toHaveText("Demo Game");
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-game-crew-status]")).toHaveText("Ready");
    await expect(page.locator("[data-game-crew-project-name]")).toHaveText("Demo Game");
    await expect(page.locator("[data-game-crew-owner]")).toHaveText("User 1");
    await expect(page.locator("[data-game-crew-count]")).toHaveText("3");
    await expect(page.locator("[data-game-crew-table]")).toContainText("User 1");
    await expect(page.locator("[data-game-crew-table]")).toContainText("DavidQ");
    await expect(page.locator("[data-game-crew-table]")).toContainText("User 3");
    await expect(page.locator("[data-game-crew-table-counts]")).toContainText("project_members");

    await page.getByRole("button", { name: "Add Member" }).click();
    await expect(page.locator("[data-game-crew-log]")).toHaveText("Added User 2 as a Member.");
    await expect(page.locator("[data-game-crew-count]")).toHaveText("4");
    await expect(page.locator("[data-game-crew-table]")).toContainText("User 2");

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-game-crew-count]")).toHaveText("4");
    await expect(page.locator("[data-game-crew-table]")).toContainText("User 2");

    await page.locator("[data-game-crew-member-row]").filter({ hasText: "User 2" }).getByRole("button", { name: "Remove" }).click();
    await expect(page.locator("[data-game-crew-selected]")).toHaveText("User 2");
    await expect(page.locator("[data-game-crew-log]")).toHaveText("Removed User 2 from the project crew.");
    await expect(page.locator("[data-game-crew-count]")).toHaveText("3");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-selected-game-name]")).toHaveText("Demo Game");
    await expect(page.locator("[data-game-crew-count]")).toHaveText("3");
    await expect(page.locator("[data-game-crew-table]")).not.toContainText("User 2");

    await page.getByRole("button", { name: "Refresh Crew" }).click();
    await expect(page.locator("[data-game-crew-log]")).toHaveText("Project crew refreshed from the API.");
    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Game Crew guest member changes redirect to sign in", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-crew/index.html", { sessionUserKey: null });

  try {
    await page.getByRole("button", { name: "Add Member" }).click();
    await page.waitForURL(/\/account\/sign-in\.html$/);
  } finally {
    await workspaceV2CoverageReporter.stop(page).catch(() => {});
    await failures.server.close();
  }
});

test("Game Crew guest remove redirects to sign in", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-crew/index.html", { sessionUserKey: null });

  try {
    await page.locator("[data-game-crew-member-row]").filter({ hasText: "User 3" }).getByRole("button", { name: "Remove" }).click();
    await page.waitForURL(/\/account\/sign-in\.html$/);
  } finally {
    await workspaceV2CoverageReporter.stop(page).catch(() => {});
    await failures.server.close();
  }
});

test("Game Crew API rejects guest member writes", async () => {
  const server = await startRepoServer();
  try {
    await ensureGameCrewDatabaseSchema();
    const callGameCrewMethod = await createRepositoryApiClient(server, "game-crew");
    const writeMethods = [
      ["addMember", []],
      ["removeMember", [SEED_DB_KEYS.users.user3]],
    ];

    for (const [methodName, args] of writeMethods) {
      const response = await fetch(`${server.baseUrl}/api/toolbox/game-crew/repositories/${callGameCrewMethod.repositoryId}/methods/${methodName}`, {
        body: JSON.stringify({ args }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = await response.json();
      expect(response.status).toBe(401);
      expect(payload.ok).toBe(false);
      expect(payload.error).toContain("Sign in required to save project crew membership through the API.");
    }
  } finally {
    await server.close();
  }
});
