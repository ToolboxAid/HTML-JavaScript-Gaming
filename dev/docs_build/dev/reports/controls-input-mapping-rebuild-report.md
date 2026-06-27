# PR_26161_016 Controls Input Mapping Rebuild Report

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`
- Worktree was clean before PR_26161_016 edits.

## Scope

- Impacted lane: Controls/Input Mapping tool UI/runtime, shared mock DB adapter table registration, local mock API repository routing, Controls metadata launch route, and targeted Playwright coverage.
- Playwright impacted: Yes.
- Runtime engine behavior changed: No.
- Samples validation: Skipped as requested. No sample JSON alignment, auth behavior, production DB behavior, or engine runtime behavior changed.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Verified current git branch was `main` before edits.
- PASS: Reviewed `docs_build/tools/input-mapping-v2/uat.md` before implementation.
- PASS: Used `archive/v1-v2/tools/old_input-mapping-v2/` as UX/reference only; no legacy CSS, shell, inline patterns, or deprecated structure were copied.
- PASS: Rebuilt Controls/Input Mapping with current Theme V2 layout and external JavaScript only.
- PASS: Added `toolbox/input-mapping-v2/index.html` as the UAT launch route.
- PASS: Replaced the old `toolbox/controls/index.html` wireframe with the rebuilt working surface for compatibility.
- PASS: Updated Controls metadata/nav launch route to `toolbox/input-mapping-v2/index.html`.
- PASS: Promoted Controls metadata status to `beta` for the rebuilt DB-backed tool.
- PASS: Preserved useful old workflow concepts: default actions, keyboard capture, mouse capture, gamepad capture WARN, mapping list, Mapping JSON/status output, and device/source diagnostics.
- PASS: Implemented table-first mapping input with `Object | Action | Input Device | Input | State | Actions`.
- PASS: Uses Objects DB records as selectable Object values when available.
- PASS: Persists mappings through the shared DB/mock adapter via `input_mapping_records`, not page-local-only storage.
- PASS: Default actions are alphabetically sorted and include movement, confirm/cancel, fire, thrust, rotation, Pause, Select, and Start.
- PASS: Workspace launch mode shows `Return to Workspace`.
- PASS: Did not add sample JSON alignment, auth behavior, production DB behavior, or unrelated tool rewrites.
- PASS: Kept Theme V2 only; no inline CSS, inline JS, script/style blocks, or inline event handlers.

## Testing Performed

- PASS: `node --check toolbox/input-mapping-v2/input-mapping-v2.js`
- PASS: `node --check toolbox/input-mapping-v2/input-mapping-api-client.js`
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- PASS: `node --check src/dev-runtime/server/mock-api-router.mjs`
- PASS: `node --check src/dev-runtime/persistence/mock-db-store.js`
- PASS: `node --check src/dev-runtime/guest-seeds/tool-metadata-inventory.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `rg --pcre2 -n '<script(?![^>]*\bsrc=)|<style\b|\son[a-z]+\s*=' toolbox/input-mapping-v2/index.html toolbox/controls/index.html`
  - Expected no matches; command exited with no matches.
- PASS: `rg -n 'Static wireframe only|Not implemented yet|no database|no runtime behavior|legacy CSS|deprecated structure|session-only|MVP' toolbox/input-mapping-v2/index.html toolbox/controls/index.html toolbox/input-mapping-v2/input-mapping-v2.js`
  - Expected no matches; command exited with no matches.
- PASS: `git diff --check`
  - Result: PASS. Git reported line-ending normalization warnings only.
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --workers=1 --reporter=line`
  - Result: 3 passed.

## Playwright Behavior Covered

- PASS: UAT launch route `/toolbox/input-mapping-v2/index.html` renders the required panels: Actions, Capture, Mappings, Mapping JSON, Devices, and Status.
- PASS: Workspace launch query shows `Return to Workspace`.
- PASS: Mapping table columns are `Object`, `Action`, `Input Device`, `Input`, `State`, and `Actions`.
- PASS: Default actions are sorted alphabetically and include movement, confirm/cancel, fire, thrust, rotation, Pause, Select, and Start.
- PASS: Device diagnostics list `InputService + KeyboardState`, `InputService + MouseState`, `InputService + GamepadState + GamepadInputAdapter`, and `GamepadInputAdapter`.
- PASS: Device refresh updates the status log.
- PASS: Gamepad capture shows an actionable `WARN` when no live browser gamepad value is available.
- PASS: Keyboard capture maps `KeyA` to the selected `Move Left` action.
- PASS: Captured token `Keyboard KeyA` deletes the persisted mapping when clicked.
- PASS: Objects DB records are available as selectable Object values.
- PASS: Mapping records persist through the shared DB/mock adapter after reload.
- PASS: Compatibility route `/toolbox/controls/index.html` uses the rebuilt Input Mapping surface and no longer shows wireframe-only copy.
- PASS: Controls registry route resolves to `toolbox/input-mapping-v2/index.html` with status `beta`.

## Playwright V8 Coverage

- Report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Current PR browser runtime JavaScript coverage:
  - `(81%) toolbox/input-mapping-v2/input-mapping-v2.js - executed lines 700/700; executed functions 64/79`
  - `(100%) toolbox/input-mapping-v2/input-mapping-api-client.js - executed lines 12/12; executed functions 2/2`
- Advisory WARN entries remain for server/dev-runtime files because Playwright browser V8 coverage does not collect Node-side mock API modules.
- The report may also list previous `HEAD` changed JS such as Objects files; those are advisory from the coverage helper's HEAD comparison and are not PR_26161_016 worktree changes.

## Manual Validation Steps

1. Open `/toolbox/input-mapping-v2/index.html?workspace=demo-project`.
2. Confirm `Return to Workspace` is visible.
3. Confirm Actions, Capture, Mappings, Mapping JSON, Devices, and Status panels appear.
4. Confirm the default action dropdown is alphabetically sorted and includes Pause, Select, and Start.
5. Select `Move Left`, click `Capture Keyboard`, press `A`, and confirm `Keyboard KeyA` appears in the mapping table and JSON.
6. Click the `Keyboard KeyA` token and confirm the mapping is deleted.
7. Click `Capture Gamepad` with no live gamepad value and confirm the actionable WARN.
8. Create or seed an Object record, reload Input Mapping, and confirm the Object dropdown includes it.
9. Reload after saving a mapping and confirm the mapping persists from `input_mapping_records`.

## Skipped Lanes

- Full samples validation: SKIP, explicitly requested and no samples changed.
- Full workspace/project suite: SKIP, broad Project Workspace behavior was not changed; targeted Playwright validates the UAT launch return action and Controls registry route.
- Engine runtime tests: SKIP, no `src/engine/input` behavior changed.
- Auth and production DB validation: SKIP, no auth or production DB behavior changed; shared mock DB adapter wiring was covered by targeted Playwright and syntax checks.
