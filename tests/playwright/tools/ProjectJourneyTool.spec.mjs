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
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for selected note: Palette and Input Density.");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("3");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("3");
    await expect(page.locator("[data-journey-stat-not-started]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-in-progress]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-decide]")).toHaveText("1");
    const statusIconPattern = /[\u2b1c\u26d4\u2753\u2705]|\u{1f7e1}/u;
    const statTileLayout = await page.locator("[aria-label='Selected note statistics'] .mini-stat").evaluateAll((tiles) =>
      tiles.map((tile) => {
        const label = tile.querySelector("[data-journey-stat-label]");
        return {
          children: Array.from(tile.children).map((child) => child.tagName),
          labelClass: label?.className || "",
          labelText: label?.textContent?.trim() || "",
          hasStatusClass: Array.from(tile.querySelectorAll("*")).some((element) =>
            /\b(status|pill)\b/.test(element.className || ""),
          ),
        };
      }),
    );
    expect(statTileLayout).toHaveLength(7);
    expect(statTileLayout.map((tile) => tile.children)).toEqual([
      ["STRONG", "SPAN"],
      ["STRONG", "SPAN"],
      ["STRONG", "SPAN"],
      ["STRONG", "SPAN"],
      ["STRONG", "SPAN"],
      ["STRONG", "SPAN"],
      ["STRONG", "SPAN"],
    ]);
    expect(statTileLayout.map((tile) => tile.labelText)).toEqual([
      "Open",
      "Total",
      "Not Started",
      "Blocked",
      "Decisions",
      "In Progress",
      "Complete",
    ]);
    expect(statTileLayout.every((tile) => tile.labelClass === "" && !tile.hasStatusClass && !statusIconPattern.test(tile.labelText))).toBe(true);
    await expect(page.locator("[aria-label='Selected note statistics']")).not.toContainText(statusIconPattern);
    await expect(page.locator("[data-journey-note-button='note-design-pass']")).toHaveClass(/primary/);
    await expect(page.locator("[data-journey-entry-button='entry-design-1']")).toHaveClass(/primary/);
    await expect(page.locator("#journeyStatusInput option")).toHaveText([
      "⬜ Not Started",
      "⛔ Blocker",
      "❓ Decide",
      "🟡 In Progress",
      "✅ Complete"
    ]);
    const dropdownLabels = await page.locator("#journeyStatusInput option").allTextContents();
    expect(dropdownLabels.some((label) => /\[[ .x!?]\]/.test(label))).toBe(false);
    await expect(page.locator("[data-journey-status-legend] span")).toHaveText([
      "⬜ Not Started",
      "⛔ Blocker",
      "❓ Decide",
      "🟡 In Progress",
      "✅ Complete"
    ]);
    await expect(page.locator("aside.tool-column").last().locator("details > summary", { hasText: /^Status Legend$/ })).toHaveCount(0);
    const legendFollowsStats = await page.locator("[data-journey-status-legend]").evaluate((legend) => {
      const statistics = legend.closest("details");
      const statGrid = statistics?.querySelector("[aria-label='Selected note statistics']");
      return Boolean(statGrid && (statGrid.compareDocumentPosition(legend) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    expect(legendFollowsStats).toBe(true);
    await expect(page.locator("table[aria-label='Project Journey note summary'] thead th")).toHaveText([
      "Name",
      "Type",
      "⬜",
      "⛔",
      "❓",
      "🟡",
      "✅",
      "Open",
      "Total",
      "Updated"
    ]);
    await expect(page.getByText("Current Folder")).toHaveCount(0);
    await expect(page.getByText("Return to root index")).toHaveCount(0);
    await expect(page.getByText("Open folder")).toHaveCount(0);
    await expect(page.getByLabel("Indent")).toHaveCount(0);
    await expect(page.locator("[data-journey-entry-tree] ul ul li", { hasText: "Confirm batch tag language" })).toBeVisible();

    await page.getByLabel("Entry").fill("Batch verification row");
    await page.getByLabel("Status").selectOption("blocker");
    await page.getByRole("button", { name: "Add Row" }).click();
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("4");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("4");
    await expect(page.locator("[data-journey-stat-blocker]")).toHaveText("1");
    await expect(page.locator("[data-journey-entry-tree]")).toContainText("Batch verification row");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(3)).toHaveText("1");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(7)).toHaveText("4");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(8)).toHaveText("4");

    await page.getByLabel("Status").selectOption("complete");
    await page.getByRole("button", { name: "Update Row" }).click();
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("3");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("4");
    await expect(page.locator("[data-journey-stat-complete]")).toHaveText("1");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(6)).toHaveText("1");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(7)).toHaveText("3");
    await expect(page.locator("tbody tr", { hasText: "Palette and Input Density" }).locator("td").nth(8)).toHaveText("4");

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
    await page.locator("[data-journey-filter='mine']").click();
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: My Notes (2 notes).");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("5");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("5");
    await expect(page.locator("[data-journey-stat-not-started]")).toHaveText("2");
    await expect(page.locator("[data-journey-stat-in-progress]")).toHaveText("2");
    await expect(page.locator("[data-journey-stat-decide]")).toHaveText("1");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Palette and Input Density");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Story Beats");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Release Readiness");

    await page.locator("[data-journey-filter='all']").click();
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: All Notes (4 notes).");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("8");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("7");

    await page.locator("[data-journey-filter='blocker']").click();
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: Blocked (1 notes).");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("2");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-blocker]")).toHaveText("1");
    await expect(page.locator("[data-journey-stat-complete]")).toHaveText("1");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Release Readiness");
    await expect(page.locator("[data-journey-summary-body]")).not.toContainText("Story Beats");

    await page.getByRole("button", { name: "Release Readiness" }).click();
    await expect(page.locator("[data-journey-note-button='note-release-readiness']")).toHaveClass(/primary/);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for selected note: Release Readiness.");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("2");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("1");

    await page.locator("[data-journey-filter='decide']").click();
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: Decisions (2 notes).");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Palette and Input Density");
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Research Questions");

    await page.locator("[data-journey-filter='not-started']").click();
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: Not Started (2 notes).");

    await page.locator("[data-journey-filter='in-progress']").click();
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: In Progress (2 notes).");

    await page.locator("[data-journey-filter='complete']").click();
    await expect(page.locator("[data-journey-note-button].primary")).toHaveCount(0);
    await expect(page.locator("[data-journey-stat-scope]")).toHaveText("Statistics for filtered result set: Complete (1 notes).");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Project Journey enforces entry ownership while preserving system meaning", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/project-journey/index.html?project=demo-project");

  try {
    await expect(page.locator("[data-journey-entry-button='entry-design-1']")).toHaveClass(/primary/);
    await expect(page.getByRole("button", { name: "Delete Row" })).toHaveCount(0);
    const systemRow = page.locator("[data-journey-entry-row='entry-design-1']");
    await expect(systemRow.locator("[data-journey-delete-entry]")).toHaveCount(0);
    const systemIndicator = systemRow.locator("[data-journey-system-entry-indicator]");
    await expect(systemIndicator).toHaveAttribute("src", /forge-bot\.svg$/);
    await expect(systemIndicator).toHaveAttribute("alt", "forge-bot created");
    await expect(systemIndicator).toHaveAttribute("title", "forge-bot created");
    await expect(page.locator("[data-journey-editor-status]")).toContainText("System-created row");
    await expect(page.locator("[data-journey-editor-status]")).toContainText("Original meaning: Review palette swatch affordance");

    await page.getByLabel("Entry").fill("System row edited label");
    await page.getByLabel("Status").selectOption("blocker");
    await page.getByRole("button", { name: "Update Row" }).click();
    await expect(page.locator("[data-journey-entry-tree]")).toContainText("System row edited label");
    await expect(systemRow.locator("[data-journey-delete-entry]")).toHaveCount(0);
    await expect(page.locator("[data-journey-editor-status]")).toContainText("Original meaning: Review palette swatch affordance");

    await page.getByLabel("Entry").fill("User owned cleanup row");
    await page.getByLabel("Status").selectOption("not-started");
    await page.getByRole("button", { name: "Add Row" }).click();
    await expect(page.locator("[data-journey-entry-tree]")).toContainText("User owned cleanup row");
    await expect(page.locator("[data-journey-editor-status]")).toContainText("User-created row");
    const userRow = page.locator("[data-journey-entry-row]").filter({ hasText: "User owned cleanup row" });
    await expect(userRow.locator("[data-journey-system-entry-indicator]")).toHaveCount(0);
    await expect(userRow.locator("[data-journey-delete-entry]")).toHaveCount(1);
    const deleteUserRow = userRow.getByRole("button", { name: "Delete user-created row" });
    await expect(deleteUserRow).toBeVisible();
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("4");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("It is best to keep the note unless it was created by mistake.");
      await dialog.dismiss();
    });
    await deleteUserRow.click();
    await expect(page.locator("[data-journey-entry-tree]")).toContainText("User owned cleanup row");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("4");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("It is best to keep the note unless it was created by mistake.");
      await dialog.accept();
    });
    await deleteUserRow.click();
    await expect(page.locator("[data-journey-entry-tree]")).not.toContainText("User owned cleanup row");
    await expect(page.locator("[data-journey-stat-total]")).toHaveText("3");
    await expect(page.locator("[data-journey-stat-open]")).toHaveText("3");

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

    await page.goto(`${failures.server.baseUrl}/toolbox/index.html?role=user&view=group&group=build`, { waitUntil: "networkidle" });
    const userJourneyLink = page.locator("[data-toolbox-tool-name-link='Project Journey']").first();
    await expect(userJourneyLink).toHaveText("Project Journey");
    await expect(userJourneyLink).toHaveAttribute("href", /\/project-journey\/index\.html$/);
    await expect(userJourneyLink).toHaveAttribute("data-registered-tool-route", "toolbox/project-journey/index.html");

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

  const registrySource = await fs.readFile(path.join(repoRoot, "toolbox/toolRegistry.js"), "utf8");
  const projectJourneyRegistry = registrySource.match(/"id": "project-journey"[\s\S]*?"toolboxGroup": "Build"/)?.[0] || "";
  expect(projectJourneyRegistry).toContain('"status": "Ready"');
  expect(projectJourneyRegistry).toContain('"requiredForPublish": true');
  expect(projectJourneyRegistry).toContain('"adminOnly": false');
  expect(projectJourneyRegistry).toContain('"visibleInToolsList": true');
});
