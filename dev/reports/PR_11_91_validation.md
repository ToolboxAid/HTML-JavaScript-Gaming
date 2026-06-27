# PR 11.91 Validation

## Scope
Standardized Asteroids bezel naming so `bezel.png` is the only valid bezel file and manifest reference.

## Changes Made
- Updated `games/Asteroids/game.manifest.json`:
  - `image.asteroids.bezel.path` -> `/games/Asteroids/assets/images/bezel.png`
  - Preserved `image.asteroids.bezel.stretchOverride.uniformEdgeStretchPx = 10`
- Removed duplicate file:
  - deleted `games/Asteroids/assets/images/bezel1.png`

## Contract Checks
- `image.asteroids.bezel` exists and points to `bezel.png`.
- `stretchOverride.uniformEdgeStretchPx` remains under `image.asteroids.bezel` only.
- No `asset-browser.assets.bezel` duplicate stretch contract introduced.

## Reference/Path Checks
- `bezel1.png` reference search:
  - `rg -n "bezel1\\.png" games/Asteroids src games tools -g "*.json" -g "*.js" -g "*.mjs" -g "*.html"`
  - Result: no matches.
- Forbidden guessed chrome paths (runtime/source scope):
  - `rg -n "/games/.*/assets/images/bezel\\.png|/games/.*/assets/images/background\\.png" src games tools -g "*.js" -g "*.mjs" -g "*.json" -g "*.html"`
  - Result: only manifest declaration hit in `games/Asteroids/game.manifest.json`; no guessed/fallback loader logic added.

## Targeted Validation
- Command: `npm run test:launch-smoke:games`
- Result: PASS (12/12), including Asteroids and SolarSystem.

## Notes
- This PR is manifest/asset naming normalization only; full samples suite was not run.
