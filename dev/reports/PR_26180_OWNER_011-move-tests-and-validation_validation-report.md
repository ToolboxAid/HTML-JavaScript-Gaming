# PR_26180_OWNER_011-move-tests-and-validation Validation Report

Generated: 2026-06-28T22:57:50.322Z

| Command | Result |
| --- | --- |
| git diff --check | PASS |
| npm run validate:canonical-structure | PASS |
| node --check dev/scripts/validate-canonical-repository-structure.mjs | PASS |
| node --test dev/tests/dev-runtime/ApiMenuPathCleanup.test.mjs dev/tests/dev-runtime/AdminNotesBoundary.test.mjs dev/tests/dev-runtime/TeamAwareBootstrap.test.mjs dev/tests/dev-runtime/StaticWebRootCompatibility.test.mjs dev/tests/dev-runtime/LocalApiStartupLogging.test.mjs | PASS, 32 tests |
| npx playwright test --config=dev/config/playwright.config.cjs --project=playwright dev/tests/playwright/tools/StaticWebRootCompatibility.spec.mjs | PASS, 2 tests |

## Non-Blocking Legacy Observation

Exploratory direct runtime scripts that target retired V2 workspace fixtures remain out of the required validation lane. Their repository-root and artifact paths were corrected, but this PR does not restore retired workspace-v2 or asset-manager-v2 fixtures.
