import { expect, test } from "@playwright/test";
import { PROJECT_JOURNEY_IDS } from "../../../toolbox/project-journey/project-journey-mock-repository.js";
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

test("Admin DB Viewer shows read-only mock DB tables and diagnostics", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/db-viewer.html");

  try {
    await expect(page.getByRole("heading", { name: "Mock DB Project Journey Tables" })).toBeVisible();
    await expect(page.locator("[data-admin-only='true']")).toHaveCount(1);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("nav.nav-links a[data-route='admin-db-viewer']")).toHaveText("DB Viewer");
    await expect(page.locator(".tool-workspace--wide")).toBeVisible();
    await expect(page.locator(".tool-workspace--wide > .tool-column")).toHaveCount(2);
    await expect(page.locator("#toolDisplayMode")).toBeVisible();
    await expect(page.locator("[data-admin-db-viewer].tool-center-panel")).toBeVisible();
    await expect(page.locator("[data-admin-db-status]")).toHaveText("Read-only mock DB dump loaded for Demo Project.");

    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='project_journey_templates']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='project_journey_notes']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='project_journey_note_types']")).toBeVisible();
    await expect(page.locator("[data-admin-db-table='project_journey_activity']")).toBeVisible();

    for (const tableName of [
      "project_journey_activity",
      "project_journey_items",
      "project_journey_note_types",
      "project_journey_notes",
      "project_journey_templates",
    ]) {
      await expect(page.locator(`[data-admin-db-table="${tableName}"] thead th`).first()).toHaveText("Key");
      const keyCell = page.locator(`[data-admin-db-table="${tableName}"] tbody tr`).first().locator("td").first();
      await expect(keyCell).toHaveText(/^[0-9A-HJKMNP-TV-Z]{6,8}$/);
      await expect(keyCell).toHaveAttribute("title", ULID_PATTERN);
    }

    const itemHeaders = await page.locator("[data-admin-db-table='project_journey_items'] thead th").allTextContents();
    expect(itemHeaders[0]).toBe("Key");
    expect(itemHeaders).toEqual(expect.arrayContaining([
      "itemId",
      "projectId",
      "noteId",
      "status",
      "title",
      "userDetails",
      "createdAt",
      "updatedAt",
      "createdByType",
      "updatedByType",
      "templateId",
    ]));
    expect(itemHeaders).not.toEqual(expect.arrayContaining(["CREATEDAT", "UPDATEDAT", "CREATEDBYTYPE", "UPDATEDBYTYPE"]));
    const createdAtHeader = page.locator("[data-admin-db-table='project_journey_items'] thead th", { hasText: "createdAt" });
    await expect(createdAtHeader).toHaveCSS("text-transform", "none");
    const designItemRow = page.locator(`[data-admin-db-record="${PROJECT_JOURNEY_IDS.items.designAffordance}"]`);
    await expect(designItemRow.locator("td").first()).toHaveText(PROJECT_JOURNEY_IDS.items.designAffordance.slice(-8));
    await expect(designItemRow.locator("td").first()).toHaveAttribute("title", PROJECT_JOURNEY_IDS.items.designAffordance);
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toContainText(PROJECT_JOURNEY_IDS.items.designAffordance);
    await expect(page.locator("[data-admin-db-table='project_journey_templates']")).toContainText(PROJECT_JOURNEY_IDS.templates.paletteAffordance);
    await expect(page.locator("[data-admin-db-table='project_journey_note_types']")).toContainText("Design");
    await expect(page.locator("[data-admin-db-table='project_journey_activity']")).toContainText("Palette and Input Density updated by Designer");

    await expect(page.locator("[data-admin-db-audit-findings]")).toContainText(
      "All Project Journey mock DB tables include createdAt, updatedAt, createdByType, and updatedByType."
    );
    await expect(page.locator("[data-admin-db-bleed-findings]")).toContainText("No table bleed detected.");
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "project_journey_items.noteId -> project_journey_notes.id: 9/9 records linked."
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "system project_journey_items.templateId -> active project_journey_templates.templateId: 9/9 records linked."
    );
    await expect(page.locator("[data-admin-db-missing-links]")).toContainText("No missing links detected.");
    await expect(page.locator("[data-admin-db-viewer] input, [data-admin-db-viewer] textarea, [data-admin-db-viewer] select, [data-admin-db-viewer] button")).toHaveCount(0);

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
