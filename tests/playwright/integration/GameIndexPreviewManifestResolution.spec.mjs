import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const PONG_MANIFEST_PATH = "games/Pong/game.manifest.json";
const PONG_PREVIEW_PATH = "/games/Pong/assets/images/preview1.svg";
const PONG_OLD_PREVIEW_PATH = "/games/Pong/assets/images/preview.svg";

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "integration",
    surface: "Game index preview manifest handoff"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

async function readPongManifest() {
  return JSON.parse(await readFile(PONG_MANIFEST_PATH, "utf8"));
}

function removeAssetManagerPreview(manifestPayload) {
  const manifest = JSON.parse(JSON.stringify(manifestPayload));
  const assets = manifest?.tools?.["asset-manager-v2"]?.assets || {};
  Object.entries(assets).forEach(([assetId, asset]) => {
    if (asset?.type === "image" && String(asset?.role || "").trim().toLowerCase() === "preview") {
      delete assets[assetId];
    }
  });
  return manifest;
}

function collectPongImageRequests(page) {
  const imageRequests = [];
  const imageNotFoundResponses = [];
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname.includes("/games/Pong/assets/images/")) {
      imageRequests.push(pathname);
    }
  });
  page.on("response", (response) => {
    const pathname = new URL(response.url()).pathname;
    if (response.status() === 404 && pathname.includes("/games/Pong/assets/images/")) {
      imageNotFoundResponses.push(pathname);
    }
  });
  return {
    imageRequests,
    imageNotFoundResponses
  };
}

test("games index resolves Pong thumbnail from manifest preview role", async ({ page }) => {
  const server = await startRepoServer();
  const pageErrors = [];
  const requests = collectPongImageRequests(page);
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await workspaceV2CoverageReporter.start(page);
  try {
    await page.goto(`${server.baseUrl}/games/index.html`, { waitUntil: "networkidle" });
    const pongCard = page.locator('[data-game-id="Pong"]').first();
    await pongCard.scrollIntoViewIfNeeded();
    const pongPreview = pongCard.locator("img.game-thumb");
    await expect(pongPreview).toHaveAttribute("src", PONG_PREVIEW_PATH);
    await expect(pongPreview).toBeVisible();
    await expect.poll(() => requests.imageRequests.includes(PONG_PREVIEW_PATH)).toBe(true);
    expect(requests.imageRequests).not.toContain(PONG_OLD_PREVIEW_PATH);
    expect(requests.imageNotFoundResponses).not.toContain(PONG_OLD_PREVIEW_PATH);
    expect(pageErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Pong page resolves thumbnail from manifest preview role", async ({ page }) => {
  const server = await startRepoServer();
  const pageErrors = [];
  const requests = collectPongImageRequests(page);
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await workspaceV2CoverageReporter.start(page);
  try {
    await page.goto(`${server.baseUrl}/games/Pong/index.html`, { waitUntil: "networkidle" });
    const previewImage = page.locator("#pong-preview-thumbnail");
    await expect(previewImage).toHaveAttribute("src", PONG_PREVIEW_PATH);
    await expect(previewImage).toBeVisible();
    await expect(page.locator("#pong-preview-placeholder")).toBeHidden();
    await expect.poll(() => requests.imageRequests.includes(PONG_PREVIEW_PATH)).toBe(true);
    expect(requests.imageRequests).not.toContain(PONG_OLD_PREVIEW_PATH);
    expect(requests.imageNotFoundResponses).not.toContain(PONG_OLD_PREVIEW_PATH);
    expect(pageErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Pong page keeps safe placeholder when preview role is absent", async ({ page }) => {
  const server = await startRepoServer();
  const pageErrors = [];
  const requests = collectPongImageRequests(page);
  const manifestWithoutPreview = removeAssetManagerPreview(await readPongManifest());
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });
  await page.route("**/games/Pong/game.manifest.json", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(manifestWithoutPreview)
    });
  });

  await workspaceV2CoverageReporter.start(page);
  try {
    await page.goto(`${server.baseUrl}/games/Pong/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("#pong-preview-placeholder")).toBeVisible();
    await expect(page.locator("#pong-preview-thumbnail")).toBeHidden();
    await page.waitForTimeout(250);
    expect(requests.imageRequests).not.toContain(PONG_PREVIEW_PATH);
    expect(requests.imageRequests).not.toContain(PONG_OLD_PREVIEW_PATH);
    expect(requests.imageNotFoundResponses).not.toContain(PONG_PREVIEW_PATH);
    expect(requests.imageNotFoundResponses).not.toContain(PONG_OLD_PREVIEW_PATH);
    expect(pageErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
