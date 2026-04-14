import assert from "node:assert/strict";
import { createRuntimeManifestAssetLookup, getRuntimeBindingDomain } from "../../tools/shared/pipeline/runtimeAssetLookup.js";

export async function run() {
  assert.equal(getRuntimeBindingDomain("vector.ship"), "vectors");
  assert.equal(getRuntimeBindingDomain("tilemap.main"), "tilemaps");
  assert.equal(getRuntimeBindingDomain("parallax.bg"), "parallax");
  assert.equal(getRuntimeBindingDomain("palette.hud"), "");

  const strictLookup = createRuntimeManifestAssetLookup({
    gameId: "Asteroids",
    runtimeAssetSources: {
      "vector.ship": { file: "games/asteroids/assets/vectors/ship.vector.json", kind: "vector" },
      "tilemap.main": { file: "games/asteroids/assets/tilemaps/main.tilemap.json", kind: "tilemap" },
      "parallax.bg": { file: "games/asteroids/assets/parallax/background.parallax.json", kind: "parallaxLayer" },
      "vector.bad": { file: "games/asteroids/assets/vectors/bad.vector.json" },
      "vector.tool-only": { file: "games/asteroids/assets/vectors/data/tool-only.vector.json", kind: "vector" },
      "palette.hud": { kind: "palette", colors: ["#ffffffff"] }
    },
    missingBindingBehavior: "null"
  });

  assert.equal(strictLookup.binding.status, "ready");
  assert.equal(strictLookup.binding.issues.length, 0);
  assert.equal(strictLookup.binding.domains.vectors.length, 2);
  assert.equal(strictLookup.binding.domains.tilemaps.length, 1);
  assert.equal(strictLookup.binding.domains.parallax.length, 1);
  assert.equal(
    strictLookup.binding.rejected.some((entry) => entry.assetId === "vector.tool-only" && entry.reason === "non-runtime-path"),
    true
  );

  assert.equal(strictLookup.resolvePackagedAsset({ id: "vector.ship", type: "vector" }).file, "games/asteroids/assets/vectors/ship.vector.json");
  assert.equal(strictLookup.resolvePackagedAsset({ id: "vector.bad", type: "vector" }), null);
  assert.equal(strictLookup.resolvePackagedAsset({ id: "vector.tool-only", type: "vector" }), null);
  assert.equal(strictLookup.resolvePackagedAsset({ id: "palette.hud", type: "palette" }).kind, "palette");

  const fallbackLookup = createRuntimeManifestAssetLookup({
    gameId: "TemplateGame",
    runtimeAssetSources: {
      "vector.template.player": {
        file: "tools/templates/vector-native-arcade/assets/data/vectors/template-player.vector.json",
        path: "tools/templates/vector-native-arcade/assets/data/vectors/template-player.vector.json",
        kind: "vector"
      }
    },
    missingBindingBehavior: "static"
  });

  const fallbackResolved = fallbackLookup.resolvePackagedAsset({ id: "vector.template.player", type: "vector" });
  assert.equal(fallbackResolved.file, "tools/templates/vector-native-arcade/assets/data/vectors/template-player.vector.json");
  assert.equal(fallbackLookup.binding.domains.vectors.length, 0);
}
