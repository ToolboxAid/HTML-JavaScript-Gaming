import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "game-design",
    surface: "game design mock repository"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function openRepoPage(page, pathName) {
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

  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { failedRequests, pageErrors, consoleErrors, server };
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

test("Game Design shows an actionable overlay when project context is missing", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html?project=missing");

  try {
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-game-design-project-overlay]")).toBeVisible();
    await expect(page.locator("[data-game-design-validation-overlay]")).toBeVisible();
    await expect(page.locator("[data-game-design-validation-list]")).toContainText("Project Context");
    await expect(page.locator("[data-game-design-active-project]")).toHaveText("No Project Workspace project");

    await page.getByRole("button", { name: "Save Game Design" }).click();
    await expect(page.locator("[data-game-design-log]")).toHaveText("Open or seed a project before saving Game Design.");
    await expect(page.locator("[data-game-design-output]")).toContainText('"activeProjectId": null');

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Game Design saves and updates design fields against the active project", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html");

  try {
    await expect(page.locator("[data-game-design-active-project]")).toHaveText("Demo Project");
    await expect(page.locator("[data-game-design-project-purpose]")).toHaveText("Game Project");
    await expect(page.locator("[data-game-design-validation-overlay]")).toBeVisible();
    await expect(page.locator("[data-game-design-validation-list]")).toContainText("Game Type");
    await expect(page.locator("[data-game-design-validation-list]")).toContainText("Genre");
    await expect(page.locator("[data-game-design-validation-list]")).toContainText("Play Style");
    await expect(page.locator("[data-game-design-validation-list]")).toContainText("Design Summary");

    await page.getByLabel("Game Type").selectOption("Puzzle");
    await page.getByLabel("Genre").selectOption("Adventure");
    await page.getByLabel("Play Style").selectOption("Single Player");
    await page.getByLabel("Design Summary").fill("A compact puzzle adventure with one clear project promise.");
    await page.getByRole("button", { name: "Save Game Design" }).click();

    await expect(page.locator("[data-game-design-log]")).toHaveText("Saved Demo Project Game Design as ready.");
    await expect(page.locator("[data-game-design-validation-overlay]")).toBeHidden();
    await expect(page.locator("[data-game-design-status]")).toHaveText("Ready");
    await expect(page.locator("[data-game-design-recommended-tool]").first()).toHaveText("Game Configuration");
    await expect(page.locator("[data-game-design-output]")).toContainText('"gameType": "Puzzle"');
    await expect(page.locator("[data-game-design-output]")).toContainText('"genre": "Adventure"');

    await page.getByLabel("Genre").selectOption("Fantasy");
    await page.getByRole("button", { name: "Save Game Design" }).click();
    await expect(page.locator("[data-game-design-output]")).toContainText('"genre": "Fantasy"');
    await expect(page.locator("[data-game-design-log]")).toHaveText("Saved Demo Project Game Design as ready.");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Game Design authors capability demos as Project Workspace projects", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html?project=gravity-demo");

  try {
    await expect(page.locator("[data-game-design-active-project]")).toHaveText("Gravity Demo");
    await expect(page.locator("[data-game-design-project-purpose]")).toHaveText("Capability Demo");
    await expect(page.getByText("Capability demos remain Project Workspace projects.")).toBeVisible();
    await expect(page.locator("[data-game-design-capability-demos]")).toContainText("Gravity Demo: Project Workspace project");
    await expect(page.getByLabel("Game Type")).toHaveValue("Capability Demo");
    await expect(page.getByLabel("Genre")).toHaveValue("Utility");
    await expect(page.getByLabel("Play Style")).toHaveValue("Guided Tutorial");
    await expect(page.locator("[data-game-design-validation-overlay]")).toBeHidden();

    await page.getByLabel("Capability Demo Notes").fill("Gravity demo remains project-owned authoring data.");
    await page.getByRole("button", { name: "Save Game Design" }).click();
    await expect(page.locator("[data-game-design-output]")).toContainText('"activeProjectId": "gravity-demo"');
    await expect(page.locator("[data-game-design-output]")).toContainText('"projectPurpose": "Capability Demo"');
    await expect(page.locator("[data-game-design-output]")).toContainText('"capabilityDemoAuthoring": true');
    await expect(page.locator("[data-game-design-table-counts]")).toContainText("game_design_capability_demos");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Toolbox Progress and Build Path views show the Game Design handoff", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html?role=user");

  try {
    await page.getByRole("button", { name: "Progress" }).click();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Design$/ }) })).toContainText("Project purpose context required");
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Design$/ }) })).toContainText("Validation overlay hands off to Game Configuration");

    await page.getByRole("button", { name: "Build Path" }).click();
    await expect(page.locator("[data-tools-accordion='Game Design']")).toBeVisible();
    await expect(page.locator("[data-tools-accordion='Game Design']")).toContainText("Define gameplay, rules, player experience, and the requirements that shape the build path.");
    await expect(page.locator("[data-tools-accordion='Game Design']")).toContainText("Game Design");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
