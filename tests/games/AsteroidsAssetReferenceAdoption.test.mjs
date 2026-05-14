import assert from "node:assert/strict";
import { buildAsteroidsPlatformDemo } from "../../tools/shared/asteroidsPlatformDemo.js";

export async function run() {
  const result = await buildAsteroidsPlatformDemo();
  const binding = result.demo.runtimeBinding;

  assert.equal(binding?.status, "ready");
  assert.equal(Array.isArray(binding?.issues), true);
  assert.equal(binding.issues.length, 0);

  const objectVectorSource = result.demo.runtimeAssetSources["object.asteroids.ship"];
  const rejectedIds = (binding.rejected || []).map((entry) => entry.assetId).sort();

  assert.equal((binding.domains.vectors || []).length, 0);
  assert.deepEqual(rejectedIds, [
    "parallax.asteroids-overlay",
    "parallax.asteroids-title",
    "tilemap.asteroids-stage"
  ]);
  assert.equal(objectVectorSource.file.includes("tools.object-vector-studio-v2.objects.object.asteroids.ship"), true);

  const runtimeAssetTable = result.demo.runtimeResult?.bootstrap?.assetTable || {};
  const runtimePathFor = (entry) => entry?.file || entry?.path || "";
  assert.equal(Object.keys(runtimeAssetTable).some((assetId) => assetId.startsWith(`vector.${"asteroids"}.`)), false);
  assert.equal(runtimePathFor(runtimeAssetTable["tilemap.asteroids-stage"]).includes("/data/"), false);
  assert.equal(runtimePathFor(runtimeAssetTable["parallax.asteroids-title"]).includes("/data/"), false);
  assert.equal(runtimeAssetTable["tilemap.asteroids-stage"].visualPreference.objectIds.ship, "object.asteroids.ship");
}
