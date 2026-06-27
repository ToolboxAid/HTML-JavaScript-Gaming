# PR_26140_049-normalize-vector-tool-zoom-percent

## Summary
- Normalized Object Vector Studio V2 zoom semantics to 100% default with a 10% to 1000% range.
- Preserved existing Object Vector Studio viewport/viewBox behavior with an internal viewBox scale while keeping the stored zoom default at 1.0.
- Updated Collision Inspector V2 zoom controls, display, clamping, and live summary output to use percent semantics.
- Updated targeted browser assertions and logical-point helpers so tool interactions validate the normalized zoom contract.

## Validation
- PASS: node --check for changed tool/test JavaScript files.
- PASS: targeted ES module import validation for changed tool modules.
- PASS: targeted static zoom validation for Object Vector Studio V2 and Collision Inspector V2.
- PASS: npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list.
- PASS: npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "shows Object Vector Studio V2 layout shell".
- PASS: npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "creates Object Vector Studio V2 shapes with canvas drawing|edits Object Vector Studio V2 preview shapes|aligns Object Vector Studio V2 selection bounds|expands Object Vector Studio V2 asset authoring controls|drags selected Object Vector Studio V2 shapes|tracks Object Vector Studio V2 dirty state".
- PASS: npm run test:workspace-v2, 58 passed.
- SKIPPED: full samples smoke test, per request.

## Notes
- An initial workspace run failed after raw 1.0 zoom changed the physical editor viewBox. The final implementation keeps 100% semantic zoom while preserving previous viewport scale, then the full workspace suite passed.
- No sample JSON files are included in the final delta.
