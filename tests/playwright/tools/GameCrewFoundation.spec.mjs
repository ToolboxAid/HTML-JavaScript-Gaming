import { expect, test } from "@playwright/test";
import { GAME_CREW_TABLES, createGameCrewMockRepository } from "../../../src/dev-runtime/persistence/tool-repositories/game-crew-mock-repository.js";
import { createGameWorkspaceMockRepository, GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY, GAME_WORKSPACE_VIEWER_USER_KEY } from "../../../src/dev-runtime/persistence/tool-repositories/game-workspace-mock-repository.js";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
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

async function setServerSession(server, userKey = MOCK_DB_KEYS.users.user1) {
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
}

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

  if (options.sessionUserKey !== null) {
    await setServerSession(server, options.sessionUserKey || MOCK_DB_KEYS.users.user1);
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

test("Game Crew repository exposes API-shaped project member rows", () => {
  const gameWorkspaceRepository = createGameWorkspaceMockRepository();
  const repository = createGameCrewMockRepository({
    gameWorkspaceRepository,
    sessionUserKey: () => MOCK_DB_KEYS.users.user1,
  });

  expect(repository.GAME_CREW_TABLES).toEqual(GAME_CREW_TABLES);
  expect(Object.keys(repository.getTables())).toEqual(["project_members"]);
  expect(repository.getTables().project_members).toEqual(expect.arrayContaining([
    expect.objectContaining({
      createdAt: expect.any(String),
      createdBy: GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY,
      key: expect.stringMatching(/^[0-9A-HJKMNP-TV-Z]{26}$/),
      projectKey: "demo-game",
      role: "Owner",
      status: "active",
      updatedAt: expect.any(String),
      updatedBy: GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY,
      userKey: GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY,
    }),
    expect.objectContaining({
      role: "Viewer",
      userKey: GAME_WORKSPACE_VIEWER_USER_KEY,
    }),
  ]));
  const snapshot = repository.getSnapshot();
  expect(snapshot.activeProject).toMatchObject({
    key: "demo-game",
    name: "Demo Game",
  });
  expect(snapshot.members).toHaveLength(3);
  expect(snapshot.owner).toMatchObject({
    displayName: "User 1",
    role: "Owner",
  });
  expect(repository.readAddMemberPlaceholder()).toMatchObject({
    status: "Planned",
  });
});

test("Game Crew page renders project owner and member foundation through the API", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-crew/index.html");

  try {
    await expect(page.getByRole("heading", { level: 1, name: "Game Crew" })).toBeVisible();
    await expect(page.locator(".tool-workspace")).toBeVisible();
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
    await expect(page.locator("[data-game-crew-log]")).toHaveText("Member invitations are planned for the next crew workflow pass.");

    await page.locator("[data-game-crew-member-row]").filter({ hasText: "User 3" }).getByRole("button", { name: "Remove" }).click();
    await expect(page.locator("[data-game-crew-selected]")).toHaveText("User 3");
    await expect(page.locator("[data-game-crew-log]")).toHaveText("Member removal is planned for the next crew workflow pass.");

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
