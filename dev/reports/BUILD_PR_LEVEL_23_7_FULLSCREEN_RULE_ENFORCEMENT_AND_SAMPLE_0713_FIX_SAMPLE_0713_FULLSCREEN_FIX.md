# BUILD_PR_LEVEL_23_7_FULLSCREEN_RULE_ENFORCEMENT_AND_SAMPLE_0713_FIX - Sample 0713 Fullscreen Fix

## Problem
Sample `0713 - Fullscreen Ability` needed deterministic fullscreen sizing behavior that fills the screen while preserving aspect ratio and cleanly restores on exit.

## Implementation
### Added
- `samples/phase-07/0713/fullscreenViewportFit.js`
  - `computeContainSize(...)`: computes contain-mode fullscreen size.
  - `attachFullscreenViewportFit(...)`: applies fullscreen viewport fit and restores baseline styles on exit.

### Updated
- `samples/phase-07/0713/main.js`
  - Wired `attachFullscreenViewportFit(...)`.
  - Apply fit after fullscreen enter.
  - Reset styles after fullscreen exit.

## Behavior
- Fullscreen uses contain sizing against viewport dimensions.
- Aspect ratio remains fixed at sample design ratio (`960x540` = `16:9`).
- Exiting fullscreen restores original canvas styles.
- Resize while fullscreen re-applies contain sizing.

## Scope guard
- No engine core fullscreen redesign.
- Fix is sample-local to 0713.
