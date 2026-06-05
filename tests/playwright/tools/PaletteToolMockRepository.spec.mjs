import { expect, test } from "@playwright/test";
import {
  PALETTE_WORKSPACE_PATH,
  createProjectWorkspacePaletteRepository
} from "../../../toolbox/colors/palette-workspace-repository.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const sourcePalettes = {
  reference: [
    { symbol: "R", hex: "#FF0000", name: "Reference Red", source: "reference" },
    { symbol: "G", hex: "#00FF00", name: "Reference Green", source: "reference" }
  ]
};

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "palette-tool",
    surface: "Palette Tool project palette runtime"
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

test("Palette repository owns active project swatches without mutating invalid payloads", async () => {
  const repository = createProjectWorkspacePaletteRepository({ sourcePalettes });
  const baseline = repository.getSnapshot();

  expect(baseline.palettePath).toBe(PALETTE_WORKSPACE_PATH);
  expect(baseline.workspace.tools["palette-browser"].swatches).toEqual([]);
  expect(baseline.validation.status).toBe("Ready");

  const invalidInput = { symbol: "AB", hex: "#112233", name: "Invalid Symbol", tags: ["Hero"] };
  const invalidResult = repository.addSwatch(invalidInput);
  expect(invalidResult.ok).toBe(false);
  expect(invalidResult.issues.map((issue) => issue.label)).toContain("Symbol");
  expect(invalidInput.tags).toEqual(["Hero"]);
  expect(repository.getSnapshot().workspace.tools["palette-browser"].swatches).toEqual([]);

  const addResult = repository.addSwatch({
    symbol: "H",
    hex: "#123456AA",
    name: "Hero Blue",
    tags: "Hero, UI, hero"
  });
  expect(addResult.ok).toBe(true);
  expect(repository.getSnapshot().workspace.tools["palette-browser"].swatches).toEqual([
    {
      hex: "#123456AA",
      name: "Hero Blue",
      source: "user",
      symbol: "H",
      tags: ["hero", "ui"]
    }
  ]);

  expect(repository.addSwatch({ symbol: "H", hex: "#654321", name: "Other" }).ok).toBe(false);
  expect(repository.addSwatch({ symbol: "O", hex: "#654321", name: "Hero Blue" }).ok).toBe(false);
  expect(repository.addSwatch({ symbol: "O", hex: "#123456", name: "Other" }).ok).toBe(false);

  const updateResult = repository.updateSelectedSwatch({
    symbol: "J",
    hex: "#ABCDEF",
    name: "Hero Updated",
    tags: "primary"
  });
  expect(updateResult.ok).toBe(true);
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({
    hex: "#ABCDEF",
    name: "Hero Updated",
    symbol: "J",
    tags: ["primary"]
  });

  expect(repository.undo().ok).toBe(true);
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({ name: "Hero Blue", symbol: "H" });
  expect(repository.redo().ok).toBe(true);
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({ name: "Hero Updated", symbol: "J" });

  const pinResult = repository.pinSourceSwatch(sourcePalettes.reference[0]);
  expect(pinResult.ok).toBe(true);
  expect(repository.findSwatch("R")).toMatchObject({ name: "Reference Red", source: "reference" });

  repository.selectSwatch("R");
  repository.recordSwatchUsage({ assetId: "asset.color.red", symbol: "R", toolId: "assets" });
  const blockedRemoval = repository.removeSelectedSwatch();
  expect(blockedRemoval.ok).toBe(false);
  expect(blockedRemoval.message).toBe("Palette removal blocked: swatch is used by dependent tools.");

  const invalidPayload = {
    tools: {
      "palette-browser": {
        swatches: [{ symbol: "XX", hex: "#FFFFFF", name: "Invalid" }]
      }
    }
  };
  const invalidPayloadCopy = structuredClone(invalidPayload);
  const loadResult = repository.loadActiveProjectPalettePayload(invalidPayload);
  expect(loadResult.ok).toBe(false);
  expect(invalidPayload).toEqual(invalidPayloadCopy);
});

