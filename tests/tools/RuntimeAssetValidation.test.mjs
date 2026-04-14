import assert from "node:assert/strict";
import { validateRuntimeResolvedAsset } from "../../tools/shared/pipeline/runtimeAssetValidation.js";

export async function run() {
  const validVector = validateRuntimeResolvedAsset({
    domain: "vectors",
    assetId: "vector.ship",
    runtimePath: "games/asteroids/assets/vectors/ship.vector.json",
    source: {
      kind: "vector",
      file: "games/asteroids/assets/vectors/ship.vector.json",
      runtimeKind: "vector-geometry"
    }
  });
  assert.equal(validVector.valid, true);

  const dataPathBlocked = validateRuntimeResolvedAsset({
    domain: "vectors",
    assetId: "vector.tool-only",
    runtimePath: "games/asteroids/assets/vectors/data/tool-only.vector.json",
    source: {
      kind: "vector",
      file: "games/asteroids/assets/vectors/data/tool-only.vector.json"
    }
  });
  assert.equal(dataPathBlocked.valid, false);
  assert.equal(dataPathBlocked.issues.some((issue) => issue.includes("/data/")), true);
  assert.equal(dataPathBlocked.errors.some((entry) => entry.code === "RUNTIME_PATH_DATA_BLOCKED"), true);

  const invalidTilemap = validateRuntimeResolvedAsset({
    domain: "tilemaps",
    assetId: "tilemap.main",
    runtimePath: "games/asteroids/assets/tilemaps/main.tilemap.json",
    source: {
      file: "games/asteroids/assets/tilemaps/main.tilemap.json"
    }
  });
  assert.equal(invalidTilemap.valid, false);
  assert.equal(invalidTilemap.issues.some((issue) => issue.includes("Tilemaps")), true);
  assert.equal(invalidTilemap.errors.some((entry) => entry.code === "RUNTIME_TILEMAP_METADATA_REQUIRED"), true);
}
