# PR_26161_028 Controls Compact Controller Profile

## Branch Validation
PASS: current branch was verified as `main` before edits.

## Impacted Lane
Controls / Input Mapping targeted lane.

## Playwright Impacted
Yes.

## Request Checklist
- PASS: Controls status remains Wireframe.
- PASS: Controls mappings, controller profiles, and custom actions remain DB-backed through the shared DB/mock adapter.
- PASS: Controller Profile Device Type dropdown now shows detected game controllers only.
- PASS: Keyboard and Mouse no longer appear in the Controller Profile Device Type dropdown.
- PASS: Keyboard and Mouse remain valid in Input Mapping row Input Device selection.
- PASS: Controller Profile vertical space was reduced by removing the standalone Input column.
- PASS: Generated controller inputs are displayed as compact Button/Input plus Action dropdown pairs.
- PASS: Generated Actions are placed under the controller row in a full-width grid that stacks left to right and top to bottom.
- PASS: Actions are displayed under the Controller Profile details row instead of a separate Input column.
- PASS: Add Profile still creates DB-backed controller profile records.
- PASS: Generated gamepad buttons, axes, triggers, and d-pad inputs are preserved.
- PASS: Custom Action creation still persists and appears in Action dropdowns after reload.
- PASS: Reset Mappings confirmation remains unchanged.
- PASS: Input Mapping and Controller Profile remain accordions.
- PASS: Mapping/profile persistence after reload remains covered.
- PASS: No sample JSON alignment, auth behavior, production game runtime behavior, or unrelated rewrites were added.
- PASS: Theme V2-only restrictions were preserved; no inline CSS, inline JS, script blocks, style blocks, or inline event handlers were added.

## Testing Performed
- `node --check toolbox/controls/controls.js`
- `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs`
  - Result: 7 passed.
- `git diff --check -- . ':!docs_build/dev/reports/codex_review.diff'`
  - Result: PASS, with Git line-ending warnings only.

## Playwright Coverage
- Produced `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- Changed browser runtime JS covered: `toolbox/controls/controls.js` at 91% function coverage.
- The V8 report lists prior server-side DB/mock adapter files as advisory WARN entries from the repository diff baseline; this PR did not change those files, and the targeted Controls browser runtime behavior is covered.

## Manual Validation Steps
1. Open `toolbox/controls/index.html`.
2. Verify Controller Profile Device Type only lists detected game controllers and does not list Keyboard or Mouse.
3. Add a mapping row and verify Input Device still offers Keyboard, Mouse, and Gamepad.
4. Mock or connect a gamepad, click Refresh Devices, select the detected gamepad, and click Add Profile.
5. Verify the saved profile shows generated inputs as compact input/action pairs under the controller row and no separate Input column.
6. Assign Actions, save profile actions, reload, and verify profile/mapping data persists.
7. Add a custom Action, reload, and verify it appears in Action dropdowns.

## Skipped Lanes
- Full samples validation was skipped as requested. This PR is scoped to Controls UI/tool behavior and does not change samples or production game runtime behavior.
- Broad workspace/full-suite validation was skipped because targeted Controls/Input Mapping Playwright covers the changed tool behavior directly.

## Runtime Engine Behavior
Confirmed: no production game runtime behavior was changed.
