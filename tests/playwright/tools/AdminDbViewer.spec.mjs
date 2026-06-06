import { expect, test } from "@playwright/test";
import { PROJECT_JOURNEY_KEYS } from "../../../toolbox/project-journey/project-journey-mock-repository.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "admin-db-viewer",
    surface: "Admin DB Viewer"
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

async function uploadAsset(page, { assetRole, fileName, mimeType, name, usage }) {
  await page.locator("[data-asset-tool-asset-role]").selectOption(assetRole);
  await page.getByLabel("File").setInputFiles({
    buffer: Buffer.from(`${name} bytes`),
    mimeType,
    name: fileName
  });
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Usage").selectOption(usage);
  await page.getByRole("button", { name: "Upload Asset" }).click();
}

test("Admin DB Viewer shows current read-only mock DB tables, filters, and diagnostics", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/db-viewer.html");

  try {
    await expect(page.getByRole("heading", { name: "Mock DB", level: 1 })).toBeVisible();
    await expect(page.locator("[data-admin-only='true']")).toHaveCount(1);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("nav.nav-links a[data-route='admin-db-viewer']")).toHaveText("DB Viewer");
    await expect(page.locator(".tool-workspace--wide")).toBeVisible();
    await expect(page.locator(".tool-workspace--wide > .tool-column")).toHaveCount(2);
    await expect(page.locator("#toolDisplayMode")).toBeVisible();
    await expect(page.locator("[data-admin-db-viewer].tool-center-panel")).toBeVisible();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/Mock DB loaded \d+ tables and \d+ records for All\./);
    await expect(page.locator("[data-admin-db-filter]")).toHaveText([
      "All",
      "Project Journey",
      "Palette",
      "Asset",
      "Users",
      "Actors",
    ]);
    await expect(page.locator("[data-admin-db-filter='all']")).toHaveClass(/primary/);
    await expect(page.locator("[data-admin-db-filter='all']")).toHaveAttribute("aria-pressed", "true");

    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='project_journey_templates']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='project_journey_notes']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='project_journey_note_types']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='project_journey_activity']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='palette_colors']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='palette_source_swatches']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='asset_library_items']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='asset_storage_objects']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='users']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='actors']")).toBeVisible();

    for (const tableName of [
      "project_journey_activity",
      "project_journey_items",
      "project_journey_note_types",
      "project_journey_notes",
      "project_journey_templates",
      "users",
      "actors",
    ]) {
      await expect(page.locator(`[data-admin-db-table="${tableName}"] thead th`).first()).toHaveText("key");
      const keyCell = page.locator(`[data-admin-db-table="${tableName}"] tbody tr`).first().locator("td").first();
      await expect(keyCell).toHaveText(/^[0-9A-HJKMNP-TV-Z]{10}$/);
      await expect(keyCell).toHaveAttribute("title", ULID_PATTERN);
    }

    const itemHeaders = await page.locator("[data-admin-db-table='project_journey_items'] thead th").allTextContents();
    expect(itemHeaders[0]).toBe("key");
    expect(itemHeaders).toEqual(expect.arrayContaining([
      "key",
      "projectKey",
      "noteKey",
      "status",
      "title",
      "userDetails",
      "createdAt",
      "updatedAt",
      "createdByType",
      "updatedByType",
      "templateKey",
    ]));
    expect(itemHeaders).not.toEqual(expect.arrayContaining(["id", "itemId", "projectId", "noteId", "templateId"]));
    expect(itemHeaders).not.toEqual(expect.arrayContaining(["CREATEDAT", "UPDATEDAT", "CREATEDBYTYPE", "UPDATEDBYTYPE"]));
    const createdAtHeader = page.locator("[data-admin-db-table='project_journey_items'] thead th", { hasText: "createdAt" });
    await expect(createdAtHeader).toHaveCSS("text-transform", "none");
    const designItemRow = page.locator(`[data-admin-db-record="${PROJECT_JOURNEY_KEYS.items.designAffordance}"]`);
    await expect(designItemRow.locator("td").first()).toHaveText(PROJECT_JOURNEY_KEYS.items.designAffordance.slice(0, 10));
    await expect(designItemRow.locator("td").first()).toHaveAttribute("title", PROJECT_JOURNEY_KEYS.items.designAffordance);
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toContainText(PROJECT_JOURNEY_KEYS.items.designAffordance.slice(0, 10));
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).not.toContainText(PROJECT_JOURNEY_KEYS.items.designAffordance);
    await expect(page.locator("[data-admin-db-table='project_journey_templates']")).toContainText(PROJECT_JOURNEY_KEYS.templates.paletteAffordance.slice(0, 10));
    await expect(page.locator("[data-admin-db-table='project_journey_note_types']")).toContainText("Design");
    await expect(page.locator("[data-admin-db-table='project_journey_activity']")).toContainText("Palette and Input Density updated by Designer");
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("forge-bot");
    await expect(page.locator("[data-admin-db-table='actors']")).toContainText("forge-bot");

    await expect(page.locator("[data-admin-db-audit-findings]")).toContainText(
      "All current mock DB tables include createdAt, updatedAt, createdByType, and updatedByType where required by the owning mock model."
    );
    await expect(page.locator("[data-admin-db-bleed-findings]")).toContainText("No table bleed detected.");
    await expect(page.locator("[data-admin-db-stale-display-findings]")).toContainText(
      "No stale display data detected; tables are rendered from current mock DB snapshots."
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "project_journey_items.noteKey -> project_journey_notes.key: 9/9 records linked."
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "system project_journey_items.templateKey -> active project_journey_templates.key: 9/9 records linked."
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "actors.userKey -> users.key: 3/3 records linked."
    );
    await expect(page.locator("[data-admin-db-missing-links]")).toContainText("No missing links detected.");
    await expect(page.locator("[data-admin-db-viewer] input, [data-admin-db-viewer] textarea, [data-admin-db-viewer] select")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-viewer] button:not([data-admin-db-filter])")).toHaveCount(0);

    await page.getByRole("button", { name: "Project Journey" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Project Journey\./);
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='palette_colors']")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-table='asset_library_items']")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-table='users']")).toHaveCount(0);

    await page.getByRole("button", { name: "Palette" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Palette\./);
    await expect(page.locator("[data-admin-db-table='palette_colors']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='palette_source_swatches']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toHaveCount(0);

    await page.getByRole("button", { name: "Asset" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Asset\./);
    await expect(page.locator("[data-admin-db-table='asset_library_items']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='asset_storage_objects']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='palette_colors']")).toHaveCount(0);

    await page.getByRole("button", { name: "Users" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Users\./);
    await expect(page.locator("[data-admin-db-table='users']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='actors']")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("forge-bot");

    await page.getByRole("button", { name: "Actors" }).click();
    await expect(page.locator("[data-admin-db-status]")).toHaveText(/for Actors\./);
    await expect(page.locator("[data-admin-db-table='actors']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='users']")).toHaveCount(0);
    await expect(page.locator("[data-admin-db-table='actors']")).toContainText("forge-bot");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Mock DB viewer renders live persisted tool records after refresh", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/project-journey/index.html");
  const server = failures.server;

  try {
    await page.locator("[data-journey-new-note-name]").fill("Persistence Review");
    await page.getByRole("button", { name: "Add Note", exact: true }).click();
    await expect(page.locator("[data-journey-note-status]")).toContainText("Added Persistence Review");
    await page.locator("[data-journey-new-item-title-input]").fill("Persisted DB item");
    await page.getByRole("button", { name: "Add Item" }).click();
    await page.locator("[data-journey-item-details-input]").fill("Mock DB viewer should display this user-created item.");
    await expect(page.locator("[data-journey-item-tree]")).toContainText("Persisted DB item");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-journey-summary-body]")).toContainText("Persistence Review");
    await page.locator("[data-journey-note-button]", { hasText: "Persistence Review" }).click();
    await expect(page.locator("[data-journey-item-tree]")).toContainText("Persisted DB item");
    await page.locator("[data-journey-new-item-title-input]").fill("Persisted DB item after reload");
    await page.getByRole("button", { name: "Add Item" }).click();
    await expect(page.locator("[data-journey-item-tree]")).toContainText("Persisted DB item after reload");

    await page.goto(`${server.baseUrl}/toolbox/colors/index.html`, { waitUntil: "networkidle" });
    await page.locator("[data-palette-symbol]").fill("P");
    await page.locator("[data-palette-hex]").fill("#7A52FF");
    await page.locator("[data-palette-name]").fill("Persist Purple");
    await page.getByRole("button", { name: "Add User Defined" }).click();
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Persist Purple']")).toHaveCount(1);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Persist Purple']")).toHaveCount(1);

    await page.goto(`${server.baseUrl}/toolbox/assets/index.html`, { waitUntil: "networkidle" });
    await uploadAsset(page, {
      assetRole: "image",
      fileName: "persist-sprite.png",
      mimeType: "image/png",
      name: "Persist Sprite",
      usage: "sprite"
    });
    await expect(page.locator("[data-asset-tool-library]")).toContainText("Persist Sprite");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-asset-tool-library]")).toContainText("Persist Sprite");

    await page.goto(`${server.baseUrl}/admin/db-viewer.html`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Project Journey" }).click();
    await expect(page.locator("[data-admin-db-table='project_journey_notes']")).toContainText("Persistence Review");
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toContainText("Persisted DB item");
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toContainText("Persisted DB item after reload");
    const journeyItemKeys = await page.locator("[data-admin-db-table='project_journey_items'] tbody tr").evaluateAll((rows) => (
      rows.map((row) => row.dataset.adminDbRecord)
    ));
    expect(new Set(journeyItemKeys).size).toBe(journeyItemKeys.length);
    await page.getByRole("button", { name: "Palette" }).click();
    await expect(page.locator("[data-admin-db-table='palette_colors']")).toContainText("Persist Purple");
    await page.getByRole("button", { name: "Asset" }).click();
    await expect(page.locator("[data-admin-db-table='asset_library_items']")).toContainText("Persist Sprite");
    await page.getByRole("button", { name: "Users" }).click();
    await expect(page.locator("[data-admin-db-table='users']")).toContainText("forge-bot");
    await expect(page.locator("[data-admin-db-missing-links]")).toContainText("No missing links detected.");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
