# PR_26133_101 Object Vector Zoom And Layout Fixes

## Scope
- Read docs/dev/PROJECT_INSTRUCTIONS.md before changes.
- Preserved the Workspace manifest/schema contract; no schema or workspace manifest structures were changed.
- Used the integrated PR_26133_100 code state as the prior reference. The PR_100 delta ZIP was requested but was not present under tmp/ at PR_101 start.
- Limited implementation to Object Vector Studio V2 zoom, Tools/fullscreen layout, object-scale anchoring, and matching workspace-v2 coverage.

## Changes
- Raised Object Preview MAX_ZOOM from 0.5 to 1.0.
- Made the Tools accordion compact so its container ends under the Snap/Grid/Words button row instead of stretching.
- Restored fullscreen right-column vertical scrolling while keeping the column inside the viewport.
- Fixed Object Transform scale so each new scale value is applied as a relative ratio from the last object-scale preview value. This prevents child shapes such as flame/inner line strokes from drifting away from hull anchor lines during repeated object scale/zoom adjustments.
- Kept PR_100 object/shape rotation, center marker, and multi-selected shape order behavior intact.

## Playwright Impact
- Playwright impacted: Yes.
- Validates Object Vector V2 max zoom clamping/display, compact Tools layout, fullscreen right-column scroll behavior, and non-compounding object-scale origin offsets.
- Expected pass behavior: zoom clamps to 1.0, Tools content reaches accordion bottom, fullscreen right panel scrolls within the viewport, and repeated object scale changes preserve child shape origin offsets at the requested scale.
- Expected fail behavior: stale max zoom assertions, stretched Tools accordions, non-scrollable fullscreen right column, or compounded object-scale origin drift fail the workspace-v2 tests.

## Validation
- PASS: node --check tools/object-vector-studio-v2/js/ToolStarterApp.js
- PASS: node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs
- PASS: git diff --check (CRLF advisory warnings only)
- PASS: npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "shows Object Vector Studio V2 layout shell|expands Object Vector Studio V2 asset authoring controls"
- PASS: npm run test:workspace-v2 (56 passed)

## Manual Validation
1. Open Object Vector Studio V2, select an object with multiple child shapes such as the Asteroids ship, and use Object Transform scale/zoom controls repeatedly.
   - Expected: inner/flame line shapes stay anchored to the hull lines instead of drifting upward.
2. Use Object Preview zoom controls up to the maximum.
   - Expected: internal zoom reaches 1.0 and the UI remains responsive.
3. Open fullscreen mode and scroll the right column.
   - Expected: the right column remains inside the viewport and scrolls vertically.
4. Inspect Tools accordion height.
   - Expected: its bottom sits under the last row of Snap/Grid/Words buttons.

## Out Of Scope
- Full samples smoke test was skipped per PR_26133_101 instructions.
- No workspace schema cleanup, manifest restructuring, or sample JSON updates were performed.
