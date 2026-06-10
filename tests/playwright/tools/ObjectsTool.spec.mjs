import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "objects",
    surface: "Objects Tool MVP setup"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function openObjectsPage(page) {
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
  await page.goto(`${server.baseUrl}/toolbox/objects/index.html`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

test("Objects seeds a usable paddle and ball MVP setup with visible diagnostics", async ({ page }) => {
  const failures = await openObjectsPage(page);

  try {
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-objects-readiness]")).toHaveText("Needs Input");
    await expect(page.locator("[data-objects-validation-overlay]")).toBeVisible();
    await expect(page.locator("[data-objects-validation-list]")).toContainText("Dynamic paddle");
    await expect(page.locator("[data-objects-validation-list]")).toContainText("Dynamic ball");
    await expect(page.locator("[data-objects-validation-list]")).toContainText("Static play boundary");
    await expect(page.locator("[data-objects-type-basics]")).toContainText("Static");
    await expect(page.locator("[data-objects-type-basics]")).toContainText("Dynamic");
    await expect(page.locator("[data-objects-type-basics]")).toContainText("Collectible");
    await expect(page.locator("[data-objects-type-basics]")).toContainText("Hazard");
    await expect(page.locator("[data-objects-type-basics]")).toContainText("Goal");
    await expect(page.locator("[data-objects-trait-basics]")).toContainText("movable");
    await expect(page.locator("[data-objects-trait-basics]")).toContainText("playerControlled");
    await expect(page.locator("[data-objects-trait-basics]")).toContainText("bounces");
    await expect(page.locator("[data-objects-trait-basics]")).toContainText("collides");

    await page.getByRole("button", { name: "Seed Paddle + Ball" }).click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Seeded paddle + ball MVP objects: Player Paddle, Game Ball, and Arena Boundary.");
    await expect(page.locator("[data-objects-readiness]")).toHaveText("Ready");
    await expect(page.locator("[data-objects-output-readiness]")).toHaveText("Ready");
    await expect(page.locator("[data-objects-count]")).toHaveText("3");
    await expect(page.locator("[data-objects-output-static]")).toHaveText("1");
    await expect(page.locator("[data-objects-output-dynamic]")).toHaveText("2");
    await expect(page.locator("[data-objects-validation-overlay]")).toBeHidden();
    await expect(page.locator("[data-objects-list] tr")).toHaveCount(3);
    await expect(page.locator("[data-objects-list]")).toContainText("Player Paddle");
    await expect(page.locator("[data-objects-list]")).toContainText("Game Ball");
    await expect(page.locator("[data-objects-list]")).toContainText("Arena Boundary");
    await expect(page.locator("[data-objects-list]")).toContainText("Player Controlled");
    await expect(page.locator("[data-objects-list]")).toContainText("Bounces");
    await expect(page.locator("[data-objects-list]")).toContainText("Collides");
    await expect(page.locator("[data-objects-output-mvp]")).toHaveText("Paddle + ball setup has the required Dynamic paddle, Dynamic ball, and Static boundary.");

    await page.getByRole("button", { name: "Validate Setup" }).click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Validation PASS: Objects MVP setup is ready for authoring handoff.");
    await expect(page.locator("[data-objects-validation-list]")).toHaveText("PASS: Paddle + ball MVP object setup is ready.");
    await expect(page.locator("[data-objects-output] pre, [data-objects-output] code")).toHaveCount(0);
    await expect(page.locator("[data-objects-output]")).not.toContainText("{");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Objects blocks invalid draft rows with actionable validation", async ({ page }) => {
  const failures = await openObjectsPage(page);

  try {
    await page.getByRole("button", { name: "Add Object" }).click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Draft blocked: 3 validation actions.");
    await expect(page.locator("[data-objects-validation-list]")).toContainText("Object Type: Choose Static, Dynamic, Collectible, Hazard, or Goal.");
    await expect(page.locator("[data-objects-validation-list]")).toContainText("MVP Role: Choose the MVP role this object serves.");
    await expect(page.locator("[data-objects-validation-list]")).toContainText("Object Name: Name the object before adding it to the draft list.");
    await expect(page.locator("[data-objects-list] tr")).toHaveCount(1);
    await expect(page.locator("[data-objects-list]")).toContainText("No objects drafted yet.");

    await page.getByLabel("Object Type").selectOption("Static");
    await page.getByLabel("MVP Role").selectOption("Paddle");
    await page.getByLabel("Object Name").fill("Static Paddle");
    await page.getByRole("button", { name: "Add Object" }).click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Draft blocked: 1 validation action.");
    await expect(page.locator("[data-objects-validation-list]")).toContainText("Paddle Type: Set the Paddle role to Dynamic");

    await page.getByLabel("Object Type").selectOption("Dynamic");
    await page.getByLabel("Behavior Notes").fill("Moves from input.");
    await page.getByLabel("Interaction Notes").fill("Deflects the ball.");
    await page.getByRole("button", { name: "Add Object" }).click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Added Static Paddle as a Dynamic Paddle.");
    await expect(page.locator("[data-objects-list]")).toContainText("Static Paddle");
    await expect(page.locator("[data-objects-readiness]")).toHaveText("Needs Input");
    await expect(page.locator("[data-objects-validation-list]")).toContainText("Dynamic ball");

    await page.locator("[data-objects-remove='static-paddle']").click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Removed object from the in-memory draft.");
    await expect(page.locator("[data-objects-list]")).toContainText("No objects drafted yet.");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
