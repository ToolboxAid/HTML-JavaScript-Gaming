# PR_26163_060-user-control-gamepad-generation-repair

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Branch validation: PASS

## Requirement Checklist

- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- PASS - Created PR scope `PR_26163_060-user-control-gamepad-generation-repair`.
- PASS - Repaired `account/user-controls.html` gamepad profile generation without using `toolbox/controls` as an implementation source.
- PASS - Audited Account User Controls code paths for detected gamepads, detached rows, profile creation, Edit/Trash buttons, selected device state, and Save behavior.
- PASS - Connected controllers auto-detect as selectable detected-device rows only.
- PASS - Detected-only rows are not saved profiles.
- PASS - Detected-only rows do not show as detached profiles.
- PASS - User must select exactly one detected controller row before profile creation.
- PASS - `Create User Control Profile` creates exactly one new unsaved profile for the selected controller.
- PASS - Newly generated profile opens in edit mode immediately.
- PASS - Edit/Delete buttons appear only for real saved profile rows.
- PASS - Save persists exactly one edited profile for the current user.
- PASS - Clicking `Create User Control Profile` with no selected controller shows a visible actionable warning.
- PASS - The touched flow does not create detected gamepads as in-memory profile rows during detection/render.
- PASS - Scope stayed limited to account User Controls gamepad profile behavior, targeted tests, runtime coverage, and reports.

## Changed Files

- `account/user-controls.html`
- `account/user-controls-page.js`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26163_060-user-control-gamepad-generation-repair.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Audit Notes

- `renderDetectedDeviceRow()` renders detected gamepads as rows with `data-account-user-controls-detected-device`, summary text, and a `Detected` action/status cell.
- `renderProfileRow()` is the only path that renders saved profile rows with `data-account-user-controls-profile-row` plus Edit and Trash buttons.
- `addProfileForSelectedDevice()` now requires the currently checked detected gamepad row and does not fall back to previously saved selected-device state.
- `createProfile(device, { persistImmediately: false })` stages the selected gamepad profile in edit mode; `saveEditingProfile()` is the persistence boundary.
- The account page no longer renders the game controller dropdown; connected controllers are selected from detected-device rows only.
- No `toolbox/controls` files were used or modified for account profile generation.

## Impacted Lane

- Account/User Controls runtime lane.
- Account/User Controls Playwright behavior lane.
- Workspace V2 command lane, required by request. The command name `npm run test:workspace-v2` is legacy test-suite naming; it does not introduce user-facing Workspace V2 wording.

## Skipped Lanes

- Full samples smoke: SKIP. This PR is limited to Account/User Controls gamepad profile generation and does not touch samples, sample JSON, game runtime launch, or sample smoke behavior.
- Engine lane: SKIP. No `src/engine/input` files or engine contracts changed.
- Toolbox Controls lane: SKIP. Toolbox Controls is game-owned controls and was intentionally not used or changed for account user profiles.

## Validation Performed

- PASS - Branch check: `git branch --show-current` returned `main`.
- PASS - Syntax check: `node --check account/user-controls-page.js`.
- PASS - Syntax check: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`.
- PASS - Static patch check: `git diff --check -- account/user-controls.html account/user-controls-page.js tests/playwright/tools/InputMappingV2Tool.spec.mjs`.
- PASS - HTML restriction check: `rg -n "<style| on[a-z]+=|<script>" account/user-controls.html` returned no matches.
- PASS - Targeted regression: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "selected game controller row" --reporter=line` passed 1 test.
- PASS - Targeted Account/User Controls slice: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "User Controls owns|selected game controller row|scopes profiles" --reporter=line` passed 3 tests.
- PASS - Required workspace validation: `npm run test:workspace-v2` passed 5 tests.

## Playwright Result

- PASS - Connected gamepads render as detected selectable rows.
- PASS - Detection creates zero saved profile rows.
- PASS - Detected rows are not labeled or stored as detached profiles.
- PASS - `Create User Control Profile` with no selected gamepad shows an actionable warning and creates zero profiles.
- PASS - Selecting one detected gamepad then clicking `Create User Control Profile` creates exactly one editable unsaved profile.
- PASS - Generated profile has Save/Cancel edit flow and does not create profiles for other detected gamepads.
- PASS - Save persists only that one profile for the current user.
- PASS - Edit/Trash buttons appear on the saved real profile row and not on detected-only rows or the unsaved editing row.

## Coverage

- PASS - `docs_build/dev/reports/playwright_v8_coverage_report.txt` was produced after the targeted Account/User Controls Playwright run.
- PASS - Changed runtime JavaScript coverage includes `(91%) account/user-controls-page.js - changed runtime JS file with browser V8 coverage`.

## Manual Validation Steps

1. Open `/account/user-controls.html`.
2. Connect or expose at least two game controllers.
3. Confirm connected controllers appear as detected-device table rows and no controller dropdown appears.
4. Confirm detected rows show `Detected` and do not show Edit or Trash.
5. Click `Create User Control Profile` with no detected controller row selected.
6. Confirm the warning appears and no profile is created.
7. Select exactly one detected controller row and click `Create User Control Profile`.
8. Confirm a single unsaved profile opens in edit mode with Save/Cancel.
9. Save the profile and confirm only that profile persists for the current user.
10. Confirm unselected detected controllers remain detected rows and are not saved profiles.

## Samples Validation Decision

- SKIP - Full samples smoke was not run because the request explicitly excluded it and the PR does not affect sample contracts or sample runtime behavior.

## Completion

- PASS - Every requested item was implemented, validated, and explicitly marked PASS or documented as skipped where applicable.
