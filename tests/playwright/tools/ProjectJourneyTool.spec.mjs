import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "project-journey",
    surface: "Project Journey tool"
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

function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function closeWithCoverage(page, failures) {
  await workspaceV2CoverageReporter.stop(page);
  await failures.server.close();
}

test("Project Journey edits rows and updates note summary counts live", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/project-journey/index.html?project=demo-project");

  try {
    await expect(page.locator("h1")).toHaveText("Project Journey");
    await expect(page.locator(".tool-workspace--wide")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-journey-active-project]")).toHaveText("Active project: Demo Project.");
    await expect(page.locator("[data-journey-selected-note]")).toContainText("Palette and Input Density");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("3");
    await expect(page.locator("[data-journey-stat-not-started]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-in-progress]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-decide]")).toHaveText("1");
    await expect(page.getByLabel("Indent")).toHaveCount(0);
    await expect(page.locator("[data-journey-entry-tree] ul ul li", { hasText: "Confirm batch tag language" })).toBeVisible();

    await page.getByLabel("Entry").fill("Batch verification row");
    await page.getByLabel("Status").selectOption("blocker");
    await page.getByRole("button", { name: "Add Row" }).click();
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("4");
    await expect(page.locator("[data-journey-stat-blocker]")).toHaveText("1");
    await expect(page.locator("[data-journey-entry-tree]")).toContainText("Batch verification row");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(2)).toHaveText("4");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(6)).toHaveText("1");

    await page.getByLabel("Status").selectOption("complete");
    await page.getByRole("button", { name: "Update Row" }).click();
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("3");
    await expect(page.locator("[data-journey-stat-complete]")).toHaveText("1");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(5)).toHaveText("1");

    await page.getByRole("button", { name: /Confirm batch tag language/ }).click();
    await page.getByRole("button", { name: "<" }).click();
    await expect(page.locator("[data-journey-entry-tree] > ul > li", { hasText: "Confirm batch tag language" })).toBeVisible();
    await page.getByRole("button", { name: ">" }).click();
    await expect(page.locator("[data-journey-entry-tree] ul ul li", { hasText: "Confirm batch tag language" })).toBeVisible();

    await page.getByRole("button", { name: /Review palette swatch affordance/ }).click();
    await page.getByRole("button", { name: "Move Down" }).click();
    await expect(page.locator("[data-journey-entry-button]").first()).toContainText("Confirm batch tag language");
    await page.getByRole("button", { name: "Move Up" }).click();
    await expect(page.locator("[data-journey-entry-button]").first()).toContainText("Review palette swatch affordance");

    const suggestedLinks = page.locator("[data-journey-suggested-tools] a");
    await expect(suggestedLinks.first()).toHaveAttribute("href", /toolbox\/index\.html\?view=group&group=/);
    await expect(suggestedLinks.first()).toHaveAttribute("href", /context=project-journey/);

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Project Journey filters all notes, my notes, and status-specific notes", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/project-journey/index.html?project=demo-project");

  try {
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Release Readiness");
    await page.getByRole("button", { name: "My Notes" }).click();
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Palette and Input Density");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Story Beats");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Release Readiness");

    await page.getByRole("button", { name: "All Notes" }).click();
    await page.getByRole("button", { name: "Blocked" }).click();
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Release Readiness");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Story Beats");

    await page.getByRole("button", { name: "Decisions" }).click();
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Palette and Input Density");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Research Questions");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Project Journey requires an active project before editing", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/project-journey/index.html?project=none");

  try {
    await expect(page.locator("[data-journey-active-project]")).toContainText("No active project is open");
    await expect(page.locator("[data-journey-diagnostics]")).toContainText("Open a project in Project Workspace");
    await expect(page.getByRole("button", { name: "Add Row" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Update Row" })).toBeDisabled();
    await expect(page.getByLabel("Entry")).toBeDisabled();

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Project Workspace hands the active project route to Project Journey", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/project-workspace/index.html");

  try {
    const journeyLink = page.getByRole("link", { name: "Open Project Journey" });
    await expect(journeyLink).toHaveAttribute("href", /toolbox\/project-journey\/index\.html\?project=demo-project$/);
    await journeyLink.click();
    await page.waitForURL(/toolbox\/project-journey\/index\.html\?project=demo-project$/);
    await expect(page.locator("[data-journey-active-project]")).toHaveText("Active project: Demo Project.");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Toolbox registration exposes Project Journey navigation", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html?role=admin&view=group&group=build");

  try {
    const journeyLink = page.locator("[data-toolbox-tool-name-link='Project Journey']").first();
    await expect(journeyLink).toHaveText("Project Journey");
    await expect(journeyLink).toHaveAttribute("href", /\/project-journey\/index\.html$/);
    await expect(journeyLink).toHaveAttribute("data-registered-tool-route", "toolbox/project-journey/index.html");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Project Journey source stays separate from notes files and browser persistence", async () => {
  const sourcePaths = [
    "toolbox/project-journey/index.html",
    "toolbox/project-journey/project-journey.js",
    "toolbox/project-journey/project-journey-mock-repository.js"
  ];
  const banned = [
    "admin" + "-notes",
    "data-admin" + "-note",
    "local" + "Storage",
    "session" + "Storage"
  ];

  for (const relativePath of sourcePaths) {
    const source = await fs.readFile(path.join(repoRoot, relativePath), "utf8");
    for (const value of banned) {
      expect(source.includes(value), `${relativePath} must not include ${value}`).toBe(false);
    }
  }
});
