# Project Workspace MSJ Tests

Stack item: PR_26155_049-project-workspace-msj-tests

## Summary
- Added `tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs`.
- Added the repeatable package script `npm run test:lane:project-workspace`.
- Registered the `project-workspace` targeted lane in `scripts/run-targeted-test-lanes.mjs`.
- Updated the existing Project Workspace contract assertion in `tests/playwright/tools/RootToolsFutureState.spec.mjs` to expect mock-project-driven progress text.

## Coverage
- Project Workspace create, open, and delete behavior.
- Reset, seed, and clear test data controls.
- Progress panel updates from mock project state.
- Admin-only Project Data controls.
- Guest and Creator views do not expose Project Data controls.
- Toolbox Progress and Build Path views consume the mock active project state.
- Console errors and failed requests are captured by the targeted Playwright tests.

## Validation Notes
- Impacted lane: `project-workspace`.
- Legacy command lane also run: `npm run test:workspace-v2`, because active Project Workspace/Toolbox contract wiring changed. This is a legacy package-script name; reports and user-facing language use Project Workspace.
- Skipped lanes: `tool-runtime`, `game-runtime`, `integration`, `engine-src`, `samples`, full samples smoke.
- Skipped-lane rationale: no engine runtime, game runtime, sample, integration handoff, parser, shared DB, cloud, or cross-tool behavior changed outside the active Project Workspace and Toolbox bridge.

## Commands
- PASS: `npm run test:lane:project-workspace`
- PASS: `npm run test:workspace-v2`
- PASS: `node --check toolbox/project-workspace/project-workspace-mock-repository.js`
- PASS: `node --check toolbox/project-workspace/project-workspace.js`
- PASS: `node --check toolbox/tools-page-accordions.js`
- PASS: `node --check scripts/run-targeted-test-lanes.mjs`
- PASS: `git diff --check`

## Manual Test Notes
- Verified through Playwright that Project Workspace loads with no console errors.
- Verified create/open/delete project interactions.
- Verified progress panels update after mock project creation and deletion.
- Verified admin-only reset/seed/clear controls.
- Verified guest/user roles cannot see Project Data controls.
