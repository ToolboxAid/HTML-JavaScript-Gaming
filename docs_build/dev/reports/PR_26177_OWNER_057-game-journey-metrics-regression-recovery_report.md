# PR_26177_OWNER_057-game-journey-metrics-regression-recovery Report

Status: PASS
Branch: PR_26177_OWNER_057-game-journey-metrics-regression-recovery
Date: 2026-06-26

## Scope

Recover the Game Journey completion metrics path so active Alfa and Owner work no longer surfaces the retired legacy SQLite regression. Preserve Postgres-backed Game Journey completion metrics as the active path and prevent Creator-facing UI from rendering the forbidden `Game Journey completion metrics unavailable:` warning.

## Implementation Summary

- Removed active runtime defaulting to `tmp/local-api/game-journey-completion-metrics.sqlite` in `createGameJourneyCompletionMetricsStore`.
- Removed active runtime `legacyDbPath` guard plumbing from the Game Journey metrics store, repository, Local API router, and Playwright test server helper.
- Updated `toolbox/tools-page-accordions.js` to render neutral Creator-safe progress outage wording instead of backend diagnostics.
- Added a store-level regression test proving a retired default SQLite-shaped file does not block or get touched by active DB-backed metrics.
- Added a targeted guardrail test proving active runtime JS/MJS under `src`, `assets`, and `toolbox` has no SQLite or `tmp/local-api` metrics references, excluding the migration-only utility.
- Added a focused Playwright test proving the toolbox page does not render the forbidden warning, SQLite wording, local filesystem path, or Postgres internals when metrics are unavailable.

## Reference Comparison

- Compared the relevant strings in Bravo, Charlie, and Delta reference branches against current main.
- Those branches contained the same legacy-default metrics store and forbidden toolbox warning strings.
- Their non-error behavior depended on the retired SQLite file not being present at the default path.
- This recovery fixes the active behavior directly so the current repo is not sensitive to that retired file.

## Validation

- PASS: `node --check` on modified source and test files.
- PASS: `node ./scripts/run-node-test-files.mjs tests/dev-runtime/GameJourneyCompletionMetricsStore.test.mjs tests/dev-runtime/GameJourneyCompletionMetricsMigration.test.mjs`.
- PASS: `npx playwright test tests/playwright/tools/GameJourneyTool.spec.mjs --project=playwright --workers=1 --reporter=line -g "Game Journey Local API persists completion metrics to Postgres|Toolbox renders Creator-safe Game Journey progress outage copy"`.
- PASS: Direct proof against the actual existing `tmp/local-api/game-journey-completion-metrics.sqlite` file confirmed active DB metrics load 14 buckets, expose no legacy path fields, and do not touch the retired file.
- PASS: Active runtime JS/MJS search found no SQLite, `.sqlite`, `better-sqlite`, `game-journey-completion-metrics.sqlite`, or `tmp/local-api` references outside the migration-only utility.
- PASS: Runtime source search found no `Game Journey completion metrics unavailable` Creator-facing string.
- PASS: `git diff --check` reported no whitespace errors. Git emitted line-ending warnings only.

## Files

- `src/dev-runtime/persistence/game-journey-completion-metrics-store.mjs`
- `src/dev-runtime/persistence/tool-repositories/game-journey-mock-repository.js`
- `src/dev-runtime/server/local-api-router.mjs`
- `tests/dev-runtime/GameJourneyCompletionMetricsStore.test.mjs`
- `tests/helpers/playwrightRepoServer.mjs`
- `tests/playwright/tools/GameJourneyTool.spec.mjs`
- `tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
- `toolbox/tools-page-accordions.js`

## Artifact

- `tmp/PR_26177_OWNER_057-game-journey-metrics-regression-recovery_delta.zip`
