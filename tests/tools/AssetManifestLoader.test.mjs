import assert from "node:assert/strict";
import {
  discoverRuntimeAssets,
  getAssetManifestRelativePath,
  loadAssetManifest
} from "../../tools/shared/pipeline/assetManifestLoader.js";

function normalizePath(value) {
  return String(value || "").replace(/\\/g, "/");
}

export async function run() {
  const gameId = "Asteroids";
  const loaded = await loadAssetManifest(gameId);
  assert.equal(loaded.status, "ready");
  assert.equal(Array.isArray(loaded.issues), true);
  assert.equal(loaded.issues.length, 0);
  assert.equal(loaded.manifest.gameId, "asteroids");
  assert.equal(
    normalizePath(loaded.manifestPath).endsWith(getAssetManifestRelativePath(gameId)),
    true
  );

  const discovered = await discoverRuntimeAssets(gameId);
  assert.equal(discovered.status, "ready");
  assert.equal(discovered.issues.length, 0);
  assert.equal(Object.keys(discovered.runtimeAssetSources).length > 0, true);
  assert.equal(
    discovered.runtimeAssetSources["vector.asteroids.ship"].file.includes("/data/"),
    false
  );

  const missingGameId = await loadAssetManifest("");
  assert.equal(missingGameId.status, "invalid");
  assert.equal(missingGameId.issues.includes("gameId is required."), true);
}
