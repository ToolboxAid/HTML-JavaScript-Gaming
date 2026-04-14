import assert from "node:assert/strict";
import { coordinateGameAssetManifest } from "../../tools/shared/pipeline/gameAssetManifestCoordinator.js";

export async function run() {
  const coordinated = coordinateGameAssetManifest({
    gameId: "Asteroids",
    existingManifest: {
      gameId: "asteroids",
      domains: {
        sprites: [
          {
            assetId: "sprite.legacy",
            runtimePath: "games/asteroids/assets/sprites/sprite-legacy.json",
            toolDataPath: "games/asteroids/assets/sprites/data/sprite-legacy-tool.json",
            sourceToolId: "sprite-editor"
          },
          {
            assetId: "sprite.ship",
            runtimePath: "games/asteroids/assets/sprites/sprite-ship-old.json",
            toolDataPath: "games/asteroids/assets/sprites/data/sprite-ship-old-tool.json",
            sourceToolId: "sprite-editor"
          }
        ]
      }
    },
    records: [
      {
        domain: "sprites",
        assetId: "sprite.ship",
        runtimePath: "games/asteroids/assets/sprites/sprite-ship.json",
        toolDataPath: "games/asteroids/assets/sprites/data/sprite-ship-tool.json",
        sourceToolId: "sprite-editor"
      },
      {
        domain: "vectors",
        assetId: "vector.ship",
        runtimePath: "games/asteroids/assets/vectors/vector-ship.json",
        toolDataPath: "games/asteroids/assets/vectors/data/vector-ship-tool.json",
        sourceToolId: "vector-asset-studio"
      }
    ]
  });

  assert.equal(coordinated.status, "ready");
  assert.equal(coordinated.filePath, "games/asteroids/assets/asteroids.assets.json");
  assert.equal(coordinated.summary.totalAssets, 3);
  assert.deepEqual(
    coordinated.manifest.domains.sprites.map((entry) => entry.assetId),
    ["sprite.legacy", "sprite.ship"]
  );
  assert.equal(
    coordinated.manifest.domains.sprites.find((entry) => entry.assetId === "sprite.ship").runtimePath,
    "games/asteroids/assets/sprites/sprite-ship.json"
  );
  assert.equal(coordinated.manifest.domains.vectors[0].assetId, "vector.ship");
}
