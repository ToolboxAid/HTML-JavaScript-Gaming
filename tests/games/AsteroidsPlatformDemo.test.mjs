import assert from "node:assert/strict";
import { buildAsteroidsPlatformDemo, summarizeAsteroidsPlatformDemo } from "../../tools/shared/asteroidsPlatformDemo.js";

export async function run() {
  const first = await buildAsteroidsPlatformDemo();
  const second = await buildAsteroidsPlatformDemo();

  assert.equal(first.demo.status, "ready");
  assert.equal(first.demo.validationResult.validation.status, "valid");
  assert.equal(first.demo.packageResult.packageStatus, "ready");
  assert.equal(first.demo.runtimeResult.runtimeLoader.status, "ready");
  assert.equal(first.demo.multiTargetExportResult.multiTargetExport.status, "ready");
  assert.equal(first.demo.publishingResult.publishing.status, "ready");
  assert.equal(first.demo.runtimeHandoff.modulePath, "games/Asteroids/main.js");
  assert.equal(first.demo.runtimeHandoff.exportName, "bootAsteroids");
  assert.equal(first.demo.packageResult.manifest.package.projectId, "asteroids-platform-demo");
  assert.equal(first.demo.definition.demo.visualBaseline.preferred, "vector");
  assert.equal(first.demo.definition.demo.visualBaseline.rollbackDocumented, true);
  assert.deepEqual(
    first.demo.packageResult.manifest.package.assets.filter((asset) => asset.type === "vector").map((asset) => asset.id),
    [
      "vector.asteroids.asteroid.large",
      "vector.asteroids.asteroid.medium",
      "vector.asteroids.asteroid.small",
      "vector.asteroids.ship",
      "vector.asteroids.ui.title"
    ]
  );
  assert.equal(first.demo.vectorOnly.hasSpriteRuntimeDependency, false);
  assert.deepEqual(first.demo.vectorOnly.missingRequiredVectorIds, []);
  assert.equal(
    first.demo.packageResult.manifest.package.assets.some((asset) => asset.id === "sprite.asteroids-demo"),
    false
  );
  assert.deepEqual(first, second);
  assert.match(first.demo.reportText, /title, start, game-over, and restart loop/i);
  assert.match(first.demo.reportText, /Visual path: vector only/);
  assert.match(first.demo.reportText, /ASTEROIDS_VECTOR_ONLY_RUNTIME/);
  assert.match(first.demo.reportText, /ASTEROIDS_ROLLBACK_NOTES_ONLY/);
  assert.match(first.demo.reportText, /Publishing pipeline ready with 5 release targets\./);
  assert.equal(summarizeAsteroidsPlatformDemo(first), "Asteroids platform demo ready with 12 packaged assets.");
}
