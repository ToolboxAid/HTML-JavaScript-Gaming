# PR_26161_031 Controls Engine Input And Profile Scope Report

## Scope
- Routed Controls keyboard, mouse, wheel, and gamepad detection through shared `src/engine/input` services.
- Removed local gamepad polling and local gamepad input interpretation from Controls.
- Removed Mapping Profile from Input Mapping rows.
- Scoped mappings by `controllerProfileId`: Keyboard/Mouse mappings use the Keyboard/Mouse profile scope, and Gamepad mappings use the selected saved Controller Profile.
- Relaxed Controller Profile saving so generated inputs may remain unassigned.

## Branch Validation
- PASS: current branch verified as `main` before edits.

## Impacted Lane
- Controls / Input Mapping.
- Shared input helper lane for `src/engine/input`.

## Playwright Impacted
- Yes.

## Validation Performed
- PASS: `node --check src/engine/input/GamepadInputClassifier.js`
- PASS: `node --check src/engine/input/InputService.js`
- PASS: `node --check src/engine/input/GamepadState.js`
- PASS: `node --check toolbox/controls/controls.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `node tests/input/GamepadState.test.mjs`
- PASS: `node tests/input/InputService.test.mjs`
- PASS: `node tests/input/GamepadInputAdapter.test.mjs`
- PASS: `Select-String -Path toolbox/controls/index.html -Pattern '<style',' onclick=',' onchange=',' oninput=',' onsubmit='`
- PASS: `git diff --check`
- PASS: `rg -n "navigator\\.getGamepads|Array\\.from\\(navigator" toolbox/controls/controls.js` returned no matches.
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs`

## Manual Validation Steps
- Open Controls.
- Confirm Input Mapping table columns are Object, Action, Input Device, Input, State, Actions.
- Add a Keyboard mapping, capture a key, and confirm the selected input text turns Theme V2 gold while editing.
- Add a Mouse mapping, capture a mouse button or wheel input, and confirm the selected input text turns Theme V2 gold while editing.
- Refresh devices with a gamepad available and confirm diagnostics report multiple active controller inputs when multiple inputs are pressed.
- Add a Controller Profile, edit it, leave generated inputs unassigned, save, and confirm the profile saves without invalid or blocking status.
- Reopen the profile, assign Actions, press controller inputs, and confirm only selected Action text turns Theme V2 gold.
- Add a Gamepad mapping after selecting a saved Controller Profile and confirm the saved mapping stores the selected `controllerProfileId` without displaying Mapping Profile in the row.
- Reload and confirm mappings and profiles persist.

## Shared Input Gap / Extension
- PASS: Controls needed shared generated controller profile labels and active profile input names. Added the smallest shared extension to `src/engine/input/GamepadInputClassifier.js`.
- PASS: Controls needed browser gamepad button `value` support through the shared input path. Updated `InputService` and `GamepadState` to treat button value above threshold as active.
- PASS: No local Controls workaround or duplicate controller polling remains.

## Skipped Lanes
- Full samples validation skipped by request.
- Auth, production DB, production game runtime, and sample JSON lanes skipped because this PR only changes Controls UI/runtime behavior plus targeted shared input helpers used by Controls.
- Broad engine/game validation skipped because the shared input changes were narrow and covered by targeted input unit tests plus Controls Playwright.

## Runtime Engine Behavior
- PASS: no production game runtime wiring or sample behavior changed.
- PASS: shared input helpers were extended only to expose existing browser input state to Controls.

## Coverage Notes
- PASS: Playwright V8 coverage report produced.
- WARN: `src/engine/input/InputService.js` reports advisory low function coverage in V8 coverage, but changed lines were executed and targeted input unit tests passed.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Verified branch `main` before edits.
- PASS: Continued from PR_26161_030.
- PASS: Controls status remains Wireframe.
- PASS: Controls data remains DB-backed through the shared DB/mock adapter only.
- PASS: Controller Profile can save with no Action assignments.
- PASS: Generated controller inputs may remain unassigned.
- PASS: Unassigned generated inputs display as unassigned, not invalid.
- PASS: Controls uses `src/engine/input` classes/services for keyboard, mouse, and game controller input detection.
- PASS: Controls no longer performs duplicate local controller polling or input interpretation.
- PASS: Missing shared input capability was addressed with the smallest shared input extension.
- PASS: Multiple simultaneous game controller input states are reported when exposed by `src/engine/input`.
- PASS: Keyboard selected input text changes to Theme V2 gold during capture/edit.
- PASS: Mouse button and wheel selected input text changes to Theme V2 gold during capture/edit.
- PASS: Controller selected Action text remains Theme V2 gold only.
- PASS: Mapping Profile no longer appears in Input Mapping rows.
- PASS: Mappings are scoped by selected Controller Profile through `controllerProfileId`.
- PASS: Keyboard and Mouse mappings use the Keyboard/Mouse profile scope.
- PASS: Gamepad mappings use the selected saved controller profile scope.
- PASS: Controller profile generation, device refresh guidance, Create Profile From Default edit mode, custom Actions, accordions, reset confirmation, DB persistence, and object-aware action filtering are preserved.
- PASS: No sample JSON alignment, auth behavior, production game runtime behavior, or unrelated rewrites were added.
- PASS: Theme V2 only; no inline CSS, inline JS, script/style blocks, or inline event handlers were added.
