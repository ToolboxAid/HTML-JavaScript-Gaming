import assert from "node:assert/strict";
import {
  getBlockingAssetValidationMessage,
  hasBlockingAssetValidationFindings,
  summarizeAssetValidation,
  validateProjectAssetState
} from "../../tools/shared/projectAssetValidation.js";

export async function run() {
  const validRegistry = {
    version: 1,
    projectId: "demo-project",
    palettes: [
      {
        id: "palette.hero",
        name: "Hero Palette",
        enginePaletteId: "Hero Palette",
        colors: ["#112233FF"]
      }
    ],
    sprites: [
      {
        id: "sprite.hero",
        name: "Hero",
        path: "assets/sprites/hero.json",
        paletteId: "palette.hero"
      }
    ],
    tilesets: [
      {
        id: "tileset.overworld",
        name: "Overworld Tileset",
        path: "assets/tilesets/overworld.json",
        paletteId: "palette.hero"
      }
    ],
    tilemaps: [
      {
        id: "tilemap.overworld",
        name: "Overworld",
        path: "assets/tilemaps/overworld.json",
        tilesetId: "tileset.overworld"
      }
    ],
    images: [
      {
        id: "image.sky",
        name: "Sky",
        path: "assets/images/sky.svg"
      }
    ],
    parallaxSources: [
      {
        id: "parallax.sky",
        name: "Sky Layer",
        path: "assets/parallax/sky.json",
        imageId: "image.sky"
      }
    ]
  };

  const validResult = validateProjectAssetState({
    registry: validRegistry,
    spriteProject: {
      assetRefs: {
        paletteId: "palette.hero",
        spriteId: "sprite.hero"
      }
    },
    tileMapDocument: {
      map: { name: "Overworld" },
      assetRefs: {
        tilemapId: "tilemap.overworld",
        tilesetId: "tileset.overworld"
      }
    },
    parallaxDocument: {
      layers: [
        {
          id: "layer.sky",
          parallaxSourceId: "parallax.sky"
        }
      ]
    }
  });

  assert.equal(validResult.validation.status, "valid");
  assert.equal(hasBlockingAssetValidationFindings(validResult), false);
  assert.equal(validResult.validation.findings.length, 0);
  assert.equal(summarizeAssetValidation(validResult), "0 blocking findings, 0 warnings");

  const invalidRegistry = {
    ...validRegistry,
    sprites: [
      {
        id: "sprite.hero",
        name: "Hero",
        path: "assets/sprites/hero.json",
        paletteId: "palette.missing"
      },
      {
        id: "sprite.hero",
        name: "Hero Duplicate",
        path: "assets/sprites/hero-duplicate.json",
        paletteId: "palette.missing"
      }
    ]
  };

  const staleGraph = {
    version: 1,
    nodes: {
      "sprite.hero": { id: "sprite.hero", type: "sprite", name: "Hero", path: "assets/sprites/hero.json" }
    },
    edges: []
  };

  const invalidResult = validateProjectAssetState({
    registry: invalidRegistry,
    assetDependencyGraph: staleGraph,
    spriteProject: {
      assetRefs: {
        paletteId: "palette.missing",
        spriteId: "sprite.hero"
      }
    }
  });

  assert.equal(invalidResult.validation.status, "invalid");
  assert.equal(hasBlockingAssetValidationFindings(invalidResult), true);
  assert.deepEqual(
    invalidResult.validation.findings.map((finding) => finding.code),
    [
      "DUPLICATE_REGISTRY_ID",
      "INVALID_GRAPH_TARGET",
      "UNRESOLVED_PALETTE_LINK",
      "ORPHANED_GRAPH_NODE",
      "STALE_GRAPH_SNAPSHOT"
    ]
  );
  assert.equal(
    getBlockingAssetValidationMessage("Save Project", invalidResult),
    "Save Project blocked: Registry asset ID sprite.hero is duplicated across sprites[0], sprites[1]."
  );

  const repeatedInvalidResult = validateProjectAssetState({
    registry: invalidRegistry,
    assetDependencyGraph: staleGraph,
    spriteProject: {
      assetRefs: {
        paletteId: "palette.missing",
        spriteId: "sprite.hero"
      }
    }
  });
  assert.deepEqual(repeatedInvalidResult.validation.findings, invalidResult.validation.findings);

  const legacyTilemapResult = validateProjectAssetState({
    registry: validRegistry,
    tileMapDocument: {
      map: { name: "Legacy Overworld" },
      assetRefs: {
        tilemapId: "",
        tilesetId: ""
      },
      tileset: [{ id: 0, name: "Empty" }]
    },
    parallaxDocument: {
      layers: [
        {
          id: "legacy-layer",
          parallaxSourceId: "",
          imageSource: "backgrounds/sky.svg"
        }
      ]
    }
  });

  assert.equal(legacyTilemapResult.validation.status, "valid");
  assert.equal(hasBlockingAssetValidationFindings(legacyTilemapResult), false);
}
