# Input Mapping V2 Nav Layout Labels Report

## Scope
- PR: PR_26140_098-polish-input-mapping-v2-nav-layout-and-labels
- Source of truth: user PR_098 request. `docs_build/pr/BUILD_PR.md` currently points at an unrelated Level 18 overlay runtime hardening rebase, so this workflow used the explicit PR_098 request after reading `docs_build/dev/PROJECT_INSTRUCTIONS.md`.

## Changes Applied
- Restored the standalone Input Mapping V2 tool nav as `inputMappingV2ToolNav` with `Import`, `Copy JSON`, and `JSON` actions.
- Kept the workspace nav path intact and kept the tool nav hidden during workspace launch.
- Moved `Gestures` and `Capture` into the center column above `Captured Mappings`.
- Moved `Status / Log` to the bottom of the right column and renamed the JSON preview accordion from `Export` to `JSON`.
- Changed Actions button labels to `Add`, `Delete`, `Delete` and rewired the old clear button path to delete only the selected action tile instead of clearing inputs.
- Updated game controller capture button labels to the compact two-line format: `Capture Game` plus the vendor/product line when available.
- Removed the visible Sample 0104 diagnostics card from Gamepad Diagnostics, leaving browser and Input Mapping V2 engine diagnostics only.
- Updated Input Mapping V2 help text to refer to `Copy JSON` and `JSON`.
- Updated focused Playwright coverage for nav labels, layout order, diagnostics visibility, compact gamepad capture labels, action labels, and non-bulk delete behavior.

## Contracts And Constraints
- No schema changes.
- No sample JSON changes.
- No engine core changes.
- External JS/CSS-only constraint preserved; changed HTML has no inline script/style/event-handler matches.
- Captured mapping tile, gamepad auto-poll, combo, drag, and wheel behavior are preserved by existing coverage.
- Sample 0104 comparison was removed from visible diagnostics because it duplicated the same InputService-backed state now shown by the Input Mapping V2 engine diagnostics. It can remain a conceptual comparison point in reports, but it is no longer useful as visible Gamepad Diagnostics UI.

## Validation
- `node --check tools/input-mapping-v2/js/bootstrap.js`: PASS
- `node --check tools/input-mapping-v2/js/ToolStarterApp.js`: PASS
- `node --check tools/input-mapping-v2/js/controls/ExportControl.js`: PASS
- `node --check tools/input-mapping-v2/js/services/EngineInputSourceService.js`: PASS
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "Input Mapping V2"`: PASS, 2 tests
- `rg --pcre2 -n "<script(?![^>]*src=)|<style| on[a-zA-Z]+=" tools/input-mapping-v2/index.html tools/input-mapping-v2/how_to_use.html`: PASS, no matches
- `npm run test:workspace-v2`: PASS, 61 tests
- `git diff --check`: PASS, line-ending warnings only
- Full samples smoke test: not run, per request
- Delta ZIP verification: PASS, 12 files, nonzero size

## Notes
- `Import` is wired to an actionable warning in standalone mode because PR_098 restores the nav action but does not introduce an Input Mapping V2 file-import contract or schema changes. Workspace launch data remains the supported import path for this surface.
