# BUILD_PR_LEVEL_10_12_ASSET_FILE_NAMING_NORMALIZATION_GLOBAL

## Problem
Asset files redundantly include game and asset context in filenames:
- asteroids-*.json
- asteroids-*.data.json

Directory structure already provides:
games/<gameId>/assets/<type>/

This creates duplication and coupling.

## Purpose
Normalize ALL asset filenames to be context-driven by directory only.

## Scope

Apply to ALL files under:
games/Asteroids/assets/**

### Rename Rules

Remove:
- game prefix (asteroids-)
- redundant asset descriptors already in folder path

Examples:

sprites/data/asteroids-demo.sprite.data.json
→ sprites/data/demo.data.json

tilemaps/data/asteroids-stage.tilemap.data.json
→ tilemaps/data/stage.data.json

parallax/data/asteroids-title.parallax.data.json
→ parallax/data/title.data.json

vectors/data/asteroids-vectors.library.data.json
→ vectors/data/library.data.json

manifest:
asteroids.asset.manifest.json
→ tools.manifest.json

### Rules

- File names must be minimal and local-context only
- No game name in file
- No type duplication (folder defines type)
- Preserve uniqueness within folder only

## Loader Impact

Loader must:
- NOT rely on filename patterns containing gameId
- Use directory + manifest references only

## Testable Outcome

- All asset files renamed consistently
- Loader resolves via manifest + directory, not naming
- No "asteroids" in filenames

## Non-Goals
- No engine modification