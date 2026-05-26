import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function waitForAsteroidsBoot(page) {
  await page.waitForFunction(() => window.__asteroidsNewBootStage === "boot-complete");
  await page.waitForFunction(() => window.__asteroidsNewEngine?.scene?.world?.asteroids?.length > 0);
}

test("validates Asteroids ship visual states from manifest runtime rendering", async ({ page }) => {
  const server = await startRepoServer();
  const pageErrors = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await workspaceV2CoverageReporter.start(page);
  try {
    await page.goto(`${server.baseUrl}/games/Asteroids/index.html`, { waitUntil: "networkidle" });
    await waitForAsteroidsBoot(page);

    const result = await page.evaluate(() => {
      const engine = window.__asteroidsNewEngine;
      const scene = engine.scene;
      const renderer = engine.renderer;
      const originalDrawObjectVectorAsset = scene.drawObjectVectorAsset.bind(scene);
      const shipRenderCalls = [];

      scene.session.start(1);
      scene.resetBeatCadenceBaseline();
      scene.drawObjectVectorAsset = (renderTarget, renderKey, options = {}) => {
        if (renderKey === "ship" || renderKey === "shipVisualStatePreview") {
          shipRenderCalls.push({
            objectId: options.objectId,
            renderKey,
            stateId: options.stateId,
          });
        }
        return originalDrawObjectVectorAsset(renderTarget, renderKey, options);
      };

      scene.world.shipActive = true;
      scene.world.ship.thrusting = false;
      scene.render(renderer, engine);
      scene.world.ship.thrusting = true;
      scene.render(renderer, engine);
      const destroyedPreview = scene.debugPreviewShipVisualState(renderer, "destroyed", {
        rotation: scene.world.ship.angle,
        x: scene.world.ship.x,
        y: scene.world.ship.y,
      });
      const missingPreview = scene.debugPreviewShipVisualState(renderer, "missing-state");
      scene.drawObjectVectorAsset = originalDrawObjectVectorAsset;

      return {
        destroyedPreview,
        missingPreview,
        renderCounts: { ...scene.objectVectorRenderCounts },
        shipRenderCalls,
        shipVisualStates: scene.getShipVisualStateIds(),
      };
    });

    expect(result.shipVisualStates).toEqual(expect.arrayContaining(["idle", "move", "destroyed"]));
    expect(result.shipRenderCalls).toContainEqual({
      objectId: "object.asteroids.ship",
      renderKey: "ship",
      stateId: "idle",
    });
    expect(result.shipRenderCalls).toContainEqual({
      objectId: "object.asteroids.ship",
      renderKey: "ship",
      stateId: "move",
    });
    expect(result.shipRenderCalls.filter((call) => call.renderKey === "ship").map((call) => call.stateId))
      .not.toContain("destroyed");
    expect(result.destroyedPreview).toMatchObject({
      objectId: "object.asteroids.ship",
      ok: true,
      rendered: true,
      stateId: "destroyed",
    });
    expect(result.shipRenderCalls).toContainEqual({
      objectId: "object.asteroids.ship",
      renderKey: "shipVisualStatePreview",
      stateId: "destroyed",
    });
    expect(result.missingPreview).toMatchObject({
      objectId: "object.asteroids.ship",
      ok: false,
      rendered: false,
      stateId: "missing-state",
    });
    expect(result.renderCounts.shipVisualStatePreview).toBeGreaterThan(0);
    expect(pageErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
