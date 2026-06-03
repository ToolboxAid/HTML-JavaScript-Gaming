
# BUILD_PR_LEVEL_10_22_TEMPLATE_BEZEL_BACKGROUND_CONVENTION_FOUNDATION

## Purpose
Standardize bezel + background behavior across all games and align `games/_template` with Asteroids conventions.

## Scope

### A. Template alignment
- Ensure `games/_template` includes:
  - assets/images/background.png (optional)
  - assets/images/bezel.png (optional)
  - assets/images/bezel.stretch.override.json (auto-created behavior defined)

### B. Background convention
- `backgroundImage`
  - canvas-rendered
  - draws after clear
  - draws before all world/gameplay layers
  - gameplay-only (not attract/menu/etc)

### C. Bezel convention
- `fullscreenBezel`
  - HTML overlay
  - fullscreen-only
  - uses transparency window fit
  - uses shared stretch override

### D. Override behavior
- file: `assets/images/bezel.stretch.override.json`
- auto-created at startup if bezel exists and file missing
- never overwritten

### E. Cross-game rule
- behavior must be consistent across all games
- no Asteroids-specific logic in shared pipeline

## Validation
- template contains correct structure
- new games inherit behavior automatically
- existing games not broken

## Packaging
`<project folder>/tmp/BUILD_PR_LEVEL_10_22_TEMPLATE_BEZEL_BACKGROUND_CONVENTION_FOUNDATION.zip`

## Implementation Delta
- Added shared resolver `resolveBezelStretchOverridePath` in `src/engine/runtime/gameImageConvention.js` so bezel override-path derivation remains centralized and game-agnostic.
- Updated `src/engine/runtime/fullscreenBezel.js` to use that shared resolver (no Asteroids-specific path assumptions).
- Aligned `_template` asset conventions by adding `games/_template/assets/tools.manifest.json` as the template asset-manifest foundation.
- Strengthened template contract validation in `scripts/validate-games-template-contract.mjs` to require `assets/tools.manifest.json`.
- Extended focused runtime tests in `tests/core/BackgroundImageAndFullscreenBezel.test.mjs` to validate:
  - Asteroids + `_template` game-agnostic image/bezel convention paths
  - startup/detection-based auto-create for `bezel.stretch.override.json` when missing
  - non-overwrite behavior when the override file already exists

## Validation Evidence (2026-04-14)
- `node --check src/engine/runtime/gameImageConvention.js` PASS
- `node --check src/engine/runtime/fullscreenBezel.js` PASS
- `node --check tests/core/BackgroundImageAndFullscreenBezel.test.mjs` PASS
- `node --check scripts/validate-games-template-contract.mjs` PASS
- `BackgroundImageAndFullscreenBezel` focused test PASS
- `GamesTemplateContractEnforcement` focused test PASS
- `AsteroidsPresentation` focused regression test PASS
