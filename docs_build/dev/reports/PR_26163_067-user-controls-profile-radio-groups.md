# PR_26163_067-user-controls-profile-radio-groups

## Branch Validation
- PASS: Current branch is `main`.
- Expected branch: `main`.

## Summary
- Updated Account > User Controls selected profile radios so Keyboard, Mouse, and Gamepad selections each use an independent radio group.
- Persisted active profile selection by device type through the shared mock DB adapter.
- Kept detected controller rows profile-free; controller detection continues to feed the dropdown workflow only.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Verified current branch is `main` before changes.
- PASS: Keyboard profiles use radio group `account-user-controls-selected-device-keyboard`.
- PASS: Mouse profiles use radio group `account-user-controls-selected-device-mouse`.
- PASS: Gamepad profiles use radio group `account-user-controls-selected-device-gamepad`.
- PASS: Selecting a Gamepad profile does not deselect the active Keyboard profile.
- PASS: Selecting a Mouse profile does not deselect the active Gamepad profile.
- PASS: One active profile is persisted per device type for Keyboard, Mouse, and Gamepad.
- PASS: Default profiles participate in their device-type groups.
- PASS: User-created profiles participate in their device-type groups.
- PASS: Detection rows remain profile-free and contain no radios.
- PASS: Active profile selection persists by device type for the current user.
- PASS: Scope stayed limited to Account/User Controls profile selection behavior, mock DB selection persistence, targeted tests, and required reports.

## Changed Files
- `account/user-controls-page.js`
- `src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26163_067-user-controls-profile-radio-groups.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## Impacted Lane
- Account/User Controls profile selection.
- Shared mock DB adapter persistence for selected input device/profile records.
- Targeted Account/User Controls Playwright coverage.

## Validation Performed
- PASS: `node --check account/user-controls-page.js`
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `rg -n '<style| on[a-z]+=' account/user-controls.html account/user-controls-page.js src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js tests/playwright/tools/InputMappingV2Tool.spec.mjs` returned no matches.
- PASS: `git diff --check -- account/user-controls-page.js src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "User Controls owns physical input mapping accordions and profiles|User Controls creates one profile from only the selected controller dropdown device" --reporter=line`
  - Result: 2 passed.
- PASS: `npm run test:workspace-v2`
  - Result: 5 passed in the workspace-contract lane.

## Playwright Result
- PASS: Targeted Account/User Controls Playwright checks passed.
- PASS: Required `npm run test:workspace-v2` passed.

## V8 Coverage
- PASS: `account/user-controls-page.js` collected browser V8 coverage at 92%.
- WARN: `src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js` is exercised through the local dev-runtime/server path, but Chromium browser V8 coverage does not collect that server-side module.
- Report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Manual Validation Steps
1. Open `account/user-controls.html` as a signed-in user.
2. Select Keyboard Default Profile, Mouse Default Profile, and Gamepad Default Profile; confirm all three stay selected and the status lists all selected devices.
3. Create and save Keyboard, Mouse, and Gamepad user profiles.
4. Select one user-created profile in each device type; confirm selecting one device type does not clear the other device type selections.
5. Refresh detected controllers; confirm detected controllers appear in the controller dropdown and no detected row radios are rendered.
6. Reload the page; confirm active Keyboard, Mouse, and Gamepad selections persist for the current user.

## Skipped Lanes
- SKIP: Full samples smoke test. Safe to skip because this PR only changes Account/User Controls profile selection and mock DB persistence, and the user explicitly requested no full samples smoke test.
- SKIP: Unrelated Toolbox/Game Controls lanes. Safe to skip because no Toolbox/Game Controls runtime behavior changed.

## Samples Validation
- SKIP: Full samples smoke test was not run by request.

## Packaging
- PASS: Repo-structured delta ZIP produced under `tmp/PR_26163_067-user-controls-profile-radio-groups_delta.zip`.
