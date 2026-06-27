# PR_26161_033 Controls Normalized Default Input Architecture

## Branch Validation
- PASS: Current git branch was verified as `main` before edits.

## Impacted Lane
- Controls / Input Mapping
- `src/engine/input` normalized input helpers
- Shared DB/mock adapter Controls tables

## Playwright Impacted
- Yes.

## Summary
- Renamed the visible Controls sections to `Game Input Mapping` and `Player Input Mapping`.
- Added the normalized input contract used by keyboard, mouse, and gamepad defaults:
  - `action.primary`, `action.secondary`, `action.tertiary`, `action.quaternary`
  - `action.confirm`, `action.cancel`, `action.start`, `action.select`, `action.pause`
  - movement, aim, d-pad, and trigger normalized inputs remain in the same registry.
- Added visible system default fallback profiles:
  - `System Default Gamepad`
  - `System Default Keyboard/Mouse`
- Documented and tested runtime lookup order:
  1. user/player controller profile exact match
  2. user/player keyboard/mouse profile
  3. system default gamepad profile
  4. system default keyboard/mouse profile
  5. missing mapping warning
- Replaced Controls persistence ownership with two DB-backed contracts:
  - `player_controller_profiles`: player-owned Physical Input -> Normalized Input
  - `game_input_mappings`: project-owned Normalized Input -> Game Action
- Confirmed `game_input_mappings` does not store raw physical input, controller name, or controller id.
- Confirmed `player_controller_profiles` does not store game actions or object actions.

## Validation
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- PASS: `node --check src/dev-runtime/persistence/mock-db-store.js`
- PASS: `node --check src/engine/input/InputService.js`
- PASS: `node --check src/engine/input/NormalizedInputRegistry.js`
- PASS: `node --check toolbox/controls/controls.js`
- PASS: `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- PASS: `node --check tests/playwright/tools/AdminDbViewer.spec.mjs`
- PASS: `node --check tests/input/NormalizedInputRegistry.test.mjs`
- PASS: `node tests/input/NormalizedInputRegistry.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs`

## Extra Check
- PARTIAL: `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs`
- Result: 6 passed, 1 failed from unrelated missing asset requests for `assets/theme-v2/images/characters/palette-manager.png`.
- The changed Admin DB Viewer Controls table expectation passed before the unrelated failure.

## Manual Validation Steps
1. Open `/toolbox/controls/index.html`.
2. Confirm the center accordions read `Game Input Mapping` and `Player Input Mapping`.
3. Open Inspector > Devices and confirm the fallback profiles and runtime lookup order are visible.
4. Select `Keyboard/Mouse`, create a player input mapping, and confirm `Space` maps to `action.primary`.
5. Add a Game Input Mapping row from `action.primary` to `Jump`, save, reload, and confirm persistence.
6. Open the mock DB snapshot and confirm game mappings are stored in `game_input_mappings`.
7. Confirm player physical mappings are stored in `player_controller_profiles`.
8. Confirm `game_input_mappings` has no controller id/name or raw physical input fields.
9. Confirm `player_controller_profiles` has no game action/object action fields.

## Skipped Lanes
- Full samples validation was skipped by request.
- Full repository Playwright was not run; targeted Controls/Input Mapping Playwright was the impacted lane.
- `npm run test:workspace-v2` was not run because this PR does not change Workspace V2 behavior.

## Runtime Engine Behavior
- No production game runtime behavior or sample JSON alignment was added.
- `src/engine/input` was extended only for the requested normalized input/default profile contract and lookup helper used by Controls validation.

## Required Artifacts
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `tmp/PR_26161_033-controls-normalized-default-input-architecture_delta.zip`
