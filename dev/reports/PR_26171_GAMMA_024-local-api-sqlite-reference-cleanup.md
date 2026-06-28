# PR_26171_GAMMA_024-local-api-sqlite-reference-cleanup

TEAM ownership: Golf.

## Scope

Clean remaining Local API SQLite references after the Messages and Game Journey Postgres migrations landed in main.

## Changes

- Updated `src/dev-runtime/server/local-api-router.mjs`.
- Removed the remaining literal `SQLite` route metadata from Local API project workspace responses.
- Removed the stale `Local DB/SQLite metadata` promotion-planning label.
- Preserved the Postgres-backed Messages Local API route and response shapes.
- Preserved the Postgres-backed Game Journey completion metrics route and response shapes.
- Did not pull or depend on open PR #43 / `team/GAMMA/admin`.
- Did not touch archive/history references.

## Validation

Passed:
- `git diff --check`
- `node --check src/dev-runtime/server/local-api-router.mjs`
- `node --test --test-name-pattern "Messages Local API" tests/dev-runtime/DbSeedIntegrity.test.mjs`
- `npx playwright test tests/playwright/tools/GameJourneyTool.spec.mjs --config=codex_playwright_system_chrome.config.cjs --project=playwright -g "Game Journey Local API persists completion metrics to Postgres"`
- Inline Local API route check for `/api/project-workspace/projects`, verifying the cleaned `Local DB adapter` label and no `SQLite` text in that response.
- Targeted text check confirmed no `sqlite`, `messages-sqlite`, `createMessagesSqliteService`, `DatabaseSync`, `node:sqlite`, `messages.sqlite`, or `GAMEFOUNDRY_MESSAGES_SQLITE_PATH` match remains in `src/dev-runtime/server/local-api-router.mjs`.

Observed outside scoped lane:
- A broad `node --test tests/dev-runtime/DbSeedIntegrity.test.mjs` run passed the Messages Local API case but failed two unrelated `/api/local-db/snapshot` seed/reseed cases. Those local-db snapshot cases are outside this cleanup scope and were not used as completion evidence.

Skipped:
- Full samples smoke: no samples are in scope.
- Full Playwright suite: this PR only changes Local API route metadata labels and targeted route validation covered the touched surfaces.
- Archive/history cleanup: explicitly out of scope.

## Reports

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26171_GAMMA_024-local-api-sqlite-reference-cleanup.md`
- `docs_build/dev/reports/PR_26171_GAMMA_024-local-api-sqlite-reference-cleanup-manual-validation-notes.md`
- `docs_build/dev/reports/PR_26171_GAMMA_024-local-api-sqlite-reference-cleanup-instruction-compliance-checklist.md`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`

## ZIP

`tmp/PR_26171_GAMMA_024-local-api-sqlite-reference-cleanup_delta.zip`

## Merge Control

Not merged. EOD merge remains owner-controlled and requires explicit approval.
