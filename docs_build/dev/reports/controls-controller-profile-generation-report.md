# PR_26161_027 Controls Controller Profile Generation

## Branch Validation
PASS: current branch was verified as `main` before edits.

## Impacted Lane
Controls / Input Mapping V2 targeted lane.

## Playwright Impacted
Yes.

## Summary
- Added explicit DB-backed controller profile generation from detected Device Type selections.
- Added visible fallback status for Exact saved profile, Default Gamepad Mapping, Keyboard/Mouse Default, and Missing Mapping.
- Added Create Profile From Default as a visible fallback action for unsaved detected gamepads.
- Added generated gamepad input layout rows from exposed browser gamepad buttons, axes, triggers, and d-pad entries.
- Added DB-backed custom Actions and exposed saved custom Actions in the Action catalog and mapping dropdowns after reload.
- Converted center Input Mapping and Controller Profile areas into accordions.
- Updated Reset Mappings to require the exact confirm dialog text: `This will delete all Mappings, are you sure?`

## Persistence
- Input mappings remain DB-backed through the shared Controls repository.
- Controller profiles remain DB-backed through the shared Controls repository.
- Custom actions are now DB-backed through the shared Controls repository.
- No page-local memory is used as the source of truth.

## Testing Performed
- `node --check toolbox/controls/controls.js`
- `node --check src/dev-runtime/persistence/tool-repositories/input-mapping-mock-repository.js`
- `node --check src/dev-runtime/persistence/mock-db-store.js`
- `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs`
  - Result: 7 passed.

## Playwright Coverage
- Produced `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- Changed browser runtime JS covered: `toolbox/controls/controls.js` at 92% function coverage.
- Shared DB/mock adapter files are server-side and reported by the V8 coverage artifact as advisory WARN entries because Playwright browser V8 coverage does not collect server-side modules; their behavior was exercised through the targeted Controls Playwright API flows.

## Manual Validation Steps
1. Open `toolbox/controls/index.html`.
2. Click Refresh Devices and verify Keyboard, Mouse, and detected gamepads appear in Device Type.
3. Select a gamepad and verify `Using Default Gamepad Mapping` and `Missing saved profile for this controller` appear without saving a profile.
4. Click Add Profile and verify a DB-backed profile is created with generated input rows requiring Action assignment.
5. Delete the saved profile, then click Create Profile From Default and verify a real DB-backed profile is created.
6. Add a custom Action and verify it appears in the Actions catalog and Action dropdown after reload.
7. Add, edit, and reset mappings; verify Reset Mappings opens the required confirm dialog and OK persists deletion after reload.

## Skipped Lanes
- Full samples validation was skipped as requested. This PR is scoped to Controls UI/tool persistence and does not change sample JSON alignment or game runtime behavior.
- `npm run test:workspace-v2` was skipped because the requested validation lane is the targeted Controls/Input Mapping Playwright suite, which covers the changed Controls tool behavior directly.

## Runtime Engine Behavior
Confirmed: no production game runtime behavior was changed.

## Completion Check
PASS: 100% of requested PR_26161_027 items were implemented and validated in the targeted lane.
