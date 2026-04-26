# BUILD_PR_LEVEL_9_7_REMOVE_INTERNAL_REFERENCES_AND_INLINE_DATA

## Objective
Convert Asteroids from:

```text
single JSON file with internal references
```

to:

```text
single JSON file with direct inline data
```

## Current Bad Patterns

Remove these from `games/Asteroids/game.manifest.json`:

### 1. Root `assetCatalog`
Remove the root `assetCatalog` object unless it only describes external binary/media files. If kept for binaries, rename/limit to asset-browser external file assets only and do not use it for JSON data.

Bad:

```json
"assetCatalog": {
  "palette.asteroids.classic": {
    "path": "/games/Asteroids/game.manifest.json#tools/primitive-skin-editor/palettes/palette.asteroids.classic"
  }
}
```

### 2. `runtimeSource`
Remove fields like:

```json
"runtimeSource": "/games/Asteroids/game.manifest.json#tools/..."
```

### 3. Internal `source.path`
Remove fields like:

```json
"source": {
  "kind": "svg",
  "path": "/games/Asteroids/game.manifest.json#tools/vector-asset-studio/vectors/vector.asteroids.ship"
}
```

### 4. Internal fragment paths
Remove any string containing:

```text
/game.manifest.json#
#tools/
#tools.
```

### 5. Lineage pointer sections
Remove:
- `lineage.inlinedSourceFiles`
- `lineage.toolDomains`

Keep only minimal build note if needed:

```json
"lineage": {
  "build": "BUILD_PR_LEVEL_9_7_REMOVE_INTERNAL_REFERENCES_AND_INLINE_DATA"
}
```

or remove `lineage` entirely if not needed.

## Correct Data Model

### Vector Data
Correct:

```json
{
  "id": "vector.asteroids.ship",
  "type": "vector",
  "geometry": {
    "viewBox": "-24 -24 48 48",
    "paths": []
  },
  "style": {
    "stroke": true,
    "fill": false
  }
}
```

No internal `source.path`.

### Sprite Data
Correct:

```json
{
  "id": "sprite.asteroids.demo",
  "frames": []
}
```

No `runtimeSource`.

### Tilemap Data
Correct:

```json
{
  "id": "tilemap.asteroids.stage",
  "screens": [],
  "systems": []
}
```

No `project.runtimeSource`.

### Parallax Data
Correct:

```json
{
  "id": "parallax.asteroids.overlay",
  "role": "gameplay-overlay",
  "enabled": true
}
```

No `runtimeSource`.

### Primitive Skin / HUD Data
Correct:
- HUD/skin data belongs under `primitive-skin-editor`.
- It must be actual color/skin JSON data.
- It must not be a reference to old `hud.json`.

### External File Assets
Only binary/media assets may keep paths:
- audio
- png/webp/svg image files
- fonts

These belong under `asset-browser`.

## Required Validation

After changes:

Search `games/Asteroids/game.manifest.json` for:
- `runtimeSource`
- `assetCatalog`
- `game.manifest.json#`
- `#tools/`
- `#tools.`
- `inlinedSourceFiles`
- `toolDomains`
- old deleted JSON filenames

Expected:
- none remain, except external media paths that are not JSON.

## Direct Launch
Asteroids must still launch directly.

## Required Report
Create:

```text
docs/dev/reports/level_9_7_remove_internal_references_report.md
```

Report:
- removed internal references count
- remaining external file paths
- remaining JSON file count under Asteroids
- direct launch result
- any retained reference and reason

## Acceptance
- `games/Asteroids/**/*.json` count remains 1.
- `game.manifest.json` contains no internal `#tools` references.
- `game.manifest.json` contains no `runtimeSource`.
- `game.manifest.json` contains no root JSON-data `assetCatalog`.
- Actual data remains in owning tool sections.
- External media paths are allowed only for non-JSON files.
- Asteroids launches directly.
- No validators added.
- No `start_of_day` changes.
