# PR_26177_GOLF_036-game-journey-metrics-sqlite-to-postgres-migration

Team: Golf
Branch: pr/26177-GOLF-036-game-journey-metrics-sqlite-to-postgres-migration
Base: main
Lifecycle: Build / Validation

## Scope

- Added a one-time server-side migration utility for legacy Game Journey completion metrics.
- Inspected the legacy SQLite file at `tmp/local-api/game-journey-completion-metrics.sqlite`.
- Migrated valid completion metric data through the existing Postgres client/service contract path.
- Preserved legacy `createdAt` and `updatedAt` values for rows already present in Postgres.
- Archived the legacy SQLite file only after the migration completed successfully.

## Legacy SQLite Inspection

- File inspected: `tmp/local-api/game-journey-completion-metrics.sqlite`
- Table found: `game_journey_completion_metrics`
- Schema objects found: 4
- Valid rows found: 14
- Columns matched the current Postgres table shape.

## Migration Result

- Command: `node --use-system-ca scripts/migrate-game-journey-completion-metrics-sqlite-to-postgres.mjs`
- Env file: `.env` loaded; secrets were not printed.
- Legacy rows: 14
- Rows inserted: 0
- Rows already present: 0
- Rows timestamp-patched: 14
- Result: PASS
- Legacy file archived to:
  `tmp/local-api/legacy-migrated/game-journey-completion-metrics-20260625T195902Z.sqlite`

The existing Postgres rows matched the legacy rows except for `createdAt` and `updatedAt`. The migration patched those timestamp fields explicitly, then moved the SQLite file out of the runtime guard path.

## Changed Files

- `scripts/migrate-game-journey-completion-metrics-sqlite-to-postgres.mjs`
- `src/dev-runtime/persistence/game-journey-completion-metrics-migration.mjs`
- `src/dev-runtime/persistence/game-journey-completion-metrics-store.mjs`
- `tests/dev-runtime/GameJourneyCompletionMetricsMigration.test.mjs`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`

## Validation

- PASS: `node --check src/dev-runtime/persistence/game-journey-completion-metrics-migration.mjs`
- PASS: `node --check scripts/migrate-game-journey-completion-metrics-sqlite-to-postgres.mjs`
- PASS: `node --check src/dev-runtime/persistence/game-journey-completion-metrics-store.mjs`
- PASS: `node --test tests/dev-runtime/GameJourneyCompletionMetricsMigration.test.mjs`
- PASS: `node --use-system-ca scripts/migrate-game-journey-completion-metrics-sqlite-to-postgres.mjs --inspect-only`
- PASS: `node --use-system-ca scripts/migrate-game-journey-completion-metrics-sqlite-to-postgres.mjs`
- PASS: `npx playwright test tests/playwright/tools/GameJourneyTool.spec.mjs --grep "completion metrics" --workers=1 --reporter=line`
- PASS: `git diff --check`

## ZIP

- `tmp/PR_26177_GOLF_036-game-journey-metrics-sqlite-to-postgres-migration_delta.zip`
