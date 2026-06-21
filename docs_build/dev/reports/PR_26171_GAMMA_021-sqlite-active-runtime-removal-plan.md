# PR_26171_GAMMA_021-sqlite-active-runtime-removal-plan

## Summary

This report creates a focused removal plan for active SQLite references found on fresh `main` after PR #36 merged.

Fresh-main baseline:
- Branch: `team/GAMMA/admin`
- Fresh main commit used for inventory: `1b27b0a9a3d67821fa586e34d5331567ec6f49b7`
- Inventory command: `rg -i "sqlite|better-sqlite|sqlite3|\\.sqlite|sql\\.js"`
- Raw inventory excluding generated diff noise: 130 files, 358 matching lines

This PR does not remove code, change runtime behavior, touch archive reports, run Playwright, or run samples.

## Active Classification

### Active Runtime

- `src/dev-runtime/messages/messages-sqlite-service.mjs`
  - Classification: active runtime
  - Current state: uses `node:sqlite`, `DatabaseSync`, `GAMEFOUNDRY_MESSAGES_SQLITE_PATH`, and `tmp/messages/messages.sqlite`.
  - Replacement path: replace with a Postgres-backed Messages database service using `GAMEFOUNDRY_DATABASE_URL` and the existing Local API message contracts. Prefer a vendor-neutral active service name such as `messages-database-service.mjs`; if a compatibility wrapper is needed, keep it temporary and log the deprecated name.

- `src/dev-runtime/persistence/game-journey-completion-metrics-store.mjs`
  - Classification: active runtime
  - Current state: uses `node:sqlite`, `DatabaseSync`, `GAMEFOUNDRY_GAME_JOURNEY_METRICS_DB_PATH`, and `tmp/local-api/game-journey-completion-metrics.sqlite`.
  - Replacement path: move completion metrics reads/writes to the authoritative Postgres connection path using `GAMEFOUNDRY_DATABASE_URL`. Keep the current Local API response shape stable while replacing the storage implementation.

- `src/dev-runtime/persistence/mock-db-store.js`
  - Classification: active runtime / allowed technical debt
  - Current state: shared dev-runtime schema and seed metadata; it does not import `node:sqlite`, but its active session adapter metadata still says `LocalDbAdapter backed by server SQLite storage`.
  - Replacement path: split shared schema/seed constants from persistence-provider labeling, then replace Local DB/SQLite-facing adapter copy with a Postgres-backed or neutral dev database adapter description. Preserve existing `MOCK_DB_KEYS` consumers until owner-assigned follow-up PRs migrate each tool surface.

### Local API

- `src/dev-runtime/server/local-api-router.mjs`
  - Classification: local API
  - Current state: imports `createMessagesSqliteService`, constructs the Messages SQLite service, and returns SQLite database engine metadata for remaining local routes.
  - Replacement path: inject the Postgres-backed Messages service and Game Journey metrics service through existing safe Local API contracts. Remove SQLite engine metadata only after the replacement services are available and targeted tests prove the same API response shapes.

### Tests

Direct SQLite tests:
- `tests/playwright/tools/MessagesTool.spec.mjs`
- `tests/playwright/tools/GameJourneyTool.spec.mjs`
- `tests/dev-runtime/DbSeedIntegrity.test.mjs`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`
- `tests/playwright/tools/BrowserApiUrlConfig.spec.mjs`
- `tests/playwright/tools/AdminDbViewer.spec.mjs`
- `tests/playwright/tools/AdminHealthOperationsPage.spec.mjs`

Shared `mock-db-store.js` dependency tests that may need updates when the adapter label or constants split changes:
- `tests/dev-runtime/AiCreditFoundation.test.mjs`
- `tests/dev-runtime/LegalFoundation.test.mjs`
- `tests/dev-runtime/MarketplaceCategories.test.mjs`
- `tests/dev-runtime/MembershipDataModel.test.mjs`
- `tests/dev-runtime/SupabaseDevAuthTestUserCleanup.test.mjs`
- `tests/dev-runtime/TeamsFoundation.test.mjs`
- `tests/playwright/account/AchievementsPage.spec.mjs`
- `tests/playwright/tools/AdminNotesLocalViewer.spec.mjs`
- `tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `tests/playwright/tools/BuildPathProgressSimplification.spec.mjs`
- `tests/playwright/tools/GameHubMockRepository.spec.mjs`
- `tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
- `tests/playwright/tools/InputMappingV2Tool.spec.mjs`
- `tests/playwright/tools/PaletteToolMockRepository.spec.mjs`
- `tests/playwright/tools/RootToolsFutureState.spec.mjs`
- `tests/playwright/tools/TagsTool.spec.mjs`
- `tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs`
- `tests/playwright/tools/ToolboxRoutePages.spec.mjs`

### Docs

- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
  - Keep as authoritative deprecation governance.
- `docs_build/database/dml/DML_INDEX.md`
- `docs_build/database/dml/messages.sql`
- `docs_build/database/seed/messages.json`
  - Update in the Messages Postgres cutover PR so seed/setup wording no longer references the server-side Messages SQLite service.

### Archive/Reference

Historical report and PR history under these paths is explicitly excluded from removal:
- `docs_build/dev/reports/**`
- `docs_build/pr/**`

Archive/reference history may continue to mention SQLite for traceability. Do not rewrite old reports unless a future governance PR explicitly scopes archival cleanup.

## Required Follow-Up PR Sequence

1. Messages database cutover
   - Owner: Team Beta
   - Scope: replace `messages-sqlite-service.mjs` with a Postgres-backed Messages service, keep current Local API endpoints stable, migrate message seed/setup docs, and update `MessagesTool.spec.mjs`.
   - Validation: targeted Messages Local API and Messages Playwright coverage; no samples unless the changed API contract affects samples.

2. Game Journey completion metrics database cutover
   - Owner: Team Alpha
   - Scope: replace `game-journey-completion-metrics-store.mjs` with a Postgres-backed metrics store and update Game Journey completion tests.
   - Validation: targeted Game Journey Local API and Game Journey Playwright coverage; no full suite unless shared runtime behavior expands.

3. Shared dev database adapter label and schema split
   - Owner: Master Control assignment required because `mock-db-store.js` is shared across Alpha/Beta/Gamma surfaces.
   - Scope: split schema/key constants from persistence adapter labeling, remove Local DB/SQLite wording from active adapter metadata, and update affected tests by ownership lane.
   - Validation: targeted dev-runtime schema tests plus only the tool Playwright lanes whose fixtures import the changed contract.

4. Local API SQLite metadata removal
   - Owner: Team Gamma for diagnostics/governance coordination, with Alpha/Beta implementation owners for affected routes.
   - Scope: remove SQLite imports, constructor wiring, and database engine metadata from `local-api-router.mjs` after replacement services have landed.
   - Validation: targeted Local API startup, Admin System Health diagnostics, Messages, and Game Journey lanes.

5. Guard cleanup and final inventory
   - Owner: Team Gamma
   - Scope: update `scripts/validate-browser-env-agnostic.mjs` technical-debt notes, rerun the active SQLite inventory, and confirm only governance docs and archive/reference reports remain.
   - Validation: `git diff --check`, targeted script/static validation, final inventory report.

## Manual Validation Notes

- Confirmed the plan targets only active runtime, Local API, test, and active docs/data references.
- Confirmed archive/reference report history is excluded.
- Confirmed no code was removed.
- Confirmed no runtime behavior was changed.
- Confirmed Postgres remains the replacement direction.

## Skipped Validation

- Playwright skipped: docs/report-only planning PR.
- Samples skipped: no sample files or sample runtime behavior changed.
