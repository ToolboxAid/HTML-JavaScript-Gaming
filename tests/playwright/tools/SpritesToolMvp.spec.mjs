import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { isBrowserExtensionNoise } from "../../helpers/browserExtensionNoise.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const REPO_ROOT = resolve(fileURLToPath(new URL("../../..", import.meta.url)));

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function setServerSession(server, userKey = MOCK_DB_KEYS.users.user1) {
  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: "local-db" }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

async function openSpritesPage(page, userKey = MOCK_DB_KEYS.users.user1) {
  const server = await startRepoServer();
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];
  await page.addInitScript(({ apiUrl, siteUrl }) => {
    window.GameFoundryPublicConfig = {
      apiUrl,
      environmentLabel: "Development Environment",
      siteUrl,
    };
  }, { apiUrl: `${server.baseUrl}/api`, siteUrl: server.baseUrl });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`FAILED ${request.url()}`);
  });
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
  await setServerSession(server, userKey);
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/toolbox/sprites/index.html`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

test("Sprites is clickable from Toolbox and loads the API-backed MVP surface", async ({ page }) => {
  const failures = await openSpritesPage(page);
  try {
    await page.goto(`${failures.server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    const spritesLink = page.locator("[data-toolbox-tool-name-link='Sprites']");
    await expect(spritesLink).toHaveAttribute("href", "/toolbox/sprites/index.html");
    await expect(spritesLink).not.toHaveAttribute("data-toolbox-launch-blocked", "planned");
    await spritesLink.click();
    await page.waitForURL(/\/toolbox\/sprites\/index\.html$/);
    await expect(page.getByRole("heading", { level: 1, name: "Sprites" })).toBeVisible();
    await expect(page.locator("[data-sprites-table]")).toBeVisible();
    await expect(page.locator("[data-sprites-log]")).toContainText(/Sprites ready|Sprites loading/);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Sprites creator can create, edit, filter, inspect, and archive a sprite", async ({ page }) => {
  const failures = await openSpritesPage(page);
  try {
    await page.getByRole("button", { name: "Add Sprite" }).click();
    await page.getByLabel("Sprite name").fill("Hero Sprite");
    await page.getByLabel("Sprite category").selectOption("Character");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.locator("[data-sprites-row]").filter({ hasText: "Hero Sprite" })).toBeVisible();
    await expect(page.locator("[data-sprites-log]")).toContainText("Created sprite Hero Sprite.");
    await expect(page.locator("[data-sprites-metadata]")).toContainText("Key:");
    await expect(page.locator("[data-sprites-metadata]")).toContainText("Palette color key: None");
    await expect(page.locator("[data-sprites-preview]")).toContainText(/Preview metadata|Preview unavailable/);
    await expect(page.locator("[data-sprites-references]")).toContainText("destructive delete is disabled");

    await page.locator("[data-sprites-row]").filter({ hasText: "Hero Sprite" }).getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Sprite name").fill("Hero Sprite Revised");
    await page.getByLabel("Sprite category").selectOption("Icon");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-sprites-row]").filter({ hasText: "Hero Sprite Revised" })).toBeVisible();
    await expect(page.locator("[data-sprites-row]").filter({ hasText: "Icon" })).toBeVisible();

    await page.getByLabel("Search Sprites").fill("revised");
    await expect(page.locator("[data-sprites-row]")).toHaveCount(1);
    await page.getByLabel("Search Sprites").fill("");
    await page.getByLabel("Filter Sprites by category").selectOption("Icon");
    await expect(page.locator("[data-sprites-row]")).toHaveCount(1);

    await page.locator("[data-sprites-row]").filter({ hasText: "Hero Sprite Revised" }).getByRole("button", { name: "Archive" }).click();
    await expect(page.locator("[data-sprites-row]").filter({ hasText: "Hero Sprite Revised" })).toContainText("Archived");
    await expect(page.locator("[data-sprites-log]")).toContainText("Archived sprite Hero Sprite Revised.");
    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Sprites guest save redirects to sign in and Palette color ownership stays external", async ({ page }) => {
  const failures = await openSpritesPage(page, "");
  try {
    await page.getByRole("button", { name: "Add Sprite" }).click();
    await page.getByLabel("Sprite name").fill("Guest Sprite");
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForURL(/\/account\/sign-in\.html$/);

    const source = readFileSync(resolve(REPO_ROOT, "assets/toolbox/sprites/js/index.js"), "utf8");
    expect(source).not.toMatch(/#[0-9A-Fa-f]{6}/);
    expect(source).not.toMatch(/const\s+\w*color\w*\s*=\s*\[/i);
    expect(source).toContain("paletteColorKey");
    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
