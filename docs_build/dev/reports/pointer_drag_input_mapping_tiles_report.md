# PR_26140_095 Pointer Drag Input Mapping Tiles Report

## Scope
- Added reusable engine pointer drag support in `src/engine/input/PointerDragState.js` and bridged it through `InputService`.
- Input Mapping V2 now surfaces engine pointer drag descriptors as mappable mouse-compatible bindings without changing the Input Mapping V2 schema.
- Gamepad mapping tiles now display `Game Controller` plus the input detail on separate lines, with standard button names when `gamepad.mapping === "standard"` and `Button <number>` fallback otherwise.
- Capture UI now includes pointer drag gesture buttons, an `<hr>` separator before bottom `Refresh Gamepads`, and second-click cancel for active keyboard, mouse, and gamepad capture.
- Mapping tiles increased from 225x175 to 275x225 while preserving selected tile indication, combo display, delete behavior, fullscreen layout, and auto gamepad polling.

## Notes
- `docs_build/pr/BUILD_PR.md` currently describes an unrelated Level 18 runtime hardening rebase. The inline PR_26140_095 request was used as the source of truth.
- No schemas were changed.
- Sample JSON was not touched.
- Workspace V2 launch behavior was preserved.

## Playwright Impact
Yes. This PR changes runtime input behavior and Input Mapping V2 UI interactions.

Coverage added/updated:
- pointer drag descriptors are surfaced in Engine Input Sources and Capture.
- mouse drag release and rectangle gestures can be mapped.
- gamepad tiles display `Game Controller` plus input detail on separate lines.
- standard gamepad button names display for standard-mapped controllers.
- unknown gamepad buttons fall back to `Button <number>`.
- `<hr>` appears immediately before bottom `Refresh Gamepads`.
- clicking an active Capture button cancels capture.
- capture timeout still cancels capture.
- mapping tile width and height are each increased by 50px.

## Validation
- PASS: targeted JS syntax validation for changed engine input and Input Mapping V2 files.
- PASS: engine import validation for `PointerDragState` and `InputService`.
- PASS: targeted `InputService.test.mjs` run.
- PASS: focused Input Mapping V2 Playwright rerun after locator stabilization.
- PASS: `npm run test:workspace-v2` final run, 61 tests passed.
- PASS: `git diff --check` with line-ending warnings only.
- PASS: Playwright V8 coverage generated at `docs_build/dev/reports/playwright_v8_coverage_report.txt`; changed runtime JS coverage guardrail reports no warnings.

## Manual Validation
1. Open `tools/input-mapping-v2/index.html`.
2. Confirm Capture shows keyboard, mouse, pointer drag gesture buttons, detected gamepad buttons when available, an `<hr>`, and `Refresh Gamepads` at the bottom.
3. Click `Capture Keyboard`, click it again, and confirm capture cancels and highlight clears.
4. Create a mapping tile, click `Mouse Primary Drag Rectangle`, and confirm the tile shows `Mouse` / `Primary Drag Rectangle`.
5. With a standard mapped controller, capture a known button and confirm the tile shows `Game Controller` plus the standard button name.
6. Confirm no sample JSON validation or full samples smoke test is required for this PR.

## Full Samples Smoke
Skipped per PR instructions. This change is scoped to engine input support and Input Mapping V2/Workspace V2 validation.

## Artifacts
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/pointer_drag_input_mapping_tiles_report.md`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/codex_commands.md`
- `tmp/PR_26140_095-add-pointer-drag-input-and-polish-mapping-tiles_delta.zip`
