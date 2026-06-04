import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "project-workspace",
    surface: "project workspace mock repository"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
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

  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { failedRequests, pageErrors, consoleErrors, server };
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

test("Project Workspace creates, opens, and deletes mock projects", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/project-workspace/index.html");

  try {
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-active-project-name]")).toHaveText("Demo Project");
    await expect(page.locator("[data-project-list]")).toContainText("Demo Project");
    const demoProjectRow = page.locator("[data-project-row='demo-project']");
    await expect(demoProjectRow.locator("> .status")).toHaveCount(0);
    await expect(demoProjectRow.getByRole("button", { name: "Open Demo Project (Active)" })).toHaveClass(/primary/);
    await expect(demoProjectRow.getByRole("button", { name: "Open Demo Project (Active)" })).toHaveAttribute("aria-current", "true");

    await page.getByLabel("Project Name").fill("Launch Test Project");
    await page.getByRole("button", { name: "Create Project" }).click();
    await expect(page.locator("[data-active-project-name]")).toHaveText("Launch Test Project");
    await expect(page.locator("[data-project-list]")).toContainText("Launch Test Project");
    await expect(page.locator("[data-project-row='launch-test-project-1']").getByRole("button", { name: "Open Launch Test Project (Active)" })).toHaveClass(/primary/);
    await expect(page.locator("[data-project-workspace-log]")).toHaveText("Created and opened Launch Test Project.");

    await page.getByLabel("Project Name").fill("Archive Project");
    await page.getByRole("button", { name: "Create Project" }).click();
    await expect(page.locator("[data-active-project-name]")).toHaveText("Archive Project");

    await page.getByRole("button", { name: "Open Launch Test Project" }).click();
    await expect(page.locator("[data-active-project-name]")).toHaveText("Launch Test Project");
    await expect(page.locator("[data-project-row='launch-test-project-1']").getByRole("button", { name: "Open Launch Test Project (Active)" })).toHaveAttribute("data-project-active", "true");
    await expect(page.locator("[data-project-workspace-log]")).toHaveText("Opened Launch Test Project.");

    await page.getByRole("button", { name: "Delete Open Project" }).click();
    await expect(page.locator("[data-active-project-name]")).not.toHaveText("Launch Test Project");
    await expect(page.locator("[data-project-list]")).not.toContainText("Launch Test Project");
    await expect(page.locator("[data-project-workspace-log]")).toHaveText("Deleted Launch Test Project.");

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Project Workspace progress panels update from mock project state", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/project-workspace/index.html");

  try {
    await expect(page.locator("[data-project-status]")).toHaveText("Under Construction");
    await expect(page.locator("[data-project-progress]")).toHaveText("Demo Project identity ready");
    await expect(page.locator("[data-publishing-progress]")).toHaveText("Publish blocked until configuration and required assets are ready");
    await expect(page.locator("[data-current-focus]")).toHaveText("Complete Game Configuration");
    await expect(page.locator("[data-recommended-next-tool]").first()).toHaveText("Game Configuration");
    await expect(page.locator("[data-project-progress-checklist]")).toContainText("Project identity: Complete");
    await expect(page.locator("[data-project-output-panels] summary")).toHaveText([
      "Readiness Output",
      "Repository Tables",
      "Project Members"
    ]);
    await expect(page.locator("aside.tool-column").last().getByText("Readiness Output")).toHaveCount(0);
    await expect(page.locator("aside.tool-column").last().getByText("Repository Tables")).toHaveCount(0);
    await expect(page.locator("aside.tool-column").last().getByText("Project Members")).toHaveCount(0);
    const panelOrderIsCorrect = await page.locator(".tool-center-panel").evaluate((panel) => {
      const staticOverlay = panel.querySelector("[data-static-overlay-wireframe]");
      const outputPanels = panel.querySelector("[data-project-output-panels]");
      const missingRequirements = panel.querySelector("[data-missing-requirements]");
      return Boolean(
        staticOverlay &&
        outputPanels &&
        missingRequirements &&
        (staticOverlay.compareDocumentPosition(outputPanels) & Node.DOCUMENT_POSITION_FOLLOWING) &&
        (outputPanels.compareDocumentPosition(missingRequirements) & Node.DOCUMENT_POSITION_FOLLOWING)
      );
    });
    expect(panelOrderIsCorrect).toBe(true);

    await page.getByLabel("Project Name").fill("Progress Review Project");
    await page.getByRole("button", { name: "Create Project" }).click();
    await expect(page.locator("[data-project-status]")).toHaveText("Under Construction");
    await expect(page.locator("[data-project-progress]")).toHaveText("Progress Review Project identity ready");
    await expect(page.locator("[data-table-counts], [data-project-table-counts]")).toContainText("projects");
    await expect(page.locator("[data-project-table-counts]")).toContainText("2");
    await expect(page.locator("[data-project-members-table]")).toContainText("Owner");

    await page.getByRole("button", { name: "Delete Open Project" }).click();
    await expect(page.locator("[data-active-project-name]")).toHaveText("Demo Project");
    await expect(page.locator("[data-project-progress]")).toHaveText("Demo Project identity ready");

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Toolbox Project Data controls are admin-only and drive mock Progress and Build Path views", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html?role=guest");

  try {
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveText(/GUEST VIEW.*Preview only.*Sign in to create/);
    await expect(page.locator("[data-project-data-menu]")).toBeHidden();
    await expect(page.locator("[data-project-data-action]:visible")).toHaveCount(0);

    await page.goto(`${failures.server.baseUrl}/toolbox/index.html?role=user`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveText(/CREATOR VIEW.*Project tools enabled.*Switch to Admin View/);
    await expect(page.locator("[data-project-data-menu]")).toBeHidden();
    await expect(page.locator("[data-project-data-action]:visible")).toHaveCount(0);

    await page.goto(`${failures.server.baseUrl}/toolbox/index.html?role=admin`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-role-banner]")).toHaveText(/ADMIN VIEW.*Planned tools visible.*Switch to Creator View/);
    await expect(page.locator("[data-project-data-menu]")).toBeVisible();
    await expect(page.locator("[aria-label='Toolbox role simulation']")).toHaveClass(/section-head/);
    const roleBannerBox = await page.locator("[data-toolbox-role-banner]").boundingBox();
    const projectDataBox = await page.locator("[data-project-data-menu] > summary").boundingBox();
    expect(roleBannerBox).not.toBeNull();
    expect(projectDataBox).not.toBeNull();
    expect(Math.abs((roleBannerBox.y + roleBannerBox.height / 2) - (projectDataBox.y + projectDataBox.height / 2))).toBeLessThan(16);
    expect(projectDataBox.x).toBeGreaterThan(roleBannerBox.x + roleBannerBox.width);
    await page.locator("[data-project-data-menu] summary").click();

    await page.getByRole("button", { name: "Clear Test Data" }).click();
    await expect(page.locator("[data-project-data-status]")).toHaveText("Test data cleared. Active project: none.");
    await page.getByRole("button", { name: "Progress" }).click();
    await expect(page.getByText("Active Project: No active project", { exact: true })).toBeVisible();
    await expect(page.getByText("Project Progress: No active project")).toBeVisible();
    await page.getByRole("button", { name: "Build Path" }).click();
    await expect(page.getByText(/Active mock project: none/)).toBeVisible();

    await page.getByRole("button", { name: "Seed Demo Project" }).click();
    await expect(page.locator("[data-project-data-status]")).toHaveText("Demo Project seeded. Active project: Demo Project.");
    await expect(page.getByText(/Active mock project: Demo Project/)).toBeVisible();

    await page.getByRole("button", { name: "Progress" }).click();
    await expect(page.getByText("Active Project: Demo Project", { exact: true })).toBeVisible();
    await expect(page.getByText("Project Progress: Demo Project identity ready")).toBeVisible();

    await page.getByRole("button", { name: "Reset Project Data" }).click();
    await expect(page.locator("[data-project-data-status]")).toHaveText("Project Data reset. Active project: Demo Project.");
    await expect(page.getByText("Active Project: Demo Project", { exact: true })).toBeVisible();

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});
