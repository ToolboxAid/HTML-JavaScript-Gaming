import assert from "node:assert/strict";
import { buildGameplaySystemLayer, summarizeGameplaySystemLayer } from "../../tools/shared/gameplaySystemLayer.js";

export async function run() {
  const result = buildGameplaySystemLayer({
    runtimeResult: {
      bootstrap: {
        startupAssetIds: ["sprite.hero"],
        packageManifest: {
          package: {
            assets: [
              { id: "sprite.hero", type: "sprite" },
              { id: "palette.hero", type: "palette" }
            ]
          }
        }
      }
    }
  });
  assert.equal(result.gameplay.status, "ready");
  assert.equal(result.gameplay.bindings.length, 2);
  assert.equal(summarizeGameplaySystemLayer(result), "Gameplay system layer ready with 2 content bindings.");
}
