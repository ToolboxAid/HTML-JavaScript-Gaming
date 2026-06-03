# Level 8.26 Manifest SSoT Audit Report

## Scope
Audited:
- `games/**/assets/tools.manifest.json`
- `games/**/assets/workspace.asset-catalog.json`
- game/workspace project JSON files under each game folder

Objective:
- per-game referenced JSON assets
- per-game unreferenced JSON assets
- duplicate/overlapping references
- proposed SSoT target

## Workspace Schema Re-check
File: `tools/schemas/workspace.schema.json`
- `samples` key present: no
- `sampleId` key present: no
- sample-only `phase` requirement present: no

Result: `workspace_schema_sample_concepts=0`

## Root File Audit
- `workspace.manifest.json`: contains both `games` and legacy `samples`.
- `package.json`: root npm project/scripts entrypoint.
- `package-lock.json`: root lockfile for deterministic installs.

## Manifest Wiring Adjustments Applied (Safe Data Wiring)
- No manifest path rewrites were retained in this PR.
- Audit note: game folder casing can appear mixed on Windows display, but tracked repo paths for these catalogs are lowercase (`games/bouncing-ball`, `games/pong`), and catalog paths were left as-is.
- No runtime JS logic changes.

## Per-Game Findings

### AITargetDummy
- Sources:
  - `games/AITargetDummy/assets/workspace.asset-catalog.json`
- Referenced JSON assets:
  - none
- Unreferenced JSON assets:
  - none
- Duplicate/overlap:
  - none
- Proposed SSoT target:
  - `workspace.asset-catalog.json`

### Asteroids
- Sources:
  - `games/Asteroids/assets/tools.manifest.json`
  - `games/Asteroids/assets/workspace.asset-catalog.json`
- Referenced JSON assets:
  - `games/Asteroids/assets/palettes/asteroids-classic.palette.json`
  - `games/Asteroids/assets/parallax/data/overlay.data.json`
  - `games/Asteroids/assets/parallax/data/title.data.json`
  - `games/Asteroids/assets/parallax/overlay.json`
  - `games/Asteroids/assets/parallax/title.json`
  - `games/Asteroids/assets/sprites/data/demo.data.json`
  - `games/Asteroids/assets/sprites/demo.json`
  - `games/Asteroids/assets/tilemaps/data/stage.data.json`
  - `games/Asteroids/assets/tilemaps/stage.json`
  - `games/Asteroids/assets/vectors/asteroid-large.json`
  - `games/Asteroids/assets/vectors/asteroid-medium.json`
  - `games/Asteroids/assets/vectors/asteroid-small.json`
  - `games/Asteroids/assets/vectors/data/library.data.json`
  - `games/Asteroids/assets/vectors/ship.json`
  - `games/Asteroids/assets/vectors/title.json`
- Unreferenced JSON assets:
  - `games/Asteroids/assets/images/bezel.stretch.override.json`
  - `games/Asteroids/assets/palettes/hud.json`
  - `games/Asteroids/assets/tilesets/ui.json`
- Duplicate/overlap:
  - none (current references split across two manifests)
- Proposed SSoT target:
  - `workspace.asset-catalog.json` as canonical runtime/workspace catalog
  - `tools.manifest.json` treated as derivable tool-lineage metadata until merged

Asteroids explicit checks:
- `games/Asteroids/assets/images/bezel.stretch.override.json`: unreferenced
- `games/Asteroids/assets/palettes/asteroids-classic.palette.json`: referenced
- `games/Asteroids/assets/palettes/hud.json`: unreferenced

### Bouncing-ball
- Sources:
  - `games/bouncing-ball/assets/workspace.asset-catalog.json`
- Referenced JSON assets:
  - `games/bouncing-ball/assets/palettes/bouncing-ball-classic.palette.json`
  - `games/bouncing-ball/assets/skins/skin.main.json`
- Unreferenced JSON assets:
  - none
- Duplicate/overlap:
  - none
- Proposed SSoT target:
  - `workspace.asset-catalog.json`

### Breakout
- Sources:
  - `games/breakout/assets/workspace.asset-catalog.json`
- Referenced JSON assets:
  - `games/breakout/assets/palettes/breakout-classic.palette.json`
  - `games/breakout/assets/skins/skin.main.json`
