# Level 10.1A Palette Standalone Singleton Correction Report

## BUILD
- `BUILD_PR_LEVEL_10_1A_PALETTE_STANDALONE_SINGLETON_CORRECTION`

## Scope Applied
- Scanned all `games/*/game.manifest.json`.
- Migrated tool-owned palette collections into a single root `palette` per manifest.
- Removed tool-owned `palette`/`palettes` keys (including `primitive-skin-editor` and `palette-browser` if present).
- Normalized swatches:
  - uppercase `#RRGGBB`
  - removed opaque alpha suffixes
  - single-character symbols
  - deduped by hex
- Updated manifest-path consumer references that targeted old tool-owned palette locations.

## Per-Game Migration Results
| Game | Palette Found Under Primitive Skin Editor | Palettes Moved | Palettes Merged | Final Swatch Count | Duplicate Swatches Removed | Symbol Conflicts Fixed |
| --- | --- | --- | --- | --- | --- | --- |
| `_template` | yes | 1 | no | 2 | 0 | 0 |
| `AITargetDummy` | yes | 1 | no | 10 | 0 | 0 |
| `Asteroids` | yes | 3 | yes | 11 | 6 | 0 |
| `Bouncing-ball` | yes | 1 | no | 3 | 0 | 0 |
| `Breakout` | yes | 1 | no | 10 | 0 | 0 |
| `GravityWell` | yes | 1 | no | 10 | 0 | 0 |
| `Pacman` | yes | 1 | no | 10 | 0 | 0 |
| `Pong` | yes | 1 | no | 10 | 0 | 0 |
| `SolarSystem` | yes | 1 | no | 10 | 0 | 0 |
| `SpaceDuel` | yes | 1 | no | 10 | 0 | 0 |
| `SpaceInvaders` | yes | 1 | no | 10 | 0 | 0 |
| `vector-arcade-sample` | yes | 1 | no | 9 | 0 | 0 |

## Structural Validation
- `root palette singleton`: passed for all game manifests.
- `no root palettes collection`: passed.
- `no tools.*.palettes`: passed.
- `primitive-skin-editor has no palette ownership`: passed.
- `palette-browser has no duplicate palette ownership`: passed.
- swatch validation (`single-char symbol`, `uppercase #RRGGBB`): passed.

## Runtime/Launch Validation
- Executed: `npm run test:launch-smoke:games`
- Result:
  - `filters: games=true samples=false tools=false`
  - `PASS=12 FAIL=0 TOTAL=12`

## Read-Path Adjustment
- Updated legacy hard reference paths in:
  - `tools/shared/asteroidsPlatformDemo.js`
- Old path:
  - `games/Asteroids/game.manifest.json#tools.primitive-skin-editor.palettes...`
- New path:
  - `games/Asteroids/game.manifest.json#palette`

## No New Palette JSON Files
- No new files were created under `games/**/assets/palettes/*.json`.

## start_of_day
- No `start_of_day` files were modified.
