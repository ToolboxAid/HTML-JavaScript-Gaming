# PR_26161_030 Controls Device Refresh Profile Polish Report

## Scope
- Moved Refresh Devices into Controller Profile next to Device Type.
- Added creator-facing Devices inspector guidance.
- Updated Create Profile From Default so it saves a DB-backed profile and immediately opens that profile in edit mode.
- Changed controller input edit-mode identification to Theme V2 gold text on the selected Action only.

## Branch Validation
- PASS: current branch verified as `main` before edits.

## Impacted Lane
- Controls / Input Mapping.

## Playwright Impacted
- Yes.

## Validation Performed
- PASS: `node --check toolbox/controls/controls.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `Select-String -Path toolbox/controls/index.html -Pattern '<style',' onclick=',' onchange=',' oninput=',' onsubmit='`
- PASS: `git diff --check`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs`

## Manual Validation Steps
- Open Controls and confirm Refresh Devices appears to the left of Controller Profile Device Type.
- Open Inspector > Devices and confirm the guidance reads: `Press a button on the controller, then refresh Device Type.`
- Connect or mock a gamepad, refresh devices, choose the gamepad, then click Create Profile From Default.
- Confirm the DB-backed profile appears immediately in edit mode with generated input/action dropdowns visible.
- Press a controller input while editing and confirm only the selected Action text turns Theme V2 gold.
- Confirm the selected input row does not receive a background, border, or layout highlight.
- Assign profile Actions, save, reload, and confirm assignments persist.

## Skipped Lanes
- Full samples validation skipped by request.
- Broad workspace, engine, auth, production DB, and sample lanes skipped because this PR only changes Controls UI/runtime behavior, one reusable Theme V2 text utility, and targeted Playwright coverage exercises the impacted lane.

## Runtime Engine Behavior
- PASS: no production game runtime or engine behavior changed.

## Theme V2 Styling Note
- PASS: added reusable `.text-gold` in Theme V2 typography because the imported Theme V2 bundle did not provide a text-only gold utility. No page-local CSS, inline styles, tool CSS, background, border, or layout styling was added.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Verified branch `main` before edits.
- PASS: Continued from PR_26161_029 behavior.
- PASS: Controls status remains Wireframe.
- PASS: Controls data remains DB-backed through the shared DB/mock adapter only.
- PASS: Refresh Devices appears left of Controller Profile > Device Type.
- PASS: Inspector > Devices guidance appears at the top.
- PASS: Create Profile From Default creates a DB-backed controller profile.
- PASS: Create Profile From Default immediately places the newly added profile into edit mode.
- PASS: Generated input/action dropdowns are visible after Create Profile From Default.
- PASS: Controller input press in edit mode identifies the selected Action with Theme V2 gold text only.
- PASS: No background, border, layout, or extra visual effect is added for the selected controller input.
- PASS: Controller profile edit-mode behavior, generated input list, action dropdowns, custom Actions, reset confirmation, Input Mapping accordion, Controller Profile accordion, and DB persistence are preserved.
- PASS: No sample JSON alignment, auth behavior, production game runtime behavior, or unrelated rewrites were added.
- PASS: Theme V2 only; no inline CSS, inline JS, script/style blocks, or inline event handlers were added.
- PASS: Targeted Controls/Input Mapping Playwright validation passed.
- PASS: Playwright V8 coverage report produced for changed runtime JavaScript.
