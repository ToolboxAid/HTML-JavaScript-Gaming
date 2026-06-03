# PR 11.89 - Asteroids Engine Render Ownership Stabilization

## Scope and Source of Truth
- BUILD doc: `docs_build/pr/BUILD_PR_LEVEL_11_89_ASTEROIDS_ENGINE_RENDER_OWNERSHIP_STABILIZATION.md`
- PLAN doc: `docs_build/pr/PLAN_PR_LEVEL_11_89_ASTEROIDS_ENGINE_RENDER_OWNERSHIP_STABILIZATION.md`

## Files Inspected
- `games/Asteroids/index.js`
- `games/Asteroids/game.manifest.json`
- `games/Asteroids/game/AsteroidsGameScene.js`
- `games/Asteroids/game/AsteroidsAttractAdapter.js`
- `games/Asteroids/game/FullscreenBezelOverlay.js`
- `src/engine/runtime/backgroundImage.js`
- `src/engine/runtime/gameImageConvention.js`
- `src/engine/runtime/fullscreenBezel.js`
- `scripts/run-node-tests.mjs`

## Baseline Search Findings (Before Fix)

### Command
`Select-String -Path .\games\Asteroids\**\*.js -Pattern "clearRect|fillRect|drawRect|background|bezel|chrome|overlay|rgba|globalAlpha" -CaseSensitive:$false`

### Result (high-signal)
- `games/Asteroids/game/AsteroidsGameScene.js`: full-canvas draws are translucent when manifest background present (`rgba(...,0.22)`), opaque fallback only when manifest background unavailable.
- `games/Asteroids/game/AsteroidsAttractAdapter.js`: attract overlay uses translucent fill when manifest background present (`rgba(...,0.36)`), stronger dim only when background unavailable.
- `games/Asteroids/game/FullscreenBezelOverlay.js`: resolves bezel by asset id (`image.asteroids.bezel`), not guessed image path.

### Command
`Select-String -Path .\games\Asteroids\**\*.* -Pattern "bezel.png|background.png|bezel1.png|deluxe.png|image.asteroids.bezel|image.asteroids.background" -CaseSensitive:$false`

### Result (high-signal)
- Found `image.asteroids.bezel` id usage in `FullscreenBezelOverlay.js`.
- Manifest initially still referenced `/games/Asteroids/assets/images/bezel.png` (required correction to `bezel1.png`).

### Command
`Select-String -Path .\src\**\*.js, .\games\**\*.js -Pattern "/games/.*/assets/images/bezel.png|/games/.*/assets/images/background.png" -CaseSensitive:$false`

### Result
- No matches in active source JS.

### Command
`Select-String -Path .\games\Asteroids\game.manifest.json -Pattern "asset-browser|stretchOverride|image.asteroids.bezel|image.asteroids.background|bezel1.png|deluxe.png" -CaseSensitive:$false`

### Result (baseline)
- `image.asteroids.bezel` present with `stretchOverride.uniformEdgeStretchPx = 10`.
- `image.asteroids.background` present and points to `deluxe.png`.
- Bezel path required correction from `bezel.png` to `bezel1.png`.

## Changes Made
1. Updated manifest bezel path:
- `games/Asteroids/game.manifest.json`
  - `image.asteroids.bezel.path`
  - from: `/games/Asteroids/assets/images/bezel.png`
  - to: `/games/Asteroids/assets/images/bezel1.png`

2. Renamed asset file to match manifest declaration:
- from: `games/Asteroids/assets/images/bezel.png`
- to: `games/Asteroids/assets/images/bezel1.png`

## Manifest Correction Verification (After Fix)
- `image.asteroids.bezel.path = /games/Asteroids/assets/images/bezel1.png`
- `image.asteroids.bezel.stretchOverride.uniformEdgeStretchPx = 10`
- `image.asteroids.background.path = /games/Asteroids/assets/images/deluxe.png`
- No duplicate `asset-browser.assets.bezel.stretchOverride` block introduced.

## Remaining Full-Screen Fills and Why Safe
- `AsteroidsGameScene` base full-canvas fill is translucent (`rgba(2, 6, 23, 0.22)`) when manifest background exists.
- `AsteroidsAttractAdapter` full-canvas dim is translucent (`rgba(2, 6, 23, 0.36)`) when manifest background exists.
- `PAUSE_OVERLAY_COLOR` and initials entry overlays are translucent and intentionally preserve background visibility/readability.
- Opaque fallback clears remain only for no-background conditions and are not persistent suppression of a declared manifest background.

## Before/After Guessed-Path Search

### Before
- JS source guessed path search (`/games/.*/assets/images/bezel.png|background.png`): 0 matches.
- Manifest bezel path was still `bezel.png` (not guessed runtime behavior, but mismatched required asset name).

### After
- JS source guessed path search: 0 matches.
- Manifest now uses required `bezel1.png` path and existing `deluxe.png` background path.

## Before/After `src/engine/utils/` Search

### Command
`Select-String -Path .\src\**\*.js, .\games\**\*.js -Pattern "src/engine/utils/|/src/engine/utils/" -CaseSensitive:$false`

### Result
- Before: 0 matches
- After: 0 matches

## Validation Commands Run
1. Required command from BUILD:
- `npm test -- --runInBand`
- Result: **failed during pretest guard** (`checkSharedExtractionGuard`) with existing repository-wide baseline violations unrelated to this PR's manifest/render ownership scope.

2. Supported targeted runtime validation (used per BUILD fallback guidance):
- `npm run test:launch-smoke:games`
- Result: **PASS (12/12)**, including `Asteroids` and `SolarSystem`.

## Manual/Browser Checklist Documentation
- Workspace Manager launch + multi-state visual verification was not executed interactively in this CLI session.
- Evidence used:
  - Source-level ownership verification in Asteroids render paths.
  - Manifest path correction verification.
  - Automated game launch smoke pass across all games with no launch failures.
- Console 404 proxy check from smoke run:
  - No failing entries reported for Asteroids/SolarSystem.

## Full Samples Suite
- Skipped intentionally.
- Reason: BUILD directs targeted validation only; this PR is scoped to Asteroids manifest/chrome/render ownership stabilization and does not modify broad sample framework behavior.
