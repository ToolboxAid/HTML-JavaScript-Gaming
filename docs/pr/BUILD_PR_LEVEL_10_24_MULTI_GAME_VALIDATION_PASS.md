
# BUILD_PR_LEVEL_10_24_MULTI_GAME_VALIDATION_PASS

## Purpose
Validate bezel/background system across multiple games and template.

## Scope
- Asteroids (reference)
- games/_template
- at least one additional sample game

## Validation Areas

### A. Bezel
- loads correctly
- no path duplication
- fullscreen only
- visible on screen
- transparency fit works
- stretch override works

### B. Background
- gameplay only
- after clear
- before world/starfield
- visible

### C. Override File
- auto-created when missing
- not overwritten

### D. Template
- new game inherits behavior automatically

## Fix Rule
- only minimal surgical fixes allowed

## Packaging
<project folder>/tmp/BUILD_PR_LEVEL_10_24_MULTI_GAME_VALIDATION_PASS.zip

## Implementation Delta
- Extended focused multi-game validation in `tests/core/BackgroundImageAndFullscreenBezel.test.mjs` with `SpaceInvaders` coverage to satisfy the third target without scope expansion.
- Added checks for additional-game behavior:
  - background no-op in gameplay when `background.png` is missing
  - bezel no-op in fullscreen when `bezel.png` is missing
  - no duplicated bezel path resolution
  - startup/detection-based override creation for `games/SpaceInvaders/assets/images/bezel.stretch.override.json`
- No runtime/engine behavior changes were required because validation passed after adding cross-game coverage.

## Validation Evidence (2026-04-14)
- `node --check tests/core/BackgroundImageAndFullscreenBezel.test.mjs` PASS
- `node --check tests/games/AsteroidsPresentation.test.mjs` PASS
- `node --check tests/games/SpaceInvadersScene.test.mjs` PASS
- `node --check tests/tools/GamesTemplateContractEnforcement.test.mjs` PASS
- `BackgroundImageAndFullscreenBezel` focused validation PASS
  - Asteroids bezel/background behavior
  - `_template` override auto-create + non-overwrite
  - SpaceInvaders sample-game bezel/background + override creation path
- `AsteroidsPresentation` regression PASS
- `SpaceInvadersScene` regression PASS
- `GamesTemplateContractEnforcement` PASS
