# Build Path Targeted MSJ Tests

PR: PR_26155_091-build-path-targeted-msj-tests

## Test Coverage Added
- Added `tests/playwright/tools/BuildPathProgressSimplification.spec.mjs`.
- Added `test:lane:build-path` to `package.json`.
- Registered the `build-path` lane in `scripts/run-targeted-test-lanes.mjs`.

## Behaviors Covered
- Project Progress view/control is removed.
- Project Build Path remains available.
- Admin Tools Progress exists.
- Admin Project Progress is absent.
- Build Path table renders Order, Tool, Status, and Complete columns.
- Publish never renders as `N/A`.
- `N/A` renders for non-required tools in a contributor-focused Build Path view.
- No duplicate Admin is exposed under Toolbox.
- No console errors are emitted during targeted checks.

## Validation Run
- `npm run test:lane:build-path`: PASS, 3 tests.
- `npm run test:workspace-v2`: PASS, 4 tests. Legacy command name; user-facing naming remains Project Workspace.
- `npm run test:lane:project-workspace`: PASS, 8 tests.
- `npm run test:lane:game-configuration`: PASS, 4 tests.
- `npm run test:lane:game-design`: PASS, 4 tests.
- Combined narrow coverage pass: PASS, 11 tests.
- `git diff --check`: PASS.

## Skipped Lanes
- Engine, games, samples, integration, archive validation, and full samples smoke were skipped.
- Skipped-lane rationale: this bundle changes active Toolbox Build Path rendering, shared Admin navigation, targeted tests, and generated validation reports only.

## Manual Test Notes
- Open `toolbox/index.html?role=user`, confirm `Progress` is gone and `Build Path` remains.
- Click Build Path and confirm the workflow table and completion summary render.
- Open `toolbox/index.html?role=user&memberRole=Audio%20Creator`, confirm a non-required row can show `⚪ N/A` and Publish does not.
- Open `admin/tools-progress.html`, confirm Tools Progress is platform-development planning only.
