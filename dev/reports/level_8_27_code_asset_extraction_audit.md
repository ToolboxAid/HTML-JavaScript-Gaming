# Level 8.27 Code Asset Extraction Audit

## Scope
Scanned game/sample source for code-defined content/data candidates that should be tool-owned JSON inputs.

Scan targets:
- `games/**/*.js`
- `games/**/*.mjs`
- `samples/**/*.js`
- `samples/**/*.mjs`

Pattern families audited:
- color literals: `#RGB`, `#RRGGBB`, `#RRGGBBAA`, `rgb(...)`, `rgba(...)`
- HUD color groups / palette-style objects
- inline shape arrays / vector primitives / point lists
- sprite frame arrays / tile arrays
- primitive skin-like objects
- parallax/layout/bezel-style inline data

## Quantitative Findings
- `files_scanned=850`
- `files_with_hits=314`
- `hex_hits=1614`
- `rgb_hits=201`
- `shape_array_defs=43`
- `obj_data_defs=18`

Top high-signal files:
1. `games/SpaceInvaders/game/SpaceInvadersScene.js` (score 69)
2. `games/Asteroids/game/AsteroidsGameScene.js` (score 38)
3. `games/SpaceDuel/game/SpaceDuelScene.js` (score 36)
4. `games/Pacman/game/PacmanFullAIScene.js` (score 26)
5. `games/SolarSystem/game/SolarSystemWorld.js` (score 20)
6. `games/Pong/game/PongScene.js` (score 14)
7. `games/GravityWell/game/GravityWellWorld.js` (score 16)
8. `samples/phase-02/0221/TilemapSystemScene.js` (inline tile/palette fallback)
9. `samples/phase-02/0224/TileCameraSpriteSliceScene.js` (fallback tile/sprite color data)
10. `samples/phase-12/1205/MultiSystemDemoScene.js` (tile/parallax inline color/layout data)

## Required Category Coverage
### Colors / HUD Colors
Observed broadly in game/sample render loops and theme constants, especially:
- `games/SpaceInvaders/game/SpaceInvadersScene.js`
- `games/Asteroids/game/AsteroidsGameScene.js`
- `games/SpaceDuel/game/SpaceDuelScene.js`
- `games/Pong/game/PongScene.js`
- `games/SolarSystem/game/SolarSystemScene.js`

### Shape Arrays / Vector Primitives
Observed in:
- `games/SpaceDuel/game/SpaceDuelScene.js` (`*_SEGMENTS` arrays)
- `games/GravityWell/game/GravityWellWorld.js` (`SHIP_SHAPE`, `BEACON_SHAPE`)
- `games/Asteroids/game/AsteroidsGameScene.js` (`LIFE_ICON_POINTS`)

### Sprite / Tile Arrays
Observed in:
- `games/SpaceInvaders/game/SpaceInvadersSpriteData.js` (bitmap frame arrays)
- `samples/phase-02/0221/TilemapSystemScene.js` (inline tile rows fallback)
- `samples/phase-02/0224/TileCameraSpriteSliceScene.js` (tile fallback rows)

### Primitive Skin Objects
Observed as default skin/data objects in world/scene code:
- `games/Breakout/game/BreakoutWorld.js`
- `games/Pong/game/PongScene.js`
- `games/SolarSystem/game/SolarSystemWorld.js`

### Parallax / Layout / Bezel Data
Observed in:
- `samples/phase-12/1205/MultiSystemDemoScene.js` (parallax layer layout/color)
- `games/AITargetDummy/game/AITargetDummyController.js` (waypoint layout)
- Asteroids asset-side overrides present but not fully wired as runtime SSoT:
  - `games/Asteroids/assets/images/bezel.stretch.override.json`
  - `games/Asteroids/assets/palettes/hud.json`

## Safe Extraction Decision (This PR)
Extraction criteria required all of:
1. owning schema exists
2. target JSON path obvious
3. wiring path already exists
4. no runtime rewrite beyond tiny manifest/input reference

Result:
- `candidates_meeting_all_criteria=0`
- `extracted_candidates=0`
- `unreferenced_extracted_json=0`

Primary blockers preventing safe extraction now:
- many candidates require runtime loader changes (scene/world code directly consumes inline constants)
- several targets lack an already-active manifest/input hook for the specific data type
- some game skins/palettes exist but inline constants still act as required runtime defaults (removal would change behavior)

## Existing Partial Wiring Noted
Games already using `loadGameSkin(...)` in main boot:
- `games/Bouncing-ball/main.js`
- `games/Pong/main.js`
- `games/SolarSystem/main.js`
- `games/Breakout/main.js`

This reduces future extraction risk for skin-color/sizing constants in those games.

## Palette Normalization Check
No newly extracted palettes were created in this PR.
(Existing palette normalization from prior PRs remains intact.)

## Constraints Check
- no runtime rewrite performed
- no validators added
- no `start_of_day` changes
