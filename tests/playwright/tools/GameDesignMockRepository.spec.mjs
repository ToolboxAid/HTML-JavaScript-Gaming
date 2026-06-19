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

test("Game Design shows an actionable overlay when game context is missing", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html?game=missing");

  try {
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-game-design-game-overlay]")).toBeVisible();
    await expect(page.locator("[data-game-design-validation-overlay]")).toBeVisible();
    await expect(page.locator("[data-game-design-validation-list]")).toContainText("Game Context");
    await expect(page.locator("[data-game-design-game-context]")).toHaveText("No Game Hub game");
    await expect(page.locator("[data-game-design-output]")).not.toContainText("{");
    await expect(page.locator("[data-game-design-output]")).not.toContainText('"activeGameId"');

    await page.getByRole("button", { name: "Save Game Design" }).click();
    await expect(page.locator("[data-game-design-log]")).toHaveText("Open or seed a game before saving Game Design.");
    await expect(page.locator("[data-game-design-output-validation]")).toHaveText("Blocked");
    await expect(page.locator("[data-game-design-output-missing]")).toHaveText("Game Context");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Game Design saves and updates design fields against the active game", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html");

  try {
    await expect(page.locator("[data-game-design-game-context]")).toHaveText("Demo Game - Game");
    await expect(page.getByText("Game Context", { exact: true })).toHaveCount(1);
    await expect(page.locator("[data-game-design-game-context] select, [data-game-design-game-context] input, [data-game-design-game-context] button, [data-game-design-game-context] a")).toHaveCount(0);
    await expect(page.locator("[data-game-design-active-game], [data-game-design-game-purpose], [data-game-design-game-status], [data-game-design-game-select]")).toHaveCount(0);
    await expect(page.locator(".tool-center-panel [data-game-design-form]")).toBeVisible();
    await expect(page.locator("aside [data-game-design-form]")).toHaveCount(0);
    await expect(page.locator("[data-game-design-form] style, [data-game-design-form] [style], [data-game-design-form] script:not([src])")).toHaveCount(0);
    const gameDesignTable = page.locator("[data-game-design-game-design-table]");
    await expect(gameDesignTable).toBeVisible();
    await expect(gameDesignTable).toHaveClass(/data-table/);
    await expect(gameDesignTable).toHaveClass(/tool-form-table/);
    await expect(gameDesignTable.locator("tbody tr")).toHaveCount(6);
    await expect(gameDesignTable.locator("th[scope='row'] label")).toHaveText([
      "Game Type",
      "Genre",
      "Play Style",
      "Player Mode",
      "Design Summary",
      "Capability Demo Notes"
    ]);
    const gameDesignPairs = await gameDesignTable.locator("tbody tr").evaluateAll((rows) => rows.map((row) => {
      const label = row.querySelector("th label");
      const control = row.querySelector("td select, td textarea");
      return {
        cellCount: row.children.length,
        controlId: control?.id ?? null,
        controlTag: control?.tagName.toLowerCase() ?? null,
        labelFor: label?.getAttribute("for") ?? null,
        labelText: label?.textContent.trim() ?? null
      };
    }));
    expect(gameDesignPairs).toEqual([
      { cellCount: 2, controlId: "gameDesignType", controlTag: "select", labelFor: "gameDesignType", labelText: "Game Type" },
      { cellCount: 2, controlId: "gameDesignGenre", controlTag: "select", labelFor: "gameDesignGenre", labelText: "Genre" },
      { cellCount: 2, controlId: "gameDesignPlayStyle", controlTag: "select", labelFor: "gameDesignPlayStyle", labelText: "Play Style" },
      { cellCount: 2, controlId: "gameDesignPlayerMode", controlTag: "select", labelFor: "gameDesignPlayerMode", labelText: "Player Mode" },
      { cellCount: 2, controlId: "gameDesignSummary", controlTag: "textarea", labelFor: "gameDesignSummary", labelText: "Design Summary" },
      { cellCount: 2, controlId: "gameDesignCapabilityNotes", controlTag: "textarea", labelFor: "gameDesignCapabilityNotes", labelText: "Capability Demo Notes" }
    ]);
    await expect(page.locator("#gameDesignSummary")).toHaveAttribute("rows", "4");
    await expect(page.locator("#gameDesignCapabilityNotes")).toHaveAttribute("rows", "4");
    const gameDesignLayout = await gameDesignTable.evaluate((table) => {
      const wrapper = table.closest(".table-wrapper");
      const firstRow = table.querySelector("tbody tr");
      const labelCell = firstRow?.querySelector("th");
      const inputCell = firstRow?.querySelector("td");
      const select = firstRow?.querySelector("select");
      const textarea = table.querySelector("textarea");
      const tableBox = table.getBoundingClientRect();
      const wrapperBox = wrapper?.getBoundingClientRect();
      const labelBox = labelCell?.getBoundingClientRect();
      const inputBox = inputCell?.getBoundingClientRect();
      const selectBox = select?.getBoundingClientRect();
      const textareaBox = textarea?.getBoundingClientRect();
      return {
        controlColumnIsDominant: Boolean(labelBox && inputBox && inputBox.width > labelBox.width),
        labelColumnIsCompact: Boolean(labelBox && tableBox && labelBox.width < tableBox.width * 0.4),
        labelTextAlign: labelCell ? getComputedStyle(labelCell).textAlign : "",
        selectFillsInputColumn: Boolean(selectBox && inputBox && selectBox.width >= inputBox.width - 32),
        tableUsesWrapperWidth: Boolean(tableBox && wrapperBox && tableBox.width >= wrapperBox.width - 2),
        textareaFillsInputColumn: Boolean(textareaBox && inputBox && textareaBox.width >= inputBox.width - 32)
      };
    });
    expect(gameDesignLayout).toEqual({
      controlColumnIsDominant: true,
      labelColumnIsCompact: true,
      labelTextAlign: "right",
      selectFillsInputColumn: true,
      tableUsesWrapperWidth: true,
      textareaFillsInputColumn: true
    });
    await expect(page.locator("[data-game-design-output] pre, [data-game-design-output] code")).toHaveCount(0);
    await expect(page.locator("[data-game-design-output]")).toContainText("Design Summary");
    await expect(page.locator("[data-game-design-output]")).toContainText("Player Mode");
    await expect(page.locator("[data-game-design-output]")).toContainText("Validation Status");
    await expect(page.locator("[data-game-design-output]")).toContainText("Next Step");
    await expect(page.locator("[data-game-design-output]")).not.toContainText("{");
    await expect(page.locator("[data-game-design-output]")).not.toContainText('"gameType"');
    await expect(page.locator("[data-game-design-validation-overlay]")).toBeVisible();
    await expect(page.locator("[data-game-design-validation-list]")).toContainText("Game Type");
    await expect(page.locator("[data-game-design-validation-list]")).toContainText("Genre");
    await expect(page.locator("[data-game-design-validation-list]")).toContainText("Play Style");
    await expect(page.locator("[data-game-design-validation-list]")).toContainText("Design Summary");

    await page.getByLabel("Game Type").selectOption("Puzzle");
    await page.getByLabel("Genre").selectOption("Adventure");
    await page.getByLabel("Play Style").selectOption("Single Player");
    await page.getByLabel("Player Mode").selectOption("2+ Concurrent");
    await page.getByLabel("Design Summary").fill("A compact puzzle adventure with one clear game promise.");
    await page.getByRole("button", { name: "Save Game Design" }).click();

    await expect(page.locator("[data-game-design-log]")).toHaveText("Saved Demo Game as ready for Game Design.");
    await expect(page.locator("[data-game-design-validation-overlay]")).toBeHidden();
    await expect(page.locator("[data-game-design-status]")).toHaveText("Ready");
    await expect(page.locator("[data-game-design-recommended-tool]").first()).toHaveText("Game Configuration");
    await expect(page.locator("[data-game-design-output-summary]")).toHaveText("A compact puzzle adventure with one clear game promise.");
    await expect(page.locator("[data-game-design-output-player-mode]")).toHaveText("2+ Concurrent");
    await expect(page.locator("[data-game-design-output-validation]")).toHaveText("Ready");
    await expect(page.locator("[data-game-design-output-next-step]")).toHaveText("Game Configuration");
    await expect(page.locator("[data-game-design-output-missing]")).toHaveText("None");
    await expect(page.locator("[data-game-design-configuration-link]")).toHaveAttribute(
      "href",
      "toolbox/game-configuration/index.html?handoff=valid&game=demo-game"
    );

    await page.getByLabel("Genre").selectOption("Fantasy");
    await page.getByRole("button", { name: "Save Game Design" }).click();
    await expect(page.locator("[data-game-design-output]")).not.toContainText('"genre"');
    await expect(page.locator("[data-game-design-log]")).toHaveText("Saved Demo Game as ready for Game Design.");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Game Design authors capability demos as Game Hub games", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html?game=gravity-demo");

  try {
    await expect(page.locator("[data-game-design-game-context]")).toHaveText("Gravity Demo - Capability Demo");
    await expect(page.getByText("Capability demos remain Game Hub games.")).toBeVisible();
    await expect(page.locator("[data-game-design-capability-demos]")).toContainText("Gravity Demo: Game Hub game");
    await expect(page.getByLabel("Game Type")).toHaveValue("Capability Demo");
    await expect(page.getByLabel("Genre")).toHaveValue("Utility");
    await expect(page.getByLabel("Play Style")).toHaveValue("Guided Tutorial");
    await expect(page.locator("[data-game-design-validation-overlay]")).toBeHidden();

    await page.getByLabel("Capability Demo Notes").fill("Gravity demo remains game-owned authoring data.");
    await page.getByRole("button", { name: "Save Game Design" }).click();
    await expect(page.locator("[data-game-design-output]")).not.toContainText("{");
    await expect(page.locator("[data-game-design-output]")).not.toContainText('"capabilityDemoAuthoring"');
    await expect(page.locator("[data-game-design-output-capability]")).toHaveText("Gravity Demo remains a Game Hub game.");
    await expect(page.locator("[data-game-design-table-counts]")).toContainText("game_design_capability_demos");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Toolbox Build Path view shows the active workflow table", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html");

  try {
    await expect(page.getByRole("button", { name: "Progress" })).toHaveCount(0);

    await page.getByRole("button", { name: "Build Path" }).click();
    await expect(page.locator("[data-build-path-table='workflow']")).toBeVisible();
    await expect(page.locator("[data-build-path-tool='Colors']")).toContainText("Colors");
    await expect(page.locator("[data-build-path-tool='Colors']")).toContainText("Complete");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
