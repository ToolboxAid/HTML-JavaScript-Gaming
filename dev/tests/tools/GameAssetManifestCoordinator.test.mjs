import assert from "node:assert/strict";
import { coordinateGameAssetManifest } from "../../../www/src/shared/toolbox/pipeline/gameAssetManifestCoordinator.js";

export async function run() {
  const coordinated = coordinateGameAssetManifest({
    gameId: "Asteroids",
    existingManifest: {
      gameId: "asteroids",
      domains: {
        sprites: [
          {
            assetId: "sprite.legacy",
            runtimePath: "archive/v1-v2/games/asteroids/assets/sprites/sprite-legacy.json",
            toolDataPath: "archive/v1-v2/games/asteroids/assets/sprites/data/sprite-legacy-tool.json",
            sourceToolId: "sprite-editor"
          },
          {
            assetId: "sprite.ship",
            runtimePath: "archive/v1-v2/games/asteroids/assets/sprites/sprite-ship-old.json",
            toolDataPath: "archive/v1-v2/games/asteroids/assets/sprites/data/sprite-ship-old-tool.json",
            sourceToolId: "sprite-editor"
          }
        ]
      }
    },
    records: [
      {
        domain: "sprites",
        assetId: "sprite.ship",
        runtimePath: "archive/v1-v2/games/asteroids/assets/sprites/sprite-ship.json",
        toolDataPath: "archive/v1-v2/games/asteroids/assets/sprites/data/sprite-ship-tool.json",
        sourceToolId: "sprite-editor"
      },
      {
        domain: "vectors",
        assetId: "vector.ship",
        runtimePath: "archive/v1-v2/games/asteroids/assets/vectors/vector-ship.json",
        toolDataPath: "archive/v1-v2/games/asteroids/assets/vectors/data/vector-ship-tool.json",
        sourceToolId: "object-vector-studio-v2"
      }
    ]
  });

  assert.equal(coordinated.status, "ready");
  assert.equal(coordinated.filePath, "archive/v1-v2/games/asteroids/assets/tools.manifest.json");
  assert.equal(coordinated.summary.totalAssets, 3);
  assert.deepEqual(
    coordinated.manifest.domains.sprites.map((entry) => entry.assetId),
    ["sprite.legacy", "sprite.ship"]
  );
  assert.equal(
    coordinated.manifest.domains.sprites.find((entry) => entry.assetId === "sprite.ship").runtimePath,
    "archive/v1-v2/games/asteroids/assets/sprites/sprite-ship.json"
  );
  assert.equal(coordinated.manifest.domains.vectors[0].assetId, "vector.ship");
}
