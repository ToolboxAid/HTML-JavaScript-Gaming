# PR_26162_045 User Controls Input Capture Cleanup

## Branch Validation
- PASS: Current branch is `main`.
- Expected branch: `main`.
- Evidence: `git status --short --branch` reported `## main...origin/main`.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Continued from PR_26162_044 without changing Controls status; Controls remains Wireframe.
- PASS: Account > User Controls removes dpad/trigger normalized choices from Keyboard/Mouse where they do not apply.
- PASS: Keyboard mappings show Normalized Control as read-only text, not an editable dropdown.
- PASS: Keyboard mappings no longer show Deadzone, Invert, or Sensitivity columns/fields.
- PASS: Keyboard Physical Input textboxes clear on click, capture the next keyboard input, and restore the previous value after 5 seconds without capture.
- PASS: Mouse Physical Input textboxes use the same capture/restore pattern for mouse events.
- PASS: Keyboard and Mouse Physical Input values remain editable through capture and persist through the shared DB/mock adapter on save.
- PASS: Game Controller table behavior remains intact, including dpad/trigger normalized controls and applicable tuning fields.
- PASS: DB-backed separation is preserved: `game_input_mappings` stays game/project-owned and `player_controller_profiles` stays user/player-owned.
- PASS: Normalized action contract, defaults, and persistence are preserved.
- PASS: No sample JSON alignment, auth behavior, production account system, or unrelated rewrites were added.
- PASS: Theme V2 restrictions preserved; no inline CSS, inline JS, style blocks, or inline event handlers were introduced.

## Changed Files
- `account/user-controls.html`
- `account/user-controls-page.js`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/user-controls-input-capture-cleanup-report.md`

## Impacted Lanes
- Account/User Controls runtime UI.
- Controls/User Controls Playwright runtime lane.
- Workspace V2 contract lane was run for standard repo validation.

## Validation Performed
- PASS: `node --check account/user-controls-page.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `git diff --check -- account/user-controls-page.js account/user-controls.html tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `rg -n -P "<style|style\\s*=|\\son[a-z]+\\s*=" account/user-controls.html account/user-controls-page.js` returned no matches.
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "Account User Controls"` passed 1/1.
- PASS: `npm run test:workspace-v2` passed 5/5.

## Playwright Result
- PASS: Targeted Account/User Controls Playwright validated:
  - Keyboard Normalized Control is read-only/non-editable.
  - Keyboard does not show Deadzone, Invert, or Sensitivity.
  - Keyboard normalized choices do not expose dpad/trigger because no Keyboard normalized dropdown is rendered.
  - Keyboard physical input clears, captures `ArrowRight`, and restores `KeyA` after 5 seconds when no key is pressed.
  - Mouse physical input clears, captures `MouseButton1`, and restores `MouseButton2` after 5 seconds when no mouse input is captured.
  - Mouse normalized dropdown excludes dpad/trigger controls.
  - Game Controller rows still expose dpad/trigger normalized controls and applicable tuning fields.
  - Keyboard, Mouse, and Game Controller profiles persist after reload.

## V8 Coverage
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` refreshed from the targeted Playwright run.
- PASS: Current PR changed runtime JS coverage includes `(94%) account/user-controls-page.js`.
- NOTE: The shared coverage reporter also includes a pre-existing HEAD-baseline advisory for `toolbox/controls/controls.js`; that file is not part of this PR diff and is documented as advisory in the coverage artifacts.

## Skipped Lanes
- Full samples validation: SKIPPED per request. Safe to skip because this PR is scoped to Account/User Controls UI/editor behavior, targeted Playwright coverage, and generated reports only.
- Full repository test suite: SKIPPED. Safe to skip because the affected runtime path is covered by targeted Account/User Controls Playwright plus the Workspace V2 contract lane.

## Manual Validation Steps
1. Open `account/user-controls.html`.
2. In Keyboard, click `Create my profile`.
3. Confirm the Keyboard table has `Physical Controller`, `Physical Input`, `Normalized Control`, and `Actions` only.
4. Click a Keyboard `Physical Input` textbox; confirm it clears, captures the next key, and restores after 5 seconds if no key is pressed.
5. Confirm Keyboard normalized controls are text, not dropdowns.
6. In Mouse, click `Create my profile`; confirm physical input capture/restore works and normalized choices exclude dpad/trigger.
7. In Game Controllers, create a detected controller profile; confirm dpad/trigger normalized controls remain available.
8. Save profiles, reload, and confirm saved values persist.

## Samples Decision
- Samples validation was not run, per request.

## Runtime/Account Scope Confirmation
- PASS: No production account system behavior changed.
- PASS: No production game runtime behavior changed.
- PASS: No sample JSON behavior changed.