test("Palette Tool adds, updates, pins, validates, and shows project-owned details", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/colors/index.html");

  try {
    await expect(page.getByRole("heading", { name: "Colors", exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Active Project Palette", exact: true })).toBeVisible();
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(/import json|export json/i);
    await expect(page.locator("[data-palette-active-project]")).toHaveText("Demo Project - Game Project");
    await expect(page.locator("[data-palette-storage-path]")).toHaveText("tools.palette-browser.swatches");
    await expect(page.locator("[data-palette-count]")).toHaveText("0");

    await page.getByRole("button", { name: "Add Swatch" }).click();
    await expect(page.locator("[data-palette-validation-overlay]")).toBeVisible();
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Symbol");
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Hex");
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Name");

    await page.getByLabel("Symbol").fill("H");
    await page.getByLabel("Hex").fill("#123456aa");
    await page.getByLabel("Name").fill("Hero Blue");
    await page.getByLabel("Tags").fill("Hero, UI, hero");
    await page.getByRole("button", { name: "Add Swatch" }).click();
    await expect(page.locator("[data-palette-count]")).toHaveText("1");
    await expect(page.locator("[data-palette-user-list]")).toContainText("Hero Blue");
    await expect(page.locator("[data-palette-user-list]")).toContainText("#123456AA");
    await expect(page.locator("[data-palette-user-list]")).toContainText("hero, ui");
    await expect(page.locator("[data-palette-selected-details]")).toContainText("Symbol: H");
    await expect(page.locator("[data-palette-selected-details]")).toContainText("Source: User Added");
    await expect(page.locator("[data-palette-harmony-list]")).toContainText("Complement");

    await page.getByLabel("Symbol").fill("J");
    await page.getByLabel("Hex").fill("#ABCDEF");
    await page.getByLabel("Name").fill("Hero Updated");
    await page.getByLabel("Tags").fill("primary");
    await page.getByRole("button", { name: "Update Selected" }).click();
    await expect(page.locator("[data-palette-user-list]")).toContainText("Hero Updated");
    await expect(page.locator("[data-palette-user-list]")).toContainText("primary");

    await page.getByRole("button", { name: "Undo" }).click();
    await expect(page.locator("[data-palette-user-list]")).toContainText("Hero Blue");
    await page.getByRole("button", { name: "Redo" }).click();
    await expect(page.locator("[data-palette-user-list]")).toContainText("Hero Updated");

    await page.getByLabel("Search").fill("black");
    await page.locator("[data-palette-source-list] [data-palette-pin-source]").first().click();
    await expect(page.locator("[data-palette-count]")).toHaveText("2");
    await expect(page.locator("[data-palette-user-list]")).toContainText("Black");

    await page.getByLabel("Symbol").fill("J");
    await page.getByLabel("Hex").fill("#111111");
    await page.getByLabel("Name").fill("Duplicate Symbol");
    await page.getByRole("button", { name: "Add Swatch" }).click();
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Duplicate Symbol");

    await page.getByRole("button", { name: "Clear Form" }).click();
    await expect(page.getByLabel("Symbol")).toHaveValue("");
    await expect(page.locator("[data-palette-log]")).toHaveText("Editor form cleared.");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Palette Tool rejects invalid payloads before render and blocks editing without an active project", async ({ page }) => {
  const invalidFailures = await openRepoPage(page, "/toolbox/colors/index.html?palette=invalid");

  try {
    await expect(page.locator("[data-palette-log]")).toContainText("Invalid palette payload rejected before render");
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Symbol must be exactly one character.");
    await expect(page.locator("[data-palette-count]")).toHaveText("0");
    expectNoPageFailures(invalidFailures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await invalidFailures.server.close();
  }

  const missingProjectFailures = await openRepoPage(page, "/toolbox/colors/index.html?project=missing");

  try {
    await expect(page.locator("[data-palette-active-project]")).toHaveText("No active project.");
    await expect(page.locator("[data-palette-project-overlay]")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Swatch" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Update Selected" })).toBeDisabled();
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Active Project");
    expectNoPageFailures(missingProjectFailures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await missingProjectFailures.server.close();
  }
});
