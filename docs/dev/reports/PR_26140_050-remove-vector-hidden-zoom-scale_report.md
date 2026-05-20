# PR_26140_050-remove-vector-hidden-zoom-scale

## Summary
- Removed Object Vector Studio V2 hidden VIEWPORT_ZOOM_VIEWBOX_SCALE/viewBoxZoom multiplier.
- Made viewport.zoom 1.0 map directly to 100% by moving the current visual scale into DEFAULT_VIEWPORT dimensions: 3200x2200.
- Preserved the PR_26140_049 initial visual geometry size, pan behavior, reset viewBox, wheel zoom, pointer mapping, and hit-test interactions.
- Left Collision Inspector V2 percent zoom behavior unchanged.

## Validation
- PASS: node --check tools/object-vector-studio-v2/js/ToolStarterApp.js.
- PASS: node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs.
- PASS: node --check tests/playwright/tools/CollisionInspectorV2.spec.mjs.
- PASS: targeted ES module import validation for Object Vector Studio V2 and Collision Inspector V2 modules.
- PASS: targeted static zoom validation confirmed no VIEWPORT_ZOOM_VIEWBOX_SCALE/viewBoxZoom remains, Object Vector Studio V2 default zoom is 100%, range remains 10% to 1000%, and Collision Inspector V2 remains percent-based.
- PASS: npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list, 4 passed.
- PASS: npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "shows Object Vector Studio V2 layout shell|creates Object Vector Studio V2 shapes with canvas drawing|edits Object Vector Studio V2 preview shapes|aligns Object Vector Studio V2 selection bounds|expands Object Vector Studio V2 asset authoring controls|drags selected Object Vector Studio V2 shapes|tracks Object Vector Studio V2 dirty state", 7 passed after serial rerun.
- PASS: npm run test:workspace-v2, 58 passed.
- PASS: git diff --check.
- PASS: V8 coverage guardrail lists tools/object-vector-studio-v2/js/ToolStarterApp.js at 94% function coverage and no changed-runtime warnings.
- PASS: no games, samples, or start_of_day files changed.
- SKIPPED: full samples smoke test, per request.

## Notes
- A first focused OVS subset run was invalidated by a Playwright artifact-file race after running two Playwright commands concurrently; the same focused subset passed when rerun serially.
- No sample JSON files were touched.
