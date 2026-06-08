import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "admin-notes-local-viewer",
    surface: "Admin Notes local viewer",
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function openLocalViewer(page, routePath = "/admin/admin-notes.html") {
  const server = await startRepoServer();
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];

  page.on("pageerror", (error) => {
    const text = error.stack || error.message;
    if (!isBrowserExtensionNoise(text)) {
      pageErrors.push(error.message);
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error" && !isBrowserExtensionNoise(message.text())) {
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

  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: "local-mem" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey: MOCK_DB_KEYS.users.admin }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${routePath}`, { waitUntil: "networkidle" });
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

test("Admin Notes local viewer loads index and opens root folder note files", async ({ page }) => {
  const failures = await openLocalViewer(page);

  try {
    await expect(page.getByRole("heading", { name: "Admin Notes", level: 1 })).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("header.site-header")).toBeVisible();
    await expect(page.locator("footer.footer")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/admin-notes\.html$/);
    await expect(page.locator("[data-admin-notes-title]")).toHaveText("index.txt");
    await expect(page.locator("[data-admin-notes-status]")).toContainText("Loaded docs_build/dev/admin-notes/index.txt.");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Project Life Cycle");
    await expect(page.locator("[data-admin-notes-current-folder]")).toHaveText("admin-notes");
    await expect(page.locator("[data-admin-notes-parent-folder]")).toBeDisabled();
    await expect(page.getByRole("heading", { name: "Open folders:", level: 4 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Open files:", level: 4 })).toBeVisible();

    await expect(page.locator("[data-admin-notes-folder-links] [data-admin-notes-directory-link='folder']")).toContainText([
      "notes/",
      "other/",
    ]);
    await expect(page.locator("[data-admin-notes-folder-links] [data-admin-notes-directory-link='file']")).toHaveCount(0);
    await expect(page.locator("[data-admin-notes-file-links] [data-admin-notes-directory-link='file']")).toContainText([
      "quick-reference.txt",
      "sample.txt",
    ]);
    await expect(page.locator("[data-admin-notes-file-links] [data-admin-notes-directory-link='folder']")).toHaveCount(0);

    await page.getByRole("link", { name: "quick-reference.txt" }).click();
    await expect(page.locator("[data-admin-notes-title]")).toHaveText("quick-reference.txt");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Quick Reference");
    await expect(page.locator("[data-admin-notes-status]")).toContainText("Loaded docs_build/dev/admin-notes/quick-reference.txt.");
    await expect(page.locator("[data-admin-notes-current-folder]")).toHaveText("admin-notes");
    await expect(page.locator("[data-admin-notes-parent-folder]")).toBeDisabled();

    await page.getByRole("link", { name: "other/" }).click();
    await expect(page.locator("[data-admin-notes-title]")).toHaveText("index.txt");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("sample linked admin subnote");
    await expect(page.locator("[data-admin-notes-status]")).toContainText("Loaded docs_build/dev/admin-notes/other/index.txt.");
    await expect(page.locator("[data-admin-notes-current-folder]")).toHaveText("other");
    await expect(page.locator("[data-admin-notes-parent-folder]")).toBeEnabled();
    await page.locator("[data-admin-notes-parent-folder]").click();
    await expect(page.locator("[data-admin-notes-current-folder]")).toHaveText("admin-notes");
    await expect(page.locator("[data-admin-notes-parent-folder]")).toBeDisabled();
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Project Life Cycle");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Admin Notes direct dev-runtime source route still renders the viewer", async ({ page }) => {
  const failures = await openLocalViewer(page, "/src/dev-runtime/admin/notes.html");

  try {
    await expect(page).toHaveURL(/\/src\/dev-runtime\/admin\/notes\.html$/);
    await expect(page.getByRole("heading", { name: "Admin Notes", level: 1 })).toBeVisible();
    await expect(page.locator("header.site-header")).toBeVisible();
    await expect(page.locator("footer.footer")).toBeVisible();
    await expect(page.locator("[data-admin-notes-status]")).toContainText("Loaded docs_build/dev/admin-notes/index.txt.");
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});
