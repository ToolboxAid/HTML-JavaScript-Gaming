# BUILD_PR_LEVEL_10_25_POLISH_AND_EDGE_CASES

## Purpose
Polish the shared bezel/background system and close the remaining Level 10 edge cases before moving beyond this lane.

## Scope

### A. Bezel edge cases
- missing bezel file
- malformed/empty bezel image
- no usable transparency window
- fullscreen enter/exit repeatedly
- window resize while fullscreen
- existing override values that are too small/too large
- override file exists but is malformed

### B. Background edge cases
- missing background file
- background present in non-gameplay states
- gameplay state transitions
- starfield/world ordering regressions
- games with no starfield

### C. Shared-pipeline polish
- no Asteroids-specific coupling in shared code
- conventions work cleanly for template and multiple games
- override behavior remains discoverable for developers

## Fix rule
- only the smallest surgical fixes needed from validation results
- no scope expansion
- no redesign

## Validation outputs
Codex should summarize:
- edge cases tested
- defects found
- fixes applied
- unresolved items, if any

## Packaging
<project folder>/tmp/BUILD_PR_LEVEL_10_25_POLISH_AND_EDGE_CASES.zip

## Implementation Delta
- Added one surgical runtime guard in `src/engine/runtime/fullscreenBezel.js`:
  - treat malformed/empty loaded bezel images (`naturalWidth/height` and fallback `width/height` invalid) as unavailable
  - keep fullscreen bezel hidden and preserve fallback centered-canvas layout for this case
- Expanded focused edge-case validation in `tests/core/BackgroundImageAndFullscreenBezel.test.mjs` for:
  - malformed bezel image handling
  - fullscreen enter/exit cycle stability
  - fullscreen resize relayout behavior
  - malformed and extreme override values
  - malformed override file fallback behavior
  - gameplay -> non-gameplay background transition gating

## Edge Cases Tested
- Bezel missing file: PASS
- Bezel malformed/empty image: PASS
- No valid transparency window: PASS (fallback layout)
- Fullscreen enter/exit cycles: PASS
- Fullscreen resize while active: PASS
- Override malformed/extreme values: PASS (sanitized/clamped by layout bounds)
- Malformed override file content: PASS (default config returned, file not overwritten)
- Background missing: PASS
- Gameplay/non-gameplay transitions: PASS
- Starfield/world ordering regression guard (Asteroids): PASS

## Defects Found
- One real defect identified: malformed/empty bezel images were previously treated as ready/visible.

## Fixes Applied
- `fullscreenBezel` now marks malformed/empty images as unavailable on `onload`, keeps bezel hidden, and falls back to standard centered canvas layout.

## Unresolved Items
- None in this scoped validation pass.

## Validation Evidence (2026-04-14)
- `node --check src/engine/runtime/fullscreenBezel.js` PASS
- `node --check tests/core/BackgroundImageAndFullscreenBezel.test.mjs` PASS
- `BackgroundImageAndFullscreenBezel` focused validation PASS
- `AsteroidsPresentation` regression PASS
- `SpaceInvadersScene` regression PASS
- `GamesTemplateContractEnforcement` PASS
