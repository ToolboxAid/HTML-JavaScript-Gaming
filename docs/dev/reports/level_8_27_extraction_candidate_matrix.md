# Level 8.27 Extraction Candidate Matrix

| Source File | Hardcoded Data | Type | Proposed Tool Owner | Proposed JSON Path | Safe To Extract Now |
|---|---|---|---|---|---|
| `games/SpaceInvaders/game/SpaceInvadersScene.js` | dozens of HUD/render colors (`#66ff66`, `#ffffff`, overlay rgba) | HUD colors / palette groups | Palette Browser + `tools/schemas/palette.schema.json` | `games/SpaceInvaders/assets/palettes/space-invaders-hud.palette.json` | No |
| `games/SpaceInvaders/game/SpaceInvadersSpriteData.js` | bitmap frame arrays (`SQUID_LIVING_FRAMES`, `PLAYER_DYING_FRAMES`, etc.) | sprite frame arrays | Sprite Editor + `tools/schemas/tools/sprite-editor.schema.json` | `games/SpaceInvaders/assets/sprites/space-invaders.sprite-sheet.json` | No |
| `games/SpaceDuel/game/SpaceDuelScene.js` | `SHIP_SEGMENTS`, `ENEMY_*_SEGMENTS`, `HAZARD_SEGMENTS`, `SHOT_SEGMENTS` | vector primitives / shape arrays | Vector Asset Studio + `tools/schemas/tools/vector-asset-studio.schema.json` | `games/SpaceDuel/assets/vectors/space-duel-shapes.vector.json` | No |
| `games/SpaceDuel/game/SpaceDuelScene.js` | `COLORS` object (`background`, `player1`, `enemy`, etc.) | HUD/skin colors | Palette Browser + `tools/schemas/palette.schema.json` | `games/SpaceDuel/assets/palettes/space-duel-hud.palette.json` | No |
| `games/Asteroids/game/AsteroidsGameScene.js` | `LIFE_ICON_POINTS`, pause/initials overlay colors | HUD layout + HUD colors | overlay/bezel manifest ref + palette schema | `games/Asteroids/assets/images/bezel.stretch.override.json` and `games/Asteroids/assets/palettes/hud.json` | No |
| `games/AITargetDummy/game/AITargetDummyController.js` | normalized waypoint list (`this.waypoints`) | layout/path points | Vector Map Editor + `tools/schemas/tools/vector-map-editor.schema.json` | `games/AITargetDummy/assets/layout/ai-waypoints.map.json` | No |
| `games/GravityWell/game/GravityWellWorld.js` | `SHIP_SHAPE`, `BEACON_SHAPE` arrays | vector primitives | Vector Asset Studio + `tools/schemas/tools/vector-asset-studio.schema.json` | `games/GravityWell/assets/vectors/gravitywell-shapes.vector.json` | No |
| `games/GravityWell/game/GravityWellWorld.js` | `DEFAULT_PLANETS`, `DEFAULT_BEACONS` with color/radius/strength | primitive skin + palette-like data | Primitive Skin Editor + palette schema | `games/GravityWell/assets/skins/skin.main.json` + `games/GravityWell/assets/palettes/gravitywell-classic.palette.json` | No |
| `games/SolarSystem/game/SolarSystemWorld.js` | `BODY_DEFINITIONS`, `MOON_DEFINITIONS`, default sun/ring skin values | primitive skin object + layout constants | Primitive Skin Editor + `tools/schemas/tools/skin-editor.schema.json` | `games/SolarSystem/assets/skins/skin.main.json` (already present; partial parity) | No |
| `games/SolarSystem/game/SolarSystemScene.js` | `DEFAULT_COLORS` object | HUD colors | Primitive Skin Editor / palette schema | `games/SolarSystem/assets/skins/skin.main.json` (already present; fallback still hardcoded) | No |
| `games/Pong/game/PongScene.js` | `DEFAULT_COLORS`, `DEFAULT_SIZING` | primitive skin object | Primitive Skin Editor + `tools/schemas/tools/skin-editor.schema.json` | `games/pong/assets/skins/skin.main.json` (already present; fallback still hardcoded) | No |
| `games/Pong/game/PongWorld.js` | `PONG_MODE_LIST` (`accent`, `arenaColor`, mode shape/sizing) | gameplay mode config + color data | skin/palette for color subset; no clear existing mode schema | `games/pong/assets/modes/pong.modes.json` (new) | No |
| `games/Breakout/game/BreakoutWorld.js` | `DEFAULT_BRICK_COLORS`, `DEFAULT_BREAKOUT_SKIN` | primitive skin + brick palette | Primitive Skin Editor + palette schema | `games/breakout/assets/skins/skin.main.json` (already present; fallback still hardcoded) | No |
| `samples/phase-02/0221/TilemapSystemScene.js` | inline fallback `tiles` rows + `palette` map | tile arrays + tile palette | Tilemap Studio + `tools/schemas/tools/tile-map-editor.schema.json` | `samples/phase-02/0221/sample-0221-tile-map-editor.json` / `sample.0221.tile-map-editor.json` (already consumed path exists) | No |
| `samples/phase-02/0224/TileCameraSpriteSliceScene.js` | `FALLBACK_TILEMAP_ROWS`, fallback atlas frame colors | tile + sprite fallback data | Tilemap Studio + Sprite Editor schemas | `samples/phase-02/0224/sample-0224-tile-map-editor.json` and `sample-0224-sprite-editor.json` (already consumed path exists) | No |
| `samples/phase-03/0301/demoSpriteFactory.js` | hardcoded frame palettes (`body`, `accent`, `visor`, `boots`) | sprite color presets | Sprite Editor + palette schema | `samples/phase-03/0301/sample.0301.palette.json` + sprite payload | No |
| `samples/phase-12/1205/MultiSystemDemoScene.js` | tile palette object + parallax layer color/layout data | tile/parallax layout + colors | Tilemap Studio + Parallax Scene Studio schemas | `samples/phase-12/1205/sample.1205.tile-map-editor.json` and `sample.1205.parallax-editor.json` | No |

## Safe/Defer Rationale
All listed candidates were deferred in this PR because at least one required extraction criterion failed (most commonly missing active wiring path or requiring scene/runtime code rewrite beyond tiny manifest/input ref).

Summary:
- `safe_to_extract_now_yes=0`
- `safe_to_extract_now_no=17`
- `extracted_in_this_pr=0`
- `unreferenced_extracted_json=0`
