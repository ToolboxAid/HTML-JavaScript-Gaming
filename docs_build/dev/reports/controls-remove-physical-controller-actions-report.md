# PR_26162_046 Controls Remove Physical Controller Actions

## Branch Validation
- PASS: Current branch is `main`.
- Expected branch: `main`.
- Evidence: `git status --short --branch` reported `## main...origin/main`.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Verified branch is `main` before edits.
- PASS: Continued from PR_26162_045.
- PASS: Controls status remains Wireframe; tool metadata/status was not changed.
- PASS: Controls data remains DB-backed through the shared DB/mock adapter only.
- PASS: Toolbox > Controls no longer creates or edits game controls for `dpad.up`, `dpad.down`, `dpad.left`, `dpad.right`, `trigger.left`, or `trigger.right`.
- PASS: Toolbox > Controls does not define physical controller inputs; `game_input_mappings` remains free of controller id/name and physical input fields.
- PASS: Toolbox > Controls keeps only the requested game-level normalized controls:
  `move.x-`, `move.x+`, `move.y-`, `move.y+`, `aim.x-`, `aim.x+`, `aim.y-`, `aim.y+`, `action.primary`, `action.secondary`, `action.tertiary`, `action.quaternary`, `action.confirm`, `action.cancel`, `action.pause`, `action.start`, `action.select`.
- PASS: Account > User Controls keeps physical DPad and trigger rows available.
- PASS: Account > User Controls default mappings support `DPad Up -> move.y-`, `DPad Down -> move.y+`, `DPad Left -> move.x-`, `DPad Right -> move.x+`, `Left Trigger -> action.primary`, and `Right Trigger -> action.secondary`.
- PASS: Editable controller mappings, deadzone, invert, sensitivity, and controller naming are preserved.
- PASS: Combo Controls wireframe remains in Toolbox > Controls.
- PASS: Aim remains normalized axis controls in Game Controls and was not moved into Combo Controls.
- PASS: No sample JSON alignment, auth behavior, production account system, or unrelated rewrites were added.

## Changed Files
- `toolbox/controls/controls.js`
- `src/engine/input/NormalizedInputRegistry.js`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `tests/input/NormalizedInputRegistry.test.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/controls-remove-physical-controller-actions-report.md`

## Impacted Lanes
- Controls tool runtime lane.
- Account/User Controls runtime lane.
- Engine input normalization/default mapping lane.

## Validation Performed
- PASS: `node --check toolbox/controls/controls.js`
- PASS: `node --check account/user-controls-page.js`
- PASS: `node --check src/engine/input/NormalizedInputRegistry.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `node --check tests/input/NormalizedInputRegistry.test.mjs`
- PASS: `node tests/input/NormalizedInputRegistry.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs` passed 6/6.
- PASS: `git diff --check`
- PASS: `rg -n -P "<style|style\\s*=|\\son[a-z]+\\s*=" toolbox/controls/index.html toolbox/controls/controls.js account/user-controls.html account/user-controls-page.js` returned no matches.

## Playwright Result
- PASS: Toolbox > Controls renders 17 game-level normalized rows.
- PASS: Toolbox > Controls table/list excludes `dpad.*`, `trigger.*`, `D-Pad`, `Trigger`, and `action.menu`.
- PASS: Toolbox > Controls edit dropdown excludes `dpad.*`, `trigger.*`, and `action.menu`.
- PASS: Toolbox > Controls still includes `aim.x-`, `aim.x+`, `aim.y-`, and `aim.y+`.
- PASS: Combo Controls wireframe remains visible.
- PASS: Account > User Controls keeps physical DPad and trigger rows.
- PASS: Account > User Controls maps DPad and trigger defaults into movement/action normalized controls.
- PASS: Profiles and mappings persist after reload.

## V8 Coverage
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` refreshed from the targeted Playwright run.
- PASS: `(93%) toolbox/controls/controls.js - changed JS file with browser V8 coverage`.
- PASS: `(89%) src/engine/input/NormalizedInputRegistry.js - changed JS file with browser V8 coverage`.
- PASS: `coverage_changed_js_guardrail.txt` reports no changed runtime JS coverage warnings.

## Skipped Lanes
- Full samples validation: SKIPPED per request. Safe to skip because this PR only changes Controls/User Controls input mapping behavior and a targeted shared input default contract; no sample JSON or sample runtime files changed.
- Full repository test suite: SKIPPED. Safe to skip because targeted Controls/User Controls Playwright plus the targeted engine input registry test covered the changed behavior.
- Workspace V2 broad lane: SKIPPED. Safe to skip because this PR did not change navigation, workspace launch contracts, or workspace persistence.

## Samples Decision
- Samples validation was not run, per request.

## Manual Validation Steps
1. Open `toolbox/controls/index.html`.
2. Confirm Game Controls shows only the 17 game-level normalized rows and no DPad/trigger/action.menu rows.
3. Edit a Game Controls row and confirm the Normalized Action dropdown excludes dpad/trigger/action.menu while keeping aim axes.
4. Confirm Combo Controls still shows the wireframe text.
5. Open `account/user-controls.html`.
6. Create a game controller profile from a detected controller.
7. Confirm DPad Up/Down/Left/Right rows are present and default to move directions.
8. Confirm Trigger Left/Right rows are present and default to primary/secondary actions.
9. Save, reload, and confirm mappings persist.

## Notes
- The global normalized registry still retains physical-controller-specific normalized identifiers for Account/User Controls compatibility, but Toolbox > Controls filters them out and cleans stale game-control records from the shared mock DB when encountered.
