# PR_26161_034 Controls Axis Direction And Input Events

## Branch Validation
- PASS: Current git branch was verified as `main` before edits.

## Impacted Lane
- Controls / Input Mapping
- `src/engine/input` normalized input registry
- Shared DB/mock adapter Controls tables

## Playwright Impacted
- Yes.

## Requirement Checklist
- PASS: Controls status remains Wireframe. Playwright validates registry metadata for `controls` remains `wireframe`.
- PASS: Controls data remains DB-backed through the shared DB/mock adapter. Mappings persist through `game_input_mappings`; player input mappings persist through `player_controller_profiles`.
- PASS: Normalized axis choices are split into `move.x-`, `move.x+`, `move.y-`, `move.y+`, `aim.x-`, `aim.x+`, `aim.y-`, `aim.y+`.
- PASS: Axis +/- directions use separate normalized input dropdown choices in Player Input Mapping.
- PASS: Deadzone belongs to the physical axis and is shared by both +/- directions; Playwright verifies one Axis0 row with one Deadzone control and both direction dropdowns.
- PASS: Invert belongs to the physical axis; engine normalization test validates invert changes axis direction resolution.
- PASS: User-facing `Assigned Normalized Input` copy is removed; Playwright verifies it is absent.
- PASS: Dropdown/list heights are consistent; Playwright compares generated select heights in Game Input Mapping and Player Input Mapping edit rows.
- PASS: Game Input Mapping includes an Input Event column with `Press`, `Down`, and `Release`.
- PASS: Game Input Mapping includes an Input Family column with `Keyboard`, `Mouse`, `Gamepad`, and `Joystick`.
- PASS: Input Family stores only the family value; Playwright verifies `game_input_mappings` does not store controller name/id, binding, input device, or raw physical input.
- PASS: Normalized architecture is preserved: Player Input Mapping maps physical input to normalized input; Game Input Mapping maps normalized input to game action.
- PASS: Default fallback profiles, reset confirmation, accordions, status logging, and DB persistence are preserved by targeted Playwright.
- PASS: No sample JSON alignment, auth behavior, production account system, or unrelated rewrites were added.

## Testing Performed
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- PASS: `node --check src/dev-runtime/persistence/mock-db-store.js`
- PASS: `node --check src/engine/input/NormalizedInputRegistry.js`
- PASS: `node --check toolbox/controls/controls.js`
- PASS: `node --check tests/input/NormalizedInputRegistry.test.mjs`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `node --check tests/playwright/tools/AdminDbViewer.spec.mjs`
- PASS: `node tests/input/NormalizedInputRegistry.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs`

## Manual Validation Steps
1. Open `/toolbox/controls/index.html`.
2. In Game Input Mapping, click Add Game Control and confirm columns include Normalized Input, Input Family, Input Event, Game Action, Object, State, and Actions.
3. Select `move.x-`, `Gamepad`, and `Release`, save, reload, and confirm the row persists.
4. Inspect the mock DB snapshot and confirm `game_input_mappings` stores `inputFamily` and `inputEventPhase` without controller id/name or raw physical input.
5. Create a gamepad Player Input Mapping and edit `Axis0`.
6. Confirm `Axis0` has separate Negative and Positive normalized input dropdowns, one Deadzone field, and one Invert checkbox.
7. Confirm `Assigned Normalized Input` does not appear.
8. Save, reload, and confirm the Axis0 mapping persists with one shared deadzone/invert pair and both direction values.

## Skipped Lanes
- Full samples validation was skipped by request.
- Full repository Playwright was skipped because the impacted browser lane is Controls/Input Mapping.
- Project Workspace validation was skipped because this PR does not change Project Workspace behavior.

## Runtime Engine Behavior
- No production game runtime behavior was added.
- `src/engine/input/NormalizedInputRegistry.js` received the smallest shared input extension required for directional normalized axes and deadzone/invert direction resolution.

## Required Artifacts
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `tmp/PR_26161_034-controls-axis-direction-and-input-events_delta.zip`

## Completion Audit
- PASS: Original PR request was re-read before packaging.
- PASS: Every requested item is implemented, validated, and marked PASS above.
