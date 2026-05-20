import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter as coverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.afterAll(async () => {
  await coverageReporter.writeReport();
});

async function waitForAsteroidsBoot(page) {
  await page.waitForFunction(() => window.__asteroidsNewBootStage === "boot-complete");
  await page.waitForFunction(() => window.__asteroidsNewEngine?.scene?.world?.asteroids?.length > 0);
}

test("keeps Asteroids gameplay smoke and debug diagnostics after scene cleanup", async ({ page }) => {
  const server = await startRepoServer();
  const pageErrors = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await coverageReporter.start(page);
  try {
    await page.goto(`${server.baseUrl}/games/Asteroids/index.html`, { waitUntil: "networkidle" });
    await waitForAsteroidsBoot(page);

    const diagnostics = await page.evaluate(() => {
      const engine = window.__asteroidsNewEngine;
      const scene = engine.scene;
      const updates = [];
      scene.session.start(1);
      scene.resetBeatCadenceBaseline();
      scene.devConsoleIntegration = {
        dispose() {},
        render() {},
        update(payload) {
          updates.push(payload.diagnosticsContext);
        }
      };
      scene.pushDebugEvent("SMOKE_EVENT", {
        one: 1,
        two: "two",
        three: true,
        four: 4,
        five: 5
      });
      scene.updateDebugIntegration(engine, 1 / 30, {
        scoreEvents: [20],
        sfx: ["fire"]
      });
      return {
        asteroidCount: scene.world.asteroids.length,
        beatMaxWeightedTotal: scene.beatMaxWeightedTotal,
        diagnosticsContext: updates[0],
        mode: scene.session.mode,
        renderCounts: window.__asteroidsObjectVectorRuntime?.renderCounts || {},
        shipActive: scene.world.shipActive
      };
    });

    expect(diagnostics.mode).toBe("playing");
    expect(diagnostics.shipActive).toBe(true);
    expect(diagnostics.asteroidCount).toBeGreaterThan(0);
    expect(diagnostics.beatMaxWeightedTotal).toBeGreaterThan(0);
    expect(diagnostics.diagnosticsContext.runtime.sceneId).toBe("asteroids-showcase");
    expect(diagnostics.diagnosticsContext.runtime.status).toBe("playing");
    expect(diagnostics.diagnosticsContext.render.stages).toEqual(["parallax", "entities", "sprite-effects", "vector-overlay"]);
    expect(diagnostics.diagnosticsContext.assets.asteroidsShowcase.presets).toEqual({
      defaultCommand: "asteroidsshowcase.preset.default",
      eventsCommand: "asteroidsshowcase.preset.events"
    });
    expect(diagnostics.diagnosticsContext.validation.asteroidsRecentEvents.at(-1)).toMatchObject({
      summary: "one=1 two=two three=true four=4",
      type: "SMOKE_EVENT"
    });
    expect(pageErrors).toEqual([]);
  } finally {
    await coverageReporter.stop(page);
    await server.close();
  }
});
