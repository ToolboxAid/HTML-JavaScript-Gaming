# PR_26162_042 Controls Combo Framework And User Control Editing Report

## Branch Validation
- PASS: Current branch is `main`.
- Expected branch: `main`.
- Evidence: `git status --short --branch` returned `## main...origin/main`.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Verified current branch is `main` before edits.
- PASS: Continued from PR_26162_041 scope.
- PASS: Controls status remains Wireframe. Evidence: Controls metadata still shows `"status": "Wireframe"` and `"releaseChannel": "wireframe"`.
- PASS: Toolbox > Controls is prepopulated with default Game Controls rows on first load.
- PASS: Combo Controls accordion appears in Toolbox > Controls.
- PASS: Combo Controls is wireframe-only and uses the requested text: `Wireframe only: Keyboard Shift + Mouse Right Click can become a future combo control.`
- PASS: No combo runtime behavior was added.
- PASS: Account > User Controls > Game Controllers dropdown excludes Keyboard and Mouse.
- PASS: Account > User Controls Keyboard mappings are editable.
- PASS: Account > User Controls Mouse mappings are editable.
- PASS: Users can change defaults such as `KeyW` to `ArrowRight`; targeted Playwright validates persistence after reload.
- PASS: DB-backed separation remains enforced: `game_input_mappings` is game/project-owned, `player_controller_profiles` is user/player-owned.
- PASS: `game_input_mappings` does not store physical key/mouse/controller data.
- PASS: `player_controller_profiles` does not store game/object actions.
- PASS: Normalized action contract is preserved.
- PASS: Theme V2 rules preserved; no inline CSS, inline JS, script/style blocks, or inline event handlers were added.
- PASS: Shared `src/engine/input` usage is preserved for Account User Controls.

## Search Evidence
- PASS: Toolbox Controls has no device-specific setup or local input polling:
  - `rg -n "data-input-add-mapping|data-input-family-panel|data-input-source-diagnostics|InputService|DEVICE_POLL_INTERVAL_MS|navigator\\.getGamepads|gamepadconnected" toolbox/controls/index.html toolbox/controls/controls.js`
  - No active Toolbox matches.
- PASS: Combo framework exists as wireframe-only:
  - `rg -n "data-input-combo-controls|Wireframe only: Keyboard Shift \\+ Mouse Right Click can become a future combo control" toolbox/controls/index.html`
- PASS: Default Game Controls prepopulation exists:
  - `rg -n "default-game-control|Loaded default Game Controls" toolbox/controls/controls.js`
- PASS: Keyboard/Mouse editing controls exist under Account User Controls:
  - `rg -n "data-account-user-controls-edit-family|data-account-user-controls-physical-input" account/user-controls.html account/user-controls-page.js`
- PASS: Game Controllers dropdown excludes Keyboard and Mouse:
  - Targeted Playwright asserts the dropdown options are `Choose a game controller`, `Gamepad: Arcade Test Pad`, and `Gamepad: Studio Flight Pad`.
- PASS: DB ownership separation is covered:
  - Targeted Playwright asserts `game_input_mappings` rows do not include `controllerId`, `controllerName`, or `physicalInput`.
  - Targeted Playwright asserts `player_controller_profiles` JSON does not contain `gameAction`, `objectKey`, or event fields.

## Changed Files
- `account/user-controls-page.js`
- `account/user-controls.html`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/controls-combo-framework-and-user-control-editing-report.md`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `toolbox/controls/controls.js`
- `toolbox/controls/index.html`

## Impacted Lanes
- Controls tool runtime lane.
- Account/User Controls runtime lane.
- Controls shared DB/mock adapter behavior through browser API coverage.
- Targeted Playwright/V8 coverage lane.

## Validation Performed
- PASS: `node --check toolbox/controls/controls.js`
- PASS: `node --check account/user-controls-page.js`
- PASS: `node --check account/user-controls.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `rg -n --pcre2 "<script(?![^>]*\\bsrc=)|<style\\b|\\son[a-z]+\\s*=" toolbox/controls/index.html account/user-controls.html` returned no matches.
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --reporter=line`
  - Final result: 6 passed.

## Playwright Result
- PASS: Toolbox > Controls is prepopulated with default Game Controls rows.
- PASS: Combo Controls accordion appears in Toolbox > Controls as wireframe-only.
- PASS: Game Controllers dropdown excludes Keyboard and Mouse.
- PASS: Keyboard mappings are editable and persist after reload.
- PASS: Mouse mappings are editable and persist after reload.
- PASS: DB ownership separation remains enforced.
- PASS: Device-specific physical input remains in Account User Controls.
- PASS: Game mappings remain normalized action -> usage/event timing only.

## V8 Coverage
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` regenerated from the final Playwright run.
- Covered changed browser runtime files:
  - `toolbox/controls/controls.js`: 95% function coverage.
  - `account/user-controls-page.js`: 92% function coverage.
  - `account/user-controls.js`: 100% function coverage.
- WARN advisory only: the coverage helper reports server/dev-runtime entries from its comparison window that Chromium V8 does not collect. The browser behavior for this PR is covered by the targeted Playwright lane.

## Skipped Lanes
- Full samples validation: SKIPPED as requested; no sample JSON, sample loader, or sample runtime behavior changed.
- Production auth/account system validation: SKIPPED; Account User Controls continues to use the existing session and shared DB/mock adapter path only.
- Production game runtime validation: SKIPPED; combo controls were added as wireframe-only and no runtime combo behavior was implemented.
- Full workspace suite: SKIPPED because the requested validation lanes were targeted Controls and Account/User Controls Playwright checks.

## Manual Validation Steps
1. Open `/toolbox/controls/index.html`.
2. Confirm Game Controls table is populated without clicking a preset.
3. Confirm Combo Controls accordion appears and contains the requested wireframe-only text.
4. Confirm no combo runtime controls or device-specific setup appears in Toolbox > Controls.
5. Open `/account/user-controls.html`.
6. Confirm Game Controllers dropdown does not list Keyboard or Mouse.
7. Click Edit Keyboard Mappings, change `KeyW` to `ArrowRight`, save, reload, and confirm the saved profile keeps `ArrowRight`.
8. Click Edit Mouse Mappings, change `MouseButton0` to another mouse input, save, reload, and confirm persistence.

## Samples Decision
- Samples validation was skipped intentionally and safely because this PR does not change samples, sample JSON, sample routing, or production game runtime behavior.

## Completion
- PASS: 100% of requested PR_26162_042 requirements are implemented, validated, and marked PASS.
