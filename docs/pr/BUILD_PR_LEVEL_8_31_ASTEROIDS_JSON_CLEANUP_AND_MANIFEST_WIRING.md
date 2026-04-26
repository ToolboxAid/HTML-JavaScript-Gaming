# BUILD_PR_LEVEL_8_31_ASTEROIDS_JSON_CLEANUP_AND_MANIFEST_WIRING

## Input List
User-provided Asteroids JSON list includes 21 files:

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

## Required Decisions

### 1. SSoT
`games/Asteroids/game.manifest.json` is the SSoT.

### 2. Legacy catalogs
These are not SSoT:
- `games/Asteroids/assets/tools.manifest.json`
- `games/Asteroids/assets/workspace.asset-catalog.json`

In this PR:
- delete only if game manifest parity is proven and runtime does not reference them
- otherwise move/mark as legacy in report only

### 3. HUD duplicate
Both exist:
- `games/Asteroids/assets/palettes/asteroids-hud.palette.json`
- `games/Asteroids/assets/palettes/hud.json`

Target:
- keep `asteroids-hud.palette.json`
- delete `hud.json` if fully converted and unreferenced
- otherwise report why retained

### 4. Generic data folders
Current:
- `assets/parallax/data/*.data.json`
- `assets/sprites/data/*.data.json`
- `assets/tilemaps/data/*.data.json`
- `assets/vectors/data/*.data.json`

Target:
- do not use generic `data/` folders long term
- if safe, move to explicit tool asset path
- update `game.manifest.json`
- if not safe, document as deferred

### 5. Loose/unwired assets
Ensure these are either wired or deleted/deferred:
- `assets/tilesets/ui.json`
- `assets/images/bezel.stretch.override.json`
- all tool data files

## Required Report
Create:

```text
docs/dev/reports/level_8_31_asteroids_json_cleanup_report.md
```

Report sections:
- JSON file inventory
- SSoT manifest coverage
- deleted files
- retained legacy files
- deferred moves
- runtime references found
- final unreferenced JSON count

## Roadmap Movement
Update `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` status only:
- advance Asteroids JSON cleanup `[ ] -> [.]` or `[.] -> [x]`
- advance legacy catalog parity `[ ] -> [.]`
- no prose rewrite/delete

## Acceptance
- Every remaining Asteroids JSON file is one of:
  - referenced by `game.manifest.json`
  - proven runtime-required legacy file
  - documented deferred cleanup item
- `hud.json` removed if converted and unused.
- No duplicate HUD palette data remains unless justified.
- No validators added.
- No `start_of_day` changes.
