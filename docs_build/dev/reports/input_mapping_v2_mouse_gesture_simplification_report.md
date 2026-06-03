# Input Mapping V2 Mouse Gesture Simplification Report

## Scope
- PR: PR_26140_100-simplify-input-mapping-v2-mouse-gestures
- Source of truth: user PR_100 request. `docs_build/pr/BUILD_PR.md` still points at an unrelated Level 18 overlay runtime hardening rebase, so this workflow used the explicit PR_100 request after reading `docs_build/dev/PROJECT_INSTRUCTIONS.md`.

## Changes Applied
- Removed the visible `Drag Rectangle` mouse gesture from Input Mapping V2 gesture descriptors.
- Preserved `Drag Release` as the visible drag completion gesture.
- Preserved internal `PointerDragState` rectangle/bounds tracking and attached the current pointer drag snapshot to Drag Release runtime captures.
- Added bounds detail to Drag Release captured token title text without changing the persisted Input Mapping V2 schema payload.
- Stopped gesture button pointer events from bubbling into the tool-level engine input listener so clicking `Drag Release` does not overwrite the drag bounds it is capturing.
- Preserved wheel gesture options for `Wheel Up`, `Wheel Down`, `Wheel Left`, and `Wheel Right`.
- Confirmed raw `Mouse Move X/Y` is not exposed as a selectable mapping option.
- Tightened Gesture/Capture spacing and reduced Capture button heights.

## Contracts And Constraints
- No schema changes.
- No sample JSON changes.
- No full samples smoke test; skipped per request because this is scoped to Input Mapping V2 and engine input descriptors.
- Drag bounds are runtime/tool-local metadata (`input.pointerDrag`) and hover/title detail only; they are intentionally not persisted in the strict schema payload.

## Validation
- `node --check src/engine/input/InputCapabilityDescriptors.js`: PASS
- `node --check src/engine/input/PointerDragState.js`: PASS
- `node --check toolbox/input-mapping-v2/js/services/EngineInputSourceService.js`: PASS
- `node --check toolbox/input-mapping-v2/js/controls/GestureListControl.js`: PASS
- `node --check tests/input/InputService.test.mjs`: PASS
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`: PASS
- `node -e "const test = await import('./tests/input/InputService.test.mjs'); test.run();"`: PASS
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "Input Mapping V2"`: PASS, 2 tests after compact-height alignment fix
- `npm run test:workspace-v2`: PASS, 61 tests
- `git diff --check`: PASS, line-ending warnings only
- HTML inline script/style/handler scan: PASS, no matches
- Sample/JSON diff scan: PASS, no changed sample or JSON files
- Playwright V8 coverage report: PASS, changed runtime JS listed in `docs_build/dev/reports/playwright_v8_coverage_report.txt` and `coverage_changed_js_guardrail.txt`
- Full samples smoke test: not run, per request
- Delta ZIP verification: PASS, 13 files, nonzero size

## Playwright Coverage
- Confirms `Drag Rectangle` is not visible.
- Confirms `Drag Release` remains visible and maps to `MousePrimaryDragRelease`.
- Confirms Drag Release token title includes drag bounds from `PointerDragState`.
- Confirms `Mouse Wheel Up`, `Mouse Wheel Down`, `Mouse Wheel Left`, and `Mouse Wheel Right` remain visible/capturable.
- Confirms raw `Mouse Move X/Y` is not visible as a mapping option.
- Confirms compact Gesture/Capture spacing and reduced capture button heights.

## Manual Validation
1. Open `toolbox/input-mapping-v2/index.html`.
2. In Gestures, confirm Mouse shows Drag Release but not Drag Rectangle.
3. Confirm Wheel Up, Wheel Down, Wheel Left, and Wheel Right are still shown.
4. Confirm no raw Mouse Move X/Y option appears.
5. Drag in the page, then click Drag Release and hover the captured token; bounds should be shown in the title text.
6. Confirm Capture buttons are shorter and the spacing from Gestures/Capture into Captured Mappings is tighter.
