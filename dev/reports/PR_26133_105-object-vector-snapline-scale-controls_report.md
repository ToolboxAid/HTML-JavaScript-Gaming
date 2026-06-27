# PR_26133_105-object-vector-snapline-scale-controls

## Summary
- Verified Object Vector Studio V2 no longer renders the selected-shape center/origin X marker.
- Verified snap-enabled drawing renders a visible snap line using the same generated SVG geometry as the preview, including rounded curve path data when point rounding is enabled.
- Verified Object Transform Scale updates the preview in realtime without persisting object scale state until Resize is used.
- Verified Object Transform and Shape Transform Scale rows include right-side `X` reset buttons that restore scale to `1.0`.
- Preserved the single object-origin model and did not reintroduce shape-origin state or controls.

## Scope Notes
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before continuing.
- Used the integrated PR_26133_104 state as the prior reference.
- Workspace manifest/schema structures were preserved.
- Scope was limited to Object Vector V2 snapline and scale-control behavior plus targeted Playwright coverage stabilization.
- Full samples smoke test skipped as requested.

## Targeted Verification
- Shape center/origin X marker is absent from the Object Preview selection chrome.
- Object-origin marker remains a `+`.
- Snap line appears while drawing when snap mode is enabled.
- Rounded polygon/polyline snap line uses curve path data when rounding is enabled.
- Object Transform scale step/input changes update rendered bounds immediately.
- Object Transform scale reset returns the preview scale to `1.0`.
- Shape Transform scale reset returns selected shape scale to `1.0`.
- Object scale remains a transient preview value unless geometry is rewritten through Resize.

## Validation Results
- PASS `node --check toolbox/object-vector-studio-v2/js/ToolStarterApp.js`
- PASS `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --grep "expands Object Vector Studio V2 asset authoring controls" --workers=1 --reporter=list`
- PASS `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --grep "Object Vector Studio V2" --workers=1 --reporter=list` (16 passed)
- PASS `npm run test:workspace-v2` (56 passed)
- PASS `git diff --check`
