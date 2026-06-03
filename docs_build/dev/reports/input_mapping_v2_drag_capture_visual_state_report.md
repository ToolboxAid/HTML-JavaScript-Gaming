# PR_26140_112-fix-input-mapping-v2-drag-capture-and-visual-state

## Source Reading
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Read `.codex/skills/repo-build/SKILL.md` for the repo BUILD workflow.
- Read `docs_build/pr/BUILD_PR.md`; it still references unrelated Level 18 overlay runtime hardening, so this report treats the explicit PR_26140_112 request as the authoritative BUILD scope.
- Read targeted Input Mapping V2 source and Playwright coverage plus the immediate engine pointer-drag service dependency.

## Implementation Summary
- Changed Mouse Drag and Mouse Drag Release capture from descriptor snapshots to live mouse capture sessions.
- Capture Mouse now waits for actual mouse down, records the real button used, tracks movement, and commits Drag on movement or Drag Release on release.
- Drag mappings now persist the actual button in the binding, for example `MouseButton2:MousePrimaryDrag`.
- Added explicit visual capture state transitions for waiting, drag pending/tracking, complete, and canceled.
- Added a minimum visual completion/cancel state delay so the active Capture button highlight is visible before it clears.
- Kept detailed mapping messages in Status / Log only; Capture shows generic completion state text.
- Preserved PR_111 strict gesture validation, selected tile requirement, token deletion, scroll behavior, schemas, and sample JSON.

## Playwright Impact
Playwright impacted: Yes.

Validated behavior:
- Mouse Drag waits for a real mouse button and does not assume left button.
- Mouse Drag Release waits for down, movement, and release.
- Captured drag mappings record the actual mouse button used.
- Capture highlight remains visible for the configured minimum visual duration and then clears.
- Release, double-click, and combo pending states remain visually testable through existing focused coverage.
- Capture completion no longer repeats mappings from the same capture session.

Expected pass behavior: focused Input Mapping V2 tests and full `npm run test:workspace-v2` pass with no page errors.
Expected fail behavior: attempting to map Drag or Drag Release without the required live mouse sequence creates no mapping and leaves an actionable capture/status message.

## Validation
PASS `node --check tools/input-mapping-v2/js/ToolStarterApp.js`
PASS `node --check tools/input-mapping-v2/js/services/EngineInputSourceService.js`
PASS `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
PASS `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs -g "Input Mapping V2"` - 9 passed.
PASS `npm run test:workspace-v2` - 68 passed.
PASS `git diff --check` - no whitespace errors; PowerShell reported the existing LF to CRLF working-copy warning for the Playwright spec.

## V8 Coverage
Runtime JavaScript changed, so Playwright V8 coverage artifacts were produced:
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`

Coverage guardrail status: advisory only, no threshold enforced, no missing changed-runtime-JS warnings.

## Manual Test Notes
1. Open Input Mapping V2, select an action, click Add, select Mouse Drag, click Capture Mouse, press and hold right mouse, then move. Expected: no mapping until movement; tile records `Mouse Right Button, Drag`; capture highlight remains briefly, then clears.
2. Select another action, click Add, select Mouse Drag Release, click Capture Mouse, press middle mouse, drag, then release. Expected: no mapping until release; tile records `Mouse Middle Button, Drag Release` and hover/title includes bounds.
3. Repeat Release, Double Click, and Combo captures. Expected: pending messages remain visible during the intermediate state and no duplicate mapping is created from a single capture click.
4. Confirm Status / Log receives mapping detail messages and Capture only shows generic capture state text.

## Delta ZIP
- `tmp/PR_26140_112-fix-input-mapping-v2-drag-capture-and-visual-state_delta.zip` created and verified with repo-relative entries.

## Samples Smoke
Full samples smoke test was not run, per request. Sample JSON was not touched.
