import assert from "node:assert/strict";
import {
  TOOL_DATA_CONTRACT_SCHEMA,
  TOOL_DATA_CONTRACT_VERSION,
  buildProjectToolIntegration,
  validateToolStateContract
} from "../../tools/shared/projectToolIntegration.js";

export async function run() {
  const validTileState = {
    documentModel: {
      assetRefs: {
        tilemapId: "tilemap.alpha",
        tilesetId: "tileset.alpha",
        parallaxSourceIds: ["parallax.alpha", "parallax.alpha"]
      }
    }
  };
  const validSpriteState = {
    project: {
      assetRefs: {
        spriteId: "sprite.hero",
        paletteId: "palette.hero"
      }
    }
  };

  const tileValidation = validateToolStateContract("tile-map-editor", validTileState);
  assert.equal(tileValidation.valid, true);
  assert.equal(tileValidation.contractId, "tool-state.tile-map-editor/1");
  assert.equal(tileValidation.normalizedState.documentModel.assetRefs.tilemapId, "tilemap.alpha");
  assert.deepEqual(tileValidation.normalizedState.documentModel.assetRefs.parallaxSourceIds, ["parallax.alpha"]);

  const invalidSpriteValidation = validateToolStateContract("sprite-editor", { project: {} });
  assert.equal(invalidSpriteValidation.valid, false);
  assert.deepEqual(invalidSpriteValidation.issues, ["project.assetRefs block is required."]);

  const integration = buildProjectToolIntegration({
    "tile-map-editor": validTileState,
    "sprite-editor": { project: {} },
    "vector-asset-studio": { selectedPaletteId: "palette.shared" }
  });

  assert.equal(integration.contractSummary.schema, TOOL_DATA_CONTRACT_SCHEMA);
  assert.equal(integration.contractSummary.version, TOOL_DATA_CONTRACT_VERSION);
  assert.equal(integration.contractSummary.status, "invalid");
  assert.deepEqual(integration.contractSummary.invalidToolIds, ["sprite-editor"]);
  assert.equal(integration.tools["tile-map-editor"].contractStatus, "valid");
  assert.equal(integration.tools["sprite-editor"].contractStatus, "invalid");
  assert.equal(
    integration.tools["sprite-editor"].contractIssues.includes("project.assetRefs block is required."),
    true
  );
  assert.equal(integration.tools["vector-asset-studio"].contractStatus, "valid");
  assert.deepEqual(integration.assetReferences.tilemapIds, ["tilemap.alpha"]);
  assert.deepEqual(integration.assetReferences.tilesetIds, ["tileset.alpha"]);
  assert.deepEqual(integration.assetReferences.parallaxSourceIds, ["parallax.alpha"]);
  assert.deepEqual(integration.assetReferences.paletteIds, ["palette.shared"]);
}
