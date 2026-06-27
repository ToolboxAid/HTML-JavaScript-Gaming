# PR_26179_OWNER_005-move-tests-to-dev

Status: PASS
Team: OWNER
Branch: PR_26179_OWNER_005-move-tests-to-dev
Base branch: PR_26179_OWNER_004-move-governance-workspace
Scope: Move repository test workspace under `dev/tests/`
Updated: 2026-06-27 14:58:31

## Purpose

Move the non-deployable test workspace from root `tests/` to `dev/tests/` and update test commands, Playwright discovery, scripts, and governance references so validation continues from the new path.

## Changes

- Moved tracked `tests/` files to `dev/tests/`.
- Updated `package.json` test scripts and `directories.test` to `dev/tests`.
- Updated `playwright.config.cjs` projects to discover tests under `dev/tests/ui` and `dev/tests/playwright`.
- Updated test runner/helper scripts to reference `dev/tests`.
- Updated Project Instructions and contract standards to reference `dev/tests`.
- Recalculated moved-test relative imports where needed after PR_004 moved governance paths under `dev/`.

## Scope Confirmation

- No production `docs/`, `games/`, `toolbox/`, `account/`, `admin/`, `legal/`, `assets/`, or `src/` product files were moved for this PR.
- No runtime/business logic was moved into `dev/`.
- No Creator-writeable repo folder was introduced.
- This PR is path reorganization for tests only.

## Validation Summary

- Branch validation: PASS, current branch is `PR_26179_OWNER_005-move-tests-to-dev`.
- Tracked root `tests/` count: PASS, 0 tracked files remain.
- Tracked `dev/tests/` count: PASS, 577 tracked files present.
- Root `tests/` directory presence: PASS, absent.
- Old active `tests/` path search: PASS, no active root `tests/` references remain in package/config/scripts/ProjectInstructions except regex literals that intentionally match `dev/tests` paths.
- `git diff --check HEAD -- .`: PASS.
- `package.json` JSON parse: PASS.
- Targeted `node --check` on changed scripts and representative moved tests: PASS.
- Full all-moved-file syntax sweep was attempted and timed out due the large 600-file move; leftover Node validation processes were stopped, then the targeted syntax lane was run and passed.
- `node ./scripts/run-node-test-files.mjs dev/tests/dev-runtime/AdminNotesBoundary.test.mjs dev/tests/tools/DevConsoleIntegration.test.mjs dev/tests/shared/TimeFoundation.test.mjs`: PASS.
- `npm run test:service:api`: PASS, 2 targeted node test files passed.
- `npx playwright test --config=playwright.config.cjs --list`: PASS, discovered Playwright tests under `dev/tests/...`.
- Playwright execution: not run as a full browser lane; this PR changes test location/configuration and discovery, not runtime UI behavior.

## ZIP

Repo-structured ZIP: `tmp/PR_26179_OWNER_005-move-tests-to-dev_delta.zip`
