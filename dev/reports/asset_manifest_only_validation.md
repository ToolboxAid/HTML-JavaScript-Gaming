# PR 11.83 Asset Manifest-Only Validation

## Scope
Lock game chrome asset loading (background/bezel) to explicit `game.manifest.json` declarations only.

## Files changed
- `src/engine/runtime/gameImageConvention.js`
- `src/engine/runtime/backgroundImage.js`
- `src/engine/runtime/fullscreenBezel.js`

## Implementation summary
- Removed convention-only chrome path derivation for:
  - `games/<Game>/assets/images/background.png`
  - `games/<Game>/assets/images/bezel.png`
- Added manifest-driven chrome resolution via `resolveManifestChromeAssetPaths(...)`.
- Background and bezel runtime layers now:
  - resolve chrome image paths from `game.manifest.json`
  - skip image request/render when manifest does not declare the optional asset
  - keep loading declared chrome assets when present (for example Asteroids bezel)

## Validation commands and evidence

### 1) Syntax/import checks for changed JS files
- `node --check src/engine/runtime/gameImageConvention.js`
- `node --check src/engine/runtime/backgroundImage.js`
- `node --check src/engine/runtime/fullscreenBezel.js`
- Result: PASS

### 2) Runtime convention-path removal scan (runtime code)
- Command:
  - `rg -n "assets/images/bezel\\.png|assets/images/background\\.png|toImagePath\\(|games/.*/assets/images/(bezel|background)\\.png" src/engine/runtime`
- Result: no matches in `src/engine/runtime`

### 3) Targeted SolarSystem/Asteroids behavior check
- Executed targeted runtime validation script (inline Node ESM) that:
  - loads `games/SolarSystem/game.manifest.json`
  - loads `games/Asteroids/game.manifest.json`
  - verifies SolarSystem makes no chrome image request when manifest has no chrome image entry
  - verifies Asteroids requests declared manifest bezel image
- Result output:
  - `VALIDATION_PASS SolarSystem no chrome image request; Asteroids manifest bezel request present.`

### 4) Browser launch smoke (games) for regression signal
- `node tests/runtime/LaunchSmokeAllEntries.test.mjs --games`
- Result: PASS (`12/12` games)
- Includes PASS for:
  - `Asteroids`
  - `SolarSystem`

## Remaining literal bezel/background path references
- Remaining matches are in tests/docs/manifest data and not convention-loader runtime code.
- Command used:
  - `rg -n "assets/images/bezel\\.png|assets/images/background\\.png" src games tools samples tests`

## Acceptance check
- SolarSystem no longer relies on guessed `background.png`/`bezel.png` runtime convention loading.
- Asteroids still loads declared chrome asset from manifest (`image.asteroids.bezel`).
- No fallback assets, aliases, shims, or guessed chrome-path loader logic added.
