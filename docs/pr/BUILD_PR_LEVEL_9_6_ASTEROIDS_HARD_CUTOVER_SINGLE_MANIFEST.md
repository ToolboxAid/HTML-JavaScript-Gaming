# BUILD_PR_LEVEL_9_6_ASTEROIDS_HARD_CUTOVER_SINGLE_MANIFEST

## Objective
Complete Asteroids hard cutover to a single JSON manifest.

## Current Failure
Asteroids still has 22 JSON files:

```text
games/Asteroids/assets/images/bezel.stretch.override.json
games/Asteroids/assets/palettes/asteroids-classic.palette.json
games/Asteroids/assets/palettes/asteroids-hud.palette.json
games/Asteroids/assets/palettes/hud.json
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
games/Asteroids/assets/vectors/asteroid-large.json
games/Asteroids/assets/vectors/asteroid-medium.json
games/Asteroids/assets/vectors/asteroid-small.json
games/Asteroids/assets/vectors/data/library.data.json
games/Asteroids/assets/vectors/ship.json
games/Asteroids/assets/vectors/title.json
games/Asteroids/assets/workspace.asset-catalog.json
games/Asteroids/game.manifest.json
```

## Required Final State

```text
games/Asteroids/game.manifest.json
```

Only this JSON file may remain under `games/Asteroids`.

## Hard Cutover Steps

### 1. Read and Inline
For every Asteroids JSON file except `game.manifest.json`:
- read JSON
- place actual JSON object content into the correct owning tool section in `game.manifest.json`
- do not place references to deleted JSON files

### 2. Owning Tool Sections
Use these ownership rules:

| Source Data | Manifest Tool Section |
|---|---|
| HUD/skin colors | `primitive-skin-editor` |
| classic palette swatches | palette/palette-browser or primitive skin section, based on current usage |
| vector files | `vector-asset-studio.vectors` |
| vector library data | `vector-asset-studio.libraries` |
| sprites | `sprite-editor.sprites` |
| tilemaps | `tile-map-editor.maps` |
| tilesets | `tile-map-editor.tilesets` |
| parallax | `parallax-editor.parallaxLevels` |
| bezel/stretch override | `asset-browser.assets.bezel` metadata, or explicit `bezel` manifest section if already present |
| tools.manifest data | merge useful lineage/tool data, then delete |
| workspace.asset-catalog data | merge useful asset catalog data, then delete |

### 3. Fix Runtime References
Search Asteroids files for all deleted JSON paths and update them to use `game.manifest.json`.

Required search terms:
- `.json`
- `workspace.asset-catalog`
- `tools.manifest`
- `asteroids-classic.palette`
- `asteroids-hud.palette`
- `hud.json`
- `bezel.stretch.override`
- `overlay.data`
- `title.data`
- `demo.data`
- `stage.data`
- `library.data`

### 4. Delete Old JSON
After data preservation and reference fixes, delete every Asteroids JSON except:

```text
games/Asteroids/game.manifest.json
```

### 5. Verify
- Asteroids launches directly.
- No network/file 404s for deleted JSON.
- No old JSON path references remain.
- JSON count under `games/Asteroids` is exactly 1.

## Forbidden
- Do not add embedded game data to `workspace.schema.json`.
- Do not create new generic schema buckets unless already supported.
- Do not leave reference-to-reference JSON.
- Do not keep legacy catalogs.
- Do not modify `start_of_day`.

## Required Report
Create:

```text
docs/dev/reports/level_9_6_asteroids_hard_cutover_report.md
```

Report:
- before JSON count
- after JSON count
- files inlined
- files deleted
- runtime references fixed
- direct launch result
- any retained JSON and reason; expected retained count is 1

## Acceptance
- `games/Asteroids/**/*.json` count = 1.
- Only `games/Asteroids/game.manifest.json` remains.
- Asteroids direct launch works.
- No 404s for deleted JSON files.
- No legacy catalog references remain.
- No validators added.
- No `start_of_day` changes.
- Delta ZIP returned.
