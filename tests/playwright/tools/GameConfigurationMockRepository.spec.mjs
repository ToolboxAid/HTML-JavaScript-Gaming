import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "game-configuration",
    surface: "game configuration mock repository"
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
  return { consoleErrors, failedRequests, pageErrors, server };
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function fillReadyConfiguration(page, summary = "A playable puzzle configuration with one clear starting room.") {
  await page.getByLabel("Game Basics").fill(summary);
  await page.getByLabel("Game Rules").fill("Collect every key, avoid hazards, and reach the exit.");
  await page.getByLabel("Player Setup").fill("One player starts near the first key with keyboard controls.");
  await page.getByLabel("World Setup").fill("One compact room with a locked exit and visible goal path.");
  await page.getByLabel("Object Setup").fill("Keys, doors, hazards, exit marker, and tutorial prompt.");
  await page.getByLabel("Audio Setup").fill("Simple pickup, hazard, and completion sounds.");
  await page.getByLabel("Test Readiness").fill("Confirm start, collect, fail, retry, and win paths before Build Game.");
}

test("Game Configuration requires a valid Game Design handoff before editable configuration", async ({ page }) => {
  const missingFailures = await openRepoPage(page, "/toolbox/game-configuration/index.html?handoff=missing");

  try {
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-game-configuration-handoff-context]")).toHaveText("No valid Game Design handoff");
    await expect(page.locator("[data-game-configuration-handoff-overlay]")).toBeVisible();
    await expect(page.locator("[data-game-configuration-form-card]")).toBeHidden();
    await expect(page.locator(".tool-center-panel [data-game-configuration-form]")).toBeHidden();
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("Game Design");
    await expect(page.locator("[data-game-configuration-output-readiness]")).toHaveText("Blocked");
    await expect(page.locator("[data-game-configuration-output-next-step]")).toHaveText("Game Design");
    await expect(page.locator("[data-game-configuration-output]")).not.toContainText("{");
    await expect(page.locator("[data-game-configuration-output]")).not.toContainText('"gameBasics"');

    await expectNoPageFailures(missingFailures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await missingFailures.server.close();
  }

  const invalidFailures = await openRepoPage(page, "/toolbox/game-configuration/index.html?handoff=invalid");

  try {
    await expect(page.locator("[data-game-configuration-handoff-overlay]")).toBeVisible();
    await expect(page.locator("[data-game-configuration-form-card]")).toBeHidden();
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("Game Design");
    await expect(page.locator("[data-game-configuration-output-readiness]")).toHaveText("Blocked");

    await expectNoPageFailures(invalidFailures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await invalidFailures.server.close();
  }
});

test("Game Configuration saves and updates creator-facing sections with readable output", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-configuration/index.html");

  try {
    await expect(page.locator("[data-game-configuration-handoff-context]")).toHaveText("Demo Project - Game Project - Puzzle / Adventure / Single Player");
    await expect(page.locator("[data-game-configuration-handoff-overlay]")).toBeHidden();
    await expect(page.locator("[data-game-configuration-form-card]")).toBeVisible();
    await expect(page.locator(".tool-center-panel [data-game-configuration-form]")).toBeVisible();
    await expect(page.locator("[data-game-configuration-output] pre, [data-game-configuration-output] code")).toHaveCount(0);
    await expect(page.locator("[data-game-configuration-output]")).toContainText("Configuration Summary");
    await expect(page.locator("[data-game-configuration-output]")).toContainText("Readiness Status");
    await expect(page.locator("[data-game-configuration-output]")).toContainText("Missing Items");
    await expect(page.locator("[data-game-configuration-output]")).toContainText("Next Step");
    await expect(page.locator("[data-game-configuration-output]")).not.toContainText("{");
    await expect(page.locator("[data-game-configuration-output]")).not.toContainText('"gameBasics"');

    await fillReadyConfiguration(page);
    await page.getByRole("button", { name: "Save Game Configuration" }).click();

    await expect(page.locator("[data-game-configuration-log]")).toHaveText("Saved Game Configuration as ready. Assets is the recommended next tool.");
    await expect(page.locator("[data-game-configuration-status]")).toHaveText("Ready");
    await expect(page.locator("[data-game-configuration-output-readiness]")).toHaveText("Ready");
    await expect(page.locator("[data-game-configuration-output-next-step]")).toHaveText("Assets");
    await expect(page.locator("[data-game-configuration-output-missing]")).toHaveText("None");
    await expect(page.locator("[data-game-configuration-project-progress]")).toContainText("Game Configuration ready");
    await expect(page.locator("[data-game-configuration-current-focus]")).toHaveText("Prepare Assets");
    await expect(page.locator("[data-game-configuration-recommended-tool]").first()).toHaveText("Assets");

    await page.getByLabel("Game Basics").fill("Updated playable puzzle setup ready for Assets.");
    await page.getByRole("button", { name: "Save Game Configuration" }).click();
    await expect(page.locator("[data-game-configuration-output-summary]")).toHaveText("Updated playable puzzle setup ready for Assets.");
    await expect(page.locator("[data-game-configuration-output]")).not.toContainText('"updatedAt"');

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Game Configuration validation lists missing required sections and blocks Build Game readiness", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-configuration/index.html");

  try {
    await page.getByLabel("Game Basics").fill("A playable setup summary without enough supporting detail.");
    await page.getByRole("button", { name: "Save Game Configuration" }).click();

    await expect(page.locator("[data-game-configuration-log]")).toHaveText("Saved Game Configuration with 6 missing items.");
    await expect(page.locator("[data-game-configuration-validation-overlay]")).toBeVisible();
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("Game Rules");
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("Player Setup");
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("World Setup");
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("Object Setup");
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("Audio Setup");
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("Test Readiness");
    await expect(page.locator("[data-game-configuration-output-readiness]")).toHaveText("Needs Input");
    await expect(page.locator("[data-game-configuration-output-next-step]")).toHaveText("Game Configuration");
    await expect(page.locator("[data-game-configuration-publishing-progress]")).toHaveText("Build Game blocked until configuration is ready");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Toolbox Build Path view shows Game Configuration handoff state", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html?role=user");

  try {
    await expect(page.getByRole("button", { name: "Progress" })).toHaveCount(0);

    await page.getByRole("button", { name: "Build Path" }).click();
    await expect(page.locator("[data-build-path-table='workflow']")).toBeVisible();
    await expect(page.locator("[data-build-path-tool='Game Configuration']")).toContainText("Game Configuration");
    await expect(page.locator("[data-build-path-tool='Game Configuration']")).toContainText("🟡 In Progress");
    await expect(page.getByText("What should I do next? Game Configuration")).toBeVisible();

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
