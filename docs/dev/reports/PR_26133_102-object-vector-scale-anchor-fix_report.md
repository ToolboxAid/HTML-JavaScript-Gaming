# PR_26133_102 Object Vector Scale Anchor Fix

## Scope
- Read `docs/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Used the currently integrated PR_26133_101 state as the prior reference. The prior delta ZIP `tmp/PR_26133_101-object-vector-zoom-and-layout-fixes_delta.zip` was not present locally.
- Limited changes to the Object Vector Studio V2 scale-anchor correction and focused Playwright coverage.

## Implementation
- Removed the prior zoom-anchoring/preview-state workaround from `ToolStarterApp.js`:
  - `objectScalePreviewValues`
  - `currentObjectScalePreviewValue`
  - `transformWithRelativeScaleAroundPivot`
- Replaced it with object scale math based on current per-shape transforms:
  - Object Scale input derives from the selected object shape transforms.
  - Applying Object Scale computes each shape's current scale ratio against the requested scale.
  - Each shape origin is moved around the object pivot by that ratio, then `scaleX`/`scaleY` are set to the requested uniform scale.
- Kept PR_26133_101 zoom/layout behavior intact, including `MAX_ZOOM = 1.0`.

## Targeted Validation
- PASS: `node --check tools\object-vector-studio-v2\js\ToolStarterApp.js`
- PASS: `node --check tests\playwright\tools\WorkspaceManagerV2.spec.mjs`
- PASS: targeted Object Vector V2 Playwright validation:
  - `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "shows Object Vector Studio V2 layout shell|expands Object Vector Studio V2 asset authoring controls"`
  - Result: 2 passed.
- PASS: `npm run test:workspace-v2`
  - Result: 56 passed.
- PASS: `git diff --check -- tools/object-vector-studio-v2/js/ToolStarterApp.js tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
  - Only CRLF warning for the existing Playwright test file.

## Scale / Zoom Notes
- The object preview zoom contract from PR_26133_101 was not reworked.
- The anchoring fix is now in Object Scale behavior: repeated object scale changes derive from each shape's actual current transform instead of a separate preview tracking map.
- The focused Playwright assertions verify the prior preview-state helper is gone and that object scale offsets follow the requested scale rather than compounding from stale preview state.

## Manual Verification Guidance
- Open Object Vector Studio V2 with the Asteroids ship object selected.
- Use Object Transform scale repeatedly, for example `1.10` then `1.09`.
- Verify flame/inner line shapes remain anchored to the bottom hull lines instead of drifting upward.
- Verify preview zoom still reaches the PR_26133_101 max zoom behavior and Tools/fullscreen layout remains usable.

## Diff Stat
```
tests/playwright/tools/WorkspaceManagerV2.spec.mjs |  3 +
 tools/object-vector-studio-v2/js/ToolStarterApp.js | 79 ++++++++--------------
 2 files changed, 31 insertions(+), 51 deletions(-)
```

## Full Samples Smoke Test
Skipped per PR_26133_102 instructions.
