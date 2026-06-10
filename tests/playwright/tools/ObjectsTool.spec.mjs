import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const ROLE_OPTIONS = ["Collectible", "Custom", "Enemy", "Goal", "Hazard", "Hero", "Platform", "Projectile", "Spawner", "UI", "Wall"];
const OLD_SAMPLE_PATH_PATTERN = new RegExp(["M" + "VP", "Padd" + "le", "Ba" + "ll"].join("|"), "i");

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "objects",
    surface: "Objects Tool table input",
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

function collectPageFailures(page) {
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

  return { consoleErrors, failedRequests, pageErrors };
}

async function openObjectsPage(page) {
  const server = await startRepoServer();
  const failures = collectPageFailures(page);
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/toolbox/objects/index.html`, { waitUntil: "networkidle" });
  return { ...failures, server };
}

async function openToolboxPage(page) {
  const server = await startRepoServer();
  const failures = collectPageFailures(page);
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
  return { ...failures, server };
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function fillActiveRow(page, { name, renderType = "None", role, state = "Active", type }) {
  await page.locator("[data-objects-row-name]").fill(name);
  await page.locator("[data-objects-row-type]").selectOption(type);
  await page.locator("[data-objects-row-role]").selectOption(role);
  await page.locator("[data-objects-row-state]").selectOption(state);
  await page.locator("[data-objects-row-render-type]").selectOption(renderType);
}

test("Objects exposes broad table input without sample-path wording", async ({ page }) => {
  const failures = await openObjectsPage(page);

  try {
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(OLD_SAMPLE_PATH_PATTERN);
    await expect(page.locator("[data-objects-role-basics] li")).toHaveText(ROLE_OPTIONS);
    await expect(page.locator("[data-objects-readiness]")).toHaveText("Needs Input");
    await expect(page.locator("[data-objects-validation-overlay]")).toBeVisible();
    await expect(page.locator("[data-objects-validation-list]")).toContainText("Object row: Add at least one object row.");
    await expect(page.locator("[data-objects-type-basics]")).toContainText("Static");
    await expect(page.locator("[data-objects-type-basics]")).toContainText("Dynamic");
    await expect(page.locator("[data-objects-type-basics]")).toContainText("Collectible");
    await expect(page.locator("[data-objects-type-basics]")).toContainText("Hazard");
    await expect(page.locator("[data-objects-type-basics]")).toContainText("Goal");
    await expect(page.locator("[data-objects-trait-basics]")).toContainText("movable");
    await expect(page.locator("[data-objects-trait-basics]")).toContainText("playerControlled");
    await expect(page.locator("[data-objects-trait-basics]")).toContainText("collides");
    await expect(page.locator("[data-objects-trait-basics]")).not.toContainText("bounces");

    const addAfterTable = await page.locator("[data-objects-list-table]").evaluate((table) => (
      Boolean(table.compareDocumentPosition(document.querySelector("[data-objects-add-row]")) & Node.DOCUMENT_POSITION_FOLLOWING)
    ));
    expect(addAfterTable).toBe(true);

    await page.getByRole("button", { name: "Seed Starter Objects" }).click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Seeded starter objects: Hero, Projectile, and Wall.");
    await expect(page.locator("[data-objects-readiness]")).toHaveText("Ready");
    await expect(page.locator("[data-objects-output-readiness]")).toHaveText("Ready");
    await expect(page.locator("[data-objects-count]")).toHaveText("3");
    await expect(page.locator("[data-objects-output-static]")).toHaveText("1");
    await expect(page.locator("[data-objects-output-dynamic]")).toHaveText("2");
    await expect(page.locator("[data-objects-validation-overlay]")).toBeHidden();
    await expect(page.locator("[data-objects-list] tr")).toHaveCount(3);
    await expect(page.locator("[data-objects-list]")).toContainText("Hero");
    await expect(page.locator("[data-objects-list]")).toContainText("Projectile");
    await expect(page.locator("[data-objects-list]")).toContainText("Wall");
    await expect(page.locator("[data-objects-list] [data-objects-edit-row]")).toHaveCount(3);
    await expect(page.locator("[data-objects-list] [data-objects-trash-row]")).toHaveCount(3);
    await expect(page.locator("[data-objects-output-render-asset]")).toHaveText("None");
    await expect(page.locator("[data-objects-edit-sprite]")).toBeHidden();
    await expect(page.locator("[data-objects-output-setup]")).toHaveText("Object setup table has the required row details.");

    await page.getByRole("button", { name: "Validate Setup" }).click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Validation PASS: Object setup rows are ready for authoring handoff.");
    await expect(page.locator("[data-objects-validation-list]")).toHaveText("PASS: Object setup rows are ready.");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Objects table add disables while active row can cancel, save, edit, and trash", async ({ page }) => {
  const failures = await openObjectsPage(page);

  try {
    const addButton = page.getByRole("button", { name: "Add Object" });
    await expect(addButton).toBeEnabled();
    await addButton.click();
    await expect(addButton).toBeDisabled();
    await expect(page.locator("[data-objects-row-name]")).toBeVisible();
    await expect(page.locator("[data-objects-cancel-row]")).toBeVisible();
    await expect(page.locator("[data-objects-row-role] option")).toHaveText(["Select role", ...ROLE_OPTIONS]);

    await page.locator("[data-objects-cancel-row]").click();
    await expect(addButton).toBeEnabled();
    await expect(page.locator("[data-objects-list]")).toContainText("No objects drafted yet.");

    await addButton.click();
    await fillActiveRow(page, { name: "Hero", role: "Hero", type: "Dynamic" });
    await page.locator("[data-objects-save-row]").click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Added Hero.");
    await expect(addButton).toBeEnabled();
    await expect(page.locator("[data-objects-list]")).toContainText("Hero");
    await expect(page.locator("[data-objects-list]")).toContainText("Player Controlled");
    await expect(page.locator("[data-objects-edit-row='hero']")).toBeVisible();
    await expect(page.locator("[data-objects-trash-row='hero']")).toBeVisible();

    await page.locator("[data-objects-edit-row='hero']").click();
    await expect(addButton).toBeDisabled();
    await page.locator("[data-objects-row-name]").fill("Hero Prime");
    await page.locator("[data-objects-row-role]").selectOption("Enemy");
    await page.locator("[data-objects-save-row]").click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Saved Hero Prime.");
    await expect(page.locator("[data-objects-list]")).toContainText("Hero Prime");
    await expect(page.locator("[data-objects-edit-row='hero']")).toHaveCount(0);
    await expect(page.locator("[data-objects-edit-row='hero-prime']")).toBeVisible();

    await page.locator("[data-objects-trash-row='hero-prime']").click();
    await expect(page.locator("[data-objects-log]")).toHaveText("Trashed object row.");
    await expect(page.locator("[data-objects-list]")).toContainText("No objects drafted yet.");
    await expect(addButton).toBeEnabled();

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Objects table save preserves linked sprite asset create and resolve behavior", async ({ page }) => {
  const failures = await openObjectsPage(page);

  try {
    await page.getByRole("button", { name: "Add Object" }).click();
    await fillActiveRow(page, {
      name: "Bolt",
      renderType: "Sprite",
      role: "Projectile",
      type: "Dynamic",
    });
    await expect(page.locator("[data-objects-row-render-asset-preview]")).toHaveText("Links on save");
    await page.locator("[data-objects-save-row]").click();

    await expect(page.locator("[data-objects-log]")).toContainText("Added Bolt.");
    await expect(page.locator("[data-objects-log]")).toContainText("Created editable default sprite asset sprite_bolt for Bolt.");
    await expect(page.locator("[data-objects-log]")).toContainText("Game Configuration is not ready");
    await expect(page.locator("[data-objects-list]")).toContainText("sprite_bolt");
    await expect(page.locator("[data-objects-output-render-asset]")).toHaveText("sprite_bolt");
    await expect(page.locator("[data-objects-output-sprite-preview]")).toContainText("sprite_bolt");
    await expect(page.locator("[data-objects-output-sprite-preview]")).toContainText("projects/");
    await expect(page.locator("[data-objects-edit-sprite]")).toBeVisible();
    await expect(page.locator("[data-objects-edit-sprite]")).toHaveAttribute(
      "href",
      "/toolbox/sprites/index.html?assetKey=sprite_bolt&objectKey=bolt&sourceTool=objects"
    );

    await page.getByRole("button", { name: "Reset Table" }).click();
    await page.getByRole("button", { name: "Add Object" }).click();
    await fillActiveRow(page, {
      name: "Bolt",
      renderType: "Sprite",
      role: "Projectile",
      type: "Dynamic",
    });
    await page.locator("[data-objects-save-row]").click();
    await expect(page.locator("[data-objects-log]")).toContainText("Added Bolt.");
    await expect(page.locator("[data-objects-log]")).toContainText("Resolved existing sprite asset sprite_bolt for Bolt.");

    const spriteRows = await page.evaluate(async () => {
      const response = await fetch("/api/mock-db/snapshot");
      const payload = await response.json();
      return payload.data.tables.asset_library_items.filter((asset) => asset.id === "sprite_bolt");
    });
    expect(spriteRows).toHaveLength(1);
    expect(spriteRows[0]).toEqual(expect.objectContaining({
      assetRole: "image",
      fileName: "sprite_bolt.png",
      id: "sprite_bolt",
      name: "sprite_bolt",
      status: "Ready",
      usage: "sprite",
    }));
    expect(spriteRows[0].storedPath).toContain("/image/sprite/sprite_bolt.png");
    expect(JSON.stringify(spriteRows)).not.toMatch(/placeholder/i);

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Objects is a clickable wireframe tool from Toolbox", async ({ page }) => {
  const failures = await openToolboxPage(page);

  try {
    const objectsCard = page.locator("[data-toolbox-tool-card='Objects']");
    await expect(objectsCard).toBeVisible();
    await expect(objectsCard.locator("[data-toolbox-kicker]")).toHaveText("Wireframe");
    await expect(objectsCard.locator("[data-toolbox-tool-name-link='Objects']")).toHaveAttribute("href", "/toolbox/objects/index.html");
    await objectsCard.locator("[data-toolbox-tool-name-link='Objects']").click();
    await expect(page.getByRole("heading", { level: 1, name: "Objects" })).toBeVisible();

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
