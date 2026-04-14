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
  assert.deepEqual(ready.errors, []);
  assert.equal(ready.debugState.pipeline.status, "ready");
  assert.equal(ready.debugState.pipeline.recordCount, 4);
  assert.equal(Object.keys(ready.debugState.manifest.domains).length, 4);
  assert.equal(ready.stages.validate.valid, true);
  assert.equal(ready.records.length, 4);
  assert.equal(ready.stages.emit.coordinatorPath, "games/asteroids/assets/tools.manifest.json");
  assert.equal(ready.stages.emit.gameAssetManifestPath, "games/asteroids/assets/tools.manifest.json");
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
  assert.equal(ready.gameAssetManifest.status, "ready");
  assert.equal(ready.gameAssetManifest.filePath, "games/asteroids/assets/tools.manifest.json");
  assert.equal(ready.gameAssetManifest.manifest.domains.sprites[0].assetId, "sprite.ship");
  assert.equal(
    ready.gameAssetManifest.manifest.domains.sprites[0].runtimePath.startsWith("games/asteroids/assets/sprites/"),
    true
  );
  assert.equal(
    ready.gameAssetManifest.manifest.domains.sprites[0].toolDataPath.startsWith("games/asteroids/assets/sprites/data/"),
    true
  );

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
  assert.equal(Array.isArray(invalid.errors), true);
  assert.equal(invalid.errors.some((entry) => entry.code === "PIPELINE_TOOL_CONTRACT_INVALID"), true);
  assert.equal(invalid.debugState.pipeline.status, "invalid");
  assert.equal(invalid.debugState.pipeline.errorCount > 0, true);
  assert.equal(invalid.stages.validate.valid, false);
  assert.equal(
    invalid.stages.validate.issues.some((entry) => entry.includes("sprite-editor: project.assetRefs block is required.")),
    true
  );
  assert.equal(invalid.records.length, 0);
  assert.equal(invalid.gameAssetManifest, undefined);
}
