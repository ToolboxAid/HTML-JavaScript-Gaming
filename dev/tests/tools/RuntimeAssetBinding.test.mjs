import assert from "node:assert/strict";
import { createRuntimeAssetBinding, resolveRuntimeAsset } from "../../../www/src/shared/toolbox/pipeline/runtimeAssetBinding.js";
import { coordinateGameAssetManifest } from "../../../www/src/shared/toolbox/pipeline/gameAssetManifestCoordinator.js";

export async function run() {
  const coordinated = coordinateGameAssetManifest({
    gameId: "Asteroids",
    records: [
      {
        domain: "sprites",
        assetId: "sprite.ship",
        runtimePath: "archive/v1-v2/games/asteroids/assets/sprites/sprite-ship.json",
        toolDataPath: "archive/v1-v2/games/asteroids/assets/sprites/data/sprite-ship-tool.json",
        sourceToolId: "sprite-editor"
      },
      {
        domain: "tilemaps",
        assetId: "tilemap.main",
        runtimePath: "archive/v1-v2/games/asteroids/assets/tilemaps/tilemap-main.json",
        toolDataPath: "archive/v1-v2/games/asteroids/assets/tilemaps/data/tilemap-main-tool.json",
        sourceToolId: "tile-map-editor"
      },
      {
        domain: "parallax",
        assetId: "parallax.bg",
        runtimePath: "archive/v1-v2/games/asteroids/assets/parallax/parallax-bg.json",
        toolDataPath: "archive/v1-v2/games/asteroids/assets/parallax/data/parallax-bg-tool.json",
        sourceToolId: "parallax-editor"
      },
      {
        domain: "vectors",
        assetId: "vector.ship",
        runtimePath: "archive/v1-v2/games/asteroids/assets/vectors/vector-ship.json",
        toolDataPath: "archive/v1-v2/games/asteroids/assets/vectors/data/vector-ship-tool.json",
        sourceToolId: "object-vector-studio-v2"
      },
      {
        domain: "sprites",
        assetId: "sprite.tool-only",
        runtimePath: "archive/v1-v2/games/asteroids/assets/sprites/data/sprite-tool-only.json",
        toolDataPath: "archive/v1-v2/games/asteroids/assets/sprites/data/sprite-tool-only-tool.json",
        sourceToolId: "sprite-editor"
      }
    ]
  });

  const binding = createRuntimeAssetBinding(coordinated.manifest);
  assert.equal(binding.status, "ready");
  assert.deepEqual(binding.issues, []);
  assert.equal(binding.domains.sprites.length, 1);
  assert.equal(binding.domains.tilemaps.length, 1);
  assert.equal(binding.domains.parallax.length, 1);
  assert.equal(binding.domains.vectors.length, 1);
  assert.equal(
    binding.rejected.some((entry) => entry.domain === "sprites" && entry.assetId === "sprite.tool-only"),
    true
  );

  const sprite = resolveRuntimeAsset(binding, { domain: "sprites", assetId: "sprite.ship" });
  assert.equal(sprite.runtimePath, "archive/v1-v2/games/asteroids/assets/sprites/sprite-ship.json");
  assert.equal(resolveRuntimeAsset(binding, { domain: "sprites", assetId: "sprite.tool-only" }), null);
  assert.equal(resolveRuntimeAsset(binding, { domain: "vectors", assetId: "vector.ship" }).runtimePath.includes("/data/"), false);

  const invalidBinding = createRuntimeAssetBinding({
    schema: "invalid.schema",
    version: 99,
    gameId: "asteroids",
    domains: {}
  });
  assert.equal(invalidBinding.status, "invalid");
  assert.equal(invalidBinding.issues.length > 0, true);
}
