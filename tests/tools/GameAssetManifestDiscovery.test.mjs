import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import asteroidsManifest from "../../games/Asteroids/assets/tools.manifest.json" with { type: "json" };
import {
  discoverRuntimeAssetSourcesFromManifest,
  validateGameAssetManifestStructure
} from "../../tools/shared/pipeline/gameAssetManifestDiscovery.js";
import { createRuntimeManifestAssetLookup } from "../../tools/shared/pipeline/runtimeAssetLookup.js";

export async function run() {
  const validation = validateGameAssetManifestStructure(asteroidsManifest, { gameId: "asteroids" });
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.issues, []);

  const discovery = discoverRuntimeAssetSourcesFromManifest(asteroidsManifest, { gameId: "asteroids" });
  assert.equal(discovery.status, "ready");
  assert.equal(discovery.issues.length, 0);
  assert.equal(Object.keys(discovery.runtimeAssetSources).length > 0, true);
  assert.equal(discovery.runtimeAssetSources["vector.asteroids.ship"].file.includes("/data/"), false);
  assert.equal(discovery.runtimeAssetSources["sprite.asteroids.demo"].file.includes("/data/"), false);
  assert.equal(discovery.runtimeAssetSources["tilemap.asteroids.stage"].file.includes("/data/"), false);
  assert.equal(discovery.runtimeAssetSources["parallax.asteroids.title"].file.includes("/data/"), false);
  assert.equal(discovery.runtimeAssetSources["parallax.asteroids.overlay"].file.includes("/data/"), false);
  assert.equal(asteroidsManifest.domains.sprites.length > 0, true);
  assert.equal(asteroidsManifest.domains.tilemaps.length > 0, true);
  assert.equal(asteroidsManifest.domains.parallax.length > 0, true);
  assert.equal(asteroidsManifest.domains.vectors.length > 0, true);
  Object.values(asteroidsManifest.domains).flat().forEach((record) => {
    assert.equal(existsSync(record.runtimePath), true);
    assert.equal(existsSync(record.toolDataPath), true);
  });

  const lookup = createRuntimeManifestAssetLookup({
    gameId: "asteroids",
    gameAssetManifest: asteroidsManifest,
    missingBindingBehavior: "null"
  });

  assert.equal(lookup.binding.status, "ready");
  assert.equal(lookup.binding.issues.length, 0);
  assert.equal(lookup.resolvePackagedAsset({ id: "vector.asteroids.ship", type: "vector" }).file.includes("/data/"), false);
  assert.equal(lookup.resolvePackagedAsset({ id: "sprite.asteroids.demo", type: "sprite" }).file.includes("/data/"), false);
  assert.equal(lookup.resolvePackagedAsset({ id: "tilemap.asteroids.stage", type: "tilemap" }).file.includes("/data/"), false);
  assert.equal(lookup.resolvePackagedAsset({ id: "parallax.asteroids.title", type: "parallaxLayer" }).file.includes("/data/"), false);

  const invalidManifest = {
    ...asteroidsManifest,
    domains: {
      ...asteroidsManifest.domains,
      vectors: [
        {
          ...asteroidsManifest.domains.vectors[0],
          runtimePath: "games/Asteroids/assets/vectors/data/ship.json"
        }
      ]
    }
  };
  const invalidLookup = createRuntimeManifestAssetLookup({
    gameId: "asteroids",
    gameAssetManifest: invalidManifest,
    missingBindingBehavior: "null"
  });
  assert.equal(
    invalidLookup.getErrors().some((entry) => entry.code === "RUNTIME_MANIFEST_DISCOVERY_INVALID"),
    true
  );
}
