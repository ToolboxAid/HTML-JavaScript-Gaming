import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import {
  clearPlaywrightStorage,
  installPlaywrightStorageIsolation,
} from "../../helpers/playwrightStorageIsolation.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "hitboxes",
    surface: "Hitboxes real Object source selection",
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
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
    if (response.status() >= 400 && !response.url().includes("/api/storage/project-assets/read")) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    if (!request.url().includes("/api/storage/project-assets/read")) {
      failedRequests.push(`FAILED ${request.url()}`);
    }
  });

  return { consoleErrors, failedRequests, pageErrors };
}

async function openRepoPage(page, pathName) {
  const server = await startRepoServer();
  const failures = collectPageFailures(page);
  await page.addInitScript(({ apiUrl, siteUrl }) => {
    window.GameFoundryPublicConfig = {
      apiUrl,
      environmentLabel: "Development Environment",
      siteUrl,
    };
  }, { apiUrl: `${server.baseUrl}/api`, siteUrl: server.baseUrl });
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { ...failures, server };
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function createSpriteObject(page, name) {
  await page.locator("[data-objects-add-row]").click();
  await page.locator("[data-objects-row-name]").fill(name);
  await page.locator("[data-objects-row-type]").selectOption("Projectile");
  await page.locator("[data-objects-row-render-type]").selectOption("Sprite");
  await page.locator("[data-objects-save-row]").click();
  await expect(page.locator("[data-objects-log]")).toContainText(`Added ${name}.`);
}

test("Hitboxes selects real Objects with assigned visual assets", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/objects/index.html");

  try {
    await createSpriteObject(page, "Bolt");
    await page.goto(`${failures.server.baseUrl}/toolbox/hitboxes/index.html?objectKey=bolt&sourceTool=objects`, { waitUntil: "networkidle" });

    await expect(page.locator("[data-hitboxes-object-list]")).toContainText("Bolt");
    await expect(page.locator("[data-hitboxes-object-list]")).toContainText("bolt");
    await expect(page.locator("[data-hitboxes-object-list]")).toContainText("Sprite");
    await expect(page.locator("[data-hitboxes-selected-key]")).toHaveText("bolt");
    await expect(page.locator("[data-hitboxes-preview-title]")).toHaveText("Bolt");
    await expect(page.locator("[data-hitboxes-preview-summary]")).toContainText("Object A uses");
    await expect(page.locator("[data-hitboxes-preview-fallback]")).toContainText("Assigned visual metadata exists");
    await expect(page.locator("[data-hitboxes-bounding-box]")).toContainText("Bounding box:");
    await expect(page.locator("[data-hitboxes-origin-marker]")).toContainText("Origin:");
    await expect(page.locator("[data-hitboxes-meta-name]")).toHaveText("Bolt");
    await expect(page.locator("[data-hitboxes-meta-key]")).toHaveText("bolt");
    await expect(page.locator("[data-hitboxes-meta-visual]")).toContainText("sprite_bolt");
    await expect(page.locator("[data-hitboxes-log]")).toContainText("Selected Object A: Bolt.");
    await expectNoPageFailures(failures);
  } finally {
    await failures.server.stop();
  }
});
