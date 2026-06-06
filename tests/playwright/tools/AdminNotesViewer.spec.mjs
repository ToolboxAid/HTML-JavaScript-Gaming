import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "admin-notes",
    surface: "Admin Notes viewer"
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

test("Admin Notes displays note.txt and opens linked subnotes", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/notes.html");

  try {
    await expect(page.getByRole("heading", { name: "Admin Notes" })).toBeVisible();
    await expect(page.locator("[data-admin-only='true']")).toHaveCount(1);
    await expect(page.locator("nav.nav-links a[data-route='admin-notes']")).toHaveText("Notes");
    await expect(page.locator("[data-toolbox-menu]").getByText("Notes", { exact: true })).toHaveCount(0);
    await expect(page.locator(".side-menu a.active")).toHaveText("Notes");
    await expect(page.locator("[data-admin-notes-title]")).toHaveText("note.txt");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Ideas");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Things to Fix");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Undecided Questions");
    await expect(page.locator("[data-admin-notes-status]")).toContainText("docs_build/dev/admin-notes/note.txt");
    await expect(page.locator("[data-admin-notes-return]")).toBeHidden();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);

    const otherLink = page.locator("[data-admin-note-link='other']");
    await expect(otherLink).toHaveText("[other]");
    await expect(otherLink).toHaveAttribute("href", /admin\/notes\.html\?note=other$/);
    await otherLink.click();
    await page.waitForURL(/admin\/notes\.html\?note=other$/);
    await expect(page.locator("[data-admin-notes-title]")).toHaveText("other.txt");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("sample linked admin subnote");
    await expect(page.locator("[data-admin-notes-return]")).toBeVisible();

    await page.locator("[data-admin-notes-return]").click();
    await page.waitForURL(/admin\/notes\.html$/);
    await expect(page.locator("[data-admin-notes-title]")).toHaveText("note.txt");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Ideas");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Admin Notes shows actionable errors for missing and rejected note paths", async ({ page }) => {
  const missingFailures = await openRepoPage(page, "/admin/notes.html?note=missing");

  try {
    await expect(page.locator("[data-admin-notes-title]")).toHaveText("missing.txt");
    await expect(page.locator("[data-admin-notes-error]")).toContainText("Missing note file docs_build/dev/admin-notes/missing.txt");
    await expect(page.locator("[data-admin-notes-error]")).toContainText("return to note.txt");
    await expect(page.locator("[data-admin-notes-return]")).toBeVisible();
    expect(missingFailures.pageErrors).toEqual([]);
    expect(missingFailures.consoleErrors).toEqual(expect.arrayContaining([
      expect.stringContaining("Failed to load resource")
    ]));
    expect(missingFailures.failedRequests).toEqual(expect.arrayContaining([
      expect.stringContaining("/docs_build/dev/admin-notes/missing.txt")
    ]));
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await missingFailures.server.close();
  }

  const traversalFailures = await openRepoPage(page, "/admin/notes.html?note=../other");

  try {
    await expect(page.locator("[data-admin-notes-error]")).toContainText("Rejected note path");
    await expect(page.locator("[data-admin-notes-error]")).toContainText("letters, numbers, underscores, or hyphens");
    await expect(page.locator("[data-admin-notes-return]")).toBeVisible();
    expect(traversalFailures.failedRequests).toEqual([]);
    expect(traversalFailures.pageErrors).toEqual([]);
    expect(traversalFailures.consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await traversalFailures.server.close();
  }
});
