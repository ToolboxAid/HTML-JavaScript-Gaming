# PR 11.85 Validation

## Scope
- Enforced manifest-only chrome asset sourcing.
- Added `stretchOverride.uniformEdgeStretchPx = 10` to every `image.*.bezel` manifest entry.
- Preserved Asteroids chrome paths:
  - `/games/Asteroids/assets/images/bezel1.png`
  - `/games/Asteroids/assets/images/deluxe.png`

## Files changed
- `games/Asteroids/game.manifest.json`
- `tools/shared/asteroidsPlatformDemo.js`

## Targeted checks run

### 1) Syntax/import checks
- `node --check src/engine/runtime/gameImageConvention.js` -> PASS
- `node --check tools/shared/asteroidsPlatformDemo.js` -> PASS
- `node -e "JSON.parse(require('fs').readFileSync('games/Asteroids/game.manifest.json','utf8')); console.log('ASTEROIDS_MANIFEST_JSON_OK')"` -> PASS

### 2) Manifest bezel stretch enforcement
- Audit command (Node) over all `games/*/game.manifest.json` media entries matching `image.*.bezel`.
- Result:
  - Found bezel entries: `1`
  - `games/Asteroids/game.manifest.json` `image.asteroids.bezel` has `stretchOverride.uniformEdgeStretchPx = 10`.

### 3) Remove/deprecate guessed/hardcoded bezel/background loaders
- Scan command:
  - `rg -n "assets/images/bezel\\.png|assets/images/background\\.png|toImagePath\\(|games/\\$\\{.*\\}/assets/images/(bezel|background)\\.png" src games tools -g "*.js"`
- Result: no matches in runtime/source JS loaders.

### 4) Affected launch/chrome path validation
- Targeted runtime validation script (Node ESM) verified:
  - SolarSystem manifest resolves no chrome image paths and does not request guessed `background.png`/`bezel.png`.
  - Asteroids manifest resolves bezel/background from declared manifest assets.
  - Asteroids bezel request uses `/games/Asteroids/assets/images/bezel1.png`.
- Output: `PR_11_85_TARGETED_CHROME_VALIDATION_PASS`

### 5) Targeted launch regression check
- `node tests/runtime/LaunchSmokeAllEntries.test.mjs --games` -> PASS (`12/12`)
- Includes PASS for affected games:
  - `Asteroids`
  - `SolarSystem`

## Explicit full-suite note
- Full sample suite was skipped for this PR.
- Reason: this is targeted manifest/chrome-loading work; targeted runtime checks and games launch smoke cover the affected surface.

## Outcome
- Manifest is the chrome source of truth for affected runtime pathing.
- No guessed/hardcoded bezel/background URL construction remains in runtime/source JS loader paths.
- Asteroids manifest chrome paths preserved as required.
