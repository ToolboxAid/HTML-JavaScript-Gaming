import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import asteroidsGameManifest from "../../games/Asteroids/game.manifest.json" with { type: "json" };
import {
  discoverRuntimeAssetSourcesFromManifest,
  validateGameAssetManifestStructure
} from "../../tools/shared/pipeline/gameAssetManifestDiscovery.js";
import { createRuntimeManifestAssetLookup } from "../../tools/shared/pipeline/runtimeAssetLookup.js";

export async function run() {
  const asteroidsManifest = {
    schema: "html-js-gaming.game-asset-manifest",
    version: 1,
    gameId: "asteroids",
    domains: asteroidsGameManifest?.lineage?.toolDomains || {}
  };

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
    assert.equal(record.runtimePath.startsWith("games/Asteroids/game.manifest.json#"), true);
    assert.equal(record.toolDataPath.startsWith("games/Asteroids/game.manifest.json#"), true);
    assert.equal(existsSync("games/Asteroids/game.manifest.json"), true);
  });

  const lookup = createRuntimeManifestAssetLookup({
    gameId: "asteroids",
    gameAssetManifest: asteroidsManifest,
    missingBindingBehavior: "null"
  });

  assert.equal(lookup.binding.status, "ready");
  assert.equal(lookup.binding.issues.length, 0);
  assert.equal(lookup.binding.rejected.length > 0, true);
  assert.equal(lookup.resolvePackagedAsset({ id: "vector.asteroids.ship", type: "vector" }), null);
  assert.equal(lookup.resolvePackagedAsset({ id: "sprite.asteroids.demo", type: "sprite" }), null);
  assert.equal(lookup.resolvePackagedAsset({ id: "tilemap.asteroids.stage", type: "tilemap" }), null);
  assert.equal(lookup.resolvePackagedAsset({ id: "parallax.asteroids.title", type: "parallaxLayer" }), null);

  const invalidManifest = {
    ...asteroidsManifest,
    domains: {
      ...asteroidsManifest.domains,
      vectors: [
        {
          ...asteroidsManifest.domains.vectors[0],
          runtimePath: "games/Asteroids/game.manifest.json#tools/vector-asset-studio/libraries/tooldata.asteroids.vectors.library/data"
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
    invalidLookup.getErrors().some((entry) => (
      entry.code === "RUNTIME_MANIFEST_DISCOVERY_INVALID"
      || entry.code === "RUNTIME_BINDING_REJECTED"
    )),
    true
  );
}
