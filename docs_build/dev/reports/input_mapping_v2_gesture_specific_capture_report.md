# PR_26140_111-fix-input-mapping-v2-gesture-specific-capture

## Source Reading
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Read `.codex/skills/repo-build/SKILL.md` for the repo BUILD workflow.
- Read `docs_build/pr/BUILD_PR.md`; it still references unrelated Level 18 overlay runtime hardening, so this report treats the explicit PR_26140_111 request as the authoritative BUILD scope.
- Read the targeted Input Mapping V2 files and immediate engine input dependency used by capture behavior.

## Implementation Summary
- Updated `ToolStarterApp` capture sessions so completion clears the active Capture button and a single Capture click can commit only one valid mapping.
- Made Keyboard Release capture wait for key down, show pending release feedback, and commit on matching key up.
- Made Combo capture visibly pending after the first input and commit only after the second input.
- Made Mouse Double Click capture wait for two same-button clicks within a threshold, with pending feedback after the first click.
- Made Mouse Wheel gestures require a matching live wheel event after Capture Mouse; mismatched clicks or opposite wheel directions warn without creating mappings.
- Tightened game controller capture validation so Button, Trigger, Stick, and DPad gestures only accept matching controller input kinds.
- Preserved selected tile requirements, token deletion, scroll preservation, capture gating, schema shape, and sample JSON.

## Playwright Impact
Playwright impacted: Yes.

Validated behavior:
- Capture buttons unhighlight after successful capture.
- Combo capture shows first-input pending state and commits after the second input.
- Keyboard Release commits on release and displays Release.
- Mouse Double Click commits only after the second click and rejects wheel input.
- Wheel gestures reject click/opposite wheel input and commit matching wheel direction.
- Game Controller Trigger rejects non-trigger button input.
- Game Controller Button rejects standard trigger input.
- Invalid gesture/input mismatches do not create mappings.

Expected pass behavior: all targeted and workspace-v2 Playwright tests pass with no page errors.
Expected fail behavior: mismatched gestures produce actionable WARN status/log text and do not create mapping tokens.

## Validation
PASS `node --check tools/input-mapping-v2/js/ToolStarterApp.js`
PASS `node --check tools/input-mapping-v2/js/services/EngineInputSourceService.js`
PASS `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
PASS `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs -g "Input Mapping V2"` - 8 passed.
PASS `npm run test:workspace-v2` - 67 passed.
PASS `git diff --check` - no whitespace errors; PowerShell reported the existing LF to CRLF working-copy warning for the Playwright spec.

## V8 Coverage
Runtime JavaScript changed, so Playwright V8 coverage artifacts were produced:
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`

Coverage guardrail status: advisory only, no threshold enforced, no missing changed-runtime-JS warnings.

## Manual Test Notes
1. Open Input Mapping V2, select an action, click Add, select Keyboard Release, click Capture Keyboard, press and release a key. Expected: no mapping until release; tile displays Release; Capture Keyboard unhighlights.
2. Select Keyboard Combo, click Capture Keyboard, press Ctrl then S. Expected: first input shows pending feedback; second input commits one combo token.
3. Select Mouse Double Click, click Capture Mouse, scroll the wheel, then double-click. Expected: wheel logs WARN and creates no token; double-click commits Double Click.
4. Select Mouse Wheel Up, click Capture Mouse, click mouse, wheel down, then wheel up. Expected: invalid inputs warn; wheel up commits.
5. With a standard mocked/connected controller, select Trigger and press a face button, then trigger; select Button and press a trigger, then face button. Expected: mismatches warn and only matching controls commit.

## Delta ZIP
- `tmp/PR_26140_111-fix-input-mapping-v2-gesture-specific-capture_20260523_093905_delta.zip` created and verified with 10 repo-relative entries.

## Samples Smoke
Full samples smoke test was not run, per request. Sample JSON was not touched.


