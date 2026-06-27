# PR_26161_017 Controls Table First Input Report

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`
- Worktree was clean before PR_26161_017 edits.

## Scope

- Impacted lane: Controls/Input Mapping tool UI/runtime and targeted Controls/Input Mapping Playwright coverage.
- Playwright impacted: Yes.
- Runtime engine behavior changed: No.
- Samples validation: Skipped as requested. No sample JSON alignment, auth behavior, production DB behavior, or engine runtime behavior changed.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Verified current git branch was `main` before edits.
- PASS: Continued from PR_26161_016.
- PASS: Moved Controls toward table-first editing like Objects by placing mapping row creation controls in the mappings table footer.
- PASS: Mappings table supports inline add/edit for `Object`, `Action`, `Input Device`, `Input`, `State`, and `Actions`.
- PASS: `Add Mapping` is below the mappings table.
- PASS: Adding a row shows `Cancel` in the right-side action cell of the new row.
- PASS: `Add Mapping` is disabled while a new or edited row is active, then re-enabled after save or cancel.
- PASS: Keyboard, mouse, and gamepad capture behavior remains in place.
- PASS: Default actions remain sorted alphabetically.
- PASS: DB/mock-adapter persistence remains in place.
- PASS: Workspace return behavior remains in place.
- PASS: UAT-required panels remain: Actions, Capture, Mappings, Mapping JSON, Devices, and Status.
- PASS: Did not add sample JSON alignment, auth behavior, production DB behavior, or unrelated tool rewrites.
- PASS: Kept Theme V2 only; no inline CSS, inline JS, script/style blocks, or inline event handlers.

## Testing Performed

- PASS: `node --check toolbox/input-mapping-v2/input-mapping-v2.js`
- PASS: `node --check toolbox/input-mapping-v2/input-mapping-api-client.js`
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `rg --pcre2 -n '<script(?![^>]*\bsrc=)|<style\b|\son[a-z]+\s*=' toolbox/input-mapping-v2/index.html toolbox/controls/index.html`
  - Expected no matches; command exited with no matches.
- PASS: `git diff --check`
  - Result: PASS. Git reported line-ending normalization warnings only.
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --workers=1 --reporter=line`
  - Result: 4 passed.

## Playwright Behavior Covered

- PASS: UAT launch route still renders Actions, Capture, Mappings, Mapping JSON, Devices, and Status.
- PASS: `Add Mapping` appears once and is inside the mappings table footer.
- PASS: `Reset Mappings` remains available in the mappings table footer.
- PASS: Inline add creates a row with editable Object, Action, Input Device, Input, State, and right-side Actions cells.
- PASS: New row action cell shows `Save` and `Cancel`, with `Cancel` on the right.
- PASS: `Add Mapping` disables while a new row is active.
- PASS: Cancel removes the unsaved row and re-enables `Add Mapping`.
- PASS: Saving an inline row persists it to `input_mapping_records`.
- PASS: Editing an existing mapping uses an inline replacement row and re-enables `Add Mapping` after save.
- PASS: Saved edits persist after reload.
- PASS: Keyboard capture still maps `KeyA` to the selected `Move Left` action.
- PASS: Clicking the `Keyboard KeyA` token still deletes the persisted mapping.
- PASS: Default actions remain alphabetically sorted.
- PASS: Workspace return behavior remains covered by the UAT launch test.

## Playwright V8 Coverage

- Report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Current PR browser runtime JavaScript coverage:
  - `(92%) toolbox/input-mapping-v2/input-mapping-v2.js - executed lines 703/703; executed functions 80/87`
  - `(100%) toolbox/input-mapping-v2/input-mapping-api-client.js - executed lines 12/12; executed functions 2/2`
- Advisory WARN entries remain for PR_26161_016 server/dev-runtime files because the coverage helper includes changed JS from `HEAD`; PR_26161_017 did not modify those files.

## Manual Validation Steps

1. Open `/toolbox/input-mapping-v2/index.html?workspace=demo-project`.
2. Confirm Actions, Capture, Mappings, Mapping JSON, Devices, and Status panels appear.
3. Confirm `Add Mapping` and `Reset Mappings` are below the mappings table.
4. Click `Add Mapping` and confirm the new row appears with `Save` and `Cancel` in the right-side Actions cell.
5. Confirm `Add Mapping` is disabled while the new row is active.
6. Click `Cancel` and confirm the unsaved row disappears and `Add Mapping` is enabled again.
7. Add and save a row, reload, and confirm the mapping persists.
8. Edit the saved row, save, reload, and confirm the edit persists.
9. Select `Move Left`, click `Capture Keyboard`, press `A`, and confirm `Keyboard KeyA` appears in the table and JSON.
10. Click the `Keyboard KeyA` token and confirm the mapping is deleted.

## Skipped Lanes

- Full samples validation: SKIP, explicitly requested and no samples changed.
- Full workspace/project suite: SKIP, no broad Project Workspace behavior changed; workspace return remains covered by targeted Controls/Input Mapping Playwright.
- Engine runtime tests: SKIP, no `src/engine/input` behavior changed.
- Auth and production DB validation: SKIP, no auth or production DB behavior changed; existing shared mock DB persistence behavior remains covered by targeted Playwright.
