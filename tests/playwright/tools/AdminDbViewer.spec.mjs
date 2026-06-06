import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

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

    const itemHeaders = await page.locator("[data-admin-db-table='project_journey_items'] thead th").allTextContents();
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
    await expect(page.locator("[data-admin-db-table='project_journey_items']")).toContainText("item-design-1");
    await expect(page.locator("[data-admin-db-table='project_journey_templates']")).toContainText("template-palette-affordance");
    await expect(page.locator("[data-admin-db-table='project_journey_note_types']")).toContainText("Design");
    await expect(page.locator("[data-admin-db-table='project_journey_activity']")).toContainText("Palette and Input Density updated by Designer");

    await expect(page.locator("[data-admin-db-audit-findings]")).toContainText(
      "All Project Journey mock DB tables include createdAt, updatedAt, createdByType, and updatedByType."
    );
    await expect(page.locator("[data-admin-db-bleed-findings]")).toContainText("No table bleed detected.");
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "project_journey_items.noteId -> project_journey_notes.id: 8/8 records linked."
    );
    await expect(page.locator("[data-admin-db-relationship-summary]")).toContainText(
      "system project_journey_items.templateId -> active project_journey_templates.templateId: 8/8 records linked."
    );
    await expect(page.locator("[data-admin-db-missing-links]")).toContainText("No missing links detected.");
    await expect(page.locator("[data-admin-db-viewer] input, [data-admin-db-viewer] textarea, [data-admin-db-viewer] select, [data-admin-db-viewer] button")).toHaveCount(0);

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
