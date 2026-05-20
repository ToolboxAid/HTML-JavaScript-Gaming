import { expect, test } from "@playwright/test";
import path from "node:path";
import { readdir, readFile } from "node:fs/promises";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const GAMES_DIR = "games";
const PONG_MANIFEST_PATH = "games/Pong/game.manifest.json";
const PONG_PREVIEW_PATH = "/games/Pong/assets/images/preview1.svg";
const PONG_OLD_PREVIEW_PATH = "/games/Pong/assets/images/preview.svg";

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function readPongManifest() {
  return JSON.parse(await readFile(PONG_MANIFEST_PATH, "utf8"));
}

function resolveManifestRelativePreviewPath(manifestPath, assetPath) {
  const normalizedPath = String(assetPath || "").trim().replace(/\\/g, "/");
  if (!normalizedPath || normalizedPath.includes("..") || /^[a-z][a-z0-9+.-]*:/i.test(normalizedPath)) {
    return "";
  }
  if (normalizedPath.startsWith("/")) {
    return normalizedPath;
  }
  if (normalizedPath.startsWith("games/")) {
    return `/${normalizedPath}`;
  }
  return `/${path.posix.join(path.dirname(manifestPath).replace(/\\/g, "/"), normalizedPath)}`;
}

async function readGameManifestPreviewPaths() {
  const gameDirs = await readdir(GAMES_DIR, { withFileTypes: true });
  const previews = [];
  for (const entry of gameDirs) {
    if (!entry.isDirectory()) {
      continue;
    }
    const manifestPath = path.posix.join(GAMES_DIR, entry.name, "game.manifest.json");
    let manifest;
    try {
      manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    } catch {
      continue;
    }
    const assets = manifest?.tools?.["asset-manager-v2"]?.assets || {};
    const previewAsset = Object.values(assets)
      .find((asset) => asset?.type === "image" && String(asset?.role || "").trim().toLowerCase() === "preview");
    const previewPath = resolveManifestRelativePreviewPath(manifestPath, previewAsset?.path);
    if (manifest?.game?.id && previewPath) {
      previews.push([manifest.game.id, previewPath]);
    }
  }
  return previews.sort(([leftId], [rightId]) => leftId.localeCompare(rightId));
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

test("games index resolves every game thumbnail from manifest preview roles", async ({ page }) => {
  const server = await startRepoServer();
  const pageErrors = [];
  const imageRequests = [];
  const imageNotFoundResponses = [];
  const previewPaths = await readGameManifestPreviewPaths();
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname.startsWith("/games/") && pathname.includes("/assets/images/")) {
      imageRequests.push(pathname);
    }
  });
  page.on("response", (response) => {
    const pathname = new URL(response.url()).pathname;
    if (response.status() === 404 && pathname.startsWith("/games/") && pathname.includes("/assets/images/")) {
      imageNotFoundResponses.push(pathname);
    }
  });

  await workspaceV2CoverageReporter.start(page);
  try {
    await page.goto(`${server.baseUrl}/games/index.html`, { waitUntil: "networkidle" });
    for (const [gameId, previewPath] of previewPaths) {
      const gameCard = page.locator(`[data-game-id="${gameId}"]`).first();
      await gameCard.scrollIntoViewIfNeeded();
      const previewImage = gameCard.locator("img.game-thumb");
      await expect(previewImage).toHaveAttribute("src", previewPath);
      await expect(previewImage).toBeVisible();
    }
    await expect.poll(() => previewPaths.every(([, previewPath]) => imageRequests.includes(previewPath))).toBe(true);
    expect(imageNotFoundResponses).toEqual([]);
    expect(pageErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

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
