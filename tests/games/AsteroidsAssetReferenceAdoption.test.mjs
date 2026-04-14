import assert from "node:assert/strict";
import { buildAsteroidsPlatformDemo } from "../../tools/shared/asteroidsPlatformDemo.js";

export async function run() {
  const result = await buildAsteroidsPlatformDemo();
  const binding = result.demo.runtimeBinding;

  assert.equal(binding?.status, "ready");
  assert.equal(Array.isArray(binding?.issues), true);
  assert.equal(binding.issues.length, 0);

  const vectorBinding = (binding.domains.vectors || []).find((entry) => entry.assetId === "vector.asteroids.ship");
  const tilemapBinding = (binding.domains.tilemaps || []).find((entry) => entry.assetId === "tilemap.asteroids-stage");
  const parallaxBinding = (binding.domains.parallax || []).find((entry) => entry.assetId === "parallax.asteroids-title");

  assert.equal(Boolean(vectorBinding), true);
  assert.equal(Boolean(tilemapBinding), true);
  assert.equal(Boolean(parallaxBinding), true);
  assert.equal(vectorBinding.runtimePath.includes("/data/"), false);
  assert.equal(tilemapBinding.runtimePath.includes("/data/"), false);
  assert.equal(parallaxBinding.runtimePath.includes("/data/"), false);

  const runtimeAssetTable = result.demo.runtimeResult?.bootstrap?.assetTable || {};
  const runtimePathFor = (entry) => entry?.file || entry?.path || "";
  assert.equal(runtimePathFor(runtimeAssetTable["vector.asteroids.ship"]), vectorBinding.runtimePath);
  assert.equal(runtimePathFor(runtimeAssetTable["tilemap.asteroids-stage"]), tilemapBinding.runtimePath);
  assert.equal(runtimePathFor(runtimeAssetTable["parallax.asteroids-title"]), parallaxBinding.runtimePath);
}
