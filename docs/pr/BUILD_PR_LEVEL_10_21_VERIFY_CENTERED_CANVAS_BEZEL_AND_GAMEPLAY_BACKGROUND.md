# BUILD_PR_LEVEL_10_21_VERIFY_CENTERED_CANVAS_BEZEL_AND_GAMEPLAY_BACKGROUND

## Purpose
Verify the completed Asteroids fullscreen bezel and gameplay-background work as an integrated runtime result.

## Verification scope

### A. Centered canvas behavior
Verify:
- canvas internal game resolution remains unchanged
- canvas remains centered
- no viewport-stretch behavior was introduced
- fullscreen does not distort gameplay resolution

### B. Bezel behavior
Verify:
- bezel asset path resolves correctly with no duplicated game path
- bezel renders at the HTML layer
- bezel appears only in fullscreen
- bezel is visibly on screen
- bezel-fit logic uses the established transparency-window rule
- shared stretch override is honored

### C. Bezel override file behavior
Verify:
- when bezel is present and
  `games/<game>/assets/images/bezel.stretch.override.json`
  is missing,
  it is auto-created during startup/init before gameplay
- existing override file is not overwritten

### D. Background behavior
Verify:
- `backgroundImage` is separate from `fullscreenBezel`
- background renders only during gameplay
- background renders after clear and before starfield/world content
- background is visible and not hidden by later scene layers
- non-gameplay states do not render background

## Required validation evidence
Codex should validate with focused checks and summarize exact results for:
- startup/init
- fullscreen entry
- fullscreen exit
- gameplay state
- non-gameplay state
- missing override file case
- existing override file case

## Packaging requirement
Codex must package all changed files and validation outputs into:
`<project folder>/tmp/BUILD_PR_LEVEL_10_21_VERIFY_CENTERED_CANVAS_BEZEL_AND_GAMEPLAY_BACKGROUND.zip`

## Scope guard
- Verification PR
- small surgical fixes only if validation finds real defects
- no unrelated repo changes

## Validation Evidence (2026-04-14)

### Files and checks
- `node --check src/engine/runtime/fullscreenBezel.js` -> PASS
- `node --check src/engine/runtime/backgroundImage.js` -> PASS
- `node --check tests/core/BackgroundImageAndFullscreenBezel.test.mjs` -> PASS
- `node --check games/Asteroids/game/AsteroidsGameScene.js` -> PASS

### Focused runtime tests
- `BackgroundImageAndFullscreenBezel` -> PASS
  - covers no duplicated bezel path
  - covers HTML-layer bezel attach/visibility and fullscreen gating
  - covers transparency-window fit rule
  - covers shared stretch override behavior
  - covers override auto-create when missing
  - covers non-overwrite behavior for existing override file
  - covers gameplay-only background gating and render order
- `EngineFullscreen` -> PASS
- `AsteroidsPresentation` -> PASS (run with repo alias hook used by `scripts/run-node-tests.mjs`)
- `FullscreenBezelOverlay` -> PASS (run with repo alias hook used by `scripts/run-node-tests.mjs`)

### Result
- No real defects found in this verification slice.
- No additional runtime code changes required for this PR.
