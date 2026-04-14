import assert from "node:assert/strict";
import {
  ASTEROIDS_ASSET_MANIFEST_RELATIVE_PATH,
  discoverAsteroidsRuntimeAssets,
  loadAsteroidsAssetManifest
} from "../../tools/shared/pipeline/asteroidsAssetManifestLoader.js";

function normalizePath(value) {
  return String(value || "").replace(/\\/g, "/");
}

export async function run() {
  const loaded = await loadAsteroidsAssetManifest();
  assert.equal(loaded.status, "ready");
  assert.equal(Array.isArray(loaded.issues), true);
  assert.equal(loaded.issues.length, 0);
  assert.equal(loaded.manifest.gameId, "asteroids");
  assert.equal(normalizePath(loaded.manifestPath).endsWith(ASTEROIDS_ASSET_MANIFEST_RELATIVE_PATH), true);

  const discovered = await discoverAsteroidsRuntimeAssets();
  assert.equal(discovered.status, "ready");
  assert.equal(discovered.issues.length, 0);
  assert.equal(Object.keys(discovered.runtimeAssetSources).length > 0, true);
  assert.equal(
    discovered.runtimeAssetSources["vector.asteroids.ship"].file.includes("/data/"),
    false
  );
}
