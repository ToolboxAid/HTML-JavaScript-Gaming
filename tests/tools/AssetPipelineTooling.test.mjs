import assert from "node:assert/strict";
import { runAssetPipelineTooling } from "../../tools/shared/pipeline/assetPipelineTooling.js";

export async function run() {
  const ready = runAssetPipelineTooling({
    gameId: "Asteroids",
    toolStates: {
      "tile-map-editor": {
        documentModel: {
          assetRefs: {
            tilemapId: "tilemap.core"
          }
        }
      },
      "sprite-editor": {
        project: {
          assetRefs: {
            spriteId: "sprite.ship",
            paletteId: "palette.core"
          }
        }
      }
    },
    domainInputs: {
      sprites: [
        { assetId: "sprite.ship", sourceToolId: "sprite-editor" }
      ],
      tilemaps: [
        { assetId: "tilemap.core", sourceToolId: "tile-map-editor" }
      ],
      parallax: [
        { assetId: "parallax.background", sourceToolId: "parallax-editor" }
      ],
      vectors: [
        { assetId: "vector.ship", sourceToolId: "vector-asset-studio" }
      ]
    }
  });

  assert.equal(ready.status, "ready");
  assert.equal(ready.stages.validate.valid, true);
  assert.equal(ready.records.length, 4);
  assert.equal(ready.stages.emit.coordinatorPath, "games/asteroids/assets/asteroids.assets.json");
  assert.equal(
    ready.records.every((entry) => entry.runtimePath.includes("/assets/") && !entry.runtimePath.includes("/data/")),
    true
  );
  assert.equal(
    ready.records.every((entry) => entry.toolDataPath.includes("/assets/") && entry.toolDataPath.includes("/data/")),
    true
  );
  assert.equal(ready.coordinator.domains.sprites[0].runtimePath.startsWith("games/asteroids/assets/sprites/"), true);
  assert.equal(ready.coordinator.domains.sprites[0].toolDataPath.startsWith("games/asteroids/assets/sprites/data/"), true);

  const invalid = runAssetPipelineTooling({
    gameId: "Asteroids",
    toolStates: {
      "sprite-editor": {
        project: {}
      }
    },
    domainInputs: {
      sprites: [{ assetId: "sprite.invalid", sourceToolId: "sprite-editor" }]
    }
  });

  assert.equal(invalid.status, "invalid");
  assert.equal(invalid.stages.validate.valid, false);
  assert.equal(
    invalid.stages.validate.issues.some((entry) => entry.includes("sprite-editor: project.assetRefs block is required.")),
    true
  );
  assert.equal(invalid.records.length, 0);
}