- Unreferenced JSON assets:
  - none
- Duplicate/overlap:
  - none
- Proposed SSoT target:
  - `workspace.asset-catalog.json`

### GravityWell
- Sources:
  - `games/GravityWell/assets/workspace.asset-catalog.json`
- Referenced JSON assets:
  - none
- Unreferenced JSON assets:
  - none
- Duplicate/overlap:
  - none
- Proposed SSoT target:
  - `workspace.asset-catalog.json`

### Pacman
- Sources:
  - `games/Pacman/assets/workspace.asset-catalog.json`
- Referenced JSON assets:
  - none
- Unreferenced JSON assets:
  - none
- Duplicate/overlap:
  - none
- Proposed SSoT target:
  - `workspace.asset-catalog.json`

### Pong
- Sources:
  - `games/pong/assets/workspace.asset-catalog.json`
- Referenced JSON assets:
  - `games/pong/assets/palettes/pong-classic.palette.json`
  - `games/pong/assets/skins/skin.main.json`
- Unreferenced JSON assets:
  - none
- Duplicate/overlap:
  - none
- Proposed SSoT target:
  - `workspace.asset-catalog.json`

### SolarSystem
- Sources:
  - `games/SolarSystem/assets/workspace.asset-catalog.json`
- Referenced JSON assets:
  - `games/SolarSystem/assets/palettes/solar-system-classic.palette.json`
  - `games/SolarSystem/assets/skins/skin.main.json`
- Unreferenced JSON assets:
  - none
- Duplicate/overlap:
  - none
- Proposed SSoT target:
  - `workspace.asset-catalog.json`

### SpaceDuel
- Sources:
  - `games/SpaceDuel/assets/workspace.asset-catalog.json`
- Referenced JSON assets:
  - `games/SpaceDuel/assets/palettes/space-duel-classic.palette.json`
- Unreferenced JSON assets:
  - none
- Duplicate/overlap:
  - none
- Proposed SSoT target:
  - `workspace.asset-catalog.json`

### SpaceInvaders
- Sources:
  - `games/SpaceInvaders/assets/workspace.asset-catalog.json`
- Referenced JSON assets:
  - `games/SpaceInvaders/assets/palettes/space-invaders-classic.palette.json`
- Unreferenced JSON assets:
  - none
- Duplicate/overlap:
  - none
- Proposed SSoT target:
  - `workspace.asset-catalog.json`

### vector-arcade-sample
- Sources:
  - `games/vector-arcade-sample/assets/workspace.asset-catalog.json`
  - `games/vector-arcade-sample/config/sample.project.json`
  - `games/vector-arcade-sample/runtime/bootstrap.runtime.json`
- Referenced JSON assets:
  - `games/vector-arcade-sample/assets/data/palettes/vector-native-primary.palette.json`
  - `games/vector-arcade-sample/assets/data/parallax/template-backdrop.parallax.json`
  - `games/vector-arcade-sample/assets/data/sprites/template-player.sprite.json`
  - `games/vector-arcade-sample/assets/data/tilemaps/template-arena.tilemap.json`
  - `games/vector-arcade-sample/assets/data/tilemaps/template-ui.tileset.json`
  - `games/vector-arcade-sample/assets/data/vectors/template-hud.vector.json`
  - `games/vector-arcade-sample/assets/data/vectors/template-obstacle-large.vector.json`
  - `games/vector-arcade-sample/assets/data/vectors/template-obstacle-small.vector.json`
  - `games/vector-arcade-sample/assets/data/vectors/template-player.vector.json`
  - `games/vector-arcade-sample/assets/data/vectors/template-title.vector.json`
- Unreferenced JSON assets:
  - none
- Duplicate/overlap:
  - none
- Proposed SSoT target:
  - `workspace.asset-catalog.json`

## Folder Shape Audit (`assets/<tool>/data/*`)
Observed examples:
- `games/Asteroids/assets/parallax/data/*`
- `games/Asteroids/assets/sprites/data/*`
- `games/Asteroids/assets/tilemaps/data/*`
- `games/Asteroids/assets/vectors/data/*`

Recommendation:
- Prefer explicit asset ownership paths over generic `data/` where feasible.
- No directory/file moves were performed in this PR.
