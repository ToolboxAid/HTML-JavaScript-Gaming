import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../../api/persistence/mock-db-store.js";
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

async function openLocalViewer(page, routePath = "/admin/admin-notes.html", options = {}) {
  const server = await startRepoServer();
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
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
    body: JSON.stringify({ modeId: "local-db" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey: MOCK_DB_KEYS.users.admin }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  if (typeof options.beforeGoto === "function") {
    await options.beforeGoto({ page, server });
  }

  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${routePath}`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, previousApiUrl, previousSiteUrl, server };
}

function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function closeWithCoverage(page, failures) {
  await workspaceV2CoverageReporter.stop(page);
  await failures.server.close();
  if (failures.previousApiUrl === undefined) {
    delete process.env.GAMEFOUNDRY_API_URL;
  } else {
    process.env.GAMEFOUNDRY_API_URL = failures.previousApiUrl;
  }
  if (failures.previousSiteUrl === undefined) {
    delete process.env.GAMEFOUNDRY_SITE_URL;
  } else {
    process.env.GAMEFOUNDRY_SITE_URL = failures.previousSiteUrl;
  }
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
    await expect(page.locator("[data-admin-notes-status]")).toContainText("Loaded dev/archive/legacy-docs-build/admin-notes/index.txt.");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Admin Notes Ownership");
    await expect(page.locator("[data-admin-notes-current-folder]")).toHaveText("admin-notes");
    await expect(page.locator("[data-admin-notes-parent-folder]")).toBeDisabled();
    await expect(page.getByRole("heading", { name: "Open folders:", level: 4 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Open files:", level: 4 })).toBeVisible();

    await expect(page.locator("[data-admin-notes-folder-links] [data-admin-notes-directory-link='folder']")).toContainText([
      "admin/",
      "colors/",
      "deployment-uat-prod/",
      "email/",
      "engine/",
      "fonts/",
      "notes/",
      "other/",
      "tools/",
    ]);
    await expect(page.locator("[data-admin-notes-folder-links] [data-admin-notes-directory-link='file']")).toHaveCount(0);
    await expect(page.locator("[data-admin-notes-file-links] [data-admin-notes-directory-link='file']")).toContainText([
      "BusinessPlan.txt",
      "PS_commands.txt",
      "roadmap2MVP.txt",
      "sample.txt",
    ]);
    await expect(page.locator("[data-admin-notes-file-links] [data-admin-notes-directory-link='folder']")).toHaveCount(0);

    await page.getByRole("link", { name: "sample.txt" }).click();
    await expect(page.locator("[data-admin-notes-title]")).toHaveText("sample.txt");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Capture admin-only project ideas here.");
    await expect(page.locator("[data-admin-notes-status]")).toContainText("Loaded dev/archive/legacy-docs-build/admin-notes/sample.txt.");
    await expect(page.locator("[data-admin-notes-current-folder]")).toHaveText("admin-notes");
    await expect(page.locator("[data-admin-notes-parent-folder]")).toBeDisabled();

    await page.getByRole("link", { name: "other/" }).click();
    await expect(page.locator("[data-admin-notes-title]")).toHaveText("index.txt");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("sample linked admin subnote");
    await expect(page.locator("[data-admin-notes-status]")).toContainText("Loaded dev/archive/legacy-docs-build/admin-notes/other/index.txt.");
    await expect(page.locator("[data-admin-notes-current-folder]")).toHaveText("other");
    await expect(page.locator("[data-admin-notes-parent-folder]")).toBeEnabled();
    await page.locator("[data-admin-notes-parent-folder]").click();
    await expect(page.locator("[data-admin-notes-current-folder]")).toHaveText("admin-notes");
    await expect(page.locator("[data-admin-notes-parent-folder]")).toBeDisabled();
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Admin Notes Ownership");

    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Owner Notes route reads the shared admin-notes source", async ({ page }) => {
  const failures = await openLocalViewer(page, "/owner/notes.html");

  try {
    await expect(page).toHaveURL(/\/owner\/notes\.html$/);
    await expect(page.getByRole("heading", { name: "Notes", level: 1 })).toBeVisible();
    await expect(page.locator("main[data-owner-notes][data-admin-notes-viewer]")).toBeVisible();
    await expect(page.locator("[aria-label='Owner business pages'] a[aria-current='page']")).toHaveText("Notes");
    await expect(page.locator("[data-admin-notes-status]")).toContainText("Loaded dev/archive/legacy-docs-build/admin-notes/index.txt.");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Admin Notes Ownership");
    await expect(page.locator("[data-admin-notes-folder-links] [data-admin-notes-directory-link='folder']")).toContainText([
      "notes/",
      "other/",
    ]);

    await page.getByRole("link", { name: "sample.txt" }).click();
    await expect(page).toHaveURL(/\/owner\/notes\.html\?file=dev%2Farchive%2Flegacy-docs-build%2Fadmin-notes%2Fsample\.txt$/);
    await expect(page.locator("[data-admin-notes-title]")).toHaveText("sample.txt");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Capture admin-only project ideas here.");
    await expect(page.locator("nav[aria-label='Admin tool pages'] a", { hasText: "Notes" })).toHaveCount(0);
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Admin Notes viewer shows a visible missing-directory diagnostic", async ({ page }) => {
  const failures = await openLocalViewer(page, "/owner/notes.html", {
    beforeGoto: async ({ page: routedPage }) => {
      await routedPage.route("**/api/dev/admin-notes/directory?*", async (route) => {
        await route.fulfill({
          body: JSON.stringify({
            entries: [],
            error: "Admin Notes folder not found: dev/archive/legacy-docs-build/admin-notes.",
            ok: false,
          }),
          contentType: "application/json; charset=utf-8",
          status: 404,
        });
      });
    },
  });

  try {
    await expect(page.locator("[data-admin-notes-folder-diagnostic]")).toContainText("Admin Notes folder not found");
    await expect(page.locator("[data-admin-notes-folder-links] [data-admin-notes-directory-link]")).toHaveCount(0);
    await expect(page.locator("[data-admin-notes-file-links] [data-admin-notes-directory-link]")).toHaveCount(0);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toHaveLength(1);
    expect(failures.consoleErrors[0]).toContain("404");
    expect(failures.failedRequests).toEqual([
      `404 ${failures.server.baseUrl}/api/dev/admin-notes/directory?folder=dev%2Farchive%2Flegacy-docs-build%2Fadmin-notes`,
    ]);
  } finally {
    await closeWithCoverage(page, failures);
  }
});

test("Admin Notes viewer shows an empty state for an empty source folder", async ({ page }) => {
  const failures = await openLocalViewer(page, "/owner/notes.html", {
    beforeGoto: async ({ page: routedPage }) => {
      await routedPage.route("**/api/dev/admin-notes/directory?*", async (route) => {
        await route.fulfill({
          body: JSON.stringify({
            entries: [],
            folderPath: "dev/archive/legacy-docs-build/admin-notes",
            ok: true,
          }),
          contentType: "application/json; charset=utf-8",
          status: 200,
        });
      });
    },
  });

  try {
    await expect(page.locator("[data-admin-notes-folder-diagnostic]")).toContainText("No Admin Notes files found");
    await expect(page.locator("[data-admin-notes-folder-links] [data-admin-notes-directory-link]")).toHaveCount(0);
    await expect(page.locator("[data-admin-notes-file-links] [data-admin-notes-directory-link]")).toHaveCount(0);
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
    await expect(page.locator("[data-admin-notes-status]")).toContainText("Loaded dev/archive/legacy-docs-build/admin-notes/index.txt.");
    await expectNoPageFailures(failures);
  } finally {
    await closeWithCoverage(page, failures);
  }
});
