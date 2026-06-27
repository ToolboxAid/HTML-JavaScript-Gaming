# PR 11.90 Validation

## Scope
Applied `archive/v1-v2/docs_build/pr/PR_11_90_ASTEROIDS_ENGINE_OWNERSHIP_AND_FONT_MANIFEST.md` using the uploaded Asteroids.zip findings as the baseline evidence.

## Files Changed
- `games/Asteroids/game.manifest.json`
- `games/Asteroids/game/AsteroidsGameScene.js`
- `games/Asteroids/game/AsteroidsAttractAdapter.js`
- `games/Asteroids/game/FullscreenBezelOverlay.js`
- `games/Asteroids/assets/images/bezel1.png`
- `docs_build/dev/reports/pr_11_90_validation.md`

## What Was Fixed
- Manifest SSoT updates:
  - `image.asteroids.bezel.path` set to `/games/Asteroids/assets/images/bezel1.png`
  - `image.asteroids.background.path` set to `/games/Asteroids/assets/images/deluxe.png`
  - `image.asteroids.bezel.stretchOverride.uniformEdgeStretchPx` remains `10`
  - Added `font.asteroids.vector-battle` under `asset-browser.assets.media`:
    - `/src/assets/fonts/vector_battle/vector_battle.ttf`
- Removed remaining game-level frame background ownership:
  - Removed full-canvas background draw from `AsteroidsGameScene.render()`.
- Removed game-level full-frame attract dim ownership:
  - Removed full-canvas attract overlay fill from `AsteroidsAttractAdapter.render()`.
- Deprecated game-local bezel renderer path:
  - `FullscreenBezelOverlay` now no-ops with `reason: deprecated-engine-owned` to avoid duplicate chrome ownership.

## Targeted Validation
- Syntax checks:
  - `node --check games/Asteroids/game/AsteroidsGameScene.js` PASS
  - `node --check games/Asteroids/game/AsteroidsAttractAdapter.js` PASS
  - `node --check games/Asteroids/game/FullscreenBezelOverlay.js` PASS
- Manifest verification:
  - `rg -n "image.asteroids.bezel|image.asteroids.background|font.asteroids.vector-battle|bezel1.png|deluxe.png|stretchOverride" games/Asteroids/game.manifest.json`
  - Confirmed expected entries/values.
- Forbidden guessed path search:
  - `rg -n "/games/Asteroids/assets/images/bezel\.png|/games/Asteroids/assets/images/background\.png|/games/SolarSystem/assets/images/bezel\.png|/games/SolarSystem/assets/images/background\.png" src games tools -g "*.js" -g "*.mjs" -g "*.json" -g "*.html"`
  - No matches in active source/runtime scope.
- Engine utils literal reference search:
  - `rg -n "src/engine/utils/|/src/engine/utils/" src games -g "*.js" -g "*.mjs" -g "*.json" -g "*.html"`
  - No matches.
- Runtime launch check:
  - `npm run test:launch-smoke:games` PASS (12/12, including Asteroids and SolarSystem).

## Notes
- Full sample suite was not run (targeted validation only, per PR scope).
- Manual browser state-by-state visual verification was not executed in this CLI-only run; automated launch smoke and code-path checks were used as evidence.
