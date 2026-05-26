import { expect, test } from "@playwright/test";
import path from "node:path";
import { readdir, readFile } from "node:fs/promises";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const GAMES_DIR = "games";

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "integration",
    surface: "Game index preview manifest broad scan"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

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
