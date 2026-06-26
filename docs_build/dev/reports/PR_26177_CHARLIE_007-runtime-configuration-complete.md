# PR_26177_CHARLIE_007-runtime-configuration-complete

## Summary

Team Charlie completed the Runtime Configuration closeout slice for System Health.

Runtime configuration now reports explicit server-owned sources for:

- Local API URL
- static/site URL
- Storage/R2 endpoint
- Storage/R2 projects prefix
- startup/runtime configuration source

The Local API startup report now distinguishes a configured `GAMEFOUNDRY_API_URL` from the derived Local API URL used for diagnostics. Missing configured values are reported as `not configured` or `WARN`; no silent configured defaults were added.

## Changed Files

- `scripts/start-local-api-server.mjs`
- `src/dev-runtime/server/local-api-router.mjs`
- `src/dev-runtime/storage/storage-config.mjs`
- `tests/dev-runtime/AdminHealthOperations.test.mjs`
- `tests/dev-runtime/LocalApiStartupLogging.test.mjs`
- `tests/dev-runtime/StorageConfig.test.mjs`
- `docs_build/dev/reports/PR_26177_CHARLIE_007-runtime-configuration-complete.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_007-runtime-configuration-complete_branch-validation.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_007-runtime-configuration-complete_manual-validation-notes.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_007-runtime-configuration-complete_requirements-checklist.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_007-runtime-configuration-complete_validation-lane.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## Implementation Notes

- Added runtime configuration source rows to System Health Local API startup diagnostics.
- Added configuration summary rows for API URL source, site URL source, Storage endpoint, and Storage projects prefix.
- Preserved the Web UI -> API/service contract -> database/runtime flow; browser code does not own infrastructure health state.
- Added `/local/projects/` to approved project asset storage prefixes to match the current Local environment model.
- Preserved safe partial Storage/R2 diagnostics while keeping access key and secret key values hidden.
- Left browser public config fallback behavior unchanged because it already records an explicit diagnostic and changing routing semantics would be outside this PR scope.

## Validation

- PASS: `node --check scripts/start-local-api-server.mjs`
- PASS: `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS: `node --check src/dev-runtime/storage/storage-config.mjs`
- PASS: `node --check tests/dev-runtime/AdminHealthOperations.test.mjs`
- PASS: `node --check tests/dev-runtime/LocalApiStartupLogging.test.mjs`
- PASS: `node --check tests/dev-runtime/StorageConfig.test.mjs`
- PASS: `node --test tests/dev-runtime/LocalApiStartupLogging.test.mjs tests/dev-runtime/StorageConfig.test.mjs tests/dev-runtime/PublicEnvironmentConfig.test.mjs tests/dev-runtime/PublicApiUrlClient.test.mjs tests/dev-runtime/AdminHealthOperations.test.mjs tests/api/admin-system-health/contract.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/AdminHealthOperationsPage.spec.mjs --workers=1`
- PASS: `git diff --check`

## ZIP

- `tmp/PR_26177_CHARLIE_007-runtime-configuration-complete_delta.zip`
