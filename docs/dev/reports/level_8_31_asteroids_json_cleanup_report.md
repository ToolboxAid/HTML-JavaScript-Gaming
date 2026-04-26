# Level 8.31 Asteroids JSON Cleanup Report

## JSON File Inventory
Asteroids JSON inventory (`games/Asteroids/**/*.json`) contains 22 files (including SSoT):

1. `games/Asteroids/assets/images/bezel.stretch.override.json`
2. `games/Asteroids/assets/palettes/asteroids-classic.palette.json`
3. `games/Asteroids/assets/palettes/asteroids-hud.palette.json`
4. `games/Asteroids/assets/palettes/hud.json`
5. `games/Asteroids/assets/parallax/data/overlay.data.json`
6. `games/Asteroids/assets/parallax/data/title.data.json`
7. `games/Asteroids/assets/parallax/overlay.json`
8. `games/Asteroids/assets/parallax/title.json`
9. `games/Asteroids/assets/sprites/data/demo.data.json`
10. `games/Asteroids/assets/sprites/demo.json`
11. `games/Asteroids/assets/tilemaps/data/stage.data.json`
12. `games/Asteroids/assets/tilemaps/stage.json`
13. `games/Asteroids/assets/tilesets/ui.json`
14. `games/Asteroids/assets/tools.manifest.json`
15. `games/Asteroids/assets/vectors/asteroid-large.json`
16. `games/Asteroids/assets/vectors/asteroid-medium.json`
17. `games/Asteroids/assets/vectors/asteroid-small.json`
18. `games/Asteroids/assets/vectors/data/library.data.json`
19. `games/Asteroids/assets/vectors/ship.json`
20. `games/Asteroids/assets/vectors/title.json`
21. `games/Asteroids/assets/workspace.asset-catalog.json`
22. `games/Asteroids/game.manifest.json` (SSoT)

## SSoT Manifest Coverage
- `games/Asteroids/game.manifest.json` is treated as SSoT.
- Coverage check result:
  - every non-manifest Asteroids JSON file path is referenced by the manifest (`21/21` wired).
- `assets/tilesets/ui.json` is wired through:
  - `assets.tileSets[].runtimePath`
  - and is also referenced in `tools/shared/asteroidsPlatformDemo.js`.

## Duplicate HUD Data Audit
Compared:
- `games/Asteroids/assets/palettes/hud.json`
- `games/Asteroids/assets/palettes/asteroids-hud.palette.json`

Findings:
- both are typed palette-schema JSON (`schema=html-js-gaming.palette`)
- swatches are equal (`4` swatches, identical values)

Deletion decision for `hud.json`:
- **retained** (not safe to delete yet)
- reasons:
  - still referenced by `tools/shared/asteroidsPlatformDemo.js`
  - still referenced by `games/Asteroids/game.manifest.json` legacy compatibility fields
  - still referenced by active docs/build records

## Legacy Catalog Audit
Audited:
- `games/Asteroids/assets/tools.manifest.json`
- `games/Asteroids/assets/workspace.asset-catalog.json`

Deletion decision:
- **retained** (not safe to delete yet)

Why retained:
- `tools.manifest.json` has active script/test/tooling references (for example `scripts/validate-asset-ownership-strategy.mjs`, `tests/tools/GameAssetManifestDiscovery.test.mjs`, pipeline tooling paths).
- `workspace.asset-catalog.json` remains part of runtime/tooling filename-based discovery conventions (for example game skin loading and workspace/tool catalog discovery patterns), and is still listed in manifest lineage.

## Generic `assets/*/data/*` Folder Audit
Audited:
- `assets/parallax/data/*`
- `assets/sprites/data/*`
- `assets/tilemaps/data/*`
- `assets/vectors/data/*`

Move decision:
- **deferred** (not safe in this PR)

Why deferred:
- these paths are wired in `game.manifest.json` and `assets/tools.manifest.json`
- multiple tests/tooling conventions still reference `.../data/...` toolData paths
- moving now would require broader runtime/tooling updates, outside this PR scope

## Deleted Files
- none

## Retained Legacy Files
- `games/Asteroids/assets/palettes/hud.json` (legacy compatibility)
- `games/Asteroids/assets/tools.manifest.json` (runtime/tooling/test dependency)
- `games/Asteroids/assets/workspace.asset-catalog.json` (runtime/tool discovery dependency)

## Runtime/Script References Found
Representative references that block safe deletion/moves:
- `tools/shared/asteroidsPlatformDemo.js` -> `games/Asteroids/assets/palettes/hud.json`, `games/Asteroids/assets/tilesets/ui.json`
- `scripts/validate-asset-ownership-strategy.mjs` -> `games/Asteroids/assets/tools.manifest.json`
- `tests/tools/GameAssetManifestDiscovery.test.mjs` -> `games/Asteroids/assets/tools.manifest.json`
- runtime/tooling conventions loading `workspace.asset-catalog.json` via filename-based discovery (game skin loader/platform shell/tooling)

## Palette Alpha Normalization
- `#RRGGBBFF` occurrences in Asteroids JSON: `0`
- no palette alpha normalization changes were required in this PR.

## Final Unreferenced JSON Count
- `final_unreferenced_json_count=0` (all remaining Asteroids JSON are manifest-wired, runtime-required legacy, or deferred with documented dependency rationale)

## Constraint Check
- `validators_added=0`
- `runtime_code_changes=0`
- `start_of_day_changes=0`
