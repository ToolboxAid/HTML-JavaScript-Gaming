# BUILD_PR_LEVEL_9_1A_ASTEROIDS_MANIFEST_MODEL_REVIEW

## Corrected Rules

1. `game.manifest.json` is the game SSoT.
2. The workspace schema must not own embedded game data.
3. Data means actual JSON object content, not a reference to another JSON file.
4. Data belongs inside the owning tool section.
5. Skin/HUD color data belongs to Primitive Skin Editor.
6. Palette Browser launches palette browsing only; it does not own HUD/skin data.
7. Asset Browser may own file references because binary/audio/image/font assets stay as files.
8. Lineage/legacy catalog references should be deleted after migration.
9. Launch data may be omitted if direct launch is already known by file location/router.

## Cleaned Manifest Shape For Review

```jsonc
{
  "schema": "html-js-gaming.game-manifest",
  "version": 1,

  "game": {
    "id": "asteroids",
    "name": "Asteroids"
  },

  "tools": [
    {
      "toolId": "primitive-skin-editor",
      "skins": [
        {
          "id": "skin.asteroids.hud",
          "name": "Asteroids HUD",
          "source": "games/Asteroids/assets/palettes/hud.json",
          "data": {
            "//": "Actual HUD/Primitive Skin JSON goes here after conversion. No reference-only JSON."
          }
        }
      ]
    },

    {
      "toolId": "preview-generator-tool",
      "previews": [
        {
          "id": "preview.asteroids.main",
          "kind": "image",
          "path": "/games/Asteroids/assets/images/preview.png"
        }
      ]
    },

    {
      "toolId": "asset-browser",
      "assets": {
        "audio": [
          {
            "assetId": "audio.asteroids.fire",
            "path": "/games/Asteroids/assets/audio/fire.wav",
            "kind": "audio",
            "source": "asset-browser"
          }
        ],
        "bezel": [
          {
            "assetId": "image.asteroids.bezel",
            "path": "/games/Asteroids/assets/images/bezel.png",
            "kind": "image",
            "source": "asset-browser",
            "uniformEdgeStretchPx": 10
          }
        ],
        "images": [],
        "fonts": [
          {
            "assetId": "font.asteroids.vector-battle",
            "path": "/games/Asteroids/assets/fonts/vector_battle.ttf",
            "kind": "font",
            "source": "asset-browser"
          }
        ]
      }
    },

    {
      "toolId": "sprite-editor",
      "sprites": [
        {
          "id": "sprite.asteroids.player-ship",
          "label": "Player Ship",
          "data": {
            "//": "Actual sprite JSON extracted from code or old JSON goes here."
          }
        }
      ]
    },

    {
      "toolId": "tile-map-editor",
      "maps": [
        {
          "id": "tilemap.asteroids.level-1",
          "label": "Level 1",
          "data": {
            "//": "Actual tile map JSON/data goes here."
          }
        }
      ],
      "tilesets": [
        {
          "id": "tileset.asteroids.ui",
          "label": "Asteroids UI Tileset",
          "data": {
            "//": "Actual tileset JSON from assets/tilesets/ui.json goes here."
          }
        }
      ]
    },

    {
      "toolId": "parallax-editor",
      "parallaxLevels": [
        {
          "id": "parallax.asteroids.title",
          "label": "Title",
          "data": {
            "//": "Actual parallax JSON from title/overlay files goes here."
          }
        },
        {
          "id": "parallax.asteroids.overlay",
          "label": "Overlay",
          "data": {
            "//": "Actual parallax JSON from title/overlay files goes here."
          }
        }
      ]
    },

    {
      "toolId": "vector-asset-studio",
      "vectors": [
        {
          "id": "vector.asteroids.ship",
          "type": "vector",
          "geometry": {
            "viewBox": "-24 -24 48 48",
            "paths": [
              { "d": "M 0 -18 L 14 16 L 0 8 L -14 16 Z" },
              { "d": "M -6 14 L 0 6 L 6 14" }
            ]
          },
          "style": {
            "stroke": true,
            "fill": false
          }
        },

        {
          "id": "vector.asteroids.asteroid-large",
          "type": "vector",
          "data": {
            "//": "Actual JSON from assets/vectors/asteroid-large.json goes here."
          }
        },

        {
          "id": "vector.asteroids.asteroid-medium",
          "type": "vector",
          "data": {
            "//": "Actual JSON from assets/vectors/asteroid-medium.json goes here."
          }
        },

        {
          "id": "vector.asteroids.asteroid-small",
          "type": "vector",
          "data": {
            "//": "Actual JSON from assets/vectors/asteroid-small.json goes here."
          }
        },

        {
          "id": "vector.asteroids.title",
          "type": "vector",
          "data": {
            "//": "Actual JSON from assets/vectors/title.json goes here."
          }
        },

        {
          "id": "vector.asteroids.library",
          "type": "vector-library",
          "data": {
            "//": "Actual JSON from assets/vectors/data/library.data.json goes here."
          }
        }
      ]
    }
  ]
}
```

## Files Intended To Be Removed After Data Migration

Delete after the actual JSON content is moved into the correct tool section:

```text
games/Asteroids/assets/palettes/asteroids-hud.palette.json
games/Asteroids/assets/parallax/data/overlay.data.json
games/Asteroids/assets/parallax/data/title.data.json
games/Asteroids/assets/parallax/overlay.json
games/Asteroids/assets/parallax/title.json
games/Asteroids/assets/sprites/data/demo.data.json
games/Asteroids/assets/sprites/demo.json
games/Asteroids/assets/tilemaps/data/stage.data.json
games/Asteroids/assets/tilemaps/stage.json
games/Asteroids/assets/tilesets/ui.json
games/Asteroids/assets/tools.manifest.json
games/Asteroids/assets/workspace.asset-catalog.json
games/Asteroids/assets/vectors/asteroid-large.json
games/Asteroids/assets/vectors/asteroid-medium.json
games/Asteroids/assets/vectors/asteroid-small.json
games/Asteroids/assets/vectors/data/library.data.json
games/Asteroids/assets/vectors/title.json
```

## Keep As Files
Binary/media files stay as files and are referenced by Asset Browser:

```text
games/Asteroids/assets/audio/*
games/Asteroids/assets/images/*.png
games/Asteroids/assets/fonts/*
```

## Needs Review
- Whether `launch` belongs in manifest at all.
- Whether `preview-generator-tool` should be called exactly that or use the existing preview tool id.
- Whether `asteroids-classic.palette.json` is still needed, or whether its swatches belong under Primitive Skin Editor / Palette Browser / a game palette tool section.
- Whether `bezel.stretch.override.json` becomes Asset Browser image metadata or a future Layout/Bezel tool section.
