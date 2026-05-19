import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter as coverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

async function dragCanvasPoint(page, from, to) {
  await page.locator("#collisionCanvas").evaluate((canvas, points) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    const clientPoint = (point) => ({
      clientX: rect.left + point.x * scaleX,
      clientY: rect.top + point.y * scaleY
    });
    const pointerInit = {
      bubbles: true,
      button: 0,
      buttons: 1,
      cancelable: true,
      pointerId: 1,
      pointerType: "mouse"
    };
    canvas.dispatchEvent(new PointerEvent("pointerdown", { ...pointerInit, ...clientPoint(points.from) }));
    window.dispatchEvent(new PointerEvent("pointermove", { ...pointerInit, ...clientPoint(points.to) }));
    window.dispatchEvent(new PointerEvent("pointerup", { ...pointerInit, buttons: 0, ...clientPoint(points.to) }));
  }, { from, to });
}

test.describe("Collision Inspector V2", () => {
  test("loads a game manifest and reports live vector, pixel, bounds, and hybrid collisions", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await coverageReporter.start(page);
    try {
      await page.goto(`${server.baseUrl}/tools/collision-inspector-v2/index.html?manifestPath=/games/Asteroids/game.manifest.json`, { waitUntil: "networkidle" });
      await expect(page.locator("body.tools-platform-tool-page[data-tool-id='collision-inspector-v2']")).toBeVisible();
      await expect(page.locator("#collisionModeSelect option")).toHaveText(["Bounds", "Vector", "Pixel/Sprite", "Hybrid"]);
      await expect(page.locator("#loadAsteroidsManifestButton")).toHaveCount(0);
      await expect(page.locator("#collisionManifestInput")).toBeVisible();

      await expect(page.locator("#manifestSummary")).toContainText("Asteroids");
      await expect(page.locator("#manifestSummary")).toContainText("7 objects loaded");
      await expect(page.locator("#manifestSummary")).toContainText("screen 960x720");
      await expect(page.locator("#collisionCanvas")).toHaveAttribute("width", "960");
      await expect(page.locator("#collisionCanvas")).toHaveAttribute("height", "720");
      const aspectRatio = await page.locator("#collisionCanvas").evaluate((canvas) => {
        const rect = canvas.getBoundingClientRect();
        return rect.width / rect.height;
      });
      expect(Math.abs(aspectRatio - (960 / 720))).toBeLessThan(0.02);
      await expect(page.locator("#objectASelect")).toContainText("Asteroids Ship");
      await expect(page.locator("#objectBSelect")).toContainText("Large Asteroid");
      await page.locator("#objectASelect").selectOption("object.asteroids.ship");
      await page.locator("#objectBSelect").selectOption("object.asteroids.large-asteroid");
      await expect(page.locator("#collisionModeSelect")).toHaveValue("vector");
      await expect(page.locator("#collisionResultBadge")).toHaveText("No Collision");
      await expect(page.locator("#overlapState")).toHaveText("false");
      await expect(page.locator("#originState")).toContainText("A");
      await expect(page.locator("#rotationState")).toHaveText("A 0 / B 0");
      await expect(page.locator("#collisionSummary")).toContainText('"enginePath": "src/engine/collision/objectVector.js"');
      await expect(page.locator("#collisionSummary")).toContainText('"objectOrigins"');
      await expect(page.locator("#collisionSummary")).toContainText('"recommendedMode": "vector"');
      await expect(page.locator("#collisionSummary")).toContainText('"transformedPoints"');

      await page.locator("#objectBRotationInput").fill("180");
      await expect(page.locator("#rotationState")).toHaveText("A 0 / B 180");

      await dragCanvasPoint(page, { x: 500, y: 320 }, { x: 360, y: 320 });
      await expect(page.locator("#collisionResultBadge")).toHaveText("Collision");
      await expect(page.locator("#overlapState")).toHaveText("true");
      await expect(page.locator("#collisionSummary")).toContainText('"mode": "vector"');
      await expect(page.locator("#collisionLog")).toHaveValue(/Dragged Object B/);

      await page.locator("#collisionModeSelect").selectOption("pixel-sprite");
      await expect(page.locator("#collisionResultBadge")).toHaveText("Collision");
      await expect(page.locator("#collisionSummary")).toContainText('"manualModeOverride": true');
      await expect(page.locator("#collisionSummary")).toContainText('"mode": "pixel-sprite"');

      await page.locator("#collisionModeSelect").selectOption("bounds");
      await expect(page.locator("#boundsState")).toHaveText("overlap");
      await expect(page.locator("#collisionResultBadge")).toHaveText("Collision");

      await page.locator("#collisionModeSelect").selectOption("hybrid");
      await expect(page.locator("#collisionSummary")).toContainText('"mode": "hybrid"');
      await expect(page.locator("#collisionResultBadge")).toHaveText("Collision");

      await page.locator("#collisionZoomInput").fill("1.5");
      await expect(page.locator("#zoomState")).toHaveText("1.5x");
      await expect(page.locator("#collisionSummary")).toContainText('"zoom": 1.5');

      await page.locator("#resetSimulationButton").click();
      await expect(page.locator("#collisionResultBadge")).toHaveText("No Collision");
      await expect(page.locator("#collisionModeSelect")).toHaveValue("vector");
      await expect(page.locator("#rotationState")).toHaveText("A 0 / B 0");
      await page.evaluate(() => window.__collisionInspectorV2App.shell.applyFullscreenState(true));
      await expect(page.locator("body")).toHaveClass(/tools-platform-fullscreen-active/);
      const fullscreenLayout = await page.evaluate(() => {
        const root = document.querySelector(".collision-inspector-v2.app-shell").getBoundingClientRect();
        const left = document.querySelector(".collision-inspector-v2__panel--left").getBoundingClientRect();
        const center = document.querySelector(".collision-inspector-v2__panel--center").getBoundingClientRect();
        const right = document.querySelector(".collision-inspector-v2__panel--right").getBoundingClientRect();
        return {
          centerAfterLeft: center.left >= left.right,
          centerFills: center.width > 400,
          leftAtSide: left.left <= root.left + 10,
          rightAfterCenter: right.left >= center.right,
          rightAtSide: right.right >= root.right - 10,
          rootWidth: root.width,
          viewportWidth: window.innerWidth
        };
      });
      expect(fullscreenLayout.rootWidth).toBeGreaterThanOrEqual(fullscreenLayout.viewportWidth - 2);
      expect(fullscreenLayout.leftAtSide).toBe(true);
      expect(fullscreenLayout.centerAfterLeft).toBe(true);
      expect(fullscreenLayout.centerFills).toBe(true);
      expect(fullscreenLayout.rightAfterCenter).toBe(true);
      expect(fullscreenLayout.rightAtSide).toBe(true);
      await page.evaluate(() => window.__collisionInspectorV2App.shell.applyFullscreenState(false));
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("loads Asteroids Object Vector objects from a Workspace Manager V2 manifest context", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await coverageReporter.start(page);
    try {
      const gameManifest = JSON.parse(await readFile(join(server.repoRoot, "games", "Asteroids", "game.manifest.json"), "utf8"));
      const workspaceContext = {
        $schema: "tools/schemas/workspace.manifest.schema.json",
        documentKind: "workspace-manifest",
        schema: "html-js-gaming.project",
        version: 1,
        id: "workspace-manager-v2-Asteroids",
        gameId: "Asteroids",
        gameRoot: "games/Asteroids/",
        assetsPath: "games/Asteroids/assets",
        name: "Asteroids Workspace Manager V2 Context",
        screen: gameManifest.screen,
        tools: gameManifest.tools
      };
      await page.addInitScript((context) => {
        sessionStorage.setItem("workspace-manager-v2-collision-test", JSON.stringify(context));
        sessionStorage.setItem("workspace-manager-v2-return-history-context-id", "different-context");
      }, workspaceContext);
      await page.goto(`${server.baseUrl}/tools/collision-inspector-v2/index.html?launch=workspace&fromTool=workspace-manager-v2&hostContextId=workspace-manager-v2-collision-test`, { waitUntil: "networkidle" });

      await expect(page.locator('[data-launch-mode-nav="workspace"]')).toBeVisible();
      await expect(page.locator('[data-launch-mode-nav="tool"]')).toBeHidden();
      await expect(page.locator("#collisionManifestInput")).toBeDisabled();
      await expect(page.locator("#manifestSummary")).toContainText("Asteroids Workspace Manager V2 Context");
      await expect(page.locator("#manifestSummary")).toContainText("screen 960x720");
      await expect(page.locator("#objectASelect")).toContainText("Asteroids Ship");
      await expect(page.locator("#objectBSelect")).toContainText("Large Asteroid");
      await page.locator("#objectASelect").selectOption("object.asteroids.large-ufo");
      await page.locator("#objectBSelect").selectOption("object.asteroids.small-ufo");
      await page.locator("#objectARotationInput").fill("180");
      await expect(page.locator("#rotationState")).toHaveText("A 180 / B 0");
      await expect(page.locator("#collisionSummary")).toContainText('"objectA": "Large UFO (object.asteroids.large-ufo)"');
      await expect(page.locator("#collisionSummary")).toContainText('"shapeRotationsA"');
      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/\/tools\/workspace-manager-v2\/index\.html\?hostContextId=workspace-manager-v2-collision-test/);
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });
});
