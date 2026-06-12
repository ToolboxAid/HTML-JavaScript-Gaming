# PR_26162_047 Controls Edit Row In Place Fix

## Branch Validation
- PASS: Current branch is `main`.
- Expected branch: `main`.
- Evidence: `git status --short --branch` reported `## main...origin/main` before edits.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Verified current git branch is `main` before edits.
- PASS: Continued from PR_26162_046.
- PASS: Toolbox > Controls edit behavior now replaces the selected row in-place.
- PASS: Clicking the first row Edit button edits the first row.
- PASS: Clicking a middle/later row Edit button edits that exact row in-place.
- PASS: The edit row is no longer rendered at the top of the table.
- PASS: Row order is preserved before, during, and after edit.
- PASS: Save updates only the selected row.
- PASS: Cancel restores only the selected row.
- PASS: Trash deletes only the selected row.
- PASS: DB-backed persistence is preserved through the shared DB/mock adapter.
- PASS: Normalized Game Controls behavior from PR_26162_046 is preserved.
- PASS: Added Playwright regression coverage for non-first-row in-place editing.
- PASS: No sample JSON alignment, auth behavior, production account system, or unrelated rewrites were added.
- PASS: Theme V2 only; no inline CSS, inline JS, script blocks, style blocks, or inline event handlers were introduced.

## Changed Files
- `toolbox/controls/controls.js`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/controls-edit-row-in-place-fix-report.md`

## Impacted Lanes
- Controls tool runtime lane.
- Controls Playwright behavior lane.

## Validation Performed
- PASS: `node --check toolbox/controls/controls.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `git diff --check`
- PASS: `rg -n -P "<style|style\\s*=|\\son[a-z]+\\s*=" toolbox/controls/index.html toolbox/controls/controls.js` returned no matches.
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs` passed 7/7.

## Playwright Result
- PASS: Existing Controls behavior remains green.
- PASS: Regression test confirms the first row edits in-place.
- PASS: Regression test confirms a middle row (`Aim Down`) edits in-place and not at the top.
- PASS: Regression test confirms Cancel restores only the selected row.
- PASS: Regression test confirms Save updates only the selected row.
- PASS: Regression test confirms Trash deletes only the selected row.
- PASS: Regression test confirms row order is preserved after Save, Cancel, Trash, and reload.
- PASS: Regression test confirms DB-backed persistence after reload.

## V8 Coverage
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` refreshed from targeted Playwright.
- PASS: `(95%) toolbox/controls/controls.js - current PR changed runtime JS file with browser V8 coverage`.
- NOTE: The shared coverage helper also lists `src/engine/input/NormalizedInputRegistry.js` as a reporter HEAD-baseline file. That file is not part of this PR diff and is marked advisory in the coverage reports.

## Skipped Lanes
- Full samples validation: SKIPPED per request. Safe to skip because this PR changes only Toolbox > Controls table edit rendering and targeted Playwright coverage.
- Full repository test suite: SKIPPED. Safe to skip because the affected runtime behavior is covered by the targeted Controls Playwright lane.
- Account/User Controls-only lane: covered as part of `InputMappingV2Tool.spec.mjs`; no Account runtime code changed.

## Samples Decision
- Samples validation was not run, per request.

## Manual Validation Steps
1. Open `toolbox/controls/index.html`.
2. Click Edit on the first Game Controls row and confirm the first row becomes the edit row.
3. Save a new label and confirm only that row changes.
4. Click Edit on a middle/later row such as `Aim Down` and confirm the edit row appears in that same table position.
5. Change the label, click Cancel, and confirm the original row is restored in place.
6. Click Edit on a later row such as `Pause`, save a new label, and confirm only that row changes.
7. Click Trash on a different row and confirm only that row is deleted.
8. Reload and confirm row order and saved values persist.
