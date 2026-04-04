import assert from "node:assert/strict";
import { buildProjectPackage, summarizeProjectPackaging } from "../../tools/shared/projectPackaging.js";

export async function run() {
  const registry = {
    version: 1,
    projectId: "demo-project",
    palettes: [
      { id: "palette.hero", name: "Hero Palette", path: "", colors: ["#112233FF"] }
    ],
    sprites: [
      { id: "sprite.hero", name: "Hero", path: "assets/sprites/hero.json", paletteId: "palette.hero", sourceTool: "sprite-editor" }
    ],
    tilesets: [
      { id: "tileset.overworld", name: "Overworld Tileset", path: "assets/tilesets/overworld.json", paletteId: "palette.hero", sourceTool: "tile-map-editor" }
    ],
    tilemaps: [
      { id: "tilemap.overworld", name: "Overworld", path: "assets/tilemaps/overworld.json", tilesetId: "tileset.overworld", sourceTool: "tile-map-editor" }
    ],
    images: [
      { id: "image.sky", name: "Sky", path: "assets/images/sky.svg", sourceTool: "parallax-editor" }
    ],
    parallaxSources: [
      { id: "parallax.sky", name: "Sky Layer", path: "assets/parallax/sky.json", imageId: "image.sky", sourceTool: "parallax-editor" }
    ]
  };

  const spritePackage = buildProjectPackage({
    registry,
    spriteProject: {
      assetRefs: {
        spriteId: "sprite.hero",
        paletteId: "palette.hero"
      }
    }
  });
  assert.equal(spritePackage.packageStatus, "ready");
  assert.deepEqual(
    spritePackage.manifest.package.assets.map((asset) => asset.id),
    ["palette.hero", "sprite.hero"]
  );
  assert.equal(summarizeProjectPackaging(spritePackage), "Package ready with 2 assets and 1 dependencies.");

  const tilePackage = buildProjectPackage({
    registry,
    tileMapDocument: {
      map: { name: "Overworld" },
      assetRefs: {
        tilemapId: "tilemap.overworld",
        tilesetId: "tileset.overworld"
      }
    }
  });
  assert.equal(tilePackage.packageStatus, "ready");
  assert.deepEqual(
    tilePackage.manifest.package.assets.map((asset) => asset.id),
    ["palette.hero", "tilemap.overworld", "tileset.overworld"]
  );
  assert.deepEqual(
    tilePackage.manifest.package.dependencies,
    [
      { from: "tilemap.overworld", to: "tileset.overworld", type: "usesTileset" },
      { from: "tileset.overworld", to: "palette.hero", type: "usesPalette" }
    ]
  );

  const repeatedTilePackage = buildProjectPackage({
    registry,
    tileMapDocument: {
      map: { name: "Overworld" },
      assetRefs: {
        tilemapId: "tilemap.overworld",
        tilesetId: "tileset.overworld"
      }
    }
  });
  assert.deepEqual(repeatedTilePackage, tilePackage);

  const blockedPackage = buildProjectPackage({
    registry,
    tileMapDocument: {
      map: { name: "Broken" },
      assetRefs: {
        tilemapId: "tilemap.overworld",
        tilesetId: "tileset.missing"
      }
    }
  });
  assert.equal(blockedPackage.packageStatus, "blocked");
  assert.equal(blockedPackage.manifest.package.reports[0].code, "VALIDATION_BLOCKED");
}
