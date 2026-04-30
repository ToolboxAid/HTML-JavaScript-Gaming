# PR 11.87 Validation - Manifest Background Always Visible

## Scope
Implemented the smallest scoped runtime/render change so manifest-declared `image.*.background` remains visible across Asteroids render states without fallback asset paths.

## Files Changed
- `src/engine/runtime/backgroundImage.js`
- `games/Asteroids/game/AsteroidsGameScene.js`
- `games/Asteroids/game/AsteroidsAttractAdapter.js`
- `docs/dev/reports/PR_11_87_validation.md`

## Implementation Evidence

### 1) Background gate removed (all render states)
- `src/engine/runtime/backgroundImage.js`
- `render(...)` no longer returns early for non-gameplay states.
- Result: when manifest background exists and image is loaded, background draw path is allowed for menu/title/attract/gameplay/pause.

### 2) Opaque fills no longer hide background when manifest background is present
- `games/Asteroids/game/AsteroidsGameScene.js`
  - Added `hasManifestBackgroundLayer(engine)` helper using `engine.backgroundImageLayer.getState()`.
  - Scene base fill changes from opaque `#020617` to translucent `rgba(2, 6, 23, 0.22)` when manifest background path is present.
- `games/Asteroids/game/AsteroidsAttractAdapter.js`
  - `render(renderer, options)` now accepts `manifestBackgroundPresent`.
  - Attract fullscreen panel changes from opaque-ish `rgba(2, 6, 23, 0.86)` to translucent `rgba(2, 6, 23, 0.36)` when background is present.
- Foreground text/entities/UI draws are preserved.

### 3) Manifest-only chrome/background rule preserved
- No fallback URL construction added.
- No new guessed `background.png`/`bezel.png` convention paths added.
- No duplicated background SSoT under `asset-browser.assets.background` was introduced.

## Validation Commands and Results

### Syntax checks
- `node --check src/engine/runtime/backgroundImage.js` -> PASS
- `node --check games/Asteroids/game/AsteroidsGameScene.js` -> PASS
- `node --check games/Asteroids/game/AsteroidsAttractAdapter.js` -> PASS

### Fallback/guessed-path search
- `rg -n "assets/images/background\.png|assets/images/bezel\.png|/games/\$\{.*\}/assets/images/(background|bezel)\.png" src games tools -g "*.js"`
- Result: no matches for guessed path construction added in JS runtime code.

### Targeted launch smoke (games only)
- `node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --games`
- Result: PASS (12/12), including `Asteroids` and `SolarSystem`.
- Console summary reported no failed entries.

## Requested Behavior Coverage
- Asteroids menu/attract/gameplay/pause now permits manifest background draw via background layer (no gameplay-only gate).
- Asteroids attract/fullscreen dark fill is no longer opaque when a manifest background is present.
- Manifest-only chrome asset loading remains in effect.
- No full sample suite run (targeted validation only).
