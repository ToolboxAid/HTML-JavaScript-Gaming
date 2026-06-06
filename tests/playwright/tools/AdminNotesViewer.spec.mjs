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

test("Admin Notes displays index.txt, parser output, and linked subnotes", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/notes.html");

  try {
    await expect(page.getByRole("heading", { name: "Admin Notes" })).toBeVisible();
    await expect(page.locator("[data-admin-only='true']")).toHaveCount(1);
    await expect(page.locator("nav.nav-links a[data-route='admin-notes']")).toHaveText("Notes");
    await expect(page.locator("[data-toolbox-menu]").getByText("Notes", { exact: true })).toHaveCount(0);
    await expect(page.locator(".side-menu a.active")).toHaveText("Notes");
    await expect(page.locator("[data-admin-notes-title]")).toHaveText("index.txt");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Ideas");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Things to Fix");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Undecided Questions");
    await expect(page.locator("[data-admin-notes-status]")).toContainText("docs_build/dev/admin-notes/index.txt");
    await expect(page.locator("[data-admin-notes-return]")).toBeHidden();
    await expect(page.locator("[data-admin-notes-return]")).toHaveText("Return to index.txt");
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-admin-notes-status-icon='open']")).toHaveText("[ ]");
    await expect(page.locator("[data-admin-notes-status-icon='active']")).toHaveText("[.]");
    await expect(page.locator("[data-admin-notes-status-icon='blocked']")).toHaveText("[!]");
    await expect(page.locator("[data-admin-notes-status-icon='question']")).toHaveText("[?]");
    await expect(page.locator("[data-admin-notes-content] > ul > li").first()).toContainText("Capture admin-only project ideas");
    await expect(page.locator("[data-admin-notes-content] ul ul li").first()).toContainText("nested ideas");

    const otherLink = page.locator("[data-admin-note-link='other']");
    await expect(otherLink).toHaveText("[other]");
    await expect(otherLink).toHaveClass(/primary/);
    await expect(otherLink).toHaveAttribute("href", /admin\/notes\.html\?note=other$/);
    await otherLink.click();
    await page.waitForURL(/admin\/notes\.html\?note=other$/);
    await expect(page.locator("[data-admin-notes-title]")).toHaveText("other/index.txt");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("sample linked admin subnote");
    await expect(page.locator("[data-admin-notes-status]")).toContainText("docs_build/dev/admin-notes/other/index.txt");
    await expect(page.locator("[data-admin-notes-return]")).toBeVisible();
    await expect(page.locator("[data-admin-notes-return]")).toHaveText("Return to index.txt");
    await expect(page.locator("[data-admin-notes-status-icon='done']")).toHaveText("[x]");
    await expect(page.locator("[data-admin-notes-content] ul ul li")).toContainText("Return to index.txt");

    await page.locator("[data-admin-notes-return]").click();
    await page.waitForURL(/admin\/notes\.html$/);
    await expect(page.locator("[data-admin-notes-title]")).toHaveText("index.txt");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Ideas");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Admin Notes opens custom root-relative text file links", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/notes.html");

  try {
    const backslashLink = page.getByRole("link", { name: "HERE", exact: true });
    await expect(backslashLink).toHaveText("HERE");
    await expect(backslashLink).toHaveAttribute("data-admin-note-file", "docs_build/tools-images-generated/achievements.txt");
    await expect(backslashLink).toHaveClass(/primary/);
    await backslashLink.click();
    await page.waitForURL(/admin\/notes\.html\?file=docs_build%2Ftools-images-generated%2Fachievements\.txt$/);
    await expect(page.locator("[data-admin-notes-title]")).toHaveText("docs_build/tools-images-generated/achievements.txt");
    await expect(page.locator("[data-admin-notes-status]")).toContainText("docs_build/tools-images-generated/achievements.txt");
    await expect(page.locator("[data-admin-notes-content]")).toContainText("TOOL: achievements");
    await expect(page.locator("[data-admin-notes-return]")).toBeVisible();

    await page.locator("[data-admin-notes-return]").click();
    await page.waitForURL(/admin\/notes\.html$/);
    const forwardSlashLink = page.getByRole("link", { name: "HERE-FWD", exact: true });
    await expect(forwardSlashLink).toHaveAttribute("data-admin-note-file", "docs_build/tools-images-generated/achievements.txt");
    await forwardSlashLink.click();
    await page.waitForURL(/admin\/notes\.html\?file=docs_build%2Ftools-images-generated%2Fachievements\.txt$/);
    await expect(page.locator("[data-admin-notes-content]")).toContainText("Gold Marketplace glow");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Admin Notes shows actionable errors for missing and rejected paths", async ({ page }) => {
  const missingFailures = await openRepoPage(page, "/admin/notes.html?note=missing");

  try {
    await expect(page.locator("[data-admin-notes-title]")).toHaveText("missing/index.txt");
    await expect(page.locator("[data-admin-notes-error]")).toContainText("Missing note file docs_build/dev/admin-notes/missing/index.txt");
    await expect(page.locator("[data-admin-notes-error]")).toContainText("return to index.txt");
    await expect(page.locator("[data-admin-notes-return]")).toBeVisible();
    expect(missingFailures.pageErrors).toEqual([]);
    expect(missingFailures.consoleErrors).toEqual(expect.arrayContaining([
      expect.stringContaining("Failed to load resource")
    ]));
    expect(missingFailures.failedRequests).toEqual(expect.arrayContaining([
      expect.stringContaining("/docs_build/dev/admin-notes/missing/index.txt")
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

  const fileTraversalFailures = await openRepoPage(page, "/admin/notes.html?file=docs_build/dev/admin-notes/../index.txt");

  try {
    await expect(page.locator("[data-admin-notes-error]")).toContainText("Rejected linked file path");
    await expect(page.locator("[data-admin-notes-error]")).toContainText("repository-root text file path without traversal");
    expect(fileTraversalFailures.failedRequests).toEqual([]);
    expect(fileTraversalFailures.pageErrors).toEqual([]);
    expect(fileTraversalFailures.consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await fileTraversalFailures.server.close();
  }

  const nonTextFailures = await openRepoPage(page, "/admin/notes.html?file=package.json");

  try {
    await expect(page.locator("[data-admin-notes-error]")).toContainText("Rejected linked file path");
    expect(nonTextFailures.failedRequests).toEqual([]);
    expect(nonTextFailures.pageErrors).toEqual([]);
    expect(nonTextFailures.consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await nonTextFailures.server.close();
  }

  const missingFileFailures = await openRepoPage(page, "/admin/notes.html?file=docs_build/dev/admin-notes/missing-file.txt");

  try {
    await expect(page.locator("[data-admin-notes-error]")).toContainText("Missing linked file docs_build/dev/admin-notes/missing-file.txt");
    await expect(page.locator("[data-admin-notes-error]")).toContainText("return to index.txt");
    expect(missingFileFailures.pageErrors).toEqual([]);
    expect(missingFileFailures.consoleErrors).toEqual(expect.arrayContaining([
      expect.stringContaining("Failed to load resource")
    ]));
    expect(missingFileFailures.failedRequests).toEqual(expect.arrayContaining([
      expect.stringContaining("/docs_build/dev/admin-notes/missing-file.txt")
    ]));
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await missingFileFailures.server.close();
  }
});
