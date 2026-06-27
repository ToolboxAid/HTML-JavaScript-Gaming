import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const ASTEROIDS_MANIFEST_PATH = "games/Asteroids/game.manifest.json";
const ASTEROIDS_BACKGROUND_IMAGE_PATH = "/games/Asteroids/assets/images/deluxe.png";
const ASTEROIDS_BEZEL_IMAGE_PATH = "/games/Asteroids/assets/images/bezel.png";
const ASTEROIDS_OLD_BACKGROUND_IMAGE_PATH = "/games/Asteroids/assets/images/background.png";

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function readAsteroidsManifest() {
  return JSON.parse(await readFile(ASTEROIDS_MANIFEST_PATH, "utf8"));
}

function removeAssetManagerImageRole(manifestPayload, role) {
  const manifest = JSON.parse(JSON.stringify(manifestPayload));
  const assets = manifest?.tools?.["asset-manager-v2"]?.assets || {};
  const normalizedRole = String(role || "").trim().toLowerCase();
  Object.entries(assets).forEach(([assetId, asset]) => {
    if (asset?.type === "image" && String(asset?.role || "").trim().toLowerCase() === normalizedRole) {
      delete assets[assetId];
    }
  });
  return manifest;
}

function collectAsteroidsImageRequests(page) {
  const imageRequests = [];
  const imageNotFoundResponses = [];
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname.includes("/games/Asteroids/assets/images/")) {
      imageRequests.push(pathname);
    }
  });
  page.on("response", (response) => {
    const pathname = new URL(response.url()).pathname;
    if (response.status() === 404 && pathname.includes("/games/Asteroids/assets/images/")) {
      imageNotFoundResponses.push(pathname);
    }
  });
  return {
    imageRequests,
    imageNotFoundResponses
  };
}

async function waitForAsteroidsBoot(page) {
  await page.waitForFunction(() => window.__asteroidsNewBootStage === "boot-complete");
  await page.waitForFunction(() => {
    const state = window.__asteroidsNewEngine?.backgroundImageLayer?.getState?.();
    return state?.manifestResolved === true;
  });
}

async function readCanvasPixel(page, x, y) {
  return page.evaluate(({ pixelX, pixelY }) => {
    const canvas = document.querySelector("canvas");
    const context = canvas?.getContext?.("2d");
    return context
      ? Array.from(context.getImageData(pixelX, pixelY, 1, 1).data)
      : [];
  }, { pixelX: x, pixelY: y });
}

test("loads Asteroids background image from Asset Manager background role only", async ({ page }) => {
  const server = await startRepoServer();
  const pageErrors = [];
  const requests = collectAsteroidsImageRequests(page);

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await workspaceV2CoverageReporter.start(page);
  try {
    await page.goto(`${server.baseUrl}/games/Asteroids/index.html`, { waitUntil: "networkidle" });
    await waitForAsteroidsBoot(page);
    await expect.poll(() => requests.imageRequests.includes(ASTEROIDS_BACKGROUND_IMAGE_PATH)).toBe(true);
    await expect.poll(() => requests.imageRequests.includes(ASTEROIDS_BEZEL_IMAGE_PATH)).toBe(true);
    await page.waitForFunction(() => window.__asteroidsNewEngine.backgroundImageLayer.getState().status === "ready");
    await expect.poll(async () => {
      const centerPixel = await readCanvasPixel(page, 480, 360);
      return centerPixel.join(",");
    }).not.toBe("2,6,23,255");

    const backgroundState = await page.evaluate(() => window.__asteroidsNewEngine.backgroundImageLayer.getState());
    expect(backgroundState.path).toBe(ASTEROIDS_BACKGROUND_IMAGE_PATH);
    expect(backgroundState.status).toBe("ready");
    expect(requests.imageRequests).not.toContain(ASTEROIDS_OLD_BACKGROUND_IMAGE_PATH);
    expect(requests.imageNotFoundResponses).not.toContain(ASTEROIDS_OLD_BACKGROUND_IMAGE_PATH);
    expect(pageErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("omits optional Asteroids background image when Asset Manager background role is absent", async ({ page }) => {
  const server = await startRepoServer();
  const pageErrors = [];
  const requests = collectAsteroidsImageRequests(page);
  const manifestWithoutBackground = removeAssetManagerImageRole(await readAsteroidsManifest(), "background");

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.route("**/games/Asteroids/game.manifest.json", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(manifestWithoutBackground)
    });
  });

  await workspaceV2CoverageReporter.start(page);
  try {
    await page.goto(`${server.baseUrl}/games/Asteroids/index.html`, { waitUntil: "networkidle" });
    await waitForAsteroidsBoot(page);
    await page.waitForFunction(() => {
      const state = window.__asteroidsNewEngine?.backgroundImageLayer?.getState?.();
      return state?.manifestResolved === true
        && state?.path === ""
        && state?.status === "unavailable";
    });
    await page.waitForTimeout(250);

    const runtimeState = await page.evaluate(() => ({
      bootStage: window.__asteroidsNewBootStage,
      background: window.__asteroidsNewEngine.backgroundImageLayer.getState(),
      hasCanvas: !!document.querySelector("canvas")
    }));
    expect(runtimeState).toMatchObject({
      bootStage: "boot-complete",
      background: {
        path: "",
        status: "unavailable",
        manifestResolved: true
      },
      hasCanvas: true
    });
    expect(requests.imageRequests).not.toContain(ASTEROIDS_BACKGROUND_IMAGE_PATH);
    expect(requests.imageRequests).not.toContain(ASTEROIDS_OLD_BACKGROUND_IMAGE_PATH);
    expect(requests.imageNotFoundResponses).not.toContain(ASTEROIDS_BACKGROUND_IMAGE_PATH);
    expect(requests.imageNotFoundResponses).not.toContain(ASTEROIDS_OLD_BACKGROUND_IMAGE_PATH);
    expect(pageErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("omits optional Asteroids bezel image when Asset Manager bezel role is absent", async ({ page }) => {
  const server = await startRepoServer();
  const pageErrors = [];
  const requests = collectAsteroidsImageRequests(page);
  const manifestWithoutBezel = removeAssetManagerImageRole(await readAsteroidsManifest(), "bezel");

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.route("**/games/Asteroids/game.manifest.json", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(manifestWithoutBezel)
    });
  });

  await workspaceV2CoverageReporter.start(page);
  try {
    await page.goto(`${server.baseUrl}/games/Asteroids/index.html`, { waitUntil: "networkidle" });
    await waitForAsteroidsBoot(page);
    await page.waitForFunction(() => {
      const state = window.__asteroidsNewEngine?.fullscreenBezelLayer?.getState?.();
      return state?.manifestResolved === true
        && state?.path === ""
        && state?.attached === false;
    });
    await page.waitForTimeout(250);

    const bezelState = await page.evaluate(() => window.__asteroidsNewEngine.fullscreenBezelLayer.getState());
    expect(bezelState).toMatchObject({
      attached: false,
      path: "",
      manifestResolved: true
    });
    expect(requests.imageRequests).not.toContain(ASTEROIDS_BEZEL_IMAGE_PATH);
    expect(requests.imageNotFoundResponses).not.toContain(ASTEROIDS_BEZEL_IMAGE_PATH);
    expect(pageErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
