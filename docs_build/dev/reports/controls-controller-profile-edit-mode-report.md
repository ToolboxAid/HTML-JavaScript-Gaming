# PR_26161_029 Controls Controller Profile Edit Mode Report

## Scope
- Updated Controls controller profile rows so saved profiles render as compact summaries outside edit mode.
- Moved generated controller input Action dropdowns into profile edit mode only.
- Added edit-mode gamepad input highlighting for matching generated controller inputs.
- Kept Controls status as Wireframe and kept persistence through the shared DB/mock adapter.

## Branch Validation
- PASS: current branch verified as `main` before edits.

## Impacted Lane
- Controls / Input Mapping.

## Playwright Impacted
- Yes.

## Validation Performed
- PASS: `node --check toolbox/controls/controls.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `git diff --check`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs`

## Manual Validation Steps
- Open Controls and refresh devices with a detected gamepad.
- Add a controller profile and confirm the saved profile row shows only the compact summary.
- Click Edit and confirm profile row values are text while generated input Action dropdowns appear underneath.
- Press a controller button during edit and confirm the matching generated input row highlights with the selected Action.
- Assign generated input Actions, Save, reload, and confirm assignments persist.
- Edit a profile, change an Action, Cancel, reload, and confirm the unsaved change did not persist.

## Skipped Lanes
- Full samples validation skipped by request because this PR only changes Controls UI behavior and targeted Playwright coverage exercises the impacted lane.

## Runtime Engine Behavior
- Confirmed: no runtime engine behavior changed.

## Completion Check
- PASS: Controller Profile Edit shows profile row values as text, not dropdowns.
- PASS: Generated input Action dropdowns appear only in edit mode.
- PASS: Generated input Action dropdowns are hidden outside edit mode.
- PASS: Controller input press during edit highlights the matching generated input.
- PASS: Selected/assigned Action is visibly shown for the pressed input.
- PASS: Editing one input does not alter other inputs.
- PASS: Save persists generated input action assignments after reload.
- PASS: Cancel does not persist unsaved generated input action changes.
