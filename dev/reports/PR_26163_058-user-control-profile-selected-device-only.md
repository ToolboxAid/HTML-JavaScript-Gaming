# PR_26163_058-user-control-profile-selected-device-only

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Branch validation: PASS

## Requirement Checklist

- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- PASS - Created PR scope `PR_26163_058-user-control-profile-selected-device-only`.
- PASS - Fixed `account/user-controls.html` Game Controller profile creation behavior through the external `account/user-controls-page.js` runtime.
- PASS - `Create User Control Profile` now creates exactly one profile from the selected detected game controller row.
- PASS - Unselected controllers are not created as additional profiles.
- PASS - Unselected controllers are not added as detached profiles.
- PASS - The new profile keeps the selected physical controller/device `controllerId`, `controllerName`, and `deviceType`.
- PASS - Only the newly created selected-device profile opens in edit mode.
- PASS - Scope stayed limited to account User Controls profile creation behavior, targeted tests, runtime coverage, and reports.

## Changed Files

- `account/user-controls-page.js`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26163_058-user-control-profile-selected-device-only.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Implementation Notes

- `Create User Control Profile` now reads the checked game controller row radio (`data-account-user-controls-selected-device`) instead of the separate controller dropdown.
- The selected row must be a detected game controller device choice; default/profile rows do not create new controller profiles.
- Device polling now refreshes visible controller rows while no profile is being edited, so newly detected controllers can be selected from the table without manual refresh.
- Existing edit-mode protection is preserved: polling does not rerender profile rows while a profile is being edited.

## Impacted Lane

- Account/User Controls runtime lane.
- Account/User Controls Playwright behavior lane.
- Workspace V2 command lane, required by request.

## Skipped Lanes

- Full samples smoke: SKIP. This PR is limited to Account/User Controls profile creation and does not touch samples, sample JSON, game runtime launch, or sample smoke behavior.
- Engine lane: SKIP. No `src/engine/input` files or engine contracts changed.
- Toolbox Controls lane beyond existing Account/User Controls coverage: SKIP. Toolbox Controls source was not changed.

## Validation Performed

- PASS - Branch check: `git branch --show-current` returned `main`.
- PASS - Syntax check: `node --check account/user-controls-page.js`.
- PASS - Syntax check: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`.
- PASS - Static patch check: `git diff --check -- account/user-controls-page.js tests/playwright/tools/InputMappingV2Tool.spec.mjs`.
- PASS - Targeted regression: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "selected game controller row" --reporter=line` passed 1 test.
- PASS - Targeted Account/User Controls slice: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "User Controls owns|selected game controller row|scopes profiles" --reporter=line` passed 3 tests.
- PASS - Required workspace validation: `npm run test:workspace-v2` passed 5 tests.

## Playwright Result

- PASS - Selecting one detected game controller row is required for profile creation.
- PASS - `Create User Control Profile` creates exactly one `player_controller_profiles` record.
- PASS - The unselected controller does not create an extra profile.
- PASS - The unselected controller remains a detected row rather than a detached saved profile.
- PASS - The newly created selected-device profile opens in edit mode.
- PASS - Existing User Controls profile defaults, editing, persistence, and ownership coverage still passes.

## Coverage

- PASS - `docs_build/dev/reports/playwright_v8_coverage_report.txt` was produced after the targeted Account/User Controls Playwright run.
- PASS - Changed runtime JavaScript coverage includes `(93%) account/user-controls-page.js - changed runtime JS file with browser V8 coverage`.

## Manual Validation Steps

1. Open `/account/user-controls.html`.
2. Ensure two game controllers are detected or exposed by the browser test harness.
3. Select one detected controller row in the Game Controllers table.
4. Click `Create User Control Profile`.
5. Confirm exactly one profile is created for the selected controller.
6. Confirm the unselected controller remains a detected row and is not saved as a profile.
7. Confirm the selected controller profile opens in edit mode.
8. Confirm clicking create without a selected detected controller row shows the warning status.

## Samples Validation Decision

- SKIP - Full samples smoke was not run because the request explicitly excluded it and the PR does not affect sample contracts or sample runtime behavior.

## Completion

- PASS - Every requested item was implemented, validated, and explicitly marked PASS or documented as skipped where applicable.
