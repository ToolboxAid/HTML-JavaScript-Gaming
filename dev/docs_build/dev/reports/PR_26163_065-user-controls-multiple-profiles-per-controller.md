# PR_26163_065-user-controls-multiple-profiles-per-controller

## Branch Validation

- PASS: Current branch is `main`.
- PASS: Expected branch is `main`.
- Evidence: `git branch --show-current` returned `main`.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- PASS: Every `Create User Control Profile` action for a selected controller creates a brand-new unsaved profile object with a unique generated `id`.
- PASS: Creation no longer reuses, replaces, edits, overwrites, or reopens an existing saved profile for the same controller.
- PASS: Unique profile key/id generation now checks existing profile IDs and suffixes new IDs when the generated base ID is already owned by another saved profile.
- PASS: New profile names still start from generated default names and remain editable before save.
- PASS: Saving a new profile appends it to the current user's profiles instead of replacing an existing record.
- PASS: Existing profiles, including a renamed `1.1 Profile`, remain unchanged when another profile is generated for the same physical controller.
- PASS: A user can create multiple profiles for the same physical controller; Playwright validates two saved profiles with the same `controllerId` and distinct IDs.
- PASS: Preserved the controller dropdown workflow: `[ Refresh Devices ] [ Controller Dropdown ] [ Create User Control Profile ]`.
- PASS: Detection/refresh still creates zero profiles.
- PASS: Did not change `toolbox/controls`; those files remain game-owned Controls and are outside this PR.

## Search And Diff Evidence

- PASS: `git diff --name-only` contains only account User Controls runtime, targeted Playwright coverage, and report artifacts.
- PASS: `git diff --name-only` contains no `toolbox/controls` files.
- PASS: `rg -n "baseProfileId|profileIds|\\.\\.\\.this\\.profiles, profile|1\\.1 Profile|Studio Flight Pad Profile" account/user-controls-page.js tests/playwright/tools/InputMappingV2Tool.spec.mjs` shows unique ID generation, append-on-save, and the Playwright 1.1 regression path.

## Changed Files

- `account/user-controls-page.js`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26163_065-user-controls-multiple-profiles-per-controller.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## Impacted Lane

- Account/User Controls runtime lane.
- Targeted Account/User Controls Playwright lane.
- Required legacy workspace command: `npm run test:workspace-v2`.

Note: `npm run test:workspace-v2` is a legacy command name retained by repo scripts.

## Skipped Lanes

- Full samples smoke: SKIP. Safe because this PR changes only account User Controls profile generation and targeted Playwright coverage; no sample JSON, sample loader, or game runtime sample path changed.
- Engine input lane: SKIP. Safe because `src/engine/input` was consumed but not modified.
- Toolbox Controls lane: SKIP. Safe because no `toolbox/controls` files changed.

## Testing Performed

- PASS: `node --check account/user-controls-page.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `git diff --check -- account/user-controls-page.js tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `rg -n "<style| on[a-z]+=" account/user-controls.html` returned no inline style/event handler matches.
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "User Controls owns physical input mapping accordions and profiles|selected controller dropdown device" --reporter=line` passed 2 tests.
- PASS: `npm run test:workspace-v2` passed; workspace-contract lane reported 5 passed.

## Playwright Result

- PASS: Targeted Account/User Controls Playwright checks passed.
- PASS: Required `npm run test:workspace-v2` passed.

## V8 Coverage

- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` includes changed runtime JavaScript coverage.
- PASS: `(92%) account/user-controls-page.js - changed runtime JS file with browser V8 coverage`.

## Manual Validation Steps

1. Open `/account/user-controls.html` while signed in.
2. In Game Controllers, click Refresh Devices and select a detected controller from the Controller dropdown.
3. Click Create User Control Profile.
4. Rename the editing profile to `1.1` and save.
5. Confirm `1.1 Profile` remains visible as a saved profile.
6. Select the same controller again and click Create User Control Profile.
7. Confirm a distinct new editable unsaved profile opens with a generated default name.
8. Save it and confirm both `1.1 Profile` and the new profile exist with distinct profile IDs.
9. Refresh/detect devices again and confirm no profile is created until Create User Control Profile is clicked.

## Samples Validation Decision

- SKIP: Full samples smoke was not run because no samples, sample JSON, sample loader, or production game runtime behavior changed.

## ZIP Artifact

- PASS: Repo-structured delta ZIP produced at `tmp/PR_26163_065-user-controls-multiple-profiles-per-controller_delta.zip`.
