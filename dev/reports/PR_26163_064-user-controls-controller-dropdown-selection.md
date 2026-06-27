# PR_26163_064-user-controls-controller-dropdown-selection

## Branch Validation

- PASS: Current branch is `main`.
- PASS: Expected branch is `main`.
- Evidence: `git branch --show-current` returned `main`.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- PASS: Replaced detected-controller row selection with `[ Refresh Devices ] [ Controller Dropdown ] [ Create User Control Profile ]` in `account/user-controls.html`.
- PASS: Controller Dropdown contains only currently detected controllers; placeholder remains `Choose a game controller`.
- PASS: Refresh Devices updates the dropdown list; Playwright clicks Refresh after exposing test gamepads and validates the dropdown options.
- PASS: Detection creates zero profiles; Playwright validates `player_controller_profiles` remains empty after detection/refresh.
- PASS: Removed detected-controller profile-style rows from the profile table.
- PASS: Create User Control Profile uses the selected dropdown controller.
- PASS: Create User Control Profile creates exactly one new editable unsaved profile.
- PASS: Save persists the created profile.
- PASS: Selected Device radios exist only on actual profiles and default profiles.
- PASS: Default Profile retains a radio.
- PASS: User-created profiles retain radios.
- PASS: Scope stayed limited to account/user-controls controller selection and profile generation flow plus targeted tests/reports.

## Search Evidence

- PASS: `rg -n "detectedDeviceSelectionChoice|renderDetectedDeviceRow|data-account-user-controls-detected-device=|Select a detected game controller row|Detected Inputs|Create my profile to customize" account/user-controls-page.js account/user-controls.html tests/playwright/tools/InputMappingV2Tool.spec.mjs` returned no matches.
- PASS: `rg -n "data-account-user-controls-device|data-account-user-controls-add-profile|data-account-user-controls-refresh|selected controller dropdown device" account/user-controls.html account/user-controls-page.js tests/playwright/tools/InputMappingV2Tool.spec.mjs` shows the active dropdown workflow in HTML, JS bindings, and Playwright coverage.

## Changed Files

- `account/user-controls.html`
- `account/user-controls-page.js`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26163_064-user-controls-controller-dropdown-selection.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## Impacted Lane

- Account/User Controls runtime lane.
- Targeted Account/User Controls Playwright lane.
- Required legacy workspace command: `npm run test:workspace-v2`.

Note: `npm run test:workspace-v2` is a legacy command name retained by repo scripts; this PR uses user-facing Account/User Controls language.

## Skipped Lanes

- Full samples smoke: SKIP. Safe because this PR changes only account user-controls UI/runtime behavior and targeted Playwright tests; no sample JSON, sample loader, or game runtime sample path changed.
- Engine input lane: SKIP. Safe because `src/engine/input` was consumed but not modified.
- Toolbox Controls lane: SKIP. Safe because Toolbox > Controls files were not modified.

## Testing Performed

- PASS: `node --check account/user-controls-page.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `git diff --check -- account/user-controls.html account/user-controls-page.js tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `rg -n "<style| on[a-z]+=" account/user-controls.html` returned no inline style/event handler matches.
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "User Controls owns physical input mapping accordions and profiles|selected controller dropdown device" --reporter=line` passed 2 tests.
- PASS: `npm run test:workspace-v2` passed; workspace-contract lane reported 5 passed.

## Playwright Result

- PASS: Targeted Account/User Controls Playwright checks passed.
- PASS: Required `npm run test:workspace-v2` passed.

## V8 Coverage

- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` includes changed runtime JavaScript coverage.
- PASS: `(92%) account/user-controls-page.js - changed runtime JS file with browser V8 coverage`.

## ZIP Artifact

- PASS: Repo-structured delta ZIP produced at `tmp/PR_26163_064-user-controls-controller-dropdown-selection_delta.zip`.

## Manual Validation Steps

1. Open `/account/user-controls.html` while signed in.
2. In Game Controllers, verify the workflow row reads Refresh Devices, Controller dropdown, Create User Control Profile.
3. Connect or expose a game controller and click Refresh Devices.
4. Confirm the dropdown updates with detected controller names and no detected-controller rows appear in the profile table.
5. Select one controller from the dropdown.
6. Click Create User Control Profile.
7. Confirm exactly one editable unsaved profile appears for the selected controller.
8. Click Save and confirm the saved profile persists and gains its Selected Device radio.

## Samples Validation Decision

- SKIP: Full samples smoke was not run because no samples, sample JSON, sample loader, or production game runtime behavior changed.
