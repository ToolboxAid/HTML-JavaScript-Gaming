# PR_26162_049-controls-tooltips-defaults-pause-lock

## Branch Validation
- PASS: current branch is `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Continued from PR_26162_048 without changing the enabled checkbox styling.
- PASS: Added hover/ARIA tooltip text for Game Controls columns:
  - `D = Down`
  - `H = Hold`
  - `U = Up`
  - `DC = Double Click / Double Press`
- PASS: Movement default rows now use Hold only.
- PASS: Aim default rows now use Hold only.
- PASS: Movement and aim defaults leave Down, Up, and Double Click unchecked.
- PASS: `action.pause` remains visible in Game Controls.
- PASS: `action.pause` is engine-owned and rendered read-only/locked.
- PASS: `action.pause` cannot be disabled through the UI because no edit action is exposed and loaded/saved pause rows are normalized to enabled.
- PASS: `action.pause` cannot be deleted through the UI because no Trash action is exposed and save/read repair restores it if missing.
- PASS: Game Controls explains `Pause is handled by the engine.`
- PASS: DB-backed Game Controls and Account User Controls separation is preserved.
- PASS: No sample JSON alignment, auth behavior, production account system, or unrelated rewrites were added.

## Changed Files
- `toolbox/controls/index.html`
- `toolbox/controls/controls.js`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/controls-tooltips-defaults-pause-lock-report.md`

## Impacted Lanes
- Toolbox Controls runtime lane.
- Playwright impacted: Yes.

## Validation Performed
- PASS: `node --check toolbox/controls/controls.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `git diff --check`
- PASS: `rg -n "<style|style\\s*=|\\son[a-z]+\\s*=" toolbox/controls/index.html toolbox/controls/controls.js` returned no matches.
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "Toolbox Controls|Game Controls edits|Game Controls validates|Controls split"`

## Playwright Result
- PASS: 4 targeted Controls tests passed.
- Covered behavior:
  - D/H/U/DC hover and ARIA tooltip metadata.
  - Movement and aim defaults use Hold only.
  - Pause remains visible and locked.
  - Pause has no Edit or Trash action.
  - Pause remains enabled and canonical after save/reload.
  - Existing Controls runtime/Account User Controls separation remains intact.

## V8 Coverage
- Generated: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Result: `(94%) toolbox/controls/controls.js - executed lines 667/667; executed functions 68/72`
- Guardrail: no changed runtime JS coverage warnings.

## Skipped Lanes
- Full samples validation skipped: samples are out of scope and no sample JSON, game runtime, or sample launch behavior changed.
- Full workspace suite skipped: this PR only changes the Controls tool UI/runtime behavior and targeted Controls Playwright covers the affected behavior.
- Account/User Controls full behavior lane skipped beyond separation regression: no Account/User Controls files or behavior were changed.

## Manual Validation Steps
1. Open `/toolbox/controls/index.html`.
2. Hover the D, H, U, and DC column headers and confirm their tooltip meanings.
3. Confirm Move and Aim rows show Hold checked and Down, Up, and Double Click unchecked.
4. Confirm `action.pause` / Pause is visible.
5. Confirm the Pause row says `Pause is handled by the engine.`
6. Confirm Pause has no Edit or Trash button.
7. Reload the page and confirm Pause remains visible, enabled, and locked.

## Samples Decision
- SKIP: Full samples validation was not run because this PR does not touch samples, sample data, or production runtime behavior.
