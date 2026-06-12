# PR_26163_059-user-control-profile-generation-flow

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Branch validation: PASS

## Requirement Checklist

- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- PASS - Created PR scope `PR_26163_059-user-control-profile-generation-flow`.
- PASS - Fixed `account/user-controls.html` Game Controller profile flow through the external `account/user-controls-page.js` runtime.
- PASS - Connected controller detection renders detected device rows only and does not create user profiles.
- PASS - User must select exactly one detected controller row before `Create User Control Profile` can generate a profile.
- PASS - `Create User Control Profile` creates exactly one new profile for only the selected controller.
- PASS - Newly generated game controller profile opens in edit mode.
- PASS - Save persists that one profile for the current user.
- PASS - A second profile for the same controller requires a second explicit select controller -> create profile -> edit -> save flow.
- PASS - No behavior remains in the touched flow that auto-adds all connected gamepads as profiles.
- PASS - No behavior remains in the touched flow that creates detached profiles for unselected controllers.
- PASS - Scope stayed limited to account User Controls gamepad detection/profile generation behavior, targeted tests, runtime coverage, and reports.

## Changed Files

- `account/user-controls-page.js`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26163_059-user-control-profile-generation-flow.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Implementation Notes

- Game controller profile generation now stages the selected detected controller as an unsaved edit row.
- Keyboard and Mouse profile creation keep their existing immediate DB-backed behavior; the changed persistence boundary is scoped to Game Controller generation.
- Detected game controller rows remain visible after a profile is saved, allowing another explicit generation flow for the same physical controller.
- Profile Save remains the DB persistence action for generated game controller profiles.
- Auto-detection refreshes visible detected rows while no profile is being edited, but detection itself does not write `player_controller_profiles`.

## Impacted Lane

- Account/User Controls runtime lane.
- Account/User Controls Playwright behavior lane.
- Workspace V2 command lane, required by request. The command name `npm run test:workspace-v2` is legacy test-suite naming; it does not introduce user-facing Workspace V2 wording.

## Skipped Lanes

- Full samples smoke: SKIP. This PR is limited to Account/User Controls profile generation and does not touch samples, sample JSON, game runtime launch, or sample smoke behavior.
- Engine lane: SKIP. No `src/engine/input` files or engine contracts changed.
- Toolbox Controls lane: SKIP. Toolbox Controls source was not changed.

## Validation Performed

- PASS - Branch check: `git branch --show-current` returned `main`.
- PASS - Syntax check: `node --check account/user-controls-page.js`.
- PASS - Syntax check: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`.
- PASS - Static patch check: `git diff --check -- account/user-controls-page.js tests/playwright/tools/InputMappingV2Tool.spec.mjs`.
- PASS - Targeted regression: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "selected game controller row" --reporter=line` passed 1 test.
- PASS - Targeted Account/User Controls slice: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --grep "User Controls owns|selected game controller row|scopes profiles" --reporter=line` passed 3 tests.
- PASS - Required workspace validation: `npm run test:workspace-v2` passed 5 tests.

## Playwright Result

- PASS - Connected controller detection renders detected device rows.
- PASS - Controller detection creates zero `player_controller_profiles` records.
- PASS - Selecting one controller then creating a profile opens exactly one edit row.
- PASS - Generated profile does not persist before Save.
- PASS - Save persists only the selected controller profile.
- PASS - Repeating the same selected-controller flow creates a second profile only after a second explicit create/save sequence.
- PASS - Unselected controllers do not create profiles and remain detected rows.
- PASS - Existing User Controls profile defaults, editing, persistence, and ownership coverage still passes.

## Coverage

- PASS - `docs_build/dev/reports/playwright_v8_coverage_report.txt` was produced after the targeted Account/User Controls Playwright run.
- PASS - Changed runtime JavaScript coverage includes `(93%) account/user-controls-page.js - changed runtime JS file with browser V8 coverage`.

## Manual Validation Steps

1. Open `/account/user-controls.html`.
2. Connect or expose at least two game controllers.
3. Confirm detected controllers render as selectable rows and no saved user profiles appear from detection alone.
4. Select one detected controller row.
5. Click `Create User Control Profile`.
6. Confirm one generated profile opens in edit mode and no DB-backed profile appears until Save.
7. Click Save and confirm exactly one profile persists for the selected controller.
8. Confirm the unselected controller did not create a profile.
9. Select the same detected controller again, create a profile again, and save.
10. Confirm a second profile appears only after that second explicit flow.

## Samples Validation Decision

- SKIP - Full samples smoke was not run because the request explicitly excluded it and the PR does not affect sample contracts or sample runtime behavior.

## Completion

- PASS - Every requested item was implemented, validated, and explicitly marked PASS or documented as skipped where applicable.
