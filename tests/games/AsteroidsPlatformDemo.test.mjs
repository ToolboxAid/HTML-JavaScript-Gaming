import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAsteroidsPlatformDemo, summarizeAsteroidsPlatformDemo } from "../../tools/shared/asteroidsPlatformDemo.js";

export async function run() {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
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
  const runtimeModulePath = path.join(repoRoot, ...first.demo.runtimeHandoff.modulePath.split("/"));
  assert.equal(fs.existsSync(runtimeModulePath), true);
  const runtimeModule = await import(new URL(`../../${first.demo.runtimeHandoff.modulePath}`, import.meta.url));
  assert.equal(typeof runtimeModule[first.demo.runtimeHandoff.exportName], "function");
  assert.equal(first.demo.packageResult.manifest.package.projectId, "asteroids-platform-demo");
  assert.equal(first.demo.definition.demo.visualBaseline.preferred, "object-vector");
  assert.equal(first.demo.definition.demo.visualBaseline.rollbackDocumented, true);
  assert.deepEqual(
    first.demo.packageResult.manifest.package.assets.filter((asset) => asset.type === "vector").map((asset) => asset.id),
    []
  );
  assert.equal(first.demo.objectVector.hasSpriteRuntimeDependency, false);
  assert.deepEqual(first.demo.objectVector.missingRequiredObjectIds, []);
  assert.match(first.demo.debugVisualizationResult.debugVisualization.reportText, /nodes=7/);
  assert.match(first.demo.performanceResult.performance.reportText, /Geometry: assets=/);
  assert.equal(
    first.demo.packageResult.manifest.package.assets.some((asset) => asset.id === "sprite.asteroids-demo"),
    false
  );
  assert.deepEqual(first, second);
  assert.match(first.demo.reportText, /title, start, game-over, and restart loop/i);
  assert.match(first.demo.reportText, /Visual path: object-vector only/);
  assert.match(first.demo.reportText, /ASTEROIDS_OBJECT_VECTOR_RUNTIME/);
  assert.match(first.demo.reportText, /ASTEROIDS_ROLLBACK_NOTES_ONLY/);
  assert.match(first.demo.reportText, /Publishing pipeline ready with 5 release targets\./);
  assert.equal(summarizeAsteroidsPlatformDemo(first), "Asteroids platform demo ready with 7 packaged assets.");
}
