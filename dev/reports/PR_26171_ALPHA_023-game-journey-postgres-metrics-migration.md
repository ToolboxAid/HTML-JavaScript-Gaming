# PR_26171_ALPHA_023-game-journey-postgres-metrics-migration

## Summary

TEAM ownership: ALPHA.

Branch: `team/ALPHA/game-journey`.

Scope completed:
- Migrated Game Journey completion metrics persistence from active SQLite usage to Postgres.
- Replaced `node:sqlite` / `DatabaseSync` usage in `src/dev-runtime/persistence/game-journey-completion-metrics-store.mjs`.
- Reused the existing `createPostgresConnectionClient` dev-runtime pattern backed by `GAMEFOUNDRY_DATABASE_URL`.
- Preserved the existing Game Journey completion metrics API response shape, including summary counts, `records`, `updatedMetric`, and compatibility metadata fields.
- Updated Game Journey repository and Local API routes to await the Postgres-backed metrics store.
- Updated affected Game Journey Playwright tests to use an injected Postgres client stub.

## Validation

Passed:
- `git diff --check`
- `node --check src/dev-runtime/persistence/game-journey-completion-metrics-store.mjs`
- `node --check src/dev-runtime/persistence/tool-repositories/game-journey-mock-repository.js`
- `node --check src/dev-runtime/server/local-api-router.mjs`
- `node --check tests/playwright/tools/GameJourneyTool.spec.mjs`
- `node --check tests/helpers/playwrightRepoServer.mjs`
- `node --check tests/helpers/gameJourneyCompletionMetricsPostgresClientStub.mjs`
- `npx playwright test tests/playwright/tools/GameJourneyTool.spec.mjs --config=codex_playwright_system_chrome.config.cjs --project=playwright -g "Game Journey progress dashboard|Game Journey mock data keeps system guidance template-owned|Game Journey Local API persists completion metrics to Postgres|Game Journey completion metrics fail visibly|Game Journey completion metrics protect legacy SQLite"`

Targeted checks:
- Verified changed Game Journey metrics paths no longer import `node:sqlite` or `DatabaseSync`.
- Verified missing Postgres configuration fails with an actionable `GAMEFOUNDRY_DATABASE_URL` diagnostic.
- Verified legacy SQLite metrics files are not deleted or silently ignored.
- Verified no secret values are emitted by the metrics store.

Skipped:
- Full samples smoke: out of scope for this Game Journey metrics persistence migration.
- Broad Game Journey editor/detail Playwright cases: out of scope for completion metrics persistence. A broader exploratory run surfaced editor/detail assertions outside the metrics path, so the completion gate used the affected metrics/API lane only.

## Data Preservation

The Postgres metrics store does not delete, overwrite, or fall back to legacy SQLite data.

If a legacy Game Journey completion metrics SQLite file exists at the configured legacy path, the store fails visibly before seeding Postgres and reports that the operator must export or migrate the legacy data before moving the file. This prevents silent data loss while removing SQLite as the active persistence path.

Tests inject `gameJourneyCompletionMetricsLegacyDbPath: null` with a Postgres client stub so the active Postgres path can be validated without touching ignored local runtime files.
