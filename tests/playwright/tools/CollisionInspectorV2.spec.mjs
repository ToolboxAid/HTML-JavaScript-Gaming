import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter as coverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

async function dragCanvasPoint(page, from, to) {
  await page.locator("#collisionCanvas").evaluate((canvas, points) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / 960;
    const scaleY = rect.height / 640;
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
  test("loads an Asteroids game manifest and reports live vector, pixel, bounds, and hybrid collisions", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await coverageReporter.start(page);
    try {
      await page.goto(`${server.baseUrl}/tools/collision-inspector-v2/index.html`, { waitUntil: "networkidle" });
      await expect(page.locator("body.tools-platform-tool-page[data-tool-id='collision-inspector-v2']")).toBeVisible();
      await expect(page.locator("#collisionModeSelect option")).toHaveText(["Bounds", "Vector", "Pixel/Sprite", "Hybrid"]);

      await page.locator("#loadAsteroidsManifestButton").click();

      await expect(page.locator("#manifestSummary")).toContainText("Asteroids");
      await expect(page.locator("#manifestSummary")).toContainText("7 vector objects loaded");
      await expect(page.locator("#objectASelect")).toContainText("Asteroids Ship");
      await expect(page.locator("#objectBSelect")).toContainText("Large Asteroid");
      await page.locator("#objectASelect").selectOption("object.asteroids.ship");
      await page.locator("#objectBSelect").selectOption("object.asteroids.large-asteroid");
      await expect(page.locator("#collisionResultBadge")).toHaveText("No Collision");
      await expect(page.locator("#overlapState")).toHaveText("false");
      await expect(page.locator("#originState")).toContainText("A");
      await expect(page.locator("#rotationState")).toHaveText("A 0 / B 0");
      await expect(page.locator("#collisionSummary")).toContainText('"objectOrigins"');
      await expect(page.locator("#collisionSummary")).toContainText('"transformedPoints"');

      await page.locator("#objectBRotationInput").fill("180");
      await expect(page.locator("#rotationState")).toHaveText("A 0 / B 180");

      await dragCanvasPoint(page, { x: 500, y: 320 }, { x: 360, y: 320 });
      await expect(page.locator("#collisionResultBadge")).toHaveText("Collision");
      await expect(page.locator("#overlapState")).toHaveText("true");
      await expect(page.locator("#collisionSummary")).toContainText('"mode": "bounds"');
      await expect(page.locator("#collisionLog")).toHaveValue(/Dragged Object B/);

      await page.locator("#collisionModeSelect").selectOption("vector");
      await expect(page.locator("#collisionResultBadge")).toHaveText("Collision");
      await expect(page.locator("#collisionSummary")).toContainText('"mode": "vector"');

      await page.locator("#collisionModeSelect").selectOption("pixel-sprite");
      await expect(page.locator("#collisionResultBadge")).toHaveText("Collision");
      await expect(page.locator("#collisionSummary")).toContainText('"mode": "pixel-sprite"');

      await page.locator("#collisionModeSelect").selectOption("bounds");
      await expect(page.locator("#boundsState")).toHaveText("overlap");
      await expect(page.locator("#collisionResultBadge")).toHaveText("Collision");

      await page.locator("#collisionModeSelect").selectOption("hybrid");
      await expect(page.locator("#collisionSummary")).toContainText('"mode": "hybrid"');
      await expect(page.locator("#collisionResultBadge")).toHaveText("Collision");

      await page.locator("#resetSimulationButton").click();
      await expect(page.locator("#collisionResultBadge")).toHaveText("No Collision");
      await expect(page.locator("#rotationState")).toHaveText("A 0 / B 0");
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
        documentKind: "workspace-manifest",
        gameId: "Asteroids",
        gameRoot: "games/Asteroids/",
        name: "Asteroids Workspace Manager V2 Context",
        tools: gameManifest.tools
      };
      await page.addInitScript((context) => {
        sessionStorage.setItem("workspace-manager-v2-collision-test", JSON.stringify(context));
      }, workspaceContext);
      await page.goto(`${server.baseUrl}/tools/collision-inspector-v2/index.html?launch=workspace&hostContextId=workspace-manager-v2-collision-test`, { waitUntil: "networkidle" });

      await expect(page.locator('[data-launch-mode-nav="workspace"]')).toBeVisible();
      await expect(page.locator('[data-launch-mode-nav="tool"]')).toBeHidden();
      await expect(page.locator("#manifestSummary")).toContainText("Asteroids Workspace Manager V2 Context");
      await expect(page.locator("#objectASelect")).toContainText("Asteroids Ship");
      await expect(page.locator("#objectBSelect")).toContainText("Large Asteroid");
      await page.locator("#objectASelect").selectOption("object.asteroids.large-ufo");
      await page.locator("#objectBSelect").selectOption("object.asteroids.small-ufo");
      await page.locator("#objectARotationInput").fill("180");
      await expect(page.locator("#rotationState")).toHaveText("A 180 / B 0");
      await expect(page.locator("#collisionSummary")).toContainText('"objectA": "Large UFO (object.asteroids.large-ufo)"');
      await expect(page.locator("#collisionSummary")).toContainText('"shapeRotationsA"');
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });
});
