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

test("uses weighted active asteroid objects for beat cadence", async ({ page }) => {
  const server = await startRepoServer();
  const pageErrors = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await coverageReporter.start(page);
  try {
    await page.goto(`${server.baseUrl}/games/Asteroids/index.html`, { waitUntil: "networkidle" });
    await waitForAsteroidsBoot(page);

    const timing = await page.evaluate(() => {
      const scene = window.__asteroidsNewEngine.scene;
      const createAsteroids = (count, size) => Array.from({ length: count }, () => ({ size }));
      const inactiveAsteroids = [
        { active: false, size: 3 },
        { alive: false, size: 2 },
        { destroyed: true, size: 1 },
      ];

      scene.world.asteroids = [...createAsteroids(8, 3), ...inactiveAsteroids];
      scene.resetBeatCadenceBaseline();
      const largeAsteroids = scene.resolveAsteroidsBeatTiming();

      scene.world.asteroids = [...createAsteroids(16, 2), ...inactiveAsteroids];
      const mediumAsteroids = scene.resolveAsteroidsBeatTiming();

      scene.world.asteroids = [...createAsteroids(32, 1), ...inactiveAsteroids];
      const smallAsteroids = scene.resolveAsteroidsBeatTiming();

      scene.world.asteroids = inactiveAsteroids;
      const noActiveAsteroids = scene.resolveAsteroidsBeatTiming();

      return {
        largeAsteroids,
        mediumAsteroids,
        noActiveAsteroids,
        smallAsteroids,
      };
    });

    expect(timing.largeAsteroids.weightedTotal).toBe(72);
    expect(timing.mediumAsteroids.weightedTotal).toBe(64);
    expect(timing.smallAsteroids.weightedTotal).toBe(32);
    expect(timing.noActiveAsteroids.weightedTotal).toBe(0);
    expect(timing.largeAsteroids.intervalSeconds).toBeCloseTo(0.98, 5);
    expect(timing.noActiveAsteroids.intervalSeconds).toBeCloseTo(0.18, 5);
    expect(timing.largeAsteroids.intervalSeconds).toBeGreaterThan(timing.mediumAsteroids.intervalSeconds);
    expect(timing.mediumAsteroids.intervalSeconds).toBeGreaterThan(timing.smallAsteroids.intervalSeconds);
    expect(timing.smallAsteroids.intervalSeconds).toBeGreaterThan(timing.noActiveAsteroids.intervalSeconds);
    expect(pageErrors).toEqual([]);
  } finally {
    await coverageReporter.stop(page);
    await server.close();
  }
});
